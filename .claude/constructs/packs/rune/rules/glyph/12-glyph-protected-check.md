# Glyph: Protected Capability Check

Self-validation step that verifies protected capabilities are not violated.

## Protected Capabilities

| Capability | Rule | Violation Level |
|------------|------|-----------------|
| Withdraw | Always reachable | BLOCK |
| Cancel | Always visible | BLOCK |
| Balance | Always accurate | WARN |
| Touch Target | >= 44px | WARN (auto-repair) |
| Focus Ring | Always visible | WARN (auto-repair) |
| Error Recovery | Always available | WARN |

## Detection Patterns

### Cancel Visibility

```typescript
function checkCancelVisibility(code: string): CheckResult {
  // Anti-pattern: Cancel hidden during loading
  const hiddenDuringLoading = code.match(
    /\{!isPending\s*&&.*Cancel|isPending\s*\?\s*null.*Cancel|\{!isLoading\s*&&.*Cancel/
  );

  if (hiddenDuringLoading) {
    return {
      status: 'BLOCK',
      message: 'Cancel button hidden during loading',
      line: findLineNumber(code, hiddenDuringLoading[0]),
      fix: 'Cancel must remain visible during pending states'
    };
  }

  // Check Cancel exists in mutation context
  const hasMutation = code.match(/useMutation|useWriteContract/);
  const hasCancel = code.match(/Cancel|cancel|onCancel|handleCancel/i);

  if (hasMutation && !hasCancel) {
    return {
      status: 'WARN',
      message: 'No cancel option detected in mutation flow',
      fix: 'Add cancel button or escape route'
    };
  }

  return { status: 'OK' };
}
```

### Withdraw Reachability

```typescript
function checkWithdrawReachability(code: string): CheckResult {
  // Check if this is a withdraw-related component
  const isWithdrawComponent = code.match(/withdraw|Withdraw/i);
  if (!isWithdrawComponent) return { status: 'OK' };

  // Anti-pattern: Withdraw behind loading gate
  const blockedByLoading = code.match(
    /\{!isLoading\s*&&.*Withdraw|isLoading\s*\?\s*null.*Withdraw/
  );

  if (blockedByLoading) {
    return {
      status: 'BLOCK',
      message: 'Withdraw button blocked during loading',
      line: findLineNumber(code, blockedByLoading[0]),
      fix: 'Withdraw must always be accessible'
    };
  }

  return { status: 'OK' };
}
```

### Touch Target Size

```typescript
function checkTouchTargets(code: string): CheckResult[] {
  const results: CheckResult[] = [];

  // Find all interactive elements
  const interactives = code.matchAll(
    /<(button|a|input|select)[^>]*>/gi
  );

  for (const match of interactives) {
    const element = match[0];
    const line = findLineNumber(code, element);

    // Check for explicit size classes
    const hasMinHeight = element.match(/min-h-\[(\d+)px\]|h-(\d+)/);
    const hasMinWidth = element.match(/min-w-\[(\d+)px\]|w-(\d+)/);

    if (hasMinHeight) {
      const height = parseInt(hasMinHeight[1] || hasMinHeight[2]);
      if (height < 44) {
        results.push({
          status: 'WARN',
          message: `Touch target height ${height}px below 44px minimum`,
          line,
          autoRepair: {
            find: element,
            replace: addMinHeight(element, 44)
          }
        });
      }
    } else {
      // No explicit height - flag for review
      results.push({
        status: 'WARN',
        message: 'Touch target has no explicit minimum height',
        line,
        autoRepair: {
          find: element,
          replace: addMinHeight(element, 44)
        }
      });
    }
  }

  return results;
}
```

### Focus Ring Visibility

```typescript
function checkFocusRing(code: string): CheckResult[] {
  const results: CheckResult[] = [];

  // Find all interactive elements
  const interactives = code.matchAll(
    /<(button|a|input|select)[^>]*>/gi
  );

  for (const match of interactives) {
    const element = match[0];
    const line = findLineNumber(code, element);

    // Check for focus-visible styles
    const hasFocusStyles = element.match(
      /focus-visible:|focus:|:focus|outline/
    );

    // Check for outline-none without replacement
    const hasOutlineNone = element.match(/outline-none|outline-0/);
    const hasRingReplacement = element.match(/ring-|focus-visible:ring/);

    if (hasOutlineNone && !hasRingReplacement) {
      results.push({
        status: 'WARN',
        message: 'Focus ring removed without replacement',
        line,
        autoRepair: {
          find: 'outline-none',
          replace: 'outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
        }
      });
    }

    if (!hasFocusStyles && !hasOutlineNone) {
      // Using browser default - OK
    }
  }

  return results;
}
```

### Balance Accuracy

```typescript
function checkBalanceAccuracy(code: string): CheckResult {
  // Check if component displays balance
  const hasBalance = code.match(/balance|Balance/i);
  if (!hasBalance) return { status: 'OK' };

  // Check for query invalidation on mutation
  const hasMutation = code.match(/useMutation|useWriteContract/);
  const hasInvalidation = code.match(/invalidateQueries|refetch/);

  if (hasMutation && !hasInvalidation) {
    return {
      status: 'WARN',
      message: 'Balance displayed but not invalidated after mutation',
      fix: 'Add queryClient.invalidateQueries in onSuccess'
    };
  }

  return { status: 'OK' };
}
```

## Validation Output

```markdown
### Protected Capabilities

✓ Cancel: Button visible during all states
✓ Withdraw: Always reachable
✓ Balance: Invalidated on mutation
⚠ Touch target: 32px on line 45
  → Auto-repair: Added min-h-[44px]
⚠ Focus ring: Missing on line 52
  → Auto-repair: Added focus-visible:ring-2
```

## BLOCK Violations

Cannot proceed if:

1. **Cancel hidden during loading** — User trapped in mutation
2. **Withdraw unreachable** — User cannot access funds
3. **Financial without Cancel** — No escape from money operation

## Auto-Repairable

| Violation | Auto-Repair |
|-----------|-------------|
| Touch target < 44px | Add `min-h-[44px]` class |
| Missing focus ring | Add `focus-visible:ring-2` |
| outline-none without replacement | Add ring classes |

## Non-Auto-Repairable

| Violation | Reason |
|-----------|--------|
| Cancel hidden during loading | Requires structural change |
| Withdraw unreachable | Requires logic change |
| Missing error recovery | Requires new component |

These require user intervention and block the generation.

## Integration with Rigor

If web3 patterns detected, also check:
- Balance from on-chain, not indexer
- Amount validation before display

See `13-glyph-rigor-check.md` for details.
