# /ward-all Command

Batch physics validation across all components in the codebase.

---

## Purpose

Scan the codebase for components and validate physics compliance:
- Touch target sizes (≥ 44px)
- Focus ring visibility
- Protected capability presence
- Physics attribute consistency

---

## Usage

```
/ward-all [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--path` | Directory to scan | `src/components` |
| `--fix` | Auto-fix issues where possible | false |
| `--report` | Output detailed report file | false |
| `--severity` | Minimum severity to report | `warning` |

---

## Workflow

### Step 1: Discover Components

Scan for component files:
```
1. Find all .tsx/.jsx files in target path
2. Filter to files exporting React components
3. Skip test files (*test*, *spec*, __tests__)
4. Skip story files (*.stories.*)
```

### Step 2: Analyze Each Component

For each component:
```
1. Parse JSX structure
2. Find interactive elements (button, a, input, [role="button"])
3. Check for physics attributes (data-sigil-physics)
4. Detect effect type from naming/props
5. Run validation checks
```

### Step 3: Validation Checks

| Check | Severity | Auto-fixable |
|-------|----------|--------------|
| Touch target < 44px | Error | Yes |
| Missing focus ring | Error | Yes |
| Financial without confirmation | Error | No |
| Destructive without confirmation | Error | No |
| Missing cancel button | Warning | No |
| Optimistic for Financial | Error | No |
| Missing physics attribute | Info | No |
| Inconsistent timing | Warning | No |

### Step 4: Generate Report

```
┌─ Ward All Report ──────────────────────────────────────────┐
│                                                            │
│  Scanned: 47 components                                    │
│  Pass: 42 | Warn: 3 | Error: 2                             │
│                                                            │
│  ─────────────────────────────────────────────────────────│
│                                                            │
│  ❌ ERROR (2)                                               │
│                                                            │
│  src/components/ClaimButton.tsx:24                         │
│    Touch target: 32px (min: 44px)                          │
│    Fix: Add min-h-[44px] min-w-[44px]                      │
│                                                            │
│  src/components/DeleteModal.tsx:45                         │
│    Missing confirmation for Destructive effect             │
│    Fix: Add confirmation step before action                │
│                                                            │
│  ─────────────────────────────────────────────────────────│
│                                                            │
│  ⚠️ WARNING (3)                                             │
│                                                            │
│  src/components/TransferForm.tsx:67                        │
│    Cancel button hidden during loading state               │
│    Fix: Keep cancel visible with disabled={false}          │
│                                                            │
│  src/components/WalletConnect.tsx:12                       │
│    No physics attribute, effect inferred as Financial      │
│    Fix: Add data-sigil-physics attribute                   │
│                                                            │
│  src/components/SettingsPanel.tsx:89                       │
│    Inconsistent timing: 300ms (expected 200ms for Local)   │
│    Fix: Update to 200ms for Local physics                  │
│                                                            │
│  ─────────────────────────────────────────────────────────│
│                                                            │
│  Run with --fix to auto-fix 3 issues                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Auto-Fix Behavior

When `--fix` is provided:

1. **Touch targets**: Add padding/min dimensions
2. **Focus rings**: Add Tailwind focus classes
3. **Physics attributes**: Add data-sigil-physics with detected effect

Auto-fix is conservative:
- Only fixes clearly safe transformations
- Never changes business logic
- Never removes code
- Always shows what was changed

---

## Output Modes

### Terminal (default)
Colorized summary with expandable details.

### Report File (`--report`)
Generates `grimoires/sigil/ward-report.md`:

```markdown
# Ward Report

Generated: 2026-01-19T10:30:00Z
Scanned: 47 components

## Summary

| Severity | Count |
|----------|-------|
| Error | 2 |
| Warning | 3 |
| Info | 5 |
| Pass | 37 |

## Errors

### src/components/ClaimButton.tsx:24

**Issue**: Touch target below minimum
**Current**: 32px
**Required**: 44px
**Fix**: Add `min-h-[44px] min-w-[44px]`

...
```

---

## Integration with CI

Add to CI pipeline:
```yaml
- name: Physics Validation
  run: |
    # Run ward-all and fail on errors
    /ward-all --severity error
```

Exit codes:
- 0: No errors
- 1: Errors found
- 2: Scan failed

---

## Related

- `/ward` - Single element validation
- `/craft` - Generate with physics (includes validation)
- `/audit` - Full security + physics audit
