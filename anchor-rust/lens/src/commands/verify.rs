//! Verify command implementation
//!
//! Verifies physics analysis against formal constraints using CEL.

use crate::cel::CelEngine;
use crate::error::Result;
use crate::types::constraint::Constraint;
use crate::types::constraint_result::ConstraintResult;
use crate::types::physics::PhysicsAnalysis;

/// Verify physics against all enabled constraints
pub fn verify(physics: &PhysicsAnalysis) -> Result<Vec<ConstraintResult>> {
    // Load constraints
    let constraints = Constraint::load_all()?;

    // Filter to enabled constraints only
    let enabled_constraints: Vec<_> = constraints.into_iter().filter(|c| c.enabled).collect();

    // Create CEL engine
    let engine = CelEngine::new()?;

    // Evaluate each constraint
    let mut results = Vec::with_capacity(enabled_constraints.len());

    for constraint in enabled_constraints {
        let result = engine.evaluate(&constraint, physics)?;
        results.push(result);
    }

    Ok(results)
}

/// Verify physics against specific constraints by ID
pub fn verify_specific(
    physics: &PhysicsAnalysis,
    constraint_ids: &[String],
) -> Result<Vec<ConstraintResult>> {
    // Load constraints
    let constraints = Constraint::load_all()?;

    // Filter to requested constraints only
    let filtered_constraints: Vec<_> = constraints
        .into_iter()
        .filter(|c| c.enabled && constraint_ids.contains(&c.id))
        .collect();

    // Create CEL engine
    let engine = CelEngine::new()?;

    // Evaluate each constraint
    let mut results = Vec::with_capacity(filtered_constraints.len());

    for constraint in filtered_constraints {
        let result = engine.evaluate(&constraint, physics)?;
        results.push(result);
    }

    Ok(results)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::physics::BehavioralPhysics;

    fn create_test_physics() -> PhysicsAnalysis {
        PhysicsAnalysis {
            effect: "Financial".to_string(),
            behavioral: BehavioralPhysics {
                sync: "pessimistic".to_string(),
                timing: 800,
                confirmation: true,
                has_undo: false,
            },
            animation: None,
            material: None,
            metadata: None,
        }
    }

    #[test]
    fn test_verify_returns_results() {
        let physics = create_test_physics();

        // This will work once we have constraints loaded
        // For now, it should return an empty list if no constraints exist
        let results = verify(&physics);

        // Should not error even with no constraints
        assert!(results.is_ok());
    }
}
