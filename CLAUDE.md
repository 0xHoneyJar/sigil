# Sigil: Design Context Framework

> "Stop asking for permission to be great. If the code survives and is clean, it is Gold."

## What is Sigil?

Sigil is a design context framework that helps AI agents make consistent design decisions by:

1. **Pre-computed Workshop Index** — 5ms queries instead of 200ms JIT grep
2. **Virtual Sanctuary** — Seeds for cold start projects (Linear-like, Vercel-like, Stripe-like)
3. **Physics Validation** — Block physics violations, not novelty
4. **Survival-Based Precedent** — Patterns earn status through usage, not approval dialogs
5. **Context Forking** — Ephemeral inspiration without polluting taste
6. **10 Claude Code Skills** — Complete lifecycle with hooks
7. **v7.6: Survival Engine** — Auto-promote with 24h veto window, no nomination PRs
8. **v7.6: Executable Principles** — TypeScript hooks/utils instead of markdown docs
9. **v7.6: Linter Gate** — Quality gate (ESLint + TSC + Sigil checks) before promotion
10. **v7.6: Slot-Based Composition** — Gold frames accept Draft children

---

## The Three Laws of v7.6 "The Living Canon"

1. **Code is Precedent** — Patterns that survive become canonical. No governance dialogs.
2. **Survival + Cleanliness = Gold** — Usage is necessary, linter gate is sufficient.
3. **Never Interrupt Flow** — Observe silently, promote automatically, veto if needed.

---

## v7.6 Quality Gates

1. **Survival Criteria** — 5+ Gold imports, 2+ weeks stable, 0 mutinies
2. **Linter Gate** — ESLint 0 warnings, TSC strict, no console.log, has docstring
3. **Slot-Based Composition** — Gold components accept Draft as children (no direct import)
4. **CI/CD Offload** — Heavy operations queued for GitHub Actions, not agent

---

## The Seven Laws (Foundation)

1. **Filesystem is Truth** — Workshop index + live grep for verification
2. **Type Dictates Physics** — Money → server-tick, Task → crdt, Toggle → local-first
3. **Zone is Layout, Not Business Logic** — Zone determines feel, not behavior
4. **Status Propagates** — Your tier is only as good as your weakest dependency
5. **One Good Reason > 15% Silent Mutiny** — Capture bypasses, don't block them
6. **Never Refuse Outright** — Always offer alternatives
7. **Let Artists Stay in Flow** — Never auto-fix on save. Polish is deliberate.

---

## Quick Reference

### Commands (v6.1)

| Command | Purpose | Description |
|---------|---------|-------------|
| `/craft` | Design guidance | Zone-aware generation with workshop |
| `/inspire` | Ephemeral reference | One-time fetch, forked context |
| `/sanctify` | Promote pattern | Save ephemeral inspiration to rules |
| `/garden` | Pattern gardening | Merge-driven survival scanning |
| `/audit` | Cohesion check | Visual consistency variance report |
| `/new-era` | Era transition | Archive patterns, fresh tracking |
| `/approve` | v6.1: Approve pattern | Promote canonical-candidate to canonical |
| `/reset-seed` | v6.1: Reset seed | Restore Virtual Sanctuary after eviction |

### Skill Commands

| Skill | Trigger | Purpose |
|-------|---------|---------|
| scanning-sanctuary | Component lookup | Live ripgrep discovery |
| graphing-imports | Startup | Scan src/ for dependencies |
| querying-workshop | /craft | Fast workshop index queries |
| validating-physics | PreToolUse | Block physics + tag taste violations |
| seeding-sanctuary | Cold start | Virtual taste from seeds |
| inspiring-ephemerally | "like [url]" | Forked context fetch |
| managing-eras | /new-era | Era transitions |
| observing-survival | PostToolUse | Silent pattern tracking |
| chronicling-rationale | Stop | Craft log generation |
| auditing-cohesion | /audit | Visual consistency checks |

### Key Files

| File | Purpose |
|------|---------|
| `.sigil/workshop.json` | Pre-computed index (materials, components, physics) |
| `.sigil/survival-stats.json` | v7.6: Component survival tracking |
| `.sigil/pending-ops.json` | v7.6: CI/CD operation queue |
| `.sigil/survival.json` | Pattern tracking (status, occurrences, files) |
| `.sigil/seed.yaml` | Virtual Sanctuary taste (cold starts) |
| `.sigil/craft-log/*.md` | Session craft logs |
| `.sigil/eras/*.json` | Archived era patterns |
| `sigil-mark/moodboard.md` | Product feel, references |
| `sigil-mark/rules.md` | Design rules by category |
| `sigil-mark/vocabulary/vocabulary.yaml` | Term definitions |
| `.sigilrc.yaml` | Zone definitions, physics |

### v7.6 Executable Principles

| File | Purpose |
|------|---------|
| `src/components/gold/hooks/useMotion.ts` | Motion physics hook |
| `src/components/gold/utils/colors.ts` | OKLCH color system |
| `src/components/gold/utils/spacing.ts` | 4px-based spacing scale |
| `sigil-mark/process/survival-engine.ts` | Auto-promotion engine |
| `sigil-mark/process/linter-gate.ts` | Quality gate checks |
| `sigil-mark/process/filesystem-registry.ts` | Path-based tier lookup |

---

## Agent Protocol (v6.0)

### Before Generating UI Code

1. **Startup Sentinel** — Check workshop freshness
   ```
   if (package_hash changed || imports_hash changed) {
     quickRebuild()  // <2s incremental
   }
   ```

2. **Load Context** — Query pre-computed workshop
   ```
   queryMaterial("framer-motion")  // <5ms
   queryComponent("Button")        // <5ms
   queryPhysics("deliberate")      // <5ms
   ```

3. **Determine Zone** — From vocabulary or file path
   ```
   extractVocabularyTerms(prompt)  // "claim", "deposit"
   → resolveZone()                 // critical
   → resolvePhysics()              // deliberate
   ```

4. **Select Patterns** — Prefer canonical over experimental
   ```
   querysurvival("animation:spring")
   → status: canonical (5+ occurrences)
   → prefer this pattern
   ```

5. **Validate Physics** — PreToolUse hook
   ```
   checkZoneConstraints()      // critical + playful → BLOCK
   checkMaterialConstraints()  // clay + 0ms → BLOCK
   checkApiCorrectness()       // motion.animate → suggest motion.div
   checkFidelityCeiling()      // 3D in standard → BLOCK
   ```

### During Generation

Physics validation only blocks on:
- Zone-physics mismatch
- Material-timing mismatch
- Invalid API usage
- Fidelity ceiling exceeded

Physics validation does NOT block on:
- Pattern novelty
- Style innovation
- New approaches

### After Generation (PostToolUse)

Pattern observation (silent):
1. Detect patterns in generated code
2. Add @sigil-pattern JSDoc tag
3. Update survival.json
4. No interruption, no dialog

### Session End (Stop Hook)

Craft log generation:
1. Collect decisions from session
2. Write to `.sigil/craft-log/{date}-{component}.md`
3. Include zone, physics, patterns, checks

---

## Craft Flow Phases

The sigil-craft agent orchestrates 7 phases:

```
Phase 1: Startup
├── Check workshop freshness
└── Rebuild if stale (<2s)

Phase 2: Discovery
├── Scan Sanctuary (ripgrep)
└── Query workshop index

Phase 3: Context
├── Extract vocabulary terms
├── Resolve zone
└── Resolve physics

Phase 4: Validation
├── Zone constraints
├── Material constraints
├── API correctness
└── Fidelity ceiling

Phase 5: Generation
├── Select canonical patterns
├── Apply physics
└── Generate code

Phase 6: Observation
├── Detect patterns
├── Tag code
└── Update survival

Phase 7: Chronicling
├── Collect decisions
└── Write craft log
```

---

## Workshop Index

Pre-computed at `.sigil/workshop.json`:

```json
{
  "indexed_at": "2026-01-08T00:00:00Z",
  "package_hash": "abc123",
  "imports_hash": "def456",
  "materials": {
    "framer-motion": {
      "version": "11.15.0",
      "exports": ["motion", "AnimatePresence"],
      "signatures": ["motion.div", "motion.button"]
    }
  },
  "components": {
    "Button": {
      "path": "src/sanctuary/Button.tsx",
      "tier": "gold",
      "zone": "standard",
      "physics": ["snappy"]
    }
  },
  "physics": {
    "deliberate": { "timing": 800, "easing": "ease-out" },
    "snappy": { "timing": 150, "easing": "ease-out" }
  },
  "zones": {
    "critical": { "physics": "deliberate" },
    "standard": { "physics": "warm" }
  }
}
```

### Performance Targets

| Operation | Target | Actual |
|-----------|--------|--------|
| Workshop query | <5ms | ~2ms |
| Sanctuary scan | <50ms | ~30ms |
| Full rebuild | <2s | ~1.5s |
| Pattern observation | <10ms | ~5ms |
| Craft log generation | <100ms | ~50ms |

---

## Survival Index

Pattern tracking at `.sigil/survival.json`:

```json
{
  "era": "v1",
  "era_started": "2026-01-08",
  "last_scan": "2026-01-08T12:00:00Z",
  "patterns": {
    "animation:spring-entrance": {
      "status": "canonical",
      "first_seen": "2026-01-01",
      "occurrences": 7,
      "files": ["Button.tsx", "Card.tsx", "Modal.tsx"]
    },
    "animation:fade-exit": {
      "status": "experimental",
      "first_seen": "2026-01-07",
      "occurrences": 2,
      "files": ["Tooltip.tsx"]
    }
  }
}
```

### Pattern Promotion (v6.1)

| Status | Occurrences | Behavior |
|--------|-------------|----------|
| experimental | 1-2 | Tracked, not preferred |
| surviving | 3-4 | Preferred over new |
| canonical-candidate | 5+ | Awaiting approval |
| canonical | 5+ approved | Standard pattern |

v6.1: Patterns at 5+ occurrences become `canonical-candidate` and require `/approve` for promotion to canonical.

### Merge-Driven Gardening (v6.1)

GitHub Actions workflow runs on every merge to main:

```yaml
# .github/workflows/sigil-gardener.yaml
on:
  push:
    branches: [main]
    paths:
      - 'src/**/*.tsx'
      - 'src/**/*.ts'
```

Latency: <5 min (replaces weekly cron)

---

## Virtual Sanctuary (Seeds)

For cold start projects without existing components:

### Available Seeds

| Seed | Feel | Physics |
|------|------|---------|
| Linear-like | Minimal, monochrome | snappy (150ms) |
| Vercel-like | Bold, high-contrast | sharp (100ms) |
| Stripe-like | Soft gradients | smooth (300ms) |
| Blank | No preset | default |

### Seed Selection

```
if (src/sanctuary/ is empty) {
  prompt user: "Select a seed taste"
  write to .sigil/seed.yaml
}
```

### Hard Eviction (v6.1)

When ANY real component exists, ALL virtual components are evicted:
```
Virtual Button exists in seed
Real Button created in Sanctuary
→ ALL virtual components deleted
→ Eviction status persisted to seed.yaml
→ Use /reset-seed to restore if needed
```

v6.1: Hard eviction replaces soft "fade" behavior to prevent ghost components.

---

## Ephemeral Inspiration

One-time external reference without polluting taste:

```
User: "Make it like stripe.com"

Agent:
1. Fork context (no survival access)
2. Fetch and extract styles
3. Generate code with extracted styles
4. Discard fetched content
5. Only generated code remains
```

### /sanctify Command

Promote ephemeral pattern to permanent:
```bash
/sanctify "gradient-border"
→ Extracts pattern from recent generation
→ Adds to rules.md
→ Logs sanctification
```

---

## Optimistic Divergence (v6.1)

Taste violations are tagged, not blocked:

```typescript
// Physics violations → BLOCK
checkZoneConstraints()      // critical + playful → BLOCK
checkMaterialConstraints()  // clay + 0ms → BLOCK
checkApiCorrectness()       // motion.animate → BLOCK

// Taste violations → TAG
checkFidelityCeiling()      // 3D in standard → TAG with @sigil-status divergent
```

### Divergent Pattern Tagging

```typescript
/** @sigil-status divergent - 2 taste deviation(s) */
export function AnimatedCard() {
  // Code with taste violations (allowed but tracked)
}
```

### Classification

| Violation Type | Action | Rationale |
|---------------|--------|-----------|
| Zone-physics mismatch | BLOCK | Safety |
| Material-timing mismatch | BLOCK | Safety |
| API errors | BLOCK | Safety |
| Fidelity preferences | TAG | Taste |
| Style deviations | TAG | Taste |
| Non-canonical patterns | TAG | Taste |

---

## Era Management

Design direction shifts without losing history:

```bash
/new-era "Tactile"
→ Archives current patterns to .sigil/eras/v1.json
→ Creates new era "Tactile"
→ Resets pattern counts (history preserved)
→ Updates rules.md with era marker
```

### Era in Craft Logs

```markdown
# Craft Log: 2026-01-08 - Button

**Era:** Tactile
**Zone:** critical
**Physics:** deliberate

## Decisions
- Used spring animation (canonical in era)
```

---

## Cohesion Auditing

Visual consistency checks on demand:

```bash
/audit ClaimButton
```

### Variance Report

```
Property       | Expected | Actual | Variance
---------------|----------|--------|----------
shadow         | 0 2 4    | 0 4 8  | 45% ⚠️
border-radius  | 8px      | 8px    | 0%
spacing        | 16px     | 16px   | 0%
```

### Thresholds

| Property | Allowed Variance |
|----------|-----------------|
| Shadow | 20% |
| Border radius | 10% |
| Spacing | 15% |
| Colors | 10% |

### Justified Deviations

```typescript
/**
 * @sigil-deviation shadow
 * Reason: Modal needs stronger shadow for elevation
 */
```

---

## Craft Logs

Automatic documentation via Stop hook:

```markdown
# Craft Log: 2026-01-08 - ClaimButton

**Request:** "trustworthy claim button with animation"
**Era:** v1
**Zone:** critical
**Physics:** deliberate (800ms)

## Decisions
| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Zone | critical | Vocabulary: "claim" |
| Physics | deliberate | Zone constraint |
| Animation | spring | Canonical pattern |

## New Patterns
- animation:confirmation-pulse (experimental)

## Physics Validated
- [x] Zone constraint
- [x] Material constraint
- [x] API correctness
- [x] Fidelity ceiling
```

---

## useSigilMutation Hook

Runtime hook for mutations (unchanged from v5.0):

```tsx
import { useSigilMutation } from 'sigil-mark';

function ClaimButton({ poolId }) {
  const { execute, simulate, confirm, state, physics } = useSigilMutation({
    mutation: () => api.claim(poolId),
    dataType: 'financial',
  });

  return (
    <button
      onClick={async () => {
        const preview = await simulate();
        if (userConfirms(preview)) {
          confirm();
          await execute();
        }
      }}
      disabled={state === 'pending'}
    >
      Claim
    </button>
  );
}
```

---

## Zone Layouts

Pre-built layouts that set zone context:

```tsx
import { CriticalZone, GlassLayout, MachineryLayout } from 'sigil-mark';

// Critical zone: deliberate physics
<CriticalZone financial>
  <ClaimButton />
</CriticalZone>

// Glass layout: smooth physics
<GlassLayout>
  <BrowsePanel />
</GlassLayout>

// Machinery layout: instant physics
<MachineryLayout>
  <AdminDashboard />
</MachineryLayout>
```

---

## Directory Structure

```
.sigil/
├── workshop.json        # Pre-computed index
├── survival-stats.json  # v7.6: Component survival tracking
├── pending-ops.json     # v7.6: CI/CD operation queue
├── survival.json        # Pattern tracking
├── seed.yaml           # Virtual Sanctuary
├── craft-log/          # Session logs
│   └── {date}-{component}.md
└── eras/               # Archived eras
    └── {era-name}.json

src/components/
├── gold/               # v7.6: Promoted components
│   ├── hooks/
│   │   └── useMotion.ts
│   └── utils/
│       ├── colors.ts
│       └── spacing.ts
├── silver/             # Promoted but not gold
└── draft/              # Experimental

sigil-mark/
├── kernel/            # Constitution (unchanged)
├── providers/         # SigilProvider
├── hooks/             # useSigilMutation
├── layouts/           # Zone layouts
├── process/           # Agent-time utilities (v7.6)
│   ├── survival-engine.ts      # v7.6: Auto-promotion
│   ├── linter-gate.ts          # v7.6: Quality gate
│   ├── filesystem-registry.ts  # v7.6: Tier lookup
│   ├── workshop-builder.ts
│   ├── workshop-query.ts
│   ├── startup-sentinel.ts
│   ├── physics-validator.ts
│   ├── seed-manager.ts
│   ├── era-manager.ts
│   ├── survival-observer.ts
│   ├── chronicling-rationale.ts
│   └── auditing-cohesion.ts
├── moodboard.md
└── rules.md

.claude/
├── skills/
│   ├── scanning-sanctuary/
│   ├── graphing-imports/
│   ├── querying-workshop/
│   ├── validating-physics/
│   ├── seeding-sanctuary/
│   ├── inspiring-ephemerally/
│   ├── forging-patterns/
│   ├── managing-eras/
│   ├── observing-survival/
│   ├── chronicling-rationale/
│   └── auditing-cohesion/
└── agents/
    └── sigil-craft.yaml
```

---

## Coexistence with Loa

Sigil and Loa can coexist. They have separate:
- State zones (sigil-mark/ + .sigil/ vs loa-grimoire/)
- Config files (.sigilrc.yaml vs .loa.config.yaml)
- Skills (design-focused vs workflow-focused)

No automatic cross-loading - developer decides when to reference design context.

---

## Migration from v5.0

See [MIGRATION.md](MIGRATION.md) for migration guide.

Key changes:
- Added `.sigil/` directory for runtime state
- Workshop index replaces JIT grep
- Survival observation replaces governance dialogs
- Seeds for cold starts
- Ephemeral inspiration for one-time references

---

*Sigil v7.6.0 "The Living Canon"*
*Last Updated: 2026-01-10*
