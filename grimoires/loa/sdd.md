# Software Design Document: Sigil v7.6 "The Living Canon"

> *"Stop asking for permission to be great. If the code survives and is clean, it is Gold."*

**Version:** 7.6.0
**Codename:** The Living Canon
**Status:** SDD Complete
**Date:** 2026-01-10
**Supersedes:** SDD v7.5.0 "The Reference Studio"
**Based on:** PRD v7.6.0

---

## 1. Executive Summary

This document describes the technical architecture for Sigil v7.6 "The Living Canon", which corrects 6 fatal flaws identified in v7.5:

| Flaw | v7.5 Problem | v7.6 Solution |
|------|--------------|---------------|
| Nomination PRs | Bureaucracy | Survival Engine (auto + veto) |
| Markdown principles | Dead knowledge | Executable hooks/utils |
| Contagion deadlock | Cascade failures | Slot-based composition |
| Registry parsing | Overhead | Filesystem as database |
| Usage = Quality | Mob rule | Linter Gate |
| Background execution | Flow interruption | Offload to CI/CD |

### Architecture Philosophy

```
"The Agent is an orchestrator, not a worker node."
"If it survives and is clean, it is Gold."
"Human vetoes, not approves."
```

---

## 2. System Architecture

### 2.1 High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           SIGIL v7.6                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │   Agent Layer    │  │  Process Layer   │  │   Runtime Layer  │  │
│  │                  │  │                  │  │                  │  │
│  │ - Claude Code    │  │ - Survival       │  │ - useMotion()    │  │
│  │ - PreToolUse     │◀─▶│   Engine        │  │ - oklch()        │  │
│  │ - PostToolUse    │  │ - Linter Gate    │  │ - spacing()      │  │
│  │                  │  │ - Filesystem     │  │                  │  │
│  └────────┬─────────┘  │   Registry       │  └──────────────────┘  │
│           │            └────────┬─────────┘                         │
│           │                     │                                    │
│           ▼                     ▼                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      Filesystem Layer                         │  │
│  │                                                               │  │
│  │  src/components/           .sigil/            .github/        │  │
│  │  ├── gold/                 ├── survival-      └── workflows/  │  │
│  │  │   ├── Button.tsx        │   stats.json        └── sigil-   │  │
│  │  │   ├── hooks/           └── pending-            ops.yml    │  │
│  │  │   │   └── useMotion.ts     ops.json                       │  │
│  │  │   └── utils/                                               │  │
│  │  │       └── colors.ts                                        │  │
│  │  ├── silver/                                                  │  │
│  │  └── draft/                                                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  git push   │────▶│  Survival   │────▶│   Linter    │
│             │     │   Engine    │     │    Gate     │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                    │
                           │ Criteria Met?      │ Clean?
                           ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │   YES: mv   │     │  YES: Allow │
                    │ to gold/    │     │  promotion  │
                    └──────┬──────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Notify:     │
                    │ "Veto in    │
                    │  24h"       │
                    └──────┬──────┘
                           │
                    No veto │ 24h
                           ▼
                    ┌─────────────┐
                    │ PROMOTED    │
                    │ TO GOLD     │
                    └─────────────┘
```

---

## 3. Technology Stack

### 3.1 Core Technologies

| Layer | Technology | Justification |
|-------|------------|---------------|
| Language | TypeScript 5.x | Type safety, compile-time validation |
| Runtime | Node.js 20+ | ES modules, native FS promises |
| Linting | ESLint 8.x | Custom Sigil rules |
| Build | TSX | Fast TypeScript execution |
| CI/CD | GitHub Actions | Native Git integration |

### 3.2 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.3 | Type checking |
| `eslint` | ^8.56 | Linting |
| `@typescript-eslint/*` | ^6.0 | TypeScript ESLint |

### 3.3 No New Dependencies

v7.6 removes complexity. No new npm packages required.

---

## 4. Component Design

### 4.1 Survival Engine

**File:** `sigil-mark/process/survival-engine.ts`

**Purpose:** Auto-promote/demote components based on survival + cleanliness.

```typescript
/**
 * @sigil-tier gold
 * Sigil v7.6 — Survival Engine
 *
 * Auto-promote when survival + cleanliness criteria met.
 * Human vetoes, not approves.
 */

// =============================================================================
// TYPES
// =============================================================================

export type PromotionTrigger = 'git-push' | 'weekly-cron' | 'manual';

export interface SurvivalCriteria {
  /** Minimum imports from Gold components */
  goldImports: number;
  /** Minimum weeks without modification */
  stabilityWeeks: number;
  /** Maximum allowed mutinies (overrides/reverts) */
  maxMutinies: number;
}

export interface CleanlinessCriteria {
  /** ESLint max warnings */
  eslintMaxWarnings: number;
  /** TypeScript strict mode */
  typescriptStrict: boolean;
  /** No hardcoded values */
  noHardcoded: boolean;
  /** No console.log statements */
  noConsoleLogs: boolean;
  /** JSDoc required for exports */
  requireDocstrings: boolean;
}

export interface PromotionCandidate {
  /** Component name */
  name: string;
  /** Current tier */
  currentTier: 'draft' | 'silver';
  /** Target tier */
  targetTier: 'silver' | 'gold';
  /** Survival stats */
  stats: ComponentStats;
  /** Linter gate result */
  linterResult: LinterResult;
  /** Promotion eligibility */
  eligible: boolean;
  /** Reason if not eligible */
  reason?: string;
}

export interface ComponentStats {
  goldImports: number;
  lastModified: string;
  stabilityWeeks: number;
  mutinies: number;
}

export interface LinterResult {
  pass: boolean;
  eslintWarnings: number;
  eslintErrors: number;
  typeErrors: number;
  failures: string[];
}

export interface PromotionResult {
  success: boolean;
  promoted: string[];
  demoted: string[];
  pending: PromotionCandidate[];
  errors: string[];
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export const DEFAULT_SURVIVAL_CRITERIA: SurvivalCriteria = {
  goldImports: 5,
  stabilityWeeks: 2,
  maxMutinies: 0,
};

export const DEFAULT_CLEANLINESS_CRITERIA: CleanlinessCriteria = {
  eslintMaxWarnings: 0,
  typescriptStrict: true,
  noHardcoded: true,
  noConsoleLogs: true,
  requireDocstrings: true,
};

export const VETO_WINDOW_HOURS = 24;

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Run the survival engine.
 *
 * 1. Scan all Silver components
 * 2. Check survival criteria (usage, stability, mutinies)
 * 3. Check cleanliness criteria (lint, types)
 * 4. Auto-promote eligible components
 * 5. Notify with veto window
 */
export async function runSurvivalEngine(
  projectRoot: string,
  trigger: PromotionTrigger = 'git-push'
): Promise<PromotionResult>;

/**
 * Check if component meets survival criteria.
 */
export function meetsSurvivalCriteria(
  stats: ComponentStats,
  criteria?: SurvivalCriteria
): boolean;

/**
 * Check if component meets cleanliness criteria.
 */
export async function meetsCleanlinessGate(
  componentPath: string,
  criteria?: CleanlinessCriteria
): Promise<LinterResult>;

/**
 * Promote component to next tier.
 * Moves file and regenerates indexes.
 */
export async function promoteComponent(
  componentName: string,
  fromTier: 'draft' | 'silver',
  toTier: 'silver' | 'gold',
  projectRoot: string
): Promise<void>;

/**
 * Demote component (immediate, no waiting).
 * Triggered by modification or mutinies.
 */
export async function demoteComponent(
  componentName: string,
  fromTier: 'gold' | 'silver',
  toTier: 'silver' | 'draft',
  reason: string,
  projectRoot: string
): Promise<void>;

/**
 * Send notification with veto option.
 */
export async function notifyPromotion(
  candidate: PromotionCandidate,
  vetoWindowHours?: number
): Promise<void>;

/**
 * Check for pending vetoes.
 */
export async function checkVetoes(
  projectRoot: string
): Promise<string[]>;
```

**Key Design Decisions:**

1. **Survival + Cleanliness**: Both required for promotion
2. **Auto-promote**: No PR ceremony
3. **Veto window**: 24h default, configurable
4. **Immediate demotion**: No waiting on mutations

---

### 4.2 Linter Gate

**File:** `sigil-mark/process/linter-gate.ts`

**Purpose:** Quality gate for promotion candidacy.

```typescript
/**
 * @sigil-tier gold
 * Sigil v7.6 — Linter Gate
 *
 * Cleanliness gate for promotion.
 * Usage generates candidacy, cleanliness generates promotion.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface LinterGateConfig {
  eslint: {
    maxWarnings: number;
    rules: string[];
  };
  typescript: {
    strict: boolean;
    noAny: boolean;
  };
  sigil: {
    noConsoleLogs: boolean;
    noHardcodedValues: boolean;
    hasDocstring: boolean;
  };
}

export interface LinterGateResult {
  pass: boolean;
  checks: {
    eslint: CheckResult;
    typescript: CheckResult;
    sigil: CheckResult;
  };
  failures: string[];
  duration: number;
}

export interface CheckResult {
  pass: boolean;
  errors: number;
  warnings: number;
  details: string[];
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export const DEFAULT_LINTER_GATE_CONFIG: LinterGateConfig = {
  eslint: {
    maxWarnings: 0,
    rules: [
      'sigil/no-hardcoded-values',
      'sigil/use-tokens',
      'sigil/gold-imports-only',
    ],
  },
  typescript: {
    strict: true,
    noAny: true,
  },
  sigil: {
    noConsoleLogs: true,
    noHardcodedValues: true,
    hasDocstring: true,
  },
};

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Check if component can be promoted.
 * Returns false if ANY check fails.
 */
export async function canPromote(
  componentPath: string,
  config?: LinterGateConfig
): Promise<boolean>;

/**
 * Run full linter gate with detailed results.
 */
export async function runLinterGate(
  componentPath: string,
  config?: LinterGateConfig
): Promise<LinterGateResult>;

/**
 * Run ESLint check on component.
 */
export async function runEslintCheck(
  componentPath: string,
  rules: string[],
  maxWarnings: number
): Promise<CheckResult>;

/**
 * Run TypeScript check on component.
 */
export async function runTypescriptCheck(
  componentPath: string,
  strict: boolean,
  noAny: boolean
): Promise<CheckResult>;

/**
 * Run Sigil-specific checks.
 */
export async function runSigilChecks(
  componentPath: string,
  config: LinterGateConfig['sigil']
): Promise<CheckResult>;
```

**Key Design Decisions:**

1. **All checks must pass**: Single failure = gate closed
2. **Detailed failures**: Log exactly what failed
3. **Fast execution**: <5s for full gate
4. **Configurable rules**: Project can customize

---

### 4.3 Filesystem Registry

**File:** `sigil-mark/process/filesystem-registry.ts`

**Purpose:** Path-based tier lookup. No parsing.

```typescript
/**
 * @sigil-tier gold
 * Sigil v7.6 — Filesystem Registry
 *
 * Path IS the API.
 * To check tier, check if path exists.
 */

import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// TYPES
// =============================================================================

export type RegistryTier = 'gold' | 'silver' | 'draft';

export interface ComponentInfo {
  name: string;
  tier: RegistryTier;
  path: string;
  hasIndex: boolean;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export const COMPONENT_ROOT = 'src/components';

export const TIER_PATHS: Record<RegistryTier, string> = {
  gold: `${COMPONENT_ROOT}/gold`,
  silver: `${COMPONENT_ROOT}/silver`,
  draft: `${COMPONENT_ROOT}/draft`,
};

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Get tier of a component by checking path existence.
 * O(1) lookup via filesystem.
 */
export function getTier(
  componentName: string,
  projectRoot: string = process.cwd()
): RegistryTier | null {
  for (const tier of ['gold', 'silver', 'draft'] as RegistryTier[]) {
    const componentPath = path.join(
      projectRoot,
      TIER_PATHS[tier],
      `${componentName}.tsx`
    );
    if (fs.existsSync(componentPath)) {
      return tier;
    }
  }
  return null;
}

/**
 * Get all components in a tier.
 */
export function getComponentsInTier(
  tier: RegistryTier,
  projectRoot: string = process.cwd()
): string[] {
  const tierPath = path.join(projectRoot, TIER_PATHS[tier]);

  if (!fs.existsSync(tierPath)) {
    return [];
  }

  return fs.readdirSync(tierPath)
    .filter(f => f.endsWith('.tsx') && f !== 'index.tsx')
    .map(f => f.replace('.tsx', ''));
}

/**
 * Move component between tiers.
 * Atomic: move file, then regenerate both indexes.
 */
export async function moveComponent(
  componentName: string,
  fromTier: RegistryTier,
  toTier: RegistryTier,
  projectRoot: string = process.cwd()
): Promise<void> {
  const fromPath = path.join(projectRoot, TIER_PATHS[fromTier], `${componentName}.tsx`);
  const toPath = path.join(projectRoot, TIER_PATHS[toTier], `${componentName}.tsx`);

  // Ensure target directory exists
  const toDir = path.dirname(toPath);
  if (!fs.existsSync(toDir)) {
    fs.mkdirSync(toDir, { recursive: true });
  }

  // Move file
  fs.renameSync(fromPath, toPath);

  // Regenerate both indexes
  await regenerateIndex(fromTier, projectRoot);
  await regenerateIndex(toTier, projectRoot);
}

/**
 * Regenerate index.ts for a tier.
 * Auto-generates exports from directory contents.
 */
export async function regenerateIndex(
  tier: RegistryTier,
  projectRoot: string = process.cwd()
): Promise<void> {
  const tierPath = path.join(projectRoot, TIER_PATHS[tier]);
  const indexPath = path.join(tierPath, 'index.ts');

  if (!fs.existsSync(tierPath)) {
    return;
  }

  const files = fs.readdirSync(tierPath)
    .filter(f => f.endsWith('.tsx') && f !== 'index.tsx')
    .sort(); // Deterministic ordering

  const exports = files
    .map(f => `export * from './${f.replace('.tsx', '')}';`)
    .join('\n');

  const header = `/**
 * @sigil-tier ${tier}
 * Auto-generated index. Do not edit manually.
 * Regenerated by Sigil Survival Engine.
 */

`;

  fs.writeFileSync(indexPath, header + exports + '\n');
}

/**
 * Regenerate all tier indexes.
 */
export async function regenerateAllIndexes(
  projectRoot: string = process.cwd()
): Promise<void> {
  for (const tier of ['gold', 'silver', 'draft'] as RegistryTier[]) {
    await regenerateIndex(tier, projectRoot);
  }
}

/**
 * Check if import is allowed (contagion rules).
 * Gold can import: Gold, Silver
 * Silver can import: Gold, Silver, Draft
 * Draft can import: anything
 */
export function isImportAllowed(
  importerTier: RegistryTier,
  importeeTier: RegistryTier
): boolean {
  if (importerTier === 'draft') return true;
  if (importerTier === 'silver') return true;
  if (importerTier === 'gold') {
    return importeeTier === 'gold' || importeeTier === 'silver';
  }
  return false;
}
```

**Key Design Decisions:**

1. **No parsing**: `fs.existsSync()` is the API
2. **Deterministic indexes**: Sorted alphabetically
3. **Atomic moves**: File move + index regen in sequence
4. **Contagion preserved**: Gold cannot import Draft

---

### 4.4 Executable Principles

**Location:** `src/components/gold/hooks/` and `src/components/gold/utils/`

#### 4.4.1 useMotion Hook

**File:** `src/components/gold/hooks/useMotion.ts`

```typescript
/**
 * @sigil-tier gold
 * Motion physics as executable code.
 *
 * Agent instruction: "Use useMotion for all motion."
 */

export type PhysicsName =
  | 'server-tick'   // 600ms - Financial mutations
  | 'deliberate'    // 800ms - Critical actions
  | 'snappy'        // 150ms - UI feedback
  | 'smooth'        // 300ms - Standard transitions
  | 'instant';      // 0ms - No transition

export interface PhysicsConfig {
  duration: number;
  easing: string;
}

export interface MotionStyle {
  transition: string;
  '--sigil-duration': string;
  '--sigil-easing': string;
}

export const PHYSICS: Record<PhysicsName, PhysicsConfig> = {
  'server-tick': { duration: 600, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  'deliberate': { duration: 800, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  'snappy': { duration: 150, easing: 'ease-out' },
  'smooth': { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  'instant': { duration: 0, easing: 'linear' },
} as const;

export function useMotion(physics: PhysicsName): MotionStyle {
  const config = PHYSICS[physics];
  return {
    transition: `all ${config.duration}ms ${config.easing}`,
    '--sigil-duration': `${config.duration}ms`,
    '--sigil-easing': config.easing,
  };
}
```

#### 4.4.2 Colors Utility

**File:** `src/components/gold/utils/colors.ts`

```typescript
/**
 * @sigil-tier gold
 * OKLCH color utilities as executable code.
 *
 * Agent instruction: "Use oklch() for all colors."
 */

export function oklch(l: number, c: number, h: number, a: number = 1): string {
  if (l < 0 || l > 1) throw new Error(`Lightness must be 0-1, got ${l}`);
  if (c < 0 || c > 0.4) throw new Error(`Chroma must be 0-0.4, got ${c}`);
  if (h < 0 || h > 360) throw new Error(`Hue must be 0-360, got ${h}`);

  const base = `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${h.toFixed(1)})`;
  return a === 1 ? base : `${base.slice(0, -1)} / ${a})`;
}

export const palette = {
  primary: oklch(0.5, 0.2, 250),
  success: oklch(0.6, 0.2, 145),
  danger: oklch(0.5, 0.25, 25),
  warning: oklch(0.7, 0.2, 85),
} as const;
```

#### 4.4.3 Spacing Utility

**File:** `src/components/gold/utils/spacing.ts`

```typescript
/**
 * @sigil-tier gold
 * Spacing scale as executable code.
 *
 * Agent instruction: "Use spacing() for all spacing."
 */

export const SPACING = {
  0: '0', 1: '4px', 2: '8px', 3: '12px', 4: '16px',
  5: '20px', 6: '24px', 8: '32px', 10: '40px', 12: '48px',
  16: '64px', 20: '80px', 24: '96px',
} as const;

export type SpacingKey = keyof typeof SPACING;

export function spacing(key: SpacingKey): string {
  return SPACING[key];
}
```

---

### 4.5 Slot-Based Composition

**Pattern:** Gold defines frame, content can be Draft via children.

```typescript
// Gold component defines frame (allowed)
export function Button({ children, icon }: ButtonProps) {
  return (
    <button>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}

// Feature code composes Draft into Gold (allowed)
import { Button } from '@/components/gold';
import { DraftAnimation } from '@/components/draft';

export function ClaimButton() {
  return (
    <Button>
      <DraftAnimation />  {/* Draft as child - ALLOWED */}
      Claim Rewards
    </Button>
  );
}

// Direct import in Gold (BLOCKED by ESLint)
// src/components/gold/Button.tsx
import { DraftAnimation } from '../draft'; // ERROR
```

---

## 5. Data Architecture

### 5.1 Survival Stats Schema

**File:** `.sigil/survival-stats.json`

```json
{
  "version": 1,
  "lastUpdated": "2026-01-10T12:00:00Z",
  "components": {
    "Button": {
      "tier": "silver",
      "goldImports": 7,
      "lastModified": "2025-12-15T00:00:00Z",
      "stabilityWeeks": 4,
      "mutinies": 0,
      "promotionEligible": true,
      "linterGatePassed": true
    }
  },
  "pendingPromotions": [],
  "recentDemotions": []
}
```

### 5.2 Pending Operations Schema

**File:** `.sigil/pending-ops.json`

```json
{
  "version": 1,
  "operations": [
    {
      "id": "op-001",
      "type": "optimize-images",
      "files": ["public/hero.png"],
      "requestedAt": "2026-01-10T12:00:00Z",
      "status": "pending"
    }
  ]
}
```

---

## 6. CI/CD Architecture

### 6.1 GitHub Actions Workflows

```yaml
# .github/workflows/sigil-survival.yml
name: Sigil Survival Engine
on:
  push:
    branches: [main]
jobs:
  survival:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx tsx sigil-mark/process/survival-engine.ts
      - run: |
          git add .sigil/ src/components/
          git commit -m "chore(sigil): survival engine [skip ci]" || true
          git push
```

```yaml
# .github/workflows/sigil-ops.yml
name: Sigil Operations
on:
  push:
    paths: ['.sigil/pending-ops.json']
jobs:
  process:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx tsx sigil-mark/process/ops-processor.ts
```

---

## 7. Migration from v7.5

### 7.1 Files to Delete

```bash
rm sigil-mark/process/nomination-generator.ts
rm sigil-mark/process/registry-parser.ts
rm -rf sigil-mark/principles/
```

### 7.2 Files to Create

```bash
# Core
sigil-mark/process/survival-engine.ts
sigil-mark/process/linter-gate.ts
sigil-mark/process/filesystem-registry.ts

# Executable Principles
src/components/gold/hooks/useMotion.ts
src/components/gold/utils/colors.ts
src/components/gold/utils/spacing.ts

# Config
.sigil/survival-stats.json
.sigil/pending-ops.json

# CI/CD
.github/workflows/sigil-survival.yml
.github/workflows/sigil-ops.yml
```

### 7.3 Directory Structure

```
src/components/
├── gold/
│   ├── index.ts          # Auto-generated
│   ├── Button.tsx
│   ├── hooks/
│   │   └── useMotion.ts
│   └── utils/
│       ├── colors.ts
│       └── spacing.ts
├── silver/
│   ├── index.ts          # Auto-generated
│   └── Tooltip.tsx
└── draft/
    ├── index.ts          # Auto-generated
    └── Experimental.tsx
```

---

## 8. Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| `getTier()` | <5ms | Filesystem lookup |
| `canPromote()` | <5s | Full lint + type check |
| `regenerateIndex()` | <100ms | Directory scan + write |
| Full survival engine | <30s | All components |
| PreToolUse validation | <20ms | Cached lookup |

---

## 9. The 10 Principles

1. **Survival is the vote** — But cleanliness is the gate
2. **Human vetoes, not approves** — Invert the control
3. **Executable, not descriptive** — Hooks > Markdown
4. **Gold frames, Draft content** — Slot-based composition
5. **Filesystem is the registry** — Path IS the API
6. **Offload heavy ops** — Agent writes intent, CI executes
7. **Auto-generate indexes** — No manual registry maintenance
8. **Zero warnings to promote** — Lint gate required
9. **No parsing overhead** — Directory lookup only
10. **Stop asking for permission** — If it survives, it's Gold

---

*SDD Generated: 2026-01-10*
*Based on: PRD v7.6.0*
*Next Step: `/sprint-plan` to break down into sprints*

---

# Addendum: Sigil Grimoire Migration Architecture (v7.7)

**Date:** 2026-01-11
**Depends on:** v7.6 SDD
**Based on:** PRD v7.7 Addendum

---

## A1. Executive Summary

This addendum describes the technical architecture for migrating Sigil to the `grimoires/` pattern introduced in Loa v0.12.0. The migration:

1. **Consolidates** design context from `sigil-mark/` + `.sigil/` into `grimoires/sigil/`
2. **Separates** public framework from private state
3. **Moves** runtime code to `src/sigil/` with path aliases
4. **Consolidates** zone configs to `grimoires/sigil/zones/`
5. **Archives** unused packages (sigil-workbench, sigil-hud)

### Key Decisions (from PRD review)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Runtime code package | Path aliases | Simpler, no package management overhead |
| sigil-workbench, sigil-hud | Archive/delete | Not actively used, optimizing for depth |
| Zone configs | Consolidate | Single source of truth in grimoire |

---

## A2. Directory Architecture

### A2.1 Target Structure

```
grimoires/
├── sigil/                          # Sigil grimoire
│   │
│   │── # PUBLIC (git-tracked)
│   ├── constitution/               # Core design laws
│   │   ├── physics.yaml            # Motion timing, easing
│   │   ├── zones.yaml              # Zone definitions (consolidated)
│   │   ├── lenses.yaml             # Lens configurations
│   │   ├── fidelity.yaml           # Fidelity ceiling rules
│   │   ├── vocabulary.yaml         # Term definitions (moved from kernel)
│   │   ├── workflow.yaml           # Workflow rules (moved from kernel)
│   │   └── protected-capabilities.yaml
│   │
│   ├── moodboard/                  # Visual references
│   │   ├── moodboard.md            # Main feel document
│   │   ├── references/             # Inspiration images
│   │   ├── palettes/               # Color systems
│   │   └── rules.md                # Design rules
│   │
│   ├── zones/                      # Zone configurations (consolidated)
│   │   ├── critical.yaml           # CriticalZone overrides
│   │   ├── admin.yaml              # MachineryLayout overrides
│   │   ├── marketing.yaml          # GlassLayout overrides
│   │   └── README.md               # Zone config documentation
│   │
│   ├── seeds/                      # Virtual Sanctuary
│   │   ├── linear-like.yaml
│   │   ├── vercel-like.yaml
│   │   ├── stripe-like.yaml
│   │   └── blank.yaml
│   │
│   ├── process/                    # Agent-time utilities
│   │   ├── survival-engine.ts
│   │   ├── linter-gate.ts
│   │   ├── filesystem-registry.ts
│   │   ├── workshop-builder.ts
│   │   ├── workshop-query.ts
│   │   ├── startup-sentinel.ts
│   │   ├── physics-validator.ts
│   │   └── ...
│   │
│   ├── examples/                   # Example code (from __examples__)
│   │   └── ...
│   │
│   │── # PRIVATE (gitignored)
│   ├── state/                      # Runtime state
│   │   ├── workshop.json           # Pre-computed index
│   │   ├── survival-stats.json     # Component tracking
│   │   ├── pending-ops.json        # CI/CD queue
│   │   ├── survival.json           # Pattern tracking
│   │   ├── seed.yaml               # Active seed selection
│   │   └── craft-log/              # Session logs
│   │
│   └── archive/                    # Historical data
│       ├── eras/                   # Era snapshots
│       └── sprints/                # Sprint history (already here)
│
├── loa/                            # Loa grimoire (existing)
└── pub/                            # Public documents (existing)

src/
├── sigil/                          # Runtime code (NEW)
│   ├── index.ts                    # Package entry
│   ├── hooks/                      # React hooks
│   │   ├── index.ts
│   │   ├── useMotion.ts
│   │   ├── useSigilMutation.ts
│   │   └── ...
│   ├── layouts/                    # Zone layouts
│   │   ├── index.ts
│   │   ├── CriticalZone.tsx
│   │   ├── GlassLayout.tsx
│   │   └── MachineryLayout.tsx
│   ├── providers/                  # Context providers
│   │   ├── index.ts
│   │   └── SigilProvider.tsx
│   ├── lenses/                     # Lens implementations
│   │   ├── index.ts
│   │   ├── DefaultLens.tsx
│   │   ├── StrictLens.tsx
│   │   └── A11yLens.tsx
│   ├── core/                       # Core utilities
│   │   └── ...
│   ├── types/                      # Type definitions
│   │   └── index.ts
│   └── __tests__/                  # Tests
│       └── ...
```

### A2.2 Zone Config Consolidation

**Current (scattered):**
```
.sigilrc.yaml                       # Root config
src/.sigilrc.yaml                   # src zone
src/admin/.sigilrc.yaml             # admin zone
src/checkout/.sigilrc.yaml          # checkout zone
src/marketing/.sigilrc.yaml         # marketing zone
```

**Target (consolidated):**
```
.sigilrc.yaml                       # Root config (paths to grimoire)
grimoires/sigil/zones/
├── critical.yaml                   # checkout → critical
├── admin.yaml                      # admin zone
├── marketing.yaml                  # marketing zone
└── default.yaml                    # default fallback
```

**Zone Resolution Strategy:**
```typescript
// Zone detected by:
// 1. Layout component wrapper (CriticalZone, MachineryLayout, etc.)
// 2. Path mapping in .sigilrc.yaml (optional override)
// 3. Default zone fallback

interface ZoneConfig {
  extends?: string;           // Parent zone to inherit from
  physics: PhysicsConfig;
  lens: LensConfig;
  constraints: ConstraintConfig;
  persona_overrides: Record<string, PersonaOverride>;
}
```

---

## A3. Path Alias Configuration

### A3.1 TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      // Sigil runtime (new paths)
      "@sigil": ["src/sigil/index.ts"],
      "@sigil/*": ["src/sigil/*"],

      // Sigil grimoire (design context)
      "@sigil-context/*": ["grimoires/sigil/*"],

      // Legacy aliases (deprecated, remove in v8.0)
      "@sigil/hooks": ["src/sigil/hooks/index.ts"],
      "@sigil/hooks/*": ["src/sigil/hooks/*"],
      "@sigil/core/*": ["src/sigil/core/*"]
    }
  },
  "include": [
    "src/**/*",
    "grimoires/sigil/process/**/*"
  ]
}
```

### A3.2 Import Patterns

```typescript
// Runtime imports (from src/sigil/)
import { useMotion, useSigilMutation } from '@sigil/hooks';
import { CriticalZone, GlassLayout } from '@sigil/layouts';
import { SigilProvider } from '@sigil/providers';
import type { PhysicsConfig, ZoneConfig } from '@sigil/types';

// Context imports (from grimoires/sigil/ - agent-time only)
// These are YAML files read at build/agent time, not runtime
import physics from '@sigil-context/constitution/physics.yaml';
```

---

## A4. Migration Script Architecture

### A4.1 Migration Script Structure

```bash
# .claude/scripts/migrate-sigil-grimoire.sh

migrate-sigil-grimoire.sh check     # Assess current state
migrate-sigil-grimoire.sh plan      # Preview changes
migrate-sigil-grimoire.sh run       # Execute migration
migrate-sigil-grimoire.sh rollback  # Revert if needed
```

### A4.2 Migration Phases

```typescript
interface MigrationPlan {
  phase1_structure: {
    action: 'create';
    paths: [
      'grimoires/sigil/constitution/',
      'grimoires/sigil/moodboard/',
      'grimoires/sigil/zones/',
      'grimoires/sigil/seeds/',
      'grimoires/sigil/process/',
      'grimoires/sigil/examples/',
      'grimoires/sigil/state/',
      'grimoires/sigil/archive/',
      'src/sigil/',
    ];
  };

  phase2_public: {
    action: 'move';
    mappings: [
      { from: 'sigil-mark/constitution/*', to: 'grimoires/sigil/constitution/' },
      { from: 'sigil-mark/kernel/*.yaml', to: 'grimoires/sigil/constitution/' },
      { from: 'sigil-mark/moodboard/*', to: 'grimoires/sigil/moodboard/' },
      { from: 'sigil-mark/vocabulary/*', to: 'grimoires/sigil/constitution/' },
      { from: 'sigil-mark/process/*', to: 'grimoires/sigil/process/' },
      { from: 'sigil-mark/__examples__/*', to: 'grimoires/sigil/examples/' },
    ];
  };

  phase3_zones: {
    action: 'consolidate';
    sources: [
      '.sigilrc.yaml',              // Extract zone sections
      'src/.sigilrc.yaml',
      'src/admin/.sigilrc.yaml',
      'src/checkout/.sigilrc.yaml',
      'src/marketing/.sigilrc.yaml',
    ];
    target: 'grimoires/sigil/zones/';
  };

  phase4_runtime: {
    action: 'move';
    mappings: [
      { from: 'sigil-mark/hooks/*', to: 'src/sigil/hooks/' },
      { from: 'sigil-mark/layouts/*', to: 'src/sigil/layouts/' },
      { from: 'sigil-mark/providers/*', to: 'src/sigil/providers/' },
      { from: 'sigil-mark/lenses/*', to: 'src/sigil/lenses/' },
      { from: 'sigil-mark/core/*', to: 'src/sigil/core/' },
      { from: 'sigil-mark/types/*', to: 'src/sigil/types/' },
      { from: 'sigil-mark/__tests__/*', to: 'src/sigil/__tests__/' },
      { from: 'sigil-mark/index.ts', to: 'src/sigil/index.ts' },
    ];
    update_imports: true;
  };

  phase5_state: {
    action: 'move';
    mappings: [
      { from: '.sigil/*', to: 'grimoires/sigil/state/' },
    ];
    update_references: true;
  };

  phase6_cleanup: {
    action: 'archive';
    paths: [
      'sigil-workbench/',           // Archive
      'packages/sigil-hud/',        // Archive
      'sigil-mark/',                // Delete after symlink period
      '.sigil/',                    // Delete after migration
    ];
    archive_to: 'grimoires/sigil/archive/deprecated/';
  };
}
```

### A4.3 Import Update Script

```typescript
// grimoires/sigil/process/update-imports.ts

interface ImportMapping {
  old: RegExp;
  new: string;
}

const IMPORT_MAPPINGS: ImportMapping[] = [
  // hooks
  { old: /from ['"]sigil-mark\/hooks['"]/, new: "from '@sigil/hooks'" },
  { old: /from ['"]sigil-mark\/hooks\/(.+)['"]/, new: "from '@sigil/hooks/$1'" },

  // layouts
  { old: /from ['"]sigil-mark\/layouts['"]/, new: "from '@sigil/layouts'" },
  { old: /from ['"]sigil-mark\/layouts\/(.+)['"]/, new: "from '@sigil/layouts/$1'" },

  // providers
  { old: /from ['"]sigil-mark\/providers['"]/, new: "from '@sigil/providers'" },

  // lenses
  { old: /from ['"]sigil-mark\/lenses['"]/, new: "from '@sigil/lenses'" },

  // core
  { old: /from ['"]sigil-mark\/core\/(.+)['"]/, new: "from '@sigil/core/$1'" },

  // types
  { old: /from ['"]sigil-mark\/types['"]/, new: "from '@sigil/types'" },

  // main entry
  { old: /from ['"]sigil-mark['"]/, new: "from '@sigil'" },
];

async function updateImports(files: string[]): Promise<void> {
  for (const file of files) {
    let content = await fs.readFile(file, 'utf-8');

    for (const mapping of IMPORT_MAPPINGS) {
      content = content.replace(mapping.old, mapping.new);
    }

    await fs.writeFile(file, content);
  }
}
```

---

## A5. Skill Configuration Updates

### A5.1 Updated index.yaml

```yaml
# .claude/skills/sigil-core/index.yaml
name: sigil-core
description: Sigil v7.7 design physics framework skill
version: 7.7.0

triggers:
  - /craft
  - /sandbox
  - /codify
  - /inherit
  - /validate
  - /garden
  - /map
  - /zone

context_files:
  # Constitution (design laws)
  - grimoires/sigil/constitution/physics.yaml
  - grimoires/sigil/constitution/zones.yaml
  - grimoires/sigil/constitution/lenses.yaml
  - grimoires/sigil/constitution/fidelity.yaml
  - grimoires/sigil/constitution/vocabulary.yaml

  # Moodboard (visual references)
  - grimoires/sigil/moodboard/moodboard.md

  # Zones (consolidated)
  - grimoires/sigil/zones/

  # Root config
  - .sigilrc.yaml

state_files:
  - grimoires/sigil/state/workshop.json
  - grimoires/sigil/state/survival-stats.json
  - grimoires/sigil/state/survival.json

resources:
  - scripts/sigil-detect-zone.sh

dependencies: []
```

### A5.2 Zone Detection Update

```bash
#!/bin/bash
# .claude/skills/sigil-core/scripts/sigil-detect-zone.sh

# Zone detection now checks grimoires/sigil/zones/ for config

detect_zone() {
  local file_path="$1"

  # 1. Check for Layout wrapper in file (existing logic)
  if grep -q "CriticalZone" "$file_path"; then
    echo "critical"
    return
  fi

  if grep -q "MachineryLayout" "$file_path"; then
    echo "admin"
    return
  fi

  if grep -q "GlassLayout" "$file_path"; then
    echo "marketing"
    return
  fi

  # 2. Check path mapping in root config
  local zone=$(yq '.zone_mappings[] | select(.path == "'"$file_path"'") | .zone' .sigilrc.yaml 2>/dev/null)
  if [[ -n "$zone" ]]; then
    echo "$zone"
    return
  fi

  # 3. Default zone
  echo "default"
}

# Get zone config from consolidated location
get_zone_config() {
  local zone="$1"
  local config_path="grimoires/sigil/zones/${zone}.yaml"

  if [[ -f "$config_path" ]]; then
    cat "$config_path"
  else
    # Fall back to default
    cat "grimoires/sigil/zones/default.yaml"
  fi
}
```

---

## A6. Gitignore Configuration

```gitignore
# .gitignore additions

# Sigil grimoire state (private, per-project)
grimoires/sigil/state/*
!grimoires/sigil/state/README.md

grimoires/sigil/archive/*
!grimoires/sigil/archive/README.md

# Legacy paths (remove after v8.0)
# .sigil/  # Already deleted
```

---

## A7. Root Config Update

```yaml
# .sigilrc.yaml (updated)

sigil: "7.7.0"
codename: "Grimoire Migration"

# Point to grimoire for design context
grimoire: grimoires/sigil/

# Zone configuration location
zones_config: grimoires/sigil/zones/

# Optional path-based zone overrides (for edge cases)
zone_mappings:
  - path: "src/checkout/**"
    zone: critical
  - path: "src/admin/**"
    zone: admin
  - path: "src/marketing/**"
    zone: marketing

# Physics (imported from grimoire at runtime)
physics:
  source: grimoires/sigil/constitution/physics.yaml

# Lenses (imported from grimoire at runtime)
lenses:
  source: grimoires/sigil/constitution/lenses.yaml

# Sandbox files (managed by /sandbox command)
sandbox: []

# Refinement
refinement:
  sources:
    - vercel_preview_comments
    - github_pr_comments
    - linear_issue_comments
  auto_commit: true
  commit_prefix: "refine"
```

---

## A8. Package Cleanup

### A8.1 Packages to Archive

```bash
# Move to grimoires/sigil/archive/deprecated/
sigil-workbench/    → grimoires/sigil/archive/deprecated/sigil-workbench/
packages/sigil-hud/ → grimoires/sigil/archive/deprecated/sigil-hud/
```

### A8.2 packages/ Directory Cleanup

After archiving sigil-hud:
```bash
# Check if packages/ is empty
if [ -z "$(ls -A packages/)" ]; then
  rm -rf packages/
fi
```

---

## A9. Backwards Compatibility

### A9.1 Transition Period (v7.7)

During v7.7, both paths work:

```typescript
// Skill checks both locations
const CONTEXT_PATHS = [
  'grimoires/sigil/',           // New (preferred)
  'sigil-mark/',                // Legacy (deprecated)
];

function resolveContextPath(relativePath: string): string | null {
  for (const base of CONTEXT_PATHS) {
    const fullPath = path.join(base, relativePath);
    if (fs.existsSync(fullPath)) {
      if (base === 'sigil-mark/') {
        console.warn(`[DEPRECATED] Using legacy path: ${fullPath}`);
        console.warn(`             Migrate to: grimoires/sigil/${relativePath}`);
      }
      return fullPath;
    }
  }
  return null;
}
```

### A9.2 Legacy Removal (v8.0)

- Remove `sigil-mark/` symlink
- Remove legacy path support
- Remove deprecated path aliases from tsconfig.json
- Update CLAUDE.md to remove legacy references

---

## A10. Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SIGIL v7.7 DATA FLOW                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  DESIGN TIME (Agent)                 RUNTIME (Application)              │
│  ─────────────────────               ──────────────────────             │
│                                                                          │
│  ┌─────────────────────┐            ┌─────────────────────┐             │
│  │ grimoires/sigil/    │            │    src/sigil/       │             │
│  │                     │            │                     │             │
│  │ ├── constitution/   │────────────▶│ ├── hooks/         │             │
│  │ │   ├── physics     │  informs   │ │   └── useMotion   │             │
│  │ │   ├── zones       │  design    │ │                   │             │
│  │ │   └── lenses      │            │ ├── layouts/        │             │
│  │ │                   │            │ │   ├── Critical    │             │
│  │ ├── moodboard/      │            │ │   ├── Glass       │             │
│  │ │   └── references  │            │ │   └── Machinery   │             │
│  │ │                   │            │ │                   │             │
│  │ ├── zones/          │────────────▶│ ├── lenses/        │             │
│  │ │   ├── critical    │  configures│ │   ├── Default     │             │
│  │ │   ├── admin       │            │ │   ├── Strict      │             │
│  │ │   └── marketing   │            │ │   └── A11y        │             │
│  │ │                   │            │ │                   │             │
│  │ ├── process/        │            │ └── providers/      │             │
│  │ │   └── utilities   │            │     └── SigilProv   │             │
│  │ │                   │            │                     │             │
│  │ └── state/          │            └─────────────────────┘             │
│  │     └── (gitignored)│                       │                        │
│  │                     │                       │                        │
│  └─────────────────────┘                       │                        │
│           │                                    │                        │
│           │ Agent reads                        │ App imports            │
│           ▼                                    ▼                        │
│  ┌─────────────────────┐            ┌─────────────────────┐             │
│  │   Claude Code       │            │   React App         │             │
│  │   Skills/Commands   │            │   Components        │             │
│  └─────────────────────┘            └─────────────────────┘             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## A11. Testing Strategy

### A11.1 Migration Validation

```typescript
// grimoires/sigil/process/__tests__/migration.test.ts

describe('Grimoire Migration', () => {
  it('should have all constitution files', () => {
    const required = [
      'grimoires/sigil/constitution/physics.yaml',
      'grimoires/sigil/constitution/zones.yaml',
      'grimoires/sigil/constitution/lenses.yaml',
      'grimoires/sigil/constitution/fidelity.yaml',
      'grimoires/sigil/constitution/vocabulary.yaml',
    ];

    for (const file of required) {
      expect(fs.existsSync(file)).toBe(true);
    }
  });

  it('should have zone configs consolidated', () => {
    const zones = ['critical', 'admin', 'marketing', 'default'];

    for (const zone of zones) {
      expect(fs.existsSync(`grimoires/sigil/zones/${zone}.yaml`)).toBe(true);
    }

    // Legacy zone files should not exist
    expect(fs.existsSync('src/admin/.sigilrc.yaml')).toBe(false);
  });

  it('should have runtime code in src/sigil', () => {
    const required = [
      'src/sigil/index.ts',
      'src/sigil/hooks/index.ts',
      'src/sigil/layouts/index.ts',
      'src/sigil/providers/index.ts',
      'src/sigil/lenses/index.ts',
    ];

    for (const file of required) {
      expect(fs.existsSync(file)).toBe(true);
    }
  });

  it('should have no legacy sigil-mark imports', async () => {
    const srcFiles = await glob('src/**/*.{ts,tsx}');

    for (const file of srcFiles) {
      const content = await fs.readFile(file, 'utf-8');
      expect(content).not.toMatch(/from ['"]sigil-mark/);
    }
  });
});
```

### A11.2 Path Alias Validation

```typescript
// src/sigil/__tests__/imports.test.ts

describe('Path Aliases', () => {
  it('should resolve @sigil imports', () => {
    // These should compile without error
    import('@sigil').then(m => {
      expect(m.useMotion).toBeDefined();
      expect(m.CriticalZone).toBeDefined();
      expect(m.SigilProvider).toBeDefined();
    });
  });

  it('should resolve @sigil/* imports', () => {
    import('@sigil/hooks').then(m => {
      expect(m.useMotion).toBeDefined();
    });

    import('@sigil/layouts').then(m => {
      expect(m.CriticalZone).toBeDefined();
    });
  });
});
```

---

## A12. Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Zone config lookup | <2ms | Direct file read |
| Context path resolution | <5ms | Two-path check |
| Import alias resolution | 0ms | Compile time |
| Migration script (full) | <30s | All phases |
| Migration rollback | <10s | Git restore |

---

## A13. Implementation Checklist

### Sprint 1: Structure & Gitignore
- [ ] Create `grimoires/sigil/` directory structure
- [ ] Update `.gitignore` for private state
- [ ] Create README files for each directory
- [ ] Archive `sigil-workbench/` and `packages/sigil-hud/`

### Sprint 2: Constitution & Moodboard
- [ ] Move `sigil-mark/constitution/` → `grimoires/sigil/constitution/`
- [ ] Merge `sigil-mark/kernel/*.yaml` → `grimoires/sigil/constitution/`
- [ ] Move `sigil-mark/moodboard/` → `grimoires/sigil/moodboard/`
- [ ] Move `sigil-mark/vocabulary/` → `grimoires/sigil/constitution/`

### Sprint 3: Zone Consolidation
- [ ] Create `grimoires/sigil/zones/` directory
- [ ] Extract zones from `.sigilrc.yaml`
- [ ] Migrate `src/**/.sigilrc.yaml` → `grimoires/sigil/zones/`
- [ ] Remove scattered `.sigilrc.yaml` zone files
- [ ] Update zone detection script

### Sprint 4: Runtime Code
- [ ] Create `src/sigil/` directory
- [ ] Move hooks, layouts, providers, lenses, core, types
- [ ] Update `tsconfig.json` path aliases
- [ ] Run import update script
- [ ] Verify all imports resolve

### Sprint 5: State & Process
- [ ] Move `.sigil/*` → `grimoires/sigil/state/`
- [ ] Move `sigil-mark/process/` → `grimoires/sigil/process/`
- [ ] Update skill `index.yaml` with new paths
- [ ] Remove `.sigil/` directory

### Sprint 6: Cleanup & Validation
- [ ] Remove empty `sigil-mark/` directory
- [ ] Run migration validation tests
- [ ] Update CLAUDE.md documentation
- [ ] Update version to 7.7.0

---

*SDD Addendum Generated: 2026-01-11*
*Based on: PRD v7.7 Addendum*
*Decisions: Path aliases, archive workbench/hud, consolidate zones*
