---
name: validate
version: "0.5.0"
description: Validate against physics constraints, budgets, and fidelity ceiling
agent: validating-fidelity
agent_path: .claude/skills/validating-fidelity/SKILL.md
preflight:
  - sigil_setup_complete
context_injection: true
---

# /validate

Validate components against the Design Physics Engine constraints.

## Usage

```
/validate [file]           # Validate single file
/validate --all            # Validate all components
/validate --zone [zone]    # Validate all files in zone
/validate --report         # Generate validation report
```

## What Gets Checked

### 1. Physics Violations (IMPOSSIBLE)

Cannot be overridden. Ever.

| Violation | Zone | Why |
|-----------|------|-----|
| Optimistic update | server_authoritative | Trust is broken |
| Missing pending state | server_authoritative | Must show waiting |
| Continuous animation | discrete tick | Must complete within tick |
| Bypassing tick delay | critical | Delay IS the trust |

### 2. Budget Violations (BLOCK)

Taste Key can override.

| Budget | Limits |
|--------|--------|
| Interactive elements | critical: 5, transactional: 12, exploratory: 20 |
| Decisions | critical: 2, transactional: 5, exploratory: 10 |
| Animations | critical: 1, transactional: 2, exploratory: 5 |
| Colors | 5 distinct hues |
| Props per component | 10 max |

### 3. Fidelity Violations (BLOCK)

Taste Key can override.

| Constraint | Ceiling |
|------------|---------|
| Gradient stops | 2 max |
| Shadow layers | 3 max |
| Animation duration | 800ms max |
| Blur radius | 16px max |
| Border radius | 24px max |

### 4. Drift Warnings (WARN)

Not blocked, just warned.

- Material physics not applied
- Tensions not reflected in CSS
- Inconsistent with essence

## Output

| Type | Meaning | Action |
|------|---------|--------|
| IMPOSSIBLE | Physics violation | Must fix, no override |
| BLOCK | Budget/fidelity violation | Fix or get Taste Key approval |
| WARN | Drift from patterns | Review and optionally fix |
| PASS | All checks passed | Ready for /approve |

## Examples

```
/validate src/features/checkout/ClaimButton.tsx

Zone: critical
Material: clay
Physics: server_authoritative, discrete (600ms)

PHYSICS: ✓ All passed
BUDGET: ✓ Within limits
FIDELITY: ✗ Animation 1200ms > 800ms
DRIFT: ✓ Material applied

Result: BLOCK (1 fidelity violation)
```

## Report

Validation report saved to:
`sigil-mark/memory/mutations/active/validation-report.yaml`

## Next Step

- If BLOCK: Fix or `/approve --ruling` for Taste Key override
- If WARN: Review and optionally fix
- If PASS: Ready for `/approve` sign-off
