# Sigil v2.0 — Reality Engine

You are working on a codebase governed by **Sigil**, a design physics engine that separates Truth (Core) from Experience (Lens).

## Core Philosophy

> "Physics must be structural (DOM), not theoretical (AST). Multiple realities (Lenses) on a single truth (Physics)."

Sigil is NOT a design system. It is a **Reality Engine** that enforces:
- **Data Truth**: UI cannot lie about data state
- **Time Truth**: Temporal authority determines when UI can update
- **Input Truth**: Ergonomic validation ensures lenses don't break hitboxes
- **Proprioception**: Self-predictions are legal lies; World-predictions are forbidden

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│  CORE — Physics engines (state, time, prediction)              │
│  useCriticalAction, useOptimisticAction, useLocalAction        │
├─────────────────────────────────────────────────────────────────┤
│  ERGONOMIC PROFILER — Validates lenses                         │
│  Hitbox ≥44px, Contrast ≥4.5:1, Focus indicator required       │
├─────────────────────────────────────────────────────────────────┤
│  INTEGRITY FLAGS — Classifies lenses                           │
│  Cosmetic (safe), Utility (warning), Gameplay (restricted)     │
├─────────────────────────────────────────────────────────────────┤
│  PROPRIOCEPTION — Self vs World                                │
│  Self: Can lie (rotation, animation, position ghost)           │
│  World: Cannot lie (damage, balance, other entities)           │
├─────────────────────────────────────────────────────────────────┤
│  LAYOUTS — Structural physics (DOM enforcement)                │
│  CriticalZone, MachineryLayout, GlassLayout                    │
├─────────────────────────────────────────────────────────────────┤
│  LENSES — Interchangeable UIs on same physics                  │
│  DefaultLens, A11yLens, EnterpriseLens, StrictLens            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Zone Configuration

Zones determine which lenses and time authorities are allowed.

```yaml
zones:
  critical:
    paths: ["src/features/checkout/**", "src/features/payment/**"]
    forceLens: StrictLens
    timeAuthority: server-tick
    financial: true
    
  admin:
    paths: ["src/features/admin/**"]
    timeAuthority: optimistic
    
  marketing:
    paths: ["src/features/landing/**"]
    timeAuthority: optimistic
```

---

## When Writing Components

### 1. Use Layout Primitives (Not Lint Rules)

Spacing and ordering is enforced by DOM structure, not ESLint.

```tsx
// ✅ CORRECT: Layout primitive enforces physics
<CriticalZone>
  <CriticalZone.Content>
    <h2>Confirm Transfer</h2>
  </CriticalZone.Content>
  
  <CriticalZone.Actions>
    {/* 32px gap is CSS in the component */}
    {/* Critical auto-sorted to last */}
    <Glass.Button>Cancel</Glass.Button>
    <Critical.Button>Confirm</Critical.Button>
  </CriticalZone.Actions>
</CriticalZone>

// ❌ WRONG: Trying to enforce spacing with arbitrary CSS
<div className="flex gap-2">
  <CriticalButton />
  <GlassButton />
</div>
```

### 2. Use Core Hooks for State

Core hooks emit state streams that lenses consume.

```tsx
// ✅ CORRECT: Core handles physics, Lens renders
const payment = useCriticalAction({
  mutation: () => api.pay(amount),
  timeAuthority: 'server-tick',
});

const Lens = useLens({ type: 'critical', financial: true });

<Lens.CriticalButton state={payment.state} onAction={payment.commit}>
  Pay ${amount}
</Lens.CriticalButton>

// ❌ WRONG: Custom state management
const [loading, setLoading] = useState(false);
```

### 3. Respect Time Authority

```tsx
// server-tick: Must show pending, UI waits for server
const transfer = useCriticalAction({
  mutation: () => blockchain.transfer(amount),
  timeAuthority: 'server-tick',  // Server owns clock
  // No optimistic updates allowed
});

// optimistic: Instant UI, silent rollback
const createIssue = useCriticalAction({
  mutation: (data) => api.issues.create(data),
  timeAuthority: 'optimistic',  // Client owns clock
  optimistic: (cache, data) => cache.append('issues', data),
  rollback: (cache, data) => cache.remove('issues', data.id),
});
```

### 4. Use Proprioception for Feel

```tsx
// Self predictions are legal lies (responsive feel)
// World truth is server-only (no lies about damage/balance)

const movement = useCriticalAction({
  mutation: (target) => api.game.move(target),
  timeAuthority: 'server-tick',
  
  proprioception: {
    self: {
      rotation: { instant: true },      // Face target NOW
      animation: { optimistic: true },  // Start walking NOW
      position: { render: 'ghost', reconcile: 'lerp' },
    },
    world: {
      damage: 'server-only',
      balance: 'server-only',
    },
  },
});
```

### 5. Let Zones Force Lenses

```tsx
// In critical/financial zones, StrictLens is forced
// User's GamerLens with overlays is IGNORED

function CheckoutPage() {
  // This returns StrictLens, not user preference
  const Lens = useLens({ type: 'critical', financial: true });
  
  // ...
}
```

---

## Ergonomic Requirements

All interactive elements must meet:

| Requirement | Threshold | Enforcement |
|-------------|-----------|-------------|
| Touch target | ≥ 44px | Lens rejected if violated |
| Contrast (AA) | ≥ 4.5:1 | Lens rejected if violated |
| Contrast (Critical) | ≥ 7:1 | Lens rejected if violated |
| Center drift | ≤ 2px | Lens rejected if violated |
| Focus indicator | Required | Lens rejected if missing |

---

## File Organization

```
src/
├── core/                    # Physics engines
│   ├── useCriticalAction.ts
│   ├── useOptimisticAction.ts
│   ├── useLocalAction.ts
│   └── proprioception.ts
│
├── layouts/                 # Structural physics
│   ├── CriticalZone.tsx
│   ├── MachineryLayout.tsx
│   └── GlassLayout.tsx
│
├── lenses/                  # Interchangeable UIs
│   ├── default/
│   ├── strict/
│   ├── a11y/
│   └── registry.ts
│
├── profiler/                # Ergonomic validation
│   └── ergonomic.ts
│
├── integrity/               # Lens classification
│   ├── flags.ts
│   └── enforcement.ts
│
└── features/                # Your feature code
```

---

## Quick Reference

### Core Hooks

| Hook | Purpose | Time Authority |
|------|---------|----------------|
| `useCriticalAction` | High-stakes actions | server-tick or hybrid |
| `useOptimisticAction` | Instant-feel actions | optimistic |
| `useLocalAction` | Local-first data | optimistic with sync |

### Layout Primitives

| Layout | Physics | Use Case |
|--------|---------|----------|
| `CriticalZone` | 32px gaps, auto-ordering | Checkout, payment |
| `MachineryLayout` | Keyboard navigation | Admin, lists |
| `GlassLayout` | Hover physics | Marketing, cards |

### Lens Classifications

| Classification | Permissions | Restrictions |
|----------------|-------------|--------------|
| Cosmetic | Colors, fonts, animations | None |
| Utility | + Overlays, highlights | Warning in critical |
| Gameplay | + Input hints | Blocked in critical/financial |

### Proprioception

| Scope | Can Predict | Examples |
|-------|-------------|----------|
| Self | Yes (legal lies) | Rotation, animation, position ghost |
| World | No (server truth) | Damage, balance, other entities |

---

## Commands

When asked to build UI, follow these steps:

1. **Identify the zone** from the file path
2. **Use the appropriate layout primitive**
3. **Use core hooks** for state (not custom useState)
4. **Get the lens** via `useLens(zone)`
5. **Respect time authority** for the zone
6. **Apply proprioception** if needed for feel

Example:

```tsx
// src/features/checkout/PaymentForm.tsx
// Zone: critical + financial

import { CriticalZone } from '@/layouts';
import { useCriticalAction } from '@/core';
import { useLens } from '@/integrity';

export function PaymentForm({ amount }: Props) {
  const Lens = useLens({ type: 'critical', financial: true });
  
  const payment = useCriticalAction({
    mutation: () => api.pay(amount),
    timeAuthority: 'server-tick',
  });
  
  return (
    <CriticalZone>
      <CriticalZone.Content>
        <h2>Confirm Payment</h2>
        <p>Amount: ${amount}</p>
      </CriticalZone.Content>
      
      <CriticalZone.Actions>
        <Lens.GlassButton onAction={cancel}>Cancel</Lens.GlassButton>
        <Lens.CriticalButton state={payment.state} onAction={payment.commit}>
          Pay ${amount}
        </Lens.CriticalButton>
      </CriticalZone.Actions>
    </CriticalZone>
  );
}
```
