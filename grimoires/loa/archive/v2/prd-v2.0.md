# Product Requirements Document: Sigil v2.0

**Version**: 2.0.0
**Status**: Draft
**Date**: 2026-01-05
**Evolution**: Additive iteration from v1.2.5 Zone Provider architecture

---

## Executive Summary

Sigil v2.0 evolves the existing v1.2.5 Zone Provider architecture into a **Reality Engine** — a comprehensive framework that separates Truth (Core physics) from Experience (Lenses). This additive evolution maintains backward compatibility with the mount-script distribution model while introducing six new architectural layers.

> *"Physics must be structural (DOM), not theoretical (AST). Multiple realities (Lenses) on a single truth (Physics)."*

**Sources**: README.md:9, ARCHITECTURE.md:17-18, User interview (Evolution: Additive)

---

## 1. Problem Statement

### 1.1 Current State (v1.2.5)

Sigil v1.2.5 provides Zone Provider + Physics Tokens:
- `SigilZone` context provides physics to components
- Three materials (decisive, machinery, glass) with spring/tap values
- One Button component that inherits physics from context
- `useServerTick` for server-authoritative actions

### 1.2 Limitations Addressed by v2.0

| Limitation | v2.0 Solution |
|------------|---------------|
| No time authority beyond server-tick | Temporal Governor (optimistic, server-tick, hybrid) |
| No prediction/reconciliation | Proprioception (self vs world) |
| All UI looks the same | Lens system (interchangeable UIs on same physics) |
| Physics = lint rules | Layout Primitives (DOM-enforced physics) |
| No accessibility validation | Ergonomic Profiler (hitbox, contrast, focus) |
| No lens classification | Integrity Flags (cosmetic, utility, gameplay) |

**Sources**: ARCHITECTURE.md:196-223 (Evolution rounds), sigil-v1.2.5 codebase

---

## 2. Product Vision

### 2.1 Vision Statement

Sigil v2.0 is a Reality Engine for product development that:
1. **Enforces physics** (data truth, time truth, input truth)
2. **Allows multiple experiences** (interchangeable lenses)
3. **Prevents cheating** (StrictLens forced in critical zones)
4. **Ensures accessibility** (ergonomic validation)

### 2.2 Key Insight

> "Truth (Core) and Experience (Lens) must be decoupled. But the Lens cannot distort the Truth so much that it breaks the User's hand."

**Sources**: ARCHITECTURE.md:17-18, CLAUDE.md:9-14

### 2.3 Reference Products

| Product | Concept Borrowed |
|---------|------------------|
| OSRS | Client prediction, 117HD lens architecture |
| Linear | Sync engine, optimistic updates |
| Figma | Multiplayer reconciliation |
| Phantom | Transaction simulation, server-tick truth |

**Sources**: ARCHITECTURE.md:436-446

---

## 3. Target Users

### 3.1 Primary Users (Equal Priority)

**AI Agents (Claude Code)**
- Uses Sigil to make consistent design decisions
- Reads zone configuration to determine time authority
- Auto-selects appropriate lens for zone
- Follows CLAUDE.md instructions

**Product Engineers**
- Builds products using Sigil components
- Uses core hooks for state management
- Wraps UI in layout primitives
- May create custom lenses

**Sources**: User interview (Target User: Both equally), CLAUDE.md:1-302

### 3.2 User Stories

| As a... | I want to... | So that... |
|---------|--------------|------------|
| AI Agent | Know the zone from file path | I use correct time authority and lens |
| AI Agent | Have layout primitives enforce spacing | I don't need lint rules to validate |
| Engineer | Use optimistic updates for Linear-style UX | Users see instant feedback |
| Engineer | Have server-tick for financial actions | Users don't see false state |
| User | Have consistent accessibility | I can use the product regardless of lens |

---

## 4. Functional Requirements

### 4.1 Core Layer (Physics Engines)

**FR-CORE-001**: `useCriticalAction` hook
- Emits state stream: status, timeAuthority, prediction, risk, error, data
- Supports three time authorities: optimistic, server-tick, hybrid
- Handles optimistic updates and rollback
- Supports proprioceptive predictions

**FR-CORE-002**: State Stream Interface
```typescript
interface CriticalActionState<TData> {
  status: 'idle' | 'confirming' | 'pending' | 'confirmed' | 'failed';
  timeAuthority: 'optimistic' | 'server-tick' | 'hybrid';
  selfPrediction: SelfPredictionState;
  worldTruth: WorldTruthState;
  risk: 'low' | 'medium' | 'high';
  progress: number | null;
  error: Error | null;
  data: TData | null;
}
```

**Sources**: src/core/useCriticalAction.ts:50-77, src/types/index.ts:56-65

### 4.2 Temporal Governor

**FR-TIME-001**: Three time authorities

| Authority | Client Update | Reconciliation | Use Case |
|-----------|---------------|----------------|----------|
| `optimistic` | Instant | Silent rollback | Linear (issues) |
| `server-tick` | Wait for server | N/A | Banking (balance) |
| `hybrid` | Instant + sync indicator | Visible | Figma (multiplayer) |

**Sources**: ARCHITECTURE.md:124-132, .sigilrc.yaml:163-182

### 4.3 Proprioception Layer

**FR-PROP-001**: Self predictions (legal lies)
- `rotation: { instant: true }` — Face target immediately
- `animation: { optimistic: true }` — Start animation immediately
- `position: { render: 'ghost', reconcile: 'lerp', maxDrift: 600 }` — Show predicted position

**FR-PROP-002**: World truth (server-only)
- `damage: 'server-only'`
- `balance: 'server-only'`
- `otherEntities: 'server-only'`

**Sources**: src/types/index.ts:23-36, ARCHITECTURE.md:134-158, .sigilrc.yaml:120-137

### 4.4 Ergonomic Profiler

**FR-ERGO-001**: Lens validation requirements

| Check | Threshold | Action |
|-------|-----------|--------|
| Touch target | ≥ 44px | Lens rejected |
| Center drift | ≤ 2px | Lens rejected |
| Contrast (AA) | ≥ 4.5:1 | Lens rejected |
| Contrast (Critical) | ≥ 7:1 | Lens rejected |
| Focus indicator | Required | Lens rejected |

**FR-ERGO-002**: WCAG contrast calculation
- Relative luminance per WCAG 2.1
- Contrast ratio: `(L1 + 0.05) / (L2 + 0.05)`

**Sources**: src/profiler/ergonomic.ts:17-33, ARCHITECTURE.md:162-170

### 4.5 Integrity Flags

**FR-INT-001**: Lens classifications

| Classification | Permissions | Restrictions |
|----------------|-------------|--------------|
| **Cosmetic** | Colors, fonts, animations | None |
| **Utility** | + Overlays, highlights | Warning in critical |
| **Gameplay** | + Input hints | Blocked in critical/financial |

**FR-INT-002**: Zone enforcement
- Critical zones force StrictLens regardless of user preference
- Financial flows block gameplay lenses
- Competitive mode blocks gameplay lenses

**Sources**: src/integrity/index.ts:70-76, .sigilrc.yaml:30-77

### 4.6 Layout Primitives

**FR-LAYOUT-001**: CriticalZone
- 32px gap between actions (CSS, not lint)
- Critical buttons auto-sorted to last
- Max 3 actions per zone
- Context provides `financial` flag

**FR-LAYOUT-002**: MachineryLayout
- Keyboard navigation baked in
- `role="option"` and `aria-selected` for a11y

**FR-LAYOUT-003**: GlassLayout
- Hover physics baked in
- Marketing/card use cases

**Sources**: src/layouts/CriticalZone.tsx:33-66, ARCHITECTURE.md:184-193

### 4.7 Lens System

**FR-LENS-001**: Built-in lenses
- `DefaultLens` — Standard 44px targets, animations
- `StrictLens` — Vanilla UI, forced in critical zones
- `A11yLens` — High contrast, 56px targets, clear announcements

**FR-LENS-002**: `useLens` hook
- Returns appropriate lens for zone
- Forces StrictLens in critical/financial zones
- Logs warnings in development mode

**FR-LENS-003**: Lens registration
- Lenses must pass ergonomic profiler
- Rejected lenses throw `LensRejection` error

**Sources**: src/lenses/index.ts:59-101, src/lenses/default/index.tsx:203-209

---

## 5. Technical Requirements

### 5.1 Technology Stack

| Component | Technology |
|-----------|------------|
| Runtime | React 18+ |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | React Context + useState |
| Distribution | Mount script (sigil-mark/) |

**Sources**: package.json (from zip), User interview (Distribution: Mount script)

### 5.2 Performance Requirements

| Metric | Target |
|--------|--------|
| State stream latency | < 16ms (frame time) |
| Lens registration | < 100ms |
| Ergonomic validation | < 50ms per component |

### 5.3 Accessibility Requirements

| Requirement | Standard |
|-------------|----------|
| Touch targets | ≥ 44px (WCAG 2.5.5) |
| Contrast | ≥ 4.5:1 AA, ≥ 7:1 AAA for critical |
| Focus visibility | Required (WCAG 2.4.7) |
| ARIA roles | Semantic layout primitives |

**Sources**: .sigilrc.yaml:10-28, src/profiler/ergonomic.ts:17-33

---

## 6. Scope & Prioritization

### 6.1 MVP Scope (Full v2.0)

Per user interview, MVP includes all v2.0 features:

**Must Have (P0)**
- Core Layer: `useCriticalAction` with all time authorities
- Proprioception: Self predictions + world truth
- Ergonomic Profiler: Hitbox, contrast, focus validation
- Integrity Flags: Lens classification + zone enforcement
- Layout Primitives: CriticalZone, MachineryLayout, GlassLayout
- Built-in Lenses: Default, Strict, A11y

**Sources**: User interview (MVP Scope: Full v2.0)

### 6.2 Migration from v1.2.5

Since this is additive evolution:
- `SigilZone` continues to work (wrapped by new layouts)
- `useSigilPhysics` continues to work
- `Button` component enhanced with lens system
- `useServerTick` → `useCriticalAction` with `timeAuthority: 'server-tick'`

**Sources**: User interview (Evolution: Additive)

### 6.3 Out of Scope

- Multi-player sync engine (Figma-style CRDT)
- Custom lens marketplace
- Server-side rendering support
- Native mobile (React Native)

---

## 7. Success Metrics

| Metric | Target | Source |
|--------|--------|--------|
| Lens rejections | > 0 (profiler working) | ARCHITECTURE.md:427 |
| StrictLens in critical | 100% | ARCHITECTURE.md:428 |
| Ergonomic compliance | 100% | ARCHITECTURE.md:429 |
| Proprioception violations | 0 | ARCHITECTURE.md:430 |
| Core → Lens decoupling | 100% | ARCHITECTURE.md:431 |

---

## 8. Risks & Mitigations

### 8.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Ergonomic profiler too strict | Medium | Medium | Allow zone-level overrides |
| Proprioception drift causes jank | Medium | High | maxDrift timeout, snap fallback |
| Lens registration perf | Low | Medium | Lazy validation, cache results |

### 8.2 Adoption Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Learning curve for dual audience | High | Medium | CLAUDE.md as authoritative guide |
| Breaking changes from v1.2.5 | Low | High | Additive evolution, not replacement |
| Over-engineering for simple apps | Medium | Low | Layout primitives are optional wrappers |

---

## 9. Architecture Overview

### 9.1 Six-Layer Stack

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

**Sources**: ARCHITECTURE.md:35-97

### 9.2 File Structure

```
sigil-mark/
├── core/                    # Physics engines
│   ├── useCriticalAction.ts
│   ├── useOptimisticAction.ts  # Convenience wrapper
│   ├── useLocalAction.ts       # Local-first wrapper
│   ├── proprioception.ts       # Self vs World
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
│   └── index.ts
│
├── layouts/                 # Structural physics
│   ├── CriticalZone.tsx
│   ├── MachineryLayout.tsx
│   ├── GlassLayout.tsx
│   └── index.ts
│
├── lenses/                  # UI renderers
│   ├── default/
│   ├── strict/
│   ├── a11y/
│   ├── registry.ts
│   └── index.ts
│
├── types/                   # Shared types
│   └── index.ts
│
└── index.ts                 # Public API
```

**Sources**: ARCHITECTURE.md:226-264, src/ directory structure

---

## 10. Evolution History

This architecture evolved through 10 rounds of Staff Engineer review:

| Round | Problem | Fix |
|-------|---------|-----|
| 1 | Bureaucracy (Council, Codex) | → Workshop |
| 2 | Museum rots (static docs) | → Live code tags |
| 3 | Cargo cult (copies tech debt) | → Pure primitives |
| 4 | Ban without alternative | → Ship engine hooks |
| 5 | Hollow shell (no data binding) | → Archetypes |
| 6 | Clone-and-Drift | → Composition |
| 7 | Silver = sanctioned debt | → Atomic Graduation |
| 8 | Data truth, no time truth | → Temporal Governor |
| 9 | Static analysis bluff | → Layout Primitives |
| **10** | Hitbox fallacy | → **Ergonomic Profiler** |
| **10** | Cheat client risk | → **Integrity Flags** |
| **10** | No proprioception | → **Legalize the Lie** |

**Sources**: ARCHITECTURE.md:196-223

---

## 11. Next Steps

1. `/architect` — Create Software Design Document
2. `/sprint-plan` — Break down into implementation sprints
3. `/implement sprint-1` — Begin implementation

---

## Appendix: Source Tracing

| Section | Sources |
|---------|---------|
| Executive Summary | README.md:9, ARCHITECTURE.md:17-18, User interview |
| Problem Statement | ARCHITECTURE.md:196-223, v1.2.5 codebase |
| Vision | ARCHITECTURE.md:17-18, CLAUDE.md:9-14 |
| Reference Products | ARCHITECTURE.md:436-446 |
| Target Users | User interview, CLAUDE.md:1-302 |
| Core Layer | src/core/useCriticalAction.ts:50-77, src/types/index.ts:56-65 |
| Temporal Governor | ARCHITECTURE.md:124-132, .sigilrc.yaml:163-182 |
| Proprioception | src/types/index.ts:23-36, ARCHITECTURE.md:134-158 |
| Ergonomic Profiler | src/profiler/ergonomic.ts:17-33, ARCHITECTURE.md:162-170 |
| Integrity Flags | src/integrity/index.ts:70-76, .sigilrc.yaml:30-77 |
| Layout Primitives | src/layouts/CriticalZone.tsx:33-66, ARCHITECTURE.md:184-193 |
| Lens System | src/lenses/index.ts:59-101, src/lenses/default/index.tsx:203-209 |
| Tech Stack | package.json, User interview |
| Accessibility | .sigilrc.yaml:10-28, src/profiler/ergonomic.ts:17-33 |
| Scope | User interview (MVP: Full v2.0, Evolution: Additive) |
| Success Metrics | ARCHITECTURE.md:427-431 |
| Architecture Diagram | ARCHITECTURE.md:35-97 |
| File Structure | ARCHITECTURE.md:226-264 |
| Evolution History | ARCHITECTURE.md:196-223 |

---

*PRD generated from sigil-v2.0.zip context*
*Context files: README.md, ARCHITECTURE.md, CLAUDE.md, .sigilrc.yaml, src/**
