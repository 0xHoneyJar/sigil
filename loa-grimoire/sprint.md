# Sprint Plan: Sigil v3.0 — "Living Engine"

**Version:** 3.0.0
**Codename:** Living Engine
**Generated:** 2026-01-06
**Sprints:** 4
**Priority:** P0 → P1 → P2 → P3

---

## Overview

This sprint plan addresses the fatal bugs and product strategy gaps identified in the v2.6 review. Work is organized by priority:

| Sprint | Priority | Theme | Key Deliverables |
|--------|----------|-------|------------------|
| 1 | P0 | Critical Fixes | fs removal, philosophy alignment |
| 2 | P1 | Foundation | Persona rename, vocabulary layer, layout-only zones |
| 3 | P2 | User Fluidity | Persona context, zone overrides, intent layer |
| 4 | P3 | Living Market | Remote config schema, behavioral signals |

### Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AGENT TIME (Generation)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ Constitution │  │  Vocabulary  │  │   Personas   │  │ Philosophy │  │
│  │    (YAML)    │  │    (YAML)    │  │    (YAML)    │  │   (YAML)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │
│                              │                                          │
│                    Agent reads & embeds context                         │
│                              ↓                                          │
│                   ┌──────────────────┐                                  │
│                   │   CLAUDE.md +    │                                  │
│                   │   Generated Code │                                  │
│                   └──────────────────┘                                  │
└─────────────────────────────────────────────────────────────────────────┘
                               │
                               ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         RUNTIME (Browser)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │     Core     │  │    Layout    │  │     Lens     │                  │
│  │  (Hooks,     │  │ (CriticalZone│  │ (DefaultLens │                  │
│  │   Physics)   │  │  Machinery)  │  │  StrictLens) │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                              │                                          │
│               Pure React, no fs, no YAML parsing                        │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Insight:** Process layer is agent-context-only. Runtime never touches YAML files.

---

## Sprint 1: Critical Fixes (P0)

**Theme:** Fix fatal bugs that block any v3.0 use
**Goal:** Runtime stability and philosophy alignment

### Tasks

#### S1-T1: Remove ProcessContextProvider from exports
**Description:** Remove the ProcessContextProvider from main exports to prevent browser crashes. The Process layer becomes agent-only.

**Acceptance Criteria:**
- [ ] Remove `ProcessContextProvider` export from `sigil-mark/index.ts`
- [ ] Remove `'use client'` directive from any process files
- [ ] Add `@server-only` JSDoc comment to `sigil-mark/process/index.ts`
- [ ] Verify `sigil-mark/process/` is not imported by any runtime code

**Testing:**
- Unit test: Verify Process module throws clear error if imported in browser context
- Integration test: Next.js build succeeds without bundling Process layer

---

#### S1-T2: Update Process layer documentation
**Description:** Document that Process layer is agent-context-only. Update CLAUDE.md with agent protocol.

**Acceptance Criteria:**
- [ ] CLAUDE.md has "Agent Protocol" section explaining Process is agent-only
- [ ] CLAUDE.md has clear "DO NOT import in client code" warning
- [ ] README mentions architecture split (Agent-time vs Runtime)
- [ ] Migration guide explains ProcessContextProvider removal

**Testing:**
- Documentation review: Clear distinction between agent-time and runtime

---

#### S1-T3: Rewrite consulting-decisions skill
**Description:** Align skill with "sweat the art" philosophy. Remove "decide fast" language.

**Acceptance Criteria:**
- [ ] SKILL.md says "Record your deliberated decision" not "Decide fast"
- [ ] Skill does NOT rush craftsman decisions
- [ ] Skill respects existing locked decisions
- [ ] Philosophy section added citing "sweat the art"

**Testing:**
- Code review: No language encouraging rushed decisions

---

#### S1-T4: Rewrite crafting-guidance skill
**Description:** Align skill with philosophy. Present options with tradeoffs, not mandates.

**Acceptance Criteria:**
- [ ] SKILL.md presents options with tradeoffs format
- [ ] Skill does NOT make taste decisions for craftsman
- [ ] "Your Call" section added to output format
- [ ] Vocabulary references added to guidance

**Testing:**
- Code review: Options presented as tradeoffs, not mandates

---

#### S1-T5: Audit all skills for philosophy alignment
**Description:** Review all skill files and ensure they match agreed philosophy.

**Acceptance Criteria:**
- [ ] All skill files reviewed (initializing, envisioning, codifying, crafting, approving, inheriting, updating)
- [ ] No skill encourages rushing decisions
- [ ] All skills present options, not mandates
- [ ] Philosophy section consistent across skills

**Testing:**
- Full skill audit checklist completed

---

## Sprint 2: Foundation (P1)

**Theme:** Core architectural changes for v3.0
**Goal:** Vocabulary layer, persona rename, layout-only zones

### Tasks

#### S2-T1: Create vocabulary.yaml schema and initial terms
**Description:** Create the vocabulary layer with JSON Schema validation and at least 10 core terms.

**Acceptance Criteria:**
- [ ] `sigil-mark/vocabulary/vocabulary.yaml` created with 10+ terms
- [ ] `sigil-mark/vocabulary/schemas/vocabulary.schema.json` created
- [ ] Terms include: pot, vault, claim, deposit, withdraw, stake, dashboard, settings, pending, confirmed
- [ ] Each term has engineering_name, user_facing, mental_model, recommended, zones

**Testing:**
- Unit test: vocabulary.yaml validates against schema
- Unit test: All terms have required fields

---

#### S2-T2: Implement vocabulary-reader.ts
**Description:** Create the vocabulary reader with graceful degradation.

**Acceptance Criteria:**
- [ ] `sigil-mark/process/vocabulary-reader.ts` created per SDD
- [ ] `readVocabulary()` async function implemented
- [ ] `readVocabularySync()` sync function implemented
- [ ] `getTerm()` helper function implemented
- [ ] `getTermFeel()` helper with zone fallback implemented
- [ ] DEFAULT_VOCABULARY constant for graceful degradation
- [ ] Full validation with type guards

**Testing:**
- Unit tests: 20+ tests covering read, validation, helpers, edge cases

---

#### S2-T3: Rename lens-array to personas
**Description:** Rename the lens-array directory and types to personas.

**Acceptance Criteria:**
- [ ] `sigil-mark/lens-array/` renamed to `sigil-mark/personas/`
- [ ] `lenses.yaml` renamed to `personas.yaml`
- [ ] `lens-array-reader.ts` renamed to `persona-reader.ts`
- [ ] All `LensArray` types renamed to `PersonaArray`
- [ ] Backwards compatibility aliases added with deprecation warnings
- [ ] Documentation updated to use "Persona" terminology

**Testing:**
- Unit test: Old imports still work with deprecation warning
- Integration test: No broken imports after rename

---

#### S2-T4: Update CLAUDE.md with vocabulary protocol
**Description:** Document the vocabulary layer and agent protocol in CLAUDE.md.

**Acceptance Criteria:**
- [ ] Vocabulary section added to CLAUDE.md
- [ ] Agent protocol for vocabulary lookup documented
- [ ] Term → feel mapping explained with examples
- [ ] README prominently features vocabulary concept

**Testing:**
- Documentation review: Clear vocabulary protocol

---

#### S2-T5: Remove path-based zone detection claims
**Description:** Clean up documentation to only reference layout-based zones.

**Acceptance Criteria:**
- [ ] Remove `component_paths` from .sigilrc.yaml
- [ ] Remove path-based zone examples from CLAUDE.md
- [ ] Remove `get-zone.sh` references (never implemented)
- [ ] All documentation shows layout-based zone declaration

**Testing:**
- Grep verification: No path-based zone references in docs

---

#### S2-T6: Add vocabulary-reader tests
**Description:** Comprehensive test suite for vocabulary reader.

**Acceptance Criteria:**
- [ ] `__tests__/process/vocabulary-reader.test.ts` created
- [ ] Tests: read valid vocabulary
- [ ] Tests: handle missing file gracefully
- [ ] Tests: handle invalid YAML gracefully
- [ ] Tests: validate term structure
- [ ] Tests: getTerm helper
- [ ] Tests: getTermFeel with fallbacks
- [ ] 20+ test cases total

**Testing:**
- All tests pass

---

## Sprint 3: User Fluidity (P2) ✅

**Theme:** Persona context and zone overrides for adaptive UX
**Goal:** Different users get different experiences in same zone
**Status:** COMPLETED

### Tasks

#### S3-T1: Create philosophy.yaml schema and content ✅
**Description:** Create the philosophy/intent layer with conflict resolution.

**Acceptance Criteria:**
- [x] `sigil-mark/soul-binder/philosophy.yaml` created
- [x] `sigil-mark/soul-binder/schemas/philosophy.schema.json` created
- [x] Intent section with primary/secondary goals
- [x] At least 5 principles defined (7 total)
- [x] Conflict resolution rules defined (6 rules)

**Testing:**
- Unit test: philosophy.yaml validates against schema ✅

---

#### S3-T2: Implement philosophy-reader.ts ✅
**Description:** Create the philosophy reader with conflict resolution.

**Acceptance Criteria:**
- [x] `sigil-mark/process/philosophy-reader.ts` created per SDD
- [x] `readPhilosophy()` async function implemented
- [x] `resolveConflict()` helper implemented
- [x] DEFAULT_PHILOSOPHY constant for graceful degradation
- [x] Full validation with type guards

**Testing:**
- Unit tests: 39 tests covering read, validation, conflict resolution ✅

---

#### S3-T3: Create PersonaProvider runtime context ✅
**Description:** Create React context for runtime persona management.

**Acceptance Criteria:**
- [x] `sigil-mark/core/persona-context.tsx` created per SDD
- [x] PersonaProvider component implemented
- [x] usePersona hook implemented
- [x] Auto-detection: mobile, accessibility, newcomer
- [x] localStorage persistence for preference
- [x] Sensible defaults when no provider

**Testing:**
- Unit tests: Provider, hook, detection, persistence ✅

---

#### S3-T4: Add persona_overrides to .sigilrc.yaml ✅
**Description:** Extend zone configuration with persona-specific overrides.

**Acceptance Criteria:**
- [x] `.sigilrc.yaml` schema updated with persona_overrides
- [x] Critical zone has newcomer/power_user overrides
- [x] Marketing zone has power_user override
- [x] `getEffectivePreferences()` helper implemented
- [x] Documentation shows persona override examples

**Testing:**
- Unit test: Zone + persona override merging ✅

---

#### S3-T5: Update zone context with persona integration ✅
**Description:** Connect ZoneContext with PersonaContext for fluidity.

**Acceptance Criteria:**
- [x] ZoneContextValue updated with defaultPersona, personaOverrides
- [x] CriticalZone reads persona and applies overrides
- [x] MachineryLayout applies persona-specific density
- [x] GlassLayout applies persona-specific motion

**Testing:**
- Integration test: Newcomer in critical zone gets guided lens ✅
- Integration test: Power user in marketing zone gets high density ✅

---

#### S3-T6: Add philosophy-reader tests ✅
**Description:** Comprehensive test suite for philosophy reader.

**Acceptance Criteria:**
- [x] `__tests__/process/philosophy-reader.test.ts` created
- [x] Tests: read valid philosophy
- [x] Tests: handle missing file gracefully
- [x] Tests: validate principle structure
- [x] Tests: resolveConflict helper
- [x] 15+ test cases total (39 total)

**Testing:**
- All tests pass ✅

---

## Sprint 4: Living Market (P3)

**Theme:** Prepare for runtime configuration and behavioral observation
**Goal:** Schema and patterns for future remote config and analytics

### Tasks

#### S4-T1: Create remote-config.yaml schema
**Description:** Define schema for marketing vs engineering controlled config.

**Acceptance Criteria:**
- [ ] `sigil-mark/remote-config.yaml` created
- [ ] `sigil-mark/remote-config/schemas/remote-config.schema.json` created
- [ ] Clear separation: marketing_controlled vs engineering_controlled
- [ ] Integration placeholder (launchdarkly, statsig)
- [ ] Fallback to local_yaml documented

**Testing:**
- Unit test: schema validation

---

#### S4-T2: Add behavioral signals to vibe-checks.yaml
**Description:** Extend vibe checks with behavioral observation signals.

**Acceptance Criteria:**
- [ ] `behavioral_signals` section added to vibe-checks.yaml
- [ ] At least 5 behavioral signals: information_seeking, confirmation_friction, rage_clicking, etc.
- [ ] Each signal has trigger, insight, recommendation
- [ ] Vibe check reader updated to parse behavioral signals

**Testing:**
- Unit test: behavioral signals parsed correctly

---

#### S4-T3: Update vibe-check-reader for behavioral signals
**Description:** Extend vibe check reader to support behavioral observations.

**Acceptance Criteria:**
- [ ] `getBehavioralSignals()` function added
- [ ] BehavioralSignal type exported
- [ ] Reader validates behavioral signal structure
- [ ] Graceful degradation if signals missing

**Testing:**
- Unit tests: behavioral signal reading and validation

---

#### S4-T4: Document remote config architecture
**Description:** Document the future remote config pattern in SDD and CLAUDE.md.

**Acceptance Criteria:**
- [ ] SDD section on remote config architecture
- [ ] CLAUDE.md notes which aspects can be dynamic
- [ ] Clear constraint: physics local, vibe remote-capable
- [ ] Integration guide for LaunchDarkly/Statsig

**Testing:**
- Documentation review

---

#### S4-T5: Final documentation update
**Description:** Update all documentation for v3.0 release.

**Acceptance Criteria:**
- [ ] README updated with v3.0 architecture overview
- [ ] Vocabulary as API surface prominently featured
- [ ] Migration guide from v2.6 → v3.0 complete
- [ ] CLAUDE.md philosophy section explicit
- [ ] All commands documented

**Testing:**
- Documentation review: Complete and consistent

---

#### S4-T6: v3.0 Release preparation
**Description:** Version bump and release notes.

**Acceptance Criteria:**
- [ ] `.sigil-version.json` updated to 3.0.0
- [ ] CHANGELOG.md created with v3.0 changes
- [ ] Breaking changes documented
- [ ] Migration checklist in README

**Testing:**
- Version file correct

---

## Test Coverage Summary

| Sprint | Component | Tests |
|--------|-----------|-------|
| 1 | Skills audit | Manual review |
| 2 | vocabulary-reader | 20+ |
| 2 | persona-reader (renamed) | Update existing |
| 3 | philosophy-reader | 15+ |
| 3 | persona-context | 15+ |
| 3 | zone-persona integration | 10+ |
| 4 | vibe-check-reader (behavioral) | 10+ |
| **Total** | | **70+** new/updated |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking existing imports | Medium | High | Deprecation aliases, clear migration guide |
| Vocabulary term conflicts | Low | Medium | JSON Schema validation |
| Persona detection accuracy | Medium | Low | Safe defaults (newcomer) |
| Philosophy conflicts undefined | Low | Low | Default resolution rules |

---

## Success Criteria

| Metric | v2.6 | v3.0 Target |
|--------|------|-------------|
| Runtime crashes from Process | Crashes | 0 |
| Naming collisions | Multiple | 0 |
| Philosophy alignment in skills | 0% | 100% |
| Vocabulary coverage | 0 terms | 10+ terms |
| Test coverage | 156 | 220+ |

---

## Dependencies

```
Sprint 1 (P0)
    └── Sprint 2 (P1)
            └── Sprint 3 (P2)
                    └── Sprint 4 (P3)
```

All sprints are sequential. P0 must complete before P1.

---

## Previous Version

Sigil v2.6 "Craftsman's Flow" (completed 2026-01-06):
- Sprint 1-7: Constitution, Consultation, Lens Array, Zone-Persona, Vibe Checks, Commands, Documentation
- All sprints COMPLETED
- Security audit APPROVED

---

## Version History

| Sprint | Status | Completed |
|--------|--------|-----------|
| Sprint 1 (P0) | COMPLETED | 2026-01-06 |
| Sprint 2 (P1) | COMPLETED | 2026-01-06 |
| Sprint 3 (P2) | COMPLETED | 2026-01-06 |
| Sprint 4 (P3) | PENDING | - |

---

## Next Step

```
/implement sprint-1
```

---

*Generated: 2026-01-06*
*Version: Sigil v3.0 "Living Engine"*
