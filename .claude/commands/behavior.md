---
name: "behavior"
version: "12.7.0"
description: |
  Apply behavioral physics only.
  Use when timing/sync is wrong but looks and animation are fine.
  For full physics, use /craft.
---

# /behavior

Apply behavioral physics to a component. Timing, sync strategy, confirmation.

## Workflow

1. Read current component
2. Show behavioral analysis:

```
┌─ Behavioral Analysis ──────────────────────────────┐
│                                                    │
│  Component:    [name]                              │
│  Effect:       [financial/destructive/standard/local] │
│                                                    │
│  Current:                                          │
│  Sync:         [optimistic/pessimistic/immediate]  │
│  Timing:       [Xms]                               │
│  Confirmation: [yes/no]                            │
│                                                    │
│  Proposed:                                         │
│  Sync:         [new value]                         │
│  Timing:       [new value]                         │
│  Confirmation: [new value]                         │
│                                                    │
└────────────────────────────────────────────────────┘

Does this feel right?
```

3. Use AskUserQuestion for feedback:

```
Question: "Does this behavior feel right?"
Header: "Timing check"
Options:
  - "Yes, proceed"
  - "Too slow"
  - "Too fast"
  - "Needs confirmation"
  - "Should be optimistic"
  - (Other)
```

4. Apply changes or iterate based on feedback

## Behavioral Quick Reference

| Effect | Sync | Timing | Confirmation |
|--------|------|--------|--------------|
| Financial | Pessimistic | 800ms | Required |
| Destructive | Pessimistic | 600ms | Required |
| Standard | Optimistic | 200ms | None |
| Local | Immediate | 100ms | None |

## Examples

```
/behavior "claim button — feels too slow"
/behavior "like button — should be snappier"
/behavior "delete — needs confirmation"
```

---

<user-request>
$ARGUMENTS
</user-request>
