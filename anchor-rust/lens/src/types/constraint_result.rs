//! Constraint evaluation results
//!
//! Represents the outcome of evaluating a constraint against physics analysis.

use serde::{Deserialize, Serialize};

use super::constraint::{ConstraintCategory, Severity};

/// Result of evaluating a single constraint
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConstraintResult {
    /// ID of the constraint that was evaluated
    pub constraint_id: String,

    /// Name of the constraint
    pub constraint_name: String,

    /// Whether the constraint passed
    pub passed: bool,

    /// Severity of the constraint
    pub severity: Severity,

    /// Category of the constraint
    pub category: ConstraintCategory,

    /// Message explaining the result
    pub message: String,

    /// The CEL expression that was evaluated
    pub rule: String,

    /// Additional context about the evaluation
    #[serde(skip_serializing_if = "Option::is_none")]
    pub context: Option<String>,
}

impl ConstraintResult {
    /// Create a passing result
    pub fn pass(
        constraint_id: String,
        constraint_name: String,
        severity: Severity,
        category: ConstraintCategory,
        rule: String,
    ) -> Self {
        Self {
            constraint_id,
            constraint_name,
            passed: true,
            severity,
            category,
            message: "Constraint satisfied".to_string(),
            rule,
            context: None,
        }
    }

    /// Create a failing result
    pub fn fail(
        constraint_id: String,
        constraint_name: String,
        severity: Severity,
        category: ConstraintCategory,
        rule: String,
        message: String,
    ) -> Self {
        Self {
            constraint_id,
            constraint_name,
            passed: false,
            severity,
            category,
            message,
            rule,
            context: None,
        }
    }

    /// Add context to the result
    pub fn with_context(mut self, context: String) -> Self {
        self.context = Some(context);
        self
    }

    /// Check if this is an error-level failure
    pub fn is_error(&self) -> bool {
        !self.passed && self.severity == Severity::Error
    }

    /// Check if this is a warning-level failure
    pub fn is_warning(&self) -> bool {
        !self.passed && self.severity == Severity::Warning
    }
}

/// Summary of constraint evaluation results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConstraintSummary {
    /// Total number of constraints evaluated
    pub total: usize,

    /// Number of constraints that passed
    pub passed: usize,

    /// Number of constraints that failed
    pub failed: usize,

    /// Number of error-level failures
    pub errors: usize,

    /// Number of warning-level failures
    pub warnings: usize,

    /// Number of info-level failures
    pub infos: usize,
}

impl ConstraintSummary {
    /// Create a summary from a list of results
    pub fn from_results(results: &[ConstraintResult]) -> Self {
        let total = results.len();
        let passed = results.iter().filter(|r| r.passed).count();
        let failed = total - passed;

        let errors = results
            .iter()
            .filter(|r| !r.passed && r.severity == Severity::Error)
            .count();
        let warnings = results
            .iter()
            .filter(|r| !r.passed && r.severity == Severity::Warning)
            .count();
        let infos = results
            .iter()
            .filter(|r| !r.passed && r.severity == Severity::Info)
            .count();

        Self {
            total,
            passed,
            failed,
            errors,
            warnings,
            infos,
        }
    }

    /// Check if all constraints passed (no errors)
    pub fn all_passed(&self) -> bool {
        self.errors == 0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_constraint_result_pass() {
        let result = ConstraintResult::pass(
            "test-001".to_string(),
            "Test".to_string(),
            Severity::Error,
            ConstraintCategory::Behavioral,
            "true".to_string(),
        );

        assert!(result.passed);
        assert!(!result.is_error());
    }

    #[test]
    fn test_constraint_result_fail() {
        let result = ConstraintResult::fail(
            "test-001".to_string(),
            "Test".to_string(),
            Severity::Error,
            ConstraintCategory::Behavioral,
            "false".to_string(),
            "Test failed".to_string(),
        );

        assert!(!result.passed);
        assert!(result.is_error());
    }

    #[test]
    fn test_constraint_summary() {
        let results = vec![
            ConstraintResult::pass(
                "pass-1".to_string(),
                "Pass 1".to_string(),
                Severity::Error,
                ConstraintCategory::General,
                "true".to_string(),
            ),
            ConstraintResult::fail(
                "fail-1".to_string(),
                "Fail 1".to_string(),
                Severity::Error,
                ConstraintCategory::General,
                "false".to_string(),
                "Failed".to_string(),
            ),
            ConstraintResult::fail(
                "warn-1".to_string(),
                "Warn 1".to_string(),
                Severity::Warning,
                ConstraintCategory::General,
                "false".to_string(),
                "Warning".to_string(),
            ),
        ];

        let summary = ConstraintSummary::from_results(&results);

        assert_eq!(summary.total, 3);
        assert_eq!(summary.passed, 1);
        assert_eq!(summary.failed, 2);
        assert_eq!(summary.errors, 1);
        assert_eq!(summary.warnings, 1);
        assert!(!summary.all_passed());
    }
}
