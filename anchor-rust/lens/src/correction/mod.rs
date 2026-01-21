//! Correction Context Generation
//!
//! Builds structured correction context for retry loops when
//! linting finds violations that need fixing.

use crate::types::constraint::Severity;
use crate::types::constraint_result::ConstraintResult;
use crate::types::physics::PhysicsAnalysis;
use crate::types::response::{CorrectionContext, Fix, Violation};

/// Maximum retry attempts for correction loop
pub const DEFAULT_MAX_ATTEMPTS: u32 = 2;

/// Build correction context from failed constraint results
pub fn build_correction_context(
    results: &[ConstraintResult],
    physics: &PhysicsAnalysis,
    attempt: u32,
) -> Option<CorrectionContext> {
    // Only build context if there are errors
    let failed_results: Vec<&ConstraintResult> = results
        .iter()
        .filter(|r| !r.passed)
        .collect();

    if failed_results.is_empty() {
        return None;
    }

    // Build violations from failed results
    let violations: Vec<Violation> = failed_results
        .iter()
        .map(|r| build_violation(r))
        .collect();

    // Generate suggested fixes based on physics and violations
    let fixes = generate_fixes(&violations, physics);

    // Store original request for reference
    let original_request = serde_json::to_value(physics).ok();

    Some(CorrectionContext {
        violations,
        fixes,
        attempt,
        max_attempts: DEFAULT_MAX_ATTEMPTS,
        original_request,
    })
}

/// Build a violation from a constraint result
fn build_violation(result: &ConstraintResult) -> Violation {
    // Parse actual and expected from the message or rule
    let (actual, expected) = parse_violation_values(result);

    Violation {
        constraint_id: result.constraint_id.clone(),
        rule: result.rule.clone(),
        actual,
        expected,
        message: result.message.clone(),
    }
}

/// Parse actual and expected values from constraint result
fn parse_violation_values(result: &ConstraintResult) -> (String, String) {
    // Try to extract values from the message
    // Common patterns: "X is below Y", "X exceeds Y", "must be Y"
    let message = &result.message;

    // Try to find numbers in the message
    let numbers: Vec<&str> = message
        .split(|c: char| !c.is_ascii_digit())
        .filter(|s| !s.is_empty())
        .collect();

    if numbers.len() >= 2 {
        return (numbers[0].to_string(), numbers[1].to_string());
    }

    // Try to parse from rule
    if result.rule.contains(">=") {
        if let Some(threshold) = result.rule.split(">=").last() {
            return ("< threshold".to_string(), threshold.trim().to_string());
        }
    }

    if result.rule.contains("<=") {
        if let Some(threshold) = result.rule.split("<=").last() {
            return ("> threshold".to_string(), threshold.trim().to_string());
        }
    }

    if result.rule.contains("==") {
        if let Some(expected) = result.rule.split("==").last() {
            return ("different".to_string(), expected.trim().to_string());
        }
    }

    // Default: return message as actual, "see rule" as expected
    (message.clone(), format!("see rule: {}", result.rule))
}

/// Generate suggested fixes based on violations and physics
fn generate_fixes(violations: &[Violation], physics: &PhysicsAnalysis) -> Vec<Fix> {
    let mut fixes = Vec::new();

    for violation in violations {
        if let Some(fix) = generate_fix_for_violation(violation, physics) {
            fixes.push(fix);
        }
    }

    fixes
}

/// Generate a specific fix for a violation
fn generate_fix_for_violation(violation: &Violation, physics: &PhysicsAnalysis) -> Option<Fix> {
    let constraint_id = &violation.constraint_id;

    // Financial timing fix
    if constraint_id.contains("financial") && constraint_id.contains("timing") {
        return Some(Fix {
            target: "behavioral.timing".to_string(),
            current_value: physics.behavioral.timing.to_string(),
            required_value: "800".to_string(),
            reason: "Financial operations require minimum 800ms timing for user verification".to_string(),
        });
    }

    // Financial sync fix
    if constraint_id.contains("financial") && constraint_id.contains("sync") {
        return Some(Fix {
            target: "behavioral.sync".to_string(),
            current_value: physics.behavioral.sync.clone(),
            required_value: "pessimistic".to_string(),
            reason: "Financial operations must use pessimistic sync - money cannot roll back".to_string(),
        });
    }

    // Financial confirmation fix
    if constraint_id.contains("financial") && constraint_id.contains("confirmation") {
        return Some(Fix {
            target: "behavioral.confirmation".to_string(),
            current_value: physics.behavioral.confirmation.to_string(),
            required_value: "true".to_string(),
            reason: "Financial operations must require confirmation before execution".to_string(),
        });
    }

    // Destructive timing fix
    if constraint_id.contains("destructive") && constraint_id.contains("timing") {
        return Some(Fix {
            target: "behavioral.timing".to_string(),
            current_value: physics.behavioral.timing.to_string(),
            required_value: "600".to_string(),
            reason: "Destructive operations require minimum 600ms timing for deliberation".to_string(),
        });
    }

    // Destructive sync fix
    if constraint_id.contains("destructive") && constraint_id.contains("sync") {
        return Some(Fix {
            target: "behavioral.sync".to_string(),
            current_value: physics.behavioral.sync.clone(),
            required_value: "pessimistic".to_string(),
            reason: "Destructive operations must use pessimistic sync".to_string(),
        });
    }

    // Destructive confirmation fix
    if constraint_id.contains("destructive") && constraint_id.contains("confirmation") {
        return Some(Fix {
            target: "behavioral.confirmation".to_string(),
            current_value: physics.behavioral.confirmation.to_string(),
            required_value: "true".to_string(),
            reason: "Destructive operations must require confirmation".to_string(),
        });
    }

    // Soft delete undo fix
    if constraint_id.contains("softdelete") && constraint_id.contains("undo") {
        return Some(Fix {
            target: "behavioral.has_undo".to_string(),
            current_value: physics.behavioral.has_undo.to_string(),
            required_value: "true".to_string(),
            reason: "Soft delete operations must provide an undo option".to_string(),
        });
    }

    // Heuristic anti-pattern fixes
    if constraint_id.contains("antipattern") {
        if violation.message.contains("optimistic") && physics.effect == "Financial" {
            return Some(Fix {
                target: "behavioral.sync".to_string(),
                current_value: physics.behavioral.sync.clone(),
                required_value: "pessimistic".to_string(),
                reason: "Financial operations cannot use optimistic sync".to_string(),
            });
        }

        if violation.message.contains("timing") {
            let required = if physics.effect == "Financial" { "800" } else { "600" };
            return Some(Fix {
                target: "behavioral.timing".to_string(),
                current_value: physics.behavioral.timing.to_string(),
                required_value: required.to_string(),
                reason: format!("{} operations require minimum {}ms timing", physics.effect, required),
            });
        }

        if violation.message.contains("confirmation") {
            return Some(Fix {
                target: "behavioral.confirmation".to_string(),
                current_value: physics.behavioral.confirmation.to_string(),
                required_value: "true".to_string(),
                reason: format!("{} operations must require confirmation", physics.effect),
            });
        }
    }

    // Touch target fix
    if constraint_id.contains("touch-target") {
        return Some(Fix {
            target: "metadata.touch_target".to_string(),
            current_value: physics.metadata.as_ref()
                .and_then(|m| m.touch_target)
                .map_or("unset".to_string(), |t| t.to_string()),
            required_value: "44".to_string(),
            reason: "Touch targets must be at least 44px per Apple HIG".to_string(),
        });
    }

    // Nesting depth - no direct fix, just recommendation
    if constraint_id.contains("nesting") {
        return Some(Fix {
            target: "component_structure".to_string(),
            current_value: violation.actual.clone(),
            required_value: "≤5".to_string(),
            reason: "Consider flattening the component structure".to_string(),
        });
    }

    // Element count - no direct fix, just recommendation
    if constraint_id.contains("element-count") {
        return Some(Fix {
            target: "component_structure".to_string(),
            current_value: violation.actual.clone(),
            required_value: "≤50".to_string(),
            reason: "Consider splitting into smaller components".to_string(),
        });
    }

    None
}

/// Check if correction context should be generated (has error-level violations)
pub fn has_error_violations(results: &[ConstraintResult]) -> bool {
    results.iter().any(|r| !r.passed && r.severity == Severity::Error)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::physics::BehavioralPhysics;

    fn make_physics(effect: &str, sync: &str, timing: u32, confirmation: bool) -> PhysicsAnalysis {
        PhysicsAnalysis {
            effect: effect.to_string(),
            behavioral: BehavioralPhysics {
                sync: sync.to_string(),
                timing,
                confirmation,
                has_undo: false,
            },
            animation: None,
            material: None,
            metadata: None,
        }
    }

    fn make_failed_result(id: &str, message: &str) -> ConstraintResult {
        ConstraintResult {
            constraint_id: id.to_string(),
            constraint_name: "Test".to_string(),
            passed: false,
            severity: Severity::Error,
            category: crate::types::constraint::ConstraintCategory::Behavioral,
            rule: "test rule".to_string(),
            message: message.to_string(),
            context: None,
        }
    }

    #[test]
    fn test_build_correction_context_no_errors() {
        let results = vec![ConstraintResult {
            constraint_id: "test".to_string(),
            constraint_name: "Test".to_string(),
            passed: true,
            severity: Severity::Error,
            category: crate::types::constraint::ConstraintCategory::General,
            rule: "true".to_string(),
            message: "Passed".to_string(),
            context: None,
        }];
        let physics = make_physics("Standard", "optimistic", 200, false);

        let context = build_correction_context(&results, &physics, 1);
        assert!(context.is_none());
    }

    #[test]
    fn test_build_correction_context_with_errors() {
        let results = vec![make_failed_result(
            "financial-timing-001",
            "Timing 400ms is below minimum 800ms",
        )];
        let physics = make_physics("Financial", "pessimistic", 400, true);

        let context = build_correction_context(&results, &physics, 1).unwrap();
        assert_eq!(context.violations.len(), 1);
        assert_eq!(context.attempt, 1);
        assert_eq!(context.max_attempts, DEFAULT_MAX_ATTEMPTS);
    }

    #[test]
    fn test_generate_financial_timing_fix() {
        let violation = Violation {
            constraint_id: "financial-timing-001".to_string(),
            rule: "timing >= 800".to_string(),
            actual: "400".to_string(),
            expected: "800".to_string(),
            message: "Timing too low".to_string(),
        };
        let physics = make_physics("Financial", "pessimistic", 400, true);

        let fix = generate_fix_for_violation(&violation, &physics).unwrap();
        assert_eq!(fix.target, "behavioral.timing");
        assert_eq!(fix.required_value, "800");
    }

    #[test]
    fn test_generate_financial_sync_fix() {
        let violation = Violation {
            constraint_id: "financial-sync-001".to_string(),
            rule: "sync == pessimistic".to_string(),
            actual: "optimistic".to_string(),
            expected: "pessimistic".to_string(),
            message: "Must use pessimistic sync".to_string(),
        };
        let physics = make_physics("Financial", "optimistic", 800, true);

        let fix = generate_fix_for_violation(&violation, &physics).unwrap();
        assert_eq!(fix.target, "behavioral.sync");
        assert_eq!(fix.required_value, "pessimistic");
    }

    #[test]
    fn test_has_error_violations() {
        let results = vec![
            ConstraintResult {
                constraint_id: "warn".to_string(),
                constraint_name: "Warning".to_string(),
                passed: false,
                severity: Severity::Warning,
                category: crate::types::constraint::ConstraintCategory::General,
                rule: "test".to_string(),
                message: "Warning".to_string(),
                context: None,
            },
        ];
        assert!(!has_error_violations(&results));

        let results_with_error = vec![
            ConstraintResult {
                constraint_id: "err".to_string(),
                constraint_name: "Error".to_string(),
                passed: false,
                severity: Severity::Error,
                category: crate::types::constraint::ConstraintCategory::General,
                rule: "test".to_string(),
                message: "Error".to_string(),
                context: None,
            },
        ];
        assert!(has_error_violations(&results_with_error));
    }

    #[test]
    fn test_parse_violation_values_with_numbers() {
        let result = ConstraintResult {
            constraint_id: "test".to_string(),
            constraint_name: "Test".to_string(),
            passed: false,
            severity: Severity::Error,
            category: crate::types::constraint::ConstraintCategory::General,
            rule: "timing >= 800".to_string(),
            message: "Timing 400ms is below minimum 800ms".to_string(),
            context: None,
        };

        let (actual, expected) = parse_violation_values(&result);
        assert_eq!(actual, "400");
        assert_eq!(expected, "800");
    }
}
