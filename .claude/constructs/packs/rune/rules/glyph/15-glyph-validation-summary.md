# Glyph: Self-Validation Summary

Format and display self-validation results after generation.

## Summary Format

### Passing (All Green)

```markdown
## Self-Validation

✓ Physics: Pessimistic sync implemented correctly
✓ Protected: Cancel button present and visible
✓ Rigor: BigInt checks use safe patterns

Ready to write file.
```

### With Warnings

```markdown
## Self-Validation

✓ Physics: Pessimistic sync implemented correctly
✓ Protected: Cancel button present and visible
⚠ Timing: 500ms below 800ms minimum
  → Taste override "power-user-timing" allows this

[Auto-repaired: Added min-h-[44px] to confirm button]

Ready to write file (1 warning).
```

### With Blocks

```markdown
## Self-Validation

✓ Physics: Pessimistic sync implemented correctly
✗ Protected: Cancel button hidden during loading (line 34)
  → BLOCK: Cancel must be visible during all states
✓ Rigor: BigInt checks use safe patterns

Cannot write file. Fix required:
- Line 34: Change `{!isPending && <Cancel />}` to always show Cancel
```

## Severity Icons

| Icon | Meaning |
|------|---------|
| ✓ | Check passed |
| ⚠ | Warning (allowed to proceed) |
| ✗ | Block (must fix before proceed) |

## Section Order

1. **Physics Compliance** — Sync, timing, confirmation
2. **Protected Capabilities** — Cancel, withdraw, touch targets
3. **Rigor (if web3)** — BigInt, data source, receipt guard
4. **Auto-Repairs** — List of automatic fixes applied

## Verbosity Levels

### Minimal (default)

Show only failures and warnings:

```markdown
## Self-Validation

✓ All physics checks passed
✓ All protected capabilities verified
⚠ 1 warning (timing below minimum)

[Auto-repaired: 1 fix applied]
```

### Verbose (on request)

Show all individual checks:

```markdown
## Self-Validation

### Physics Compliance
✓ Sync: Pessimistic (no onMutate found)
✓ Loading: isPending state detected
✓ Timing: 800ms matches Financial effect
✓ Confirmation: Two-phase pattern detected

### Protected Capabilities
✓ Cancel: Button visible during all states
✓ Withdraw: Always reachable
✓ Touch targets: All >= 44px
✓ Focus rings: Present on all interactive elements

### Rigor (Web3)
✓ BigInt: Safe patterns used
✓ Data source: On-chain for transaction
✓ Receipt guard: Hash comparison present
✓ Stale closure: No issues detected

### Auto-Repairs
- Line 45: Added min-h-[44px] class
```

## Conditional Sections

### Rigor Section

Only show if web3 patterns detected:

```typescript
function shouldShowRigor(code: string): boolean {
  return isWeb3Component(code);
}
```

### Auto-Repair Section

Only show if repairs were applied:

```typescript
function shouldShowRepairs(repairs: Repair[]): boolean {
  return repairs.length > 0;
}
```

## Block Behavior

When ANY block-level violation exists:

1. Show all violations with line numbers
2. Show specific fix suggestions
3. Do NOT write file
4. Do NOT proceed to file write step

```markdown
## Self-Validation

✗ BLOCKED: 2 critical violations

1. **Line 34**: Cancel button hidden during loading
   Fix: Change `{!isPending && <Cancel />}` to `<Cancel disabled={isPending} />`

2. **Line 67**: Transaction amount from indexed data
   Fix: Use `useReadContract` instead of indexer query

Generation blocked. Fix these issues and regenerate.
```

## Warning Behavior

Warnings don't block but are noted:

1. Show warning with context
2. If taste override exists, note it
3. Proceed to file write
4. Log warning to NOTES.md

## Summary Implementation

```typescript
function formatValidationSummary(
  results: ValidationResult[],
  repairs: Repair[],
  options: { verbose?: boolean } = {}
): string {
  const blocks = results.filter(r => r.status === 'BLOCK');
  const warnings = results.filter(r => r.status === 'WARN');
  const passes = results.filter(r => r.status === 'OK');

  let output = '## Self-Validation\n\n';

  if (blocks.length > 0) {
    output += `✗ BLOCKED: ${blocks.length} critical violation(s)\n\n`;
    for (const block of blocks) {
      output += `- **Line ${block.line}**: ${block.message}\n`;
      output += `  Fix: ${block.fix}\n\n`;
    }
    output += 'Generation blocked. Fix these issues and regenerate.\n';
    return output;
  }

  if (options.verbose) {
    // Show all individual checks
    output += formatVerboseResults(results);
  } else {
    // Show summary
    output += `✓ All ${passes.length} checks passed\n`;
    if (warnings.length > 0) {
      output += `⚠ ${warnings.length} warning(s)\n`;
      for (const warn of warnings) {
        output += `  - ${warn.message}\n`;
      }
    }
  }

  if (repairs.length > 0) {
    output += '\n[Auto-repaired: ';
    output += repairs.map(r => r.violation).join(', ');
    output += ']\n';
  }

  return output;
}
```

## File Write Decision

```typescript
function canWriteFile(results: ValidationResult[]): boolean {
  return !results.some(r => r.status === 'BLOCK');
}
```

## Logging to NOTES.md

After validation, log summary:

```markdown
### Physics Decisions
| Date | Component | Effect | Timing | Validation | Notes |
|------|-----------|--------|--------|------------|-------|
| 2026-01-25 | ClaimButton | Financial | 800ms | ✓ passed | — |
| 2026-01-25 | DeleteModal | Destructive | 600ms | ⚠ 1 warn | touch target repaired |
```
