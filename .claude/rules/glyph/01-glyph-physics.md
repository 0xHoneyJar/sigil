# Glyph: Physics Table

Effect determines physics. What the code DOES determines timing, sync, and confirmation.

## The Table

| Effect | Sync | Timing | Confirmation |
|--------|------|--------|--------------|
| Financial | Pessimistic | 800ms | Required |
| Destructive | Pessimistic | 600ms | Required |
| Soft Delete | Optimistic | 200ms | Toast + Undo |
| Standard | Optimistic | 200ms | None |
| Navigation | Immediate | 150ms | None |
| Local State | Immediate | 100ms | None |

## Sync Strategies

**Pessimistic** — Server confirms before UI updates.
- Use when: Operations cannot be undone or involve value transfer
- User sees: Pending state → Success/Failure
- Never show optimistic updates for money

**Optimistic** — UI updates immediately, rolls back on failure.
- Use when: Operations are reversible and low-stakes
- User sees: Instant change, occasional rollback
- Requires: `onMutate` for update, `onError` for rollback

**Immediate** — No server round-trip.
- Use when: Pure client state (theme, toggles, preferences)
- User sees: Instant response, no loading state

## Why These Timings

**800ms for financial**: Minimum time for users to read amount, mentally commit, feel weight of irreversible decision.

**200ms for standard**: Perceived as "instant" while allowing visual feedback. Faster than 100ms = users miss confirmation. Slower than 300ms = feels laggy.

**100ms for local**: No network latency to hide. Users expect immediate response.

## Animation Mapping

| Effect | Easing | Spring |
|--------|--------|--------|
| Financial | ease-out | stiffness: 200, damping: 30 |
| Destructive | ease-out | stiffness: 200, damping: 30 |
| Standard | spring | stiffness: 500, damping: 30 |
| Local | spring | stiffness: 700, damping: 35 |
