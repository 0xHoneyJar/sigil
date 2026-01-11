---
name: validate
description: Check physics, budget, and fidelity violations
skill: validating-fidelity
skill_path: .sigil/skills/validating-fidelity/SKILL.md
allowed_tools:
  - Read
  - Bash
preflight:
  - sigil_setup_complete
---

# /validate

Check components for physics, budget, and fidelity violations.

## Violation Types

| Type | Severity | Override |
|------|----------|----------|
| Physics | IMPOSSIBLE | None |
| Budget | BLOCK | Taste Key |
| Fidelity | BLOCK | Taste Key |
| Resonance Drift | WARN | None needed |

## What It Checks

### Physics Violations (Impossible)
- Optimistic UI in server_authoritative zone
- Bypassing discrete tick
- Animation exceeding tick rate

### Budget Violations (Blockable)
- Cognitive budget exceeded (too many elements)
- Visual budget exceeded (too many animations)
- Complexity budget exceeded (too many props)

### Fidelity Violations (Blockable)
- Gradient stops exceeding ceiling
- Shadow layers exceeding ceiling
- Animation duration exceeding ceiling

### Resonance Drift (Warning)
- Material mismatch for zone
- Tension values outside expected range

## Usage

```
/validate                      # Validate all
/validate ClaimButton.tsx      # Validate specific file
/validate src/features/        # Validate directory
```

## Output

Report showing violations with:
- Severity (IMPOSSIBLE / BLOCK / WARN)
- Location (file:line)
- Current value vs allowed
- Suggestion for fix
