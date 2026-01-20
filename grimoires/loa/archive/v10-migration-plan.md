# Sigil v10.0 "Invisible Studio" Migration Plan

> Migrate from v9.1 "Migration Debt Zero" to v10.0 "Invisible Studio"

---

## Executive Summary

**Problem**: Current Sigil (v9.1) has accumulated complexity:
- 49 skills when only 3 are needed
- 36 process files with overlapping concerns
- No invisible context accumulation
- No survival engine for automatic promotion
- Too much ceremony, not enough flow

**Solution**: Migrate to the "Invisible Studio" architecture where:
- Using it IS the experience (no config, no maintenance)
- Context accumulates invisibly from usage
- Patterns promote/demote automatically
- Designer never debugs manually

---

## Gap Analysis

### Current State (v9.1)

```
.claude/skills/           # 49 skills (too many)
grimoires/sigil/
├── constitution/         # 10 yaml files
├── moodboard/           # Reference materials
├── process/             # 36 TypeScript files (agent-only)
└── state/               # Runtime state
src/components/gold/
├── hooks/useMotion.ts   # Physics hook
└── utils/               # Color, spacing utilities
```

### Target State (v10.0)

```
grimoires/sigil/
├── .context/            # Invisible accumulation (gitignored)
│   ├── taste.json       # Pattern preferences
│   ├── persona.json     # Audience inference
│   └── project.json     # Codebase knowledge
├── index/               # Vector embeddings (gitignored)
└── skills/              # (moved to .claude/skills/)

src/
├── components/
│   ├── gold/            # Promoted stable patterns
│   ├── silver/          # Surviving patterns
│   └── draft/           # Experimental
├── hooks/
│   └── useMotion.ts     # Physics hook
└── lib/sigil/           # Runtime libraries
    ├── context.ts       # Context accumulation
    ├── survival.ts      # Survival engine
    ├── physics.ts       # Physics system
    └── diagnostician.ts # Pattern debugging

.claude/
└── skills/              # Only core skills
    ├── mason/           # Generation (/craft)
    ├── gardener/        # Invisible governance
    └── diagnostician/   # Debugging
```

---

## Gap Details

### 1. Skills Explosion (49 → 3)

| Current (49) | Target (3) | Action |
|--------------|------------|--------|
| approving-patterns | → Mason | Merge |
| auditing-cohesion | → Mason | Merge |
| auditing-security | Keep separate (Loa) | Keep |
| canonizing-flaws | → Gardener | Merge |
| chronicling-rationale | → Mason | Merge |
| crafting-components | → Mason | Merge |
| gardening-entropy | → Gardener | Merge |
| validating-fidelity | → Mason | Merge |
| ... | ... | Delete/Merge |

**Target Skills**:
1. **Mason** - `/craft` command, generation with context
2. **Gardener** - Background survival engine, invisible governance
3. **Diagnostician** - Debug patterns, investigate without questions

### 2. Missing Context System

**Current**: No invisible learning
**Target**: `grimoires/sigil/.context/` with:
- `taste.json` - Physics preferences, pattern preferences
- `persona.json` - Audience sophistication, voice, jargon tolerance
- `project.json` - Folder structures, import conventions

**Reference**: `grimoires/loa/context/sigil-v9-package/sigil-package/reference/lib/context.ts`

### 3. Missing Survival Engine

**Current**: Manual promotion, no tracking
**Target**: Automatic promotion based on:
- Usage (5+ imports → Gold candidate)
- Stability (14+ days unmodified)
- Cleanliness (lint/type clean)

**Reference**: `grimoires/loa/context/sigil-v9-package/sigil-package/reference/lib/survival.ts`

### 4. Missing Diagnostician

**Current**: No React-specific debugging patterns
**Target**: Pattern library for:
- Hydration mismatches
- Dialog instability
- Performance issues
- Layout shift
- Server component errors
- React 19 changes

**Reference**: `grimoires/loa/context/sigil-v9-package/sigil-package/reference/lib/diagnostician.ts`

### 5. Process Files Location

**Current**: `grimoires/sigil/process/` (36 files, agent-only)
**Target**: `src/lib/sigil/` (4 core files)

**Migration**:
- Keep useful utilities, consolidate into 4 files
- Delete redundant/unused process files
- Move from grimoire to src for npm-publishability

---

## Migration Phases

### Phase 0: Foundation (Sprint 1)

**Tasks**:
1. Create `grimoires/sigil/.context/` and `grimoires/sigil/index/` directories
2. Create `src/lib/sigil/` directory
3. Add `grimoires/sigil/.context/` and `grimoires/sigil/index/` to `.gitignore`
4. Flatten `src/components/` (remove tier directories)

**Acceptance**:
- [ ] `grimoires/sigil/.context/` exists and is gitignored
- [ ] `src/lib/sigil/` exists
- [ ] No tier directories in src/components/

### Phase 1: Context System (Sprint 2)

**Tasks**:
1. Copy `context.ts` from reference to `src/lib/sigil/`
2. Adapt SigilContext class for project
3. Wire learning signals to agent
4. Test cold start behavior

**Acceptance**:
- [ ] `SigilContext` class works
- [ ] `processLearningSignal()` captures accept/modify/reject
- [ ] Persona correction works ("use technical language")

### Phase 2: Survival Engine (Sprint 3)

**Tasks**:
1. Copy `survival.ts` from reference to `src/lib/sigil/`
2. Adapt SurvivalEngine for project
3. Add git hook for automatic runs
4. Add CI workflow step

**Acceptance**:
- [ ] Components auto-promote: draft → silver → gold
- [ ] Git hook runs on commit
- [ ] CI runs survival engine on merge

### Phase 3: Physics Consolidation (Sprint 4)

**Tasks**:
1. Merge `useMotion.ts` into `src/lib/sigil/physics.ts`
2. Add `useZoneMotion()` hook
3. Add Framer Motion integration
4. Add Tailwind class generation

**Acceptance**:
- [ ] `useMotion('server-tick')` works
- [ ] `useZoneMotion('critical')` works
- [ ] Framer and Tailwind helpers work

### Phase 4: Diagnostician (Sprint 5)

**Tasks**:
1. Copy `diagnostician.ts` from reference to `src/lib/sigil/`
2. Add project-specific patterns
3. Wire to agent for "it's broken" triggers
4. Test pattern matching

**Acceptance**:
- [ ] `diagnose("dialog glitches")` returns solution
- [ ] Pattern library covers common issues
- [ ] Agent investigates without asking questions

### Phase 5: Skill Consolidation (Sprint 6)

**Tasks**:
1. Create Mason skill (merge generation skills)
2. Create Gardener skill (merge governance skills)
3. Create Diagnostician skill (new)
4. Delete redundant skills
5. Update CLAUDE.md

**Acceptance**:
- [ ] `/craft` works with Mason
- [ ] Gardener runs invisibly
- [ ] Diagnostician handles debugging
- [ ] Skill count: 3 + Loa skills

### Phase 6: Cleanup (Sprint 7)

**Tasks**:
1. Delete `grimoires/sigil/process/` (moved to src/lib/sigil)
2. Delete unused skills
3. Update documentation
4. Final validation

**Acceptance**:
- [ ] No redundant process files
- [ ] 3 core Sigil skills
- [ ] CLAUDE.md reflects new architecture
- [ ] "Using it IS the experience" validated

---

## File Mapping

### From Current → Target

| Current | Target | Action |
|---------|--------|--------|
| `grimoires/sigil/constitution/` | Keep (design truth) | Preserve |
| `grimoires/sigil/moodboard/` | Keep (references) | Preserve |
| `grimoires/sigil/process/*.ts` | `src/lib/sigil/` | Consolidate |
| `grimoires/sigil/state/` | `grimoires/sigil/.context/` | Relocate |
| `src/components/gold/hooks/useMotion.ts` | `src/lib/sigil/physics.ts` | Merge |
| `src/components/gold/utils/` | Keep | Preserve |
| `.claude/skills/` (49) | `.claude/skills/` (3+Loa) | Consolidate |

### New Files

| File | Source |
|------|--------|
| `src/lib/sigil/context.ts` | Reference implementation |
| `src/lib/sigil/survival.ts` | Reference implementation |
| `src/lib/sigil/physics.ts` | Reference + existing useMotion |
| `src/lib/sigil/diagnostician.ts` | Reference implementation |
| `.claude/skills/mason/` | Consolidation of generation skills |
| `.claude/skills/gardener/` | Consolidation of governance skills |
| `.claude/skills/diagnostician/` | New from reference |

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Skills count | 49 | 3 (+ Loa) |
| Process files | 36 | 4 |
| Config files exposed | Many | 0 |
| Questions per /craft | Variable | 0 |
| Cold start usability | Unknown | >70% |
| Learning speed | N/A | <5 interactions |

---

## The Core Test

Every feature, every decision:

> "Does this require the designer to DO, ANSWER, CONFIGURE, or MAINTAIN anything?"
>
> **If yes → Cut it or make it invisible**
> **If no → It can stay**

---

## Dependencies

- `fast-glob` for survival engine file scanning
- Existing Framer Motion for physics
- Git hooks (husky or similar)
- GitHub Actions for CI survival runs

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Breaking existing /craft | Keep current while building new |
| Losing useful skills | Document before consolidation |
| Context system complexity | Start with defaults, iterate |
| Survival engine false positives | Conservative promotion criteria |

---

## Timeline

| Sprint | Phase | Focus |
|--------|-------|-------|
| Sprint 1 | Foundation | Directory structure |
| Sprint 2 | Context | Invisible accumulation |
| Sprint 3 | Survival | Auto-promotion |
| Sprint 4 | Physics | Hook consolidation |
| Sprint 5 | Diagnostician | Debug patterns |
| Sprint 6 | Skills | Consolidation to 3 |
| Sprint 7 | Cleanup | Delete redundant |

---

*Sigil v10.0 "Invisible Studio" Migration Plan*
*Created: 2026-01-11*
