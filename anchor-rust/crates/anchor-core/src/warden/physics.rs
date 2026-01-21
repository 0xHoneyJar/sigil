//! Physics loader for parsing Sigil physics rules from markdown.

use crate::error::AnchorError;
use crate::types::{ConfirmationType, EffectType, PhysicsRule, PhysicsTable, SyncStrategy};
use regex::Regex;
use std::path::Path;
use std::sync::OnceLock;
use tokio::fs;
use tokio::sync::RwLock;

/// Global physics cache using OnceLock for thread-safe lazy initialization.
static PHYSICS_CACHE: OnceLock<RwLock<Option<PhysicsTable>>> = OnceLock::new();

/// Get the physics cache, initializing it if needed.
fn get_cache() -> &'static RwLock<Option<PhysicsTable>> {
    PHYSICS_CACHE.get_or_init(|| RwLock::new(None))
}

/// Physics loader for parsing rules from markdown files.
#[derive(Debug, Default)]
pub struct PhysicsLoader {
    /// Custom physics file path (optional)
    physics_path: Option<String>,
}

impl PhysicsLoader {
    /// Create a new physics loader.
    pub fn new() -> Self {
        Self { physics_path: None }
    }

    /// Set a custom physics file path.
    pub fn with_path(mut self, path: impl Into<String>) -> Self {
        self.physics_path = Some(path.into());
        self
    }

    /// Load physics from configured source.
    pub async fn load(&self) -> Result<PhysicsTable, AnchorError> {
        if let Some(ref path) = self.physics_path {
            load_physics(path).await
        } else {
            Ok(get_default_physics())
        }
    }
}

/// Load physics rules from a markdown file.
///
/// Parses the `<physics_table>` section and extracts rules from the table.
pub async fn load_physics(path: impl AsRef<Path>) -> Result<PhysicsTable, AnchorError> {
    let content = fs::read_to_string(path.as_ref()).await?;
    parse_physics_from_markdown(&content)
}

/// Load physics with caching. Returns cached value if available.
pub async fn load_physics_cached(path: impl AsRef<Path>) -> Result<PhysicsTable, AnchorError> {
    let cache = get_cache();

    // Try to get cached value first
    {
        let guard = cache.read().await;
        if let Some(ref table) = *guard {
            return Ok(table.clone());
        }
    }

    // Load from file and cache
    let table = load_physics(path).await?;
    {
        let mut guard = cache.write().await;
        *guard = Some(table.clone());
    }

    Ok(table)
}

/// Clear the physics cache (for testing).
#[cfg(test)]
pub async fn clear_physics_cache() {
    let cache = get_cache();
    let mut guard = cache.write().await;
    *guard = None;
}

/// Get default physics rules (embedded fallback).
///
/// Returns the standard Sigil physics table matching TypeScript implementation.
pub fn get_default_physics() -> PhysicsTable {
    PhysicsTable::defaults()
}

/// Parse physics rules from markdown content.
fn parse_physics_from_markdown(content: &str) -> Result<PhysicsTable, AnchorError> {
    let mut table = PhysicsTable::new();

    // Extract content between <physics_table> tags
    let table_content = extract_tag_content(content, "physics_table")?;

    // Parse table rows
    // Format: | Effect | Sync | Timing | Confirmation | Why |
    let row_regex = Regex::new(r"\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*(\d+)ms\s*\|\s*([^|]+)\s*\|")
        .map_err(|e| AnchorError::InvalidSyncStrategy(e.to_string()))?;

    for cap in row_regex.captures_iter(&table_content) {
        let effect_str = cap.get(1).map(|m| m.as_str().trim()).unwrap_or("");
        let sync_str = cap.get(2).map(|m| m.as_str().trim()).unwrap_or("");
        let timing_str = cap.get(3).map(|m| m.as_str().trim()).unwrap_or("0");
        let confirm_str = cap.get(4).map(|m| m.as_str().trim()).unwrap_or("");

        // Skip header row
        if effect_str.to_lowercase() == "effect" {
            continue;
        }

        // Parse effect type
        let effect = match parse_effect_type(effect_str) {
            Some(e) => e,
            None => continue, // Skip unknown effects
        };

        // Parse sync strategy
        let sync = parse_sync_strategy(sync_str)?;

        // Parse timing
        let timing_ms: u32 = timing_str.parse().map_err(|_| {
            AnchorError::InvalidSyncStrategy(format!("Invalid timing: {}", timing_str))
        })?;

        // Parse confirmation
        let confirmation = parse_confirmation_type(confirm_str)?;

        table.insert(PhysicsRule::new(effect, sync, timing_ms, confirmation));
    }

    // If no rules parsed, return defaults
    if table.is_empty() {
        return Ok(get_default_physics());
    }

    Ok(table)
}

/// Extract content between XML-style tags.
fn extract_tag_content(content: &str, tag: &str) -> Result<String, AnchorError> {
    let open_tag = format!("<{}>", tag);
    let close_tag = format!("</{}>", tag);

    let start = content
        .find(&open_tag)
        .ok_or_else(|| AnchorError::InvalidZone(format!("Missing <{}> tag", tag)))?;
    let end = content
        .find(&close_tag)
        .ok_or_else(|| AnchorError::InvalidZone(format!("Missing </{}> tag", tag)))?;

    Ok(content[start + open_tag.len()..end].to_string())
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
    let normalized = s.to_lowercase().replace([' ', '+'], "");
    match normalized.as_str() {
        "required" => Ok(ConfirmationType::Required),
        "toastundo" | "toast+undo" => Ok(ConfirmationType::ToastUndo),
        "none" => Ok(ConfirmationType::None),
        _ => Err(AnchorError::InvalidConfirmationType(s.to_string())),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    const TEST_PHYSICS_MD: &str = r#"
# Sigil: Behavioral Physics

<physics_table>
## The Physics Table

| Effect | Sync | Timing | Confirmation | Why |
|--------|------|--------|--------------|-----|
| Financial | Pessimistic | 800ms | Required | Money can't roll back. |
| Destructive | Pessimistic | 600ms | Required | Permanent actions. |
| Soft Delete | Optimistic | 200ms | Toast + Undo | Undo exists. |
| Standard | Optimistic | 200ms | None | Low stakes. |
| Navigation | Immediate | 150ms | None | URL changes feel instant. |
| Query | Optimistic | 150ms | None | Data retrieval. |
| Local State | Immediate | 100ms | None | No server. |
| High-freq | Immediate | 0ms | None | Animation becomes friction. |
</physics_table>
"#;

    #[test]
    fn test_parse_physics_from_markdown() {
        let table = parse_physics_from_markdown(TEST_PHYSICS_MD).unwrap();

        assert_eq!(table.len(), 8);

        let financial = table.get(&EffectType::Financial).unwrap();
        assert_eq!(financial.sync, SyncStrategy::Pessimistic);
        assert_eq!(financial.timing_ms, 800);
        assert_eq!(financial.confirmation, ConfirmationType::Required);

        let soft_delete = table.get(&EffectType::SoftDelete).unwrap();
        assert_eq!(soft_delete.sync, SyncStrategy::Optimistic);
        assert_eq!(soft_delete.timing_ms, 200);
        assert_eq!(soft_delete.confirmation, ConfirmationType::ToastUndo);

        let local = table.get(&EffectType::Local).unwrap();
        assert_eq!(local.sync, SyncStrategy::Immediate);
        assert_eq!(local.timing_ms, 100);
    }

    #[test]
    fn test_parse_effect_type() {
        assert_eq!(parse_effect_type("Financial"), Some(EffectType::Financial));
        assert_eq!(parse_effect_type("FINANCIAL"), Some(EffectType::Financial));
        assert_eq!(
            parse_effect_type("Soft Delete"),
            Some(EffectType::SoftDelete)
        );
        assert_eq!(
            parse_effect_type("soft-delete"),
            Some(EffectType::SoftDelete)
        );
        assert_eq!(parse_effect_type("Local State"), Some(EffectType::Local));
        assert_eq!(parse_effect_type("High-freq"), Some(EffectType::HighFreq));
        assert_eq!(parse_effect_type("unknown"), None);
    }

    #[test]
    fn test_parse_sync_strategy() {
        assert_eq!(
            parse_sync_strategy("Pessimistic").unwrap(),
            SyncStrategy::Pessimistic
        );
        assert_eq!(
            parse_sync_strategy("OPTIMISTIC").unwrap(),
            SyncStrategy::Optimistic
        );
        assert_eq!(
            parse_sync_strategy("immediate").unwrap(),
            SyncStrategy::Immediate
        );
        assert!(parse_sync_strategy("invalid").is_err());
    }

    #[test]
    fn test_parse_confirmation_type() {
        assert_eq!(
            parse_confirmation_type("Required").unwrap(),
            ConfirmationType::Required
        );
        assert_eq!(
            parse_confirmation_type("Toast + Undo").unwrap(),
            ConfirmationType::ToastUndo
        );
        assert_eq!(
            parse_confirmation_type("None").unwrap(),
            ConfirmationType::None
        );
        assert!(parse_confirmation_type("invalid").is_err());
    }

    #[test]
    fn test_get_default_physics() {
        let table = get_default_physics();

        assert_eq!(table.len(), 8);

        let financial = table.get(&EffectType::Financial).unwrap();
        assert_eq!(financial.timing_ms, 800);
    }

    #[test]
    fn test_extract_tag_content() {
        let content = "<foo>bar content</foo>";
        assert_eq!(extract_tag_content(content, "foo").unwrap(), "bar content");
    }

    #[test]
    fn test_extract_tag_content_missing() {
        let content = "no tags here";
        assert!(extract_tag_content(content, "foo").is_err());
    }

    #[tokio::test]
    async fn test_load_physics_from_file() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("physics.md");
        std::fs::write(&file_path, TEST_PHYSICS_MD).unwrap();

        let table = load_physics(&file_path).await.unwrap();
        assert_eq!(table.len(), 8);
    }

    #[tokio::test]
    async fn test_load_physics_file_not_found() {
        let result = load_physics("/nonexistent/path.md").await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_physics_loader_with_path() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("physics.md");
        std::fs::write(&file_path, TEST_PHYSICS_MD).unwrap();

        let loader = PhysicsLoader::new().with_path(file_path.to_string_lossy().to_string());
        let table = loader.load().await.unwrap();
        assert_eq!(table.len(), 8);
    }

    #[tokio::test]
    async fn test_physics_loader_default() {
        let loader = PhysicsLoader::new();
        let table = loader.load().await.unwrap();
        assert_eq!(table.len(), 8);
    }

    #[tokio::test]
    async fn test_load_physics_cached() {
        // Clear any existing cache
        clear_physics_cache().await;

        let dir = tempdir().unwrap();
        let file_path = dir.path().join("physics.md");
        std::fs::write(&file_path, TEST_PHYSICS_MD).unwrap();

        // First load should read from file
        let table1 = load_physics_cached(&file_path).await.unwrap();
        assert_eq!(table1.len(), 8);

        // Second load should use cache (even if file is deleted)
        std::fs::remove_file(&file_path).unwrap();
        let table2 = load_physics_cached(&file_path).await.unwrap();
        assert_eq!(table2.len(), 8);

        // Clear cache for other tests
        clear_physics_cache().await;
    }

    #[test]
    fn test_parse_empty_markdown() {
        let content = "<physics_table></physics_table>";
        let table = parse_physics_from_markdown(content).unwrap();
        // Should return defaults when no rules parsed
        assert_eq!(table.len(), 8);
    }
}
