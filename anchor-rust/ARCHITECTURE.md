# Anchor Architecture

This document describes the architecture of the Anchor Rust implementation.

## Module Overview

```
anchor-rust/
├── crates/
│   ├── anchor-core/           # Library crate
│   │   ├── src/
│   │   │   ├── lib.rs         # Public API, re-exports
│   │   │   ├── error.rs       # Error types, exit codes
│   │   │   ├── types/         # Core domain types
│   │   │   │   ├── zone.rs    # Security zone hierarchy
│   │   │   │   ├── network.rs # Blockchain network configs
│   │   │   │   ├── fork.rs    # Fork state and registry
│   │   │   │   ├── session.rs # Development session state
│   │   │   │   ├── task.rs    # Task types and status
│   │   │   │   ├── physics.rs # Design physics rules
│   │   │   │   ├── snapshot.rs# EVM snapshot types
│   │   │   │   └── checkpoint.rs # Session checkpoint types
│   │   │   ├── lifecycle/     # State management
│   │   │   │   ├── fork.rs    # ForkManager - Anvil process control
│   │   │   │   ├── session.rs # SessionManager - session lifecycle
│   │   │   │   ├── snapshot.rs# SnapshotManager - EVM snapshots
│   │   │   │   └── checkpoint.rs # CheckpointManager - persistence
│   │   │   ├── rpc/           # JSON-RPC client
│   │   │   │   ├── client.rs  # HTTP transport
│   │   │   │   ├── eth.rs     # Standard eth_* methods
│   │   │   │   └── anvil.rs   # Anvil-specific methods
│   │   │   ├── warden/        # Physics validation
│   │   │   │   ├── parser.rs  # Grounding statement parser
│   │   │   │   ├── vocabulary.rs # Keyword → Effect mapping
│   │   │   │   ├── physics.rs # Physics rule loader
│   │   │   │   ├── validation.rs # Grounding checks
│   │   │   │   └── adversarial.rs # Edge case detection
│   │   │   └── graph/         # Task graph
│   │   │       └── task.rs    # TaskGraph with petgraph
│   │   ├── benches/           # Criterion benchmarks
│   │   └── tests/             # Integration tests
│   │
│   └── anchor-cli/            # Binary crate
│       └── src/
│           └── main.rs        # CLI commands (clap)
│
├── Cargo.toml                 # Workspace definition
├── README.md                  # User documentation
└── ARCHITECTURE.md            # This file
```

## Design Decisions

### Zone Security Model

Zones form a strict hierarchy for permission boundaries:

```
Critical > Elevated > Standard > Local
```

- **Critical**: Financial operations (claim, withdraw, stake)
- **Elevated**: Destructive operations (delete, revoke)
- **Standard**: Reversible mutations (update, create)
- **Local**: Client-only state (theme, UI toggles)

Zone validation ensures components don't under-claim their security requirements.

### Physics Validation

Design physics encode timing, sync strategy, and confirmation requirements:

| Effect | Sync | Timing | Confirmation |
|--------|------|--------|--------------|
| Financial | Pessimistic | 800ms | Required |
| Destructive | Pessimistic | 600ms | Required |
| Soft Delete | Optimistic | 200ms | Toast + Undo |
| Standard | Optimistic | 200ms | None |
| Local | Immediate | 100ms | None |

The Warden validates that grounding statements match these physics rules.

### Task Graph

Uses `petgraph` DiGraph for:
- O(1) task lookup via HashMap index
- Cycle detection on task addition
- Topological ordering for execution
- Parallel-ready task identification

```rust
// Ready tasks have all dependencies complete
let ready = graph.get_ready_tasks();

// Topological order respects dependencies
let order = graph.topological_order()?;
```

### Session Persistence

Sessions serialize to JSON for TypeScript compatibility:

```json
{
  "id": "session-abc123",
  "network": "mainnet",
  "block_number": 18500000,
  "status": "active",
  "fork_id": "fork-xyz",
  "created_at": "2024-01-15T10:00:00Z"
}
```

Checkpoints bundle session + snapshots for full state recovery.

### RPC Client

Async HTTP client with typed methods:

```rust
// Standard Ethereum methods
client.eth_block_number().await?
client.eth_get_balance(address, block).await?

// Anvil-specific methods
client.anvil_snapshot().await?
client.anvil_revert(snapshot_id).await?
client.anvil_mine(blocks).await?
```

Supports all networks via chain ID and RPC URL configuration.

## Error Handling

Exit codes match TypeScript for scripting compatibility:

| Code | Name | When |
|------|------|------|
| 0 | SUCCESS | Operation completed |
| 1 | DRIFT | Zone over-claimed |
| 2 | DECEPTIVE | Zone under-claimed |
| 3 | VIOLATION | Physics mismatch |
| 4 | REVERT | Snapshot failed |
| 5 | CORRUPT | State corrupted |
| 6 | SCHEMA | Invalid input |

All errors carry context for debugging:

```rust
AnchorError::SessionNotResumable(id, status)
// "Session abc123 cannot be resumed: status is completed"
```

## Performance

### Targets

- Cold start: <50ms (loading defaults)
- RPC latency: <25ms (excluding network)
- Validation: <30ms (full pipeline)
- Binary: <10MB compressed

### Optimizations

- `once_cell` for lazy static initialization
- Regex compilation cached at module level
- LTO + strip for minimal binary size
- `opt-level = "z"` for size optimization

## Testing Strategy

### Unit Tests

Each module has inline tests:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_zone_hierarchy() {
        assert!(Zone::Critical.is_more_restrictive_than(&Zone::Standard));
    }
}
```

### Integration Tests

Full pipeline tests in `tests/`:

```rust
#[test]
fn test_validation_pipeline() {
    let statement = parse_grounding_statement(INPUT)?;
    let result = validate_grounding(&statement, &vocab, &physics);
    assert!(matches!(result.status, ValidationStatus::Valid));
}
```

### Property Tests

`proptest` for invariant checking:

```rust
proptest! {
    #[test]
    fn zone_ordering_is_total(z1: Zone, z2: Zone) {
        // Either z1 >= z2 or z2 > z1
        assert!(z1.is_at_least_as_restrictive_as(&z2) ||
                z2.is_more_restrictive_than(&z1));
    }
}
```

## Future Considerations

### Planned Enhancements

1. **Parallel Task Execution**: Execute independent tasks concurrently
2. **Remote Forks**: Support for cloud-hosted Anvil instances
3. **Live Reload**: Watch for file changes and re-validate
4. **LSP Integration**: Language server for editor support

### Extension Points

- Custom physics loaders (YAML, TOML sources)
- Plugin system for validation hooks
- Metrics export (OpenTelemetry)
