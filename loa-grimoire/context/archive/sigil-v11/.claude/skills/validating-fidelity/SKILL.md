# Sigil Agent: Validating Fidelity

> "If it looks 'better' than the Gold Standard, it is WRONG."

## Role

**Fidelity Guardian** — Checks generated output against Gold Standard. Flags "improvements" as violations.

## Commands

```
/validate [file]           # Validate single file
/validate --all            # Validate all components
/validate --report         # Generate fidelity report
```

## Outputs

| Path | Description |
|------|-------------|
| `sigil-mark/workbench/fidelity-report.yaml` | Validation results |

## The Mod Ghost Rule

When Mod Ghost joined Jagex, he created objectively "better" assets. The community rejected them because they didn't look like 2007.

**This agent protects the "jank" that constitutes the soul.**

An AI optimizing for "quality" will:
- Add more gradient stops
- Increase shadow layers
- Smooth animations
- Add decorative elements

All of these DESTROY the soul. This agent catches them.

## Validation Checks

### 1. Gradient Complexity

```javascript
function checkGradients(css) {
  const gradientRegex = /linear-gradient\([^)]+\)/g;
  const gradients = css.match(gradientRegex) || [];
  
  for (const gradient of gradients) {
    const stops = gradient.split(',').length - 1;
    if (stops > config.constraints.visual.gradients.max_stops) {
      return {
        violation: true,
        type: "gradient_complexity",
        message: `Gradient has ${stops} stops (max: ${max_stops})`,
        severity: "warn"
      };
    }
  }
}
```

### 2. Shadow Layers

```javascript
function checkShadows(css) {
  const shadowRegex = /box-shadow:\s*([^;]+)/g;
  const matches = css.match(shadowRegex) || [];
  
  for (const match of matches) {
    const layers = match.split(',').length;
    if (layers > config.constraints.visual.shadows.max_layers) {
      return {
        violation: true,
        type: "shadow_layers",
        message: `Shadow has ${layers} layers (max: ${max_layers})`,
        severity: "warn"
      };
    }
  }
}
```

### 3. Animation Duration

```javascript
function checkAnimations(css) {
  const durationRegex = /(?:animation|transition).*?(\d+(?:\.\d+)?)(ms|s)/g;
  let match;
  
  while ((match = durationRegex.exec(css)) !== null) {
    const value = parseFloat(match[1]);
    const unit = match[2];
    const ms = unit === 's' ? value * 1000 : value;
    
    if (ms > config.constraints.animation.max_duration_ms) {
      return {
        violation: true,
        type: "animation_duration",
        message: `Animation ${ms}ms exceeds max (${max_duration_ms}ms)`,
        severity: "warn"
      };
    }
  }
}
```

### 4. Forbidden Techniques

```javascript
function checkForbidden(css, jsx) {
  const code = css + jsx;
  
  for (const technique of config.forbidden_techniques) {
    const pattern = techniquePatterns[technique];
    if (pattern.test(code)) {
      return {
        violation: true,
        type: "forbidden_technique",
        message: `Forbidden technique: ${technique}`,
        severity: "error"
      };
    }
  }
}

const techniquePatterns = {
  "Ambient Occlusion": /ambient.?occlusion/i,
  "Mesh Gradients": /mesh.?gradient/i,
  "3D Transforms": /rotate[XYZ]|perspective/,
  "Particle Systems": /particle/i,
  "Motion Blur": /motion.?blur/i,
  // ...
};
```

### 5. Material Compliance

```javascript
function checkMaterial(code, expectedMaterial) {
  const material = materials[expectedMaterial];
  
  // Check for forbidden patterns
  for (const forbidden of material.forbidden) {
    if (containsPattern(code, forbidden)) {
      return {
        violation: true,
        type: "material_violation",
        message: `Material '${expectedMaterial}' forbids: ${forbidden}`,
        severity: "error"
      };
    }
  }
  
  // Check for required physics
  if (!hasPhysics(code, material.primitives.motion)) {
    return {
      violation: true,
      type: "missing_physics",
      message: `Material '${expectedMaterial}' requires ${material.primitives.motion} motion`,
      severity: "warn"
    };
  }
}
```

### 6. Sync Compliance

```javascript
function checkSync(code, expectedSync) {
  if (expectedSync === "server_tick") {
    // Must NOT have optimistic updates
    if (/optimistic/i.test(code)) {
      return {
        violation: true,
        type: "sync_violation",
        message: "Server-tick data cannot use optimistic updates",
        severity: "error"  // Always error for sync
      };
    }
    
    // Must have pending state
    if (!/pending|isPending|loading/i.test(code)) {
      return {
        violation: true,
        type: "sync_violation",
        message: "Server-tick components must show pending state",
        severity: "error"
      };
    }
  }
}
```

## Report Format

```yaml
# sigil-mark/workbench/fidelity-report.yaml

generated_at: "2025-01-15T10:30:00Z"
files_checked: 47
violations_found: 3

summary:
  pass: 44
  warn: 2
  error: 1

violations:
  - file: "src/components/Button.tsx"
    line: 23
    type: "gradient_complexity"
    message: "Gradient has 4 stops (max: 2)"
    severity: "warn"
    suggestion: "Simplify to 2-stop gradient"
    
  - file: "src/features/checkout/Confirm.tsx"
    line: 45
    type: "animation_duration"
    message: "Animation 1200ms exceeds max (800ms)"
    severity: "warn"
    suggestion: "Reduce to 800ms or request marketing zone exception"
    
  - file: "src/features/trade/TradeButton.tsx"
    line: 12
    type: "sync_violation"
    message: "Server-tick components must show pending state"
    severity: "error"
    suggestion: "Add isPending state and disable button while pending"

gold_standard_check:
  reference_era: "2024"
  exceeds_reference: 1
  matches_reference: 46
```

## Workflow

### Single File Validation

```
/validate src/components/Button.tsx

Validating Button.tsx...

Zone: default (clay)
Material: clay
Sync: lww

Checks:
✓ Gradient complexity (1 stop)
✓ Shadow layers (2 layers)
✓ Animation duration (300ms)
✓ No forbidden techniques
✓ Material compliance
✓ Sync compliance

Result: PASS ✓
```

### Violation Found

```
/validate src/features/checkout/AnimatedButton.tsx

Validating AnimatedButton.tsx...

Zone: critical (clay)
Material: clay
Sync: server_tick

Checks:
✓ Gradient complexity
⚠️ Shadow layers: 4 (max: 3)
⚠️ Animation duration: 1200ms (max: 800ms)
✓ No forbidden techniques
✓ Material compliance
❌ Sync compliance: Missing pending state

Result: FAIL ❌

Violations:
1. [WARN] Shadow has 4 layers. Simplify to 3 or fewer.
2. [WARN] Animation too long. Critical zone max is 800ms.
3. [ERROR] Server-tick button must show pending state.

Fix required for ERROR. Warnings are suggestions.
```

## Success Criteria

- [ ] All ERROR violations fixed
- [ ] WARN violations reviewed
- [ ] Fidelity report generated
- [ ] No forbidden techniques used
- [ ] Material physics correctly applied
- [ ] Sync strategies correctly implemented

## Next Step

After `/validate`: Run `/garden` to check paper cuts, or `/approve` for sign-off.
