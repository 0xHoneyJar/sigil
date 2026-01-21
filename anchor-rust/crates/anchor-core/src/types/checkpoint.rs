//! Checkpoint types for full EVM state persistence.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// A checkpoint representing a full EVM state dump.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Checkpoint {
    /// Unique checkpoint identifier
    pub id: String,
    /// Session this checkpoint is associated with
    pub session_id: String,
    /// Fork this checkpoint was created from
    pub fork_id: String,
    /// Block number at checkpoint time
    pub block_number: u64,
    /// Size of the state dump in bytes
    pub size_bytes: u64,
    /// When the checkpoint was created
    pub created_at: DateTime<Utc>,
    /// Optional description
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    /// Whether the checkpoint is compressed
    #[serde(default)]
    pub compressed: bool,
}

impl Checkpoint {
    /// Create a new checkpoint.
    pub fn new(
        id: impl Into<String>,
        session_id: impl Into<String>,
        fork_id: impl Into<String>,
        block_number: u64,
        size_bytes: u64,
    ) -> Self {
        Self {
            id: id.into(),
            session_id: session_id.into(),
            fork_id: fork_id.into(),
            block_number,
            size_bytes,
            created_at: Utc::now(),
            description: None,
            compressed: false,
        }
    }

    /// Set the description.
    pub fn with_description(mut self, description: impl Into<String>) -> Self {
        self.description = Some(description.into());
        self
    }

    /// Mark as compressed.
    pub fn with_compression(mut self, compressed: bool) -> Self {
        self.compressed = compressed;
        self
    }

    /// Get the file name for this checkpoint.
    pub fn file_name(&self) -> String {
        if self.compressed {
            format!("{}.bin.zst", self.id)
        } else {
            format!("{}.bin", self.id)
        }
    }
}

/// Registry of checkpoints for a session.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct CheckpointRegistry {
    /// All checkpoints in this registry
    pub checkpoints: Vec<Checkpoint>,
}

impl CheckpointRegistry {
    /// Create a new empty registry.
    pub fn new() -> Self {
        Self::default()
    }

    /// Add a checkpoint to the registry.
    pub fn add(&mut self, checkpoint: Checkpoint) {
        self.checkpoints.push(checkpoint);
    }

    /// Get a checkpoint by ID.
    pub fn get(&self, id: &str) -> Option<&Checkpoint> {
        self.checkpoints.iter().find(|c| c.id == id)
    }

    /// Remove a checkpoint by ID.
    pub fn remove(&mut self, id: &str) -> Option<Checkpoint> {
        if let Some(pos) = self.checkpoints.iter().position(|c| c.id == id) {
            Some(self.checkpoints.remove(pos))
        } else {
            None
        }
    }

    /// Get all checkpoints for a session.
    pub fn get_by_session(&self, session_id: &str) -> Vec<&Checkpoint> {
        self.checkpoints
            .iter()
            .filter(|c| c.session_id == session_id)
            .collect()
    }

    /// Get all checkpoints for a fork.
    pub fn get_by_fork(&self, fork_id: &str) -> Vec<&Checkpoint> {
        self.checkpoints
            .iter()
            .filter(|c| c.fork_id == fork_id)
            .collect()
    }

    /// Check if the registry is empty.
    pub fn is_empty(&self) -> bool {
        self.checkpoints.is_empty()
    }

    /// Get the number of checkpoints.
    pub fn len(&self) -> usize {
        self.checkpoints.len()
    }

    /// Get total size of all checkpoints in bytes.
    pub fn total_size_bytes(&self) -> u64 {
        self.checkpoints.iter().map(|c| c.size_bytes).sum()
    }

    /// Clear all checkpoints.
    pub fn clear(&mut self) {
        self.checkpoints.clear();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_checkpoint_new() {
        let checkpoint = Checkpoint::new("cp-1", "session-1", "fork-1", 1000, 5000);
        assert_eq!(checkpoint.id, "cp-1");
        assert_eq!(checkpoint.session_id, "session-1");
        assert_eq!(checkpoint.fork_id, "fork-1");
        assert_eq!(checkpoint.block_number, 1000);
        assert_eq!(checkpoint.size_bytes, 5000);
        assert!(checkpoint.description.is_none());
        assert!(!checkpoint.compressed);
    }

    #[test]
    fn test_checkpoint_with_description() {
        let checkpoint =
            Checkpoint::new("cp-1", "session-1", "fork-1", 1000, 5000).with_description("Test");
        assert_eq!(checkpoint.description, Some("Test".to_string()));
    }

    #[test]
    fn test_checkpoint_with_compression() {
        let checkpoint =
            Checkpoint::new("cp-1", "session-1", "fork-1", 1000, 5000).with_compression(true);
        assert!(checkpoint.compressed);
    }

    #[test]
    fn test_checkpoint_file_name() {
        let checkpoint = Checkpoint::new("cp-1", "session-1", "fork-1", 1000, 5000);
        assert_eq!(checkpoint.file_name(), "cp-1.bin");

        let compressed = checkpoint.with_compression(true);
        assert_eq!(compressed.file_name(), "cp-1.bin.zst");
    }

    #[test]
    fn test_checkpoint_serialize_deserialize() {
        let checkpoint = Checkpoint::new("cp-1", "session-1", "fork-1", 1000, 5000)
            .with_description("Test")
            .with_compression(true);

        let json = serde_json::to_string(&checkpoint).unwrap();
        let deserialized: Checkpoint = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.id, checkpoint.id);
        assert_eq!(deserialized.session_id, checkpoint.session_id);
        assert_eq!(deserialized.size_bytes, checkpoint.size_bytes);
        assert_eq!(deserialized.compressed, checkpoint.compressed);
    }

    #[test]
    fn test_registry_new() {
        let registry = CheckpointRegistry::new();
        assert!(registry.is_empty());
        assert_eq!(registry.len(), 0);
    }

    #[test]
    fn test_registry_add_and_get() {
        let mut registry = CheckpointRegistry::new();
        let checkpoint = Checkpoint::new("cp-1", "session-1", "fork-1", 1000, 5000);
        registry.add(checkpoint);

        assert_eq!(registry.len(), 1);
        assert!(registry.get("cp-1").is_some());
        assert!(registry.get("nonexistent").is_none());
    }

    #[test]
    fn test_registry_remove() {
        let mut registry = CheckpointRegistry::new();
        registry.add(Checkpoint::new("cp-1", "session-1", "fork-1", 1000, 5000));
        registry.add(Checkpoint::new("cp-2", "session-1", "fork-1", 1001, 6000));

        let removed = registry.remove("cp-1");
        assert!(removed.is_some());
        assert_eq!(removed.unwrap().id, "cp-1");
        assert_eq!(registry.len(), 1);

        let removed = registry.remove("nonexistent");
        assert!(removed.is_none());
    }

    #[test]
    fn test_registry_get_by_session() {
        let mut registry = CheckpointRegistry::new();
        registry.add(Checkpoint::new("cp-1", "session-1", "fork-1", 1000, 5000));
        registry.add(Checkpoint::new("cp-2", "session-1", "fork-1", 1001, 6000));
        registry.add(Checkpoint::new("cp-3", "session-2", "fork-2", 1000, 4000));

        let session1 = registry.get_by_session("session-1");
        assert_eq!(session1.len(), 2);

        let session2 = registry.get_by_session("session-2");
        assert_eq!(session2.len(), 1);
    }

    #[test]
    fn test_registry_get_by_fork() {
        let mut registry = CheckpointRegistry::new();
        registry.add(Checkpoint::new("cp-1", "session-1", "fork-1", 1000, 5000));
        registry.add(Checkpoint::new("cp-2", "session-1", "fork-1", 1001, 6000));
        registry.add(Checkpoint::new("cp-3", "session-2", "fork-2", 1000, 4000));

        let fork1 = registry.get_by_fork("fork-1");
        assert_eq!(fork1.len(), 2);

        let fork2 = registry.get_by_fork("fork-2");
        assert_eq!(fork2.len(), 1);
    }

    #[test]
    fn test_registry_total_size_bytes() {
        let mut registry = CheckpointRegistry::new();
        registry.add(Checkpoint::new("cp-1", "session-1", "fork-1", 1000, 5000));
        registry.add(Checkpoint::new("cp-2", "session-1", "fork-1", 1001, 6000));
        registry.add(Checkpoint::new("cp-3", "session-2", "fork-2", 1000, 4000));

        assert_eq!(registry.total_size_bytes(), 15000);
    }

    #[test]
    fn test_registry_clear() {
        let mut registry = CheckpointRegistry::new();
        registry.add(Checkpoint::new("cp-1", "session-1", "fork-1", 1000, 5000));
        registry.add(Checkpoint::new("cp-2", "session-1", "fork-1", 1001, 6000));

        assert_eq!(registry.len(), 2);
        registry.clear();
        assert!(registry.is_empty());
    }

    #[test]
    fn test_registry_serialize_deserialize() {
        let mut registry = CheckpointRegistry::new();
        registry.add(Checkpoint::new("cp-1", "session-1", "fork-1", 1000, 5000));
        registry.add(Checkpoint::new("cp-2", "session-2", "fork-2", 2000, 6000));

        let json = serde_json::to_string(&registry).unwrap();
        let deserialized: CheckpointRegistry = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.len(), 2);
        assert!(deserialized.get("cp-1").is_some());
        assert!(deserialized.get("cp-2").is_some());
    }
}
