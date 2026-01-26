# PRD: Rune Construct Pack for Loa

## Document Information

| Field | Value |
|-------|-------|
| **Version** | 1.1.0 |
| **Status** | Draft |
| **Author** | Claude + User |
| **Date** | 2026-01-25 |
| **Changelog** | v1.1.0: Added Wyrd as fourth construct (closed-loop validation) |

---

## 1. Problem Statement

### The Challenge

AI-generated UI suffers from two critical problems:

1. **Incorrect Physics** — Components feel wrong because timing, sync strategy, and confirmation patterns don't match the operation's effect (e.g., optimistic updates for financial transactions)

2. **Data Integrity Bugs** — Web3 components contain subtle bugs that lose money (BigInt falsy checks, stale closures, indexed data for transactions)

3. **Lost Preferences** — User corrections to generated code are forgotten between sessions, leading to repetitive modification cycles

### Current State

Rune solves these problems with four constructs (Sigil/Glyph/Rigor/Wyrd), but they:
- Operate as **standalone tools** with no memory
- Don't integrate with **development workflows**
- Require **manual invocation** at the right moment
- Have **no progressive disclosure** (all physics shown upfront)

### The Four Constructs

```
RUNE CONSTRUCTS (Four Pillars of Design Physics)
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   ╭─────────╮   ╭─────────╮   ╭─────────╮   ╭─────────╮        │
│   │  SIGIL  │   │  GLYPH  │   │  RIGOR  │   │  WYRD   │        │
│   │  (WHY)  │   │  (HOW)  │   │  (WHAT) │   │  (IF)   │        │
│   ╰────┬────╯   ╰────┬────╯   ╰────┬────╯   ╰────┬────╯        │
│        │             │             │             │              │
│     Taste         Craft       Correctness    Validation        │
│        │             │             │             │              │
│   Preferences   Generation     Data Safety   Hypothesis        │
│   Learning      Physics        BigInt/Web3   Testing           │
│   Patterns      Animation      Receipts      Learning          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

| Construct | Question | Domain | Input | Output |
|-----------|----------|--------|-------|--------|
| **Sigil** | WHY this preference? | Taste | User observations | `taste.md` entries |
| **Glyph** | HOW to build it? | Craft | Component description | React/TSX code |
| **Rigor** | WHAT must be correct? | Data | Code to validate | Violation report |
| **Wyrd** | IF the hypothesis holds? | Fate | Hypothesis + reality | Confidence calibration |

**Wyrd** (Norse: fate, destiny) is the closed-loop construct. It asks: *"If I hypothesize X, does reality confirm it?"* Each validation either confirms or refines the system's understanding.

### The Opportunity

Loa provides enterprise-grade managed scaffolding with:
- **Lossless Ledger Protocol** — Decisions survive context clears
- **Structured Agentic Memory** — NOTES.md with session continuity
- **Seven-phase Workflow** — Discovery → Architecture → Sprint → Implement → Review → Audit → Deploy
- **Construct Registry** — Installable skill packs

**Integration Goal**: Rune as a Loa Construct Pack that seamlessly hooks into the workflow, logs to the blackboard, and reveals complexity progressively.

### The Core Philosophy: Closing the Loop

> "The single most powerful way to code with agents is to build a system in which they can ask questions, generate hypotheses, and validate these against real data."
> — [Benedict Evans, Closing the Software Loop](https://www.benedict.dev/closing-the-software-loop)

Traditional AI generation is **open-loop**: generate → hope → repeat. Rune implements **closed-loop** generation:

```
OPEN LOOP (Current):
  User Request → Generate → Present → [User fixes manually] → Lost

CLOSED LOOP (Target):
  User Request → Hypothesize → Generate → Self-Validate → Present →
  Capture Feedback → Learn → [Improved next time]
```

**Key insight**: Each rejected proposal makes the system more aligned. Rejections aren't failures—they're training data for the taste system.

> Sources: grimoires/loa/context/research-synthesis.md, https://www.benedict.dev/closing-the-software-loop

---

## 2. Goals & Success Metrics

### G-1: Seamless Workflow Integration

Rune constructs activate automatically at the right workflow phase.

| Metric | Current | Target |
|--------|---------|--------|
| Manual /glyph invocations during /implement | 100% | 0% (auto-suggested) |
| Physics validation in /review-sprint | 0% | 100% |
| Rigor checks in /audit-sprint | 0% | 100% for web3 tasks |

### G-2: Unified Memory (The Blackboard)

All Rune decisions logged to Loa's memory systems.

| Metric | Current | Target |
|--------|---------|--------|
| Physics decisions in NOTES.md | 0 | 100% logged |
| Session recovery includes craft state | No | Yes |
| Taste entries after 10 sprints | 0 | 15+ entries |

### G-3: Progressive Disclosure (Low Cognitive Load)

Users understand constructs gradually, not all at once.

| Metric | Current | Target |
|--------|---------|--------|
| Time to understand effect physics | Manual reading | <5s via L1 summary |
| Rules loaded upfront | All 8 files | 1-2 relevant files |
| "Why?" explanations available | No | Yes (L4 on-demand) |

### G-4: Taste Maturation

Preferences accumulate systematically over project lifecycle.

| Metric | Current | Target |
|--------|---------|--------|
| Taste capture opportunities | 0 | Every feedback loop |
| Pattern detection (3+ similar) | None | Auto-prompted |
| Taste maturity tiers | None | 3 tiers (observation → pattern → rule) |

### G-5: Closed-Loop Validation (The Core Innovation)

> "The single most powerful way to code with agents is to build a system in which they can ask questions, generate hypotheses, and validate these against real data."
> — [Closing the Software Loop](https://www.benedict.dev/closing-the-software-loop)

Rune agents don't just generate — they hypothesize, validate, and learn from every interaction.

| Metric | Current | Target |
|--------|---------|--------|
| Hypothesis stated before generation | 0% | 100% |
| Self-validation before presenting | 0% | 100% |
| Rejections captured as learning | 0% | 100% |
| Compounding alignment over sprints | None | Measurable improvement |

**The Loop**:
```
Hypothesize → Generate → Self-Validate → Present → User Feedback → Learn → (repeat)
```

Each rejected proposal makes the system more aligned to user preferences in the future.

---

## 3. User & Stakeholder Context

### Primary Persona: Web3 Frontend Engineer

- **Context**: Building DeFi/NFT interfaces with React/Next.js
- **Pain Point**: "I keep generating buttons that feel wrong or have subtle bugs"
- **Need**: Correct physics automatically, catch data bugs early
- **Workflow**: Uses Loa for sprint planning and implementation

### Secondary Persona: Design-Conscious Product Manager

- **Context**: Reviews PRs, cares about UX consistency
- **Pain Point**: "Different components have inconsistent timing and feel"
- **Need**: Enforced design system physics across the codebase
- **Workflow**: Reviews sprint outputs, provides feedback

### Tertiary Persona: Security Auditor

- **Context**: Reviews web3 code for vulnerabilities
- **Pain Point**: "BigInt bugs and stale closures are hard to spot manually"
- **Need**: Automated Rigor checks in audit workflow
- **Workflow**: Uses /audit-sprint, reviews findings

---

## 4. Functional Requirements

### F-1: Construct Pack Installation

**User Story**: As a Loa user, I can install Rune as a construct pack so I get all four constructs integrated with my workflow.

**Acceptance Criteria**:
- [ ] `loa install rune` adds Sigil, Glyph, Rigor, Wyrd to `.claude/constructs/packs/rune/`
- [ ] Pack includes skills, rules, reference materials for all four constructs
- [ ] Installation creates `grimoires/rune/` state directory with:
  - `taste.md` (Sigil state)
  - `wyrd.md` (Wyrd hypotheses and confidence)
  - `rejections.md` (Wyrd learning log)
- [ ] Commands `/sigil`, `/glyph`, `/rigor`, `/wyrd` become available
- [ ] NOTES.md gains "Design Physics (Rune)" section

### F-2: Workflow Hook - Sprint Planning

**User Story**: As an engineer, when I create a sprint plan with UI tasks, I see suggested physics requirements.

**Acceptance Criteria**:
- [ ] `/sprint-plan` detects UI component tasks via keywords (button, modal, form, panel)
- [ ] Effect detection runs on task descriptions
- [ ] Suggested physics appears in task acceptance criteria
- [ ] Example: "Task: Claim button → Effect: Financial → Physics: Pessimistic, 800ms, Required confirmation"

### F-3: Workflow Hook - Implementation

**User Story**: As an engineer, when I implement a UI task, Glyph is suggested with pre-filled context.

**Acceptance Criteria**:
- [ ] `/implement` detects current task is UI-related
- [ ] Prompts: "This appears to be a UI component. Generate with /glyph?"
- [ ] If yes, invokes `/glyph` with task description as input
- [ ] Taste from `grimoires/rune/taste.md` auto-applied
- [ ] Decision logged to NOTES.md Design Physics section

### F-4: Workflow Hook - Sprint Review

**User Story**: As a tech lead, when I review a sprint, physics compliance is automatically validated.

**Acceptance Criteria**:
- [ ] `/review-sprint` scans modified `.tsx` files
- [ ] Runs `/glyph validate` on each component
- [ ] Reports physics violations alongside test results
- [ ] Violations don't block (WARN level) unless protected capability
- [ ] Protected capability violations block approval

### F-5: Workflow Hook - Security Audit

**User Story**: As an auditor, when I audit a sprint with web3 code, Rigor checks run automatically.

**Acceptance Criteria**:
- [ ] `/audit-sprint` detects web3 patterns (useWriteContract, BigInt, transaction flows)
- [ ] Runs `/rigor` on detected files
- [ ] Reports: BigInt safety, data sources, receipt guards, stale closures
- [ ] Critical findings (data source for transactions) block approval
- [ ] Findings appear in audit feedback file

### F-6: Progressive Disclosure Levels

**User Story**: As a new user, I see simple physics summaries first and can drill into details on demand.

**Acceptance Criteria**:
- [ ] **L0**: `/glyph` shows nothing until description provided
- [ ] **L1**: Shows physics box (Effect, Sync, Timing, Confirmation) — max 5 lines
- [ ] **L2**: If ambiguous, asks clarifying question (e.g., "Reversible operation?")
- [ ] **L3**: On confirmation, generates complete component
- [ ] **L4**: On "why?", loads full physics table and explains rationale
- [ ] Reference skills (physics-reference, patterns-reference) load only at L4

### F-7: Mode Detection

**User Story**: As a user, I can analyze, generate, validate, or diagnose components based on my intent.

**Acceptance Criteria**:
- [ ] `/glyph "claim button"` → Generate mode (default)
- [ ] `/glyph --analyze "claim button"` → Analyze mode (physics only, no generation)
- [ ] `/glyph validate file.tsx` → Validate mode (check existing component)
- [ ] `/glyph --diagnose file.tsx` → Diagnose mode (suggest fixes)
- [ ] Keywords detected: "what/why/explain" → Analyze, "fix/broken/wrong" → Diagnose

### F-8: NOTES.md Design Physics Section

**User Story**: As an engineer, my physics decisions persist across sessions in NOTES.md.

**Acceptance Criteria**:
- [ ] NOTES.md template includes "Design Physics (Rune)" section
- [ ] Section contains: Active Craft, Taste Applied, Physics Decisions table
- [ ] Every `/glyph` generation logs to Physics Decisions
- [ ] Format: `| Date | Component | Effect | Timing | Rationale |`
- [ ] Session Continuity includes Rune Context (active craft, effect, iteration)

### F-9: Taste Capture in Feedback Loops

**User Story**: As an engineer, during sprint review feedback, I'm prompted to record design preferences.

**Acceptance Criteria**:
- [ ] After engineer feedback collected in `/review-sprint`, prompt appears
- [ ] Prompt: "Any design preferences to record as taste?"
- [ ] If yes, opens `/sigil` with context pre-filled
- [ ] Taste entry includes sprint context and component references
- [ ] Entry appended to `grimoires/rune/taste.md`

### F-10: Taste Maturity Tiers

**User Story**: As a long-term user, my taste insights mature from observations to confirmed patterns to rules.

**Acceptance Criteria**:
- [ ] **Tier 1 (Observation)**: Single insight, applied with note "taste: single observation"
- [ ] **Tier 2 (Pattern)**: 3+ similar insights, applied with note "taste: confirmed pattern"
- [ ] **Tier 3 (Rule)**: Promoted by user, applied always without note
- [ ] Glyph reads maturity tier and adjusts confidence in application
- [ ] `/sigil --status` shows maturity distribution

### F-11: Validate Subcommands

**User Story**: As a tech lead, I can run targeted validation with `/validate physics` and `/validate rigor`.

**Acceptance Criteria**:
- [ ] `/validate physics` runs `/glyph validate` on all components in sprint scope
- [ ] `/validate rigor` runs `/rigor` on all web3 files in sprint scope
- [ ] `/validate physics --strict` treats WARN as BLOCK
- [ ] Results logged to `grimoires/loa/a2a/` feedback directory
- [ ] Summary shows: X components checked, Y violations found

---

## 4.5 Wyrd: The Closed-Loop Construct (G-5)

**Wyrd** (Old English/Norse: fate, destiny, "what will be") is the fourth Rune construct. It implements the hypothesis → validate → learn cycle that makes each rejection improve future alignment.

> *"What will be is what survives the test."*

### Wyrd Philosophy

- **Fate emerges through testing** — Truth is revealed, not assumed
- **Rejection is data** — Each "no" teaches the system
- **Confidence calibrates** — Predictions improve with feedback
- **Reality anchors claims** — Validate against real code, tests, and behavior

### Wyrd Invocation

```bash
/wyrd                     # Show current hypothesis confidence
/wyrd calibrate           # Recalculate confidence from rejection history
/wyrd test hypothesis.md  # Validate a specific hypothesis against codebase
/wyrd learn               # Review recent rejections and extract patterns
```

### F-12: Hypothesis-Driven Generation (Wyrd Phase 1)

**User Story**: As an engineer, when Glyph generates a component, I see its hypothesis first so I can validate its understanding before code is written.

**Acceptance Criteria**:
- [ ] Before generating, Glyph outputs a **Hypothesis Block**:
  ```
  ## Hypothesis

  **Effect**: Financial (detected: "claim" keyword, Amount type)
  **Physics**: Pessimistic sync, 800ms timing, confirmation required
  **Taste Applied**: 500ms override (power user preference, Tier 2 pattern)
  **Confidence**: 0.85

  Does this match your intent? [y/n/adjust]
  ```
- [ ] User can accept (y), reject with feedback (n + reason), or adjust specific values
- [ ] Rejection reason captured in `grimoires/rune/rejections.md`
- [ ] Hypothesis confidence calibrates based on rejection history

### F-13: Self-Validation Loop (Wyrd Phase 2)

**User Story**: As an engineer, Glyph validates its own output before showing it to me, catching obvious errors automatically.

**Acceptance Criteria**:
- [ ] After generating code, Glyph runs internal validation:
  - Physics compliance check (does code match stated physics?)
  - Protected capability check (withdraw reachable? cancel visible?)
  - Rigor check (if web3 patterns detected)
- [ ] If self-validation fails, Glyph **auto-repairs** before presenting
- [ ] Self-validation results shown in output:
  ```
  ## Self-Validation
  ✓ Physics: Pessimistic sync implemented correctly
  ✓ Protected: Cancel button present and visible
  ✓ Rigor: BigInt checks use `!= null && > 0n`

  [Auto-repaired: Added receipt guard on line 45]
  ```
- [ ] If auto-repair not possible, presents issue with suggested fix

### F-14: Rejection Learning (Wyrd Phase 3 — Compounding Alignment)

**User Story**: As a long-term user, when I modify Glyph's generated code, the system learns from my corrections and improves future generations.

**Acceptance Criteria**:
- [ ] After `/glyph` generation, system watches for file modifications
- [ ] If user edits generated file within 30 minutes, trigger **Rejection Analysis**:
  ```
  Detected modification to ClaimButton.tsx

  Changes detected:
  - Timing: 800ms → 500ms (line 23)
  - Animation: ease-out → spring(500, 30) (line 45)

  Record as taste? [y/n]
  ```
- [ ] If confirmed, auto-generates Sigil entry with context
- [ ] Rejection logged to `grimoires/rune/rejections.md`:
  ```markdown
  ## 2026-01-25 14:30 - ClaimButton Rejection

  **Hypothesis**: Financial effect, 800ms timing
  **Rejection**: User changed timing to 500ms
  **Context**: Sprint-3, power user dashboard
  **Pattern**: 3rd timing reduction this sprint
  **Action**: Promoted to Tier 2 pattern
  ```
- [ ] Future generations incorporate rejection patterns

### F-15: Reality Anchoring (Wyrd Phase 4 — Validate Against Real Data)

**User Story**: As an engineer, Glyph can validate its physics claims against actual runtime behavior when tests are available.

**Acceptance Criteria**:
- [ ] If component has associated test file, Glyph reads test expectations
- [ ] Validates generated physics against test assertions:
  ```
  ## Reality Check

  Found test: ClaimButton.test.tsx

  Test expects:
  - Loading state during mutation ✓ (matches pessimistic)
  - 800ms timeout on pending ✓ (matches timing)
  - Confirmation modal before action ✓ (matches required)

  Physics validated against test expectations.
  ```
- [ ] If test expectations conflict with physics, flag for resolution:
  ```
  ⚠️ Physics Conflict

  Test expects: Optimistic update (immediate UI change)
  Physics says: Pessimistic (wait for server)

  Options:
  1. Update test to match physics (recommended for Financial)
  2. Override physics (requires explicit confirmation)
  ```
- [ ] Can run actual tests if `--run-tests` flag provided
- [ ] Test results inform confidence calibration

### F-16: Feedback Telemetry (Wyrd Phase 5 — Community Learning)

**User Story**: As a Rune user, my anonymized usage patterns help improve the physics defaults for everyone.

**Acceptance Criteria**:
- [ ] Opt-in telemetry (disabled by default)
- [ ] Captures anonymized patterns:
  - Effect → timing adjustments (e.g., "Financial usually adjusted to 500ms")
  - Common rejections by effect type
  - Self-validation failure rates
- [ ] No code, no project names, no identifying information
- [ ] Aggregated insights published as "Community Physics" recommendations
- [ ] Users can view their contribution: `/rune telemetry status`

---

## 5. Technical & Non-Functional Requirements

### T-1: Token Efficiency

- L1 physics summary: <100 tokens
- Session recovery (Rune context): <50 tokens additional
- Reference skill loading: On-demand only, not upfront
- Rule loading: Triggered by keywords, not all 8 files

### T-2: Zone Permissions

```yaml
# Rune Construct Pack permissions
zones:
  system: ".claude" # READ only
  state:
    - "grimoires/rune" # READ/WRITE
    - "grimoires/loa/NOTES.md" # READ/WRITE (for Design Physics section)
  app: "src, lib, app, components" # READ for validation, WRITE for generation
```

### T-3: Backward Compatibility

- Existing `/sigil`, `/glyph`, `/rigor` commands continue to work standalone
- Users without Loa can use Rune constructs independently
- Integration features activate only when Loa detected

### T-4: Installation Size

- Pack size: <500KB (rules, skills, no heavy assets)
- No runtime dependencies beyond Loa framework
- Skills lazy-load reference materials

---

## 6. Scope & Prioritization

### MVP (Sprint 1-2)

| Priority | Feature | Rationale |
|----------|---------|-----------|
| P0 | F-1: Construct Pack Installation | Foundation for everything |
| P0 | F-8: NOTES.md Design Physics Section | Memory integration core |
| P0 | F-6: Progressive Disclosure (L1-L3) | Low cognitive load |
| P0 | **F-12: Hypothesis-Driven Generation** | **Core closed-loop behavior** |
| P1 | F-3: Workflow Hook - Implementation | Most common use case |
| P1 | F-7: Mode Detection | Usability |

### Phase 2 (Sprint 3-4)

| Priority | Feature | Rationale |
|----------|---------|-----------|
| P0 | **F-13: Self-Validation Loop** | **Catch errors before user sees them** |
| P1 | F-4: Workflow Hook - Sprint Review | Quality gate |
| P1 | F-5: Workflow Hook - Security Audit | Web3 safety |
| P1 | F-11: Validate Subcommands | Manual triggers |
| P2 | F-6: Progressive Disclosure (L4) | Advanced users |

### Phase 3 (Sprint 5-6)

| Priority | Feature | Rationale |
|----------|---------|-----------|
| P0 | **F-14: Rejection Learning** | **Compounding alignment over time** |
| P1 | F-2: Workflow Hook - Sprint Planning | Early physics |
| P1 | F-9: Taste Capture in Feedback Loops | Systematic learning |
| P1 | F-10: Taste Maturity Tiers | Long-term value |
| P2 | F-15: Reality Anchoring | Validate against tests |

### Phase 4 (Sprint 7+)

| Priority | Feature | Rationale |
|----------|---------|-----------|
| P2 | F-16: Feedback Telemetry | Community learning |

### Out of Scope (Future)

- Cross-project taste sharing (privacy concerns)
- Custom physics tables per project (complexity)
- Visual design system integration (separate concern)
- Real-time browser validation (requires runtime integration)

---

## 7. Risks & Dependencies

### R-1: Loa Version Compatibility

**Risk**: Loa APIs may change, breaking integration.
**Mitigation**: Pin to Loa v1.7.x, document required protocol versions.

### R-2: Token Budget Pressure

**Risk**: Adding Rune context may push token usage into Orange/Red zones.
**Mitigation**: Strict token budgets (L1 <100, recovery <50), lazy loading.

### R-3: User Friction

**Risk**: Auto-prompts during workflow may feel intrusive.
**Mitigation**: All prompts skippable, frequency limits, user preference to disable.

### R-4: Taste Database Quality

**Risk**: Low-quality taste entries degrade generation over time.
**Mitigation**: Maturity tiers, user can demote/delete entries, context required.

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| Loa Framework v1.7+ | Required | Available |
| Loa Construct Registry | Required | Available |
| NOTES.md structured memory | Required | Available |
| Beads task tracking | Optional | Available |
| ck semantic search | Optional | Enhances L4 |

---

## 8. Appendices

### Appendix A: Construct Pack File Structure

```
.claude/constructs/packs/rune/
├── manifest.yaml           # Pack metadata, version, dependencies
├── skills/
│   ├── sigil/
│   │   ├── SKILL.md        # Observing skill (taste capture)
│   │   └── index.yaml      # Triggers, permissions
│   ├── glyph/
│   │   ├── SKILL.md        # Crafting skill (UI generation)
│   │   └── index.yaml
│   ├── rigor/
│   │   ├── SKILL.md        # Enforcing skill (data validation)
│   │   └── index.yaml
│   ├── wyrd/
│   │   ├── SKILL.md        # Fate skill (hypothesis validation)
│   │   └── index.yaml
│   ├── physics-reference/
│   │   ├── SKILL.md        # Reference skill (on-demand)
│   │   └── index.yaml
│   └── patterns-reference/
│       ├── SKILL.md        # Reference skill (on-demand)
│       └── index.yaml
├── rules/
│   ├── sigil/              # 2 rule files (taste philosophy)
│   ├── glyph/              # 8 rule files (physics, animation, material)
│   ├── rigor/              # 3 rule files (data sources, BigInt, receipts)
│   └── wyrd/               # 3 rule files (hypothesis, validation, learning)
│       ├── 00-wyrd-core.md         # Philosophy: fate emerges through testing
│       ├── 01-wyrd-hypothesis.md   # Hypothesis formation and confidence
│       └── 02-wyrd-learning.md     # Rejection capture and pattern extraction
├── hooks/
│   ├── implement-hook.md   # Integration with /implement
│   ├── review-hook.md      # Integration with /review-sprint
│   └── audit-hook.md       # Integration with /audit-sprint
└── templates/
    ├── notes-section.md    # Design Physics section template
    └── wyrd-state.md       # Wyrd state file template

grimoires/rune/             # State directory (created on install)
├── taste.md                # Sigil: Accumulated preferences
├── wyrd.md                 # Wyrd: Current hypotheses and confidence
├── rejections.md           # Wyrd: Rejection history log
└── patterns.md             # Wyrd: Extracted patterns from rejections
```

### Appendix B: NOTES.md Template Addition

```markdown
## Design Physics (Rune)

### Active Craft
- **Component**: [none]
- **Effect**: [none]
- **Physics**: [none]
- **Iteration**: 0

### Taste Applied
[No taste entries yet. Use /sigil to record preferences.]

### Physics Decisions
| Date | Component | Effect | Timing | Taste Override | Rationale |
|------|-----------|--------|--------|----------------|-----------|
| — | — | — | — | — | — |
```

### Appendix C: Goal Traceability

| Goal ID | Contributing Tasks | Validation Method |
|---------|-------------------|-------------------|
| G-1 | F-2, F-3, F-4, F-5 | Workflow hooks trigger correctly |
| G-2 | F-1, F-8 | NOTES.md populated after /glyph |
| G-3 | F-6, F-7 | User testing: time to understand |
| G-4 | F-9, F-10 | Taste entries count after 10 sprints |
| **G-5** | **F-12, F-13, F-14, F-15, F-16** | **Rejection rate decreases over sprints; confidence calibration improves** |

### Appendix D: The Four Pillars Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    RUNE: FOUR PILLARS OF DESIGN PHYSICS                  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ╭──────────╮    ╭──────────╮    ╭──────────╮    ╭──────────╮          │
│   │  SIGIL   │    │  GLYPH   │    │  RIGOR   │    │  WYRD    │          │
│   │  (WHY)   │    │  (HOW)   │    │  (WHAT)  │    │  (IF)    │          │
│   │  Taste   │    │  Craft   │    │ Correct  │    │  Fate    │          │
│   ╰────┬─────╯    ╰────┬─────╯    ╰────┬─────╯    ╰────┬─────╯          │
│        │               │               │               │                 │
│        │               │               │               │                 │
│   Preferences      Generation      Validation     Hypothesis            │
│   Learning         Physics         Data Safety    Testing               │
│   Patterns         Animation       BigInt/Web3    Learning              │
│        │               │               │               │                 │
│        └───────────────┴───────┬───────┴───────────────┘                 │
│                                │                                         │
│                    ╭───────────┴───────────╮                            │
│                    │     THE WYRD LOOP     │                            │
│                    │   (Fate Emerges)      │                            │
│                    ╰───────────┬───────────╯                            │
│                                │                                         │
│         ┌──────────────────────┼──────────────────────┐                 │
│         │                      ▼                      │                 │
│         │    ┌─────────────────────────────────┐     │                 │
│         │    │  1. HYPOTHESIZE (Wyrd Phase 1)  │     │                 │
│         │    │     "I believe this is          │     │                 │
│         │    │      Financial effect..."       │     │                 │
│         │    └──────────────┬──────────────────┘     │                 │
│         │                   ▼                        │                 │
│         │    ┌─────────────────────────────────┐     │                 │
│         │    │  2. GENERATE (Glyph)            │     │                 │
│         │    │     Create component with       │     │                 │
│         │    │     physics from hypothesis     │     │                 │
│         │    └──────────────┬──────────────────┘     │                 │
│         │                   ▼                        │                 │
│         │    ┌─────────────────────────────────┐     │                 │
│         │    │  3. SELF-VALIDATE (Wyrd + Rigor)│◄────┤ Rigor checks   │
│         │    │     Does code match hypothesis? │     │ run here       │
│         │    │     Auto-repair if needed       │     │                 │
│         │    └──────────────┬──────────────────┘     │                 │
│         │                   ▼                        │                 │
│         │    ┌─────────────────────────────────┐     │                 │
│         │    │  4. PRESENT TO USER             │     │                 │
│         │    │     Show hypothesis + code      │     │                 │
│         │    └──────────────┬──────────────────┘     │                 │
│         │                   ▼                        │                 │
│         │    ┌─────────────────────────────────┐     │                 │
│         │    │  5. CAPTURE FEEDBACK            │     │                 │
│         │    │     Accept / Reject+Why         │     │                 │
│         │    └──────────────┬──────────────────┘     │                 │
│         │                   ▼                        │                 │
│         │    ┌─────────────────────────────────┐     │                 │
│         │    │  6. LEARN (Wyrd → Sigil)        │─────┤► Updates       │
│         │    │     Update taste, adjust        │     │  taste.md      │
│         │    │     confidence, log rejection   │     │                 │
│         │    └─────────────────────────────────┘     │                 │
│         │                                            │                 │
│         └────────────────────────────────────────────┘                 │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                    MEMORY (Loa Blackboard)                      │     │
│  ├────────────────────────────────────────────────────────────────┤     │
│  │  NOTES.md           │ grimoires/rune/     │ .beads/            │     │
│  │  - Design Physics   │ - taste.md (Sigil)  │ - Task decisions   │     │
│  │  - Decisions        │ - wyrd.md (Wyrd)    │ - Handoffs         │     │
│  │  - Session state    │ - rejections.md     │                    │     │
│  │                     │ - patterns.md       │                    │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  "What will be is what survives the test."                              │
│                                                                          │
│  • Each rejection refines Wyrd's confidence calibration                 │
│  • Patterns mature: Observation → Pattern → Rule                        │
│  • Sigil learns from Wyrd; Glyph reads from Sigil                       │
│  • The loop compounds alignment over time                               │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Appendix E: Rejection Log Schema

```yaml
# grimoires/rune/rejections.md entry format
rejection:
  id: "rej-2026-01-25-001"
  timestamp: "2026-01-25T14:30:00Z"
  component: "ClaimButton"
  sprint: "sprint-3"

  hypothesis:
    effect: "Financial"
    timing: 800
    confidence: 0.85

  rejection:
    type: "modification"  # or "explicit_no"
    changes:
      - field: "timing"
        from: 800
        to: 500
      - field: "animation"
        from: "ease-out"
        to: "spring(500, 30)"
    reason: "Power users find 800ms sluggish"  # if provided

  outcome:
    taste_created: true
    taste_id: "taste-2026-01-25-003"
    pattern_detected: true  # 3rd similar rejection
    tier_promotion: "observation → pattern"

  impact:
    future_confidence_adjustment: -0.15  # for Financial + timing
    similar_rejections_count: 3
```

### Appendix F: Wyrd State Schema

```yaml
# grimoires/rune/wyrd.md format

## Wyrd State

### Confidence Calibration

| Effect | Base Confidence | Adjustment | Current | Last Updated |
|--------|-----------------|------------|---------|--------------|
| Financial | 0.90 | -0.05 | 0.85 | 2026-01-25 |
| Destructive | 0.90 | 0.00 | 0.90 | 2026-01-20 |
| Standard | 0.85 | +0.05 | 0.90 | 2026-01-24 |
| Local | 0.95 | 0.00 | 0.95 | 2026-01-15 |

### Active Hypotheses

| ID | Component | Effect | Confidence | Status |
|----|-----------|--------|------------|--------|
| hyp-001 | ClaimButton | Financial | 0.85 | Pending validation |
| hyp-002 | ThemeToggle | Local | 0.95 | Validated |

### Pattern Influences

| Pattern | Source | Weight | Applied To |
|---------|--------|--------|------------|
| power-user-timing | 3 rejections | 0.8 | Financial timing |
| springs-everywhere | 5 observations | 0.9 | All animations |

### Learning Metrics

| Metric | Value | Trend |
|--------|-------|-------|
| Total hypotheses | 47 | — |
| Validation rate | 78% | ↑ +3% |
| Avg confidence | 0.87 | ↑ +0.02 |
| Rejections this sprint | 2 | ↓ -3 |
```

### Appendix G: Wyrd Rules Summary

```markdown
# rules/wyrd/00-wyrd-core.md

## Wyrd: Core Philosophy

Wyrd reveals fate through testing. Truth emerges, not assumed.

### When to Use /wyrd

| Situation | Command |
|-----------|---------|
| Check confidence before generating | `/wyrd` |
| Recalibrate after many rejections | `/wyrd calibrate` |
| Validate hypothesis against codebase | `/wyrd test` |
| Extract patterns from rejection log | `/wyrd learn` |

### The Wyrd Principle

> "What will be is what survives the test."

Every hypothesis carries confidence. Every validation refines it.
Rejection is not failure — it's calibration data.

### Confidence Formula

confidence = base_confidence + taste_adjustment + rejection_adjustment

Where:
- base_confidence: Effect-specific default (Financial: 0.90, Local: 0.95)
- taste_adjustment: Bonus from matching taste patterns (+0.05 per Tier 2+)
- rejection_adjustment: Penalty from similar rejections (-0.05 per rejection)

### Integration with Other Constructs

| Construct | Wyrd's Role |
|-----------|-------------|
| Sigil | Wyrd feeds rejection learnings → Sigil records as taste |
| Glyph | Wyrd validates hypothesis → Glyph generates with confidence |
| Rigor | Wyrd invokes Rigor during self-validation phase |
```

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product | | | |
| Engineering | | | |
| Design | | | |

---

*Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>*
