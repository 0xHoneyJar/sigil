//! Checkpoint lifecycle manager for full state persistence.

use crate::error::AnchorError;
use crate::rpc::{AnvilMethods, RpcClient};
use crate::types::{Checkpoint, CheckpointRegistry};
use std::path::PathBuf;
use tokio::fs;

/// Checkpoint lifecycle manager.
#[derive(Debug)]
pub struct CheckpointManager {
    /// RPC client for Anvil communication
    client: RpcClient,
    /// Fork ID this manager is associated with
    fork_id: String,
    /// Session ID this manager is associated with
    session_id: String,
    /// Registry of checkpoints
    registry: CheckpointRegistry,
    /// Path to the registry file
    registry_path: PathBuf,
    /// Directory for checkpoint data files
    checkpoints_dir: PathBuf,
}

impl CheckpointManager {
    /// Create a new checkpoint manager.
    pub fn new(
        client: RpcClient,
        fork_id: impl Into<String>,
        session_id: impl Into<String>,
        registry_path: impl Into<PathBuf>,
        checkpoints_dir: impl Into<PathBuf>,
    ) -> Self {
        Self {
            client,
            fork_id: fork_id.into(),
            session_id: session_id.into(),
            registry: CheckpointRegistry::new(),
            registry_path: registry_path.into(),
            checkpoints_dir: checkpoints_dir.into(),
        }
    }

    /// Load the checkpoint registry from disk.
    pub async fn load_registry(&mut self) -> Result<(), AnchorError> {
        if self.registry_path.exists() {
            let contents = fs::read_to_string(&self.registry_path).await?;
            self.registry = serde_json::from_str(&contents)?;
        }
        Ok(())
    }

    /// Save the checkpoint registry to disk.
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
    pub fn registry(&self) -> &CheckpointRegistry {
        &self.registry
    }

    /// Get the fork ID.
    pub fn fork_id(&self) -> &str {
        &self.fork_id
    }

    /// Get the session ID.
    pub fn session_id(&self) -> &str {
        &self.session_id
    }

    /// Save a checkpoint (full state dump).
    pub async fn save(&mut self, description: Option<String>) -> Result<Checkpoint, AnchorError> {
        // Ensure checkpoints directory exists
        fs::create_dir_all(&self.checkpoints_dir).await?;

        // Dump state via RPC
        let state_hex = self
            .client
            .dump_state()
            .await
            .map_err(|e| AnchorError::Rpc(e.to_string()))?;

        // Decode hex to bytes
        let state_bytes = hex_decode(&state_hex)?;
        let size_bytes = state_bytes.len() as u64;

        // Get current block number
        let block_number = self
            .client
            .get_block_number()
            .await
            .map_err(|e| AnchorError::Rpc(e.to_string()))?;

        // Generate checkpoint ID
        let checkpoint_id = uuid::Uuid::new_v4().to_string();

        // Create checkpoint record
        let mut checkpoint = Checkpoint::new(
            &checkpoint_id,
            &self.session_id,
            &self.fork_id,
            block_number,
            size_bytes,
        );

        if let Some(desc) = description {
            checkpoint = checkpoint.with_description(desc);
        }

        // Write state to file
        let file_path = self.checkpoints_dir.join(checkpoint.file_name());
        fs::write(&file_path, &state_bytes).await?;

        // Add to registry and save
        self.registry.add(checkpoint.clone());
        self.save_registry().await?;

        Ok(checkpoint)
    }

    /// Restore from a checkpoint.
    pub async fn restore(&self, checkpoint_id: &str) -> Result<(), AnchorError> {
        // Get checkpoint from registry
        let checkpoint = self
            .registry
            .get(checkpoint_id)
            .ok_or_else(|| AnchorError::CheckpointNotFound(checkpoint_id.to_string()))?;

        // Read state from file
        let file_path = self.checkpoints_dir.join(checkpoint.file_name());
        if !file_path.exists() {
            return Err(AnchorError::CheckpointNotFound(format!(
                "File not found: {}",
                file_path.display()
            )));
        }

        let state_bytes = fs::read(&file_path).await?;
        let state_hex = hex_encode(&state_bytes);

        // Load state via RPC
        let success = self
            .client
            .load_state(&state_hex)
            .await
            .map_err(|e| AnchorError::Rpc(e.to_string()))?;

        if !success {
            return Err(AnchorError::StateCorruption);
        }

        Ok(())
    }

    /// List all checkpoints.
    pub fn list(&self) -> &[Checkpoint] {
        &self.registry.checkpoints
    }

    /// List checkpoints for the current session.
    pub fn list_current_session(&self) -> Vec<&Checkpoint> {
        self.registry.get_by_session(&self.session_id)
    }

    /// Get a specific checkpoint.
    pub fn get(&self, checkpoint_id: &str) -> Option<&Checkpoint> {
        self.registry.get(checkpoint_id)
    }

    /// Delete a checkpoint.
    pub async fn delete(&mut self, checkpoint_id: &str) -> Result<Checkpoint, AnchorError> {
        // Get and remove from registry
        let checkpoint = self
            .registry
            .remove(checkpoint_id)
            .ok_or_else(|| AnchorError::CheckpointNotFound(checkpoint_id.to_string()))?;

        // Delete the file
        let file_path = self.checkpoints_dir.join(checkpoint.file_name());
        if file_path.exists() {
            fs::remove_file(&file_path).await?;
        }

        // Save registry
        self.save_registry().await?;

        Ok(checkpoint)
    }

    /// Get total size of all checkpoints.
    pub fn total_size_bytes(&self) -> u64 {
        self.registry.total_size_bytes()
    }

    /// Clear all checkpoints.
    pub async fn clear(&mut self) -> Result<(), AnchorError> {
        // Delete all checkpoint files
        for checkpoint in &self.registry.checkpoints {
            let file_path = self.checkpoints_dir.join(checkpoint.file_name());
            if file_path.exists() {
                let _ = fs::remove_file(&file_path).await;
            }
        }

        self.registry.clear();
        self.save_registry().await
    }
}

/// Decode a hex string to bytes.
fn hex_decode(hex: &str) -> Result<Vec<u8>, AnchorError> {
    let hex = hex.strip_prefix("0x").unwrap_or(hex);
    hex::decode(hex).map_err(|e| AnchorError::Rpc(format!("Invalid hex: {}", e)))
}

/// Encode bytes to a hex string.
fn hex_encode(bytes: &[u8]) -> String {
    format!("0x{}", hex::encode(bytes))
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    fn create_test_client() -> RpcClient {
        RpcClient::new("http://localhost:8545")
    }

    #[test]
    fn test_checkpoint_manager_new() {
        let client = create_test_client();
        let manager = CheckpointManager::new(
            client,
            "fork-1",
            "session-1",
            "/tmp/test/checkpoints.json",
            "/tmp/test/checkpoints",
        );
        assert_eq!(manager.fork_id(), "fork-1");
        assert_eq!(manager.session_id(), "session-1");
        assert!(manager.registry().is_empty());
    }

    #[tokio::test]
    async fn test_load_save_registry() {
        let dir = tempdir().unwrap();
        let registry_path = dir.path().join("checkpoints.json");
        let checkpoints_dir = dir.path().join("checkpoints");

        let client = create_test_client();
        let mut manager = CheckpointManager::new(
            client,
            "fork-1",
            "session-1",
            &registry_path,
            &checkpoints_dir,
        );

        // Manually add a checkpoint to registry
        manager
            .registry
            .add(Checkpoint::new("cp-1", "session-1", "fork-1", 1000, 5000));
        manager.save_registry().await.unwrap();

        // Load into new manager
        let client2 = create_test_client();
        let mut manager2 = CheckpointManager::new(
            client2,
            "fork-1",
            "session-1",
            &registry_path,
            &checkpoints_dir,
        );
        manager2.load_registry().await.unwrap();

        assert_eq!(manager2.registry().len(), 1);
        assert!(manager2.get("cp-1").is_some());
    }

    #[tokio::test]
    async fn test_load_nonexistent_registry() {
        let dir = tempdir().unwrap();
        let registry_path = dir.path().join("nonexistent.json");
        let checkpoints_dir = dir.path().join("checkpoints");

        let client = create_test_client();
        let mut manager = CheckpointManager::new(
            client,
            "fork-1",
            "session-1",
            &registry_path,
            &checkpoints_dir,
        );

        // Should not error on nonexistent file
        manager.load_registry().await.unwrap();
        assert!(manager.registry().is_empty());
    }

    #[tokio::test]
    async fn test_delete_checkpoint() {
        let dir = tempdir().unwrap();
        let registry_path = dir.path().join("checkpoints.json");
        let checkpoints_dir = dir.path().join("checkpoints");
        fs::create_dir_all(&checkpoints_dir).await.unwrap();

        let client = create_test_client();
        let mut manager = CheckpointManager::new(
            client,
            "fork-1",
            "session-1",
            &registry_path,
            &checkpoints_dir,
        );

        // Add checkpoint directly to registry and create dummy file
        let checkpoint = Checkpoint::new("cp-1", "session-1", "fork-1", 1000, 5000);
        let file_path = checkpoints_dir.join(checkpoint.file_name());
        fs::write(&file_path, b"test data").await.unwrap();
        manager.registry.add(checkpoint);

        assert_eq!(manager.registry().len(), 1);
        assert!(file_path.exists());

        // Delete it
        let deleted = manager.delete("cp-1").await.unwrap();
        assert_eq!(deleted.id, "cp-1");
        assert!(manager.registry().is_empty());
        assert!(!file_path.exists());
    }

    #[tokio::test]
    async fn test_delete_nonexistent() {
        let dir = tempdir().unwrap();
        let registry_path = dir.path().join("checkpoints.json");
        let checkpoints_dir = dir.path().join("checkpoints");

        let client = create_test_client();
        let mut manager = CheckpointManager::new(
            client,
            "fork-1",
            "session-1",
            &registry_path,
            &checkpoints_dir,
        );

        let result = manager.delete("nonexistent").await;
        assert!(result.is_err());
    }

    #[test]
    fn test_list_checkpoints() {
        let client = create_test_client();
        let mut manager = CheckpointManager::new(
            client,
            "fork-1",
            "session-1",
            "/tmp/test/checkpoints.json",
            "/tmp/test/checkpoints",
        );

        manager
            .registry
            .add(Checkpoint::new("cp-1", "session-1", "fork-1", 1000, 5000));
        manager
            .registry
            .add(Checkpoint::new("cp-2", "session-1", "fork-1", 1001, 6000));

        let list = manager.list();
        assert_eq!(list.len(), 2);
    }

    #[test]
    fn test_list_current_session() {
        let client = create_test_client();
        let mut manager = CheckpointManager::new(
            client,
            "fork-1",
            "session-1",
            "/tmp/test/checkpoints.json",
            "/tmp/test/checkpoints",
        );

        manager
            .registry
            .add(Checkpoint::new("cp-1", "session-1", "fork-1", 1000, 5000));
        manager
            .registry
            .add(Checkpoint::new("cp-2", "session-2", "fork-1", 1001, 6000));

        let session1 = manager.list_current_session();
        assert_eq!(session1.len(), 1);
        assert_eq!(session1[0].id, "cp-1");
    }

    #[test]
    fn test_total_size_bytes() {
        let client = create_test_client();
        let mut manager = CheckpointManager::new(
            client,
            "fork-1",
            "session-1",
            "/tmp/test/checkpoints.json",
            "/tmp/test/checkpoints",
        );

        manager
            .registry
            .add(Checkpoint::new("cp-1", "session-1", "fork-1", 1000, 5000));
        manager
            .registry
            .add(Checkpoint::new("cp-2", "session-1", "fork-1", 1001, 6000));

        assert_eq!(manager.total_size_bytes(), 11000);
    }

    #[test]
    fn test_hex_decode() {
        assert_eq!(hex_decode("0x48656c6c6f").unwrap(), b"Hello");
        assert_eq!(hex_decode("48656c6c6f").unwrap(), b"Hello");
    }

    #[test]
    fn test_hex_encode() {
        assert_eq!(hex_encode(b"Hello"), "0x48656c6c6f");
    }
}
