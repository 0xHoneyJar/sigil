//! Adversarial warden for enhanced validation with learned rules.

use crate::types::{PhysicsTable, Zone};
use crate::warden::grounding::{
    check_hierarchy, check_relevance, check_rules, required_zone_for_effect, CheckResult,
    Correction, GroundingStatement, ValidationResult, ValidationStatus,
};
use crate::warden::Vocabulary;
use serde::{Deserialize, Serialize};
use std::sync::OnceLock;
use tokio::sync::RwLock;

/// A learned rule for adversarial validation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LearnedRule {
    /// Unique identifier for the rule
    pub id: String,
    /// Pattern to match (component name or keyword pattern)
    pub pattern: String,
    /// Required zone for matches
    pub required_zone: Zone,
    /// Reason for the rule
    pub reason: String,
    /// Whether to fail validation or just warn
    pub is_strict: bool,
}

impl LearnedRule {
    /// Create a new learned rule.
    pub fn new(
        id: impl Into<String>,
        pattern: impl Into<String>,
        required_zone: Zone,
        reason: impl Into<String>,
    ) -> Self {
        Self {
            id: id.into(),
            pattern: pattern.into(),
            required_zone,
            reason: reason.into(),
            is_strict: true,
        }
    }

    /// Create a warning-only rule.
    pub fn warning(
        id: impl Into<String>,
        pattern: impl Into<String>,
        required_zone: Zone,
        reason: impl Into<String>,
    ) -> Self {
        Self {
            id: id.into(),
            pattern: pattern.into(),
            required_zone,
            reason: reason.into(),
            is_strict: false,
        }
    }

    /// Check if this rule matches the statement.
    pub fn matches(&self, statement: &GroundingStatement) -> bool {
        let pattern_lower = self.pattern.to_lowercase();

        // Match component name
        if statement.component.to_lowercase().contains(&pattern_lower) {
            return true;
        }

        // Match keywords
        statement
            .keywords
            .iter()
            .any(|k| k.to_lowercase().contains(&pattern_lower))
    }
}

/// Result of adversarial validation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdversarialResult {
    /// Base validation result
    pub base_result: ValidationResult,
    /// Adversarial check results
    pub adversarial_checks: Vec<CheckResult>,
    /// Drift detection result
    pub drift_detected: bool,
    /// Deceptive detection result
    pub deceptive_detected: bool,
    /// Matched learned rules
    pub matched_rules: Vec<String>,
}

impl AdversarialResult {
    /// Get overall status.
    pub fn status(&self) -> ValidationStatus {
        if self.deceptive_detected {
            ValidationStatus::Deceptive
        } else if self.drift_detected {
            ValidationStatus::Drift
        } else {
            self.base_result.status
        }
    }

    /// Get exit code.
    pub fn exit_code(&self) -> i32 {
        match self.status() {
            ValidationStatus::Valid => 0,
            ValidationStatus::Drift => 1,
            ValidationStatus::Deceptive => 2,
            ValidationStatus::SchemaError => 6,
        }
    }

    /// Check if all checks passed.
    pub fn all_passed(&self) -> bool {
        self.base_result.all_passed() && self.adversarial_checks.iter().all(|c| c.passed)
    }
}

/// Global warden instance.
static GLOBAL_WARDEN: OnceLock<RwLock<AdversarialWarden>> = OnceLock::new();

/// Get the global warden instance.
pub fn get_warden() -> &'static RwLock<AdversarialWarden> {
    GLOBAL_WARDEN.get_or_init(|| RwLock::new(AdversarialWarden::new()))
}

/// Reset the global warden instance (for testing).
#[cfg(test)]
pub async fn reset_warden() {
    let warden = get_warden();
    let mut guard = warden.write().await;
    guard.clear_learned_rules();
}

/// Adversarial warden with learned rules.
#[derive(Debug, Clone, Default)]
pub struct AdversarialWarden {
    /// Learned rules for enhanced validation
    learned_rules: Vec<LearnedRule>,
}

impl AdversarialWarden {
    /// Create a new adversarial warden.
    pub fn new() -> Self {
        Self {
            learned_rules: Vec::new(),
        }
    }

    /// Add a learned rule.
    pub fn add_learned_rule(&mut self, rule: LearnedRule) {
        self.learned_rules.push(rule);
    }

    /// Clear all learned rules.
    pub fn clear_learned_rules(&mut self) {
        self.learned_rules.clear();
    }

    /// Get all learned rules.
    pub fn get_learned_rules(&self) -> &[LearnedRule] {
        &self.learned_rules
    }

    /// Check a statement against learned rules.
    pub fn check_learned_rules(&self, statement: &GroundingStatement) -> Vec<CheckResult> {
        let mut results = Vec::new();

        for rule in &self.learned_rules {
            if rule.matches(statement) {
                let check_result = check_hierarchy(statement.cited_zone, rule.required_zone);

                if check_result.passed {
                    results.push(CheckResult::pass(
                        format!("learned_rule:{}", rule.id),
                        format!(
                            "Matches rule '{}': zone {} meets required {}",
                            rule.id, statement.cited_zone, rule.required_zone
                        ),
                    ));
                } else if rule.is_strict {
                    results.push(CheckResult::fail(
                        format!("learned_rule:{}", rule.id),
                        format!(
                            "Matches rule '{}': zone {} fails required {} - {}",
                            rule.id, statement.cited_zone, rule.required_zone, rule.reason
                        ),
                    ));
                } else {
                    results.push(CheckResult::pass(
                        format!("learned_rule:{}", rule.id),
                        format!(
                            "Warning: Matches rule '{}' - {} (zone {} < {})",
                            rule.id, rule.reason, statement.cited_zone, rule.required_zone
                        ),
                    ));
                }
            }
        }

        results
    }

    /// Detect drift (over-claiming).
    ///
    /// Drift occurs when the cited zone is more restrictive than required.
    fn detect_drift(&self, cited_zone: Zone, required_zone: Zone) -> bool {
        cited_zone.is_more_restrictive_than(&required_zone)
    }

    /// Detect deceptive (under-claiming).
    ///
    /// Deceptive occurs when the cited zone is less restrictive than required.
    fn detect_deceptive(&self, cited_zone: Zone, required_zone: Zone) -> bool {
        !cited_zone.is_at_least_as_restrictive_as(&required_zone)
    }

    /// Validate a grounding statement with adversarial checks.
    pub fn validate(
        &self,
        statement: &GroundingStatement,
        vocab: &Vocabulary,
        physics: &PhysicsTable,
    ) -> AdversarialResult {
        // Run base validation
        let mut base_checks = Vec::new();
        let mut corrections = Vec::new();

        // Check relevance
        let (relevance_check, detected_effect) = check_relevance(statement, vocab);
        base_checks.push(relevance_check.clone());

        let required_effect = match detected_effect {
            Some(e) => e,
            None => {
                return AdversarialResult {
                    base_result: ValidationResult::schema_error("Could not detect effect type")
                        .with_statement(statement.clone()),
                    adversarial_checks: Vec::new(),
                    drift_detected: false,
                    deceptive_detected: false,
                    matched_rules: Vec::new(),
                };
            }
        };

        let required_zone = required_zone_for_effect(required_effect);

        // Check hierarchy
        let hierarchy_check = check_hierarchy(statement.cited_zone, required_zone);
        base_checks.push(hierarchy_check);

        // Check rules
        let rule_checks = check_rules(statement, required_effect, physics);
        base_checks.extend(rule_checks);

        // Detect drift and deceptive
        let drift_detected = self.detect_drift(statement.cited_zone, required_zone);
        let deceptive_detected = self.detect_deceptive(statement.cited_zone, required_zone);

        // Build corrections
        if drift_detected {
            corrections.push(Correction {
                field: "zone".to_string(),
                current: statement.cited_zone.to_string(),
                suggested: required_zone.to_string(),
                reason: format!(
                    "Zone {} is more restrictive than required {} (drift)",
                    statement.cited_zone, required_zone
                ),
            });
        } else if deceptive_detected {
            corrections.push(Correction {
                field: "zone".to_string(),
                current: statement.cited_zone.to_string(),
                suggested: required_zone.to_string(),
                reason: format!(
                    "Zone {} is less restrictive than required {} (deceptive)",
                    statement.cited_zone, required_zone
                ),
            });
        }

        // Determine base status
        let base_all_passed = base_checks.iter().all(|c| c.passed);
        let base_status = if deceptive_detected {
            ValidationStatus::Deceptive
        } else if drift_detected {
            ValidationStatus::Drift
        } else if base_all_passed {
            ValidationStatus::Valid
        } else {
            ValidationStatus::Drift
        };

        let base_result = ValidationResult {
            status: base_status,
            required_zone,
            checks: base_checks,
            corrections,
            statement: Some(statement.clone()),
        };

        // Run adversarial checks (learned rules)
        let adversarial_checks = self.check_learned_rules(statement);
        let matched_rules: Vec<String> = self
            .learned_rules
            .iter()
            .filter(|r| r.matches(statement))
            .map(|r| r.id.clone())
            .collect();

        // Check if any learned rules cause drift/deceptive
        let learned_causes_failure = adversarial_checks.iter().any(|c| !c.passed);

        AdversarialResult {
            base_result,
            adversarial_checks,
            drift_detected: drift_detected || learned_causes_failure,
            deceptive_detected,
            matched_rules,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{ConfirmationType, EffectType, SyncStrategy};
    use crate::warden::grounding::ClaimedPhysics;

    fn test_vocab() -> Vocabulary {
        Vocabulary::defaults()
    }

    fn test_physics() -> PhysicsTable {
        PhysicsTable::defaults()
    }

    #[test]
    fn test_adversarial_warden_new() {
        let warden = AdversarialWarden::new();
        assert!(warden.learned_rules.is_empty());
    }

    #[test]
    fn test_add_learned_rule() {
        let mut warden = AdversarialWarden::new();
        warden.add_learned_rule(LearnedRule::new(
            "test-rule",
            "claim",
            Zone::Critical,
            "Claims require critical zone",
        ));

        assert_eq!(warden.learned_rules.len(), 1);
        assert_eq!(warden.learned_rules[0].id, "test-rule");
    }

    #[test]
    fn test_clear_learned_rules() {
        let mut warden = AdversarialWarden::new();
        warden.add_learned_rule(LearnedRule::new(
            "test-rule",
            "claim",
            Zone::Critical,
            "Test",
        ));
        assert_eq!(warden.learned_rules.len(), 1);

        warden.clear_learned_rules();
        assert!(warden.learned_rules.is_empty());
    }

    #[test]
    fn test_get_learned_rules() {
        let mut warden = AdversarialWarden::new();
        warden.add_learned_rule(LearnedRule::new("rule1", "claim", Zone::Critical, "Test 1"));
        warden.add_learned_rule(LearnedRule::new(
            "rule2",
            "delete",
            Zone::Elevated,
            "Test 2",
        ));

        let rules = warden.get_learned_rules();
        assert_eq!(rules.len(), 2);
    }

    #[test]
    fn test_learned_rule_matches_component() {
        let rule = LearnedRule::new("test", "Claim", Zone::Critical, "Test");

        let stmt = GroundingStatement {
            component: "ClaimButton".to_string(),
            cited_zone: Zone::Critical,
            keywords: vec![],
            claimed_physics: ClaimedPhysics::default(),
        };

        assert!(rule.matches(&stmt));
    }

    #[test]
    fn test_learned_rule_matches_keyword() {
        let rule = LearnedRule::new("test", "withdraw", Zone::Critical, "Test");

        let stmt = GroundingStatement {
            component: "TestButton".to_string(),
            cited_zone: Zone::Critical,
            keywords: vec!["withdraw".to_string()],
            claimed_physics: ClaimedPhysics::default(),
        };

        assert!(rule.matches(&stmt));
    }

    #[test]
    fn test_learned_rule_no_match() {
        let rule = LearnedRule::new("test", "claim", Zone::Critical, "Test");

        let stmt = GroundingStatement {
            component: "SaveButton".to_string(),
            cited_zone: Zone::Standard,
            keywords: vec!["save".to_string()],
            claimed_physics: ClaimedPhysics::default(),
        };

        assert!(!rule.matches(&stmt));
    }

    #[test]
    fn test_check_learned_rules_pass() {
        let mut warden = AdversarialWarden::new();
        warden.add_learned_rule(LearnedRule::new(
            "claim-critical",
            "claim",
            Zone::Critical,
            "Claims require critical zone",
        ));

        let stmt = GroundingStatement {
            component: "ClaimButton".to_string(),
            cited_zone: Zone::Critical,
            keywords: vec!["claim".to_string()],
            claimed_physics: ClaimedPhysics::default(),
        };

        let results = warden.check_learned_rules(&stmt);
        assert_eq!(results.len(), 1);
        assert!(results[0].passed);
    }

    #[test]
    fn test_check_learned_rules_fail() {
        let mut warden = AdversarialWarden::new();
        warden.add_learned_rule(LearnedRule::new(
            "claim-critical",
            "claim",
            Zone::Critical,
            "Claims require critical zone",
        ));

        let stmt = GroundingStatement {
            component: "ClaimButton".to_string(),
            cited_zone: Zone::Standard, // Wrong zone
            keywords: vec!["claim".to_string()],
            claimed_physics: ClaimedPhysics::default(),
        };

        let results = warden.check_learned_rules(&stmt);
        assert_eq!(results.len(), 1);
        assert!(!results[0].passed);
    }

    #[test]
    fn test_warning_rule_does_not_fail() {
        let mut warden = AdversarialWarden::new();
        warden.add_learned_rule(LearnedRule::warning(
            "soft-warning",
            "save",
            Zone::Elevated,
            "Elevated saves are recommended",
        ));

        let stmt = GroundingStatement {
            component: "SaveButton".to_string(),
            cited_zone: Zone::Standard,
            keywords: vec!["save".to_string()],
            claimed_physics: ClaimedPhysics::default(),
        };

        let results = warden.check_learned_rules(&stmt);
        assert_eq!(results.len(), 1);
        assert!(results[0].passed); // Warning doesn't fail
    }

    #[test]
    fn test_detect_drift() {
        let warden = AdversarialWarden::new();

        // Over-claiming: critical for standard action
        assert!(warden.detect_drift(Zone::Critical, Zone::Standard));

        // Not drift: matching zones
        assert!(!warden.detect_drift(Zone::Critical, Zone::Critical));

        // Not drift: under-claiming
        assert!(!warden.detect_drift(Zone::Standard, Zone::Critical));
    }

    #[test]
    fn test_detect_deceptive() {
        let warden = AdversarialWarden::new();

        // Under-claiming: standard for critical action
        assert!(warden.detect_deceptive(Zone::Standard, Zone::Critical));

        // Not deceptive: matching zones
        assert!(!warden.detect_deceptive(Zone::Critical, Zone::Critical));

        // Not deceptive: over-claiming
        assert!(!warden.detect_deceptive(Zone::Critical, Zone::Standard));
    }

    #[test]
    fn test_validate_valid() {
        let warden = AdversarialWarden::new();
        let vocab = test_vocab();
        let physics = test_physics();

        let stmt = GroundingStatement {
            component: "ClaimButton".to_string(),
            cited_zone: Zone::Critical,
            keywords: vec!["claim".to_string()],
            claimed_physics: ClaimedPhysics {
                sync: Some(SyncStrategy::Pessimistic),
                timing_ms: Some(800),
                confirmation: Some(ConfirmationType::Required),
                effect: Some(EffectType::Financial),
            },
        };

        let result = warden.validate(&stmt, &vocab, &physics);
        assert_eq!(result.status(), ValidationStatus::Valid);
        assert!(!result.drift_detected);
        assert!(!result.deceptive_detected);
    }

    #[test]
    fn test_validate_drift() {
        let warden = AdversarialWarden::new();
        let vocab = test_vocab();
        let physics = test_physics();

        let stmt = GroundingStatement {
            component: "SaveButton".to_string(),
            cited_zone: Zone::Critical, // Over-claiming
            keywords: vec!["save".to_string()],
            claimed_physics: ClaimedPhysics::default(),
        };

        let result = warden.validate(&stmt, &vocab, &physics);
        assert_eq!(result.status(), ValidationStatus::Drift);
        assert!(result.drift_detected);
        assert!(!result.deceptive_detected);
    }

    #[test]
    fn test_validate_deceptive() {
        let warden = AdversarialWarden::new();
        let vocab = test_vocab();
        let physics = test_physics();

        let stmt = GroundingStatement {
            component: "ClaimButton".to_string(),
            cited_zone: Zone::Local, // Under-claiming
            keywords: vec!["claim".to_string()],
            claimed_physics: ClaimedPhysics::default(),
        };

        let result = warden.validate(&stmt, &vocab, &physics);
        assert_eq!(result.status(), ValidationStatus::Deceptive);
        assert!(!result.drift_detected);
        assert!(result.deceptive_detected);
    }

    #[test]
    fn test_validate_with_learned_rules() {
        let mut warden = AdversarialWarden::new();
        warden.add_learned_rule(LearnedRule::new(
            "special-claim",
            "special",
            Zone::Critical,
            "Special buttons require critical zone",
        ));

        let vocab = test_vocab();
        let physics = test_physics();

        let stmt = GroundingStatement {
            component: "SpecialButton".to_string(),
            cited_zone: Zone::Standard,         // Fails learned rule
            keywords: vec!["save".to_string()], // Would be standard
            claimed_physics: ClaimedPhysics::default(),
        };

        let result = warden.validate(&stmt, &vocab, &physics);
        assert!(!result.adversarial_checks.is_empty());
        assert!(result.matched_rules.contains(&"special-claim".to_string()));
    }

    #[test]
    fn test_adversarial_result_exit_codes() {
        let base_valid = ValidationResult::valid(Zone::Standard, vec![]);
        let result_valid = AdversarialResult {
            base_result: base_valid,
            adversarial_checks: vec![],
            drift_detected: false,
            deceptive_detected: false,
            matched_rules: vec![],
        };
        assert_eq!(result_valid.exit_code(), 0);

        let base_drift = ValidationResult::drift(Zone::Standard, vec![], vec![]);
        let result_drift = AdversarialResult {
            base_result: base_drift,
            adversarial_checks: vec![],
            drift_detected: true,
            deceptive_detected: false,
            matched_rules: vec![],
        };
        assert_eq!(result_drift.exit_code(), 1);

        let base_deceptive = ValidationResult::deceptive(Zone::Critical, vec![], vec![]);
        let result_deceptive = AdversarialResult {
            base_result: base_deceptive,
            adversarial_checks: vec![],
            drift_detected: false,
            deceptive_detected: true,
            matched_rules: vec![],
        };
        assert_eq!(result_deceptive.exit_code(), 2);
    }

    #[tokio::test]
    async fn test_global_warden() {
        let warden = get_warden();

        // Clear any previous state
        {
            let mut guard = warden.write().await;
            guard.clear_learned_rules();
        }

        // Add a rule
        {
            let mut guard = warden.write().await;
            guard.add_learned_rule(LearnedRule::new(
                "global-test",
                "test",
                Zone::Standard,
                "Test rule",
            ));
        }

        // Verify rule exists
        {
            let guard = warden.read().await;
            assert_eq!(guard.get_learned_rules().len(), 1);
        }

        // Reset for other tests
        reset_warden().await;
    }
}
