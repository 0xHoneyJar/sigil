# Sigil v2.0

**Reality Engine — Design physics for products**

Sigil is not a design system. It's a physics engine that separates Truth (Core) from Experience (Lens).

## Philosophy

> "Physics must be structural (DOM), not theoretical (AST). Multiple realities (Lenses) on a single truth (Physics)."

## Key Concepts

### 1. Core Layer (Physics)

Physics engines that emit state streams:

```tsx
const payment = useCriticalAction({
  mutation: () => api.pay(amount),
  timeAuthority: 'server-tick',
});
```

### 2. Layout Primitives

Structural physics enforced by DOM, not lint rules:

```tsx
<CriticalZone>
  <CriticalZone.Content>...</CriticalZone.Content>
  <CriticalZone.Actions>
    {/* 32px gap is CSS, not a lint rule */}
    <Glass.Button>Cancel</Glass.Button>
    <Critical.Button>Confirm</Critical.Button>
  </CriticalZone.Actions>
</CriticalZone>
```

### 3. Lenses

Interchangeable UIs on the same physics:

```tsx
const Lens = useLens({ type: 'critical', financial: true });
// Returns StrictLens in critical zones, regardless of user preference

<Lens.CriticalButton state={payment.state} onAction={payment.commit}>
  Pay ${amount}
</Lens.CriticalButton>
```

### 4. Temporal Governor

Who owns the clock:

| Authority | Update | Reconciliation | Use Case |
|-----------|--------|----------------|----------|
| `optimistic` | Instant | Silent rollback | Linear |
| `server-tick` | Wait | N/A | Banking |
| `hybrid` | Instant + indicator | Visible | Figma |

### 5. Proprioception

Self predictions (legal lies) vs World truth (server-only):

```tsx
proprioception: {
  self: {
    rotation: { instant: true },     // Face target NOW
    animation: { optimistic: true }, // Start walking NOW
    position: { render: 'ghost' },   // Show predicted position
  },
  world: {
    balance: 'server-only',          // Money waits for server
  },
}
```

## Installation

```bash
npm install sigil
```

## Usage with Claude Code

Copy `CLAUDE.md` to your project root. Claude will use Sigil's physics when building UI.

## Architecture

See `docs/ARCHITECTURE.md` for the complete evolution through 10 rounds of Staff Engineer review.

## License

MIT
