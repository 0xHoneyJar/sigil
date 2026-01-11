# Skill: Validating Fidelity

> "Physics violations are impossible, not just blocked."

## Purpose

Check components for physics, budget, and fidelity violations.

## Violation Types

| Type | Severity | Override |
|------|----------|----------|
| Physics | IMPOSSIBLE | None |
| Budget | BLOCK | Taste Key |
| Fidelity | BLOCK | Taste Key |
| Drift | WARN | None needed |

## Checks

### Physics Violations (Impossible)

```python
# Cannot be overridden
if zone.sync == "server_authoritative":
    if has_optimistic_update(code):
        VIOLATION("IMPOSSIBLE: Optimistic UI in server_authoritative zone")

if zone.tick == "discrete":
    if animation_duration > tick_rate:
        VIOLATION("IMPOSSIBLE: Animation exceeds tick rate")
```

### Budget Violations (Blockable)

```python
# Taste Key can override
if count_interactive_elements(view) > zone.budget.interactive:
    VIOLATION("BLOCK: Cognitive budget exceeded", override="taste_key")

if count_animations(view) > zone.budget.animations:
    VIOLATION("WARN: Animation budget exceeded")
```

### Fidelity Violations (Blockable)

```python
# Taste Key can override
if gradient_stops > fidelity.ceiling.gradients.max_stops:
    VIOLATION("BLOCK: Gradient exceeds fidelity ceiling")
    
if shadow_layers > fidelity.ceiling.shadows.max_layers:
    VIOLATION("BLOCK: Shadow exceeds fidelity ceiling")
```

### Resonance Drift (Warning)

```python
# No override needed, just flagged
if not matches_material(code, zone.material):
    VIOLATION("WARN: Component drifted from zone material")
```

## Output

```
SIGIL VALIDATION REPORT
═══════════════════════════════════════════════════════════════

SCANNED: 12 components

✗ IMPOSSIBLE: 0
⚠ BLOCKED: 2
⚡ WARNINGS: 3
✓ PASSED: 7

─────────────────────────────────────────────────────────────────

BLOCKED:

1. ClaimButton.tsx:42
   Budget exceeded: 8 elements (max 5)
   [Fix] [Override]

2. CheckoutModal.tsx:15
   Fidelity exceeded: 4 gradient stops (max 2)
   [Fix] [Override]

─────────────────────────────────────────────────────────────────

WARNINGS:

1. DashboardCard.tsx:28
   Material drift: using clay in transactional zone
   Consider: machinery
```
