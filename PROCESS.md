# Development Process

This document outlines the Sigil v2.0 workflow for building with the Reality Engine architecture.

> "Truth is Core. Experience is Lens. Layouts ARE Zones."

## Philosophy: Reality Engine

Sigil v2.0 separates **Truth** (what happens) from **Experience** (how it looks):

- **Core Layer** — Physics engines managing state and time authority
- **Layout Layer** — Structural containers that ARE zones (no file-path resolution)
- **Lens Layer** — Interchangeable UI renderers based on context

The key insight: **Layouts ARE Zones**. When you wrap content in `<CriticalZone>`, you've declared the zone. No config files needed.

---

## Overview

Sigil's workflow has two paths:

### New Project Path
```
/setup → /envision → /codify → (build) → /craft → /garden
```

### Existing Codebase Path
```
/setup → /inherit → /envision → /codify → (build) → /craft
```

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

---

## Commands (6 Total)

### `/craft` — Design Guidance

**Goal**: Get design guidance with zone and lens context

**Modes**:

1. **Zone Detection**: Which layout wraps this component?
   ```bash
   /craft src/features/checkout/PaymentForm.tsx
   ```

2. **Lens Suggestion**: Which lens is appropriate?
   ```bash
   /craft "button for checkout confirmation"
   ```

3. **Pattern Lookup**: Show me the v2.0 pattern
   ```bash
   /craft "useCriticalAction with server-tick"
   ```

**Output**: Conversational guidance with layout, lens, and time authority suggestions

---

### `/sandbox` — Raw Physics Experimentation

**Goal**: Experiment without layout/lens constraints

**When to Use**:
- Exploring new interaction patterns
- Testing physics before committing to a layout
- Prototyping without zone restrictions

**Command**:
```bash
/sandbox
/sandbox "optimistic list with rollback"
```

**What Happens**:
1. Creates file in `sigil-mark/sandbox/`
2. No layout enforcement
3. No lens auto-selection
4. ESLint warns after 7 days (stale sandbox)

---

### `/codify` — Define Zone Rules

**Goal**: Configure layout and lens preferences

**Process**:
1. **Layouts**: Define which layouts map to which paths (for agent guidance)
2. **Lenses**: Set default lens preferences
3. **Rejections**: Patterns to warn about

**Command**:
```bash
/codify
```

**Output**: Updated `.sigilrc.yaml`

---

### `/inherit` — Bootstrap from Existing Code

**Goal**: Bootstrap design context from existing codebase

**Process**:
1. Scans codebase for v1.2.5 patterns
2. Suggests v2.0 migration paths
3. Identifies layout/lens mappings
4. Generates draft moodboard and rules

**Command**:
```bash
/inherit
```

---

### `/validate` — Check Physics Compliance

**Goal**: Verify v2.0 patterns are used correctly

**What It Checks**:
- useCriticalAction has appropriate time authority
- CriticalZone used for financial/destructive actions
- Lens components used (not raw buttons)
- StrictLens enforcement in critical+financial zones

**Command**:
```bash
/validate
/validate src/features/checkout/
```

---

### `/garden` — Entropy Detection

**Goal**: Detect drift and maintain design health

**What It Catches**:
- **Drift**: Components not using proper layouts
- **Stale Sandbox**: Experiments older than 7 days
- **v1.2.5 Patterns**: Deprecated API usage
- **Lens Bypass**: Raw buttons in layout zones

**Command**:
```bash
/garden
/garden drift
/garden stale
```

---

## Core Layer

### useCriticalAction

Main physics hook with time authority:

```tsx
import { useCriticalAction } from 'sigil-mark';

const action = useCriticalAction({
  mutation: () => api.doThing(),
  timeAuthority: 'server-tick',
  onSuccess: (data) => console.log('Done:', data),
  onError: (error) => console.error('Failed:', error),
});

// State machine
action.state.status  // 'idle' | 'confirming' | 'pending' | 'confirmed' | 'failed'

// Actions
action.commit()      // Execute mutation
action.cancel()      // Cancel
action.reset()       // Reset to idle
```

### Time Authorities

| Authority | Behavior | Use Case |
|-----------|----------|----------|
| `server-tick` | Wait for server confirmation | Payments, destructive actions |
| `optimistic` | Instant update, silent rollback | Admin tools, lists |
| `hybrid` | Instant + sync indicator | Real-time collaboration |

---

## Layout Layer

Layouts ARE Zones. Wrap content to declare context.

### CriticalZone

```tsx
import { CriticalZone, useLens, useCriticalAction } from 'sigil-mark';

function PaymentForm({ amount }) {
  const payment = useCriticalAction({
    mutation: () => api.pay(amount),
    timeAuthority: 'server-tick',
  });
  const Lens = useLens(); // Auto-selects StrictLens

  return (
    <CriticalZone financial>
      <CriticalZone.Content>
        <h2>Confirm Payment</h2>
      </CriticalZone.Content>
      <CriticalZone.Actions>
        <Lens.CriticalButton
          state={payment.state}
          onAction={() => payment.commit()}
        >
          Pay ${amount}
        </Lens.CriticalButton>
      </CriticalZone.Actions>
    </CriticalZone>
  );
}
```

### MachineryLayout

```tsx
import { MachineryLayout, useLens } from 'sigil-mark';

function InvoiceList({ invoices, onSelect, onDelete }) {
  const Lens = useLens(); // User preference (DefaultLens by default)

  return (
    <MachineryLayout stateKey="invoices" onAction={onSelect} onDelete={onDelete}>
      <MachineryLayout.Search placeholder="Search invoices..." />
      <MachineryLayout.List>
        {invoices.map(inv => (
          <Lens.MachineryItem key={inv.id} id={inv.id}>
            {inv.number} - ${inv.amount}
          </Lens.MachineryItem>
        ))}
      </MachineryLayout.List>
      <MachineryLayout.Empty>No invoices found</MachineryLayout.Empty>
    </MachineryLayout>
  );
}
```

### GlassLayout

```tsx
import { GlassLayout, useLens } from 'sigil-mark';

function ProductCard({ product }) {
  const Lens = useLens(); // User preference

  return (
    <GlassLayout variant="card">
      <GlassLayout.Image src={product.image} alt={product.name} />
      <GlassLayout.Content>
        <GlassLayout.Title>{product.name}</GlassLayout.Title>
        <GlassLayout.Description>{product.description}</GlassLayout.Description>
      </GlassLayout.Content>
      <GlassLayout.Actions>
        <Lens.GlassButton variant="primary">Add to Cart</Lens.GlassButton>
      </GlassLayout.Actions>
    </GlassLayout>
  );
}
```

---

## Lens Layer

### useLens

Returns appropriate lens based on zone context:

```tsx
const Lens = useLens();

// In CriticalZone with financial=true → StrictLens (forced)
// In MachineryLayout/GlassLayout → User preference
// Outside layouts → DefaultLens
```

### Built-in Lenses

| Lens | Touch Target | Contrast | Animations | Use Case |
|------|-------------|----------|------------|----------|
| `DefaultLens` | 44px | Standard | Yes | General use |
| `StrictLens` | 48px | High | No | Financial, critical |
| `A11yLens` | 56px | WCAG AAA | No | Accessibility focus |

### LensProvider

Set user preference app-wide:

```tsx
import { LensProvider, A11yLens } from 'sigil-mark';

function App() {
  return (
    <LensProvider initialLens={A11yLens}>
      <Router />
    </LensProvider>
  );
}
```

**Note**: CriticalZone with `financial={true}` still forces StrictLens regardless of user preference.

---

## State Zone Structure

```
sigil-mark/
├── index.ts              # Main entry point (all exports)
├── moodboard.md          # Product feel + references
├── rules.md              # Design rules by category
│
├── core/                 # Physics engines (Truth)
│   ├── useCriticalAction.ts
│   ├── useLocalCache.ts
│   ├── proprioception.ts
│   └── types.ts
│
├── layouts/              # Zone primitives
│   ├── CriticalZone.tsx
│   ├── MachineryLayout.tsx
│   ├── GlassLayout.tsx
│   └── context.ts
│
├── lenses/               # UI renderers (Experience)
│   ├── default/
│   ├── strict/
│   ├── a11y/
│   ├── useLens.ts
│   └── LensProvider.tsx
│
├── recipes/              # v1.2.5 recipes (deprecated)
├── sandbox/              # Unconstrained experiments
├── __examples__/         # Usage examples
└── __tests__/            # Test suite
```

---

## Example Workflow

### New Project

```bash
# 1. Initialize Sigil
/setup

# 2. Capture product feel through interview
/envision
# → Answer questions about references, feel, anti-patterns
# → Review sigil-mark/moodboard.md

# 3. Define zone preferences
/codify
# → Configure .sigilrc.yaml

# 4. Build your product
# Use v2.0 patterns: CriticalZone, useCriticalAction, useLens

# 5. Get guidance during implementation
/craft src/features/checkout/PaymentForm.tsx
# → Layout: CriticalZone with financial=true
# → Lens: StrictLens (forced)
# → Time Authority: server-tick

# 6. Experiment with alternatives
/sandbox "hybrid time authority for checkout"

# 7. Check compliance
/validate

# 8. Detect entropy
/garden
```

### Existing Codebase (v1.2.5 Migration)

```bash
# 1. Initialize Sigil
/setup

# 2. Scan codebase to detect v1.2.5 patterns
/inherit
# → Identifies SigilZone, useServerTick usage
# → Suggests migration paths

# 3. Refine moodboard
/envision

# 4. Migrate patterns
# SigilZone material="decisive" → CriticalZone financial
# useServerTick → useCriticalAction with server-tick
# useSigilPhysics → useLens

# 5. Continue with craft/validate/garden
```

---

## Best Practices

### Using Layouts (Zones)

- **CriticalZone** for payments, destructive actions, confirmations
- **MachineryLayout** for admin lists, data tables, keyboard-driven UIs
- **GlassLayout** for marketing cards, product displays, hover-driven UIs

### Using Time Authorities

- **server-tick** for anything that modifies server state and can't be undone
- **optimistic** for reversible actions where speed matters
- **hybrid** for collaborative features where sync status is important

### Using Lenses

- Let `useLens()` auto-select based on zone
- Use `LensProvider` for app-wide accessibility preferences
- Don't bypass lens components with raw HTML buttons in layout zones

### Enforcement

- Run `/validate` before commits
- Review `/garden` output weekly
- Use StrictLens in all financial flows (CriticalZone enforces this)

---

## Related Documentation

- **[README.md](README.md)** — Quick start guide
- **[CLAUDE.md](CLAUDE.md)** — Agent protocol reference
- **[sigil-mark/README.md](sigil-mark/README.md)** — v2.0 API reference
- **[sigil-mark/MIGRATION.md](sigil-mark/MIGRATION.md)** — v1.2.5 → v2.0 migration guide
