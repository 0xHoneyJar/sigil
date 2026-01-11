# Sprint 2 Implementation Report: Make It Safe (P1)

**Sprint:** v6.1-sprint-2
**Status:** IMPLEMENTED
**Date:** 2026-01-08

## Sprint Goals

Sprint 2 focused on adding quality gates to prevent bad patterns and ghost components:
- Vocabulary integration (remove hardcoded terms)
- Taste-key curation (curated promotion workflow)
- Hard eviction for Virtual Sanctuary

## Tasks Completed

### S2-T1: Integrate vocabulary-reader into agent-orchestration.ts

**Status:** COMPLETE

**Files Modified:**
- `sigil-mark/process/agent-orchestration.ts`

**Changes:**
- Removed hardcoded `VOCABULARY_TERMS` array
- Added imports from `vocabulary-reader.ts`
- Implemented vocabulary caching with `loadVocabulary()` and `clearVocabularyCache()`
- Rewrote `extractVocabularyTerms()` to use vocabulary.yaml dynamically
- Rewrote `resolveZoneFromVocabulary()` to use term zones from vocabulary file
- Added `resolvePhysicsFromVocabulary()` function for term-based physics resolution
- Updated `resolveContext()` to use new vocabulary-based functions

**Acceptance Criteria:**
- [x] Vocabulary terms loaded from vocabulary.yaml
- [x] No hardcoded terms in agent-orchestration.ts
- [x] Cache invalidation working correctly
- [x] All existing tests pass

### S2-T2: Add canonical-candidate status to survival-observer.ts

**Status:** COMPLETE

**Files Modified:**
- `sigil-mark/process/survival-observer.ts`

**Changes:**
- Added 'canonical-candidate' to `PatternStatus` type union
- Added `determineStatusWithCuration()` function that:
  - Returns 'experimental' for 1-2 occurrences
  - Returns 'surviving' for 3-4 occurrences
  - Returns 'canonical-candidate' for 5+ without approval
  - Returns 'canonical' for 5+ with approval

**Acceptance Criteria:**
- [x] New status type added
- [x] Patterns don't auto-promote to canonical at 5+
- [x] Curation check integrated

### S2-T3: Create .sigil/taste-key.yaml configuration

**Status:** COMPLETE

**Files Modified:**
- `sigil-mark/process/survival-observer.ts`

**Changes:**
- Added `TASTE_KEY_PATH` constant (`.sigil/taste-key.yaml`)
- Added TypeScript interfaces:
  - `PendingPromotion` - tracks patterns awaiting approval
  - `ApprovalRecord` - records approved patterns
  - `RejectionRecord` - records rejected patterns
  - `TasteKeyConfig` - full configuration structure
- Added `loadTasteKeyConfig()` function
- Added `saveTasteKeyConfig()` function

**Acceptance Criteria:**
- [x] Configuration file structure defined
- [x] Load/save functions working
- [x] Default config created when file missing

### S2-T4: Implement addPendingPromotion() function

**Status:** COMPLETE

**Files Modified:**
- `sigil-mark/process/survival-observer.ts`

**Changes:**
- Implemented `addPendingPromotion(pattern, entry, projectRoot)` function
- Adds pattern to `pending_promotions` array in taste-key.yaml
- Stores occurrences, files, first_seen, last_seen
- Integrated with `updatePatternWithCuration()` to auto-add at 5+ occurrences

**Acceptance Criteria:**
- [x] Function creates pending promotion record
- [x] Records are persisted to taste-key.yaml
- [x] Integration with pattern update flow

### S2-T5: Implement isPatternApproved() function

**Status:** COMPLETE

**Files Modified:**
- `sigil-mark/process/survival-observer.ts`

**Changes:**
- Implemented `isPatternApproved(pattern, projectRoot)` function
- Implemented `isPatternRejected(pattern, projectRoot)` function
- Implemented `isPatternPending(pattern, projectRoot)` function
- Implemented `getPendingPromotions(projectRoot)` function
- Implemented `approvePromotion(pattern, approver, comment, projectRoot)` function
- Implemented `rejectPromotion(pattern, rejector, reason, projectRoot)` function

**Acceptance Criteria:**
- [x] Approval status check working
- [x] Rejection status check working
- [x] Pending status check working
- [x] Full approval workflow functional

### S2-T6: Create /approve command

**Status:** COMPLETE

**Files Modified:**
- `.claude/commands/approve.md`

**Changes:**
- Updated version to 6.1.0
- Added v6.1 curated promotion documentation
- Added usage examples for:
  - `--pending` to list pending promotions
  - `--reject` to reject patterns
  - Pattern approval workflow
- Added promotion lifecycle documentation
- Added implementation reference to survival-observer.ts functions

**Acceptance Criteria:**
- [x] Command documentation complete
- [x] Examples for all operations
- [x] Integration points documented

### S2-T7: Implement hard eviction for Virtual Sanctuary

**Status:** COMPLETE

**Files Modified:**
- `sigil-mark/process/seed-manager.ts`

**Changes:**
- Added `EvictedSeed` interface extending `Seed`
- Added `loadSeedWithEviction()` function that:
  - Checks if ANY real component exists in Sanctuary
  - If yes, hard deletes ALL virtual components
  - Persists eviction status to seed.yaml
  - Returns evicted seed with original count
- Added `isSeedEvicted()` type guard
- Added `queryVirtualComponentWithEviction()` function
- Added `resetSeed(seedId, projectRoot, force)` function
- Added `getEvictionStatus()` function

**Acceptance Criteria:**
- [x] Hard eviction triggers on first real component
- [x] ALL virtual components deleted (not just matching)
- [x] Eviction status persisted
- [x] Reset functionality for cleanup

### S2-T8: Create /reset-seed command

**Status:** COMPLETE

**Files Created:**
- `.claude/commands/reset-seed.md`

**Changes:**
- Created new command documentation
- Documented usage for:
  - `--status` to check eviction status
  - Reset to specific seed (linear, vercel, stripe, blank)
  - `--force` for reset with existing components
- Documented eviction lifecycle
- Added safety checks documentation

**Acceptance Criteria:**
- [x] Command documentation complete
- [x] All reset scenarios covered
- [x] Safety warnings documented

### S2-T9: Create E2E test suite

**Status:** COMPLETE

**Files Created:**
- `sigil-mark/__tests__/e2e/v61-integration.test.ts`

**Test Coverage:**
- Vocabulary integration tests (loadVocabulary, extractVocabularyTerms, resolveZone/Physics)
- Taste-key curation tests (determineStatusWithCuration, approval workflow)
- Hard eviction tests (loadSeedWithEviction, queryWithEviction, resetSeed)
- Cache coherence tests (vocabulary cache, survival index, taste-key config)
- Full craft flow integration tests
- Performance benchmarks (<5ms vocabulary lookup, <2ms zone resolution)

**Test Count:** 40+ test cases

**Acceptance Criteria:**
- [x] Vocabulary integration tested
- [x] Taste-key workflow tested
- [x] Hard eviction tested
- [x] Cache coherence tested
- [x] Performance benchmarks included

## Files Changed Summary

| File | Action | Description |
|------|--------|-------------|
| `sigil-mark/process/agent-orchestration.ts` | Modified | Vocabulary integration |
| `sigil-mark/process/survival-observer.ts` | Modified | Taste-key curation |
| `sigil-mark/process/seed-manager.ts` | Modified | Hard eviction |
| `.claude/commands/approve.md` | Modified | v6.1 update |
| `.claude/commands/reset-seed.md` | Created | New command |
| `sigil-mark/__tests__/e2e/v61-integration.test.ts` | Created | E2E tests |

## Architecture Decisions

### 1. Vocabulary Caching
- Single cache instance per project root
- Cache invalidation via `clearVocabularyCache()`
- Prevents repeated file reads during craft flow

### 2. Curated Promotion Model
- Patterns at 5+ occurrences become `canonical-candidate` (not auto-canonical)
- Requires explicit taste-key approval via `/approve`
- Prevents "mob rule" where any pattern can become canonical

### 3. Hard Eviction Strategy
- Binary decision: ANY real component → evict ALL virtual
- Eliminates ghost components and confusion
- `/reset-seed` for intentional restoration

## Testing Notes

All new functionality includes:
- Unit tests for individual functions
- Integration tests for workflows
- E2E tests for full scenarios
- Performance benchmarks

## Next Steps

Ready for `/review-sprint v6.1-sprint-2`:
1. Code review for implementation quality
2. Test execution verification
3. Architecture alignment check

After review approval: `/audit-sprint v6.1-sprint-2` for security audit.
