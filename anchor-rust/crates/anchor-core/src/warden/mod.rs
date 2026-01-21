//! Warden module for Sigil rules loading and validation.
//!
//! This module provides loaders for:
//! - Physics rules (sync strategy, timing, confirmation)
//! - Vocabulary/lexicon (keyword to effect mapping)
//! - Effect resolution from keywords and types
//! - Grounding statement validation
//! - Adversarial warden for drift/deceptive detection

mod adversarial;
mod grounding;
mod physics;
mod vocabulary;

pub use adversarial::{get_warden, AdversarialResult, AdversarialWarden, LearnedRule};
pub use grounding::{
    check_hierarchy, check_relevance, check_rules, parse_grounding_statement,
    required_zone_for_effect, validate_grounding, CheckResult, ClaimedPhysics, Correction,
    GroundingStatement, ValidationResult, ValidationStatus,
};
pub use physics::{get_default_physics, load_physics, load_physics_cached, PhysicsLoader};
pub use vocabulary::{
    resolve_effect_from_keywords, KeywordCategory, TypeOverride, Vocabulary, VocabularyLoader,
};

#[cfg(test)]
pub use adversarial::reset_warden;
#[cfg(test)]
pub use physics::clear_physics_cache;
