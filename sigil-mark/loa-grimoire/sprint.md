# Sprint Plan: Sigil v3.1 "Taste Memory"

**Version:** 3.1.0
**Date:** 2026-01-06
**Total Sprints:** 2

---

## Sprint Overview

| Sprint | Theme | Goal |
|--------|-------|------|
| 1 | Foundation | Directory structure, moodboard-reader, tests |
| 2 | Integration | /craft integration, documentation |

---

## Sprint 1: Foundation

**Goal:** Create moodboard directory structure and implement the reader with full test coverage.

**Deliverables:**
- `sigil-mark/moodboard/` directory structure
- `sigil-mark/process/moodboard-reader.ts` with all types and functions
- `sigil-mark/__tests__/process/moodboard-reader.test.ts` with ~26 tests
- Updated `sigil-mark/process/index.ts` exports

---

### S1-T1: Create moodboard directory structure

**Description:** Create the folder structure for collecting inspiration artifacts.

**Acceptance Criteria:**
- [x] `sigil-mark/moodboard/` directory exists
- [x] `sigil-mark/moodboard/README.md` with usage instructions
- [x] `sigil-mark/moodboard/references/` with `.gitkeep`
- [x] `sigil-mark/moodboard/articles/` with `.gitkeep`
- [x] `sigil-mark/moodboard/anti-patterns/` with `.gitkeep`
- [x] `sigil-mark/moodboard/gtm/` with `.gitkeep`
- [x] `sigil-mark/moodboard/screenshots/` with `.gitkeep`

**Dependencies:** None

---

### S1-T2: Add gray-matter dependency

**Description:** Add the frontmatter parsing library.

**Acceptance Criteria:**
- [x] `gray-matter` added to package.json dependencies
- [x] `npm install` runs successfully
- [x] Types available (`@types/gray-matter` if needed)

**Dependencies:** None

---

### S1-T3: Create moodboard-reader types

**Description:** Define TypeScript types for the moodboard system.

**Acceptance Criteria:**
- [x] `MoodboardCategory` type defined
- [x] `AntiPatternSeverity` type defined
- [x] `MoodboardFrontmatter` interface defined
- [x] `MoodboardEntry` interface defined
- [x] `FeaturedReference` interface defined
- [x] `MoodboardIndex` interface defined
- [x] `Moodboard` interface defined
- [x] `DEFAULT_MOODBOARD` constant defined
- [x] `DEFAULT_MOODBOARD_PATH` constant defined

**Dependencies:** None

---

### S1-T4: Implement readMoodboard function

**Description:** Implement the main reader function that scans the moodboard directory.

**Acceptance Criteria:**
- [x] `readMoodboard(basePath?)` async function implemented
- [x] Scans `references/`, `articles/`, `anti-patterns/`, `gtm/`, `screenshots/`
- [x] Parses `.md` files with gray-matter
- [x] Indexes image files by path
- [x] Respects MAX_SCAN_DEPTH (3 levels)
- [x] Calculates statistics (total, byCategory, byType)
- [x] Returns `DEFAULT_MOODBOARD` if directory doesn't exist
- [x] Never throws, logs warnings instead

**Dependencies:** S1-T2, S1-T3

---

### S1-T5: Implement readMoodboardSync function

**Description:** Implement synchronous version of the reader.

**Acceptance Criteria:**
- [x] `readMoodboardSync(basePath?)` function implemented
- [x] Same behavior as async version
- [x] Uses `require('fs')` pattern like other readers

**Dependencies:** S1-T4

---

### S1-T6: Implement index.yaml parser

**Description:** Parse the optional curated index file.

**Acceptance Criteria:**
- [x] Reads `moodboard/index.yaml` if exists
- [x] Parses `featured` array with path and why
- [x] Parses `tags` map
- [x] Returns null if index doesn't exist
- [x] Validates structure, skips invalid entries

**Dependencies:** S1-T4

---

### S1-T7: Implement query helper functions

**Description:** Implement all query helpers for filtering moodboard entries.

**Acceptance Criteria:**
- [x] `getEntriesForZone(moodboard, zone)` implemented
- [x] `getEntriesForMaterial(moodboard, material)` implemented
- [x] `getEntriesForTerm(moodboard, term)` implemented
- [x] `getAntiPatterns(moodboard, severity?)` implemented
- [x] `getEntriesForSource(moodboard, source)` implemented
- [x] `getFeaturedReferences(moodboard)` implemented
- [x] `searchMoodboard(moodboard, query)` implemented
- [x] `getEntriesByTag(moodboard, tag)` implemented
- [x] All filters are case-insensitive

**Dependencies:** S1-T4

---

### S1-T8: Implement display helper functions

**Description:** Implement formatting functions for moodboard output.

**Acceptance Criteria:**
- [x] `formatEntrySummary(entry)` returns formatted string
- [x] `formatMoodboardSummary(moodboard)` returns statistics summary
- [x] Output is human-readable for agent context

**Dependencies:** S1-T7

---

### S1-T9: Export from process/index.ts

**Description:** Add moodboard exports to the process barrel file.

**Acceptance Criteria:**
- [x] All reader functions exported
- [x] All query helpers exported
- [x] All display helpers exported
- [x] All types exported
- [x] All constants exported

**Dependencies:** S1-T8

---

### S1-T10: Create moodboard-reader tests

**Description:** Comprehensive test suite for the moodboard reader.

**Acceptance Criteria:**
- [x] Tests for `readMoodboard` (10 tests)
- [x] Tests for query helpers (9 tests)
- [x] Tests for graceful degradation (4 tests)
- [x] Tests for display helpers (3 tests)
- [x] All tests pass
- [x] Test fixtures created in `__tests__/fixtures/moodboard/`

**Dependencies:** S1-T9

---

## Sprint 2: Integration

**Goal:** Integrate moodboard into /craft workflow and update documentation.

**Deliverables:**
- Updated `/craft` skill to reference moodboard
- Updated `/envision` skill prompts
- Updated `CLAUDE.md` documentation
- Example moodboard content

---

### S2-T1: Update /craft skill for moodboard

**Description:** Modify the crafting-guidance skill to surface moodboard references.

**Acceptance Criteria:**
- [x] Skill reads moodboard at start of execution
- [x] Queries relevant entries based on current zone
- [x] Queries anti-patterns for current context
- [x] Includes 1-3 relevant references in output
- [x] Gracefully handles empty moodboard

**Dependencies:** Sprint 1 complete

---

### S2-T2: Update /envision skill prompts

**Description:** Add moodboard prompts to the envisioning workflow.

**Acceptance Criteria:**
- [x] Prompts user about moodboard at interview start
- [x] Suggests adding inspiration after interview
- [x] Mentions moodboard directory structure

**Dependencies:** Sprint 1 complete

---

### S2-T3: Update CLAUDE.md documentation

**Description:** Document moodboard usage in the main Claude instructions.

**Acceptance Criteria:**
- [x] Moodboard section added to CLAUDE.md
- [x] Directory structure documented
- [x] Frontmatter schema documented
- [x] Query during /craft documented
- [x] Example usage shown

**Dependencies:** Sprint 1 complete

---

### S2-T4: Create example moodboard content

**Description:** Add starter content to demonstrate moodboard usage.

**Acceptance Criteria:**
- [x] `references/stripe/` with sample reference markdown
- [x] `anti-patterns/spinner-anxiety.md` example
- [x] `articles/motion-design-principles.md` example
- [x] `index.yaml` with featured entries

**Dependencies:** S2-T3

---

### S2-T5: End-to-end testing

**Description:** Verify full workflow from moodboard to /craft output.

**Acceptance Criteria:**
- [x] /craft surfaces moodboard references when present
- [x] /craft works without moodboard (graceful degradation)
- [x] /envision mentions moodboard
- [x] All existing tests still pass

**Dependencies:** S2-T4

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| gray-matter types missing | Low | Low | Inline types if needed |
| Large moodboard performance | Low | Medium | Add file count limit |
| Skill integration complexity | Medium | Medium | Minimal changes, additive only |

---

## Success Metrics

| Metric | Sprint 1 | Sprint 2 |
|--------|----------|----------|
| Tests passing | 26+ new | All existing + new |
| Directory structure | Complete | - |
| Reader functions | All implemented | - |
| Skill integration | - | /craft + /envision |
| Documentation | - | Complete |

---

## Dependencies

- **gray-matter**: npm package for frontmatter parsing
- **Existing readers**: Pattern to follow (vocabulary-reader, philosophy-reader)
- **Existing skills**: /craft and /envision to update

---

*Sprint Plan Author: Claude*
*Date: 2026-01-06*
