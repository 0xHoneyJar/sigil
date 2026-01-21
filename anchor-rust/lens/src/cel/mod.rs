//! CEL (Common Expression Language) engine for constraint evaluation
//!
//! This module integrates the cel-interpreter crate to evaluate
//! constraint expressions against physics analysis data.

use cel_interpreter::{Context, Program};
use serde_json::Value;

use crate::error::{LensError, Result};
use crate::types::constraint::Constraint;
use crate::types::constraint_result::ConstraintResult;
use crate::types::physics::PhysicsAnalysis;

/// CEL engine for evaluating constraint expressions
pub struct CelEngine {
    // Reserved for future configuration
}

impl CelEngine {
    /// Create a new CEL engine
    pub fn new() -> Result<Self> {
        Ok(Self {})
    }

    /// Evaluate a constraint against physics analysis
    pub fn evaluate(
        &self,
        constraint: &Constraint,
        physics: &PhysicsAnalysis,
    ) -> Result<ConstraintResult> {
        // Compile the CEL expression
        let program = Program::compile(&constraint.rule).map_err(|e| LensError::CelCompilation {
            constraint_id: constraint.id.clone(),
            reason: e.to_string(),
        })?;

        // Create context with physics data
        let mut context = Context::default();

        // Convert physics to JSON Value for CEL context
        let physics_json = serde_json::to_value(physics).map_err(|e| LensError::Json(e))?;

        // Add physics object to context
        self.add_physics_to_context(&mut context, &physics_json)?;

        // Execute the CEL expression
        let result = program.execute(&context).map_err(|e| LensError::CelEvaluation {
            constraint_id: constraint.id.clone(),
            reason: e.to_string(),
        })?;

        // Convert result to boolean
        let passed = match result {
            cel_interpreter::Value::Bool(b) => b,
            _ => {
                return Err(LensError::CelEvaluation {
                    constraint_id: constraint.id.clone(),
                    reason: "Constraint rule must evaluate to a boolean".to_string(),
                });
            }
        };

        // Create constraint result
        if passed {
            Ok(ConstraintResult::pass(
                constraint.id.clone(),
                constraint.name.clone(),
                constraint.severity,
                constraint.category,
                constraint.rule.clone(),
            ))
        } else {
            Ok(ConstraintResult::fail(
                constraint.id.clone(),
                constraint.name.clone(),
                constraint.severity,
                constraint.category,
                constraint.rule.clone(),
                constraint.get_failure_message(),
            ))
        }
    }

    /// Add physics data to CEL context
    fn add_physics_to_context(&self, context: &mut Context, physics: &Value) -> Result<()> {
        // Add top-level physics object
        if let Value::Object(map) = physics {
            // Add 'physics' as a map containing all physics data
            let mut physics_map = std::collections::HashMap::new();

            // Add effect
            if let Some(effect) = map.get("effect") {
                if let Value::String(s) = effect {
                    physics_map.insert("effect".to_string(), cel_interpreter::Value::String(s.clone().into()));
                }
            }

            // Add behavioral as nested map
            if let Some(behavioral) = map.get("behavioral") {
                let behavioral_cel = self.json_to_cel_value(behavioral);
                physics_map.insert("behavioral".to_string(), behavioral_cel);
            }

            // Add animation as nested map (if present)
            if let Some(animation) = map.get("animation") {
                let animation_cel = self.json_to_cel_value(animation);
                physics_map.insert("animation".to_string(), animation_cel);
            }

            // Add material as nested map (if present)
            if let Some(material) = map.get("material") {
                let material_cel = self.json_to_cel_value(material);
                physics_map.insert("material".to_string(), material_cel);
            }

            // Add metadata as nested map (if present)
            if let Some(metadata) = map.get("metadata") {
                let metadata_cel = self.json_to_cel_value(metadata);
                physics_map.insert("metadata".to_string(), metadata_cel);
            }

            context.add_variable("physics", cel_interpreter::Value::Map(physics_map.into())).map_err(|e| {
                LensError::CelEvaluation {
                    constraint_id: "context".to_string(),
                    reason: format!("Failed to add physics to context: {}", e),
                }
            })?;
        }

        Ok(())
    }

    /// Convert JSON Value to CEL Value
    fn json_to_cel_value(&self, json: &Value) -> cel_interpreter::Value {
        match json {
            Value::Null => cel_interpreter::Value::Null,
            Value::Bool(b) => cel_interpreter::Value::Bool(*b),
            Value::Number(n) => {
                if let Some(i) = n.as_i64() {
                    cel_interpreter::Value::Int(i)
                } else if let Some(u) = n.as_u64() {
                    cel_interpreter::Value::UInt(u)
                } else if let Some(f) = n.as_f64() {
                    cel_interpreter::Value::Float(f)
                } else {
                    cel_interpreter::Value::Null
                }
            }
            Value::String(s) => cel_interpreter::Value::String(s.clone().into()),
            Value::Array(arr) => {
                let values: Vec<cel_interpreter::Value> =
                    arr.iter().map(|v| self.json_to_cel_value(v)).collect();
                cel_interpreter::Value::List(values.into())
            }
            Value::Object(map) => {
                let mut cel_map = std::collections::HashMap::new();
                for (k, v) in map {
                    cel_map.insert(k.clone(), self.json_to_cel_value(v));
                }
                cel_interpreter::Value::Map(cel_map.into())
            }
        }
    }
}

impl Default for CelEngine {
    fn default() -> Self {
        Self::new().expect("Failed to create default CEL engine")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::constraint::{ConstraintCategory, Severity};
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

    fn create_test_constraint(rule: &str) -> Constraint {
        Constraint {
            id: "test-001".to_string(),
            name: "Test Constraint".to_string(),
            description: "A test constraint".to_string(),
            rule: rule.to_string(),
            severity: Severity::Error,
            category: ConstraintCategory::Behavioral,
            failure_message: Some("Test failed".to_string()),
            enabled: true,
        }
    }

    #[test]
    fn test_cel_engine_simple_true() {
        let engine = CelEngine::new().unwrap();
        let physics = create_test_physics();
        let constraint = create_test_constraint("true");

        let result = engine.evaluate(&constraint, &physics).unwrap();
        assert!(result.passed);
    }

    #[test]
    fn test_cel_engine_simple_false() {
        let engine = CelEngine::new().unwrap();
        let physics = create_test_physics();
        let constraint = create_test_constraint("false");

        let result = engine.evaluate(&constraint, &physics).unwrap();
        assert!(!result.passed);
    }

    #[test]
    fn test_cel_engine_timing_check() {
        let engine = CelEngine::new().unwrap();
        let physics = create_test_physics();

        // Check that timing >= 800
        let constraint = create_test_constraint("physics.behavioral.timing >= 800");
        let result = engine.evaluate(&constraint, &physics).unwrap();
        assert!(result.passed);

        // Check that timing >= 900 (should fail)
        let constraint = create_test_constraint("physics.behavioral.timing >= 900");
        let result = engine.evaluate(&constraint, &physics).unwrap();
        assert!(!result.passed);
    }

    #[test]
    fn test_cel_engine_sync_check() {
        let engine = CelEngine::new().unwrap();
        let physics = create_test_physics();

        // Check sync is pessimistic
        let constraint = create_test_constraint("physics.behavioral.sync == 'pessimistic'");
        let result = engine.evaluate(&constraint, &physics).unwrap();
        assert!(result.passed);
    }

    #[test]
    fn test_cel_engine_effect_check() {
        let engine = CelEngine::new().unwrap();
        let physics = create_test_physics();

        // Check effect is Financial
        let constraint = create_test_constraint("physics.effect == 'Financial'");
        let result = engine.evaluate(&constraint, &physics).unwrap();
        assert!(result.passed);
    }

    #[test]
    fn test_cel_engine_compound_rule() {
        let engine = CelEngine::new().unwrap();
        let physics = create_test_physics();

        // Financial must have pessimistic sync and timing >= 800
        let constraint = create_test_constraint(
            "physics.effect == 'Financial' ? (physics.behavioral.sync == 'pessimistic' && physics.behavioral.timing >= 800) : true",
        );
        let result = engine.evaluate(&constraint, &physics).unwrap();
        assert!(result.passed);
    }

    #[test]
    fn test_all_default_constraints_compile() {
        // Load all embedded constraints and verify they compile
        let constraints = crate::types::constraint::Constraint::load_embedded().unwrap();
        assert!(!constraints.is_empty(), "Should have default constraints");

        let engine = CelEngine::new().unwrap();
        let physics = create_test_physics();

        // Verify each ENABLED constraint compiles and can be evaluated
        let enabled_constraints: Vec<_> = constraints.into_iter().filter(|c| c.enabled).collect();
        assert!(!enabled_constraints.is_empty(), "Should have some enabled constraints");

        for constraint in enabled_constraints {
            let result = engine.evaluate(&constraint, &physics);
            assert!(
                result.is_ok(),
                "Constraint '{}' failed to evaluate: {:?}",
                constraint.id,
                result.err()
            );
        }
    }

    #[test]
    fn test_financial_constraints_pass_for_correct_physics() {
        // Test that financial physics passes financial constraints
        let engine = CelEngine::new().unwrap();
        let physics = create_test_physics(); // This is Financial with correct timing/sync/confirmation

        // Load constraints and filter to financial-related ones
        let constraints = crate::types::constraint::Constraint::load_embedded().unwrap();
        let financial_constraints: Vec<_> = constraints
            .into_iter()
            .filter(|c| c.id.starts_with("financial-"))
            .collect();

        // All financial constraints should pass for correct financial physics
        for constraint in financial_constraints {
            let result = engine.evaluate(&constraint, &physics).unwrap();
            assert!(
                result.passed,
                "Financial constraint '{}' failed for correct physics: {}",
                constraint.id,
                result.message
            );
        }
    }

    #[test]
    fn test_financial_constraints_fail_for_wrong_timing() {
        let engine = CelEngine::new().unwrap();

        // Financial physics with timing too low
        let physics = PhysicsAnalysis {
            effect: "Financial".to_string(),
            behavioral: BehavioralPhysics {
                sync: "pessimistic".to_string(),
                timing: 400, // Too low! Should be >= 800
                confirmation: true,
                has_undo: false,
            },
            animation: None,
            material: None,
            metadata: None,
        };

        // Load timing constraint
        let constraints = crate::types::constraint::Constraint::load_embedded().unwrap();
        let timing_constraint = constraints
            .iter()
            .find(|c| c.id == "financial-timing-001")
            .expect("Should have financial timing constraint");

        let result = engine.evaluate(timing_constraint, &physics).unwrap();
        assert!(
            !result.passed,
            "Financial timing constraint should fail for timing < 800"
        );
    }
}
