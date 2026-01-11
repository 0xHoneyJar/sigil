# Skill: Greenlighting Concepts

> "Poll concepts, dictate execution."

## Purpose

Approve concepts before building. Separate "what" from "how".

## The OSRS Model

Jagex learned to separate these:

| Phase | Question | Who Decides |
|-------|----------|-------------|
| Greenlight | "Should we build X?" | Poll or Founder |
| Execution | "How should X look?" | Taste Key only |

**Poll**: "Should we add Sailing skill?"
**Don't Poll**: "What color is the Sailing icon?"

## Workflow

### Check Status

```
/greenlight "dark mode"

GREENLIGHT STATUS: dark-mode

Status: APPROVED ✓
Method: Founder decision
Date: 2026-01-01
By: @username

Notes: User research shows 60% want dark mode.

Execution delegated to Taste Key.
```

### Create Poll (Community Product)

```
/greenlight --poll "new checkout flow"

CREATING GREENLIGHT POLL

Concept: new-checkout-flow
Question: "Should we redesign the checkout flow?"

Options:
- Yes, full redesign
- Yes, incremental improvements
- No, keep current

Duration: 7 days
Threshold: 70% for approval

[Launch poll]
```

### Founder Decision (Startup)

```
/greenlight --founder "add animations"

FOUNDER GREENLIGHT

Concept: animations
Decision: APPROVED
By: @username
Date: 2026-01-05

Notes: Adding animations to increase engagement.
       Execution details delegated to Taste Key.

[Recorded]
```

## Integrity Bypass

Some changes bypass greenlight:

- Bug fixes
- Security patches
- Accessibility improvements
- Performance optimizations

These are "Integrity Changes" — they protect the product.

## Output

Records saved to `sigil-mark/memory/decisions/greenlights/`

```yaml
greenlight:
  id: "dark-mode"
  concept: "Dark mode support"
  status: "approved"
  method: "founder"
  date: "2026-01-05"
  by: "@username"
  notes: |
    User research shows 60% preference.
    Approved for implementation.
  execution: "Delegated to Taste Key"
```
