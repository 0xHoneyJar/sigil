//! Zone types representing physics restrictiveness hierarchy.

use crate::error::AnchorError;
use serde::{Deserialize, Serialize};
use std::fmt;
use std::str::FromStr;

/// Physics zones ordered by restrictiveness.
///
/// The zone hierarchy determines the minimum required physics for a component:
/// - Critical: Financial operations (most restrictive)
/// - Elevated: Destructive operations
/// - Standard: Normal CRUD operations
/// - Local: UI state only (least restrictive)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Zone {
    /// Financial, transactions - most restrictive
    Critical,
    /// Destructive, revoke operations
    Elevated,
    /// CRUD, social interactions
    Standard,
    /// UI state, preferences - least restrictive
    Local,
}

impl Zone {
    /// Zone hierarchy as array (most restrictive first).
    pub const HIERARCHY: [Zone; 4] = [Zone::Critical, Zone::Elevated, Zone::Standard, Zone::Local];

    /// Returns the restrictiveness rank (0 = most restrictive).
    pub fn rank(&self) -> u8 {
        match self {
            Zone::Critical => 0,
            Zone::Elevated => 1,
            Zone::Standard => 2,
            Zone::Local => 3,
        }
    }

    /// Check if this zone is more restrictive than another.
    ///
    /// # Examples
    ///
    /// ```
    /// use sigil_anchor_core::types::Zone;
    ///
    /// assert!(Zone::Critical.is_more_restrictive_than(&Zone::Elevated));
    /// assert!(!Zone::Local.is_more_restrictive_than(&Zone::Standard));
    /// ```
    pub fn is_more_restrictive_than(&self, other: &Zone) -> bool {
        self.rank() < other.rank()
    }

    /// Check if this zone is at least as restrictive as another.
    ///
    /// # Examples
    ///
    /// ```
    /// use sigil_anchor_core::types::Zone;
    ///
    /// assert!(Zone::Critical.is_at_least_as_restrictive_as(&Zone::Critical));
    /// assert!(Zone::Critical.is_at_least_as_restrictive_as(&Zone::Elevated));
    /// assert!(!Zone::Local.is_at_least_as_restrictive_as(&Zone::Standard));
    /// ```
    pub fn is_at_least_as_restrictive_as(&self, other: &Zone) -> bool {
        self.rank() <= other.rank()
    }

    /// Get the zone hierarchy as a readable string.
    pub fn hierarchy_description() -> String {
        Zone::HIERARCHY
            .iter()
            .enumerate()
            .map(|(i, zone)| {
                let restrictiveness = if i == 0 {
                    " (most restrictive)"
                } else if i == Zone::HIERARCHY.len() - 1 {
                    " (least restrictive)"
                } else {
                    ""
                };
                format!("{}{}", zone, restrictiveness)
            })
            .collect::<Vec<_>>()
            .join(" > ")
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

impl FromStr for Zone {
    type Err = AnchorError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "critical" => Ok(Zone::Critical),
            "elevated" => Ok(Zone::Elevated),
            "standard" => Ok(Zone::Standard),
            "local" => Ok(Zone::Local),
            _ => Err(AnchorError::InvalidZone(s.to_string())),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_zone_rank() {
        assert_eq!(Zone::Critical.rank(), 0);
        assert_eq!(Zone::Elevated.rank(), 1);
        assert_eq!(Zone::Standard.rank(), 2);
        assert_eq!(Zone::Local.rank(), 3);
    }

    #[test]
    fn test_is_more_restrictive_than() {
        assert!(Zone::Critical.is_more_restrictive_than(&Zone::Elevated));
        assert!(Zone::Critical.is_more_restrictive_than(&Zone::Standard));
        assert!(Zone::Critical.is_more_restrictive_than(&Zone::Local));
        assert!(Zone::Elevated.is_more_restrictive_than(&Zone::Standard));
        assert!(Zone::Elevated.is_more_restrictive_than(&Zone::Local));
        assert!(Zone::Standard.is_more_restrictive_than(&Zone::Local));

        assert!(!Zone::Critical.is_more_restrictive_than(&Zone::Critical));
        assert!(!Zone::Local.is_more_restrictive_than(&Zone::Standard));
        assert!(!Zone::Standard.is_more_restrictive_than(&Zone::Elevated));
    }

    #[test]
    fn test_is_at_least_as_restrictive_as() {
        // Same zone
        assert!(Zone::Critical.is_at_least_as_restrictive_as(&Zone::Critical));
        assert!(Zone::Elevated.is_at_least_as_restrictive_as(&Zone::Elevated));
        assert!(Zone::Standard.is_at_least_as_restrictive_as(&Zone::Standard));
        assert!(Zone::Local.is_at_least_as_restrictive_as(&Zone::Local));

        // More restrictive
        assert!(Zone::Critical.is_at_least_as_restrictive_as(&Zone::Elevated));
        assert!(Zone::Critical.is_at_least_as_restrictive_as(&Zone::Local));

        // Less restrictive
        assert!(!Zone::Local.is_at_least_as_restrictive_as(&Zone::Standard));
        assert!(!Zone::Standard.is_at_least_as_restrictive_as(&Zone::Elevated));
    }

    #[test]
    fn test_zone_display() {
        assert_eq!(Zone::Critical.to_string(), "critical");
        assert_eq!(Zone::Elevated.to_string(), "elevated");
        assert_eq!(Zone::Standard.to_string(), "standard");
        assert_eq!(Zone::Local.to_string(), "local");
    }

    #[test]
    fn test_zone_from_str() {
        assert_eq!(Zone::from_str("critical").unwrap(), Zone::Critical);
        assert_eq!(Zone::from_str("CRITICAL").unwrap(), Zone::Critical);
        assert_eq!(Zone::from_str("elevated").unwrap(), Zone::Elevated);
        assert_eq!(Zone::from_str("standard").unwrap(), Zone::Standard);
        assert_eq!(Zone::from_str("local").unwrap(), Zone::Local);
    }

    #[test]
    fn test_zone_from_str_invalid() {
        let result = Zone::from_str("invalid");
        assert!(result.is_err());
    }

    #[test]
    fn test_zone_hierarchy() {
        assert_eq!(Zone::HIERARCHY[0], Zone::Critical);
        assert_eq!(Zone::HIERARCHY[1], Zone::Elevated);
        assert_eq!(Zone::HIERARCHY[2], Zone::Standard);
        assert_eq!(Zone::HIERARCHY[3], Zone::Local);
    }

    #[test]
    fn test_hierarchy_description() {
        let desc = Zone::hierarchy_description();
        assert!(desc.contains("critical (most restrictive)"));
        assert!(desc.contains("local (least restrictive)"));
        assert!(desc.contains(" > "));
    }

    #[test]
    fn test_zone_serialize() {
        let zone = Zone::Critical;
        let json = serde_json::to_string(&zone).unwrap();
        assert_eq!(json, "\"critical\"");
    }

    #[test]
    fn test_zone_deserialize() {
        let zone: Zone = serde_json::from_str("\"elevated\"").unwrap();
        assert_eq!(zone, Zone::Elevated);
    }
}
