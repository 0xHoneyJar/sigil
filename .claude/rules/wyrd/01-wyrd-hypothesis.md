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
  Cap at -0.30
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
| `adjust timing 500` | Modify specific value, proceed |
| `adjust sync optimistic` | Modify specific value, proceed |

## Example Hypothesis

```
## Hypothesis

**Effect**: Financial (detected: "claim" keyword, Amount type prop)
**Physics**: Pessimistic sync, 800ms timing, confirmation required
**Taste Applied**: 500ms override (power-user-timing, Tier 2)
**Confidence**: 0.85 (moderate)

Does this match your intent? [y/n/adjust]
```

## On Rejection

When user says `n`:

1. Prompt for reason: "What should be different?"
2. Log to `grimoires/rune/rejections.md`
3. Ask: "Record as taste? [y/n]"
4. If yes, invoke `/sigil` with context
5. Recalculate confidence for effect type
