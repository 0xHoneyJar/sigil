---
name: approve
description: Taste Key rulings on patterns and overrides
skill: approving-patterns
skill_path: .sigil/skills/approving-patterns/SKILL.md
allowed_tools:
  - Read
  - Write
  - AskUserQuestion
preflight:
  - sigil_setup_complete
---

# /approve

Submit patterns for Taste Key ruling or search past decisions.

## What It Does

- Records Taste Key rulings on patterns
- Approves budget overrides with justification
- Promotes mutations to canon
- Rejects patterns with reasoning

## Usage

```
/approve ClaimButton           # Submit for ruling
/approve --pending             # Show pending rulings
/approve --memory "loading"    # Search past decisions
```

## Ruling Format

```yaml
ruling:
  id: "2026-01-05-claim-button"
  date: "2026-01-05"
  taste_key: "@username"
  subject:
    component: "ClaimButton"
    zone: "critical"
  decision: "approved"
  reasoning: |
    Correctly implements clay material physics.
    Heavy spring, deliberate timing.
```

## Budget Override

When approving a budget violation:

```yaml
override:
  type: "budget"
  violation: "cognitive_elements"
  current: 8
  budget: 5
  justification: |
    The checkout flow requires showing all options.
    User research shows this doesn't cause confusion
    because options are grouped logically.
```

## Note

The Taste Key holder makes decisions alone.
There is no vote. There is no consensus-building.
