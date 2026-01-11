# Sigil v2.0 Architecture

## Reality Engine

**Version**: 2.0.0  
**Status**: Production Ready  
**Grade**: A+ (after 10 rounds of Staff Engineer review)

---

## Executive Summary

Sigil is a **Reality Engine** for product development—not a design system. It enforces physics (data truth, time truth, input truth) while allowing multiple visual interpretations (lenses) on top of that physics.

### Core Insight

> "Truth (Core) and Experience (Lens) must be decoupled. But the Lens cannot distort the Truth so much that it breaks the User's hand."

This architecture allows:
- **OSRS-style** client prediction (instant rotation, tick-based movement)
- **Phantom-style** transaction simulation (preview without lying about balance)
- **117HD-style** community lenses (cosmetic changes, physics intact)
- **Linear-style** sync engine (optimistic UI, background reconciliation)

While preventing:
- **Cheat clients** (gameplay lenses blocked in critical zones)
- **Broken hitboxes** (ergonomic profiler rejects bad lenses)
- **Balance lies** (world-truth is server-only)
- **Misleading overlays** (StrictLens forced in financial flows)

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SIGIL v2.0                                     │
│                          REALITY ENGINE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         CORE LAYER                                    │  │
│  │                    (Truth + Physics)                                  │  │
│  │                                                                       │  │
│  │  State Stream: { status, timeAuthority, prediction, risk }            │  │
│  │  Temporal Governor: optimistic | server-tick | hybrid                 │  │
│  │  Proprioception: self (can lie) | world (truth only)                  │  │
│  │                                                                       │  │
│  │  Core is immutable. Lenses cannot change physics.                     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                              ↓ State Stream                                 │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    ERGONOMIC PROFILER                                 │  │
│  │              (Validates Lenses)                                       │  │
│  │                                                                       │  │
│  │  Hitbox: ≥44px touch, ≤2px drift                                      │  │
│  │  Contrast: ≥4.5:1 (AA), ≥7:1 (Critical)                               │  │
│  │  Focus: Visible indicator required                                    │  │
│  │                                                                       │  │
│  │  Rejects lenses that break input physics.                             │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                              ↓                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    INTEGRITY FLAGS                                    │  │
│  │              (Classifies Lenses)                                      │  │
│  │                                                                       │  │
│  │  Cosmetic: Colors, fonts, animations (Safe)                           │  │
│  │  Utility: Overlays, highlights (Warning in critical)                  │  │
│  │  Gameplay: Input hints (Blocked in critical/financial)                │  │
│  │                                                                       │  │
│  │  Forces StrictLens in sensitive zones.                                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                              ↓                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      LENS REGISTRY                                    │  │
│  │              (Approved Lenses)                                        │  │
│  │                                                                       │  │
│  │  DefaultLens (Cosmetic) — Standard UI                                 │  │
│  │  A11yLens (Cosmetic) — High contrast, large targets                   │  │
│  │  StrictLens (Cosmetic) — Forced in critical zones                     │  │
│  │                                                                       │  │
│  │  All lenses pass Ergonomic Profiler.                                  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                              ↓                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                   LAYOUT PRIMITIVES                                   │  │
│  │              (Structural Physics)                                     │  │
│  │                                                                       │  │
│  │  CriticalZone — 32px gap, auto-ordering                               │  │
│  │  MachineryLayout — Keyboard navigation                                │  │
│  │  GlassLayout — Hover physics                                          │  │
│  │                                                                       │  │
│  │  Physics is DOM, not lint.                                            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Concepts

### 1. Core Layer (Physics)

The Core emits **state streams** that lenses consume. Core handles:
- **Status**: idle, pending, confirmed, failed
- **Time Authority**: Who owns the clock (client vs server)
- **Prediction**: What can be predicted (self vs world)
- **Risk**: Risk level for styling hints

```typescript
interface CriticalActionState {
  status: 'idle' | 'confirming' | 'pending' | 'confirmed' | 'failed';
  timeAuthority: 'optimistic' | 'server-tick' | 'hybrid';
  prediction: {
    self: { position?: Ghost; rotation?: number; animation?: string };
    world: { confirmed: boolean };
  };
  risk: 'low' | 'medium' | 'high';
  error: Error | null;
}
```

### 2. Temporal Governor

Three time authorities:

| Authority | Client Update | Reconciliation | Use Case |
|-----------|---------------|----------------|----------|
| `optimistic` | Instant | Silent rollback | Linear (issues) |
| `server-tick` | Wait for server | N/A | Banking (balance) |
| `hybrid` | Instant + sync indicator | Visible | Figma (multiplayer) |

### 3. Proprioception (Self vs World)

**Self predictions** are legal lies for responsive feel:
- Rotation (face target instantly)
- Animation (start walking immediately)
- Position (ghost at predicted location)

**World truth** is server-only:
- Damage (HP changes)
- Balance (money changes)
- Other entities (other players)

```typescript
proprioception: {
  self: {
    rotation: { instant: true },
    animation: { optimistic: true },
    position: { render: 'ghost', reconcile: 'lerp', maxDrift: 600 },
  },
  world: {
    damage: 'server-only',
    balance: 'server-only',
  },
}
```

### 4. Ergonomic Profiler

Validates lenses before registration:

| Check | Threshold | Rejection |
|-------|-----------|-----------|
| Touch target | ≥ 44px | Lens rejected |
| Center drift | ≤ 2px | Lens rejected |
| Contrast (AA) | ≥ 4.5:1 | Lens rejected |
| Contrast (Critical) | ≥ 7:1 | Lens rejected |
| Focus visible | Required | Lens rejected |

### 5. Integrity Flags

Classifies lenses and enforces restrictions:

| Classification | Permissions | Restrictions |
|----------------|-------------|--------------|
| **Cosmetic** | Colors, fonts, animations | None |
| **Utility** | + Overlays, highlights | Warning in critical |
| **Gameplay** | + Input hints | Blocked in critical/financial |

In critical/financial zones, **StrictLens is forced** regardless of user preference.

### 6. Layout Primitives

Physics enforced by DOM structure (not lint rules):

| Layout | Physics | Use Case |
|--------|---------|----------|
| `CriticalZone` | 32px action gap, auto-ordering | Checkout, payment |
| `MachineryLayout` | Keyboard navigation baked in | Admin, lists |
| `GlassLayout` | Hover physics baked in | Marketing, cards |

---

## Evolution (10 Rounds)

| Round | Problem | Fix |
|-------|---------|-----|
| 1 | Bureaucracy (Council, Codex) | → Workshop |
| 2 | Museum rots (static docs) | → Live code tags |
| 3 | Cargo cult (copies tech debt) | → Pure primitives |
| 4 | Ban without alternative | → Ship engine hooks |
| 5 | Hollow shell (no data binding) | → Archetypes |
| 5 | Mob rule (popular ≠ good) | → Nomination |
| 6 | Clone-and-Drift | → Composition |
| 6 | Machine hallucination | → Reified runtime |
| 6 | Keyboard validation (reactionary) | → Intrinsic physics |
| 6 | Nomination bottleneck | → Probationary Gold |
| 7 | Silver = sanctioned debt | → Atomic Graduation |
| 7 | Prop drilling hell | → Slots |
| 7 | UI only (no data truth) | → Transaction Objects |
| 7 | Machinery = Lists only | → Interaction Primitives |
| 8 | Valid atoms, invalid molecules | → Pattern Validators |
| 8 | Data truth, no time truth | → Temporal Governor |
| 8 | Slots accept anything | → Slot Constraints |
| 9 | Static analysis bluff | → Layout Primitives |
| 9 | Binary time authority | → Prediction Layer |
| 9 | Coupled logic + UI | → State Stream + Lens |
| **10** | Hitbox fallacy | → **Ergonomic Profiler** |
| **10** | Cheat client risk | → **Integrity Flags** |
| **10** | No proprioception | → **Legalize the Lie** |

---

## File Structure

```
src/
├── core/                    # Physics engines
│   ├── useCriticalAction.ts # High-stakes actions
│   ├── useOptimisticAction.ts
│   ├── useLocalAction.ts
│   ├── proprioception.ts    # Self vs World
│   └── types.ts
│
├── profiler/                # Ergonomic validation
│   ├── ergonomic.ts
│   ├── hitbox.ts
│   ├── contrast.ts
│   └── focus.ts
│
├── integrity/               # Lens classification
│   ├── flags.ts
│   ├── enforcement.ts
│   └── strict-lens.ts
│
├── layouts/                 # Structural physics
│   ├── CriticalZone.tsx
│   ├── MachineryLayout.tsx
│   └── GlassLayout.tsx
│
├── lenses/                  # UI renderers
│   ├── default/
│   ├── a11y/
│   ├── strict/
│   └── registry.ts
│
├── types/                   # Shared types
│   └── index.ts
│
└── features/                # Application code
    └── ...
```

---

## Usage Examples

### Critical Zone (Financial)

```tsx
import { CriticalZone } from '@/layouts';
import { useCriticalAction } from '@/core';
import { useLens } from '@/integrity';

export function PaymentForm({ amount }: Props) {
  // StrictLens forced in critical+financial zone
  const Lens = useLens({ type: 'critical', financial: true });
  
  const payment = useCriticalAction({
    mutation: () => api.pay(amount),
    timeAuthority: 'server-tick',  // Server owns clock
    // No optimistic updates for financial
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

### Optimistic Action (Linear-style)

```tsx
import { useCriticalAction } from '@/core';

export function CreateIssue() {
  const create = useCriticalAction({
    mutation: (data) => api.issues.create(data),
    timeAuthority: 'optimistic',  // Client owns clock
    optimistic: (cache, data) => {
      cache.append('issues', { ...data, id: 'temp', status: 'pending' });
    },
    rollback: (cache) => {
      cache.remove('issues', (i) => i.id === 'temp');
    },
  });
  
  // UI updates instantly, silent rollback on failure
}
```

### Proprioceptive Prediction (OSRS-style)

```tsx
import { useCriticalAction } from '@/core';

export function PlayerMovement() {
  const movement = useCriticalAction({
    mutation: (target) => api.game.move(target),
    timeAuthority: 'server-tick',  // Server is truth
    
    proprioception: {
      self: {
        rotation: { instant: true },  // Face target NOW (legal lie)
        animation: { optimistic: true },  // Start walking NOW
        position: {
          render: 'ghost',
          reconcile: 'lerp',
          maxDrift: 600,  // 600ms prediction window
        },
      },
      world: {
        damage: 'server-only',  // HP waits for server
      },
    },
  });
  
  // Rotation instant, position ghost, damage waits
}
```

---

## Configuration

### .sigilrc.yaml

```yaml
sigil: "2.0.0"

ergonomics:
  hitbox:
    minTouchTarget: 44
    maxCenterDrift: 2
  contrast:
    minRatio: 4.5
    criticalMinRatio: 7.0
  focus:
    indicatorRequired: true

integrity:
  classifications:
    cosmetic:
      permissions: [colors, typography, spacing, animations]
      restrictions: []
    utility:
      permissions: [overlays, highlights]
      restrictions: [criticalZones]
    gameplay:
      permissions: [inputHints, dataAugmentation]
      restrictions: [criticalZones, financialFlow]

zones:
  critical:
    paths: ["src/features/checkout/**", "src/features/payment/**"]
    forceLens: StrictLens
    financial: true
    
  admin:
    paths: ["src/features/admin/**"]
    allowedClassifications: [cosmetic, utility]
    
  marketing:
    paths: ["src/features/landing/**"]
    allowedClassifications: [cosmetic, utility, gameplay]

proprioception:
  self:
    rotation: { instant: true }
    animation: { optimistic: true }
    position: { render: ghost, reconcile: lerp, maxDrift: 600 }
  world:
    damage: server-only
    balance: server-only

lenses:
  DefaultLens:
    classification: cosmetic
    path: "@/lenses/default"
  A11yLens:
    classification: cosmetic
    path: "@/lenses/a11y"
  StrictLens:
    classification: cosmetic
    path: "@/lenses/strict"
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Lens rejections | > 0 (profiler working) |
| StrictLens in critical | 100% |
| Ergonomic compliance | 100% |
| Proprioception violations | 0 (no world lies) |
| Core → Lens decoupling | 100% |

---

## References

This architecture draws from:

- **OSRS**: Polling charter, 117HD lens architecture, client prediction
- **Linear**: Sync engine, optimistic updates, opinionated workflows
- **Figma**: Multiplayer reconciliation, ergonomic design
- **Phantom/Family**: Transaction simulation, server-tick truth
- **Uniswap**: Protocol vs interface separation
- **Raycast**: Command palette physics
