# Sprint Plan: Sigil v2.0

**Version:** 2.0.0
**Created:** 2026-01-05
**Team:** Solo (1 engineer)
**Sprint Duration:** Focus-based (not time-boxed)
**Build Strategy:** Additive evolution from v1.2.5, but v1.2.5 APIs deprecated

---

## Overview

This plan implements Sigil v2.0, the "Reality Engine" that separates Truth (Core physics) from Experience (Lenses). The key architectural insight is: **Layouts ARE Zones**.

### Key Changes from v1.2.5

| v1.2.5 | v2.0 |
|--------|------|
| `SigilZone` + `material` prop | Layout primitives (CriticalZone, etc.) |
| `useServerTick` | `useCriticalAction` with time authority |
| `useSigilPhysics` | `useLens()` hook |
| `Button` component | `Lens.CriticalButton`, `Lens.GlassButton` |
| No predictions | Proprioception (self vs world) |
| Single UI style | Multiple lenses (Default, Strict, A11y) |

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

### Sprint Sequence

| Sprint | Focus |
|--------|-------|
| 1 | Core Layer foundation (types, state stream, time authority) |
| 2 | Core Layer completion (proprioception, cache) |
| 3 | Layout Layer (zone context, CriticalZone) |
| 4 | Layout Layer completion (MachineryLayout, GlassLayout) |
| 5 | Lens Layer (interface, useLens, LensProvider) |
| 6 | Built-in Lenses (Default, Strict, A11y) |
| 7 | Integration & Migration (public API, v1.2.5 deprecation) |
| 8 | Testing & Documentation |

---

## Sprint 1: Core Layer Foundation

**Goal:** Implement types and `useCriticalAction` hook with time authority

### Tasks

- [x] **S1-T1: Create shared types**
  - Create `sigil-mark/types/index.ts`
  - Define `TimeAuthority`, `CriticalActionStatus`, `Risk`
  - Define `SelfPredictionState`, `WorldTruthState`
  - Define `ProprioceptiveConfig` interface
  - **Acceptance:** All core types exported

- [x] **S1-T2: Create CriticalActionState interface**
  - Create `sigil-mark/core/types.ts`
  - Define `CriticalActionState<TData>` with all fields:
    - `status: 'idle' | 'confirming' | 'pending' | 'confirmed' | 'failed'`
    - `timeAuthority: 'optimistic' | 'server-tick' | 'hybrid'`
    - `selfPrediction`, `worldTruth`, `risk`, `progress`, `error`, `data`
  - **Acceptance:** Interface matches SDD §2.1.1

- [x] **S1-T3: Create CriticalActionOptions interface**
  - Define mutation, timeAuthority, proprioception options
  - Define optimistic/rollback callbacks
  - Define onSuccess/onError callbacks
  - **Acceptance:** Interface matches SDD §2.1.1

- [x] **S1-T4: Implement useCriticalAction hook - server-tick**
  - Create `sigil-mark/core/useCriticalAction.ts`
  - Implement `server-tick` time authority
  - Show pending state, prevent double execution
  - Call onSuccess/onError appropriately
  - **Acceptance:** Hook works with server-tick, tests pass

- [x] **S1-T5: Implement useCriticalAction hook - optimistic**
  - Add `optimistic` time authority support
  - Implement instant cache update
  - Implement silent rollback on failure
  - **Acceptance:** Hook works with optimistic, tests pass

- [x] **S1-T6: Implement useCriticalAction hook - hybrid**
  - Add `hybrid` time authority support
  - Show sync indicator while pending
  - Implement visible rollback
  - **Acceptance:** Hook works with hybrid, tests pass

- [x] **S1-T7: Create core barrel export**
  - Create `sigil-mark/core/index.ts`
  - Export `useCriticalAction` and types
  - **Acceptance:** `import { useCriticalAction } from './core'` works

### Deliverables
- `sigil-mark/types/index.ts`
- `sigil-mark/core/types.ts`
- `sigil-mark/core/useCriticalAction.ts`
- `sigil-mark/core/index.ts`

---

## Sprint 2: Core Layer Completion

**Goal:** Implement proprioception and local cache

### Tasks

- [x] **S2-T1: Create proprioception module**
  - Create `sigil-mark/core/proprioception.ts`
  - Define `createProprioception()` factory
  - Implement self-prediction state management
  - Implement confidence decay over maxDrift
  - **Acceptance:** Self predictions work with configurable decay

- [x] **S2-T2: Implement position prediction with ghost rendering**
  - Add `position.render: 'ghost' | 'solid' | 'hidden'`
  - Implement ghost position state
  - Implement confidence decay
  - **Acceptance:** Ghost position shows predicted location

- [x] **S2-T3: Implement reconciliation strategies**
  - Add `position.reconcile: 'snap' | 'lerp' | 'ignore'`
  - Implement snap (instant correction)
  - Implement lerp (smooth interpolation)
  - **Acceptance:** Reconciliation works correctly

- [x] **S2-T4: Create useLocalCache hook**
  - Create `sigil-mark/core/useLocalCache.ts`
  - Implement Cache interface: get, set, update, append, remove, revert
  - Support optimistic updates
  - **Acceptance:** Cache operations work, revert restores previous state

- [x] **S2-T5: Integrate proprioception with useCriticalAction**
  - Wire proprioception config into hook
  - Update selfPrediction state on action start
  - Update worldTruth state on server response
  - Reconcile on response
  - **Acceptance:** Full proprioception flow works end-to-end

- [x] **S2-T6: Create useCriticalAction tests**
  - Test server-tick authority flow
  - Test optimistic authority with rollback
  - Test hybrid authority with sync indicator
  - Test proprioception predictions
  - **Acceptance:** All core tests pass

### Deliverables
- `sigil-mark/core/proprioception.ts`
- `sigil-mark/core/useLocalCache.ts`
- `sigil-mark/__tests__/useCriticalAction.test.ts`

---

## Sprint 3: Layout Layer - Zone Context & CriticalZone

**Goal:** Implement zone context system and CriticalZone layout

### Tasks

- [x] **S3-T1: Create zone context**
  - Create `sigil-mark/layouts/context.ts`
  - Define `ZoneType`, `ZoneContextValue`
  - Create `ZoneContext` React context
  - Create `useZoneContext()` hook with default fallback
  - **Acceptance:** Zone context works, defaults to 'default' zone

- [x] **S3-T2: Implement CriticalZone component**
  - Create `sigil-mark/layouts/CriticalZone.tsx`
  - Accept `financial` prop (default: true)
  - Provide zone context: `{ type: 'critical', financial, timeAuthority: 'server-tick' }`
  - **Acceptance:** CriticalZone provides zone context

- [x] **S3-T3: Implement CriticalZone.Content subcomponent**
  - Create Content slot for zone body
  - Apply appropriate styling
  - **Acceptance:** Content renders with proper spacing

- [x] **S3-T4: Implement CriticalZone.Actions subcomponent**
  - Create Actions slot for buttons
  - Enforce 32px gap between actions
  - Accept `maxActions` prop (default: 3)
  - Warn if children exceed maxActions
  - **Acceptance:** Actions have 32px gap, warns on overflow

- [x] **S3-T5: Implement critical button auto-sorting**
  - Detect critical vs non-critical children
  - Auto-sort critical buttons to last position
  - Use React.Children.toArray + sort
  - **Acceptance:** Critical buttons always appear last

- [x] **S3-T6: Create CriticalZone tests**
  - Test zone context is provided
  - Test 32px gap enforcement
  - Test action auto-sorting
  - Test maxActions warning
  - **Acceptance:** All CriticalZone tests pass

### Deliverables
- `sigil-mark/layouts/context.ts`
- `sigil-mark/layouts/CriticalZone.tsx`
- `sigil-mark/__tests__/CriticalZone.test.tsx`

---

## Sprint 4: Layout Layer Completion

**Goal:** Implement MachineryLayout and GlassLayout

### Tasks

- [x] **S4-T1: Implement MachineryLayout component**
  - Create `sigil-mark/layouts/MachineryLayout.tsx`
  - Provide zone context: `{ type: 'admin', timeAuthority: 'optimistic' }`
  - Accept `stateKey`, `onAction`, `onDelete` props
  - **Acceptance:** MachineryLayout provides admin zone context

- [x] **S4-T2: Implement MachineryLayout keyboard navigation**
  - Arrow keys: Navigate items
  - j/k: Vim-style navigation
  - Enter/Space: Activate current item
  - Delete/Backspace: Delete current item
  - Escape: Deselect
  - Home/End: Jump to first/last
  - **Acceptance:** All keyboard shortcuts work

- [x] **S4-T3: Implement MachineryLayout subcomponents**
  - `MachineryLayout.List` - container for items
  - `MachineryLayout.Item` - single item with id
  - `MachineryLayout.Search` - filter input
  - `MachineryLayout.Empty` - empty state
  - **Acceptance:** All subcomponents work together

- [x] **S4-T4: Implement GlassLayout component**
  - Create `sigil-mark/layouts/GlassLayout.tsx`
  - Provide zone context: `{ type: 'marketing', timeAuthority: 'optimistic' }`
  - Accept `variant` prop ('card' | 'hero' | 'feature')
  - **Acceptance:** GlassLayout provides marketing zone context

- [x] **S4-T5: Implement GlassLayout hover physics**
  - Hover: `scale(1.02)`, `translateY(-4px)`, shadow increase
  - Transition: 200ms ease-out
  - Backdrop blur: `backdrop-blur-lg`
  - **Acceptance:** Hover physics feel polished

- [x] **S4-T6: Implement GlassLayout subcomponents**
  - `GlassLayout.Image` - image slot
  - `GlassLayout.Content` - body slot
  - `GlassLayout.Title` - title slot
  - `GlassLayout.Description` - description slot
  - `GlassLayout.Actions` - actions slot
  - **Acceptance:** All subcomponents work together

- [x] **S4-T7: Create layouts barrel export**
  - Create `sigil-mark/layouts/index.ts`
  - Export all layouts and context utilities
  - **Acceptance:** `import { CriticalZone, MachineryLayout, GlassLayout } from './layouts'` works

- [x] **S4-T8: Create MachineryLayout and GlassLayout tests**
  - Test zone context provided
  - Test keyboard navigation (Machinery)
  - Test hover physics (Glass)
  - **Acceptance:** All layout tests pass

### Deliverables
- `sigil-mark/layouts/MachineryLayout.tsx`
- `sigil-mark/layouts/GlassLayout.tsx`
- `sigil-mark/layouts/index.ts`
- `sigil-mark/__tests__/MachineryLayout.test.tsx`
- `sigil-mark/__tests__/GlassLayout.test.tsx`

---

## Sprint 5: Lens Layer Foundation

**Goal:** Implement lens interface, useLens hook, and LensProvider

### Tasks

- [x] **S5-T1: Create Lens interface**
  - Create `sigil-mark/lenses/types.ts`
  - Define `Lens` interface with name, classification, components
  - Define `CriticalButtonProps` interface
  - Define `GlassButtonProps` interface
  - Define `MachineryItemProps` interface
  - **Acceptance:** All lens types defined

- [x] **S5-T2: Create LensProvider component**
  - Create `sigil-mark/lenses/LensProvider.tsx`
  - Store user's lens preference in context
  - Provide setter for lens selection
  - **Acceptance:** LensProvider stores user preference

- [x] **S5-T3: Create useLens hook**
  - Create `sigil-mark/lenses/useLens.ts`
  - Read zone context from nearest layout
  - Force `StrictLens` in critical+financial zones
  - Return user preference otherwise
  - Default to `DefaultLens` if no preference
  - **Acceptance:** Hook returns correct lens based on zone

- [x] **S5-T4: Implement lens enforcement logging**
  - Log warning in development when forcing StrictLens
  - Include zone type and reason in warning
  - **Acceptance:** Dev console shows lens enforcement warnings

- [x] **S5-T5: Create useLens tests**
  - Test StrictLens forced in critical+financial zone
  - Test user preference used in admin zone
  - Test DefaultLens used when no preference
  - **Acceptance:** All useLens tests pass

### Deliverables
- `sigil-mark/lenses/types.ts`
- `sigil-mark/lenses/LensProvider.tsx`
- `sigil-mark/lenses/useLens.ts`
- `sigil-mark/__tests__/useLens.test.tsx`

---

## Sprint 6: Built-in Lenses

**Goal:** Implement DefaultLens, StrictLens, and A11yLens

### Tasks

- [x] **S6-T1: Implement DefaultLens.CriticalButton**
  - Create `sigil-mark/lenses/default/CriticalButton.tsx`
  - 44px min-height
  - Status-based styling (idle, confirming, pending, confirmed, failed)
  - Tap scale animation
  - **Acceptance:** Button renders all states correctly

- [x] **S6-T2: Implement DefaultLens.GlassButton**
  - Create `sigil-mark/lenses/default/GlassButton.tsx`
  - 44px min-height
  - Variant support (primary, secondary, ghost)
  - Hover/active states
  - **Acceptance:** Button variants render correctly

- [x] **S6-T3: Implement DefaultLens.MachineryItem**
  - Create `sigil-mark/lenses/default/MachineryItem.tsx`
  - Hover highlighting
  - Active state styling
  - **Acceptance:** Item renders with proper states

- [x] **S6-T4: Create DefaultLens barrel export**
  - Create `sigil-mark/lenses/default/index.tsx`
  - Export `DefaultLens` object with all components
  - Classification: 'cosmetic'
  - **Acceptance:** DefaultLens exports correctly

- [x] **S6-T5: Implement StrictLens components**
  - Create `sigil-mark/lenses/strict/` directory
  - CriticalButton: 48px min-height, high contrast, no animations
  - GlassButton: 48px min-height, high contrast
  - MachineryItem: Clear active state, border indicator
  - **Acceptance:** StrictLens is visually distinct, no frills

- [x] **S6-T6: Implement A11yLens components**
  - Create `sigil-mark/lenses/a11y/` directory
  - CriticalButton: 56px min-height, extra high contrast
  - GlassButton: 56px min-height
  - MachineryItem: Large touch targets
  - **Acceptance:** A11yLens meets WCAG AAA contrast

- [x] **S6-T7: Create lenses barrel export**
  - Create `sigil-mark/lenses/index.ts`
  - Export `useLens`, `LensProvider`, `DefaultLens`, `StrictLens`, `A11yLens`
  - Export all types
  - **Acceptance:** All lenses accessible from './lenses'

### Deliverables
- `sigil-mark/lenses/default/` (3 components + index)
- `sigil-mark/lenses/strict/` (3 components + index)
- `sigil-mark/lenses/a11y/` (3 components + index)
- `sigil-mark/lenses/index.ts`

---

## Sprint 7: Integration & Migration

**Goal:** Create public API and deprecate v1.2.5

### Tasks

- [x] **S7-T1: Create package entry point**
  - Create `sigil-mark/index.ts`
  - Export all core hooks and types
  - Export all layouts and context
  - Export all lenses
  - **Acceptance:** Single import point works

- [x] **S7-T2: Create v1.2.5 compatibility warnings**
  - Add deprecation warnings to old APIs (if any remain)
  - Log migration guidance in development
  - **Acceptance:** Old API usage shows deprecation warning

- [x] **S7-T3: Update .sigilrc.yaml for v2.0**
  - Update version to "2.0.0"
  - Update zone definitions for layout-based zones
  - Update lens configuration
  - Remove deprecated fields
  - **Acceptance:** Config matches SDD §5.1

- [x] **S7-T4: Create zone resolver for AI/Claude**
  - Create `sigil-mark/core/zone-resolver.ts`
  - Parse .sigilrc.yaml zones
  - Match file path against glob patterns
  - Return zone config
  - **Acceptance:** Claude can resolve zone from file path

- [x] **S7-T5: Update CLAUDE.md for v2.0**
  - Document 3-layer architecture
  - Document "Layouts ARE Zones" philosophy
  - Include usage examples for all patterns
  - Remove v1.2.5 references
  - **Acceptance:** CLAUDE.md matches v2.0 architecture

- [x] **S7-T6: Update skills for v2.0**
  - Update `.claude/skills/sigil-core/SKILL.md`
  - Update `.claude/skills/crafting-components/SKILL.md`
  - Remove deprecated v1.2.5 patterns
  - **Acceptance:** Skills use v2.0 patterns

### Deliverables
- `sigil-mark/index.ts`
- Updated `.sigilrc.yaml`
- `sigil-mark/core/zone-resolver.ts`
- Updated `CLAUDE.md`
- Updated skills

---

## Sprint 8: Testing & Documentation

**Goal:** Complete test coverage and documentation

### Tasks

- [x] **S8-T1: Create integration tests**
  - Test payment flow (CriticalZone + useCriticalAction + StrictLens)
  - Test admin list (MachineryLayout + keyboard navigation)
  - Test marketing card (GlassLayout + hover physics)
  - **Acceptance:** All integration tests pass

- [x] **S8-T2: Create end-to-end usage examples**
  - Create `sigil-mark/__examples__/PaymentForm.tsx`
  - Create `sigil-mark/__examples__/InvoiceList.tsx`
  - Create `sigil-mark/__examples__/ProductCard.tsx`
  - **Acceptance:** Examples work and demonstrate v2.0 patterns

- [x] **S8-T3: Update README.md for v2.0**
  - Quick start guide
  - 3-layer architecture explanation
  - API reference
  - Migration guide from v1.2.5
  - **Acceptance:** README matches v2.0 architecture

- [x] **S8-T4: Create migration guide**
  - Document v1.2.5 → v2.0 patterns
  - Provide before/after code examples
  - List deprecated APIs
  - **Acceptance:** Clear migration path documented

- [x] **S8-T5: Final validation**
  - Verify all tests pass
  - Verify all exports work
  - Verify zone resolution works
  - Verify lens enforcement works
  - Test full payment flow end-to-end
  - **Acceptance:** All PRD §7 success metrics pass

### Deliverables
- Complete test suite
- Usage examples
- Updated README.md
- Migration guide
- Final validation report

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Proprioception complexity | Start with simple predictions, add reconciliation later |
| Keyboard navigation edge cases | Use established patterns from Radix/Headless UI |
| Lens enforcement too strict | Force only in critical+financial, allow override elsewhere |
| Migration breaks existing code | Clear deprecation warnings, migration guide |

---

## Success Criteria

From PRD §7:

- [ ] `useCriticalAction` works with all 3 time authorities
- [ ] Proprioception shows ghost position, reconciles correctly
- [ ] `CriticalZone` provides zone context + enforces layout physics
- [ ] `useLens` forces `StrictLens` in critical+financial zones
- [ ] Keyboard navigation works in `MachineryLayout`
- [ ] Hover physics work in `GlassLayout`
- [ ] All 3 built-in lenses render correctly
- [ ] Public API exports cleanly from single entry point
- [ ] All tests pass
- [ ] CLAUDE.md accurately describes v2.0 architecture

---

## Version History

| Sprint | Status | Completed |
|--------|--------|-----------|
| Sprint 1 | COMPLETED | 2026-01-05 |
| Sprint 2 | COMPLETED | 2026-01-05 |
| Sprint 3 | COMPLETED | 2026-01-05 |
| Sprint 4 | COMPLETED | 2026-01-05 |
| Sprint 5 | COMPLETED | 2026-01-05 |
| Sprint 6 | COMPLETED | 2026-01-05 |
| Sprint 7 | COMPLETED | 2026-01-05 |
| Sprint 8 | COMPLETED | 2026-01-05 |

---

## Next Step

```
/implement sprint-1
```
