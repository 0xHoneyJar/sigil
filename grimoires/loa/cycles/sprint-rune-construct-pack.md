# Sprint Plan: Rune Construct Pack

**PRD**: `grimoires/loa/prd-rune-construct-pack.md`
**SDD**: `grimoires/loa/sdd-rune-construct-pack.md`
**Created**: 2026-01-25
**Status**: Draft

---

## Overview

### Goals

Transform Rune from standalone tools into a fully integrated Loa Construct Pack with:
1. Closed-loop validation (Wyrd) — hypothesis → generate → self-validate → learn
2. Unified memory (NOTES.md integration, grimoires/rune/ state)
3. Progressive disclosure (L0-L4 complexity levels)
4. Workflow hooks (/implement, /review-sprint, /audit-sprint)

### Success Metrics

| Metric | Target |
|--------|--------|
| Hypothesis before generation | 100% |
| Self-validation before presenting | 100% |
| Physics decisions in NOTES.md | 100% logged |
| Session recovery includes craft state | Yes |

### Team & Capacity

| Role | Allocation |
|------|------------|
| Primary Developer | 1 |
| AI Assistant | Continuous |

---

## Sprint 1: Foundation — Pack Structure & Wyrd Core

**Duration**: 1 cycle
**Goal**: Establish pack structure, create Wyrd construct, enable hypothesis-driven generation

### Task 1.1: Create Pack Directory Structure

**Description**: Create the `.claude/constructs/packs/rune/` directory structure with manifest, skills folders, rules folders, hooks, and templates.

**Acceptance Criteria**:
- [ ] Directory structure matches SDD Section 3.1
- [ ] `manifest.yaml` created with pack metadata, dependencies, commands
- [ ] Empty placeholder files for all skills and rules
- [ ] `grimoires/rune/` state directory created with initial files

**Files to Create**:
```
.claude/constructs/packs/rune/
├── manifest.yaml
├── skills/
│   ├── observing/
│   │   ├── SKILL.md
│   │   └── index.yaml
│   ├── fating/
│   │   ├── SKILL.md
│   │   └── index.yaml
│   ├── crafting/
│   │   ├── SKILL.md
│   │   └── index.yaml
│   ├── enforcing/
│   │   ├── SKILL.md
│   │   └── index.yaml
│   ├── physics-reference/
│   │   └── SKILL.md
│   └── patterns-reference/
│       └── SKILL.md
├── rules/
│   └── wyrd/
│       ├── 00-wyrd-core.md
│       ├── 01-wyrd-hypothesis.md
│       └── 02-wyrd-learning.md
├── hooks/
│   ├── implement-hook.md
│   ├── review-sprint-hook.md
│   └── audit-sprint-hook.md
└── templates/
    ├── notes-design-physics.md
    ├── wyrd-state.md
    └── hypothesis-block.md

grimoires/rune/
├── taste.md
├── wyrd.md
├── rejections.md
└── patterns.md
```

**Dependencies**: None
**Effort**: Medium

---

### Task 1.2: Implement Fating Skill (Wyrd)

**Description**: Create the `/wyrd` command skill that provides hypothesis validation, confidence calibration, and pattern learning.

**Acceptance Criteria**:
- [ ] `/wyrd` shows current confidence state from `grimoires/rune/wyrd.md`
- [ ] `/wyrd calibrate` recalculates confidence from rejection history
- [ ] `/wyrd learn` extracts patterns from 3+ similar rejections
- [ ] Skill follows SDD Section 3.3.1 specification

**Implementation Details**:
- Read wyrd.md and display confidence calibration table
- Count rejections by effect type
- Apply decay policy (full: 0-7 days, half: 8-30 days, quarter: 31-90 days)
- Detect patterns when 3+ similar rejections exist

**Files to Create/Modify**:
- `.claude/constructs/packs/rune/skills/fating/SKILL.md`
- `.claude/constructs/packs/rune/skills/fating/index.yaml`

**Dependencies**: Task 1.1
**Effort**: Medium

---

### Task 1.3: Implement Wyrd Rules

**Description**: Create the three Wyrd rule files defining philosophy, hypothesis formation, and learning protocol.

**Acceptance Criteria**:
- [ ] `00-wyrd-core.md` defines "Fate emerges through testing" philosophy
- [ ] `01-wyrd-hypothesis.md` specifies Hypothesis Block format, confidence calculation, signal detection
- [ ] `02-wyrd-learning.md` specifies rejection types, log format, pattern detection, maturity tiers

**Files to Create**:
- `.claude/constructs/packs/rune/rules/wyrd/00-wyrd-core.md`
- `.claude/constructs/packs/rune/rules/wyrd/01-wyrd-hypothesis.md`
- `.claude/constructs/packs/rune/rules/wyrd/02-wyrd-learning.md`

**Dependencies**: Task 1.1
**Effort**: Small

---

### Task 1.4: Integrate Hypothesis Block into Glyph

**Description**: Enhance the crafting skill to output a Hypothesis Block before generating code. User can accept, reject with feedback, or adjust values.

**Acceptance Criteria**:
- [ ] Before generating, Glyph outputs Hypothesis Block:
  ```
  ## Hypothesis

  **Effect**: Financial (detected: "claim" keyword)
  **Physics**: Pessimistic sync, 800ms timing, confirmation required
  **Taste Applied**: [none or overrides]
  **Confidence**: 0.85

  Does this match your intent? [y/n/adjust]
  ```
- [ ] On `y`: proceed to generation
- [ ] On `n + reason`: log to rejections.md, ask for correction
- [ ] On `adjust <field> <value>`: modify and proceed

**Implementation Details**:
- Read taste.md for preferences
- Detect effect from keywords/types
- Look up physics from rules
- Calculate confidence from wyrd.md
- Present hypothesis, await user confirmation

**Files to Modify**:
- `.claude/constructs/packs/rune/skills/crafting/SKILL.md`

**Dependencies**: Task 1.2, Task 1.3
**Effort**: Large

---

### Task 1.5: Create State File Templates

**Description**: Create initial state file templates for grimoires/rune/ with proper formatting.

**Acceptance Criteria**:
- [ ] `taste.md` template with header and example format
- [ ] `wyrd.md` template with confidence calibration table, empty hypotheses, metrics
- [ ] `rejections.md` template with append-only log format
- [ ] `patterns.md` template for extracted patterns

**Files to Create**:
- `.claude/constructs/packs/rune/templates/wyrd-state.md`
- `grimoires/rune/taste.md` (initial)
- `grimoires/rune/wyrd.md` (initial)
- `grimoires/rune/rejections.md` (initial)
- `grimoires/rune/patterns.md` (initial)

**Dependencies**: Task 1.1
**Effort**: Small

---

### Task 1.6: NOTES.md Design Physics Section

**Description**: Create template and integration for adding "Design Physics (Rune)" section to NOTES.md.

**Acceptance Criteria**:
- [ ] Template created at `templates/notes-design-physics.md`
- [ ] Section includes: Active Craft, Taste Applied, Physics Decisions table, Wyrd State
- [ ] Section can be appended to existing NOTES.md
- [ ] Format matches SDD Section 5.1

**Template Content**:
```markdown
## Design Physics (Rune)

### Active Craft
- **Component**: [none]
- **Effect**: [none]
- **Physics**: [none]
- **Iteration**: 0
- **Confidence**: [none]

### Taste Applied
[No taste entries yet. Use /sigil to record preferences.]

### Physics Decisions
| Date | Component | Effect | Timing | Taste Override | Rationale |
|------|-----------|--------|--------|----------------|-----------|

### Wyrd State
- **Last Calibration**: [never]
- **Total Hypotheses**: 0
- **Validation Rate**: —
- **Avg Confidence**: —
```

**Dependencies**: Task 1.1
**Effort**: Small

---

## Sprint 2: Hypothesis & Confidence

**Duration**: 1 cycle
**Goal**: Complete hypothesis-driven generation with confidence calibration and NOTES.md logging

### Task 2.1: Confidence Calculation Logic

**Description**: Implement the confidence calculation formula that adjusts based on taste matches and rejection history.

**Acceptance Criteria**:
- [ ] Base confidence by effect type:
  - Financial: 0.90
  - Destructive: 0.90
  - Standard: 0.85
  - Local: 0.95
- [ ] +0.05 per Tier 2+ taste match
- [ ] -0.05 per similar rejection in last 30 days
- [ ] -0.10 if same component was rejected before
- [ ] Confidence displayed in hypothesis block

**Implementation Details**:
- Read wyrd.md for current calibration state
- Read taste.md for relevant entries
- Read rejections.md for recent rejections
- Calculate final confidence with formula
- Update wyrd.md with new state

**Dependencies**: Task 1.4, Task 1.5
**Effort**: Medium

---

### Task 2.2: Rejection Capture (Explicit No)

**Description**: When user rejects a hypothesis with `n`, capture the rejection with reason and log to rejections.md.

**Acceptance Criteria**:
- [ ] On `n`, prompt for reason: "What should be different?"
- [ ] Log rejection to `grimoires/rune/rejections.md`:
  ```markdown
  ## 2026-01-25 14:30 - ComponentName Rejection

  **Hypothesis**:
  - Effect: Financial
  - Timing: 800ms
  - Confidence: 0.85

  **Rejection**:
  - Type: explicit_no
  - Reason: [user provided]

  **Outcome**:
  - Taste Created: no
  - Pattern Detected: no
  ```
- [ ] Prompt: "Record as taste? [y/n]"
- [ ] If yes, invoke /sigil with context

**Dependencies**: Task 1.4
**Effort**: Medium

---

### Task 2.3: Log Physics Decisions to NOTES.md

**Description**: After successful generation, log the physics decision to the NOTES.md Design Physics section.

**Acceptance Criteria**:
- [ ] Every `/glyph` generation appends to Physics Decisions table:
  ```
  | 2026-01-25 | ClaimButton | Financial | 500ms | power-user-timing | Sprint-1 requirement |
  ```
- [ ] Active Craft updated with current component info
- [ ] Wyrd State section updated with latest metrics

**Implementation Details**:
- Read current NOTES.md
- Parse Design Physics section
- Append new row to Physics Decisions table
- Update Active Craft fields
- Write back to NOTES.md

**Dependencies**: Task 1.6
**Effort**: Medium

---

### Task 2.4: Mode Detection for Glyph

**Description**: Implement mode detection so Glyph can analyze, generate, validate, or diagnose based on keywords and flags.

**Acceptance Criteria**:
- [ ] `/glyph "claim button"` → Generate mode (default)
- [ ] `/glyph --analyze "claim button"` → Analyze mode (physics only, no generation)
- [ ] `/glyph validate file.tsx` → Validate mode (check existing component)
- [ ] `/glyph --diagnose file.tsx` → Diagnose mode (suggest fixes)
- [ ] Keywords detected: "what/why/explain" → Analyze, "fix/broken/wrong" → Diagnose

**Implementation Details**:
- Parse command arguments for flags
- Detect keywords in description
- Route to appropriate workflow
- Analyze mode shows hypothesis without generating

**Dependencies**: Task 1.4
**Effort**: Medium

---

### Task 2.5: Progressive Disclosure L1-L3

**Description**: Implement progressive disclosure levels L1 (physics summary), L2 (clarifying questions), L3 (generation).

**Acceptance Criteria**:
- [ ] **L0**: Nothing shown until description provided
- [ ] **L1**: Hypothesis box shown (<100 tokens)
- [ ] **L2**: If ambiguous (confidence < 0.75), ask clarifying question
- [ ] **L3**: On confirmation, generate complete component

**Implementation Details**:
- L1: Hypothesis block format
- L2: "This could be [X] or [Y]. Which is intended?"
- L3: Full code generation
- Reference skills NOT loaded at L1-L3

**Dependencies**: Task 2.1, Task 2.4
**Effort**: Medium

---

### Task 2.6: Implement Hook - /implement

**Description**: Create hook that suggests Glyph invocation for UI tasks during `/implement`.

**Acceptance Criteria**:
- [ ] Hook activates when task has "UI" or "component" keywords
- [ ] Hook activates when task references .tsx/.jsx file
- [ ] Prompt: "This appears to be a UI component. Generate with /glyph? [y/n]"
- [ ] If yes, invoke `/glyph` with task description
- [ ] Hook document at `hooks/implement-hook.md`

**Dependencies**: Task 1.4
**Effort**: Small

---

## Sprint 3: Self-Validation

**Duration**: 1 cycle
**Goal**: Glyph validates its own output before presenting, auto-repairs simple violations

### Task 3.1: Physics Compliance Check

**Description**: After generating code, verify it matches the stated physics (sync strategy, timing, confirmation).

**Acceptance Criteria**:
- [ ] Check for `onMutate` when sync is Pessimistic → violation
- [ ] Check for loading states when sync is Pessimistic → required
- [ ] Check timing values match or exceed physics table
- [ ] Check confirmation step present for Financial/Destructive

**Validation Output**:
```
## Self-Validation
✓ Physics: Pessimistic sync implemented correctly
✓ Timing: 800ms matches Financial effect
✓ Confirmation: Two-phase confirmation present
```

**Dependencies**: Task 2.3
**Effort**: Large

---

### Task 3.2: Protected Capability Check

**Description**: Verify generated code doesn't violate protected capabilities (cancel visibility, withdraw reachability, etc.).

**Acceptance Criteria**:
- [ ] Cancel button not hidden during loading: `{!isPending && <Cancel />}` → violation
- [ ] Withdraw always reachable (not behind loading state)
- [ ] Touch targets >= 44px
- [ ] Focus ring visible

**Validation Output**:
```
✓ Protected: Cancel button present and visible
✓ Protected: Withdraw always reachable
✗ Protected: Touch target 32px (minimum 44px)
  → Auto-repair: Added min-h-[44px] class
```

**Dependencies**: Task 3.1
**Effort**: Medium

---

### Task 3.3: Rigor Check Integration

**Description**: If web3 patterns detected, run Rigor checks as part of self-validation.

**Acceptance Criteria**:
- [ ] Detect web3 patterns: useWriteContract, BigInt, transaction keywords
- [ ] Check BigInt safety: `if (amount)` → HIGH violation
- [ ] Check data source: Transaction amounts from on-chain, not indexer
- [ ] Check receipt guard: hash comparison in useEffect

**Validation Output**:
```
✓ Rigor: BigInt checks use `!= null && > 0n`
⚠ Rigor: Missing receipt guard on line 45
  → Suggested fix: Add transactionHash comparison
```

**Dependencies**: Task 3.1
**Effort**: Medium

---

### Task 3.4: Auto-Repair Simple Violations

**Description**: When self-validation finds simple violations, auto-repair before presenting to user.

**Acceptance Criteria**:
- [ ] Auto-repair touch target violations (add min-h class)
- [ ] Auto-repair missing focus ring (add focus-visible class)
- [ ] Auto-repair BigInt falsy check (`if (amount)` → `if (amount != null && amount > 0n)`)
- [ ] Show "[Auto-repaired: ...]" in validation output

**Auto-repair NOT for**:
- Missing confirmation step (requires code restructure)
- Wrong sync strategy (requires architecture change)
- Protected capability violation (requires user decision)

**Dependencies**: Task 3.1, Task 3.2, Task 3.3
**Effort**: Medium

---

### Task 3.5: Self-Validation Summary Display

**Description**: Format and display the self-validation summary after generation.

**Acceptance Criteria**:
- [ ] Show checkmarks for passing checks
- [ ] Show warnings for WARN-level issues
- [ ] Show blocks for BLOCK-level issues
- [ ] Show auto-repair notes
- [ ] If any BLOCK: refuse to write file, show fix suggestion

**Format**:
```
## Self-Validation
✓ Physics: Pessimistic sync implemented correctly
✓ Protected: Cancel button present and visible
✓ Rigor: BigInt checks use `!= null && > 0n`

[Auto-repaired: Added min-h-[44px] to button]
```

**Dependencies**: Task 3.4
**Effort**: Small

---

### Task 3.6: Review Sprint Hook

**Description**: Create hook that runs physics validation during `/review-sprint`.

**Acceptance Criteria**:
- [ ] Scan modified .tsx/.jsx files in sprint scope
- [ ] Run `/glyph validate` on each component
- [ ] Collect violations into report
- [ ] BLOCK violations fail the review
- [ ] WARN violations noted but don't fail

**Report Format**:
```markdown
## Physics Validation

### ClaimButton.tsx
✓ Effect: Financial (detected correctly)
✓ Sync: Pessimistic (no onMutate)
⚠ Timing: 500ms (below 800ms minimum)
  → Taste override: power-user-timing (Tier 2) - allowed

### Summary
- 2 components checked
- 1 passed, 1 with warnings
```

**Dependencies**: Task 3.5
**Effort**: Medium

---

## Sprint 4: Learning & Patterns

**Duration**: 1 cycle
**Goal**: Capture rejections from file modifications, detect patterns, promote to taste

### Task 4.1: Rejection Capture (File Modification)

**Description**: Monitor for file modifications after generation, analyze changes, prompt for taste capture.

**Acceptance Criteria**:
- [ ] After `/glyph` generation, note file path and timestamp
- [ ] If file modified within 30 minutes, trigger analysis
- [ ] Parse git diff to identify physics-relevant changes
- [ ] Display prompt with changes detected

**Prompt Format**:
```
Detected modification to ClaimButton.tsx

Changes detected:
- Timing: 800ms → 500ms (line 23)
- Animation: ease-out → spring(500, 30) (line 45)

Record as taste? [y/n]
```

**Dependencies**: Task 2.2
**Effort**: Large

---

### Task 4.2: Change Analysis for Physics

**Description**: Analyze file changes to detect physics-relevant modifications (timing, sync, animation).

**Acceptance Criteria**:
- [ ] Detect timing changes (numeric ms values)
- [ ] Detect animation changes (easing, spring)
- [ ] Detect sync changes (onMutate presence)
- [ ] Detect confirmation changes (modal, dialog)
- [ ] Map changes to physics fields

**Dependencies**: Task 4.1
**Effort**: Medium

---

### Task 4.3: Pattern Detection Algorithm

**Description**: Detect patterns when 3+ similar rejections exist (same effect + same change type).

**Acceptance Criteria**:
- [ ] Read rejections.md for all entries
- [ ] Group by effect type + change field
- [ ] If 3+ similar: create pattern entry
- [ ] Pattern entry includes:
  - Source (N rejections)
  - Change description
  - Weight (based on consistency)

**Dependencies**: Task 4.1, Task 4.2
**Effort**: Medium

---

### Task 4.4: Taste Capture from Rejection

**Description**: When user confirms recording as taste, create Sigil entry with context.

**Acceptance Criteria**:
- [ ] Generate taste entry with:
  - Timestamp
  - Change description
  - Context (sprint, component)
  - Tier 1 (observation)
- [ ] Append to `grimoires/rune/taste.md`
- [ ] Update rejection outcome in `rejections.md`

**Taste Entry Format**:
```markdown
## 2026-01-25 14:30

They prefer 500ms for financial operations, not 800ms.
Power users find 800ms sluggish.

Context: Sprint-1, ClaimButton
Tier: 1 (observation)

---
```

**Dependencies**: Task 4.1
**Effort**: Small

---

### Task 4.5: Maturity Tier Promotion

**Description**: Implement tier promotion logic: observation → pattern → rule.

**Acceptance Criteria**:
- [ ] **Tier 1 (Observation)**: Single instance, applied with note
- [ ] **Tier 2 (Pattern)**: 3+ similar, applied with moderate confidence
- [ ] **Tier 3 (Rule)**: User-promoted, applied always
- [ ] `/sigil --status` shows maturity distribution
- [ ] Glyph reads tier and adjusts confidence

**Promotion Trigger**:
- Auto-promote to Tier 2 when pattern detected
- Manual promote to Tier 3 via `/sigil promote <id>`

**Dependencies**: Task 4.3
**Effort**: Medium

---

### Task 4.6: Confidence Recalibration

**Description**: Update confidence calibration based on new rejections and patterns.

**Acceptance Criteria**:
- [ ] After rejection logged, update wyrd.md
- [ ] Apply decay to old rejections
- [ ] Recalculate adjustment factors by effect
- [ ] `/wyrd calibrate` triggers full recalculation

**Update Logic**:
- Count rejections by effect (with decay weights)
- Calculate adjustment: -0.05 per rejection
- Cap adjustment at -0.30
- Update Confidence Calibration table in wyrd.md

**Dependencies**: Task 2.1, Task 4.1
**Effort**: Medium

---

## Sprint 5: Workflow Integration

**Duration**: 1 cycle
**Goal**: Complete workflow hooks for sprint-plan, review, and audit

### Task 5.1: Sprint Planning Hook

**Description**: Detect UI tasks during `/sprint-plan` and suggest physics requirements.

**Acceptance Criteria**:
- [ ] Detect UI keywords: button, modal, form, dialog, panel
- [ ] Detect action keywords: claim, delete, submit, transfer
- [ ] Run effect detection on task description
- [ ] Append physics requirements to acceptance criteria

**Physics Suggestion**:
```
## Physics Requirements
- Effect: Financial
- Sync: Pessimistic
- Timing: 800ms minimum
- Confirmation: Required
```

**Dependencies**: Task 2.4
**Effort**: Medium

---

### Task 5.2: Audit Sprint Hook

**Description**: Run Rigor checks during `/audit-sprint` on web3 files.

**Acceptance Criteria**:
- [ ] Detect web3 patterns in files
- [ ] Run `/rigor` on detected files
- [ ] Report with severity classification
- [ ] CRITICAL findings block audit approval

**Report Format**:
```markdown
## Rigor Validation (Web3 Safety)

### VaultWithdraw.tsx
CRITICAL: Transaction amount from indexed data (line 45)
HIGH: BigInt falsy check (line 67)

### Summary
- 2 files checked
- 2 findings (1 CRITICAL, 1 HIGH)
- CRITICAL findings must be addressed
```

**Dependencies**: Task 3.3
**Effort**: Medium

---

### Task 5.3: Validate Subcommands

**Description**: Implement `/validate physics` and `/validate rigor` for manual validation.

**Acceptance Criteria**:
- [ ] `/validate physics` runs `/glyph validate` on all sprint components
- [ ] `/validate rigor` runs `/rigor` on all web3 files
- [ ] `/validate physics --strict` treats WARN as BLOCK
- [ ] Results logged to `grimoires/loa/a2a/` feedback directory

**Dependencies**: Task 3.6, Task 5.2
**Effort**: Medium

---

### Task 5.4: Taste Capture in Feedback Loops

**Description**: After sprint review feedback, prompt for design preference recording.

**Acceptance Criteria**:
- [ ] After engineer feedback collected, prompt appears
- [ ] "Any design preferences to record as taste? [y/n]"
- [ ] If yes, open `/sigil` with context
- [ ] Include sprint and component references

**Dependencies**: Task 4.4
**Effort**: Small

---

### Task 5.5: Progressive Disclosure L4

**Description**: Implement L4 disclosure level for "why?" questions.

**Acceptance Criteria**:
- [ ] On "why?" during generation, load full physics explanation
- [ ] Invoke `physics-reference` skill
- [ ] Show timing rationale, research backing
- [ ] ~500 token budget for L4

**Dependencies**: Task 2.5
**Effort**: Small

---

### Task 5.6: Session Continuity for Rune

**Description**: Add Rune context to Session Continuity section in NOTES.md.

**Acceptance Criteria**:
- [ ] Session Continuity includes Rune Context (~50 tokens):
  ```markdown
  ### Rune Context
  - **Active Craft**: ClaimButton (iteration 2)
  - **Effect**: Financial
  - **Last Action**: generated
  - **Taste Applied**: [power-user-timing]
  - **Wyrd Confidence**: 0.85
  ```
- [ ] Restored after `/clear`

**Dependencies**: Task 2.3
**Effort**: Small

---

## Sprint 6: Reality Anchoring & Polish

**Duration**: 1 cycle
**Goal**: Validate against tests, polish experience, handle edge cases

### Task 6.1: Reality Anchoring - Test Integration

**Description**: If component has associated test file, validate physics against test expectations.

**Acceptance Criteria**:
- [ ] Detect test file: `ComponentName.test.tsx`
- [ ] Parse test assertions for physics-relevant expectations
- [ ] Compare with generated physics
- [ ] Flag conflicts for resolution

**Reality Check Output**:
```
## Reality Check

Found test: ClaimButton.test.tsx

Test expects:
- Loading state during mutation ✓
- 800ms timeout on pending ✓
- Confirmation modal before action ✓

Physics validated against test expectations.
```

**Dependencies**: Task 3.1
**Effort**: Large

---

### Task 6.2: Physics Conflict Resolution

**Description**: When test expectations conflict with physics, provide options for resolution.

**Acceptance Criteria**:
- [ ] Detect conflict between test and physics
- [ ] Present options:
  1. Update test to match physics (recommended for Financial)
  2. Override physics (requires explicit confirmation)
- [ ] Log resolution to NOTES.md

**Dependencies**: Task 6.1
**Effort**: Medium

---

### Task 6.3: Standalone Mode Detection

**Description**: Detect when Loa is not present and run in standalone mode.

**Acceptance Criteria**:
- [ ] Check for `.loa-version.json`
- [ ] If missing: skip workflow hooks, skip NOTES.md integration
- [ ] Commands still work: /sigil, /glyph, /rigor, /wyrd
- [ ] Use grimoires/rune/ for state only

**Dependencies**: None
**Effort**: Small

---

### Task 6.4: Error Handling & Graceful Degradation

**Description**: Handle missing state files, malformed data, and edge cases gracefully.

**Acceptance Criteria**:
- [ ] Missing grimoires/rune/ → create with defaults
- [ ] Malformed taste.md → skip entries, log warning
- [ ] Missing wyrd.md → use base confidence
- [ ] Corrupted rejections.md → archive, start fresh

**Dependencies**: None
**Effort**: Medium

---

### Task 6.5: Pack Installation Script

**Description**: Create installation process that copies pack to constructs directory.

**Acceptance Criteria**:
- [ ] `loa install rune` copies pack to `.claude/constructs/packs/rune/`
- [ ] Creates `grimoires/rune/` with initial state files
- [ ] Adds Design Physics section to NOTES.md
- [ ] Registers commands: /sigil, /glyph, /rigor, /wyrd

**Dependencies**: Task 1.1
**Effort**: Medium

---

### Task 6.6: Documentation & README

**Description**: Create pack documentation for users.

**Acceptance Criteria**:
- [ ] README.md with usage instructions
- [ ] Four construct overview (Sigil/Glyph/Rigor/Wyrd)
- [ ] Physics table reference
- [ ] Example workflows

**Dependencies**: All previous
**Effort**: Small

---

## Sprint Summary

| Sprint | Focus | Key Deliverables |
|--------|-------|------------------|
| Sprint 1 | Foundation | Pack structure, Wyrd skill, Hypothesis integration |
| Sprint 2 | Hypothesis | Confidence calculation, Rejection capture, NOTES.md logging |
| Sprint 3 | Self-Validation | Physics/Protected/Rigor checks, Auto-repair |
| Sprint 4 | Learning | File modification detection, Pattern detection, Tier promotion |
| Sprint 5 | Workflow | Sprint-plan/Review/Audit hooks, Validate commands |
| Sprint 6 | Polish | Test integration, Error handling, Installation |

---

## Dependencies Graph

```
Sprint 1: Foundation
├── Task 1.1: Pack Structure (no deps)
│   ├── Task 1.2: Fating Skill
│   ├── Task 1.3: Wyrd Rules
│   ├── Task 1.5: State Templates
│   └── Task 1.6: NOTES.md Template
└── Task 1.4: Hypothesis in Glyph (needs 1.2, 1.3)

Sprint 2: Hypothesis
├── Task 2.1: Confidence Calc (needs 1.4, 1.5)
├── Task 2.2: Rejection Capture (needs 1.4)
├── Task 2.3: NOTES.md Logging (needs 1.6)
├── Task 2.4: Mode Detection (needs 1.4)
├── Task 2.5: Progressive L1-L3 (needs 2.1, 2.4)
└── Task 2.6: Implement Hook (needs 1.4)

Sprint 3: Self-Validation
├── Task 3.1: Physics Check (needs 2.3)
├── Task 3.2: Protected Check (needs 3.1)
├── Task 3.3: Rigor Check (needs 3.1)
├── Task 3.4: Auto-Repair (needs 3.1-3.3)
├── Task 3.5: Validation Summary (needs 3.4)
└── Task 3.6: Review Hook (needs 3.5)

Sprint 4: Learning
├── Task 4.1: File Modification Capture (needs 2.2)
├── Task 4.2: Change Analysis (needs 4.1)
├── Task 4.3: Pattern Detection (needs 4.1, 4.2)
├── Task 4.4: Taste Capture (needs 4.1)
├── Task 4.5: Tier Promotion (needs 4.3)
└── Task 4.6: Confidence Recalibration (needs 2.1, 4.1)

Sprint 5: Workflow
├── Task 5.1: Sprint Planning Hook (needs 2.4)
├── Task 5.2: Audit Hook (needs 3.3)
├── Task 5.3: Validate Commands (needs 3.6, 5.2)
├── Task 5.4: Taste in Feedback (needs 4.4)
├── Task 5.5: Progressive L4 (needs 2.5)
└── Task 5.6: Session Continuity (needs 2.3)

Sprint 6: Polish
├── Task 6.1: Reality Anchoring (needs 3.1)
├── Task 6.2: Conflict Resolution (needs 6.1)
├── Task 6.3: Standalone Mode (no deps)
├── Task 6.4: Error Handling (no deps)
├── Task 6.5: Installation (needs 1.1)
└── Task 6.6: Documentation (needs all)
```

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Token budget pressure | Strict L1 < 100 tokens, lazy load reference skills |
| File modification detection complexity | Use git diff, 30-minute window |
| Pattern detection false positives | Require 3+ similar, consistent direction |
| Workflow hook intrusiveness | All prompts skippable, disable option |

---

## Success Criteria

| Metric | Sprint 1-2 | Sprint 3-4 | Sprint 5-6 |
|--------|------------|------------|------------|
| Hypothesis before generation | 100% | 100% | 100% |
| Self-validation | 0% | 100% | 100% |
| Rejections captured | Manual | 80% | 100% |
| Patterns detected | 0 | 3+ | 5+ |
| NOTES.md logging | Basic | Full | Full |

---

*Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>*
