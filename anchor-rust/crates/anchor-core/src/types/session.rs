//! Session types for development session management.

use crate::types::Network;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// Status of a development session.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SessionStatus {
    /// Session is actively running
    Active,
    /// Session is paused (fork may be stopped)
    Paused,
    /// Session completed successfully
    Completed,
    /// Session failed with an error
    Failed,
}

impl std::fmt::Display for SessionStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SessionStatus::Active => write!(f, "active"),
            SessionStatus::Paused => write!(f, "paused"),
            SessionStatus::Completed => write!(f, "completed"),
            SessionStatus::Failed => write!(f, "failed"),
        }
    }
}

impl SessionStatus {
    /// Check if the session is terminal (cannot be resumed).
    pub fn is_terminal(&self) -> bool {
        matches!(self, SessionStatus::Completed | SessionStatus::Failed)
    }

    /// Check if the session can be resumed.
    pub fn can_resume(&self) -> bool {
        matches!(self, SessionStatus::Paused)
    }

    /// Check if the session is currently active.
    pub fn is_active(&self) -> bool {
        matches!(self, SessionStatus::Active)
    }
}

/// A development session representing a pinned blockchain state.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    /// Unique session identifier (UUID v4)
    pub id: String,
    /// Network this session is forking
    pub network: Network,
    /// Block number the session started from
    pub block_number: u64,
    /// Fork ID associated with this session
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fork_id: Option<String>,
    /// Current session status
    pub status: SessionStatus,
    /// When the session was created
    pub created_at: DateTime<Utc>,
    /// When the session was last resumed
    #[serde(skip_serializing_if = "Option::is_none")]
    pub resumed_at: Option<DateTime<Utc>>,
    /// Optional description
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

impl Session {
    /// Create a new session.
    pub fn new(id: impl Into<String>, network: Network, block_number: u64) -> Self {
        Self {
            id: id.into(),
            network,
            block_number,
            fork_id: None,
            status: SessionStatus::Active,
            created_at: Utc::now(),
            resumed_at: None,
            description: None,
        }
    }

    /// Set the fork ID.
    pub fn with_fork(mut self, fork_id: impl Into<String>) -> Self {
        self.fork_id = Some(fork_id.into());
        self
    }

    /// Set the description.
    pub fn with_description(mut self, description: impl Into<String>) -> Self {
        self.description = Some(description.into());
        self
    }

    /// Set the status.
    pub fn with_status(mut self, status: SessionStatus) -> Self {
        self.status = status;
        self
    }

    /// Pause the session.
    pub fn pause(&mut self) {
        if self.status == SessionStatus::Active {
            self.status = SessionStatus::Paused;
        }
    }

    /// Resume the session.
    pub fn resume(&mut self) {
        if self.status == SessionStatus::Paused {
            self.status = SessionStatus::Active;
            self.resumed_at = Some(Utc::now());
        }
    }

    /// Complete the session successfully.
    pub fn complete(&mut self) {
        self.status = SessionStatus::Completed;
    }

    /// Mark the session as failed.
    pub fn fail(&mut self) {
        self.status = SessionStatus::Failed;
    }

    /// Check if the session has an active fork.
    pub fn has_fork(&self) -> bool {
        self.fork_id.is_some()
    }
}

/// Metadata for persisting session state.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionMetadata {
    /// Session data
    pub session: Session,
    /// Number of snapshots in this session
    pub snapshot_count: usize,
    /// Number of checkpoints in this session
    pub checkpoint_count: usize,
    /// Total checkpoint size in bytes
    pub checkpoint_size_bytes: u64,
    /// Number of tasks completed
    pub tasks_completed: usize,
    /// Number of tasks pending
    pub tasks_pending: usize,
    /// Last activity timestamp
    pub last_activity: DateTime<Utc>,
}

impl SessionMetadata {
    /// Create new metadata from a session.
    pub fn new(session: Session) -> Self {
        Self {
            last_activity: session.created_at,
            session,
            snapshot_count: 0,
            checkpoint_count: 0,
            checkpoint_size_bytes: 0,
            tasks_completed: 0,
            tasks_pending: 0,
        }
    }

    /// Update last activity timestamp.
    pub fn touch(&mut self) {
        self.last_activity = Utc::now();
    }

    /// Update snapshot count.
    pub fn set_snapshot_count(&mut self, count: usize) {
        self.snapshot_count = count;
        self.touch();
    }

    /// Update checkpoint stats.
    pub fn set_checkpoint_stats(&mut self, count: usize, size_bytes: u64) {
        self.checkpoint_count = count;
        self.checkpoint_size_bytes = size_bytes;
        self.touch();
    }

    /// Update task stats.
    pub fn set_task_stats(&mut self, completed: usize, pending: usize) {
        self.tasks_completed = completed;
        self.tasks_pending = pending;
        self.touch();
    }
}

/// Registry of all sessions.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct SessionRegistry {
    /// All sessions
    pub sessions: Vec<SessionMetadata>,
    /// Currently active session ID
    #[serde(skip_serializing_if = "Option::is_none")]
    pub active_session_id: Option<String>,
}

impl SessionRegistry {
    /// Create a new empty registry.
    pub fn new() -> Self {
        Self::default()
    }

    /// Add a session to the registry.
    pub fn add(&mut self, metadata: SessionMetadata) {
        // Set as active if the session is active
        if metadata.session.status.is_active() {
            self.active_session_id = Some(metadata.session.id.clone());
        }
        self.sessions.push(metadata);
    }

    /// Get a session by ID.
    pub fn get(&self, id: &str) -> Option<&SessionMetadata> {
        self.sessions.iter().find(|m| m.session.id == id)
    }

    /// Get a mutable session by ID.
    pub fn get_mut(&mut self, id: &str) -> Option<&mut SessionMetadata> {
        self.sessions.iter_mut().find(|m| m.session.id == id)
    }

    /// Remove a session by ID.
    pub fn remove(&mut self, id: &str) -> Option<SessionMetadata> {
        if let Some(pos) = self.sessions.iter().position(|m| m.session.id == id) {
            let removed = self.sessions.remove(pos);
            // Clear active if we removed the active session
            if self.active_session_id.as_deref() == Some(id) {
                self.active_session_id = None;
            }
            Some(removed)
        } else {
            None
        }
    }

    /// Get sessions by status.
    pub fn get_by_status(&self, status: SessionStatus) -> Vec<&SessionMetadata> {
        self.sessions
            .iter()
            .filter(|m| m.session.status == status)
            .collect()
    }

    /// Get sessions by network.
    pub fn get_by_network(&self, network: &Network) -> Vec<&SessionMetadata> {
        self.sessions
            .iter()
            .filter(|m| &m.session.network == network)
            .collect()
    }

    /// Get the active session.
    pub fn get_active(&self) -> Option<&SessionMetadata> {
        self.active_session_id.as_ref().and_then(|id| self.get(id))
    }

    /// Set the active session.
    pub fn set_active(&mut self, id: Option<&str>) {
        self.active_session_id = id.map(String::from);
    }

    /// Check if the registry is empty.
    pub fn is_empty(&self) -> bool {
        self.sessions.is_empty()
    }

    /// Get the number of sessions.
    pub fn len(&self) -> usize {
        self.sessions.len()
    }

    /// Clear all sessions.
    pub fn clear(&mut self) {
        self.sessions.clear();
        self.active_session_id = None;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_session_status_display() {
        assert_eq!(SessionStatus::Active.to_string(), "active");
        assert_eq!(SessionStatus::Paused.to_string(), "paused");
        assert_eq!(SessionStatus::Completed.to_string(), "completed");
        assert_eq!(SessionStatus::Failed.to_string(), "failed");
    }

    #[test]
    fn test_session_status_checks() {
        assert!(SessionStatus::Active.is_active());
        assert!(!SessionStatus::Paused.is_active());

        assert!(SessionStatus::Paused.can_resume());
        assert!(!SessionStatus::Active.can_resume());
        assert!(!SessionStatus::Completed.can_resume());

        assert!(SessionStatus::Completed.is_terminal());
        assert!(SessionStatus::Failed.is_terminal());
        assert!(!SessionStatus::Active.is_terminal());
    }

    #[test]
    fn test_session_new() {
        let session = Session::new("session-1", Network::Mainnet, 1000);
        assert_eq!(session.id, "session-1");
        assert_eq!(session.network, Network::Mainnet);
        assert_eq!(session.block_number, 1000);
        assert!(session.fork_id.is_none());
        assert_eq!(session.status, SessionStatus::Active);
        assert!(session.resumed_at.is_none());
    }

    #[test]
    fn test_session_builder() {
        let session = Session::new("session-1", Network::Mainnet, 1000)
            .with_fork("fork-1")
            .with_description("Test session")
            .with_status(SessionStatus::Paused);

        assert_eq!(session.fork_id, Some("fork-1".to_string()));
        assert_eq!(session.description, Some("Test session".to_string()));
        assert_eq!(session.status, SessionStatus::Paused);
    }

    #[test]
    fn test_session_lifecycle() {
        let mut session = Session::new("session-1", Network::Mainnet, 1000);
        assert!(session.status.is_active());

        session.pause();
        assert_eq!(session.status, SessionStatus::Paused);
        assert!(session.resumed_at.is_none());

        session.resume();
        assert!(session.status.is_active());
        assert!(session.resumed_at.is_some());

        session.complete();
        assert_eq!(session.status, SessionStatus::Completed);
    }

    #[test]
    fn test_session_has_fork() {
        let session1 = Session::new("session-1", Network::Mainnet, 1000);
        assert!(!session1.has_fork());

        let session2 = Session::new("session-2", Network::Mainnet, 1000).with_fork("fork-1");
        assert!(session2.has_fork());
    }

    #[test]
    fn test_session_serialize_deserialize() {
        let session = Session::new("session-1", Network::Mainnet, 1000)
            .with_fork("fork-1")
            .with_description("Test");

        let json = serde_json::to_string(&session).unwrap();
        let deserialized: Session = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.id, session.id);
        assert_eq!(deserialized.network, session.network);
        assert_eq!(deserialized.block_number, session.block_number);
        assert_eq!(deserialized.fork_id, session.fork_id);
    }

    #[test]
    fn test_session_metadata_new() {
        let session = Session::new("session-1", Network::Mainnet, 1000);
        let metadata = SessionMetadata::new(session);

        assert_eq!(metadata.session.id, "session-1");
        assert_eq!(metadata.snapshot_count, 0);
        assert_eq!(metadata.checkpoint_count, 0);
        assert_eq!(metadata.tasks_completed, 0);
    }

    #[test]
    fn test_session_metadata_updates() {
        let session = Session::new("session-1", Network::Mainnet, 1000);
        let mut metadata = SessionMetadata::new(session);
        let initial_activity = metadata.last_activity;

        // Wait a tiny bit to ensure timestamp changes
        std::thread::sleep(std::time::Duration::from_millis(10));

        metadata.set_snapshot_count(5);
        assert_eq!(metadata.snapshot_count, 5);
        assert!(metadata.last_activity >= initial_activity);

        metadata.set_checkpoint_stats(2, 10000);
        assert_eq!(metadata.checkpoint_count, 2);
        assert_eq!(metadata.checkpoint_size_bytes, 10000);

        metadata.set_task_stats(3, 5);
        assert_eq!(metadata.tasks_completed, 3);
        assert_eq!(metadata.tasks_pending, 5);
    }

    #[test]
    fn test_registry_new() {
        let registry = SessionRegistry::new();
        assert!(registry.is_empty());
        assert_eq!(registry.len(), 0);
        assert!(registry.active_session_id.is_none());
    }

    #[test]
    fn test_registry_add_and_get() {
        let mut registry = SessionRegistry::new();
        let session = Session::new("session-1", Network::Mainnet, 1000);
        let metadata = SessionMetadata::new(session);
        registry.add(metadata);

        assert_eq!(registry.len(), 1);
        assert!(registry.get("session-1").is_some());
        assert!(registry.get("nonexistent").is_none());
        // Active session is automatically set when adding an active session
        assert_eq!(registry.active_session_id, Some("session-1".to_string()));
    }

    #[test]
    fn test_registry_remove() {
        let mut registry = SessionRegistry::new();
        let session = Session::new("session-1", Network::Mainnet, 1000);
        registry.add(SessionMetadata::new(session));

        let removed = registry.remove("session-1");
        assert!(removed.is_some());
        assert_eq!(removed.unwrap().session.id, "session-1");
        assert!(registry.is_empty());
        assert!(registry.active_session_id.is_none());
    }

    #[test]
    fn test_registry_get_by_status() {
        let mut registry = SessionRegistry::new();
        registry.add(SessionMetadata::new(
            Session::new("s1", Network::Mainnet, 1000).with_status(SessionStatus::Active),
        ));
        registry.add(SessionMetadata::new(
            Session::new("s2", Network::Mainnet, 1001).with_status(SessionStatus::Paused),
        ));
        registry.add(SessionMetadata::new(
            Session::new("s3", Network::Mainnet, 1002).with_status(SessionStatus::Active),
        ));

        let active = registry.get_by_status(SessionStatus::Active);
        assert_eq!(active.len(), 2);

        let paused = registry.get_by_status(SessionStatus::Paused);
        assert_eq!(paused.len(), 1);
    }

    #[test]
    fn test_registry_get_by_network() {
        let mut registry = SessionRegistry::new();
        registry.add(SessionMetadata::new(Session::new(
            "s1",
            Network::Mainnet,
            1000,
        )));
        registry.add(SessionMetadata::new(Session::new(
            "s2",
            Network::Base,
            1001,
        )));
        registry.add(SessionMetadata::new(Session::new(
            "s3",
            Network::Mainnet,
            1002,
        )));

        let mainnet = registry.get_by_network(&Network::Mainnet);
        assert_eq!(mainnet.len(), 2);

        let base = registry.get_by_network(&Network::Base);
        assert_eq!(base.len(), 1);
    }

    #[test]
    fn test_registry_active_session() {
        let mut registry = SessionRegistry::new();

        // Add a paused session - should not set active
        registry.add(SessionMetadata::new(
            Session::new("s1", Network::Mainnet, 1000).with_status(SessionStatus::Paused),
        ));
        assert!(registry.active_session_id.is_none());

        // Add an active session - should set active
        registry.add(SessionMetadata::new(Session::new(
            "s2",
            Network::Mainnet,
            1001,
        )));
        assert_eq!(registry.active_session_id, Some("s2".to_string()));

        // Get active
        let active = registry.get_active();
        assert!(active.is_some());
        assert_eq!(active.unwrap().session.id, "s2");

        // Manually set active
        registry.set_active(Some("s1"));
        assert_eq!(registry.active_session_id, Some("s1".to_string()));

        // Clear active
        registry.set_active(None);
        assert!(registry.active_session_id.is_none());
    }

    #[test]
    fn test_registry_clear() {
        let mut registry = SessionRegistry::new();
        registry.add(SessionMetadata::new(Session::new(
            "s1",
            Network::Mainnet,
            1000,
        )));
        registry.add(SessionMetadata::new(Session::new(
            "s2",
            Network::Base,
            1001,
        )));

        assert_eq!(registry.len(), 2);
        registry.clear();
        assert!(registry.is_empty());
        assert!(registry.active_session_id.is_none());
    }

    #[test]
    fn test_registry_serialize_deserialize() {
        let mut registry = SessionRegistry::new();
        registry.add(SessionMetadata::new(Session::new(
            "s1",
            Network::Mainnet,
            1000,
        )));
        registry.add(SessionMetadata::new(Session::new(
            "s2",
            Network::Base,
            1001,
        )));

        let json = serde_json::to_string(&registry).unwrap();
        let deserialized: SessionRegistry = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.len(), 2);
        assert!(deserialized.get("s1").is_some());
        assert!(deserialized.get("s2").is_some());
    }
}
