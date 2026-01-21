//! Vocabulary definitions for effect detection
//!
//! The vocabulary maps keywords to effects, which in turn map to zones and physics.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;

use crate::error::Result;
use crate::types::zone::Zone;

/// Physics configuration for an effect
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Physics {
    /// Sync strategy: pessimistic, optimistic, or immediate
    pub sync: String,
    /// Timing in milliseconds
    pub timing: u32,
    /// Whether confirmation is required
    pub confirmation: ConfirmationType,
}

/// Confirmation type for an effect
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum ConfirmationType {
    /// Simple boolean
    Bool(bool),
    /// Special confirmation type (e.g., "toast_undo")
    String(String),
}

impl ConfirmationType {
    pub fn is_required(&self) -> bool {
        match self {
            ConfirmationType::Bool(b) => *b,
            ConfirmationType::String(_) => true,
        }
    }
}

/// Effect definition with keywords and physics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Effect {
    /// Keywords that trigger this effect
    pub keywords: Vec<String>,
    /// Type names that override keyword detection
    #[serde(default)]
    pub type_overrides: Vec<String>,
    /// Physics configuration for this effect
    pub physics: Physics,
}

/// Vocabulary containing all effect definitions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Vocabulary {
    /// Version of the vocabulary schema
    pub version: String,
    /// Last updated timestamp
    #[serde(default)]
    pub updated: Option<String>,
    /// Effect definitions keyed by effect name
    pub effects: HashMap<String, Effect>,
}

impl Vocabulary {
    /// Load vocabulary from pub/ directory or use embedded default
    pub fn load() -> Result<Self> {
        let pub_path = Path::new("grimoires/pub/vocabulary.yaml");

        if pub_path.exists() {
            let content = std::fs::read_to_string(pub_path)?;
            let vocab: Vocabulary = serde_yaml::from_str(&content)?;
            Ok(vocab)
        } else {
            // Use embedded default
            Ok(Self::default())
        }
    }

    /// Detect effect from keywords
    pub fn detect_effect(&self, keywords: &[String]) -> Option<(String, &Effect)> {
        // Priority: Check for financial/destructive first (highest severity)
        let priority_order = ["financial", "destructive", "soft_delete", "standard", "local"];

        for effect_name in priority_order {
            if let Some(effect) = self.effects.get(effect_name) {
                for keyword in keywords {
                    let kw_lower = keyword.to_lowercase();
                    if effect.keywords.iter().any(|k| kw_lower.contains(k)) {
                        return Some((effect_name.to_string(), effect));
                    }
                }
            }
        }

        None
    }

    /// Get zone for an effect name
    pub fn zone_for_effect(&self, effect_name: &str) -> Zone {
        match effect_name {
            "financial" | "destructive" => Zone::Critical,
            "soft_delete" => Zone::Elevated,
            "standard" => Zone::Standard,
            "local" => Zone::Local,
            _ => Zone::Standard,
        }
    }
}

impl Default for Vocabulary {
    fn default() -> Self {
        // Embedded default vocabulary matching PRD/SDD
        let yaml = include_str!("../../data/vocabulary.yaml");
        serde_yaml::from_str(yaml).expect("Embedded vocabulary.yaml must be valid")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_vocab() -> Vocabulary {
        let mut effects = HashMap::new();

        effects.insert(
            "financial".to_string(),
            Effect {
                keywords: vec!["claim".to_string(), "withdraw".to_string(), "stake".to_string()],
                type_overrides: vec!["Currency".to_string(), "Wei".to_string()],
                physics: Physics {
                    sync: "pessimistic".to_string(),
                    timing: 800,
                    confirmation: ConfirmationType::Bool(true),
                },
            },
        );

        effects.insert(
            "standard".to_string(),
            Effect {
                keywords: vec!["save".to_string(), "update".to_string(), "like".to_string()],
                type_overrides: vec![],
                physics: Physics {
                    sync: "optimistic".to_string(),
                    timing: 200,
                    confirmation: ConfirmationType::Bool(false),
                },
            },
        );

        Vocabulary {
            version: "1.0.0".to_string(),
            updated: Some("2026-01-20T00:00:00Z".to_string()),
            effects,
        }
    }

    #[test]
    fn test_detect_effect_financial() {
        let vocab = test_vocab();
        let result = vocab.detect_effect(&["claim".to_string(), "button".to_string()]);
        assert!(result.is_some());
        let (name, _) = result.unwrap();
        assert_eq!(name, "financial");
    }

    #[test]
    fn test_detect_effect_standard() {
        let vocab = test_vocab();
        let result = vocab.detect_effect(&["save".to_string(), "document".to_string()]);
        assert!(result.is_some());
        let (name, _) = result.unwrap();
        assert_eq!(name, "standard");
    }

    #[test]
    fn test_zone_for_effect() {
        let vocab = test_vocab();
        assert_eq!(vocab.zone_for_effect("financial"), Zone::Critical);
        assert_eq!(vocab.zone_for_effect("destructive"), Zone::Critical);
        assert_eq!(vocab.zone_for_effect("soft_delete"), Zone::Elevated);
        assert_eq!(vocab.zone_for_effect("standard"), Zone::Standard);
        assert_eq!(vocab.zone_for_effect("local"), Zone::Local);
    }
}
