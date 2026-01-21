//! Integration tests for Lens CLI
//!
//! End-to-end tests for verify and lint commands.

use sigil_lens_core::{
    types::{
        physics::{BehavioralPhysics, PhysicsAnalysis},
        request::LintRequest,
    },
    verify_constraints,
};

/// Helper to create physics analysis for testing
fn make_physics(effect: &str, sync: &str, timing: u32, confirmation: bool) -> PhysicsAnalysis {
    PhysicsAnalysis {
        effect: effect.to_string(),
        behavioral: BehavioralPhysics {
            sync: sync.to_string(),
            timing,
            confirmation,
            has_undo: effect == "SoftDelete",
        },
        animation: None,
        material: None,
        metadata: None,
    }
}

/// Helper to create lint request
fn make_lint_request(
    effect: &str,
    sync: &str,
    timing: u32,
    confirmation: bool,
    code: Option<&str>,
) -> LintRequest {
    LintRequest {
        request_id: "integration-test".to_string(),
        physics: make_physics(effect, sync, timing, confirmation),
        component_code: code.map(|s| s.to_string()),
        lint_rules: Vec::new(),
        auto_fix: false,
    }
}

// =============================================================================
// Verify Command Tests
// =============================================================================

mod verify {
    use super::*;

    #[test]
    fn test_verify_valid_financial_physics() {
        // Financial with correct physics should pass all constraints
        let physics = make_physics("Financial", "pessimistic", 800, true);
        let results = verify_constraints(&physics).expect("verify should succeed");

        // Check that all results passed
        let failures: Vec<_> = results.iter().filter(|r| !r.passed).collect();
        assert!(
            failures.is_empty(),
            "Valid financial physics should pass all constraints, but got failures: {:?}",
            failures
                .iter()
                .map(|r| &r.message)
                .collect::<Vec<_>>()
        );
    }

    #[test]
    fn test_verify_valid_standard_physics() {
        // Standard with optimistic sync should pass
        let physics = make_physics("Standard", "optimistic", 200, false);
        let results = verify_constraints(&physics).expect("verify should succeed");

        let failures: Vec<_> = results.iter().filter(|r| !r.passed).collect();
        assert!(
            failures.is_empty(),
            "Valid standard physics should pass, but got failures: {:?}",
            failures
                .iter()
                .map(|r| &r.message)
                .collect::<Vec<_>>()
        );
    }

    #[test]
    fn test_verify_valid_destructive_physics() {
        // Destructive with correct physics should pass
        let physics = make_physics("Destructive", "pessimistic", 600, true);
        let results = verify_constraints(&physics).expect("verify should succeed");

        let failures: Vec<_> = results.iter().filter(|r| !r.passed).collect();
        assert!(
            failures.is_empty(),
            "Valid destructive physics should pass, but got failures: {:?}",
            failures
                .iter()
                .map(|r| &r.message)
                .collect::<Vec<_>>()
        );
    }

    #[test]
    fn test_verify_invalid_financial_timing() {
        // Financial with timing below 800ms should fail
        let physics = make_physics("Financial", "pessimistic", 400, true);
        let results = verify_constraints(&physics).expect("verify should succeed");

        // Should have at least one failure related to timing
        let timing_failures: Vec<_> = results
            .iter()
            .filter(|r| !r.passed && r.constraint_id.contains("financial"))
            .collect();

        assert!(
            !timing_failures.is_empty(),
            "Financial with 400ms timing should fail financial constraints"
        );
    }

    #[test]
    fn test_verify_invalid_financial_sync() {
        // Financial with optimistic sync should fail
        let physics = make_physics("Financial", "optimistic", 800, true);
        let results = verify_constraints(&physics).expect("verify should succeed");

        // Should have failure related to sync
        let sync_failures: Vec<_> = results
            .iter()
            .filter(|r| !r.passed && r.constraint_id.contains("financial"))
            .collect();

        assert!(
            !sync_failures.is_empty(),
            "Financial with optimistic sync should fail financial constraints"
        );
    }

    #[test]
    fn test_verify_returns_all_constraint_results() {
        let physics = make_physics("Standard", "optimistic", 200, false);
        let results = verify_constraints(&physics).expect("verify should succeed");

        // Should have multiple constraint results
        assert!(
            !results.is_empty(),
            "Verify should return constraint results"
        );

        // Each result should have required fields
        for result in &results {
            assert!(!result.constraint_id.is_empty());
            assert!(!result.constraint_name.is_empty());
            assert!(!result.rule.is_empty());
        }
    }
}

// =============================================================================
// Lint Command Tests
// =============================================================================

mod lint {
    use super::*;
    use sigil_lens_core::commands::lint::lint;

    #[test]
    fn test_lint_wellformed_component_passes() {
        let code = r#"
function Button() {
    return <button onClick={() => {}}>Click me</button>
}
"#;
        let request = make_lint_request("Standard", "optimistic", 200, false, Some(code));
        let response = lint(&request).expect("lint should succeed");

        assert!(response.pass, "Well-formed standard component should pass");
        assert!(response.metrics.is_some(), "Should have parsed metrics");

        let metrics = response.metrics.unwrap();
        assert!(metrics.element_count >= 1);
        assert!(metrics.interactive_element_count >= 1);
    }

    #[test]
    fn test_lint_component_with_hooks() {
        let code = r#"
function Counter() {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log('count changed:', count);
    }, [count]);

    return (
        <div>
            <span>{count}</span>
            <button onClick={() => setCount(c => c + 1)}>
                Increment
            </button>
        </div>
    )
}
"#;
        let request = make_lint_request("Standard", "optimistic", 200, false, Some(code));
        let response = lint(&request).expect("lint should succeed");

        assert!(response.pass);
        let metrics = response.metrics.expect("Should have metrics");
        assert!(metrics.hook_count >= 2, "Should detect useState hooks");
    }

    #[test]
    fn test_lint_financial_with_violations() {
        // Financial with optimistic sync should fail and generate corrections
        let request = make_lint_request("Financial", "optimistic", 800, true, None);
        let response = lint(&request).expect("lint should succeed");

        assert!(!response.pass, "Financial with optimistic sync should fail");
        assert!(
            response.summary.errors > 0,
            "Should have error-level violations"
        );
        assert!(
            response.correction.is_some(),
            "Should have correction context"
        );

        let correction = response.correction.unwrap();
        assert!(!correction.violations.is_empty());
        assert!(!correction.fixes.is_empty());
    }

    #[test]
    fn test_lint_correction_context_structure() {
        // Test that correction context has proper structure
        let request = make_lint_request("Financial", "optimistic", 400, false, None);
        let response = lint(&request).expect("lint should succeed");

        assert!(!response.pass);

        let correction = response
            .correction
            .expect("Should have correction context");

        // Check structure
        assert!(correction.attempt >= 1);
        assert!(correction.max_attempts >= 1);

        // Violations should have proper structure
        for violation in &correction.violations {
            assert!(!violation.constraint_id.is_empty());
            assert!(!violation.rule.is_empty());
            assert!(!violation.message.is_empty());
        }

        // Fixes should have proper structure
        for fix in &correction.fixes {
            assert!(!fix.target.is_empty());
            assert!(!fix.reason.is_empty());
        }
    }

    #[test]
    fn test_lint_without_code() {
        // Lint without code should still run anti-pattern checks
        let request = make_lint_request("Financial", "pessimistic", 800, true, None);
        let response = lint(&request).expect("lint should succeed");

        // Should pass with correct physics
        assert!(response.pass);
        assert!(response.metrics.is_none(), "No code = no metrics");
    }

    #[test]
    fn test_lint_summary_structure() {
        let request = make_lint_request("Standard", "optimistic", 200, false, None);
        let response = lint(&request).expect("lint should succeed");

        // Summary should be consistent
        assert_eq!(
            response.summary.total,
            response.results.len(),
            "Total should match results length"
        );
        assert_eq!(
            response.summary.passed + response.summary.failed,
            response.summary.total,
            "Passed + failed should equal total"
        );
    }

    #[test]
    fn test_lint_complex_nested_component() {
        let code = r#"
function ComplexForm() {
    return (
        <form>
            <div className="form-group">
                <label>Email</label>
                <input type="email" />
            </div>
            <div className="form-group">
                <label>Password</label>
                <input type="password" />
            </div>
            <div className="actions">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
    )
}
"#;
        let request = make_lint_request("Standard", "optimistic", 200, false, Some(code));
        let response = lint(&request).expect("lint should succeed");

        let metrics = response.metrics.expect("Should have metrics");
        assert!(metrics.element_count >= 8, "Should count all JSX elements");
        assert!(
            metrics.interactive_element_count >= 4,
            "Should count form, inputs, buttons"
        );
        assert!(metrics.max_nesting_depth >= 2, "Should detect nesting");
    }
}

// =============================================================================
// Physics Validation Tests
// =============================================================================

mod physics_validation {
    use super::*;
    use sigil_lens_core::commands::lint::lint;

    #[test]
    fn test_soft_delete_requires_undo() {
        // SoftDelete without undo should warn/fail
        let mut physics = make_physics("SoftDelete", "optimistic", 200, false);
        physics.behavioral.has_undo = false;

        let request = LintRequest {
            request_id: "test".to_string(),
            physics,
            component_code: None,
            lint_rules: Vec::new(),
            auto_fix: false,
        };

        let response = lint(&request).expect("lint should succeed");

        // Should have violation about missing undo
        let undo_violations: Vec<_> = response
            .results
            .iter()
            .filter(|r| !r.passed && (r.message.contains("undo") || r.constraint_id.contains("undo")))
            .collect();

        assert!(
            !undo_violations.is_empty() || !response.pass,
            "SoftDelete without undo should have violations or fail"
        );
    }

    #[test]
    fn test_destructive_requires_confirmation() {
        // Destructive without confirmation should fail
        let physics = make_physics("Destructive", "pessimistic", 600, false);

        let request = LintRequest {
            request_id: "test".to_string(),
            physics,
            component_code: None,
            lint_rules: Vec::new(),
            auto_fix: false,
        };

        let response = lint(&request).expect("lint should succeed");

        // Should have violation about confirmation
        let confirm_violations: Vec<_> = response
            .results
            .iter()
            .filter(|r| {
                !r.passed
                    && (r.message.contains("confirmation")
                        || r.constraint_id.contains("confirmation"))
            })
            .collect();

        assert!(
            !confirm_violations.is_empty() || !response.pass,
            "Destructive without confirmation should have violations"
        );
    }

    #[test]
    fn test_local_state_immediate() {
        // Local state should work with immediate timing
        let physics = make_physics("Local", "immediate", 100, false);

        let request = LintRequest {
            request_id: "test".to_string(),
            physics,
            component_code: None,
            lint_rules: Vec::new(),
            auto_fix: false,
        };

        let response = lint(&request).expect("lint should succeed");

        // Local state with correct physics should pass
        assert!(
            response.pass,
            "Local state with immediate sync should pass: {:?}",
            response
                .results
                .iter()
                .filter(|r| !r.passed)
                .map(|r| &r.message)
                .collect::<Vec<_>>()
        );
    }

    #[test]
    fn test_navigation_timing() {
        // Navigation effect with 150ms timing should pass
        let physics = make_physics("Navigation", "immediate", 150, false);

        let request = LintRequest {
            request_id: "test".to_string(),
            physics,
            component_code: None,
            lint_rules: Vec::new(),
            auto_fix: false,
        };

        let response = lint(&request).expect("lint should succeed");

        assert!(
            response.pass,
            "Navigation with 150ms timing should pass"
        );
    }
}
