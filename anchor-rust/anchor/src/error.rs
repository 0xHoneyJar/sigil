//! Error types for Anchor CLI
//!
//! Provides comprehensive error handling with user-friendly messages and
//! integration with tracing for debug logs.

use thiserror::Error;
use tracing::error;

/// Result type alias for Anchor operations
pub type Result<T> = std::result::Result<T, AnchorError>;

/// Anchor error types
#[derive(Error, Debug)]
pub enum AnchorError {
    /// I/O error (file read/write)
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),

    /// JSON serialization/deserialization error
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),

    /// YAML serialization/deserialization error
    #[error("YAML error: {0}")]
    Yaml(#[from] serde_yaml::Error),

    /// IPC error from sigil-ipc crate
    #[error("IPC error: {0}")]
    Ipc(#[from] sigil_ipc::IpcError),

    /// Invalid request ID (must be valid UUID)
    #[error("Invalid request ID '{id}': {reason}")]
    InvalidRequestId { id: String, reason: String },

    /// Request file not found
    #[error("Request not found: {path}")]
    RequestNotFound { path: String },

    /// Request file too large (max 1MB)
    #[error("Request too large: {size} bytes (max {max_size} bytes)")]
    RequestTooLarge { size: u64, max_size: u64 },

    /// Path traversal attempt detected
    #[error("Path traversal detected in request ID: {id}")]
    PathTraversal { id: String },

    /// Vocabulary file not found and no embedded default
    #[error("Vocabulary not found at: {path}")]
    VocabularyNotFound { path: String },

    /// Zone validation failed
    #[error("Zone validation failed for '{component}': {reason}")]
    ValidationFailed { component: String, reason: String },

    /// RPC error (for state queries)
    #[error("RPC error for chain {chain_id}: {reason}")]
    RpcWithContext {
        chain_id: u64,
        reason: String,
    },

    /// Generic RPC error
    #[error("RPC error: {0}")]
    Rpc(String),

    /// Configuration error
    #[error("Configuration error: {0}")]
    Config(String),

    /// Response write error
    #[error("Failed to write response '{request_id}': {reason}")]
    ResponseWrite { request_id: String, reason: String },
}

impl AnchorError {
    /// Log this error using tracing and return a user-friendly message
    pub fn log_and_format(&self) -> String {
        // Log the full error with debug context
        error!(error = %self, "Anchor operation failed");

        // Return user-friendly message
        self.user_message()
    }

    /// Get a user-friendly message (no internal details)
    pub fn user_message(&self) -> String {
        match self {
            AnchorError::Io(e) => match e.kind() {
                std::io::ErrorKind::NotFound => "File not found".to_string(),
                std::io::ErrorKind::PermissionDenied => "Permission denied".to_string(),
                _ => "File operation failed".to_string(),
            },
            AnchorError::Json(_) => "Invalid JSON format".to_string(),
            AnchorError::Yaml(_) => "Invalid YAML format".to_string(),
            AnchorError::InvalidRequestId { id, .. } => {
                format!("Invalid request ID: {}", id)
            }
            AnchorError::RequestNotFound { path } => {
                format!("Request not found: {}", path)
            }
            AnchorError::RequestTooLarge { size, max_size } => {
                format!(
                    "Request too large ({} bytes, max {} bytes)",
                    size, max_size
                )
            }
            AnchorError::PathTraversal { id } => {
                format!("Invalid request ID (path traversal): {}", id)
            }
            AnchorError::VocabularyNotFound { path } => {
                format!("Vocabulary not found: {}", path)
            }
            AnchorError::ValidationFailed { component, reason } => {
                format!("Validation failed for '{}': {}", component, reason)
            }
            AnchorError::RpcWithContext { chain_id, reason } => {
                format!("RPC error on chain {}: {}", chain_id, reason)
            }
            AnchorError::Rpc(reason) => format!("RPC error: {}", reason),
            AnchorError::Config(reason) => format!("Configuration error: {}", reason),
            AnchorError::ResponseWrite { request_id, reason } => {
                format!("Failed to write response for '{}': {}", request_id, reason)
            }
        }
    }

    /// Check if this error is recoverable (can retry)
    pub fn is_recoverable(&self) -> bool {
        matches!(
            self,
            AnchorError::Rpc(_)
                | AnchorError::RpcWithContext { .. }
                | AnchorError::Io(_)
        )
    }

    /// Get an exit code suggestion for this error
    pub fn suggested_exit_code(&self) -> i32 {
        use crate::types::exit_code::ExitCode;
        match self {
            AnchorError::Io(_) | AnchorError::RequestNotFound { .. } => ExitCode::Revert as i32,
            AnchorError::Json(_) | AnchorError::Yaml(_) => ExitCode::Schema as i32,
            AnchorError::InvalidRequestId { .. }
            | AnchorError::RequestTooLarge { .. }
            | AnchorError::PathTraversal { .. } => ExitCode::Schema as i32,
            AnchorError::VocabularyNotFound { .. } => ExitCode::Revert as i32,
            AnchorError::ValidationFailed { .. } => ExitCode::Violation as i32,
            AnchorError::Rpc(_) | AnchorError::RpcWithContext { .. } => ExitCode::Rpc as i32,
            AnchorError::Config(_) => ExitCode::Revert as i32,
            AnchorError::ResponseWrite { .. } => ExitCode::Revert as i32,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_user_message_io_not_found() {
        let err = AnchorError::Io(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "file not found",
        ));
        assert_eq!(err.user_message(), "File not found");
    }

    #[test]
    fn test_user_message_request_too_large() {
        let err = AnchorError::RequestTooLarge {
            size: 2_000_000,
            max_size: 1_000_000,
        };
        assert!(err.user_message().contains("2000000"));
        assert!(err.user_message().contains("1000000"));
    }

    #[test]
    fn test_is_recoverable() {
        assert!(AnchorError::Rpc("timeout".to_string()).is_recoverable());
        assert!(!AnchorError::Config("bad config".to_string()).is_recoverable());
    }

    #[test]
    fn test_suggested_exit_code() {
        assert_eq!(
            AnchorError::Rpc("error".to_string()).suggested_exit_code(),
            7
        );
        assert_eq!(
            AnchorError::ValidationFailed {
                component: "test".to_string(),
                reason: "error".to_string()
            }
            .suggested_exit_code(),
            3
        );
    }
}
