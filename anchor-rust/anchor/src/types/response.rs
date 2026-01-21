//! Response types for Anchor CLI
//!
//! Responses are written to `grimoires/pub/responses/{id}.json` after processing.

use serde::{Deserialize, Serialize};

use crate::types::exit_code::ExitCode;
use crate::types::request::DataSource;
use crate::types::zone::Zone;

/// Response for zone validation request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidateZoneResponse {
    /// Request ID (matches request)
    pub id: String,
    /// Response type identifier
    #[serde(rename = "type")]
    pub response_type: String,
    /// Timestamp of response creation
    pub timestamp: String,
    /// Validation result
    pub result: ValidateZoneResult,
}

/// Result of zone validation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidateZoneResult {
    /// Whether the zone assignment is valid
    pub validated: bool,
    /// Exit code for the validation
    pub exit_code: ExitCode,
    /// Correct zone (if different from inferred)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub correct_zone: Option<Zone>,
    /// Warnings (for drift or deceptive zones)
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub warnings: Vec<String>,
}

impl ValidateZoneResult {
    /// Create a successful validation result
    pub fn valid() -> Self {
        Self {
            validated: true,
            exit_code: ExitCode::Valid,
            correct_zone: None,
            warnings: vec![],
        }
    }

    /// Create a drift warning result
    pub fn drift(correct_zone: Zone, warning: impl Into<String>) -> Self {
        Self {
            validated: true,
            exit_code: ExitCode::Drift,
            correct_zone: Some(correct_zone),
            warnings: vec![warning.into()],
        }
    }

    /// Create a violation result
    pub fn violation(correct_zone: Zone, warning: impl Into<String>) -> Self {
        Self {
            validated: false,
            exit_code: ExitCode::Violation,
            correct_zone: Some(correct_zone),
            warnings: vec![warning.into()],
        }
    }
}

/// Response for data source check request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckSourceResponse {
    /// Request ID (matches request)
    pub id: String,
    /// Response type identifier
    #[serde(rename = "type")]
    pub response_type: String,
    /// Timestamp of response creation
    pub timestamp: String,
    /// Check result
    pub result: CheckSourceResult,
}

/// Result of data source check
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckSourceResult {
    /// Whether the current source is appropriate
    pub appropriate: bool,
    /// Recommended data source
    pub recommended_source: DataSource,
    /// Reason for recommendation
    pub reason: String,
}

impl CheckSourceResult {
    /// Create an appropriate result
    pub fn appropriate(source: DataSource) -> Self {
        Self {
            appropriate: true,
            recommended_source: source,
            reason: "Current data source is appropriate".to_string(),
        }
    }

    /// Create a recommendation to change source
    pub fn recommend(recommended: DataSource, reason: impl Into<String>) -> Self {
        Self {
            appropriate: false,
            recommended_source: recommended,
            reason: reason.into(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_result_valid() {
        let result = ValidateZoneResult::valid();
        assert!(result.validated);
        assert_eq!(result.exit_code, ExitCode::Valid);
        assert!(result.correct_zone.is_none());
    }

    #[test]
    fn test_validate_result_drift() {
        let result = ValidateZoneResult::drift(Zone::Critical, "Zone should be Critical");
        assert!(result.validated);
        assert_eq!(result.exit_code, ExitCode::Drift);
        assert_eq!(result.correct_zone, Some(Zone::Critical));
    }

    #[test]
    fn test_validate_result_violation() {
        let result = ValidateZoneResult::violation(Zone::Critical, "Must be Critical zone");
        assert!(!result.validated);
        assert_eq!(result.exit_code, ExitCode::Violation);
    }

    #[test]
    fn test_check_source_result() {
        let result = CheckSourceResult::recommend(
            DataSource::OnChain,
            "Transaction amounts require on-chain data",
        );
        assert!(!result.appropriate);
        assert_eq!(result.recommended_source, DataSource::OnChain);
    }
}
