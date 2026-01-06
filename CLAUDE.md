# Sigil v2.0: Reality Engine

> "Truth is Core. Experience is Lens. Layouts ARE Zones."

You are operating within **Sigil v2.0**, a design physics framework that separates Truth (Core physics) from Experience (Lens rendering). The key architectural insight: **Layouts ARE Zones**.

---

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

### Layer Responsibilities

| Layer | Emits | Consumes | Examples |
|-------|-------|----------|----------|
| **Core** | State streams | Mutations | `useCriticalAction`, `useLocalCache` |
| **Layout** | Zone context | State streams | `CriticalZone`, `MachineryLayout`, `GlassLayout` |
| **Lens** | UI components | State + Zone context | `DefaultLens`, `StrictLens`, `A11yLens` |

---

## Core Philosophy

<sigil_philosophy>
**Truth vs Experience**

- **Truth (Core):** Physics engines that emit state streams. The server-tick authority, the optimistic rollback, the proprioception — this is Truth.
- **Experience (Lens):** How that state is rendered. The 44px button, the WCAG AAA contrast, the animations — this is Experience.

Same Truth, different Experience. A payment state can be rendered by StrictLens (48px, no animations) or DefaultLens (44px, tap scale) — the physics don't change, only how they're shown.

**Layouts ARE Zones**

In v2.0, zones are declared by Layout primitives, not file paths:

```tsx
// This IS a critical zone — by structure, not config
<CriticalZone financial>
  {/* Server-tick authority enforced */}
  {/* StrictLens forced for critical buttons */}
</CriticalZone>
```

**Lens Enforcement**

- `CriticalZone` with `financial={true}` → Forces `StrictLens` for critical buttons
- `MachineryLayout` → Respects user lens preference
- `GlassLayout` → Respects user lens preference
- Default (no layout) → Uses `DefaultLens`

**Recipes Are Still Valid**

v1.2.5 recipes still work. They're just wrapped by layouts now:

```tsx
// v1.2.5 way (still works)
<SigilZone material="decisive">
  <DecisiveButton />
</SigilZone>

// v2.0 way (recommended)
<CriticalZone financial>
  <Lens.CriticalButton state={payment.state} onAction={commit} />
</CriticalZone>
```
</sigil_philosophy>

---

## Quick Start

<sigil_quickstart>
### Payment Form (Critical Zone)

```tsx
import { useCriticalAction, CriticalZone, useLens } from 'sigil-mark';

function PaymentForm({ amount }: { amount: number }) {
  const payment = useCriticalAction({
    mutation: () => api.pay(amount),
    timeAuthority: 'server-tick',
  });

  const Lens = useLens(); // Auto-selects StrictLens in CriticalZone

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
          labels={{
            confirming: 'Confirm Payment',
            pending: 'Processing...',
            confirmed: 'Paid!',
            failed: 'Failed - Retry',
          }}
        >
          Pay ${amount}
        </Lens.CriticalButton>
      </CriticalZone.Actions>
    </CriticalZone>
  );
}
```

### Admin List (Machinery Layout)

```tsx
import { MachineryLayout, useLens } from 'sigil-mark';

function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  const Lens = useLens();

  return (
    <MachineryLayout
      stateKey="invoices"
      onAction={(id) => navigate(`/invoices/${id}`)}
      onDelete={(id) => deleteInvoice(id)}
    >
      <MachineryLayout.Search placeholder="Search invoices..." />
      <MachineryLayout.List>
        {invoices.map((invoice) => (
          <Lens.MachineryItem key={invoice.id} id={invoice.id}>
            {invoice.title}
          </Lens.MachineryItem>
        ))}
      </MachineryLayout.List>
      <MachineryLayout.Empty>No invoices found</MachineryLayout.Empty>
    </MachineryLayout>
  );
}
```

### Marketing Card (Glass Layout)

```tsx
import { GlassLayout, useLens } from 'sigil-mark';

function ProductCard({ product }: { product: Product }) {
  const Lens = useLens();

  return (
    <GlassLayout variant="card">
      <GlassLayout.Image src={product.image} alt={product.name} />
      <GlassLayout.Content>
        <GlassLayout.Title>{product.name}</GlassLayout.Title>
        <GlassLayout.Description>{product.description}</GlassLayout.Description>
      </GlassLayout.Content>
      <GlassLayout.Actions>
        <Lens.GlassButton variant="primary">
          Add to Cart
        </Lens.GlassButton>
      </GlassLayout.Actions>
    </GlassLayout>
  );
}
```
</sigil_quickstart>

---

## Core Layer

<sigil_core>
### useCriticalAction

The main physics hook. Emits a state stream with time authority.

```tsx
const action = useCriticalAction({
  mutation: () => api.doThing(),
  timeAuthority: 'server-tick' | 'optimistic' | 'hybrid',
  onSuccess: (data) => {},
  onError: (error) => {},
  proprioception: { /* optional prediction config */ },
});

// State stream
action.state.status    // 'idle' | 'confirming' | 'pending' | 'confirmed' | 'failed'
action.state.progress  // 0-100 for hybrid
action.state.error     // Error | null

// Actions
action.confirm()       // Enter confirming state
action.commit()        // Execute mutation
action.cancel()        // Cancel (if confirming)
action.reset()         // Reset to idle
```

### Time Authorities

| Authority | Behavior | Use Case |
|-----------|----------|----------|
| `server-tick` | Wait for server confirmation | Payments, destructive actions |
| `optimistic` | Instant update, silent rollback on error | Admin tools, lists |
| `hybrid` | Instant + sync indicator, visible rollback | Real-time collaboration |

### Proprioception

Self-prediction for responsive UIs:

```tsx
const movement = useCriticalAction({
  mutation: () => api.moveItem(position),
  timeAuthority: 'hybrid',
  proprioception: {
    maxDrift: 200,      // Max ms to predict ahead
    decayRate: 0.9,     // Confidence decay per frame
    position: {
      render: 'ghost',  // Show predicted position as ghost
      reconcile: 'lerp' // Smooth correction on server response
    }
  }
});
```
</sigil_core>

---

## Layout Layer

<sigil_layouts>
### CriticalZone

For high-stakes actions (payments, destructive operations).

```tsx
<CriticalZone financial={true}>
  {/* Zone context: { type: 'critical', financial: true, timeAuthority: 'server-tick' } */}
  {/* useLens() returns StrictLens for critical buttons */}
</CriticalZone>
```

**Props:**
- `financial` (boolean, default: true) — Forces StrictLens when true
- `maxActions` (number, default: 3) — Warns if exceeded

**Subcomponents:**
- `CriticalZone.Content` — Main content area
- `CriticalZone.Actions` — Button area (32px gap, auto-sorts critical buttons last)

### MachineryLayout

For keyboard-driven admin interfaces.

```tsx
<MachineryLayout
  stateKey="items"
  onAction={(id) => {}}
  onDelete={(id) => {}}
>
  {/* Zone context: { type: 'admin', timeAuthority: 'optimistic' } */}
</MachineryLayout>
```

**Keyboard shortcuts:**
- Arrow keys, j/k: Navigate
- Enter/Space: Activate
- Delete/Backspace: Delete
- Escape: Deselect
- Home/End: Jump to first/last

**Subcomponents:**
- `MachineryLayout.List` — Container for items
- `MachineryLayout.Item` — Single item
- `MachineryLayout.Search` — Filter input
- `MachineryLayout.Empty` — Empty state

### GlassLayout

For hover-driven marketing/showcase interfaces.

```tsx
<GlassLayout variant="card" | "hero" | "feature">
  {/* Zone context: { type: 'marketing', timeAuthority: 'optimistic' } */}
</GlassLayout>
```

**Hover physics:**
- Scale: 1.02
- TranslateY: -4px
- Shadow increase
- 200ms ease-out transition

**Subcomponents:**
- `GlassLayout.Image` — Image slot
- `GlassLayout.Content` — Body container
- `GlassLayout.Title` — Title text
- `GlassLayout.Description` — Description text
- `GlassLayout.Actions` — Button area
</sigil_layouts>

---

## Lens Layer

<sigil_lenses>
### useLens Hook

Returns the appropriate lens based on zone context and user preference.

```tsx
const Lens = useLens();

// In CriticalZone with financial=true → StrictLens (forced)
// In MachineryLayout → User preference or DefaultLens
// In GlassLayout → User preference or DefaultLens
// No layout → DefaultLens
```

### Built-in Lenses

| Lens | Touch Target | Contrast | Animations | Use Case |
|------|-------------|----------|------------|----------|
| `DefaultLens` | 44px | Standard | Yes | General UI |
| `StrictLens` | 48px | High | No | High-stakes actions |
| `A11yLens` | 56px | WCAG AAA | No | Accessibility mode |

### Lens Components

Each lens provides:
- `CriticalButton` — For critical actions (status-based)
- `GlassButton` — For marketing/showcase buttons
- `MachineryItem` — For list items

```tsx
// CriticalButton props
<Lens.CriticalButton
  state={action.state}
  onAction={() => action.commit()}
  labels={{ pending: 'Processing...' }}
  disabled={false}
/>

// GlassButton props
<Lens.GlassButton
  variant="primary" | "secondary" | "ghost"
  onClick={() => {}}
/>

// MachineryItem props
<Lens.MachineryItem
  id="item-1"
  active={false}
  onAction={() => {}}
  onDelete={() => {}}
/>
```

### LensProvider

For user preference management:

```tsx
<LensProvider initialLens={DefaultLens}>
  <App />
</LensProvider>

// In child component
const { lens, setLens } = useLensPreference();
<button onClick={() => setLens(A11yLens)}>Enable A11y Mode</button>
```
</sigil_lenses>

---

## Agent Protocol

<sigil_agent_protocol>
### When Generating UI Code

1. **Determine zone context:**
   - Is this inside a Layout? Read the zone context.
   - What time authority does this zone use?
   - What lens will be selected?

2. **Select appropriate pattern:**
   - Critical action? Use `useCriticalAction` + `CriticalZone`
   - Admin list? Use `MachineryLayout` with keyboard nav
   - Marketing? Use `GlassLayout` with hover physics

3. **Respect lens enforcement:**
   - In `CriticalZone` with `financial={true}`, critical buttons WILL use `StrictLens`
   - Don't fight this — it's intentional for trust

4. **Use state streams:**
   - Components receive `state` prop, not `isLoading`
   - State has `.status`, `.progress`, `.error`
   - Let the lens render the appropriate UI for each status

### When User Asks for Animation Changes

In v2.0, animations live in lenses, not physics:

```tsx
// DON'T do this (v1.x pattern)
<Button spring={{ stiffness: 300 }} />

// DO this (v2.0 pattern)
// 1. Animations are in lens
// 2. If user wants different animations, create a custom lens
// 3. Or use the appropriate built-in lens

// For no animations in critical zones:
<CriticalZone financial> {/* StrictLens has no animations */}

// For accessibility mode:
<LensProvider initialLens={A11yLens}>
```

### When User Asks for "Snappier" or "Heavier" Feel

1. Understand the context — what zone, what component?
2. If it's about TIME authority, adjust the core hook
3. If it's about VISUAL response, that's lens territory
4. If it's about STRUCTURAL physics, that's layout territory

```tsx
// Snappier time authority
useCriticalAction({ timeAuthority: 'optimistic' }) // Instant

// Heavier visual feel
// → User should use StrictLens or create custom lens

// Snappier structural physics (Glass)
// → GlassLayout hover physics are fixed; create custom layout for different feel
```
</sigil_agent_protocol>

---

## Migration from v1.2.5

<sigil_migration>
| v1.2.5 | v2.0 |
|--------|------|
| `<SigilZone material="decisive">` | `<CriticalZone financial>` |
| `<SigilZone material="machinery">` | `<MachineryLayout>` |
| `<SigilZone material="glass">` | `<GlassLayout>` |
| `useServerTick()` | `useCriticalAction({ timeAuthority: 'server-tick' })` |
| `useSigilPhysics()` | `useLens()` |
| `<Button spring={...}>` | `<Lens.CriticalButton state={...}>` |

### Deprecated APIs

These still work but will be removed in v3.0:

- `SigilZone` — Use layout primitives
- `useSigilPhysics` — Use `useLens()`
- `useServerAuthoritative` — Use `useCriticalAction`
- `withSigilPhysics` — Use `useLens()`
- File-path zone resolution — Zones are now structural (Layout-based)
</sigil_migration>

---

## File Structure

<sigil_structure>
```
sigil-mark/
├── index.ts              # Main entry point
│
├── core/                 # Physics engines (Truth)
│   ├── useCriticalAction.ts
│   ├── useLocalCache.ts
│   ├── proprioception.ts
│   ├── types.ts
│   └── index.ts
│
├── layouts/              # Zones + Structural Physics
│   ├── context.ts
│   ├── CriticalZone.tsx
│   ├── MachineryLayout.tsx
│   ├── GlassLayout.tsx
│   └── index.ts
│
├── lenses/               # Interchangeable UIs (Experience)
│   ├── types.ts
│   ├── useLens.ts
│   ├── LensProvider.tsx
│   ├── default/
│   │   ├── CriticalButton.tsx
│   │   ├── GlassButton.tsx
│   │   ├── MachineryItem.tsx
│   │   └── index.tsx
│   ├── strict/
│   │   └── ...
│   ├── a11y/
│   │   └── ...
│   └── index.ts
│
├── recipes/              # v1.2.5 recipes (still valid)
│   ├── decisive/
│   ├── machinery/
│   └── glass/
│
└── __tests__/
```
</sigil_structure>

---

## Coexistence with Loa

Sigil and Loa can coexist. They have separate:
- State zones (sigil-mark/ vs loa-grimoire/)
- Config files (.sigilrc.yaml vs .loa.config.yaml)
- Skills (design-focused vs workflow-focused)

No automatic cross-loading — developer decides when to reference design context.
