//! Lens CLI - Formal verification and heuristic linting for Sigil physics
//!
//! Lens provides constraint-based verification of physics analysis using
//! CEL (Common Expression Language) for formal rule evaluation.

use std::fs;
use std::process::ExitCode;

use clap::{Parser, Subcommand};
use sigil_lens_core::{
    io, load_constraints, verify_constraints,
    types::{
        constraint::ConstraintCategory,
        physics::PhysicsAnalysis,
        request::VerifyRequest,
        response::VerifyResponse,
    },
    ConstraintResult,
};
use tracing::{error, info};
use tracing_subscriber::EnvFilter;

/// Lens CLI for Sigil physics verification
#[derive(Parser)]
#[command(name = "lens")]
#[command(version, about, long_about = None)]
struct Cli {
    /// Enable verbose output
    #[arg(short, long, global = true)]
    verbose: bool,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Verify physics against formal constraints
    Verify {
        /// Request ID (UUID) to process from pub/requests/
        #[arg(short, long)]
        request_id: Option<String>,

        /// Path to physics JSON file (alternative to request_id)
        #[arg(short, long)]
        file: Option<String>,

        /// Output format: json, text
        #[arg(short, long, default_value = "text")]
        output: String,
    },

    /// List available constraints
    Constraints {
        /// Filter by category: behavioral, animation, material, protected, general
        #[arg(short, long)]
        category: Option<String>,

        /// Show only enabled constraints
        #[arg(long)]
        enabled_only: bool,

        /// Output format: json, text
        #[arg(short, long, default_value = "text")]
        output: String,
    },
}

#[tokio::main]
async fn main() -> ExitCode {
    let cli = Cli::parse();

    // Initialize tracing
    let filter = if cli.verbose {
        EnvFilter::new("debug")
    } else {
        EnvFilter::new("warn")
    };

    tracing_subscriber::fmt()
        .with_env_filter(filter)
        .with_target(false)
        .init();

    match run(cli).await {
        Ok(code) => code,
        Err(e) => {
            error!("Fatal error: {}", e);
            eprintln!("Error: {}", e);
            ExitCode::FAILURE
        }
    }
}

async fn run(cli: Cli) -> Result<ExitCode, Box<dyn std::error::Error>> {
    match cli.command {
        Commands::Verify {
            request_id,
            file,
            output,
        } => {
            run_verify(request_id, file, &output).await
        }
        Commands::Constraints {
            category,
            enabled_only,
            output,
        } => {
            run_constraints(category, enabled_only, &output).await
        }
    }
}

/// Run the verify command
async fn run_verify(
    request_id: Option<String>,
    file: Option<String>,
    output_format: &str,
) -> Result<ExitCode, Box<dyn std::error::Error>> {
    // Load physics from request or file
    // Track whether request_id was explicitly provided (vs generated for file mode)
    let (physics, req_id, has_request_id) = match (request_id, file) {
        (Some(req_id), _) => {
            info!("Loading physics from request: {}", req_id);
            let request: VerifyRequest = io::read_request(&req_id)?;
            (request.physics, req_id, true)
        }
        (None, Some(file_path)) => {
            info!("Loading physics from file: {}", file_path);
            let content = fs::read_to_string(&file_path)?;
            let physics: PhysicsAnalysis = serde_json::from_str(&content)?;
            (physics, uuid::Uuid::new_v4().to_string(), false)
        }
        (None, None) => {
            eprintln!("Error: Either --request-id or --file must be provided");
            return Ok(ExitCode::FAILURE);
        }
    };

    // Run verification
    info!("Verifying physics: effect={}", physics.effect);
    let results = verify_constraints(&physics)?;

    // Create response
    let response = VerifyResponse::new(req_id.clone(), results);

    // FR-003 fix: Always write response file when request_id was provided,
    // regardless of output format. This ensures IPC consumers can read the response.
    if has_request_id {
        io::write_response(&req_id, &response)?;
        info!("Response written to pub/responses/lens-{}.json", req_id);
    }

    // Output results to stdout
    match output_format {
        "json" => {
            let json = serde_json::to_string_pretty(&response)?;
            println!("{}", json);
        }
        _ => {
            print_verify_results(&response);
        }
    }

    // Return exit code based on verification result
    if response.passed {
        Ok(ExitCode::SUCCESS)
    } else {
        Ok(ExitCode::from(1))
    }
}

/// Print verification results in text format
fn print_verify_results(response: &VerifyResponse) {
    println!("\n┌─ Verification Results ─────────────────────────────────┐");
    println!("│");

    if response.passed {
        println!("│  ✓ All constraints passed");
    } else {
        println!("│  ✗ Verification failed");
    }

    println!("│");
    println!("│  Summary:");
    println!("│    Total:    {}", response.summary.total);
    println!("│    Passed:   {}", response.summary.passed);
    println!("│    Failed:   {}", response.summary.failed);
    if response.summary.errors > 0 {
        println!("│    Errors:   {}", response.summary.errors);
    }
    if response.summary.warnings > 0 {
        println!("│    Warnings: {}", response.summary.warnings);
    }

    // Show failures
    let failures: Vec<&ConstraintResult> = response.results.iter().filter(|r| !r.passed).collect();
    if !failures.is_empty() {
        println!("│");
        println!("│  Failures:");
        for result in failures {
            let icon = match result.severity {
                sigil_lens_core::Severity::Error => "✗",
                sigil_lens_core::Severity::Warning => "⚠",
                sigil_lens_core::Severity::Info => "ℹ",
            };
            println!("│    {} [{}] {}", icon, result.constraint_id, result.message);
        }
    }

    println!("│");
    println!("└────────────────────────────────────────────────────────┘\n");
}

/// Run the constraints listing command
async fn run_constraints(
    category: Option<String>,
    enabled_only: bool,
    output_format: &str,
) -> Result<ExitCode, Box<dyn std::error::Error>> {
    // Load constraints
    let constraints = load_constraints()?;

    // Filter by category if specified
    let category_filter: Option<ConstraintCategory> = category.as_ref().and_then(|c| {
        match c.to_lowercase().as_str() {
            "behavioral" => Some(ConstraintCategory::Behavioral),
            "animation" => Some(ConstraintCategory::Animation),
            "material" => Some(ConstraintCategory::Material),
            "protected" => Some(ConstraintCategory::Protected),
            "general" => Some(ConstraintCategory::General),
            _ => None,
        }
    });

    let filtered: Vec<_> = constraints
        .into_iter()
        .filter(|c| {
            let category_match = category_filter.map_or(true, |cat| c.category == cat);
            let enabled_match = !enabled_only || c.enabled;
            category_match && enabled_match
        })
        .collect();

    // Output
    match output_format {
        "json" => {
            let json = serde_json::to_string_pretty(&filtered)?;
            println!("{}", json);
        }
        _ => {
            println!("\n┌─ Available Constraints ────────────────────────────────┐");
            println!("│");
            println!("│  Total: {} constraints", filtered.len());
            println!("│");

            // Group by category
            for category in [
                ConstraintCategory::Behavioral,
                ConstraintCategory::Animation,
                ConstraintCategory::Material,
                ConstraintCategory::Protected,
                ConstraintCategory::General,
            ] {
                let cat_constraints: Vec<_> = filtered.iter()
                    .filter(|c| c.category == category)
                    .collect();

                if !cat_constraints.is_empty() {
                    println!("│  {:?}:", category);
                    for c in cat_constraints {
                        let status = if c.enabled { "✓" } else { "○" };
                        println!("│    {} {} - {}", status, c.id, c.name);
                    }
                    println!("│");
                }
            }

            println!("└────────────────────────────────────────────────────────┘\n");
        }
    }

    Ok(ExitCode::SUCCESS)
}
