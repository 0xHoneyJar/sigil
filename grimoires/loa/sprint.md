# Sigil v7.6.0 Sprint Plan

> *"Stop asking for permission to be great. If the code survives and is clean, it is Gold."*

**Version:** 7.6.0
**Codename:** The Living Canon
**Generated:** 2026-01-10
**Sources:** PRD v7.6.0, SDD v7.6.0
**Supersedes:** Sprint Plan v7.5.0 "The Reference Studio"

---

## Sprint Overview

### Team Structure
- **Agent:** Claude (AI implementation)
- **Human:** @zksoju (review, veto holder)

### Sprint Duration
- **Cycle length:** 1 session per sprint
- **Total sprints:** 3 sprints
- **Methodology:** Cycles (Linear Method)

### v7.6 Objective

Correct 6 fatal flaws identified in v7.5 by 3 independent reviewers:

| Flaw | v7.5 Error | v7.6 Fix |
|------|------------|----------|
| Nomination PRs | Bureaucracy | Survival Engine (auto + veto) |
| Markdown principles | Dead knowledge | Executable hooks/utils |
| Contagion deadlock | Cascade failures | Slot-based composition |
| Registry parsing | Overhead | Filesystem as database |
| Usage = Quality | Mob rule | Linter Gate |
| Background execution | Flow interruption | Offload to CI/CD |

### Target Ratings

| Reviewer | v7.5 | v7.6 Target |
|----------|------|-------------|
| Senior Agent Architect | 9/10 | 10/10 |
| Principal Engineer | 7/10 | 9.9/10 |
| Staff Design Engineer | A- | A |

---

## Sprint 1: Core Architecture

**Goal:** Replace nomination bureaucracy with survival engine + linter gate

**Tasks:** 5

### S1-T1: Delete v7.5 Bureaucracy Files

**Description:** Remove files that implement the bureaucratic nomination workflow.

**Files to Delete:**
- `sigil-mark/process/nomination-generator.ts`
- `sigil-mark/process/registry-parser.ts`

**Acceptance Criteria:**
- [ ] `nomination-generator.ts` deleted
- [ ] `registry-parser.ts` deleted
- [ ] No import errors from other files
- [ ] Tests still pass (if any reference these)

---

### S1-T2: Create Filesystem Registry

**Description:** Replace registry parsing with simple filesystem lookup.

**File:** `sigil-mark/process/filesystem-registry.ts`

**Functions to Implement:**
- `getTier(componentName)` - O(1) lookup via `fs.existsSync()`
- `getComponentsInTier(tier)` - List all components in a tier
- `moveComponent(name, fromTier, toTier)` - Atomic move + index regen
- `regenerateIndex(tier)` - Auto-generate exports from directory
- `isImportAllowed(importerTier, importeeTier)` - Contagion check

**Acceptance Criteria:**
- [ ] `filesystem-registry.ts` created (~150 lines)
- [ ] `getTier()` returns tier based on path existence
- [ ] `moveComponent()` moves file and regenerates indexes
- [ ] `regenerateIndex()` creates deterministic index.ts
- [ ] `isImportAllowed()` enforces Gold cannot import Draft

---

### S1-T3: Create Linter Gate

**Description:** Quality gate that must pass before promotion.

**File:** `sigil-mark/process/linter-gate.ts`

**Functions to Implement:**
- `canPromote(componentPath)` - Quick boolean check
- `runLinterGate(componentPath)` - Full results with details
- `runEslintCheck()` - ESLint with Sigil rules
- `runTypescriptCheck()` - TSC strict mode
- `runSigilChecks()` - No console.log, has docstring

**Configuration:**
```typescript
const DEFAULT_CONFIG = {
  eslint: { maxWarnings: 0 },
  typescript: { strict: true, noAny: true },
  sigil: { noConsoleLogs: true, hasDocstring: true },
};
```

**Acceptance Criteria:**
- [ ] `linter-gate.ts` created (~200 lines)
- [ ] `canPromote()` returns false if ANY check fails
- [ ] ESLint check runs with Sigil rules
- [ ] TypeScript strict check implemented
- [ ] Detailed failure messages logged

---

### S1-T4: Create Survival Engine

**Description:** Auto-promote/demote based on survival + cleanliness.

**File:** `sigil-mark/process/survival-engine.ts`

**Functions to Implement:**
- `runSurvivalEngine(projectRoot, trigger)` - Main entry point
- `meetsSurvivalCriteria(stats)` - Check usage/stability/mutinies
- `meetsCleanlinessGate(componentPath)` - Run linter gate
- `promoteComponent()` - Move to higher tier
- `demoteComponent()` - Move to lower tier (immediate)
- `notifyPromotion()` - Send notification with veto window

**Survival Criteria:**
- 5+ Gold imports
- 2+ weeks stable
- 0 mutinies

**Acceptance Criteria:**
- [ ] `survival-engine.ts` created (~300 lines)
- [ ] Promotion requires survival AND cleanliness
- [ ] Demotion is immediate on modification
- [ ] 24h veto window for promotions
- [ ] Integrates with filesystem-registry and linter-gate

---

### S1-T5: Create Survival Stats Schema

**Description:** JSON schema for tracking component survival.

**File:** `.sigil/survival-stats.json`

**Schema:**
```json
{
  "version": 1,
  "lastUpdated": "ISO-8601",
  "components": {
    "ComponentName": {
      "tier": "silver",
      "goldImports": 7,
      "lastModified": "ISO-8601",
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

**Acceptance Criteria:**
- [ ] `.sigil/survival-stats.json` created
- [ ] Schema documented in code
- [ ] Read/write functions in survival-engine.ts

---

## Sprint 2: Executable Principles & Composition

**Goal:** Replace markdown with code, fix contagion deadlock

**Tasks:** 5

### S2-T1: Delete Markdown Principles

**Description:** Remove dead knowledge files.

**Files to Delete:**
- `sigil-mark/principles/motion-implementation.md`
- `sigil-mark/principles/color-oklch.md`
- `sigil-mark/principles/svg-patterns.md`
- `sigil-mark/principles/image-tooling.md`
- `sigil-mark/principles/README.md`

**Acceptance Criteria:**
- [ ] All 5 files in `sigil-mark/principles/` deleted
- [ ] `sigil-mark/principles/` directory removed
- [ ] No references to these files in CLAUDE.md

---

### S2-T2: Create useMotion Hook

**Description:** Motion physics as executable code.

**File:** `src/components/gold/hooks/useMotion.ts`

**Implementation:**
```typescript
export type PhysicsName = 'server-tick' | 'deliberate' | 'snappy' | 'smooth' | 'instant';

export const PHYSICS = {
  'server-tick': { duration: 600, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  'deliberate': { duration: 800, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  'snappy': { duration: 150, easing: 'ease-out' },
  'smooth': { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  'instant': { duration: 0, easing: 'linear' },
} as const;

export function useMotion(physics: PhysicsName): MotionStyle;
```

**Acceptance Criteria:**
- [ ] Directory `src/components/gold/hooks/` created
- [ ] `useMotion.ts` created (~50 lines)
- [ ] All 5 physics types defined with values
- [ ] Returns CSS transition string
- [ ] JSDoc with agent instruction

---

### S2-T3: Create Colors Utility

**Description:** OKLCH colors as executable code.

**File:** `src/components/gold/utils/colors.ts`

**Implementation:**
```typescript
export function oklch(l: number, c: number, h: number, a?: number): string {
  // Validate ranges, throw on invalid
  // Return oklch() CSS string
}

export const palette = {
  primary: oklch(0.5, 0.2, 250),
  success: oklch(0.6, 0.2, 145),
  danger: oklch(0.5, 0.25, 25),
  warning: oklch(0.7, 0.2, 85),
} as const;
```

**Acceptance Criteria:**
- [ ] Directory `src/components/gold/utils/` created
- [ ] `colors.ts` created (~60 lines)
- [ ] `oklch()` validates ranges and throws on invalid
- [ ] `palette` constant with semantic colors
- [ ] JSDoc with agent instruction

---

### S2-T4: Create Spacing Utility

**Description:** Spacing scale as executable code.

**File:** `src/components/gold/utils/spacing.ts`

**Implementation:**
```typescript
export const SPACING = {
  0: '0', 1: '4px', 2: '8px', 3: '12px', 4: '16px',
  5: '20px', 6: '24px', 8: '32px', 10: '40px', 12: '48px',
  16: '64px', 20: '80px', 24: '96px',
} as const;

export function spacing(key: SpacingKey): string;
```

**Acceptance Criteria:**
- [ ] `spacing.ts` created (~30 lines)
- [ ] All spacing values defined (4px base)
- [ ] Type-safe key constraint
- [ ] JSDoc with agent instruction

---

### S2-T5: Implement Slot-Based Composition

**Description:** Update ESLint rule to allow Draft content as children.

**File:** `packages/eslint-plugin-sigil/src/rules/gold-imports-only.ts`

**Current Behavior:** Block ALL Draft imports in Gold files.

**New Behavior:** Block direct imports, allow children composition.

**Pattern:**
```tsx
// BLOCKED: Direct import in Gold
import { Draft } from '../draft'; // ERROR

// ALLOWED: Feature code composes
<GoldButton>
  <DraftAnimation />  // OK - passed as child
</GoldButton>
```

**Acceptance Criteria:**
- [ ] ESLint rule updated to allow children pattern
- [ ] Direct imports still blocked
- [ ] Feature code can compose Draft into Gold
- [ ] Pattern documented in CLAUDE.md

---

## Sprint 3: CI/CD & Polish

**Goal:** Offload heavy ops, update documentation

**Tasks:** 5

### S3-T1: Create Pending Operations Schema

**Description:** Queue for heavy operations.

**File:** `.sigil/pending-ops.json`

**Schema:**
```json
{
  "version": 1,
  "operations": [
    {
      "id": "op-001",
      "type": "optimize-images",
      "files": ["public/hero.png"],
      "requestedAt": "ISO-8601",
      "status": "pending"
    }
  ]
}
```

**Acceptance Criteria:**
- [ ] `.sigil/pending-ops.json` created
- [ ] Schema supports multiple operation types
- [ ] Status tracking (pending/processing/complete)

---

### S3-T2: Create Survival Engine Workflow

**Description:** GitHub Actions workflow for survival engine.

**File:** `.github/workflows/sigil-survival.yml`

**Triggers:**
- Push to main

**Steps:**
1. Checkout
2. Install dependencies
3. Run survival engine
4. Commit changes (skip ci)

**Acceptance Criteria:**
- [ ] Workflow file created
- [ ] Runs on push to main
- [ ] Commits survival-stats.json updates
- [ ] Uses [skip ci] to prevent loops

---

### S3-T3: Create Operations Processor Workflow

**Description:** GitHub Actions workflow for pending ops.

**File:** `.github/workflows/sigil-ops.yml`

**Triggers:**
- Changes to `.sigil/pending-ops.json`

**Steps:**
1. Checkout
2. Process pending operations
3. Clear processed ops

**Acceptance Criteria:**
- [ ] Workflow file created
- [ ] Triggers on pending-ops.json change
- [ ] Processes and clears operations

---

### S3-T4: Update CLAUDE.md

**Description:** Document v7.6 architecture changes.

**Changes:**
- Remove nomination workflow section
- Add survival engine documentation
- Add slot composition pattern
- Add filesystem registry docs
- Remove background execution section
- Update version to 7.6.0

**Acceptance Criteria:**
- [ ] Nomination workflow section removed
- [ ] Survival engine section added
- [ ] Slot composition pattern documented
- [ ] Filesystem registry documented
- [ ] Version updated to 7.6.0

---

### S3-T5: Update Version Numbers

**Description:** Bump all version references to 7.6.0.

**Files:**
- `.claude/agents/sigil-craft.yaml`
- `sigil-mark/package.json` (if exists)
- Any other version references

**Acceptance Criteria:**
- [ ] All version references updated to 7.6.0
- [ ] sigil-craft.yaml version: 7.6.0
- [ ] Consistent versions across codebase

---

## Sprint Summary

| Sprint | Focus | Tasks | Key Deliverables |
|--------|-------|-------|------------------|
| 1 | Core Architecture | 5 | survival-engine.ts, linter-gate.ts, filesystem-registry.ts |
| 2 | Executable Principles | 5 | useMotion.ts, colors.ts, spacing.ts, slot composition |
| 3 | CI/CD & Polish | 5 | Workflows, CLAUDE.md, version bump |

**Total Tasks:** 15

---

## Success Metrics

| Metric | v7.5 | v7.6 Target |
|--------|------|-------------|
| PRs for promotion | Required | 0 |
| Markdown principles | 5 files | 0 files |
| Registry parsing | Yes | No |
| Contagion deadlock | Possible | Impossible |
| Linter gate | None | Required |
| Background ops | In agent | In CI |

---

## Dependencies

```
Sprint 1:
  S1-T1 (delete) → S1-T2 (filesystem-registry)
  S1-T2 → S1-T4 (survival-engine uses registry)
  S1-T3 (linter-gate) → S1-T4 (survival-engine uses gate)
  S1-T4 → S1-T5 (schema for engine)

Sprint 2:
  S2-T1 (delete principles) - independent
  S2-T2, S2-T3, S2-T4 - can run in parallel
  S2-T5 (slot composition) - independent

Sprint 3:
  S3-T1 → S3-T3 (ops workflow needs schema)
  S3-T2 (survival workflow) - depends on Sprint 1
  S3-T4, S3-T5 - can run in parallel
```

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Linter gate too strict | Nothing promotes | Make rules configurable |
| Filesystem race conditions | Incorrect tier | Use atomic operations |
| CI workflow loops | Infinite triggers | Use [skip ci] commits |
| Breaking existing code | Import errors | Run type check after changes |

---

## Exit Criteria

**Sprint 1 Complete When:**
- [ ] Survival engine can scan and identify promotion candidates
- [ ] Linter gate blocks unclean code
- [ ] Filesystem registry provides O(1) tier lookup

**Sprint 2 Complete When:**
- [ ] Markdown principles deleted
- [ ] Executable hooks/utils created
- [ ] Slot composition allows Draft children in Gold

**Sprint 3 Complete When:**
- [ ] CI workflows created and functional
- [ ] CLAUDE.md updated with v7.6 docs
- [ ] All versions bumped to 7.6.0

---

*Sprint Plan Generated: 2026-01-10*
*Next Step: `/implement sprint-1`*

---

# Addendum: Sigil v9.0 "Core Scaffold" Migration Sprint

**Version:** 9.0.0
**Codename:** Core Scaffold
**Status:** Sprint Plan
**Date:** 2026-01-11
**Based on:** PRD v9.0, SDD v9.0
**Reference:** [SIGIL_CURRENT_STATE.md](context/SIGIL_CURRENT_STATE.md)

---

## Executive Summary

This sprint plan covers the **migration** of existing Sigil code (~25K lines) to the grimoire structure. This is NOT a rebuild — the physics system, skills, and process modules already exist.

**Key Insight:** v9.0 is about consolidation and focus, not building.

### What Already Exists (DO NOT REBUILD)

| Component | Location | Lines |
|-----------|----------|-------|
| `useMotion` hook | `src/components/gold/hooks/useMotion.ts` | 229 |
| `colors` utility | `src/components/gold/utils/colors.ts` | 280 |
| `spacing` utility | `src/components/gold/utils/spacing.ts` | 248 |
| Process modules | `sigil-mark/process/` | ~22,000 (39 modules) |
| Claude skills | `.claude/skills/` | 47 skills |
| Kernel configs | `sigil-mark/kernel/` | 5 YAML files |

### Sprint Overview

| Sprint | Focus | Duration |
|--------|-------|----------|
| Sprint 1 | Grimoire Structure + Constitution Migration | 1 day |
| Sprint 2 | Process Layer + Skills Update | 1 day |
| Sprint 3 | Integration + Verification | 1 day |

**Total:** 3 days (migration, not build)

---

## Sprint 1: Grimoire Structure + Constitution Migration

**Goal:** Create grimoire directory structure and migrate kernel configs.

### Task 1.1: Create Grimoire Directory Structure

**ID:** S1-M1
**Description:** Create the `grimoires/sigil/` directory structure for the new grimoire pattern.

**Acceptance Criteria:**
- [ ] `grimoires/sigil/constitution/` directory exists
- [ ] `grimoires/sigil/moodboard/` directory exists
- [ ] `grimoires/sigil/process/` directory exists
- [ ] `grimoires/sigil/state/` directory exists
- [ ] `grimoires/sigil/README.md` exists with overview
- [ ] `grimoires/sigil/state/README.md` exists (placeholder for Phase 2)

**Effort:** Small
**Dependencies:** None

---

### Task 1.2: Migrate Kernel Configs to Constitution

**ID:** S1-M2
**Description:** Move kernel YAML files from `sigil-mark/kernel/` to `grimoires/sigil/constitution/`.

**Files to Move:**
```
sigil-mark/kernel/constitution.yaml  →  grimoires/sigil/constitution/constitution.yaml
sigil-mark/kernel/physics.yaml       →  grimoires/sigil/constitution/physics.yaml
sigil-mark/kernel/vocabulary.yaml    →  grimoires/sigil/constitution/vocabulary.yaml
sigil-mark/kernel/workflow.yaml      →  grimoires/sigil/constitution/workflow.yaml
sigil-mark/kernel/fidelity.yaml      →  grimoires/sigil/constitution/fidelity.yaml
```

**Acceptance Criteria:**
- [ ] All 5 YAML files moved to `grimoires/sigil/constitution/`
- [ ] Files are readable (no syntax errors)
- [ ] Original files removed from `sigil-mark/kernel/`

**Effort:** Small
**Dependencies:** Task 1.1

---

### Task 1.3: Migrate Moodboard

**ID:** S1-M3
**Description:** Move moodboard files from `sigil-mark/moodboard/` to `grimoires/sigil/moodboard/`.

**Acceptance Criteria:**
- [ ] All moodboard files moved to `grimoires/sigil/moodboard/`
- [ ] `moodboard.md` or equivalent exists
- [ ] Reference images preserved (if any)

**Effort:** Small
**Dependencies:** Task 1.1

---

### Task 1.4: Update .gitignore for State Directory

**ID:** S1-M4
**Description:** Add gitignore entries for the new state directory.

**Add to .gitignore:**
```gitignore
# Sigil grimoire state (private, per-project)
grimoires/sigil/state/*
!grimoires/sigil/state/README.md
```

**Acceptance Criteria:**
- [ ] `.gitignore` updated with state exclusions
- [ ] `README.md` in state directory is tracked

**Effort:** Trivial
**Dependencies:** Task 1.1

---

### Sprint 1 Exit Criteria

- [x] `grimoires/sigil/constitution/` has 5 YAML files
- [x] `grimoires/sigil/moodboard/` has reference files
- [x] `.gitignore` updated for state directory
- [x] `sigil-mark/kernel/` is empty (files moved)

**Status:** COMPLETED (2026-01-11) ✅

---

## Sprint 2: Process Layer + Skills Update

**Goal:** Migrate process modules and update skill paths to use grimoire.

### Task 2.1: Migrate Process Layer

**ID:** S2-M1
**Description:** Move process modules from `sigil-mark/process/` to `grimoires/sigil/process/`.

**Files to Move:**
```
sigil-mark/process/*.ts  →  grimoires/sigil/process/
(39 modules, ~22K lines)
```

**Key Modules:**
- `survival-engine.ts`
- `linter-gate.ts`
- `filesystem-registry.ts`
- `workshop-builder.ts`
- `workshop-query.ts`
- `physics-validator.ts`
- `physics-reader.ts`
- `vocabulary-reader.ts`
- `zone-reader.ts`
- `era-manager.ts`
- `survival-observer.ts`
- ... and 28 more

**Acceptance Criteria:**
- [ ] All 39 modules moved to `grimoires/sigil/process/`
- [ ] TypeScript compiles without errors
- [ ] No broken internal imports within process layer

**Effort:** Medium
**Dependencies:** Sprint 1 complete

---

### Task 2.2: Migrate Runtime State

**ID:** S2-M2
**Description:** Move runtime state files from `.sigil/` to `grimoires/sigil/state/`.

**Files to Move:**
```
.sigil/survival-stats.json  →  grimoires/sigil/state/survival-stats.json
.sigil/pending-ops.json     →  grimoires/sigil/state/pending-ops.json
```

**Note:** Some state files are generated on startup, so move what exists and update paths.

**Acceptance Criteria:**
- [ ] Existing state files moved to `grimoires/sigil/state/`
- [ ] `.sigil/` directory can be removed (after verification)
- [ ] State files are gitignored

**Effort:** Small
**Dependencies:** Task 1.4 (gitignore updated)

---

### Task 2.3: Update Skill Context Paths

**ID:** S2-M3
**Description:** Update skill `index.yaml` files to read from grimoire paths.

**Update `.claude/skills/crafting-components/index.yaml`:**
```yaml
context_files:
  - grimoires/sigil/constitution/physics.yaml
  - grimoires/sigil/constitution/vocabulary.yaml
  - grimoires/sigil/constitution/zones.yaml
```

**Update `.claude/skills/sigil-core/index.yaml`:**
```yaml
context_files:
  - grimoires/sigil/constitution/physics.yaml
  - grimoires/sigil/constitution/zones.yaml
  - grimoires/sigil/constitution/lenses.yaml
  - grimoires/sigil/constitution/fidelity.yaml
  - grimoires/sigil/constitution/vocabulary.yaml
  - grimoires/sigil/moodboard/moodboard.md
```

**Acceptance Criteria:**
- [ ] `crafting-components` skill points to grimoire paths
- [ ] `sigil-core` skill points to grimoire paths
- [ ] Skill loads without errors

**Effort:** Small
**Dependencies:** Tasks 1.2, 1.3 (configs migrated)

---

### Task 2.4: Update Process Module Imports

**ID:** S2-M4
**Description:** Update any imports in process modules that reference old paths.

**Search and Replace:**
- `sigil-mark/kernel/` → `grimoires/sigil/constitution/`
- `.sigil/` → `grimoires/sigil/state/`

**Acceptance Criteria:**
- [ ] No references to `sigil-mark/kernel/` in process modules
- [ ] No references to `.sigil/` in process modules
- [ ] TypeScript compiles without errors

**Effort:** Medium
**Dependencies:** Tasks 2.1, 2.2

---

### Sprint 2 Exit Criteria

- [x] `grimoires/sigil/process/` has 37 modules (36 .ts + 1 .tsx)
- [x] `grimoires/sigil/state/` has migrated state files
- [x] Skills read from grimoire paths
- [x] No broken imports in process layer
- [x] `sigil-mark/process/` is empty (files moved)
- [x] `.sigil/` is removed

**Status:** COMPLETED (2026-01-11) ✅

---

## Sprint 3: Integration + Verification

**Goal:** Ensure existing physics system works with grimoire structure and `/craft` command functions correctly.

### Task 3.1: Verify Physics System Works

**ID:** S3-M1
**Description:** Confirm existing `useMotion` hook at `src/components/gold/hooks/useMotion.ts` works correctly.

**Tests:**
- Import `useMotion` from `@/hooks/useMotion` or `src/components/gold/hooks/useMotion`
- Verify all 4 physics types work: `server-tick`, `deliberate`, `snappy`, `smooth`
- Verify physics values match constitution YAML

**Acceptance Criteria:**
- [ ] `useMotion('server-tick')` returns 600ms duration
- [ ] `useMotion('deliberate')` returns 800ms duration
- [ ] `useMotion('snappy')` returns 150ms duration
- [ ] `useMotion('smooth')` returns 300ms duration
- [ ] Hook exports work from both paths

**Effort:** Small
**Dependencies:** None (existing code)

---

### Task 3.2: Update CLAUDE.md with Grimoire Paths

**ID:** S3-M2
**Description:** Update project CLAUDE.md to reference grimoire paths and focus on `/craft` command.

**Changes:**
- Add grimoire path references
- Emphasize `/craft` command workflow
- Reference physics from grimoire constitution

**Acceptance Criteria:**
- [ ] CLAUDE.md references `grimoires/sigil/constitution/` for design context
- [ ] `/craft` command section is clear and actionable
- [ ] Physics reference table is accurate

**Effort:** Small
**Dependencies:** Sprint 1 complete

---

### Task 3.3: Update tsconfig.json Path Aliases (if needed)

**ID:** S3-M3
**Description:** Add path aliases for grimoire context if agent utilities need to import.

**Add to tsconfig.json paths:**
```json
{
  "paths": {
    "@sigil-context/*": ["grimoires/sigil/*"]
  }
}
```

**Acceptance Criteria:**
- [ ] Path aliases work for grimoire imports
- [ ] TypeScript compiles without path errors

**Effort:** Trivial
**Dependencies:** None

---

### Task 3.4: Test /craft Command Flow

**ID:** S3-M4
**Description:** Verify `/craft` command generates components with correct physics.

**Test Cases:**

| Input | Expected Physics | Reason |
|-------|------------------|--------|
| `/craft "claim button"` | `server-tick` (600ms) | "claim" → critical zone |
| `/craft "settings panel"` | `deliberate` (800ms) | "settings" → important zone |
| `/craft "tooltip on hover"` | `snappy` (150ms) | "tooltip" → casual zone |
| `/craft "animated card"` | `smooth` (300ms) | Default zone |

**Acceptance Criteria:**
- [ ] `/craft "claim button"` uses `useMotion('server-tick')`
- [ ] `/craft "settings panel"` uses `useMotion('deliberate')`
- [ ] `/craft "tooltip"` uses `useMotion('snappy')`
- [ ] Generated code imports from `@/hooks/useMotion`
- [ ] Generated code checks Gold registry first

**Effort:** Medium
**Dependencies:** Tasks 3.1, 3.2

---

### Task 3.5: Cleanup Legacy Directories

**ID:** S3-M5
**Description:** Remove or archive legacy directories after migration is verified.

**Cleanup:**
- Remove `sigil-mark/kernel/` (files moved to constitution)
- Remove `sigil-mark/process/` (files moved to grimoire)
- Remove `.sigil/` (files moved to state)
- Optionally create symlinks for backwards compatibility

**Acceptance Criteria:**
- [ ] `sigil-mark/kernel/` is empty or removed
- [ ] `sigil-mark/process/` is empty or removed
- [ ] `.sigil/` is empty or removed
- [ ] No broken references to old paths

**Effort:** Small
**Dependencies:** All other tasks complete

---

### Sprint 3 Exit Criteria

- [x] Existing `useMotion` hook works correctly
- [x] CLAUDE.md references grimoire paths
- [x] `/craft` command generates with correct physics
- [x] Legacy directories cleaned up
- [x] No TypeScript compilation errors

**Status:** COMPLETED (2026-01-11) ✅

---

## Final Verification Checklist

### Structure Verification

| Check | Status |
|-------|--------|
| `grimoires/sigil/constitution/` has 5 YAML files | |
| `grimoires/sigil/moodboard/` has reference files | |
| `grimoires/sigil/process/` has 39 modules | |
| `grimoires/sigil/state/` is gitignored | |
| `src/components/gold/hooks/useMotion.ts` exists (229 lines) | |
| `src/components/gold/utils/colors.ts` exists (280 lines) | |
| `src/components/gold/utils/spacing.ts` exists (248 lines) | |

### Functional Verification

| Test | Expected | Status |
|------|----------|--------|
| `/craft "deposit button"` | Uses `server-tick` | |
| `/craft "tooltip"` | Uses `snappy` | |
| `/craft "settings form"` | Uses `deliberate` | |
| Agent checks Gold first | Yes | |
| Agent uses hooks not raw CSS | Yes | |

### Migration Verification

| Check | Status |
|-------|--------|
| No files in `sigil-mark/kernel/` | |
| No files in `sigil-mark/process/` | |
| No files in `.sigil/` | |
| Skills read from grimoire paths | |
| TypeScript compiles without errors | |

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Broken imports after move | Run TypeScript compilation after each migration task |
| Skills fail to load | Verify skill YAML syntax before and after path updates |
| Physics values mismatch | Compare constitution YAML with TypeScript constants |
| State files missing | Only move existing files, generate others on first run |

---

## What's NOT in This Sprint (Phase 2+)

| Feature | Why Deferred |
|---------|--------------|
| Survival Engine activation | Needs usage patterns first |
| Linter Gate activation | Tied to survival engine |
| Context Accumulation | Manual defaults work initially |
| Diagnostician | Needs observability infrastructure |
| Gardener | Needs survival engine |
| Full zone migration | Focus on `/craft` first |

---

## Next Steps After Sprint Completion

1. **Verify `/craft` works** with all physics types
2. **Monitor usage patterns** to inform Phase 2
3. **Plan Phase 2** observability and survival engine activation

---

*v9.0 Sprint Plan Generated: 2026-01-11*
*Based on: PRD v9.0, SDD v9.0*
*Key Insight: This is a 3-day MIGRATION, not a build*
*Philosophy: Migrate existing ~25K lines, focus on `/craft` flow*
*Next Step: `/implement sprint-1`*
