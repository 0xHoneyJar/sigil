//! Integration tests for Anchor CLI
//!
//! These tests verify end-to-end functionality of all Anchor commands
//! using the library API (not spawning CLI processes).

use chrono::Utc;
use sigil_anchor_core::{
    check_data_source, load_vocabulary, validate_zone, CheckSourceRequest, ExitCode,
    ValidateZoneRequest, Zone,
};

mod validate_command {
    use super::*;
    use sigil_anchor_core::types::request::ValidateZonePayload;
    use uuid::Uuid;

    fn make_request(component: &str, keywords: &[&str], zone: Zone) -> ValidateZoneRequest {
        ValidateZoneRequest {
            id: Uuid::new_v4().to_string(),
            request_type: "validate_zone".to_string(),
            timestamp: Utc::now().to_rfc3339(),
            payload: ValidateZonePayload {
                component: component.to_string(),
                keywords: keywords.iter().map(|s| s.to_string()).collect(),
                inferred_zone: zone,
                physics: None,
            },
        }
    }

    #[test]
    fn test_validate_financial_component_critical_zone() {
        let request = make_request("ClaimButton", &["claim", "rewards"], Zone::Critical);
        let result = validate_zone(&request).unwrap();

        assert!(result.validated);
        assert_eq!(result.exit_code, ExitCode::Valid);
        assert!(result.warnings.is_empty());
    }

    #[test]
    fn test_validate_financial_component_standard_zone_violates() {
        let request = make_request("WithdrawButton", &["withdraw", "funds"], Zone::Standard);
        let result = validate_zone(&request).unwrap();

        assert!(!result.validated);
        assert_eq!(result.exit_code, ExitCode::Violation);
        assert_eq!(result.correct_zone, Some(Zone::Critical));
        assert!(!result.warnings.is_empty());
    }

    #[test]
    fn test_validate_destructive_component_critical_zone() {
        let request = make_request("DeleteAccountButton", &["delete", "account"], Zone::Critical);
        let result = validate_zone(&request).unwrap();

        // Destructive maps to Critical zone (same as financial)
        assert!(result.validated);
        assert_eq!(result.exit_code, ExitCode::Valid);
    }

    #[test]
    fn test_validate_standard_component_standard_zone() {
        let request = make_request("SaveButton", &["save", "document"], Zone::Standard);
        let result = validate_zone(&request).unwrap();

        assert!(result.validated);
        assert_eq!(result.exit_code, ExitCode::Valid);
    }

    #[test]
    fn test_validate_local_component_local_zone() {
        let request = make_request("ThemeToggle", &["toggle", "theme"], Zone::Local);
        let result = validate_zone(&request).unwrap();

        assert!(result.validated);
        assert_eq!(result.exit_code, ExitCode::Valid);
    }

    #[test]
    fn test_validate_overly_severe_zone_drifts() {
        // Using Critical zone for a Standard action
        let request = make_request("LikeButton", &["like", "post"], Zone::Critical);
        let result = validate_zone(&request).unwrap();

        // Should validate but with drift warning
        assert!(result.validated);
        assert_eq!(result.exit_code, ExitCode::Drift);
        assert!(!result.warnings.is_empty());
    }

    #[test]
    fn test_validate_multiple_financial_keywords() {
        let request =
            make_request("StakeAndClaimButton", &["stake", "claim", "rewards"], Zone::Critical);
        let result = validate_zone(&request).unwrap();

        assert!(result.validated);
        assert_eq!(result.exit_code, ExitCode::Valid);
    }
}

mod check_source_command {
    use super::*;
    use sigil_anchor_core::types::request::{CheckSourcePayload, DataSource, DataType};
    use uuid::Uuid;

    fn make_request(data_type: DataType, current_source: DataSource) -> CheckSourceRequest {
        CheckSourceRequest {
            id: Uuid::new_v4().to_string(),
            request_type: "check_source".to_string(),
            timestamp: Utc::now().to_rfc3339(),
            payload: CheckSourcePayload {
                data_type,
                current_source,
            },
        }
    }

    #[test]
    fn test_check_source_balance_requires_on_chain() {
        let request = make_request(DataType::Balance, DataSource::Indexed);
        let result = check_data_source(&request).unwrap();

        assert!(!result.appropriate);
        assert_eq!(result.recommended_source, DataSource::OnChain);
    }

    #[test]
    fn test_check_source_balance_on_chain_valid() {
        let request = make_request(DataType::Balance, DataSource::OnChain);
        let result = check_data_source(&request).unwrap();

        assert!(result.appropriate);
        assert_eq!(result.recommended_source, DataSource::OnChain);
    }

    #[test]
    fn test_check_source_transaction_requires_on_chain() {
        let request = make_request(DataType::Transaction, DataSource::Indexed);
        let result = check_data_source(&request).unwrap();

        assert!(!result.appropriate);
        assert_eq!(result.recommended_source, DataSource::OnChain);
    }

    #[test]
    fn test_check_source_display_indexed_ok() {
        let request = make_request(DataType::Display, DataSource::Indexed);
        let result = check_data_source(&request).unwrap();

        assert!(result.appropriate);
        assert_eq!(result.recommended_source, DataSource::Indexed);
    }

    #[test]
    fn test_check_source_historical_indexed_ok() {
        let request = make_request(DataType::Historical, DataSource::Indexed);
        let result = check_data_source(&request).unwrap();

        assert!(result.appropriate);
        assert_eq!(result.recommended_source, DataSource::Indexed);
    }

    #[test]
    fn test_check_source_display_on_chain_valid() {
        // On-chain is always valid, just not optimal for display
        let request = make_request(DataType::Display, DataSource::OnChain);
        let result = check_data_source(&request).unwrap();

        assert!(result.appropriate);
        assert_eq!(result.recommended_source, DataSource::OnChain);
    }
}

mod vocabulary_loading {
    use super::*;

    #[test]
    fn test_load_vocabulary_succeeds() {
        let vocab = load_vocabulary().unwrap();

        // Should have effects defined
        assert!(!vocab.effects.is_empty());

        // Should detect financial keywords (lowercase effect name)
        let detected = vocab.detect_effect(&["claim".to_string()]);
        assert!(detected.is_some());
        assert_eq!(detected.unwrap().0, "financial");
    }

    #[test]
    fn test_vocabulary_detects_all_effect_types() {
        let vocab = load_vocabulary().unwrap();

        // Financial
        assert!(vocab.detect_effect(&["claim".to_string()]).is_some());
        assert!(vocab.detect_effect(&["withdraw".to_string()]).is_some());
        assert!(vocab.detect_effect(&["deposit".to_string()]).is_some());

        // Destructive
        assert!(vocab.detect_effect(&["delete".to_string()]).is_some());
        assert!(vocab.detect_effect(&["remove".to_string()]).is_some());

        // Standard
        assert!(vocab.detect_effect(&["save".to_string()]).is_some());
        assert!(vocab.detect_effect(&["update".to_string()]).is_some());

        // Local
        assert!(vocab.detect_effect(&["toggle".to_string()]).is_some());
        assert!(vocab.detect_effect(&["expand".to_string()]).is_some());
    }

    #[test]
    fn test_vocabulary_zone_mapping() {
        let vocab = load_vocabulary().unwrap();

        // Effect names are lowercase
        assert_eq!(vocab.zone_for_effect("financial"), Zone::Critical);
        assert_eq!(vocab.zone_for_effect("destructive"), Zone::Critical);
        assert_eq!(vocab.zone_for_effect("soft_delete"), Zone::Elevated);
        assert_eq!(vocab.zone_for_effect("standard"), Zone::Standard);
        assert_eq!(vocab.zone_for_effect("local"), Zone::Local);
    }
}

mod exit_codes {
    use super::*;

    #[test]
    fn test_exit_code_values() {
        assert_eq!(ExitCode::Valid as i32, 0);
        assert_eq!(ExitCode::Drift as i32, 1);
        assert_eq!(ExitCode::Deceptive as i32, 2);
        assert_eq!(ExitCode::Violation as i32, 3);
        assert_eq!(ExitCode::Revert as i32, 4);
        assert_eq!(ExitCode::Corrupt as i32, 5);
        assert_eq!(ExitCode::Schema as i32, 6);
        assert_eq!(ExitCode::Rpc as i32, 7);
    }

    #[test]
    fn test_exit_code_error_classification() {
        assert!(!ExitCode::Valid.is_error());
        assert!(!ExitCode::Drift.is_error());
        assert!(ExitCode::Violation.is_error());
        assert!(ExitCode::Revert.is_error());
        assert!(ExitCode::Corrupt.is_error());
        assert!(ExitCode::Schema.is_error());
        assert!(ExitCode::Rpc.is_error());
    }

    #[test]
    fn test_exit_code_warning_classification() {
        assert!(!ExitCode::Valid.is_warning());
        assert!(ExitCode::Drift.is_warning());
        assert!(ExitCode::Deceptive.is_warning());
        assert!(!ExitCode::Violation.is_warning());
    }
}

mod zone_operations {
    use super::*;

    #[test]
    fn test_zone_severity_ordering() {
        assert!(Zone::Critical.severity() > Zone::Elevated.severity());
        assert!(Zone::Elevated.severity() > Zone::Standard.severity());
        assert!(Zone::Standard.severity() > Zone::Local.severity());
    }

    #[test]
    fn test_zone_is_at_least() {
        assert!(Zone::Critical.is_at_least(&Zone::Critical));
        assert!(Zone::Critical.is_at_least(&Zone::Elevated));
        assert!(Zone::Critical.is_at_least(&Zone::Standard));
        assert!(Zone::Critical.is_at_least(&Zone::Local));

        assert!(!Zone::Local.is_at_least(&Zone::Critical));
        assert!(!Zone::Standard.is_at_least(&Zone::Critical));
    }

    #[test]
    fn test_zone_requires_validation() {
        assert!(Zone::Critical.requires_validation());
        assert!(Zone::Elevated.requires_validation());
        assert!(!Zone::Standard.requires_validation());
        assert!(!Zone::Local.requires_validation());
    }
}

mod error_handling {
    use sigil_anchor_core::AnchorError;

    #[test]
    fn test_io_error_user_message() {
        let err = AnchorError::Io(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "file not found",
        ));
        assert_eq!(err.user_message(), "File not found");

        let err = AnchorError::Io(std::io::Error::new(
            std::io::ErrorKind::PermissionDenied,
            "permission denied",
        ));
        assert_eq!(err.user_message(), "Permission denied");
    }

    #[test]
    fn test_path_traversal_error() {
        let err = AnchorError::PathTraversal {
            id: "../etc/passwd".to_string(),
        };
        assert!(err.user_message().contains("path traversal"));
    }

    #[test]
    fn test_invalid_request_id_error() {
        let err = AnchorError::InvalidRequestId {
            id: "not-a-uuid".to_string(),
            reason: "invalid format".to_string(),
        };
        assert!(err.user_message().contains("not-a-uuid"));
    }

    #[test]
    fn test_request_too_large_error() {
        let err = AnchorError::RequestTooLarge {
            size: 2_000_000,
            max_size: 1_000_000,
        };
        let msg = err.user_message();
        assert!(msg.contains("2000000"));
        assert!(msg.contains("1000000"));
    }

    #[test]
    fn test_recoverable_errors() {
        assert!(AnchorError::Rpc("timeout".to_string()).is_recoverable());
        assert!(
            AnchorError::Io(std::io::Error::new(std::io::ErrorKind::Other, "error"))
                .is_recoverable()
        );
        assert!(!AnchorError::Config("bad config".to_string()).is_recoverable());
        assert!(
            !AnchorError::Json(serde_json::from_str::<()>("invalid").unwrap_err()).is_recoverable()
        );
    }
}
