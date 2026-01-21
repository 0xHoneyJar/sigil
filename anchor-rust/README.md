# Anchor Rust

[![Anchor Rust CI](https://github.com/0xHoneyJar/sigil/actions/workflows/anchor-rust-ci.yml/badge.svg)](https://github.com/0xHoneyJar/sigil/actions/workflows/anchor-rust-ci.yml)

Ground truth enforcement for Sigil design physics. A Rust port of the TypeScript Anchor library with identical behavior and file format compatibility.

## Overview

Anchor provides a pipeline for state-pinned development on blockchain applications:

- **Fork Management**: Create and manage Anvil forks for isolated testing
- **Snapshot/Checkpoint**: Save and restore blockchain state
- **Session Management**: Track development sessions across restarts
- **Task Graphs**: Dependency-aware task execution pipelines
- **Physics Validation**: Enforce Sigil design physics (zones, timing, confirmation patterns)

## Installation

### From Binary Releases

Download the latest release for your platform from [GitHub Releases](https://github.com/0xHoneyJar/sigil/releases).

```bash
# Linux/macOS
tar -xzf anchor-<version>-<target>.tar.gz
./anchor --help

# Windows
# Extract the zip file and run anchor.exe
```

### From Source

```bash
cd anchor-rust
cargo install --path crates/anchor-cli
```

## CLI Usage

```bash
# Create a new development session
anchor session create --network mainnet --block 18500000

# Fork management
anchor fork create --session <id> --rpc-url $ETH_RPC_URL
anchor fork list
anchor fork kill <fork-id>

# Snapshot management
anchor snapshot create <fork-id>
anchor snapshot revert <snapshot-id>

# Checkpoint management
anchor checkpoint save <session-id>
anchor checkpoint load <checkpoint-id>

# Physics validation
anchor validate --statement "Component: ClaimButton; Zone: Critical; Keywords: claim"

# Task graph operations
anchor graph --session <id> show
anchor graph --session <id> --topo  # Topological order
anchor graph --session <id> --json  # JSON output
```

## Library Usage

```rust
use sigil_anchor_core::{
    Session, Network, Zone, PhysicsTable, TaskGraph, Task, TaskType,
    parse_grounding_statement, validate_grounding, Vocabulary,
};

// Create a session
let session = Session::new("dev-session", Network::Mainnet, 18500000);

// Build a task graph
let mut graph = TaskGraph::new();
graph.add_task(Task::new("fork", TaskType::Fork, serde_json::json!({})))?;
graph.add_task(Task::with_dependencies(
    "validate",
    TaskType::Validate,
    serde_json::json!({}),
    vec!["fork".to_string()],
))?;

// Physics validation
let statement = parse_grounding_statement(r#"
    Component: ClaimButton
    Zone: Critical
    Keywords: claim, withdraw
    Sync: pessimistic
    Timing: 800ms
"#)?;

let physics = PhysicsTable::defaults();
let vocab = Vocabulary::defaults();
let result = validate_grounding(&statement, &vocab, &physics);
```

## Supported Networks

| Network | Chain ID | Alias |
|---------|----------|-------|
| Ethereum Mainnet | 1 | mainnet, ethereum, eth |
| Sepolia Testnet | 11155111 | sepolia |
| Base | 8453 | base |
| Arbitrum One | 42161 | arbitrum, arb |
| Optimism | 10 | optimism, op |
| Berachain | 80094 | berachain, bera |

## Exit Codes

| Code | Name | Description |
|------|------|-------------|
| 0 | VALID | Validation passed |
| 1 | DRIFT | Over-claiming physics (zone too high) |
| 2 | DECEPTIVE | Under-claiming physics (zone too low) |
| 3 | VIOLATION | Physics rule violated |
| 4 | REVERT | Snapshot revert failed |
| 5 | CORRUPT | State corruption detected |
| 6 | SCHEMA | Invalid input schema |

## Configuration

Anchor looks for configuration in:
1. `~/.config/anchor/config.toml` (Linux/macOS)
2. `%APPDATA%\anchor\config.toml` (Windows)
3. Environment variables

```toml
[rpc]
mainnet = "https://eth-mainnet.g.alchemy.com/v2/..."
base = "https://base-mainnet.g.alchemy.com/v2/..."

[defaults]
network = "mainnet"
```

Environment variables:
- `ANCHOR_RPC_MAINNET` - Mainnet RPC URL
- `ANCHOR_RPC_BASE` - Base RPC URL
- `ANCHOR_DATA_DIR` - Data directory path

## Performance

Targets:
- Cold start: <50ms
- RPC latency: <25ms (network excluded)
- Validation: <30ms
- Binary size: <10MB compressed

Run benchmarks:
```bash
cargo bench -p sigil-anchor-core
```

## Development

```bash
# Run tests
cargo test --all-features

# Run clippy
cargo clippy --all-features -- -D warnings

# Format code
cargo fmt --all

# Build release
cargo build --release
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for module overview and design decisions.

## Migration from TypeScript

The Rust version is a drop-in replacement for the TypeScript version:
- Identical file formats (JSON sessions, checkpoints, snapshots)
- Same CLI commands and flags
- Same exit codes
- Same validation behavior

## License

AGPL-3.0 - See [LICENSE](../LICENSE) for details.
