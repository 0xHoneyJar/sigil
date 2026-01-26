# Software Design Document: Rune Construct Pack for Loa

**Version**: 1.0.0
**Status**: Draft
**Created**: 2026-01-25
**Author**: Claude Opus 4.5
**PRD Reference**: `grimoires/loa/prd-rune-construct-pack.md`

---

## 1. Executive Summary

This document details the technical architecture for integrating the Rune design physics framework as a Loa Construct Pack. The design prioritizes:

1. **Seamless Loa Integration** — Workflow hooks, unified memory, construct registry
2. **Closed-Loop Validation** — Hypothesis → Generate → Self-Validate → Learn cycle
3. **Progressive Disclosure** — L0-L4 complexity levels, on-demand rule loading
4. **Token Efficiency** — <100 tokens for L1, <50 tokens for session recovery

**Key Architectural Decisions**:
- Pack-based distribution via Loa Construct Registry
- Wyrd as orchestration layer coordinating Sigil/Glyph/Rigor
- NOTES.md integration for persistent design physics state
- Rejection-driven learning with maturity tiers

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    RUNE CONSTRUCT PACK ARCHITECTURE                       │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                      LOA WORKFLOW LAYER                              ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            ││
│  │  │ /sprint- │  │/implement│  │ /review- │  │ /audit-  │            ││
│  │  │  plan    │  │          │  │  sprint  │  │  sprint  │            ││
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘            ││
│  │       │             │             │             │                   ││
│  │       └──────┬──────┴──────┬──────┴──────┬──────┘                   ││
│  │              │             │             │                          ││
│  │              ▼             ▼             ▼                          ││
│  │  ┌─────────────────────────────────────────────────────────────┐   ││
│  │  │                    WORKFLOW HOOKS                            │   ││
│  │  │   physics-suggest   glyph-invoke   glyph-validate   rigor   │   ││
│  │  └─────────────────────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                    RUNE CONSTRUCT LAYER                              ││
│  │                                                                      ││
│  │   ╭──────────╮    ╭──────────╮    ╭──────────╮    ╭──────────╮     ││
│  │   │  SIGIL   │◄───│  WYRD    │───►│  GLYPH   │───►│  RIGOR   │     ││
│  │   │  (WHY)   │    │  (IF)    │    │  (HOW)   │    │  (WHAT)  │     ││
│  │   │  Taste   │    │  Fate    │    │  Craft   │    │ Correct  │     ││
│  │   ╰────┬─────╯    ╰────┬─────╯    ╰────┬─────╯    ╰────┬─────╯     ││
│  │        │               │               │               │            ││
│  │   preferences     orchestration    generation      validation       ││
│  │   learning        confidence       physics         data safety      ││
│  │   patterns        hypothesis       animation       BigInt/Web3      ││
│  │        │               │               │               │            ││
│  │        └───────────────┴───────┬───────┴───────────────┘            ││
│  │                                │                                     ││
│  │                                ▼                                     ││
│  │  ┌─────────────────────────────────────────────────────────────┐   ││
│  │  │                    SKILLS LAYER                              │   ││
│  │  │   observing   fating   crafting   enforcing   *-reference   │   ││
│  │  └─────────────────────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                    MEMORY LAYER (Loa Blackboard)                     ││
│  │                                                                      ││
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        ││
│  │  │   NOTES.md     │  │ grimoires/rune │  │    .beads/     │        ││
│  │  │  - Design      │  │  - taste.md    │  │  - Tasks       │        ││
│  │  │    Physics     │  │  - wyrd.md     │  │  - Handoffs    │        ││
│  │  │  - Decisions   │  │  - rejections  │  │                │        ││
│  │  │  - Session     │  │  - patterns    │  │                │        ││
│  │  └────────────────┘  └────────────────┘  └────────────────┘        ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Construct Interactions

```
┌─────────────────────────────────────────────────────────────────┐
│                  THE WYRD LOOP (Closed-Loop)                     │
└─────────────────────────────────────────────────────────────────┘

User: /glyph "claim button"
                    │
                    ▼
            ┌───────────────┐
            │  WYRD Phase 1 │ ◄─── taste.md (Sigil)
            │  Hypothesize  │      patterns.md
            └───────┬───────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  ## Hypothesis        │
        │  Effect: Financial    │
        │  Physics: Pessimistic │
        │  Timing: 500ms (taste)│
        │  Confidence: 0.85     │
        └───────────┬───────────┘
                    │
        User: [y/n/adjust]
                    │
            ┌───────┴───────┐
            │               │
            ▼               ▼
    ┌───────────┐    ┌───────────┐
    │  Accept   │    │  Reject   │
    │  (y)      │    │  (n)      │
    └─────┬─────┘    └─────┬─────┘
          │                │
          ▼                ▼
  ┌───────────────┐  ┌───────────────┐
  │ GLYPH Phase 2 │  │ WYRD Phase 3  │
  │   Generate    │  │    Learn      │
  └───────┬───────┘  └───────┬───────┘
          │                  │
          ▼                  ▼
  ┌───────────────┐  ┌───────────────┐
  │ WYRD Phase 2  │  │ rejections.md │
  │ Self-Validate │  │ taste.md      │
  │  + RIGOR      │  │ (update)      │
  └───────┬───────┘  └───────────────┘
          │
          ▼
  ┌───────────────┐
  │ Present Code  │
  │ + Validation  │
  └───────┬───────┘
          │
          ▼
  ┌───────────────┐
  │ Monitor Edits │ ◄─── 30 minute window
  │ (File Watch)  │
  └───────┬───────┘
          │
    User edits file?
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
  ┌─────┐   ┌─────────────┐
  │ No  │   │ WYRD Phase 3│
  │     │   │ Learn from  │
  └─────┘   │ modification│
            └─────────────┘
```

### 2.3 Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA FLOW DIAGRAM                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐                                                   │
│  │   User Request   │                                                   │
│  │ "/glyph claim    │                                                   │
│  │  button"         │                                                   │
│  └────────┬─────────┘                                                   │
│           │                                                              │
│           ▼                                                              │
│  ┌──────────────────┐     ┌──────────────────┐                         │
│  │  Effect Detector │◄────│ rules/glyph/     │                         │
│  │  (Keywords+Types)│     │ 02-detection.md  │                         │
│  └────────┬─────────┘     └──────────────────┘                         │
│           │                                                              │
│           ▼                                                              │
│  ┌──────────────────┐     ┌──────────────────┐                         │
│  │  Physics Lookup  │◄────│ rules/glyph/     │                         │
│  │  (Effect→Physics)│     │ 01-physics.md    │                         │
│  └────────┬─────────┘     └──────────────────┘                         │
│           │                                                              │
│           ▼                                                              │
│  ┌──────────────────┐     ┌──────────────────┐                         │
│  │  Taste Override  │◄────│ grimoires/rune/  │                         │
│  │  (Apply prefs)   │     │ taste.md         │                         │
│  └────────┬─────────┘     └──────────────────┘                         │
│           │                                                              │
│           ▼                                                              │
│  ┌──────────────────┐     ┌──────────────────┐                         │
│  │  Confidence Calc │◄────│ grimoires/rune/  │                         │
│  │  (Wyrd state)    │     │ wyrd.md          │                         │
│  └────────┬─────────┘     └──────────────────┘                         │
│           │                                                              │
│           ▼                                                              │
│  ┌──────────────────┐                                                   │
│  │  Hypothesis Box  │────► User (L1: <100 tokens)                       │
│  │  [y/n/adjust]    │                                                   │
│  └────────┬─────────┘                                                   │
│           │                                                              │
│           ▼ (on accept)                                                  │
│  ┌──────────────────┐     ┌──────────────────┐                         │
│  │  Code Generator  │◄────│ rules/glyph/     │                         │
│  │  (React/TSX)     │     │ 04-patterns.md   │                         │
│  └────────┬─────────┘     └──────────────────┘                         │
│           │                                                              │
│           ▼                                                              │
│  ┌──────────────────┐     ┌──────────────────┐                         │
│  │  Self-Validator  │◄────│ rules/rigor/     │                         │
│  │  (Physics+Rigor) │     │ 00-02-*.md       │                         │
│  └────────┬─────────┘     └──────────────────┘                         │
│           │                                                              │
│           ▼                                                              │
│  ┌──────────────────┐                                                   │
│  │  Auto-Repair     │                                                   │
│  │  (if violations) │                                                   │
│  └────────┬─────────┘                                                   │
│           │                                                              │
│           ▼                                                              │
│  ┌──────────────────┐     ┌──────────────────┐                         │
│  │  Write to File   │────►│ NOTES.md         │                         │
│  │  + Log Decision  │     │ (Physics section)│                         │
│  └──────────────────┘     └──────────────────┘                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Design

### 3.1 Pack Structure

```
.claude/constructs/packs/rune/
├── manifest.yaml                    # Pack metadata
├── skills/
│   ├── observing/                   # /sigil skill
│   │   ├── SKILL.md
│   │   └── index.yaml
│   ├── fating/                      # /wyrd skill (NEW)
│   │   ├── SKILL.md
│   │   └── index.yaml
│   ├── crafting/                    # /glyph skill
│   │   ├── SKILL.md
│   │   └── index.yaml
│   ├── enforcing/                   # /rigor skill
│   │   ├── SKILL.md
│   │   └── index.yaml
│   ├── physics-reference/           # Reference skill
│   │   ├── SKILL.md
│   │   └── index.yaml
│   └── patterns-reference/          # Reference skill
│       ├── SKILL.md
│       └── index.yaml
├── rules/
│   ├── sigil/
│   │   ├── 00-sigil-core.md
│   │   └── 01-sigil-taste.md
│   ├── glyph/
│   │   ├── 00-glyph-core.md
│   │   ├── 01-glyph-physics.md
│   │   ├── 02-glyph-detection.md
│   │   ├── 03-glyph-protected.md
│   │   ├── 04-glyph-patterns.md
│   │   ├── 05-glyph-animation.md
│   │   ├── 06-glyph-material.md
│   │   └── 07-glyph-practices.md
│   ├── rigor/
│   │   ├── 00-rigor-core.md
│   │   ├── 01-rigor-data.md
│   │   └── 02-rigor-web3.md
│   └── wyrd/                        # NEW
│       ├── 00-wyrd-core.md
│       ├── 01-wyrd-hypothesis.md
│       └── 02-wyrd-learning.md
├── hooks/
│   ├── sprint-plan-hook.md
│   ├── implement-hook.md
│   ├── review-sprint-hook.md
│   └── audit-sprint-hook.md
└── templates/
    ├── notes-design-physics.md
    ├── wyrd-state.md
    └── hypothesis-block.md

grimoires/rune/                      # State directory
├── taste.md                         # Sigil state
├── wyrd.md                          # Wyrd state
├── rejections.md                    # Rejection history
└── patterns.md                      # Extracted patterns
```

### 3.2 Manifest Schema

```yaml
# .claude/constructs/packs/rune/manifest.yaml
name: rune
version: 1.0.0
description: Design physics for AI-generated UI
author: 0xHoneyJar
license: MIT

# Dependencies
requires:
  loa: ">=1.7.0"

# Pack contents
skills:
  - observing
  - fating
  - crafting
  - enforcing
  - physics-reference
  - patterns-reference

rules:
  - sigil/*
  - glyph/*
  - rigor/*
  - wyrd/*

hooks:
  - sprint-plan-hook
  - implement-hook
  - review-sprint-hook
  - audit-sprint-hook

# State directory created on install
state_directory: grimoires/rune

# Commands registered
commands:
  - name: sigil
    skill: observing
    description: Capture taste observations
  - name: glyph
    skill: crafting
    description: Generate/validate UI components
  - name: rigor
    skill: enforcing
    description: Validate data correctness
  - name: wyrd
    skill: fating
    description: Hypothesis validation and learning

# NOTES.md integration
notes_section:
  name: "Design Physics (Rune)"
  template: templates/notes-design-physics.md
  position: after_learnings
```

### 3.3 Skill Specifications

#### 3.3.1 Fating Skill (Wyrd) — NEW

```yaml
# skills/fating/index.yaml
name: fating
description: Hypothesis validation and closed-loop learning
user-invocable: true
disable-model-invocation: true
allowed-tools:
  - Read
  - Write
  - Glob
triggers:
  commands:
    - wyrd
  keywords:
    - confidence
    - hypothesis
    - calibrate
    - learn
zones:
  system:
    path: .claude
    permission: read
  state:
    paths:
      - grimoires/rune
      - grimoires/loa/NOTES.md
    permission: read-write
```

```markdown
# skills/fating/SKILL.md
---
name: fating
description: Hypothesis validation and closed-loop learning
user-invocable: true
disable-model-invocation: true
allowed-tools:
  - Read
  - Write
  - Glob
---

# Fating

The Wyrd construct: hypothesis validation, confidence calibration, and rejection learning.

## Usage

```
/wyrd                     # Show current confidence state
/wyrd calibrate           # Recalculate from rejection history
/wyrd test hypothesis.md  # Validate hypothesis against codebase
/wyrd learn               # Extract patterns from recent rejections
```

## Workflow: Show State

1. Read `grimoires/rune/wyrd.md`
2. Display confidence calibration table
3. Show active hypotheses
4. Show recent pattern influences

## Workflow: Calibrate

1. Read `grimoires/rune/rejections.md`
2. Count rejections by effect type
3. Calculate adjustment factors
4. Update `grimoires/rune/wyrd.md`

## Workflow: Learn

1. Read recent entries from `grimoires/rune/rejections.md`
2. Detect patterns (3+ similar rejections)
3. Promote to patterns.md
4. Optionally create Sigil taste entries

## Confidence Formula

```
confidence = base_confidence + taste_adjustment + rejection_adjustment

Where:
- base_confidence: Effect-specific default
  - Financial: 0.90
  - Destructive: 0.90
  - Standard: 0.85
  - Local: 0.95

- taste_adjustment: +0.05 per Tier 2+ taste match

- rejection_adjustment: -0.05 per similar rejection
```

## Integration with Other Constructs

| Construct | Wyrd's Role |
|-----------|-------------|
| Sigil | Wyrd feeds rejection learnings → Sigil records as taste |
| Glyph | Wyrd provides confidence → Glyph shows in hypothesis |
| Rigor | Wyrd invokes Rigor during self-validation phase |

## Rules Loaded

- `.claude/rules/wyrd/*.md` (always)

## Philosophy

> "What will be is what survives the test."

Fate emerges through testing. Each rejection refines understanding.
```

#### 3.3.2 Crafting Skill (Glyph) — Enhanced

```markdown
# skills/crafting/SKILL.md (enhanced)
---
name: crafting
description: Generate or validate UI with design physics (Wyrd-integrated)
user-invocable: true
disable-model-invocation: true
allowed-tools:
  - Read
  - Write
  - Glob
---

# Crafting

Generate UI components with correct design physics, with Wyrd closed-loop integration.

## Usage

```
/glyph "component description"       # Generate mode (default)
/glyph --analyze "component"         # Analyze mode (physics only)
/glyph validate file.tsx             # Validate mode
/glyph --diagnose file.tsx           # Diagnose mode (suggest fixes)
```

## Workflow: Generate (Wyrd-Integrated)

### Phase 1: Hypothesis (Wyrd)

1. Read taste.md for user preferences
2. Detect effect from keywords/types
3. Look up physics from rules
4. Calculate confidence from wyrd.md
5. Present Hypothesis Box:

```
## Hypothesis

**Effect**: Financial (detected: "claim" keyword, Amount type)
**Physics**: Pessimistic sync, 800ms timing, confirmation required
**Taste Applied**: 500ms override (power user preference, Tier 2)
**Confidence**: 0.85

Does this match your intent? [y/n/adjust]
```

### Phase 2: Generation (on accept)

1. Generate complete React/TSX code
2. Apply physics rules
3. Match codebase conventions

### Phase 3: Self-Validation (Wyrd + Rigor)

1. Check physics compliance
2. Check protected capabilities
3. Run Rigor checks if web3 detected
4. Auto-repair if violations found
5. Show validation summary:

```
## Self-Validation
✓ Physics: Pessimistic sync implemented correctly
✓ Protected: Cancel button present and visible
✓ Rigor: BigInt checks use `!= null && > 0n`

[Auto-repaired: Added receipt guard on line 45]
```

### Phase 4: Write and Log

1. Write component to file
2. Log decision to NOTES.md Design Physics section
3. Start 30-minute edit monitoring

### Phase 5: Learn from Edits (Wyrd)

If user modifies file within 30 minutes:

1. Detect changes
2. Analyze what changed
3. Prompt: "Record as taste? [y/n]"
4. Log to rejections.md
5. Update confidence calibration

## Rules Loaded

- `.claude/rules/glyph/*.md` (always)
- `.claude/rules/sigil/01-sigil-taste.md` (for reading taste)
- `.claude/rules/wyrd/01-wyrd-hypothesis.md` (for confidence)

## Reference Skills (on-demand)

Load when detailed tables needed:
- `physics-reference` - Full physics tables
- `patterns-reference` - Golden implementations
```

### 3.4 Wyrd Rules

#### 3.4.1 Core Philosophy

```markdown
# rules/wyrd/00-wyrd-core.md

# Wyrd: Core Philosophy

Wyrd (Old English: fate, destiny) reveals truth through testing.

## The Wyrd Principle

> "What will be is what survives the test."

- **Fate emerges through testing** — Truth is revealed, not assumed
- **Rejection is data** — Each "no" teaches the system
- **Confidence calibrates** — Predictions improve with feedback
- **Reality anchors claims** — Validate against real code and tests

## When to Use /wyrd

| Situation | Command |
|-----------|---------|
| Check confidence before generating | `/wyrd` |
| Recalibrate after many rejections | `/wyrd calibrate` |
| Validate hypothesis against codebase | `/wyrd test` |
| Extract patterns from rejection log | `/wyrd learn` |

## Integration with Other Constructs

| Construct | Wyrd's Role |
|-----------|-------------|
| Sigil | Wyrd feeds rejection learnings → Sigil records as taste |
| Glyph | Wyrd validates hypothesis → Glyph generates with confidence |
| Rigor | Wyrd invokes Rigor during self-validation phase |

## The Five Phases

1. **Hypothesize** — Form hypothesis before generation
2. **Self-Validate** — Check output against physics + rigor
3. **Learn** — Capture rejections as training data
4. **Reality Anchor** — Validate against tests when available
5. **Community** — Anonymous telemetry (opt-in)
```

#### 3.4.2 Hypothesis Formation

```markdown
# rules/wyrd/01-wyrd-hypothesis.md

# Wyrd: Hypothesis Formation

Every generation starts with a hypothesis. State what you believe before acting.

## Hypothesis Block Format

```
## Hypothesis

**Effect**: [Effect Type] (detected: [signals])
**Physics**: [Sync] sync, [timing]ms timing, [confirmation]
**Taste Applied**: [override] ([source], [tier])
**Confidence**: [0.00-1.00]

Does this match your intent? [y/n/adjust]
```

## Confidence Calculation

```
confidence = base + taste_adjustment + rejection_adjustment

base_confidence:
  Financial: 0.90
  Destructive: 0.90
  Standard: 0.85
  Local: 0.95

taste_adjustment:
  +0.05 per Tier 2+ taste match

rejection_adjustment:
  -0.05 per similar rejection in last 30 days
  -0.10 if same component rejected before
```

## Signal Detection

| Signal Type | Weight | Example |
|-------------|--------|---------|
| Type annotation | 1.0 | `amount: Currency` |
| Keyword | 0.8 | "claim", "delete" |
| Context phrase | 0.6 | "with undo" |
| Taste match | 0.5 | Previous similar component |

## Displaying Confidence

| Confidence | Display | Action |
|------------|---------|--------|
| >= 0.90 | "High confidence" | Proceed confidently |
| 0.75-0.89 | "Moderate confidence" | Proceed, note uncertainty |
| 0.50-0.74 | "Low confidence" | Ask clarifying question |
| < 0.50 | "Uncertain" | Require explicit confirmation |

## User Responses

| Response | Action |
|----------|--------|
| `y` or `yes` | Proceed with hypothesis |
| `n` or `no` | Capture reason, ask for correction |
| `adjust timing 500` | Modify specific value |
| `adjust sync optimistic` | Modify specific value |
```

#### 3.4.3 Learning Protocol

```markdown
# rules/wyrd/02-wyrd-learning.md

# Wyrd: Learning Protocol

Every rejection makes the system more aligned. Capture them systematically.

## Rejection Types

| Type | Trigger | Capture |
|------|---------|---------|
| Explicit No | User says "no" to hypothesis | Reason if provided |
| Modification | User edits generated file | Diff analysis |
| Regeneration | User requests regeneration | Context change |

## Rejection Log Format

```markdown
## [timestamp] - [component] Rejection

**Hypothesis**: [effect], [timing]ms, [confidence]
**Rejection Type**: [explicit_no | modification | regeneration]
**Changes**:
- [field]: [from] → [to] (line [N])

**Context**: [sprint], [component type]
**Reason**: [user-provided or inferred]

**Outcome**:
- Taste Created: [yes/no] ([taste-id])
- Pattern Detected: [yes/no] ([N] similar)
- Tier Promotion: [observation → pattern | pattern → rule]
```

## Pattern Detection

A pattern is detected when:
- 3+ similar rejections (same effect + same change type)
- Changes are consistent (e.g., always timing reduction)

## Maturity Tiers

| Tier | Threshold | Application |
|------|-----------|-------------|
| 1: Observation | 1 instance | Note in hypothesis: "single observation" |
| 2: Pattern | 3+ instances | Apply with moderate confidence |
| 3: Rule | User promoted | Apply always, no note needed |

## Auto-Capture Workflow

When user edits generated file within 30 minutes:

1. Detect file modification event
2. Run git diff to identify changes
3. Parse changes for physics-relevant modifications
4. Display prompt:

```
Detected modification to ClaimButton.tsx

Changes detected:
- Timing: 800ms → 500ms (line 23)
- Animation: ease-out → spring(500, 30) (line 45)

Record as taste? [y/n]
```

5. If yes: Create Sigil entry with context
6. Log to rejections.md
7. Update wyrd.md confidence

## Decay Policy

Rejections decay over time:
- Full weight: 0-7 days
- Half weight: 8-30 days
- Quarter weight: 31-90 days
- Zero weight: 90+ days

Run `/wyrd calibrate` to apply decay.
```

---

## 4. Workflow Hooks

### 4.1 Sprint Planning Hook

```markdown
# hooks/sprint-plan-hook.md

# Sprint Planning Hook

Detects UI component tasks and suggests physics requirements.

## Trigger

Activated when `/sprint-plan` runs and task description contains:
- UI component keywords: button, modal, form, dialog, panel, card
- Action keywords: claim, delete, submit, transfer, toggle

## Behavior

1. Scan task descriptions for keywords
2. Run effect detection
3. Add physics suggestion to acceptance criteria

## Example

**Task**: Create claim rewards button

**Physics Suggestion Added**:
```
## Physics Requirements
- Effect: Financial
- Sync: Pessimistic (wait for server confirmation)
- Timing: 800ms minimum
- Confirmation: Required (two-phase)
- Protected: Withdraw always reachable, Cancel always visible
```

## Integration Point

In `/sprint-plan` skill:

```markdown
# After generating acceptance criteria...

## Rune Hook: Physics Detection

If task appears UI-related:
1. Read task description
2. Invoke effect detection (rules/glyph/02-detection.md)
3. Look up physics (rules/glyph/01-physics.md)
4. Append physics requirements to acceptance criteria
```
```

### 4.2 Implementation Hook

```markdown
# hooks/implement-hook.md

# Implementation Hook

Suggests Glyph invocation for UI tasks during `/implement`.

## Trigger

Activated when `/implement` works on a task that:
- Has "UI" or "component" in title/description
- References a .tsx or .jsx file
- Contains physics requirements in acceptance criteria

## Behavior

1. Detect UI task
2. Prompt user:
```
This appears to be a UI component task.
Generate with /glyph? [y/n]

Physics Requirements (from sprint):
- Effect: Financial
- Sync: Pessimistic
- Timing: 800ms
```

3. If yes: Invoke `/glyph` with task description
4. Taste from grimoires/rune/taste.md auto-applied
5. Log decision to NOTES.md Design Physics section

## NOTES.md Update

After generation, append to Design Physics section:

```markdown
### Physics Decisions
| Date | Component | Effect | Timing | Taste Override | Rationale |
|------|-----------|--------|--------|----------------|-----------|
| 2026-01-25 | ClaimButton | Financial | 500ms | power-user-timing | Sprint-3 requirement |
```
```

### 4.3 Sprint Review Hook

```markdown
# hooks/review-sprint-hook.md

# Sprint Review Hook

Runs physics validation during `/review-sprint`.

## Trigger

Activated when `/review-sprint` runs.

## Behavior

1. Scan modified .tsx/.jsx files in sprint scope
2. For each file, run `/glyph validate`
3. Collect violations
4. Report alongside test results

## Violation Levels

| Severity | Example | Action |
|----------|---------|--------|
| BLOCK | Protected capability missing | Fail review |
| WARN | Timing below threshold | Note in review |
| INFO | Suboptimal animation | Log only |

## Report Format

```markdown
## Physics Validation

### ClaimButton.tsx
✓ Effect: Financial (detected correctly)
✓ Sync: Pessimistic (no onMutate)
✓ Protected: Cancel visible, Withdraw reachable
⚠ Timing: 500ms (below 800ms minimum for Financial)
  → Taste override detected: power-user-timing (Tier 2)
  → Allowed with taste justification

### DeleteModal.tsx
✗ Protected: Cancel button hidden during loading
  → BLOCK: Protected capability violation
  → Fix: Always render Cancel, disable during loading

### Summary
- 2 components checked
- 1 passed
- 1 blocked (protected violation)
```

## Integration with Feedback Loop

After physics report, prompt:

```
Any design preferences to record as taste? [y/n]
```

If yes: Open `/sigil` with review context.
```

### 4.4 Security Audit Hook

```markdown
# hooks/audit-sprint-hook.md

# Security Audit Hook

Runs Rigor checks during `/audit-sprint`.

## Trigger

Activated when `/audit-sprint` runs and files contain:
- Web3 patterns: useWriteContract, BigInt, transaction flows
- Financial types: Currency, Wei, Token, Amount

## Behavior

1. Detect web3 files via patterns
2. Run `/rigor` on each detected file
3. Collect findings
4. Report with severity classification

## Detection Patterns

```regex
useWriteContract|useReadContract|useSendTransaction
BigInt\(|0n|[0-9]+n
approve|transfer|claim|withdraw|stake|swap
```

## Finding Categories

| Category | Severity | Examples |
|----------|----------|----------|
| Data Source | CRITICAL | Transaction amount from indexed data |
| BigInt Safety | HIGH | `if (amount)` for BigInt |
| Receipt Guard | HIGH | Missing hash comparison |
| Stale Closure | MEDIUM | Captured value in useEffect |

## Report Format

```markdown
## Rigor Validation (Web3 Safety)

### VaultWithdraw.tsx
CRITICAL: Transaction amount from indexed data (line 45)
  → Amount should come from useReadContract, not useEnvioQuery
  → Fix: Replace `envioData.shares` with on-chain read

HIGH: BigInt falsy check (line 67)
  → `if (shares)` fails when shares === 0n
  → Fix: `if (shares != null && shares > 0n)`

### StakingPanel.tsx
HIGH: Missing receipt guard (line 89)
  → useEffect may trigger multiple times
  → Fix: Add transactionHash comparison

### Summary
- 2 files checked
- 4 findings (1 CRITICAL, 2 HIGH, 1 MEDIUM)
- CRITICAL findings must be addressed before approval
```

## Blocking Behavior

- CRITICAL findings: Block audit approval
- HIGH findings: Require explicit acknowledgment
- MEDIUM/LOW: Note for future attention
```

---

## 5. Memory Integration

### 5.1 NOTES.md Section Template

```markdown
# templates/notes-design-physics.md

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
| — | — | — | — | — | — |

### Wyrd State
- **Last Calibration**: [never]
- **Total Hypotheses**: 0
- **Validation Rate**: —
- **Avg Confidence**: —
```

### 5.2 Wyrd State Schema

```yaml
# grimoires/rune/wyrd.md format

## Wyrd State

### Confidence Calibration

| Effect | Base | Adjustment | Current | Last Updated |
|--------|------|------------|---------|--------------|
| Financial | 0.90 | 0.00 | 0.90 | — |
| Destructive | 0.90 | 0.00 | 0.90 | — |
| Standard | 0.85 | 0.00 | 0.85 | — |
| Local | 0.95 | 0.00 | 0.95 | — |

### Active Hypotheses

| ID | Component | Effect | Confidence | Status |
|----|-----------|--------|------------|--------|
| — | — | — | — | — |

### Pattern Influences

| Pattern ID | Source | Weight | Applied To |
|------------|--------|--------|------------|
| — | — | — | — |

### Learning Metrics

| Metric | Value | Trend |
|--------|-------|-------|
| Total hypotheses | 0 | — |
| Validation rate | — | — |
| Avg confidence | — | — |
| Rejections this sprint | 0 | — |
```

### 5.3 Rejection Log Schema

```yaml
# grimoires/rune/rejections.md format

# Rejection Log

<!-- Append-only log of hypothesis rejections -->

## [timestamp] - [component] Rejection

**Hypothesis**:
- Effect: [type]
- Timing: [ms]
- Confidence: [0.00-1.00]

**Rejection**:
- Type: [explicit_no | modification | regeneration]
- Changes:
  - [field]: [from] → [to]
- Reason: [user-provided or inferred]

**Context**:
- Sprint: [sprint-id]
- Component: [name]

**Outcome**:
- Taste Created: [yes/no]
- Pattern Detected: [yes/no]
- Tier Promotion: [none | observation→pattern | pattern→rule]

---
```

### 5.4 Patterns Schema

```yaml
# grimoires/rune/patterns.md format

# Extracted Patterns

<!-- Patterns detected from 3+ similar rejections -->

## [pattern-id]: [name]

**Source**: [N] rejections
**Created**: [timestamp]
**Last Applied**: [timestamp]

**Pattern**:
- Effect: [type]
- Change: [description]
- Direction: [e.g., "timing reduction", "sync change"]

**Examples**:
1. [component] on [date]: [change]
2. [component] on [date]: [change]
3. [component] on [date]: [change]

**Weight**: [0.0-1.0]
**Tier**: [pattern | rule]

---
```

### 5.5 Session Continuity

Add to Session Continuity section in NOTES.md:

```markdown
### Rune Context
- **Active Craft**: [component] (iteration [N])
- **Effect**: [type]
- **Last Action**: [generated | validated | rejected]
- **Taste Applied**: [list]
- **Wyrd Confidence**: [0.00-1.00]
```

Token budget: ~50 tokens for Rune context.

---

## 6. Progressive Disclosure

### 6.1 Disclosure Levels

| Level | When | Content | Tokens |
|-------|------|---------|--------|
| L0 | User types `/glyph` | Nothing yet | ~10 |
| L1 | Description provided | Hypothesis box | ~100 |
| L2 | Ambiguous | Clarifying question | ~50 |
| L3 | Confirmed | Generated code | Variable |
| L4 | "Why?" asked | Full physics explanation | ~500 |

### 6.2 Rule Loading Strategy

```
DEFAULT: Load nothing extra

ON /glyph:
  - Load: 00-glyph-core.md (always)
  - Load: 01-glyph-physics.md (for physics table)
  - Load: 02-glyph-detection.md (for effect detection)

IF protected capability detected:
  - Load: 03-glyph-protected.md

IF web3 patterns detected:
  - Load: rules/rigor/*.md

ON "why?":
  - Invoke: physics-reference skill
  - Invoke: patterns-reference skill
```

### 6.3 Reference Skill Loading

```markdown
# skills/physics-reference/SKILL.md
---
name: physics-reference
description: Full physics tables and timing rationale
user-invocable: false
invoked-by:
  - crafting (L4)
  - fating
---

# Physics Reference

Provides detailed physics tables when user asks "why?".

## Content

Full physics table with:
- Effect definitions
- Timing rationale (research-backed)
- Animation specifications
- Spring presets
- Material constraints

## Token Budget

~500 tokens when loaded.

## Load Trigger

Only loaded when:
- User asks "why?" during generation
- User invokes `/glyph --analyze`
- User runs `/wyrd test`
```

---

## 7. API Specifications

### 7.1 Effect Detection API

```typescript
interface EffectDetectionInput {
  description: string;
  typeAnnotations?: string[];
  contextPhrases?: string[];
}

interface EffectDetectionOutput {
  effect: EffectType;
  confidence: number;
  signals: Signal[];
}

type EffectType =
  | 'financial'
  | 'destructive'
  | 'soft_delete'
  | 'standard'
  | 'navigation'
  | 'local';

interface Signal {
  type: 'type' | 'keyword' | 'context';
  value: string;
  weight: number;
}
```

### 7.2 Hypothesis API

```typescript
interface HypothesisInput {
  effect: EffectType;
  taste: TasteEntry[];
  rejectionHistory: Rejection[];
}

interface HypothesisOutput {
  effect: EffectType;
  physics: PhysicsSpec;
  tasteApplied: TasteApplication[];
  confidence: number;
  signals: Signal[];
}

interface PhysicsSpec {
  sync: 'pessimistic' | 'optimistic' | 'immediate';
  timing: number; // ms
  confirmation: 'required' | 'toast_undo' | 'none';
  animation: AnimationSpec;
}

interface TasteApplication {
  entryId: string;
  field: string;
  originalValue: any;
  appliedValue: any;
  tier: 1 | 2 | 3;
}
```

### 7.3 Self-Validation API

```typescript
interface ValidationInput {
  code: string;
  hypothesis: HypothesisOutput;
  filePath: string;
}

interface ValidationOutput {
  passed: boolean;
  checks: ValidationCheck[];
  autoRepairs: AutoRepair[];
}

interface ValidationCheck {
  name: string;
  category: 'physics' | 'protected' | 'rigor';
  passed: boolean;
  message: string;
  line?: number;
}

interface AutoRepair {
  line: number;
  before: string;
  after: string;
  reason: string;
}
```

### 7.4 Rejection Learning API

```typescript
interface RejectionInput {
  hypothesisId: string;
  type: 'explicit_no' | 'modification' | 'regeneration';
  changes?: FileChange[];
  reason?: string;
  context: {
    sprint: string;
    component: string;
  };
}

interface FileChange {
  field: string;
  from: any;
  to: any;
  line: number;
}

interface RejectionOutput {
  logged: boolean;
  tasteCreated: boolean;
  tasteId?: string;
  patternDetected: boolean;
  patternId?: string;
  tierPromotion?: string;
}
```

---

## 8. Error Handling

### 8.1 Error Categories

| Category | Severity | Recovery |
|----------|----------|----------|
| Missing State | WARN | Create default state files |
| Invalid Taste | WARN | Skip entry, log warning |
| Physics Violation | INFO | Flag for user review |
| Protected Violation | BLOCK | Must be fixed |
| Rigor Critical | BLOCK | Must be fixed |

### 8.2 Graceful Degradation

```
IF grimoires/rune/ missing:
  → Create with defaults
  → Log to Session Log

IF taste.md malformed:
  → Skip malformed entries
  → Continue with valid entries
  → Log warning

IF wyrd.md missing:
  → Use base confidence values
  → Create wyrd.md on first calibration

IF rejection log corrupted:
  → Archive corrupted log
  → Start fresh
  → Log warning
```

### 8.3 Error Messages

```markdown
## Error: Protected Capability Violation

The generated component violates a protected capability:
- **Violation**: Cancel button hidden during loading
- **Rule**: Cancel must always be visible (03-glyph-protected.md)

**Fix Required**:
```tsx
// Instead of:
{!isPending && <Cancel />}

// Use:
<Cancel disabled={isPending} />
```

This error blocks generation. Fix the violation to continue.
```

---

## 9. Testing Strategy

### 9.1 Unit Tests

```
tests/
├── effect-detection/
│   ├── keywords.test.ts
│   ├── types.test.ts
│   └── context.test.ts
├── hypothesis/
│   ├── confidence.test.ts
│   ├── taste-application.test.ts
│   └── display.test.ts
├── validation/
│   ├── physics-check.test.ts
│   ├── protected-check.test.ts
│   └── rigor-check.test.ts
└── learning/
    ├── rejection-capture.test.ts
    ├── pattern-detection.test.ts
    └── tier-promotion.test.ts
```

### 9.2 Integration Tests

```
tests/integration/
├── glyph-workflow.test.ts      # Full generation flow
├── wyrd-calibration.test.ts    # Confidence calibration
├── notes-integration.test.ts   # NOTES.md updates
└── hook-activation.test.ts     # Workflow hook triggers
```

### 9.3 Key Test Cases

| Test | Scenario | Expected |
|------|----------|----------|
| Effect detection | "claim button" | Financial effect |
| Taste application | 500ms in taste.md | Override 800ms default |
| Confidence | 3 rejections | -0.15 adjustment |
| Protected check | Hidden cancel | BLOCK violation |
| Rigor check | `if (amount)` | HIGH finding |
| Pattern detection | 3 timing reductions | Pattern created |

---

## 10. Migration & Compatibility

### 10.1 Standalone Mode

When Loa is not detected:

```
ON startup:
  IF .loa-version.json missing:
    → Run in standalone mode
    → Skip workflow hooks
    → Skip NOTES.md integration
    → Use grimoires/rune/ for state
    → Commands still work: /sigil, /glyph, /rigor, /wyrd
```

### 10.2 Loa Integration Detection

```
ON /glyph invocation:
  IF .loa-version.json exists:
    → Read framework version
    → IF version >= 1.7.0:
      → Enable full integration
      → Enable workflow hooks
      → Enable NOTES.md section
    → ELSE:
      → Warn about version mismatch
      → Run in compatibility mode
```

### 10.3 Migration from Existing Rules

Existing rules in `.claude/rules/` continue to work:

```
Priority:
1. Pack rules (packs/rune/rules/)
2. Local rules (.claude/rules/)

ON conflict:
  → Pack rules take precedence
  → Log warning about override

Migration path:
  → Move .claude/rules/sigil/ → personal overrides
  → Pack provides updated rules
```

---

## 11. Security & Privacy

### 11.1 Telemetry (F-16)

```yaml
# Opt-in telemetry (disabled by default)
telemetry:
  enabled: false
  endpoint: https://rune-telemetry.thehoneyjar.xyz/v1

captures:
  - effect_type_distribution
  - timing_adjustments_aggregate
  - rejection_rate_by_effect
  - self_validation_failure_rate

never_captures:
  - code
  - project_names
  - file_paths
  - component_names
  - user_identifiers
```

### 11.2 State File Security

- All state files in `grimoires/rune/` are plaintext markdown
- No secrets stored in state
- State can be safely committed to version control
- No external network calls (except opt-in telemetry)

---

## 12. Implementation Phases

### Phase 1: MVP (Sprint 1-2)

| Priority | Feature | Component |
|----------|---------|-----------|
| P0 | Pack structure | manifest.yaml, file layout |
| P0 | Fating skill | SKILL.md, index.yaml |
| P0 | Hypothesis block | Glyph integration |
| P0 | NOTES.md section | Template, integration |
| P1 | Confidence calculation | wyrd.md, calibration |
| P1 | Implement hook | Basic prompt |

### Phase 2: Self-Validation (Sprint 3-4)

| Priority | Feature | Component |
|----------|---------|-----------|
| P0 | Physics validation | Check generator output |
| P0 | Protected validation | Cancel, Withdraw, etc. |
| P1 | Rigor integration | Web3 pattern detection |
| P1 | Auto-repair | Fix simple violations |
| P1 | Review hook | /glyph validate |
| P2 | Audit hook | /rigor integration |

### Phase 3: Learning (Sprint 5-6)

| Priority | Feature | Component |
|----------|---------|-----------|
| P0 | Rejection capture | File monitoring, diff |
| P0 | Rejection log | rejections.md |
| P1 | Pattern detection | 3+ similar algorithm |
| P1 | Taste capture | Sigil integration |
| P1 | Maturity tiers | Tier 1/2/3 |
| P2 | Reality anchor | Test file integration |

### Phase 4: Community (Sprint 7+)

| Priority | Feature | Component |
|----------|---------|-----------|
| P2 | Telemetry opt-in | Anonymous aggregates |
| P2 | Community physics | Published recommendations |

---

## 13. Appendices

### Appendix A: Physics Table

| Effect | Sync | Timing | Confirmation |
|--------|------|--------|--------------|
| Financial | Pessimistic | 800ms | Required |
| Destructive | Pessimistic | 600ms | Required |
| Soft Delete | Optimistic | 200ms | Toast + Undo |
| Standard | Optimistic | 200ms | None |
| Navigation | Immediate | 150ms | None |
| Local State | Immediate | 100ms | None |

### Appendix B: Protected Capabilities

| Capability | Rule |
|------------|------|
| Withdraw | Always reachable |
| Cancel | Always visible |
| Balance | Always accurate |
| Touch target | >= 44px |
| Focus ring | Always visible |

### Appendix C: Rigor Checks

| Check | Severity | Pattern |
|-------|----------|---------|
| BigInt falsy | HIGH | `if (amount)` |
| Data source | CRITICAL | Transaction from indexer |
| Receipt guard | HIGH | Missing hash comparison |
| Stale closure | MEDIUM | Captured useEffect value |

### Appendix D: Keywords by Effect

**Financial**: claim, deposit, withdraw, transfer, swap, send, pay, mint, burn, stake, unstake, bridge, approve

**Destructive**: delete, remove, destroy, revoke, terminate, purge, erase, wipe, clear, reset, ban, block

**Soft Delete**: archive, hide, trash, dismiss, snooze, mute, silence

**Standard**: save, update, edit, create, add, like, follow, bookmark, favorite, star, pin, tag, comment

**Local**: toggle, switch, expand, collapse, select, focus, show, hide, open, close, check, uncheck, theme

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product | | | |
| Engineering | | | |
| Design | | | |

---

*Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>*
