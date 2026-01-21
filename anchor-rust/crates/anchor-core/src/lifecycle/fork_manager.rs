//! Fork lifecycle manager.

use crate::error::AnchorError;
use crate::rpc::RpcClient;
use crate::types::{Fork, ForkRegistry, Network};
use std::collections::HashSet;
use std::path::PathBuf;
use std::process::Stdio;
use std::time::Duration;
use tokio::fs;
use tokio::process::{Child, Command};

/// Default port range for Anvil forks.
const DEFAULT_PORT_START: u16 = 8545;
const DEFAULT_PORT_END: u16 = 8600;

/// Fork lifecycle manager.
#[derive(Debug)]
pub struct ForkManager {
    /// Registry of active forks
    registry: ForkRegistry,
    /// Path to the registry file
    registry_path: PathBuf,
    /// Set of ports currently in use
    used_ports: HashSet<u16>,
    /// Active Anvil processes (keyed by fork ID)
    processes: std::collections::HashMap<String, Child>,
}

impl ForkManager {
    /// Create a new fork manager.
    pub fn new(registry_path: impl Into<PathBuf>) -> Self {
        Self {
            registry: ForkRegistry::new(),
            registry_path: registry_path.into(),
            used_ports: HashSet::new(),
            processes: std::collections::HashMap::new(),
        }
    }

    /// Load the fork registry from disk.
    pub async fn load_registry(&mut self) -> Result<(), AnchorError> {
        if self.registry_path.exists() {
            let contents = fs::read_to_string(&self.registry_path).await?;
            self.registry = serde_json::from_str(&contents)?;

            // Rebuild used_ports from registry
            self.used_ports = self.registry.used_ports().into_iter().collect();
        }
        Ok(())
    }

    /// Save the fork registry to disk.
    pub async fn save_registry(&self) -> Result<(), AnchorError> {
        // Ensure parent directory exists
        if let Some(parent) = self.registry_path.parent() {
            fs::create_dir_all(parent).await?;
        }

        let contents = serde_json::to_string_pretty(&self.registry)?;
        fs::write(&self.registry_path, contents).await?;
        Ok(())
    }

    /// Get the registry.
    pub fn registry(&self) -> &ForkRegistry {
        &self.registry
    }

    /// Get a mutable reference to the registry.
    pub fn registry_mut(&mut self) -> &mut ForkRegistry {
        &mut self.registry
    }

    /// Find an available port in the default range.
    pub fn find_available_port(&self) -> Option<u16> {
        self.find_available_port_in_range(DEFAULT_PORT_START, DEFAULT_PORT_END)
    }

    /// Find an available port in a specific range.
    pub fn find_available_port_in_range(&self, start: u16, end: u16) -> Option<u16> {
        (start..=end).find(|&port| !self.used_ports.contains(&port) && is_port_available(port))
    }

    /// Create a new fork of a network.
    pub async fn fork(
        &mut self,
        network: Network,
        block: Option<u64>,
        port: Option<u16>,
        session_id: Option<String>,
    ) -> Result<Fork, AnchorError> {
        // Get RPC URL
        let rpc_url = network
            .default_rpc_url()
            .ok_or_else(|| AnchorError::MissingRpcUrl(network.name().to_string()))?;

        // Find available port
        let port = port.unwrap_or_else(|| self.find_available_port().unwrap_or(DEFAULT_PORT_START));

        if self.used_ports.contains(&port) {
            return Err(AnchorError::SpawnFailed(format!(
                "Port {} already in use",
                port
            )));
        }

        // Build anvil command
        let mut cmd = Command::new("anvil");
        cmd.arg("--fork-url").arg(&rpc_url);
        cmd.arg("--port").arg(port.to_string());
        cmd.arg("--chain-id").arg(network.chain_id().to_string());

        if let Some(block_num) = block {
            cmd.arg("--fork-block-number").arg(block_num.to_string());
        }

        // Suppress output
        cmd.stdout(Stdio::null());
        cmd.stderr(Stdio::null());

        // Spawn process
        let child = cmd
            .spawn()
            .map_err(|e| AnchorError::SpawnFailed(format!("Failed to spawn anvil: {}", e)))?;

        let pid = child.id().unwrap_or(0);

        // Wait for RPC to become ready
        let client =
            RpcClient::with_timeout(format!("http://127.0.0.1:{}", port), Duration::from_secs(5));

        client
            .wait_for_ready(30, Duration::from_millis(200))
            .await
            .map_err(|e| AnchorError::Rpc(e.to_string()))?;

        // Get the actual block number
        let block_number = if let Some(b) = block {
            b
        } else {
            client
                .get_block_number()
                .await
                .map_err(|e| AnchorError::Rpc(e.to_string()))?
        };

        // Generate fork ID
        let fork_id = uuid::Uuid::new_v4().to_string();

        // Create fork record
        let fork = Fork::new(
            fork_id.clone(),
            network,
            block_number,
            port,
            pid,
            session_id,
        );

        // Update state
        self.used_ports.insert(port);
        self.registry.add(fork.clone());
        self.processes.insert(fork_id, child);

        // Save registry
        self.save_registry().await?;

        Ok(fork)
    }

    /// Kill a fork by ID.
    pub async fn kill(&mut self, fork_id: &str) -> Result<(), AnchorError> {
        // Remove from registry
        let fork = self
            .registry
            .remove(fork_id)
            .ok_or_else(|| AnchorError::InvalidZone(format!("Fork not found: {}", fork_id)))?;

        // Release port
        self.used_ports.remove(&fork.port);

        // Kill process if we have the handle
        if let Some(mut child) = self.processes.remove(fork_id) {
            let _ = child.kill().await;
        } else {
            // Try to kill by PID
            kill_process(fork.pid);
        }

        // Save registry
        self.save_registry().await?;

        Ok(())
    }

    /// Kill all forks.
    pub async fn kill_all(&mut self) -> Result<(), AnchorError> {
        // Collect fork IDs first to avoid borrow issues
        let fork_ids: Vec<String> = self.registry.forks.iter().map(|f| f.id.clone()).collect();

        for fork_id in fork_ids {
            let _ = self.kill(&fork_id).await;
        }

        Ok(())
    }

    /// Get a fork by ID.
    pub fn get(&self, fork_id: &str) -> Option<&Fork> {
        self.registry.get(fork_id)
    }

    /// Get all forks.
    pub fn all(&self) -> &[Fork] {
        &self.registry.forks
    }

    /// Get forks for a session.
    pub fn get_by_session(&self, session_id: &str) -> Vec<&Fork> {
        self.registry.get_by_session(session_id)
    }

    /// Check if a fork is running.
    pub async fn is_running(&self, fork_id: &str) -> bool {
        if let Some(fork) = self.get(fork_id) {
            let client = RpcClient::with_timeout(&fork.rpc_url, Duration::from_secs(2));
            client.is_ready().await
        } else {
            false
        }
    }
}

/// Check if a port is available.
fn is_port_available(port: u16) -> bool {
    std::net::TcpListener::bind(("127.0.0.1", port)).is_ok()
}

/// Kill a process by PID.
#[cfg(unix)]
fn kill_process(pid: u32) {
    use nix::sys::signal::{kill, Signal};
    use nix::unistd::Pid;
    let _ = kill(Pid::from_raw(pid as i32), Signal::SIGTERM);
}

#[cfg(windows)]
fn kill_process(pid: u32) {
    use std::process::Command;
    let _ = Command::new("taskkill")
        .args(["/F", "/PID", &pid.to_string()])
        .output();
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_fork_manager_new() {
        let manager = ForkManager::new("/tmp/test-registry.json");
        assert!(manager.registry.is_empty());
        assert!(manager.used_ports.is_empty());
    }

    #[test]
    fn test_find_available_port_empty() {
        let manager = ForkManager::new("/tmp/test.json");
        // Should find a port in the default range
        let port = manager.find_available_port();
        assert!(port.is_some());
        let port = port.unwrap();
        assert!((DEFAULT_PORT_START..=DEFAULT_PORT_END).contains(&port));
    }

    #[test]
    fn test_find_available_port_with_used() {
        let mut manager = ForkManager::new("/tmp/test.json");
        manager.used_ports.insert(8545);
        manager.used_ports.insert(8546);

        let port = manager.find_available_port_in_range(8545, 8550);
        assert!(port.is_some());
        let port = port.unwrap();
        assert!((8547..=8550).contains(&port));
    }

    #[tokio::test]
    async fn test_load_save_registry() {
        let dir = tempdir().unwrap();
        let registry_path = dir.path().join("registry.json");

        let mut manager = ForkManager::new(&registry_path);

        // Add a fork manually
        let fork = Fork::new(
            "test-fork".to_string(),
            Network::Mainnet,
            1000000,
            8545,
            12345,
            None,
        );
        manager.registry.add(fork);
        manager.used_ports.insert(8545);

        // Save
        manager.save_registry().await.unwrap();
        assert!(registry_path.exists());

        // Create new manager and load
        let mut manager2 = ForkManager::new(&registry_path);
        manager2.load_registry().await.unwrap();

        assert_eq!(manager2.registry.len(), 1);
        assert!(manager2.used_ports.contains(&8545));
    }

    #[tokio::test]
    async fn test_load_registry_nonexistent() {
        let dir = tempdir().unwrap();
        let registry_path = dir.path().join("nonexistent.json");

        let mut manager = ForkManager::new(&registry_path);
        // Should not error on nonexistent file
        manager.load_registry().await.unwrap();
        assert!(manager.registry.is_empty());
    }

    #[test]
    fn test_is_port_available() {
        // Port 0 should never be available
        // But let's test with a high port that's likely available
        let result = is_port_available(59999);
        // We can't guarantee this, but it should at least run without panicking
        let _ = result;
    }

    #[test]
    fn test_get_nonexistent_fork() {
        let manager = ForkManager::new("/tmp/test.json");
        assert!(manager.get("nonexistent").is_none());
    }

    #[test]
    fn test_all_forks_empty() {
        let manager = ForkManager::new("/tmp/test.json");
        assert!(manager.all().is_empty());
    }

    #[test]
    fn test_get_by_session_empty() {
        let manager = ForkManager::new("/tmp/test.json");
        assert!(manager.get_by_session("session-1").is_empty());
    }
}
