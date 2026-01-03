---
zones:
  state:
    paths:
      - sigil-mark/lens-array/lenses.yaml
    permission: read
  config:
    paths:
      - .sigilrc.yaml
    permission: read
---

# Validating Lenses

## Purpose

Validate an asset (component, page, feature) across all defined lenses, prioritizing the most constrained lens as the truth test. This is an internal skill called by `/craft` and other skills.

## Philosophy

> "If it breaks in the most constrained lens, it's broken for everyone."

The most constrained lens (lowest priority number) is the truth test. If an asset fails validation in that lens, it fails overall. Other lenses provide additional perspective but don't override the truth test.

## Pre-Flight Checks

1. **Lenses File**: Load `sigil-mark/lens-array/lenses.yaml`
2. **Strictness Level**: Load from `.sigilrc.yaml`

## Validation Logic

### Step 1: Load Lens Definitions

```bash
result=$(.claude/scripts/get-lens.sh "" "sigil-mark/lens-array/lenses.yaml")
# Returns all lenses sorted by priority
```

### Step 2: Identify Truth Test Lens

The lens with the lowest priority number is the truth test:

```yaml
lenses:
  power_user:
    priority: 1  # ← This is the truth test
  newcomer:
    priority: 2
  mobile:
    priority: 3
  accessibility:
    priority: 4
```

### Step 3: Validate Against Each Lens

For each lens, in priority order:

1. **Load constraints** from lens definition
2. **Check required constraints** against the asset
3. **Run validation rules** if defined
4. **Record pass/fail status**

### Step 4: Check Immutable Properties

Verify that immutable properties are consistent across ALL lenses:

```yaml
immutable_properties:
  properties:
    - name: "security"
    - name: "core_logic"
    - name: "data_integrity"
```

If any lens-specific variation touches an immutable property:
- **BLOCK** in enforcing/strict mode
- **WARN** in guiding mode
- **Suggest** in discovery mode

## Constraint Types

### Required Constraints

Must be satisfied for lens to pass:

```yaml
constraints:
  - id: "keyboard_shortcuts"
    description: "All actions accessible via keyboard"
    required: true  # ← Must pass
```

### Optional Constraints

Recommended but not required:

```yaml
constraints:
  - id: "dense_display"
    description: "Information-dense layouts preferred"
    required: false  # ← Nice to have
```

## Validation Rules

Each lens can define validation rules:

```yaml
validation:
  - "All interactive elements have tabindex"
  - "No hover-only interactions"
  - "Shortcuts documented in UI"
```

These are guidance for the agent, not automated checks.

## Stacking Validation

When multiple lenses apply (e.g., `power_user` + `accessibility`):

1. Load allowed combinations from `stacking.allowed_combinations`
2. Verify combination is allowed
3. Apply conflict resolution from `stacking.conflict_resolution`
4. Higher priority lens wins conflicts

## Response Formats

### All Lenses Pass

```
✅ LENS VALIDATION PASSED

Validated against 4 lenses (truth test: power_user)

| Lens | Status | Notes |
|------|--------|-------|
| power_user | ✅ Pass | All required constraints met |
| newcomer | ✅ Pass | All required constraints met |
| mobile | ✅ Pass | All required constraints met |
| accessibility | ✅ Pass | All required constraints met |

Immutable properties: ✅ Consistent
```

### Truth Test Fails

```
⛔ LENS VALIDATION FAILED (Truth Test)

The most constrained lens (power_user) failed validation.

FAILED CONSTRAINTS:
- keyboard_shortcuts: "All actions accessible via keyboard"
  Missing: [component path]

This failure blocks in enforcing/strict mode.

OPTIONS:
[Fix Issue] [Override with Reasoning] [Escalate] [Abandon]
```

### Other Lens Fails

```
⚠️ LENS VALIDATION WARNING

Lens failed: mobile (priority: 3)

FAILED CONSTRAINTS:
- touch_targets: "Minimum 44x44px touch targets"
  Found: 32px buttons

This is a warning, not a block.
Truth test (power_user) passed.

Consider:
- Increase touch target size for mobile
- Add responsive sizing

[Proceed Anyway] [Fix Issue] [Get More Context]
```

### Immutable Property Violation

```
⛔ IMMUTABLE PROPERTY VIOLATION

Lens variation affects: security

The change in [mobile lens] modifies security behavior:
- [specific violation]

Immutable properties CANNOT vary between lenses.

OPTIONS:
[Fix Issue] [Override with Reasoning] [Escalate] [Abandon]
```

## Strictness Behavior

| Validation Result | discovery | guiding | enforcing | strict |
|-------------------|-----------|---------|-----------|--------|
| Truth test fail | Suggest | ⚠️ WARN | ⛔ BLOCK | ⛔ BLOCK |
| Other lens fail | Suggest | ⚠️ WARN | ⚠️ WARN | ⛔ BLOCK |
| Immutable violation | Suggest | ⚠️ WARN | ⛔ BLOCK | ⛔ BLOCK |
| Optional constraint | FYI | Suggest | Suggest | ⚠️ WARN |

## Integration Points

### Called By

- `/craft` — When providing zone-specific guidance
- `/approve` — When validating before sign-off

### Returns To Caller

```json
{
  "status": "pass" | "fail" | "warn",
  "truth_test": {
    "lens": "power_user",
    "passed": true
  },
  "lenses": [
    {"id": "power_user", "status": "pass", "failed_constraints": []},
    {"id": "mobile", "status": "fail", "failed_constraints": ["touch_targets"]}
  ],
  "immutable_violations": [],
  "message": "Human-readable summary"
}
```

## Error Handling

| Situation | Response |
|-----------|----------|
| No lenses defined | "No lenses configured. Run `/envision` to define user lenses." |
| Lens file missing | Use default validation (no lens-specific checks) |
| Invalid priority | Default to 99, warn about configuration issue |
| Circular stacking | Error, cannot resolve conflict |

## Philosophy

Lens validation ensures that the most constrained users are served first. If power users with accessibility needs can use the product, everyone can.

Do NOT:
- Skip the truth test
- Allow immutable property variations
- Ignore required constraints

DO:
- Validate in priority order
- Provide actionable feedback
- Explain why constraints matter
