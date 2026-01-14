# Sigil: Effect Detection

Detect effect from keywords, types, and context. Types override keywords when present.

<detection_priority>
## Detection Priority

1. **Types** — If props contain `Currency`, `Money`, `Balance`, `Wei`, `Token`, `BigInt` → Always Financial
2. **Keywords** — Match against effect keyword lists below
3. **Context** — Phrases like "with undo", "for wallet" modify the detected effect
</detection_priority>

<financial_detection>
## Financial Mutation

**Keywords**: claim, deposit, withdraw, transfer, swap, send, pay, purchase, mint, burn, stake, unstake

**Type Override**: Any prop with `Currency`, `Money`, `Balance`, `Wei`, `Token`, `BigInt` → Financial regardless of keyword

**Context Signals**: wallet, DeFi, checkout, payment, funds

<example>
<input>/craft "claim button"</input>
<detection>Effect: Financial — keyword "claim"</detection>
<physics>Pessimistic, 800ms, confirmation required</physics>
</example>

<example>
<input>/craft "update balance" with prop `amount: Currency`</input>
<detection>Effect: Financial — type override "Currency"</detection>
<physics>Pessimistic, 800ms, confirmation required</physics>
<note>Even though "update" is normally Standard, the Currency type overrides.</note>
</example>
</financial_detection>

<destructive_detection>
## Destructive Mutation

**Keywords**: delete, remove, destroy, revoke, terminate, close, end

**Context Signals**: permanent, account termination, no undo, irreversible

<example>
<input>/craft "delete account button"</input>
<detection>Effect: Destructive — keyword "delete" + context "account"</detection>
<physics>Pessimistic, 600ms, confirmation required</physics>
</example>
</destructive_detection>

<soft_delete_detection>
## Soft Delete

**Keywords**: archive, hide, trash, soft-delete, dismiss

**Context Signals**: "with undo", reversible, recycle bin

<example>
<input>/craft "delete with undo"</input>
<detection>Effect: Soft Delete — context "with undo" overrides destructive</detection>
<physics>Optimistic, 200ms, toast with undo action</physics>
</example>

<example>
<input>/craft "archive message"</input>
<detection>Effect: Soft Delete — keyword "archive"</detection>
<physics>Optimistic, 200ms, toast with undo</physics>
</example>
</soft_delete_detection>

<standard_detection>
## Standard Mutation

**Keywords**: save, update, edit, create, add, like, follow, bookmark, subscribe, comment

**Context Signals**: CRUD operations, social interactions, preferences

<example>
<input>/craft "like button"</input>
<detection>Effect: Standard — keyword "like"</detection>
<physics>Optimistic, 200ms, no confirmation</physics>
</example>
</standard_detection>

<local_detection>
## Local State

**Keywords**: toggle, switch, expand, collapse, select, focus, show, hide

**Context Signals**: client-only, no server, UI state, theme

<example>
<input>/craft "dark mode toggle"</input>
<detection>Effect: Local State — keyword "toggle" + context "theme"</detection>
<physics>Immediate, 100ms, no confirmation</physics>
</example>
</local_detection>

<ambiguity_resolution>
## Resolving Ambiguity

When effect is unclear, ask yourself:

| Question | If Yes | If No |
|----------|--------|-------|
| Can it be undone? | Optimistic | Pessimistic |
| Does it involve money/tokens? | Always Financial | Check other signals |
| Does it hit a server? | Optimistic or Pessimistic | Immediate |
| Is there an undo button/toast? | Soft Delete | Hard Destructive |

If still ambiguous after this analysis, ask the user:
```
Could not confidently detect effect. Help me understand:
• What happens when this is clicked?
• Does it call a server?
• Can it be undone?
• Does it involve money/tokens?
```
</ambiguity_resolution>
