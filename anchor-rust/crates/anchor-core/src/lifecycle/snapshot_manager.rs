//! Snapshot lifecycle manager.

use crate::error::AnchorError;
use crate::rpc::{AnvilMethods, RpcClient};
use crate::types::{Snapshot, SnapshotRegistry};
use std::path::PathBuf;
use tokio::fs;

/// Snapshot lifecycle manager.
#[derive(Debug)]
pub struct SnapshotManager {
    /// RPC client for Anvil communication
    client: RpcClient,
    /// Fork ID this manager is associated with
    fork_id: String,
    /// Registry of snapshots
    registry: SnapshotRegistry,
    /// Path to the registry file
    registry_path: PathBuf,
}

impl SnapshotManager {
    /// Create a new snapshot manager.
    pub fn new(
        client: RpcClient,
        fork_id: impl Into<String>,
        registry_path: impl Into<PathBuf>,
    ) -> Self {
        Self {
            client,
            fork_id: fork_id.into(),
            registry: SnapshotRegistry::new(),
            registry_path: registry_path.into(),
        }
    }

    /// Load the snapshot registry from disk.
    pub async fn load_registry(&mut self) -> Result<(), AnchorError> {
        if self.registry_path.exists() {
            let contents = fs::read_to_string(&self.registry_path).await?;
            self.registry = serde_json::from_str(&contents)?;
        }
        Ok(())
    }

    /// Save the snapshot registry to disk.
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
    pub fn registry(&self) -> &SnapshotRegistry {
        &self.registry
    }

    /// Get the fork ID.
    pub fn fork_id(&self) -> &str {
        &self.fork_id
    }

    /// Create a new snapshot.
    pub async fn create(
        &mut self,
        session_id: Option<String>,
        task_id: Option<String>,
        description: Option<String>,
    ) -> Result<Snapshot, AnchorError> {
        // Create snapshot via RPC
        let snapshot_id = self
            .client
            .create_snapshot()
            .await
            .map_err(|e| AnchorError::Rpc(e.to_string()))?;

        // Get current block number
        let block_number = self
            .client
            .get_block_number()
            .await
            .map_err(|e| AnchorError::Rpc(e.to_string()))?;

        // Create snapshot record
        let mut snapshot = Snapshot::new(&snapshot_id, &self.fork_id, block_number);

        if let Some(sid) = session_id {
            snapshot = snapshot.with_session(sid);
        }
        if let Some(tid) = task_id {
            snapshot = snapshot.with_task(tid);
        }
        if let Some(desc) = description {
            snapshot = snapshot.with_description(desc);
        }

        // Add to registry and save
        self.registry.add(snapshot.clone());
        self.save_registry().await?;

        Ok(snapshot)
    }

    /// Revert to a snapshot.
    pub async fn revert(&mut self, snapshot_id: &str) -> Result<(), AnchorError> {
        // Verify snapshot exists in registry
        if self.registry.get(snapshot_id).is_none() {
            return Err(AnchorError::SnapshotNotFound(snapshot_id.to_string()));
        }

        // Revert via RPC
        let success = self
            .client
            .revert_snapshot(snapshot_id)
            .await
            .map_err(|e| AnchorError::Rpc(e.to_string()))?;

        if !success {
            return Err(AnchorError::SnapshotRevertFailed(format!(
                "Anvil returned false for snapshot {}",
                snapshot_id
            )));
        }

        Ok(())
    }

    /// List all snapshots.
    pub fn list(&self) -> &[Snapshot] {
        &self.registry.snapshots
    }

    /// List snapshots for a session.
    pub fn list_by_session(&self, session_id: &str) -> Vec<&Snapshot> {
        self.registry.get_by_session(session_id)
    }

    /// Get a specific snapshot.
    pub fn get(&self, snapshot_id: &str) -> Option<&Snapshot> {
        self.registry.get(snapshot_id)
    }

    /// Delete a snapshot from the registry.
    pub async fn delete(&mut self, snapshot_id: &str) -> Result<Snapshot, AnchorError> {
        let snapshot = self
            .registry
            .remove(snapshot_id)
            .ok_or_else(|| AnchorError::SnapshotNotFound(snapshot_id.to_string()))?;

        self.save_registry().await?;
        Ok(snapshot)
    }

    /// Clear all snapshots.
    pub async fn clear(&mut self) -> Result<(), AnchorError> {
        self.registry.clear();
        self.save_registry().await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    fn create_test_client() -> RpcClient {
        RpcClient::new("http://localhost:8545")
    }

    #[test]
    fn test_snapshot_manager_new() {
        let client = create_test_client();
        let manager = SnapshotManager::new(client, "fork-1", "/tmp/test/snapshots.json");
        assert_eq!(manager.fork_id(), "fork-1");
        assert!(manager.registry().is_empty());
    }

    #[tokio::test]
    async fn test_load_save_registry() {
        let dir = tempdir().unwrap();
        let registry_path = dir.path().join("snapshots.json");

        let client = create_test_client();
        let mut manager = SnapshotManager::new(client, "fork-1", &registry_path);

        // Manually add a snapshot to registry
        manager.registry.add(Snapshot::new("0x1", "fork-1", 1000));
        manager.save_registry().await.unwrap();

        // Load into new manager
        let client2 = create_test_client();
        let mut manager2 = SnapshotManager::new(client2, "fork-1", &registry_path);
        manager2.load_registry().await.unwrap();

        assert_eq!(manager2.registry().len(), 1);
        assert!(manager2.get("0x1").is_some());
    }

    #[tokio::test]
    async fn test_load_nonexistent_registry() {
        let dir = tempdir().unwrap();
        let registry_path = dir.path().join("nonexistent.json");

        let client = create_test_client();
        let mut manager = SnapshotManager::new(client, "fork-1", &registry_path);

        // Should not error on nonexistent file
        manager.load_registry().await.unwrap();
        assert!(manager.registry().is_empty());
    }

    #[tokio::test]
    async fn test_delete_snapshot() {
        let dir = tempdir().unwrap();
        let registry_path = dir.path().join("snapshots.json");

        let client = create_test_client();
        let mut manager = SnapshotManager::new(client, "fork-1", &registry_path);

        // Add snapshot directly to registry
        manager.registry.add(Snapshot::new("0x1", "fork-1", 1000));
        assert_eq!(manager.registry().len(), 1);

        // Delete it
        let deleted = manager.delete("0x1").await.unwrap();
        assert_eq!(deleted.id, "0x1");
        assert!(manager.registry().is_empty());
    }

    #[tokio::test]
    async fn test_delete_nonexistent() {
        let dir = tempdir().unwrap();
        let registry_path = dir.path().join("snapshots.json");

        let client = create_test_client();
        let mut manager = SnapshotManager::new(client, "fork-1", &registry_path);

        let result = manager.delete("nonexistent").await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_clear_snapshots() {
        let dir = tempdir().unwrap();
        let registry_path = dir.path().join("snapshots.json");

        let client = create_test_client();
        let mut manager = SnapshotManager::new(client, "fork-1", &registry_path);

        manager.registry.add(Snapshot::new("0x1", "fork-1", 1000));
        manager.registry.add(Snapshot::new("0x2", "fork-1", 1001));
        assert_eq!(manager.registry().len(), 2);

        manager.clear().await.unwrap();
        assert!(manager.registry().is_empty());
    }

    #[test]
    fn test_list_snapshots() {
        let client = create_test_client();
        let mut manager = SnapshotManager::new(client, "fork-1", "/tmp/test/snapshots.json");

        manager.registry.add(Snapshot::new("0x1", "fork-1", 1000));
        manager.registry.add(Snapshot::new("0x2", "fork-1", 1001));

        let list = manager.list();
        assert_eq!(list.len(), 2);
    }

    #[test]
    fn test_list_by_session() {
        let client = create_test_client();
        let mut manager = SnapshotManager::new(client, "fork-1", "/tmp/test/snapshots.json");

        manager
            .registry
            .add(Snapshot::new("0x1", "fork-1", 1000).with_session("session-1"));
        manager
            .registry
            .add(Snapshot::new("0x2", "fork-1", 1001).with_session("session-1"));
        manager
            .registry
            .add(Snapshot::new("0x3", "fork-1", 1002).with_session("session-2"));

        let session1 = manager.list_by_session("session-1");
        assert_eq!(session1.len(), 2);

        let session2 = manager.list_by_session("session-2");
        assert_eq!(session2.len(), 1);
    }

    #[test]
    fn test_get_snapshot() {
        let client = create_test_client();
        let mut manager = SnapshotManager::new(client, "fork-1", "/tmp/test/snapshots.json");

        manager.registry.add(Snapshot::new("0x1", "fork-1", 1000));

        assert!(manager.get("0x1").is_some());
        assert!(manager.get("nonexistent").is_none());
    }
}
