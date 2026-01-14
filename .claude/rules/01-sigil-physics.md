# Sigil: Design Physics

> Every UI decision traces to physics. Physics trace to effect. Effect is what the code DOES.

## The Physics Table

| Effect | Sync | Timing | Confirmation | Animation |
|--------|------|--------|--------------|-----------|
| **Financial** | Pessimistic | 800ms | Required | Deliberate ease-out |
| **Destructive** | Pessimistic | 600ms | Required | Deliberate ease-out |
| **Soft Delete** | Optimistic | 200ms | Toast + Undo | Snappy spring |
| **Standard** | Optimistic | 200ms | None | Snappy spring |
| **Navigation** | Immediate | 150ms | None | Crisp ease |
| **Query** | Optimistic | 150ms | None | Fade in |
| **Local State** | Immediate | 100ms | None | Instant spring |

## Sync Strategies

**Pessimistic**: Server confirms before UI updates. User sees pending → success/failure. For irreversible or high-stakes operations.

**Optimistic**: UI updates immediately, rolls back on failure. For reversible, low-stakes operations.

**Immediate**: No server round-trip. Pure client state.

## Why This Matters

- A "claim" button at 150ms feels **reckless** (financial should be 800ms)
- A "like" button at 800ms feels **laggy** (social should be 200ms)
- A "delete" with no confirmation feels **dangerous**
- A "theme toggle" with a loading spinner feels **broken**

Physics communicate meaning. Wrong physics = wrong feel.
