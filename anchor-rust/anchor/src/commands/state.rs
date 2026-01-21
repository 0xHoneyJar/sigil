//! State command
//!
//! Queries on-chain state for a contract using alloy RPC.

use std::env;
use std::str::FromStr;

use alloy::primitives::Address;
use alloy::providers::{Provider, ProviderBuilder};
use serde::{Deserialize, Serialize};
use serde_json::json;
use tracing::{debug, error, info};
use url::Url;

use crate::error::{AnchorError, Result};
use crate::types::exit_code::ExitCode;

/// Default RPC URLs by chain ID
fn default_rpc_url(chain_id: u64) -> Option<&'static str> {
    match chain_id {
        1 => Some("https://eth.llamarpc.com"),
        10 => Some("https://mainnet.optimism.io"),
        137 => Some("https://polygon-rpc.com"),
        42161 => Some("https://arb1.arbitrum.io/rpc"),
        8453 => Some("https://mainnet.base.org"),
        _ => None,
    }
}

/// Get RPC URL from environment or default
fn get_rpc_url(chain_id: u64) -> Result<String> {
    // Check environment variable first
    if let Ok(url) = env::var("RPC_URL") {
        return Ok(url);
    }

    // Check chain-specific environment variable
    let chain_env = format!("RPC_URL_{}", chain_id);
    if let Ok(url) = env::var(&chain_env) {
        return Ok(url);
    }

    // Fall back to default
    default_rpc_url(chain_id)
        .map(|s| s.to_string())
        .ok_or_else(|| {
            AnchorError::Config(format!(
                "No RPC URL configured for chain {}. Set RPC_URL or RPC_URL_{} environment variable",
                chain_id, chain_id
            ))
        })
}

/// State query result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StateResult {
    /// Contract address
    pub address: String,
    /// Chain ID
    pub chain_id: u64,
    /// Balance in wei (as string for precision)
    pub balance: String,
    /// Code size in bytes (0 = EOA)
    pub code_size: usize,
    /// Whether this is a contract (has code)
    pub is_contract: bool,
    /// RPC URL used (sanitized)
    pub rpc_url: String,
}

/// Run the state command (CLI entry point)
pub async fn run(address: &str, chain_id: u64) -> Result<ExitCode> {
    info!("Querying state for {} on chain {}", address, chain_id);

    match query_state(address, chain_id).await {
        Ok(result) => {
            println!("{}", serde_json::to_string_pretty(&result)?);
            Ok(ExitCode::Valid)
        }
        Err(e) => {
            error!("Failed to query state: {}", e);
            let error_response = json!({
                "error": e.to_string(),
                "address": address,
                "chain_id": chain_id
            });
            println!("{}", serde_json::to_string_pretty(&error_response)?);
            Ok(ExitCode::Rpc)
        }
    }
}

/// Query on-chain state for an address
pub async fn query_state(address: &str, chain_id: u64) -> Result<StateResult> {
    // Get RPC URL
    let rpc_url_str = get_rpc_url(chain_id)?;
    debug!("Using RPC URL: {}", rpc_url_str);

    // Validate URL format
    let _ = Url::parse(&rpc_url_str).map_err(|e| {
        AnchorError::Config(format!("Invalid RPC URL '{}': {}", rpc_url_str, e))
    })?;

    // Parse address
    let addr = Address::from_str(address).map_err(|e| {
        AnchorError::Rpc(format!("Invalid address '{}': {}", address, e))
    })?;

    // Create provider using connect (async)
    let provider = ProviderBuilder::new()
        .connect(&rpc_url_str)
        .await
        .map_err(|e| AnchorError::Rpc(format!("Failed to connect to RPC: {}", e)))?;

    // Query balance
    let balance = provider.get_balance(addr).await.map_err(|e| {
        AnchorError::Rpc(format!("Failed to get balance: {}", e))
    })?;

    // Query code
    let code = provider.get_code_at(addr).await.map_err(|e| {
        AnchorError::Rpc(format!("Failed to get code: {}", e))
    })?;

    let code_size = code.len();
    let is_contract = code_size > 0;

    // Sanitize RPC URL for output (hide API keys)
    let sanitized_url = sanitize_url(&rpc_url_str);

    Ok(StateResult {
        address: address.to_string(),
        chain_id,
        balance: balance.to_string(),
        code_size,
        is_contract,
        rpc_url: sanitized_url,
    })
}

/// Sanitize URL by removing API keys from query params
fn sanitize_url(url: &str) -> String {
    if let Ok(mut parsed) = Url::parse(url) {
        // Clear query parameters that might contain API keys
        parsed.set_query(None);
        parsed.to_string()
    } else {
        // If we can't parse, just show the host
        url.split('?').next().unwrap_or(url).to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_rpc_urls() {
        assert!(default_rpc_url(1).is_some());
        assert!(default_rpc_url(137).is_some());
        assert!(default_rpc_url(99999).is_none());
    }

    #[test]
    fn test_sanitize_url() {
        assert_eq!(
            sanitize_url("https://eth.example.com/v1?apikey=secret"),
            "https://eth.example.com/v1"
        );
        assert_eq!(
            sanitize_url("https://eth.example.com"),
            "https://eth.example.com/"
        );
    }

    #[test]
    fn test_get_rpc_url_default() {
        // Should get default for mainnet
        let result = get_rpc_url(1);
        assert!(result.is_ok());
        assert!(result.unwrap().contains("llama"));
    }

    #[test]
    fn test_get_rpc_url_unknown_chain() {
        let result = get_rpc_url(99999);
        assert!(result.is_err());
    }
}
