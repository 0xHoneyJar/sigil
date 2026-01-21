//! Vocabulary loader for parsing Sigil lexicon from markdown.

use crate::error::AnchorError;
use crate::types::EffectType;
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::path::Path;
use tokio::fs;

/// Keyword category (primary, extended, etc.)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum KeywordCategory {
    /// Primary keywords with highest confidence
    Primary,
    /// Extended keywords with lower priority
    Extended,
    /// Domain-specific keywords (web3, e-commerce, etc.)
    Domain,
}

impl std::fmt::Display for KeywordCategory {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            KeywordCategory::Primary => write!(f, "primary"),
            KeywordCategory::Extended => write!(f, "extended"),
            KeywordCategory::Domain => write!(f, "domain"),
        }
    }
}

/// A keyword entry with its category.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeywordEntry {
    /// The keyword
    pub keyword: String,
    /// Effect type this keyword maps to
    pub effect: EffectType,
    /// Keyword category
    pub category: KeywordCategory,
}

/// Type override rule.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TypeOverride {
    /// Type pattern to match (e.g., "Currency", "Wei")
    pub pattern: String,
    /// Effect type to force
    pub effect: EffectType,
    /// Description of why this override exists
    pub reason: String,
}

impl TypeOverride {
    /// Create a new type override.
    pub fn new(pattern: impl Into<String>, effect: EffectType, reason: impl Into<String>) -> Self {
        Self {
            pattern: pattern.into(),
            effect,
            reason: reason.into(),
        }
    }
}

/// Vocabulary table for keyword to effect mapping.
#[derive(Debug, Clone, Default)]
pub struct Vocabulary {
    /// Keywords mapped by effect type
    keywords: HashMap<EffectType, Vec<KeywordEntry>>,
    /// Reverse lookup: keyword -> effect type
    keyword_index: HashMap<String, EffectType>,
    /// Type overrides (highest priority)
    type_overrides: Vec<TypeOverride>,
}

impl Vocabulary {
    /// Create a new empty vocabulary.
    pub fn new() -> Self {
        Self {
            keywords: HashMap::new(),
            keyword_index: HashMap::new(),
            type_overrides: Vec::new(),
        }
    }

    /// Add a keyword entry.
    pub fn add_keyword(&mut self, entry: KeywordEntry) {
        let effect = entry.effect;
        let keyword_lower = entry.keyword.to_lowercase();
        self.keyword_index.insert(keyword_lower, effect);
        self.keywords.entry(effect).or_default().push(entry);
    }

    /// Add a type override.
    pub fn add_type_override(&mut self, override_rule: TypeOverride) {
        self.type_overrides.push(override_rule);
    }

    /// Get keywords for an effect type.
    pub fn get_keywords(&self, effect: &EffectType) -> Option<&Vec<KeywordEntry>> {
        self.keywords.get(effect)
    }

    /// Get all keywords.
    pub fn all_keywords(&self) -> impl Iterator<Item = &KeywordEntry> {
        self.keywords.values().flatten()
    }

    /// Get type overrides.
    pub fn type_overrides(&self) -> &[TypeOverride] {
        &self.type_overrides
    }

    /// Get the number of keywords.
    pub fn keyword_count(&self) -> usize {
        self.keyword_index.len()
    }

    /// Check if a keyword exists.
    pub fn contains_keyword(&self, keyword: &str) -> bool {
        self.keyword_index.contains_key(&keyword.to_lowercase())
    }

    /// Lookup effect type by keyword.
    pub fn lookup(&self, keyword: &str) -> Option<EffectType> {
        self.keyword_index.get(&keyword.to_lowercase()).copied()
    }

    /// Check if a type matches any override pattern.
    pub fn check_type_override(&self, type_name: &str) -> Option<&TypeOverride> {
        let type_lower = type_name.to_lowercase();
        self.type_overrides
            .iter()
            .find(|o| type_lower.contains(&o.pattern.to_lowercase()))
    }

    /// Get default vocabulary with standard Sigil keywords.
    pub fn defaults() -> Self {
        let mut vocab = Self::new();

        // Financial keywords
        for kw in &[
            "claim", "deposit", "withdraw", "transfer", "swap", "send", "pay", "purchase",
        ] {
            vocab.add_keyword(KeywordEntry {
                keyword: kw.to_string(),
                effect: EffectType::Financial,
                category: KeywordCategory::Primary,
            });
        }
        for kw in &[
            "mint",
            "burn",
            "stake",
            "unstake",
            "bridge",
            "approve",
            "redeem",
            "harvest",
            "collect",
            "vest",
            "unlock",
            "liquidate",
            "borrow",
            "lend",
            "repay",
        ] {
            vocab.add_keyword(KeywordEntry {
                keyword: kw.to_string(),
                effect: EffectType::Financial,
                category: KeywordCategory::Extended,
            });
        }
        for kw in &[
            "airdrop",
            "delegate",
            "undelegate",
            "redelegate",
            "bond",
            "unbond",
            "checkout",
            "order",
            "subscribe",
            "upgrade",
            "downgrade",
            "refund",
        ] {
            vocab.add_keyword(KeywordEntry {
                keyword: kw.to_string(),
                effect: EffectType::Financial,
                category: KeywordCategory::Domain,
            });
        }

        // Destructive keywords
        for kw in &["delete", "remove", "destroy", "revoke", "terminate"] {
            vocab.add_keyword(KeywordEntry {
                keyword: kw.to_string(),
                effect: EffectType::Destructive,
                category: KeywordCategory::Primary,
            });
        }
        for kw in &[
            "purge",
            "erase",
            "wipe",
            "clear",
            "reset",
            "ban",
            "block",
            "suspend",
            "deactivate",
            "cancel",
            "void",
            "invalidate",
            "expire",
            "kill",
        ] {
            vocab.add_keyword(KeywordEntry {
                keyword: kw.to_string(),
                effect: EffectType::Destructive,
                category: KeywordCategory::Extended,
            });
        }

        // Soft delete keywords
        for kw in &["archive", "hide", "trash", "dismiss", "snooze"] {
            vocab.add_keyword(KeywordEntry {
                keyword: kw.to_string(),
                effect: EffectType::SoftDelete,
                category: KeywordCategory::Primary,
            });
        }
        for kw in &[
            "mute", "silence", "ignore", "skip", "defer", "postpone", "pause",
        ] {
            vocab.add_keyword(KeywordEntry {
                keyword: kw.to_string(),
                effect: EffectType::SoftDelete,
                category: KeywordCategory::Extended,
            });
        }

        // Standard keywords
        for kw in &["save", "update", "edit", "create", "add", "like", "follow"] {
            vocab.add_keyword(KeywordEntry {
                keyword: kw.to_string(),
                effect: EffectType::Standard,
                category: KeywordCategory::Primary,
            });
        }
        for kw in &[
            "bookmark",
            "favorite",
            "star",
            "pin",
            "tag",
            "label",
            "comment",
            "share",
            "repost",
            "quote",
            "reply",
            "mention",
            "react",
            "submit",
            "post",
            "publish",
            "upload",
            "attach",
            "link",
            "change",
            "modify",
            "set",
            "configure",
            "customize",
            "personalize",
        ] {
            vocab.add_keyword(KeywordEntry {
                keyword: kw.to_string(),
                effect: EffectType::Standard,
                category: KeywordCategory::Extended,
            });
        }

        // Local state keywords
        for kw in &["toggle", "switch", "expand", "collapse", "select", "focus"] {
            vocab.add_keyword(KeywordEntry {
                keyword: kw.to_string(),
                effect: EffectType::Local,
                category: KeywordCategory::Primary,
            });
        }
        for kw in &[
            "show", "open", "close", "reveal", "conceal", "check", "uncheck", "enable", "disable",
            "activate", "sort", "filter", "search", "zoom", "pan", "scroll",
        ] {
            vocab.add_keyword(KeywordEntry {
                keyword: kw.to_string(),
                effect: EffectType::Local,
                category: KeywordCategory::Extended,
            });
        }

        // Navigation keywords
        for kw in &["navigate", "go", "back", "forward", "link", "route"] {
            vocab.add_keyword(KeywordEntry {
                keyword: kw.to_string(),
                effect: EffectType::Navigation,
                category: KeywordCategory::Primary,
            });
        }
        for kw in &[
            "visit", "view", "browse", "explore", "next", "previous", "first", "last", "tab",
            "step", "page", "section", "anchor",
        ] {
            vocab.add_keyword(KeywordEntry {
                keyword: kw.to_string(),
                effect: EffectType::Navigation,
                category: KeywordCategory::Extended,
            });
        }

        // Query keywords
        for kw in &["fetch", "load", "get", "list", "find"] {
            vocab.add_keyword(KeywordEntry {
                keyword: kw.to_string(),
                effect: EffectType::Query,
                category: KeywordCategory::Primary,
            });
        }
        for kw in &[
            "query", "lookup", "retrieve", "request", "poll", "refresh", "reload", "sync",
            "preview", "peek", "inspect", "examine",
        ] {
            vocab.add_keyword(KeywordEntry {
                keyword: kw.to_string(),
                effect: EffectType::Query,
                category: KeywordCategory::Extended,
            });
        }

        // Type overrides
        vocab.add_type_override(TypeOverride::new(
            "Currency",
            EffectType::Financial,
            "Value transfer",
        ));
        vocab.add_type_override(TypeOverride::new(
            "Money",
            EffectType::Financial,
            "Value transfer",
        ));
        vocab.add_type_override(TypeOverride::new(
            "Amount",
            EffectType::Financial,
            "Value transfer",
        ));
        vocab.add_type_override(TypeOverride::new(
            "Wei",
            EffectType::Financial,
            "Blockchain value",
        ));
        vocab.add_type_override(TypeOverride::new(
            "BigInt",
            EffectType::Financial,
            "Blockchain value",
        ));
        vocab.add_type_override(TypeOverride::new(
            "Token",
            EffectType::Financial,
            "Blockchain value",
        ));
        vocab.add_type_override(TypeOverride::new(
            "Balance",
            EffectType::Financial,
            "Money display/mutation",
        ));
        vocab.add_type_override(TypeOverride::new(
            "Price",
            EffectType::Financial,
            "Money display/mutation",
        ));
        vocab.add_type_override(TypeOverride::new(
            "Fee",
            EffectType::Financial,
            "Money display/mutation",
        ));
        vocab.add_type_override(TypeOverride::new(
            "Password",
            EffectType::Destructive,
            "Security sensitive",
        ));
        vocab.add_type_override(TypeOverride::new(
            "Secret",
            EffectType::Destructive,
            "Security sensitive",
        ));
        vocab.add_type_override(TypeOverride::new(
            "Key",
            EffectType::Destructive,
            "Security sensitive",
        ));
        vocab.add_type_override(TypeOverride::new(
            "Permission",
            EffectType::Destructive,
            "Access control",
        ));
        vocab.add_type_override(TypeOverride::new(
            "Role",
            EffectType::Destructive,
            "Access control",
        ));
        vocab.add_type_override(TypeOverride::new(
            "Access",
            EffectType::Destructive,
            "Access control",
        ));
        vocab.add_type_override(TypeOverride::new("Theme", EffectType::Local, "Client-only"));
        vocab.add_type_override(TypeOverride::new(
            "Preference",
            EffectType::Local,
            "Client-only",
        ));
        vocab.add_type_override(TypeOverride::new(
            "Setting",
            EffectType::Local,
            "Client-only",
        ));
        vocab.add_type_override(TypeOverride::new("Filter", EffectType::Local, "UI state"));
        vocab.add_type_override(TypeOverride::new("Sort", EffectType::Local, "UI state"));
        vocab.add_type_override(TypeOverride::new("View", EffectType::Local, "UI state"));

        vocab
    }
}

/// Vocabulary loader for parsing from markdown files.
#[derive(Debug, Default)]
pub struct VocabularyLoader {
    /// Custom vocabulary file path (optional)
    vocab_path: Option<String>,
}

impl VocabularyLoader {
    /// Create a new vocabulary loader.
    pub fn new() -> Self {
        Self { vocab_path: None }
    }

    /// Set a custom vocabulary file path.
    pub fn with_path(mut self, path: impl Into<String>) -> Self {
        self.vocab_path = Some(path.into());
        self
    }

    /// Load vocabulary from configured source.
    pub async fn load(&self) -> Result<Vocabulary, AnchorError> {
        if let Some(ref path) = self.vocab_path {
            load_vocabulary(path).await
        } else {
            Ok(Vocabulary::defaults())
        }
    }
}

/// Load vocabulary from a markdown file.
pub async fn load_vocabulary(path: impl AsRef<Path>) -> Result<Vocabulary, AnchorError> {
    let content = fs::read_to_string(path.as_ref()).await?;
    parse_vocabulary_from_markdown(&content)
}

/// Parse vocabulary from markdown content.
fn parse_vocabulary_from_markdown(content: &str) -> Result<Vocabulary, AnchorError> {
    let mut vocab = Vocabulary::new();

    // Extract effect_keywords section
    if let Ok(keywords_content) = extract_tag_content(content, "effect_keywords") {
        parse_effect_keywords(&keywords_content, &mut vocab)?;
    }

    // Extract type_overrides section
    if let Ok(overrides_content) = extract_tag_content(content, "type_overrides") {
        parse_type_overrides(&overrides_content, &mut vocab)?;
    }

    // If no keywords parsed, return defaults
    if vocab.keyword_count() == 0 {
        return Ok(Vocabulary::defaults());
    }

    Ok(vocab)
}

/// Parse effect keywords from markdown section.
fn parse_effect_keywords(content: &str, vocab: &mut Vocabulary) -> Result<(), AnchorError> {
    // Parse sections like ### Financial (Pessimistic, 800ms, Confirmation)
    let section_regex = Regex::new(r"###\s+(\w+(?:\s+\w+)?)\s+\([^)]+\)")
        .map_err(|e| AnchorError::InvalidZone(e.to_string()))?;

    // Find all sections
    let sections: Vec<_> = section_regex
        .captures_iter(content)
        .filter_map(|cap| {
            let effect_name = cap.get(1)?.as_str();
            let start = cap.get(0)?.end();
            Some((effect_name.to_string(), start))
        })
        .collect();

    for i in 0..sections.len() {
        let (effect_name, start) = &sections[i];
        let end = if i + 1 < sections.len() {
            sections[i + 1].1
        } else {
            content.len()
        };

        let section_content = &content[*start..end];
        let effect = match parse_effect_name(effect_name) {
            Some(e) => e,
            None => continue,
        };

        // Parse keywords from code blocks
        parse_keywords_from_section(section_content, effect, vocab)?;
    }

    Ok(())
}

/// Parse keywords from a section.
fn parse_keywords_from_section(
    content: &str,
    effect: EffectType,
    vocab: &mut Vocabulary,
) -> Result<(), AnchorError> {
    // Extract text between ``` markers
    let code_block_regex =
        Regex::new(r"```[\s\S]*?```").map_err(|e| AnchorError::InvalidZone(e.to_string()))?;

    // Parse lines like "Primary:    claim, deposit, withdraw"
    let line_regex = Regex::new(r"(\w+):\s+([\w\s,\-]+)")
        .map_err(|e| AnchorError::InvalidZone(e.to_string()))?;

    for cap in code_block_regex.find_iter(content) {
        let block = cap.as_str();

        for line_cap in line_regex.captures_iter(block) {
            let category_name = line_cap.get(1).map(|m| m.as_str()).unwrap_or("");
            let keywords_str = line_cap.get(2).map(|m| m.as_str()).unwrap_or("");

            let category = match category_name.to_lowercase().as_str() {
                "primary" => KeywordCategory::Primary,
                "extended" => KeywordCategory::Extended,
                _ => KeywordCategory::Domain,
            };

            // Split keywords by comma and clean up
            for keyword in keywords_str.split(',') {
                let kw = keyword.trim().to_lowercase();
                if !kw.is_empty()
                    && kw
                        .chars()
                        .all(|c| c.is_alphanumeric() || c == '-' || c == ' ')
                {
                    vocab.add_keyword(KeywordEntry {
                        keyword: kw,
                        effect,
                        category,
                    });
                }
            }
        }
    }

    Ok(())
}

/// Parse type overrides from markdown section.
fn parse_type_overrides(content: &str, vocab: &mut Vocabulary) -> Result<(), AnchorError> {
    // Parse table rows: | `Pattern` | Effect | Why |
    let row_regex = Regex::new(r"\|\s*`([^`]+)`\s*\|\s*(\w+)\s*\|\s*([^|]+)\s*\|")
        .map_err(|e| AnchorError::InvalidZone(e.to_string()))?;

    for cap in row_regex.captures_iter(content) {
        let pattern = cap.get(1).map(|m| m.as_str().trim()).unwrap_or("");
        let effect_str = cap.get(2).map(|m| m.as_str().trim()).unwrap_or("");
        let reason = cap.get(3).map(|m| m.as_str().trim()).unwrap_or("");

        // Skip header
        if pattern.to_lowercase() == "type pattern" {
            continue;
        }

        let effect = match parse_effect_name(effect_str) {
            Some(e) => e,
            None => continue,
        };

        vocab.add_type_override(TypeOverride::new(pattern, effect, reason));
    }

    Ok(())
}

/// Parse effect name from string.
fn parse_effect_name(s: &str) -> Option<EffectType> {
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

/// Resolve effect type from keywords in text.
///
/// Priority: type override > primary keywords > extended keywords
///
/// Returns None if no match found.
pub fn resolve_effect_from_keywords(
    text: &str,
    type_hints: &[&str],
    vocab: &Vocabulary,
) -> Option<EffectType> {
    // 1. Check type hints first (highest priority)
    for type_hint in type_hints {
        if let Some(override_rule) = vocab.check_type_override(type_hint) {
            return Some(override_rule.effect);
        }
    }

    let text_lower = text.to_lowercase();
    let words: HashSet<&str> = text_lower
        .split(|c: char| !c.is_alphanumeric())
        .filter(|s| !s.is_empty())
        .collect();

    // 2. Check primary keywords
    let mut primary_matches: HashMap<EffectType, usize> = HashMap::new();
    let mut extended_matches: HashMap<EffectType, usize> = HashMap::new();

    for entry in vocab.all_keywords() {
        if words.contains(entry.keyword.as_str()) {
            match entry.category {
                KeywordCategory::Primary => {
                    *primary_matches.entry(entry.effect).or_default() += 1;
                }
                KeywordCategory::Extended | KeywordCategory::Domain => {
                    *extended_matches.entry(entry.effect).or_default() += 1;
                }
            }
        }
    }

    // Return effect with most primary matches
    if !primary_matches.is_empty() {
        return primary_matches
            .into_iter()
            .max_by_key(|(_, count)| *count)
            .map(|(effect, _)| effect);
    }

    // Fall back to extended matches
    if !extended_matches.is_empty() {
        return extended_matches
            .into_iter()
            .max_by_key(|(_, count)| *count)
            .map(|(effect, _)| effect);
    }

    None
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    const TEST_LEXICON_MD: &str = r#"
# Sigil: Lexicon

<effect_keywords>
## Effect Keywords

### Financial (Pessimistic, 800ms, Confirmation)
```
Primary:    claim, deposit, withdraw
Extended:   stake, unstake
```

### Destructive (Pessimistic, 600ms, Confirmation)
```
Primary:    delete, remove
Extended:   purge, erase
```

### Standard (Optimistic, 200ms, No Confirmation)
```
Primary:    save, update, create
```
</effect_keywords>

<type_overrides>
## Type Overrides

| Type Pattern | Forced Effect | Why |
|--------------|---------------|-----|
| `Currency` | Financial | Value transfer |
| `Password` | Destructive | Security sensitive |
</type_overrides>
"#;

    #[test]
    fn test_vocabulary_defaults() {
        let vocab = Vocabulary::defaults();
        assert!(vocab.keyword_count() > 50); // Should have many keywords
        assert!(vocab.type_overrides().len() > 10); // Should have type overrides
    }

    #[test]
    fn test_vocabulary_lookup() {
        let vocab = Vocabulary::defaults();

        assert_eq!(vocab.lookup("claim"), Some(EffectType::Financial));
        assert_eq!(vocab.lookup("CLAIM"), Some(EffectType::Financial));
        assert_eq!(vocab.lookup("delete"), Some(EffectType::Destructive));
        assert_eq!(vocab.lookup("save"), Some(EffectType::Standard));
        assert_eq!(vocab.lookup("toggle"), Some(EffectType::Local));
        assert_eq!(vocab.lookup("unknown"), None);
    }

    #[test]
    fn test_vocabulary_type_override() {
        let vocab = Vocabulary::defaults();

        let currency_override = vocab.check_type_override("Currency");
        assert!(currency_override.is_some());
        assert_eq!(currency_override.unwrap().effect, EffectType::Financial);

        let password_override = vocab.check_type_override("Password");
        assert!(password_override.is_some());
        assert_eq!(password_override.unwrap().effect, EffectType::Destructive);

        assert!(vocab.check_type_override("UnknownType").is_none());
    }

    #[test]
    fn test_resolve_effect_type_override_priority() {
        let vocab = Vocabulary::defaults();

        // Type override should take priority over keywords
        let result = resolve_effect_from_keywords("update balance", &["Currency"], &vocab);
        assert_eq!(result, Some(EffectType::Financial));
    }

    #[test]
    fn test_resolve_effect_primary_keyword() {
        let vocab = Vocabulary::defaults();

        let result = resolve_effect_from_keywords("claim rewards", &[], &vocab);
        assert_eq!(result, Some(EffectType::Financial));

        let result = resolve_effect_from_keywords("delete account", &[], &vocab);
        assert_eq!(result, Some(EffectType::Destructive));

        let result = resolve_effect_from_keywords("save changes", &[], &vocab);
        assert_eq!(result, Some(EffectType::Standard));
    }

    #[test]
    fn test_resolve_effect_case_insensitive() {
        let vocab = Vocabulary::defaults();

        let result = resolve_effect_from_keywords("CLAIM REWARDS", &[], &vocab);
        assert_eq!(result, Some(EffectType::Financial));

        let result = resolve_effect_from_keywords("Delete Account", &[], &vocab);
        assert_eq!(result, Some(EffectType::Destructive));
    }

    #[test]
    fn test_resolve_effect_no_match() {
        let vocab = Vocabulary::defaults();

        let result = resolve_effect_from_keywords("hello world", &[], &vocab);
        assert_eq!(result, None);
    }

    #[test]
    fn test_resolve_effect_multiple_keywords() {
        let vocab = Vocabulary::defaults();

        // Multiple financial keywords should still return Financial
        let result = resolve_effect_from_keywords("claim and deposit tokens", &[], &vocab);
        assert_eq!(result, Some(EffectType::Financial));
    }

    #[test]
    fn test_parse_vocabulary_from_markdown() {
        let vocab = parse_vocabulary_from_markdown(TEST_LEXICON_MD).unwrap();

        assert!(vocab.contains_keyword("claim"));
        assert!(vocab.contains_keyword("delete"));
        assert!(vocab.contains_keyword("save"));

        // Check type overrides
        assert!(vocab.check_type_override("Currency").is_some());
        assert!(vocab.check_type_override("Password").is_some());
    }

    #[tokio::test]
    async fn test_load_vocabulary_from_file() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("lexicon.md");
        std::fs::write(&file_path, TEST_LEXICON_MD).unwrap();

        let vocab = load_vocabulary(&file_path).await.unwrap();
        assert!(vocab.contains_keyword("claim"));
    }

    #[tokio::test]
    async fn test_vocabulary_loader_default() {
        let loader = VocabularyLoader::new();
        let vocab = loader.load().await.unwrap();
        assert!(vocab.keyword_count() > 50);
    }

    #[tokio::test]
    async fn test_vocabulary_loader_with_path() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("lexicon.md");
        std::fs::write(&file_path, TEST_LEXICON_MD).unwrap();

        let loader = VocabularyLoader::new().with_path(file_path.to_string_lossy().to_string());
        let vocab = loader.load().await.unwrap();
        assert!(vocab.contains_keyword("claim"));
    }

    #[test]
    fn test_keyword_category_display() {
        assert_eq!(KeywordCategory::Primary.to_string(), "primary");
        assert_eq!(KeywordCategory::Extended.to_string(), "extended");
        assert_eq!(KeywordCategory::Domain.to_string(), "domain");
    }

    #[test]
    fn test_vocabulary_get_keywords() {
        let vocab = Vocabulary::defaults();

        let financial_keywords = vocab.get_keywords(&EffectType::Financial);
        assert!(financial_keywords.is_some());
        assert!(!financial_keywords.unwrap().is_empty());
    }

    #[test]
    fn test_extract_tag_content() {
        let content = "<foo>bar content</foo>";
        assert_eq!(extract_tag_content(content, "foo").unwrap(), "bar content");
    }

    #[test]
    fn test_parse_effect_name() {
        assert_eq!(parse_effect_name("Financial"), Some(EffectType::Financial));
        assert_eq!(
            parse_effect_name("Soft Delete"),
            Some(EffectType::SoftDelete)
        );
        assert_eq!(parse_effect_name("Local State"), Some(EffectType::Local));
        assert_eq!(parse_effect_name("unknown"), None);
    }
}
