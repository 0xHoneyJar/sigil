//! sigil-anchor-core - Library crate for Anchor functionality
//!
//! This crate provides the core logic for zone validation, data source checking,
//! and vocabulary management. It can be used as a library or via the CLI.
//!
//! # Example
//!
//! ```rust,ignore
//! use sigil_anchor_core::{validate_zone, types::ValidateZoneRequest};
//!
//! let request = ValidateZoneRequest {
//!     component: "ClaimButton".to_string(),
//!     keywords: vec!["claim".to_string()],
//!     inferred_zone: Zone::Critical,
//! };
//!
//! let result = validate_zone(&request)?;
//! ```

pub mod commands;
pub mod error;
pub mod io;
pub mod types;

// Re-export commonly used types
pub use error::{AnchorError, Result};
pub use types::{
    exit_code::ExitCode,
    request::{CheckSourceRequest, ValidateZoneRequest},
    response::{CheckSourceResult, ValidateZoneResult},
    vocabulary::Vocabulary,
    zone::Zone,
};

/// Validate zone assignment for a component
///
/// Returns a ValidateZoneResult with the validation outcome and appropriate exit code.
pub fn validate_zone(request: &ValidateZoneRequest) -> Result<ValidateZoneResult> {
    commands::validate::validate(&request.payload)
}

/// Check if a data source is appropriate for the given data type
///
/// Returns a CheckSourceResult with recommendation for on-chain vs indexed data.
pub fn check_data_source(request: &CheckSourceRequest) -> Result<CheckSourceResult> {
    commands::check_source::check(&request.payload)
}

/// Load vocabulary from the pub/ directory or use embedded defaults
pub fn load_vocabulary() -> Result<Vocabulary> {
    types::vocabulary::Vocabulary::load()
}
