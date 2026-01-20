# Sigil: Data Physics

Data sources should be intentional, not fallback chains.

<data_physics_table>
## The Data Physics Table

| Use Case | Source | Rationale |
|----------|--------|-----------|
| Display (read-only) | Envio/Indexer | Faster UX, acceptable staleness |
| Transaction amounts | On-chain | Must be accurate for tx |
| Button visibility | On-chain | Prevents failed tx |
| Historical queries | Envio/Indexer | Optimized for aggregation |
| Real-time updates | On-chain + poll | Accuracy over speed |
| Balance display | On-chain | Users verify before tx |

**Default rule**: When in doubt, use on-chain. Envio is optimization, not truth.
</data_physics_table>

<anti_patterns>
## Anti-Patterns

### Fallback Chains

❌ BAD: `vaultShares={envio ?? onChain ?? 0n}`

Why: Hides which source is used. Debugging nightmare when envio is stale.

✅ GOOD: Explicit per use case
```typescript
// Display: Envio OK (acceptable staleness)
const displayShares = envioData?.vaultShares ?? '—'

// Transaction: On-chain required (must be accurate)
const txShares = useReadContract({
  address: VAULT,
  abi: vaultAbi,
  functionName: 'balanceOf',
  args: [userAddress]
})

// Button state: On-chain required (prevent failed tx)
const canWithdraw = (txShares.data ?? 0n) > 0n
```

### BigInt Falsy Check

❌ BAD: `if (amount)` — 0n is falsy!

✅ GOOD: `if (amount != null && amount > 0n)`

### Missing Receipt Guard

❌ BAD: No check if tx already processed

✅ GOOD:
```typescript
const [lastTxHash, setLastTxHash] = useState<string>()

useEffect(() => {
  if (receipt?.transactionHash === lastTxHash) return
  setLastTxHash(receipt?.transactionHash)
  // Process receipt...
}, [receipt])
```
</anti_patterns>

<detection>
## When to Apply

Load this rule when detecting:
- Keywords: envio, indexed, on-chain, web3, `??` fallback
- Hooks: useReadContract, useWriteContract, useQuery (with blockchain endpoints)
- Patterns: `data ?? fallback`, `envio.`, `.balanceOf`

## Guidance Display

When web3 data flow detected, show in physics analysis:

```
┌─ Data Physics ─────────────────────────────────────────┐
│                                                        │
│  This involves transaction amounts.                    │
│                                                        │
│  Using ON-CHAIN for:                                   │
│  • Transaction values (accuracy required)              │
│  • Button states (prevent failed tx)                   │
│                                                        │
│  Using ENVIO for:                                      │
│  • Display values (acceptable staleness)               │
│  • Historical queries                                  │
│                                                        │
└────────────────────────────────────────────────────────┘
```
</detection>

<simplest_fix>
## When Debugging Data Issues

The simplest fix: **use on-chain for everything**.

```typescript
// Instead of mixing sources:
const { data } = useReadContract({
  address: VAULT,
  abi: vaultAbi,
  functionName: 'balanceOf',
  args: [userAddress],
  query: {
    refetchInterval: 5000, // Poll every 5s
  }
})

// Use for display, tx, and button state
const shares = data ?? 0n
const canAct = shares > 0n
```

Envio is an optimization. Don't optimize until the basic flow works.
</simplest_fix>

<verification_checklist>
## Before Generating Web3 Components

- [ ] Transaction amounts come from on-chain, not indexer
- [ ] Button enabled states use on-chain data
- [ ] BigInt checks use `!= null && > 0n`, not truthy check
- [ ] Receipt processing has hash guard to prevent re-execution
- [ ] Stale closure risk addressed in useEffect callbacks
- [ ] Data source is explicit, not hidden behind `??` chains
</verification_checklist>
