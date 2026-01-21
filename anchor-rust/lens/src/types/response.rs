//! Response types for Lens CLI
//!
//! Defines the structure of responses returned by the Lens CLI.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::constraint_result::{ConstraintResult, ConstraintSummary};

/// Response from the verify command
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyResponse {
    /// The request ID this responds to
    pub request_id: String,

    /// Whether verification passed (no errors)
    pub passed: bool,

    /// Summary of constraint results
    pub summary: ConstraintSummary,

    /// Individual constraint results
    pub results: Vec<ConstraintResult>,

    /// Timestamp of verification
    pub verified_at: DateTime<Utc>,

    /// Version of the constraint set used
    #[serde(default)]
    pub constraint_version: Option<String>,
}

impl VerifyResponse {
    /// Create a new verify response
    pub fn new(request_id: String, results: Vec<ConstraintResult>) -> Self {
        let summary = ConstraintSummary::from_results(&results);
        let passed = summary.all_passed();

        Self {
            request_id,
            passed,
            summary,
            results,
            verified_at: Utc::now(),
            constraint_version: None,
        }
    }

    /// Set the constraint version
    pub fn with_version(mut self, version: String) -> Self {
        self.constraint_version = Some(version);
        self
    }

    /// Get only the failed results
    pub fn failures(&self) -> Vec<&ConstraintResult> {
        self.results.iter().filter(|r| !r.passed).collect()
    }

    /// Get only the error-level failures
    pub fn errors(&self) -> Vec<&ConstraintResult> {
        self.results.iter().filter(|r| r.is_error()).collect()
    }

    /// Get only the warning-level failures
    pub fn warnings(&self) -> Vec<&ConstraintResult> {
        self.results.iter().filter(|r| r.is_warning()).collect()
    }
}

/// Response from the lint command
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LintResponse {
    /// The request ID this responds to
    pub request_id: String,

    /// Whether linting passed (no errors)
    pub pass: bool,

    /// Individual constraint/heuristic results
    pub results: Vec<super::constraint_result::ConstraintResult>,

    /// Summary of results
    pub summary: VerifySummary,

    /// Component metrics from tree-sitter parsing (if code was provided)
    #[serde(default)]
    pub metrics: Option<crate::parser::ComponentMetrics>,

    /// Correction context for retry loop (if violations found)
    #[serde(default)]
    pub correction: Option<CorrectionContext>,
}

/// Summary of verification/lint results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifySummary {
    /// Total number of checks run
    pub total: usize,
    /// Number of checks that passed
    pub passed: usize,
    /// Number of checks that failed
    pub failed: usize,
    /// Number of error-level failures
    pub errors: usize,
    /// Number of warning-level failures
    pub warnings: usize,
}

/// Correction context for retry loop
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CorrectionContext {
    /// The violations found
    pub violations: Vec<Violation>,
    /// Suggested fixes
    pub fixes: Vec<Fix>,
    /// Current attempt number
    pub attempt: u32,
    /// Maximum attempts allowed
    pub max_attempts: u32,
    /// Original request for reference
    #[serde(default)]
    pub original_request: Option<serde_json::Value>,
}

/// A violation found during linting
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Violation {
    /// Constraint or rule ID
    pub constraint_id: String,
    /// The rule that was violated
    pub rule: String,
    /// Actual value
    pub actual: String,
    /// Expected value or range
    pub expected: String,
    /// Human-readable message
    pub message: String,
}

/// A suggested fix
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Fix {
    /// Target path (e.g., "behavioral.timing")
    pub target: String,
    /// Current value
    pub current_value: String,
    /// Required value to pass
    pub required_value: String,
    /// Reason for the fix
    pub reason: String,
}

/// Legacy lint response for backwards compatibility
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LegacyLintResponse {
    /// The request ID this responds to
    pub request_id: String,

    /// Whether linting passed (no errors)
    pub passed: bool,

    /// List of lint issues found
    pub issues: Vec<LintIssue>,

    /// Fixes that were applied (if auto_fix was true)
    #[serde(default)]
    pub fixes_applied: Vec<LintFix>,

    /// Timestamp of linting
    pub linted_at: DateTime<Utc>,
}

/// A lint issue found in the physics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LintIssue {
    /// Lint rule ID
    pub rule_id: String,

    /// Severity: "error", "warning", "info"
    pub severity: String,

    /// Human-readable message
    pub message: String,

    /// Path to the problematic value (e.g., "behavioral.timing")
    #[serde(default)]
    pub path: Option<String>,

    /// Current value
    #[serde(default)]
    pub current_value: Option<String>,

    /// Suggested value
    #[serde(default)]
    pub suggested_value: Option<String>,

    /// Whether this issue can be auto-fixed
    #[serde(default)]
    pub fixable: bool,
}

/// A fix that was applied during linting
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LintFix {
    /// The rule that triggered this fix
    pub rule_id: String,

    /// Path that was fixed
    pub path: String,

    /// Original value
    pub original_value: String,

    /// New value after fix
    pub new_value: String,
}

impl LegacyLintResponse {
    /// Create a new legacy lint response
    pub fn new(request_id: String, issues: Vec<LintIssue>) -> Self {
        let passed = !issues.iter().any(|i| i.severity == "error");

        Self {
            request_id,
            passed,
            issues,
            fixes_applied: Vec::new(),
            linted_at: Utc::now(),
        }
    }

    /// Add fixes that were applied
    pub fn with_fixes(mut self, fixes: Vec<LintFix>) -> Self {
        self.fixes_applied = fixes;
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::constraint::{ConstraintCategory, Severity};

    #[test]
    fn test_verify_response_new() {
        let results = vec![
            ConstraintResult::pass(
                "test-001".to_string(),
                "Test 1".to_string(),
                Severity::Error,
                ConstraintCategory::General,
                "true".to_string(),
            ),
            ConstraintResult::fail(
                "test-002".to_string(),
                "Test 2".to_string(),
                Severity::Warning,
                ConstraintCategory::General,
                "false".to_string(),
                "Warning message".to_string(),
            ),
        ];

        let response = VerifyResponse::new("req-001".to_string(), results);

        assert!(response.passed); // No errors, only warning
        assert_eq!(response.summary.total, 2);
        assert_eq!(response.summary.passed, 1);
        assert_eq!(response.summary.warnings, 1);
    }

    #[test]
    fn test_verify_response_failures() {
        let results = vec![
            ConstraintResult::pass(
                "pass".to_string(),
                "Pass".to_string(),
                Severity::Error,
                ConstraintCategory::General,
                "true".to_string(),
            ),
            ConstraintResult::fail(
                "fail".to_string(),
                "Fail".to_string(),
                Severity::Error,
                ConstraintCategory::General,
                "false".to_string(),
                "Error".to_string(),
            ),
        ];

        let response = VerifyResponse::new("req-001".to_string(), results);

        assert!(!response.passed);
        assert_eq!(response.failures().len(), 1);
        assert_eq!(response.errors().len(), 1);
    }

    #[test]
    fn test_legacy_lint_response_new() {
        let issues = vec![LintIssue {
            rule_id: "timing-hint".to_string(),
            severity: "warning".to_string(),
            message: "Consider using 800ms for financial".to_string(),
            path: Some("behavioral.timing".to_string()),
            current_value: Some("500".to_string()),
            suggested_value: Some("800".to_string()),
            fixable: true,
        }];

        let response = LegacyLintResponse::new("req-001".to_string(), issues);

        assert!(response.passed); // Warnings don't fail
        assert_eq!(response.issues.len(), 1);
    }

    #[test]
    fn test_verify_summary() {
        let summary = VerifySummary {
            total: 10,
            passed: 7,
            failed: 3,
            errors: 1,
            warnings: 2,
        };
        assert_eq!(summary.total, summary.passed + summary.failed);
    }
}
