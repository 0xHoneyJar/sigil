//! Request types for Lens CLI
//!
//! Defines the structure of requests sent to the Lens CLI for verification.

use serde::{Deserialize, Serialize};

use super::physics::PhysicsAnalysis;

/// Request to verify physics against constraints
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyRequest {
    /// Unique request ID (UUID)
    pub request_id: String,

    /// The physics analysis to verify
    pub physics: PhysicsAnalysis,

    /// Optional list of constraint IDs to check (all if empty)
    #[serde(default)]
    pub constraint_ids: Vec<String>,

    /// Whether to include warnings in the response
    #[serde(default = "default_true")]
    pub include_warnings: bool,

    /// Whether to include info-level results
    #[serde(default)]
    pub include_info: bool,
}

fn default_true() -> bool {
    true
}

/// Request to lint physics (heuristic checks, not formal verification)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LintRequest {
    /// Unique request ID (UUID)
    pub request_id: String,

    /// The physics analysis to lint
    pub physics: PhysicsAnalysis,

    /// Optional component source code for tree-sitter parsing
    #[serde(default)]
    pub component_code: Option<String>,

    /// Specific lint rules to run (all if empty)
    #[serde(default)]
    pub lint_rules: Vec<String>,

    /// Whether to auto-fix issues where possible
    #[serde(default)]
    pub auto_fix: bool,
}

/// Request to load and validate constraints
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoadConstraintsRequest {
    /// Unique request ID (UUID)
    pub request_id: String,

    /// Path to constraints file (uses default if not provided)
    #[serde(default)]
    pub constraints_path: Option<String>,

    /// Whether to validate CEL expressions
    #[serde(default = "default_true")]
    pub validate_cel: bool,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_verify_request_deserialize() {
        let json = r#"{
            "request_id": "550e8400-e29b-41d4-a716-446655440000",
            "physics": {
                "effect": "Financial",
                "behavioral": {
                    "sync": "pessimistic",
                    "timing": 800,
                    "confirmation": true
                }
            }
        }"#;

        let request: VerifyRequest = serde_json::from_str(json).unwrap();
        assert_eq!(request.request_id, "550e8400-e29b-41d4-a716-446655440000");
        assert_eq!(request.physics.effect, "Financial");
        assert!(request.include_warnings); // default true
        assert!(!request.include_info); // default false
    }

    #[test]
    fn test_lint_request_deserialize() {
        let json = r#"{
            "request_id": "550e8400-e29b-41d4-a716-446655440000",
            "physics": {
                "effect": "Standard",
                "behavioral": {
                    "sync": "optimistic",
                    "timing": 200,
                    "confirmation": false
                }
            },
            "auto_fix": true
        }"#;

        let request: LintRequest = serde_json::from_str(json).unwrap();
        assert!(request.auto_fix);
    }
}
