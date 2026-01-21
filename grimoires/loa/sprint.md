# Sprint Plan: Anchor Rust Port

**Version**: 1.0.0
**Status**: Active
**Created**: 2026-01-21
**Author**: Claude Opus 4.5
**PRD Reference**: `grimoires/loa/prd.md`
**SDD Reference**: `grimoires/loa/sdd.md`

---

## Overview

Port Anchor from TypeScript to Rust across 8 sprints (1 week each).

**Total Effort**: ~5,300 LOC TypeScript → ~6,000 LOC Rust
**Test Target**: 153 tests (feature parity)
**Platforms**: Linux x86_64/aarch64, macOS x86_64/aarch64 (P0), Windows (P1)

---

## Sprint 1: Project Setup & Types Module

**Duration**: Week 1
**Goal**: Establish project structure and port all core types

### Tasks

#### S1-T1: Initialize Rust Workspace
**Description**: Create Cargo workspace with lib and CLI crates
**Acceptance Criteria**:
- [ ] `Cargo.toml` workspace file with members: `crates/anchor-core`, `crates/anchor-cli`
- [ ] All dependencies from SDD Section 3.2 added
- [ ] `cargo build` succeeds with no errors
- [ ] `cargo clippy` passes with no warnings
- [ ] `cargo fmt` configured with rustfmt.toml
**Dependencies**: None
**Estimated Effort**: 2 hours

#### S1-T2: Configure CI Pipeline
**Description**: Set up GitHub Actions for CI/CD
**Acceptance Criteria**:
- [ ] `.github/workflows/ci.yml` with: build, test, clippy, fmt checks
- [ ] Matrix build for: Linux x86_64, macOS x86_64, macOS aarch64
- [ ] `cargo test` runs on all PRs
- [ ] Badge added to README
**Dependencies**: S1-T1
**Estimated Effort**: 2 hours

#### S1-T3: Port Zone Type
**Description**: Implement Zone enum with hierarchy methods
**Acceptance Criteria**:
- [ ] `types/zone.rs` implements `Zone` enum (Critical, Elevated, Standard, Local)
- [ ] `Zone::HIERARCHY` constant array
- [ ] `rank()`, `is_more_restrictive_than()`, `is_at_least_as_restrictive_as()` methods
- [ ] `Display`, `FromStr`, `Serialize`, `Deserialize` traits
- [ ] 100% test coverage for zone hierarchy logic
**Dependencies**: S1-T1
**Estimated Effort**: 3 hours
**Tests**: Port `zone.test.ts` (12 tests)

#### S1-T4: Port Network Type
**Description**: Implement Network enum with presets
**Acceptance Criteria**:
- [ ] `types/network.rs` implements `Network` enum
- [ ] Preset networks: Mainnet, Sepolia, Base, Arbitrum, Optimism, Berachain
- [ ] `Custom { name, chain_id, rpc_url }` variant
- [ ] `chain_id()`, `default_rpc_url()`, `name()` methods
- [ ] `FromStr` parsing with aliases (mainnet/ethereum/eth)
**Dependencies**: S1-T1
**Estimated Effort**: 2 hours
**Tests**: 5 tests for network parsing

#### S1-T5: Port Fork Types
**Description**: Implement Fork and ForkRegistry structs
**Acceptance Criteria**:
- [ ] `types/fork.rs` with `Fork` struct (id, network, block_number, rpc_url, port, pid, created_at, session_id)
- [ ] `ForkRegistry` struct with add/remove/get methods
- [ ] Serde serialization compatible with TypeScript format
- [ ] Roundtrip test: TS-written JSON readable by Rust
**Dependencies**: S1-T4
**Estimated Effort**: 2 hours
**Tests**: 8 tests for fork registry

#### S1-T6: Port Task Types
**Description**: Implement Task, TaskType, and TaskStatus
**Acceptance Criteria**:
- [ ] `types/task.rs` with `TaskType` enum (Fork, Ground, Warden, Generate, Validate, Write)
- [ ] `TaskStatus` enum (Pending, Running, Complete, Blocked, Failed)
- [ ] `Task` struct with all fields from SDD Section 4.1.4
- [ ] Serde rename for snake_case JSON keys
**Dependencies**: S1-T1
**Estimated Effort**: 2 hours
**Tests**: 6 tests

#### S1-T7: Port Physics Types
**Description**: Implement physics-related types
**Acceptance Criteria**:
- [ ] `types/physics.rs` with `SyncStrategy`, `ConfirmationType`, `EffectType` enums
- [ ] `PhysicsRule` struct
- [ ] `PhysicsTable` struct with HashMap storage
- [ ] Default physics values match TypeScript exactly
**Dependencies**: S1-T1
**Estimated Effort**: 2 hours
**Tests**: 10 tests for physics defaults

#### S1-T8: Implement Error Types
**Description**: Create comprehensive error handling
**Acceptance Criteria**:
- [ ] `error.rs` with `AnchorError` enum (all variants from SDD Section 5.1)
- [ ] `exit_code()` method returning correct exit codes per PRD Section 5.2
- [ ] `From` implementations for std::io::Error, serde_json::Error
**Dependencies**: S1-T3, S1-T4
**Estimated Effort**: 2 hours
**Tests**: 8 tests for exit codes

---

## Sprint 2: RPC Client & Fork Manager

**Duration**: Week 2
**Goal**: Implement RPC communication and Anvil process management

### Tasks

#### S2-T1: Implement JSON-RPC Client
**Description**: Create async RPC client for Anvil communication
**Acceptance Criteria**:
- [ ] `rpc/client.rs` with `RpcClient` struct
- [ ] `JsonRpcRequest` and `JsonRpcResponse` types
- [ ] Generic `call<P, R>()` method with timeout
- [ ] `is_ready()` and `wait_for_ready()` methods
- [ ] `RpcError` enum with all error variants
**Dependencies**: S1-T8
**Estimated Effort**: 4 hours
**Tests**: 10 tests (with mock server)

#### S2-T2: Implement Standard RPC Methods
**Description**: Add Ethereum JSON-RPC methods
**Acceptance Criteria**:
- [ ] `get_chain_id()` → `eth_chainId`
- [ ] `get_block_number()` → `eth_blockNumber`
- [ ] Hex parsing utility `parse_hex_u64()`
- [ ] Error handling for invalid responses
**Dependencies**: S2-T1
**Estimated Effort**: 2 hours
**Tests**: 6 tests

#### S2-T3: Implement Anvil-Specific RPC Methods
**Description**: Add Anvil snapshot/state methods
**Acceptance Criteria**:
- [ ] `create_snapshot()` → `evm_snapshot`
- [ ] `revert_snapshot()` → `evm_revert`
- [ ] `dump_state()` → `anvil_dumpState`
- [ ] `load_state()` → `anvil_loadState`
**Dependencies**: S2-T1
**Estimated Effort**: 2 hours
**Tests**: 8 tests (integration with real Anvil)

#### S2-T4: Implement ForkManager Core
**Description**: Create fork lifecycle manager
**Acceptance Criteria**:
- [ ] `lifecycle/fork.rs` with `ForkManager` struct
- [ ] `load_registry()` and `save_registry()` async methods
- [ ] `find_available_port()` method
- [ ] Port tracking with `used_ports: HashSet<u16>`
**Dependencies**: S1-T5, S2-T1
**Estimated Effort**: 3 hours
**Tests**: 6 tests

#### S2-T5: Implement Fork Creation
**Description**: Spawn Anvil processes for forking
**Acceptance Criteria**:
- [ ] `fork()` method spawns Anvil with correct arguments
- [ ] Waits for RPC readiness before returning
- [ ] Updates registry with new fork
- [ ] Handles missing RPC URL error gracefully
**Dependencies**: S2-T4
**Estimated Effort**: 4 hours
**Tests**: 5 integration tests

#### S2-T6: Implement Fork Termination
**Description**: Kill Anvil processes
**Acceptance Criteria**:
- [ ] `kill(fork_id)` terminates process and updates registry
- [ ] `kill_all()` terminates all forks
- [ ] Unix: Uses `nix::sys::signal::kill` with SIGTERM
- [ ] Handles orphaned processes (kill by PID if no handle)
**Dependencies**: S2-T5
**Estimated Effort**: 3 hours
**Tests**: 4 tests

#### S2-T7: Implement Fork CLI Commands
**Description**: Add CLI commands for fork management
**Acceptance Criteria**:
- [ ] `anchor fork <network> [--block] [--port]`
- [ ] `anchor forks [--json]`
- [ ] `anchor kill <fork-id>`
- [ ] `anchor kill-all`
- [ ] `anchor env <fork-id> [--export]`
- [ ] JSON output format matches TypeScript
**Dependencies**: S2-T5, S2-T6
**Estimated Effort**: 3 hours
**Tests**: 10 CLI tests

---

## Sprint 3: Snapshot & Checkpoint Managers

**Duration**: Week 3
**Goal**: Implement EVM state management

### Tasks

#### S3-T1: Implement SnapshotManager Core
**Description**: Create snapshot lifecycle manager
**Acceptance Criteria**:
- [ ] `lifecycle/snapshot.rs` with `SnapshotManager` struct
- [ ] `Snapshot` struct with id, fork_id, session_id, task_id, block_number, created_at, description
- [ ] `SnapshotRegistry` struct with save/load
- [ ] Registry path: `grimoires/anchor/sessions/{session_id}/snapshots.json`
**Dependencies**: S2-T3
**Estimated Effort**: 3 hours
**Tests**: 6 tests

#### S3-T2: Implement Snapshot Operations
**Description**: Create and revert snapshots
**Acceptance Criteria**:
- [ ] `create()` calls `evm_snapshot` and updates registry
- [ ] `revert()` calls `evm_revert` with snapshot ID
- [ ] `list()` returns all snapshots for session
- [ ] `get(snapshot_id)` returns specific snapshot
**Dependencies**: S3-T1
**Estimated Effort**: 3 hours
**Tests**: 8 integration tests

#### S3-T3: Implement CheckpointManager Core
**Description**: Create checkpoint manager for full state dumps
**Acceptance Criteria**:
- [ ] `lifecycle/checkpoint.rs` with `CheckpointManager` struct
- [ ] `Checkpoint` struct with id, session_id, block_number, size_bytes, created_at
- [ ] Binary state storage at `grimoires/anchor/checkpoints/{id}.bin`
- [ ] Compression with zstd (optional feature)
**Dependencies**: S2-T3
**Estimated Effort**: 3 hours
**Tests**: 5 tests

#### S3-T4: Implement Checkpoint Operations
**Description**: Save and restore full state
**Acceptance Criteria**:
- [ ] `save()` calls `anvil_dumpState` and writes to disk
- [ ] `restore()` reads state and calls `anvil_loadState`
- [ ] `list()` returns all checkpoints for session
- [ ] `delete()` removes checkpoint file
**Dependencies**: S3-T3
**Estimated Effort**: 3 hours
**Tests**: 6 integration tests

#### S3-T5: Implement Snapshot CLI Commands
**Description**: Add CLI commands for snapshot management
**Acceptance Criteria**:
- [ ] `anchor snapshot [--session] [--description]`
- [ ] `anchor snapshots [--session] [--json]`
- [ ] `anchor revert <snapshot-id>`
- [ ] Exit code 4 on revert failure
**Dependencies**: S3-T2
**Estimated Effort**: 2 hours
**Tests**: 6 CLI tests

#### S3-T6: Implement Checkpoint CLI Commands
**Description**: Add CLI commands for checkpoint management
**Acceptance Criteria**:
- [ ] `anchor checkpoint <session-id>`
- [ ] `anchor checkpoints <session-id> [--json]`
- [ ] `anchor restore <checkpoint-id>`
- [ ] Progress indicator for large state operations
**Dependencies**: S3-T4
**Estimated Effort**: 2 hours
**Tests**: 5 CLI tests

---

## Sprint 4: Session Manager

**Duration**: Week 4
**Goal**: Implement session orchestration layer

### Tasks

#### S4-T1: Implement Session Types
**Description**: Define session data structures
**Acceptance Criteria**:
- [ ] `types/session.rs` with `Session` struct
- [ ] Fields: id, network, block_number, fork_id, status, created_at, resumed_at
- [ ] `SessionStatus` enum (Active, Paused, Completed, Failed)
- [ ] `SessionMetadata` for persistence
**Dependencies**: S1-T5
**Estimated Effort**: 2 hours
**Tests**: 4 tests

#### S4-T2: Implement SessionManager Core
**Description**: Create session lifecycle orchestrator
**Acceptance Criteria**:
- [ ] `lifecycle/session.rs` with `SessionManager` struct
- [ ] Coordinates ForkManager, SnapshotManager, CheckpointManager
- [ ] Session directory: `grimoires/anchor/sessions/{session_id}/`
- [ ] `metadata.json` persistence
**Dependencies**: S4-T1, S2-T4, S3-T1, S3-T3
**Estimated Effort**: 4 hours
**Tests**: 6 tests

#### S4-T3: Implement Session Creation
**Description**: Create new sessions with fork
**Acceptance Criteria**:
- [ ] `create()` creates fork, initial snapshot, session metadata
- [ ] Auto-generates session ID (UUID v4)
- [ ] Stores active session ID for quick resume
- [ ] Handles fork creation failure gracefully
**Dependencies**: S4-T2
**Estimated Effort**: 3 hours
**Tests**: 5 tests

#### S4-T4: Implement Session Resume
**Description**: Resume paused sessions
**Acceptance Criteria**:
- [ ] `resume(session_id)` loads metadata and restores fork
- [ ] Verifies fork is still running or restarts it
- [ ] Restores to last snapshot or checkpoint
- [ ] Updates `resumed_at` timestamp
**Dependencies**: S4-T3
**Estimated Effort**: 3 hours
**Tests**: 5 tests

#### S4-T5: Implement Session Status
**Description**: Query session state
**Acceptance Criteria**:
- [ ] `status(session_id)` returns full session state
- [ ] Includes: fork health, snapshot count, task progress
- [ ] `list()` returns all sessions with summary
- [ ] Handles missing/corrupted sessions
**Dependencies**: S4-T2
**Estimated Effort**: 2 hours
**Tests**: 4 tests

#### S4-T6: Implement Session CLI Commands
**Description**: Add CLI commands for session management
**Acceptance Criteria**:
- [ ] `anchor session <network> [--block]`
- [ ] `anchor sessions [--json]`
- [ ] `anchor resume <session-id>`
- [ ] `anchor status <session-id> [--json]`
- [ ] Output format matches TypeScript
**Dependencies**: S4-T3, S4-T4, S4-T5
**Estimated Effort**: 3 hours
**Tests**: 8 CLI tests

---

## Sprint 5: Physics & Vocabulary Loaders

**Duration**: Week 5
**Goal**: Implement Sigil rules parsing

### Tasks

#### S5-T1: Implement Physics Loader
**Description**: Parse physics rules from markdown
**Acceptance Criteria**:
- [ ] `warden/physics.rs` with `load_physics()` async function
- [ ] Parses `<physics_table>` section from markdown
- [ ] Regex extraction of table rows
- [ ] Returns `PhysicsTable` with all rules
**Dependencies**: S1-T7
**Estimated Effort**: 4 hours
**Tests**: 8 tests for parsing

#### S5-T2: Implement Default Physics
**Description**: Embedded physics defaults
**Acceptance Criteria**:
- [ ] `get_default_physics()` returns hardcoded defaults
- [ ] Values match TypeScript exactly per PRD Section 5.1
- [ ] Fallback when no physics file found
- [ ] Feature flag `embedded-defaults` for compile-time embedding
**Dependencies**: S5-T1
**Estimated Effort**: 2 hours
**Tests**: 4 tests

#### S5-T3: Implement Physics Caching
**Description**: Add caching for physics loading
**Acceptance Criteria**:
- [ ] `OnceCell` for global physics cache
- [ ] `load_physics_cached()` returns cached or loads fresh
- [ ] `clear_physics_cache()` for testing (feature-gated)
- [ ] Thread-safe access
**Dependencies**: S5-T1
**Estimated Effort**: 2 hours
**Tests**: 3 tests

#### S5-T4: Implement Vocabulary Loader
**Description**: Parse vocabulary/lexicon from markdown
**Acceptance Criteria**:
- [ ] `warden/vocabulary.rs` with `load_vocabulary()` async function
- [ ] Parses keyword lists for each effect type
- [ ] Parses type overrides (Currency → Financial)
- [ ] Returns `VocabularyTable` with keyword→effect mapping
**Dependencies**: S1-T7
**Estimated Effort**: 4 hours
**Tests**: 10 tests

#### S5-T5: Implement Effect Resolution
**Description**: Resolve effect type from keywords
**Acceptance Criteria**:
- [ ] `resolve_effect_from_keywords()` function
- [ ] Priority: type override > primary keywords > extended keywords
- [ ] Returns `Option<EffectType>` (None if no match)
- [ ] Case-insensitive matching
**Dependencies**: S5-T4
**Estimated Effort**: 3 hours
**Tests**: 12 tests for effect resolution

#### S5-T6: Implement Physics/Vocabulary CLI Commands
**Description**: Add diagnostic CLI commands
**Acceptance Criteria**:
- [ ] `anchor physics [--file] [--json]` shows loaded physics
- [ ] `anchor vocabulary [--file] [--json]` shows keyword mappings
- [ ] Pretty-print table format for human output
- [ ] Error messages for missing/invalid files
**Dependencies**: S5-T1, S5-T4
**Estimated Effort**: 2 hours
**Tests**: 4 CLI tests

---

## Sprint 6: Grounding Gate & Adversarial Warden

**Duration**: Week 6
**Goal**: Implement validation logic

### Tasks

#### S6-T1: Implement Statement Parser
**Description**: Parse grounding statements from text
**Acceptance Criteria**:
- [ ] `warden/grounding.rs` with `parse_grounding_statement()` function
- [ ] `GroundingStatement` struct with component, cited_zone, keywords, claimed_physics
- [ ] Regex extraction for Component:, Zone:, Sync:, Timing:, Keywords:
- [ ] Handles multiple input formats
**Dependencies**: S5-T4
**Estimated Effort**: 4 hours
**Tests**: 15 tests for parsing edge cases

#### S6-T2: Implement Validation Checks
**Description**: Core validation logic
**Acceptance Criteria**:
- [ ] `check_relevance()` verifies zone matches component type
- [ ] `check_hierarchy()` verifies cited zone ≥ required zone
- [ ] `check_rules()` verifies physics values match requirements
- [ ] `CheckResult` struct with passed/reason fields
**Dependencies**: S6-T1, S5-T1
**Estimated Effort**: 4 hours
**Tests**: 12 tests

#### S6-T3: Implement Grounding Gate
**Description**: Main validation entry point
**Acceptance Criteria**:
- [ ] `validate_grounding()` async function
- [ ] Loads physics and vocabulary
- [ ] Runs all checks and aggregates results
- [ ] Returns `ValidationResult` with status, required_zone, checks, correction
**Dependencies**: S6-T2
**Estimated Effort**: 3 hours
**Tests**: 10 tests

#### S6-T4: Implement Adversarial Warden
**Description**: Enhanced validation with learned rules
**Acceptance Criteria**:
- [ ] `warden/adversarial.rs` with `AdversarialWarden` struct
- [ ] `LearnedRule` type for dynamic rule injection
- [ ] `add_learned_rule()`, `clear_learned_rules()`, `get_learned_rules()` methods
- [ ] `check_learned_rules()` validates against injected rules
**Dependencies**: S6-T3
**Estimated Effort**: 4 hours
**Tests**: 8 tests

#### S6-T5: Implement Adversarial Validation
**Description**: Full adversarial validation pipeline
**Acceptance Criteria**:
- [ ] `validate()` method runs base + adversarial checks
- [ ] `AdversarialWardenResult` extends `ValidationResult` with adversarial checks
- [ ] Drift detection for over-claiming
- [ ] Deceptive detection for under-claiming
**Dependencies**: S6-T4
**Estimated Effort**: 3 hours
**Tests**: 10 tests

#### S6-T6: Implement Zone Utility Functions
**Description**: Helper functions for zone operations
**Acceptance Criteria**:
- [ ] `is_more_restrictive()` standalone function
- [ ] `is_at_least_as_restrictive()` standalone function
- [ ] `get_hierarchy_description()` returns readable string
- [ ] Singleton warden instance: `get_warden()`, `reset_warden()`
**Dependencies**: S1-T3
**Estimated Effort**: 1 hour
**Tests**: 4 tests

#### S6-T7: Implement Validation CLI Commands
**Description**: Add CLI commands for validation
**Acceptance Criteria**:
- [ ] `anchor validate [--file] [--text] [--json]` basic validation
- [ ] `anchor warden [--file] [--text] [--hierarchy] [--json]` full warden
- [ ] Exit codes: 0=VALID, 1=DRIFT, 2=DECEPTIVE, 6=SCHEMA
- [ ] `--exit-code` flag to enable exit code behavior
**Dependencies**: S6-T5
**Estimated Effort**: 3 hours
**Tests**: 12 CLI tests

---

## Sprint 7: Task Graph & Integration

**Duration**: Week 7
**Goal**: Implement dependency graph and full integration

### Tasks

#### S7-T1: Implement TaskGraph Core
**Description**: Create petgraph-based task graph
**Acceptance Criteria**:
- [ ] `graph/task.rs` with `TaskGraph` struct
- [ ] Uses `petgraph::DiGraph` internally
- [ ] `tasks: HashMap<String, Task>` for O(1) lookup
- [ ] `node_indices: HashMap<String, NodeIndex>` for graph mapping
**Dependencies**: S1-T6
**Estimated Effort**: 3 hours
**Tests**: 6 tests

#### S7-T2: Implement Task Addition
**Description**: Add tasks with dependency validation
**Acceptance Criteria**:
- [ ] `add_task()` validates dependencies exist
- [ ] `would_create_cycle()` uses DFS to detect cycles
- [ ] Returns `CircularDependency` error on cycle
- [ ] Adds edges for dependencies
**Dependencies**: S7-T1
**Estimated Effort**: 3 hours
**Tests**: 8 tests (including cycle detection)

#### S7-T3: Implement Task Queries
**Description**: Query task graph state
**Acceptance Criteria**:
- [ ] `get()`, `get_mut()` for single task
- [ ] `get_by_status()` returns tasks by status
- [ ] `get_ready_tasks()` returns pending tasks with all deps complete
- [ ] `set_status()` updates task and sets completed_at
**Dependencies**: S7-T1
**Estimated Effort**: 2 hours
**Tests**: 6 tests

#### S7-T4: Implement Graph Serialization
**Description**: JSON persistence for task graph
**Acceptance Criteria**:
- [ ] `to_json()` serializes all tasks
- [ ] `from_json()` deserializes and rebuilds graph
- [ ] Compatible with TypeScript `graph.json` format
- [ ] Roundtrip test: TS-written graph readable by Rust
**Dependencies**: S7-T1
**Estimated Effort**: 2 hours
**Tests**: 4 tests

#### S7-T5: Implement Graph CLI Commands
**Description**: Add CLI commands for graph operations
**Acceptance Criteria**:
- [ ] `anchor graph [--session] [--json]` shows task graph
- [ ] Pretty-print dependency tree for human output
- [ ] Shows task statuses with colors (if terminal supports)
**Dependencies**: S7-T3
**Estimated Effort**: 2 hours
**Tests**: 3 CLI tests

#### S7-T6: Integration Testing
**Description**: Full pipeline integration tests
**Acceptance Criteria**:
- [ ] Test: session → fork → task → snapshot → validate → checkpoint
- [ ] Test: resume session from checkpoint
- [ ] Test: parallel task execution
- [ ] Test: error recovery and rollback
**Dependencies**: All Sprint 1-6 tasks
**Estimated Effort**: 6 hours
**Tests**: 10 integration tests

#### S7-T7: TypeScript Compatibility Tests
**Description**: Verify file format compatibility
**Acceptance Criteria**:
- [ ] Test: Rust reads TypeScript-created forks.json
- [ ] Test: Rust reads TypeScript-created sessions
- [ ] Test: TypeScript reads Rust-created files
- [ ] Automated in CI with both versions
**Dependencies**: S7-T4
**Estimated Effort**: 3 hours
**Tests**: 6 compatibility tests

---

## Sprint 8: Polish & Release

**Duration**: Week 8
**Goal**: Performance optimization, documentation, release

### Tasks

#### S8-T1: Performance Benchmarks
**Description**: Create benchmarks and optimize hot paths
**Acceptance Criteria**:
- [ ] `benches/` directory with criterion benchmarks
- [ ] Benchmark: cold start time (target: <50ms)
- [ ] Benchmark: RPC call latency (target: <25ms)
- [ ] Benchmark: validation time (target: <30ms)
- [ ] CI job runs benchmarks and reports regressions
**Dependencies**: All implementation complete
**Estimated Effort**: 4 hours

#### S8-T2: Binary Size Optimization
**Description**: Reduce release binary size
**Acceptance Criteria**:
- [ ] Enable LTO in release profile
- [ ] Strip debug symbols
- [ ] codegen-units = 1
- [ ] Target: <10MB compressed
- [ ] Document size per platform
**Dependencies**: S8-T1
**Estimated Effort**: 2 hours

#### S8-T3: Cross-Platform Testing
**Description**: Verify all platforms work correctly
**Acceptance Criteria**:
- [ ] All tests pass on Linux x86_64
- [ ] All tests pass on Linux aarch64 (CI cross-compile or QEMU)
- [ ] All tests pass on macOS x86_64
- [ ] All tests pass on macOS aarch64
- [ ] Windows x86_64 builds and basic tests pass
**Dependencies**: S7-T6
**Estimated Effort**: 4 hours

#### S8-T4: Documentation
**Description**: Write user and developer documentation
**Acceptance Criteria**:
- [ ] `README.md` for anchor-rust crate
- [ ] `ARCHITECTURE.md` with module overview
- [ ] Rustdoc comments on all public items
- [ ] `cargo doc` builds without warnings
- [ ] Migration guide from TypeScript version
**Dependencies**: All implementation complete
**Estimated Effort**: 4 hours

#### S8-T5: Release Automation
**Description**: Set up automated releases
**Acceptance Criteria**:
- [ ] `.github/workflows/release.yml` per SDD Section 8.1
- [ ] Tag triggers build for all platforms
- [ ] Binaries uploaded to GitHub Releases
- [ ] Naming: `anchor-{version}-{os}-{arch}.tar.gz`
- [ ] SHA256 checksums generated
**Dependencies**: S8-T2
**Estimated Effort**: 3 hours

#### S8-T6: crates.io Preparation
**Description**: Prepare for crate publication
**Acceptance Criteria**:
- [ ] `Cargo.toml` metadata complete (description, license, keywords, categories)
- [ ] `cargo publish --dry-run` succeeds
- [ ] Reserved crate name: `sigil-anchor`
- [ ] Version: 0.1.0
**Dependencies**: S8-T4
**Estimated Effort**: 1 hour

#### S8-T7: MVP Release
**Description**: Tag and release v0.1.0
**Acceptance Criteria**:
- [ ] All 153 tests pass
- [ ] All CLI commands functional
- [ ] All exit codes match TypeScript
- [ ] File format compatibility verified
- [ ] GitHub Release created with changelog
- [ ] Binaries available for Linux + macOS
**Dependencies**: All Sprint 8 tasks
**Estimated Effort**: 2 hours

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Markdown parsing edge cases | HIGH | MEDIUM | Extensive test suite from TS, fallback to defaults |
| Process management OS differences | MEDIUM | HIGH | Conditional compilation, CI matrix testing |
| Async complexity bugs | MEDIUM | MEDIUM | Property-based testing, careful code review |
| Performance regression | LOW | MEDIUM | Benchmarks in CI, profiling |
| File format incompatibility | LOW | HIGH | Roundtrip tests with TypeScript version |

---

## Test Summary

| Sprint | Unit Tests | Integration Tests | CLI Tests | Total |
|--------|------------|-------------------|-----------|-------|
| 1 | 49 | 0 | 0 | 49 |
| 2 | 16 | 13 | 10 | 39 |
| 3 | 11 | 14 | 11 | 36 |
| 4 | 13 | 10 | 8 | 31 |
| 5 | 27 | 0 | 4 | 31 |
| 6 | 39 | 10 | 12 | 61 |
| 7 | 20 | 16 | 3 | 39 |
| 8 | 0 | 6 | 0 | 6 |
| **Total** | **175** | **69** | **48** | **292** |

Note: Target exceeds 153 (TypeScript test count) to account for Rust-specific tests (error handling, async edge cases, property tests).

---

## Dependencies Graph

```
Sprint 1 ─────────────────────────────────────────────────┐
  │                                                        │
  ├─ S1-T1 (workspace) ──┬─ S1-T2 (CI)                    │
  │                      ├─ S1-T3 (Zone)                  │
  │                      ├─ S1-T4 (Network)               │
  │                      ├─ S1-T6 (Task)                  │
  │                      └─ S1-T7 (Physics)               │
  │                                                        │
  ├─ S1-T4 ──────────── S1-T5 (Fork types)               │
  │                                                        │
  └─ S1-T3, S1-T4 ───── S1-T8 (Error)                    │
                                                          │
Sprint 2 ◄────────────────────────────────────────────────┘
  │
  ├─ S1-T8 ──────────── S2-T1 (RPC client)
  │                      ├─ S2-T2 (ETH methods)
  │                      └─ S2-T3 (Anvil methods)
  │
  ├─ S1-T5, S2-T1 ───── S2-T4 (ForkManager core)
  │                      ├─ S2-T5 (Fork create)
  │                      └─ S2-T6 (Fork kill)
  │
  └─ S2-T5, S2-T6 ───── S2-T7 (Fork CLI)
                        │
Sprint 3 ◄──────────────┘
  │
  ├─ S2-T3 ──────────── S3-T1 (Snapshot core) ── S3-T2 (ops) ── S3-T5 (CLI)
  │
  └─ S2-T3 ──────────── S3-T3 (Checkpoint core) ── S3-T4 (ops) ── S3-T6 (CLI)
                        │
Sprint 4 ◄──────────────┘
  │
  ├─ S1-T5 ──────────── S4-T1 (Session types)
  │
  └─ S4-T1, S2-T4, S3-T1, S3-T3 ── S4-T2 (SessionManager)
                                    ├─ S4-T3 (create)
                                    ├─ S4-T4 (resume)
                                    └─ S4-T5 (status)
                                         │
Sprint 5 ◄───────────────────────────────┘
  │
  ├─ S1-T7 ──────────── S5-T1 (Physics loader)
  │                      ├─ S5-T2 (defaults)
  │                      └─ S5-T3 (cache)
  │
  └─ S1-T7 ──────────── S5-T4 (Vocabulary) ── S5-T5 (effect resolution)
                        │
Sprint 6 ◄──────────────┘
  │
  ├─ S5-T4 ──────────── S6-T1 (Statement parser)
  │
  ├─ S6-T1, S5-T1 ───── S6-T2 (Validation checks) ── S6-T3 (Grounding gate)
  │
  ├─ S6-T3 ──────────── S6-T4 (Adversarial) ── S6-T5 (Full validation)
  │
  └─ S6-T5 ──────────── S6-T7 (Validation CLI)
                        │
Sprint 7 ◄──────────────┘
  │
  ├─ S1-T6 ──────────── S7-T1 (TaskGraph core)
  │                      ├─ S7-T2 (add task)
  │                      ├─ S7-T3 (queries)
  │                      └─ S7-T4 (serialization) ── S7-T7 (TS compat)
  │
  └─ All S1-S6 ──────── S7-T6 (Integration tests)
                        │
Sprint 8 ◄──────────────┘
  │
  └─ All ──────────────── S8-T1 through S8-T7 (Polish & Release)
```

---

## Success Criteria

### MVP (v0.1.0) — End of Sprint 8

- [ ] All CLI commands functional (100% feature parity)
- [ ] Exit codes match TypeScript implementation
- [ ] File format compatibility verified (bidirectional)
- [ ] Linux x86_64/aarch64 + macOS x86_64/aarch64 supported
- [ ] 153+ tests passing
- [ ] Binary size < 10MB compressed
- [ ] Cold start < 50ms
- [ ] Documentation complete

### Stable (v1.0.0) — Post-MVP

- [ ] Windows support
- [ ] Library API stable (no breaking changes)
- [ ] Published on crates.io
- [ ] All performance targets met
- [ ] 6-month deprecation notice for TypeScript version

---

*Document generated by Claude Opus 4.5*
*Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>*
