# Sprint Plan: Sigil HUD & Composable Package Architecture

**Version:** 1.0.0
**Created:** 2026-01-21
**PRD Reference:** `grimoires/loa/prd-sigil-hud.md`
**SDD Reference:** `grimoires/loa/sdd-sigil-hud.md`

---

## Overview

| Sprint | Focus | Duration | Goal |
|--------|-------|----------|------|
| **Sprint 0** | Bug Fixes | ~2 days | Fix all P1/P2/P3 bugs in existing codebase |
| **Sprint 1** | Package Architecture | ~4 days | Split monolith into composable packages |
| **Sprint 2** | Diagnostic HUD | ~3 days | Build diagnostic-first HUD components |

**Total Estimated Duration:** ~9 days

---

## Sprint 0: Critical Bug Fixes

**Goal:** Fix all identified bugs in Anchor/Lens Rust CLIs and Dev Toolbar React components.

**Success Criteria:**
- All P1 bugs resolved (3 items)
- All P2 bugs resolved (2 items)
- P3 bug resolved (1 item)
- No regressions in existing functionality

### Tasks

#### TASK-001: Create Shared sigil-ipc Rust Crate
**Priority:** P1 | **Effort:** Small | **FR:** FR-001

**Description:**
Create a shared Rust crate to handle IPC file operations with CLI-prefixed response paths, eliminating the collision between Anchor and Lens responses.

**Acceptance Criteria:**
- [ ] Create `anchor-rust/sigil-ipc/` crate with Cargo.toml
- [ ] Implement `CliName` enum (Anchor, Lens)
- [ ] Implement `response_path(cli, request_id)` with CLI prefix
- [ ] Implement `request_path(request_id)` (unchanged behavior)
- [ ] Implement `read_request<T>()` and `write_response<T>()`
- [ ] Add input validation for request IDs (UUID format)
- [ ] Unit tests for path generation

**Files to Create/Modify:**
- Create: `anchor-rust/sigil-ipc/src/lib.rs`
- Create: `anchor-rust/sigil-ipc/Cargo.toml`
- Modify: `anchor-rust/Cargo.toml` (workspace member)

**Testing:**
- Unit test: `response_path(Anchor, "abc123")` → `grimoires/pub/responses/anchor-abc123.json`
- Unit test: `response_path(Lens, "abc123")` → `grimoires/pub/responses/lens-abc123.json`

---

#### TASK-002: Migrate Anchor to sigil-ipc
**Priority:** P1 | **Effort:** Small | **FR:** FR-001

**Description:**
Update Anchor CLI to use the shared sigil-ipc crate for all IPC operations.

**Acceptance Criteria:**
- [ ] Add `sigil-ipc` as workspace dependency in anchor
- [ ] Replace `io.rs` functions with `sigil_ipc::*` calls
- [ ] Use `CliName::Anchor` for response writes
- [ ] Verify existing tests pass
- [ ] Integration test with Lens running simultaneously

**Files to Modify:**
- `anchor-rust/anchor/Cargo.toml`
- `anchor-rust/anchor/src/io.rs` (minimize or remove)
- `anchor-rust/anchor/src/main.rs` (update imports)

**Dependencies:** TASK-001

---

#### TASK-003: Migrate Lens to sigil-ipc
**Priority:** P1 | **Effort:** Small | **FR:** FR-001, FR-003

**Description:**
Update Lens CLI to use the shared sigil-ipc crate and fix the verify response persistence issue.

**Acceptance Criteria:**
- [ ] Add `sigil-ipc` as workspace dependency in lens
- [ ] Replace IO functions with `sigil_ipc::*` calls
- [ ] Use `CliName::Lens` for response writes
- [ ] Fix: Write response file when request_id provided (regardless of output format)
- [ ] Verify existing tests pass

**Files to Modify:**
- `anchor-rust/lens/Cargo.toml`
- `anchor-rust/lens/src/io.rs` (minimize or remove)
- `anchor-rust/lens/src/main.rs:168-180` (always write response)

**Dependencies:** TASK-001

---

#### TASK-004: Fix or Remove Lint Command Stub
**Priority:** P1 | **Effort:** Medium | **FR:** FR-002

**Description:**
The `lens lint` command currently does nothing. Either implement real linting or remove the command entirely.

**Recommended Approach:** Remove the stub and document `lens verify` as the proper command.

**Acceptance Criteria:**
- [ ] Remove `run_lint` function from lens/src/main.rs
- [ ] Remove "lint" from CLI subcommands
- [ ] Update help text to point users to `lens verify`
- [ ] Update any documentation referencing `lens lint`

**Alternative Acceptance Criteria (if implementing):**
- [ ] Wire lint to tree-sitter metrics analysis
- [ ] Return meaningful lint results
- [ ] Document lint output format

**Files to Modify:**
- `anchor-rust/lens/src/main.rs:234-242`
- CLI argument definitions

---

#### TASK-005: Fix Conditional Hook Call in UserLens
**Priority:** P1 | **Effort:** Small | **FR:** FR-005

**Description:**
`useDevToolbar()` is called inside conditional JSX, violating React's rules of hooks and causing "Rendered fewer hooks than expected" crash.

**Current Code (line 130):**
```tsx
{isImpersonating && (
  <code>{useDevToolbar().userLens.impersonatedAddress}</code>
)}
```

**Fixed Code:**
```tsx
// At top of component (line 34 already has this)
const { userLens } = useDevToolbar()

// In JSX
{isImpersonating && (
  <code>{userLens.impersonatedAddress}</code>
)}
```

**Acceptance Criteria:**
- [ ] Remove hook call from inside conditional JSX
- [ ] Use already-extracted `userLens` value from line 34
- [ ] Component toggles impersonation on/off without crash
- [ ] No React hooks warnings in console
- [ ] Manual test: toggle impersonation repeatedly

**Files to Modify:**
- `packages/sigil-dev-toolbar/src/components/UserLens.tsx:130`

---

#### TASK-006: Fix Impersonation Cleanup on Simulation Error
**Priority:** P2 | **Effort:** Small | **FR:** FR-006

**Description:**
When simulation throws an error, `stopImpersonating()` is never called because it's only in the try block.

**Current Code (lines 248-308):**
```typescript
try {
  await forkService.impersonateAccount(tx.from)
  // ... simulation ...
  await forkService.stopImpersonating(tx.from)  // Only here!
} catch (error) {
  // No cleanup
}
```

**Fixed Code:**
```typescript
try {
  await forkService.impersonateAccount(tx.from)
  // ... simulation ...
} catch (error) {
  // ... error handling ...
  throw error
} finally {
  try {
    await forkService.stopImpersonating(tx.from)
  } catch {
    // Ignore cleanup errors
  }
}
```

**Acceptance Criteria:**
- [ ] Move `stopImpersonating` to finally block
- [ ] Add try/catch around cleanup to prevent masking original error
- [ ] Test: Simulation error does not leave fork impersonating
- [ ] Test: Successful simulation still cleans up

**Files to Modify:**
- `packages/sigil-dev-toolbar/src/services/simulation.ts:248-308`

---

#### TASK-007: Fix Double-Counting JSX Event Handlers
**Priority:** P3 | **Effort:** Small | **FR:** FR-004

**Description:**
Event handlers are counted in both `jsx_opening_element` and `jsx_attribute` branches, leading to inflated metrics.

**Acceptance Criteria:**
- [ ] Count event handlers only in `jsx_attribute` branch
- [ ] Remove counting from `jsx_opening_element` for handlers
- [ ] Add test case: component with 3 onClick handlers → count = 3
- [ ] Verify existing metrics tests pass

**Files to Modify:**
- `anchor-rust/lens/src/parser/mod.rs:90-115`

---

#### TASK-008: Update TypeScript IPC Client for Prefixed Responses
**Priority:** P1 | **Effort:** Small | **FR:** FR-001

**Description:**
Update the TypeScript IPC client to read from the new prefixed response file paths with backward compatibility.

**Acceptance Criteria:**
- [ ] Update `readResponse` to try prefixed path first (`anchor-{id}.json`)
- [ ] Fall back to unprefixed path for transition period
- [ ] Log deprecation warning when using old format
- [ ] Types updated for response path conventions

**Files to Modify:**
- `packages/sigil-dev-toolbar/src/ipc/client.ts` (or equivalent)
- `packages/sigil-dev-toolbar/src/ipc/types.ts`

**Dependencies:** TASK-002, TASK-003

---

### Sprint 0 Summary

| Task | Description | Effort | Dependencies |
|------|-------------|--------|--------------|
| TASK-001 | Create sigil-ipc Rust crate | Small | None |
| TASK-002 | Migrate Anchor to sigil-ipc | Small | TASK-001 |
| TASK-003 | Migrate Lens to sigil-ipc | Small | TASK-001 |
| TASK-004 | Fix/remove lint stub | Medium | None |
| TASK-005 | Fix conditional hook call | Small | None |
| TASK-006 | Fix impersonation cleanup | Small | None |
| TASK-007 | Fix double-counting handlers | Small | None |
| TASK-008 | Update TS IPC client | Small | TASK-002, TASK-003 |

**Parallelization:**
- TASK-001 first (blocks TASK-002, TASK-003, TASK-008)
- TASK-004, TASK-005, TASK-006, TASK-007 can run in parallel
- TASK-002, TASK-003 can run in parallel after TASK-001
- TASK-008 after TASK-002 and TASK-003

---

## Sprint 1: Package Architecture

**Goal:** Split the monolithic sigil-dev-toolbar into composable UNIX-philosophy packages.

**Success Criteria:**
- All 6 packages installable independently
- Clear public APIs documented
- HUD composes any subset of packages
- Existing functionality preserved

### Tasks

#### TASK-101: Create Package Structure and Workspace
**Priority:** P1 | **Effort:** Medium

**Description:**
Set up the pnpm workspace structure and create the 6 package directories with initial configuration.

**Acceptance Criteria:**
- [ ] Create `packages/anchor/`, `packages/fork/`, `packages/simulation/`, `packages/lens/`, `packages/diagnostics/`, `packages/hud/`
- [ ] Configure `pnpm-workspace.yaml`
- [ ] Create `package.json` for each package with correct name, dependencies
- [ ] Set up `tsconfig.json` for each package
- [ ] Configure build tooling (Vite library mode)
- [ ] Verify `pnpm install` works from root

**Files to Create:**
- `packages/anchor/package.json`
- `packages/anchor/tsconfig.json`
- `packages/anchor/vite.config.ts`
- `packages/anchor/src/index.ts`
- (Same structure for all 6 packages)
- Update: `pnpm-workspace.yaml`

---

#### TASK-102: Extract @sigil/anchor Package
**Priority:** P1 | **Effort:** Medium

**Description:**
Extract the Anchor IPC client into a standalone package.

**Public API:**
```typescript
export interface AnchorClient { ... }
export interface ValidationResult { ... }
export type Zone = 'critical' | 'elevated' | 'standard' | 'local'
export function createAnchorClient(config?: AnchorClientConfig): AnchorClient
```

**Acceptance Criteria:**
- [ ] Export all types from SDD section 4.2
- [ ] Implement IPC client with prefixed response paths
- [ ] Add backward compatibility for old response format
- [ ] Unit tests for IPC operations
- [ ] `pnpm build` produces working bundle <20KB
- [ ] Can be installed independently

**Files to Create:**
- `packages/anchor/src/index.ts`
- `packages/anchor/src/client.ts`
- `packages/anchor/src/types.ts`
- `packages/anchor/src/ipc.ts`

**Dependencies:** TASK-101

---

#### TASK-103: Extract @sigil/fork Package
**Priority:** P1 | **Effort:** Medium

**Description:**
Extract the fork service into a standalone package.

**Public API:**
```typescript
export interface ForkService { ... }
export interface ForkState { ... }
export interface ForkSnapshot { ... }
export function createForkService(provider: ForkProvider): ForkService
export function createAnvilForkService(): ForkService
export function createTenderlyForkService(): ForkService
```

**Acceptance Criteria:**
- [ ] Export all types from SDD section 4.3
- [ ] Extract Anvil provider implementation
- [ ] Extract Tenderly provider implementation
- [ ] Peer dependency on viem
- [ ] Unit tests for fork operations
- [ ] `pnpm build` produces working bundle <30KB

**Files to Create:**
- `packages/fork/src/index.ts`
- `packages/fork/src/service.ts`
- `packages/fork/src/providers/anvil.ts`
- `packages/fork/src/providers/tenderly.ts`
- `packages/fork/src/types.ts`

**Dependencies:** TASK-101

---

#### TASK-104: Extract @sigil/simulation Package
**Priority:** P1 | **Effort:** Medium

**Description:**
Extract the simulation service into a standalone package that depends on @sigil/fork.

**Public API:**
```typescript
export interface SimulationService { ... }
export interface SimulationRequest { ... }
export interface SimulationResult { ... }
export function createSimulationService(forkService: ForkService): SimulationService
```

**Acceptance Criteria:**
- [ ] Export all types from SDD section 4.4
- [ ] Dependency on @sigil/fork (workspace:*)
- [ ] Implement finally-block cleanup (FR-006 pattern)
- [ ] Unit tests for simulation operations
- [ ] `pnpm build` produces working bundle <25KB

**Files to Create:**
- `packages/simulation/src/index.ts`
- `packages/simulation/src/service.ts`
- `packages/simulation/src/types.ts`

**Dependencies:** TASK-101, TASK-103

---

#### TASK-105: Extract @sigil/lens Package
**Priority:** P1 | **Effort:** Medium

**Description:**
Extract the lens/impersonation service into a standalone package.

**Public API:**
```typescript
export interface LensService { ... }
export interface LensState { ... }
export function createLensService(): LensService
export function useLens(): LensState
export function useLensContext(): LensContext
```

**Acceptance Criteria:**
- [ ] Export all types from SDD section 4.5
- [ ] Zustand store for lens state
- [ ] React hooks for lens consumption
- [ ] Wagmi integration helper (useLensAwareAccount)
- [ ] Unit tests for lens operations
- [ ] `pnpm build` produces working bundle <15KB

**Files to Create:**
- `packages/lens/src/index.ts`
- `packages/lens/src/service.ts`
- `packages/lens/src/store.ts`
- `packages/lens/src/hooks.ts`
- `packages/lens/src/wagmi.ts`
- `packages/lens/src/types.ts`

**Dependencies:** TASK-101

---

#### TASK-106: Extract @sigil/diagnostics Package
**Priority:** P1 | **Effort:** Medium

**Description:**
Extract the diagnostics service into a standalone package that depends on @sigil/anchor.

**Public API:**
```typescript
export interface DiagnosticsService { ... }
export interface DiagnosticResult { ... }
export function createDiagnosticsService(anchorClient?: AnchorClient): DiagnosticsService
```

**Acceptance Criteria:**
- [ ] Export all types from SDD section 4.6
- [ ] Optional dependency on @sigil/anchor
- [ ] Effect detection based on keywords/types
- [ ] Physics compliance checking
- [ ] Unit tests for diagnostic operations
- [ ] `pnpm build` produces working bundle <20KB

**Files to Create:**
- `packages/diagnostics/src/index.ts`
- `packages/diagnostics/src/service.ts`
- `packages/diagnostics/src/detection.ts`
- `packages/diagnostics/src/compliance.ts`
- `packages/diagnostics/src/types.ts`

**Dependencies:** TASK-101, TASK-102

---

#### TASK-107: Create @sigil/hud Package
**Priority:** P1 | **Effort:** Large

**Description:**
Create the main HUD package that composes all other packages with graceful degradation.

**Public API:**
```typescript
export { HudProvider, useHud } from './providers/HudProvider'
export { HudPanel } from './components/HudPanel'
export { HudTrigger } from './components/HudTrigger'
export { LensPanel } from './components/LensPanel'
export { SimulationPanel } from './components/SimulationPanel'
export { DiagnosticsPanel } from './components/DiagnosticsPanel'
```

**Acceptance Criteria:**
- [ ] Export all types from SDD section 4.7
- [ ] Optional dependencies on all other packages
- [ ] Graceful degradation when packages missing
- [ ] HudProvider accepts optional service instances
- [ ] All panels lazy-loaded
- [ ] Keyboard shortcuts configurable
- [ ] `pnpm build` produces working bundle <50KB

**Files to Create:**
- `packages/hud/src/index.ts`
- `packages/hud/src/providers/HudProvider.tsx`
- `packages/hud/src/components/HudPanel.tsx`
- `packages/hud/src/components/HudTrigger.tsx`
- `packages/hud/src/components/LensPanel.tsx`
- `packages/hud/src/components/SimulationPanel.tsx`
- `packages/hud/src/components/DiagnosticsPanel.tsx`
- `packages/hud/src/hooks/useKeyboardShortcuts.ts`
- `packages/hud/src/types.ts`

**Dependencies:** TASK-102, TASK-103, TASK-104, TASK-105, TASK-106

---

#### TASK-108: Document Package APIs
**Priority:** P2 | **Effort:** Medium

**Description:**
Create comprehensive documentation for all package public APIs.

**Acceptance Criteria:**
- [ ] README.md for each package with installation, usage examples
- [ ] API reference in each package
- [ ] Migration guide from old sigil-dev-toolbar
- [ ] Architecture diagram in root README

**Files to Create:**
- `packages/anchor/README.md`
- `packages/fork/README.md`
- `packages/simulation/README.md`
- `packages/lens/README.md`
- `packages/diagnostics/README.md`
- `packages/hud/README.md`
- Update: `README.md` (root)

**Dependencies:** TASK-102 through TASK-107

---

### Sprint 1 Summary

| Task | Description | Effort | Dependencies |
|------|-------------|--------|--------------|
| TASK-101 | Create workspace structure | Medium | None |
| TASK-102 | Extract @sigil/anchor | Medium | TASK-101 |
| TASK-103 | Extract @sigil/fork | Medium | TASK-101 |
| TASK-104 | Extract @sigil/simulation | Medium | TASK-101, TASK-103 |
| TASK-105 | Extract @sigil/lens | Medium | TASK-101 |
| TASK-106 | Extract @sigil/diagnostics | Medium | TASK-101, TASK-102 |
| TASK-107 | Create @sigil/hud | Large | TASK-102-106 |
| TASK-108 | Document APIs | Medium | TASK-102-107 |

**Parallelization:**
- TASK-101 first
- TASK-102, TASK-103, TASK-105 can run in parallel after TASK-101
- TASK-104 after TASK-103
- TASK-106 after TASK-102
- TASK-107 after all extractions
- TASK-108 after all packages created

---

## Sprint 2: Diagnostic-First HUD

**Goal:** Build the diagnostic HUD components that enable "diagnose before prescribe" workflows.

**Success Criteria:**
- Inline diagnostics panel working
- State source tracing visible
- Observation capture functional
- Feedback loop integrated with taste.md

### Tasks

#### TASK-201: Implement Inline Diagnostics Panel
**Priority:** P1 | **Effort:** Large | **FR:** FR-020

**Description:**
Create a non-intrusive panel showing physics analysis, data sources, and detected issues.

**Acceptance Criteria:**
- [ ] Panel shows current component physics analysis
- [ ] Panel shows data source indicators (on-chain, indexed, cached)
- [ ] Panel shows detected issues
- [ ] Quick action buttons (capture observation, record signal)
- [ ] Keyboard shortcut to toggle visibility (Cmd+Shift+D)
- [ ] Remembers position and state in localStorage
- [ ] Panel is passive (no prompts)

**Files to Create:**
- `packages/hud/src/components/DiagnosticsPanel.tsx`
- `packages/hud/src/components/PhysicsAnalysis.tsx`
- `packages/hud/src/components/DataSourceIndicator.tsx`
- `packages/hud/src/components/IssueList.tsx`

**Dependencies:** TASK-107

---

#### TASK-202: Implement State Source Tracing
**Priority:** P2 | **Effort:** Medium | **FR:** FR-021

**Description:**
For every displayed value in the HUD, show its data source and staleness.

**Display Format:**
```
Balance: 100 HONEY
└─ source: on-chain (block 19234567)
   staleness: 2 blocks
```

**Acceptance Criteria:**
- [ ] DataSourceBadge component showing source type
- [ ] Staleness indicator (time-based or block-based)
- [ ] Drill-down to source details on click
- [ ] Color coding: green (fresh), yellow (stale), red (very stale)

**Files to Create:**
- `packages/hud/src/components/DataSourceBadge.tsx`
- `packages/hud/src/components/StalenessIndicator.tsx`
- `packages/hud/src/hooks/useDataSource.ts`

**Dependencies:** TASK-201

---

#### TASK-203: Implement Observation Capture
**Priority:** P2 | **Effort:** Medium | **FR:** FR-022

**Description:**
Enable quick capture of user truth observations with keyboard shortcut.

**Flow:**
```
Cmd+Shift+O → Quick capture modal
  └─ Text input for observation
  └─ Auto-suggested tags from physics context
  └─ Auto-attached screenshot (if possible)
  └─ Save to grimoires/sigil/observations/
```

**Acceptance Criteria:**
- [ ] Keyboard shortcut Cmd+Shift+O opens capture modal
- [ ] Text input for observation content
- [ ] Tags auto-suggested based on current component effect
- [ ] Screenshot captured if browser APIs support
- [ ] Saved to `grimoires/sigil/observations/{timestamp}-{id}.md`
- [ ] Modal is dismissible with Escape

**Files to Create:**
- `packages/hud/src/components/ObservationCapture.tsx`
- `packages/hud/src/hooks/useObservationCapture.ts`
- `packages/hud/src/hooks/useScreenshot.ts`

**Dependencies:** TASK-107

---

#### TASK-204: Implement Feedback Loop Integration
**Priority:** P3 | **Effort:** Medium | **FR:** FR-023

**Description:**
Connect diagnostics to taste.md signals for the complete feedback loop.

**Flows:**
1. Issue detected → offer to create MODIFY signal
2. Observation captured → link to affected components
3. Component crafted → show diagnostic diff

**Acceptance Criteria:**
- [ ] "Report Issue" button in diagnostics panel
- [ ] Creates MODIFY signal with diagnostic context
- [ ] Observations link to component via `context.component`
- [ ] After craft, show diff between old and new physics
- [ ] Signals include `hud_context` field per SDD

**Files to Create:**
- `packages/hud/src/hooks/useSignalCapture.ts`
- `packages/hud/src/components/DiagnosticDiff.tsx`
- `packages/hud/src/components/SignalPrompt.tsx`

**Dependencies:** TASK-201, TASK-203

---

#### TASK-205: HUD Styling and Polish
**Priority:** P2 | **Effort:** Medium

**Description:**
Apply consistent styling to all HUD components following Sigil material physics.

**Acceptance Criteria:**
- [ ] Consistent color scheme (dark/light mode support)
- [ ] Proper touch targets (≥44px)
- [ ] Focus rings visible
- [ ] Animations follow Sigil physics (ease-out, 200ms)
- [ ] Reduced motion support
- [ ] Responsive layout

**Files to Modify:**
- All HUD component files
- `packages/hud/src/styles/index.css`

**Dependencies:** TASK-201, TASK-202, TASK-203, TASK-204

---

### Sprint 2 Summary

| Task | Description | Effort | Dependencies |
|------|-------------|--------|--------------|
| TASK-201 | Inline diagnostics panel | Large | TASK-107 |
| TASK-202 | State source tracing | Medium | TASK-201 |
| TASK-203 | Observation capture | Medium | TASK-107 |
| TASK-204 | Feedback loop integration | Medium | TASK-201, TASK-203 |
| TASK-205 | HUD styling and polish | Medium | TASK-201-204 |

**Parallelization:**
- TASK-201 first
- TASK-202, TASK-203 can run in parallel after TASK-201
- TASK-204 after TASK-201 and TASK-203
- TASK-205 after all features complete

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| sigil-ipc breaks existing flows | Low | High | Backward compatibility in TS client |
| Package split complexity | Medium | Medium | Comprehensive types, clear APIs |
| Bundle size creep | Medium | Medium | Size budgets, bundlesize CI check |
| HUD performance issues | Low | Medium | Lazy loading, memoization |

---

## Definition of Done

For each task:
- [ ] Code implemented and compiles
- [ ] Unit tests written and passing
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Acceptance criteria verified
- [ ] PR reviewed (if applicable)

For each sprint:
- [ ] All tasks completed
- [ ] Integration testing passed
- [ ] Documentation updated
- [ ] No regressions in existing functionality

---

## Next Steps

After Sprint 2 completion:
- `npm publish` packages to registry
- Deprecation notice on old sigil-dev-toolbar
- Community feedback collection
- Plan Sprint 3 (Tenderly traces, Wagmi hooks, etc.)

---

*Sprint plan generated via Loa /sprint-plan command. Based on PRD prd-sigil-hud.md and SDD sdd-sigil-hud.md.*
