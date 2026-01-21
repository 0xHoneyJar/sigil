//! Fork types for Anvil process management.

use super::Network;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// Active fork instance representing a running Anvil process.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Fork {
    /// Unique fork identifier (UUID v4)
    pub id: String,

    /// Network configuration
    pub network: Network,

    /// Block number the fork was created at
    pub block_number: u64,

    /// Local RPC URL (e.g., "http://127.0.0.1:8545")
    pub rpc_url: String,

    /// Local RPC port
    pub port: u16,

    /// Process ID of the Anvil instance
    pub pid: u32,

    /// Creation timestamp
    #[serde(with = "chrono::serde::ts_milliseconds")]
    pub created_at: DateTime<Utc>,

    /// Session ID this fork belongs to (if any)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub session_id: Option<String>,
}

impl Fork {
    /// Create a new fork instance.
    pub fn new(
        id: String,
        network: Network,
        block_number: u64,
        port: u16,
        pid: u32,
        session_id: Option<String>,
    ) -> Self {
        Self {
            id,
            network,
            block_number,
            rpc_url: format!("http://127.0.0.1:{}", port),
            port,
            pid,
            created_at: Utc::now(),
            session_id,
        }
    }

    /// Check if this fork belongs to a session.
    pub fn has_session(&self) -> bool {
        self.session_id.is_some()
    }

    /// Get the fork age in seconds.
    pub fn age_seconds(&self) -> i64 {
        (Utc::now() - self.created_at).num_seconds()
    }
}

/// Registry for persisting fork information.
#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct ForkRegistry {
    /// List of registered forks
    pub forks: Vec<Fork>,

    /// Last update timestamp
    #[serde(with = "chrono::serde::ts_milliseconds")]
    pub last_updated: DateTime<Utc>,
}

impl ForkRegistry {
    /// Create a new empty registry.
    pub fn new() -> Self {
        Self {
            forks: Vec::new(),
            last_updated: Utc::now(),
        }
    }

    /// Add a fork to the registry.
    pub fn add(&mut self, fork: Fork) {
        self.forks.push(fork);
        self.last_updated = Utc::now();
    }

    /// Remove a fork by ID, returning it if found.
    pub fn remove(&mut self, fork_id: &str) -> Option<Fork> {
        if let Some(pos) = self.forks.iter().position(|f| f.id == fork_id) {
            self.last_updated = Utc::now();
            Some(self.forks.remove(pos))
        } else {
            None
        }
    }

    /// Get a fork by ID.
    pub fn get(&self, fork_id: &str) -> Option<&Fork> {
        self.forks.iter().find(|f| f.id == fork_id)
    }

    /// Get a mutable reference to a fork by ID.
    pub fn get_mut(&mut self, fork_id: &str) -> Option<&mut Fork> {
        self.forks.iter_mut().find(|f| f.id == fork_id)
    }

    /// Get all forks for a session.
    pub fn get_by_session(&self, session_id: &str) -> Vec<&Fork> {
        self.forks
            .iter()
            .filter(|f| f.session_id.as_deref() == Some(session_id))
            .collect()
    }

    /// Get the number of forks.
    pub fn len(&self) -> usize {
        self.forks.len()
    }

    /// Check if the registry is empty.
    pub fn is_empty(&self) -> bool {
        self.forks.is_empty()
    }

    /// Clear all forks from the registry.
    pub fn clear(&mut self) {
        self.forks.clear();
        self.last_updated = Utc::now();
    }

    /// Get all ports currently in use.
    pub fn used_ports(&self) -> Vec<u16> {
        self.forks.iter().map(|f| f.port).collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_fork(id: &str, port: u16) -> Fork {
        Fork::new(id.to_string(), Network::Mainnet, 1000000, port, 12345, None)
    }

    #[test]
    fn test_fork_new() {
        let fork = Fork::new(
            "test-id".to_string(),
            Network::Mainnet,
            1000000,
            8545,
            12345,
            Some("session-1".to_string()),
        );

        assert_eq!(fork.id, "test-id");
        assert_eq!(fork.block_number, 1000000);
        assert_eq!(fork.port, 8545);
        assert_eq!(fork.rpc_url, "http://127.0.0.1:8545");
        assert!(fork.has_session());
    }

    #[test]
    fn test_fork_has_session() {
        let fork_with_session = Fork::new(
            "test-1".to_string(),
            Network::Mainnet,
            1000000,
            8545,
            12345,
            Some("session-1".to_string()),
        );
        let fork_without_session = create_test_fork("test-2", 8546);

        assert!(fork_with_session.has_session());
        assert!(!fork_without_session.has_session());
    }

    #[test]
    fn test_registry_add_and_get() {
        let mut registry = ForkRegistry::new();
        let fork = create_test_fork("fork-1", 8545);

        registry.add(fork);

        assert_eq!(registry.len(), 1);
        assert!(registry.get("fork-1").is_some());
        assert!(registry.get("nonexistent").is_none());
    }

    #[test]
    fn test_registry_remove() {
        let mut registry = ForkRegistry::new();
        registry.add(create_test_fork("fork-1", 8545));
        registry.add(create_test_fork("fork-2", 8546));

        let removed = registry.remove("fork-1");
        assert!(removed.is_some());
        assert_eq!(removed.unwrap().id, "fork-1");
        assert_eq!(registry.len(), 1);
        assert!(registry.get("fork-1").is_none());
    }

    #[test]
    fn test_registry_remove_nonexistent() {
        let mut registry = ForkRegistry::new();
        let removed = registry.remove("nonexistent");
        assert!(removed.is_none());
    }

    #[test]
    fn test_registry_get_by_session() {
        let mut registry = ForkRegistry::new();

        let mut fork1 = create_test_fork("fork-1", 8545);
        fork1.session_id = Some("session-a".to_string());

        let mut fork2 = create_test_fork("fork-2", 8546);
        fork2.session_id = Some("session-a".to_string());

        let mut fork3 = create_test_fork("fork-3", 8547);
        fork3.session_id = Some("session-b".to_string());

        registry.add(fork1);
        registry.add(fork2);
        registry.add(fork3);

        let session_a_forks = registry.get_by_session("session-a");
        assert_eq!(session_a_forks.len(), 2);

        let session_b_forks = registry.get_by_session("session-b");
        assert_eq!(session_b_forks.len(), 1);
    }

    #[test]
    fn test_registry_used_ports() {
        let mut registry = ForkRegistry::new();
        registry.add(create_test_fork("fork-1", 8545));
        registry.add(create_test_fork("fork-2", 8546));
        registry.add(create_test_fork("fork-3", 8547));

        let ports = registry.used_ports();
        assert_eq!(ports.len(), 3);
        assert!(ports.contains(&8545));
        assert!(ports.contains(&8546));
        assert!(ports.contains(&8547));
    }

    #[test]
    fn test_registry_clear() {
        let mut registry = ForkRegistry::new();
        registry.add(create_test_fork("fork-1", 8545));
        registry.add(create_test_fork("fork-2", 8546));

        registry.clear();
        assert!(registry.is_empty());
    }

    #[test]
    fn test_fork_serialize_deserialize() {
        let fork = create_test_fork("test-id", 8545);
        let json = serde_json::to_string(&fork).unwrap();
        let deserialized: Fork = serde_json::from_str(&json).unwrap();

        assert_eq!(fork.id, deserialized.id);
        assert_eq!(fork.port, deserialized.port);
        assert_eq!(fork.block_number, deserialized.block_number);
    }

    #[test]
    fn test_registry_serialize_deserialize() {
        let mut registry = ForkRegistry::new();
        registry.add(create_test_fork("fork-1", 8545));
        registry.add(create_test_fork("fork-2", 8546));

        let json = serde_json::to_string(&registry).unwrap();
        let deserialized: ForkRegistry = serde_json::from_str(&json).unwrap();

        assert_eq!(registry.len(), deserialized.len());
    }
}
