# Sigil Laboratory

> "We do not win by being the busiest. We win by being the most aligned
> with reality and the most reliable at finishing what we start."

---

## How Experiments Work

```
Observation → Hypothesis → Experiment → Craft → Monitor → Conclude
     ↓             ↓            ↓          ↓        ↓          ↓
  /observe    experiment    EXP-XXX    /craft   metrics   marry/kiss/kill
              artifact      .md        --exp
```

**Every experiment must have:**
1. A hypothesis grounded in user observation
2. Success criteria that can be measured
3. A time-box for evaluation
4. A learning memo when concluded

---

## Active Experiments

| ID | Name | Status | Observations | Started |
|----|------|--------|--------------|---------|
| [EXP-001](EXP-001-rewards-visibility.md) | Rewards Visibility for Trust-Checkers | 💡 idea | alice | - |

---

## Experiment Pipeline

### 💡 Ideas (not started)
- **EXP-001**: Rewards Visibility for Trust-Checkers (from alice observation)

### 🤔 Under Review
*Experiments being evaluated for priority*

### 🏃 In Progress
*Actively running experiments*

### ✅ Recently Concluded
*Experiments with outcomes decided*

---

## Outcomes Summary

| Outcome | Count | Recent |
|---------|-------|--------|
| 🌳 Marry | 0 | - |
| 💋 Kiss | 0 | - |
| 💀 Kill | 0 | - |

---

## Creating an Experiment

### From Observation

When `/observe` validates a user concern:

```bash
# Observation is validated
observations/alice-diagnostic.md → status: VALIDATED

# Create experiment to address it
experiments/EXP-001-rewards-visibility.md
  ↳ Links to alice-diagnostic.md
  ↳ Hypothesis based on gap_type
  ↳ Success criteria defined
```

### Experiment → Craft Flow

```bash
# When implementing
/craft "RewardsDisplay" --experiment EXP-001

# Analysis box shows:
┌─ Craft Analysis ─────────────────────────────────────┐
│  Experiment: EXP-001 (Rewards Visibility)            │
│  Addressing: alice's discoverability concern         │
│  Hypothesis: Delta display → increased confidence    │
└──────────────────────────────────────────────────────┘
```

---

## Rules

1. **One hypothesis per experiment** — Testing multiple things? Split them.
2. **Must link to observations** — No experiments without user evidence.
3. **Time-boxed** — Every experiment has a review date (default: 2 weeks).
4. **Learning memo required** — Conclusions must document what we learned.
5. **Kill rate matters** — If we never kill experiments, we're not being honest.

---

## File Structure

```
grimoires/sigil/
├── observations/           # User feedback (input)
│   ├── {user}-diagnostic.md
│   └── user-insights.md
│
├── experiments/            # Hypotheses being tested
│   ├── laboratory.md       # This index
│   ├── EXP-XXX-name.md     # Active experiments
│   └── archive/            # Concluded experiments
│
└── orchard/                # Married features (output)
    └── {feature}.md        # Proven, permanent features
```
