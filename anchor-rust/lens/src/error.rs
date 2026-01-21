//! Error types for Lens CLI
//!
//! Provides comprehensive error handling for constraint verification and linting.

use thiserror::Error;
use tracing::error;

/// Result type alias for Lens operations
pub type Result<T> = std::result::Result<T, LensError>;

/// Lens error types
#[derive(Error, Debug)]
pub enum LensError {
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

    /// CEL compilation error
    #[error("CEL compilation error for constraint '{constraint_id}': {reason}")]
    CelCompilation { constraint_id: String, reason: String },

    /// CEL evaluation error
    #[error("CEL evaluation error for constraint '{constraint_id}': {reason}")]
    CelEvaluation { constraint_id: String, reason: String },

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

    /// Constraints file not found
    #[error("Constraints not found at: {path}")]
    ConstraintsNotFound { path: String },

    /// Configuration error
    #[error("Configuration error: {0}")]
    Config(String),

    /// Response write error
    #[error("Failed to write response '{request_id}': {reason}")]
    ResponseWrite { request_id: String, reason: String },

    /// Code parsing error
    #[error("Parse error: {reason}")]
    Parse { reason: String },
}

impl LensError {
    /// Log this error using tracing and return a user-friendly message
    pub fn log_and_format(&self) -> String {
        error!(error = %self, "Lens operation failed");
        self.user_message()
    }

    /// Get a user-friendly message (no internal details)
    pub fn user_message(&self) -> String {
        match self {
            LensError::Io(e) => match e.kind() {
                std::io::ErrorKind::NotFound => "File not found".to_string(),
                std::io::ErrorKind::PermissionDenied => "Permission denied".to_string(),
                _ => "File operation failed".to_string(),
            },
            LensError::Json(_) => "Invalid JSON format".to_string(),
            LensError::Yaml(_) => "Invalid YAML format".to_string(),
            LensError::CelCompilation { constraint_id, reason } => {
                format!("Constraint '{}' has invalid rule: {}", constraint_id, reason)
            }
            LensError::CelEvaluation { constraint_id, reason } => {
                format!("Failed to evaluate constraint '{}': {}", constraint_id, reason)
            }
            LensError::InvalidRequestId { id, .. } => {
                format!("Invalid request ID: {}", id)
            }
            LensError::RequestNotFound { path } => {
                format!("Request not found: {}", path)
            }
            LensError::RequestTooLarge { size, max_size } => {
                format!("Request too large ({} bytes, max {} bytes)", size, max_size)
            }
            LensError::PathTraversal { id } => {
                format!("Invalid request ID (path traversal): {}", id)
            }
            LensError::ConstraintsNotFound { path } => {
                format!("Constraints not found: {}", path)
            }
            LensError::Config(reason) => format!("Configuration error: {}", reason),
            LensError::ResponseWrite { request_id, reason } => {
                format!("Failed to write response for '{}': {}", request_id, reason)
            }
            LensError::Parse { reason } => format!("Code parse error: {}", reason),
            LensError::Ipc(e) => format!("IPC error: {}", e),
        }
    }

    /// Check if this error is recoverable (can retry)
    pub fn is_recoverable(&self) -> bool {
        matches!(self, LensError::Io(_))
    }

    /// Get an exit code suggestion for this error
    pub fn suggested_exit_code(&self) -> i32 {
        use sigil_anchor_core::ExitCode;
        match self {
            LensError::Io(_) | LensError::RequestNotFound { .. } => ExitCode::Revert as i32,
            LensError::Json(_) | LensError::Yaml(_) => ExitCode::Schema as i32,
            LensError::InvalidRequestId { .. }
            | LensError::RequestTooLarge { .. }
            | LensError::PathTraversal { .. } => ExitCode::Schema as i32,
            LensError::CelCompilation { .. } | LensError::CelEvaluation { .. } => {
                ExitCode::Revert as i32
            }
            LensError::ConstraintsNotFound { .. } => ExitCode::Revert as i32,
            LensError::Config(_) => ExitCode::Revert as i32,
            LensError::ResponseWrite { .. } => ExitCode::Revert as i32,
            LensError::Parse { .. } => ExitCode::Schema as i32,
            LensError::Ipc(_) => ExitCode::Revert as i32,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_user_message_io_not_found() {
        let err = LensError::Io(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "file not found",
        ));
        assert_eq!(err.user_message(), "File not found");
    }

    #[test]
    fn test_cel_compilation_error() {
        let err = LensError::CelCompilation {
            constraint_id: "timing-001".to_string(),
            reason: "syntax error".to_string(),
        };
        assert!(err.user_message().contains("timing-001"));
        assert!(err.user_message().contains("syntax error"));
    }

    #[test]
    fn test_is_recoverable() {
        assert!(LensError::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            "error"
        ))
        .is_recoverable());
        assert!(!LensError::Config("bad config".to_string()).is_recoverable());
    }
}
