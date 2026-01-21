//! Constraint definitions for physics verification
//!
//! Constraints are formal rules expressed in CEL (Common Expression Language)
//! that verify physics analysis results meet required standards.

use std::fs;
use std::path::Path;

use serde::{Deserialize, Serialize};

use crate::error::{LensError, Result};

/// Path to embedded default constraints
const DEFAULT_CONSTRAINTS_PATH: &str = "data/constraints.yaml";

/// Path to user-provided constraints in pub directory
const PUB_CONSTRAINTS_PATH: &str = "grimoires/pub/constraints.yaml";

/// Constraint severity levels
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Severity {
    /// Must pass - failure blocks the operation
    Error,
    /// Should pass - failure generates warning
    Warning,
    /// Informational - logged but doesn't affect outcome
    Info,
}

impl Default for Severity {
    fn default() -> Self {
        Self::Error
    }
}

/// Constraint categories for organizing rules
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ConstraintCategory {
    /// Behavioral physics constraints (timing, sync, confirmation)
    Behavioral,
    /// Animation physics constraints (easing, duration)
    Animation,
    /// Material physics constraints (surface, shadow, radius)
    Material,
    /// Protected capability constraints (non-negotiable rules)
    Protected,
    /// Cross-cutting constraints
    General,
}

impl Default for ConstraintCategory {
    fn default() -> Self {
        Self::General
    }
}

/// A single constraint definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Constraint {
    /// Unique identifier for this constraint
    pub id: String,

    /// Human-readable name
    pub name: String,

    /// Detailed description of what this constraint checks
    pub description: String,

    /// CEL expression that must evaluate to true
    pub rule: String,

    /// Severity level
    #[serde(default)]
    pub severity: Severity,

    /// Category for organization
    #[serde(default)]
    pub category: ConstraintCategory,

    /// Human-readable message shown on failure
    #[serde(default)]
    pub failure_message: Option<String>,

    /// Whether this constraint is enabled
    #[serde(default = "default_enabled")]
    pub enabled: bool,
}

fn default_enabled() -> bool {
    true
}

/// Collection of constraints loaded from YAML
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConstraintSet {
    /// Version of the constraint schema
    pub version: String,

    /// List of constraints
    pub constraints: Vec<Constraint>,
}

impl Constraint {
    /// Load all constraints from default and user-provided locations
    pub fn load_all() -> Result<Vec<Constraint>> {
        let mut constraints = Vec::new();

        // Load embedded defaults first
        if let Ok(default_constraints) = Self::load_embedded() {
            constraints.extend(default_constraints);
        }

        // Load user-provided constraints (can override defaults)
        if let Ok(user_constraints) = Self::load_from_pub() {
            // User constraints with same ID override defaults
            for user_constraint in user_constraints {
                if let Some(pos) = constraints.iter().position(|c| c.id == user_constraint.id) {
                    constraints[pos] = user_constraint;
                } else {
                    constraints.push(user_constraint);
                }
            }
        }

        Ok(constraints)
    }

    /// Load embedded default constraints
    pub fn load_embedded() -> Result<Vec<Constraint>> {
        // In a real implementation, this would use include_str! or similar
        // For now, try to load from the data directory relative to the crate
        let path = Path::new(env!("CARGO_MANIFEST_DIR")).join(DEFAULT_CONSTRAINTS_PATH);

        if !path.exists() {
            // Return empty if no embedded constraints exist yet
            return Ok(Vec::new());
        }

        let content = fs::read_to_string(&path)?;
        let constraint_set: ConstraintSet = serde_yaml::from_str(&content)?;

        Ok(constraint_set.constraints)
    }

    /// Load user-provided constraints from pub directory
    fn load_from_pub() -> Result<Vec<Constraint>> {
        let path = Path::new(PUB_CONSTRAINTS_PATH);

        if !path.exists() {
            return Err(LensError::ConstraintsNotFound {
                path: path.display().to_string(),
            });
        }

        let content = fs::read_to_string(path)?;
        let constraint_set: ConstraintSet = serde_yaml::from_str(&content)?;

        Ok(constraint_set.constraints)
    }

    /// Get the failure message for this constraint
    pub fn get_failure_message(&self) -> String {
        self.failure_message
            .clone()
            .unwrap_or_else(|| format!("Constraint '{}' failed: {}", self.id, self.description))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_severity_default() {
        assert_eq!(Severity::default(), Severity::Error);
    }

    #[test]
    fn test_category_default() {
        assert_eq!(ConstraintCategory::default(), ConstraintCategory::General);
    }

    #[test]
    fn test_constraint_deserialize() {
        let yaml = r#"
            id: "timing-001"
            name: "Financial Timing"
            description: "Financial operations must have 800ms timing"
            rule: "physics.behavioral.timing >= 800"
            severity: error
            category: behavioral
        "#;

        let constraint: Constraint = serde_yaml::from_str(yaml).unwrap();
        assert_eq!(constraint.id, "timing-001");
        assert_eq!(constraint.severity, Severity::Error);
        assert_eq!(constraint.category, ConstraintCategory::Behavioral);
        assert!(constraint.enabled);
    }

    #[test]
    fn test_constraint_set_deserialize() {
        let yaml = r#"
            version: "1.0"
            constraints:
              - id: "test-001"
                name: "Test Constraint"
                description: "A test constraint"
                rule: "true"
        "#;

        let set: ConstraintSet = serde_yaml::from_str(yaml).unwrap();
        assert_eq!(set.version, "1.0");
        assert_eq!(set.constraints.len(), 1);
    }

    #[test]
    fn test_load_embedded_constraints() {
        // This test verifies the embedded constraints.yaml file can be parsed
        let constraints = Constraint::load_embedded().unwrap();
        // Should have loaded the default constraints
        assert!(!constraints.is_empty(), "Default constraints should exist");

        // Verify we have the expected constraint categories
        let behavioral_count = constraints
            .iter()
            .filter(|c| c.category == ConstraintCategory::Behavioral)
            .count();
        assert!(behavioral_count > 0, "Should have behavioral constraints");

        // Verify CEL rules are valid by checking they can be parsed
        for constraint in &constraints {
            // Just verify the rule is not empty
            assert!(!constraint.rule.is_empty(), "Constraint {} has empty rule", constraint.id);
        }
    }
}
