---
name: validate
version: "1.2.4"
description: Check recipe compliance across codebase
agent: null
preflight:
  - sigil_mark_exists
context_injection: true
---

# /validate

Check recipe compliance across the codebase. Reports recipe usage and violations.

## Usage

```
/validate               # Validate all components
/validate [path]        # Validate specific file/directory
/validate --summary     # Show summary only
/validate --report      # Generate detailed report
```

## What Gets Checked

### 1. Recipe Imports (Required)

Components with animation should import from `@sigil/recipes/`:

**Passes:**
```tsx
import { Button } from '@sigil/recipes/decisive';
```

**Fails:**
```tsx
<motion.button transition={{ stiffness: 180 }}>
```

### 2. Raw Physics (Blocked unless Sandbox)

Raw `stiffness`, `damping`, `transition` values are blocked unless file has `// sigil-sandbox` header.

### 3. Zone Constraints

Files in zones with constraints are checked:
- `optimistic_ui: forbidden` — No immediate state updates
- `loading_spinners: forbidden` — No spinner patterns

### 4. Sandbox Age (Warned)

Sandboxes older than 7 days trigger warnings.

## Output Format

```
/validate

VALIDATING CODEBASE...

Recipe Coverage: 87% (43/49 animated components)

PASSING (43):
  ✓ src/checkout/ClaimButton.tsx (decisive/Button)
  ✓ src/checkout/ConfirmDialog.tsx (decisive/ConfirmFlow)
  ✓ src/admin/UserTable.tsx (machinery/Table)
  ...

VIOLATIONS (4):
  ✗ src/features/NewFeature.tsx
    Line 23: Raw spring(200, 15) outside sandbox
    Fix: Add // sigil-sandbox or use recipe

  ✗ src/checkout/QuickBuy.tsx
    Line 45: Optimistic UI in server_authoritative zone
    Fix: Use useServerTick pattern

SANDBOXES (2):
  ⚠ src/experiments/ButtonTest.tsx (3 days)
  ⚠ src/experiments/CardHover.tsx (9 days) — STALE

SUMMARY:
  Passing: 43
  Violations: 4
  Sandboxes: 2 (1 stale)
  Coverage: 87%

NEXT STEPS:
  - Fix violations with /craft or /sandbox + /codify
  - Codify stale sandbox: /codify src/experiments/CardHover.tsx
```

## Violation Types

| Type | Level | Resolution |
|------|-------|------------|
| Raw physics | BLOCK | Use recipe or sandbox |
| Constraint violation | IMPOSSIBLE | Must fix, cannot override |
| Missing recipe import | BLOCK | Add recipe import |
| Stale sandbox | WARN | Codify or clear |

## Report Output

With `--report`, writes to `sigil-mark/reports/validate-{date}.md`:

```markdown
# Validation Report

**Date:** 2026-01-05
**Coverage:** 87%

## Files by Zone

### decisive (src/checkout/)
| File | Status | Recipe |
|------|--------|--------|
| ClaimButton.tsx | PASS | Button |
| ... |

### machinery (src/admin/)
...

## Violations

[Detailed list with line numbers and fixes]
```

## Error Handling

| Error | Resolution |
|-------|------------|
| No components found | Check component paths |
| Zone config missing | Create .sigilrc.yaml |
| Recipe not found | Run /setup or check imports |

## Next Steps

After validate:
- Fix violations with `/craft`
- Codify sandboxes with `/codify`
- Check `/garden` for health report
