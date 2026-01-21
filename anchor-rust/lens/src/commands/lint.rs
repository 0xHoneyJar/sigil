//! Lint command - comprehensive linting with heuristics + constraints
//!
//! Parses component code with tree-sitter, runs heuristic checks,
//! and evaluates formal CEL constraints.

use crate::cel::CelEngine;
use crate::correction::{build_correction_context, has_error_violations};
use crate::error::Result;
use crate::heuristics::run_heuristics;
use crate::parser::CodeParser;
use crate::types::constraint::Constraint;
use crate::types::constraint_result::ConstraintResult;
use crate::types::physics::PhysicsAnalysis;
use crate::types::request::LintRequest;
use crate::types::response::LintResponse;

/// Run comprehensive linting on a component
///
/// This combines:
/// 1. Tree-sitter parsing to extract component metrics
/// 2. Heuristic checks (touch targets, nesting depth, anti-patterns)
/// 3. Formal constraint verification via CEL
pub fn lint(request: &LintRequest) -> Result<LintResponse> {
    // Parse component code if provided
    let metrics = if let Some(ref code) = request.component_code {
        let mut parser = CodeParser::new()?;
        Some(parser.parse(code)?)
    } else {
        None
    };

    // Run heuristic checks
    let heuristic_results = if let Some(ref metrics) = metrics {
        run_heuristics(metrics, &request.physics)
    } else {
        // Run anti-pattern checks even without code
        crate::heuristics::check_anti_patterns(&request.physics)
    };

    // Run formal constraint verification
    let constraint_results = verify_physics(&request.physics)?;

    // Combine all results
    let mut all_results = Vec::new();
    all_results.extend(heuristic_results);
    all_results.extend(constraint_results);

    // Calculate summary
    let total = all_results.len();
    let passed = all_results.iter().filter(|r| r.passed).count();
    let failed = total - passed;

    let errors = all_results
        .iter()
        .filter(|r| !r.passed && r.severity == crate::Severity::Error)
        .count();

    let warnings = all_results
        .iter()
        .filter(|r| !r.passed && r.severity == crate::Severity::Warning)
        .count();

    // Determine overall pass/fail
    let overall_pass = errors == 0; // Pass if no errors (warnings are OK)

    // Build correction context if there are error-level violations
    let correction = if has_error_violations(&all_results) {
        build_correction_context(&all_results, &request.physics, 1)
    } else {
        None
    };

    Ok(LintResponse {
        request_id: request.request_id.clone(),
        pass: overall_pass,
        results: all_results,
        summary: crate::types::response::VerifySummary {
            total,
            passed,
            failed,
            errors,
            warnings,
        },
        metrics,
        correction,
    })
}

/// Verify physics against all enabled constraints
fn verify_physics(physics: &PhysicsAnalysis) -> Result<Vec<ConstraintResult>> {
    let constraints = Constraint::load_all()?;
    let engine = CelEngine::new()?;

    let mut results = Vec::new();
    for constraint in constraints.iter().filter(|c| c.enabled) {
        let result = engine.evaluate(constraint, physics)?;
        results.push(result);
    }

    Ok(results)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::physics::BehavioralPhysics;

    fn make_lint_request(effect: &str, sync: &str, timing: u32, code: Option<&str>) -> LintRequest {
        LintRequest {
            request_id: "test-lint-001".to_string(),
            physics: PhysicsAnalysis {
                effect: effect.to_string(),
                behavioral: BehavioralPhysics {
                    sync: sync.to_string(),
                    timing,
                    confirmation: effect == "Financial" || effect == "Destructive",
                    has_undo: effect == "SoftDelete",
                },
                animation: None,
                material: None,
                metadata: None,
            },
            component_code: code.map(|s| s.to_string()),
            lint_rules: Vec::new(),
            auto_fix: false,
        }
    }

    #[test]
    fn test_lint_without_code() {
        let request = make_lint_request("Standard", "optimistic", 200, None);
        let response = lint(&request).unwrap();

        assert!(response.pass);
        assert!(response.metrics.is_none());
    }

    #[test]
    fn test_lint_with_code() {
        let code = r#"
function Button() {
    return <button onClick={() => {}}>Click</button>
}
"#;
        let request = make_lint_request("Standard", "optimistic", 200, Some(code));
        let response = lint(&request).unwrap();

        assert!(response.pass);
        assert!(response.metrics.is_some());
        let metrics = response.metrics.unwrap();
        assert_eq!(metrics.element_count, 1);
        assert_eq!(metrics.interactive_element_count, 1);
    }

    #[test]
    fn test_lint_financial_correct() {
        let request = make_lint_request("Financial", "pessimistic", 800, None);
        let response = lint(&request).unwrap();

        assert!(response.pass, "Correct financial physics should pass");
    }

    #[test]
    fn test_lint_financial_wrong_sync() {
        let mut request = make_lint_request("Financial", "optimistic", 800, None);
        request.physics.behavioral.confirmation = true;
        let response = lint(&request).unwrap();

        assert!(!response.pass, "Financial with optimistic sync should fail");
        // Check for the heuristic anti-pattern detection
        let sync_violations: Vec<_> = response.results.iter()
            .filter(|r| !r.passed && (r.message.contains("optimistic") || r.message.contains("pessimistic") || r.constraint_id.contains("sync")))
            .collect();
        assert!(!sync_violations.is_empty(), "Should detect sync issue for financial: {:?}",
            response.results.iter().filter(|r| !r.passed).map(|r| &r.message).collect::<Vec<_>>());
    }

    #[test]
    fn test_lint_financial_wrong_timing() {
        let request = make_lint_request("Financial", "pessimistic", 400, None);
        let response = lint(&request).unwrap();

        // Should have timing violation
        let timing_violations: Vec<_> = response
            .results
            .iter()
            .filter(|r| !r.passed && (r.message.contains("timing") || r.message.contains("800")))
            .collect();

        assert!(
            !timing_violations.is_empty() || response.results.iter().any(|r| !r.passed),
            "Should detect timing issue for financial with 400ms"
        );
    }

    #[test]
    fn test_lint_complex_component() {
        let code = r#"
function Form() {
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        await submit(value);
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Name</label>
                <input value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
            <button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
            </button>
        </form>
    );
}
"#;
        let request = make_lint_request("Standard", "optimistic", 200, Some(code));
        let response = lint(&request).unwrap();

        // Should parse and have reasonable metrics
        assert!(response.metrics.is_some());
        let metrics = response.metrics.unwrap();
        assert!(metrics.element_count >= 4); // form, div, label, input, button
        assert!(metrics.hook_count >= 2); // useState x2
    }

    #[test]
    fn test_lint_summary_counts() {
        let request = make_lint_request("Standard", "optimistic", 200, None);
        let response = lint(&request).unwrap();

        assert_eq!(response.summary.total, response.results.len());
        assert_eq!(
            response.summary.passed + response.summary.failed,
            response.summary.total
        );
    }

    #[test]
    fn test_lint_correction_context_on_failure() {
        // Financial with wrong sync should fail and produce correction context
        let mut request = make_lint_request("Financial", "optimistic", 800, None);
        request.physics.behavioral.confirmation = true;
        let response = lint(&request).unwrap();

        assert!(!response.pass, "Should fail");
        assert!(
            response.correction.is_some(),
            "Should have correction context when failing"
        );

        let correction = response.correction.unwrap();
        assert!(!correction.violations.is_empty(), "Should have violations");
        assert!(!correction.fixes.is_empty(), "Should have suggested fixes");
        assert_eq!(correction.attempt, 1);
    }

    #[test]
    fn test_lint_no_correction_context_on_pass() {
        let request = make_lint_request("Standard", "optimistic", 200, None);
        let response = lint(&request).unwrap();

        assert!(response.pass, "Should pass");
        assert!(
            response.correction.is_none(),
            "Should NOT have correction context when passing"
        );
    }
}
