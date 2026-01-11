# Sprint 2: Foundation (P1) - Implementation Report

**Sprint ID:** v3.0-sprint-2
**Status:** IMPLEMENTATION_COMPLETE
**Date:** 2026-01-06

## Summary

Sprint 2 establishes the foundation layer for Sigil v3.0 "Living Engine" with the Vocabulary system and Persona refactoring. All 6 tasks completed successfully with 41 passing tests.

## Tasks Completed

### S2-T1: Create vocabulary.yaml schema and terms ✅

**Files Created:**
- `sigil-mark/vocabulary/schemas/vocabulary.schema.json` - JSON Schema for validation
- `sigil-mark/vocabulary/vocabulary.yaml` - 18 product terms

**Implementation Details:**
- Full JSON Schema with TermFeel and VocabularyTerm definitions
- Enum validation for material (glass/machinery/decisive), motion (warm/deliberate/snappy/celebratory_then_deliberate/reassuring), tone (friendly/serious/exciting/reassuring)
- 18 terms: pot, vault, wallet, claim, deposit, withdraw, stake, unstake, dashboard, settings, profile, pending, confirmed, failed, balance, fee, reward, risk

**Acceptance Criteria:**
- [x] Schema validates against JSON Schema Draft-07
- [x] Terms cover all product concepts
- [x] Same engineering_name, different feel (pot vs vault both use savings_container)
- [x] Zone associations for each term

---

### S2-T2: Implement vocabulary-reader.ts ✅

**Files Created:**
- `sigil-mark/process/vocabulary-reader.ts` - Reader with graceful degradation
- Updated `sigil-mark/process/index.ts` - Export vocabulary functions

**Implementation Details:**
- Types: Material, Motion, Tone, TermFeel, VocabularyTerm, Vocabulary
- Reader functions: readVocabulary(), readVocabularySync()
- Helper functions: getTerm(), getAllTerms(), getTermsForZone(), getTermFeel(), hasTerm(), getEngineeringName(), getTermsByEngineeringName()
- Display helpers: formatTermSummary(), formatVocabularySummary()
- Constants: DEFAULT_VOCABULARY, DEFAULT_VOCABULARY_PATH, DEFAULT_TERM_FEEL

**Acceptance Criteria:**
- [x] Graceful degradation (never throws, returns defaults)
- [x] Case-insensitive term lookup
- [x] Zone-based term filtering
- [x] Zone fallback for getTermFeel()
- [x] Engineering name → multiple terms mapping

---

### S2-T3: Rename lens-array to personas ✅

**Files Created:**
- `sigil-mark/personas/personas.yaml` - v3.0 personas with preferences
- `sigil-mark/personas/schemas/personas.schema.json` - JSON Schema
- `sigil-mark/process/persona-reader.ts` - New reader with backwards compatibility

**Implementation Details:**
- Added v3.0 fields: default_lens, preferences (motion, help, density)
- 4 personas: power_user (Chef), newcomer (Henlocker), mobile (Thumbzone), accessibility (A11y)
- Backwards compatibility: readLensArray() → readPersonas() with deprecation warning
- Type aliases: LensArray → PersonaArray

**Acceptance Criteria:**
- [x] Persona vs Lens terminology clear in code and comments
- [x] default_lens field maps persona → lens
- [x] preferences field added
- [x] Backwards compatibility with deprecation warnings
- [x] Stacking configuration preserved

---

### S2-T4: Update CLAUDE.md with vocabulary protocol ✅

**Files Updated:**
- `CLAUDE.md` - Already had comprehensive vocabulary documentation (lines 190-225)

**Verification:**
- Vocabulary section with term → feel mapping explained
- Same backend, different feel concept documented
- Agent protocol includes vocabulary check step

**Acceptance Criteria:**
- [x] Vocabulary protocol documented
- [x] Term → feel mapping explained
- [x] Agent workflow includes vocabulary

---

### S2-T5: Remove path-based zone detection claims ✅

**Files Updated:**
- `.sigilrc.yaml` - Updated to v3.0, removed deprecated component_paths

**Implementation Details:**
- Version updated: 2.0.0 → 3.0.0
- Codename updated: "Reality Engine" → "Living Engine"
- Removed deprecated `component_paths` array
- Added v3.0 TERMINOLOGY NOTE explaining Persona vs Lens

**Acceptance Criteria:**
- [x] No path-based zone detection patterns remain
- [x] Config updated to v3.0
- [x] Terminology note added

---

### S2-T6: Add vocabulary-reader tests ✅

**Files Created:**
- `sigil-mark/__tests__/process/vocabulary-reader.test.ts` - 41 test cases

**Test Coverage:**
- readVocabulary: 4 tests (valid YAML, missing file, invalid YAML, term structure)
- readVocabularySync: 2 tests (valid YAML, missing file)
- getTerm: 4 tests (by ID, case-insensitive, non-existent, empty vocabulary)
- getAllTerms: 2 tests (returns array, empty vocabulary)
- getTermsForZone: 5 tests (critical, marketing, case-insensitive, unknown, empty)
- getTermFeel: 5 tests (existing, non-existent, zone fallback, priority, empty)
- hasTerm: 4 tests (existing, non-existent, case-insensitive, empty)
- getEngineeringName: 3 tests (existing, non-existent, empty)
- getTermsByEngineeringName: 5 tests (multiple, same-backend-different-feel, single, unknown, empty)
- formatTermSummary: 1 test
- formatVocabularySummary: 2 tests (normal, empty)
- Graceful Degradation: 3 tests
- DEFAULT_TERM_FEEL: 1 test

**Test Results:**
```
 ✓ __tests__/process/vocabulary-reader.test.ts (41 tests) 25ms

 Test Files  1 passed (1)
      Tests  41 passed (41)
```

**Acceptance Criteria:**
- [x] 20+ test cases → 41 tests
- [x] Graceful degradation tested
- [x] All helpers tested
- [x] Edge cases covered

---

## Files Changed Summary

| File | Action | Lines |
|------|--------|-------|
| `sigil-mark/vocabulary/schemas/vocabulary.schema.json` | Created | 115 |
| `sigil-mark/vocabulary/vocabulary.yaml` | Created | 256 |
| `sigil-mark/process/vocabulary-reader.ts` | Created | 509 |
| `sigil-mark/personas/schemas/personas.schema.json` | Created | 277 |
| `sigil-mark/personas/personas.yaml` | Created | 202 |
| `sigil-mark/process/persona-reader.ts` | Created | 620 |
| `sigil-mark/process/index.ts` | Updated | 240 |
| `.sigilrc.yaml` | Updated | 122 |
| `sigil-mark/__tests__/process/vocabulary-reader.test.ts` | Created | 385 |

## Architecture Notes

### Vocabulary Layer (New in v3.0)

```
term → feel mapping
├── pot → glass/warm/friendly
├── vault → machinery/deliberate/serious
└── (same engineering_name: savings_container)
```

Key insight: Same backend can have different user-facing feels. The vocabulary layer captures this.

### Persona vs Lens Distinction

| Concept | What it is | Example |
|---------|-----------|---------|
| Persona | User archetype | power_user, newcomer |
| Lens | UI rendering variant | DefaultLens, StrictLens |

Personas now have `default_lens` to map archetype → preferred UI variant.

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Backwards compatibility break | Added deprecation warnings for old APIs |
| Confusion about Persona vs Lens | Added terminology notes in YAML and code |
| Missing tests for edge cases | 41 comprehensive tests covering edge cases |

## Next Steps

1. **Review Sprint 2** - `/review-sprint v3.0-sprint-2`
2. **Audit Sprint 2** - `/audit-sprint v3.0-sprint-2`
3. **Sprint 3: User Fluidity** - Philosophy layer, PersonaProvider, zone-persona integration

---

*Implementation completed: 2026-01-06*
*Agent: Claude Opus 4.5*
