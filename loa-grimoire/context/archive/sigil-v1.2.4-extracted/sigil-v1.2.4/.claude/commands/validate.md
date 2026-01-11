---
name: validate
description: Check recipe compliance across codebase
skill: sigil-core
---

# /validate

Check that all components use recipes appropriately.

## Usage

```
/validate
/validate src/checkout/
/validate --fix
```

## Behavior

1. Find all components in configured paths
2. Check each imports from recipes (not raw physics)
3. Verify zone constraints are respected
4. Flag violations and sandboxes

## Output

```
VALIDATING...

Scanned: 47 components

✓ PASS: 44 components using recipes correctly

⚠ SANDBOX: 2 components (allowed but tracked)
  - src/checkout/Experiment.tsx
  - src/marketing/NewHero.tsx

✗ VIOLATION: 1 component
  - src/admin/CustomWidget.tsx
    Line 24: Raw spring value outside sandbox
    Fix: Import from @sigil/recipes/machinery or use /sandbox

SUMMARY:
  Compliant: 44/47 (94%)
  Sandbox: 2
  Violations: 1

Run /sandbox src/admin/CustomWidget.tsx to allow raw physics
Or /codify to extract to recipe
```

## CI Integration

Add to your CI pipeline:

```yaml
- name: Sigil Validate
  run: npx sigil validate --ci
```

In CI mode:
- Sandbox files: WARN
- Violations: ERROR (blocks merge)
