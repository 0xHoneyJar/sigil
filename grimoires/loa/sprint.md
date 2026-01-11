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
