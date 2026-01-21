//! Error types for sigil-ipc

use thiserror::Error;

/// Result type alias for IPC operations
pub type Result<T> = std::result::Result<T, IpcError>;

/// IPC error types
#[derive(Error, Debug)]
pub enum IpcError {
    /// Path traversal attempt detected in request ID
    #[error("path traversal detected in request id: {id}")]
    PathTraversal { id: String },

    /// Invalid request ID format (not a valid UUID)
    #[error("invalid request id '{id}': {reason}")]
    InvalidRequestId { id: String, reason: String },

    /// Request file not found
    #[error("request not found: {path}")]
    RequestNotFound { path: String },

    /// Request file too large
    #[error("request too large: {size} bytes (max: {max_size})")]
    RequestTooLarge { size: u64, max_size: u64 },

    /// File locking failed
    #[error("failed to acquire file lock: {source}")]
    LockFailed { source: std::io::Error },

    /// I/O error
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),

    /// JSON serialization/deserialization error
    #[error("json error: {0}")]
    Json(#[from] serde_json::Error),
}
