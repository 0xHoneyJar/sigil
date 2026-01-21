//! Zone definitions for Anchor
//!
//! Zones represent security classifications for UI components based on their effect type.

use serde::{Deserialize, Serialize};
use std::fmt;

/// Zone represents the security classification of a UI component
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Zone {
    /// Operations that can lose user funds or cause irreversible harm
    Critical,

    /// Operations with significant but reversible impact
    Elevated,

    /// Normal CRUD operations
    Standard,

    /// Client-only state changes
    Local,
}

impl Zone {
    /// Get the severity level (higher = more critical)
    pub fn severity(&self) -> u8 {
        match self {
            Zone::Critical => 4,
            Zone::Elevated => 3,
            Zone::Standard => 2,
            Zone::Local => 1,
        }
    }

    /// Check if validation is required for this zone
    pub fn requires_validation(&self) -> bool {
        matches!(self, Zone::Critical | Zone::Elevated)
    }

    /// Compare zones and return if the first is at least as severe as the second
    pub fn is_at_least(&self, other: &Zone) -> bool {
        self.severity() >= other.severity()
    }

    /// Get the list of effects that map to this zone
    pub fn effects(&self) -> &'static [&'static str] {
        match self {
            Zone::Critical => &["financial", "destructive"],
            Zone::Elevated => &["soft_delete"],
            Zone::Standard => &["standard"],
            Zone::Local => &["local"],
        }
    }
}

impl fmt::Display for Zone {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Zone::Critical => write!(f, "critical"),
            Zone::Elevated => write!(f, "elevated"),
            Zone::Standard => write!(f, "standard"),
            Zone::Local => write!(f, "local"),
        }
    }
}

impl Default for Zone {
    fn default() -> Self {
        Zone::Standard
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_zone_severity() {
        assert!(Zone::Critical.severity() > Zone::Elevated.severity());
        assert!(Zone::Elevated.severity() > Zone::Standard.severity());
        assert!(Zone::Standard.severity() > Zone::Local.severity());
    }

    #[test]
    fn test_is_at_least() {
        assert!(Zone::Critical.is_at_least(&Zone::Critical));
        assert!(Zone::Critical.is_at_least(&Zone::Elevated));
        assert!(Zone::Critical.is_at_least(&Zone::Standard));
        assert!(Zone::Critical.is_at_least(&Zone::Local));

        assert!(!Zone::Local.is_at_least(&Zone::Critical));
        assert!(Zone::Local.is_at_least(&Zone::Local));
    }

    #[test]
    fn test_requires_validation() {
        assert!(Zone::Critical.requires_validation());
        assert!(Zone::Elevated.requires_validation());
        assert!(!Zone::Standard.requires_validation());
        assert!(!Zone::Local.requires_validation());
    }

    #[test]
    fn test_serialization() {
        let zone = Zone::Critical;
        let json = serde_json::to_string(&zone).unwrap();
        assert_eq!(json, "\"critical\"");

        let parsed: Zone = serde_json::from_str("\"critical\"").unwrap();
        assert_eq!(parsed, Zone::Critical);
    }
}
