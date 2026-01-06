# Sigil

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> *"Truth is Core. Experience is Lens. Layouts ARE Zones."*

Design Physics Framework for AI-assisted development. Separates Truth (Core physics) from Experience (Lens rendering).

## Philosophy: Reality Engine

### The Insight

Traditional design systems conflate physics (what happens) with rendering (how it looks). Sigil v2.0 separates these:

1. **Core Layer (Truth)** — Physics engines that manage state and time
2. **Layout Layer (Zones)** — Structural containers that provide context
3. **Lens Layer (Experience)** — Interchangeable UI renderers

When you change a lens, the physics remain the same. When you move to a different zone, the appropriate lens is auto-selected.

### Architecture (3 Layers)

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

## Quick Start

### Install

```bash
npm install sigil-mark
```

### Basic Usage

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

## Core Layer

### useCriticalAction

Main physics hook with time authority:

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

Layouts ARE Zones. Wrap your content in a layout to provide zone context.

### CriticalZone

For high-stakes financial/destructive actions:

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

For keyboard-driven admin interfaces:

```tsx
<MachineryLayout stateKey="items" onAction={fn} onDelete={fn}>
  <MachineryLayout.Search />
  <MachineryLayout.List>
    <Lens.MachineryItem id="1">...</Lens.MachineryItem>
  </MachineryLayout.List>
  <MachineryLayout.Empty />
</MachineryLayout>
```

**Keyboard shortcuts:** Arrow keys, j/k, Enter/Space, Delete, Escape

### GlassLayout

For hover-driven marketing interfaces:

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

**Hover physics:** Scale 1.02, translateY -4px, shadow increase

## Lens Layer

### useLens

Returns appropriate lens based on zone context:

```tsx
const Lens = useLens();

// In CriticalZone with financial=true → StrictLens (forced)
// In MachineryLayout/GlassLayout → User preference
// No layout → DefaultLens
```

### Built-in Lenses

| Lens | Touch Target | Contrast | Animations |
|------|-------------|----------|------------|
| `DefaultLens` | 44px | Standard | Yes |
| `StrictLens` | 48px | High | No |
| `A11yLens` | 56px | WCAG AAA | No |

### LensProvider

Set user preference app-wide:

```tsx
import { LensProvider, A11yLens } from 'sigil-mark';

<LensProvider initialLens={A11yLens}>
  <App />
</LensProvider>
```

Note: CriticalZone with `financial={true}` still forces StrictLens.

## Commands

| Command | Purpose |
|---------|---------|
| `/craft` | Get design guidance with zone context |
| `/sandbox` | Experiment with physics (no constraints) |
| `/codify` | Define zone rules |
| `/inherit` | Bootstrap from existing codebase |
| `/validate` | Check physics compliance |
| `/garden` | Entropy detection and maintenance |

## State Zone: `sigil-mark/`

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
├── recipes/              # v1.2.5 recipes (deprecated)
└── __examples__/         # Usage examples
```

## Migration from v1.2.5

| v1.2.5 | v2.0 |
|--------|------|
| `<SigilZone material="decisive">` | `<CriticalZone financial>` |
| `useServerTick()` | `useCriticalAction({ timeAuthority: 'server-tick' })` |
| `useSigilPhysics()` | `useLens()` |
| `<DecisiveButton>` | `<Lens.CriticalButton state={...}>` |

See [sigil-mark/MIGRATION.md](sigil-mark/MIGRATION.md) for detailed guide.

## Version History

| Version | Codename | Description |
|---------|----------|-------------|
| v0.3.x | Constitutional Design Framework | Four pillars, strictness |
| v0.4.x | Soul Engine | npm package, hooks |
| v0.5.0 | Design Physics Engine | Simplified physics |
| v1.0.0 | Full Workbench | 4-panel tmux, materials |
| v1.2.5 | Zone Provider | Context-based physics |
| **v2.0.0** | **Reality Engine** | **Truth vs Experience, 3 layers** |

## Requirements

- Node.js 18+
- React 18+
- TypeScript 5+

## License

[MIT](LICENSE)

## Links

- [Claude Code](https://claude.ai/code)
- [Repository](https://github.com/0xHoneyJar/sigil)
- [Issues](https://github.com/0xHoneyJar/sigil/issues)
