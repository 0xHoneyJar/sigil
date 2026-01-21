//! Anchor Core - State-pinned development for blockchain applications.
//!
//! This library provides the core functionality for Anchor:
//! - Fork management with Anvil processes
//! - Task pipeline for state-pinned operations
//! - Physics-based interaction rules
//! - Zone-based security hierarchy
//!
//! # Example
//!
//! ```rust
//! use sigil_anchor_core::types::{Network, Zone, PhysicsTable};
//!
//! // Get physics rules for interactions
//! let physics = PhysicsTable::defaults();
//!
//! // Check zone restrictions
//! assert!(Zone::Critical.is_more_restrictive_than(&Zone::Standard));
//! ```

pub mod error;
pub mod graph;
pub mod lifecycle;
pub mod rpc;
pub mod types;
pub mod warden;

// Re-export commonly used types at crate root
pub use error::AnchorError;
pub use graph::TaskGraph;
pub use lifecycle::{CheckpointManager, ForkManager, SessionManager, SnapshotManager};
pub use rpc::{AnvilMethods, RpcClient, RpcError};
pub use types::{
    Checkpoint, CheckpointRegistry, ConfirmationType, EffectType, Fork, ForkRegistry, Network,
    PhysicsRule, PhysicsTable, Session, SessionMetadata, SessionRegistry, SessionStatus, Snapshot,
    SnapshotRegistry, SyncStrategy, Task, TaskStatus, TaskType, Zone,
};
pub use warden::{
    check_hierarchy, check_relevance, check_rules, get_default_physics, get_warden, load_physics,
    load_physics_cached, parse_grounding_statement, required_zone_for_effect,
    resolve_effect_from_keywords, validate_grounding, AdversarialResult, AdversarialWarden,
    CheckResult, ClaimedPhysics, Correction, GroundingStatement, KeywordCategory, LearnedRule,
    PhysicsLoader, TypeOverride, ValidationResult, ValidationStatus, Vocabulary, VocabularyLoader,
};

/// Result type alias for Anchor operations.
pub type Result<T> = std::result::Result<T, AnchorError>;

/// Library version.
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_version_exists() {
        assert!(!VERSION.is_empty());
    }

    #[test]
    fn test_reexports_accessible() {
        // Verify all re-exports are accessible
        let _zone = Zone::Standard;
        let _network = Network::Mainnet;
        let _table = PhysicsTable::defaults();
        let _effect = EffectType::Financial;
        let _sync = SyncStrategy::Pessimistic;
        let _confirm = ConfirmationType::Required;
        let _task_type = TaskType::Fork;
        let _task_status = TaskStatus::Pending;
    }

    #[test]
    fn test_result_type() {
        fn example_fn() -> Result<i32> {
            Ok(42)
        }
        assert_eq!(example_fn().unwrap(), 42);
    }

    #[test]
    fn test_error_result() {
        fn failing_fn() -> Result<i32> {
            Err(AnchorError::InvalidZone("test".to_string()))
        }
        assert!(failing_fn().is_err());
    }
}
