# Sigil: Web3 Flow Patterns

Patterns learned from web3 debugging. Applied when /craft detects
transaction flows (stake, claim, bridge, swap, approve).

<risky_patterns>
## Risky Patterns

| Pattern | Risk | Fix |
|---------|------|-----|
| `if (amount)` with BigInt | 0n is falsy | `amount != null && amount > 0n` |
| Indexed data in tx | Stale amounts | Use on-chain reads |
| Missing receipt guard | Re-execution | Check hash changed |
| `??` fallback chains | Ambiguous source | Explicit per use case |
| Optimistic financial | Can't rollback | Pessimistic sync |
| useEffect on receipt | Stale closure | useCallback + deps |
</risky_patterns>

<flow_detection>
## Flow Detection

**Keywords**: stake, claim, withdraw, bridge, swap, approve, mint, burn, deposit, redeem

**Hooks**:
- `useWriteContract` / `useContractWrite`
- `usePrepareContractWrite`
- `useWaitForTransaction` / `useWaitForTransactionReceipt`
- `useSendTransaction`

**When detected**: Load this rule + 19-sigil-data-physics.md
</flow_detection>

<multi_step_flows>
## Multi-Step Flows

When detecting approve→execute patterns:

```
┌─ Multi-Step Transaction ───────────────────────────────┐
│                                                        │
│  State Machine:                                        │
│  idle → approve_pending → approve_success →            │
│  execute_pending → success                             │
│                                                        │
│  Each step needs:                                      │
│  1. Receipt guard (don't re-trigger)                   │
│  2. Error handling (rollback to previous state)        │
│  3. Amount from on-chain at execution time             │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Pattern**:
```typescript
type TxState = 'idle' | 'approve_pending' | 'approve_success' |
               'execute_pending' | 'success' | 'error'

const [txState, setTxState] = useState<TxState>('idle')
const [lastApproveHash, setLastApproveHash] = useState<string>()
const [lastExecuteHash, setLastExecuteHash] = useState<string>()

// Approve step
const { writeContract: approve } = useWriteContract()
const { data: approveReceipt } = useWaitForTransactionReceipt({
  hash: approveTxHash,
})

// Guard: only process once
useEffect(() => {
  if (!approveReceipt) return
  if (approveReceipt.transactionHash === lastApproveHash) return
  setLastApproveHash(approveReceipt.transactionHash)
  setTxState('approve_success')
}, [approveReceipt])

// Execute step - read amount on-chain at execution time
const { data: currentBalance } = useReadContract({
  // ... get fresh balance
  query: { enabled: txState === 'approve_success' }
})
```
</multi_step_flows>

<bigint_safety>
## BigInt Safety

JavaScript BigInt has a critical footgun: `0n` is falsy.

```javascript
if (0n) console.log('true')   // Never prints!
if (0n == false) // true - loose equality
if (0n === false) // false - strict equality
```

**Safe patterns**:
```typescript
// Check for existence AND positive
if (amount != null && amount > 0n) { ... }

// Check for existence only
if (amount !== undefined && amount !== null) { ... }

// With default
const shares = data ?? 0n  // OK for display
const canAct = (data ?? 0n) > 0n  // OK for boolean
```

**Anti-pattern**:
```typescript
if (shares) { ... }  // BROKEN: 0n shares is valid but falsy
```
</bigint_safety>

<receipt_guard>
## Receipt Guard Pattern

Prevent re-execution when receipt updates:

```typescript
function useReceiptGuard<T>(
  receipt: T | undefined,
  hashFn: (r: T) => string,
  onReceipt: (r: T) => void
) {
  const lastHashRef = useRef<string>()

  useEffect(() => {
    if (!receipt) return
    const hash = hashFn(receipt)
    if (hash === lastHashRef.current) return
    lastHashRef.current = hash
    onReceipt(receipt)
  }, [receipt, hashFn, onReceipt])
}

// Usage
useReceiptGuard(
  txReceipt,
  r => r.transactionHash,
  r => handleSuccess(r)
)
```
</receipt_guard>

<stale_closure>
## Stale Closure Prevention

useEffect callbacks capture state at creation time. When processing receipts:

❌ BAD: Direct state reference
```typescript
useEffect(() => {
  if (receipt) {
    // `currentAmount` is stale!
    processReceipt(currentAmount)
  }
}, [receipt])
```

✅ GOOD: Use callback or ref
```typescript
const amountRef = useRef(currentAmount)
amountRef.current = currentAmount

useEffect(() => {
  if (receipt) {
    processReceipt(amountRef.current)
  }
}, [receipt])
```

Or use the callback form:
```typescript
const handleReceipt = useCallback((r: TransactionReceipt) => {
  // currentAmount is fresh here
  processReceipt(currentAmount)
}, [currentAmount])

useEffect(() => {
  if (receipt) handleReceipt(receipt)
}, [receipt, handleReceipt])
```
</stale_closure>

<flow_checklist>
## Web3 Flow Checklist

Before generating any transaction flow:

- [ ] **State machine** defined (idle → pending → success/error)
- [ ] **Receipt guards** in place for each transaction step
- [ ] **On-chain amounts** used for actual transaction (not indexed)
- [ ] **BigInt checks** use safe patterns (`!= null && > 0n`)
- [ ] **Pessimistic sync** for all state-changing operations
- [ ] **Error states** show recovery path (retry, go back)
- [ ] **Cancel button** always reachable (even during pending)

**Physics for web3 flows**:
- Sync: Pessimistic (always)
- Timing: 800ms (financial operations)
- Confirmation: Required (show amounts before signing)
</flow_checklist>

<common_bugs>
## Common Bugs by Symptom

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Button never enables | BigInt falsy check | Use `!= null && > 0n` |
| Same tx triggers twice | Missing receipt guard | Add hash comparison |
| Wrong amount in tx | Using indexed data | Switch to on-chain read |
| Success callback uses old data | Stale closure | Use ref or useCallback |
| Infinite useEffect loop | Object/array dependency | Extract primitives |
| Button disabled during valid state | Indexed data stale | On-chain for button states |
</common_bugs>
