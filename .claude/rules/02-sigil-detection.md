# Sigil: Effect Detection

Detect effect from **keywords**, **types**, and **context**. Types override keywords.

## Detection Rules

### Financial Mutation
```
Keywords: claim, deposit, withdraw, transfer, swap, send, pay, purchase, mint, burn, stake
Types:    Currency, Money, Balance, Amount, Wei, Token, BigInt
Context:  Wallet operations, DeFi, payments, checkout
```
→ Pessimistic, 800ms, confirmation required

### Destructive Mutation
```
Keywords: delete, remove, destroy, revoke, terminate, close, end
Context:  Permanent removal, no undo available
```
→ Pessimistic, 600ms, confirmation required

### Soft Delete (Destructive + Undo)
```
Keywords: archive, hide, trash, soft-delete
Context:  Undo available, reversible
```
→ Optimistic, 200ms, toast with undo

### Standard Mutation
```
Keywords: save, update, edit, create, add, toggle, like, follow, bookmark
Context:  CRUD operations, preferences, content
```
→ Optimistic, 200ms, no confirmation

### Navigation
```
Keywords: navigate, route, link, go, back, forward
Context:  URL changes, page transitions
```
→ Immediate, 150ms

### Query
```
Keywords: fetch, load, get, list, search, find, query
Context:  Data retrieval, no state change
```
→ Optimistic, 150ms, skeleton/spinner

### Local State
```
Keywords: toggle, switch, expand, collapse, select, focus
Context:  Client-only, no server call
```
→ Immediate, 100ms

## Type Override Rule

If you see these types in props/state, **always** apply financial physics:
- `Currency`, `Money`, `Balance`, `Wei`, `Token`, `BigInt`, `Amount`

Even if the keyword suggests otherwise. Types are more reliable than keywords.

## Ambiguity Resolution

When effect is ambiguous, ask: **"What happens if this fails?"**

- Can be undone → Optimistic
- Cannot be undone → Pessimistic
- Involves money → Always pessimistic
- Pure client state → Immediate
