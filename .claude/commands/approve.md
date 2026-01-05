---
name: approve
version: "0.5.0"
description: Taste Key holder sign-off and rulings
agent: approving-patterns
agent_path: .claude/skills/approving-patterns/SKILL.md
preflight:
  - sigil_setup_complete
---

# /approve

Taste Key holder approval for patterns and override rulings.

## Usage

```
/approve [pattern]             # Approve a pattern
/approve --ruling [name]       # Create override ruling
/approve --list                # List active rulings
/approve --history             # Show approval history
/approve --revoke [id]         # Revoke a ruling
```

## Authority Boundaries

### Taste Key CAN Override

| Category | Examples |
|----------|----------|
| Budgets | Element count, animation count, color count |
| Fidelity | Gradient stops, shadow layers, animation duration |
| Taste | Colors, typography, spacing, motion |

### Taste Key CANNOT Override

| Category | Why |
|----------|-----|
| Physics | Sync authority, tick modes are product integrity |
| Security | Auth, validation are non-negotiable |
| Accessibility | Contrast, keyboard nav are requirements |

## Ruling Types

| Type | Description |
|------|-------------|
| `pattern_approval` | Lock a visual pattern |
| `budget_override` | Exception to budget limit |
| `fidelity_override` | Exception to fidelity ceiling |

## Examples

### Pattern Approval

```
/approve "Primary button style"

Pattern: Primary button style
Material: clay
Physics: ✓ PASS

As Taste Key holder, approve this pattern?
[approve] [modify] [reject]
```

### Override Ruling

```
/approve --ruling "animation-exception"

RULING CREATED
ID: RULING-2026-001
Type: fidelity_override (animation_duration)
Scope: src/features/checkout/ClaimButton.tsx

Justification: Celebration moment requires longer animation.
```

### Physics Override Blocked

```
/approve --ruling "optimistic-checkout"

BLOCKED: PHYSICS OVERRIDE ATTEMPTED

Optimistic updates in server_authoritative zones
cannot be overridden. This is physics, not taste.

Route to Loa for structural change: /consult
```

## Outputs

Rulings saved to: `sigil-mark/taste-key/rulings/*.yaml`

## Integration

- `/validate` checks for rulings before blocking
- Rulings allow exceptions without changing constraints
- Rulings can be revoked via `--revoke`

## Next Step

After `/approve`:
- Pattern is locked
- Ruling allows exception in /validate
- `/garden` reviews rulings periodically
