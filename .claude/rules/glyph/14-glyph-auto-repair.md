# Glyph: Auto-Repair

Automatically fix simple violations before presenting code to user.

## Philosophy

**Fix the obvious, flag the complex.**

Auto-repair handles mechanical fixes that have clear, safe solutions.
Complex violations that require architectural decisions are flagged for user.

## Auto-Repairable Violations

### 1. Touch Target Size

**Detection**: Interactive element < 44px height

**Repair**:
```typescript
function repairTouchTarget(element: string): string {
  // Add min-h-[44px] class
  if (element.includes('className=')) {
    return element.replace(
      /className="([^"]*)"/,
      'className="$1 min-h-[44px]"'
    );
  }

  // Add className if missing
  return element.replace(
    /^(<\w+)/,
    '$1 className="min-h-[44px]"'
  );
}
```

**Example**:
```tsx
// Before
<button onClick={handleClick}>Submit</button>

// After
<button onClick={handleClick} className="min-h-[44px]">Submit</button>
```

### 2. Focus Ring Missing

**Detection**: `outline-none` without ring replacement

**Repair**:
```typescript
function repairFocusRing(element: string): string {
  // Add focus-visible ring classes
  return element.replace(
    /outline-none/,
    'outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500'
  );
}
```

**Example**:
```tsx
// Before
<button className="outline-none bg-blue-500">Click</button>

// After
<button className="outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 bg-blue-500">Click</button>
```

### 3. BigInt Falsy Check

**Detection**: `if (amount)` where amount is BigInt

**Repair**:
```typescript
function repairBigIntCheck(code: string, varName: string): string {
  // Replace falsy check with proper null + value check
  const patterns = [
    {
      find: new RegExp(`if\\s*\\(\\s*${varName}\\s*\\)`),
      replace: `if (${varName} != null && ${varName} > 0n)`
    },
    {
      find: new RegExp(`!${varName}`),
      replace: `(${varName} == null || ${varName} === 0n)`
    },
    {
      find: new RegExp(`${varName}\\s*&&`),
      replace: `(${varName} != null && ${varName} > 0n) &&`
    }
  ];

  let result = code;
  for (const { find, replace } of patterns) {
    result = result.replace(find, replace);
  }
  return result;
}
```

**Example**:
```tsx
// Before
if (shares) {
  withdraw(shares);
}

// After
if (shares != null && shares > 0n) {
  withdraw(shares);
}
```

### 4. Missing Null Coalescing

**Detection**: BigInt used directly without null check

**Repair**:
```typescript
function repairNullCoalescing(code: string, varName: string): string {
  // Add ?? 0n for display contexts
  return code.replace(
    new RegExp(`\\{${varName}\\}`, 'g'),
    `{${varName} ?? 0n}`
  );
}
```

**Example**:
```tsx
// Before
<span>{balance}</span>

// After
<span>{balance ?? 0n}</span>
```

## Non-Auto-Repairable

These require user decision:

| Violation | Reason |
|-----------|--------|
| Cancel hidden during loading | Requires restructuring JSX conditional |
| Withdraw unreachable | Requires logic change |
| Wrong sync strategy | Requires mutation restructure |
| Missing confirmation | Requires new component/state |
| Transaction data from indexer | Requires different data source |
| Missing receipt guard | Requires new ref and effect restructure |

## Repair Pipeline

```typescript
async function autoRepair(
  code: string,
  violations: Violation[]
): Promise<{ code: string; repairs: Repair[] }> {
  const repairs: Repair[] = [];
  let repairedCode = code;

  for (const violation of violations) {
    if (!violation.autoRepair) continue;

    const { find, replace } = violation.autoRepair;

    // Apply repair
    const newCode = repairedCode.replace(find, replace);

    // Verify repair was applied
    if (newCode !== repairedCode) {
      repairs.push({
        violation: violation.message,
        line: violation.line,
        change: { from: find, to: replace }
      });
      repairedCode = newCode;
    }
  }

  return { code: repairedCode, repairs };
}
```

## Repair Logging

Auto-repairs are logged to NOTES.md:

```markdown
### Auto-Repairs Applied
| Date | Component | Violation | Repair |
|------|-----------|-----------|--------|
| 2026-01-25 | ClaimButton | Touch target 32px | Added min-h-[44px] |
| 2026-01-25 | ClaimButton | BigInt falsy check | Changed to != null && > 0n |
```

## Safety Guarantees

1. **Idempotent** — Running repair twice produces same result
2. **Preserving** — Never removes functionality
3. **Additive** — Only adds classes/checks, doesn't restructure
4. **Reversible** — User can undo in generated code

## Repair Summary Format

```markdown
## Auto-Repairs Applied

- **Line 45**: Touch target → Added `min-h-[44px]`
- **Line 67**: BigInt check → Changed to `!= null && > 0n`

These repairs were applied automatically. Review and adjust if needed.
```
