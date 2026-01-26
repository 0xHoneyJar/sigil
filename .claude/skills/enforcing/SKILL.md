---
name: enforcing
description: Validate data correctness in web3 components
user-invocable: true
disable-model-invocation: true
allowed-tools:
  - Read
  - Glob
---

# Enforcing

The Rigor construct: data correctness validation for web3 components.

## Usage

```
/rigor file.tsx          # Validate specific file
/rigor                   # Validate current context
```

## Philosophy

**Correctness over feel.** A beautiful button that sends the wrong amount is worse than an ugly one that's accurate.

**On-chain over indexed.** When money is involved, trust the blockchain, not the indexer.

## What Rigor Checks

### 1. BigInt Safety

JavaScript BigInt has a critical footgun: `0n` is falsy.

```javascript
if (0n) console.log('true')   // Never prints!
```

**Safe Pattern**:
```tsx
if (amount != null && amount > 0n) { ... }
```

**Anti-Pattern**:
```tsx
if (shares) { ... }  // BROKEN: 0n is valid but falsy
```

### 2. Data Sources

| Use Case | Source | Why |
|----------|--------|-----|
| Display (read-only) | Indexed | Faster UX |
| Transaction amounts | On-chain | Must be accurate |
| Button enabled state | On-chain | Prevents failed tx |

**Safe Pattern**:
```tsx
const { data: txShares } = useReadContract({...})  // On-chain
const canWithdraw = (txShares ?? 0n) > 0n
```

**Anti-Pattern**:
```tsx
const canWithdraw = envioData?.hasBalance  // Stale!
```

### 3. Receipt Guards

Prevent re-execution when receipt updates trigger effects.

**Safe Pattern**:
```tsx
const lastHashRef = useRef<string>()

useEffect(() => {
  if (!receipt) return
  if (receipt.transactionHash === lastHashRef.current) return
  lastHashRef.current = receipt.transactionHash
  onReceipt(receipt)
}, [receipt, onReceipt])
```

**Anti-Pattern**:
```tsx
useEffect(() => {
  if (receipt) handleSuccess(receipt)  // May trigger multiple times
}, [receipt])
```

### 4. Stale Closures

useEffect callbacks capture state at creation time.

**Safe Pattern**:
```tsx
const amountRef = useRef(currentAmount)
amountRef.current = currentAmount

useEffect(() => {
  if (receipt) processReceipt(amountRef.current)
}, [receipt])
```

## Report Format

```markdown
## Rigor Validation

### VaultWithdraw.tsx

CRITICAL: Transaction amount from indexed data (line 45)
  → Amount should come from useReadContract, not useEnvioQuery
  → Fix: Replace `envioData.shares` with on-chain read

HIGH: BigInt falsy check (line 67)
  → `if (shares)` fails when shares === 0n
  → Fix: `if (shares != null && shares > 0n)`

### Summary
- 1 file checked
- 2 findings (1 CRITICAL, 1 HIGH)
```

## Severity Levels

| Severity | Example | Action |
|----------|---------|--------|
| CRITICAL | Transaction from indexed data | Block |
| HIGH | BigInt falsy check | Require fix |
| MEDIUM | Stale closure risk | Warn |
| LOW | Missing type annotation | Note |

## Rules Loaded

- `.claude/constructs/packs/rune/rules/rigor/*.md`
- `.claude/rules/rigor/*.md` (local overrides)
