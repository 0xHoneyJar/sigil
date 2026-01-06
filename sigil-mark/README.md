# Sigil v2.0 — Reality Engine

> "Truth is Core. Experience is Lens. Layouts ARE Zones."

Design physics framework that separates Truth (Core physics) from Experience (Lens rendering).

## Quick Start

```bash
npm install sigil-mark
```

```tsx
import {
  useCriticalAction,
  CriticalZone,
  useLens,
} from 'sigil-mark';

function PaymentForm({ amount }) {
  // Core: Physics engine with time authority
  const payment = useCriticalAction({
    mutation: () => api.pay(amount),
    timeAuthority: 'server-tick',
  });

  // Lens: Auto-selects StrictLens in CriticalZone
  const Lens = useLens();

  return (
    <CriticalZone financial>
      <CriticalZone.Content>
        <h2>Confirm Payment</h2>
        <p>${amount}</p>
      </CriticalZone.Content>
      <CriticalZone.Actions>
        <Lens.CriticalButton
          state={payment.state}
          onAction={() => payment.commit()}
          labels={{ pending: 'Processing...' }}
        >
          Pay ${amount}
        </Lens.CriticalButton>
      </CriticalZone.Actions>
    </CriticalZone>
  );
}
```

## Architecture (3 Layers)

```
┌────────────────────────────────────────────────────────────┐
│  CORE LAYER — Physics engines (Truth)                     │
│  useCriticalAction → State Stream                         │
│  { status, timeAuthority, selfPrediction, worldTruth }    │
├────────────────────────────────────────────────────────────┤
│  LAYOUT LAYER — Zones + Structural Physics                │
│  CriticalZone, MachineryLayout, GlassLayout               │
│  Layouts ARE Zones. Physics is DOM, not lint.             │
├────────────────────────────────────────────────────────────┤
│  LENS LAYER — Interchangeable UIs (Experience)            │
│  useLens() → Lens components                              │
│  DefaultLens, StrictLens, A11yLens                        │
└────────────────────────────────────────────────────────────┘
```

## Core Layer

### useCriticalAction

Main physics hook with time authority.

```tsx
const action = useCriticalAction({
  mutation: () => api.doThing(),
  timeAuthority: 'server-tick' | 'optimistic' | 'hybrid',
  onSuccess: (data) => {},
  onError: (error) => {},
});

// State stream
action.state.status    // 'idle' | 'confirming' | 'pending' | 'confirmed' | 'failed'
action.state.progress  // 0-100 for hybrid

// Actions
action.commit()        // Execute mutation
action.cancel()        // Cancel
action.reset()         // Reset to idle
```

### Time Authorities

| Authority | Behavior | Use Case |
|-----------|----------|----------|
| `server-tick` | Wait for server confirmation | Payments, destructive actions |
| `optimistic` | Instant update, silent rollback | Admin tools, lists |
| `hybrid` | Instant + sync indicator | Real-time collaboration |

## Layout Layer

### CriticalZone

For high-stakes financial/destructive actions.

```tsx
<CriticalZone financial={true}>
  <CriticalZone.Content>...</CriticalZone.Content>
  <CriticalZone.Actions>...</CriticalZone.Actions>
</CriticalZone>
```

- Forces `server-tick` time authority
- Forces `StrictLens` when `financial={true}`
- 32px gap between actions
- Auto-sorts critical buttons last

### MachineryLayout

For keyboard-driven admin interfaces.

```tsx
<MachineryLayout stateKey="items" onAction={fn} onDelete={fn}>
  <MachineryLayout.Search />
  <MachineryLayout.List>
    <Lens.MachineryItem id="1">...</Lens.MachineryItem>
  </MachineryLayout.List>
  <MachineryLayout.Empty />
</MachineryLayout>
```

**Keyboard shortcuts:**
- Arrow keys, j/k: Navigate
- Enter/Space: Activate
- Delete: Delete
- Escape: Deselect

### GlassLayout

For hover-driven marketing interfaces.

```tsx
<GlassLayout variant="card">
  <GlassLayout.Image />
  <GlassLayout.Content>
    <GlassLayout.Title />
    <GlassLayout.Description />
  </GlassLayout.Content>
  <GlassLayout.Actions />
</GlassLayout>
```

**Hover physics:**
- Scale: 1.02
- TranslateY: -4px
- Shadow increase

## Lens Layer

### useLens

Returns appropriate lens based on zone context.

```tsx
const Lens = useLens();

// In CriticalZone with financial=true → StrictLens
// In MachineryLayout/GlassLayout → User preference
// No layout → DefaultLens
```

### Built-in Lenses

| Lens | Touch Target | Contrast | Animations |
|------|-------------|----------|------------|
| `DefaultLens` | 44px | Standard | Yes |
| `StrictLens` | 48px | High | No |
| `A11yLens` | 56px | WCAG AAA | No |

### Lens Components

Each lens provides:
- `CriticalButton` — Status-based button
- `GlassButton` — Marketing button (primary, secondary, ghost)
- `MachineryItem` — List item with delete

### LensProvider

```tsx
<LensProvider initialLens={A11yLens}>
  <App />
</LensProvider>
```

## Directory Structure

```
sigil-mark/
├── index.ts              # Main entry point
├── core/                 # Physics engines
│   ├── useCriticalAction.ts
│   ├── useLocalCache.ts
│   └── proprioception.ts
├── layouts/              # Zone primitives
│   ├── CriticalZone.tsx
│   ├── MachineryLayout.tsx
│   └── GlassLayout.tsx
├── lenses/               # UI renderers
│   ├── default/
│   ├── strict/
│   └── a11y/
├── recipes/              # v1.2.5 recipes (still valid)
└── __examples__/         # Usage examples
```

## Migration from v1.2.5

| v1.2.5 | v2.0 |
|--------|------|
| `<SigilZone material="decisive">` | `<CriticalZone financial>` |
| `useServerTick()` | `useCriticalAction({ timeAuthority: 'server-tick' })` |
| `useSigilPhysics()` | `useLens()` |
| `<Button spring={...}>` | `<Lens.CriticalButton state={...}>` |

See [MIGRATION.md](./MIGRATION.md) for detailed guide.

## API Reference

### Core Exports

```tsx
import {
  useCriticalAction,
  useLocalCache,
  createProprioception,
  type CriticalActionState,
} from 'sigil-mark';
```

### Layout Exports

```tsx
import {
  CriticalZone,
  MachineryLayout,
  GlassLayout,
  useZoneContext,
} from 'sigil-mark';
```

### Lens Exports

```tsx
import {
  useLens,
  LensProvider,
  DefaultLens,
  StrictLens,
  A11yLens,
} from 'sigil-mark';
```

## Version

```tsx
import { VERSION, CODENAME } from 'sigil-mark';
// VERSION: '2.0.0'
// CODENAME: 'Reality Engine'
```
