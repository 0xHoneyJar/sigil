//! Physics types for Sigil design rules.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Sync strategies for mutations.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SyncStrategy {
    /// Server confirms before UI updates (financial, destructive)
    Pessimistic,
    /// UI updates immediately, rolls back on failure
    Optimistic,
    /// No server round-trip (local state only)
    Immediate,
}

impl std::fmt::Display for SyncStrategy {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SyncStrategy::Pessimistic => write!(f, "pessimistic"),
            SyncStrategy::Optimistic => write!(f, "optimistic"),
            SyncStrategy::Immediate => write!(f, "immediate"),
        }
    }
}

/// Confirmation types for user actions.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ConfirmationType {
    /// Explicit confirmation required (modal/dialog)
    Required,
    /// Toast notification with undo option
    ToastUndo,
    /// No confirmation needed
    None,
}

impl std::fmt::Display for ConfirmationType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ConfirmationType::Required => write!(f, "required"),
            ConfirmationType::ToastUndo => write!(f, "toast_undo"),
            ConfirmationType::None => write!(f, "none"),
        }
    }
}

/// Effect types determining physics rules.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EffectType {
    /// Financial operations (claim, deposit, withdraw, transfer)
    Financial,
    /// Destructive operations (delete, remove, destroy)
    Destructive,
    /// Soft delete with undo (archive, trash)
    SoftDelete,
    /// Standard CRUD operations
    Standard,
    /// Navigation/routing
    Navigation,
    /// Data queries (read-only)
    Query,
    /// Local UI state (theme, preferences)
    Local,
    /// High-frequency operations (keyboard nav)
    HighFreq,
}

impl std::fmt::Display for EffectType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            EffectType::Financial => write!(f, "financial"),
            EffectType::Destructive => write!(f, "destructive"),
            EffectType::SoftDelete => write!(f, "soft_delete"),
            EffectType::Standard => write!(f, "standard"),
            EffectType::Navigation => write!(f, "navigation"),
            EffectType::Query => write!(f, "query"),
            EffectType::Local => write!(f, "local"),
            EffectType::HighFreq => write!(f, "high_freq"),
        }
    }
}

/// Physics rule for an effect type.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhysicsRule {
    /// Effect type this rule applies to
    pub effect: EffectType,
    /// Sync strategy to use
    pub sync: SyncStrategy,
    /// Timing in milliseconds
    pub timing_ms: u32,
    /// Confirmation requirement
    pub confirmation: ConfirmationType,
}

impl PhysicsRule {
    /// Create a new physics rule.
    pub fn new(
        effect: EffectType,
        sync: SyncStrategy,
        timing_ms: u32,
        confirmation: ConfirmationType,
    ) -> Self {
        Self {
            effect,
            sync,
            timing_ms,
            confirmation,
        }
    }
}

/// Loaded physics table containing all rules.
#[derive(Debug, Clone, Default)]
pub struct PhysicsTable {
    rules: HashMap<EffectType, PhysicsRule>,
}

impl PhysicsTable {
    /// Create a new empty physics table.
    pub fn new() -> Self {
        Self {
            rules: HashMap::new(),
        }
    }

    /// Get a rule by effect type.
    pub fn get(&self, effect: &EffectType) -> Option<&PhysicsRule> {
        self.rules.get(effect)
    }

    /// Insert a rule into the table.
    pub fn insert(&mut self, rule: PhysicsRule) {
        self.rules.insert(rule.effect, rule);
    }

    /// Check if the table contains a rule for an effect.
    pub fn contains(&self, effect: &EffectType) -> bool {
        self.rules.contains_key(effect)
    }

    /// Get the number of rules.
    pub fn len(&self) -> usize {
        self.rules.len()
    }

    /// Check if the table is empty.
    pub fn is_empty(&self) -> bool {
        self.rules.is_empty()
    }

    /// Iterate over all rules.
    pub fn iter(&self) -> impl Iterator<Item = &PhysicsRule> {
        self.rules.values()
    }

    /// Get the default physics table with standard Sigil rules.
    pub fn defaults() -> Self {
        let mut table = Self::new();

        // Financial: Pessimistic, 800ms, Required
        table.insert(PhysicsRule::new(
            EffectType::Financial,
            SyncStrategy::Pessimistic,
            800,
            ConfirmationType::Required,
        ));

        // Destructive: Pessimistic, 600ms, Required
        table.insert(PhysicsRule::new(
            EffectType::Destructive,
            SyncStrategy::Pessimistic,
            600,
            ConfirmationType::Required,
        ));

        // SoftDelete: Optimistic, 200ms, ToastUndo
        table.insert(PhysicsRule::new(
            EffectType::SoftDelete,
            SyncStrategy::Optimistic,
            200,
            ConfirmationType::ToastUndo,
        ));

        // Standard: Optimistic, 200ms, None
        table.insert(PhysicsRule::new(
            EffectType::Standard,
            SyncStrategy::Optimistic,
            200,
            ConfirmationType::None,
        ));

        // Navigation: Immediate, 150ms, None
        table.insert(PhysicsRule::new(
            EffectType::Navigation,
            SyncStrategy::Immediate,
            150,
            ConfirmationType::None,
        ));

        // Query: Optimistic, 150ms, None
        table.insert(PhysicsRule::new(
            EffectType::Query,
            SyncStrategy::Optimistic,
            150,
            ConfirmationType::None,
        ));

        // Local: Immediate, 100ms, None
        table.insert(PhysicsRule::new(
            EffectType::Local,
            SyncStrategy::Immediate,
            100,
            ConfirmationType::None,
        ));

        // HighFreq: Immediate, 0ms, None
        table.insert(PhysicsRule::new(
            EffectType::HighFreq,
            SyncStrategy::Immediate,
            0,
            ConfirmationType::None,
        ));

        table
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sync_strategy_display() {
        assert_eq!(SyncStrategy::Pessimistic.to_string(), "pessimistic");
        assert_eq!(SyncStrategy::Optimistic.to_string(), "optimistic");
        assert_eq!(SyncStrategy::Immediate.to_string(), "immediate");
    }

    #[test]
    fn test_confirmation_type_display() {
        assert_eq!(ConfirmationType::Required.to_string(), "required");
        assert_eq!(ConfirmationType::ToastUndo.to_string(), "toast_undo");
        assert_eq!(ConfirmationType::None.to_string(), "none");
    }

    #[test]
    fn test_effect_type_display() {
        assert_eq!(EffectType::Financial.to_string(), "financial");
        assert_eq!(EffectType::Destructive.to_string(), "destructive");
        assert_eq!(EffectType::SoftDelete.to_string(), "soft_delete");
        assert_eq!(EffectType::Standard.to_string(), "standard");
        assert_eq!(EffectType::Local.to_string(), "local");
    }

    #[test]
    fn test_physics_table_defaults() {
        let table = PhysicsTable::defaults();

        // Check all 8 effect types are present
        assert_eq!(table.len(), 8);

        // Verify financial rule
        let financial = table.get(&EffectType::Financial).unwrap();
        assert_eq!(financial.sync, SyncStrategy::Pessimistic);
        assert_eq!(financial.timing_ms, 800);
        assert_eq!(financial.confirmation, ConfirmationType::Required);

        // Verify destructive rule
        let destructive = table.get(&EffectType::Destructive).unwrap();
        assert_eq!(destructive.sync, SyncStrategy::Pessimistic);
        assert_eq!(destructive.timing_ms, 600);
        assert_eq!(destructive.confirmation, ConfirmationType::Required);

        // Verify soft delete rule
        let soft_delete = table.get(&EffectType::SoftDelete).unwrap();
        assert_eq!(soft_delete.sync, SyncStrategy::Optimistic);
        assert_eq!(soft_delete.timing_ms, 200);
        assert_eq!(soft_delete.confirmation, ConfirmationType::ToastUndo);

        // Verify standard rule
        let standard = table.get(&EffectType::Standard).unwrap();
        assert_eq!(standard.sync, SyncStrategy::Optimistic);
        assert_eq!(standard.timing_ms, 200);
        assert_eq!(standard.confirmation, ConfirmationType::None);

        // Verify local rule
        let local = table.get(&EffectType::Local).unwrap();
        assert_eq!(local.sync, SyncStrategy::Immediate);
        assert_eq!(local.timing_ms, 100);
        assert_eq!(local.confirmation, ConfirmationType::None);

        // Verify high-freq rule
        let high_freq = table.get(&EffectType::HighFreq).unwrap();
        assert_eq!(high_freq.sync, SyncStrategy::Immediate);
        assert_eq!(high_freq.timing_ms, 0);
        assert_eq!(high_freq.confirmation, ConfirmationType::None);
    }

    #[test]
    fn test_physics_table_insert_and_get() {
        let mut table = PhysicsTable::new();
        assert!(table.is_empty());

        table.insert(PhysicsRule::new(
            EffectType::Financial,
            SyncStrategy::Pessimistic,
            1000,
            ConfirmationType::Required,
        ));

        assert_eq!(table.len(), 1);
        assert!(table.contains(&EffectType::Financial));
        assert!(!table.contains(&EffectType::Standard));

        let rule = table.get(&EffectType::Financial).unwrap();
        assert_eq!(rule.timing_ms, 1000);
    }

    #[test]
    fn test_physics_rule_serialize_deserialize() {
        let rule = PhysicsRule::new(
            EffectType::Financial,
            SyncStrategy::Pessimistic,
            800,
            ConfirmationType::Required,
        );

        let json = serde_json::to_string(&rule).unwrap();
        let deserialized: PhysicsRule = serde_json::from_str(&json).unwrap();

        assert_eq!(rule.effect, deserialized.effect);
        assert_eq!(rule.sync, deserialized.sync);
        assert_eq!(rule.timing_ms, deserialized.timing_ms);
        assert_eq!(rule.confirmation, deserialized.confirmation);
    }

    #[test]
    fn test_physics_table_iter() {
        let table = PhysicsTable::defaults();
        let rules: Vec<_> = table.iter().collect();
        assert_eq!(rules.len(), 8);
    }
}
