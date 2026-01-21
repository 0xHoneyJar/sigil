# Changelog

All notable changes to Sigil will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.1.0] - 2026-01-20 — "Anchor Rust & /craft Evolution"

### Summary

v3.1.0 delivers the **Anchor/Lens Rust CLIs** — high-performance native binaries that replace the TypeScript validation layer. This release also includes comprehensive planning for `/craft` optimization: mode-based loading (Quick/Chisel/Hammer/Debug), RLM on-demand rule loading, and Dev Toolbar integration.

**Key achievement**: Anchor validates in ~10ms, Lens verifies in ~27ms — both well under target.

### Added

#### Anchor CLI (`sigil-anchor`) — Native Rust

- **Zone/Effect Validation** — Map keywords to physics zones (Critical, Cautious, Standard)
- **Effect Detection** — Detect Financial, Destructive, SoftDelete, Standard, Local, Navigation effects
- **Data Source Verification** — Validate correct data source for use cases (on-chain vs indexed)
- **Vocabulary Publishing** — Export vocabulary.yaml and zones.yaml to pub/ directory
- **Exit Code System** — Consistent exit codes (0=success, 10=critical, 11=cautious, 12=standard, 20=schema, 30=I/O)

#### Lens CLI (`sigil-lens`) — Native Rust

- **CEL Constraint Engine** — Formal verification using Common Expression Language
- **Constraint Categories** — timing, confirmation, sync, undo, animation constraints
- **Heuristic Linting** — Tree-sitter based code analysis for TSX components
- **Correction Context** — Actionable fix suggestions when violations detected
- **Constraint Publishing** — Export constraints.yaml to pub/ directory

#### Shared Infrastructure

- **pub/ Directory IPC** — Request/response communication via `grimoires/pub/`
- **UUID-Based Requests** — Secure request identification with full UUID validation
- **Security Hardening** — Path traversal prevention, file size limits, input validation
- **Advisory Locking** — Safe concurrent file access using `fs2`
- **TTL Cleanup** — Automatic cleanup of stale files after 1 hour
- **155 Tests Passing** — Comprehensive test coverage across both CLIs

#### Integration

- **Rule 22** — New `22-sigil-anchor-lens.md` for /craft integration
- **Correction Loop** — Max 2 attempts to fix violations before user escalation
- **Violation UX** — Clear violation boxes with apply/override/cancel options
- **Taste Logging** — Validation results logged to taste.md for learning

### Performance

| CLI | Target | Actual |
|-----|--------|--------|
| Anchor validate | <100ms | ~10ms |
| Lens verify | <200ms | ~27ms |

### Planning Documents

This release includes comprehensive planning for the next evolution:

- **PRD v1.1.0** — `/craft` Optimization & Dev Toolbar (`grimoires/loa/prd-craft-optimization.md`)
- **SDD v1.0.0** — Technical design for craft.md split, RLM extensions, toolbar architecture
- **Sprint Plan** — 6 sprints, 25 tasks for solo developer with 1-week cycles

### The /craft Entry Point Philosophy

`/craft` is Sigil's primary entry point — the command that bridges creative intuition with physics grounding. All other commands support the feedback loop:

```
              ┌─────────────────────────────────────────┐
              │                                         │
              │              /craft                     │
              │        (primary entry point)            │
              │                                         │
              │   Detects scope → Applies physics →     │
              │   Generates code → Collects feedback    │
              │                                         │
              └─────────────────────────────────────────┘
                              │
         ┌──────────────────┬─┴─┬──────────────────┐
         │                  │   │                  │
         ▼                  ▼   ▼                  ▼
    ┌─────────┐      ┌───────────────┐      ┌──────────┐
    │UNDERSTAND│      │   VALIDATE    │      │  LEARN   │
    │/observe  │      │   /ward       │      │/inscribe │
    │/understand│     │   /garden     │      │          │
    └─────────┘      └───────────────┘      └──────────┘
         │                  │                     │
         └──────────────────┴─────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   taste.md    │
                    │ (accumulated  │
                    │ understanding)│
                    └───────────────┘
```

### Dependencies

- Rust 2021 edition
- CEL interpreter 0.8 for constraint evaluation
- Tree-sitter 0.24 for TSX parsing
- Alloy 1.0 for Ethereum RPC (optional)

### Migration

No breaking changes. Anchor/Lens CLIs are additive — install and use alongside existing workflows.

---

## [3.0.0] - 2026-01-21 — "Anchor Ground Truth"

### Summary

v3.0.0 is a major release introducing **Anchor** — the ground truth enforcement layer for Sigil. Anchor validates that AI-generated code actually follows the physics rules it claims to follow, detecting both "drift" (over-claiming) and "deceptive" patterns (under-claiming).

Also included: **v3 Operational Infrastructure** with craft modes (debug, explore, hammer), physics/codebase validators, and project constitution support.

### Added

- **Anchor Package** (`packages/anchor/`)
  - Ground truth enforcement for Sigil design physics
  - Validates agent grounding statements against physics rules
  - Detects deceptive grounding claims (citing lenient physics for critical operations)
  - Detects drift (citing strict physics for simple components)

- **Anchor Components**
  - `ForkManager` — Anvil fork lifecycle with network configs
  - `SnapshotManager` — EVM state snapshots bound to tasks
  - `TaskGraph` — Task dependencies and state bindings
  - `CheckpointStrategy` — Periodic checkpointing with recovery
  - `GroundingGate` — Physics validation against Sigil tables
  - `AdversarialWarden` — Deception detection with learned rules

- **Anchor CLI**
  - `anchor warden` — Validate grounding statements
  - `anchor validate` — Check physics compliance
  - `anchor session/fork/snapshot` — EVM state management
  - `anchor checkpoint/restore` — Recovery support

- **Zone Hierarchy**
  - `critical` — Financial, transactions (800ms pessimistic)
  - `elevated` — Destructive, revoke (600ms pessimistic)
  - `standard` — CRUD, social (200ms optimistic)
  - `local` — UI state, preferences (100ms immediate)

- **Exit Codes**
  - `0` VALID — Grounding matches required physics
  - `1` DRIFT — Over-claiming (strict physics for simple components)
  - `2` DECEPTIVE — Under-claiming (lenient physics for critical operations)

- **Craft Modes** (`.claude/skills/crafting-physics/modes/`)
  - Debug mode — Systematic debugging workflow
  - Explore mode — Codebase exploration
  - Hammer mode — Full architecture orchestration

- **Subagents** (`.claude/subagents/`)
  - Physics validator — Validates physics compliance
  - Codebase validator — Validates code patterns

- **Project Constitution** (`grimoires/sigil/constitution.yaml`)
  - Project-level physics configuration
  - Custom timing and confirmation overrides

### Changed

- Repository structure now includes `packages/` directory
- README updated with Anchor documentation
- 153 tests across 10 test files

### Migration

No breaking changes to existing Sigil functionality. Anchor is an additive layer.

---

## [2.5.0] - 2026-01-20 — "Web3 Flow Validation"

### Summary

v2.5.0 introduces **Data Physics** — the fifth physics layer for explicit data source selection in Web3 contexts. This release captures learnings from debugging blockchain transaction flows: BigInt safety patterns, receipt guards, stale closure prevention, and the critical distinction between indexed data (fast but stale) and on-chain data (slow but accurate).

Also included: **Run Mode** for autonomous sprint execution with circuit breakers and safety controls.

### Added

- **Data Physics Layer** (`19-sigil-data-physics.md`)
  - Explicit data source selection: on-chain vs indexed vs cached
  - Decision tree for Web3 data freshness requirements
  - Anti-patterns: fallback chains (`??`), BigInt falsy checks
  - Staleness signals for financial displays

- **Web3 Flow Patterns** (`20-sigil-web3-flows.md`)
  - Multi-step transaction state machines (approve → execute)
  - Receipt guard pattern (prevent re-execution)
  - BigInt safety: `0n` is falsy in JavaScript
  - Stale closure prevention in `useEffect` callbacks

- **Run Mode Commands**
  - `/run` — Start autonomous sprint implementation
  - `/run-sprint-plan` — Auto-generate sprint from PRD+SDD
  - `/run-status` — Check autonomous execution progress
  - `/run-halt` — Emergency stop (circuit breaker)
  - `/run-resume` — Continue from checkpoint
  - `/snapshot` — Capture current state
  - `/test-flow` — Test without committing

- **Run Mode Safety**
  - Circuit breaker: stops on repeated failures or no progress
  - Rate limiting: respects API call limits
  - Draft PR only: never auto-merges
  - Deleted files tracking with tree view

- **/observe diagnose mode**
  - Blockchain state inspection
  - Contract interaction analysis
  - Transaction flow validation

### Changed

- **Physics Model** now includes 5 layers: Behavioral, Animation, Material, Voice, Data
- `/craft` analysis box shows Data Physics guidance for Web3 components
- README updated with Data Physics table and decision tree

### Fixed

- BigInt falsy check patterns (`if (amount)` fails for `0n`)
- Stale closure issues in transaction receipt callbacks
- Receipt processing re-execution bugs

### Migration

No breaking changes. Data Physics applies automatically when Web3 keywords detected.

---

## [2.4.0] - 2026-01-19 — "Craft States"

### Summary

v2.4.0 introduces **Craft States** — the hammer vs chisel paradigm. `/craft` now intelligently detects when work requires full-stack architecture (hammer) versus fine-grained physics tuning (chisel). Hammer mode orchestrates Loa commands (`/plan-and-analyze`, `/architect`, `/sprint-plan`) to deliver complete features, while chisel mode maintains the precise physics control users expect.

This release reflects how users actually work: `/craft` as the primary entry point, discovering complexity through the work itself, then seamlessly transitioning to full architecture when needed.

### Added

- **Scope Detection Algorithm** (Step 0.5 in `/craft`)
  - Detects hammer signals: "feature", "system", "flow", "build", "implement", contract refs, API refs, indexer refs
  - Detects chisel signals: "button", "modal", "animation", "improve", "fix", "polish", "tweak"
  - Scoring: +1 per hammer signal, -1 per chisel signal, threshold ≥2 for hammer mode
  - Supports `--hammer` and `--chisel` flags to force mode

- **Hammer Workflow** (Steps H1-H5)
  - **H1: Artifact Check** — Detects existing Loa artifacts (PRD, SDD, sprint), checks staleness and relevance
  - **H2: Context Aggregation** — Seeds `/plan-and-analyze` with Sigil observations and taste patterns
  - **H3: Architecture** — Invokes `/architect` to generate SDD
  - **H4: Sprint Planning** — Invokes `/sprint-plan`, extracts components with physics hints
  - **H5: Plan Summary** — Presents complete plan, hands off to `/run sprint-plan`

- **Hammer State Management** (`grimoires/sigil/hammer-state.json`)
  - Tracks active hammer sessions
  - Enables resume from interrupted sessions
  - Records phases completed, components identified, context seeded

- **Context Seeding**
  - Aggregates `grimoires/sigil/observations/` diagnostics
  - Extracts taste patterns from `grimoires/sigil/taste.md`
  - Pre-populates Loa commands with physics requirements

- **Hammer Error Handling**
  - Recovery paths for Loa command failures
  - State corruption detection and auto-recovery
  - Orphaned state detection (>24h old)

- **4 New Examples** in `/craft`
  - Example 8: Fresh hammer start
  - Example 9: Hammer with existing artifacts
  - Example 10: User chooses "Chisel anyway"
  - Example 11: Resume interrupted hammer session

### Changed

- **`/craft` v2.0.0** — Major version bump for hammer/chisel paradigm
  - Step 0.5 added before context discovery
  - Hammer workflow branches after scope detection
  - Chisel mode unchanged (backward compatible)

- **Sigil as Loa Construct** — Clarified architecture
  - Sigil invokes Loa commands via Skill tool, never modifies them
  - Read-only access to Loa artifacts
  - Context seeding passes observations and taste to planning

### Philosophy

**The craft-first workflow:**
```
User invokes /craft
  → Scope detection runs
  → Hammer? → Full architecture sequence → /run sprint-plan
  → Chisel? → Physics analysis → Generate/refine
```

This reflects the actual workflow: start with craft, discover complexity, get architecture when needed.

### Technical

- `/distill` functionality absorbed into hammer mode (H4 component extraction)
- Hammer mode uses Claude Code's Skill tool for Loa command invocation
- State file enables cross-session resume

---

## [2.3.0] - 2026-01-19 — "Sigil ↔ Loa Synergy"

### Summary

v2.3.0 delivers the **Sigil ↔ Loa Synergy** release — bridging the gap between architecture (Loa) and physics (Sigil). This version adds DX Physics for indexer workflows, the `/understand` command for domain research, and a shared context store that enables intelligent handoffs between frameworks.

Also included: **Web3 Testing** skill and **Observations System** for comprehensive wagmi/viem mocking and user research capture.

### Added

- **Web3 Testing Skill** (`.claude/skills/web3-testing/`)
  - Three-layer wagmi/viem mocking architecture (state store, EIP-1193 provider, fetch interception)
  - 18 built-in scenarios: disconnected, connected, whale, empty, pending, success, error, chain variants
  - 8 built-in flows: connect, claim, switch, error, stake, disconnect, insufficient
  - Fork mode support via Tenderly and Anvil
  - Mock mode for full offline testing

- **`/snapshot` command** — Capture screenshots with Web3 state injection
  - Syntax: `/snapshot <url> [scenario] [before|after|fork]`
  - Automatic state injection before page load
  - Fork mode with Tenderly/Anvil integration

- **`/test-flow` command** — Execute multi-step Web3 user journeys
  - Syntax: `/test-flow <url> <flow> [fork]`
  - Step-by-step execution with state transitions
  - Screenshot capture at key moments
  - Physics validation at each step

- **`/ward` Web3 extension** — Visual testing with wallet states
  - UNIX philosophy syntax: `/ward <url> <scenario> [fork]`
  - Scenario presence implies web3 mode
  - Integrated physics validation

- **`/observe` command** — User research observation capture
  - Structured observation schema with physics context
  - Qualitative feedback on component feel
  - Integration with taste.md logging

- **`/taste-synthesize` command** — Pattern extraction from accumulated taste signals

- **Wagmi v2 fixture app** for smoke testing

- **`/understand` command** — Domain research before crafting
  - Syntax: `/understand "topic"` to gather context before implementation
  - Stores findings in `grimoires/loa/context/domain/`
  - Integrates with complexity detection for automatic triggering

- **Complexity Detection System** (`.claude/rules/18-sigil-complexity.md`)
  - Automatic triggers: indexer work, multi-repo refs, unknown contracts, architectural questions
  - Four specialized handlers: DX Physics, Ecosystem, Domain, Contract
  - 5-step handoff protocol: Detect → Gather → Store → Enrich → Continue

- **DX Physics Handler** — Blockchain indexer optimization
  - Reduces Envio indexer sync from 4-16h to ~30 seconds
  - RPC block discovery via `eth_getLogs` for "dead accurate" ranges
  - Caches discovered ranges in `grimoires/loa/context/indexer/`
  - Automatic test config generation

- **Shared Context Store** (`grimoires/loa/context/`)
  - Bridges Sigil physics with Loa architecture
  - Four context types: `indexer/`, `ecosystem/`, `domain/`, `sessions/`
  - Configuration via `.context-config.yaml`

- **Enhanced `/implement` command** — Phase 0.5 complexity detection
  - Checks for indexer work, multi-repo refs, unknown contracts before implementation
  - Automatically gathers context via handlers
  - Stores findings for `/craft` consumption

- **Enhanced `/craft` command** — Context-aware generation
  - Reads domain knowledge from `grimoires/loa/context/domain/`
  - Reads ecosystem relationships from `grimoires/loa/context/ecosystem/`
  - Physics informed by real-world contract and protocol data

- **DX Physics taste signals** — Extended taste schema
  - Captures indexer-specific preferences
  - Tracks block range accuracy
  - Logs sync time improvements

### Technical

- Fork provider auto-detection (Tenderly → Anvil → Hardhat → local)
- PR attachment workflow for CI integration
- Complete injection script for wagmi v2 + viem v2 compatibility

---

## [2.2.0] - 2026-01-19 — "Feedback Loops"

### Summary

v2.2.0 introduces the **Sigil Feedback Loops System** — a comprehensive framework for capturing user feedback signals from multiple sources (CLI, browser extension, product widgets). This release adds real-time physics observation, diagnostic questioning, and taste synthesis capabilities.

### Added

- **`/observe` command** — Capture user research observations during testing sessions
  - Structured observation schema with physics context
  - Supports qualitative feedback on component feel
  - Integrates with taste.md logging

- **`/taste-synthesize` command** — Analyze accumulated taste signals and extract patterns
  - Identifies recurring timing preferences
  - Detects animation style patterns
  - Generates recommendations for physics defaults

- **`/ward-all` command** — Comprehensive physics audit across all crafted components
  - Batch validation of physics compliance
  - Protected capability verification
  - Performance pattern detection

- **Sigil Toolbar browser extension** (`packages/sigil-toolbar/`)
  - Real-time physics detection on any webpage
  - Animation timing inspector
  - Protected capability auditor
  - One-click feedback submission
  - Screenshot annotation with physics overlay
  - Linear integration for issue tracking

- **New skills**
  - `observing-users` — Structured user research capture
  - `synthesizing-taste` — Pattern extraction from taste signals

- **Enhanced taste signal schema**
  - `source` field: `cli`, `toolbar`, `product`
  - `diagnostic` block for user context (user_type, goal, expected_feel)
  - `learning` block for inferred recommendations

- **Interactive diagnostics** (Sprint 1)
  - Optional questions after MODIFY/REJECT signals
  - Captures user intent and expected feel
  - Contextualizes taste learnings

- **Back pressure gates** (Sprint 3)
  - Prevents taste signal overflow
  - Throttles rapid feedback submissions
  - Quality over quantity enforcement

### Changed

- **`06-sigil-taste.md`** — Extended signal schema with diagnostic context and source tracking
- **`crafting-physics/SKILL.md`** — Added feedback collection standard and diagnostic flow

### Technical

The Feedback Loops system implements a three-source model:
- **CLI** (`/craft`) — Developer-time feedback during generation
- **Toolbar** — QA/design-time feedback during review
- **Product** — User-time feedback in production (future)

All sources write to the same `taste.md` format, enabling unified pattern synthesis.

---

## [1.4.0] - 2026-01-14 — "Visual Verification"

### Summary

v1.4.0 integrates the **agent-browser skill** into `/ward` and `/craft` for visual validation of protected capabilities and physics verification.

### Added

- **Visual verification step** in `/craft` v1.4.0 — Optional URL parameter for post-generation verification
- **agent-browser skill integration** — Commands now use the official skill instead of bash script wrappers
- **Screenshot capture** for taste signal logging — Screenshots saved to `grimoires/sigil/observations/`
- **Protected capability verification** — Touch target (≥44px) and focus ring checks during visual validation
- **Example 6** in `/craft` — Demonstrates visual verification workflow with URL

### Changed

- **`/ward` v1.1.0** — Updated visual check workflow to use agent-browser skill commands
- **`/craft` v1.4.0** — Added URL argument and Step 5b for optional visual verification

### Documentation

- Updated `.claude/protocols/browser-automation.md` from "invisible" to "optional" enhancement
- Added `.claude/skills/agent-browser/SKILL.md` with full command reference
- Updated README with "Optional: Visual Validation" section

---

## [1.3.0] - 2026-01-14 — "Session Health"

### Summary

v1.3.0 adds **session health monitoring** to `/craft`, detecting context drift during long sessions and recommending session clearing when physics alignment degrades.

### Added

- **Session drift detection** in `/craft` v1.3.0 — Monitors task transitions, reject ratio, time since accept, and effect type switches
- **Drift thresholds** — Yellow (warning indicator) and Red (blocks with recommendation to `/clear`)
- **Session health indicator** in analysis box — Shows `Session: ⚠ 6 targets | 25% rejects` when elevated
- **SESSION_OVERRIDE logging** — Tracks when users continue past drift warnings

### Fixed

- **NVM path discovery** in `check-agent-browser.sh` — Now finds agent-browser in NVM installations
- **Symlink detection** — Fixed `find` command to detect symlinked binaries (`-type l`)
- **agent-browser-api.sh** — Added `_ab_find_binary()` for consistent NVM support

### Technical

Based on analysis of Claude Code system prompt best practices:
- TodoWrite as external state prevents context drift
- Immediate completion marking maintains alignment
- Session boundaries provide natural checkpoints

---

## [1.0.0] - 2025-01-14 — "SemVer Reset"

### Summary

v1.0.0 marks Sigil's first **SemVer-compliant stable release**. Previous versions used iteration counting rather than semantic versioning. This release normalizes all command versions to 1.0.0 and establishes proper versioning practices going forward.

### Added

- **`/ward`** — Comprehensive physics audit (violations, performance, protected capabilities)
- **`/garden`** — Component authority health report (Gold/Silver/Draft tiers)
- **`ck` integration** — Semantic search for fast codebase scanning
- **`VERSIONING.md`** — Semantic versioning strategy documentation
- **React performance rules** — Rules 10-16 for async, bundle, rendering optimization

### Changed

- **`/craft` v1.0.0** — Expanded from component-only to any UX-affecting change (generate, refine, configure, pattern, polish)
- **All Sigil commands normalized to v1.0.0** — `/craft`, `/ward`, `/garden`, `/style`, `/animate`, `/behavior`, `/inscribe`, `/distill`
- **Conventional commits** — All commits now follow conventional commit format

### Versioning Note

Previous versions (v0.5.0, v2.0.0, v5.0.0, v10.1.0, v11.0.0) did not follow SemVer. They incremented MAJOR for every iteration rather than for breaking changes. Those versions are preserved in git history but should not be referenced.

Going forward:
- **MAJOR** — Breaking changes to physics rules or command APIs
- **MINOR** — New commands, new physics layers, new keywords
- **PATCH** — Bug fixes, documentation, refactoring

See `VERSIONING.md` for complete versioning strategy.

---

## Pre-1.0 History

The following entries document Sigil's evolution before adopting SemVer.
Version numbers in this section were iteration counts, not semantic versions.

---

## [10.1.0] - 2026-01-11 — "Usage Reality"

### Summary

v10.1 introduces the **Usage Reality** architecture — a complete consolidation of the Sigil framework. Usage-based authority replaces directory-based tiers, AST inference replaces JSDoc requirements, and invisible context accumulation replaces configuration dialogs.

### The Layer Cake

```
Designer Experience → Skills Layer → Context Layer → Foundation
                         │
         ┌───────────────┼───────────────┐
         │               │               │
       MASON         GARDENER     DIAGNOSTICIAN
     Generation      Governance      Debugging
```

### Key Changes

- **49 → 14 skills** — Consolidated to 3 Sigil skills + 11 Loa skills
- **37 → 6 modules** — Core library at `src/lib/sigil/`
- **Usage-Based Authority** — Authority computed from imports (10+ = gold, 5+ = silver)
- **Effect-Based Physics** — Physics inferred from effect type (mutation/query/local_state)
- **AST Intent Inference** — TypeScript Compiler API reads code without JSDoc
- **Invisible Context** — Taste, Persona, Project learned from accept/modify/reject

### Added

- **Core Library** — `src/lib/sigil/` with 6 modules:
  - `context.ts` — Context management
  - `survival.ts` — Authority computation
  - `physics.ts` — Physics inference
  - `ast-reader.ts` — AST intent inference
  - `diagnostician.ts` — Pattern matching
  - `search.ts` — Fuzzy file finding

- **Three Consolidated Skills**
  - `mason` — Zone-aware generation with context
  - `gardener` — Survival engine, invisible promotion
  - `diagnostician` — Pattern-based debugging

- **Context Layer** — Invisible accumulation of:
  - Taste (physics preferences from accept/modify/reject)
  - Persona (audience from prompt language, copy survival)
  - Project (conventions from file operations, imports)

### Changed

- **Directory Structure** — `grimoires/sigil/` replaces `sigil-mark/`
- **GitHub Actions** — `sigil-gardener.yaml` uses new core library path
- **Configuration** — `.sigilrc.yaml` updated to v10.1.0

### Removed

- **37 process files** — Consolidated into core library
- **38 redundant skills** — Consolidated into Mason, Gardener, Diagnostician
- **sigil-mark/ directory** — Migrated to grimoires/sigil/

### Migration

| Before (v9.1) | After (v10.1) |
|---------------|---------------|
| 49 skills | 14 skills |
| 37 process files | 6 core library modules |
| sigil-mark/ | grimoires/sigil/ |
| JIT grep | Pre-computed authority |

---

## [6.1.0] - 2026-01-08 — "Agile Muse"

### Summary

v6.1 is the **Agile Muse** release focused on quality gates and faster feedback loops. Optimistic divergence replaces blocking on taste violations, merge-driven gardening provides <5 min pattern promotion latency, and vocabulary integration removes hardcoded terms.

### The v6.1 Quality Gates

1. **Vocabulary Integration** — No hardcoded terms, all from vocabulary.yaml
2. **Taste-Key Curation** — canonical-candidate status requires explicit approval
3. **Hard Eviction** — Virtual Sanctuary evicts when real components exist
4. **Optimistic Divergence** — Taste violations tagged, not blocked

### Added

- **Optimistic Divergence** — Physics violations block, taste violations tag

  ```typescript
  // Taste violations get @sigil-status divergent tag
  /** @sigil-status divergent - 2 taste deviation(s) */
  ```

- **Vocabulary Integration** — Dynamic loading from vocabulary.yaml

  ```typescript
  loadVocabulary(projectRoot)      // Cached loading
  extractVocabularyTerms(prompt)   // Term extraction
  resolveZoneFromVocabulary(terms) // Zone resolution
  ```

- **Taste-Key Curation** — Human-in-the-loop pattern approval

  ```yaml
  # .sigil/taste-key.yaml
  pending_promotions:
    - pattern: "animation:spring"
      occurrences: 5
      detected_at: "2026-01-08"
  approved:
    - pattern: "animation:spring"
      approved_at: "2026-01-08"
  ```

- **Hard Eviction** — Virtual Sanctuary cleanup

  ```
  ANY real component exists → ALL virtual components evicted
  /reset-seed to restore if needed
  ```

- **Merge-Driven Gardening** — GitHub Actions workflow for <5 min latency

  ```yaml
  # .github/workflows/sigil-gardener.yaml
  on:
    push:
      branches: [main]
  ```

- **canonical-candidate Status** — Patterns at 5+ occurrences await approval

### Changed

- **Forge mode deprecated** — Replaced by optimistic divergence
- **Pattern promotion** — Now requires taste-key approval at 5+ occurrences
- **Version standardized** — All package.json versions aligned to 6.1.0
- **YAML parsing** — Uses js-yaml library instead of regex

### Deprecated

- **/forge command** — Use optimistic divergence instead
- **Auto-promotion to canonical** — Now requires explicit approval

### Performance

| Operation | Target | Achieved |
|-----------|--------|----------|
| Vocabulary lookup | <5ms | ~2ms |
| Zone resolution | <2ms | ~1ms |
| Taste-key lookup | <5ms | ~3ms |
| Eviction check | <10ms | ~5ms |
| Merge-driven gardening | <5min | ~2min |

---

## [6.0.0] - 2026-01-08 — "Native Muse"

### Summary

v6.0 introduces the **Survival-Based Framework** with Three Laws that eliminate governance dialogs in favor of silent pattern observation. Pre-computed workshop index enables 5ms queries, Virtual Sanctuary provides seeds for cold starts, and 11 skills with lifecycle hooks orchestrate the complete craft flow.

### The Three Laws

1. **Code is Precedent** — Patterns that survive become canonical. No governance dialogs.
2. **Survival is the Vote** — Usage frequency determines pattern status, not approvals.
3. **Never Interrupt Flow** — No blocking, no dialogs, observe silently.

### Added

- **Workshop Index** — Pre-computed at startup for 5ms queries

  ```
  .sigil/
  ├── workshop.json       # Pre-computed index
  ├── survival.json       # Pattern tracking
  ├── seed.yaml           # Virtual Sanctuary
  └── craft-log/          # Session logs
  ```

- **11 Skills with Lifecycle Hooks**

  | Skill | Trigger | Purpose |
  |-------|---------|---------|
  | `scanning-sanctuary` | Component lookup | Live ripgrep discovery |
  | `graphing-imports` | Startup | Dependency scanning |
  | `querying-workshop` | /craft | Fast index queries |
  | `validating-physics` | PreToolUse | Block physics violations |
  | `seeding-sanctuary` | Cold start | Virtual taste |
  | `inspiring-ephemerally` | "like [url]" | Forked fetch |
  | `forging-patterns` | /forge | Bypass survival |
  | `managing-eras` | /new-era | Era transitions |
  | `observing-survival` | PostToolUse | Silent tracking |
  | `chronicling-rationale` | Stop | Craft logs |
  | `auditing-cohesion` | /audit | Variance checks |

- **Virtual Sanctuary** — Seeds for cold start projects

  | Seed | Feel | Physics |
  |------|------|---------|
  | Linear-like | Minimal, monochrome | 150ms |
  | Vercel-like | Bold, high-contrast | 100ms |
  | Stripe-like | Soft gradients | 300ms |

- **Survival Observation** — Silent pattern tracking via PostToolUse

  ```json
  {
    "era": "v1",
    "patterns": {
      "animation:spring": {
        "status": "canonical",
        "occurrences": 7
      }
    }
  }
  ```

- **Ephemeral Inspiration** — Context forking for external references

  ```bash
  /inspire stripe.com "gradient button"
  ```

- **Forge Mode** — Explicit precedent-breaking exploration

  ```bash
  /forge "experimental animation"
  ```

- **Era Management** — Design direction shifts

  ```bash
  /new-era "Tactile"
  ```

- **Agent Orchestration** — 7-phase craft flow

  ```
  Startup → Discovery → Context → Validation → Generation → Observation → Chronicling
  ```

- **Migration Script** — `scripts/migrate-v6.sh` for v5→v6 transition

### Changed

- **Discovery is pre-computed** — Workshop index replaces JIT grep (200ms → 5ms)
- **Approval is survival** — Patterns earn status through usage, not dialogs
- **Novelty is allowed** — Physics violations blocked, style innovation allowed
- **Cold starts have taste** — Virtual Sanctuary seeds provide guidance

### Deprecated

- **Governance dialogs** — Replaced by survival observation
- **JIT grep as primary** — Now fallback only

### Migration

```bash
# Run migration script
./scripts/migrate-v6.sh --dry-run  # Preview
./scripts/migrate-v6.sh            # Apply
```

| v5.0 | v6.0 |
|------|------|
| JIT grep (200ms) | Workshop index (5ms) |
| Governance dialogs | Survival observation |
| Empty cold starts | Virtual Sanctuary seeds |
| 6 skills | 11 skills + hooks |

### Performance

| Operation | Target | Achieved |
|-----------|--------|----------|
| Workshop query | <5ms | ~2ms |
| Sanctuary scan | <50ms | ~30ms |
| Full rebuild | <2s | ~1.5s |
| Pattern observation | <10ms | ~5ms |
| Craft log generation | <100ms | ~50ms |

---

## [5.0.0] - 2026-01-08 — "The Lucid Flow"

### Summary

v5.0 introduces the **Constitutional Framework** with Seven Laws that govern all design decisions. Live grep discovery replaces caching, JIT polish workflow respects creative flow, and a full governance system enables amendments and justification tracking.

### The Seven Laws

1. **Filesystem is Truth** — No caches. Live grep discovers components every time.
2. **Type Dictates Physics** — Data types determine behavior. Constitution binds type to physics.
3. **Zone is Layout, Not Business Logic** — Zones define *feel*, not behavior.
4. **Status Propagates** — Component tier = min(declared, dependencies).
5. **One Good Reason > 15% Silent Mutiny** — Capture bypasses, don't force workarounds.
6. **Never Refuse Outright** — Three paths: COMPLY, BYPASS, or AMEND.
7. **Let Artists Stay in Flow** — Never auto-fix. `/polish` suggests, human decides.

### Added

- **Constitutional Kernel** — YAML-defined physics binding

  ```
  sigil-mark/kernel/
  ├── constitution.yaml    # Data type → physics binding
  ├── fidelity.yaml        # Visual + ergonomic ceilings
  ├── vocabulary.yaml      # Term → physics mapping
  └── workflow.yaml        # Team methodology rules
  ```

- **6 Complete Skills**

  | Skill | Purpose |
  |-------|---------|
  | `scanning-sanctuary` | Live grep component discovery |
  | `analyzing-data-risk` | Type → physics resolution |
  | `polishing-code` | JIT standardization |
  | `negotiating-integrity` | Constitution violation handling |
  | `auditing-cohesion` | Visual consistency checks |
  | `simulating-interaction` | Timing threshold verification |

- **`/garden` Command** — System health monitoring

  ```bash
  /garden              # Full health check
  /garden --drift      # Visual drift only
  ```

  Returns health score, issues by severity, fidelity/propagation/timing checks.

- **`/polish` Command** — JIT standardization (respects Law 7)

  ```bash
  /polish              # Staged files
  /polish src/Button.tsx
  ```

  Suggests pragma standardization. Never auto-applies changes.

- **`/amend` Command** — Constitution amendment proposals

  ```bash
  /amend constitution.financial.forbidden[0] \
    --change "Allow useOptimistic for demo accounts" \
    --reason "Demo accounts have no real funds"
  ```

  Creates amendment YAML in `governance/amendments/`.

- **Governance System**
  - `governance/justifications.log` — Append-only bypass audit trail
  - `governance/amendments/` — Amendment proposal YAMLs
  - All bypasses logged with justification

- **Simulation Flow** — `useSigilMutation` with preview/confirm cycle

  ```tsx
  const { simulate, confirm, execute, preview } = useSigilMutation({
    mutation: () => api.claim(poolId),
    dataType: 'financial',
  });

  const handleClick = async () => {
    const preview = await simulate();
    if (userConfirms(preview)) {
      confirm();
      await execute();
    }
  };
  ```

- **Status Propagation** — Automatic tier calculation based on dependencies
- **Violation Scanner** — Detects constitution and fidelity violations
- **Component Scanner** — Live grep discovery with JSDoc pragma parsing
- **Migration Script** — `migrate-v5.sh` for v4.x → v5.0 transition

### Changed

- **Discovery is live** — No more `sigil.map` cache. Filesystem is truth.
- **Polish is JIT** — No auto-fix. Human reviews and accepts changes.
- **Governance is explicit** — Bypasses require justification, not silence.
- **Commands consolidated** — `/garden`, `/polish`, `/amend` replace scattered functionality

### Deprecated

- **`sigil.map`** — Use live grep discovery instead
- **`.sigil-cache/`** — Removed. Filesystem is truth.
- **Auto-fix patterns** — Use `/polish` for human-reviewed suggestions

### Migration

```bash
# Run migration script
./sigil-mark/scripts/migrate-v5.sh --dry-run  # Preview
./sigil-mark/scripts/migrate-v5.sh            # Apply
```

| v4.1 | v5.0 |
|------|------|
| Cache-based discovery | Live grep (scanning-sanctuary) |
| Auto-fix patterns | JIT polish (never auto-fix) |
| Silent workarounds | Justification logging |
| Fixed rules | Constitutional amendments |

---

## [4.1.0] - 2026-01-07 — "Living Guardrails"

### Summary

v4.1 adds the **enforcement layer** that makes physics real. Three enforcement surfaces—compile-time (ESLint), runtime (hooks), and agent-time (skills)—all consume the same context. The framework is no longer a "hollow shell"—it has teeth.

### Added

- **`useSigilMutation` Hook** — Zone+Persona-aware mutation hook that auto-resolves physics from context

  ```tsx
  const { execute, state, cssVars } = useSigilMutation({
    mutation: () => api.claim(poolId),
    intent: 'claim',  // From vocabulary.yaml
  });
  // cssVars: { '--sigil-duration': '800ms', '--sigil-easing': 'ease-out' }
  ```

- **`eslint-plugin-sigil`** — Three ESLint rules for compile-time enforcement
  - `sigil/enforce-tokens` — No arbitrary Tailwind values like `[13px]`
  - `sigil/zone-compliance` — Timing must match zone physics
  - `sigil/input-physics` — Admin zones require keyboard navigation

- **`SigilProvider`** — Runtime context provider for zones, personas, and remote config

  ```tsx
  <SigilProvider remoteAdapter={launchDarklyAdapter}>
    <App />
  </SigilProvider>
  ```

- **Physics Kernel** — `sigil-mark/kernel/physics.yaml` defines 7 motion profiles
  - instant, snappy, warm, deliberate, reassuring, celebratory, reduced
  - Each with duration, easing, and constraints

- **Vocabulary Layer** — 10 DeFi terms with recommended physics
  - pot, vault, claim, deposit, withdraw, boost, stake, unstake, harvest, connect
  - Maps intent → motion → CSS values

- **Remote Soul** — A/B test motion timing without code changes
  - `timing_modifier` adjusts duration (0.5 = faster, 2.0 = slower)
  - Kernel-locked values cannot be modified remotely
  - LaunchDarkly/Statsig adapter support

- **`/observe` Skill** — Visual feedback loop with MCP integration
  - Automatic screenshots via Claude in Chrome
  - Falls back to manual screenshot upload
  - L1/L2/L3 progressive disclosure

- **Persona Overrides** — Zone × Persona matrix for differentiated experiences

  ```yaml
  zones:
    critical:
      default_physics: deliberate
      persona_overrides:
        power_user: warm      # Faster for power users
        newcomer: reassuring  # Extra feedback for newcomers
  ```

### Changed

- **Physics Resolution Algorithm** — Zone → Persona Override → Remote Modifier
- **Layout Components** — Now register zone context for `useSigilMutation`
- **Process Layer** — Added `physics-reader.ts` for kernel reading

### Deprecated

- **`useCriticalAction`** — Use `useSigilMutation` instead (deprecation warning added)

### Migration

See [MIGRATION-v4.1.md](MIGRATION-v4.1.md) for complete migration guide.

| v4.0 | v4.1 |
|------|------|
| `useCriticalAction` | `useSigilMutation` |
| Manual physics wiring | Auto-resolved from context |
| No ESLint | `eslint-plugin-sigil` |
| No remote config | Remote Soul adapters |

---

## [4.0.0] - 2026-01-06 — "Sharp Tools"

### Summary

v4.0 collapses 37 commands into **7 discrete tools** with progressive disclosure. Every tool supports L1 (sensible defaults), L2 (targeted options), and L3 (full control).

### Breaking Changes

- **Command Consolidation** — Many v3 commands merged into unified tools

  | v3.0 | v4.0 |
  |------|------|
  | `/setup` | (automatic) |
  | `/inherit` | `/envision` |
  | `/approve` | `/consult` |
  | `/canonize` | `/consult --protect` |
  | `/unlock` | `/consult --unlock` |
  | `/validate` | `/garden --validate` |

### Added

- **Progressive Disclosure** — All 7 tools support three grip levels
  - L1: Sensible defaults, minimal input
  - L2: Targeted options for specific needs
  - L3: Full control for power users

- **Evidence-Based Context** — Personas and zones can cite real evidence

  ```yaml
  personas:
    - name: depositor
      source: analytics
      evidence:
        - id: EV-2026-001
          summary: "Mixpanel shows 80% completion rate"
  ```

- **Visual Feedback Loop** — `/craft` → `/observe` → `/refine` cycle
  - MCP integration for automatic screenshots
  - Structural analysis against rules.md
  - Feedback questions for human judgment

- **Journey-Based Zones** — Zones include journey stage and persona likelihood

  ```yaml
  zones:
    critical:
      journey_stage: active
      persona_likely: depositor
      trust_state: critical
  ```

- **Health Monitoring** — `/garden` for ongoing maintenance
  - Summary health reports
  - Schema validation for CI (`--validate`)
  - Evidence aging detection

- **Build-Time Export** — `sigil export-config` for runtime consumption
  - JSON export for non-Claude environments
  - Minify option for production
  - Watch mode for development

### Changed

- **Tool Naming** — Verbs that describe actions (envision, codify, craft, observe, refine, consult, garden)
- **Gap Detection** — `/craft` shows context gaps with specific `/refine` commands
- **Decision Recording** — `/consult` consolidates all decision locking

### The 7 Tools

| Tool | Purpose |
|------|---------|
| `/envision` | Capture product moodboard |
| `/codify` | Define design rules |
| `/craft` | Get design guidance |
| `/observe` | Visual feedback loop |
| `/refine` | Incremental updates |
| `/consult` | Record decisions |
| `/garden` | Health monitoring |

---

## [3.0.0] - 2026-01-06 — "Living Engine"

### Summary

v3.0 introduces a fundamental architectural split between **Agent-Time** (YAML processing) and **Runtime** (React components). The Process layer is now agent-only and cannot be imported in browser code.

### Breaking Changes

- **ProcessContextProvider removed from runtime** — The `ProcessContextProvider` component no longer works in browser environments. Process layer is now agent-context-only. Use `PersonaProvider` and `ZoneProvider` for runtime context.

  ```tsx
  // v2.6 (BROKEN)
  import { ProcessContextProvider } from 'sigil-mark';

  // v3.0 (CORRECT)
  import { PersonaProvider, ZoneProvider } from 'sigil-mark';
  ```

- **Lens Array renamed to Personas** — The `lens-array/` directory is renamed to `personas/`. Types `LensArray` renamed to `PersonaArray`. Deprecated aliases available with console warnings.

  ```tsx
  // v2.6
  import { readLensArray, type LensArray } from 'sigil-mark/process';

  // v3.0
  import { readPersonas, type PersonaArray } from 'sigil-mark/process';
  ```

- **Process layer is agent-only** — All YAML readers in `sigil-mark/process/` use Node.js `fs` and will crash if imported in browser bundles.

### Added

- **Vocabulary Layer** — Maps product terms to design recommendations. Vocabulary is Sigil's public API surface.

  ```yaml
  # sigil-mark/vocabulary/vocabulary.yaml
  terms:
    - id: vault
      engineering_name: PositionDisplay
      user_facing: ["Vault", "Position"]
      feel:
        critical: { material: fortress, motion: deliberate }
  ```

- **Philosophy Layer (Soul Binder)** — Captures intent hierarchy, principles, and conflict resolution rules.

  ```yaml
  # sigil-mark/soul-binder/philosophy.yaml
  primary_intent: "Make DeFi feel trustworthy"
  principles:
    - id: security_first
      statement: "Security indicators must be visible"
      priority: 1
  ```

- **User Fluidity** — Persona (who) + Zone (where) = Effective Experience. New runtime providers:

  ```tsx
  <PersonaProvider defaultPersona="power_user">
    <ZoneProvider zone="critical">
      <App />
    </ZoneProvider>
  </PersonaProvider>
  ```

- **Behavioral Signals** — Passive observation patterns in vibe-checks.yaml for UX insights without user interruption:
  - `rage_clicking` — User frustration indicator
  - `back_button_loop` — User may be lost
  - `form_abandonment` — Form complexity issues
  - `deep_engagement` — Positive content resonance
  - `information_seeking` — User wants more context
  - `confirmation_friction` — Uncertainty at confirmation dialogs
  - `security_checking` — User verifying security indicators
  - `price_comparison` — Price sensitivity detection

- **Remote Configuration Schema** — Clear separation between marketing-controlled and engineering-controlled values:

  ```yaml
  # sigil-mark/remote-config/remote-config.yaml
  marketing_controlled:
    copy: { hero_headline: { value: "Your Crypto, Your Way" }}
    feature_flags: { show_new_dashboard: { enabled: false }}
  engineering_controlled:
    physics: local_only  # Constitutional constraint
  ```

- **vocabulary-reader.ts** — Functions for reading and querying vocabulary:
  - `readVocabulary()`, `readVocabularySync()`
  - `getTerm()`, `getTermFeel()`, `getTermsForZone()`
  - `formatVocabularySummary()`

- **philosophy-reader.ts** — Functions for reading philosophy and resolving conflicts:
  - `readPhilosophy()`, `readPhilosophySync()`
  - `getPrinciple()`, `getPrinciplesByPriority()`
  - `resolveConflict()`, `getPrimaryIntent()`

- **persona-context.tsx** — Runtime persona provider with localStorage persistence
- **zone-context.tsx** — Runtime zone provider with zone override support

### Changed

- **Zone detection is layout-based** — Zones declared via `<CriticalZone>`, `<MachineryLayout>`, `<GlassLayout>` components, not file paths.
- **Skills rewritten for philosophy alignment** — Skills present options with tradeoffs, not mandates. No more "decide fast" language.
- **Process module has @server-only JSDoc** — Clear documentation that process layer is agent-only.

### Deprecated

- `readLensArray()` — Use `readPersonas()` instead
- `LensArray` type — Use `PersonaArray` instead
- `DEFAULT_LENS_ARRAY` — Use `DEFAULT_PERSONA_ARRAY` instead

### Fixed

- **Browser crash on ProcessContextProvider import** — Process layer now properly separated from runtime
- **Path-based zone detection inconsistencies** — Zones now declared by Layout components

---

## [2.6.0] - 2026-01-05 — "Craftsman's Flow"

### Added

- Process Layer for human-AI collaboration
- Constitution system (protected capabilities)
- Decision locking with time-based expiry
- Persona system (zone-persona mapping)
- Vibe Checks (micro-surveys)
- `/consult` command for decision locking
- `/garden` command for health reports

---

## [2.0.0] - 2025-12-01 — "Reality Engine"

### Added

- Truth vs Experience architecture (Core/Layout/Lens)
- `useCriticalAction` hook with time authority
- `CriticalZone`, `MachineryLayout`, `GlassLayout` components
- `useLens` hook for automatic lens selection
- `DefaultLens`, `StrictLens`, `A11yLens` variants

### Breaking Changes

- `SigilZone` replaced with Layout components
- `useServerTick` replaced with `useCriticalAction`
- `useSigilPhysics` replaced with `useLens`

---

## [1.2.5] - 2025-11-01 — "Zone Provider"

### Added

- Context-based physics via SigilZone
- Zone configuration via file paths
- Material-based styling

---

## [1.0.0] - 2025-10-01 — "Full Workbench"

### Added

- 4-panel tmux workbench
- Material system (decisive, machinery, glass)
- Recipe-based components

---

## [0.5.0] - 2025-09-01 — "Design Physics Engine"

### Added

- Simplified physics model
- Hook-based API

---

## [0.4.x] - 2025-08-01 — "Soul Engine"

### Added

- npm package
- React hooks

---

## [0.3.0] - 2026-01-02

### Why This Release

**Sigil 0.3** introduces the Constitutional Design Framework — a four-pillar architecture that protects both intended soul (Immutable Values) and emergent soul (Canon of Flaws). This release adds layered decision authority, user persona validation, and feature proving at scale.

> "Culture is the Reality. Code is Just the Medium."

### Added

- **Soul Binder (Pillar 1)**: Protect core values and emergent behaviors
  - Immutable Values: Hard-block violations of core principles
  - Canon of Flaws: Protect beloved "bugs" from optimization
  - Visual Soul: Grit signatures for cultural validation (future)

- **Lens Array (Pillar 2)**: Multi-truth validation system
  - User persona definitions with priority ordering
  - Most constrained lens = truth test
  - Immutable properties that cannot vary between lenses
  - Lens stacking and conflict resolution

- **Consultation Chamber (Pillar 3)**: Layered decision authority
  - Strategic: Community poll, binding vote
  - Direction: Sentiment gathering, Taste Owner decides
  - Execution: Taste Owner dictates
  - Time-based decision locking (180/90/30 days)

- **Proving Grounds (Pillar 4)**: Feature validation at scale
  - Domain-specific monitors (DeFi, Creative, Community, Games)
  - Proving periods (7/14/30 days)
  - Graduation with Taste Owner sign-off
  - Living Canon for graduated features

- **Progressive Strictness**
  | Level | Behavior |
  |-------|----------|
  | `discovery` | All suggestions, no blocks |
  | `guiding` | Warnings on violations |
  | `enforcing` | Blocks on protected flaws/values |
  | `strict` | Blocks on all violations |

- **New Commands**
  | Command | Purpose |
  |---------|---------|
  | `/canonize` | Protect emergent behaviors |
  | `/consult` | Start decision consultation |
  | `/prove` | Register feature for proving |
  | `/graduate` | Graduate feature to canon |

- **Updated Commands**
  | Command | Changes |
  |---------|---------|
  | `/setup` | Creates v3 directory structure |
  | `/envision` | Extended for values + lenses |
  | `/craft` | Respects flaws, values, lenses, decisions |

- **Helper Scripts**
  - `get-strictness.sh` — Return current strictness level
  - `get-monitors.sh` — Get domain-specific monitors
  - `get-lens.sh` — Detect lens for file path
  - `check-flaw.sh` — Check if component affects flaws
  - `check-decision.sh` — Check for locked decisions

- **JSON Schema Validation**
  - Schemas for all YAML config files
  - `test-schemas.sh` for validation
  - `test-helpers.sh` for script testing

- **Audit Trail**: All human overrides logged to `sigil-mark/audit/overrides.yaml`

- **Migration Guide**: `MIGRATION-V3.md` for v2 → v3 migration

### Changed

- **Directory Structure**: Four-pillar organization
  ```
  sigil-mark/
  ├── soul-binder/           # Values + Flaws
  ├── lens-array/            # User personas
  ├── consultation-chamber/  # Decisions
  ├── proving-grounds/       # Feature proving
  ├── canon/                 # Graduated features
  └── audit/                 # Override logging
  ```

- **Configuration Schema**: Updated `.sigilrc.yaml` for 0.3
  - Added `strictness` field
  - Added `taste_owners` configuration
  - Added `domains` for proving monitors
  - Added `consultation` settings
  - Added `proving` settings

### Breaking Changes

- **0.2 → 0.3 Migration Required**
  - Zones replaced by Lenses (user personas)
  - Rejections replaced by Canon of Flaws
  - New strictness levels control blocking behavior
  - See `MIGRATION.md` for migration steps

### Philosophy

Sigil 0.3 follows constitutional design principles:

1. **Soul Protection**: Both intended and emergent soul are protected
2. **Multiple Truths**: Different users can have different valid experiences
3. **Layered Authority**: Not every decision needs community input
4. **Prove at Scale**: Features must demonstrate stability before becoming canonical
5. **Human Accountability**: All automated decisions can be overridden (with logging)

---

## [0.2.0] - 2026-01-02

### Why This Release

**Sigil 0.2** is a complete reimagining of the framework. The original 0.1 was built on top of Loa's enterprise workflow patterns. 0.2 strips away that complexity to focus purely on what Sigil does best: **capturing and preserving design context for AI-assisted development**.

This is a breaking change from 0.1, but a much simpler, cleaner foundation.

### Added

- **Zone System**: Path-based design context for different areas of your app
  - Configure zones in `.sigilrc.yaml`
  - Each zone has its own motion profile (deliberate, playful, snappy)
  - Pattern preferences and warnings per zone

- **Motion Recipes**: Pre-built animation hooks for different contexts
  - `useDeliberateEntrance` - Critical zones (800ms+, tension: 120)
  - `usePlayfulBounce` - Marketing zones (bouncy, tension: 200)
  - `useSnappyTransition` - Admin zones (<200ms, tension: 400)

- **Core Commands**
  | Command | Purpose |
  |---------|---------|
  | `/setup` | Initialize Sigil on a repo |
  | `/envision` | Capture product moodboard (interview) |
  | `/codify` | Define design rules (interview) |
  | `/craft` | Get design guidance during implementation |
  | `/approve` | Human sign-off on patterns |
  | `/inherit` | Bootstrap from existing codebase |
  | `/update` | Pull framework updates |

- **Skills Architecture**: 3-level structure for all skills
  - Level 1: `index.yaml` - Metadata (~100 tokens)
  - Level 2: `SKILL.md` - Instructions (~2000 tokens)
  - Level 3: `scripts/` - Bash utilities

- **State Zone Structure**
  ```
  sigil-mark/
  ├── moodboard.md    # Product feel, references, anti-patterns
  ├── rules.md        # Design rules by category
  └── inventory.md    # Component list with zone assignments
  ```

- **Rejections Philosophy**: Warn, don't block
  - Patterns to avoid are documented with reasons
  - Agents explain concerns and offer alternatives
  - Users can always override

- **Version Tracking**: `.sigil-version.json` for framework versioning

### Changed

- **Complete Architecture Rewrite**: Simplified from Loa's 8-phase enterprise workflow
- **Separate Identity**: Sigil now has its own documentation (README, INSTALLATION, PROCESS)
- **Focused Scope**: Design context only, no product development workflow

### Breaking Changes

- **0.1 → 0.2 Migration**: This is a complete rewrite
  - Old 0.1 commands are replaced with new 0.2 commands
  - State zone changed from mixed structure to `sigil-mark/`
  - Configuration changed to `.sigilrc.yaml`

### Coexistence with Loa

Sigil 0.2 can coexist with Loa on the same repository:
- Separate state zones (`sigil-mark/` vs `loa-grimoire/`)
- Separate configs (`.sigilrc.yaml` vs `.loa.config.yaml`)
- No command conflicts

---

## [0.1.0] - 2025-12-20

### Added

- Initial release of Sigil (built on Loa v0.6.0)
- Design context capture commands
- Basic moodboard and rules structure

[3.1.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v3.1.0
[2.4.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v2.4.0
[2.3.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v2.3.0
[2.2.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v2.2.0
[5.0.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v5.0.0
[4.1.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v4.1.0
[4.0.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v4.0.0
[3.0.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v3.0.0
[2.6.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v2.6.0
[2.0.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v2.0.0
[1.2.5]: https://github.com/0xHoneyJar/sigil/releases/tag/v1.2.5
[1.0.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v1.0.0
[0.5.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v0.5.0
[0.4.x]: https://github.com/0xHoneyJar/sigil/releases/tag/v0.4.0
[0.3.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v0.3.0
[0.2.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v0.2.0
[0.1.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v0.1.0
