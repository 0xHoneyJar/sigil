# Audit Sprint Hook

Runs Rigor checks during `/audit-sprint` for web3 safety validation.

## Trigger

Activated when `/audit-sprint` runs and files contain:
- Web3 patterns: useWriteContract, BigInt, transaction flows
- Financial types: Currency, Wei, Token, Amount

## Detection Patterns

```typescript
const WEB3_PATTERNS = [
  /useWriteContract|useReadContract|useSendTransaction/,
  /usePrepareContractWrite|useContractWrite/,
  /BigInt\(|0n|[0-9]+n/,
  /wagmi|viem|ethers/,
  /approve|transfer|claim|withdraw|stake|swap|mint|burn|bridge/,
  /wei|gwei|ether/i,
  /transaction|tx/i
];

function isWeb3File(content: string): boolean {
  return WEB3_PATTERNS.some(pattern => pattern.test(content));
}
```

## Behavior

### Step 1: Scan Sprint Files

```typescript
async function scanSprintFiles(sprintDir: string): Promise<string[]> {
  const allFiles = await glob(`${sprintDir}/**/*.{ts,tsx,js,jsx}`);

  const web3Files: string[] = [];
  for (const file of allFiles) {
    const content = await readFile(file);
    if (isWeb3File(content)) {
      web3Files.push(file);
    }
  }

  return web3Files;
}
```

### Step 2: Run Rigor Checks

For each detected file:

```typescript
async function runRigorChecks(filePath: string): Promise<Finding[]> {
  const content = await readFile(filePath);
  const findings: Finding[] = [];

  // BigInt safety
  findings.push(...checkBigIntSafety(content, filePath));

  // Data source correctness
  findings.push(...checkDataSource(content, filePath));

  // Receipt guard
  findings.push(...checkReceiptGuard(content, filePath));

  // Stale closure
  findings.push(...checkStaleClosure(content, filePath));

  return findings;
}
```

### Step 3: Classify Findings

| Category | Severity | Detection |
|----------|----------|-----------|
| Data Source | CRITICAL | Transaction amount from indexed data |
| BigInt Safety | HIGH | `if (amount)` for BigInt variable |
| Receipt Guard | HIGH | useEffect on receipt without hash check |
| Stale Closure | MEDIUM | State variable in effect without deps |
| Missing Validation | MEDIUM | No amount > 0 check before transaction |

### Step 4: Generate Report

```markdown
## Rigor Validation (Web3 Safety)

### VaultWithdraw.tsx
**CRITICAL**: Transaction amount from indexed data (line 45)
```tsx
// Current (WRONG)
mutate({ amount: envioData.shares })

// Should be
mutate({ amount: onChainShares })
```
→ Fix: Use useReadContract for transaction amounts

**HIGH**: BigInt falsy check (line 67)
```tsx
// Current (WRONG)
if (shares) { withdraw(shares) }

// Should be
if (shares != null && shares > 0n) { withdraw(shares) }
```
→ Fix: Use explicit null check and comparison

---

### StakingPanel.tsx
**HIGH**: Missing receipt guard (line 89)
```tsx
// Current (WRONG)
useEffect(() => {
  if (receipt) handleSuccess(receipt)
}, [receipt])

// Should be
useEffect(() => {
  if (!receipt) return
  if (receipt.transactionHash === lastHash.current) return
  lastHash.current = receipt.transactionHash
  handleSuccess(receipt)
}, [receipt])
```
→ Fix: Add transactionHash comparison

---

## Summary

| Severity | Count | Files |
|----------|-------|-------|
| CRITICAL | 1 | VaultWithdraw.tsx |
| HIGH | 2 | VaultWithdraw.tsx, StakingPanel.tsx |
| MEDIUM | 0 | — |

**Status**: BLOCKED (1 CRITICAL finding)

CRITICAL findings must be addressed before audit approval.
```

## Blocking Behavior

| Severity | Action |
|----------|--------|
| CRITICAL | Block audit approval |
| HIGH | Require explicit acknowledgment |
| MEDIUM | Note for future attention |
| LOW | Log only |

```typescript
function determineAuditStatus(findings: Finding[]): AuditStatus {
  const hasCritical = findings.some(f => f.severity === 'CRITICAL');
  const hasHigh = findings.some(f => f.severity === 'HIGH');

  if (hasCritical) {
    return {
      status: 'BLOCKED',
      message: 'CRITICAL findings must be addressed',
      requiresAction: true
    };
  }

  if (hasHigh) {
    return {
      status: 'REQUIRES_ACKNOWLEDGMENT',
      message: 'HIGH findings require explicit acknowledgment',
      requiresAction: true
    };
  }

  return {
    status: 'PASSED',
    message: 'No blocking findings',
    requiresAction: false
  };
}
```

## Override Protocol

If critical finding must be bypassed (emergency, known issue):

### Step 1: Require Confirmation

```
CRITICAL finding cannot be auto-bypassed.

Finding: Transaction amount from indexed data (VaultWithdraw.tsx:45)

This is a $100k bug pattern. Override requires:
1. Explicit reason
2. Logged to audit report
3. TODO comment added to code

Reason for override: [user input]

Confirm override? [y/n]
```

### Step 2: Log Override

```markdown
## Overrides

| File | Finding | Reason | Reviewer |
|------|---------|--------|----------|
| VaultWithdraw.tsx:45 | Data source | Legacy integration, tracked in #123 | @reviewer |
```

### Step 3: Add TODO

```tsx
// TODO(rigor-override): Data source should be on-chain
// Override reason: Legacy integration, tracked in #123
// Override date: 2026-01-26
mutate({ amount: envioData.shares })
```

## Integration with Audit Sprint

The hook inserts its report into the audit:

```markdown
## Sprint Audit: Sprint-1

### Security Review
[Standard security content...]

### Rigor Validation (Rune)
[Hook output inserted here]

### Final Status
- Security: ✓ Approved
- Rigor: ✗ BLOCKED (1 CRITICAL)
- Overall: Cannot approve until CRITICAL resolved
```

## Skip Conditions

Don't run Rigor checks on:

1. Test files (`*.test.tsx`, `*.spec.tsx`)
2. Mock files (`__mocks__/*`)
3. Story files (`*.stories.tsx`)
4. Type definition files (`*.d.ts`)

```typescript
function shouldCheck(filePath: string): boolean {
  const skipPatterns = [
    /\.test\./,
    /\.spec\./,
    /\.stories\./,
    /\.d\.ts$/,
    /__mocks__/,
    /__tests__/
  ];

  return !skipPatterns.some(p => p.test(filePath));
}
```
