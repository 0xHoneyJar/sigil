# Software Design Document: Sigil v0.4 — Soul Engine

**Version:** 1.0
**Date:** 2026-01-02
**Author:** Software Architect Agent
**Status:** Draft
**PRD Reference:** Sigil v0.4 PRD v2.0
**Supersedes:** Sigil v3 SDD (Constitutional Design Framework)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Component Design](#component-design)
5. [Data Architecture](#data-architecture)
6. [API Design](#api-design)
7. [Claude Integration](#claude-integration)
8. [Security Architecture](#security-architecture)
9. [Deployment Architecture](#deployment-architecture)
10. [Development Workflow](#development-workflow)
11. [Technical Risks & Mitigation](#technical-risks--mitigation)
12. [Future Considerations](#future-considerations)
13. [Appendix](#appendix)

---

## Executive Summary

### Purpose

This Software Design Document defines the technical architecture for Sigil v0.4 Soul Engine — a design context framework that provides Material physics, Interaction routing, and Tension controls for AI-assisted product development.

**Key Evolution:** v0.4 introduces a **runtime layer** (React hooks, CSS variables) that didn't exist in v3. This is a fundamental shift from pure configuration/skills to an actual software package.

### Architectural Decisions (User-Confirmed)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Workbench Hosting** | Per-repo Vite | Lighter than NextJS, faster dev, smaller bundle |
| **State Persistence** | SQLite (via sql.js) | Fast real-time state, version-controllable via Git |
| **Claude Integration** | CLAUDE.md + corrections file | Practical for MVP, no external dependencies |
| **Package Structure** | Single + subpath exports | Best of both: one install, granular imports |

### Key Technical Characteristics

- **Runtime**: React hooks + CSS variables (60fps tension updates)
- **Workbench**: Vite-powered SPA bootstrapped per repo
- **State**: SQLite database committed to Git for version control
- **Distribution**: npm package `@sigil/soul-engine` with subpath exports
- **AI Context**: CLAUDE.md injection + `.sigil/corrections.yaml` local learning

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SIGIL SOUL ENGINE v0.4                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  WORKBENCH LAYER (Vite SPA — Per-Repo)                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │ Artifact    │  │ Tension     │  │ Component   │  │ Sandbox    │  │   │
│  │  │ Preview     │  │ Controls    │  │ Browser     │  │ Mode       │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              │ React Context                                 │
│                              ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  SOUL LAYER (npm: @sigil/soul-engine)                               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │ Material    │  │ Tension     │  │ Interaction │  │ Soul       │  │   │
│  │  │ Core        │  │ System      │  │ Router      │  │ Binder     │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              │ React Hooks                                   │
│                              ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  RUNTIME LAYER (React Hooks + CSS Variables)                        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │ useTensions │  │ useMaterial │  │ useServerTick│ │ useLocalFirst│ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              │ SQLite (sql.js)                               │
│                              ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  PERSISTENCE LAYER (Git-Tracked)                                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │   │
│  │  │ .sigilrc.yaml│ │ sigil.db    │  │ corrections │                  │   │
│  │  │ (config)    │  │ (state)     │  │ .yaml       │                  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Responsibility | Key Components |
|-------|----------------|----------------|
| **Workbench** | Visual preview, tension control UI, sandbox | Vite SPA |
| **Soul** | Material physics, sync routing, context injection | npm package |
| **Runtime** | React hooks, CSS variable management | React context |
| **Persistence** | Config, state, corrections | SQLite + YAML |

### Data Flow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Developer      │────▶│   Workbench      │────▶│   Live Preview   │
│   (adjusts       │     │   (Vite SPA)     │     │   (component)    │
│   tensions)      │     │                  │     │                  │
└──────────────────┘     └────────┬─────────┘     └──────────────────┘
                                  │
                                  │ TensionContext.setTension()
                                  ▼
                         ┌──────────────────┐
                         │   Tension        │
                         │   Provider       │
                         │   (React)        │
                         └────────┬─────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
           ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
           │ CSS Variables│ │ SQLite Write │ │ Component    │
           │ (real-time)  │ │ (persist)    │ │ Re-render    │
           └──────────────┘ └──────────────┘ └──────────────┘
```

---

## Technology Stack

### Core Technologies

| Category | Technology | Version | Justification |
|----------|------------|---------|---------------|
| **Runtime** | React | 18+ | PRD requirement, hooks-based architecture |
| **Workbench** | Vite | 5+ | User choice: lighter than NextJS, faster HMR |
| **Styling** | Tailwind CSS | 3+ | PRD stack requirement |
| **Components** | shadcn/ui | Latest | PRD stack requirement, customizable primitives |
| **State DB** | sql.js | 1.8+ | User choice: SQLite in-browser, Git-committable |
| **Build** | TypeScript | 5+ | Type safety for API contracts |
| **Package** | pnpm | 8+ | Monorepo support, fast installs |

### Workbench Stack

| Technology | Purpose |
|------------|---------|
| Vite | Dev server, bundler, HMR |
| React Router | SPA navigation |
| Tailwind | Utility-first styling |
| shadcn/ui | Component primitives |
| sql.js | SQLite persistence |

### Package Dependencies

```json
{
  "name": "@sigil/soul-engine",
  "version": "0.4.0",
  "exports": {
    ".": "./dist/index.js",
    "./material": "./dist/material/index.js",
    "./sync": "./dist/sync/index.js",
    "./hooks": "./dist/hooks/index.js",
    "./workbench": "./dist/workbench/index.js"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "dependencies": {
    "sql.js": "^1.8.0"
  }
}
```

---

## Component Design

### 1. Material Core (`@sigil/soul-engine/material`)

**Purpose:** Define UI physics with three distinct materials.

#### Type Definitions

```typescript
// material/types.ts
export type MaterialType = 'glass' | 'clay' | 'machinery';

export interface MaterialPhysics {
  name: MaterialType;
  description: string;

  // CSS generation
  getSurfaceCSS(): CSSProperties;
  getShadowCSS(): string;
  getLightingCSS(): string;

  // Animation configs
  getEntranceAnimation(): AnimationConfig;
  getHoverEffect(): CSSProperties;
  getActiveEffect(): CSSProperties;

  // Constraints
  forbidden: string[];
}

export interface MaterialContext {
  material: MaterialType;
  physics: MaterialPhysics;
  setMaterial: (material: MaterialType) => void;
  zone: string | null;
}
```

#### Implementation Structure

```
material/
├── index.ts              # Public exports
├── types.ts              # Type definitions
├── MaterialCore.ts       # Physics definitions
├── MaterialProvider.tsx  # React context provider
├── MaterialComponents.tsx# Pre-built components
├── useMaterial.ts        # Hook for accessing material
└── detection.ts          # Zone-to-material mapping
```

#### Material Physics Matrix

| Material | Border Radius | Shadow | Transition | Spring |
|----------|--------------|--------|------------|--------|
| Glass | 12px | 0 0 0 1px rgba(0,0,0,0.05) | 200ms ease-out | None |
| Clay | 16px | Multi-layer soft | 300ms spring | 1.56 tension |
| Machinery | 6px | None | 0ms | None |

#### Usage Example

```tsx
import { MaterialProvider, MaterialButton, useMaterial } from '@sigil/soul-engine/material';

function App() {
  return (
    <MaterialProvider defaultMaterial="clay">
      <CheckoutButton />
    </MaterialProvider>
  );
}

function CheckoutButton() {
  const { physics } = useMaterial();

  return (
    <MaterialButton style={physics.getSurfaceCSS()}>
      Complete Purchase
    </MaterialButton>
  );
}
```

---

### 2. Tension System (`@sigil/soul-engine/hooks`)

**Purpose:** Real-time adjustable feel parameters affecting CSS variables.

#### Type Definitions

```typescript
// hooks/types.ts
export interface TensionState {
  playfulness: number;  // 0-100: Serious ↔ Playful
  weight: number;       // 0-100: Light ↔ Heavy
  density: number;      // 0-100: Spacious ↔ Dense
  speed: number;        // 0-100: Deliberate ↔ Instant
}

export interface TensionContextValue {
  tensions: TensionState;
  setTension: (key: keyof TensionState, value: number) => void;
  setTensions: (tensions: Partial<TensionState>) => void;
  resetTensions: () => void;
  applyPreset: (presetName: string) => void;
  cssVariables: Record<string, string>;
}
```

#### CSS Variable Mapping

```typescript
// hooks/tensionsToCSSVariables.ts
export function tensionsToCSSVariables(tensions: TensionState): Record<string, string> {
  return {
    // Playfulness (affects curves, color, animation)
    '--sigil-border-radius': `${4 + tensions.playfulness * 0.12}px`,
    '--sigil-color-saturation': `${80 + tensions.playfulness * 0.2}%`,
    '--sigil-animation-bounce': tensions.playfulness > 70 ? '1.1' : '1.0',

    // Weight (affects shadows, fonts, padding)
    '--sigil-shadow-opacity': `${0.05 + tensions.weight * 0.001}`,
    '--sigil-font-weight': tensions.weight > 60 ? '600' : '400',
    '--sigil-padding-scale': `${0.8 + tensions.weight * 0.004}`,

    // Density (affects spacing)
    '--sigil-spacing-unit': `${8 - tensions.density * 0.02}px`,
    '--sigil-font-size-base': `${16 - tensions.density * 0.02}px`,
    '--sigil-gap': `${24 - tensions.density * 0.12}px`,

    // Speed (affects transitions)
    '--sigil-transition-duration': `${300 - tensions.speed * 2.8}ms`,
    '--sigil-animation-duration': `${400 - tensions.speed * 3.5}ms`,
  };
}
```

#### Preset Configurations

```typescript
// hooks/presets.ts
export const TENSION_PRESETS: Record<string, TensionState> = {
  linear: { playfulness: 20, weight: 30, density: 70, speed: 95 },
  airbnb: { playfulness: 50, weight: 60, density: 40, speed: 50 },
  nintendo: { playfulness: 80, weight: 50, density: 30, speed: 60 },
  osrs: { playfulness: 30, weight: 70, density: 60, speed: 40 },
};
```

---

### 3. Interaction Router (`@sigil/soul-engine/sync`)

**Purpose:** Map sync strategy to interaction intent.

#### Type Definitions

```typescript
// sync/types.ts
export type SyncStrategy = 'crdt' | 'lww' | 'server_tick' | 'none';

export interface SyncConfig {
  strategy: SyncStrategy;
  description: string;
  uiFeedback: {
    optimistic: boolean;
    showPresence: boolean;
    pendingIndicator: 'none' | 'subtle' | 'prominent';
    confirmationStyle: 'none' | 'toast' | 'inline' | 'material';
  };
  tickRateMs?: number;
}

export interface DeclarationRecord {
  dataPath: string;
  strategy: SyncStrategy;
  declaredBy: string;
  declaredAt: string;
  rationale: string;
}
```

#### Keyword Classification

```typescript
// sync/InteractionRouter.ts
const STRATEGY_SIGNALS: Record<SyncStrategy, string[]> = {
  server_tick: [
    'trade', 'transfer', 'buy', 'sell', 'attack', 'claim',
    'money', 'currency', 'balance', 'wallet', 'health', 'hp',
    'inventory', 'item', 'withdraw', 'deposit', 'payment',
    'transaction', 'combat', 'competitive'
  ],
  crdt: [
    'edit', 'type', 'write', 'comment', 'message', 'document',
    'text', 'draft', 'note', 'content', 'description', 'body',
    'collaborative', 'shared'
  ],
  lww: [
    'move', 'toggle', 'select', 'preference', 'status', 'position',
    'state', 'setting', 'config', 'option', 'choice', 'switch'
  ],
  none: [
    'modal', 'dropdown', 'hover', 'focus', 'ui', 'view',
    'tab', 'panel', 'sidebar'
  ],
};
```

#### Explicit Declaration Requirement

```typescript
// sync/InteractionRouter.ts
export class InteractionRouter {
  route(context: RouteContext): SyncConfig | { requiresDeclaration: true } {
    // 1. Check explicit declarations
    const explicit = this.declarations.get(context.dataPath);
    if (explicit) return this.getConfig(explicit.strategy);

    // 2. Try keyword classification
    const detected = this.classifyByKeywords(context.description);
    if (detected) return this.getConfig(detected);

    // 3. Unknown — require explicit declaration (PRD: "no guessing")
    return { requiresDeclaration: true };
  }

  declare(record: DeclarationRecord): void {
    this.declarations.set(record.dataPath, record);
    this.persistDeclaration(record); // SQLite
  }
}
```

---

### 4. Sync Hooks (`@sigil/soul-engine/hooks`)

**Purpose:** React hooks for each sync strategy.

#### Hook Implementations

```typescript
// hooks/useLocalFirst.ts
export function useLocalFirst<T>(
  key: string,
  initialValue: T,
  options?: { syncToServer?: boolean; debounceMs?: number }
): {
  value: T;
  update: (newValue: T) => void;
  isSyncing: boolean;
};

// hooks/useServerTick.ts
export function useServerTick<T>(
  key: string,
  initialValue: T,
  options?: { tickRateMs?: number }
): {
  value: T;
  update: (newValue: T) => Promise<void>;
  isPending: boolean;  // MUST be shown to user
  error: Error | null;
  lastConfirmedAt: Date | null;
};

// hooks/useCRDTText.ts
export function useCRDTText(
  documentId: string,
  initialContent?: string
): {
  content: string;
  insert: (index: number, text: string) => void;
  delete: (index: number, length: number) => void;
  presence: Presence[];
  isSyncing: boolean;
};
```

#### Server-Tick UI Contract

```typescript
// CRITICAL: Server-tick hook NEVER returns optimistic state
// UI MUST show pending indicator when isPending=true

function WithdrawButton({ balance, amount }) {
  const { update, isPending } = useServerTick('balance', balance);

  return (
    <button
      onClick={() => update(balance - amount)}
      disabled={isPending}
    >
      {isPending ? 'Processing...' : `Withdraw ${amount} GP`}
    </button>
  );
}
```

---

### 5. Soul Binder (`@sigil/soul-engine`)

**Purpose:** Context injection with local learning.

#### Injection Layer Structure

```typescript
// soulBinder/types.ts
export interface SoulContext {
  material: MaterialType;
  zone: string;
  tensions: TensionState;
  role?: string;
  corrections: Correction[];
}

export interface Correction {
  id: string;
  flaggedAt: string;
  issue: string;
  correction: string;
  appliesTo: string; // file glob or component name
}
```

#### CLAUDE.md Generation

```typescript
// soulBinder/generateClaudeContext.ts
export function generateClaudeContext(config: SigilConfig): string {
  return `
# Sigil Soul Engine Context

## Active Material: ${config.defaultMaterial}

### Material Physics
${getMaterialDescription(config.defaultMaterial)}

## Current Tensions
- Playfulness: ${config.tensions.playfulness}/100
- Weight: ${config.tensions.weight}/100
- Density: ${config.tensions.density}/100
- Speed: ${config.tensions.speed}/100

## Zones
${config.zones.map(z => `- ${z.name}: ${z.material} (${z.paths.join(', ')})`).join('\n')}

## Corrections (Local Learning)
${loadCorrections().map(c => `- ${c.issue}: ${c.correction}`).join('\n')}

## Rules
- Server-tick data MUST show pending state (never optimistic)
- Material physics are constraints, not suggestions
- Unknown sync patterns require explicit declaration
`;
}
```

---

### 6. Workbench App

**Purpose:** Vite-powered SPA for tension control and preview.

#### Directory Structure

```
sigil-workbench/
├── package.json
├── vite.config.ts
├── index.html
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Root component
│   ├── components/
│   │   ├── TensionControls.tsx
│   │   ├── ArtifactPreview.tsx
│   │   ├── ComponentBrowser.tsx
│   │   └── SandboxToggle.tsx
│   ├── hooks/
│   │   └── useWorkbenchState.ts
│   ├── lib/
│   │   └── db.ts             # sql.js wrapper
│   └── styles/
│       └── globals.css
└── public/
    └── sql-wasm.wasm         # sql.js WASM binary
```

#### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3333,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  optimizeDeps: {
    exclude: ['sql.js'], // WASM needs special handling
  },
});
```

#### Sandbox Mode

```typescript
// components/SandboxToggle.tsx
export function SandboxToggle() {
  const { isSandbox, toggleSandbox } = useWorkbenchState();

  return (
    <div className="flex items-center gap-2">
      <Switch checked={isSandbox} onCheckedChange={toggleSandbox} />
      <span>Sandbox Mode</span>
      {isSandbox && (
        <Badge variant="secondary">Changes won't persist</Badge>
      )}
    </div>
  );
}
```

---

## Data Architecture

### SQLite Schema

```sql
-- sigil.db (committed to Git)

-- Tension state
CREATE TABLE tensions (
  id INTEGER PRIMARY KEY,
  playfulness INTEGER NOT NULL DEFAULT 50,
  weight INTEGER NOT NULL DEFAULT 50,
  density INTEGER NOT NULL DEFAULT 50,
  speed INTEGER NOT NULL DEFAULT 50,
  updated_at TEXT NOT NULL
);

-- Sync declarations
CREATE TABLE sync_declarations (
  data_path TEXT PRIMARY KEY,
  strategy TEXT NOT NULL CHECK (strategy IN ('crdt', 'lww', 'server_tick', 'none')),
  declared_by TEXT NOT NULL,
  declared_at TEXT NOT NULL,
  rationale TEXT
);

-- Paper cuts
CREATE TABLE paper_cuts (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  file_path TEXT,
  line_number INTEGER,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  status TEXT CHECK (status IN ('open', 'fixed', 'wontfix')),
  created_at TEXT NOT NULL,
  fixed_at TEXT
);

-- Corrections (local learning)
CREATE TABLE corrections (
  id TEXT PRIMARY KEY,
  issue TEXT NOT NULL,
  correction TEXT NOT NULL,
  applies_to TEXT,
  flagged_at TEXT NOT NULL,
  applied_count INTEGER DEFAULT 0
);

-- Founder mode audit log
CREATE TABLE founder_audit (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  second_taste_owner TEXT NOT NULL,
  rationale TEXT,
  timestamp TEXT NOT NULL
);
```

### File-Based Configuration

#### `.sigilrc.yaml`

```yaml
version: "0.4"

# Material defaults by zone
zones:
  critical:
    material: "clay"
    sync: "server_tick"
    paths:
      - "src/features/checkout/**"
      - "src/features/claim/**"

  transactional:
    material: "machinery"
    sync: "lww"
    paths:
      - "src/features/dashboard/**"

  exploratory:
    material: "glass"
    sync: "lww"
    paths:
      - "src/features/discovery/**"

# Tension presets (active tensions stored in SQLite)
tensions:
  presets:
    - name: "linear"
      playfulness: 20
      weight: 30
      density: 70
      speed: 95

# Gardener settings
gardener:
  paper_cut_threshold: 10
  three_to_one_rule: true
  enforcement: "advisory"

# Founder Mode
founder_mode:
  pair_required: true
  invariant_protection:
    - "accessibility"
    - "security"
```

#### `.sigil/corrections.yaml`

```yaml
# Local learning from human overrides
corrections:
  - id: "corr-001"
    flagged_at: "2026-01-02T10:30:00Z"
    issue: "Used Glass material for checkout button"
    correction: "Checkout buttons should always use Clay material for trust"
    applies_to: "src/features/checkout/**"

  - id: "corr-002"
    flagged_at: "2026-01-02T11:45:00Z"
    issue: "Used optimistic UI for balance update"
    correction: "Balance updates must use server-tick, show pending state"
    applies_to: "**/balance*"
```

### Directory Structure

```
project/
├── CLAUDE.md                        # Generated context for Claude
├── .sigilrc.yaml                    # Configuration
├── .sigil-setup-complete            # Setup marker
├── .sigil/
│   ├── sigil.db                     # SQLite database (Git-tracked)
│   └── corrections.yaml             # Local learning
│
├── sigil-workbench/                 # Vite SPA
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│
└── sigil-mark/                      # Documentation (optional)
    ├── soul/
    │   └── essence.yaml             # Soul statement
    └── governance/
        └── decisions/               # Decision records
```

---

## API Design

### CLI Commands

| Command | Purpose | Implementation |
|---------|---------|----------------|
| `sigil init` | Bootstrap Soul Engine | Creates .sigilrc.yaml, sigil.db, sigil-workbench/ |
| `sigil mount` | Mount onto existing project | Detects zones, generates config |
| `sigil workbench` | Open Workbench app | Runs `vite` in sigil-workbench/ |
| `sigil sync` | Sync tensions to CLAUDE.md | Regenerates Claude context |

### Claude Tool Interfaces

```typescript
// Skills available to Claude

interface CraftSkill {
  name: '/craft';
  input: {
    component?: string;
    zone?: string;
    lens?: string;
  };
  output: {
    material: MaterialType;
    tensions: TensionState;
    guidance: string;
    warnings: string[];
  };
}

interface ApproveSkill {
  name: '/approve';
  input: {
    pattern: string;
    rationale: string;
  };
  output: {
    approved: boolean;
    recordId: string;
  };
}

interface GardenSkill {
  name: '/garden';
  input: {};
  output: {
    paperCuts: PaperCut[];
    ratio: { fixes: number; features: number };
    suggestions: string[];
  };
}
```

### React Context API

```typescript
// @sigil/soul-engine

// Main provider
export function SigilProvider(props: {
  config: SigilConfig;
  children: React.ReactNode;
}): JSX.Element;

// Context hooks
export function useSigil(): SigilContext;
export function useMaterial(): MaterialContext;
export function useTensions(): TensionContext;

// Sync hooks
export function useLocalFirst<T>(key: string, initial: T): UseLocalFirstResult<T>;
export function useServerTick<T>(key: string, initial: T): UseServerTickResult<T>;
export function useCRDTText(docId: string): UseCRDTTextResult;
```

---

## Claude Integration

### Context Injection Strategy

```
┌────────────────────┐
│   .sigilrc.yaml    │──────┐
│   (config)         │      │
└────────────────────┘      │
                            │
┌────────────────────┐      ▼
│   sigil.db         │──────┬────▶ ┌────────────────────┐
│   (tensions)       │      │      │     CLAUDE.md      │
└────────────────────┘      │      │  (generated)       │
                            │      └────────────────────┘
┌────────────────────┐      │
│   corrections.yaml │──────┘
│   (learning)       │
└────────────────────┘
```

### CLAUDE.md Template

```markdown
# Sigil Soul Engine Context

This project uses Sigil v0.4 Soul Engine for design context.

## Material Physics

Active Material: **Clay** (warm, tactile)

Materials define physics, not just styles:
- **Glass**: Light, translucent. Blur, refraction. For exploratory zones.
- **Clay**: Warm, tactile. Soft shadows, spring motion. For critical zones.
- **Machinery**: Instant, precise. Zero transitions. For command palettes.

## Current Tensions

| Axis | Value | Effect |
|------|-------|--------|
| Playfulness | 50 | Balanced curves and color |
| Weight | 60 | Prominent shadows |
| Density | 40 | Spacious layout |
| Speed | 50 | Moderate transitions |

## Zone Configuration

- `critical` → Clay + Server-Tick: src/features/checkout/**
- `transactional` → Machinery + LWW: src/features/dashboard/**
- `exploratory` → Glass + LWW: src/features/discovery/**

## Sync Strategy Rules

| Strategy | When | UI Rule |
|----------|------|---------|
| Server-Tick | Money, health, inventory | MUST show pending state |
| LWW | Preferences, toggles | Optimistic OK |
| CRDT | Text, comments | Show presence |

**CRITICAL**: Never use optimistic UI for server-tick data.

## Local Corrections

- Checkout buttons should always use Clay material for trust
- Balance updates must use server-tick, show pending state

## Commands

- `/craft` — Get design guidance with material + tension context
- `/garden` — Show paper cut analysis
- `/approve` — Human sign-off on patterns
```

### Corrections Flow

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   Claude      │────▶│   Human       │────▶│   Correction  │
│   generates   │     │   reviews     │     │   recorded    │
│   component   │     │   flags issue │     │   in .yaml    │
└───────────────┘     └───────────────┘     └───────────────┘
                                                    │
                                                    ▼
                                            ┌───────────────┐
                                            │   CLAUDE.md   │
                                            │   regenerated │
                                            └───────────────┘
                                                    │
                                                    ▼
                                            ┌───────────────┐
                                            │   Future      │
                                            │   prompts     │
                                            │   include     │
                                            │   correction  │
                                            └───────────────┘
```

---

## Security Architecture

### Threat Model

| Threat | Mitigation |
|--------|------------|
| Secrets in config | No secrets in .sigilrc.yaml or sigil.db |
| Accidental changes | Sandbox mode for non-technical users |
| Unauthorized overrides | Founder Mode requires pair confirmation |
| Data loss | All state in Git-tracked files |

### Sandbox Mode Implementation

```typescript
// lib/sandbox.ts
export class SandboxState {
  private original: Map<string, any> = new Map();
  private modified: Map<string, any> = new Map();

  snapshot(): void {
    // Capture current state
    this.original = this.loadFromDB();
  }

  modify(key: string, value: any): void {
    // Only write to modified map
    this.modified.set(key, value);
  }

  get(key: string): any {
    return this.modified.get(key) ?? this.original.get(key);
  }

  discard(): void {
    this.modified.clear();
  }

  commit(): void {
    // Write modified to DB
    for (const [key, value] of this.modified) {
      this.writeToDb(key, value);
    }
  }
}
```

### Founder Mode Guardrails

```typescript
// governance/founderMode.ts
export async function executeFounderAction(
  action: FounderAction,
  firstOwner: string,
  secondOwner: string
): Promise<AuditRecord> {
  // 1. Validate pair
  if (firstOwner === secondOwner) {
    throw new Error('Founder Mode requires TWO different Taste Owners');
  }

  // 2. Check invariant protection
  if (PROTECTED_INVARIANTS.includes(action.target)) {
    throw new Error(`Cannot override protected invariant: ${action.target}`);
  }

  // 3. Execute with audit
  const record: AuditRecord = {
    id: generateId(),
    action: action.type,
    target: action.target,
    firstOwner,
    secondOwner,
    timestamp: new Date().toISOString(),
  };

  await db.insert('founder_audit', record);
  await executeAction(action);

  return record;
}

const PROTECTED_INVARIANTS = ['accessibility', 'security'];
```

---

## Deployment Architecture

### Package Distribution

```
@sigil/soul-engine (npm)
├── dist/
│   ├── index.js              # Main entry
│   ├── index.d.ts            # Types
│   ├── material/             # Subpath export
│   │   ├── index.js
│   │   └── index.d.ts
│   ├── sync/                 # Subpath export
│   │   ├── index.js
│   │   └── index.d.ts
│   ├── hooks/                # Subpath export
│   │   ├── index.js
│   │   └── index.d.ts
│   └── workbench/            # Subpath export
│       ├── index.js
│       └── index.d.ts
├── package.json
└── README.md
```

### Installation Flow

```bash
# 1. Install package
npm install @sigil/soul-engine

# 2. Run init (creates config, db, workbench)
npx sigil init

# 3. Mount onto existing project
npx sigil mount

# 4. Start workbench
npx sigil workbench
```

### Workbench Bootstrapping

```typescript
// cli/init.ts
export async function init(projectRoot: string) {
  // 1. Create .sigilrc.yaml with defaults
  await writeFile(
    join(projectRoot, '.sigilrc.yaml'),
    DEFAULT_CONFIG
  );

  // 2. Initialize SQLite database
  const db = await initSqlJs();
  db.run(SCHEMA_SQL);
  await writeFile(
    join(projectRoot, '.sigil', 'sigil.db'),
    db.export()
  );

  // 3. Bootstrap Vite workbench
  await copyDir(
    WORKBENCH_TEMPLATE,
    join(projectRoot, 'sigil-workbench')
  );

  // 4. Create setup marker
  await writeFile(
    join(projectRoot, '.sigil-setup-complete'),
    new Date().toISOString()
  );

  // 5. Generate CLAUDE.md
  await generateClaudeContext(projectRoot);
}
```

---

## Development Workflow

### Git Strategy

```
main
  │
  ├── feature/material-core
  │     └── Implement MaterialCore, MaterialProvider
  │
  ├── feature/tension-system
  │     └── Implement TensionSystem, useTensions
  │
  ├── feature/interaction-router
  │     └── Implement InteractionRouter, sync hooks
  │
  └── feature/workbench
        └── Implement Vite SPA
```

### Testing Strategy

| Layer | Testing Approach |
|-------|------------------|
| Material Core | Unit tests for physics calculations |
| Tension System | Integration tests for CSS variable output |
| Interaction Router | Unit tests for keyword classification |
| Sync Hooks | Integration tests with mock APIs |
| Workbench | E2E tests with Playwright |

### Code Review Checklist

- [ ] Server-tick hooks never use optimistic UI
- [ ] Material physics respected (no forbidden patterns)
- [ ] Tensions produce valid CSS variables
- [ ] Unknown sync patterns prompt for declaration
- [ ] SQLite migrations are backwards-compatible

---

## Technical Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| sql.js bundle size (~1MB) | Medium | Medium | Lazy load, cache WASM |
| CSS variable performance | Low | High | Debounce tension updates to 60fps |
| Vite/React version conflicts | Medium | Medium | Pin peer dependencies |
| Claude ignoring context | Medium | High | Robust CLAUDE.md generation, testing |
| SQLite Git conflicts | Low | Medium | Recommend single-user tension editing |

### sql.js Bundle Optimization

```typescript
// lib/db.ts
let sqlPromise: Promise<SqlJsStatic> | null = null;

export async function getSql(): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({
      locateFile: file => `/sql-wasm/${file}`,
    });
  }
  return sqlPromise;
}
```

### Tension Update Throttling

```typescript
// hooks/useTensions.ts
const setTension = useCallback((key: keyof TensionState, value: number) => {
  // RAF throttle for 60fps
  if (!rafRef.current) {
    rafRef.current = requestAnimationFrame(() => {
      setTensionsState(prev => ({ ...prev, [key]: clamp(value, 0, 100) }));
      rafRef.current = null;
    });
  }
}, []);
```

---

## Future Considerations

### v0.5 Roadmap

| Feature | Priority | Effort |
|---------|----------|--------|
| Convergence Studio (roles) | P2 | M |
| Memory services (cross-session) | P2 | L |
| Vue/Svelte ports | P3 | L |
| MCP tool integration | P3 | M |

### Technical Debt Watch

- [ ] sql.js WASM loading strategy
- [ ] CSS variable naming conventions
- [ ] Sync hook abstraction for different backends
- [ ] Workbench component library coverage

### Extension Points

```typescript
// Future: Custom material plugins
interface MaterialPlugin {
  name: string;
  physics: MaterialPhysics;
  register(): void;
}

// Future: Custom sync strategies
interface SyncPlugin {
  name: string;
  strategy: SyncStrategy;
  hook: <T>() => SyncHookResult<T>;
}
```

---

## Appendix

### A. CSS Variable Reference

| Variable | Controlled By | Range |
|----------|---------------|-------|
| `--sigil-border-radius` | Playfulness | 4-16px |
| `--sigil-color-saturation` | Playfulness | 80-100% |
| `--sigil-shadow-opacity` | Weight | 0.05-0.15 |
| `--sigil-font-weight` | Weight | 400-600 |
| `--sigil-spacing-unit` | Density | 6-8px |
| `--sigil-transition-duration` | Speed | 20-300ms |

### B. SQLite Migration Strategy

```sql
-- migrations/001_initial.sql
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY
);

INSERT INTO schema_version VALUES (1);

-- Check version before migrations
SELECT version FROM schema_version;
```

### C. Keyboard Shortcuts (Workbench)

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open component browser |
| `Cmd/Ctrl + S` | Save tension state |
| `Cmd/Ctrl + Z` | Undo tension change |
| `Cmd/Ctrl + Shift + S` | Toggle sandbox mode |
| `1-4` | Quick preset (Linear, Airbnb, Nintendo, OSRS) |

### D. Package Subpath Exports

```typescript
// Import main
import { SigilProvider, useSigil } from '@sigil/soul-engine';

// Import material
import { MaterialProvider, useMaterial } from '@sigil/soul-engine/material';

// Import sync
import { InteractionRouter, useServerTick } from '@sigil/soul-engine/sync';

// Import hooks
import { useTensions, useLocalFirst } from '@sigil/soul-engine/hooks';

// Import workbench components
import { TensionSlider, ArtifactPreview } from '@sigil/soul-engine/workbench';
```

### E. Migration from v3

Sigil v0.4 is a **fresh start** (per PRD interview findings). No automatic migration from v3.

Key differences:
- v3: Skill-based agent architecture (no runtime)
- v0.4: npm package with React runtime + Vite workbench

If migrating from v3:
1. Keep existing `sigil-mark/` for documentation
2. Run `sigil init` to create v0.4 structure
3. Map v3 zones to v0.4 zone configuration
4. Install `@sigil/soul-engine` in your project

---

*Generated by Software Architect Agent*
*Date: 2026-01-02*
*Sigil v0.4: A Studio, not a Factory. Craft, not just consistency.*
