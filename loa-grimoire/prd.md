# Product Requirements Document: Sigil v7.6 "The Living Canon"

> *"Stop asking for permission to be great. If the code survives and is clean, it is Gold."*

**Version:** 7.6.0
**Codename:** The Living Canon
**Status:** PRD Complete
**Date:** 2026-01-10
**Supersedes:** Sigil v7.5.0 "The Reference Studio" PRD
**Sources:** SIGIL_LIVING_CANON_ARCHITECTURE.md (3 Reviewer Consensus)

---

## 1. Executive Summary

Sigil v7.6 "The Living Canon" addresses 6 fatal flaws identified in v7.5 implementation by 3 independent reviewers (Principal Engineer, Staff Design Engineer, Senior Agent Architect).

**The Problem with v7.5:**
- Nomination PRs = bureaucracy (governance over flow)
- Markdown principles = dead knowledge (essays, not physics)
- Contagion rules = deadlock (can't iterate on Gold)
- Registry parsing = overhead (build step for simple lookup)
- Usage = quality (mob rule promotes bad patterns)
- Background execution = flow interruption (30s blocks)

**The v7.6 Solution:**
- **Survival Engine**: Auto-promote based on survival + cleanliness (human vetoes, not approves)
- **Executable Principles**: Hooks and utilities, not markdown essays
- **Slot-Based Composition**: Gold frames accept Draft content via children
- **Filesystem as Database**: Path IS the API (`ls src/components/gold`)
- **Linter Gate**: Usage generates candidacy, cleanliness generates promotion
- **Offload to CI/CD**: Agent writes intent, CI executes heavy ops

**Ratings from Review:**

| Reviewer | v7.5 Score | v7.6 Target |
|----------|-----------|-------------|
| Senior Agent Architect | 9/10 | 10/10 |
| Principal Engineer | 7/10 | 9.9/10 |
| Staff Design Engineer | A- | A |

> Source: SIGIL_LIVING_CANON_ARCHITECTURE.md:662-668

---

## 2. Problem Statement

### 2.1 The Six Fatal Flaws

All three reviewers converged on the same critical issues:

#### Flaw 1: Nomination PRs are Bureaucracy

> "If a pattern is used 5 times without reverting, it IS the standard. We do not need a ceremony to confirm reality."
> — Principal Engineer

**v7.5 Error**: `nomination-generator.ts` creates PRs requiring human approval.

**Impact**: Governance interrupts flow. Engineers wait for approval instead of shipping.

> Source: SIGIL_LIVING_CANON_ARCHITECTURE.md:24-33

---

#### Flaw 2: Markdown Principles are Dead Knowledge

> "You are teaching the agent to read Essays, not Physics."
> — Staff Design Engineer

**v7.5 Error**: `principles/*.md` files that the agent reads and interprets.

**Impact**: Principles become opinions. Opinions are ignored under pressure.

> Source: SIGIL_LIVING_CANON_ARCHITECTURE.md:37-47

---

#### Flaw 3: Contagion Creates Deadlock

> "To change a leaf node, you have to burn down the entire tree."
> — Staff Design Engineer

**Scenario**:
1. You have a Gold Button
2. You want to test a Draft animation inside it
3. ESLint blocks (contagion rule)
4. You must downgrade Button to Silver
5. Now Header (Gold) can't import SilverButton → cascade failure

**Impact**: Experimentation requires dismantling stable components.

> Source: SIGIL_LIVING_CANON_ARCHITECTURE.md:50-63

---

#### Flaw 4: Registry Parsing is Overhead

> "The Agent shouldn't need to parse a registry to know if a component is Gold. It should just look at the path."
> — Principal Engineer

**v7.5 Error**: `registry-parser.ts` adds build step / runtime calculation.

**Impact**: Simple lookups require complex parsing. Maintenance burden.

> Source: SIGIL_LIVING_CANON_ARCHITECTURE.md:66-73

---

#### Flaw 5: Usage Equals Quality (Mob Rule)

> "If a Junior copy-pastes a button with hardcoded z-index: 9999 five times, your agent will nominate this pattern for Gold status. You are automating the canonization of technical debt."
> — Staff Design Engineer

**v7.5 Error**: 5 uses = canonical, regardless of code quality.

**Impact**: Bad patterns get enshrined. Technical debt becomes "standard."

> Source: SIGIL_LIVING_CANON_ARCHITECTURE.md:76-82

---

#### Flaw 6: Background Execution Blocks Flow

> "If your agent needs 30 seconds, you have failed Flow State."
> — Principal Engineer

**v7.5 Error**: Heavy operations (image processing) block agent loop.

**Impact**: Engineer waits 30+ seconds. Flow state destroyed.

> Source: SIGIL_LIVING_CANON_ARCHITECTURE.md:345-350

---

## 3. Vision & Goals

### 3.1 Vision

```
From "Reference Studio" (Bureaucracy) to "Living Canon" (Survival + Execution)
```

### 3.2 The Corrected Mental Model

**Before (v7.5):**
```
Pattern Used 5 Times
    ↓
[Nomination Generator] → [Create PR] → [Human Approval] → [Merge]
    ↓                         ↓
 Ceremony required      Flow interrupted
```

**After (v7.6):**
```
Pattern Used 5 Times
    ↓
[Survival Engine] → [Linter Gate Check]
    ↓                     ↓
 Auto-promote        If fails: notify, don't promote
    ↓
[Notification] → [Human can VETO within 24h]
    ↓
 Gold (if no veto)
```

### 3.3 The Three Laws (Evolved for v7.6)

1. **Survival is the vote** — But cleanliness is the gate
2. **Human vetoes, not approves** — Invert the control
3. **Executable, not descriptive** — Hooks > Markdown

### 3.4 Success Metrics

| Metric | v7.5 Actual | v7.6 Target |
|--------|-------------|-------------|
| PRs for promotion | Required | **0 (auto + veto)** |
| Markdown principles | 4+ files | **0 files** |
| Registry parsing | Yes | **No (filesystem)** |
| Contagion deadlock | Possible | **Impossible (slots)** |
| Usage → Quality gate | None | **Linter required** |
| Background ops in agent | Yes | **No (CI/CD)** |

---

## 4. Requirements by Priority

### 4.1 P0 — Critical (Core Architecture Changes)

#### P0-1: Implement Survival Engine (Replace Nomination Generator)

**Delete**: `sigil-mark/process/nomination-generator.ts`

**Create**: `sigil-mark/process/survival-engine.ts`

**Requirements:**
- P0-1.1: Auto-promote when survival + cleanliness criteria met
- P0-1.2: Survival criteria: 5+ Gold imports, 2+ weeks stable, 0 mutinies
- P0-1.3: Cleanliness criteria: ESLint 0 warnings, TSC strict, no hardcoded values
- P0-1.4: Send notification with 24h veto window
- P0-1.5: Auto-confirm if no veto after 24h
- P0-1.6: Auto-demote on modification or 3+ mutinies (immediate, no waiting)

**Interface:**
```typescript
interface SurvivalEngine {
  trigger: 'git-push' | 'weekly-cron';

  promotion: {
    survivalCriteria: {
      goldImports: '>= 5',
      stabilityWeeks: '>= 2',
      mutinies: '0',
    };
    cleanlinessCriteria: {
      eslint: 'max-warnings 0',
      typescript: 'strict',
      noHardcoded: true,
    };
    action: 'auto-promote';
    vetoWindow: '24h';
  };

  demotion: {
    criteria: 'modified OR 3+ mutinies';
    action: 'auto-demote';
    immediate: true;
  };
}
```

**Acceptance Criteria:**
- [ ] `nomination-generator.ts` deleted
- [ ] `survival-engine.ts` created
- [ ] Promotion requires survival AND cleanliness
- [ ] Notification sent with veto option
- [ ] Auto-confirm after 24h with no veto
- [ ] Demotion is immediate (no waiting)

> Source: SIGIL_LIVING_CANON_ARCHITECTURE.md:98-176

---

#### P0-2: Implement Linter Gate

**Create**: `sigil-mark/process/linter-gate.ts`

**Requirements:**
- P0-2.1: ESLint check with `sigil/no-hardcoded-values` rule
- P0-2.2: ESLint check with `sigil/use-tokens` rule
- P0-2.3: TypeScript strict mode check
- P0-2.4: No `any` types allowed
- P0-2.5: No `console.log` statements
- P0-2.6: JSDoc required for exported functions
- P0-2.7: Return boolean `canPromote()` result

**Interface:**
```typescript
interface LinterGate {
  checks: {
    eslint: { maxWarnings: 0, rules: string[] };
    typescript: { strict: true, noAny: true };
    sigil: { noConsoleLogs: true, hasDocstring: true };
  };

  canPromote(component: string): Promise<boolean>;
}
```

**Acceptance Criteria:**
- [ ] `linter-gate.ts` created
- [ ] All checks implemented
- [ ] Returns false if any check fails
- [ ] Logs specific failures for debugging

> Source: SIGIL_LIVING_CANON_ARCHITECTURE.md:386-439

---

#### P0-3: Convert Markdown Principles to Executable Code

**Delete**: `sigil-mark/principles/*.md` (all 4 files)

**Create**: Executable hooks and utilities in `src/components/gold/`

**Requirements:**
- P0-3.1: Create `src/components/gold/hooks/useMotion.ts` (replaces motion-implementation.md)
- P0-3.2: Create `src/components/gold/utils/colors.ts` (replaces color-oklch.md)
- P0-3.3: Create `src/components/gold/utils/spacing.ts` (spacing scale)
- P0-3.4: Physics values as TypeScript constants, not markdown prose
- P0-3.5: Type-safe enforcement at compile time

**useMotion.ts:**
```typescript
export function useMotion(physics: PhysicsName): MotionStyle {
  const PHYSICS = {
    'server-tick': { duration: 600, easing: 'ease-out' },
    'deliberate': { duration: 800, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    'snappy': { duration: 150, easing: 'ease-out' },
    'smooth': { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  } as const;

  return {
    transition: `all ${PHYSICS[physics].duration}ms ${PHYSICS[physics].easing}`,
  };
}
```

**colors.ts:**
```typescript
export function oklch(l: number, c: number, h: number, a = 1): string {
  if (l < 0 || l > 1) throw new Error('Lightness must be 0-1');
  if (c < 0 || c > 0.4) throw new Error('Chroma must be 0-0.4');
  if (h < 0 || h > 360) throw new Error('Hue must be 0-360');

  return `oklch(${l * 100}% ${c} ${h} / ${a})`;
}

export const palette = {
  primary: oklch(0.5, 0.2, 250),
  success: oklch(0.6, 0.2, 145),
  danger: oklch(0.5, 0.25, 25),
} as const;
```

**Acceptance Criteria:**
- [ ] `principles/*.md` deleted (4 files)
- [ ] `useMotion.ts` created with physics constants
- [ ] `colors.ts` created with OKLCH enforcement
- [ ] `spacing.ts` created with scale
- [ ] All hooks/utils are type-safe
- [ ] Agent instruction: "Use useMotion for all motion"

> Source: SIGIL_LIVING_CANON_ARCHITECTURE.md:179-236

---

#### P0-4: Implement Slot-Based Composition (Fix Contagion Deadlock)

**Modify**: ESLint rules to allow Draft content via children

**Requirements:**
- P0-4.1: Gold components accept `React.ReactNode` for content slots
- P0-4.2: ESLint allows Draft→Gold when passed as children (not imported)
- P0-4.3: Update `gold-imports-only` rule to exclude children props
- P0-4.4: Document slot pattern in CLAUDE.md

**Pattern:**
```typescript
// Gold component defines frame
export function Button({ children, icon }: ButtonProps) {
  return (
    <button>
      {icon && <span className="icon-slot">{icon}</span>}
      {children}
    </button>
  );
}

// Feature code composes Draft into Gold
import { Button } from '@/gold';
import { DraftAnimation } from '@/draft';

export function ClaimButton() {
  return (
    <Button>
      <DraftAnimation />  {/* Draft as child, not import in Gold */}
      Claim Rewards
    </Button>
  );
}
```

**Rule**: "Gold defines the frame. The content can be Draft."

**Acceptance Criteria:**
- [ ] Gold components use `ReactNode` for content slots
- [ ] ESLint allows Draft content as children
- [ ] No cascade failure when iterating
- [ ] Pattern documented in CLAUDE.md

> Source: SIGIL_LIVING_CANON_ARCHITECTURE.md:240-288

---

#### P0-5: Replace Registry Parsing with Filesystem Lookup

**Delete**: `sigil-mark/process/registry-parser.ts`

**Create**: `sigil-mark/process/filesystem-registry.ts`

**Requirements:**
- P0-5.1: Tier determined by path: `src/components/gold/Button.tsx` = Gold
- P0-5.2: No parsing required, just `fs.existsSync()`
- P0-5.3: Auto-generate `index.ts` files from directory contents
- P0-5.4: Index regeneration on file change

**Implementation:**
```typescript
function getTier(componentName: string): RegistryTier | null {
  if (fs.existsSync(`src/components/gold/${componentName}.tsx`)) return 'gold';
  if (fs.existsSync(`src/components/silver/${componentName}.tsx`)) return 'silver';
  if (fs.existsSync(`src/components/draft/${componentName}.tsx`)) return 'draft';
  return null;
}

async function regenerateIndex(tier: RegistryTier): Promise<void> {
  const files = await fs.readdir(`src/components/${tier}`);
  const exports = files
    .filter(f => f.endsWith('.tsx') && f !== 'index.ts')
    .map(f => `export * from './${f.replace('.tsx', '')}';`)
    .join('\n');

  await fs.writeFile(`src/components/${tier}/index.ts`, exports);
}
```

**Acceptance Criteria:**
- [ ] `registry-parser.ts` deleted
- [ ] `filesystem-registry.ts` created
- [ ] Path lookup replaces parsing
- [ ] Index files auto-generated
- [ ] Agent instruction: "To check tier, check path exists"

> Source: SIGIL_LIVING_CANON_ARCHITECTURE.md:294-342

---

#### P0-6: Offload Heavy Operations to CI/CD

**Modify**: Heavy operations write intent, CI executes

**Requirements:**
- P0-6.1: Create `.sigil/pending-ops.json` for queued operations
- P0-6.2: Agent writes intent instead of executing
- P0-6.3: GitHub Actions workflow processes pending ops
- P0-6.4: Notification when ops complete

**Agent behavior:**
```typescript
// BEFORE (v7.5): Agent performs heavy operation
async function optimizeImages(files: string[]): Promise<void> {
  // 30+ seconds of image processing... ❌
}

// AFTER (v7.6): Agent writes intent
async function requestImageOptimization(files: string[]): Promise<void> {
  await appendToConfig('.sigil/pending-ops.json', {
    operation: 'optimize-images',
    files,
    requestedAt: new Date().toISOString(),
  });

  console.log(`Queued ${files.length} images for optimization on next build.`);
}
```

**GitHub Actions:**
```yaml
# .github/workflows/sigil-ops.yml
on:
  push:
    branches: [main]
jobs:
  process-pending-ops:
    runs-on: ubuntu-latest
    steps:
      - run: npx sigil process-pending-ops
```

**Rule**: "The Agent is an orchestrator, not a worker node."

**Acceptance Criteria:**
- [ ] Pending ops config created
- [ ] Agent writes intent for heavy ops
- [ ] CI workflow processes ops
- [ ] No 30s+ blocks in agent loop

> Source: SIGIL_LIVING_CANON_ARCHITECTURE.md:345-383

---

### 4.2 P1 — High (Supporting Infrastructure)

#### P1-1: Update Sentinel Validator for Slot Composition

**Modify**: `sigil-mark/process/sentinel-validator.ts`

**Requirements:**
- P1-1.1: Allow Draft content passed as children to Gold
- P1-1.2: Block direct imports of Draft into Gold (unchanged)
- P1-1.3: Detect slot pattern and allow

**Acceptance Criteria:**
- [ ] Slot pattern recognized
- [ ] Direct imports still blocked
- [ ] Children composition allowed

---

#### P1-2: Update PreToolUse Hook for Filesystem Registry

**Modify**: `.claude/hooks/pre-tool-use.yaml` and `sentinel-validate.sh`

**Requirements:**
- P1-2.1: Use filesystem lookup instead of registry parsing
- P1-2.2: Faster validation (<20ms target)
- P1-2.3: Remove registry cache (not needed)

**Acceptance Criteria:**
- [ ] Hook uses filesystem lookup
- [ ] Validation faster than v7.5
- [ ] No registry caching overhead

---

#### P1-3: Create Survival Stats Tracker

**Create**: `.sigil/survival-stats.json`

**Requirements:**
- P1-3.1: Track usage count per component
- P1-3.2: Track mutation history (modifications)
- P1-3.3: Track mutiny count (overrides/reverts)
- P1-3.4: Track stability duration

**Schema:**
```json
{
  "components": {
    "Button": {
      "tier": "silver",
      "goldImports": 7,
      "lastModified": "2026-01-01",
      "stabilityWeeks": 3,
      "mutinies": 0
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Stats tracked per component
- [ ] Updated on git push
- [ ] Used by survival engine

---

### 4.3 P2 — Medium (Polish)

#### P2-1: Update CLAUDE.md for v7.6

**Modify**: `CLAUDE.md`

**Requirements:**
- P2-1.1: Remove nomination workflow section
- P2-1.2: Add survival engine documentation
- P2-1.3: Add slot composition pattern
- P2-1.4: Update filesystem registry docs
- P2-1.5: Remove background execution section (offloaded to CI)

---

#### P2-2: Update Version Numbers

**Modify**: All version references to 7.6.0

---

#### P2-3: Clean Up Deleted Files

**Delete**:
- `sigil-mark/process/nomination-generator.ts`
- `sigil-mark/process/registry-parser.ts`
- `sigil-mark/principles/motion-implementation.md`
- `sigil-mark/principles/color-oklch.md`
- `sigil-mark/principles/svg-patterns.md`
- `sigil-mark/principles/image-tooling.md`
- `sigil-mark/principles/README.md`

---

## 5. File Changes Summary

### Files to Delete

| File | Reason |
|------|--------|
| `sigil-mark/process/nomination-generator.ts` | Replaced by survival engine |
| `sigil-mark/process/registry-parser.ts` | Replaced by filesystem lookup |
| `sigil-mark/principles/*.md` (5 files) | Replaced by executable code |

### Files to Create

| File | Purpose |
|------|---------|
| `sigil-mark/process/survival-engine.ts` | Auto-promote/demote with veto |
| `sigil-mark/process/linter-gate.ts` | Cleanliness gate for promotion |
| `sigil-mark/process/filesystem-registry.ts` | Path-based tier lookup |
| `src/components/gold/hooks/useMotion.ts` | Motion physics as code |
| `src/components/gold/utils/colors.ts` | OKLCH colors as code |
| `src/components/gold/utils/spacing.ts` | Spacing scale as code |
| `.sigil/survival-stats.json` | Usage/stability tracking |
| `.sigil/pending-ops.json` | Heavy ops queue for CI |
| `.github/workflows/sigil-ops.yml` | Process pending ops |

### Files to Modify

| File | Changes |
|------|---------|
| `sigil-mark/process/sentinel-validator.ts` | Slot composition support |
| `.claude/hooks/pre-tool-use.yaml` | Filesystem registry |
| `.claude/hooks/scripts/sentinel-validate.sh` | Filesystem registry |
| `packages/eslint-plugin-sigil/src/rules/gold-imports-only.ts` | Allow children |
| `CLAUDE.md` | v7.6 documentation |
| `.claude/agents/sigil-craft.yaml` | Version 7.6.0 |

---

## 6. Implementation Phases

### Sprint 1: Core Architecture (P0-1 to P0-3)
1. Delete nomination-generator.ts, create survival-engine.ts
2. Create linter-gate.ts
3. Delete principles/*.md, create executable hooks/utils

**Exit Criteria**: Survival engine running, principles executable.

### Sprint 2: Composition & Registry (P0-4 to P0-5)
4. Implement slot-based composition
5. Delete registry-parser.ts, create filesystem-registry.ts
6. Auto-generate index files

**Exit Criteria**: No contagion deadlock, filesystem as database.

### Sprint 3: CI/CD & Polish (P0-6, P1, P2)
7. Offload heavy ops to CI
8. Update sentinel and hooks
9. Clean up deleted files, update docs

**Exit Criteria**: No flow interruption, clean codebase.

---

## 7. Success Metrics

| Metric | v7.5 | v7.6 Target | Measurement |
|--------|------|-------------|-------------|
| PRs for promotion | Required | 0 | Count PRs |
| Markdown principles | 4 files | 0 files | File count |
| Registry parsing | Yes | No | Code audit |
| Contagion deadlock | Possible | Impossible | Try slot pattern |
| Linter gate | None | Required | Promotion logs |
| Background ops | In agent | In CI | Timing audit |

---

## 8. The Final Principles

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

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Veto window too short | Promoted bad code | Configurable window (24h default) |
| Linter gate too strict | Nothing promotes | Configurable rules |
| Filesystem race conditions | Incorrect tier | Atomic operations |
| CI queue backlog | Delayed ops | Priority queue |
| Index generation conflicts | Git merge issues | Deterministic ordering |

---

## 10. Out of Scope

- Multi-repo support
- Custom veto workflows
- Alternative linters (only ESLint)
- Non-TypeScript projects

---

*PRD Generated: 2026-01-10*
*Sources: SIGIL_LIVING_CANON_ARCHITECTURE.md*
*Next Step: `/architect` for Software Design Document*
