//! Zone validation command
//!
//! Validates that a component's inferred zone matches the detected effect from keywords.

use chrono::Utc;
use tracing::{debug, info, warn};

use crate::error::Result;
use crate::io;
use crate::types::exit_code::ExitCode;
use crate::types::request::{ValidateZonePayload, ValidateZoneRequest};
use crate::types::response::{ValidateZoneResponse, ValidateZoneResult};
use crate::types::vocabulary::Vocabulary;
use crate::types::zone::Zone;

/// Run the validate command (CLI entry point)
pub async fn run(request_id: &str) -> Result<ExitCode> {
    info!("Validating zone for request: {}", request_id);

    // Read request from pub/requests/
    let request: ValidateZoneRequest = io::read_request(request_id)?;
    debug!("Request payload: {:?}", request.payload);

    // Validate
    let result = validate(&request.payload)?;

    // Write response to pub/responses/
    let response = ValidateZoneResponse {
        id: request.id.clone(),
        response_type: "validate_zone_response".to_string(),
        timestamp: Utc::now().to_rfc3339(),
        result: result.clone(),
    };

    io::write_response(request_id, &response)?;

    // Log result
    match result.exit_code {
        ExitCode::Valid => info!("Zone validation passed"),
        ExitCode::Drift => warn!("Zone drift detected: {:?}", result.warnings),
        _ => warn!("Zone violation: {:?}", result.warnings),
    }

    Ok(result.exit_code)
}

/// Validate zone assignment (library entry point)
pub fn validate(payload: &ValidateZonePayload) -> Result<ValidateZoneResult> {
    let vocabulary = Vocabulary::load()?;

    // Detect effect from keywords
    let detected = vocabulary.detect_effect(&payload.keywords);

    match detected {
        Some((effect_name, _effect)) => {
            let correct_zone = vocabulary.zone_for_effect(&effect_name);

            // Compare with inferred zone
            if payload.inferred_zone == correct_zone {
                // Perfect match
                Ok(ValidateZoneResult::valid())
            } else if payload.inferred_zone.is_at_least(&correct_zone) {
                // Inferred zone is MORE severe - acceptable but drift
                Ok(ValidateZoneResult::drift(
                    correct_zone,
                    format!(
                        "Inferred zone '{}' is more severe than detected '{}' for effect '{}'",
                        payload.inferred_zone, correct_zone, effect_name
                    ),
                ))
            } else {
                // Inferred zone is LESS severe - violation!
                Ok(ValidateZoneResult::violation(
                    correct_zone,
                    format!(
                        "Zone '{}' is too low for effect '{}'. Should be '{}'.",
                        payload.inferred_zone, effect_name, correct_zone
                    ),
                ))
            }
        }
        None => {
            // No effect detected - default to standard zone
            if payload.inferred_zone == Zone::Standard {
                Ok(ValidateZoneResult::valid())
            } else if payload.inferred_zone.severity() > Zone::Standard.severity() {
                // More severe than needed - drift warning
                Ok(ValidateZoneResult::drift(
                    Zone::Standard,
                    format!(
                        "No specific effect detected. Zone '{}' may be more restrictive than needed.",
                        payload.inferred_zone
                    ),
                ))
            } else {
                // Less severe - fine for local
                Ok(ValidateZoneResult::valid())
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_payload(component: &str, keywords: &[&str], zone: Zone) -> ValidateZonePayload {
        ValidateZonePayload {
            component: component.to_string(),
            keywords: keywords.iter().map(|s| s.to_string()).collect(),
            inferred_zone: zone,
            physics: None,
        }
    }

    #[test]
    fn test_validate_financial_correct() {
        let payload = make_payload("ClaimButton", &["claim", "button"], Zone::Critical);
        let result = validate(&payload).unwrap();
        assert!(result.validated);
        assert_eq!(result.exit_code, ExitCode::Valid);
    }

    #[test]
    fn test_validate_financial_wrong_zone() {
        let payload = make_payload("ClaimButton", &["claim", "button"], Zone::Standard);
        let result = validate(&payload).unwrap();
        assert!(!result.validated);
        assert_eq!(result.exit_code, ExitCode::Violation);
        assert_eq!(result.correct_zone, Some(Zone::Critical));
    }

    #[test]
    fn test_validate_standard_correct() {
        let payload = make_payload("SaveButton", &["save", "document"], Zone::Standard);
        let result = validate(&payload).unwrap();
        assert!(result.validated);
        assert_eq!(result.exit_code, ExitCode::Valid);
    }

    #[test]
    fn test_validate_overly_severe() {
        let payload = make_payload("LikeButton", &["like", "post"], Zone::Critical);
        let result = validate(&payload).unwrap();
        // Should be drift - overly severe is acceptable but noted
        assert!(result.validated);
        assert_eq!(result.exit_code, ExitCode::Drift);
    }
}
