---
name: "animate"
version: "12.7.0"
description: |
  Apply animation physics only.
  Use when movement feels off but behavior and looks are fine.
  For full physics, use /craft.
---

# /animate

Apply animation physics to a component. Easing, springs, transitions.

## Workflow

1. Read current component
2. Show animation analysis:

```
┌─ Animation Analysis ───────────────────────────────┐
│                                                    │
│  Component:    [name]                              │
│  Current:      [what it has now]                   │
│                                                    │
│  Proposed:                                         │
│  Easing:       [ease-out/spring/none]              │
│  Duration:     [Xms]                               │
│  Spring:       [stiffness, damping] (if spring)    │
│  Entrance:     [animation]                         │
│  Exit:         [animation]                         │
│                                                    │
└────────────────────────────────────────────────────┘

Does this feel right?
```

3. Use AskUserQuestion for feedback:

```
Question: "Does this animation feel right?"
Header: "Motion check"
Options:
  - "Yes, proceed"
  - "Too slow"
  - "Too fast"
  - "Too stiff/mechanical"
  - "Too bouncy"
  - (Other)
```

4. Apply changes or iterate based on feedback

## Animation Quick Reference

| Feel | Easing | Spring | Duration |
|------|--------|--------|----------|
| Snappy | spring | 700, 35 | ~100ms |
| Responsive | spring | 500, 30 | ~200ms |
| Deliberate | ease-out | — | 600-800ms |
| Organic | spring | 300, 25 | ~300ms |
| None | — | — | 0ms |

## Examples

```
/animate "card — more organic"
/animate "button — snappier"
/animate "modal — smoother entrance"
```

---

<user-request>
$ARGUMENTS
</user-request>
