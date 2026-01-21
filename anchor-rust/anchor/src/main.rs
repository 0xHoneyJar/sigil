//! Anchor CLI - Ground truth enforcement for blockchain state
//!
//! Part of the Loa Constructs Triad:
//! - Sigil (Feel): Design physics for UI
//! - Anchor (Reality): Ground truth enforcement
//! - Lens (Lint): UX heuristic analysis

use clap::{Parser, Subcommand};
use tracing_subscriber::{fmt, prelude::*, EnvFilter};

mod commands;
mod error;
mod io;
mod types;

use commands::{check_source, publish, state, validate};
use error::Result;

#[derive(Parser)]
#[command(
    name = "anchor",
    about = "Ground truth enforcement for blockchain state",
    version,
    author
)]
struct Cli {
    /// Enable verbose logging
    #[arg(short, long, global = true)]
    verbose: bool,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Validate zone assignment for a component
    Validate {
        /// Request ID (UUID) to read from pub/requests/
        #[arg(long)]
        request: String,
    },

    /// Check data source appropriateness (indexed vs on-chain)
    CheckSource {
        /// Request ID (UUID) to read from pub/requests/
        #[arg(long)]
        request: String,
    },

    /// Publish vocabulary and zones to pub/ directory
    Publish,

    /// Query on-chain state for a contract
    State {
        /// Contract address (0x...)
        #[arg(long)]
        address: String,

        /// Chain ID (e.g., 1 for mainnet, 80094 for Berachain)
        #[arg(long)]
        chain_id: u64,
    },
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();

    // Initialize logging
    let filter = if cli.verbose {
        EnvFilter::new("debug")
    } else {
        EnvFilter::new("info")
    };

    tracing_subscriber::registry()
        .with(fmt::layer())
        .with(filter)
        .init();

    // Route to command handler
    let exit_code = match cli.command {
        Commands::Validate { request } => validate::run(&request).await?,
        Commands::CheckSource { request } => check_source::run(&request).await?,
        Commands::Publish => publish::run().await?,
        Commands::State { address, chain_id } => state::run(&address, chain_id).await?,
    };

    std::process::exit(exit_code.into());
}
