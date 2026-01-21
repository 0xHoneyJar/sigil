//! Physics analysis types
//!
//! These types represent the physics analysis results that Lens verifies
//! against constraints. They mirror the Sigil physics system.

use serde::{Deserialize, Serialize};

/// Complete physics analysis for a component
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhysicsAnalysis {
    /// The detected effect type
    pub effect: String,

    /// Behavioral physics
    pub behavioral: BehavioralPhysics,

    /// Animation physics
    #[serde(default)]
    pub animation: Option<AnimationPhysics>,

    /// Material physics
    #[serde(default)]
    pub material: Option<MaterialPhysics>,

    /// Component metadata
    #[serde(default)]
    pub metadata: Option<ComponentMetadata>,
}

/// Behavioral physics - timing, sync, confirmation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralPhysics {
    /// Sync strategy: "pessimistic", "optimistic", "immediate"
    pub sync: String,

    /// Timing in milliseconds
    pub timing: u32,

    /// Whether confirmation is required
    #[serde(default)]
    pub confirmation: bool,

    /// Whether this has an undo option
    #[serde(default)]
    pub has_undo: bool,
}

/// Animation physics - easing, duration, springs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimationPhysics {
    /// Easing function: "ease-out", "ease-in-out", "spring", "linear"
    pub easing: String,

    /// Duration in milliseconds (for non-spring animations)
    #[serde(default)]
    pub duration: Option<u32>,

    /// Spring configuration (if easing is "spring")
    #[serde(default)]
    pub spring: Option<SpringConfig>,

    /// Whether animation is interruptible
    #[serde(default)]
    pub interruptible: bool,
}

/// Spring animation configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpringConfig {
    /// Spring stiffness
    pub stiffness: f32,

    /// Spring damping
    pub damping: f32,

    /// Spring mass (optional, defaults to 1)
    #[serde(default = "default_mass")]
    pub mass: f32,
}

fn default_mass() -> f32 {
    1.0
}

/// Material physics - surface, shadow, radius
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MaterialPhysics {
    /// Surface type: "flat", "elevated", "glass", "outlined"
    pub surface: String,

    /// Shadow style: "none", "soft", "hard"
    #[serde(default)]
    pub shadow: Option<String>,

    /// Border radius in pixels
    #[serde(default)]
    pub radius: Option<u32>,

    /// Gradient stops (0-2 recommended)
    #[serde(default)]
    pub gradient_stops: Option<u32>,
}

/// Component metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentMetadata {
    /// Component name
    #[serde(default)]
    pub name: Option<String>,

    /// Component type/category
    #[serde(default)]
    pub component_type: Option<String>,

    /// Keywords detected in the component
    #[serde(default)]
    pub keywords: Vec<String>,

    /// Whether this involves financial operations
    #[serde(default)]
    pub is_financial: bool,

    /// Whether this involves destructive operations
    #[serde(default)]
    pub is_destructive: bool,

    /// Touch target size in pixels (should be >= 44)
    #[serde(default)]
    pub touch_target: Option<u32>,

    /// Whether focus ring is present
    #[serde(default)]
    pub has_focus_ring: bool,
}

impl PhysicsAnalysis {
    /// Check if this is a financial operation
    pub fn is_financial(&self) -> bool {
        self.effect.to_lowercase() == "financial"
            || self.metadata.as_ref().map_or(false, |m| m.is_financial)
    }

    /// Check if this is a destructive operation
    pub fn is_destructive(&self) -> bool {
        self.effect.to_lowercase() == "destructive"
            || self.metadata.as_ref().map_or(false, |m| m.is_destructive)
    }

    /// Check if this requires confirmation based on effect type
    pub fn requires_confirmation(&self) -> bool {
        self.is_financial() || self.is_destructive()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_physics_analysis_deserialize() {
        let json = r#"{
            "effect": "Financial",
            "behavioral": {
                "sync": "pessimistic",
                "timing": 800,
                "confirmation": true
            }
        }"#;

        let analysis: PhysicsAnalysis = serde_json::from_str(json).unwrap();
        assert_eq!(analysis.effect, "Financial");
        assert_eq!(analysis.behavioral.sync, "pessimistic");
        assert_eq!(analysis.behavioral.timing, 800);
        assert!(analysis.behavioral.confirmation);
        assert!(analysis.is_financial());
    }

    #[test]
    fn test_spring_config() {
        let json = r#"{
            "stiffness": 500.0,
            "damping": 30.0
        }"#;

        let spring: SpringConfig = serde_json::from_str(json).unwrap();
        assert_eq!(spring.stiffness, 500.0);
        assert_eq!(spring.damping, 30.0);
        assert_eq!(spring.mass, 1.0); // default
    }

    #[test]
    fn test_requires_confirmation() {
        let analysis = PhysicsAnalysis {
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
        };

        assert!(analysis.requires_confirmation());
    }
}
