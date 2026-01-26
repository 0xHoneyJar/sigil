---
name: fating
description: Hypothesis validation, confidence calibration, and rejection learning
user-invocable: true
disable-model-invocation: true
allowed-tools:
  - Read
  - Write
  - Glob
---

# Fating

The Wyrd construct: hypothesis validation, confidence calibration, and rejection learning.

> "What will be is what survives the test."

## Usage

```
/wyrd                     # Show current confidence state
/wyrd calibrate           # Recalculate from rejection history
/wyrd test hypothesis.md  # Validate hypothesis against codebase
/wyrd learn               # Extract patterns from recent rejections
```

## Philosophy

**Wyrd** (Old English: fate, destiny) reveals truth through testing.

- **Fate emerges through testing** — Truth is revealed, not assumed
- **Rejection is data** — Each "no" teaches the system
- **Confidence calibrates** — Predictions improve with feedback
- **Reality anchors claims** — Validate against real code and tests

## Workflow: Show State (`/wyrd`)

1. Read `grimoires/rune/wyrd.md`
2. Display confidence calibration table:
   ```
   ## Wyrd State

   | Effect | Base | Adjustment | Current |
   |--------|------|------------|---------|
   | Financial | 0.90 | -0.05 | 0.85 |
   | Destructive | 0.90 | 0.00 | 0.90 |
   | Standard | 0.85 | +0.05 | 0.90 |
   | Local | 0.95 | 0.00 | 0.95 |

   ### Learning Metrics
   - Total hypotheses: 47
   - Validation rate: 78%
   - Rejections this sprint: 2
   ```
3. Show active hypotheses if any
4. Show recent pattern influences

## Workflow: Calibrate (`/wyrd calibrate`)

1. Read `grimoires/rune/rejections.md`
2. Count rejections by effect type with decay:
   - Full weight: 0-7 days
   - Half weight: 8-30 days
   - Quarter weight: 31-90 days
   - Zero weight: 90+ days
3. Calculate adjustment factors:
   - -0.05 per weighted rejection
   - Cap at -0.30
4. Update `grimoires/rune/wyrd.md`

## Workflow: Learn (`/wyrd learn`)

1. Read recent entries from `grimoires/rune/rejections.md`
2. Detect patterns (3+ similar rejections):
   - Same effect type
   - Same change direction (e.g., timing reduction)
3. Promote detected patterns to `grimoires/rune/patterns.md`
4. Optionally create Sigil taste entries:
   ```
   Pattern detected: 3 timing reductions for Financial effect
   Average adjustment: 800ms → 520ms

   Create taste entry? [y/n]
   ```

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

- rejection_adjustment:
  - -0.05 per similar rejection in last 30 days
  - -0.10 if same component rejected before
  - Cap at -0.30
```

## Integration with Other Constructs

| Construct | Wyrd's Role |
|-----------|-------------|
| **Sigil** | Wyrd feeds rejection learnings → Sigil records as taste |
| **Glyph** | Wyrd provides confidence → Glyph shows in hypothesis |
| **Rigor** | Wyrd invokes Rigor during self-validation phase |

## Rules Loaded

### Core Rules
- `rules/wyrd/00-wyrd-core.md` - Philosophy
- `rules/wyrd/01-wyrd-hypothesis.md` - Hypothesis format
- `rules/wyrd/02-wyrd-learning.md` - Learning protocol

### Confidence & Calibration
- `rules/wyrd/03-wyrd-confidence.md` - Confidence calculation
- `rules/wyrd/08-wyrd-recalibration.md` - Recalibration protocol

### Rejection & Learning
- `rules/wyrd/04-wyrd-rejection-capture.md` - Explicit rejection handling
- `rules/wyrd/05-wyrd-file-modification.md` - Implicit edit detection
- `rules/wyrd/06-wyrd-change-analysis.md` - Physics change analysis
- `rules/wyrd/07-wyrd-pattern-detection.md` - Pattern detection algorithm

## State Files

| File | Purpose |
|------|---------|
| `grimoires/rune/wyrd.md` | Current confidence state |
| `grimoires/rune/rejections.md` | Rejection history (append-only) |
| `grimoires/rune/patterns.md` | Extracted patterns |

## Learning Pipeline

```
User Rejection ("n")  ──┐
                        ├──→ rejections.md ──→ Pattern Detection ──→ Tier Promotion
User Edit (implicit)  ──┘
                                    │
                                    ↓
                            3+ similar rejections
                                    │
                                    ↓
                            patterns.md → taste.md (Tier 2)
```

## File Modification Monitoring

After Glyph generates a file:
1. Start 30-minute monitoring window
2. Detect physics-relevant changes via git diff
3. Prompt: "Record as taste? [y/n]"
4. Log to rejections.md (implicit_edit type)
5. Check for pattern detection
