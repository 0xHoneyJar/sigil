//! State command
//!
//! Queries on-chain state for a contract. Currently a stub that will be implemented
//! in Sprint 2 with alloy RPC integration.

use serde_json::json;
use tracing::{info, warn};

use crate::error::Result;
use crate::types::exit_code::ExitCode;

/// Run the state command (CLI entry point)
pub async fn run(address: &str, chain_id: u64) -> Result<ExitCode> {
    info!("Querying state for {} on chain {}", address, chain_id);

    // TODO: Implement with alloy in Sprint 2
    // For now, return a stub response

    warn!("State command not yet implemented - returning stub data");

    let stub_response = json!({
        "address": address,
        "chain_id": chain_id,
        "balance": "0",
        "code_size": 0,
        "note": "State queries will be implemented in Sprint 2 with alloy RPC integration"
    });

    println!("{}", serde_json::to_string_pretty(&stub_response)?);

    Ok(ExitCode::Valid)
}
