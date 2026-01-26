---
name: validating
description: Run physics and rigor validation on sprint components
user-invocable: true
disable-model-invocation: true
allowed-tools:
  - Read
  - Glob
  - Grep
---

# Validating

Run physics and rigor validation commands on sprint components.

## Usage

```
/validate physics              # Validate all sprint components
/validate physics --strict     # Treat WARN as BLOCK
/validate rigor                # Run Rigor checks on web3 files
/validate rigor file.tsx       # Run Rigor on specific file
```

## Subcommands

### `/validate physics`

Run Glyph validation on all UI components in current sprint scope.

**Workflow**:

1. Identify sprint scope (modified .tsx/.jsx files)
2. For each component:
   - Detect effect from code
   - Check physics compliance
   - Check protected capabilities
3. Generate report
4. Log to `grimoires/loa/a2a/` feedback directory

**Output**:

```markdown
## Physics Validation Report

### Components Checked

| Component | Effect | Physics | Protected | Status |
|-----------|--------|---------|-----------|--------|
| ClaimButton.tsx | Financial | ✓ | ✓ | PASS |
| DeleteModal.tsx | Destructive | ⚠ | ✓ | WARN |
| ThemeToggle.tsx | Local | ✓ | ✓ | PASS |

### Warnings

**DeleteModal.tsx**:
- Timing: 400ms below 600ms minimum
  - No taste override found
  - Recommendation: Increase to 600ms or add taste entry

### Summary
- 3 components validated
- 2 passed, 1 warning, 0 blocked
- Status: PASS_WITH_WARNINGS
```

**Strict Mode** (`--strict`):

```typescript
function determineStatus(
  violations: Violation[],
  strict: boolean
): Status {
  const hasBlock = violations.some(v => v.severity === 'BLOCK');
  const hasWarn = violations.some(v => v.severity === 'WARN');

  if (hasBlock) return 'BLOCKED';
  if (hasWarn && strict) return 'BLOCKED';  // Strict treats WARN as BLOCK
  if (hasWarn) return 'PASS_WITH_WARNINGS';
  return 'PASS';
}
```

### `/validate rigor`

Run Rigor checks on web3 files in current sprint scope.

**Workflow**:

1. Detect web3 files via pattern matching
2. For each file:
   - Check BigInt safety
   - Check data source correctness
   - Check receipt guards
   - Check stale closures
3. Generate report
4. Log to `grimoires/loa/a2a/` feedback directory

**Output**:

```markdown
## Rigor Validation Report

### Files Checked

| File | BigInt | Data Source | Receipt | Stale Closure | Status |
|------|--------|-------------|---------|---------------|--------|
| VaultWithdraw.tsx | ✓ | ✗ | ✓ | ✓ | CRITICAL |
| StakingPanel.tsx | ⚠ | ✓ | ⚠ | ✓ | HIGH |

### Findings

**VaultWithdraw.tsx** (CRITICAL):
- Line 45: Transaction amount from indexed data
  - Current: `mutate({ amount: envioData.shares })`
  - Fix: Use `useReadContract` for transaction amounts

**StakingPanel.tsx** (HIGH):
- Line 67: BigInt falsy check
  - Current: `if (shares)`
  - Fix: `if (shares != null && shares > 0n)`
- Line 89: Missing receipt guard
  - Fix: Add transactionHash comparison

### Summary
- 2 files checked
- 3 findings (1 CRITICAL, 2 HIGH)
- Status: BLOCKED
```

### `/validate rigor file.tsx`

Run Rigor checks on a specific file.

**Output**:

```markdown
## Rigor: VaultWithdraw.tsx

### BigInt Safety
✓ No falsy checks on BigInt variables

### Data Source
✗ CRITICAL: Transaction amount from indexed data (line 45)
  - `envioData.shares` used in mutation
  - Should use on-chain data

### Receipt Guard
✓ Hash comparison present (line 78)

### Stale Closure
✓ No captured state variables without deps

### Status: BLOCKED (1 CRITICAL)
```

## Integration with Workflow

### During `/review-sprint`

Physics validation runs automatically:

```
/review-sprint
  ↓
[Run tests]
  ↓
[Run /validate physics] ← Hook
  ↓
[Generate review report]
```

### During `/audit-sprint`

Rigor validation runs automatically:

```
/audit-sprint
  ↓
[Security review]
  ↓
[Run /validate rigor] ← Hook
  ↓
[Generate audit report]
```

## Feedback Logging

Results are logged to `grimoires/loa/a2a/`:

```
grimoires/loa/a2a/
├── physics-validation-2026-01-26.md
└── rigor-validation-2026-01-26.md
```

Format:

```markdown
# Physics Validation - 2026-01-26

Sprint: sprint-1
Components: 3
Status: PASS_WITH_WARNINGS

## Results
[Full report...]

## Actions Taken
- DeleteModal.tsx: Warning noted, taste entry suggested
```

## Rules Loaded

- `rules/glyph/11-glyph-physics-check.md`
- `rules/glyph/12-glyph-protected-check.md`
- `rules/glyph/13-glyph-rigor-check.md`
- `rules/rigor/*.md`
