//! Error types for Anchor CLI

use thiserror::Error;

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

    /// Invalid request ID (must be valid UUID)
    #[error("Invalid request ID: {0}")]
    InvalidRequestId(String),

    /// Request file not found
    #[error("Request not found: {0}")]
    RequestNotFound(String),

    /// Request file too large (max 1MB)
    #[error("Request too large: {size} bytes (max 1MB)")]
    RequestTooLarge { size: u64 },

    /// Path traversal attempt detected
    #[error("Path traversal detected in request ID")]
    PathTraversal,

    /// Vocabulary file not found and no embedded default
    #[error("Vocabulary not found: {0}")]
    VocabularyNotFound(String),

    /// Zone validation failed
    #[error("Zone validation failed: {0}")]
    ValidationFailed(String),

    /// RPC error (for state queries)
    #[error("RPC error: {0}")]
    Rpc(String),

    /// Configuration error
    #[error("Configuration error: {0}")]
    Config(String),
}
