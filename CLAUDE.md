# Rune

Design physics for AI-generated UI.

## Core Philosophy

**Effect is truth.** What the code does determines its physics.
**Physics over preferences.** "800ms pessimistic with confirmation" not "make it feel trustworthy."
**Correctness over feel.** A beautiful button that sends the wrong amount is worse than an ugly one that's accurate.

## Physics Table (Memorize)

| Effect | Sync | Timing | Confirmation |
|--------|------|--------|--------------|
| Financial | Pessimistic | 800ms | Required |
| Destructive | Pessimistic | 600ms | Required |
| Soft Delete | Optimistic | 200ms | Toast + Undo |
| Standard | Optimistic | 200ms | None |
| Navigation | Immediate | 150ms | None |
| Local State | Immediate | 100ms | None |

## Protected Capabilities (Non-Negotiable)

| Capability | Rule |
|------------|------|
| Withdraw | Always reachable (never hide behind loading) |
| Cancel | Always visible (every flow needs escape) |
| Balance | Always accurate (invalidate on mutation) |
| Touch target | ≥44px |
| Focus ring | Always visible |

## Web3 Safety (Rigor)

**BigInt falsy bug:** `0n` is falsy in JavaScript.
```tsx
// BAD: 0n shares fails this check
if (shares) { ... }

// GOOD: Explicit check
if (shares != null && shares > 0n) { ... }
```

**Data sources:** Transaction amounts MUST come from on-chain, not indexers.

**Receipt guard:** Check hash changed before processing to prevent duplicate execution.

## Four Constructs

| Construct | Command | Purpose |
|-----------|---------|---------|
| Sigil | `/sigil` | Taste capture (WHY) |
| Glyph | `/glyph` | UI generation (HOW) |
| Rigor | `/rigor` | Data correctness (WHAT) |
| Wyrd | `/wyrd` | Feedback learning |

Commands load detailed rules on-demand from `.claude/skills/`.

## Effect Detection

**Financial:** claim, deposit, withdraw, transfer, swap, stake, bridge, approve, mint, burn
**Destructive:** delete, remove, destroy, revoke, terminate, purge
**Soft Delete:** archive, hide, trash, dismiss (context: "with undo")
**Standard:** save, update, edit, create, like, follow, bookmark
**Local:** toggle, switch, expand, collapse, theme, sort, filter

**Type overrides:** `Currency`, `Wei`, `Token`, `BigInt` → Always Financial

## Action Default

**DO:** Write complete, working code. Match codebase conventions.
**DON'T:** Describe what you would build. Ask "would you like me to generate?"

## State Files

- `grimoires/sigil/taste.md` — User preferences (append-only)
- `grimoires/rune/wyrd.md` — Learning state, patterns

## Commit Conventions

```
feat(glyph): add new pattern for staking flows
fix(rigor): handle BigInt edge case
```

Include `Co-Authored-By: Claude <noreply@anthropic.com>` when Claude contributes.
