//! Exit code definitions for Anchor CLI
//!
//! Exit codes communicate validation results to calling processes (e.g., Sigil skills).

use serde::{Deserialize, Serialize};

/// Exit codes for Anchor validation results
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
pub enum ExitCode {
    /// Validation passed, no action needed
    Valid = 0,

    /// Zone drift detected - surface warning to user
    Drift = 1,

    /// Deceptive zone detected - suggest zone increase
    Deceptive = 2,

    /// Zone violation - surface error, suggest fix
    Violation = 3,

    /// Internal failure - log and continue
    Revert = 4,

    /// Corrupt state - abort validation, log error
    Corrupt = 5,

    /// Schema error - fix input, retry once
    Schema = 6,
}

impl ExitCode {
    /// Get human-readable description of exit code
    pub fn description(&self) -> &'static str {
        match self {
            ExitCode::Valid => "Validation passed",
            ExitCode::Drift => "Zone drift detected",
            ExitCode::Deceptive => "Deceptive zone detected",
            ExitCode::Violation => "Zone violation",
            ExitCode::Revert => "Internal failure",
            ExitCode::Corrupt => "Corrupt state",
            ExitCode::Schema => "Schema error",
        }
    }

    /// Check if this exit code represents an error
    pub fn is_error(&self) -> bool {
        matches!(
            self,
            ExitCode::Violation | ExitCode::Revert | ExitCode::Corrupt | ExitCode::Schema
        )
    }

    /// Check if this exit code represents a warning
    pub fn is_warning(&self) -> bool {
        matches!(self, ExitCode::Drift | ExitCode::Deceptive)
    }
}

impl From<ExitCode> for i32 {
    fn from(code: ExitCode) -> Self {
        code as i32
    }
}

impl TryFrom<i32> for ExitCode {
    type Error = ();

    fn try_from(value: i32) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(ExitCode::Valid),
            1 => Ok(ExitCode::Drift),
            2 => Ok(ExitCode::Deceptive),
            3 => Ok(ExitCode::Violation),
            4 => Ok(ExitCode::Revert),
            5 => Ok(ExitCode::Corrupt),
            6 => Ok(ExitCode::Schema),
            _ => Err(()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_exit_code_values() {
        assert_eq!(ExitCode::Valid as i32, 0);
        assert_eq!(ExitCode::Drift as i32, 1);
        assert_eq!(ExitCode::Deceptive as i32, 2);
        assert_eq!(ExitCode::Violation as i32, 3);
        assert_eq!(ExitCode::Revert as i32, 4);
        assert_eq!(ExitCode::Corrupt as i32, 5);
        assert_eq!(ExitCode::Schema as i32, 6);
    }

    #[test]
    fn test_exit_code_conversion() {
        let code = ExitCode::Violation;
        let value: i32 = code.into();
        assert_eq!(value, 3);

        let recovered = ExitCode::try_from(3).unwrap();
        assert_eq!(recovered, ExitCode::Violation);
    }

    #[test]
    fn test_is_error() {
        assert!(!ExitCode::Valid.is_error());
        assert!(!ExitCode::Drift.is_error());
        assert!(ExitCode::Violation.is_error());
        assert!(ExitCode::Corrupt.is_error());
    }

    #[test]
    fn test_is_warning() {
        assert!(!ExitCode::Valid.is_warning());
        assert!(ExitCode::Drift.is_warning());
        assert!(ExitCode::Deceptive.is_warning());
        assert!(!ExitCode::Violation.is_warning());
    }
}
