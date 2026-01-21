//! Request types for Anchor CLI
//!
//! Requests are written to `grimoires/pub/requests/{id}.json` by callers (e.g., Sigil).

use serde::{Deserialize, Serialize};

use crate::types::zone::Zone;

/// Request to validate zone assignment for a component
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidateZoneRequest {
    /// Request ID (UUID)
    pub id: String,
    /// Request type identifier
    #[serde(rename = "type")]
    pub request_type: String,
    /// Timestamp of request creation
    pub timestamp: String,
    /// Request payload
    pub payload: ValidateZonePayload,
}

/// Payload for zone validation request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidateZonePayload {
    /// Component name (e.g., "ClaimButton")
    pub component: String,
    /// Keywords detected in the component (e.g., ["claim", "button"])
    pub keywords: Vec<String>,
    /// Zone inferred by Sigil
    pub inferred_zone: Zone,
    /// Optional physics analysis from Sigil
    #[serde(default)]
    pub physics: Option<PhysicsAnalysis>,
}

/// Physics analysis from Sigil
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhysicsAnalysis {
    /// Detected effect type
    pub effect: String,
    /// Behavioral physics
    pub behavioral: BehavioralPhysics,
}

/// Behavioral physics configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralPhysics {
    /// Sync strategy
    pub sync: String,
    /// Timing in milliseconds
    pub timing: u32,
    /// Whether confirmation is required
    pub confirmation: bool,
}

/// Request to check data source appropriateness
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckSourceRequest {
    /// Request ID (UUID)
    pub id: String,
    /// Request type identifier
    #[serde(rename = "type")]
    pub request_type: String,
    /// Timestamp of request creation
    pub timestamp: String,
    /// Request payload
    pub payload: CheckSourcePayload,
}

/// Payload for data source check request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckSourcePayload {
    /// Type of data being accessed
    pub data_type: DataType,
    /// Current data source being used
    pub current_source: DataSource,
}

/// Types of data that can be accessed
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DataType {
    /// Account balance
    Balance,
    /// Transaction data (amounts, recipients)
    Transaction,
    /// Display-only data (names, descriptions)
    Display,
    /// Historical queries (past events, aggregations)
    Historical,
}

/// Data source types
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DataSource {
    /// On-chain RPC calls
    OnChain,
    /// Indexed data (Envio, The Graph, etc.)
    Indexed,
}

impl DataType {
    /// Check if this data type requires on-chain source
    pub fn requires_on_chain(&self) -> bool {
        matches!(self, DataType::Balance | DataType::Transaction)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_data_type_requires_on_chain() {
        assert!(DataType::Balance.requires_on_chain());
        assert!(DataType::Transaction.requires_on_chain());
        assert!(!DataType::Display.requires_on_chain());
        assert!(!DataType::Historical.requires_on_chain());
    }

    #[test]
    fn test_validate_request_serialization() {
        let request = ValidateZoneRequest {
            id: "abc123".to_string(),
            request_type: "validate_zone".to_string(),
            timestamp: "2026-01-20T12:00:00Z".to_string(),
            payload: ValidateZonePayload {
                component: "ClaimButton".to_string(),
                keywords: vec!["claim".to_string()],
                inferred_zone: Zone::Critical,
                physics: None,
            },
        };

        let json = serde_json::to_string_pretty(&request).unwrap();
        assert!(json.contains("ClaimButton"));
        assert!(json.contains("critical"));

        let parsed: ValidateZoneRequest = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed.payload.component, "ClaimButton");
    }
}
