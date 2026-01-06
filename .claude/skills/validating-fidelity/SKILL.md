# Sigil v1.0 Agent: Validating Fidelity

> "Physics violations are IMPOSSIBLE. Budget violations are BLOCK."

## Role

**Fidelity Guardian** — Validates generated code against physics constraints, budgets, and fidelity ceiling. Enforces the Design Physics Engine.

## Command

```
/validate [file]           # Validate single file
/validate --all            # Validate all components
/validate --zone [zone]    # Validate all files in zone
/validate --report         # Generate validation report
```

## Outputs

| Path | Description |
|------|-------------|
| `sigil-mark/memory/mutations/active/validation-report.yaml` | Validation results |

## Prerequisites

- Run `mount-sigil.sh` first (creates sigil-mark/ structure)
- Run `/envision` first (need essence.yaml)

## The Three-Tier Violation System

### 1. PHYSICS VIOLATIONS (IMPOSSIBLE)

These CANNOT be generated. Ever. No override exists.

```yaml
physics_violations:
  - "Optimistic update in server_authoritative zone"
  - "Bypassing discrete tick in critical zone"
  - "Continuous animation in discrete tick zone"
  - "Client state as truth in server_authoritative zone"
```

**Agent behavior:** BLOCK and explain. Cannot proceed.

### 2. BUDGET VIOLATIONS (BLOCK with override)

These are blocked but Taste Key can override.

```yaml
budget_violations:
  - "Exceeds interactive element count for zone"
  - "Exceeds animation count for zone"
  - "Exceeds color count"
  - "Exceeds prop count per component"
  - "Exceeds decision count"
```

**Agent behavior:** BLOCK, offer Taste Key override path.

### 3. FIDELITY VIOLATIONS (BLOCK with override)

These are blocked but Taste Key can override.

```yaml
fidelity_violations:
  - "Gradient exceeds 2 stops"
  - "Shadow exceeds 3 layers"
  - "Animation exceeds 800ms"
  - "Blur exceeds 16px"
  - "Border radius exceeds 24px"
```

**Agent behavior:** BLOCK, offer Taste Key override path.

### 4. DRIFT WARNINGS (WARN)

These are warnings, not blocks.

```yaml
drift_warnings:
  - "Material physics not applied correctly"
  - "Tension values not reflected in CSS"
  - "Missing zone-specific styling"
  - "Inconsistent with essence feel descriptors"
```

**Agent behavior:** WARN, suggest corrections.

## Workflow

### Phase 1: Load Context

Read the following files:
- `sigil-mark/core/sync.yaml` — Physics constraints
- `sigil-mark/core/budgets.yaml` — Budget limits
- `sigil-mark/core/fidelity.yaml` — Fidelity ceiling
- `sigil-mark/resonance/zones.yaml` — Zone definitions
- `sigil-mark/resonance/materials.yaml` — Material physics
- `sigil-mark/resonance/essence.yaml` — Product soul

### Phase 2: Resolve Zone

For each file being validated:

```python
def resolve_zone(file_path):
    # 1. Check for @sigil-zone comment
    if has_zone_comment(file_path):
        return parse_zone_comment(file_path)

    # 2. Match against zone path patterns
    zones = load_zones()
    for zone_name, zone_config in zones.items():
        for pattern in zone_config.paths:
            if glob_match(file_path, pattern):
                return zone_name

    # 3. Default fallback
    return "default"
```

### Phase 3: Check Physics Violations

```python
def check_physics(code, zone):
    violations = []

    # Get zone physics
    physics = get_zone_physics(zone)

    # Check sync authority
    if physics.authority == "server_authoritative":
        if has_optimistic_update(code):
            violations.append({
                "type": "IMPOSSIBLE",
                "rule": "Optimistic update in server_authoritative zone",
                "message": "Cannot use optimistic updates. Must wait for server.",
                "action": "BLOCK"
            })

        if not has_pending_state(code):
            violations.append({
                "type": "IMPOSSIBLE",
                "rule": "Missing pending state in server_authoritative zone",
                "message": "Must show pending state while waiting for server.",
                "action": "BLOCK"
            })

    # Check tick mode
    if physics.tick == "discrete":
        if has_continuous_animation(code):
            violations.append({
                "type": "IMPOSSIBLE",
                "rule": "Continuous animation in discrete tick zone",
                "message": "Animations must complete within tick boundaries.",
                "action": "BLOCK"
            })

    return violations
```

### Phase 4: Check Budget Violations

```python
def check_budgets(code, zone):
    violations = []

    # Get zone budgets
    budgets = get_zone_budgets(zone)

    # Count interactive elements
    count = count_interactive_elements(code)
    if count > budgets.interactive_elements:
        violations.append({
            "type": "BUDGET",
            "rule": f"Interactive elements: {count} > {budgets.interactive_elements}",
            "message": f"Zone {zone} allows max {budgets.interactive_elements} interactive elements.",
            "action": "BLOCK",
            "override": "Taste Key"
        })

    # Count animations
    count = count_animations(code)
    if count > budgets.animations:
        violations.append({
            "type": "BUDGET",
            "rule": f"Animations: {count} > {budgets.animations}",
            "message": f"Zone {zone} allows max {budgets.animations} concurrent animations.",
            "action": "BLOCK",
            "override": "Taste Key"
        })

    return violations
```

### Phase 5: Check Fidelity Violations

```python
def check_fidelity(code):
    violations = []

    # Check gradient stops
    gradients = extract_gradients(code)
    for gradient in gradients:
        stops = count_gradient_stops(gradient)
        if stops > 2:
            violations.append({
                "type": "CEILING",
                "rule": f"Gradient: {stops} stops > 2 max",
                "message": "Fidelity ceiling limits gradients to 2 stops.",
                "action": "BLOCK",
                "override": "Taste Key"
            })

    # Check shadow layers
    shadows = extract_shadows(code)
    for shadow in shadows:
        layers = count_shadow_layers(shadow)
        if layers > 3:
            violations.append({
                "type": "CEILING",
                "rule": f"Shadow: {layers} layers > 3 max",
                "message": "Fidelity ceiling limits shadows to 3 layers.",
                "action": "BLOCK",
                "override": "Taste Key"
            })

    # Check animation duration
    animations = extract_animations(code)
    for animation in animations:
        duration = get_duration_ms(animation)
        if duration > 800:
            violations.append({
                "type": "CEILING",
                "rule": f"Animation: {duration}ms > 800ms max",
                "message": "Fidelity ceiling limits animations to 800ms.",
                "action": "BLOCK",
                "override": "Taste Key"
            })

    # Check blur radius
    blurs = extract_blurs(code)
    for blur in blurs:
        radius = get_blur_radius(blur)
        if radius > 16:
            violations.append({
                "type": "CEILING",
                "rule": f"Blur: {radius}px > 16px max",
                "message": "Fidelity ceiling limits blur to 16px.",
                "action": "BLOCK",
                "override": "Taste Key"
            })

    return violations
```

### Phase 6: Check Drift

```python
def check_drift(code, zone, material, essence):
    warnings = []

    # Check material physics applied
    expected_motion = material.physics.motion.type
    if not has_motion_type(code, expected_motion):
        warnings.append({
            "type": "DRIFT",
            "rule": f"Material {material.name} expects {expected_motion} motion",
            "message": "Material physics not applied correctly.",
            "action": "WARN"
        })

    # Check tension reflection
    tensions = get_zone_tensions(zone)
    css_vars = extract_css_variables(code)
    if not tensions_reflected(tensions, css_vars):
        warnings.append({
            "type": "DRIFT",
            "rule": "Tension values not reflected in CSS variables",
            "message": "Consider using --sigil-* CSS variables for tension.",
            "action": "WARN"
        })

    return warnings
```

### Phase 7: Generate Report

```yaml
# sigil-mark/memory/mutations/active/validation-report.yaml

report:
  generated_at: "2026-01-04T12:00:00Z"
  files_checked: 12

  summary:
    impossible: 0
    block: 2
    warn: 3
    pass: 9

  violations:
    - file: "src/features/checkout/ClaimButton.tsx"
      line: 45
      zone: "critical"
      type: "CEILING"
      rule: "Animation: 1200ms > 800ms max"
      message: "Fidelity ceiling limits animations to 800ms."
      action: "BLOCK"
      override: "Taste Key"
      suggestion: "Reduce to 600ms or get Taste Key approval via /approve"

    - file: "src/features/settings/ToggleGroup.tsx"
      line: 23
      zone: "transactional"
      type: "BUDGET"
      rule: "Interactive elements: 15 > 12"
      message: "Zone transactional allows max 12 interactive elements."
      action: "BLOCK"
      override: "Taste Key"
      suggestion: "Split into tabs or get Taste Key approval via /approve"

  warnings:
    - file: "src/components/Card.tsx"
      line: 12
      zone: "exploratory"
      type: "DRIFT"
      rule: "Material glass expects ease motion"
      message: "Material physics not applied correctly."
      action: "WARN"
      suggestion: "Add transition-all duration-200 ease-out"

  pass:
    - file: "src/components/Button.tsx"
      zone: "default"
      material: "clay"
      checks_passed: ["physics", "budget", "fidelity", "drift"]
```

## Output Format

### Single File Validation

```
/validate src/features/checkout/ClaimButton.tsx

Validating ClaimButton.tsx...

Zone: critical
Material: clay
Physics: server_authoritative, discrete (600ms)

PHYSICS CHECKS:
✓ No optimistic updates
✓ Has pending state
✓ Discrete tick respected

BUDGET CHECKS:
✓ Interactive elements: 3 / 5
✓ Decisions: 1 / 2
✓ Animations: 1 / 1

FIDELITY CHECKS:
✓ Gradients: 1 stop / 2
✓ Shadows: 2 layers / 3
✗ Animation: 1200ms / 800ms  ← BLOCK

DRIFT CHECKS:
✓ Material physics applied
✓ Tensions reflected

Result: BLOCK (1 fidelity violation)

To fix:
1. Reduce animation duration to 800ms or less
2. Or get Taste Key approval: /approve --ruling "animation-duration-exception"
```

### Validation Report

```
/validate --all

Validating all components...

Files checked: 47
Zone breakdown:
  critical: 8 files
  transactional: 15 files
  exploratory: 12 files
  marketing: 6 files
  default: 6 files

RESULTS:
  ✓ PASS: 42 files
  ⚠ WARN: 3 files (drift)
  ✗ BLOCK: 2 files

BLOCKED:
1. src/features/checkout/ClaimButton.tsx
   CEILING: Animation 1200ms > 800ms

2. src/features/settings/ToggleGroup.tsx
   BUDGET: 15 interactive elements > 12 zone limit

WARNINGS:
1. src/components/Card.tsx
   DRIFT: Glass material expects ease motion

Report saved to: sigil-mark/memory/mutations/active/validation-report.yaml

Next steps:
- Fix BLOCK violations or get Taste Key approval via /approve
- Review WARN items for consistency
```

## Physics Violation Patterns

### Detecting Optimistic Updates

```javascript
const optimisticPatterns = [
  /optimistic/i,
  /useState.*\[\s*,\s*set/,  // State without server sync
  /\.mutate\(\)/,            // React Query optimistic
  /setQueryData/,            // Direct cache update
];

function has_optimistic_update(code) {
  return optimisticPatterns.some(p => p.test(code));
}
```

### Detecting Pending State

```javascript
const pendingPatterns = [
  /isPending/,
  /isLoading/,
  /loading/,
  /pending/,
  /disabled.*pending/i,
];

function has_pending_state(code) {
  return pendingPatterns.some(p => p.test(code));
}
```

### Detecting Continuous Animation

```javascript
const continuousPatterns = [
  /infinite/,
  /animate-spin/,
  /animation-iteration-count:\s*infinite/,
];

function has_continuous_animation(code) {
  return continuousPatterns.some(p => p.test(code));
}
```

## Success Criteria

- [ ] Physics violations detected (IMPOSSIBLE)
- [ ] Budget violations detected (BLOCK with override)
- [ ] Fidelity violations detected (BLOCK with override)
- [ ] Drift warnings generated (WARN)
- [ ] Report saved to mutations/active/
- [ ] Zone-specific limits applied
- [ ] Material physics checked

## Error Handling

| Situation | Response |
|-----------|----------|
| File not found | List valid paths |
| No zone detected | Use default zone |
| Missing core files | Error: run mount-sigil.sh |
| Parse error | Skip file with warning |

## Next Step

After `/validate`:
- If BLOCK violations: Fix or run `/approve` for Taste Key override
- If WARN only: Review and optionally fix
- If PASS: Ready for `/approve` sign-off
