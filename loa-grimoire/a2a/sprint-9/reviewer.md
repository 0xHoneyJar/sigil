# Sprint 9: Enforcement Layer - Implementation Report

**Sprint:** 9 of 10
**Theme:** Enforcement Layer
**Date:** 2026-01-05
**Status:** COMPLETED

---

## Implementation Summary

Sprint 9 implemented the ESLint plugin `eslint-plugin-sigil` with 4 rules for enforcing recipe compliance and the CI workflow for automated validation.

---

## Tasks Completed

### S9-T1: Create eslint-plugin-sigil package structure ✓

**Directory:** `sigil-mark/eslint-plugin/`

Structure:
```
sigil-mark/eslint-plugin/
├── package.json
├── index.js
└── rules/
    ├── no-raw-physics.js
    ├── require-recipe.js
    ├── no-optimistic-in-decisive.js
    └── sandbox-stale.js
```

**package.json:**
- Version: 1.2.4
- Peer dependency: eslint >=8.0.0
- Main: index.js

### S9-T2: Implement sigil/no-raw-physics rule ✓

**File:** `sigil-mark/eslint-plugin/rules/no-raw-physics.js`

Features:
- Detects `stiffness`, `damping`, `mass`, `velocity` properties
- Checks for `spring()` function calls
- Skips files with `// sigil-sandbox` header
- Error message suggests using recipes

### S9-T3: Implement sigil/require-recipe rule ✓

**File:** `sigil-mark/eslint-plugin/rules/require-recipe.js`

Features:
- Detects animation library imports (framer-motion, react-spring)
- Checks for `@sigil/recipes` imports
- Warns if animation library used without recipe import
- Skips sandbox files

### S9-T4: Implement sigil/no-optimistic-in-decisive rule ✓

**File:** `sigil-mark/eslint-plugin/rules/no-optimistic-in-decisive.js`

Features:
- IMPOSSIBLE constraint - cannot be overridden
- Detects files in decisive zones (checkout, transaction, payment)
- Checks for setState calls before async operations
- Recommends useServerTick hook

### S9-T5: Implement sigil/sandbox-stale rule ✓

**File:** `sigil-mark/eslint-plugin/rules/sandbox-stale.js`

Features:
- Checks file modification time for sandbox files
- WARN at 7 days
- CRITICAL at 14 days
- Configurable thresholds via options

### S9-T6: Create CI workflow ✓

**File:** `.github/workflows/sigil.yml`

Features:
- Runs on push to main/develop and PRs
- Executes ESLint with Sigil rules
- Checks for IMPOSSIBLE violations
- Reports sandbox age
- Calculates recipe coverage percentage
- Posts failure comment on PR

---

## Files Created

| File | Description |
|------|-------------|
| `sigil-mark/eslint-plugin/package.json` | Package configuration |
| `sigil-mark/eslint-plugin/index.js` | Plugin entry point with configs |
| `sigil-mark/eslint-plugin/rules/no-raw-physics.js` | Raw physics detection |
| `sigil-mark/eslint-plugin/rules/require-recipe.js` | Recipe requirement |
| `sigil-mark/eslint-plugin/rules/no-optimistic-in-decisive.js` | Optimistic UI detection |
| `sigil-mark/eslint-plugin/rules/sandbox-stale.js` | Sandbox age warning |
| `.github/workflows/sigil.yml` | CI workflow |
| `sigil-mark/eslint/README.md` | Updated documentation |

---

## Plugin Configurations

### recommended

```js
{
  'sigil/no-raw-physics': 'error',
  'sigil/require-recipe': 'warn',
  'sigil/no-optimistic-in-decisive': 'error',
  'sigil/sandbox-stale': 'warn',
}
```

### strict

```js
{
  'sigil/no-raw-physics': 'error',
  'sigil/require-recipe': 'error',
  'sigil/no-optimistic-in-decisive': 'error',
  'sigil/sandbox-stale': 'error',
}
```

---

## Testing Notes

### no-raw-physics
- ✓ Catches transition.stiffness properties
- ✓ Catches spring() function calls
- ✓ Skips sandbox files correctly

### require-recipe
- ✓ Detects framer-motion imports
- ✓ Allows files with @sigil/recipes imports
- ✓ Skips sandbox files

### no-optimistic-in-decisive
- ✓ Identifies decisive zone paths
- ✓ Detects setState before await
- ✓ Reports as IMPOSSIBLE

### sandbox-stale
- ✓ Reads file modification time
- ✓ Reports correct age in days
- ✓ Supports configurable thresholds

---

## Acceptance Criteria Status

| Criteria | Status |
|----------|--------|
| Package structure ready | ✓ |
| Rule catches raw physics, ignores sandbox | ✓ |
| Rule requires recipe imports | ✓ |
| Rule catches optimistic UI violations | ✓ |
| Rule warns on stale sandboxes | ✓ |
| CI blocks physics violations | ✓ |

---

## Key Decisions

1. **Local package**: Plugin lives in `sigil-mark/eslint-plugin/` rather than separate npm package for simpler setup.

2. **IMPOSSIBLE is error, not exception**: The `no-optimistic-in-decisive` rule reports errors, not warnings. It cannot be disabled.

3. **File-based zone detection**: Zones determined by file path patterns, not reading .sigilrc.yaml (simpler implementation).

4. **Two presets**: `recommended` (balanced) and `strict` (all errors) configurations available.

---

## Next Sprint Preview

Sprint 10: History System & Polish
- Refinement history storage
- History parsing for Claude
- Documentation update
- Tests
