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
