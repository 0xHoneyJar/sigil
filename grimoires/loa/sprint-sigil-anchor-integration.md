# Sprint Plan: Loa Constructs Triad

**Version**: 1.0.0
**Created**: 2026-01-20
**PRD Reference**: `grimoires/loa/prd-sigil-anchor-integration.md` (v4.2.0)
**SDD Reference**: `grimoires/loa/sdd-sigil-anchor-integration.md` (v1.0.0)

---

## Sprint Overview

| Attribute | Value |
|-----------|-------|
| Team Size | Solo developer |
| Sprint Duration | 2 weeks |
| Total Sprints | 6 |
| MVP Scope | Anchor CLI → Lens CLI → Integration |
| Estimated Completion | 12 weeks |

### Sprint Sequence

```
Sprint 1: Anchor CLI Foundation
    │
    ▼
Sprint 2: Anchor CLI Completion
    │
    ▼
Sprint 3: Lens CLI Foundation
    │
    ▼
Sprint 4: Lens CLI Completion
    │
    ▼
Sprint 5: Integration & Skills
    │
    ▼
Sprint 6: Polish & Release
```

---

## MVP Definition

### MVP Scope (Sprints 1-4)

| Feature | Included | Rationale |
|---------|----------|-----------|
| Anchor `validate` command | ✓ | Core zone validation |
| Anchor `check-source` command | ✓ | Data physics enforcement |
| Anchor `publish` command | ✓ | Vocabulary/zones to pub/ |
| Lens `verify` command | ✓ | Formal constraint checking |
| Lens `lint` command | ✓ | Heuristic analysis |
| Correction context | ✓ | Retry loop support |
| Skills orchestration | Sprint 5 | Post-MVP integration |
| Sandboxing | v2 | Deferred per SDD |

### MVP Exit Criteria

- [ ] `anchor validate` returns correct exit codes for all zone types
- [ ] `anchor publish` writes valid vocabulary.yaml and zones.yaml
- [ ] `lens verify` evaluates all constraint types via CEL
- [ ] `lens lint` returns correction context on failures
- [ ] Request/response JSON schemas validated
- [ ] 80% unit test coverage on core modules

---

## Sprint 1: Anchor CLI Foundation

**Goal**: Establish Rust workspace, implement core types, and basic validate command.

**Duration**: 2 weeks

### Tasks

#### S1-T1: Workspace Setup

**Description**: Initialize Rust workspace with anchor crate, configure Cargo.toml, set up CI.

**Acceptance Criteria**:
- [ ] Cargo workspace with `anchor/` member crate
- [ ] Dependencies: clap, tokio, serde, serde_json, serde_yaml, uuid, thiserror, tracing
- [ ] `cargo build` succeeds
- [ ] `cargo test` runs (empty test suite)
- [ ] GitHub Actions CI workflow: build + test on Linux/macOS/Windows

**Effort**: 2 days
**Dependencies**: None
**Testing**: `cargo build && cargo test`

---

#### S1-T2: Core Types Module

**Description**: Implement shared types for zones, vocabulary, requests, responses, and exit codes.

**Acceptance Criteria**:
- [ ] `types/zone.rs`: Zone enum (Critical, Elevated, Standard, Local)
- [ ] `types/vocabulary.rs`: Vocabulary struct with effects and physics mappings
- [ ] `types/request.rs`: ValidateZoneRequest, CheckSourceRequest
- [ ] `types/response.rs`: ValidateZoneResult, CheckSourceResult
- [ ] `types/exit_code.rs`: ExitCode enum (0-6) with `impl From<ExitCode> for i32`
- [ ] All types derive Serialize, Deserialize, Debug, Clone
- [ ] Unit tests for serialization round-trips

**Effort**: 3 days
**Dependencies**: S1-T1
**Testing**: `cargo test types::`

---

#### S1-T3: Request/Response I/O

**Description**: Implement functions to read requests from and write responses to `grimoires/pub/`.

**Acceptance Criteria**:
- [ ] `io::read_request<T>(request_id: &str) -> Result<T>` reads from `pub/requests/{id}.json`
- [ ] `io::write_response<T>(request_id: &str, response: &T) -> Result<()>` writes to `pub/responses/{id}.json`
- [ ] Request ID validation: must be valid UUID, no path separators
- [ ] File size limit: 1MB max
- [ ] Creates directories if missing
- [ ] Integration tests with temp directories

**Effort**: 2 days
**Dependencies**: S1-T2
**Testing**: Integration tests with mock filesystem

---

#### S1-T4: CLI Skeleton with Clap

**Description**: Set up main.rs with clap derive, implement command routing.

**Acceptance Criteria**:
- [ ] `anchor --help` shows usage
- [ ] `anchor --version` shows version
- [ ] Subcommands: `validate`, `check-source`, `publish`, `state`
- [ ] `anchor validate --request <id>` parses arguments
- [ ] `anchor validate` without --request shows error
- [ ] Tracing subscriber configured for logging

**Effort**: 1 day
**Dependencies**: S1-T1
**Testing**: `anchor --help`, `anchor validate --help`

---

#### S1-T5: Validate Command (Basic)

**Description**: Implement zone validation logic comparing keywords against vocabulary.

**Acceptance Criteria**:
- [ ] Loads vocabulary from `grimoires/pub/vocabulary.yaml` (or embedded default)
- [ ] Matches component keywords against effect keywords
- [ ] Returns correct zone based on highest-severity match
- [ ] Exit code 0 if inferred_zone matches validated zone
- [ ] Exit code 1 (DRIFT) if zones differ but compatible
- [ ] Exit code 3 (VIOLATION) if critical mismatch
- [ ] Writes response to `pub/responses/{id}.json`

**Effort**: 3 days
**Dependencies**: S1-T2, S1-T3, S1-T4
**Testing**: Unit tests + integration test with sample requests

---

#### S1-T6: Default Vocabulary/Zones

**Description**: Embed default vocabulary.yaml and zones.yaml in binary, publish on first run.

**Acceptance Criteria**:
- [ ] `vocabulary.yaml` and `zones.yaml` embedded via `include_str!` or similar
- [ ] `anchor publish` writes embedded files to `grimoires/pub/`
- [ ] If pub/ files exist, `anchor validate` uses them
- [ ] If pub/ files missing, uses embedded defaults
- [ ] Validates YAML structure on load

**Effort**: 1 day
**Dependencies**: S1-T2
**Testing**: Test with and without pub/ files

---

### Sprint 1 Deliverables

| Deliverable | Verification |
|-------------|--------------|
| `anchor` binary compiles | `cargo build --release` |
| `anchor validate` works | Test with sample request |
| Types serialize correctly | Unit tests pass |
| CI pipeline green | GitHub Actions |

### Sprint 1 Risks

| Risk | Mitigation |
|------|------------|
| YAML parsing edge cases | Use serde_yaml with strict mode |
| Path handling cross-platform | Use `std::path::PathBuf`, avoid string concat |

---

## Sprint 2: Anchor CLI Completion

**Goal**: Complete remaining Anchor commands and RPC integration.

**Duration**: 2 weeks

### Tasks

#### S2-T1: Check-Source Command

**Description**: Implement data source appropriateness checking (indexed vs on-chain).

**Acceptance Criteria**:
- [ ] Reads CheckSourceRequest from pub/requests/
- [ ] Applies data physics rules from SDD:
  - Transaction amounts → on-chain
  - Button states → on-chain
  - Display values → indexed OK
  - Historical queries → indexed OK
- [ ] Returns appropriate: true/false with recommended_source
- [ ] Exit code 0 if appropriate, 1 if recommend different

**Effort**: 2 days
**Dependencies**: S1-T3
**Testing**: Unit tests for each data_type scenario

---

#### S2-T2: State Command with Alloy

**Description**: Implement on-chain state queries via Ethereum RPC.

**Acceptance Criteria**:
- [ ] `anchor state --address 0x... --chain-id 1`
- [ ] Uses alloy provider to connect to RPC
- [ ] RPC URL from environment variable (RPC_URL) or default
- [ ] Queries: eth_getBalance, eth_getCode, eth_call for balanceOf
- [ ] Returns JSON to stdout
- [ ] Graceful error handling for network failures

**Effort**: 3 days
**Dependencies**: S1-T4
**Testing**: Integration test with Anvil local node

---

#### S2-T3: Publish Command

**Description**: Write vocabulary and zones to pub/ directory.

**Acceptance Criteria**:
- [ ] `anchor publish` writes vocabulary.yaml to `grimoires/pub/`
- [ ] `anchor publish` writes zones.yaml to `grimoires/pub/`
- [ ] Creates pub/ directory if missing
- [ ] Overwrites existing files
- [ ] Validates output is valid YAML
- [ ] Exit code 0 on success, 1 on error

**Effort**: 1 day
**Dependencies**: S1-T6
**Testing**: Verify files written correctly

---

#### S2-T4: Error Handling Refinement

**Description**: Comprehensive error types and user-friendly messages.

**Acceptance Criteria**:
- [ ] `error.rs` with thiserror derive
- [ ] Error variants: IoError, YamlError, ValidationError, RpcError
- [ ] Each error includes context (file path, request ID, etc.)
- [ ] User-friendly error messages (not raw stack traces)
- [ ] Tracing integration for debug logs

**Effort**: 2 days
**Dependencies**: All S1 tasks
**Testing**: Intentionally trigger each error type

---

#### S2-T5: Library Crate Extraction

**Description**: Extract core logic to `sigil-anchor-core` for embedding.

**Acceptance Criteria**:
- [ ] `anchor/src/lib.rs` exposes public API
- [ ] Functions: `validate_zone()`, `check_data_source()`, `load_vocabulary()`
- [ ] No CLI dependencies in lib (clap stays in main.rs)
- [ ] Documentation comments on public items
- [ ] Can be used as library: `use sigil_anchor_core::validate_zone`

**Effort**: 2 days
**Dependencies**: S2-T1, S2-T2
**Testing**: Write example that uses library API

---

#### S2-T6: Integration Tests

**Description**: End-to-end tests for all Anchor commands.

**Acceptance Criteria**:
- [ ] Test validate with financial keywords → Critical zone
- [ ] Test validate with standard keywords → Standard zone
- [ ] Test check-source with transaction data → recommends on-chain
- [ ] Test publish creates valid YAML files
- [ ] Tests run in isolated temp directories
- [ ] Tests don't require network (mock RPC for state)

**Effort**: 2 days
**Dependencies**: S2-T1 through S2-T5
**Testing**: `cargo test --test integration`

---

### Sprint 2 Deliverables

| Deliverable | Verification |
|-------------|--------------|
| All Anchor commands work | Manual testing of each command |
| Library crate usable | Example compiles |
| Integration tests pass | `cargo test --test integration` |
| 80% code coverage | `cargo tarpaulin` |

### Sprint 2 Risks

| Risk | Mitigation |
|------|------------|
| Alloy API changes | Pin version, check changelog |
| RPC rate limiting | Add retry logic, exponential backoff |

---

## Sprint 3: Lens CLI Foundation

**Goal**: Set up Lens crate with CEL engine and constraint evaluation.

**Duration**: 2 weeks

### Tasks

#### S3-T1: Lens Crate Setup

**Description**: Add lens crate to workspace, configure dependencies.

**Acceptance Criteria**:
- [ ] `lens/` member added to workspace Cargo.toml
- [ ] Dependencies: cel-interpreter, tree-sitter, tree-sitter-typescript
- [ ] Share types with anchor via workspace dependencies
- [ ] `cargo build -p lens` succeeds

**Effort**: 1 day
**Dependencies**: None (parallel with Sprint 2)
**Testing**: `cargo build -p lens`

---

#### S3-T2: Constraint Schema Types

**Description**: Define constraint YAML schema and Rust types.

**Acceptance Criteria**:
- [ ] `types/constraint.rs`: Constraint struct (id, rule, severity, fix)
- [ ] `types/constraint_result.rs`: ConstraintResult struct
- [ ] Constraint categories: animation, timing, sync, accessibility, visual_density
- [ ] Severity enum: Error, Warning, Info
- [ ] Serialization tests

**Effort**: 2 days
**Dependencies**: S3-T1
**Testing**: Unit tests for serialization

---

#### S3-T3: CEL Engine Integration

**Description**: Integrate cel-interpreter for constraint evaluation.

**Acceptance Criteria**:
- [ ] `cel/evaluator.rs`: ConstraintEvaluator struct
- [ ] `evaluate(physics: &PhysicsAnalysis) -> Vec<ConstraintResult>`
- [ ] Compiles CEL rules from constraint.rule strings
- [ ] Injects physics values as CEL variables
- [ ] Returns pass/fail with actual vs expected values
- [ ] Handles CEL syntax errors gracefully

**Effort**: 4 days
**Dependencies**: S3-T2
**Testing**: Test each constraint type evaluation

---

#### S3-T4: Default Constraints

**Description**: Embed default constraints.yaml with all rules from PRD/SDD.

**Acceptance Criteria**:
- [ ] constraints.yaml embedded in binary
- [ ] `lens publish` writes to `grimoires/pub/constraints.yaml`
- [ ] All constraints from PRD section "Formal Verification Constraints"
- [ ] Animation: damping-range, stiffness-range, duration-by-effect
- [ ] Timing: financial-minimum, destructive-minimum
- [ ] Sync: pessimistic-for-money, no-optimistic-destructive
- [ ] Accessibility: touch-target-minimum, contrast-aa
- [ ] Visual density: elements-per-view, nesting-depth, click-depth

**Effort**: 2 days
**Dependencies**: S3-T2
**Testing**: Validate all constraints parse and evaluate

---

#### S3-T5: Verify Command

**Description**: Implement formal verification command.

**Acceptance Criteria**:
- [ ] `lens verify --request <id>` reads LintRequest
- [ ] Extracts PhysicsAnalysis from request
- [ ] Evaluates all constraints via CEL
- [ ] Returns ConstraintResult[] in response
- [ ] Exit code 0 if all pass, 1 if any fail
- [ ] Response includes failed constraint details

**Effort**: 2 days
**Dependencies**: S3-T3, S3-T4
**Testing**: Integration test with passing/failing physics

---

#### S3-T6: CLI Skeleton for Lens

**Description**: Set up lens main.rs with clap, command routing.

**Acceptance Criteria**:
- [ ] `lens --help` shows usage
- [ ] Subcommands: `lint`, `verify`, `publish`
- [ ] Argument parsing for --request
- [ ] Tracing subscriber configured
- [ ] Shares I/O code with anchor (workspace module)

**Effort**: 1 day
**Dependencies**: S3-T1
**Testing**: `lens --help`, `lens verify --help`

---

### Sprint 3 Deliverables

| Deliverable | Verification |
|-------------|--------------|
| `lens` binary compiles | `cargo build -p lens` |
| `lens verify` evaluates constraints | Test with sample physics |
| CEL rules execute correctly | Unit tests for each constraint |
| Default constraints complete | All PRD constraints present |

### Sprint 3 Risks

| Risk | Mitigation |
|------|------------|
| CEL Rust crate limitations | Test edge cases early, have fallback |
| Complex CEL expressions | Keep rules simple, document limitations |

---

## Sprint 4: Lens CLI Completion

**Goal**: Complete heuristic linting and correction context.

**Duration**: 2 weeks

### Tasks

#### S4-T1: Tree-sitter Code Parsing

**Description**: Parse TypeScript/TSX code to extract component metrics.

**Acceptance Criteria**:
- [ ] Parse component code string with tree-sitter
- [ ] Extract: element count, nesting depth, function count
- [ ] Handle TSX syntax (JSX in TypeScript)
- [ ] Return structured metrics for constraint evaluation
- [ ] Graceful handling of parse errors

**Effort**: 3 days
**Dependencies**: S3-T1
**Testing**: Parse sample components, verify metrics

---

#### S4-T2: Heuristic Rules Engine

**Description**: Implement heuristic checks beyond CEL constraints.

**Acceptance Criteria**:
- [ ] Fitts's Law: calculate distance/target size for interactive elements
- [ ] Touch target check: verify ≥44px for buttons
- [ ] Click depth: count steps to primary action
- [ ] Known anti-patterns: match against documented patterns
- [ ] Each heuristic returns: pass/fail, actual value, recommendation

**Effort**: 3 days
**Dependencies**: S4-T1
**Testing**: Test each heuristic with known good/bad examples

---

#### S4-T3: Lint Command

**Description**: Implement comprehensive linting with heuristics + constraints.

**Acceptance Criteria**:
- [ ] `lens lint --request <id>` reads LintRequest
- [ ] Parses component_code with tree-sitter
- [ ] Runs heuristic checks
- [ ] Runs constraint verification
- [ ] Combines results into LintResult
- [ ] Exit code 0 if pass, 1 if violations

**Effort**: 2 days
**Dependencies**: S4-T1, S4-T2, S3-T5
**Testing**: End-to-end lint test

---

#### S4-T4: Correction Context Generation

**Description**: Build structured correction context for retry loops.

**Acceptance Criteria**:
- [ ] `correction.rs`: build_correction_context() function
- [ ] CorrectionContext struct per PRD schema
- [ ] Violations array with constraint_id, rule, actual, expected
- [ ] Fixes array with target, current_value, required_value, reason
- [ ] Attempt tracking (attempt, max_attempts)
- [ ] Context preservation (original_request, physics_analysis)

**Effort**: 2 days
**Dependencies**: S4-T3
**Testing**: Verify correction context structure

---

#### S4-T5: Lint Response with Correction

**Description**: Include correction context in lint response when violations found.

**Acceptance Criteria**:
- [ ] LintResult includes optional `correction` field
- [ ] Correction populated only when `pass: false`
- [ ] Response JSON matches PRD schema exactly
- [ ] fix_suggestion field populated for each failed constraint
- [ ] Severity levels correctly propagated

**Effort**: 1 day
**Dependencies**: S4-T4
**Testing**: Verify response structure matches PRD

---

#### S4-T6: Lens Integration Tests

**Description**: End-to-end tests for all Lens commands.

**Acceptance Criteria**:
- [ ] Test verify with valid physics → all pass
- [ ] Test verify with invalid timing → financial-minimum fails
- [ ] Test lint with well-formed component → pass
- [ ] Test lint with accessibility violations → warnings
- [ ] Test correction context structure
- [ ] Tests in isolated temp directories

**Effort**: 2 days
**Dependencies**: S4-T1 through S4-T5
**Testing**: `cargo test -p lens --test integration`

---

### Sprint 4 Deliverables

| Deliverable | Verification |
|-------------|--------------|
| `lens lint` works end-to-end | Test with sample component |
| Correction context complete | Schema matches PRD |
| Heuristics implemented | Test each heuristic |
| 80% code coverage | `cargo tarpaulin -p lens` |

### Sprint 4 Risks

| Risk | Mitigation |
|------|------------|
| Tree-sitter TSX parsing quirks | Test with real-world components |
| Heuristic false positives | Conservative thresholds, allow overrides |

---

## Sprint 5: Integration & Skills

**Goal**: Connect Anchor/Lens to Sigil via skills and pub/ communication.

**Duration**: 2 weeks

### Tasks

#### S5-T1: Pub/ Directory Structure

**Description**: Finalize shared pub/ directory structure and lifecycle.

**Acceptance Criteria**:
- [ ] `grimoires/pub/` directory auto-created by both CLIs
- [ ] Request/response cleanup after 1 hour (configurable)
- [ ] Advisory locking for concurrent access
- [ ] .gitignore entry for requests/ and responses/
- [ ] Keep vocabulary.yaml, zones.yaml, constraints.yaml in git

**Effort**: 2 days
**Dependencies**: S2-T3, S4-T5
**Testing**: Concurrent access test

---

#### S5-T2: Skill: Craft Integration

**Description**: Update /craft skill to invoke Anchor and Lens.

**Acceptance Criteria**:
- [ ] Skill writes request to pub/requests/ before validation
- [ ] Skill invokes `anchor validate` via Bash tool
- [ ] Skill invokes `lens lint` via Bash tool
- [ ] Both invocations run in parallel (Promise.all equivalent)
- [ ] Skill reads responses from pub/responses/
- [ ] Skill surfaces violations to user

**Effort**: 3 days
**Dependencies**: S5-T1
**Testing**: Manual /craft test with Claude Code

---

#### S5-T3: Correction Loop in Skill

**Description**: Implement retry logic when Lens returns correction context.

**Acceptance Criteria**:
- [ ] If lens lint returns pass: false, read correction context
- [ ] Apply fixes to physics analysis
- [ ] Regenerate component with fixed physics
- [ ] Re-run lens lint (attempt 2)
- [ ] Max 2 attempts total
- [ ] If still failing, surface conflict to user

**Effort**: 2 days
**Dependencies**: S5-T2
**Testing**: Test with conflicting request ("quick claim button")

---

#### S5-T4: User-Facing Violation UX

**Description**: Design and implement how violations appear to users.

**Acceptance Criteria**:
- [ ] Constraint Violations box shows after generation
- [ ] Each violation shows: rule, actual, expected, fix suggestion
- [ ] Options: [Apply fixes] [Override (explain why)]
- [ ] Override logs to taste.md with reason
- [ ] Conflict resolution for contradictory requests

**Effort**: 2 days
**Dependencies**: S5-T3
**Testing**: Manual testing in Claude Code

---

#### S5-T5: Sigil Rules Update

**Description**: Update Sigil rules to reference Anchor/Lens integration.

**Acceptance Criteria**:
- [ ] Update 00-sigil-core.md with integration notes
- [ ] Add detection triggers for when to invoke validation
- [ ] Document exit codes and what they mean
- [ ] Add troubleshooting section for common issues
- [ ] Reference constraint IDs in physics rules

**Effort**: 2 days
**Dependencies**: S5-T2
**Testing**: Rules load correctly in Claude Code

---

#### S5-T6: End-to-End Integration Test

**Description**: Full workflow test from /craft to validated output.

**Acceptance Criteria**:
- [ ] /craft "claim button" → Financial → Anchor validates → Lens passes
- [ ] /craft "delete button" → Destructive → Correct physics applied
- [ ] /craft "quick claim" → Conflict detected → User prompted
- [ ] /craft with bad physics → Correction loop runs → Fixed output
- [ ] Document test scenarios and expected outcomes

**Effort**: 2 days
**Dependencies**: All S5 tasks
**Testing**: Manual walkthrough of each scenario

---

### Sprint 5 Deliverables

| Deliverable | Verification |
|-------------|--------------|
| /craft invokes Anchor + Lens | Manual test |
| Correction loop works | Test with conflicting request |
| Violations surface correctly | UX review |
| Full integration tested | E2E scenarios pass |

### Sprint 5 Risks

| Risk | Mitigation |
|------|------------|
| Claude Code skill limitations | Test early, document workarounds |
| Bash tool invocation overhead | Measure latency, optimize if needed |

---

## Sprint 6: Polish & Release

**Goal**: Documentation, hardening, cross-platform testing, release.

**Duration**: 2 weeks

### Tasks

#### S6-T1: Cross-Platform Testing

**Description**: Verify Anchor and Lens work on all target platforms.

**Acceptance Criteria**:
- [ ] Test on macOS arm64 (Apple Silicon)
- [ ] Test on macOS x86_64 (Intel)
- [ ] Test on Linux x86_64 (Ubuntu)
- [ ] Test on Windows x86_64
- [ ] Document any platform-specific issues
- [ ] CI builds for all platforms

**Effort**: 2 days
**Dependencies**: All previous sprints
**Testing**: Manual testing on each platform

---

#### S6-T2: Performance Optimization

**Description**: Profile and optimize critical paths.

**Acceptance Criteria**:
- [ ] Measure: physics detection (<50ms target)
- [ ] Measure: anchor validate (<100ms target)
- [ ] Measure: lens lint (<200ms target)
- [ ] Measure: full /craft cycle (<1s target)
- [ ] Identify and fix any bottlenecks
- [ ] Document performance characteristics

**Effort**: 2 days
**Dependencies**: S5-T6
**Testing**: Benchmark suite

---

#### S6-T3: Documentation

**Description**: Write user-facing documentation.

**Acceptance Criteria**:
- [ ] README.md for anchor crate
- [ ] README.md for lens crate
- [ ] Installation guide (cargo install, manual build)
- [ ] CLI reference (all commands, options, exit codes)
- [ ] Integration guide (how to use with Claude Code)
- [ ] Troubleshooting guide

**Effort**: 3 days
**Dependencies**: All commands stable
**Testing**: Follow docs from scratch

---

#### S6-T4: Security Hardening

**Description**: Implement v1 security measures from SDD.

**Acceptance Criteria**:
- [ ] Input validation on all request fields
- [ ] Request ID path traversal prevention
- [ ] File size limits enforced
- [ ] Graceful handling of malformed input
- [ ] Audit log for CLI invocations (optional, to grimoires/audit.log)
- [ ] Security section in documentation

**Effort**: 2 days
**Dependencies**: All commands stable
**Testing**: Fuzzing with malformed inputs

---

#### S6-T5: Release Automation

**Description**: Set up release process with binary distribution.

**Acceptance Criteria**:
- [ ] GitHub Actions release workflow
- [ ] Build binaries for all platforms on tag push
- [ ] Upload binaries to GitHub Releases
- [ ] Generate changelog from commits
- [ ] cargo publish preparation (crates.io)
- [ ] Version bump script

**Effort**: 2 days
**Dependencies**: S6-T1
**Testing**: Dry-run release

---

#### S6-T6: Final Review & Launch

**Description**: Final testing, review, and public release.

**Acceptance Criteria**:
- [ ] All tests pass on all platforms
- [ ] Documentation reviewed for accuracy
- [ ] Performance targets met
- [ ] Security checklist completed
- [ ] Tag v1.0.0 release
- [ ] Announce in relevant channels

**Effort**: 2 days
**Dependencies**: S6-T1 through S6-T5
**Testing**: Full regression test

---

### Sprint 6 Deliverables

| Deliverable | Verification |
|-------------|--------------|
| Cross-platform binaries | Download and run on each platform |
| Documentation complete | Follow docs from scratch |
| Performance targets met | Benchmark results |
| v1.0.0 released | GitHub Release exists |

### Sprint 6 Risks

| Risk | Mitigation |
|------|------------|
| Last-minute bugs | Buffer time, feature freeze early |
| Documentation gaps | Get external review |

---

## Success Metrics

### Per-Sprint Metrics

| Sprint | Key Metric | Target |
|--------|------------|--------|
| Sprint 1 | Anchor validate works | Exit codes correct |
| Sprint 2 | All Anchor commands | Integration tests pass |
| Sprint 3 | CEL evaluation works | Constraint tests pass |
| Sprint 4 | Correction context | Schema matches PRD |
| Sprint 5 | Full integration | E2E scenarios pass |
| Sprint 6 | Release quality | All platforms tested |

### Project Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Unit test coverage | 80% | cargo tarpaulin |
| Integration test coverage | Key flows | Manual checklist |
| Performance: anchor validate | <100ms | Benchmark |
| Performance: lens lint | <200ms | Benchmark |
| Performance: full /craft | <1s | Benchmark |
| Documentation completeness | All commands | Review checklist |

---

## Dependencies & Blockers

### External Dependencies

| Dependency | Version | Risk |
|------------|---------|------|
| cel-interpreter | 0.7+ | Low - stable crate |
| alloy | 0.1+ | Medium - newer crate |
| tree-sitter | 0.20+ | Low - mature |
| tree-sitter-typescript | 0.20+ | Low - well-maintained |

### Blockers

| Blocker | Impact | Resolution |
|---------|--------|------------|
| None identified | - | - |

---

## Buffer Time

Each sprint includes 1-2 days buffer for:
- Unexpected issues
- Code review and refactoring
- Additional testing
- Documentation updates

Total buffer across project: ~10 days (15% of total time)

---

## Appendix: Task Dependencies Graph

```
S1-T1 (Workspace)
  │
  ├── S1-T2 (Types) ──────────────────────────────┐
  │     │                                          │
  │     └── S1-T3 (I/O) ──┐                       │
  │                        │                       │
  └── S1-T4 (CLI) ─────────┼── S1-T5 (Validate)   │
                           │        │              │
                    S1-T6 (Defaults)│              │
                           │        │              │
                           └────────┼──────────────┘
                                    │
                                    ▼
                           S2-T1 (Check-Source)
                           S2-T2 (State)
                           S2-T3 (Publish)
                           S2-T4 (Errors)
                           S2-T5 (Library)
                           S2-T6 (Integration)
                                    │
                                    ▼
                           S3-T1 (Lens Setup) ←── parallel start possible
                           S3-T2 (Constraint Types)
                           S3-T3 (CEL Engine)
                           S3-T4 (Default Constraints)
                           S3-T5 (Verify Command)
                           S3-T6 (CLI)
                                    │
                                    ▼
                           S4-T1 (Tree-sitter)
                           S4-T2 (Heuristics)
                           S4-T3 (Lint Command)
                           S4-T4 (Correction)
                           S4-T5 (Response)
                           S4-T6 (Integration)
                                    │
                                    ▼
                           S5-T1 (Pub Structure)
                           S5-T2 (Skill Integration)
                           S5-T3 (Correction Loop)
                           S5-T4 (Violation UX)
                           S5-T5 (Rules Update)
                           S5-T6 (E2E Test)
                                    │
                                    ▼
                           S6-T1 (Cross-Platform)
                           S6-T2 (Performance)
                           S6-T3 (Documentation)
                           S6-T4 (Security)
                           S6-T5 (Release)
                           S6-T6 (Launch)
```

---

## Next Step

Begin implementation with:

```
/implement sprint-1
```
