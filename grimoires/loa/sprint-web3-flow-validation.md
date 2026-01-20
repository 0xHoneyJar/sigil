# Web3 Flow Validation - Sprint Plan

```
    ╔═══════════════════════════════════════════════════════════╗
    ║  SPRINT PLAN                                              ║
    ║  Web3 Flow Validation v2.0                                ║
    ║                                                           ║
    ║  "RLM-first architecture for iterative debugging"         ║
    ╚═══════════════════════════════════════════════════════════╝
```

**Version**: 1.0.0
**Created**: 2026-01-20
**Status**: Sprint 2 Complete
**PRD Reference**: `grimoires/loa/prd-web3-flow-validation.md` v2.0.0
**SDD Reference**: `grimoires/loa/sdd-web3-flow-validation.md` v1.0.0

---

## Sprint Overview

### Goals

Enable iterative debugging of web3 flows by reducing `/craft` context consumption from ~10k tokens to ~2k tokens, enabling 10+ iterations per session instead of the current 2-3.

### Sprint Structure

| Sprint | Focus | Duration | Priority |
|--------|-------|----------|----------|
| Sprint 1 | RLM Core Infrastructure | 5 days | P0 (Critical) |
| Sprint 2 | Data Physics Rules | 3 days | P0 (Critical) |
| Sprint 3 | Diagnostics & Escalation | 4 days | P1 (High) |
| Sprint 4 | Blockchain Inspector Skill | 3 days | P1 (High) |

**Total Duration**: 15 days

### Success Criteria

| Metric | Current | Target | Sprint |
|--------|---------|--------|--------|
| Tokens per /craft | ~10k | ~2k | Sprint 1 |
| Max iterations/session | 2-3 | 10+ | Sprint 1 |
| Web3 pattern guidance | None | Automatic | Sprint 2 |
| Debug loop detection | None | 3 iterations | Sprint 3 |
| On-chain diagnostics | None | Full read access | Sprint 4 |

---

## Sprint 1: RLM Core Infrastructure

**Goal**: Reduce /craft context consumption from ~10k to ~2k tokens through Retrieval-Localized Memory.

**Duration**: 5 days

**Priority**: P0 (Critical) — Blocks all other work

### Tasks

#### WFV-1.1: Create Rule Index Schema
**Description**: Create the YAML index file that maps detection patterns to rule files for on-demand loading.

**File**: `.claude/rules/index.yaml`

**Acceptance Criteria**:
- [ ] Index contains all existing rule files (00-17)
- [ ] Each rule has trigger patterns (keywords, effects, types, hooks)
- [ ] Each rule has accurate token count estimate
- [ ] Priority levels assigned (1 = critical, 2 = standard, 3 = conditional)
- [ ] Loading config with max_tokens: 4000 and required rules list
- [ ] Index validates against schema (no syntax errors)

**Estimated Effort**: Medium (1 day)

**Dependencies**: None

**Testing**:
- Validate YAML syntax
- Verify all rule files referenced exist
- Test pattern matching logic manually

---

#### WFV-1.2: Create RLM Core Summary
**Description**: Create the condensed ~1k token summary that replaces full rule loading for initial context.

**File**: `.claude/rules/rlm-core-summary.md`

**Acceptance Criteria**:
- [ ] Contains Effect → Physics lookup table (compact)
- [ ] Contains detection priority order (types > keywords > context)
- [ ] Contains protected capabilities list (non-negotiable)
- [ ] Contains RLM trigger guidance (when to load which rules)
- [ ] Contains action default (generate immediately, don't describe)
- [ ] Token count ≤ 1,000 tokens
- [ ] Covers all essential /craft decision points

**Estimated Effort**: Medium (1 day)

**Dependencies**: None

**Testing**:
- Count tokens (use tiktoken or Claude tokenizer)
- Verify all critical physics values present
- Test with sample /craft invocations

---

#### WFV-1.3: Create Craft State Schema
**Description**: Define the craft-state.md schema for investigation persistence.

**File**: `grimoires/sigil/craft-state.md` (template)

**Acceptance Criteria**:
- [ ] YAML frontmatter with session metadata (id, timestamps, component)
- [ ] Iterations array with action, result, hypothesis, tokens_used, rules_loaded
- [ ] Loop detection object (triggered, pattern, escalation_offered, user_choice)
- [ ] Context object (effect, sync, data_sources, findings)
- [ ] Next recommendation object (fix/diagnose/escalate, reason, suggested_command)
- [ ] Markdown body for human-readable summary
- [ ] Schema documented in SDD appendix

**Estimated Effort**: Small (0.5 day)

**Dependencies**: None

**Testing**:
- Create sample state file
- Parse with YAML parser (no errors)
- Verify all fields documented

---

#### WFV-1.4: Implement State Operations in craft.md
**Description**: Modify craft.md to load, save, and manage craft-state.md.

**File**: `.claude/commands/craft.md` (modify)

**Acceptance Criteria**:
- [ ] Step 0: Check for existing craft-state.md
- [ ] If same component AND < 1 hour old: Load state, increment iteration
- [ ] If different component OR stale: Archive old state, create new
- [ ] After execution: Save state with iteration details
- [ ] State includes rules loaded and tokens used
- [ ] Archive path: `grimoires/sigil/context/archive/{session_id}.md`

**Estimated Effort**: Medium (1 day)

**Dependencies**: WFV-1.3

**Testing**:
- Run /craft twice on same component, verify state persists
- Run /craft on different component, verify archive created
- Wait >1 hour (or modify timestamp), verify new session starts

---

#### WFV-1.5: Implement RLM Loading in craft.md
**Description**: Modify craft.md to use index.yaml for on-demand rule loading instead of loading all rules.

**File**: `.claude/commands/craft.md` (modify)

**Acceptance Criteria**:
- [ ] Always load rlm-core-summary.md first
- [ ] Always load 04-sigil-protected.md (required)
- [ ] Parse user input for trigger patterns
- [ ] Load rules matching detected patterns (priority order)
- [ ] Stop loading when max_tokens reached
- [ ] Show "Rules loaded" and "Tokens" in analysis box
- [ ] Skip rules already applied in previous iterations (read from state)

**Estimated Effort**: Large (1.5 days)

**Dependencies**: WFV-1.1, WFV-1.2, WFV-1.4

**Testing**:
- `/craft "like button"` — should load patterns rule, ~4k tokens
- `/craft "stake button"` — should load web3 rules (Phase 2), ~4k tokens
- Verify token counts match estimates
- Verify iteration 2+ loads fewer rules

---

#### WFV-1.6: Implement Loop Detection
**Description**: Add loop detection logic that triggers escalation protocol after 3+ iterations.

**File**: `.claude/commands/craft.md` (modify)

**Acceptance Criteria**:
- [ ] Check iteration count from craft-state.md
- [ ] If iterations >= 3: Run loop detection algorithm
- [ ] Pattern 1: "each_fix_reveals_new_issue" (all results PARTIAL/reveals/but)
- [ ] Pattern 2: "repeated_fix_attempt" (same action multiple times)
- [ ] Pattern 3: "stuck_hypothesis" (same hypothesis across iterations)
- [ ] Show escalation protocol box with options [d]/[u]/[p]/[c]
- [ ] Save user choice to state
- [ ] Continue to Loa commands if user selects escalation

**Estimated Effort**: Medium (1 day)

**Dependencies**: WFV-1.4

**Testing**:
- Simulate 3 iterations with PARTIAL results
- Verify escalation box appears
- Test each escalation option
- Verify [c] continues without blocking

---

### Sprint 1 Deliverables

| Deliverable | File | Status |
|-------------|------|--------|
| Rule Index | `.claude/rules/index.yaml` | [ ] |
| Core Summary | `.claude/rules/rlm-core-summary.md` | [ ] |
| State Schema | `grimoires/sigil/craft-state.md` | [ ] |
| Modified craft.md | `.claude/commands/craft.md` | [ ] |

### Sprint 1 Definition of Done

- [ ] `/craft` loads ≤2,500 tokens on first invocation
- [ ] State persists across invocations (same component)
- [ ] Loop detection triggers at iteration 3
- [ ] Escalation protocol shows correct options
- [ ] All tests pass

---

## Sprint 2: Data Physics Rules

**Goal**: Add web3-specific physics rules for data source selection guidance.

**Duration**: 3 days

**Priority**: P0 (Critical)

### Tasks

#### WFV-2.1: Create Data Physics Rule
**Description**: Create the new rule file for data source selection guidance in web3 flows.

**File**: `.claude/rules/19-sigil-data-physics.md`

**Acceptance Criteria**:
- [ ] Data Physics table (use case → source → rationale)
- [ ] Anti-patterns section (fallback chains, BigInt falsy, missing receipt guard)
- [ ] Code examples for each anti-pattern and fix
- [ ] Detection triggers (keywords, hooks, patterns)
- [ ] Guidance display format for physics analysis box
- [ ] "Simplest fix" section (use on-chain for everything)
- [ ] Token count ≤ 800 tokens

**Estimated Effort**: Medium (1 day)

**Dependencies**: None

**Testing**:
- Validate XML tag structure
- Verify token count
- Test detection triggers match web3 code patterns

---

#### WFV-2.2: Create Web3 Flow Patterns Rule
**Description**: Create the new rule file capturing risky patterns from web3 debugging.

**File**: `.claude/rules/20-sigil-web3-flows.md`

**Acceptance Criteria**:
- [ ] Risky patterns table (pattern → risk → fix)
- [ ] Flow detection section (keywords, hooks)
- [ ] Multi-step flows section (approve→execute state machine)
- [ ] BigInt safety section with code examples
- [ ] Receipt guard pattern with reusable hook
- [ ] Token count ≤ 1,200 tokens

**Estimated Effort**: Medium (1 day)

**Dependencies**: None

**Testing**:
- Validate XML tag structure
- Verify token count
- Test pattern examples are syntactically correct

---

#### WFV-2.3: Update Rule Index for Web3 Rules
**Description**: Add the new web3 rules to index.yaml with correct triggers.

**File**: `.claude/rules/index.yaml` (modify)

**Acceptance Criteria**:
- [ ] Add 19-sigil-data-physics.md entry with triggers
- [ ] Add 20-sigil-web3-flows.md entry with triggers
- [ ] Keywords: stake, claim, withdraw, bridge, swap, approve, mint, burn
- [ ] Hooks: useWriteContract, useReadContract, usePrepareContractWrite
- [ ] Priority: 1 (high priority for web3 patterns)
- [ ] Both rules load together when web3 detected

**Estimated Effort**: Small (0.5 day)

**Dependencies**: WFV-2.1, WFV-2.2

**Testing**:
- `/craft "stake button"` loads both web3 rules
- `/craft "like button"` does NOT load web3 rules
- Verify total tokens stay under limit

---

#### WFV-2.4: Add Data Physics to Analysis Box
**Description**: Update craft.md to show Data Physics guidance when web3 flow detected.

**File**: `.claude/commands/craft.md` (modify)

**Acceptance Criteria**:
- [ ] Detect web3 flow (keywords or hooks)
- [ ] Show Data Physics section in analysis box
- [ ] List "Using ON-CHAIN for" items
- [ ] List "Using ENVIO for" items
- [ ] Include in verbose mode (not compact)

**Estimated Effort**: Small (0.5 day)

**Dependencies**: WFV-2.1, WFV-2.2, WFV-2.3

**Testing**:
- `/craft "stake button"` shows Data Physics in analysis
- `/craft "like button"` does NOT show Data Physics

---

### Sprint 2 Deliverables

| Deliverable | File | Status |
|-------------|------|--------|
| Data Physics Rule | `.claude/rules/19-sigil-data-physics.md` | [ ] |
| Web3 Flow Patterns | `.claude/rules/20-sigil-web3-flows.md` | [ ] |
| Updated Index | `.claude/rules/index.yaml` | [ ] |
| Updated craft.md | `.claude/commands/craft.md` | [ ] |

### Sprint 2 Definition of Done

- [ ] Web3 keywords trigger Data Physics rule loading
- [ ] Analysis box shows Data Physics guidance for web3 flows
- [ ] Anti-patterns documented with fixes
- [ ] Token budget maintained (<4k with web3 rules)

---

## Sprint 3: Diagnostics & Escalation

**Goal**: Enable `/observe diagnose` mode for on-chain state verification and complete Loa escalation integration.

**Duration**: 4 days

**Priority**: P1 (High)

### Tasks

#### WFV-3.1: Add Diagnose Mode to observe.md
**Description**: Extend /observe command with a new "diagnose" mode for blockchain state inspection.

**File**: `.claude/commands/observe.md` (modify)

**Acceptance Criteria**:
- [ ] New invocation: `/observe diagnose [ComponentName]`
- [ ] Step 1: Read component file, extract data sources
- [ ] Step 2: Identify contracts and hooks used
- [ ] Step 3: Invoke blockchain-inspector skill (Phase 4)
- [ ] Step 4: Show diagnostic report with source comparison
- [ ] Step 5: Save findings to craft-state.md
- [ ] Diagnostic report format matches SDD spec

**Estimated Effort**: Medium (1.5 days)

**Dependencies**: Sprint 1 complete

**Testing**:
- `/observe diagnose StakeButton` parses component correctly
- Report shows detected data sources
- Findings saved to craft-state.md

---

#### WFV-3.2: Implement Escalation to Loa Commands
**Description**: Wire up the escalation protocol to invoke Loa commands when user selects option.

**File**: `.claude/commands/craft.md` (modify)

**Acceptance Criteria**:
- [ ] [d] option invokes `/observe diagnose [component]`
- [ ] [u] option invokes `/understand [topic]` with context
- [ ] [p] option invokes `/plan-and-analyze` with component context
- [ ] [c] option continues /craft without escalation
- [ ] Context from craft-state.md passed to Loa commands
- [ ] After Loa command completes, suggest return to /craft

**Estimated Effort**: Medium (1 day)

**Dependencies**: WFV-3.1, Sprint 1 complete

**Testing**:
- At iteration 3, select [d] → /observe runs
- Select [u] → /understand runs with correct topic
- Select [p] → /plan-and-analyze runs
- Verify context passed correctly

---

#### WFV-3.3: Create Diagnostic Report Format
**Description**: Define and implement the diagnostic report output format.

**File**: `.claude/commands/observe.md` (modify)

**Acceptance Criteria**:
- [ ] Report shows component name, file path, block number
- [ ] Data Sources Detected section lists Envio queries and on-chain reads
- [ ] On-Chain Verification section shows contract read results
- [ ] Source Comparison table with Match?/Mismatch column
- [ ] Diagnosis section with root cause analysis
- [ ] Suggested Fix section with specific recommendation
- [ ] ASCII box formatting matches existing Sigil style

**Estimated Effort**: Medium (1 day)

**Dependencies**: WFV-3.1

**Testing**:
- Report renders correctly in terminal
- All sections populated with real data
- Mismatch highlighting works

---

#### WFV-3.4: State Integration for Diagnostics
**Description**: Update craft-state.md to include diagnostic findings and use them in subsequent /craft iterations.

**File**: `.claude/commands/craft.md` (modify)

**Acceptance Criteria**:
- [ ] craft-state.md includes `diagnostics` section
- [ ] Findings from /observe diagnose saved to state
- [ ] Next /craft iteration shows diagnostic findings in context
- [ ] Hypothesis updated based on diagnostic results
- [ ] Suggested fix from diagnostics shown to user

**Estimated Effort**: Small (0.5 day)

**Dependencies**: WFV-3.1, WFV-3.3

**Testing**:
- Run /observe diagnose, then /craft
- Verify craft shows diagnostic context
- Verify hypothesis reflects diagnostic findings

---

### Sprint 3 Deliverables

| Deliverable | File | Status |
|-------------|------|--------|
| Diagnose Mode | `.claude/commands/observe.md` | [ ] |
| Escalation Wiring | `.claude/commands/craft.md` | [ ] |
| Report Format | `.claude/commands/observe.md` | [ ] |
| State Integration | `.claude/commands/craft.md` | [ ] |

### Sprint 3 Definition of Done

- [ ] `/observe diagnose [component]` runs successfully
- [ ] Diagnostic report shows source comparison
- [ ] Escalation options invoke correct Loa commands
- [ ] Diagnostic findings persist in craft-state.md
- [ ] Subsequent /craft uses diagnostic context

---

## Sprint 4: Blockchain Inspector Skill

**Goal**: Create the blockchain-inspector skill for read-only on-chain state inspection.

**Duration**: 3 days

**Priority**: P1 (High)

### Tasks

#### WFV-4.1: Create Skill Directory Structure
**Description**: Set up the blockchain-inspector skill with SKILL.md and index.yaml.

**Files**:
- `.claude/skills/blockchain-inspector/SKILL.md`
- `.claude/skills/blockchain-inspector/index.yaml`

**Acceptance Criteria**:
- [ ] SKILL.md documents capabilities (read state, batch reads, compare sources)
- [ ] SKILL.md includes viem, cast, and raw JSON-RPC options
- [ ] SKILL.md defines output format (YAML diagnostic)
- [ ] index.yaml defines triggers, context_files, zones
- [ ] Zones allow reading src/, env files; writing to grimoires/

**Estimated Effort**: Medium (1 day)

**Dependencies**: None

**Testing**:
- Skill loads without errors
- Triggers match expected patterns
- Zones correctly scoped

---

#### WFV-4.2: Implement Viem Integration
**Description**: Add viem-based contract reading to the skill.

**File**: `.claude/skills/blockchain-inspector/SKILL.md` (expand)

**Acceptance Criteria**:
- [ ] Detect if project has viem installed (check package.json)
- [ ] Create publicClient with project's RPC URL
- [ ] readContract for single value reads
- [ ] multicall for batch reads
- [ ] Decode results using ABI
- [ ] Format output as diagnostic YAML

**Estimated Effort**: Medium (1 day)

**Dependencies**: WFV-4.1

**Testing**:
- Read balance from test contract
- Batch read multiple values
- Verify decoded values match expected

---

#### WFV-4.3: Implement Cast Fallback
**Description**: Add Foundry cast as fallback when viem unavailable.

**File**: `.claude/skills/blockchain-inspector/SKILL.md` (expand)

**Acceptance Criteria**:
- [ ] Check if cast is available (which cast)
- [ ] Construct cast call command for contract reads
- [ ] Parse cast output into structured data
- [ ] Handle common function signatures (balanceOf, allowance, etc.)
- [ ] Document required function signature format

**Estimated Effort**: Small (0.5 day)

**Dependencies**: WFV-4.1

**Testing**:
- cast call works with test contract
- Output parsed correctly
- Fallback triggered when viem unavailable

---

#### WFV-4.4: Integrate Skill with /observe
**Description**: Wire blockchain-inspector skill into /observe diagnose command.

**File**: `.claude/commands/observe.md` (modify)

**Acceptance Criteria**:
- [ ] /observe diagnose invokes blockchain-inspector skill
- [ ] Pass contract addresses extracted from component
- [ ] Pass user address (from component or env)
- [ ] Receive diagnostic results from skill
- [ ] Format results into diagnostic report

**Estimated Effort**: Medium (0.5 day)

**Dependencies**: WFV-4.1, WFV-4.2, WFV-4.3, WFV-3.1

**Testing**:
- /observe diagnose triggers skill
- Real on-chain data returned
- Report shows actual values

---

### Sprint 4 Deliverables

| Deliverable | File | Status |
|-------------|------|--------|
| Skill Definition | `.claude/skills/blockchain-inspector/SKILL.md` | [ ] |
| Skill Index | `.claude/skills/blockchain-inspector/index.yaml` | [ ] |
| Viem Integration | (in SKILL.md) | [ ] |
| Cast Fallback | (in SKILL.md) | [ ] |
| Observe Integration | `.claude/commands/observe.md` | [ ] |

### Sprint 4 Definition of Done

- [ ] Skill reads on-chain state via viem or cast
- [ ] /observe diagnose shows real contract data
- [ ] Source comparison shows actual mismatches
- [ ] Full debug flow works end-to-end

---

## Risk Assessment

### High Risk

| Risk | Sprint | Mitigation |
|------|--------|------------|
| RLM doesn't reduce tokens enough | 1 | Measure early, aggressive summarization |
| Loop detection false positives | 1 | Configurable threshold, easy [c] override |

### Medium Risk

| Risk | Sprint | Mitigation |
|------|--------|------------|
| On-chain reads fail (rate limit) | 4 | Cast fallback, graceful degradation |
| State file corruption | 1 | Archive before overwrite |
| Viem not in project | 4 | Cast fallback available |

### Low Risk

| Risk | Sprint | Mitigation |
|------|--------|------------|
| Rule token estimates wrong | 1-2 | Measure and adjust index.yaml |
| Envio schema varies | 3 | Manual extraction for now |

---

## Dependencies Graph

```
Sprint 1: RLM Core
├── WFV-1.1 (Index) ─────────────────────────────────┐
├── WFV-1.2 (Summary) ───────────────────────────────┤
├── WFV-1.3 (State Schema) ──┬───────────────────────┤
├── WFV-1.4 (State Ops) ─────┼── depends on 1.3 ─────┤
├── WFV-1.5 (RLM Loading) ───┼── depends on 1.1,1.2,1.4
└── WFV-1.6 (Loop Detection) ┴── depends on 1.4 ─────┘
         │
         ▼
Sprint 2: Data Physics
├── WFV-2.1 (Data Physics Rule) ─────────────────────┐
├── WFV-2.2 (Web3 Patterns Rule) ────────────────────┤
├── WFV-2.3 (Update Index) ──── depends on 2.1, 2.2 ─┤
└── WFV-2.4 (Analysis Box) ──── depends on 2.3 ──────┘
         │
         ▼
Sprint 3: Diagnostics
├── WFV-3.1 (Diagnose Mode) ─────────────────────────┐
├── WFV-3.2 (Escalation) ──── depends on 3.1, S1 ────┤
├── WFV-3.3 (Report Format) ─ depends on 3.1 ────────┤
└── WFV-3.4 (State Integration) depends on 3.1, 3.3 ─┘
         │
         ▼
Sprint 4: Blockchain Inspector
├── WFV-4.1 (Skill Structure) ───────────────────────┐
├── WFV-4.2 (Viem) ──────────── depends on 4.1 ──────┤
├── WFV-4.3 (Cast Fallback) ─── depends on 4.1 ──────┤
└── WFV-4.4 (Observe Integration) depends on all ────┘
```

---

## Buffer & Contingency

| Category | Buffer |
|----------|--------|
| Sprint 1 (Critical) | +1 day (total 6 days) |
| Sprint 2 | +0.5 day (total 3.5 days) |
| Sprint 3 | +0.5 day (total 4.5 days) |
| Sprint 4 | +0.5 day (total 3.5 days) |
| **Total with buffer** | **17.5 days** |

---

## Implementation Notes

### File Modification Tracking

| File | Sprints | Type |
|------|---------|------|
| `.claude/rules/index.yaml` | 1, 2 | NEW then MODIFY |
| `.claude/rules/rlm-core-summary.md` | 1 | NEW |
| `.claude/rules/19-sigil-data-physics.md` | 2 | NEW |
| `.claude/rules/20-sigil-web3-flows.md` | 2 | NEW |
| `.claude/commands/craft.md` | 1, 2, 3 | MODIFY |
| `.claude/commands/observe.md` | 3, 4 | MODIFY |
| `.claude/skills/blockchain-inspector/` | 4 | NEW directory |
| `grimoires/sigil/craft-state.md` | 1 | NEW (template) |

### Testing Strategy by Sprint

| Sprint | Test Type | Focus |
|--------|-----------|-------|
| 1 | Unit | Token counting, state persistence |
| 2 | Integration | Pattern detection, rule loading |
| 3 | Integration | Escalation flow, state handoff |
| 4 | E2E | Full debug cycle with real contract |

---

## Next Steps

After plan approval:

```
/implement sprint-1
```

The implement command will:
1. Read this sprint plan
2. Execute tasks in dependency order
3. Track progress in craft-state.md
4. Verify acceptance criteria
5. Report completion

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-20 | Claude | Initial sprint plan |

---

```
    ╔═══════════════════════════════════════════════════════════╗
    ║  SPRINT PLAN v1.0.0 - READY FOR IMPLEMENTATION            ║
    ║  Run: /implement sprint-1                                 ║
    ╚═══════════════════════════════════════════════════════════╝
```
