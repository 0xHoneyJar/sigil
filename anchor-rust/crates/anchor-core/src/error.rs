//! Error types for Anchor operations.

use thiserror::Error;

/// Primary error type for Anchor operations.
#[derive(Debug, Error)]
pub enum AnchorError {
    // IO errors
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),

    // RPC errors
    #[error("RPC error: {0}")]
    Rpc(String),

    // Fork errors
    #[error("Failed to spawn Anvil: {0}")]
    SpawnFailed(String),

    #[error("Missing RPC URL for network: {0}")]
    MissingRpcUrl(String),

    #[error("Unknown network: {0}")]
    UnknownNetwork(String),

    #[error("Fork not found: {0}")]
    ForkNotFound(String),

    // Session errors
    #[error("Session not found: {0}")]
    SessionNotFound(String),

    #[error("Session {0} cannot be resumed: status is {1}")]
    SessionNotResumable(String, String),

    #[error("Session {0} corrupted: missing required data")]
    SessionCorrupted(String),

    #[error("Invalid session state for {0}: {1}")]
    InvalidSessionState(String, String),

    // Task errors
    #[error("Task not found: {0}")]
    TaskNotFound(String),

    #[error("Task already exists: {0}")]
    TaskAlreadyExists(String),

    #[error("Dependency not found: {0}")]
    DependencyNotFound(String),

    #[error("Circular dependency detected involving: {0}")]
    CircularDependency(String),

    #[error("Task {0} has dependents: {1:?}")]
    TaskHasDependents(String, Vec<String>),

    // Serialization errors
    #[error("Serialization error: {0}")]
    SerializationError(String),

    #[error("IO error: {0}")]
    IoError(String),

    // Validation errors
    #[error("Invalid zone: {0}")]
    InvalidZone(String),

    #[error("Invalid effect type: {0}")]
    InvalidEffectType(String),

    #[error("Invalid sync strategy: {0}")]
    InvalidSyncStrategy(String),

    #[error("Invalid confirmation type: {0}")]
    InvalidConfirmationType(String),

    // Checkpoint errors
    #[error("Checkpoint not found: {0}")]
    CheckpointNotFound(String),

    #[error("State corruption detected")]
    StateCorruption,

    // Snapshot errors
    #[error("Snapshot not found: {0}")]
    SnapshotNotFound(String),

    #[error("Snapshot revert failed: {0}")]
    SnapshotRevertFailed(String),
}

impl AnchorError {
    /// Get the exit code for this error type.
    ///
    /// Exit codes follow the PRD specification:
    /// - 0: VALID/SUCCESS
    /// - 1: DRIFT (over-claiming physics)
    /// - 2: DECEPTIVE (under-claiming physics)
    /// - 3: VIOLATION (physics rule violation)
    /// - 4: REVERT (snapshot revert failed)
    /// - 5: CORRUPT (state corruption detected)
    /// - 6: SCHEMA (invalid input schema)
    pub fn exit_code(&self) -> i32 {
        match self {
            Self::Io(_) | Self::Json(_) => 6,         // SCHEMA
            Self::Rpc(_) | Self::SpawnFailed(_) => 4, // REVERT
            Self::SnapshotRevertFailed(_) => 4,       // REVERT
            Self::StateCorruption => 5,               // CORRUPT
            Self::InvalidZone(_)
            | Self::InvalidEffectType(_)
            | Self::InvalidSyncStrategy(_)
            | Self::InvalidConfirmationType(_) => 6, // SCHEMA
            _ => 1,                                   // General error
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_io_error_exit_code() {
        let err = AnchorError::Io(std::io::Error::new(std::io::ErrorKind::NotFound, "test"));
        assert_eq!(err.exit_code(), 6);
    }

    #[test]
    fn test_spawn_failed_exit_code() {
        let err = AnchorError::SpawnFailed("test".to_string());
        assert_eq!(err.exit_code(), 4);
    }

    #[test]
    fn test_state_corruption_exit_code() {
        let err = AnchorError::StateCorruption;
        assert_eq!(err.exit_code(), 5);
    }

    #[test]
    fn test_invalid_zone_exit_code() {
        let err = AnchorError::InvalidZone("test".to_string());
        assert_eq!(err.exit_code(), 6);
    }

    #[test]
    fn test_snapshot_revert_exit_code() {
        let err = AnchorError::SnapshotRevertFailed("test".to_string());
        assert_eq!(err.exit_code(), 4);
    }

    #[test]
    fn test_general_error_exit_code() {
        let err = AnchorError::ForkNotFound("test".to_string());
        assert_eq!(err.exit_code(), 1);
    }

    #[test]
    fn test_rpc_error_exit_code() {
        let err = AnchorError::Rpc("timeout".to_string());
        assert_eq!(err.exit_code(), 4);
    }

    #[test]
    fn test_error_display() {
        let err = AnchorError::InvalidZone("unknown".to_string());
        assert_eq!(err.to_string(), "Invalid zone: unknown");
    }
}
