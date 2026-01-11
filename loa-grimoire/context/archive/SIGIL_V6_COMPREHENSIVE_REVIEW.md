# Sigil v6.0 "Native Muse" → v6.1 "Agile Muse" — Comprehensive Implementation Review

> **Purpose**: This document synthesizes feedback from three independent reviews to provide Claude CLI with a complete picture of issues, their severity, and recommended fixe s. Use with `--ultrathink` for deep reasoning.

> **Review Sources**:
> - Technical Implementation Review (Code Quality Analysis)
> - Principal Engineer, Systems & Interfaces (Cache Coherence, Transparency)
> - Staff Design Engineer (Architecture, Philosophy)

---

## Executive Summary

### Ratings

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **Architecture** | 9.5/10 | Correct pivot from Governance to Ecological Survival |
| **Implementation** | 7/10 | Strong foundations, critical integration gaps |
| **Philosophy** | A | "Code is Precedent" is the right mental model |
| **Production Readiness** | B+ | Needs cache coherence + curation layer |

### The Pivot That Worked

**Old (v5.x)**: "Governance via Registries" — Static YAML rules, approval dialogs, maintenance rot.

**New (v6.0)**: "Code is Precedent. Survival is the Vote." — Patterns that survive in code are true.

**Verdict**: You nuked the YAML registries. Instead of asking "Is this approved?", you now ask "Has this survived?" This solves the Maintenance Rot problem. The documentation cannot lie because the code IS the documentation.

### The Three Laws (Validated)
1. **Code is Precedent** — Patterns that survive become canonical. ✅
2. **Survival is the Vote** — Usage frequency determines status. ⚠️ (Needs curation layer)
3. **Never Interrupt Flow** — No blocking dialogs. ✅

### Critical Issues Requiring Immediate Attention

| Issue | Severity | Category | Source |
|-------|----------|----------|--------|
| Missing hook scripts | P0 | Integration | Tech Review |
| Stale workshop cache risk | P0 | Architecture | Principal Eng |
| Wrong queryMaterial params | P0 | Implementation | Tech Review |
| "Mob Rule" survival flaw | P1 | Philosophy | Staff Design |
| Virtual Sanctuary "ghosts" | P1 | Architecture | Principal Eng |
| Vocabulary integration unused | P1 | Implementation | Tech Review |
| /forge breaks flow state | P2 | UX | Principal Eng |
| Weekly gardener latency | P2 | Operations | Principal Eng |

---

### 1.1 Missing Hook Integration Scripts 🚨 P0

**The Problem**: The agent definition references scripts that don't exist.

```yaml
# sigil-craft.yaml references:
PreToolUse:
  script: ".claude/skills/validating-physics/scripts/validate.sh"  # ❌ MISSING
PostToolUse:
  script: ".claude/skills/observing-survival/scripts/observe.sh"   # ❌ MISSING
Stop:
  script: ".claude/skills/chronicling-rationale/scripts/ensure-log.sh"  # ❌ MISSING
```

**Impact**: The entire hook lifecycle is non-functional. Physics validation never runs. Survival observation never triggers. Craft logs never generate.

**Fix**: Create bridge scripts that invoke TypeScript:

```bash
#!/bin/bash
# .claude/skills/validating-physics/scripts/validate.sh
set -euo pipefail

# Extract code from tool input
CODE="$1"
ZONE="${2:-standard}"

# Run TypeScript validator
npx tsx --eval "
import { validateForHook } from './sigil-mark/process/physics-validator.js';
const result = validateForHook(process.argv[1], '.sigil/workshop.json');
console.log(JSON.stringify(result));
" "$CODE"
```

```bash
#!/bin/bash
# .claude/skills/observing-survival/scripts/observe.sh
set -euo pipefail

FILE_PATH="$1"
CODE="$2"

npx tsx --eval "
import { observeAndTag } from './sigil-mark/process/survival-observer.js';
const { result } = observeAndTag(process.argv[2], process.argv[1], process.cwd());
console.log(JSON.stringify(result));
" "$FILE_PATH" "$CODE"
```

```bash
#!/bin/bash
# .claude/skills/chronicling-rationale/scripts/ensure-log.sh
set -euo pipefail

npx tsx --eval "
import { ensureSessionLog } from './sigil-mark/process/chronicling-rationale.js';
ensureSessionLog(process.cwd());
"
```

---

### 1.2 Vocabulary Integration Disconnect 🚨 P1

**The Problem**: `agent-orchestration.ts` has hardcoded vocabulary instead of using `vocabulary-reader.ts`.

```typescript
// agent-orchestration.ts lines 106-119 — HARDCODED ❌
const VOCABULARY_TERMS = [
  'claim', 'confirm', 'cancel', 'send', 'submit', 'delete',
  'trustworthy', 'critical', 'urgent', 'marketing', 'admin', 'dashboard',
];

// vocabulary-reader.ts — EXISTS but UNUSED ✅
// 671 lines of sophisticated term-to-feel mapping
```

**Impact**: The sophisticated vocabulary system (with materials, motions, tones) is completely bypassed. Zone resolution uses naive string matching instead of semantic understanding.

**Fix**: Refactor `agent-orchestration.ts`:

```typescript
// agent-orchestration.ts — REFACTORED
import { 
  loadVocabulary, 
  getAllTerms, 
  getTermFeel, 
  getRecommendedPhysics 
} from './vocabulary-reader';

let cachedVocabulary: Vocabulary | null = null;

export function extractVocabularyTerms(prompt: string, projectRoot: string = process.cwd()): string[] {
  if (!cachedVocabulary) {
    cachedVocabulary = loadVocabulary(projectRoot);
  }
  
  const allTerms = getAllTerms(cachedVocabulary);
  const lower = prompt.toLowerCase();
  
  return allTerms
    .filter(term => lower.includes(term.id) || lower.includes(term.user_facing.toLowerCase()))
    .map(term => term.id);
}

export function resolveZoneFromVocabulary(terms: string[], projectRoot: string = process.cwd()): string {
  if (!cachedVocabulary) {
    cachedVocabulary = loadVocabulary(projectRoot);
  }
  
  // Priority: critical > marketing > admin > standard
  for (const termId of terms) {
    const term = cachedVocabulary.terms[termId];
    if (term?.zones.includes('critical')) return 'critical';
  }
  for (const termId of terms) {
    const term = cachedVocabulary.terms[termId];
    if (term?.zones.includes('marketing')) return 'marketing';
  }
  // ... etc
  
  return 'standard';
}
```

---

### 1.3 Wrong Parameter Order 🚨 P0

**The Problem**: `queryMaterial` called with wrong argument order.

```typescript
// agent-orchestration.ts line 484
queryMaterial('framer-motion', workshop);  // ❌ WRONG

// workshop-builder.ts line 637 — actual signature
export function queryMaterial(workshop: Workshop, name: string): MaterialEntry | null
```

**Fix**: 
```typescript
queryMaterial(workshop, 'framer-motion');  // ✅ CORRECT
```

---

### 1.4 Startup Sentinel Incomplete 🚨 P1

**The Problem**: `runSentinel` checks staleness but doesn't rebuild.

```typescript
// startup-sentinel.ts — INCOMPLETE
export async function runSentinel(options: SentinelOptions): Promise<SentinelResult> {
  const staleness = checkWorkshopStaleness(projectRoot);
  if (staleness.stale) {
    // TODO: Actually rebuild the workshop
    return { stale: true, reason: staleness.reason };  // ❌ No rebuild
  }
}
```

**CLAUDE.md promises**:
```
if (package_hash changed || imports_hash changed) {
  quickRebuild()  // <2s incremental
}
```

**Fix**: Implement the rebuild:

```typescript
export async function runSentinel(options: SentinelOptions): Promise<SentinelResult> {
  const { projectRoot = process.cwd(), forceRebuild = false } = options;
  const staleness = checkWorkshopStaleness(projectRoot);
  
  if (staleness.stale || forceRebuild) {
    const start = performance.now();
    const buildResult = await buildWorkshop({ projectRoot });
    
    return {
      stale: true,
      reason: staleness.reason,
      rebuilt: buildResult.success,
      rebuildDurationMs: performance.now() - start,
      materialCount: buildResult.materialCount,
      componentCount: buildResult.componentCount,
    };
  }
  
  return { stale: false };
}
```

---

### 1.5 Version Inconsistencies ⚠️ P2

| File | Version | Should Be |
|------|---------|-----------|
| `sigil-mark/package.json` | 4.1.0 | 6.0.0 |
| `CLAUDE.md` | v6.0.0 | 6.0.0 ✅ |
| `CHANGELOG.md` | 6.0.0 | 6.0.0 ✅ |
| `vocabulary-reader.ts` header | v4.1 | 6.0.0 |
| `sigil-craft.yaml` | 6.0.0 | 6.0.0 ✅ |

**Fix**: Update all version references to 6.0.0.

---

### 1.6 YAML Parsing Fragility ⚠️ P2

**The Problem**: `workshop-builder.ts` uses regex for YAML parsing.

```typescript
// workshop-builder.ts lines 468-501 — FRAGILE ❌
const physicsMatch = content.match(/physics:\s*\n((?:\s+\w+:[\s\S]*?(?=\n\w|\n$|$))+)/);
```

**Breaks on**: Comments, multi-line values, anchors/aliases, non-standard indentation.

**Fix**: Use the `yaml` package (already a dependency):

```typescript
import YAML from 'yaml';

export function parseSigilConfig(configPath: string): {
  physics: Record<string, PhysicsDefinition>;
  zones: Record<string, ZoneDefinition>;
} {
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    const config = YAML.parse(content);
    
    return {
      physics: config.physics || {},
      zones: config.zones || {},
    };
  } catch {
    return { physics: {}, zones: {} };
  }
}
```

---

### 1.7 Craft Command vs Implementation Mismatch ⚠️ P2

**The Problem**: `/craft` command describes v2.6 features that don't exist in code.

**craft.md describes**:
- Constitution checking
- Locked decisions surfacing
- Persona physics application
- 7-step workflow with Process Context

**agent-orchestration.ts implements**:
- None of the above
- Different 7-phase flow without Constitution/Decisions

**Fix**: Either:
1. Update `craft.md` to match current implementation, OR
2. Implement Constitution/Decision checking in `agent-orchestration.ts`

---

## Part II: Cache Coherence Issues (Systems Review)

### 2.1 The "Stale Workshop" Risk 🚨 P0

**The Problem**: Workshop index can drift from filesystem reality.

**Scenarios**:
1. **Git Pull Blindspot**: `git pull` in another terminal changes files. Claude session doesn't see it.
2. **External Editor**: User edits file in VS Code/Vim while Claude runs.
3. **Result**: Agent suggests components that no longer exist or misses new props.

**Current Implementation**: Trusts cache implicitly.

```typescript
// workshop-builder.ts — TRUSTS CACHE ❌
export function loadWorkshop(workshopPath: string): Workshop {
  const content = fs.readFileSync(workshopPath, 'utf-8');
  return JSON.parse(content);  // No verification
}
```

**Fix**: Implement Verify-on-Read:

```typescript
// workshop-query.ts — VERIFY ON READ ✅
export function queryComponentVerified(
  workshop: Workshop, 
  name: string
): ComponentEntry | null {
  const entry = workshop.components[name];
  if (!entry) return null;
  
  // Verify file still exists and matches
  const fullPath = path.join(process.cwd(), entry.path);
  try {
    const stat = fs.statSync(fullPath);
    const currentHash = getFileHash(fullPath);
    
    // If file changed, invalidate and re-extract
    if (entry.hash && entry.hash !== currentHash) {
      console.warn(`[Workshop] Component ${name} changed on disk, re-indexing`);
      const refreshed = extractComponent(fullPath, process.cwd());
      if (refreshed) {
        workshop.components[name] = { ...refreshed, hash: currentHash };
      }
      return workshop.components[name];
    }
    
    return entry;
  } catch (err) {
    // File no longer exists
    console.warn(`[Workshop] Component ${name} no longer exists at ${entry.path}`);
    delete workshop.components[name];
    return null;
  }
}
```

**Add hash to ComponentEntry**:

```typescript
export interface ComponentEntry {
  path: string;
  tier: ComponentTier;
  zone?: string;
  physics?: string;
  vocabulary?: string[];
  imports: string[];
  hash?: string;  // ADD: Content hash for verification
}
```

---

### 2.2 The "Virtual Ghost" Confusion 🚨 P1

**The Problem**: Virtual Sanctuary creates ambiguity when mixing with real code.

**Scenarios**:
1. User asks for Button. Agent sees Virtual Button (seed) AND Real Button (user's code). Which wins?
2. User deletes Real Button. Does Virtual Button "resurrect"?

**Current Implementation**: "Fading" creates ghosts.

```typescript
// seed-manager.ts — FADING CREATES GHOSTS ❌
if (realComponentExists) {
  virtualComponent.status = 'faded';  // Still in memory!
}
```

**Fix**: Implement Hard Eviction:

```typescript
// seed-manager.ts — HARD EVICTION ✅
export function loadSeedWithEviction(projectRoot: string): Seed | null {
  const seed = loadRawSeed(projectRoot);
  if (!seed) return null;
  
  const sanctuaryPath = path.join(projectRoot, 'src/sanctuary');
  
  // Hard evict any virtual component that has a real counterpart
  for (const [name, virtualComponent] of Object.entries(seed.components)) {
    const realPath = findRealComponent(name, sanctuaryPath);
    if (realPath) {
      delete seed.components[name];  // HARD DELETE, not fade
    }
  }
  
  return seed;
}

// Explicit command to restore seed
export function resetSeed(projectRoot: string): void {
  const seedPath = path.join(projectRoot, '.sigil/seed.yaml');
  const templatePath = path.join(projectRoot, '.sigil/seed-template.yaml');
  fs.copyFileSync(templatePath, seedPath);
}
```

**Rule**: If `src/components/` is non-empty, disable Virtual Sanctuary entirely for that subdirectory.

---

## Part III: Philosophical Issues (Architecture Review)

### 3.1 "Mob Rule" — Survival of the Mediocre 🚨 P1

**The Problem**: Survival measures virality, not quality.

**Scenario**:
1. Junior engineer copies bad pattern (hardcoded spinner instead of `useTransition`)
2. 4 other engineers copy that pattern
3. v6.0 promotes it to "Canonical" based on 5 occurrences
4. Bad code becomes enshrined as "Gold Standard"

**Current Implementation**:
```typescript
// survival-observer.ts — PURE DEMOCRACY ❌
export function determineStatus(occurrences: number): PatternStatus {
  if (occurrences >= 5) return 'canonical';
  if (occurrences >= 3) return 'surviving';
  return 'experimental';
}
```

**Fix**: Implement Curated Permissionless (Staff Design Engineer recommendation):

```typescript
// survival-observer.ts — CURATED PROMOTION ✅
export interface PromotionConfig {
  /** Occurrences needed for automatic survival */
  survivalThreshold: number;  // 3
  /** Occurrences needed for canonical CANDIDACY (not automatic promotion) */
  canonicalCandidateThreshold: number;  // 5
  /** Whether to require taste-key approval for canonical */
  requireTasteKeyForCanonical: boolean;  // true
}

export function determineStatus(
  occurrences: number,
  config: PromotionConfig,
  tasteKeyApproved: boolean = false
): PatternStatus {
  if (occurrences >= config.canonicalCandidateThreshold) {
    // Survival generates CANDIDATES; Taste Owner generates CANON
    return tasteKeyApproved ? 'canonical' : 'canonical-candidate';
  }
  if (occurrences >= config.survivalThreshold) {
    return 'surviving';
  }
  return 'experimental';
}
```

**Add Taste Key approval workflow**:

```yaml
# .sigil/taste-key.yaml
holder: "design-lead@company.com"
pending_promotions:
  - pattern: "spinner-loading"
    occurrences: 7
    first_seen: "2026-01-05"
    status: "canonical-candidate"
    files: ["Button.tsx", "Card.tsx", "Modal.tsx", ...]
    # Awaiting taste-key approval
```

---

### 3.2 "/forge" Breaks Flow State ⚠️ P2

**The Problem**: Explicit `/forge` command taxes innovation.

**Reality**: Creativity is rarely premeditated. Users don't think "I will now innovate." They just write code that breaks rules because the rules don't fit the new problem.

**Current Implementation**:
```typescript
// forge-mode.ts — EXPLICIT MODE SWITCH ❌
export function detectForgeTrigger(prompt: string): ForgeTrigger | null {
  if (prompt.includes('/forge') || prompt.includes('--forge')) {
    return { active: true };
  }
  return null;
}
```

**Fix**: Implement Optimistic Divergence:

```typescript
// physics-validator.ts — OPTIMISTIC DIVERGENCE ✅
export function validatePhysicsOptimistic(
  code: string,
  options: ValidationOptions = {}
): ValidationResult {
  const result = validatePhysics(code, options);
  
  if (!result.valid) {
    // Don't block — tag as divergent instead
    return {
      valid: true,  // Allow the code
      violations: result.violations,
      divergent: true,  // Flag for gardener
      divergentTag: `/** @sigil-status divergent */`,
    };
  }
  
  return result;
}
```

**Gardener handles divergence**:
```typescript
// gardener.ts — POST-HOC CLASSIFICATION ✅
export function classifyDivergence(pattern: PatternEntry): 'mistake' | 'innovation' {
  // If divergent pattern survives 2+ weeks with 3+ occurrences → innovation
  if (pattern.age >= 14 && pattern.occurrences >= 3) {
    return 'innovation';
  }
  // If divergent pattern dies (0 occurrences after existing) → mistake
  if (pattern.occurrences === 0 && pattern.wasGreaterThanZero) {
    return 'mistake';
  }
  return 'pending';
}
```

**Delete `/forge` command entirely**. Let users write whatever they want. Classify post-hoc.

---

### 3.3 Weekly Gardener Latency ⚠️ P2

**The Problem**: Weekly gardener creates 6-day feedback gap.

**Scenario**:
1. Engineer builds new pattern on Monday
2. Team adopts it on Tuesday
3. Agent thinks it's anomaly until Sunday
4. For 6 days, agent fights team's new direction

**Current Implementation**:
```bash
# gardener.sh — WEEKLY CRON ❌
# Intended to run weekly via cron
```

**Fix**: Implement Merge-Driven Gardening:

```yaml
# .github/workflows/sigil-gardener.yaml
name: Sigil Gardener
on:
  push:
    branches: [main]
  pull_request:
    types: [closed]
    branches: [main]

jobs:
  garden:
    if: github.event.pull_request.merged == true || github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Gardener
        run: |
          npm run sigil:garden
          git add .sigil/survival.json
          git commit -m "chore(sigil): update survival index" || true
          git push
```

**Logic**: If code survives peer review and lands in main, it is sanctified. Update immediately.

---

## Part IV: Testing Gaps

### 4.1 Missing Integration Tests 🚨 P1

**Need tests for**:
1. Full craft flow with real filesystem
2. Claude Code hook → TypeScript orchestration
3. Workshop staleness → rebuild → query cycle
4. Survival observation → gardener → promotion cycle

```typescript
// __tests__/e2e/full-craft-flow.test.ts
describe('Full Craft Flow E2E', () => {
  let tempDir: string;
  
  beforeEach(async () => {
    tempDir = await createTempProject({
      packageJson: { dependencies: { 'framer-motion': '^11.0.0' } },
      sanctuary: { 'Button.tsx': BUTTON_FIXTURE },
    });
  });
  
  it('runs complete flow: startup → discovery → context → validation → observation → chronicling', async () => {
    const result = await runCraftFlow(
      'Create a trustworthy claim button',
      'ClaimButton',
      { projectRoot: tempDir }
    );
    
    expect(result.success).toBe(true);
    expect(result.context.zone).toBe('critical');
    expect(result.context.physics).toBe('deliberate');
    expect(fs.existsSync(path.join(tempDir, '.sigil/craft-log'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, '.sigil/survival.json'))).toBe(true);
  });
});
```

### 4.2 Missing Cache Coherence Tests 🚨 P1

```typescript
// __tests__/process/cache-coherence.test.ts
describe('Cache Coherence', () => {
  it('detects file deletion and invalidates index', async () => {
    const tempDir = await createTempProject();
    await buildWorkshop({ projectRoot: tempDir });
    
    // Delete a component
    fs.unlinkSync(path.join(tempDir, 'src/sanctuary/Button.tsx'));
    
    // Query should return null, not stale data
    const workshop = loadWorkshop(path.join(tempDir, '.sigil/workshop.json'));
    const result = queryComponentVerified(workshop, 'Button');
    
    expect(result).toBeNull();
  });
  
  it('detects file modification and re-indexes', async () => {
    const tempDir = await createTempProject();
    await buildWorkshop({ projectRoot: tempDir });
    
    // Modify a component
    const buttonPath = path.join(tempDir, 'src/sanctuary/Button.tsx');
    fs.appendFileSync(buttonPath, '\n// Modified');
    
    const workshop = loadWorkshop(path.join(tempDir, '.sigil/workshop.json'));
    const result = queryComponentVerified(workshop, 'Button');
    
    expect(result).not.toBeNull();
    // Should have re-indexed
  });
});
```

---

## Part V: Prioritized Action Plan

### P0 — Critical (Blocks Core Functionality)

| # | Issue | File(s) | Fix |
|---|-------|---------|-----|
| 1 | Missing hook scripts | `.claude/skills/*/scripts/` | Create 3 bridge scripts |
| 2 | Wrong queryMaterial params | `agent-orchestration.ts:484` | Swap argument order |
| 3 | Workshop cache can't be trusted | `workshop-query.ts` | Implement verify-on-read |
| 4 | Sentinel doesn't rebuild | `startup-sentinel.ts` | Add buildWorkshop call |

### P1 — High (Significant Quality/Safety Issues)

| # | Issue | File(s) | Fix |
|---|-------|---------|-----|
| 5 | Vocabulary integration unused | `agent-orchestration.ts` | Import vocabulary-reader |
| 6 | "Mob Rule" survival | `survival-observer.ts` | Add taste-key curation |
| 7 | Virtual ghosts | `seed-manager.ts` | Hard eviction |
| 8 | Missing E2E tests | `__tests__/e2e/` | Add full flow tests |

### P2 — Medium (Technical Debt)

| # | Issue | File(s) | Fix |
|---|-------|---------|-----|
| 9 | /forge breaks flow | `forge-mode.ts` | Optimistic divergence |
| 10 | Weekly gardener latency | `gardener.sh`, CI | Merge-driven gardening |
| 11 | Version inconsistencies | Multiple | Standardize to 6.0.0 |
| 12 | YAML regex parsing | `workshop-builder.ts` | Use yaml package |
| 13 | craft.md vs implementation | `craft.md`, orchestration | Align docs to code |

### P3 — Low (Polish)

| # | Issue | File(s) | Fix |
|---|-------|---------|-----|
| 14 | Skill count mismatch | `CLAUDE.md` | Fix "10" to "11" |
| 15 | Missing architecture diagram | `docs/` | Add visual |
| 16 | No error recovery docs | `docs/` | Document failure modes |

---

## Part VI: Implementation Order

### Phase 1: Make It Work (P0 fixes)
```
1. Create hook scripts (validate.sh, observe.sh, ensure-log.sh)
2. Fix queryMaterial parameter order
3. Implement workshop rebuild in startup-sentinel.ts
4. Add verify-on-read to workshop queries
```

### Phase 2: Make It Safe (P1 fixes)
```
5. Integrate vocabulary-reader into agent-orchestration
6. Add taste-key curation layer to survival
7. Implement hard eviction for Virtual Sanctuary
8. Add E2E integration tests
```

### Phase 3: Make It Fast (P2 fixes)
```
9. Convert /forge to optimistic divergence
10. Set up merge-driven gardening CI
11. Standardize versions to 6.0.0
12. Replace YAML regex with yaml package
```

### Phase 4: Make It Polish (P3 fixes)
```
13. Fix documentation inconsistencies
14. Add architecture diagrams
15. Document error recovery flows
```

---

## Appendix A: Test Coverage Targets

| Area | Current | Target | Priority |
|------|---------|--------|----------|
| Physics Validator | ~95% | 100% | P0 |
| Survival Observer | ~80% | 90% | P1 |
| Workshop Builder | ~70% | 85% | P1 |
| Agent Orchestration | ~40% | 80% | P1 |
| Hook Integration | 0% | 70% | P0 |
| Cache Coherence | 0% | 90% | P0 |

---

## Appendix B: File Inventory

### Files to Create
```
.claude/skills/validating-physics/scripts/validate.sh
.claude/skills/observing-survival/scripts/observe.sh
.claude/skills/chronicling-rationale/scripts/ensure-log.sh
.github/workflows/sigil-gardener.yaml
sigil-mark/__tests__/e2e/full-craft-flow.test.ts
sigil-mark/__tests__/process/cache-coherence.test.ts
```

### Files to Modify
```
sigil-mark/process/agent-orchestration.ts  # Vocabulary integration, param fix
sigil-mark/process/startup-sentinel.ts     # Add rebuild
sigil-mark/process/workshop-builder.ts     # YAML parsing
sigil-mark/process/workshop-query.ts       # Verify-on-read
sigil-mark/process/survival-observer.ts    # Taste-key curation
sigil-mark/process/seed-manager.ts         # Hard eviction
sigil-mark/process/forge-mode.ts           # Optimistic divergence
sigil-mark/package.json                    # Version bump
```

---

## Appendix C: The Corrected Mental Model

### Before (v6.0 as implemented)
```
User Prompt
    ↓
[Cached Workshop] → [Pattern Selection] → [Generate] → [Observe]
    ↓                     ↓
 May be stale      Pure democracy (5 = canonical)
```

### After (v6.0 "Agile Muse")
```
User Prompt
    ↓
[Vocabulary Reader] → [Zone/Physics Resolution]
    ↓
[Cached Workshop] → [VERIFY ON READ] → [Pattern Selection]
    ↓                     ↓
 Self-healing       Curated promotion
    ↓                     ↓
[Generate (optimistic)] → [Tag divergent if needed]
    ↓
[Observe] → [Merge-driven Gardener] → [Taste Key Approval]
```

---

## Appendix D: The "Agile Muse" Toolkit (Principal Engineer Recommendations)

Moving from "Native Muse" (Cached/Passive) to "Agile Muse" (Verified/Active).

### D.1 Verify-on-Read Indexing

**Mechanism**: Use `workshop.json` for discovery (<5ms), but `fs.read` for retrieval.

```typescript
// Pseudo-code flow
function getComponent(name: string): Component {
  // 1. Fast lookup in index
  const entry = workshop.components[name];  // <5ms
  if (!entry) return null;
  
  // 2. Verify reality
  const stats = fs.statSync(entry.path);  // ~1ms
  
  // 3. Match check
  if (stats.mtime > entry.indexed_at) {
    // File changed since indexing
    return reindexAndReturn(entry.path);
  }
  
  // 4. Return trusted entry
  return entry;
}
```

**Logic**: `get_component("Button")` → Lookup Index → `src/Button.tsx` → `fs.stat()` → Match? → Return File. Mismatch? → Re-index file → Return File.

### D.2 The "Murderous" Reality

**Rule**: Local file existence checks MUST precede Virtual Sanctuary injection.

```typescript
// seed-manager.ts — MURDEROUS EVICTION
export function loadSeedWithReality(projectRoot: string): Seed {
  const seed = loadRawSeed(projectRoot);
  const realComponents = scanRealComponents(projectRoot);
  
  // Reality MURDERS virtuality
  for (const realName of realComponents) {
    delete seed.components[realName];  // Hard delete, not fade
  }
  
  // If ANY real components exist, consider sanctuary "active"
  if (realComponents.length > 0) {
    seed.status = 'faded';  // Virtual sanctuary is dormant
  }
  
  return seed;
}
```

**Principle**: If `src/components/` is not empty, disable Virtual Sanctuary entirely for that subdirectory. Don't mix ghosts and living code.

### D.3 Implicit Forging (Optimistic Divergence)

**Behavior**: If a user prompts for "weird 3D button" in a flat design system:

1. Agent checks Physics (is it valid React?). Yes.
2. Agent checks Taste (is it flat?). No.
3. **Action**: Generate it anyway.
4. **Tag**: Append `/** @sigil-status divergent */`.

```typescript
// physics-validator.ts — OPTIMISTIC DIVERGENCE
export function validateOptimistic(code: string, context: Context): ValidationResult {
  const physicsResult = validatePhysics(code);
  const tasteResult = validateTaste(code, context);
  
  if (!physicsResult.valid) {
    // Physics violations are BLOCKING (safety)
    return { allow: false, reason: physicsResult.reason };
  }
  
  if (!tasteResult.valid) {
    // Taste violations are TAGGING (observation)
    return { 
      allow: true,  // Let it through
      divergent: true,
      tag: `/** @sigil-status divergent: ${tasteResult.reason} */`,
    };
  }
  
  return { allow: true };
}
```

**Flow**: The user gets their code. The system marks it as probationary. The Gardener decides if it was a mistake or innovation.

### D.4 Merge-Driven Gardening

**Mechanism**: Run Gardener on merge to main, not weekly cron.

```yaml
# .github/workflows/sigil-gardener.yaml
name: Sigil Gardener
on:
  push:
    branches: [main]
  pull_request:
    types: [closed]
    branches: [main]

jobs:
  garden:
    if: github.event.pull_request.merged == true || github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install Dependencies
        run: npm ci
        
      - name: Run Gardener
        run: npx tsx sigil-mark/process/garden-command.ts
        
      - name: Commit Survival Index
        run: |
          git config user.name "Sigil Gardener"
          git config user.email "gardener@sigil.dev"
          git add .sigil/survival.json
          git diff --staged --quiet || git commit -m "chore(sigil): update survival index [skip ci]"
          git push
```

**Logic**: If code survives peer review and lands in main, it is sanctified. Update the index immediately.

---

## Appendix E: Proving the Bias

### Assumption
Design systems fail when they optimize for documentation over developer experience.

### Proof via v6.0
v6.0 correctly moves away from `rules.md` (documentation) towards `workshop.json` (code reality).

### However
By introducing `/forge` and "Virtual Fading," it re-introduces conceptual documentation (modes and invisible rules) that the user has to keep in their head.

### Correction
By automating the gardening on merge and verifying the index on read, we remove the mental load of managing the system state. The "documentation" becomes the literal behavior of the agent, which aligns with the Vercel/Linear standard of **"it just works."**

### The Linear Standard

From the reference document on Linear:
> "Saarinen has explicitly stated a philosophy of ignoring user feedback that does not align with the product vision... Linear prioritizes the daily experience of the 'Maker' over the reporting needs of the 'Buyer.'"

**Application to Sigil**: 
- The "Maker" is the developer in flow state
- The "Buyer" is the governance system requesting compliance
- Sigil must prioritize the Maker

---

## Summary

**The architecture is sound. The implementation has gaps.**

The philosophical pivot from Governance to Ecological Survival is correct. The Workshop Index solves latency. Virtual Sanctuary addresses cold starts. But:

1. **The hooks don't exist** — Core functionality is disconnected
2. **The cache can lie** — No verify-on-read
3. **Democracy without curation** — Survival needs a taste-key
4. **Flow-breaking /forge** — Should be optimistic divergence
5. **Weekly gardener is too slow** — Should be merge-driven

### Required Corrections (Staff Design Engineer)

> "You need a 'Constitution' that overrides 'Survival.' Just because a weed survives in the garden doesn't mean it should be canonized; it means the Gardener is asleep."

1. **Stop counting usage as the only metric for "Gold"**
2. **Implement the "Taste Key"** (single human approver) for promoting Surviving to Canonical
3. **Survival generates candidates; Taste Owner generates Canon**

### The Path Forward

```
Fix in order: P0 → P1 → P2 → P3

P0 (Make It Work):
├── Create hook scripts
├── Fix queryMaterial params
├── Implement verify-on-read
└── Add workshop rebuild to sentinel

P1 (Make It Safe):
├── Integrate vocabulary-reader
├── Add taste-key curation
├── Hard eviction for Virtual Sanctuary
└── Add E2E tests

P2 (Make It Fast):
├── Optimistic divergence (delete /forge)
├── Merge-driven gardening
├── Version standardization
└── YAML parsing fix

P3 (Make It Polish):
├── Documentation alignment
├── Architecture diagrams
└── Error recovery docs
```

**Expected outcome after fixes**: A production-ready design context framework that:
- Respects flow (never interrupts)
- Enforces soul via curated survival (not pure democracy)
- Handles cache coherence (verify-on-read)
- Handles the messy reality of human collaboration (optimistic divergence)

**Final Verdict** (Principal Engineer): 
> "This architecture is production-ready. It respects the flow, enforces the soul via survival, and allows for the messy reality of human collaboration. Ship it."

**Conditional on**: Implementing verify-on-read, killing /forge, and adding merge-driven gardening.

---

*Review compiled from:*
- *Technical Implementation Review (Code Quality Analysis)*
- *Principal Engineer, Systems & Interfaces (Cache Coherence, Transparency)*
- *Staff Design Engineer (Architecture, Philosophy)*

*Date: 2026-01-09*
