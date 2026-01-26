# Wyrd State Template

Initial state for `grimoires/rune/wyrd.md`.

## Template

```markdown
# Wyrd State

Current hypothesis confidence and learning metrics.

## Confidence Calibration

| Effect | Base | Adjustment | Current | Last Updated |
|--------|------|------------|---------|--------------|
| Financial | 0.90 | 0.00 | 0.90 | — |
| Destructive | 0.90 | 0.00 | 0.90 | — |
| Standard | 0.85 | 0.00 | 0.85 | — |
| Local | 0.95 | 0.00 | 0.95 | — |

## Active Hypotheses

| ID | Component | Effect | Confidence | Status |
|----|-----------|--------|------------|--------|
| — | — | — | — | — |

## Pattern Influences

| Pattern ID | Source | Weight | Applied To |
|------------|--------|--------|------------|
| — | — | — | — |

## Learning Metrics

| Metric | Value | Trend |
|--------|-------|-------|
| Total hypotheses | 0 | — |
| Validation rate | — | — |
| Avg confidence | — | — |
| Rejections this sprint | 0 | — |
```

## Update Protocol

### On Hypothesis Created

Add row to Active Hypotheses:
```
| hyp-001 | ClaimButton | Financial | 0.85 | pending |
```

### On Rejection

1. Update rejection count in Learning Metrics
2. Recalculate Adjustment for effect type
3. Update Current confidence
4. Set Last Updated to current date

### On Calibration (/wyrd calibrate)

1. Read rejections.md
2. Apply decay weights
3. Recalculate all Adjustments
4. Update Learning Metrics
