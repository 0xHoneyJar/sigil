//! I/O utilities for reading requests and writing responses
//!
//! This module wraps the shared sigil-ipc crate with Lens-specific defaults.
//! All communication between constructs happens via the shared `grimoires/pub/` directory.

use serde::{de::DeserializeOwned, Serialize};
use sigil_ipc::CliName;

use crate::error::Result;

// Re-export types that may be used by consumers
pub use sigil_ipc::{
    cleanup_stale_files, ensure_pub_directory, init_pub_directory, read_pub_file, request_path,
    validate_request_id, write_pub_file,
};

/// Read a request from the pub/requests/ directory
pub fn read_request<T: DeserializeOwned>(request_id: &str) -> Result<T> {
    sigil_ipc::read_request(request_id).map_err(Into::into)
}

/// Write a response to the pub/responses/ directory with Lens CLI prefix
///
/// Response files are prefixed with "lens-" to prevent collision with other CLIs.
/// Path format: `grimoires/pub/responses/lens-{request_id}.json`
pub fn write_response<T: Serialize>(request_id: &str, response: &T) -> Result<()> {
    sigil_ipc::write_response(CliName::Lens, request_id, response).map_err(Into::into)
}

/// Read a request with advisory locking (for concurrent access)
pub fn read_request_locked<T: DeserializeOwned>(request_id: &str) -> Result<T> {
    sigil_ipc::read_request_locked(request_id).map_err(Into::into)
}

/// Write a response with advisory locking (for concurrent access)
pub fn write_response_locked<T: Serialize>(request_id: &str, response: &T) -> Result<()> {
    sigil_ipc::write_response_locked(CliName::Lens, request_id, response).map_err(Into::into)
}

/// Get the path to a response file with Lens CLI prefix
pub fn response_path(request_id: &str) -> Result<std::path::PathBuf> {
    sigil_ipc::response_path(CliName::Lens, request_id).map_err(Into::into)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_response_path_has_lens_prefix() {
        let id = "550e8400-e29b-41d4-a716-446655440000";
        let path = response_path(id).unwrap();
        assert!(path.to_string_lossy().contains("lens-"));
    }
}
