//! Publish command
//!
//! Publishes vocabulary and zones to the grimoires/pub/ directory.

use tracing::info;

use crate::error::Result;
use crate::io;
use crate::types::exit_code::ExitCode;

/// Default vocabulary YAML
const VOCABULARY_YAML: &str = include_str!("../../data/vocabulary.yaml");

/// Default zones YAML
const ZONES_YAML: &str = include_str!("../../data/zones.yaml");

/// Run the publish command (CLI entry point)
pub async fn run() -> Result<ExitCode> {
    info!("Publishing vocabulary and zones to grimoires/pub/");

    // Ensure pub directory exists
    io::ensure_pub_directory()?;

    // Write vocabulary.yaml
    io::write_pub_file("vocabulary.yaml", VOCABULARY_YAML)?;
    info!("Published vocabulary.yaml");

    // Write zones.yaml
    io::write_pub_file("zones.yaml", ZONES_YAML)?;
    info!("Published zones.yaml");

    Ok(ExitCode::Valid)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vocabulary_yaml_valid() {
        // Ensure embedded YAML is valid
        let vocab: serde_yaml::Value = serde_yaml::from_str(VOCABULARY_YAML).unwrap();
        assert!(vocab.get("version").is_some());
        assert!(vocab.get("effects").is_some());
    }

    #[test]
    fn test_zones_yaml_valid() {
        // Ensure embedded YAML is valid
        let zones: serde_yaml::Value = serde_yaml::from_str(ZONES_YAML).unwrap();
        assert!(zones.get("version").is_some());
        assert!(zones.get("hierarchy").is_some());
    }
}
