# PRD: Sigil Experiments System

```
    +===============================================+
    |  SIGIL EXPERIMENTS                            |
    |  From Observation to Married Feature          |
    |                                               |
    |  Version 1.0.0                                |
    +===============================================+
```

**Created**: 2026-01-19
**Status**: Draft
**Inspired by**: Hivemind OS "Laboratory" concept

---

## Problem Statement

Currently, Sigil captures:
- **Observations** (`/observe`) — Raw user feedback with Mom Test diagnostics
- **Taste signals** (`taste.md`) — Developer preferences during crafting

What's missing is the **Experiment wrapper** — a way to:
1. Group observations into testable hypotheses
2. Track the lifecycle of changes meant to address user concerns
3. Label crafted work as "Experiment X: Addressing Y concerns"
4. Determine outcome: **Marry** (keep), **Kiss** (iterate), **Kill** (remove)

### The Gap

| Hivemind Concept | Sigil Current | Gap |
|------------------|---------------|-----|
| User Truth Canvas | `observations/*.diagnostic.md` | ✓ Have it |
| Experiment Proposal | Missing | Need it |
| Learning Memo | `taste.md` + crafting | Partial |
| Marry/Kiss/Kill | Missing | Need lifecycle |

---

## Goals

1. **Experiment as first-class artifact** — Every significant change is an experiment
2. **Observation → Experiment linkage** — User concerns explicitly drive experiments
3. **Lifecycle tracking** — Idea → In Progress → Concluded → Outcome
4. **Learning accumulation** — Failed experiments teach as much as successes

---

## The Experiments System

### 1. Experiment Artifact Schema

```
grimoires/sigil/experiments/
├── {experiment-id}.md       # Individual experiments
├── laboratory.md            # Index of all experiments
└── archive/                 # Concluded experiments
    └── {experiment-id}.md
```

### 2. Experiment File Structure

```yaml
---
id: "EXP-001"
name: "Rewards Visibility for Trust-Checkers"
status: "💡 idea | 🤔 review | 🏃 in_progress | ✅ concluded"
outcome: "null | marry | kiss | kill"

# What we're testing
hypothesis: |
  If we show reward deltas (+X since last check) and trend indicators,
  trust-checker users will feel more confident and check less frequently.

# Evidence that inspired this
observations:
  - path: "observations/alice-diagnostic.md"
    key_insight: "Can't tell if rewards are accumulating"
    user_type: "trust-checker"
    gap_type: "discoverability"

# What we're changing
changes:
  - component: "RewardsDisplay"
    physics_adjustment: "Add delta indicator, trend arrow"
    craft_session: "2026-01-20T14:00:00Z"

# How we'll know
success_criteria:
  - metric: "Support tickets about reward visibility"
    baseline: 12/week
    target: "<5/week"
  - metric: "User-reported confidence (qualitative)"
    target: "Positive sentiment in feedback"

# Lifecycle
dates:
  proposed: "2026-01-19"
  started: null
  concluded: null
owner: null
---

## Context

[Narrative explaining why this experiment exists, what observations led to it,
and what we hope to learn]

## Hypothesis Details

**IF** [specific change]
**THEN** [expected outcome]
**BECAUSE** [reasoning based on user behavior]

## Implementation Plan

1. [ ] Craft RewardsDisplay with delta indicator
2. [ ] Add trend arrow (↑/↓/→)
3. [ ] Ship to staging
4. [ ] Announce experiment in release notes
5. [ ] Monitor for 2 weeks

## Learning Memo (post-conclusion)

*Filled in when experiment concludes*

### What We Learned
[Evidence-backed conclusions]

### Outcome Decision
- **Marry**: [if keeping permanently]
- **Kiss**: [if iterating further]
- **Kill**: [if removing]

### Recommendations for Future
[What this taught us about our users]
```

### 3. Laboratory Index (`laboratory.md`)

```markdown
# Sigil Laboratory

> "We do not win by being the busiest. We win by being the most aligned
> with reality and the most reliable at finishing what we start."

## Active Experiments

| ID | Name | Status | Owner | Observations | Started |
|----|------|--------|-------|--------------|---------|
| EXP-001 | Rewards Visibility | 🏃 in_progress | - | alice | 2026-01-19 |

## Experiment Pipeline

### 💡 Ideas (not started)
- EXP-002: Claim Button Timing for Power Users

### 🤔 Under Review
*None*

### 🏃 In Progress
- EXP-001: Rewards Visibility for Trust-Checkers

### ✅ Recently Concluded
*None*

## Metrics Dashboard

| Metric | This Week | Last Week | Trend |
|--------|-----------|-----------|-------|
| Active experiments | 1 | 0 | ↑ |
| Concluded | 0 | 0 | → |
| Observations gathered | 3 | 0 | ↑ |

## Rules

1. **One hypothesis per experiment** — If you're testing multiple things, split them
2. **Must link to observations** — No experiments without user evidence
3. **Time-boxed** — Every experiment has a review date
4. **Learning memo required** — Conclusion must document learnings
```

---

## Workflow Integration

### /observe → Experiment Flow

```
1. /observe "user quote" --user name
   ↓
   Creates: observations/{user}-diagnostic.md
   ↓
2. When diagnosis is VALIDATED:
   ↓
   Prompt: "Create experiment to address this?"
   ↓
   If yes: Creates experiments/{id}.md
           Links observation
           Sets status: 💡 idea
   ↓
3. When ready to implement:
   ↓
   /craft "component" --experiment EXP-001
   ↓
   Links craft session to experiment
   Sets status: 🏃 in_progress
   ↓
4. After shipping:
   ↓
   Monitor for success criteria period
   ↓
5. At review date:
   ↓
   Fill Learning Memo
   Set outcome: marry | kiss | kill
   Move to archive if marry/kill
```

### /craft Integration

When crafting with `--experiment` flag:

```
┌─ Craft Analysis ───────────────────────────────────────┐
│                                                        │
│  Target:       RewardsDisplay                          │
│  Experiment:   EXP-001 (Rewards Visibility)            │
│                                                        │
│  Addressing:                                           │
│  • alice: "Can't tell if rewards accumulating"         │
│    → trust-checker, discoverability gap                │
│                                                        │
│  Hypothesis:                                           │
│  Show delta + trend → increased confidence             │
│                                                        │
│  Physics adjustments (experiment-driven):              │
│  • Add "+X since last" delta display                   │
│  • Add trend indicator (↑/↓/→)                         │
│  • Use subtle pulse on value increase                  │
│                                                        │
│  Success will be measured by:                          │
│  • Support tickets < 5/week (baseline: 12)             │
│  • Positive sentiment in feedback                      │
│                                                        │
└────────────────────────────────────────────────────────┘

Proceed? (y/n)
```

### Taste Signal Enhancement

When ACCEPT/MODIFY/REJECT during experiment-linked craft:

```yaml
---
timestamp: "2026-01-20T14:32:00Z"
signal: ACCEPT
experiment:
  id: "EXP-001"
  name: "Rewards Visibility for Trust-Checkers"
  hypothesis: "Show delta + trend → increased confidence"
component:
  name: "RewardsDisplay"
  effect: "Query"
physics:
  behavioral:
    sync: "optimistic"
    timing: "150ms"
observation_context:
  - user: "alice"
    type: "trust-checker"
    concern: "Can't tell if rewards accumulating"
---
```

---

## New Commands

### /experiment

```bash
# Create new experiment from validated observation
/experiment create --from observations/alice-diagnostic.md

# List experiments
/experiment list [--status in_progress]

# Update experiment status
/experiment start EXP-001
/experiment conclude EXP-001 --outcome marry

# View experiment details
/experiment show EXP-001
```

### /laboratory

```bash
# Open laboratory dashboard
/laboratory

# Generate weekly report
/laboratory report
```

---

## Marry/Kiss/Kill Decision Framework

### Marry (Keep Permanently)
- Success criteria met
- User feedback positive
- No negative side effects
- Move to `grimoires/sigil/orchard/` (married features)

### Kiss (Iterate)
- Partial success
- Users respond positively but want more
- Success criteria not fully met but promising
- Create follow-up experiment

### Kill (Remove)
- Hypothesis disproven
- Negative user feedback
- Worse than baseline
- Document learnings, remove code

---

## Directory Structure (Final)

```
grimoires/sigil/
├── observations/              # User feedback (Mom Test)
│   ├── {user}-diagnostic.md
│   ├── user-insights.md
│   └── open-questions.md
│
├── experiments/               # NEW: Experiment tracking
│   ├── laboratory.md          # Index and dashboard
│   ├── EXP-001.md             # Active experiments
│   └── archive/               # Concluded experiments
│
├── orchard/                   # NEW: Married features
│   └── {feature}.md           # Proven, permanent features
│
├── taste.md                   # Developer preferences
├── moodboard/                 # References
└── context/                   # Project context
```

---

## Success Metrics for This System

| Metric | Target |
|--------|--------|
| % of crafts linked to experiments | >50% |
| Average experiment cycle time | <2 weeks |
| Learning memos written | 100% of concluded |
| Kill rate | >20% (if never killing, not being honest) |

---

## Alignment with Hivemind OS

| Hivemind | Sigil Equivalent |
|----------|------------------|
| 🔬 Laboratory | `grimoires/sigil/experiments/` |
| 🧠 Library (User Truth) | `grimoires/sigil/observations/` |
| 🌳 Orchard (Married) | `grimoires/sigil/orchard/` |
| Learning Memo | Experiment conclusion section |
| Heartbeat | Experiment status + taste signals |

---

## Implementation Phases

### Phase 1: Artifact Structure
- Create `experiments/` directory
- Create `laboratory.md` index
- Create experiment file template

### Phase 2: /observe Integration
- Add prompt after VALIDATED diagnosis: "Create experiment?"
- Auto-link observations to experiments

### Phase 3: /craft Integration
- Add `--experiment` flag
- Show experiment context in analysis box
- Link taste signals to experiments

### Phase 4: /experiment Command
- Create, list, update, conclude experiments
- Generate weekly reports

### Phase 5: Orchard (Married Features)
- Track permanently adopted features
- Link to original experiments
- Document why they were married

---

*PRD ready for review. Next: `/architect` to design implementation.*
