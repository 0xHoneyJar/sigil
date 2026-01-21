//! Session lifecycle manager for development session orchestration.

use crate::error::AnchorError;
use crate::lifecycle::{CheckpointManager, ForkManager, SnapshotManager};
use crate::rpc::RpcClient;
use crate::types::{Network, Session, SessionMetadata, SessionRegistry, SessionStatus};
use std::path::PathBuf;
use tokio::fs;

/// Session lifecycle manager.
///
/// Coordinates ForkManager, SnapshotManager, and CheckpointManager
/// to provide a unified session abstraction.
#[derive(Debug)]
pub struct SessionManager {
    /// Fork manager for Anvil process management
    fork_manager: ForkManager,
    /// Base path for session data
    sessions_dir: PathBuf,
    /// Registry of all sessions
    registry: SessionRegistry,
    /// Path to the registry file
    registry_path: PathBuf,
}

impl SessionManager {
    /// Create a new session manager.
    pub fn new(base_path: impl Into<PathBuf>) -> Self {
        let base = base_path.into();
        let sessions_dir = base.join("sessions");
        let registry_path = base.join("sessions.json");
        let fork_registry_path = base.join("forks.json");

        Self {
            fork_manager: ForkManager::new(&fork_registry_path),
            sessions_dir,
            registry: SessionRegistry::new(),
            registry_path,
        }
    }

    /// Load the session registry and fork registry from disk.
    pub async fn load(&mut self) -> Result<(), AnchorError> {
        // Load session registry
        if self.registry_path.exists() {
            let contents = fs::read_to_string(&self.registry_path).await?;
            self.registry = serde_json::from_str(&contents)?;
        }

        // Load fork registry
        self.fork_manager.load_registry().await?;

        Ok(())
    }

    /// Save the session registry to disk.
    pub async fn save(&self) -> Result<(), AnchorError> {
        // Ensure parent directory exists
        if let Some(parent) = self.registry_path.parent() {
            fs::create_dir_all(parent).await?;
        }

        let contents = serde_json::to_string_pretty(&self.registry)?;
        fs::write(&self.registry_path, contents).await?;
        Ok(())
    }

    /// Get the session registry.
    pub fn registry(&self) -> &SessionRegistry {
        &self.registry
    }

    /// Get the fork manager.
    pub fn fork_manager(&self) -> &ForkManager {
        &self.fork_manager
    }

    /// Get the fork manager mutably.
    pub fn fork_manager_mut(&mut self) -> &mut ForkManager {
        &mut self.fork_manager
    }

    /// Get the session directory for a given session ID.
    pub fn session_dir(&self, session_id: &str) -> PathBuf {
        self.sessions_dir.join(session_id)
    }

    /// Create a new development session.
    ///
    /// This creates a fork of the specified network and initializes
    /// session state with an initial snapshot.
    pub async fn create(
        &mut self,
        network: Network,
        block: Option<u64>,
        description: Option<String>,
    ) -> Result<Session, AnchorError> {
        // Generate session ID
        let session_id = uuid::Uuid::new_v4().to_string();

        // Create session directory
        let session_dir = self.session_dir(&session_id);
        fs::create_dir_all(&session_dir).await?;

        // Create fork
        let fork = self
            .fork_manager
            .fork(network.clone(), block, None, Some(session_id.clone()))
            .await?;

        // Create session
        let mut session = Session::new(&session_id, network, fork.block_number);
        session = session.with_fork(&fork.id);
        if let Some(desc) = description {
            session = session.with_description(desc);
        }

        // Create initial snapshot
        let client = RpcClient::new(&fork.rpc_url);
        let snapshot_registry_path = session_dir.join("snapshots.json");
        let mut snapshot_manager = SnapshotManager::new(client, &fork.id, &snapshot_registry_path);

        snapshot_manager
            .create(
                Some(session_id.clone()),
                None,
                Some("Initial session state".to_string()),
            )
            .await?;

        // Create metadata and add to registry
        let mut metadata = SessionMetadata::new(session.clone());
        metadata.set_snapshot_count(1);
        self.registry.add(metadata);
        self.save().await?;

        // Save session metadata to session directory
        self.save_session_metadata(&session_id).await?;

        Ok(session)
    }

    /// Resume a paused session.
    ///
    /// Verifies the fork is running, restarts if necessary, and
    /// restores to the last snapshot or checkpoint.
    pub async fn resume(&mut self, session_id: &str) -> Result<Session, AnchorError> {
        // First, extract information we need without holding a mutable borrow
        let (can_resume, status_str, fork_id_opt, network, block_number) = {
            let metadata = self
                .registry
                .get(session_id)
                .ok_or_else(|| AnchorError::SessionNotFound(session_id.to_string()))?;

            (
                metadata.session.status.can_resume(),
                metadata.session.status.to_string(),
                metadata.session.fork_id.clone(),
                metadata.session.network.clone(),
                metadata.session.block_number,
            )
        };

        // Check if session can be resumed
        if !can_resume {
            return Err(AnchorError::SessionNotResumable(
                session_id.to_string(),
                status_str,
            ));
        }

        // Check if fork is still running
        let fork_id =
            fork_id_opt.ok_or_else(|| AnchorError::SessionCorrupted(session_id.to_string()))?;

        let fork = if let Some(fork) = self.fork_manager.get(&fork_id) {
            // Fork exists in registry, check if process is alive
            if self.fork_manager.is_running(&fork_id).await {
                fork.clone()
            } else {
                // Fork process died, need to restart
                let new_fork = self
                    .fork_manager
                    .fork(
                        network,
                        Some(block_number),
                        None,
                        Some(session_id.to_string()),
                    )
                    .await?;

                // Update session with new fork ID
                if let Some(metadata) = self.registry.get_mut(session_id) {
                    metadata.session.fork_id = Some(new_fork.id.clone());
                    metadata.touch();
                }

                new_fork
            }
        } else {
            // Fork not in registry, need to restart
            let new_fork = self
                .fork_manager
                .fork(
                    network,
                    Some(block_number),
                    None,
                    Some(session_id.to_string()),
                )
                .await?;

            // Update session with new fork ID
            if let Some(metadata) = self.registry.get_mut(session_id) {
                metadata.session.fork_id = Some(new_fork.id.clone());
                metadata.touch();
            }

            new_fork
        };

        // Try to restore from last checkpoint if available
        let session_dir = self.session_dir(session_id);
        let checkpoint_registry_path = session_dir.join("checkpoints.json");
        let checkpoints_dir = session_dir.join("checkpoints");

        if checkpoint_registry_path.exists() {
            let client = RpcClient::new(&fork.rpc_url);
            let mut checkpoint_manager = CheckpointManager::new(
                client,
                &fork.id,
                session_id,
                &checkpoint_registry_path,
                &checkpoints_dir,
            );

            if checkpoint_manager.load_registry().await.is_ok() {
                let checkpoints = checkpoint_manager.list();
                if let Some(latest) = checkpoints.last() {
                    let checkpoint_id = latest.id.clone();
                    // Try to restore from latest checkpoint
                    if checkpoint_manager.restore(&checkpoint_id).await.is_ok() {
                        tracing::info!(
                            "Restored session {} from checkpoint {}",
                            session_id,
                            checkpoint_id
                        );
                    }
                }
            }
        }

        // Update session state and get final session
        let session = {
            let metadata = self
                .registry
                .get_mut(session_id)
                .ok_or_else(|| AnchorError::SessionNotFound(session_id.to_string()))?;
            metadata.session.resume();
            metadata.touch();
            metadata.session.clone()
        };

        self.registry.set_active(Some(session_id));
        self.save().await?;

        Ok(session)
    }

    /// Pause a session.
    pub async fn pause(&mut self, session_id: &str) -> Result<(), AnchorError> {
        let metadata = self
            .registry
            .get_mut(session_id)
            .ok_or_else(|| AnchorError::SessionNotFound(session_id.to_string()))?;

        if !metadata.session.status.is_active() {
            return Err(AnchorError::InvalidSessionState(
                session_id.to_string(),
                "Session is not active".to_string(),
            ));
        }

        metadata.session.pause();
        metadata.touch();

        // Clear active session if this was the active one
        if self.registry.active_session_id.as_deref() == Some(session_id) {
            self.registry.set_active(None);
        }

        self.save().await
    }

    /// Complete a session successfully.
    pub async fn complete(&mut self, session_id: &str) -> Result<(), AnchorError> {
        let metadata = self
            .registry
            .get_mut(session_id)
            .ok_or_else(|| AnchorError::SessionNotFound(session_id.to_string()))?;

        metadata.session.complete();
        metadata.touch();

        // Kill the fork if running
        if let Some(ref fork_id) = metadata.session.fork_id {
            let _ = self.fork_manager.kill(fork_id).await;
        }

        // Clear active session if this was the active one
        if self.registry.active_session_id.as_deref() == Some(session_id) {
            self.registry.set_active(None);
        }

        self.save().await
    }

    /// Fail a session.
    pub async fn fail(&mut self, session_id: &str) -> Result<(), AnchorError> {
        let metadata = self
            .registry
            .get_mut(session_id)
            .ok_or_else(|| AnchorError::SessionNotFound(session_id.to_string()))?;

        metadata.session.fail();
        metadata.touch();

        // Kill the fork if running
        if let Some(ref fork_id) = metadata.session.fork_id {
            let _ = self.fork_manager.kill(fork_id).await;
        }

        // Clear active session if this was the active one
        if self.registry.active_session_id.as_deref() == Some(session_id) {
            self.registry.set_active(None);
        }

        self.save().await
    }

    /// Get session status with full details.
    pub async fn status(&self, session_id: &str) -> Result<SessionStatus, AnchorError> {
        let metadata = self
            .registry
            .get(session_id)
            .ok_or_else(|| AnchorError::SessionNotFound(session_id.to_string()))?;

        Ok(metadata.session.status)
    }

    /// Get full session metadata.
    pub fn get(&self, session_id: &str) -> Option<&SessionMetadata> {
        self.registry.get(session_id)
    }

    /// List all sessions.
    pub fn list(&self) -> &[SessionMetadata] {
        &self.registry.sessions
    }

    /// List sessions by status.
    pub fn list_by_status(&self, status: SessionStatus) -> Vec<&SessionMetadata> {
        self.registry.get_by_status(status)
    }

    /// Get the active session.
    pub fn get_active(&self) -> Option<&SessionMetadata> {
        self.registry.get_active()
    }

    /// Delete a session and all its data.
    pub async fn delete(&mut self, session_id: &str) -> Result<(), AnchorError> {
        let metadata = self
            .registry
            .remove(session_id)
            .ok_or_else(|| AnchorError::SessionNotFound(session_id.to_string()))?;

        // Kill the fork if running
        if let Some(ref fork_id) = metadata.session.fork_id {
            let _ = self.fork_manager.kill(fork_id).await;
        }

        // Remove session directory
        let session_dir = self.session_dir(session_id);
        if session_dir.exists() {
            fs::remove_dir_all(&session_dir).await?;
        }

        self.save().await
    }

    /// Create a snapshot manager for a session.
    pub fn snapshot_manager(&self, session_id: &str) -> Result<SnapshotManager, AnchorError> {
        let metadata = self
            .registry
            .get(session_id)
            .ok_or_else(|| AnchorError::SessionNotFound(session_id.to_string()))?;

        let fork_id = metadata
            .session
            .fork_id
            .as_ref()
            .ok_or_else(|| AnchorError::SessionCorrupted(session_id.to_string()))?;

        let fork = self
            .fork_manager
            .get(fork_id)
            .ok_or_else(|| AnchorError::ForkNotFound(fork_id.to_string()))?;

        let client = RpcClient::new(&fork.rpc_url);
        let session_dir = self.session_dir(session_id);
        let snapshot_registry_path = session_dir.join("snapshots.json");

        Ok(SnapshotManager::new(
            client,
            fork_id,
            snapshot_registry_path,
        ))
    }

    /// Create a checkpoint manager for a session.
    pub fn checkpoint_manager(&self, session_id: &str) -> Result<CheckpointManager, AnchorError> {
        let metadata = self
            .registry
            .get(session_id)
            .ok_or_else(|| AnchorError::SessionNotFound(session_id.to_string()))?;

        let fork_id = metadata
            .session
            .fork_id
            .as_ref()
            .ok_or_else(|| AnchorError::SessionCorrupted(session_id.to_string()))?;

        let fork = self
            .fork_manager
            .get(fork_id)
            .ok_or_else(|| AnchorError::ForkNotFound(fork_id.to_string()))?;

        let client = RpcClient::new(&fork.rpc_url);
        let session_dir = self.session_dir(session_id);
        let checkpoint_registry_path = session_dir.join("checkpoints.json");
        let checkpoints_dir = session_dir.join("checkpoints");

        Ok(CheckpointManager::new(
            client,
            fork_id,
            session_id,
            checkpoint_registry_path,
            checkpoints_dir,
        ))
    }

    /// Save session metadata to the session directory.
    async fn save_session_metadata(&self, session_id: &str) -> Result<(), AnchorError> {
        let metadata = self
            .registry
            .get(session_id)
            .ok_or_else(|| AnchorError::SessionNotFound(session_id.to_string()))?;

        let session_dir = self.session_dir(session_id);
        fs::create_dir_all(&session_dir).await?;

        let metadata_path = session_dir.join("metadata.json");
        let contents = serde_json::to_string_pretty(metadata)?;
        fs::write(metadata_path, contents).await?;

        Ok(())
    }

    /// Update snapshot count for a session.
    pub async fn update_snapshot_count(
        &mut self,
        session_id: &str,
        count: usize,
    ) -> Result<(), AnchorError> {
        let metadata = self
            .registry
            .get_mut(session_id)
            .ok_or_else(|| AnchorError::SessionNotFound(session_id.to_string()))?;

        metadata.set_snapshot_count(count);
        self.save().await
    }

    /// Update checkpoint stats for a session.
    pub async fn update_checkpoint_stats(
        &mut self,
        session_id: &str,
        count: usize,
        size_bytes: u64,
    ) -> Result<(), AnchorError> {
        let metadata = self
            .registry
            .get_mut(session_id)
            .ok_or_else(|| AnchorError::SessionNotFound(session_id.to_string()))?;

        metadata.set_checkpoint_stats(count, size_bytes);
        self.save().await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_session_manager_new() {
        let dir = tempdir().unwrap();
        let manager = SessionManager::new(dir.path());

        assert!(manager.registry().is_empty());
    }

    #[tokio::test]
    async fn test_load_save_registry() {
        let dir = tempdir().unwrap();
        let mut manager = SessionManager::new(dir.path());

        // Add a session manually
        let session = Session::new("session-1", Network::Mainnet, 1000);
        manager.registry.add(SessionMetadata::new(session));
        manager.save().await.unwrap();

        // Load into new manager
        let mut manager2 = SessionManager::new(dir.path());
        manager2.load().await.unwrap();

        assert_eq!(manager2.registry().len(), 1);
        assert!(manager2.get("session-1").is_some());
    }

    #[tokio::test]
    async fn test_load_nonexistent_registry() {
        let dir = tempdir().unwrap();
        let mut manager = SessionManager::new(dir.path());

        // Should not error on nonexistent file
        manager.load().await.unwrap();
        assert!(manager.registry().is_empty());
    }

    #[test]
    fn test_session_dir() {
        let dir = tempdir().unwrap();
        let manager = SessionManager::new(dir.path());

        let session_dir = manager.session_dir("session-123");
        assert!(session_dir.ends_with("sessions/session-123"));
    }

    #[test]
    fn test_list_by_status() {
        let dir = tempdir().unwrap();
        let mut manager = SessionManager::new(dir.path());

        manager.registry.add(SessionMetadata::new(
            Session::new("s1", Network::Mainnet, 1000).with_status(SessionStatus::Active),
        ));
        manager.registry.add(SessionMetadata::new(
            Session::new("s2", Network::Mainnet, 1001).with_status(SessionStatus::Paused),
        ));
        manager.registry.add(SessionMetadata::new(
            Session::new("s3", Network::Mainnet, 1002).with_status(SessionStatus::Active),
        ));

        let active = manager.list_by_status(SessionStatus::Active);
        assert_eq!(active.len(), 2);

        let paused = manager.list_by_status(SessionStatus::Paused);
        assert_eq!(paused.len(), 1);
    }

    #[test]
    fn test_get_active() {
        let dir = tempdir().unwrap();
        let mut manager = SessionManager::new(dir.path());

        // No active initially
        assert!(manager.get_active().is_none());

        // Add active session
        manager.registry.add(SessionMetadata::new(Session::new(
            "s1",
            Network::Mainnet,
            1000,
        )));
        assert!(manager.get_active().is_some());
        assert_eq!(manager.get_active().unwrap().session.id, "s1");
    }

    #[tokio::test]
    async fn test_pause_session() {
        let dir = tempdir().unwrap();
        let mut manager = SessionManager::new(dir.path());

        // Add active session
        manager.registry.add(SessionMetadata::new(Session::new(
            "s1",
            Network::Mainnet,
            1000,
        )));

        // Pause it
        manager.pause("s1").await.unwrap();

        let metadata = manager.get("s1").unwrap();
        assert_eq!(metadata.session.status, SessionStatus::Paused);
        assert!(manager.get_active().is_none());
    }

    #[tokio::test]
    async fn test_pause_nonexistent() {
        let dir = tempdir().unwrap();
        let mut manager = SessionManager::new(dir.path());

        let result = manager.pause("nonexistent").await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_complete_session() {
        let dir = tempdir().unwrap();
        let mut manager = SessionManager::new(dir.path());

        // Add active session
        manager.registry.add(SessionMetadata::new(Session::new(
            "s1",
            Network::Mainnet,
            1000,
        )));

        // Complete it
        manager.complete("s1").await.unwrap();

        let metadata = manager.get("s1").unwrap();
        assert_eq!(metadata.session.status, SessionStatus::Completed);
        assert!(manager.get_active().is_none());
    }

    #[tokio::test]
    async fn test_fail_session() {
        let dir = tempdir().unwrap();
        let mut manager = SessionManager::new(dir.path());

        // Add active session
        manager.registry.add(SessionMetadata::new(Session::new(
            "s1",
            Network::Mainnet,
            1000,
        )));

        // Fail it
        manager.fail("s1").await.unwrap();

        let metadata = manager.get("s1").unwrap();
        assert_eq!(metadata.session.status, SessionStatus::Failed);
    }

    #[tokio::test]
    async fn test_status() {
        let dir = tempdir().unwrap();
        let mut manager = SessionManager::new(dir.path());

        manager.registry.add(SessionMetadata::new(Session::new(
            "s1",
            Network::Mainnet,
            1000,
        )));

        let status = manager.status("s1").await.unwrap();
        assert_eq!(status, SessionStatus::Active);
    }

    #[tokio::test]
    async fn test_status_nonexistent() {
        let dir = tempdir().unwrap();
        let manager = SessionManager::new(dir.path());

        let result = manager.status("nonexistent").await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_delete_session() {
        let dir = tempdir().unwrap();
        let mut manager = SessionManager::new(dir.path());

        // Add session with directory
        let session_dir = manager.session_dir("s1");
        fs::create_dir_all(&session_dir).await.unwrap();
        fs::write(session_dir.join("test.txt"), "test")
            .await
            .unwrap();

        manager.registry.add(SessionMetadata::new(Session::new(
            "s1",
            Network::Mainnet,
            1000,
        )));

        // Delete it
        manager.delete("s1").await.unwrap();

        assert!(manager.get("s1").is_none());
        assert!(!session_dir.exists());
    }

    #[tokio::test]
    async fn test_update_snapshot_count() {
        let dir = tempdir().unwrap();
        let mut manager = SessionManager::new(dir.path());

        manager.registry.add(SessionMetadata::new(Session::new(
            "s1",
            Network::Mainnet,
            1000,
        )));

        manager.update_snapshot_count("s1", 5).await.unwrap();

        let metadata = manager.get("s1").unwrap();
        assert_eq!(metadata.snapshot_count, 5);
    }

    #[tokio::test]
    async fn test_update_checkpoint_stats() {
        let dir = tempdir().unwrap();
        let mut manager = SessionManager::new(dir.path());

        manager.registry.add(SessionMetadata::new(Session::new(
            "s1",
            Network::Mainnet,
            1000,
        )));

        manager
            .update_checkpoint_stats("s1", 3, 50000)
            .await
            .unwrap();

        let metadata = manager.get("s1").unwrap();
        assert_eq!(metadata.checkpoint_count, 3);
        assert_eq!(metadata.checkpoint_size_bytes, 50000);
    }
}
