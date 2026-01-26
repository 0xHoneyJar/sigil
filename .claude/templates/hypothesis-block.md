# Hypothesis Block Template

Use this format when presenting a hypothesis before generation.

## Format

```markdown
## Hypothesis

**Effect**: [Effect Type] (detected: [signals])
**Physics**: [Sync] sync, [timing]ms timing, [confirmation]
**Taste Applied**: [override] ([source], [tier]) | [none]
**Confidence**: [0.00-1.00] ([high|moderate|low|uncertain])

Does this match your intent? [y/n/adjust]
```

## Example

```markdown
## Hypothesis

**Effect**: Financial (detected: "claim" keyword, Amount type prop)
**Physics**: Pessimistic sync, 800ms timing, confirmation required
**Taste Applied**: 500ms override (power-user-timing, Tier 2)
**Confidence**: 0.85 (moderate)

Does this match your intent? [y/n/adjust]
```

## Confidence Display

| Range | Label | Description |
|-------|-------|-------------|
| >= 0.90 | High | Proceed confidently |
| 0.75-0.89 | Moderate | Proceed, note uncertainty |
| 0.50-0.74 | Low | Ask clarifying question |
| < 0.50 | Uncertain | Require explicit confirmation |

## Response Handling

| User Response | Action |
|---------------|--------|
| `y` or `yes` | Proceed with stated hypothesis |
| `n` or `no` | Ask "What should be different?", log rejection |
| `adjust timing 500` | Update timing to 500ms, proceed |
| `adjust sync optimistic` | Update sync strategy, proceed |
