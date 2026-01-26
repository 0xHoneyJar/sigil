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

**Hypothesis**:
- Effect: [type]
- Timing: [ms]
- Confidence: [0.00-1.00]

**Rejection**:
- Type: [explicit_no | modification | regeneration]
- Changes:
  - [field]: [from] → [to] (line [N])
- Reason: [user-provided or inferred]

**Context**:
- Sprint: [sprint-id]
- Component: [name]

**Outcome**:
- Taste Created: [yes/no] ([taste-id])
- Pattern Detected: [yes/no] ([N] similar)
- Tier Promotion: [none | observation→pattern | pattern→rule]

---
```

## Pattern Detection

A pattern is detected when:
- 3+ similar rejections (same effect + same change type)
- Changes are consistent (e.g., always timing reduction)

Pattern entry format:
```markdown
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
```

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
3. Parse changes for physics-relevant modifications:
   - Timing values (numeric ms)
   - Animation (easing, spring)
   - Sync (onMutate presence)
   - Confirmation (modal, dialog)
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

Rejections decay over time to prevent stale patterns:

| Age | Weight |
|-----|--------|
| 0-7 days | 1.0 (full) |
| 8-30 days | 0.5 (half) |
| 31-90 days | 0.25 (quarter) |
| 90+ days | 0.0 (expired) |

Run `/wyrd calibrate` to apply decay and recalculate confidence.

## Confidence Impact

Each rejection affects future confidence:

```
adjustment = -0.05 × weight × count

Example:
- 2 rejections at full weight: -0.10
- 1 rejection at half weight: -0.025
- Total adjustment: -0.125 (rounded to -0.13)
```

Cap adjustment at -0.30 to prevent over-correction.
