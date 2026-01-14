# Sigil: Effect Detection

Detect effect from **keywords**, **types**, and **context**. Types override keywords when present.

## Financial Mutation

**Keywords:** claim, deposit, withdraw, transfer, swap, send, pay, purchase, mint, burn, stake, unstake

**Types:** Currency, Money, Balance, Amount, Wei, Token, BigInt

**Context:** Wallet operations, DeFi protocols, payments, checkout

**Examples:**
```
/craft "claim button"
→ Effect: Financial (keyword: "claim")
→ Physics: Pessimistic, 800ms, confirmation required

/craft "stake rewards button"
→ Effect: Financial (keyword: "stake")
→ Physics: Pessimistic, 800ms, confirmation required

// Type detection overrides ambiguous keywords
function TransferButton({ amount }: { amount: Currency })
→ Effect: Financial (type: Currency in props)
```

## Destructive Mutation

**Keywords:** delete, remove, destroy, revoke, terminate, close, end, burn

**Context:** Permanent removal, no undo available, account termination

**Examples:**
```
/craft "delete account button"
→ Effect: Destructive (keyword: "delete", context: account)
→ Physics: Pessimistic, 600ms, confirmation required

/craft "revoke access"
→ Effect: Destructive (keyword: "revoke")
→ Physics: Pessimistic, 600ms, confirmation required
```

## Soft Delete (Destructive + Undo)

**Keywords:** archive, hide, trash, soft-delete, dismiss

**Context:** Reversible removal, undo available, recycle bin pattern

**Examples:**
```
/craft "delete with undo"
→ Effect: Soft Delete (context: "with undo")
→ Physics: Optimistic, 200ms, toast with undo action

/craft "archive message"
→ Effect: Soft Delete (keyword: "archive")
→ Physics: Optimistic, 200ms, toast with undo
```

## Standard Mutation

**Keywords:** save, update, edit, create, add, like, follow, bookmark, subscribe, comment

**Context:** CRUD operations, social interactions, preferences

**Examples:**
```
/craft "like button"
→ Effect: Standard (keyword: "like")
→ Physics: Optimistic, 200ms, no confirmation

/craft "save changes button"
→ Effect: Standard (keyword: "save")
→ Physics: Optimistic, 200ms, no confirmation
```

## Navigation

**Keywords:** navigate, route, link, go, back, forward, redirect, open

**Context:** URL changes, page transitions, routing

**Examples:**
```
/craft "back button"
→ Effect: Navigation (keyword: "back")
→ Physics: Immediate, 150ms, no confirmation
```

## Query/Fetch

**Keywords:** fetch, load, get, list, search, find, query, read, refresh

**Context:** Data retrieval, no state change, read-only operations

**Examples:**
```
/craft "search input"
→ Effect: Query (keyword: "search")
→ Physics: Optimistic, 150ms, skeleton/spinner loading state
```

## Local State

**Keywords:** toggle, switch, expand, collapse, select, focus, hover, show, hide

**Context:** Client-only state, no server call, UI state

**Examples:**
```
/craft "dark mode toggle"
→ Effect: Local State (keyword: "toggle", context: theme)
→ Physics: Immediate, 100ms, no confirmation

/craft "expand section"
→ Effect: Local State (keyword: "expand")
→ Physics: Immediate, 100ms, spring animation
```

## Type Override Rule

If you see these types in props or state, **always apply financial physics** regardless of keywords:
- `Currency`, `Money`, `Balance`, `Wei`, `Token`, `BigInt`, `Amount`

```typescript
// Even if the keyword is "update", the type overrides
function UpdateBalance({ newBalance }: { newBalance: Currency })
→ Effect: Financial (type override: Currency)
→ Physics: Pessimistic, 800ms, confirmation required
```

## Ambiguity Resolution

When effect is unclear, ask yourself: **"What happens if this operation fails?"**

| Question | Answer | Effect |
|----------|--------|--------|
| Can it be undone? | Yes → Optimistic | No → Pessimistic |
| Does it involve money/tokens? | Yes → Always Financial | - |
| Does it hit a server? | No → Immediate | Yes → Optimistic or Pessimistic |
| Is there an undo button/toast? | Yes → Soft Delete | No → Hard Destructive |

If still ambiguous after this analysis, ask the user:
```
Could not confidently detect effect. Help me understand:
• What happens when this is clicked?
• Does it call a server?
• Can it be undone?
• Does it involve money/tokens?
```
