//! Anchor CLI - State-pinned development for blockchain applications.
//!
//! Commands:
//! - `anchor fork` - Create a local fork of a blockchain network
//! - `anchor forks` - List all active forks
//! - `anchor kill` - Terminate a fork
//! - `anchor kill-all` - Terminate all forks
//! - `anchor env` - Get environment variables for a fork
//! - `anchor snapshot` - Create a snapshot of current state
//! - `anchor snapshots` - List all snapshots
//! - `anchor revert` - Revert to a snapshot
//! - `anchor checkpoint` - Save full state checkpoint
//! - `anchor checkpoints` - List all checkpoints
//! - `anchor restore` - Restore from a checkpoint
//! - `anchor session` - Create a new development session
//! - `anchor sessions` - List all sessions
//! - `anchor resume` - Resume a paused session
//! - `anchor status` - Show current fork and task status
//! - `anchor physics` - Show physics rules
//! - `anchor vocabulary` - Show vocabulary/lexicon
//! - `anchor resolve` - Resolve effect type from keywords
//! - `anchor validate` - Validate a grounding statement
//! - `anchor warden` - Adversarial warden for drift/deceptive detection
//! - `anchor graph` - Show task graph for a session

use clap::{Parser, Subcommand};
use sigil_anchor_core::{
    get_default_physics, get_warden, parse_grounding_statement, validate_grounding,
    CheckpointManager, ForkManager, LearnedRule, Network, PhysicsLoader, RpcClient, SessionManager,
    SessionStatus, SnapshotManager, TaskGraph, ValidationStatus, Vocabulary, VocabularyLoader,
    Zone, VERSION,
};
use std::path::PathBuf;
use std::str::FromStr;

/// Default path for the fork registry.
fn default_registry_path() -> PathBuf {
    dirs::data_local_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("anchor")
        .join("registry.json")
}

/// Anchor - State-pinned blockchain development
#[derive(Parser)]
#[command(name = "anchor")]
#[command(author, version, about, long_about = None)]
struct Cli {
    /// Set the zone for operations
    #[arg(short, long, global = true, default_value = "standard")]
    zone: String,

    /// Path to the fork registry file
    #[arg(long, global = true, env = "ANCHOR_REGISTRY")]
    registry: Option<PathBuf>,

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
        #[arg(short, long)]
        port: Option<u16>,

        /// Session ID to associate with this fork
        #[arg(short, long)]
        session: Option<String>,
    },

    /// List all active forks
    Forks {
        /// Output as JSON
        #[arg(long)]
        json: bool,
    },

    /// Terminate a fork
    Kill {
        /// Fork ID to terminate
        fork_id: String,
    },

    /// Terminate all forks
    KillAll,

    /// Get environment variables for a fork
    Env {
        /// Fork ID
        fork_id: String,

        /// Export format (shell export statements)
        #[arg(long)]
        export: bool,
    },

    /// Validate code against forked state
    Ground {
        /// Path to the file or directory to validate
        path: String,
    },

    /// Create a snapshot of current EVM state
    Snapshot {
        /// Fork ID to snapshot
        fork_id: String,

        /// Session ID to associate with the snapshot
        #[arg(short, long)]
        session: Option<String>,

        /// Description for the snapshot
        #[arg(short, long)]
        description: Option<String>,
    },

    /// List all snapshots
    Snapshots {
        /// Fork ID to list snapshots for
        fork_id: String,

        /// Filter by session ID
        #[arg(short, long)]
        session: Option<String>,

        /// Output as JSON
        #[arg(long)]
        json: bool,
    },

    /// Revert to a snapshot
    Revert {
        /// Fork ID
        fork_id: String,

        /// Snapshot ID to revert to
        snapshot_id: String,
    },

    /// Save a full state checkpoint
    Checkpoint {
        /// Fork ID to checkpoint
        fork_id: String,

        /// Session ID (required for checkpoints)
        #[arg(short, long)]
        session: String,

        /// Description for the checkpoint
        #[arg(short, long)]
        description: Option<String>,
    },

    /// List all checkpoints
    Checkpoints {
        /// Session ID to list checkpoints for
        session: String,

        /// Output as JSON
        #[arg(long)]
        json: bool,
    },

    /// Restore from a checkpoint
    Restore {
        /// Fork ID to restore to
        fork_id: String,

        /// Checkpoint ID to restore from
        checkpoint_id: String,

        /// Session ID
        #[arg(short, long)]
        session: String,
    },

    /// Create a new development session
    Session {
        /// Network to fork (mainnet, sepolia, base, arbitrum, optimism, berachain)
        #[arg(short, long, default_value = "mainnet")]
        network: String,

        /// Block number to fork from (latest if not specified)
        #[arg(short, long)]
        block: Option<u64>,

        /// Description for the session
        #[arg(short, long)]
        description: Option<String>,
    },

    /// List all sessions
    Sessions {
        /// Filter by status (active, paused, completed, failed)
        #[arg(short, long)]
        status: Option<String>,

        /// Output as JSON
        #[arg(long)]
        json: bool,
    },

    /// Resume a paused session
    Resume {
        /// Session ID to resume
        session_id: String,
    },

    /// Pause an active session
    Pause {
        /// Session ID to pause
        session_id: String,
    },

    /// Show current fork and task status
    Status {
        /// Session ID to show status for (optional, shows all if not specified)
        session_id: Option<String>,

        /// Output as JSON
        #[arg(long)]
        json: bool,
    },

    /// Show version information
    Version,

    /// Show physics rules
    Physics {
        /// Path to custom physics file (uses defaults if not specified)
        #[arg(short, long)]
        file: Option<PathBuf>,

        /// Output as JSON
        #[arg(long)]
        json: bool,
    },

    /// Show vocabulary/lexicon
    Vocabulary {
        /// Path to custom vocabulary file (uses defaults if not specified)
        #[arg(short, long)]
        file: Option<PathBuf>,

        /// Output as JSON
        #[arg(long)]
        json: bool,
    },

    /// Resolve effect type from keywords
    Resolve {
        /// Keywords to analyze (comma-separated or multiple args)
        keywords: Vec<String>,

        /// Optional type hint (e.g., Currency, Password)
        #[arg(short, long)]
        type_hint: Option<String>,
    },

    /// Validate a grounding statement
    Validate {
        /// Path to file containing grounding statement
        #[arg(short, long)]
        file: Option<PathBuf>,

        /// Grounding statement text (alternative to --file)
        #[arg(short, long)]
        text: Option<String>,

        /// Output as JSON
        #[arg(long)]
        json: bool,
    },

    /// Adversarial warden - check statements with learned rules
    Warden {
        /// Path to file containing grounding statement
        #[arg(short, long)]
        file: Option<PathBuf>,

        /// Grounding statement text (alternative to --file)
        #[arg(short, long)]
        text: Option<String>,

        /// Show zone hierarchy
        #[arg(long)]
        hierarchy: bool,

        /// Add a learned rule (format: "pattern:zone:reason")
        #[arg(long)]
        add_rule: Option<String>,

        /// List current learned rules
        #[arg(long)]
        list_rules: bool,

        /// Clear all learned rules
        #[arg(long)]
        clear_rules: bool,

        /// Output as JSON
        #[arg(long)]
        json: bool,
    },

    /// Show task graph for a session
    Graph {
        /// Session ID to show graph for
        #[arg(short, long)]
        session: Option<String>,

        /// Path to graph file (alternative to --session)
        #[arg(short, long)]
        file: Option<PathBuf>,

        /// Output as JSON
        #[arg(long)]
        json: bool,

        /// Show only tasks with specific status
        #[arg(long)]
        status: Option<String>,

        /// Show in topological order
        #[arg(long)]
        topo: bool,
    },
}

#[tokio::main]
async fn main() {
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

    // Get registry path
    let registry_path = cli.registry.unwrap_or_else(default_registry_path);

    // Create fork manager
    let mut manager = ForkManager::new(&registry_path);
    if let Err(e) = manager.load_registry().await {
        eprintln!("Warning: Failed to load registry: {}", e);
    }

    match cli.command {
        Some(Commands::Fork {
            network,
            block,
            port,
            session,
        }) => {
            let net = match Network::from_str(&network) {
                Ok(n) => n,
                Err(e) => {
                    eprintln!("Error: {}", e);
                    std::process::exit(6); // SCHEMA error
                }
            };

            println!("Creating fork...");
            println!("  Network: {} (chain ID: {})", net.name(), net.chain_id());
            println!(
                "  Block: {}",
                block.map_or("latest".to_string(), |b| b.to_string())
            );
            if let Some(p) = port {
                println!("  Port: {}", p);
            }
            println!("  Zone: {}", zone);

            match manager.fork(net, block, port, session).await {
                Ok(fork) => {
                    println!("\nFork created successfully!");
                    println!("  ID: {}", fork.id);
                    println!("  RPC URL: {}", fork.rpc_url);
                    println!("  Block: {}", fork.block_number);
                    println!("  Port: {}", fork.port);
                    println!("  PID: {}", fork.pid);
                }
                Err(e) => {
                    eprintln!("Error creating fork: {}", e);
                    std::process::exit(4); // REVERT error
                }
            }
        }

        Some(Commands::Forks { json }) => {
            let forks = manager.all();

            if json {
                match serde_json::to_string_pretty(&forks) {
                    Ok(output) => println!("{}", output),
                    Err(e) => {
                        eprintln!("Error serializing forks: {}", e);
                        std::process::exit(6);
                    }
                }
            } else if forks.is_empty() {
                println!("No active forks.");
            } else {
                println!("Active forks:");
                println!();
                for fork in forks {
                    println!("  {} ({})", fork.id, fork.network.name());
                    println!("    RPC: {}", fork.rpc_url);
                    println!("    Block: {}", fork.block_number);
                    println!("    PID: {}", fork.pid);
                    if let Some(ref session) = fork.session_id {
                        println!("    Session: {}", session);
                    }
                    println!();
                }
            }
        }

        Some(Commands::Kill { fork_id }) => match manager.kill(&fork_id).await {
            Ok(()) => {
                println!("Fork {} terminated.", fork_id);
            }
            Err(e) => {
                eprintln!("Error killing fork: {}", e);
                std::process::exit(4);
            }
        },

        Some(Commands::KillAll) => {
            let count = manager.all().len();
            match manager.kill_all().await {
                Ok(()) => {
                    println!("Terminated {} fork(s).", count);
                }
                Err(e) => {
                    eprintln!("Error killing forks: {}", e);
                    std::process::exit(4);
                }
            }
        }

        Some(Commands::Env { fork_id, export }) => match manager.get(&fork_id) {
            Some(fork) => {
                if export {
                    println!("export FORK_RPC_URL=\"{}\"", fork.rpc_url);
                    println!("export FORK_CHAIN_ID=\"{}\"", fork.network.chain_id());
                    println!("export FORK_BLOCK_NUMBER=\"{}\"", fork.block_number);
                    println!("export FORK_ID=\"{}\"", fork.id);
                } else {
                    println!("FORK_RPC_URL={}", fork.rpc_url);
                    println!("FORK_CHAIN_ID={}", fork.network.chain_id());
                    println!("FORK_BLOCK_NUMBER={}", fork.block_number);
                    println!("FORK_ID={}", fork.id);
                }
            }
            None => {
                eprintln!("Fork not found: {}", fork_id);
                std::process::exit(6);
            }
        },

        Some(Commands::Ground { path }) => {
            println!("Grounding validation for: {}", path);
            println!("  Zone: {}", zone);
            println!("\nGrounding validation not yet implemented.");
        }

        Some(Commands::Snapshot {
            fork_id,
            session,
            description,
        }) => {
            // Get fork to verify it exists and get RPC URL
            let fork = match manager.get(&fork_id) {
                Some(f) => f.clone(),
                None => {
                    eprintln!("Fork not found: {}", fork_id);
                    std::process::exit(6);
                }
            };

            // Create snapshot manager
            let client = RpcClient::new(&fork.rpc_url);
            let snapshot_registry_path = registry_path
                .parent()
                .unwrap_or(&registry_path)
                .join("snapshots")
                .join(format!("{}.json", fork_id));

            let mut snapshot_manager =
                SnapshotManager::new(client, &fork_id, &snapshot_registry_path);
            if let Err(e) = snapshot_manager.load_registry().await {
                eprintln!("Warning: Failed to load snapshot registry: {}", e);
            }

            match snapshot_manager.create(session, None, description).await {
                Ok(snapshot) => {
                    println!("Snapshot created successfully!");
                    println!("  ID: {}", snapshot.id);
                    println!("  Fork: {}", snapshot.fork_id);
                    println!("  Block: {}", snapshot.block_number);
                    if let Some(ref sess) = snapshot.session_id {
                        println!("  Session: {}", sess);
                    }
                    if let Some(ref desc) = snapshot.description {
                        println!("  Description: {}", desc);
                    }
                }
                Err(e) => {
                    eprintln!("Error creating snapshot: {}", e);
                    std::process::exit(4);
                }
            }
        }

        Some(Commands::Snapshots {
            fork_id,
            session,
            json,
        }) => {
            // Get fork to verify it exists
            if manager.get(&fork_id).is_none() {
                eprintln!("Fork not found: {}", fork_id);
                std::process::exit(6);
            }

            // Create snapshot manager
            let snapshot_registry_path = registry_path
                .parent()
                .unwrap_or(&registry_path)
                .join("snapshots")
                .join(format!("{}.json", fork_id));

            let client = RpcClient::new("http://localhost:8545"); // Not used for listing
            let mut snapshot_manager =
                SnapshotManager::new(client, &fork_id, &snapshot_registry_path);
            if let Err(e) = snapshot_manager.load_registry().await {
                eprintln!("Warning: Failed to load snapshot registry: {}", e);
            }

            let snapshots: Vec<_> = if let Some(ref sess) = session {
                snapshot_manager
                    .list_by_session(sess)
                    .into_iter()
                    .cloned()
                    .collect()
            } else {
                snapshot_manager.list().to_vec()
            };

            if json {
                match serde_json::to_string_pretty(&snapshots) {
                    Ok(output) => println!("{}", output),
                    Err(e) => {
                        eprintln!("Error serializing snapshots: {}", e);
                        std::process::exit(6);
                    }
                }
            } else if snapshots.is_empty() {
                println!("No snapshots for fork {}.", fork_id);
            } else {
                println!("Snapshots for fork {}:", fork_id);
                println!();
                for snapshot in snapshots {
                    println!("  {}", snapshot.id);
                    println!("    Block: {}", snapshot.block_number);
                    println!("    Created: {}", snapshot.created_at);
                    if let Some(ref sess) = snapshot.session_id {
                        println!("    Session: {}", sess);
                    }
                    if let Some(ref desc) = snapshot.description {
                        println!("    Description: {}", desc);
                    }
                    println!();
                }
            }
        }

        Some(Commands::Revert {
            fork_id,
            snapshot_id,
        }) => {
            // Get fork to verify it exists and get RPC URL
            let fork = match manager.get(&fork_id) {
                Some(f) => f.clone(),
                None => {
                    eprintln!("Fork not found: {}", fork_id);
                    std::process::exit(6);
                }
            };

            // Create snapshot manager
            let client = RpcClient::new(&fork.rpc_url);
            let snapshot_registry_path = registry_path
                .parent()
                .unwrap_or(&registry_path)
                .join("snapshots")
                .join(format!("{}.json", fork_id));

            let mut snapshot_manager =
                SnapshotManager::new(client, &fork_id, &snapshot_registry_path);
            if let Err(e) = snapshot_manager.load_registry().await {
                eprintln!("Warning: Failed to load snapshot registry: {}", e);
            }

            match snapshot_manager.revert(&snapshot_id).await {
                Ok(()) => {
                    println!("Reverted to snapshot {}.", snapshot_id);
                }
                Err(e) => {
                    eprintln!("Error reverting to snapshot: {}", e);
                    std::process::exit(4);
                }
            }
        }

        Some(Commands::Checkpoint {
            fork_id,
            session,
            description,
        }) => {
            // Get fork to verify it exists and get RPC URL
            let fork = match manager.get(&fork_id) {
                Some(f) => f.clone(),
                None => {
                    eprintln!("Fork not found: {}", fork_id);
                    std::process::exit(6);
                }
            };

            // Create checkpoint manager
            let client = RpcClient::new(&fork.rpc_url);
            let checkpoint_registry_path = registry_path
                .parent()
                .unwrap_or(&registry_path)
                .join("checkpoints")
                .join(format!("{}.json", session));
            let checkpoints_dir = registry_path
                .parent()
                .unwrap_or(&registry_path)
                .join("checkpoints")
                .join("data");

            let mut checkpoint_manager = CheckpointManager::new(
                client,
                &fork_id,
                &session,
                &checkpoint_registry_path,
                &checkpoints_dir,
            );
            if let Err(e) = checkpoint_manager.load_registry().await {
                eprintln!("Warning: Failed to load checkpoint registry: {}", e);
            }

            match checkpoint_manager.save(description).await {
                Ok(checkpoint) => {
                    println!("Checkpoint saved successfully!");
                    println!("  ID: {}", checkpoint.id);
                    println!("  Fork: {}", checkpoint.fork_id);
                    println!("  Session: {}", checkpoint.session_id);
                    println!("  Block: {}", checkpoint.block_number);
                    println!("  Size: {} bytes", checkpoint.size_bytes);
                    if let Some(ref desc) = checkpoint.description {
                        println!("  Description: {}", desc);
                    }
                }
                Err(e) => {
                    eprintln!("Error saving checkpoint: {}", e);
                    std::process::exit(4);
                }
            }
        }

        Some(Commands::Checkpoints { session, json }) => {
            // Create checkpoint manager
            let checkpoint_registry_path = registry_path
                .parent()
                .unwrap_or(&registry_path)
                .join("checkpoints")
                .join(format!("{}.json", session));
            let checkpoints_dir = registry_path
                .parent()
                .unwrap_or(&registry_path)
                .join("checkpoints")
                .join("data");

            let client = RpcClient::new("http://localhost:8545"); // Not used for listing
            let mut checkpoint_manager = CheckpointManager::new(
                client,
                "unused",
                &session,
                &checkpoint_registry_path,
                &checkpoints_dir,
            );
            if let Err(e) = checkpoint_manager.load_registry().await {
                eprintln!("Warning: Failed to load checkpoint registry: {}", e);
            }

            let checkpoints = checkpoint_manager.list();

            if json {
                match serde_json::to_string_pretty(&checkpoints) {
                    Ok(output) => println!("{}", output),
                    Err(e) => {
                        eprintln!("Error serializing checkpoints: {}", e);
                        std::process::exit(6);
                    }
                }
            } else if checkpoints.is_empty() {
                println!("No checkpoints for session {}.", session);
            } else {
                println!("Checkpoints for session {}:", session);
                println!();
                for checkpoint in checkpoints {
                    println!("  {}", checkpoint.id);
                    println!("    Fork: {}", checkpoint.fork_id);
                    println!("    Block: {}", checkpoint.block_number);
                    println!("    Size: {} bytes", checkpoint.size_bytes);
                    println!("    Created: {}", checkpoint.created_at);
                    if let Some(ref desc) = checkpoint.description {
                        println!("    Description: {}", desc);
                    }
                    println!();
                }
            }
        }

        Some(Commands::Restore {
            fork_id,
            checkpoint_id,
            session,
        }) => {
            // Get fork to verify it exists and get RPC URL
            let fork = match manager.get(&fork_id) {
                Some(f) => f.clone(),
                None => {
                    eprintln!("Fork not found: {}", fork_id);
                    std::process::exit(6);
                }
            };

            // Create checkpoint manager
            let client = RpcClient::new(&fork.rpc_url);
            let checkpoint_registry_path = registry_path
                .parent()
                .unwrap_or(&registry_path)
                .join("checkpoints")
                .join(format!("{}.json", session));
            let checkpoints_dir = registry_path
                .parent()
                .unwrap_or(&registry_path)
                .join("checkpoints")
                .join("data");

            let mut checkpoint_manager = CheckpointManager::new(
                client,
                &fork_id,
                &session,
                &checkpoint_registry_path,
                &checkpoints_dir,
            );
            if let Err(e) = checkpoint_manager.load_registry().await {
                eprintln!("Warning: Failed to load checkpoint registry: {}", e);
            }

            match checkpoint_manager.restore(&checkpoint_id).await {
                Ok(()) => {
                    println!("Restored from checkpoint {}.", checkpoint_id);
                }
                Err(e) => {
                    eprintln!("Error restoring from checkpoint: {}", e);
                    std::process::exit(4);
                }
            }
        }

        Some(Commands::Session {
            network,
            block,
            description,
        }) => {
            let net = match Network::from_str(&network) {
                Ok(n) => n,
                Err(e) => {
                    eprintln!("Error: {}", e);
                    std::process::exit(6);
                }
            };

            // Create session manager
            let sessions_dir = registry_path
                .parent()
                .unwrap_or(&registry_path)
                .join("sessions");

            let mut session_manager = SessionManager::new(&sessions_dir);
            if let Err(e) = session_manager.load().await {
                eprintln!("Warning: Failed to load session registry: {}", e);
            }

            println!("Creating session...");
            println!("  Network: {} (chain ID: {})", net.name(), net.chain_id());
            println!(
                "  Block: {}",
                block.map_or("latest".to_string(), |b| b.to_string())
            );

            match session_manager.create(net, block, description).await {
                Ok(session) => {
                    println!("\nSession created successfully!");
                    println!("  ID: {}", session.id);
                    println!("  Network: {}", session.network.name());
                    println!("  Block: {}", session.block_number);
                    println!("  Status: {:?}", session.status);
                    if let Some(ref fork_id) = session.fork_id {
                        println!("  Fork: {}", fork_id);
                    }
                    if let Some(ref desc) = session.description {
                        println!("  Description: {}", desc);
                    }
                }
                Err(e) => {
                    eprintln!("Error creating session: {}", e);
                    std::process::exit(4);
                }
            }
        }

        Some(Commands::Sessions { status, json }) => {
            // Create session manager
            let sessions_dir = registry_path
                .parent()
                .unwrap_or(&registry_path)
                .join("sessions");

            let mut session_manager = SessionManager::new(&sessions_dir);
            if let Err(e) = session_manager.load().await {
                eprintln!("Warning: Failed to load session registry: {}", e);
            }

            let sessions: Vec<_> = if let Some(ref status_str) = status {
                let status_filter = match status_str.to_lowercase().as_str() {
                    "active" => SessionStatus::Active,
                    "paused" => SessionStatus::Paused,
                    "completed" => SessionStatus::Completed,
                    "failed" => SessionStatus::Failed,
                    _ => {
                        eprintln!(
                            "Invalid status: {}. Use: active, paused, completed, failed",
                            status_str
                        );
                        std::process::exit(6);
                    }
                };
                session_manager.list_by_status(status_filter)
            } else {
                session_manager.list().iter().collect()
            };

            if json {
                match serde_json::to_string_pretty(&sessions) {
                    Ok(output) => println!("{}", output),
                    Err(e) => {
                        eprintln!("Error serializing sessions: {}", e);
                        std::process::exit(6);
                    }
                }
            } else if sessions.is_empty() {
                println!("No sessions found.");
            } else {
                println!("Sessions:");
                println!();
                for session_meta in sessions {
                    let session = &session_meta.session;
                    println!("  {} ({:?})", session.id, session.status);
                    println!("    Network: {}", session.network.name());
                    println!("    Block: {}", session.block_number);
                    println!("    Created: {}", session.created_at);
                    if let Some(ref fork_id) = session.fork_id {
                        println!("    Fork: {}", fork_id);
                    }
                    if let Some(ref desc) = session.description {
                        println!("    Description: {}", desc);
                    }
                    println!("    Snapshots: {}", session_meta.snapshot_count);
                    println!("    Checkpoints: {}", session_meta.checkpoint_count);
                    println!();
                }
            }
        }

        Some(Commands::Resume { session_id }) => {
            // Create session manager
            let sessions_dir = registry_path
                .parent()
                .unwrap_or(&registry_path)
                .join("sessions");

            let mut session_manager = SessionManager::new(&sessions_dir);
            if let Err(e) = session_manager.load().await {
                eprintln!("Warning: Failed to load session registry: {}", e);
            }

            match session_manager.resume(&session_id).await {
                Ok(session) => {
                    println!("Session resumed successfully!");
                    println!("  ID: {}", session.id);
                    println!("  Network: {}", session.network.name());
                    println!("  Block: {}", session.block_number);
                    println!("  Status: {:?}", session.status);
                    if let Some(ref fork_id) = session.fork_id {
                        println!("  Fork: {}", fork_id);
                    }
                }
                Err(e) => {
                    eprintln!("Error resuming session: {}", e);
                    std::process::exit(4);
                }
            }
        }

        Some(Commands::Pause { session_id }) => {
            // Create session manager
            let sessions_dir = registry_path
                .parent()
                .unwrap_or(&registry_path)
                .join("sessions");

            let mut session_manager = SessionManager::new(&sessions_dir);
            if let Err(e) = session_manager.load().await {
                eprintln!("Warning: Failed to load session registry: {}", e);
            }

            match session_manager.pause(&session_id).await {
                Ok(()) => {
                    println!("Session {} paused.", session_id);
                }
                Err(e) => {
                    eprintln!("Error pausing session: {}", e);
                    std::process::exit(4);
                }
            }
        }

        Some(Commands::Status { session_id, json }) => {
            // Create session manager
            let sessions_dir = registry_path
                .parent()
                .unwrap_or(&registry_path)
                .join("sessions");

            let mut session_manager = SessionManager::new(&sessions_dir);
            if let Err(e) = session_manager.load().await {
                eprintln!("Warning: Failed to load session registry: {}", e);
            }

            if let Some(ref sid) = session_id {
                // Show specific session status
                match session_manager.get(sid) {
                    Some(session_meta) => {
                        if json {
                            match serde_json::to_string_pretty(&session_meta) {
                                Ok(output) => println!("{}", output),
                                Err(e) => {
                                    eprintln!("Error serializing session: {}", e);
                                    std::process::exit(6);
                                }
                            }
                        } else {
                            let session = &session_meta.session;
                            println!("Session: {}", session.id);
                            println!("  Status: {:?}", session.status);
                            println!("  Network: {}", session.network.name());
                            println!("  Block: {}", session.block_number);
                            println!("  Created: {}", session.created_at);
                            if let Some(ref resumed) = session.resumed_at {
                                println!("  Resumed: {}", resumed);
                            }
                            if let Some(ref fork_id) = session.fork_id {
                                println!("  Fork: {}", fork_id);
                            }
                            if let Some(ref desc) = session.description {
                                println!("  Description: {}", desc);
                            }
                            println!();
                            println!("Statistics:");
                            println!("  Snapshots: {}", session_meta.snapshot_count);
                            println!("  Checkpoints: {}", session_meta.checkpoint_count);
                            println!(
                                "  Checkpoint size: {} bytes",
                                session_meta.checkpoint_size_bytes
                            );
                            println!("  Tasks completed: {}", session_meta.tasks_completed);
                            println!("  Tasks pending: {}", session_meta.tasks_pending);
                            println!("  Last activity: {}", session_meta.last_activity);
                        }
                    }
                    None => {
                        eprintln!("Session not found: {}", sid);
                        std::process::exit(6);
                    }
                }
            } else {
                // Show general status
                if json {
                    let status = serde_json::json!({
                        "version": VERSION,
                        "zone": format!("{}", zone),
                        "registry": registry_path.display().to_string(),
                        "active_forks": manager.all().len(),
                        "active_session": session_manager.get_active().map(|s| &s.session.id),
                    });
                    match serde_json::to_string_pretty(&status) {
                        Ok(output) => println!("{}", output),
                        Err(e) => {
                            eprintln!("Error serializing status: {}", e);
                            std::process::exit(6);
                        }
                    }
                } else {
                    println!("Anchor Status");
                    println!("  Version: {}", VERSION);
                    println!("  Zone: {}", zone);
                    println!("  Registry: {}", registry_path.display());
                    println!();

                    // Show active session
                    if let Some(active) = session_manager.get_active() {
                        println!("Active session: {}", active.session.id);
                        println!("  Network: {}", active.session.network.name());
                        println!("  Block: {}", active.session.block_number);
                        if let Some(ref fork_id) = active.session.fork_id {
                            println!("  Fork: {}", fork_id);
                        }
                        println!();
                    }

                    // Show forks
                    let forks = manager.all();
                    if forks.is_empty() {
                        println!("No active forks.");
                    } else {
                        println!("Active forks: {}", forks.len());
                        for fork in forks {
                            println!("  - {} ({}:{})", fork.id, fork.network.name(), fork.port);
                        }
                    }
                }
            }
        }

        Some(Commands::Version) => {
            println!("Anchor v{}", VERSION);
        }

        Some(Commands::Physics { file, json }) => {
            let physics = if let Some(ref path) = file {
                let loader = PhysicsLoader::new().with_path(path.to_string_lossy().to_string());
                match loader.load().await {
                    Ok(p) => p,
                    Err(e) => {
                        eprintln!("Error loading physics from {:?}: {}", path, e);
                        std::process::exit(6);
                    }
                }
            } else {
                get_default_physics()
            };

            if json {
                let rules: Vec<_> = physics.iter().collect();
                match serde_json::to_string_pretty(&rules) {
                    Ok(output) => println!("{}", output),
                    Err(e) => {
                        eprintln!("Error serializing physics: {}", e);
                        std::process::exit(6);
                    }
                }
            } else {
                println!("Physics Rules");
                if let Some(ref path) = file {
                    println!("  Source: {:?}", path);
                } else {
                    println!("  Source: defaults");
                }
                println!();
                println!(
                    "{:<15} {:<12} {:<10} {:<15}",
                    "Effect", "Sync", "Timing", "Confirmation"
                );
                println!("{}", "-".repeat(55));
                for rule in physics.iter() {
                    println!(
                        "{:<15} {:<12} {:<10} {:<15}",
                        rule.effect.to_string(),
                        rule.sync.to_string(),
                        format!("{}ms", rule.timing_ms),
                        rule.confirmation.to_string()
                    );
                }
            }
        }

        Some(Commands::Vocabulary { file, json }) => {
            let vocabulary = if let Some(ref path) = file {
                let loader = VocabularyLoader::new().with_path(path.to_string_lossy().to_string());
                match loader.load().await {
                    Ok(v) => v,
                    Err(e) => {
                        eprintln!("Error loading vocabulary from {:?}: {}", path, e);
                        std::process::exit(6);
                    }
                }
            } else {
                Vocabulary::defaults()
            };

            if json {
                // Build a JSON-friendly structure
                let entries: Vec<_> = vocabulary.all_keywords().collect();
                let overrides = vocabulary.type_overrides();
                let output = serde_json::json!({
                    "keywords": entries,
                    "type_overrides": overrides,
                    "keyword_count": vocabulary.keyword_count()
                });
                match serde_json::to_string_pretty(&output) {
                    Ok(s) => println!("{}", s),
                    Err(e) => {
                        eprintln!("Error serializing vocabulary: {}", e);
                        std::process::exit(6);
                    }
                }
            } else {
                println!("Vocabulary");
                if let Some(ref path) = file {
                    println!("  Source: {:?}", path);
                } else {
                    println!("  Source: defaults");
                }
                println!();

                // Group keywords by effect
                use std::collections::HashMap;
                let mut by_effect: HashMap<String, Vec<String>> = HashMap::new();
                for entry in vocabulary.all_keywords() {
                    by_effect
                        .entry(entry.effect.to_string())
                        .or_default()
                        .push(entry.keyword.clone());
                }

                for (effect, keywords) in by_effect {
                    println!("{} ({} keywords):", effect, keywords.len());
                    // Print keywords in rows of 6
                    for chunk in keywords.chunks(6) {
                        println!("  {}", chunk.join(", "));
                    }
                    println!();
                }

                // Show type overrides
                println!("Type Overrides:");
                for override_entry in vocabulary.type_overrides() {
                    println!(
                        "  {} -> {} ({})",
                        override_entry.pattern, override_entry.effect, override_entry.reason
                    );
                }
            }
        }

        Some(Commands::Resolve {
            keywords,
            type_hint,
        }) => {
            let vocabulary = Vocabulary::defaults();

            // Flatten keywords (handle comma-separated) and join into a single text
            let all_keywords: Vec<String> = keywords
                .iter()
                .flat_map(|k| k.split(',').map(|s| s.trim().to_string()))
                .filter(|s| !s.is_empty())
                .collect();

            if all_keywords.is_empty() {
                eprintln!("No keywords provided.");
                std::process::exit(6);
            }

            let text = all_keywords.join(" ");
            let type_hints: Vec<&str> = type_hint.iter().map(|s| s.as_str()).collect();
            let effect = sigil_anchor_core::warden::resolve_effect_from_keywords(
                &text,
                &type_hints,
                &vocabulary,
            );

            println!("Keywords: {}", all_keywords.join(", "));
            if let Some(ref hint) = type_hint {
                println!("Type hint: {}", hint);
            }
            println!();

            match effect {
                Some(e) => {
                    println!("Resolved effect: {}", e);

                    // Show physics for this effect
                    let physics = get_default_physics();
                    if let Some(rule) = physics.get(&e) {
                        println!();
                        println!("Physics:");
                        println!("  Sync: {}", rule.sync);
                        println!("  Timing: {}ms", rule.timing_ms);
                        println!("  Confirmation: {}", rule.confirmation);
                    }
                }
                None => {
                    println!("No effect type resolved from keywords.");
                    println!("Try adding more specific keywords or a type hint.");
                }
            }
        }

        Some(Commands::Validate { file, text, json }) => {
            // Get statement text from file or --text
            let statement_text = if let Some(ref path) = file {
                match tokio::fs::read_to_string(path).await {
                    Ok(content) => content,
                    Err(e) => {
                        eprintln!("Error reading file {:?}: {}", path, e);
                        std::process::exit(6);
                    }
                }
            } else if let Some(ref t) = text {
                t.clone()
            } else {
                eprintln!("Error: Must provide --file or --text");
                std::process::exit(6);
            };

            // Parse the grounding statement
            let statement = match parse_grounding_statement(&statement_text) {
                Ok(s) => s,
                Err(e) => {
                    if json {
                        let output = serde_json::json!({
                            "status": "schema_error",
                            "error": e.to_string()
                        });
                        println!("{}", serde_json::to_string_pretty(&output).unwrap());
                    } else {
                        eprintln!("Parse error: {}", e);
                    }
                    std::process::exit(6); // SCHEMA error
                }
            };

            // Validate with defaults
            let vocabulary = Vocabulary::defaults();
            let physics = get_default_physics();
            let result = validate_grounding(&statement, &vocabulary, &physics);

            // Determine exit code
            let exit_code = match result.status {
                ValidationStatus::Valid => 0,
                ValidationStatus::Drift => 1,
                ValidationStatus::Deceptive => 2,
                ValidationStatus::SchemaError => 6,
            };

            if json {
                let output = serde_json::json!({
                    "status": format!("{:?}", result.status).to_lowercase(),
                    "component": statement.component,
                    "cited_zone": statement.cited_zone.to_string(),
                    "required_zone": result.required_zone.to_string(),
                    "checks": result.checks.iter().map(|c| serde_json::json!({
                        "name": c.name,
                        "passed": c.passed,
                        "reason": c.reason
                    })).collect::<Vec<_>>(),
                    "corrections": result.corrections.iter().map(|c| serde_json::json!({
                        "field": c.field,
                        "current": c.current,
                        "suggested": c.suggested,
                        "reason": c.reason
                    })).collect::<Vec<_>>()
                });
                println!("{}", serde_json::to_string_pretty(&output).unwrap());
            } else {
                println!("Validation Result: {:?}", result.status);
                println!();
                println!("Component: {}", statement.component);
                println!("Cited zone: {}", statement.cited_zone);
                println!("Required zone: {}", result.required_zone);
                println!();
                println!("Checks:");
                for check in &result.checks {
                    let status = if check.passed { "✓" } else { "✗" };
                    println!("  {} {}: {}", status, check.name, check.reason);
                }

                if !result.corrections.is_empty() {
                    println!();
                    println!("Corrections needed:");
                    for correction in &result.corrections {
                        println!(
                            "  {}: {} (current: {}, suggested: {})",
                            correction.field,
                            correction.reason,
                            correction.current,
                            correction.suggested
                        );
                    }
                }
            }

            std::process::exit(exit_code);
        }

        Some(Commands::Warden {
            file,
            text,
            hierarchy,
            add_rule,
            list_rules,
            clear_rules,
            json,
        }) => {
            // Handle hierarchy display
            if hierarchy {
                let hierarchy_desc = Zone::hierarchy_description();
                if json {
                    let zones: Vec<_> = Zone::HIERARCHY
                        .iter()
                        .enumerate()
                        .map(|(i, z)| {
                            serde_json::json!({
                                "zone": z.to_string(),
                                "rank": i,
                                "restrictiveness": if i == 0 {
                                    "most restrictive"
                                } else if i == Zone::HIERARCHY.len() - 1 {
                                    "least restrictive"
                                } else {
                                    "intermediate"
                                }
                            })
                        })
                        .collect();
                    let output = serde_json::json!({
                        "hierarchy": zones,
                        "description": hierarchy_desc
                    });
                    println!("{}", serde_json::to_string_pretty(&output).unwrap());
                } else {
                    println!("Zone Hierarchy (most to least restrictive):");
                    println!("  {}", hierarchy_desc);
                }
                return;
            }

            // Handle rule management
            let warden = get_warden();

            if clear_rules {
                let mut w = warden.write().await;
                w.clear_learned_rules();
                println!("All learned rules cleared.");
                return;
            }

            if let Some(ref rule_spec) = add_rule {
                // Parse rule: "pattern:zone:reason"
                let parts: Vec<&str> = rule_spec.splitn(3, ':').collect();
                if parts.len() != 3 {
                    eprintln!("Invalid rule format. Use: pattern:zone:reason");
                    std::process::exit(6);
                }

                let pattern = parts[0].to_string();
                let zone = match Zone::from_str(parts[1]) {
                    Ok(z) => z,
                    Err(e) => {
                        eprintln!("Invalid zone '{}': {}", parts[1], e);
                        std::process::exit(6);
                    }
                };
                let reason = parts[2].to_string();

                let rule = LearnedRule {
                    id: format!(
                        "rule-{}",
                        std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap()
                            .as_nanos()
                    ),
                    pattern,
                    required_zone: zone,
                    reason,
                    is_strict: false,
                };

                let mut w = warden.write().await;
                w.add_learned_rule(rule.clone());
                println!(
                    "Added learned rule: {} -> {} ({})",
                    rule.pattern, rule.required_zone, rule.reason
                );
                return;
            }

            if list_rules {
                let w = warden.read().await;
                let rules = w.get_learned_rules();

                if json {
                    let rules_json: Vec<_> = rules
                        .iter()
                        .map(|r| {
                            serde_json::json!({
                                "id": r.id,
                                "pattern": r.pattern,
                                "required_zone": r.required_zone.to_string(),
                                "reason": r.reason,
                                "is_strict": r.is_strict
                            })
                        })
                        .collect();
                    println!("{}", serde_json::to_string_pretty(&rules_json).unwrap());
                } else if rules.is_empty() {
                    println!("No learned rules.");
                } else {
                    println!("Learned rules:");
                    for rule in rules {
                        println!(
                            "  {} -> {} ({})",
                            rule.pattern, rule.required_zone, rule.reason
                        );
                    }
                }
                return;
            }

            // Validate a statement with adversarial checks
            let statement_text = if let Some(ref path) = file {
                match tokio::fs::read_to_string(path).await {
                    Ok(content) => content,
                    Err(e) => {
                        eprintln!("Error reading file {:?}: {}", path, e);
                        std::process::exit(6);
                    }
                }
            } else if let Some(ref t) = text {
                t.clone()
            } else {
                eprintln!("Error: Must provide --file, --text, --hierarchy, --list-rules, --add-rule, or --clear-rules");
                std::process::exit(6);
            };

            // Parse the grounding statement
            let statement = match parse_grounding_statement(&statement_text) {
                Ok(s) => s,
                Err(e) => {
                    if json {
                        let output = serde_json::json!({
                            "status": "schema_error",
                            "error": e.to_string()
                        });
                        println!("{}", serde_json::to_string_pretty(&output).unwrap());
                    } else {
                        eprintln!("Parse error: {}", e);
                    }
                    std::process::exit(6);
                }
            };

            // Run adversarial validation
            let vocabulary = Vocabulary::defaults();
            let physics = get_default_physics();
            let w = warden.read().await;
            let result = w.validate(&statement, &vocabulary, &physics);

            // Determine exit code
            let exit_code = if result.deceptive_detected {
                2 // DECEPTIVE
            } else if result.drift_detected {
                1 // DRIFT
            } else {
                match result.base_result.status {
                    ValidationStatus::Valid => 0,
                    ValidationStatus::Drift => 1,
                    ValidationStatus::Deceptive => 2,
                    ValidationStatus::SchemaError => 6,
                }
            };

            if json {
                let output = serde_json::json!({
                    "base_status": format!("{:?}", result.base_result.status).to_lowercase(),
                    "drift_detected": result.drift_detected,
                    "deceptive_detected": result.deceptive_detected,
                    "component": statement.component,
                    "cited_zone": statement.cited_zone.to_string(),
                    "required_zone": result.base_result.required_zone.to_string(),
                    "base_checks": result.base_result.checks.iter().map(|c| serde_json::json!({
                        "name": c.name,
                        "passed": c.passed,
                        "reason": c.reason
                    })).collect::<Vec<_>>(),
                    "adversarial_checks": result.adversarial_checks.iter().map(|c| serde_json::json!({
                        "name": c.name,
                        "passed": c.passed,
                        "reason": c.reason
                    })).collect::<Vec<_>>(),
                    "corrections": result.base_result.corrections.iter().map(|c| serde_json::json!({
                        "field": c.field,
                        "current": c.current,
                        "suggested": c.suggested,
                        "reason": c.reason
                    })).collect::<Vec<_>>()
                });
                println!("{}", serde_json::to_string_pretty(&output).unwrap());
            } else {
                println!("Adversarial Validation Result");
                println!();
                println!("Base status: {:?}", result.base_result.status);
                println!("Drift detected: {}", result.drift_detected);
                println!("Deceptive detected: {}", result.deceptive_detected);
                println!();
                println!("Component: {}", statement.component);
                println!("Cited zone: {}", statement.cited_zone);
                println!("Required zone: {}", result.base_result.required_zone);
                println!();
                println!("Base checks:");
                for check in &result.base_result.checks {
                    let status = if check.passed { "✓" } else { "✗" };
                    println!("  {} {}: {}", status, check.name, check.reason);
                }

                if !result.adversarial_checks.is_empty() {
                    println!();
                    println!("Adversarial checks:");
                    for check in &result.adversarial_checks {
                        let status = if check.passed { "✓" } else { "✗" };
                        println!("  {} {}: {}", status, check.name, check.reason);
                    }
                }

                if !result.base_result.corrections.is_empty() {
                    println!();
                    println!("Corrections needed:");
                    for correction in &result.base_result.corrections {
                        println!(
                            "  {}: {} (current: {}, suggested: {})",
                            correction.field,
                            correction.reason,
                            correction.current,
                            correction.suggested
                        );
                    }
                }
            }

            std::process::exit(exit_code);
        }

        Some(Commands::Graph {
            session,
            file,
            json,
            status,
            topo,
        }) => {
            use sigil_anchor_core::TaskStatus;

            // Load graph from file or session
            let graph = if let Some(ref path) = file {
                match TaskGraph::load(path).await {
                    Ok(g) => g,
                    Err(e) => {
                        eprintln!("Error loading graph from {:?}: {}", path, e);
                        std::process::exit(6);
                    }
                }
            } else if let Some(ref session_id) = session {
                // Try to load from session's graph file
                let graph_path = registry_path
                    .parent()
                    .unwrap_or(&registry_path)
                    .join("sessions")
                    .join(format!("{}_graph.json", session_id));

                match TaskGraph::load(&graph_path).await {
                    Ok(g) => g,
                    Err(e) => {
                        eprintln!("Error loading graph for session {}: {}", session_id, e);
                        eprintln!("Graph file not found at: {:?}", graph_path);
                        std::process::exit(6);
                    }
                }
            } else {
                eprintln!("Error: Must provide --session or --file");
                std::process::exit(6);
            };

            // Filter by status if specified
            let status_filter: Option<TaskStatus> =
                status
                    .as_ref()
                    .and_then(|s| match s.to_lowercase().as_str() {
                        "pending" => Some(TaskStatus::Pending),
                        "running" => Some(TaskStatus::Running),
                        "complete" | "completed" => Some(TaskStatus::Complete),
                        "blocked" => Some(TaskStatus::Blocked),
                        "failed" => Some(TaskStatus::Failed),
                        _ => {
                            eprintln!(
                            "Invalid status: {}. Use: pending, running, complete, blocked, failed",
                            s
                        );
                            None
                        }
                    });

            if json {
                // Output raw JSON
                match graph.to_json() {
                    Ok(json_str) => println!("{}", json_str),
                    Err(e) => {
                        eprintln!("Error serializing graph: {}", e);
                        std::process::exit(6);
                    }
                }
            } else {
                // Pretty print
                println!("Task Graph");
                println!("==========");
                println!("Total tasks: {}", graph.len());
                println!();

                // Summary by status
                let pending = graph.get_by_status(TaskStatus::Pending).len();
                let running = graph.get_by_status(TaskStatus::Running).len();
                let complete = graph.get_by_status(TaskStatus::Complete).len();
                let blocked = graph.get_by_status(TaskStatus::Blocked).len();
                let failed = graph.get_by_status(TaskStatus::Failed).len();

                println!(
                    "Status: {} pending, {} running, {} complete, {} blocked, {} failed",
                    pending, running, complete, blocked, failed
                );
                println!();

                // Ready tasks
                let ready = graph.get_ready_tasks();
                if !ready.is_empty() {
                    println!("Ready to execute:");
                    for task in &ready {
                        println!("  ○ {} [{}]", task.id, task.task_type);
                    }
                    println!();
                }

                // Task list or tree
                if topo {
                    println!("Tasks (topological order):");
                    for task in graph.topological_order() {
                        if let Some(ref filter) = status_filter {
                            if task.status != *filter {
                                continue;
                            }
                        }
                        let status_icon = match task.status {
                            TaskStatus::Complete => "✓",
                            TaskStatus::Running => "►",
                            TaskStatus::Failed => "✗",
                            TaskStatus::Blocked => "◌",
                            TaskStatus::Pending => "○",
                        };
                        let deps = if task.dependencies.is_empty() {
                            String::new()
                        } else {
                            format!(" <- {}", task.dependencies.join(", "))
                        };
                        println!("  {} {} [{}]{}", status_icon, task.id, task.task_type, deps);
                    }
                } else {
                    println!("Dependency tree:");
                    println!("{}", graph.pretty_tree());
                }
            }
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

    #[test]
    fn test_default_registry_path() {
        let path = default_registry_path();
        assert!(path.to_string_lossy().contains("anchor"));
        assert!(path.to_string_lossy().contains("registry.json"));
    }
}
