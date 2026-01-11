# Sigil v4.1 Sprint 4 Implementation Report

**Sprint:** 4 - Context: Vocabulary & Physics Timing
**Status:** COMPLETED
**Date:** 2026-01-07
**Engineer:** Claude Code

---

## Overview

Sprint 4 implements the Vocabulary and Physics Timing layers for Sigil v4.1 "Living Guardrails". This sprint adds:

1. **Physics Timing YAML** - Motion names mapped to concrete timing values
2. **Physics Reader** - Agent-time and runtime access to physics configuration
3. **Vocabulary Enhancement** - 10 core terms with `last_refined` field
4. **Vocabulary Reader Enhancement** - New functions for physics integration
5. **/craft Vocabulary Integration** - Component name detection and gap surfacing

---

## Task Completion

### v4.1-S4-T1: Physics Timing YAML

**Status:** COMPLETED

**Files Created:**
- `sigil-mark/kernel/physics.yaml`
- `sigil-mark/kernel/schemas/physics.schema.json`

**Implementation Details:**

Created `physics.yaml` with:
- 7 motion names: `instant`, `snappy`, `warm`, `deliberate`, `reassuring`, `celebratory`, `reduced`
- Each motion includes:
  - `duration`: Fixed value or min/max/default range
  - `unit`: ms
  - `easing`: CSS easing string
  - `description`: Human-readable explanation
  - `use_cases`: Example scenarios
  - `zones`: prefer/avoid recommendations
- 3 sync strategies: `pessimistic`, `optimistic`, `hybrid`
- Timing constraints for ESLint zone-compliance rule
- Default fallback values

**Timing Values:**
| Motion | Timing (ms) | Easing |
|--------|-------------|--------|
| instant | 0 | linear |
| snappy | 150 (100-200) | ease-out |
| warm | 300 (200-400) | ease-in-out |
| deliberate | 800 (500-1000) | ease-out |
| reassuring | 1200 (800-1500) | ease-in-out |
| celebratory | 1200 (800-1500) | cubic-bezier(0.34, 1.56, 0.64, 1) |
| reduced | 0 | linear |

**Schema Coverage:**
- Full JSON Schema validation at `schemas/physics.schema.json`
- Supports both fixed duration and range duration formats
- Validates motion names, sync strategies, constraints

---

### v4.1-S4-T2: Physics Reader

**Status:** COMPLETED

**Files Created:**
- `sigil-mark/process/physics-reader.ts`

**Files Modified:**
- `sigil-mark/process/index.ts` (added exports)
- `sigil-mark/hooks/physics-resolver.ts` (added getMotionConstraints, updated docs)

**Implementation Details:**

Created `physics-reader.ts` with:
- `readPhysics()` / `readPhysicsSync()` - Load physics.yaml with caching
- `getMotionConfig(motion)` - Returns full motion configuration
- `getMotionTiming(motion)` - Returns ms value (uses default for ranges)
- `getMotionEasing(motion)` - Returns CSS easing string
- `getMotionConstraints(motion)` - Returns {min, max} for ESLint
- `getSyncStrategyConfig(strategy)` - Returns sync strategy details
- `getDefaultMotionForSync(strategy)` - Returns default motion for strategy
- `getAllMotionNames()` / `getAllSyncStrategyNames()` - List all valid names
- `validateTimingForMotion(motion, ms)` - Validate timing against constraints
- `clearPhysicsCache()` - Clear cache for testing
- `formatMotionSummary()` / `formatPhysicsSummary()` - Display helpers

**Fallback Behavior:**
- Hardcoded defaults in `physics-resolver.ts` as runtime fallback
- If `physics.yaml` missing, uses hardcoded values
- Cache automatically cleared when file path changes

**Updated physics-resolver.ts:**
- Added `getMotionConstraints()` export
- Added `MOTION_CONSTRAINTS` constant
- Updated documentation for v4.1

---

### v4.1-S4-T3: Vocabulary YAML with 10 Terms

**Status:** COMPLETED

**Files Modified:**
- `sigil-mark/vocabulary/vocabulary.yaml`
- `sigil-mark/vocabulary/schemas/vocabulary.schema.json`

**Implementation Details:**

Updated vocabulary.yaml with 10 core terms:

| Term | Engineering Name | Material | Motion | Tone | Zones |
|------|-----------------|----------|--------|------|-------|
| pot | savings_container | glass | warm | friendly | marketing, dashboard |
| vault | savings_container | machinery | deliberate | serious | critical |
| claim | reward_claim | decisive | celebratory_then_deliberate | exciting | critical |
| deposit | deposit_funds | decisive | deliberate | reassuring | critical |
| withdraw | withdraw_funds | decisive | deliberate | serious | critical |
| boost | boost_position | glass | celebratory_then_deliberate | exciting | critical, marketing |
| stake | stake_position | decisive | deliberate | serious | critical |
| unstake | unstake_position | decisive | deliberate | reassuring | critical |
| harvest | harvest_rewards | glass | celebratory_then_deliberate | exciting | critical, dashboard |
| connect | wallet_connect | glass | warm | friendly | marketing, dashboard |

**Schema Update:**
Added `last_refined` field:
```json
"last_refined": {
  "type": ["string", "null"],
  "format": "date",
  "description": "ISO date when term was last refined via /refine"
}
```

---

### v4.1-S4-T4: Vocabulary Reader

**Status:** COMPLETED

**Files Modified:**
- `sigil-mark/process/vocabulary-reader.ts`
- `sigil-mark/process/index.ts` (added exports)

**Implementation Details:**

Updated `VocabularyTerm` interface:
```typescript
interface VocabularyTerm {
  // ... existing fields
  last_refined: string | null;  // v4.1 addition
}
```

New functions added:
- `getRecommendedPhysics(vocabulary, termId)` - Returns {material, motion, tone}
- `findByEngineeringName(vocabulary, name)` - Reverse lookup from code name
- `getUnrefinedTerms(vocabulary)` - Terms with last_refined === null
- `getTermsRefinedAfter(vocabulary, date)` - Terms refined after date
- `matchComponentToTerm(vocabulary, componentName)` - Match component to term
- `getVocabularyStats(vocabulary)` - Statistics for gap detection

**Updated normalizeTerm():**
- Now parses `last_refined` field from YAML
- Handles null, undefined, and date string values

---

### v4.1-S4-T5: /craft Vocabulary Integration

**Status:** COMPLETED

**Files Modified:**
- `.claude/skills/crafting-guidance/SKILL.md`

**Implementation Details:**

Updated SKILL.md with:
1. Added `physics.yaml` to zone state paths
2. Updated version to v4.1
3. Added v4.1 philosophy items:
   - Vocabulary integration - Auto-detect terms, use recommended physics
   - Physics timing - Load from kernel/physics.yaml
4. Added Physics to Pre-Flight Checks
5. Added Vocabulary Integration section:
   - Component Name Detection workflow
   - Using Term Physics examples
   - Gap Detection for Undefined Terms
   - 10 Core Terms reference table

---

## Files Changed Summary

### Created (4 files)
```
sigil-mark/kernel/physics.yaml
sigil-mark/kernel/schemas/physics.schema.json
sigil-mark/process/physics-reader.ts
loa-grimoire/a2a/v4.1-sprint-4/reviewer.md
```

### Modified (5 files)
```
sigil-mark/vocabulary/vocabulary.yaml
sigil-mark/vocabulary/schemas/vocabulary.schema.json
sigil-mark/process/vocabulary-reader.ts
sigil-mark/process/index.ts
sigil-mark/hooks/physics-resolver.ts
.claude/skills/crafting-guidance/SKILL.md
```

---

## Acceptance Criteria Verification

### v4.1-S4-T1: Physics Timing YAML
- [x] `sigil-mark/kernel/physics.yaml` created
- [x] All motion names defined: instant, snappy, warm, deliberate, reassuring, celebratory, reduced
- [x] Each motion has: duration, unit, easing, description
- [x] Sync strategies defined: pessimistic, optimistic, hybrid
- [x] JSON Schema at `sigil-mark/kernel/schemas/physics.schema.json`

### v4.1-S4-T2: Physics Reader
- [x] `physics-reader.ts` loads and parses physics.yaml
- [x] `getMotionConfig(motion)` returns full motion config
- [x] `getMotionTiming(motion)` returns concrete ms value
- [x] `getMotionEasing(motion)` returns easing string
- [x] `getMotionConstraints(motion)` returns { min, max }
- [x] Results cached for performance
- [x] Fallback to hardcoded defaults if physics.yaml missing

### v4.1-S4-T3: Vocabulary YAML with 10 Terms
- [x] `sigil-mark/vocabulary/vocabulary.yaml` updated
- [x] 10 terms defined: pot, vault, claim, deposit, withdraw, boost, stake, unstake, harvest, connect
- [x] Each term has: engineering_name, user_facing, mental_model, recommended, zones, last_refined
- [x] JSON Schema updated at `sigil-mark/vocabulary/schemas/vocabulary.schema.json`

### v4.1-S4-T4: Vocabulary Reader
- [x] `getTerm(termId)` returns full term (existing)
- [x] `getRecommendedPhysics(termId)` returns {material, motion, tone}
- [x] `findByEngineeringName(name)` reverse lookup
- [x] `getAllTerms()` returns array for gap detection

### v4.1-S4-T5: /craft Vocabulary Integration
- [x] `/craft` references vocabulary in SKILL.md
- [x] Component name matching documented
- [x] Gap detection workflow documented
- [x] 10 Core Terms reference table added

---

## Architecture Notes

### Physics Layer Architecture

```
kernel/physics.yaml          <- Source of truth (YAML)
       │
       ├── process/physics-reader.ts  <- Agent-time reader
       │
       └── hooks/physics-resolver.ts  <- Runtime (hardcoded fallback)
                │
                └── hooks/use-sigil-mutation.ts  <- Consumer
```

**Design Decisions:**
1. physics.yaml is the source of truth for motion timing
2. physics-reader.ts loads at agent-time (no runtime YAML parsing)
3. physics-resolver.ts has hardcoded fallbacks for browser runtime
4. ESLint plugin can use physics-reader for compile-time validation

### Vocabulary Integration Flow

```
/craft "ClaimButton"
       │
       ├── Match component name to vocabulary terms
       │   └── "Claim" matches "claim" term
       │
       ├── Load term's recommended physics
       │   └── { material: decisive, motion: celebratory_then_deliberate, tone: exciting }
       │
       ├── Apply to generated code
       │   └── Use decisive material, celebratory motion
       │
       └── Surface in DESIGN CONTEXT header
           └── VOCABULARY: claim -> decisive material, celebratory motion
```

---

## Testing Notes

### Manual Verification
1. physics.yaml parses correctly with YAML parser
2. physics.schema.json validates physics.yaml
3. vocabulary.yaml parses correctly with new last_refined field
4. vocabulary.schema.json validates vocabulary.yaml

### Integration Points
- physics-reader.ts exports added to process/index.ts
- vocabulary-reader.ts new functions exported
- /craft SKILL.md references new files

---

## Dependencies

### Sprint 4 Dependencies
- Sprint 2 (physics resolver for hook integration) - SATISFIED

### External Dependencies
- None added

---

## Notes for Review

1. **Hardcoded Fallbacks**: physics-resolver.ts maintains hardcoded timing/easing values as runtime fallback. This ensures the hook works even if physics.yaml is not loaded.

2. **Cache Strategy**: physics-reader.ts caches parsed config to avoid repeated file reads. Use `clearPhysicsCache()` for testing.

3. **last_refined Field**: All terms have `last_refined: null` initially. This will be updated by `/refine --vocab` command when implemented.

4. **Schema Validation**: Both physics.schema.json and vocabulary.schema.json are complete and can be used for validation.

5. **Component Matching**: `matchComponentToTerm()` uses simple string inclusion. More sophisticated matching (PascalCase parsing) could be added in future.

---

## Next Steps

Sprint 5: Marketing - Remote Soul & /observe Skill
- Remote soul schema
- LaunchDarkly/Statsig adapter
- useSigilMutation vibe integration
- /observe skill implementation

---

*Report generated: 2026-01-07*
*Sprint: Sigil v4.1 "Living Guardrails" - Sprint 4*
