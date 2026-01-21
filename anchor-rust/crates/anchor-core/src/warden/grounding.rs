//! Grounding gate for validating physics claims.

use crate::error::AnchorError;
use crate::types::{ConfirmationType, EffectType, PhysicsTable, SyncStrategy, Zone};
use crate::warden::{resolve_effect_from_keywords, Vocabulary};
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::str::FromStr;

/// A grounding statement parsed from text.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GroundingStatement {
    /// Component name (e.g., "ClaimButton")
    pub component: String,
    /// Cited zone level
    pub cited_zone: Zone,
    /// Keywords found in the component
    pub keywords: Vec<String>,
    /// Claimed physics properties
    pub claimed_physics: ClaimedPhysics,
}

/// Physics properties claimed in a grounding statement.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ClaimedPhysics {
    /// Claimed sync strategy
    pub sync: Option<SyncStrategy>,
    /// Claimed timing in milliseconds
    pub timing_ms: Option<u32>,
    /// Claimed confirmation type
    pub confirmation: Option<ConfirmationType>,
    /// Claimed effect type
    pub effect: Option<EffectType>,
}

/// Result of a single validation check.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckResult {
    /// Name of the check
    pub name: String,
    /// Whether the check passed
    pub passed: bool,
    /// Reason for pass/fail
    pub reason: String,
}

impl CheckResult {
    /// Create a passing check result.
    pub fn pass(name: impl Into<String>, reason: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            passed: true,
            reason: reason.into(),
        }
    }

    /// Create a failing check result.
    pub fn fail(name: impl Into<String>, reason: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            passed: false,
            reason: reason.into(),
        }
    }
}

/// Validation status.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ValidationStatus {
    /// All checks passed
    Valid,
    /// Over-claiming (cited zone too restrictive)
    Drift,
    /// Under-claiming (cited zone too permissive)
    Deceptive,
    /// Schema/parsing error
    SchemaError,
}

impl std::fmt::Display for ValidationStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ValidationStatus::Valid => write!(f, "valid"),
            ValidationStatus::Drift => write!(f, "drift"),
            ValidationStatus::Deceptive => write!(f, "deceptive"),
            ValidationStatus::SchemaError => write!(f, "schema_error"),
        }
    }
}

/// Correction suggestion for failed validation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Correction {
    /// What should be changed
    pub field: String,
    /// Current value
    pub current: String,
    /// Suggested value
    pub suggested: String,
    /// Explanation
    pub reason: String,
}

/// Result of grounding validation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    /// Overall status
    pub status: ValidationStatus,
    /// Required zone based on detected effect
    pub required_zone: Zone,
    /// All check results
    pub checks: Vec<CheckResult>,
    /// Suggested corrections if validation failed
    pub corrections: Vec<Correction>,
    /// The parsed statement
    pub statement: Option<GroundingStatement>,
}

impl ValidationResult {
    /// Create a valid result.
    pub fn valid(required_zone: Zone, checks: Vec<CheckResult>) -> Self {
        Self {
            status: ValidationStatus::Valid,
            required_zone,
            checks,
            corrections: Vec::new(),
            statement: None,
        }
    }

    /// Create a drift result.
    pub fn drift(
        required_zone: Zone,
        checks: Vec<CheckResult>,
        corrections: Vec<Correction>,
    ) -> Self {
        Self {
            status: ValidationStatus::Drift,
            required_zone,
            checks,
            corrections,
            statement: None,
        }
    }

    /// Create a deceptive result.
    pub fn deceptive(
        required_zone: Zone,
        checks: Vec<CheckResult>,
        corrections: Vec<Correction>,
    ) -> Self {
        Self {
            status: ValidationStatus::Deceptive,
            required_zone,
            checks,
            corrections,
            statement: None,
        }
    }

    /// Create a schema error result.
    pub fn schema_error(reason: impl Into<String>) -> Self {
        Self {
            status: ValidationStatus::SchemaError,
            required_zone: Zone::Standard,
            checks: vec![CheckResult::fail("schema", reason)],
            corrections: Vec::new(),
            statement: None,
        }
    }

    /// Attach the parsed statement.
    pub fn with_statement(mut self, statement: GroundingStatement) -> Self {
        self.statement = Some(statement);
        self
    }

    /// Check if all checks passed.
    pub fn all_passed(&self) -> bool {
        self.checks.iter().all(|c| c.passed)
    }

    /// Get exit code for CLI.
    pub fn exit_code(&self) -> i32 {
        match self.status {
            ValidationStatus::Valid => 0,
            ValidationStatus::Drift => 1,
            ValidationStatus::Deceptive => 2,
            ValidationStatus::SchemaError => 6,
        }
    }
}

/// Parse a grounding statement from text.
///
/// Supports formats like:
/// ```text
/// Component: ClaimButton
/// Zone: critical
/// Keywords: claim, withdraw
/// Sync: pessimistic
/// Timing: 800ms
/// Confirmation: required
/// ```
pub fn parse_grounding_statement(text: &str) -> Result<GroundingStatement, AnchorError> {
    // Component pattern
    let component_regex = Regex::new(r"(?i)Component:\s*([^\n]+)")
        .map_err(|e| AnchorError::InvalidZone(e.to_string()))?;

    // Zone pattern
    let zone_regex =
        Regex::new(r"(?i)Zone:\s*(\w+)").map_err(|e| AnchorError::InvalidZone(e.to_string()))?;

    // Keywords pattern
    let keywords_regex = Regex::new(r"(?i)Keywords?:\s*([^\n]+)")
        .map_err(|e| AnchorError::InvalidZone(e.to_string()))?;

    // Sync pattern
    let sync_regex =
        Regex::new(r"(?i)Sync:\s*(\w+)").map_err(|e| AnchorError::InvalidZone(e.to_string()))?;

    // Timing pattern
    let timing_regex = Regex::new(r"(?i)Timing:\s*(\d+)\s*(?:ms)?")
        .map_err(|e| AnchorError::InvalidZone(e.to_string()))?;

    // Confirmation pattern
    let confirmation_regex = Regex::new(r"(?i)Confirmation:\s*([^\n]+)")
        .map_err(|e| AnchorError::InvalidZone(e.to_string()))?;

    // Effect pattern
    let effect_regex =
        Regex::new(r"(?i)Effect:\s*(\w+)").map_err(|e| AnchorError::InvalidZone(e.to_string()))?;

    // Extract component (required)
    let component = component_regex
        .captures(text)
        .and_then(|c| c.get(1))
        .map(|m| m.as_str().trim().to_string())
        .ok_or_else(|| AnchorError::InvalidZone("Missing Component field".to_string()))?;

    // Extract zone (required)
    let zone_str = zone_regex
        .captures(text)
        .and_then(|c| c.get(1))
        .map(|m| m.as_str().trim())
        .ok_or_else(|| AnchorError::InvalidZone("Missing Zone field".to_string()))?;

    let cited_zone = Zone::from_str(zone_str)?;

    // Extract keywords (optional but common)
    let keywords = keywords_regex
        .captures(text)
        .and_then(|c| c.get(1))
        .map(|m| {
            m.as_str()
                .split(',')
                .map(|s| s.trim().to_lowercase())
                .filter(|s| !s.is_empty())
                .collect()
        })
        .unwrap_or_default();

    // Extract claimed physics
    let sync = sync_regex
        .captures(text)
        .and_then(|c| c.get(1))
        .and_then(|m| parse_sync_strategy(m.as_str().trim()).ok());

    let timing_ms = timing_regex
        .captures(text)
        .and_then(|c| c.get(1))
        .and_then(|m| m.as_str().parse().ok());

    let confirmation = confirmation_regex
        .captures(text)
        .and_then(|c| c.get(1))
        .and_then(|m| parse_confirmation_type(m.as_str().trim()).ok());

    let effect = effect_regex
        .captures(text)
        .and_then(|c| c.get(1))
        .and_then(|m| parse_effect_type(m.as_str().trim()));

    Ok(GroundingStatement {
        component,
        cited_zone,
        keywords,
        claimed_physics: ClaimedPhysics {
            sync,
            timing_ms,
            confirmation,
            effect,
        },
    })
}

/// Parse sync strategy from string.
fn parse_sync_strategy(s: &str) -> Result<SyncStrategy, AnchorError> {
    let normalized = s.to_lowercase();
    match normalized.as_str() {
        "pessimistic" => Ok(SyncStrategy::Pessimistic),
        "optimistic" => Ok(SyncStrategy::Optimistic),
        "immediate" => Ok(SyncStrategy::Immediate),
        _ => Err(AnchorError::InvalidSyncStrategy(s.to_string())),
    }
}

/// Parse confirmation type from string.
fn parse_confirmation_type(s: &str) -> Result<ConfirmationType, AnchorError> {
    let normalized = s.to_lowercase().replace([' ', '+', '_'], "");
    match normalized.as_str() {
        "required" => Ok(ConfirmationType::Required),
        "toastundo" | "toast+undo" => Ok(ConfirmationType::ToastUndo),
        "none" => Ok(ConfirmationType::None),
        _ => Err(AnchorError::InvalidConfirmationType(s.to_string())),
    }
}

/// Parse effect type from string.
fn parse_effect_type(s: &str) -> Option<EffectType> {
    let normalized = s.to_lowercase().replace([' ', '-', '_'], "");
    match normalized.as_str() {
        "financial" => Some(EffectType::Financial),
        "destructive" => Some(EffectType::Destructive),
        "softdelete" => Some(EffectType::SoftDelete),
        "standard" => Some(EffectType::Standard),
        "navigation" => Some(EffectType::Navigation),
        "query" => Some(EffectType::Query),
        "local" | "localstate" => Some(EffectType::Local),
        "highfreq" | "highfrequency" => Some(EffectType::HighFreq),
        _ => None,
    }
}

/// Get the required zone for an effect type.
pub fn required_zone_for_effect(effect: EffectType) -> Zone {
    match effect {
        EffectType::Financial => Zone::Critical,
        EffectType::Destructive => Zone::Elevated,
        EffectType::SoftDelete => Zone::Standard,
        EffectType::Standard => Zone::Standard,
        EffectType::Navigation => Zone::Local,
        EffectType::Query => Zone::Standard,
        EffectType::Local => Zone::Local,
        EffectType::HighFreq => Zone::Local,
    }
}

/// Check relevance: verify zone matches component type.
///
/// Returns a check result indicating if the cited zone is appropriate
/// for the detected keywords/effect.
pub fn check_relevance(
    statement: &GroundingStatement,
    vocab: &Vocabulary,
) -> (CheckResult, Option<EffectType>) {
    // Detect effect from keywords
    let keywords_text = statement.keywords.join(" ");
    let detected_effect = if !keywords_text.is_empty() {
        resolve_effect_from_keywords(&keywords_text, &[], vocab)
    } else {
        statement.claimed_physics.effect
    };

    let detected_effect = match detected_effect {
        Some(e) => e,
        None => {
            return (
                CheckResult::fail(
                    "relevance",
                    "Could not detect effect from keywords or claimed effect",
                ),
                None,
            );
        }
    };

    let required = required_zone_for_effect(detected_effect);
    let cited = statement.cited_zone;

    if cited.is_at_least_as_restrictive_as(&required) {
        (
            CheckResult::pass(
                "relevance",
                format!(
                    "Cited zone {} is appropriate for {} effect (requires {})",
                    cited, detected_effect, required
                ),
            ),
            Some(detected_effect),
        )
    } else {
        (
            CheckResult::fail(
                "relevance",
                format!(
                    "Cited zone {} is less restrictive than required {} for {} effect",
                    cited, required, detected_effect
                ),
            ),
            Some(detected_effect),
        )
    }
}

/// Check hierarchy: verify cited zone >= required zone.
pub fn check_hierarchy(cited_zone: Zone, required_zone: Zone) -> CheckResult {
    if cited_zone.is_at_least_as_restrictive_as(&required_zone) {
        CheckResult::pass(
            "hierarchy",
            format!(
                "Cited zone {} meets or exceeds required zone {}",
                cited_zone, required_zone
            ),
        )
    } else {
        CheckResult::fail(
            "hierarchy",
            format!(
                "Cited zone {} is less restrictive than required {}",
                cited_zone, required_zone
            ),
        )
    }
}

/// Check rules: verify physics values match requirements.
pub fn check_rules(
    statement: &GroundingStatement,
    required_effect: EffectType,
    physics: &PhysicsTable,
) -> Vec<CheckResult> {
    let mut results = Vec::new();

    let required_rule = match physics.get(&required_effect) {
        Some(r) => r,
        None => {
            results.push(CheckResult::fail(
                "rules",
                format!("No physics rule found for effect {}", required_effect),
            ));
            return results;
        }
    };

    // Check sync strategy
    if let Some(claimed_sync) = statement.claimed_physics.sync {
        if claimed_sync == required_rule.sync {
            results.push(CheckResult::pass(
                "sync",
                format!("Claimed sync {} matches required", claimed_sync),
            ));
        } else {
            results.push(CheckResult::fail(
                "sync",
                format!(
                    "Claimed sync {} does not match required {}",
                    claimed_sync, required_rule.sync
                ),
            ));
        }
    }

    // Check timing
    if let Some(claimed_timing) = statement.claimed_physics.timing_ms {
        // Allow some tolerance for timing
        if claimed_timing >= required_rule.timing_ms {
            results.push(CheckResult::pass(
                "timing",
                format!(
                    "Claimed timing {}ms >= required {}ms",
                    claimed_timing, required_rule.timing_ms
                ),
            ));
        } else {
            results.push(CheckResult::fail(
                "timing",
                format!(
                    "Claimed timing {}ms < required {}ms",
                    claimed_timing, required_rule.timing_ms
                ),
            ));
        }
    }

    // Check confirmation
    if let Some(claimed_confirmation) = statement.claimed_physics.confirmation {
        let confirmation_matches = match required_rule.confirmation {
            ConfirmationType::Required => claimed_confirmation == ConfirmationType::Required,
            ConfirmationType::ToastUndo => matches!(
                claimed_confirmation,
                ConfirmationType::Required | ConfirmationType::ToastUndo
            ),
            ConfirmationType::None => true, // Any confirmation is acceptable
        };

        if confirmation_matches {
            results.push(CheckResult::pass(
                "confirmation",
                format!(
                    "Claimed confirmation {} is acceptable for required {}",
                    claimed_confirmation, required_rule.confirmation
                ),
            ));
        } else {
            results.push(CheckResult::fail(
                "confirmation",
                format!(
                    "Claimed confirmation {} does not meet required {}",
                    claimed_confirmation, required_rule.confirmation
                ),
            ));
        }
    }

    if results.is_empty() {
        results.push(CheckResult::pass(
            "rules",
            "No claimed physics values to validate",
        ));
    }

    results
}

/// Validate a grounding statement.
///
/// This is the main entry point for validation.
pub fn validate_grounding(
    statement: &GroundingStatement,
    vocab: &Vocabulary,
    physics: &PhysicsTable,
) -> ValidationResult {
    let mut checks = Vec::new();
    let mut corrections = Vec::new();

    // Check 1: Relevance
    let (relevance_check, detected_effect) = check_relevance(statement, vocab);
    checks.push(relevance_check.clone());

    let required_effect = match detected_effect {
        Some(e) => e,
        None => {
            return ValidationResult::schema_error("Could not detect effect type")
                .with_statement(statement.clone());
        }
    };

    let required_zone = required_zone_for_effect(required_effect);

    // Check 2: Hierarchy
    let hierarchy_check = check_hierarchy(statement.cited_zone, required_zone);
    checks.push(hierarchy_check.clone());

    // Check 3: Rules
    let rule_checks = check_rules(statement, required_effect, physics);
    checks.extend(rule_checks);

    // Determine status
    // Check drift first: over-claiming (cited zone more restrictive than needed)
    // This is still reported even if all other checks pass
    let all_passed = checks.iter().all(|c| c.passed);
    let status = if statement
        .cited_zone
        .is_more_restrictive_than(&required_zone)
    {
        // Over-claiming: cited zone is more restrictive than needed
        corrections.push(Correction {
            field: "zone".to_string(),
            current: statement.cited_zone.to_string(),
            suggested: required_zone.to_string(),
            reason: format!(
                "Zone {} is more restrictive than required {} for {} effect",
                statement.cited_zone, required_zone, required_effect
            ),
        });
        ValidationStatus::Drift
    } else if !statement
        .cited_zone
        .is_at_least_as_restrictive_as(&required_zone)
    {
        // Under-claiming: cited zone is less restrictive than needed
        corrections.push(Correction {
            field: "zone".to_string(),
            current: statement.cited_zone.to_string(),
            suggested: required_zone.to_string(),
            reason: format!(
                "Zone {} is less restrictive than required {} for {} effect",
                statement.cited_zone, required_zone, required_effect
            ),
        });
        ValidationStatus::Deceptive
    } else if all_passed {
        // Zone matches exactly and all checks pass
        ValidationStatus::Valid
    } else {
        // Zone matches but physics checks failed
        if let Some(rule) = physics.get(&required_effect) {
            if statement.claimed_physics.sync.is_some()
                && statement.claimed_physics.sync != Some(rule.sync)
            {
                corrections.push(Correction {
                    field: "sync".to_string(),
                    current: statement
                        .claimed_physics
                        .sync
                        .map(|s| s.to_string())
                        .unwrap_or_default(),
                    suggested: rule.sync.to_string(),
                    reason: format!(
                        "Sync should be {} for {} effect",
                        rule.sync, required_effect
                    ),
                });
            }
            if statement.claimed_physics.timing_ms.is_some()
                && statement.claimed_physics.timing_ms.unwrap() < rule.timing_ms
            {
                corrections.push(Correction {
                    field: "timing".to_string(),
                    current: format!("{}ms", statement.claimed_physics.timing_ms.unwrap_or(0)),
                    suggested: format!("{}ms", rule.timing_ms),
                    reason: format!(
                        "Timing should be at least {}ms for {} effect",
                        rule.timing_ms, required_effect
                    ),
                });
            }
        }
        ValidationStatus::Drift
    };

    ValidationResult {
        status,
        required_zone,
        checks,
        corrections,
        statement: Some(statement.clone()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_vocab() -> Vocabulary {
        Vocabulary::defaults()
    }

    fn test_physics() -> PhysicsTable {
        PhysicsTable::defaults()
    }

    // S6-T1: Statement Parser Tests
    #[test]
    fn test_parse_grounding_statement_basic() {
        let text = r#"
Component: ClaimButton
Zone: critical
Keywords: claim, withdraw
"#;
        let stmt = parse_grounding_statement(text).unwrap();
        assert_eq!(stmt.component, "ClaimButton");
        assert_eq!(stmt.cited_zone, Zone::Critical);
        assert_eq!(stmt.keywords, vec!["claim", "withdraw"]);
    }

    #[test]
    fn test_parse_grounding_statement_with_physics() {
        let text = r#"
Component: WithdrawButton
Zone: critical
Keywords: withdraw
Sync: pessimistic
Timing: 800ms
Confirmation: required
"#;
        let stmt = parse_grounding_statement(text).unwrap();
        assert_eq!(stmt.component, "WithdrawButton");
        assert_eq!(stmt.claimed_physics.sync, Some(SyncStrategy::Pessimistic));
        assert_eq!(stmt.claimed_physics.timing_ms, Some(800));
        assert_eq!(
            stmt.claimed_physics.confirmation,
            Some(ConfirmationType::Required)
        );
    }

    #[test]
    fn test_parse_grounding_statement_with_effect() {
        let text = r#"
Component: DeleteButton
Zone: elevated
Effect: destructive
"#;
        let stmt = parse_grounding_statement(text).unwrap();
        assert_eq!(stmt.claimed_physics.effect, Some(EffectType::Destructive));
    }

    #[test]
    fn test_parse_grounding_statement_case_insensitive() {
        let text = r#"
COMPONENT: TestButton
ZONE: STANDARD
KEYWORDS: Save, Update
SYNC: OPTIMISTIC
"#;
        let stmt = parse_grounding_statement(text).unwrap();
        assert_eq!(stmt.component, "TestButton");
        assert_eq!(stmt.cited_zone, Zone::Standard);
        assert_eq!(stmt.claimed_physics.sync, Some(SyncStrategy::Optimistic));
    }

    #[test]
    fn test_parse_grounding_statement_missing_component() {
        let text = "Zone: critical";
        let result = parse_grounding_statement(text);
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_grounding_statement_missing_zone() {
        let text = "Component: TestButton";
        let result = parse_grounding_statement(text);
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_grounding_statement_timing_without_ms() {
        let text = r#"
Component: TestButton
Zone: standard
Timing: 200
"#;
        let stmt = parse_grounding_statement(text).unwrap();
        assert_eq!(stmt.claimed_physics.timing_ms, Some(200));
    }

    #[test]
    fn test_parse_grounding_statement_empty_keywords() {
        let text = r#"
Component: TestButton
Zone: local
"#;
        let stmt = parse_grounding_statement(text).unwrap();
        assert!(stmt.keywords.is_empty());
    }

    #[test]
    fn test_parse_confirmation_toast_undo() {
        let text = r#"
Component: ArchiveButton
Zone: standard
Confirmation: toast+undo
"#;
        let stmt = parse_grounding_statement(text).unwrap();
        assert_eq!(
            stmt.claimed_physics.confirmation,
            Some(ConfirmationType::ToastUndo)
        );
    }

    #[test]
    fn test_parse_sync_immediate() {
        let text = r#"
Component: ToggleButton
Zone: local
Sync: immediate
"#;
        let stmt = parse_grounding_statement(text).unwrap();
        assert_eq!(stmt.claimed_physics.sync, Some(SyncStrategy::Immediate));
    }

    // S6-T2: Validation Checks Tests
    #[test]
    fn test_check_relevance_financial() {
        let vocab = test_vocab();
        let stmt = GroundingStatement {
            component: "ClaimButton".to_string(),
            cited_zone: Zone::Critical,
            keywords: vec!["claim".to_string()],
            claimed_physics: ClaimedPhysics::default(),
        };

        let (result, effect) = check_relevance(&stmt, &vocab);
        assert!(result.passed);
        assert_eq!(effect, Some(EffectType::Financial));
    }

    #[test]
    fn test_check_relevance_underclaim() {
        let vocab = test_vocab();
        let stmt = GroundingStatement {
            component: "ClaimButton".to_string(),
            cited_zone: Zone::Standard, // Should be Critical
            keywords: vec!["claim".to_string()],
            claimed_physics: ClaimedPhysics::default(),
        };

        let (result, effect) = check_relevance(&stmt, &vocab);
        assert!(!result.passed);
        assert_eq!(effect, Some(EffectType::Financial));
    }

    #[test]
    fn test_check_hierarchy_pass() {
        let result = check_hierarchy(Zone::Critical, Zone::Critical);
        assert!(result.passed);

        let result = check_hierarchy(Zone::Critical, Zone::Standard);
        assert!(result.passed);
    }

    #[test]
    fn test_check_hierarchy_fail() {
        let result = check_hierarchy(Zone::Standard, Zone::Critical);
        assert!(!result.passed);

        let result = check_hierarchy(Zone::Local, Zone::Elevated);
        assert!(!result.passed);
    }

    #[test]
    fn test_check_rules_sync_match() {
        let physics = test_physics();
        let stmt = GroundingStatement {
            component: "TestButton".to_string(),
            cited_zone: Zone::Critical,
            keywords: vec!["claim".to_string()],
            claimed_physics: ClaimedPhysics {
                sync: Some(SyncStrategy::Pessimistic),
                timing_ms: None,
                confirmation: None,
                effect: None,
            },
        };

        let results = check_rules(&stmt, EffectType::Financial, &physics);
        assert!(results.iter().any(|r| r.name == "sync" && r.passed));
    }

    #[test]
    fn test_check_rules_timing_fail() {
        let physics = test_physics();
        let stmt = GroundingStatement {
            component: "TestButton".to_string(),
            cited_zone: Zone::Critical,
            keywords: vec!["claim".to_string()],
            claimed_physics: ClaimedPhysics {
                sync: None,
                timing_ms: Some(200), // Should be 800ms for financial
                confirmation: None,
                effect: None,
            },
        };

        let results = check_rules(&stmt, EffectType::Financial, &physics);
        assert!(results.iter().any(|r| r.name == "timing" && !r.passed));
    }

    // S6-T3: Grounding Gate Tests
    #[test]
    fn test_validate_grounding_valid() {
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
                effect: None,
            },
        };

        let result = validate_grounding(&stmt, &vocab, &physics);
        assert_eq!(result.status, ValidationStatus::Valid);
        assert_eq!(result.required_zone, Zone::Critical);
        assert!(result.all_passed());
    }

    #[test]
    fn test_validate_grounding_drift() {
        let vocab = test_vocab();
        let physics = test_physics();
        let stmt = GroundingStatement {
            component: "SaveButton".to_string(),
            cited_zone: Zone::Critical, // Over-claiming for standard save
            keywords: vec!["save".to_string()],
            claimed_physics: ClaimedPhysics::default(),
        };

        let result = validate_grounding(&stmt, &vocab, &physics);
        assert_eq!(result.status, ValidationStatus::Drift);
        assert_eq!(result.required_zone, Zone::Standard);
    }

    #[test]
    fn test_validate_grounding_deceptive() {
        let vocab = test_vocab();
        let physics = test_physics();
        let stmt = GroundingStatement {
            component: "ClaimButton".to_string(),
            cited_zone: Zone::Local, // Under-claiming for financial
            keywords: vec!["claim".to_string()],
            claimed_physics: ClaimedPhysics::default(),
        };

        let result = validate_grounding(&stmt, &vocab, &physics);
        assert_eq!(result.status, ValidationStatus::Deceptive);
        assert_eq!(result.required_zone, Zone::Critical);
        assert!(!result.corrections.is_empty());
    }

    #[test]
    fn test_validate_grounding_with_corrections() {
        let vocab = test_vocab();
        let physics = test_physics();
        let stmt = GroundingStatement {
            component: "WithdrawButton".to_string(),
            cited_zone: Zone::Standard, // Should be Critical
            keywords: vec!["withdraw".to_string()],
            claimed_physics: ClaimedPhysics::default(),
        };

        let result = validate_grounding(&stmt, &vocab, &physics);
        assert!(!result.corrections.is_empty());
        let zone_correction = result.corrections.iter().find(|c| c.field == "zone");
        assert!(zone_correction.is_some());
        assert_eq!(zone_correction.unwrap().suggested, "critical");
    }

    #[test]
    fn test_validation_result_exit_codes() {
        assert_eq!(
            ValidationResult::valid(Zone::Standard, vec![]).exit_code(),
            0
        );
        assert_eq!(
            ValidationResult::drift(Zone::Standard, vec![], vec![]).exit_code(),
            1
        );
        assert_eq!(
            ValidationResult::deceptive(Zone::Standard, vec![], vec![]).exit_code(),
            2
        );
        assert_eq!(ValidationResult::schema_error("test").exit_code(), 6);
    }

    #[test]
    fn test_required_zone_for_effect() {
        assert_eq!(
            required_zone_for_effect(EffectType::Financial),
            Zone::Critical
        );
        assert_eq!(
            required_zone_for_effect(EffectType::Destructive),
            Zone::Elevated
        );
        assert_eq!(
            required_zone_for_effect(EffectType::Standard),
            Zone::Standard
        );
        assert_eq!(required_zone_for_effect(EffectType::Local), Zone::Local);
    }

    #[test]
    fn test_validate_destructive() {
        let vocab = test_vocab();
        let physics = test_physics();
        let stmt = GroundingStatement {
            component: "DeleteButton".to_string(),
            cited_zone: Zone::Elevated,
            keywords: vec!["delete".to_string()],
            claimed_physics: ClaimedPhysics {
                sync: Some(SyncStrategy::Pessimistic),
                timing_ms: Some(600),
                confirmation: Some(ConfirmationType::Required),
                effect: None,
            },
        };

        let result = validate_grounding(&stmt, &vocab, &physics);
        assert_eq!(result.status, ValidationStatus::Valid);
        assert_eq!(result.required_zone, Zone::Elevated);
    }
}
