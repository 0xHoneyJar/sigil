//! Anchor CLI - State-pinned development for blockchain applications.
//!
//! Commands:
//! - `anchor fork` - Create a local fork of a blockchain network
//! - `anchor ground` - Validate code against forked state
//! - `anchor status` - Show current fork and task status

use clap::{Parser, Subcommand};
use sigil_anchor_core::{Network, Zone, VERSION};
use std::str::FromStr;

/// Anchor - State-pinned blockchain development
#[derive(Parser)]
#[command(name = "anchor")]
#[command(author, version, about, long_about = None)]
struct Cli {
    /// Set the zone for operations
    #[arg(short, long, global = true, default_value = "standard")]
    zone: String,

    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand)]
enum Commands {
    /// Create a local fork of a blockchain network
    Fork {
        /// Network to fork (mainnet, sepolia, base, arbitrum, optimism, berachain)
        #[arg(short, long, default_value = "mainnet")]
        network: String,

        /// Block number to fork from (latest if not specified)
        #[arg(short, long)]
        block: Option<u64>,

        /// Port to run the fork on
        #[arg(short, long, default_value = "8545")]
        port: u16,
    },

    /// Validate code against forked state
    Ground {
        /// Path to the file or directory to validate
        path: String,
    },

    /// Show current fork and task status
    Status,

    /// Show version information
    Version,
}

fn main() {
    let cli = Cli::parse();

    // Parse zone
    let zone = match cli.zone.to_lowercase().as_str() {
        "critical" => Zone::Critical,
        "elevated" => Zone::Elevated,
        "standard" => Zone::Standard,
        "local" => Zone::Local,
        _ => {
            eprintln!("Invalid zone: {}. Using 'standard'.", cli.zone);
            Zone::Standard
        }
    };

    match cli.command {
        Some(Commands::Fork { network, block, port }) => {
            let net = match Network::from_str(&network) {
                Ok(n) => n,
                Err(e) => {
                    eprintln!("Error: {}", e);
                    std::process::exit(6); // SCHEMA error
                }
            };

            println!("Creating fork...");
            println!("  Network: {} (chain ID: {})", net.name(), net.chain_id());
            println!("  Block: {}", block.map_or("latest".to_string(), |b| b.to_string()));
            println!("  Port: {}", port);
            println!("  Zone: {}", zone);

            // TODO: Implement actual fork creation with Anvil
            println!("\nFork creation not yet implemented.");
        }

        Some(Commands::Ground { path }) => {
            println!("Grounding validation for: {}", path);
            println!("  Zone: {}", zone);

            // TODO: Implement grounding validation
            println!("\nGrounding validation not yet implemented.");
        }

        Some(Commands::Status) => {
            println!("Anchor Status");
            println!("  Version: {}", VERSION);
            println!("  Zone: {}", zone);
            println!("\nNo active forks.");
        }

        Some(Commands::Version) => {
            println!("Anchor v{}", VERSION);
        }

        None => {
            println!("Anchor v{} - State-pinned blockchain development", VERSION);
            println!("\nUse --help for usage information.");
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use clap::CommandFactory;

    #[test]
    fn verify_cli() {
        // Verify CLI structure is valid
        Cli::command().debug_assert();
    }

    #[test]
    fn test_zone_parsing() {
        let zone_str = "critical";
        let zone = match zone_str {
            "critical" => Zone::Critical,
            "elevated" => Zone::Elevated,
            "standard" => Zone::Standard,
            "local" => Zone::Local,
            _ => Zone::Standard,
        };
        assert_eq!(zone, Zone::Critical);
    }
}
