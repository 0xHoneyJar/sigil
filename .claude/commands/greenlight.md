---
name: greenlight
version: "0.5.0"
description: Concept approval before building (not execution)
agent: greenlighting-concepts
agent_path: .claude/skills/greenlighting-concepts/SKILL.md
preflight:
  - sigil_setup_complete
---

# /greenlight

Record concept approval before building. Distinguishes concept from execution.

## Usage

```
/greenlight [concept]          # Record concept approval
/greenlight --status           # Show greenlighted concepts
/greenlight --pending          # Show concepts awaiting approval
/greenlight --reject [id]      # Record concept rejection
```

## The Concept vs Execution Distinction

### Concept (Greenlight)

"Should we build X?"

- "Should we add dark mode?" ✓
- "Should we redesign the dashboard?" ✓
- "Should we support mobile?" ✓

### Execution (Taste Key)

"How should X look?"

- "What color for dark mode?" → /approve
- "How fast should it animate?" → /approve
- "What border radius?" → /approve

## What Gets Greenlighted

| Greenlightable | Not Greenlightable |
|---------------|-------------------|
| New features | Colors |
| Feature removal | Fonts |
| Workflow changes | Animation timing |
| Platform support | Border radius |
| Integrations | Spacing |

## Essence Check

Before approving, concepts are checked against:
- Soul statement (must align)
- Anti-patterns (must not conflict)
- Invariants (must not violate)

## Examples

### Approval

```
/greenlight "Dark mode support"

✓ Aligns with "accessibility" invariant
✓ No conflict with anti-patterns

Status: APPROVED
Execution: Taste Key
```

### Rejection

```
/greenlight "Gamification badges"

✗ CONFLICT: Anti-pattern "gamified productivity"

Status: REJECTED
Cooldown: 6 months
```

### Execution Question Blocked

```
/greenlight "What color for buttons?"

BLOCKED: EXECUTION DECISION

Execution decisions go to Taste Key: /approve
```

## Outputs

Decisions saved to: `sigil-mark/memory/decisions/*.yaml`

## Next Step

After `/greenlight` approves:
1. Taste Key designs execution
2. `/craft` generates with physics
3. `/validate` checks constraints
4. `/approve` locks patterns
