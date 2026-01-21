# PRD: Sigil HUD & Composable Package Architecture

**Version:** 1.0.0
**Status:** Draft
**Created:** 2026-01-20
**Author:** PRD Discovery via /plan-and-analyze

---

## Executive Summary

Transform the Sigil Dev Toolbar into a **diagnostic-first HUD** (Heads-Up Display) with a **UNIX-philosophy composable architecture**. The goal is to protect developer flow state by enabling "diagnose before prescribe" workflows, tightening feedback loops, and providing clear boundaries between capabilities.

**Core Insight:** Artists and craftsmen naturally want to prescribe immediately. The HUD's job is to slow that impulse just enough to ensure diagnosis happens first—without breaking flow state.

---

## 1. Problem & Vision

### 1.1 Current Problems

#### Critical Bugs (P1/P2/P3)
*Source: PR Feedback Review*

| Priority | Issue | Location | Impact |
|----------|-------|----------|--------|
| **P1** | Response file collision | `anchor-rust/anchor/src/io.rs:31-34` | Anchor and Lens overwrite each other's responses |
| **P1** | Lint command is stub | `anchor-rust/lens/src/main.rs:234-242` | `/lint` does nothing, misleads users |
| **P1** | Conditional hook call in UserLens | `sigil-dev-toolbar/src/components/UserLens.tsx:130` | React runtime crash when toggling impersonation |
| **P2** | Verify responses not persisted for text output | `anchor-rust/lens/src/main.rs:168-180` | IPC broken in default mode |
| **P2** | Missing impersonation cleanup on simulation error | `sigil-dev-toolbar/src/services/simulation.ts:248-308` | Fork left in impersonated state after errors |
| **P3** | Double-counting JSX event handlers | `anchor-rust/lens/src/parser/mod.rs:90-115` | Metrics are inaccurate |

#### Architectural Issues

1. **Monolithic coupling** — Dev Toolbar bundles fork, simulation, lens, IPC, and diagnostics in one package
2. **Unclear boundaries** — Which package owns response files? Which owns validation?
3. **Missing composition** — Can't use fork service without entire toolbar

### 1.2 Vision

**"Diagnose → Understand → Build → Capture"**

A HUD that:
- **Protects flow state** — Diagnosis happens inline, not in a separate context
- **Surfaces understanding** — Connect with user truth before prescribing
- **Tightens feedback loops** — From "something's wrong" to "found the issue" faster
- **Composes cleanly** — UNIX-style packages that do one thing well

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│   DIAGNOSE                    BUILD                    CAPTURE     │
│   ─────────                   ─────                    ───────     │
│                                                                    │
│   "What's actually           "Create with             "Does this   │
│    happening?"                physics"                 feel right?"│
│                                                                    │
│   @sigil/diagnostics    →    @sigil/hud-core    →    taste.md     │
│   @sigil/fork                @sigil/simulation        observations │
│   @sigil/lens                                                      │
│                                                                    │
│   Real state.                 Apply physics.          Capture      │
│   Real data.                  Generate code.          signals.     │
│   Real context.                                                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 1.3 Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Flow state protection** | Fewer context switches during debugging | Self-report, session length |
| **Debugging cycle time** | Reduced time from "wrong" to "found it" | Timestamp analysis |
| **Feedback loop tightness** | More MODIFY signals with diagnostic context | taste.md signal richness |
| **Composition adoption** | Other projects using individual packages | npm download tracking |

---

## 2. Goals & Success Metrics

### 2.1 Primary Goals

1. **Fix critical bugs** that break current Anchor/Lens integration
2. **Establish clear package boundaries** following UNIX philosophy
3. **Enable diagnostic-first workflows** that protect flow state
4. **Tighten the feedback loop** from observation to crafting to capture

### 2.2 Non-Goals (Out of Scope)

- Full Tenderly feature parity (reverse-engineering for learning, not copying)
- Browser extension distribution (focus on npm packages first)
- Viem/Wagmi wrappers (integration patterns, not wrappers)
- Production monitoring (dev-time only)

### 2.3 Success Metrics

| Category | Metric | Target |
|----------|--------|--------|
| **Correctness** | P1 bugs resolved | 100% |
| **Architecture** | Package boundaries documented | All 6 packages |
| **Usability** | Diagnostic workflow documented | Complete |
| **Adoption** | Installable via npm | Yes |

---

## 3. User & Stakeholder Context

### 3.1 Primary Users

**All Builders** — Sigil covers building products in depth, so the HUD serves:

| Persona | Context | Needs |
|---------|---------|-------|
| **Web3 Developer** | Debugging dApp transactions | State inspection, simulation, fork management |
| **UI/UX Builder** | Iterating on feel | Physics compliance, taste capture |
| **Full-stack Builder** | End-to-end debugging | Cross-system diagnostics |

### 3.2 User Truth Questions

The HUD should help answer:
- **Who is the user?** Power user, casual, mobile, first-time?
- **What's the moment?** High stakes, routine, discovery, error?
- **What should they feel?** Trust, speed, delight, safety?

### 3.3 Flow State Protection

The HUD must **not** break flow state. This means:
- Inline diagnostics (not separate windows)
- Passive observation (not intrusive prompts)
- Quick captures (not lengthy forms)
- Clear affordances (not hidden features)

---

## 4. Functional Requirements

### 4.1 Bug Fixes (Sprint 0)

#### FR-001: Separate Anchor/Lens Response Filenames
*Priority: P1 | Source: `anchor-rust/anchor/src/io.rs:31-34`*

**Current:**
```rust
pub fn response_path(request_id: &str) -> Result<PathBuf> {
    Ok(PathBuf::from(PUB_PATH).join("responses").join(format!("{}.json", request_id)))
}
```

**Problem:** Both Anchor and Lens call this, producing collisions.

**Solution:** Include CLI name in response filename:
```
grimoires/pub/responses/anchor-<request_id>.json
grimoires/pub/responses/lens-<request_id>.json
```

**Acceptance Criteria:**
- [ ] Response paths include CLI prefix
- [ ] Existing IPC contracts updated
- [ ] No collision when both CLIs respond to same request

#### FR-002: Wire Up Lens Lint Command
*Priority: P1 | Source: `anchor-rust/lens/src/main.rs:234-242`*

**Current:**
```rust
async fn run_lint(...) -> Result<ExitCode, ...> {
    println!("Lint command not yet fully implemented.");
    Ok(ExitCode::SUCCESS)
}
```

**Problem:** Command exists but does nothing.

**Solution:** Either:
- a) Implement real linting using tree-sitter metrics, or
- b) Remove the command and document `lens verify` as the alternative

**Acceptance Criteria:**
- [ ] `lens lint` either works or doesn't exist
- [ ] Documentation matches reality

#### FR-003: Write Verify Responses for All Output Modes
*Priority: P2 | Source: `anchor-rust/lens/src/main.rs:168-180`*

**Current:** Only writes response file when `output_format == "json"`

**Problem:** IPC clients expecting responses don't get them in text mode.

**Solution:** Always write response file when `request_id` is provided:
```rust
// Always write response if request_id was provided (for IPC)
if !req_id.is_empty() {
    io::write_response(&req_id, &response)?;
}

// Then format output for human
match output_format { ... }
```

**Acceptance Criteria:**
- [ ] Response file written regardless of output format
- [ ] IPC works in both text and json modes

#### FR-004: Fix Double-Counting JSX Event Handlers
*Priority: P3 | Source: `anchor-rust/lens/src/parser/mod.rs:90-115`*

**Current:** Handlers counted in both `jsx_opening_element` and `jsx_attribute` branches.

**Solution:** Count only in one location (prefer `jsx_attribute` for granularity).

**Acceptance Criteria:**
- [ ] Event handlers counted exactly once
- [ ] Test cases verify correct counting

#### FR-005: Fix Conditional Hook Call in UserLens
*Priority: P1 | Source: `sigil-dev-toolbar/src/components/UserLens.tsx:130`*

**Current:**
```tsx
{isImpersonating && (
  <div className="sigil-user-lens__active">
    ...
    <code className="sigil-user-lens__address">
      {useDevToolbar().userLens.impersonatedAddress}  // Hook inside conditional!
    </code>
  </div>
)}
```

**Problem:** `useDevToolbar()` is called inside a conditional JSX block. When `isImpersonating` changes from `true` to `false`, the hook disappears, violating React's rules of hooks and triggering "Rendered fewer hooks than expected" runtime error.

**Solution:** Extract the hook value at component top level (already done at line 34), then use that value in the conditional render:
```tsx
const { userLens } = useDevToolbar()  // Top level, always called
// ...
{isImpersonating && (
  <code>{userLens.impersonatedAddress}</code>  // Use extracted value
)}
```

**Acceptance Criteria:**
- [ ] All hooks called unconditionally at component top level
- [ ] Component toggles impersonation without crashing
- [ ] No React hooks warnings in console

#### FR-006: Ensure Impersonation Cleanup on Simulation Error
*Priority: P2 | Source: `sigil-dev-toolbar/src/services/simulation.ts:248-308`*

**Current:**
```typescript
try {
  await forkService.impersonateAccount(tx.from)  // Line 250
  // ... simulation logic ...
  await forkService.stopImpersonating(tx.from)   // Line 296 - only in try block
} catch (error) {
  // NO cleanup - fork left impersonating!
}
```

**Problem:** If `eth_sendTransaction` or receipt polling throws, execution jumps to catch block and never calls `stopImpersonating()`. This leaves the fork node impersonating the sender, causing subsequent simulations/requests to run with unintended permissions.

**Solution:** Move cleanup to `finally` block to guarantee execution:
```typescript
try {
  await forkService.impersonateAccount(tx.from)
  // ... simulation logic ...
} catch (error) {
  // ... error handling ...
} finally {
  // Always cleanup impersonation
  await forkService.stopImpersonating(tx.from)
}
```

**Acceptance Criteria:**
- [ ] `stopImpersonating` called in finally block or both try and catch paths
- [ ] Failed simulations don't leave fork in impersonated state
- [ ] Test case verifies cleanup on error

### 4.2 Package Architecture (Sprint 1)

#### FR-010: Composable Package Structure

Split current monolith into UNIX-style packages:

| Package | Responsibility | Dependencies |
|---------|----------------|--------------|
| `@sigil/anchor` | Ground truth validation, warden | None |
| `@sigil/fork` | Fork management, snapshots, anvil/tenderly | None |
| `@sigil/simulation` | Transaction simulation, dry-run | `@sigil/fork` |
| `@sigil/lens` | Address impersonation, user lens | None |
| `@sigil/diagnostics` | Physics compliance, issue detection | `@sigil/anchor` |
| `@sigil/hud` | React components, composition layer | All above (optional) |

**Acceptance Criteria:**
- [ ] Each package installable independently
- [ ] Clear public APIs documented
- [ ] HUD can compose any subset of packages

#### FR-011: IPC Protocol Specification

Define clear IPC contract between CLI tools and browser packages:

```typescript
// Request structure
interface IPCRequest {
  id: string
  type: 'lens:validate' | 'anchor:verify' | 'fork:snapshot' | ...
  payload: unknown
  timestamp: number
}

// Response structure
interface IPCResponse<T> {
  id: string
  status: 'success' | 'error'
  data?: T
  error?: { code: string; message: string }
  timestamp: number
}

// File locations
grimoires/pub/requests/<request_id>.json
grimoires/pub/responses/<cli>-<request_id>.json
```

**Acceptance Criteria:**
- [ ] Protocol documented in shared location
- [ ] TypeScript types published in each package
- [ ] Response filename convention enforced

### 4.3 Diagnostic-First HUD (Sprint 2)

#### FR-020: Inline Diagnostics Panel

A non-intrusive panel that shows:
- Current physics analysis for focused component
- Data source indicators (on-chain, indexed, cached)
- Potential issues detected
- Quick actions (capture observation, record signal)

**Flow State Protection:**
- Panel is passive (shows info, doesn't prompt)
- Keyboard shortcut to toggle visibility
- Remembers position and state

#### FR-021: State Source Tracing

For every displayed value, show its source:
```
Balance: 100 HONEY
└─ source: on-chain (block 19234567)
   staleness: 2 blocks

History: [...]
└─ source: indexed (envio)
   staleness: 45 seconds
```

**Acceptance Criteria:**
- [ ] Every value has traceable source
- [ ] Staleness displayed when relevant
- [ ] User can drill into source details

#### FR-022: Observation Capture

Quick capture of user truth observations:
```
[Cmd+Shift+O] → Quick observation capture
  └─ "User hesitated before clicking claim"
  └─ Tags: [uncertainty], [financial]
  └─ Screenshot: auto-attached
```

Stored in `grimoires/sigil/observations/` with structured metadata.

**Acceptance Criteria:**
- [ ] One-keystroke capture
- [ ] Auto-attaches screenshot if possible
- [ ] Tags suggested from physics context

#### FR-023: Feedback Loop Integration

Connect diagnostics to taste.md signals:
- When issue detected → offer to create MODIFY signal
- When observation captured → link to affected components
- When component crafted → show diagnostic diff

---

## 5. Technical & Non-Functional Requirements

### 5.1 Architecture Principles

1. **UNIX Philosophy** — Each package does one thing well
2. **Composition over inheritance** — HUD composes packages, doesn't extend them
3. **File-based IPC** — No servers, just file watchers
4. **Progressive enhancement** — HUD works without all packages

### 5.2 Package Dependencies

```
@sigil/hud
├── @sigil/diagnostics (optional)
│   └── @sigil/anchor
├── @sigil/simulation (optional)
│   └── @sigil/fork
└── @sigil/lens (optional)
```

Each dependency is optional — HUD gracefully degrades.

### 5.3 Performance Requirements

| Metric | Target |
|--------|--------|
| HUD initial render | <100ms |
| Diagnostic update | <50ms |
| IPC round-trip | <200ms |
| Package bundle size | <50KB each |

### 5.4 Compatibility

- React 18+
- Viem 2.x, Wagmi 2.x
- Node 18+
- TypeScript 5.x

---

## 6. Scope & Prioritization

### 6.1 Sprint 0: Bug Fixes (Immediate)

| Task | Priority | Effort |
|------|----------|--------|
| FR-001: Response filename collision | P1 | Small |
| FR-002: Lint command stub | P1 | Medium |
| FR-005: Conditional hook call in UserLens | P1 | Small |
| FR-003: Verify response persistence | P2 | Small |
| FR-006: Impersonation cleanup on error | P2 | Small |
| FR-004: Double-counting fix | P3 | Small |

### 6.2 Sprint 1: Package Architecture

| Task | Priority | Effort |
|------|----------|--------|
| FR-010: Split into packages | P1 | Large |
| FR-011: IPC protocol spec | P1 | Medium |
| Package documentation | P2 | Medium |

### 6.3 Sprint 2: Diagnostic HUD

| Task | Priority | Effort |
|------|----------|--------|
| FR-020: Inline diagnostics | P1 | Large |
| FR-021: State source tracing | P2 | Medium |
| FR-022: Observation capture | P2 | Medium |
| FR-023: Feedback loop integration | P3 | Medium |

### 6.4 Future Sprints (Not in Scope)

- Tenderly-style trace visualization
- Viem/Wagmi hook integrations
- Browser extension packaging
- Production monitoring mode

---

## 7. Risks & Dependencies

### 7.1 Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Package split increases complexity | Medium | Medium | Strong documentation, clear APIs |
| IPC protocol breaks existing flows | Low | High | Backward-compatible versioning |
| HUD performance issues | Low | Medium | Bundle size budget, lazy loading |

### 7.2 Dependencies

| Dependency | Status | Owner |
|------------|--------|-------|
| Anchor Rust codebase | Exists | @sigil |
| Dev Toolbar codebase | Exists | @sigil |
| Loa framework | Stable | @loa |

### 7.3 Open Questions

1. Should `@sigil/hud` be the entry point or should users compose manually?
2. How to handle package versioning across the suite?
3. Should diagnostics run continuously or on-demand?

---

## 8. Appendix

### 8.1 Source Tracing

| Requirement | Source |
|-------------|--------|
| Response file collision | PR feedback, `anchor-rust/anchor/src/io.rs:31-34` |
| Lint stub | PR feedback, `anchor-rust/lens/src/main.rs:234-242` |
| Conditional hook call | PR feedback, `sigil-dev-toolbar/src/components/UserLens.tsx:130` |
| Verify response persistence | PR feedback, `anchor-rust/lens/src/main.rs:168-180` |
| Impersonation cleanup | PR feedback, `sigil-dev-toolbar/src/services/simulation.ts:248-308` |
| Double-counting | PR feedback, `anchor-rust/lens/src/parser/mod.rs:90-115` |
| UNIX philosophy | User interview response |
| Diagnostic-first | User interview: "diagnose before prescribing" |
| Flow state protection | User interview: "protecting flow state" |
| Sigil HUD naming | User interview: "should evolve into a Sigil HUD" |

### 8.2 User Interview Summary

**Date:** 2026-01-20
**Method:** /plan-and-analyze discovery questions

**Key Quotes:**
- "Being clearer with boundaries UNIX philosophy style"
- "Focus on diagnostics when it comes to focusing on clearly diagnosing before prescribing"
- "Protecting flow state and the responsibilities of humans within this workflow"
- "We connect with other humans to diagnose and understand root intention so that we can be more educated on what to prescribe"
- "As an artist/craftsman it's common/natural to instantly prescribe"

**Derived Insights:**
1. Architecture must follow UNIX philosophy (composable packages)
2. HUD must protect flow state (non-intrusive, inline)
3. Diagnosis must precede prescription (observation before crafting)
4. Feedback loops must be tight (diagnose → build → capture)

### 8.3 Related Documents

- `packages/sigil-dev-toolbar/src/index.ts` — Current toolbar exports
- `.claude/docs/skill-authoring.md` — Skill authoring patterns
- `.claude/rules/06-sigil-taste.md` — Taste signal schema
- `README.md` — Sigil architecture overview

---

*PRD generated via Loa /plan-and-analyze command. Source tracing enabled.*
