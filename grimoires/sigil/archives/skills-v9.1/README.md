# Archived Skills from v9.1

This directory documents the 38 Sigil skills that were consolidated into 3 skills in v10.1 "Usage Reality".

## Consolidation Summary

| New Skill | Absorbed Skills (Count) |
|-----------|------------------------|
| **Mason** | 18 generation/crafting skills |
| **Gardener** | 10 governance/observation skills |
| **Diagnostician** | 5 consultation/debugging skills |
| **(Removed)** | 5 no longer needed |

## Skills Merged into Mason

Generation and crafting-related skills:

1. `approving-patterns` - Pattern approval workflow
2. `auditing-cohesion` - Visual consistency checks
3. `chronicling-rationale` - Decision logging
4. `codifying-materials` - Material definitions
5. `codifying-recipes` - Component recipes
6. `codifying-rules` - Design rules
7. `crafting-components` - Component generation
8. `crafting-guidance` - Design guidance
9. `envisioning-moodboard` - Moodboard creation
10. `envisioning-soul` - Product soul capture
11. `exporting-config` - Configuration export
12. `forging-patterns` - Pattern creation
13. `greenlighting-concepts` - Concept approval
14. `inspiring-ephemerally` - Ephemeral inspiration
15. `mapping-zones` - Zone configuration
16. `observing-visual` - Visual observation
17. `refining-context` - Context refinement
18. `validating-fidelity` - Fidelity validation
19. `validating-lenses` - Lens validation
20. `validating-physics` - Physics validation

## Skills Merged into Gardener

Governance and observation-related skills:

1. `canonizing-flaws` - Flaw canonization
2. `gardening-entropy` - Entropy management
3. `graduating-features` - Feature graduation
4. `graphing-imports` - Import graph analysis
5. `managing-eras` - Era management
6. `monitoring-features` - Feature monitoring
7. `observing-survival` - Survival observation
8. `proving-features` - Feature proving
9. `scanning-sanctuary` - Sanctuary scanning
10. `seeding-sanctuary` - Sanctuary seeding

## Skills Merged into Diagnostician

Consultation and debugging-related skills:

1. `consulting-decisions` - Decision consultation
2. `inheriting-design` - Design inheritance
3. `locking-decisions` - Decision locking
4. `querying-workshop` - Workshop queries
5. `unlocking-decisions` - Decision unlocking

## Skills Removed (No Longer Needed)

1. `initializing-sigil` - Replaced by Mason cold start
2. `sigil-core` - Consolidated into core library

## Why Consolidated?

### Before (v9.1)
- 49 total skills (38 Sigil + 11 Loa)
- Complex trigger logic with overlapping responsibilities
- Difficult to maintain and understand

### After (v10.1)
- 14 total skills (3 Sigil + 11 Loa)
- Clear separation of concerns
- 71% reduction in skill count

## Core Library Replacement

The 37 process files in `grimoires/sigil/process/` were consolidated into 6 core library modules:

| Old Process Files | New Module |
|------------------|------------|
| context-related | `src/lib/sigil/context.ts` |
| survival-related | `src/lib/sigil/survival.ts` |
| physics-related | `src/lib/sigil/physics.ts` |
| AST-related | `src/lib/sigil/ast-reader.ts` |
| diagnostic-related | `src/lib/sigil/diagnostician.ts` |
| search-related | `src/lib/sigil/search.ts` |

## Archived Date

- **Date:** 2026-01-11
- **Version:** v9.1.0 "Migration Debt Zero" → v10.1.0 "Usage Reality"

---

*This archive is for reference only. The skills are no longer functional.*
