# Software Design Document: Sigil v2.0

> "Physics must be structural (DOM), not theoretical (AST). Multiple realities (Lenses) on a single truth (Physics)."

**Version**: 2.0.0
**Date**: 2026-01-05
**Status**: Draft
**PRD Reference**: loa-grimoire/prd.md

---

## Executive Summary

Sigil v2.0 is a **Reality Engine** that separates Truth (Core physics) from Experience (Lenses). This is an additive evolution from v1.2.5, but with a key architectural shift: **Layouts ARE Zones**. The previous `SigilZone` abstraction is deprecated in favor of Layout Primitives that provide both structural physics AND zone context in a single component.

### Architecture Philosophy

1. **Layouts ARE Zones** — `CriticalZone` provides zone context + layout physics in one component
2. **Core emits state streams** — `useCriticalAction` provides status, time authority, predictions
3. **Lenses consume streams** — Interchangeable UIs on the same physics
4. **No Ergonomic Profiler** — Ship physics, skip bureaucracy (profiler is for lens ecosystems)

### Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| v1.2.5 APIs | Deprecated | Clean break, layouts ARE zones |
| Ergonomic Profiler | Not shipped | No lens ecosystem yet, skip bureaucracy |
| Layout composition | Layouts provide zone context | `CriticalZone` = `SigilZone` + layout |
| Lens enforcement | Zone context | `useLens()` reads from nearest layout |
| Distribution | Mount script | Continue existing pattern |

### Migration Summary

| v1.2.5 | v2.0 | Notes |
|--------|------|-------|
| `<SigilZone material="decisive">` | `<CriticalZone>` | Layout IS zone |
| `<SigilZone material="machinery">` | `<MachineryLayout>` | Layout IS zone |
| `<SigilZone material="glass">` | `<GlassLayout>` | Layout IS zone |
| `useServerTick()` | `useCriticalAction()` | Adds time authority + proprioception |
| `useSigilPhysics()` | `useLens()` | Returns lens for current zone |
| `Button` | `Lens.CriticalButton` | Lens-based rendering |

---

## 1. System Architecture

### 1.1 High-Level Architecture

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
│  │  useCriticalAction() → State Stream                                   │  │
│  │  { status, timeAuthority, selfPrediction, worldTruth, risk }          │  │
│  │                                                                       │  │
│  │  Time Authority: optimistic | server-tick | hybrid                    │  │
│  │  Proprioception: self (can lie) | world (truth only)                  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                              ↓ State Stream                                 │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    LAYOUT LAYER                                       │  │
│  │              (Zones + Structural Physics)                             │  │
│  │                                                                       │  │
│  │  CriticalZone — Zone context + 32px gaps + action ordering            │  │
│  │  MachineryLayout — Zone context + keyboard navigation                 │  │
│  │  GlassLayout — Zone context + hover physics                           │  │
│  │                                                                       │  │
│  │  Layouts ARE Zones. Physics is DOM, not lint.                         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                              ↓ Zone Context                                 │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      LENS LAYER                                       │  │
│  │              (Experience)                                             │  │
│  │                                                                       │  │
│  │  useLens() — Returns appropriate lens for current zone                │  │
│  │  DefaultLens — Standard UI, 44px targets                              │  │
│  │  StrictLens — Forced in critical zones, no overlays                   │  │
│  │  A11yLens — High contrast, 56px targets                               │  │
│  │                                                                       │  │
│  │  Lens.CriticalButton, Lens.GlassButton, Lens.MachineryItem            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow

```
User Action
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ useCriticalAction({ mutation, timeAuthority, proprioception })  │
└─────────────────────────────────────────────────────────────────┘
    │
    ├─── timeAuthority: 'optimistic' ────► Instant UI update
    │                                      Silent rollback on error
    │
    ├─── timeAuthority: 'server-tick' ──► Wait for server
    │                                      Show pending state
    │
    └─── timeAuthority: 'hybrid' ────────► Instant + sync indicator
                                           Visible reconciliation
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ State Stream                                                     │
│ { status, timeAuthority, selfPrediction, worldTruth, risk }     │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layout (Zone Context)                                            │
│ CriticalZone → type: 'critical', financial: true                │
│ MachineryLayout → type: 'admin'                                 │
│ GlassLayout → type: 'marketing'                                 │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ useLens() → Lens                                                 │
│ Critical zone + financial? → StrictLens (forced)                 │
│ Other zones → User preference (DefaultLens, A11yLens)           │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ Lens.CriticalButton({ state, onAction })                        │
│ Renders UI based on state stream                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Design

### 2.1 Core Layer

#### 2.1.1 useCriticalAction

The primary physics engine hook. Replaces `useServerTick` with additional capabilities.

```typescript
// sigil-mark/core/useCriticalAction.ts

export interface CriticalActionOptions<TData, TVariables = void> {
  /** Async mutation function */
  mutation: (variables: TVariables) => Promise<TData>;

  /** Who owns the clock */
  timeAuthority: 'optimistic' | 'server-tick' | 'hybrid';

  /** Self vs World prediction config */
  proprioception?: ProprioceptiveConfig;

  /** Optimistic cache update (for optimistic/hybrid) */
  optimistic?: (cache: Cache, variables: TVariables) => void;

  /** Rollback on failure */
  rollback?: (cache: Cache, variables: TVariables) => void;

  /** Success callback */
  onSuccess?: (data: TData) => void;

  /** Error callback */
  onError?: (error: Error) => void;
}

export interface CriticalActionState<TData = unknown> {
  status: 'idle' | 'confirming' | 'pending' | 'confirmed' | 'failed';
  timeAuthority: 'optimistic' | 'server-tick' | 'hybrid';
  selfPrediction: SelfPredictionState;
  worldTruth: WorldTruthState;
  risk: 'low' | 'medium' | 'high';
  progress: number | null;
  error: Error | null;
  data: TData | null;
}

export interface CriticalAction<TData, TVariables> {
  state: CriticalActionState<TData>;
  commit: (variables: TVariables) => Promise<void>;
  cancel: () => void;
  retry: () => void;
}

export function useCriticalAction<TData, TVariables = void>(
  options: CriticalActionOptions<TData, TVariables>
): CriticalAction<TData, TVariables>;
```

**Implementation Notes:**
- Uses `useRef` pattern to avoid stale closure issues (from v1.2.5 `useServerTick`)
- Manages prediction confidence decay for proprioception
- Handles rollback on failure for optimistic updates
- Error visibility based on time authority (silent for optimistic)

#### 2.1.2 Proprioception

Configuration for self-predictions vs world-truth.

```typescript
// sigil-mark/core/proprioception.ts

export interface ProprioceptiveConfig {
  self: {
    /** Face target immediately (legal lie) */
    rotation?: { instant: boolean };

    /** Start animation immediately (legal lie) */
    animation?: { optimistic: boolean };

    /** Show predicted position */
    position?: {
      enabled: boolean;
      render: 'ghost' | 'solid' | 'hidden';
      reconcile: 'snap' | 'lerp' | 'ignore';
      maxDrift: number; // ms
    };
  };

  world: {
    /** HP changes — server only */
    damage: 'server-only';

    /** Money changes — server only */
    balance: 'server-only';

    /** Other players — server only */
    otherEntities: 'server-only';
  };
}

export interface SelfPredictionState {
  position: { predicted: unknown; confidence: number; render: string } | null;
  rotation: number | null;
  animation: string | null;
}

export interface WorldTruthState {
  confirmed: boolean;
  position?: unknown;
}
```

**Use Cases:**
- OSRS-style games: Instant rotation, ghost position, server-tick damage
- Banking: No predictions, full server-tick
- Linear: Full optimistic with silent rollback

#### 2.1.3 useLocalCache

Simple cache for optimistic updates.

```typescript
// sigil-mark/core/useLocalCache.ts

export interface Cache {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
  update<T>(key: string, updater: (value: T) => T): void;
  append<T>(key: string, item: T): void;
  remove<T>(key: string, predicate: (item: T) => boolean): void;
  revert(key: string): void;
}

export function useLocalCache(): Cache;
```

### 2.2 Layout Layer

#### 2.2.1 Zone Context

All layouts provide zone context via React Context.

```typescript
// sigil-mark/layouts/context.ts

export type ZoneType = 'critical' | 'admin' | 'marketing' | 'default';

export interface ZoneContextValue {
  type: ZoneType;
  financial?: boolean;
  competitive?: boolean;
  timeAuthority: 'optimistic' | 'server-tick' | 'hybrid';
}

export const ZoneContext = createContext<ZoneContextValue | null>(null);

export function useZoneContext(): ZoneContextValue {
  const context = useContext(ZoneContext);
  if (!context) {
    return { type: 'default', timeAuthority: 'optimistic' };
  }
  return context;
}
```

#### 2.2.2 CriticalZone

Layout primitive for high-stakes UI.

```typescript
// sigil-mark/layouts/CriticalZone.tsx

export interface CriticalZoneProps {
  children: ReactNode;
  financial?: boolean; // Default: true
}

/**
 * CriticalZone — Layout + Zone in one component
 *
 * Provides:
 * - Zone context: { type: 'critical', financial, timeAuthority: 'server-tick' }
 * - Structural physics: 32px gap, action ordering, max 3 actions
 *
 * @example
 * <CriticalZone financial>
 *   <CriticalZone.Content>
 *     <h2>Confirm Transfer</h2>
 *   </CriticalZone.Content>
 *   <CriticalZone.Actions>
 *     <Lens.GlassButton onAction={cancel}>Cancel</Lens.GlassButton>
 *     <Lens.CriticalButton state={state} onAction={commit}>
 *       Confirm
 *     </Lens.CriticalButton>
 *   </CriticalZone.Actions>
 * </CriticalZone>
 */
export function CriticalZone({ children, financial = true }: CriticalZoneProps);

// Subcomponents
CriticalZone.Content: FC<{ children: ReactNode }>;
CriticalZone.Actions: FC<{ children: ReactNode; maxActions?: number }>;
```

**Structural Physics:**
- 32px gap between actions (`gap-8` in Tailwind)
- Critical buttons auto-sorted to last position
- Max 3 actions (warns if exceeded)

#### 2.2.3 MachineryLayout

Layout primitive for keyboard-driven UI.

```typescript
// sigil-mark/layouts/MachineryLayout.tsx

export interface MachineryLayoutProps {
  children: ReactNode;
  stateKey?: string;
  onAction?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * MachineryLayout — Keyboard-driven list UI
 *
 * Provides:
 * - Zone context: { type: 'admin', timeAuthority: 'optimistic' }
 * - Keyboard navigation: Arrow keys, Enter, Delete, Escape
 * - Vim bindings: j/k for navigation
 *
 * @example
 * <MachineryLayout stateKey="invoices" onAction={selectInvoice}>
 *   <MachineryLayout.Search placeholder="Filter..." />
 *   <MachineryLayout.List>
 *     {items.map(item => (
 *       <MachineryLayout.Item key={item.id} id={item.id}>
 *         {item.name}
 *       </MachineryLayout.Item>
 *     ))}
 *   </MachineryLayout.List>
 * </MachineryLayout>
 */
export function MachineryLayout(props: MachineryLayoutProps);

// Subcomponents
MachineryLayout.List: FC<{ children: ReactNode }>;
MachineryLayout.Item: FC<{ id: string; children: ReactNode }>;
MachineryLayout.Search: FC<{ placeholder?: string; value?: string; onChange?: (v: string) => void }>;
MachineryLayout.Empty: FC<{ children: ReactNode }>;
```

**Structural Physics:**
- Arrow keys: Navigate items
- j/k: Vim-style navigation
- Enter/Space: Activate current item
- Delete/Backspace: Delete current item
- Escape: Deselect
- Home/End: Jump to first/last

#### 2.2.4 GlassLayout

Layout primitive for exploratory/marketing UI.

```typescript
// sigil-mark/layouts/GlassLayout.tsx

export interface GlassLayoutProps {
  children: ReactNode;
  variant?: 'card' | 'hero' | 'feature';
}

/**
 * GlassLayout — Hover-driven card UI
 *
 * Provides:
 * - Zone context: { type: 'marketing', timeAuthority: 'optimistic' }
 * - Hover physics: scale, lift, shadow
 * - Backdrop blur
 *
 * @example
 * <GlassLayout variant="card">
 *   <GlassLayout.Image src={product.image} />
 *   <GlassLayout.Content>
 *     <GlassLayout.Title>{product.name}</GlassLayout.Title>
 *     <GlassLayout.Description>{product.description}</GlassLayout.Description>
 *   </GlassLayout.Content>
 *   <GlassLayout.Actions>
 *     <Lens.GlassButton onAction={viewDetails}>View</Lens.GlassButton>
 *   </GlassLayout.Actions>
 * </GlassLayout>
 */
export function GlassLayout(props: GlassLayoutProps);

// Subcomponents
GlassLayout.Image: FC<{ src: string; alt?: string }>;
GlassLayout.Content: FC<{ children: ReactNode }>;
GlassLayout.Title: FC<{ children: ReactNode }>;
GlassLayout.Description: FC<{ children: ReactNode }>;
GlassLayout.Actions: FC<{ children: ReactNode }>;
```

**Structural Physics:**
- Hover: `scale(1.02)`, `translateY(-4px)`, shadow increase
- Transition: 200ms ease-out
- Backdrop blur: `backdrop-blur-lg`

### 2.3 Lens Layer

#### 2.3.1 useLens

Hook to get the appropriate lens for the current zone.

```typescript
// sigil-mark/lenses/useLens.ts

export interface Zone {
  type: 'critical' | 'admin' | 'marketing' | 'default';
  financial?: boolean;
  competitive?: boolean;
}

export function useLens(overrideZone?: Zone): Lens {
  const zoneContext = useZoneContext();
  const zone = overrideZone ?? zoneContext;
  const userLens = useUserLens(); // From LensProvider

  // Critical zone + financial → Force StrictLens
  if (zone.type === 'critical' && zone.financial) {
    return StrictLens;
  }

  // Other zones → User preference
  return userLens ?? DefaultLens;
}
```

#### 2.3.2 Lens Interface

All lenses implement this interface.

```typescript
// sigil-mark/lenses/types.ts

export interface Lens {
  name: string;
  classification: 'cosmetic' | 'utility' | 'gameplay';

  // Components
  CriticalButton: ComponentType<CriticalButtonProps>;
  GlassButton: ComponentType<GlassButtonProps>;
  MachineryItem: ComponentType<MachineryItemProps>;
}

export interface CriticalButtonProps {
  state: CriticalActionState;
  onAction: () => void;
  children: ReactNode;
  labels?: {
    confirming?: string;
    pending?: string;
    confirmed?: string;
    failed?: string;
  };
}

export interface GlassButtonProps {
  onAction: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export interface MachineryItemProps {
  onAction: () => void;
  onDelete?: () => void;
  isActive?: boolean;
  children: ReactNode;
}
```

#### 2.3.3 Built-in Lenses

**DefaultLens** — Standard UI, 44px targets, animations

```typescript
// sigil-mark/lenses/default/index.tsx

export const DefaultLens: Lens = {
  name: 'DefaultLens',
  classification: 'cosmetic',
  CriticalButton, // 44px min-height, status styling, tap scale
  GlassButton,    // 44px min-height, variant styling
  MachineryItem,  // Hover highlighting, active state
};
```

**StrictLens** — Forced in critical zones, maximum clarity

```typescript
// sigil-mark/lenses/strict/index.tsx

export const StrictLens: Lens = {
  name: 'StrictLens',
  classification: 'cosmetic',
  CriticalButton, // 48px min-height, high contrast, no animations
  GlassButton,    // 48px min-height, high contrast
  MachineryItem,  // Clear active state, border indicator
};
```

**A11yLens** — High contrast, 56px targets

```typescript
// sigil-mark/lenses/a11y/index.tsx

export const A11yLens: Lens = {
  name: 'A11yLens',
  classification: 'cosmetic',
  CriticalButton, // 56px min-height, extra high contrast
  GlassButton,    // 56px min-height
  MachineryItem,  // Large touch targets
};
```

---

## 3. File Structure

```
sigil-mark/
├── core/                        # Physics engines (Truth)
│   ├── index.ts                 # Public exports
│   ├── useCriticalAction.ts     # Main physics hook
│   ├── useLocalCache.ts         # Optimistic cache
│   ├── proprioception.ts        # Self vs World types
│   └── types.ts                 # Core types
│
├── layouts/                     # Layout Primitives (Zones + Structure)
│   ├── index.ts                 # Public exports
│   ├── context.ts               # Zone context
│   ├── CriticalZone.tsx         # Critical + financial zone
│   ├── MachineryLayout.tsx      # Admin zone + keyboard nav
│   └── GlassLayout.tsx          # Marketing zone + hover
│
├── lenses/                      # UI Renderers (Experience)
│   ├── index.ts                 # Public exports
│   ├── types.ts                 # Lens interface
│   ├── useLens.ts               # Get lens for zone
│   ├── LensProvider.tsx         # User lens preference
│   ├── default/
│   │   └── index.tsx            # DefaultLens
│   ├── strict/
│   │   └── index.tsx            # StrictLens
│   └── a11y/
│       └── index.tsx            # A11yLens
│
├── types/                       # Shared types
│   └── index.ts
│
├── __tests__/                   # Tests
│   ├── useCriticalAction.test.ts
│   ├── CriticalZone.test.tsx
│   ├── MachineryLayout.test.tsx
│   ├── GlassLayout.test.tsx
│   └── useLens.test.tsx
│
└── index.ts                     # Package entry point
```

---

## 4. API Design

### 4.1 Public API

```typescript
// sigil-mark/index.ts

// Core
export { useCriticalAction } from './core';
export type {
  CriticalActionOptions,
  CriticalActionState,
  CriticalAction,
  ProprioceptiveConfig,
  SelfPredictionState,
  WorldTruthState,
  Cache,
} from './core';

// Layouts
export { CriticalZone, MachineryLayout, GlassLayout } from './layouts';
export { useZoneContext } from './layouts';
export type { ZoneContextValue, ZoneType } from './layouts';

// Lenses
export { useLens, LensProvider, DefaultLens, StrictLens, A11yLens } from './lenses';
export type {
  Lens,
  CriticalButtonProps,
  GlassButtonProps,
  MachineryItemProps,
} from './lenses';
```

### 4.2 Usage Examples

#### Critical Zone (Payment)

```tsx
import { CriticalZone, useCriticalAction, useLens } from 'sigil-mark';

function PaymentForm({ amount }: { amount: number }) {
  const Lens = useLens(); // Returns StrictLens in CriticalZone

  const payment = useCriticalAction({
    mutation: () => api.pay(amount),
    timeAuthority: 'server-tick', // Server owns clock
  });

  return (
    <CriticalZone financial>
      <CriticalZone.Content>
        <h2>Confirm Payment</h2>
        <p>Amount: ${amount}</p>
      </CriticalZone.Content>

      <CriticalZone.Actions>
        <Lens.GlassButton onAction={cancel}>Cancel</Lens.GlassButton>
        <Lens.CriticalButton state={payment.state} onAction={() => payment.commit()}>
          Pay ${amount}
        </Lens.CriticalButton>
      </CriticalZone.Actions>
    </CriticalZone>
  );
}
```

#### Machinery Layout (Admin)

```tsx
import { MachineryLayout, useCriticalAction, useLens } from 'sigil-mark';

function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  const Lens = useLens(); // Returns user preference in MachineryLayout

  return (
    <MachineryLayout
      stateKey="invoices"
      onAction={(id) => router.push(`/invoices/${id}`)}
      onDelete={(id) => deleteInvoice(id)}
    >
      <MachineryLayout.Search placeholder="Filter invoices..." />
      <MachineryLayout.List>
        {invoices.map((inv) => (
          <MachineryLayout.Item key={inv.id} id={inv.id}>
            <Lens.MachineryItem>
              <span>{inv.number}</span>
              <span>${inv.amount}</span>
            </Lens.MachineryItem>
          </MachineryLayout.Item>
        ))}
      </MachineryLayout.List>
    </MachineryLayout>
  );
}
```

#### Glass Layout (Marketing)

```tsx
import { GlassLayout, useLens } from 'sigil-mark';

function ProductCard({ product }: { product: Product }) {
  const Lens = useLens(); // Returns user preference in GlassLayout

  return (
    <GlassLayout variant="card">
      <GlassLayout.Image src={product.image} alt={product.name} />
      <GlassLayout.Content>
        <GlassLayout.Title>{product.name}</GlassLayout.Title>
        <GlassLayout.Description>{product.description}</GlassLayout.Description>
      </GlassLayout.Content>
      <GlassLayout.Actions>
        <Lens.GlassButton onAction={() => addToCart(product.id)}>
          Add to Cart
        </Lens.GlassButton>
      </GlassLayout.Actions>
    </GlassLayout>
  );
}
```

#### Optimistic Action (Linear-style)

```tsx
import { useCriticalAction, useLocalCache } from 'sigil-mark';

function CreateIssue() {
  const cache = useLocalCache();

  const create = useCriticalAction({
    mutation: (data) => api.issues.create(data),
    timeAuthority: 'optimistic', // Client owns clock
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

#### Proprioception (Game-style)

```tsx
import { useCriticalAction } from 'sigil-mark';

function PlayerMovement() {
  const movement = useCriticalAction({
    mutation: (target) => api.game.move(target),
    timeAuthority: 'server-tick', // Server is truth

    proprioception: {
      self: {
        rotation: { instant: true },     // Face target NOW (legal lie)
        animation: { optimistic: true }, // Start walking NOW
        position: {
          enabled: true,
          render: 'ghost',
          reconcile: 'lerp',
          maxDrift: 600, // 600ms prediction window
        },
      },
      world: {
        damage: 'server-only', // HP waits for server
        balance: 'server-only',
        otherEntities: 'server-only',
      },
    },
  });

  // Rotation instant, position ghost, damage waits
}
```

---

## 5. Configuration

### 5.1 .sigilrc.yaml

Zone configuration for file path resolution.

```yaml
sigil: "2.0.0"

# Zone definitions (for file path → zone mapping)
zones:
  critical:
    paths:
      - "src/features/checkout/**"
      - "src/features/payment/**"
      - "src/features/transfer/**"
    financial: true
    timeAuthority: server-tick

  admin:
    paths:
      - "src/features/admin/**"
      - "src/features/settings/**"
    timeAuthority: optimistic

  marketing:
    paths:
      - "src/features/landing/**"
      - "src/features/marketing/**"
      - "app/(marketing)/**"
    timeAuthority: optimistic

# Proprioception defaults
proprioception:
  self:
    rotation: { instant: true }
    animation: { optimistic: true }
    position: { render: ghost, reconcile: lerp, maxDrift: 600 }
  world:
    damage: server-only
    balance: server-only
    otherEntities: server-only

# Registered lenses
lenses:
  DefaultLens:
    classification: cosmetic
    path: "@/lenses/default"
  StrictLens:
    classification: cosmetic
    path: "@/lenses/strict"
  A11yLens:
    classification: cosmetic
    path: "@/lenses/a11y"
```

### 5.2 Zone Resolution (for Claude/AI)

```typescript
// sigil-mark/core/zone-resolver.ts

import { ZoneType } from '../layouts/context';

interface ZoneConfig {
  type: ZoneType;
  financial?: boolean;
  timeAuthority: 'optimistic' | 'server-tick' | 'hybrid';
}

/**
 * Resolve zone from file path.
 * Used by Claude to determine which layout to suggest.
 */
export function resolveZone(filePath: string): ZoneConfig {
  // Parse .sigilrc.yaml zones
  // Match file path against glob patterns
  // Return zone config or default
}
```

---

## 6. Testing Strategy

### 6.1 Unit Tests

**Core Layer:**
```typescript
// __tests__/useCriticalAction.test.ts

describe('useCriticalAction', () => {
  describe('server-tick authority', () => {
    it('shows pending state until server responds');
    it('does not allow double execution');
    it('calls onError on failure');
    it('calls onSuccess on success');
  });

  describe('optimistic authority', () => {
    it('updates cache immediately');
    it('rolls back on failure');
    it('hides error (silent rollback)');
  });

  describe('proprioception', () => {
    it('applies self predictions immediately');
    it('decays confidence over maxDrift');
    it('reconciles with lerp on server response');
  });
});
```

**Layout Layer:**
```typescript
// __tests__/CriticalZone.test.tsx

describe('CriticalZone', () => {
  it('provides critical zone context');
  it('sorts critical buttons to last');
  it('warns when exceeding max actions');
  it('enforces 32px gap between actions');
});
```

**Lens Layer:**
```typescript
// __tests__/useLens.test.tsx

describe('useLens', () => {
  it('returns StrictLens in critical+financial zone');
  it('returns user preference in admin zone');
  it('returns DefaultLens when no preference set');
});
```

### 6.2 Integration Tests

```typescript
// __tests__/integration.test.tsx

describe('Payment Flow', () => {
  it('forces StrictLens in CriticalZone');
  it('shows pending state during payment');
  it('shows confirmed state on success');
  it('shows error state on failure');
});

describe('Admin List', () => {
  it('supports keyboard navigation');
  it('fires onAction on Enter');
  it('fires onDelete on Delete key');
});
```

---

## 7. Migration Guide

### 7.1 From v1.2.5

**Before (v1.2.5):**
```tsx
import { SigilZone, useSigilPhysics, Button, useServerTick } from 'sigil-mark';

function Checkout() {
  const { physics } = useSigilPhysics();
  const { execute, isPending } = useServerTick(pay);

  return (
    <SigilZone material="decisive" serverAuthoritative>
      <Button onClick={execute} disabled={isPending}>
        {isPending ? 'Processing...' : 'Confirm'}
      </Button>
    </SigilZone>
  );
}
```

**After (v2.0):**
```tsx
import { CriticalZone, useCriticalAction, useLens } from 'sigil-mark';

function Checkout() {
  const Lens = useLens();
  const payment = useCriticalAction({
    mutation: pay,
    timeAuthority: 'server-tick',
  });

  return (
    <CriticalZone financial>
      <CriticalZone.Content>
        {/* Content */}
      </CriticalZone.Content>
      <CriticalZone.Actions>
        <Lens.CriticalButton state={payment.state} onAction={() => payment.commit()}>
          Confirm
        </Lens.CriticalButton>
      </CriticalZone.Actions>
    </CriticalZone>
  );
}
```

### 7.2 Key Changes

| v1.2.5 Pattern | v2.0 Pattern |
|----------------|--------------|
| `<SigilZone material="decisive">` | `<CriticalZone>` |
| `useSigilPhysics().physics` | `useLens()` → Lens components |
| `useServerTick(action)` | `useCriticalAction({ mutation, timeAuthority })` |
| `isPending` state | `state.status === 'pending'` |
| Manual button styling | `Lens.CriticalButton` with state |

---

## 8. Risks & Mitigations

### 8.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Proprioception drift causes jank | Medium | High | `maxDrift` timeout, snap fallback |
| Layout context not provided | Medium | Medium | Fallback to default zone |
| Lens not found | Low | Low | Fallback to DefaultLens |

### 8.2 Migration Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| v1.2.5 API usage in codebase | High | Medium | Deprecation warnings in v1.2.5 |
| Missing layout wrappers | Medium | Medium | ESLint rule: no bare Lens components |

---

## 9. Future Considerations

### 9.1 Not In Scope (v2.0)

- **Ergonomic Profiler**: Deferred until lens ecosystem exists
- **Custom Lens Registration**: Built-in lenses only for now
- **Server-Side Rendering**: Client-only for v2.0
- **Multi-player Sync Engine**: Hybrid authority only

### 9.2 Potential v2.1 Features

- Zone-based ESLint rules (`sigil/require-layout-wrapper`)
- DevTools extension for zone visualization
- Storybook integration for lens preview
- Performance profiler for prediction accuracy

---

## 10. Appendix

### 10.1 Reference Products

| Product | Concept | How Sigil Uses It |
|---------|---------|-------------------|
| OSRS | Client prediction | Proprioception (self vs world) |
| Linear | Optimistic updates | `timeAuthority: 'optimistic'` |
| Figma | Multiplayer reconciliation | `timeAuthority: 'hybrid'` |
| Phantom | Server-tick truth | `timeAuthority: 'server-tick'` |

### 10.2 Decision Log

| Decision | Choice | Date | Rationale |
|----------|--------|------|-----------|
| v1.2.5 deprecation | Deprecated | 2026-01-05 | Clean break, layouts ARE zones |
| Ergonomic Profiler | Not shipped | 2026-01-05 | No lens ecosystem, skip bureaucracy |
| Layout composition | Layouts provide zone | 2026-01-05 | "Physics is structural" |

---

*SDD generated from PRD v2.0.0*
*Source: loa-grimoire/prd.md, sigil-v2.0.zip context*
