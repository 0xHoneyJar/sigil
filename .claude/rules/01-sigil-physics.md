# Sigil: Behavioral Physics

Behavioral physics determine how interactions respond — sync strategy, timing, and confirmation patterns.

<physics_table>
## The Physics Table

| Effect | Sync | Timing | Confirmation | Why |
|--------|------|--------|--------------|-----|
| Financial | Pessimistic | 800ms | Required | Money can't roll back. Users need time to verify. |
| Destructive | Pessimistic | 600ms | Required | Permanent actions need deliberation. |
| Soft Delete | Optimistic | 200ms | Toast + Undo | Undo exists, so we can be fast. |
| Standard | Optimistic | 200ms | None | Low stakes = snappy feedback. |
| Navigation | Immediate | 150ms | None | URL changes feel instant. |
| Query | Optimistic | 150ms | None | Data retrieval, no state change. |
| Local State | Immediate | 100ms | None | No server = instant expected. |
| High-freq | Immediate | 0ms | None | Animation becomes friction. |
</physics_table>

<sync_strategies>
## Sync Strategies

**Pessimistic** — Server confirms before UI updates.
Use when: Operations cannot be undone or involve value transfer.
User sees: Pending state → Success/Failure.
Never: Show optimistic updates for money.

**Optimistic** — UI updates immediately, rolls back on failure.
Use when: Operations are reversible and low-stakes.
User sees: Instant change, occasional rollback on error.
Requires: `onMutate` for optimistic update, `onError` for rollback.

**Immediate** — No server round-trip.
Use when: Pure client state (theme, UI toggles, local preferences).
User sees: Instant response, no loading state.
</sync_strategies>

<timing_rationale>
## Why These Timings

**800ms for financial**: This isn't arbitrary — it's the minimum time for users to:
1. Read and verify the amount
2. Mentally commit to the action
3. Feel the weight of an irreversible decision

Faster timing creates anxiety. Slower feels sluggish. 800ms is the sweet spot.

**200ms for standard**: Research shows 200ms is perceived as "instant" while still allowing for visual feedback. Faster than 100ms and users miss the confirmation. Slower than 300ms feels laggy.

**100ms for local**: Local state has no network latency to hide. Users expect immediate response. Any delay feels broken.

**0ms for high-frequency**: When something is used 50+ times per day, animation becomes friction. The best animation is no animation.
</timing_rationale>

<automatic_inference>
## Automatic Inference

Infer these from effect type without asking:

- **Sync strategy** → From physics table
- **Timing** → From physics table
- **Confirmation** → From physics table
- **Animation library** → Discover from package.json
- **Data fetching** → Discover from package.json (tanstack-query, swr, fetch)

Frequency is inferred from component type:
- Command palette, keyboard nav → High-freq → 0ms
- Dropdowns, tooltips → Medium → 150-200ms
- Modals, confirmations → Low → 200-300ms
- Onboarding, celebrations → Rare → 300-500ms
</automatic_inference>
