# Glyph: Physics Compliance Check

Self-validation step that verifies generated code matches stated physics.

## When to Run

After code generation, before presenting to user.

## Checks by Effect

### Financial Effect

| Check | Pattern | Violation |
|-------|---------|-----------|
| Sync | `onMutate` present | BLOCK: Financial must be pessimistic |
| Loading | No loading state | WARN: Should show pending state |
| Timing | < 800ms | WARN: Below minimum (unless taste override) |
| Confirmation | No two-phase | BLOCK: Financial requires confirmation |

### Destructive Effect

| Check | Pattern | Violation |
|-------|---------|-----------|
| Sync | `onMutate` present | BLOCK: Destructive must be pessimistic |
| Confirmation | No confirm step | BLOCK: Destructive requires confirmation |
| Timing | < 600ms | WARN: Below minimum |

### Standard Effect

| Check | Pattern | Violation |
|-------|---------|-----------|
| Sync | No `onMutate` | WARN: Standard should be optimistic |
| Rollback | Missing `onError` rollback | WARN: Optimistic needs rollback |

### Local Effect

| Check | Pattern | Violation |
|-------|---------|-----------|
| Server call | fetch/mutation present | WARN: Local should be immediate |

## Detection Patterns

### Sync Strategy Detection

```typescript
function detectSyncStrategy(code: string): 'pessimistic' | 'optimistic' | 'immediate' {
  // Check for onMutate (optimistic)
  if (code.includes('onMutate')) {
    return 'optimistic';
  }

  // Check for mutation hooks (pessimistic)
  if (code.match(/useMutation|useWriteContract/)) {
    return 'pessimistic';
  }

  // Check for server calls
  if (code.match(/fetch|axios|api\.|useQuery/)) {
    return 'pessimistic';
  }

  return 'immediate';
}
```

### Loading State Detection

```typescript
function hasLoadingState(code: string): boolean {
  return (
    code.includes('isPending') ||
    code.includes('isLoading') ||
    code.includes('status === "pending"') ||
    code.includes('status === "loading"')
  );
}
```

### Confirmation Detection

```typescript
function hasConfirmation(code: string): boolean {
  // Two-phase pattern
  const hasTwoPhase = code.match(/showConfirm|isConfirming|confirmStep/);

  // Modal/dialog pattern
  const hasModal = code.match(/Modal|Dialog|confirm\(/);

  // Explicit confirm button
  const hasConfirmButton = code.match(/Confirm.*button|button.*Confirm/i);

  return hasTwoPhase || hasModal || hasConfirmButton;
}
```

### Timing Detection

```typescript
function detectTiming(code: string): number | null {
  // Look for explicit timing values
  const timingMatch = code.match(/(\d+)ms|duration:\s*(\d+)|timeout:\s*(\d+)/);
  if (timingMatch) {
    return parseInt(timingMatch[1] || timingMatch[2] || timingMatch[3]);
  }

  // Check animation duration
  const animMatch = code.match(/transition.*?(\d+)/);
  if (animMatch) {
    return parseInt(animMatch[1]);
  }

  return null;
}
```

## Validation Output

```markdown
### Physics Compliance

✓ Sync: Pessimistic (no onMutate found)
✓ Loading: isPending state detected
✓ Timing: 800ms matches Financial effect
✓ Confirmation: Two-phase pattern detected
```

Or with violations:

```markdown
### Physics Compliance

✗ Sync: Found onMutate (Financial requires pessimistic)
  → BLOCK: Remove onMutate, use pessimistic sync
✓ Loading: isPending state detected
⚠ Timing: 500ms below 800ms minimum
  → WARN: Taste override required, or increase to 800ms
✓ Confirmation: Two-phase pattern detected
```

## Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| BLOCK | Violates core physics | Cannot proceed, must fix |
| WARN | Below recommendation | Note in output, allow proceed |
| INFO | Observation | Log only |

## BLOCK Violations

These violations prevent file write:

1. **Financial with onMutate** — Money operations cannot be optimistic
2. **Financial without confirmation** — Users must confirm before money moves
3. **Destructive with onMutate** — Permanent actions cannot be optimistic
4. **Destructive without confirmation** — Users must confirm before delete

## WARN Violations

These are noted but don't block:

1. **Timing below minimum** — Unless taste override exists
2. **Missing loading state** — Recommended but not required
3. **Standard without optimistic** — May be intentional

## Integration with Taste

Before flagging timing WARN, check taste.md:

```typescript
function checkTimingWithTaste(
  timing: number,
  effect: Effect,
  taste: TasteEntry[]
): Severity {
  const minTiming = PHYSICS_TABLE[effect].timing;

  if (timing >= minTiming) return 'OK';

  // Check for taste override
  const tasteOverride = taste.find(t =>
    t.field === 'timing' &&
    t.effect === effect &&
    t.tier >= 2
  );

  if (tasteOverride) {
    return 'OK'; // Taste allows lower timing
  }

  return 'WARN';
}
```

## Checklist Format

For internal tracking:

```yaml
physics_check:
  effect: Financial
  checks:
    sync:
      expected: pessimistic
      actual: pessimistic
      status: pass
    loading:
      expected: true
      actual: true
      status: pass
    timing:
      expected: 800
      actual: 500
      status: warn
      taste_override: power-user-timing
    confirmation:
      expected: required
      actual: present
      status: pass
  result: pass_with_warnings
  warnings: 1
  blocks: 0
```
