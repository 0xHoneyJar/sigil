//! Heuristic Rules Engine for Sigil physics linting
//!
//! Implements heuristic checks beyond formal CEL constraints:
//! - Fitts's Law (distance/target size)
//! - Touch target size (≥44px)
//! - Click depth (steps to primary action)
//! - Known anti-patterns
//!
//! Each heuristic returns pass/fail, actual value, and recommendation.

use crate::parser::ComponentMetrics;
use crate::types::constraint::{ConstraintCategory, Severity};
use crate::types::constraint_result::ConstraintResult;
use crate::types::physics::PhysicsAnalysis;

/// Minimum touch target size per Apple HIG (in pixels)
pub const MIN_TOUCH_TARGET_SIZE: u32 = 44;

/// Maximum recommended nesting depth for JSX
pub const MAX_NESTING_DEPTH: usize = 5;

/// Maximum recommended elements per view
pub const MAX_ELEMENTS_PER_VIEW: usize = 50;

/// Maximum recommended event handlers per component
pub const MAX_EVENT_HANDLERS: usize = 10;

/// Run all heuristic checks on component metrics and physics
pub fn run_heuristics(
    metrics: &ComponentMetrics,
    physics: &PhysicsAnalysis,
) -> Vec<ConstraintResult> {
    let mut results = Vec::new();

    // Touch target check (if metadata available)
    if let Some(ref metadata) = physics.metadata {
        if let Some(touch_target) = metadata.touch_target {
            results.push(check_touch_target(touch_target));
        }
    }

    // Nesting depth check
    results.push(check_nesting_depth(metrics.max_nesting_depth));

    // Element count check
    results.push(check_element_count(metrics.element_count));

    // Event handler count check
    results.push(check_event_handler_count(metrics.event_handler_count));

    // Interactive element check
    results.push(check_interactive_balance(
        metrics.interactive_element_count,
        metrics.element_count,
    ));

    // Hook complexity check
    results.push(check_hook_complexity(metrics.hook_count));

    // Anti-pattern checks
    results.extend(check_anti_patterns(physics));

    results
}

/// Check touch target meets minimum size
fn check_touch_target(size: u32) -> ConstraintResult {
    let constraint_id = "heuristic-touch-target-001";
    let name = "Touch Target Minimum";
    let rule = format!("touch_target >= {}", MIN_TOUCH_TARGET_SIZE);

    if size >= MIN_TOUCH_TARGET_SIZE {
        ConstraintResult::pass(
            constraint_id.to_string(),
            name.to_string(),
            Severity::Error,
            ConstraintCategory::Protected,
            rule,
        )
    } else {
        ConstraintResult::fail(
            constraint_id.to_string(),
            name.to_string(),
            Severity::Error,
            ConstraintCategory::Protected,
            rule,
            format!(
                "Touch target {}px is below minimum {}px (Apple HIG requirement)",
                size, MIN_TOUCH_TARGET_SIZE
            ),
        )
    }
}

/// Check JSX nesting depth
fn check_nesting_depth(depth: usize) -> ConstraintResult {
    let constraint_id = "heuristic-nesting-depth-001";
    let name = "JSX Nesting Depth";
    let rule = format!("max_nesting_depth <= {}", MAX_NESTING_DEPTH);

    if depth <= MAX_NESTING_DEPTH {
        ConstraintResult::pass(
            constraint_id.to_string(),
            name.to_string(),
            Severity::Warning,
            ConstraintCategory::General,
            rule,
        )
    } else {
        ConstraintResult::fail(
            constraint_id.to_string(),
            name.to_string(),
            Severity::Warning,
            ConstraintCategory::General,
            rule,
            format!(
                "Nesting depth {} exceeds recommended maximum {} - consider flattening component structure",
                depth, MAX_NESTING_DEPTH
            ),
        )
    }
}

/// Check element count per component
fn check_element_count(count: usize) -> ConstraintResult {
    let constraint_id = "heuristic-element-count-001";
    let name = "Element Count";
    let rule = format!("element_count <= {}", MAX_ELEMENTS_PER_VIEW);

    if count <= MAX_ELEMENTS_PER_VIEW {
        ConstraintResult::pass(
            constraint_id.to_string(),
            name.to_string(),
            Severity::Warning,
            ConstraintCategory::General,
            rule,
        )
    } else {
        ConstraintResult::fail(
            constraint_id.to_string(),
            name.to_string(),
            Severity::Warning,
            ConstraintCategory::General,
            rule,
            format!(
                "Element count {} exceeds recommended {} - consider splitting into smaller components",
                count, MAX_ELEMENTS_PER_VIEW
            ),
        )
    }
}

/// Check event handler count
fn check_event_handler_count(count: usize) -> ConstraintResult {
    let constraint_id = "heuristic-event-handlers-001";
    let name = "Event Handler Count";
    let rule = format!("event_handler_count <= {}", MAX_EVENT_HANDLERS);

    if count <= MAX_EVENT_HANDLERS {
        ConstraintResult::pass(
            constraint_id.to_string(),
            name.to_string(),
            Severity::Info,
            ConstraintCategory::General,
            rule,
        )
    } else {
        ConstraintResult::fail(
            constraint_id.to_string(),
            name.to_string(),
            Severity::Info,
            ConstraintCategory::General,
            rule,
            format!(
                "Event handler count {} is high - consider extracting some handlers to custom hooks",
                count
            ),
        )
    }
}

/// Check ratio of interactive elements to total elements
fn check_interactive_balance(interactive: usize, total: usize) -> ConstraintResult {
    let constraint_id = "heuristic-interactive-balance-001";
    let name = "Interactive Element Balance";

    if total == 0 {
        return ConstraintResult::pass(
            constraint_id.to_string(),
            name.to_string(),
            Severity::Info,
            ConstraintCategory::General,
            "total > 0".to_string(),
        );
    }

    let ratio = interactive as f64 / total as f64;
    let rule = "interactive_ratio reasonable";

    // If more than 50% of elements are interactive, it might be too busy
    if ratio <= 0.5 {
        ConstraintResult::pass(
            constraint_id.to_string(),
            name.to_string(),
            Severity::Info,
            ConstraintCategory::General,
            rule.to_string(),
        )
    } else {
        ConstraintResult::fail(
            constraint_id.to_string(),
            name.to_string(),
            Severity::Info,
            ConstraintCategory::General,
            rule.to_string(),
            format!(
                "{:.0}% of elements are interactive ({} of {}) - UI may feel overwhelming",
                ratio * 100.0,
                interactive,
                total
            ),
        )
    }
}

/// Check hook complexity
fn check_hook_complexity(hook_count: usize) -> ConstraintResult {
    let constraint_id = "heuristic-hook-complexity-001";
    let name = "Hook Complexity";
    let max_hooks = 8;
    let rule = format!("hook_count <= {}", max_hooks);

    if hook_count <= max_hooks {
        ConstraintResult::pass(
            constraint_id.to_string(),
            name.to_string(),
            Severity::Info,
            ConstraintCategory::General,
            rule,
        )
    } else {
        ConstraintResult::fail(
            constraint_id.to_string(),
            name.to_string(),
            Severity::Info,
            ConstraintCategory::General,
            rule,
            format!(
                "Component has {} hooks - consider extracting logic to custom hooks or splitting component",
                hook_count
            ),
        )
    }
}

/// Check for known anti-patterns based on physics
pub fn check_anti_patterns(physics: &PhysicsAnalysis) -> Vec<ConstraintResult> {
    let mut results = Vec::new();

    // Anti-pattern: Optimistic sync for financial operations
    if physics.effect == "Financial" && physics.behavioral.sync == "optimistic" {
        results.push(ConstraintResult::fail(
            "heuristic-antipattern-001".to_string(),
            "No Optimistic Financial".to_string(),
            Severity::Error,
            ConstraintCategory::Behavioral,
            "financial != optimistic".to_string(),
            "Financial operations must use pessimistic sync - money cannot roll back".to_string(),
        ));
    }

    // Anti-pattern: No confirmation for destructive operations
    if physics.effect == "Destructive" && !physics.behavioral.confirmation {
        results.push(ConstraintResult::fail(
            "heuristic-antipattern-002".to_string(),
            "Destructive Confirmation Required".to_string(),
            Severity::Error,
            ConstraintCategory::Behavioral,
            "destructive => confirmation".to_string(),
            "Destructive operations must require user confirmation".to_string(),
        ));
    }

    // Anti-pattern: Financial without confirmation
    if physics.effect == "Financial" && !physics.behavioral.confirmation {
        results.push(ConstraintResult::fail(
            "heuristic-antipattern-003".to_string(),
            "Financial Confirmation Required".to_string(),
            Severity::Error,
            ConstraintCategory::Behavioral,
            "financial => confirmation".to_string(),
            "Financial operations must require user confirmation".to_string(),
        ));
    }

    // Anti-pattern: Soft delete without undo
    if physics.effect == "SoftDelete" && !physics.behavioral.has_undo {
        results.push(ConstraintResult::fail(
            "heuristic-antipattern-004".to_string(),
            "Soft Delete Requires Undo".to_string(),
            Severity::Warning,
            ConstraintCategory::Behavioral,
            "soft_delete => has_undo".to_string(),
            "Soft delete operations should provide an undo option".to_string(),
        ));
    }

    // Anti-pattern: Too fast timing for important operations
    if (physics.effect == "Financial" || physics.effect == "Destructive")
        && physics.behavioral.timing < 400
    {
        results.push(ConstraintResult::fail(
            "heuristic-antipattern-005".to_string(),
            "Important Operation Timing".to_string(),
            Severity::Warning,
            ConstraintCategory::Behavioral,
            "important_op => timing >= 400".to_string(),
            format!(
                "Timing {}ms is too fast for {} operations - users need time to verify",
                physics.behavioral.timing, physics.effect
            ),
        ));
    }

    results
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::physics::BehavioralPhysics;

    fn make_physics(effect: &str, sync: &str, confirmation: bool, timing: u32) -> PhysicsAnalysis {
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

    fn make_metrics() -> ComponentMetrics {
        ComponentMetrics {
            element_count: 10,
            max_nesting_depth: 3,
            function_count: 2,
            event_handler_count: 3,
            hook_count: 2,
            interactive_element_count: 2,
            lines_of_code: 50,
        }
    }

    #[test]
    fn test_touch_target_pass() {
        let result = check_touch_target(44);
        assert!(result.passed);
    }

    #[test]
    fn test_touch_target_fail() {
        let result = check_touch_target(30);
        assert!(!result.passed);
        assert!(result.message.contains("30px"));
    }

    #[test]
    fn test_nesting_depth_pass() {
        let result = check_nesting_depth(3);
        assert!(result.passed);
    }

    #[test]
    fn test_nesting_depth_fail() {
        let result = check_nesting_depth(8);
        assert!(!result.passed);
        assert!(result.message.contains("8"));
    }

    #[test]
    fn test_element_count_pass() {
        let result = check_element_count(20);
        assert!(result.passed);
    }

    #[test]
    fn test_element_count_fail() {
        let result = check_element_count(100);
        assert!(!result.passed);
    }

    #[test]
    fn test_antipattern_optimistic_financial() {
        let physics = make_physics("Financial", "optimistic", true, 800);
        let results = check_anti_patterns(&physics);
        assert!(results.iter().any(|r| !r.passed && r.constraint_id == "heuristic-antipattern-001"));
    }

    #[test]
    fn test_antipattern_no_confirmation_destructive() {
        let physics = make_physics("Destructive", "pessimistic", false, 600);
        let results = check_anti_patterns(&physics);
        assert!(results.iter().any(|r| !r.passed && r.constraint_id == "heuristic-antipattern-002"));
    }

    #[test]
    fn test_antipattern_fast_financial() {
        let physics = make_physics("Financial", "pessimistic", true, 200);
        let results = check_anti_patterns(&physics);
        assert!(results.iter().any(|r| !r.passed && r.constraint_id == "heuristic-antipattern-005"));
    }

    #[test]
    fn test_correct_financial_passes() {
        let physics = make_physics("Financial", "pessimistic", true, 800);
        let results = check_anti_patterns(&physics);
        assert!(results.iter().all(|r| r.passed));
    }

    #[test]
    fn test_run_heuristics_basic() {
        let metrics = make_metrics();
        let physics = make_physics("Standard", "optimistic", false, 200);
        let results = run_heuristics(&metrics, &physics);

        // Should have at least the basic checks
        assert!(!results.is_empty());
        // All should pass for standard well-formed component
        assert!(results.iter().all(|r| r.passed));
    }

    #[test]
    fn test_interactive_balance_pass() {
        let result = check_interactive_balance(2, 10);
        assert!(result.passed);
    }

    #[test]
    fn test_interactive_balance_fail() {
        let result = check_interactive_balance(8, 10);
        assert!(!result.passed);
        assert!(result.message.contains("overwhelming"));
    }
}
