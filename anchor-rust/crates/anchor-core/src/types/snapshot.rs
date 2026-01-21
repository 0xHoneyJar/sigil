//! Snapshot types for EVM state management.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// A snapshot of EVM state at a point in time.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Snapshot {
    /// Unique snapshot identifier (from evm_snapshot)
    pub id: String,
    /// Fork this snapshot belongs to
    pub fork_id: String,
    /// Session this snapshot is associated with
    #[serde(skip_serializing_if = "Option::is_none")]
    pub session_id: Option<String>,
    /// Task that created this snapshot
    #[serde(skip_serializing_if = "Option::is_none")]
    pub task_id: Option<String>,
    /// Block number at snapshot time
    pub block_number: u64,
    /// When the snapshot was created
    pub created_at: DateTime<Utc>,
    /// Optional description
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

impl Snapshot {
    /// Create a new snapshot.
    pub fn new(id: impl Into<String>, fork_id: impl Into<String>, block_number: u64) -> Self {
        Self {
            id: id.into(),
            fork_id: fork_id.into(),
            session_id: None,
            task_id: None,
            block_number,
            created_at: Utc::now(),
            description: None,
        }
    }

    /// Set the session ID.
    pub fn with_session(mut self, session_id: impl Into<String>) -> Self {
        self.session_id = Some(session_id.into());
        self
    }

    /// Set the task ID.
    pub fn with_task(mut self, task_id: impl Into<String>) -> Self {
        self.task_id = Some(task_id.into());
        self
    }

    /// Set the description.
    pub fn with_description(mut self, description: impl Into<String>) -> Self {
        self.description = Some(description.into());
        self
    }
}

/// Registry of snapshots for a session.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct SnapshotRegistry {
    /// All snapshots in this registry
    pub snapshots: Vec<Snapshot>,
}

impl SnapshotRegistry {
    /// Create a new empty registry.
    pub fn new() -> Self {
        Self::default()
    }

    /// Add a snapshot to the registry.
    pub fn add(&mut self, snapshot: Snapshot) {
        self.snapshots.push(snapshot);
    }

    /// Get a snapshot by ID.
    pub fn get(&self, id: &str) -> Option<&Snapshot> {
        self.snapshots.iter().find(|s| s.id == id)
    }

    /// Remove a snapshot by ID.
    pub fn remove(&mut self, id: &str) -> Option<Snapshot> {
        if let Some(pos) = self.snapshots.iter().position(|s| s.id == id) {
            Some(self.snapshots.remove(pos))
        } else {
            None
        }
    }

    /// Get all snapshots for a fork.
    pub fn get_by_fork(&self, fork_id: &str) -> Vec<&Snapshot> {
        self.snapshots
            .iter()
            .filter(|s| s.fork_id == fork_id)
            .collect()
    }

    /// Get all snapshots for a session.
    pub fn get_by_session(&self, session_id: &str) -> Vec<&Snapshot> {
        self.snapshots
            .iter()
            .filter(|s| s.session_id.as_deref() == Some(session_id))
            .collect()
    }

    /// Check if the registry is empty.
    pub fn is_empty(&self) -> bool {
        self.snapshots.is_empty()
    }

    /// Get the number of snapshots.
    pub fn len(&self) -> usize {
        self.snapshots.len()
    }

    /// Clear all snapshots.
    pub fn clear(&mut self) {
        self.snapshots.clear();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_snapshot_new() {
        let snapshot = Snapshot::new("0x1", "fork-1", 1000);
        assert_eq!(snapshot.id, "0x1");
        assert_eq!(snapshot.fork_id, "fork-1");
        assert_eq!(snapshot.block_number, 1000);
        assert!(snapshot.session_id.is_none());
        assert!(snapshot.task_id.is_none());
        assert!(snapshot.description.is_none());
    }

    #[test]
    fn test_snapshot_with_session() {
        let snapshot = Snapshot::new("0x1", "fork-1", 1000).with_session("session-1");
        assert_eq!(snapshot.session_id, Some("session-1".to_string()));
    }

    #[test]
    fn test_snapshot_with_task() {
        let snapshot = Snapshot::new("0x1", "fork-1", 1000).with_task("task-1");
        assert_eq!(snapshot.task_id, Some("task-1".to_string()));
    }

    #[test]
    fn test_snapshot_with_description() {
        let snapshot = Snapshot::new("0x1", "fork-1", 1000).with_description("Before test");
        assert_eq!(snapshot.description, Some("Before test".to_string()));
    }

    #[test]
    fn test_snapshot_builder_chain() {
        let snapshot = Snapshot::new("0x1", "fork-1", 1000)
            .with_session("session-1")
            .with_task("task-1")
            .with_description("Test snapshot");

        assert_eq!(snapshot.id, "0x1");
        assert_eq!(snapshot.session_id, Some("session-1".to_string()));
        assert_eq!(snapshot.task_id, Some("task-1".to_string()));
        assert_eq!(snapshot.description, Some("Test snapshot".to_string()));
    }

    #[test]
    fn test_snapshot_serialize_deserialize() {
        let snapshot = Snapshot::new("0x1", "fork-1", 1000)
            .with_session("session-1")
            .with_description("Test");

        let json = serde_json::to_string(&snapshot).unwrap();
        let deserialized: Snapshot = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.id, snapshot.id);
        assert_eq!(deserialized.fork_id, snapshot.fork_id);
        assert_eq!(deserialized.block_number, snapshot.block_number);
        assert_eq!(deserialized.session_id, snapshot.session_id);
    }

    #[test]
    fn test_registry_new() {
        let registry = SnapshotRegistry::new();
        assert!(registry.is_empty());
        assert_eq!(registry.len(), 0);
    }

    #[test]
    fn test_registry_add_and_get() {
        let mut registry = SnapshotRegistry::new();
        let snapshot = Snapshot::new("0x1", "fork-1", 1000);
        registry.add(snapshot);

        assert_eq!(registry.len(), 1);
        assert!(registry.get("0x1").is_some());
        assert!(registry.get("nonexistent").is_none());
    }

    #[test]
    fn test_registry_remove() {
        let mut registry = SnapshotRegistry::new();
        registry.add(Snapshot::new("0x1", "fork-1", 1000));
        registry.add(Snapshot::new("0x2", "fork-1", 1001));

        let removed = registry.remove("0x1");
        assert!(removed.is_some());
        assert_eq!(removed.unwrap().id, "0x1");
        assert_eq!(registry.len(), 1);

        let removed = registry.remove("nonexistent");
        assert!(removed.is_none());
    }

    #[test]
    fn test_registry_get_by_fork() {
        let mut registry = SnapshotRegistry::new();
        registry.add(Snapshot::new("0x1", "fork-1", 1000));
        registry.add(Snapshot::new("0x2", "fork-1", 1001));
        registry.add(Snapshot::new("0x3", "fork-2", 1000));

        let fork1_snapshots = registry.get_by_fork("fork-1");
        assert_eq!(fork1_snapshots.len(), 2);

        let fork2_snapshots = registry.get_by_fork("fork-2");
        assert_eq!(fork2_snapshots.len(), 1);
    }

    #[test]
    fn test_registry_get_by_session() {
        let mut registry = SnapshotRegistry::new();
        registry.add(Snapshot::new("0x1", "fork-1", 1000).with_session("session-1"));
        registry.add(Snapshot::new("0x2", "fork-1", 1001).with_session("session-1"));
        registry.add(Snapshot::new("0x3", "fork-1", 1002).with_session("session-2"));
        registry.add(Snapshot::new("0x4", "fork-1", 1003)); // No session

        let session1_snapshots = registry.get_by_session("session-1");
        assert_eq!(session1_snapshots.len(), 2);

        let session2_snapshots = registry.get_by_session("session-2");
        assert_eq!(session2_snapshots.len(), 1);
    }

    #[test]
    fn test_registry_clear() {
        let mut registry = SnapshotRegistry::new();
        registry.add(Snapshot::new("0x1", "fork-1", 1000));
        registry.add(Snapshot::new("0x2", "fork-1", 1001));

        assert_eq!(registry.len(), 2);
        registry.clear();
        assert!(registry.is_empty());
    }

    #[test]
    fn test_registry_serialize_deserialize() {
        let mut registry = SnapshotRegistry::new();
        registry.add(Snapshot::new("0x1", "fork-1", 1000));
        registry.add(Snapshot::new("0x2", "fork-2", 2000));

        let json = serde_json::to_string(&registry).unwrap();
        let deserialized: SnapshotRegistry = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.len(), 2);
        assert!(deserialized.get("0x1").is_some());
        assert!(deserialized.get("0x2").is_some());
    }
}
