//! Data source check command
//!
//! Validates that the data source (on-chain vs indexed) is appropriate for the data type.

use chrono::Utc;
use tracing::{debug, info, warn};

use crate::error::Result;
use crate::io;
use crate::types::exit_code::ExitCode;
use crate::types::request::{CheckSourcePayload, CheckSourceRequest, DataSource, DataType};
use crate::types::response::{CheckSourceResponse, CheckSourceResult};

/// Run the check-source command (CLI entry point)
pub async fn run(request_id: &str) -> Result<ExitCode> {
    info!("Checking data source for request: {}", request_id);

    // Read request from pub/requests/
    let request: CheckSourceRequest = io::read_request(request_id)?;
    debug!("Request payload: {:?}", request.payload);

    // Check
    let result = check(&request.payload)?;

    // Write response to pub/responses/
    let response = CheckSourceResponse {
        id: request.id.clone(),
        response_type: "check_source_response".to_string(),
        timestamp: Utc::now().to_rfc3339(),
        result: result.clone(),
    };

    io::write_response(request_id, &response)?;

    // Log result
    if result.appropriate {
        info!("Data source is appropriate: {:?}", result.recommended_source);
        Ok(ExitCode::Valid)
    } else {
        warn!(
            "Data source recommendation: use {:?} - {}",
            result.recommended_source, result.reason
        );
        Ok(ExitCode::Drift)
    }
}

/// Check data source appropriateness (library entry point)
pub fn check(payload: &CheckSourcePayload) -> Result<CheckSourceResult> {
    // Data physics rules from SDD:
    // - Transaction amounts → on-chain (must be accurate for tx)
    // - Balance → on-chain (users verify before tx)
    // - Button states → on-chain (prevents failed tx)
    // - Display values → indexed OK (acceptable staleness)
    // - Historical queries → indexed OK (optimized for aggregation)

    match payload.data_type {
        DataType::Balance | DataType::Transaction => {
            // Must be on-chain
            if payload.current_source == DataSource::OnChain {
                Ok(CheckSourceResult::appropriate(DataSource::OnChain))
            } else {
                Ok(CheckSourceResult::recommend(
                    DataSource::OnChain,
                    format!(
                        "{:?} data requires on-chain source for accuracy",
                        payload.data_type
                    ),
                ))
            }
        }
        DataType::Display => {
            // Indexed is fine
            Ok(CheckSourceResult::appropriate(payload.current_source))
        }
        DataType::Historical => {
            // Indexed is preferred
            if payload.current_source == DataSource::Indexed {
                Ok(CheckSourceResult::appropriate(DataSource::Indexed))
            } else {
                Ok(CheckSourceResult::recommend(
                    DataSource::Indexed,
                    "Historical queries are optimized for indexed data sources".to_string(),
                ))
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_payload(data_type: DataType, source: DataSource) -> CheckSourcePayload {
        CheckSourcePayload {
            data_type,
            current_source: source,
        }
    }

    #[test]
    fn test_balance_requires_on_chain() {
        let payload = make_payload(DataType::Balance, DataSource::Indexed);
        let result = check(&payload).unwrap();
        assert!(!result.appropriate);
        assert_eq!(result.recommended_source, DataSource::OnChain);
    }

    #[test]
    fn test_balance_on_chain_ok() {
        let payload = make_payload(DataType::Balance, DataSource::OnChain);
        let result = check(&payload).unwrap();
        assert!(result.appropriate);
    }

    #[test]
    fn test_transaction_requires_on_chain() {
        let payload = make_payload(DataType::Transaction, DataSource::Indexed);
        let result = check(&payload).unwrap();
        assert!(!result.appropriate);
        assert_eq!(result.recommended_source, DataSource::OnChain);
    }

    #[test]
    fn test_display_indexed_ok() {
        let payload = make_payload(DataType::Display, DataSource::Indexed);
        let result = check(&payload).unwrap();
        assert!(result.appropriate);
    }

    #[test]
    fn test_historical_prefers_indexed() {
        let payload = make_payload(DataType::Historical, DataSource::OnChain);
        let result = check(&payload).unwrap();
        assert!(!result.appropriate);
        assert_eq!(result.recommended_source, DataSource::Indexed);
    }
}
