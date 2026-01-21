# Sprint Plan: Sigil /craft Optimization & Dev Toolbar

**Version:** 1.0.0
**Created:** 2026-01-20
**Team:** Solo Developer
**Sprint Duration:** 1 week
**PRD:** `grimoires/loa/prd-craft-optimization.md` v1.1.0
**SDD:** `grimoires/loa/sdd-craft-optimization.md` v1.0.0

---

## Overview

### Goals

Transform the `/craft` command from a 32k token monolith to a mode-based system with ~3k tokens per invocation, and integrate the Dev Toolbar with Anchor/Lens verification backbone.

### Timeline

| Phase | Sprints | Focus |
|-------|---------|-------|
| **MVP** | 1-2 | craft.md split, RLM extensions, ck integration |
| **Phase 2** | 3-4 | User Lens, Anchor LensContext, Diagnostics |
| **Phase 3** | 5-6 | Agent Simulation, State Comparison, Docs |

### Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| /craft tokens (cold) | ~32,000 | < 4,000 |
| /craft tokens (continuation) | ~32,000 | < 2,500 |
| Mode selection accuracy | N/A | > 95% |
| User Lens latency | N/A | < 100ms |

---

## Sprint 1: craft.md Split Foundation

**Duration:** 1 week
**Goal:** Extract content from craft.md into mode files and create index.yaml routing

### Tasks

#### S1-T1: Create Directory Structure
**Priority:** P0
**Effort:** 1 hour

**Description:**
Create the crafting-physics skill directory structure.

**Acceptance Criteria:**
- [ ] `.claude/skills/crafting-physics/` directory created
- [ ] `modes/` subdirectory created
- [ ] `fragments/` subdirectory created
- [ ] Empty `index.yaml` created

**Testing:**
```bash
ls -la .claude/skills/crafting-physics/
# Should show: index.yaml, modes/, fragments/
```

---

#### S1-T2: Extract Chisel Mode (Default)
**Priority:** P0
**Effort:** 4 hours
**Dependencies:** S1-T1

**Description:**
Extract single-component workflow from craft.md into `modes/chisel.md`. This is the default mode for most /craft invocations.

**Content to extract:**
- Physics analysis step
- Effect detection algorithm
- Single-file generation flow
- Protected capabilities check
- Feedback collection step

**Acceptance Criteria:**
- [ ] `modes/chisel.md` created with ~2,000 tokens
- [ ] Contains complete single-component workflow
- [ ] Fragment placeholders: `{{fragment:physics-table}}`, `{{fragment:protected-caps}}`
- [ ] Token budget declared at bottom: `<!-- Token budget: 2,500 -->`
- [ ] No references to multi-file or batch operations

**Testing:**
- Manual: Read through chisel.md, verify complete workflow
- Token count: `wc -w modes/chisel.md` should be ~1,500-2,500 words

---

#### S1-T3: Extract Hammer Mode (Multi-file)
**Priority:** P1
**Effort:** 3 hours
**Dependencies:** S1-T1

**Description:**
Extract multi-file/batch workflow from craft.md into `modes/hammer.md`. Used for autonomous batch operations and refactoring.

**Content to extract:**
- Multi-file generation flow
- Batch operation patterns
- Cross-file consistency checks
- Autonomous decision making guidelines

**Acceptance Criteria:**
- [ ] `modes/hammer.md` created with ~3,300 tokens
- [ ] Contains multi-file workflow
- [ ] Fragment placeholders for physics-table, protected-caps
- [ ] Token budget declared: `<!-- Token budget: 4,000 -->`
- [ ] Clear triggers documented (multi-file, batch, refactor)

---

#### S1-T4: Extract Debug Mode (Diagnostic)
**Priority:** P1
**Effort:** 3 hours
**Dependencies:** S1-T1

**Description:**
Extract diagnostic and loop-recovery content from craft.md into `modes/debug.md`. Activated on iteration 3+ or explicit debug keywords.

**Content to extract:**
- Loop detection algorithm
- Escalation protocols
- Diagnostic questions
- Recovery strategies
- Feedback loop analysis

**Acceptance Criteria:**
- [ ] `modes/debug.md` created with ~3,000 tokens
- [ ] Contains loop detection and recovery
- [ ] Contains diagnostic framework
- [ ] Token budget declared: `<!-- Token budget: 3,600 -->`
- [ ] Triggers: iteration >= 3, "debug", "diagnose", "not working"

---

#### S1-T5: Create SKILL.md (Quick Reference)
**Priority:** P0
**Effort:** 2 hours
**Dependencies:** S1-T1

**Description:**
Create minimal quick reference for simple edits that don't need full physics analysis.

**Content:**
- When to use (1-3 line fixes)
- Quick action protocol
- Skip physics analysis conditions
- Direct edit guidance

**Acceptance Criteria:**
- [ ] `SKILL.md` created with ~500 tokens
- [ ] Covers quick fixes without physics
- [ ] Token budget declared: `<!-- Token budget: 500 -->`
- [ ] Clear routing to other modes when needed

---

#### S1-T6: Extract Fragments
**Priority:** P0
**Effort:** 2 hours
**Dependencies:** S1-T1

**Description:**
Extract reusable content blocks into fragment files.

**Fragments to create:**
1. `fragments/physics-table.md` - Effect → Physics mapping table (~400 tokens)
2. `fragments/protected-caps.md` - Protected capabilities checklist (~300 tokens)
3. `fragments/feedback-loop.md` - Taste signal collection (~250 tokens)
4. `fragments/detection.md` - Effect detection algorithm (~350 tokens)

**Acceptance Criteria:**
- [ ] All 4 fragment files created
- [ ] Each fragment is self-contained
- [ ] Token count per fragment documented
- [ ] Fragments use consistent markdown structure

---

#### S1-T7: Create index.yaml
**Priority:** P0
**Effort:** 2 hours
**Dependencies:** S1-T2, S1-T3, S1-T4, S1-T5, S1-T6

**Description:**
Create the mode routing configuration.

**Acceptance Criteria:**
- [ ] `index.yaml` defines all 4 modes (quick, chisel, hammer, debug)
- [ ] Each mode has: name, tier, file, triggers, fragments list
- [ ] Token budgets declared per mode
- [ ] Continuation skip rules defined
- [ ] Fragment definitions with inline flag

**Testing:**
```bash
# Validate YAML syntax
yq eval '.' .claude/skills/crafting-physics/index.yaml
```

---

### Sprint 1 Deliverables

| Deliverable | Path | Tokens |
|-------------|------|--------|
| SKILL.md | `.claude/skills/crafting-physics/SKILL.md` | ~500 |
| chisel.md | `.claude/skills/crafting-physics/modes/chisel.md` | ~2,500 |
| hammer.md | `.claude/skills/crafting-physics/modes/hammer.md` | ~4,000 |
| debug.md | `.claude/skills/crafting-physics/modes/debug.md` | ~3,600 |
| physics-table.md | `.claude/skills/crafting-physics/fragments/physics-table.md` | ~400 |
| protected-caps.md | `.claude/skills/crafting-physics/fragments/protected-caps.md` | ~300 |
| feedback-loop.md | `.claude/skills/crafting-physics/fragments/feedback-loop.md` | ~250 |
| detection.md | `.claude/skills/crafting-physics/fragments/detection.md` | ~350 |
| index.yaml | `.claude/skills/crafting-physics/index.yaml` | ~200 |

---

## Sprint 2: Mode Routing & RLM Extensions

**Duration:** 1 week
**Goal:** Implement mode selection algorithm and RLM extension system

### Tasks

#### S2-T1: Implement Mode Selection Logic
**Priority:** P0
**Effort:** 4 hours
**Dependencies:** Sprint 1 complete

**Description:**
Update the skill loader to select modes based on triggers.

**Implementation:**
- Parse user input for trigger keywords
- Check session state for iteration count
- Select highest-priority matching mode
- Fall back to chisel (default)

**Acceptance Criteria:**
- [ ] Mode selection algorithm implemented
- [ ] Debug mode triggers on iteration >= 3
- [ ] Hammer mode triggers on multi-file keywords
- [ ] Quick mode triggers on simple edit keywords
- [ ] Chisel mode used as default

**Testing:**
| Input | Expected Mode |
|-------|---------------|
| "fix typo" | quick |
| "create claim button" | chisel |
| "refactor all buttons" | hammer |
| "not working, help" | debug |
| (iteration 3+) | debug |

---

#### S2-T2: Implement Fragment Embedding
**Priority:** P0
**Effort:** 3 hours
**Dependencies:** S2-T1

**Description:**
Implement `{{fragment:name}}` template syntax replacement.

**Implementation:**
- Scan mode file for `{{fragment:name}}` patterns
- Load referenced fragment from fragments/
- Replace placeholder with fragment content
- Track loaded fragments in session state

**Acceptance Criteria:**
- [ ] `{{fragment:name}}` syntax works
- [ ] Multiple fragments can be embedded
- [ ] Fragment content is properly indented
- [ ] Missing fragments produce clear error

---

#### S2-T3: Implement Skip-on-Continuation
**Priority:** P1
**Effort:** 2 hours
**Dependencies:** S2-T2

**Description:**
Skip already-loaded fragments on continuation to save tokens.

**Implementation:**
- Track loaded fragments in session state
- On continuation, check if fragment already loaded
- Skip loading if already present
- Always load feedback-loop (needed for signals)

**Acceptance Criteria:**
- [ ] Fragment loading tracked in session state
- [ ] Continuation skips already-loaded fragments
- [ ] ~40% token reduction on continuations
- [ ] feedback-loop always loaded

---

#### S2-T4: Add RLM Extension Path
**Priority:** P1
**Effort:** 3 hours
**Dependencies:** None

**Description:**
Add extension path configuration to index.yaml for project-specific rules.

**Implementation:**
- Add `extensions` section to `.claude/rules/index.yaml`
- Define schema for extension frontmatter
- Implement glob-based discovery
- Set priority ordering (core > extensions)

**Acceptance Criteria:**
- [ ] `grimoires/sigil/rules/*.md` auto-discovered
- [ ] `.claude/overrides/*.md` supported
- [ ] Extension priority (5) lower than core (1-4)
- [ ] Schema validation for extension frontmatter

---

#### S2-T5: Add ck Detection Script
**Priority:** P1
**Effort:** 2 hours
**Dependencies:** None

**Description:**
Create search abstraction layer that detects ck availability and falls back to grep.

**Implementation:**
- Check for ck binary at session start
- Set SIGIL_SEARCH environment variable
- Implement search() function with both backends
- Ensure identical output format

**Acceptance Criteria:**
- [ ] ck detection works
- [ ] Graceful fallback to grep
- [ ] Search results have consistent format
- [ ] Tool choice never mentioned to user

---

#### S2-T6: Integration Testing
**Priority:** P0
**Effort:** 4 hours
**Dependencies:** S2-T1, S2-T2, S2-T3

**Description:**
Test the complete mode-based /craft workflow.

**Test Cases:**
1. Quick mode: Simple typo fix
2. Chisel mode: New financial button
3. Hammer mode: Batch refactor
4. Debug mode: Third iteration of same component
5. Continuation: Verify fragment skipping

**Acceptance Criteria:**
- [ ] All 5 test cases pass
- [ ] Token counts within budget
- [ ] No regressions from original craft.md
- [ ] Feedback signals logged correctly

---

### Sprint 2 Deliverables

| Deliverable | Description |
|-------------|-------------|
| Mode selection | Algorithm selects correct mode |
| Fragment embedding | `{{fragment:name}}` works |
| Skip-on-continuation | ~40% token savings |
| RLM extensions | Project rules auto-discovered |
| ck detection | Search with graceful fallback |

---

## Sprint 3: Dev Toolbar Foundation

**Duration:** 1 week
**Goal:** Create @sigil/dev-toolbar package with User Lens

### Tasks

#### S3-T1: Initialize Package
**Priority:** P0
**Effort:** 2 hours

**Description:**
Create the @sigil/dev-toolbar package with proper structure.

**Acceptance Criteria:**
- [ ] `packages/sigil-dev-toolbar/` directory created
- [ ] `package.json` with dependencies (react, wagmi, viem)
- [ ] `tsconfig.json` configured
- [ ] Basic `src/index.ts` exports

---

#### S3-T2: Create DevToolbarProvider
**Priority:** P0
**Effort:** 4 hours
**Dependencies:** S3-T1

**Description:**
Implement the main context provider for toolbar state.

**Implementation:**
- UserLens state management
- Simulation toggle state
- Comparison toggle state
- IPC functions for Anchor/Lens
- Taste logging function

**Acceptance Criteria:**
- [ ] `DevToolbarProvider` component created
- [ ] `useDevToolbar()` hook works
- [ ] All state properly managed
- [ ] IPC functions implemented (stubbed)

---

#### S3-T3: Implement User Lens Component
**Priority:** P0
**Effort:** 6 hours
**Dependencies:** S3-T2

**Description:**
Create the User Lens panel for address impersonation.

**Features:**
- Address input with validation
- ENS resolution support
- Quick-select for saved addresses
- Visual badge when active
- Enable/disable toggle

**Acceptance Criteria:**
- [ ] Address input validates 0x format
- [ ] ENS names resolve to addresses
- [ ] Saved addresses persist
- [ ] Visual indicator when impersonating
- [ ] Clear "Lens Active" badge

---

#### S3-T4: Create useLensAwareAccount Hook
**Priority:** P0
**Effort:** 3 hours
**Dependencies:** S3-T2

**Description:**
Hook that returns impersonated address for reads, real address for writes.

**Implementation:**
```typescript
function useLensAwareAccount() {
  const { address: realAddress } = useAccount()
  const { userLens } = useDevToolbar()

  return {
    address: userLens.enabled ? userLens.impersonatedAddress : realAddress,
    realAddress,
    isImpersonating: userLens.enabled,
  }
}
```

**Acceptance Criteria:**
- [ ] Returns impersonated address when lens enabled
- [ ] Returns real address when lens disabled
- [ ] `realAddress` always available for signing
- [ ] `isImpersonating` flag works

---

#### S3-T5: Create Toolbar Shell UI
**Priority:** P1
**Effort:** 3 hours
**Dependencies:** S3-T1

**Description:**
Create the collapsible toolbar container with panel tabs.

**Features:**
- Floating toolbar in dev mode
- Tab navigation (Lens | Simulate | Compare | Diagnose)
- Collapse/expand toggle
- Dev-only rendering (hidden in production)

**Acceptance Criteria:**
- [ ] Toolbar renders only in development
- [ ] Tab switching works
- [ ] Collapse/expand works
- [ ] Styled appropriately (dark theme)

---

### Sprint 3 Deliverables

| Deliverable | Path |
|-------------|------|
| Package | `packages/sigil-dev-toolbar/` |
| DevToolbarProvider | `src/providers/DevToolbarProvider.tsx` |
| UserLens | `src/components/UserLens.tsx` |
| useLensAwareAccount | `src/hooks/useUserLens.ts` |
| Toolbar Shell | `src/components/DevToolbar.tsx` |

---

## Sprint 4: Anchor LensContext Integration

**Duration:** 1 week
**Goal:** Extend Anchor to validate LensContext, connect Toolbar to verification

### Tasks

#### S4-T1: Add LensContext to Anchor Request
**Priority:** P0
**Effort:** 3 hours

**Description:**
Extend Anchor's request schema with LensContext struct.

**Implementation:**
```rust
pub struct LensContext {
    pub impersonated_address: String,
    pub component: String,
    pub observed_value: Option<String>,
    pub on_chain_value: Option<String>,
    pub indexed_value: Option<String>,
}
```

**Acceptance Criteria:**
- [ ] `LensContext` struct added to `request.rs`
- [ ] `ValidateZonePayload` has optional `lens_context` field
- [ ] Serialization/deserialization works
- [ ] Backward compatible (field is optional)

**Testing:**
```bash
cargo test -p sigil-anchor
```

---

#### S4-T2: Implement LensValidator
**Priority:** P0
**Effort:** 4 hours
**Dependencies:** S4-T1

**Description:**
Create validation rules for LensContext data source checks.

**Rules:**
1. `data_source_mismatch`: observed != on_chain
2. `stale_indexed_data`: indexed != on_chain
3. `lens_financial_check`: Financial zone using indexed source

**Acceptance Criteria:**
- [ ] `LensValidator` struct with `validate()` method
- [ ] All 3 rules implemented
- [ ] Severity varies by zone (Critical = Error, others = Warning)
- [ ] Suggested fixes included in output

---

#### S4-T3: Extend Anchor Response with lens_issues
**Priority:** P0
**Effort:** 2 hours
**Dependencies:** S4-T2

**Description:**
Add `lens_issues` array to validation response.

**Acceptance Criteria:**
- [ ] `ValidateZoneResult` has `lens_issues: Vec<LensValidationIssue>`
- [ ] Exit code 11 for lens warnings
- [ ] Exit code 10 for lens errors (Critical zone)
- [ ] Response serializes correctly

---

#### S4-T4: Integrate validate Command
**Priority:** P0
**Effort:** 3 hours
**Dependencies:** S4-T2, S4-T3

**Description:**
Update `anchor validate` command to run LensValidator when lens_context present.

**Implementation:**
- Check if `lens_context` present in request
- Run LensValidator if present
- Merge lens_issues into response
- Set appropriate exit code

**Acceptance Criteria:**
- [ ] `anchor validate` runs lens validation
- [ ] Exit codes correct for all scenarios
- [ ] Response includes lens_issues
- [ ] Works with and without lens_context

---

#### S4-T5: Create IPC Client in Toolbar
**Priority:** P0
**Effort:** 4 hours
**Dependencies:** S4-T4, S3-T2

**Description:**
Implement pub/ directory IPC from toolbar to Anchor/Lens.

**Implementation:**
- Write request to `grimoires/pub/requests/{uuid}.json`
- Invoke CLI (anchor validate, lens verify)
- Read response from `grimoires/pub/responses/{uuid}-{cli}.json`
- Parse and return response

**Acceptance Criteria:**
- [ ] Request writing works
- [ ] CLI invocation works (stubbed for browser env)
- [ ] Response reading works
- [ ] Error handling for missing responses

---

#### S4-T6: Create Diagnostic Panel
**Priority:** P1
**Effort:** 4 hours
**Dependencies:** S4-T5

**Description:**
Implement the Diagnostic Framework panel (query-first approach).

**Features:**
- Auto-query on-chain state for user address
- Separate "Verified" vs "Ask User" sections
- Display discrepancies from Anchor response
- Suggested questions for user

**Acceptance Criteria:**
- [ ] Auto-queries balance, deposits, shares
- [ ] Displays verified vs ask separation
- [ ] Shows Anchor lens_issues in UI
- [ ] Generates diagnostic questions

---

### Sprint 4 Deliverables

| Deliverable | Description |
|-------------|-------------|
| LensContext | Added to Anchor request schema |
| LensValidator | 3 validation rules implemented |
| lens_issues | Response includes lens validation results |
| IPC Client | Toolbar can communicate with Anchor/Lens |
| Diagnostic Panel | Query-first diagnostics UI |

---

## Sprint 5: Agent Simulation

**Duration:** 1 week
**Goal:** Transaction dry-run simulation without real funds

### Tasks

#### S5-T1: Fork Chain State Integration
**Priority:** P0
**Effort:** 6 hours

**Description:**
Integrate with Anvil/Tenderly for chain state forking.

**Implementation:**
- Connect to fork URL (configurable)
- Fork at current block
- Maintain fork state during session
- Reset fork on demand

**Acceptance Criteria:**
- [ ] Fork URL configurable in provider
- [ ] Fork creation works
- [ ] Fork state persists during session
- [ ] Reset functionality works

---

#### S5-T2: Transaction Simulation
**Priority:** P0
**Effort:** 6 hours
**Dependencies:** S5-T1

**Description:**
Execute transactions against fork and capture results.

**Implementation:**
- Take TransactionRequest input
- Execute on fork
- Capture state changes, gas, logs
- Parse revert reasons if failed

**Acceptance Criteria:**
- [ ] Transaction executes on fork
- [ ] Gas used/estimated captured
- [ ] State changes captured
- [ ] Revert reasons parsed

---

#### S5-T3: Simulation Result UI
**Priority:** P0
**Effort:** 4 hours
**Dependencies:** S5-T2

**Description:**
Display simulation results in toolbar panel.

**Features:**
- Success/failure indicator
- Gas estimate
- State changes diff
- Balance deltas
- Event logs (decoded if ABI available)

**Acceptance Criteria:**
- [ ] Clear success/failure display
- [ ] Gas shown with USD estimate
- [ ] State changes in diff format
- [ ] Balance deltas highlighted
- [ ] Events decoded when possible

---

#### S5-T4: useTransactionSimulation Hook
**Priority:** P0
**Effort:** 3 hours
**Dependencies:** S5-T2

**Description:**
Create hook for easy simulation integration.

**API:**
```typescript
const { result, isSimulating, error, simulate } = useTransactionSimulation({
  to: '0x...',
  data: '0x...',
  value: 0n,
})
```

**Acceptance Criteria:**
- [ ] Hook accepts TransactionRequest
- [ ] Returns simulation result
- [ ] Loading state works
- [ ] Error handling works

---

### Sprint 5 Deliverables

| Deliverable | Description |
|-------------|-------------|
| Fork integration | Anvil/Tenderly chain forking |
| Simulation engine | Transaction dry-run |
| Result UI | Visual display of simulation |
| useTransactionSimulation | Developer hook |

---

## Sprint 6: State Comparison & Documentation

**Duration:** 1 week
**Goal:** State diff view and skill authoring documentation

### Tasks

#### S6-T1: State Comparison Component
**Priority:** P1
**Effort:** 6 hours

**Description:**
Side-by-side comparison of app state.

**Features:**
- React Query cache diff
- Data source tracing (indexed vs on-chain)
- Discrepancy highlighting
- Export as JSON

**Acceptance Criteria:**
- [ ] Side-by-side view works
- [ ] Discrepancies highlighted
- [ ] Data source shown for each value
- [ ] Export to JSON works

---

#### S6-T2: Extend taste.md Schema
**Priority:** P1
**Effort:** 2 hours

**Description:**
Add toolbar-specific fields to taste.md signals.

**New fields:**
- `lens_context`: Impersonation state when signal captured
- `screenshot_ref`: Path to screenshot if captured
- `source: toolbar`: Distinguish from CLI signals

**Acceptance Criteria:**
- [ ] `lens_context` field documented
- [ ] `screenshot_ref` field documented
- [ ] `source` can be "cli" or "toolbar"
- [ ] Example signals updated

---

#### S6-T3: Create skill-authoring.md
**Priority:** P2
**Effort:** 6 hours

**Description:**
Write comprehensive skill authoring guide.

**Sections:**
1. Progressive Disclosure Pattern
2. Mode Architecture
3. RLM Integration
4. Context Management
5. Quality Gates
6. Feedback Loops

**Acceptance Criteria:**
- [ ] All 6 sections written
- [ ] Examples from /oracle-analyze included
- [ ] Fragment system documented
- [ ] Checklist for new skill authors
- [ ] Token budget guidance

---

#### S6-T4: Update README and CHANGELOG
**Priority:** P2
**Effort:** 2 hours

**Description:**
Document new features in public-facing docs.

**Updates:**
- README: Add Dev Toolbar section
- CHANGELOG: Add v2.0.0 entry
- README: Update architecture diagram

**Acceptance Criteria:**
- [ ] README has Toolbar section
- [ ] CHANGELOG documents all changes
- [ ] Architecture diagram updated

---

### Sprint 6 Deliverables

| Deliverable | Description |
|-------------|-------------|
| State Comparison | Side-by-side diff UI |
| taste.md extensions | Toolbar-specific fields |
| skill-authoring.md | Skill writing guide |
| Documentation updates | README, CHANGELOG |

---

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| craft.md split breaks flows | High | Medium | Comprehensive testing, keep original as fallback |
| Mode selection inaccurate | Medium | Low | Start with conservative triggers, tune based on usage |
| IPC latency too high | Medium | Low | File-based IPC is fast, can optimize if needed |
| Simulation accuracy | Medium | Medium | Clear "simulation only" warnings |
| Toolbar bundle size | Low | Medium | Tree-shaking, lazy loading |

---

## Dependencies

| Dependency | Sprint | Status |
|------------|--------|--------|
| Anchor/Lens CLIs | All | Complete (v1.0.0) |
| RLM index.yaml | 2 | Stable |
| ck CLI | 2 | Optional (fallback exists) |
| Anvil | 5 | External, stable |
| wagmi v2 | 3-6 | Required for toolbar |

---

## Success Criteria

### MVP (End of Sprint 2)

- [ ] /craft uses < 4,000 tokens in chisel mode
- [ ] Mode selection works correctly for all input types
- [ ] Fragment embedding and skip-on-continuation working
- [ ] RLM extensions discoverable from grimoires/sigil/rules/
- [ ] ck detection with grep fallback

### Phase 2 (End of Sprint 4)

- [ ] User Lens enables address impersonation
- [ ] Anchor validates LensContext
- [ ] Toolbar displays Anchor/Lens results
- [ ] Diagnostic Framework queries before asking

### Phase 3 (End of Sprint 6)

- [ ] Transaction simulation works on fork
- [ ] State Comparison shows discrepancies
- [ ] skill-authoring.md documentation complete
- [ ] All features documented in README/CHANGELOG

---

## Next Steps

After sprint plan approval:

```bash
/implement sprint-1
```

The implement command will:
1. Read this sprint plan
2. Start with S1-T1 (directory structure)
3. Track progress in this file
4. Mark tasks complete as finished
