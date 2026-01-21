//! Shared IPC utilities for Sigil CLI tools
//!
//! This crate provides file-based request/response communication between
//! Sigil CLI tools (Anchor, Lens) and other components via the shared
//! `grimoires/pub/` directory.
//!
//! ## Key Features
//!
//! - CLI-prefixed response paths to prevent collision between tools
//! - Input validation for request IDs (UUID format, path traversal prevention)
//! - Advisory file locking for concurrent access
//! - Automatic cleanup of stale files
//!
//! ## Usage
//!
//! ```rust,ignore
//! use sigil_ipc::{CliName, read_request, write_response};
//!
//! // Read a request (shared across all CLIs)
//! let request: MyRequest = read_request("request-uuid")?;
//!
//! // Write a response (CLI-prefixed to prevent collision)
//! write_response(CliName::Anchor, "request-uuid", &response)?;
//! // Creates: grimoires/pub/responses/anchor-request-uuid.json
//! ```

use std::fs::{self, File};
use std::io::{BufReader, BufWriter, Read, Write};
use std::path::{Path, PathBuf};
use std::time::{Duration, SystemTime};

use fs2::FileExt;
use serde::{de::DeserializeOwned, Serialize};
use uuid::Uuid;

mod error;
pub use error::{IpcError, Result};

/// Maximum request file size (1MB)
const MAX_REQUEST_SIZE: u64 = 1_048_576;

/// Base path for shared pub directory
const PUB_PATH: &str = "grimoires/pub";

/// Default TTL for request/response files (1 hour)
const DEFAULT_TTL_SECS: u64 = 3600;

/// CLI tool identifier for response path prefixing
///
/// This enum ensures that each CLI tool writes responses to unique files,
/// preventing collision when multiple tools process the same request ID.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum CliName {
    /// Anchor CLI (ground truth enforcement)
    Anchor,
    /// Lens CLI (formal verification and linting)
    Lens,
}

impl CliName {
    /// Get the lowercase prefix string for file naming
    pub fn as_prefix(&self) -> &'static str {
        match self {
            CliName::Anchor => "anchor",
            CliName::Lens => "lens",
        }
    }
}

impl std::fmt::Display for CliName {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_prefix())
    }
}

/// Validate that a request ID is safe (valid UUID, no path traversal)
pub fn validate_request_id(id: &str) -> Result<Uuid> {
    // Check for path traversal attempts
    if id.contains('/') || id.contains('\\') || id.contains("..") {
        return Err(IpcError::PathTraversal { id: id.to_string() });
    }

    // Must be valid UUID
    Uuid::parse_str(id).map_err(|e| IpcError::InvalidRequestId {
        id: id.to_string(),
        reason: e.to_string(),
    })
}

/// Get the path to a request file
///
/// Request paths are shared across all CLIs since requests come from the same source.
/// Path format: `grimoires/pub/requests/{request_id}.json`
pub fn request_path(request_id: &str) -> Result<PathBuf> {
    validate_request_id(request_id)?;
    Ok(PathBuf::from(PUB_PATH)
        .join("requests")
        .join(format!("{}.json", request_id)))
}

/// Get the path to a response file with CLI prefix
///
/// Response paths are prefixed with the CLI name to prevent collision.
/// Path format: `grimoires/pub/responses/{cli}-{request_id}.json`
///
/// # Examples
///
/// ```rust,ignore
/// let path = response_path(CliName::Anchor, "abc123-uuid")?;
/// // Returns: grimoires/pub/responses/anchor-abc123-uuid.json
///
/// let path = response_path(CliName::Lens, "abc123-uuid")?;
/// // Returns: grimoires/pub/responses/lens-abc123-uuid.json
/// ```
pub fn response_path(cli: CliName, request_id: &str) -> Result<PathBuf> {
    validate_request_id(request_id)?;
    Ok(PathBuf::from(PUB_PATH)
        .join("responses")
        .join(format!("{}-{}.json", cli.as_prefix(), request_id)))
}

/// Read a request from the pub/requests/ directory
pub fn read_request<T: DeserializeOwned>(request_id: &str) -> Result<T> {
    let path = request_path(request_id)?;

    // Check if file exists
    if !path.exists() {
        return Err(IpcError::RequestNotFound {
            path: path.display().to_string(),
        });
    }

    // Check file size
    let metadata = fs::metadata(&path)?;
    if metadata.len() > MAX_REQUEST_SIZE {
        return Err(IpcError::RequestTooLarge {
            size: metadata.len(),
            max_size: MAX_REQUEST_SIZE,
        });
    }

    // Read and parse
    let content = fs::read_to_string(&path)?;
    let request: T = serde_json::from_str(&content)?;

    Ok(request)
}

/// Write a response to the pub/responses/ directory with CLI prefix
pub fn write_response<T: Serialize>(cli: CliName, request_id: &str, response: &T) -> Result<()> {
    let path = response_path(cli, request_id)?;

    // Ensure directory exists
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }

    // Serialize and write
    let content = serde_json::to_string_pretty(response)?;
    fs::write(&path, content)?;

    Ok(())
}

/// Read a request with advisory locking (for concurrent access)
pub fn read_request_locked<T: DeserializeOwned>(request_id: &str) -> Result<T> {
    let path = request_path(request_id)?;

    // Check if file exists
    if !path.exists() {
        return Err(IpcError::RequestNotFound {
            path: path.display().to_string(),
        });
    }

    // Open file and acquire shared lock
    let file = File::open(&path)?;
    file.lock_shared()
        .map_err(|e| IpcError::LockFailed { source: e })?;

    // Check file size
    let metadata = file.metadata()?;
    if metadata.len() > MAX_REQUEST_SIZE {
        return Err(IpcError::RequestTooLarge {
            size: metadata.len(),
            max_size: MAX_REQUEST_SIZE,
        });
    }

    // Read and parse
    let mut content = String::new();
    let mut reader = BufReader::new(&file);
    reader.read_to_string(&mut content)?;
    let request: T = serde_json::from_str(&content)?;

    // Lock is released when file is dropped
    Ok(request)
}

/// Write a response with advisory locking (for concurrent access)
pub fn write_response_locked<T: Serialize>(
    cli: CliName,
    request_id: &str,
    response: &T,
) -> Result<()> {
    let path = response_path(cli, request_id)?;

    // Ensure directory exists
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }

    // Create/open file and acquire exclusive lock
    let file = File::create(&path)?;
    file.lock_exclusive()
        .map_err(|e| IpcError::LockFailed { source: e })?;

    // Write content
    let content = serde_json::to_string_pretty(response)?;
    let mut writer = BufWriter::new(&file);
    writer.write_all(content.as_bytes())?;
    writer.flush()?;

    // Lock is released when file is dropped
    Ok(())
}

/// Ensure the pub/ directory structure exists
pub fn ensure_pub_directory() -> Result<()> {
    let pub_path = Path::new(PUB_PATH);
    fs::create_dir_all(pub_path.join("requests"))?;
    fs::create_dir_all(pub_path.join("responses"))?;
    Ok(())
}

/// Initialize the pub directory with proper .gitignore
pub fn init_pub_directory() -> Result<()> {
    ensure_pub_directory()?;

    let gitignore_content = r#"# Transient request/response files (auto-cleaned after 1 hour)
requests/
responses/

# Keep these tracked files
!vocabulary.yaml
!zones.yaml
!constraints.yaml
"#;

    let gitignore_path = PathBuf::from(PUB_PATH).join(".gitignore");
    if !gitignore_path.exists() {
        fs::write(&gitignore_path, gitignore_content)?;
    }

    Ok(())
}

/// Write a file to the pub/ directory
pub fn write_pub_file(filename: &str, content: &str) -> Result<()> {
    let path = PathBuf::from(PUB_PATH).join(filename);

    // Ensure directory exists
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }

    fs::write(&path, content)?;
    Ok(())
}

/// Read a file from the pub/ directory
pub fn read_pub_file(filename: &str) -> Result<String> {
    let path = PathBuf::from(PUB_PATH).join(filename);
    let content = fs::read_to_string(&path)?;
    Ok(content)
}

/// Clean up stale request and response files older than TTL
pub fn cleanup_stale_files(ttl_secs: Option<u64>) -> Result<usize> {
    let ttl = Duration::from_secs(ttl_secs.unwrap_or(DEFAULT_TTL_SECS));
    let now = SystemTime::now();
    let mut cleaned = 0;

    // Clean requests
    let requests_dir = PathBuf::from(PUB_PATH).join("requests");
    if requests_dir.exists() {
        cleaned += cleanup_directory(&requests_dir, now, ttl)?;
    }

    // Clean responses
    let responses_dir = PathBuf::from(PUB_PATH).join("responses");
    if responses_dir.exists() {
        cleaned += cleanup_directory(&responses_dir, now, ttl)?;
    }

    Ok(cleaned)
}

/// Helper to clean up files in a directory older than TTL
fn cleanup_directory(dir: &Path, now: SystemTime, ttl: Duration) -> Result<usize> {
    let mut cleaned = 0;

    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();

        // Only process .json files
        if path.extension().map_or(true, |ext| ext != "json") {
            continue;
        }

        // Check file age
        if let Ok(metadata) = entry.metadata() {
            if let Ok(modified) = metadata.modified() {
                if let Ok(age) = now.duration_since(modified) {
                    if age > ttl {
                        // Try to remove the file
                        if fs::remove_file(&path).is_ok() {
                            cleaned += 1;
                        }
                    }
                }
            }
        }
    }

    Ok(cleaned)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_request_id_valid() {
        let id = "550e8400-e29b-41d4-a716-446655440000";
        assert!(validate_request_id(id).is_ok());
    }

    #[test]
    fn test_validate_request_id_path_traversal() {
        assert!(validate_request_id("../etc/passwd").is_err());
        assert!(validate_request_id("foo/bar").is_err());
        assert!(validate_request_id("foo\\bar").is_err());
    }

    #[test]
    fn test_validate_request_id_invalid_uuid() {
        assert!(validate_request_id("not-a-uuid").is_err());
        assert!(validate_request_id("").is_err());
    }

    #[test]
    fn test_request_path() {
        let id = "550e8400-e29b-41d4-a716-446655440000";
        let path = request_path(id).unwrap();
        assert!(path.to_string_lossy().contains("requests"));
        assert!(path.to_string_lossy().contains(&format!("{}.json", id)));
    }

    #[test]
    fn test_response_path_anchor() {
        let id = "550e8400-e29b-41d4-a716-446655440000";
        let path = response_path(CliName::Anchor, id).unwrap();
        assert!(path.to_string_lossy().contains("responses"));
        assert!(path
            .to_string_lossy()
            .contains(&format!("anchor-{}.json", id)));
    }

    #[test]
    fn test_response_path_lens() {
        let id = "550e8400-e29b-41d4-a716-446655440000";
        let path = response_path(CliName::Lens, id).unwrap();
        assert!(path.to_string_lossy().contains("responses"));
        assert!(path
            .to_string_lossy()
            .contains(&format!("lens-{}.json", id)));
    }

    #[test]
    fn test_cli_name_prefix() {
        assert_eq!(CliName::Anchor.as_prefix(), "anchor");
        assert_eq!(CliName::Lens.as_prefix(), "lens");
    }

    #[test]
    fn test_cli_name_display() {
        assert_eq!(format!("{}", CliName::Anchor), "anchor");
        assert_eq!(format!("{}", CliName::Lens), "lens");
    }

    #[test]
    fn test_response_paths_are_different() {
        let id = "550e8400-e29b-41d4-a716-446655440000";
        let anchor_path = response_path(CliName::Anchor, id).unwrap();
        let lens_path = response_path(CliName::Lens, id).unwrap();
        assert_ne!(anchor_path, lens_path);
    }
}
