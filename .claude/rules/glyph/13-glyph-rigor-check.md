# Glyph: Rigor Check Integration

Self-validation step for web3 safety. Catches bugs that lose money.

## When to Activate

Run Rigor checks when ANY of these patterns detected:

```typescript
const WEB3_PATTERNS = [
  /useWriteContract/,
  /useReadContract/,
  /usePrepareContractWrite/,
  /wagmi/,
  /viem/,
  /ethers/,
  /BigInt|bigint|0n/,
  /wei|gwei|ether/i,
  /transaction|tx/i,
  /wallet|connect/i,
  /approve|allowance/i
];

function isWeb3Component(code: string): boolean {
  return WEB3_PATTERNS.some(pattern => pattern.test(code));
}
```

## Critical Checks

### 1. BigInt Safety

**Pattern**: `if (amount)` where amount is BigInt

**Problem**: `0n` is falsy, so valid zero amounts fail the check

**Detection**:
```typescript
function checkBigIntSafety(code: string): CheckResult[] {
  const results: CheckResult[] = [];

  // Find BigInt-typed variables
  const bigIntVars = findBigIntVariables(code);

  for (const varName of bigIntVars) {
    // Check for falsy patterns
    const falsyPattern = new RegExp(
      `if\\s*\\(\\s*${varName}\\s*\\)|` +
      `${varName}\\s*\\?|` +
      `!${varName}|` +
      `${varName}\\s*&&`
    );

    const match = code.match(falsyPattern);
    if (match) {
      results.push({
        status: 'HIGH',
        message: `BigInt falsy check on "${varName}"`,
        line: findLineNumber(code, match[0]),
        autoRepair: {
          find: match[0],
          replace: getSafePattern(match[0], varName)
        }
      });
    }
  }

  return results;
}

function getSafePattern(original: string, varName: string): string {
  if (original.includes('if')) {
    return `if (${varName} != null && ${varName} > 0n)`;
  }
  if (original.includes('?')) {
    return `(${varName} != null && ${varName} > 0n) ?`;
  }
  if (original.startsWith('!')) {
    return `(${varName} == null || ${varName} === 0n)`;
  }
  return `(${varName} != null && ${varName} > 0n) &&`;
}
```

**Safe Patterns**:
```tsx
// Existence AND positive
if (amount != null && amount > 0n) { ... }

// Existence only
if (amount !== undefined && amount !== null) { ... }

// With default (OK for display)
const shares = data ?? 0n
const canAct = (data ?? 0n) > 0n
```

### 2. Data Source Correctness

**Pattern**: Transaction amount from indexed data

**Problem**: Indexed data can be stale, leading to wrong transaction amounts

**Detection**:
```typescript
function checkDataSource(code: string): CheckResult[] {
  const results: CheckResult[] = [];

  // Find mutation/write calls
  const mutations = code.matchAll(
    /mutate\(([^)]+)\)|writeContract\(([^)]+)\)/g
  );

  for (const match of mutations) {
    const args = match[1] || match[2];

    // Check if amount comes from indexed source
    const usesIndexed = args.match(/envio|indexed|graphql|subgraph/i);

    if (usesIndexed) {
      results.push({
        status: 'CRITICAL',
        message: 'Transaction amount from indexed data',
        line: findLineNumber(code, match[0]),
        fix: 'Use on-chain data (useReadContract) for transaction amounts'
      });
    }
  }

  return results;
}
```

**Required Pattern**:
```tsx
// Transaction amounts MUST come from on-chain
const { data: onChainBalance } = useReadContract({
  address: VAULT,
  abi: vaultAbi,
  functionName: 'balanceOf',
  args: [userAddress]
});

// Button state from on-chain
const canWithdraw = (onChainBalance ?? 0n) > 0n;

// Transaction uses on-chain value
mutate({ amount: onChainBalance });
```

### 3. Receipt Guard

**Pattern**: `useEffect` on receipt without hash guard

**Problem**: Receipt updates can trigger effects multiple times

**Detection**:
```typescript
function checkReceiptGuard(code: string): CheckResult[] {
  const results: CheckResult[] = [];

  // Find useEffect with receipt dependency
  const receiptEffects = code.matchAll(
    /useEffect\([^)]*,\s*\[[^\]]*receipt[^\]]*\]\)/g
  );

  for (const match of receiptEffects) {
    const effectBody = extractEffectBody(code, match.index);

    // Check for hash guard
    const hasHashGuard = effectBody.match(
      /transactionHash.*===.*lastHash|lastHash.*===.*transactionHash/
    );

    if (!hasHashGuard) {
      results.push({
        status: 'HIGH',
        message: 'Receipt effect without hash guard',
        line: findLineNumber(code, match[0]),
        fix: 'Add transactionHash comparison to prevent re-execution'
      });
    }
  }

  return results;
}
```

**Required Pattern**:
```tsx
const lastHashRef = useRef<string>();

useEffect(() => {
  if (!receipt) return;
  if (receipt.transactionHash === lastHashRef.current) return;
  lastHashRef.current = receipt.transactionHash;

  handleSuccess(receipt);
}, [receipt]);
```

### 4. Stale Closure Prevention

**Pattern**: useEffect callback using external state

**Problem**: Callbacks capture state at creation time, not execution time

**Detection**:
```typescript
function checkStaleClosure(code: string): CheckResult[] {
  const results: CheckResult[] = [];

  // Find useEffect hooks
  const effects = code.matchAll(/useEffect\(\s*\(\)\s*=>\s*\{([^}]+)\}/g);

  for (const match of effects) {
    const body = match[1];
    const deps = extractDeps(code, match.index);

    // Find state variables used in body but not in deps
    const usedState = body.matchAll(/\b(amount|balance|value)\b/g);

    for (const stateMatch of usedState) {
      const varName = stateMatch[1];
      if (!deps.includes(varName)) {
        results.push({
          status: 'HIGH',
          message: `Potential stale closure: "${varName}" used but not in deps`,
          line: findLineNumber(code, match[0]),
          fix: 'Add to deps or use useRef/useCallback'
        });
      }
    }
  }

  return results;
}
```

## Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| CRITICAL | Will lose money | BLOCK generation |
| HIGH | Likely bug | BLOCK or auto-repair |
| WARN | Potential issue | Note in output |

## Validation Output

```markdown
### Rigor (Web3 Safety)

✓ BigInt: Safe patterns used
✗ Data source: Transaction amount from indexed data (line 45)
  → CRITICAL: Use useReadContract for transaction amounts
⚠ Receipt guard: Missing hash comparison (line 67)
  → HIGH: Add transactionHash guard to prevent re-execution
✓ Stale closure: No issues detected
```

## CRITICAL Violations

These BLOCK generation:

1. **Transaction amount from indexed data**
2. **Missing approval check before transfer**
3. **Unchecked return value on write**

## Auto-Repairable (HIGH)

| Violation | Auto-Repair |
|-----------|-------------|
| BigInt falsy check | Replace with `!= null && > 0n` |
| Missing ?? 0n default | Add null coalescing |

## Non-Auto-Repairable (HIGH)

| Violation | Reason |
|-----------|--------|
| Data source wrong | Requires architecture change |
| Missing receipt guard | Requires new state/ref |
| Stale closure | Requires refactoring |

## Integration

Rigor checks run as part of self-validation when web3 patterns detected.
They do NOT run for non-web3 components to avoid false positives.

```typescript
async function selfValidate(code: string, effect: Effect): Promise<ValidationResult> {
  const results = [];

  // Always run
  results.push(...checkPhysicsCompliance(code, effect));
  results.push(...checkProtectedCapabilities(code));

  // Only for web3
  if (isWeb3Component(code)) {
    results.push(...checkBigIntSafety(code));
    results.push(...checkDataSource(code));
    results.push(...checkReceiptGuard(code));
    results.push(...checkStaleClosure(code));
  }

  return aggregateResults(results);
}
```
