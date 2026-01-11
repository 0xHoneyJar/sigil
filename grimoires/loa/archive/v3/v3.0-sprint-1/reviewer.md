# Sprint 1 Implementation Report: Critical Fixes (P0)

**Sprint:** v3.0-sprint-1
**Theme:** Critical Fixes (P0)
**Version:** Sigil v3.0 "Living Engine"
**Date:** 2026-01-06

---

## Executive Summary

Sprint 1 addressed the fatal bugs identified in the v2.6 review:
1. **fs-in-browser crash** — Removed ProcessContextProvider from exports
2. **Philosophy drift** — Rewrote skills to align with "sweat the art" philosophy

All tasks completed successfully. Process layer is now agent-only.

---

## Tasks Completed

### S1-T1: Remove ProcessContextProvider from exports ✅

**Files Modified:**
- `sigil-mark/index.ts`
- `sigil-mark/process/index.ts`
- `sigil-mark/process/process-context.tsx`

**Changes:**
1. Removed `ProcessContextProvider`, `ProcessContext`, and all `use*` hooks from main exports
2. Kept type-only exports for backwards compatibility
3. Added deprecation notice with migration guide
4. Updated module documentation to clarify agent-only usage
5. Removed `'use client'` directive from process-context.tsx
6. Added `@server-only` documentation to process/index.ts

**Key Code Changes:**

```typescript
// sigil-mark/index.ts (BEFORE)
export {
  ProcessContextProvider,
  useProcessContext,
  readConstitution,
  ...
} from './process';

// sigil-mark/index.ts (AFTER)
/**
 * @deprecated ProcessContextProvider has been removed in v3.0.
 */
export type {
  Constitution,
  ProtectedCapability,
  ...
} from './process';
```

**Version Update:**
- `VERSION = '3.0.0'`
- `CODENAME = "Living Engine"`

---

### S1-T2: Update Process layer documentation ✅

**Files Modified:**
- `CLAUDE.md` — Complete rewrite for v3.0
- `sigil-mark/process/index.ts` — Added server-only documentation

**CLAUDE.md Key Updates:**

1. **Architecture diagram** showing Agent-Time vs Runtime separation
2. **Philosophy section** with "Sweat the art" explanation
3. **Agent Protocol** explicitly stating Process is agent-only
4. **Zone Detection** clarified as Layout-based (not path-based)
5. **Migration guide** from v2.6 to v3.0
6. **Code examples** without ProcessContextProvider

**Documentation Structure:**
```
CLAUDE.md (v3.0)
├── v3.0 Architecture: Agent-Time vs Runtime
├── Philosophy (NEW)
│   ├── "Sweat the art" explanation
│   ├── Decision hierarchy
│   └── Agent role definition
├── Agent Protocol (v3.0)
│   ├── Process Layer is Agent-Only (⚠️ CRITICAL)
│   ├── Zone Detection (Layout-Based)
│   └── Vocabulary Integration
├── Process Layer (Agent-Only)
│   ├── Constitution
│   ├── Vocabulary (v3.0)
│   ├── Personas (renamed)
│   └── Locked Decisions
├── Runtime Layer
└── Migration from v2.6
```

---

### S1-T3: Rewrite consulting-decisions skill ✅

**File Modified:**
- `.claude/skills/consulting-decisions/SKILL.md`

**Philosophy Changes:**

| Aspect | v2.6 (Before) | v3.0 (After) |
|--------|---------------|--------------|
| Purpose | "Guide consultation process" | "Record deliberated decisions" |
| Philosophy | "Direction was consulted. Decision was made." | "Sweat the art. We handle the mechanics." |
| Tone | "Decide fast. Lock it. Move on." | "Craftsman deliberation is valuable" |
| Skill role | Makes decisions | Records decisions |

**Key Rewrite:**

```markdown
# v2.6 (REMOVED)
> "Direction was consulted. Decision was made."
> Not every decision needs community input.

# v3.0 (NEW)
> "Sweat the art. We handle the mechanics. Return to flow."

### What This Skill Does NOT Do
- Make decisions for the craftsman
- Rush the deliberation process
- Override existing locked decisions without justification
- Pressure you into quick choices
```

---

### S1-T4: Rewrite crafting-guidance skill ✅

**File Modified:**
- `.claude/skills/crafting-guidance/SKILL.md`

**Key Changes:**

1. **Removed `useProcessContext` from examples** — Was crashing in browser
2. **Added "Your Call" section** — Present options, let craftsman choose
3. **Added Vocabulary integration** — Term feel overrides zone defaults
4. **Added "What This Skill Does NOT Do"** section

**Philosophy Alignment:**

```markdown
### What This Skill Does
- Surfaces Process context (Constitution, Vocabulary, Decisions, Persona)
- Presents implementation options with clear tradeoffs
- Warns about Constitution constraints (informational, not blocking)

### What This Skill Does NOT Do
- Make design decisions for the craftsman
- Refuse to implement something based on opinion
- Choose between equivalent options without asking
- Override craftsman preferences
```

**Code Example Fix:**

```typescript
// v2.6 (BROKEN)
import { useProcessContext } from 'sigil-mark/process';
const { constitution } = useProcessContext(); // Crashes in browser!

// v3.0 (CORRECT)
import { useCriticalAction, CriticalZone, useLens } from 'sigil-mark';
// Process context embedded at generation time by agent
```

---

### S1-T5: Audit all skills for philosophy alignment ✅

**Skills Audited:**

| Skill | Status | Notes |
|-------|--------|-------|
| consulting-decisions | ✅ Rewritten | Philosophy aligned |
| crafting-guidance | ✅ Rewritten | ProcessContext removed, options format added |
| envisioning-moodboard | ✅ Good | "Do NOT rush the interview" aligns with philosophy |
| codifying-rules | ✅ Good | Interview-based, no rushing |
| approving-patterns | ✅ Good | Blocks physics overrides, allows taste overrides |
| initializing-sigil | ✅ Good | Setup skill, no philosophy issues |
| inheriting-design | ✅ Good | Analysis skill, no philosophy issues |
| updating-framework | ✅ Good | Utility skill, no philosophy issues |

**Audit Criteria:**
1. No language encouraging rushed decisions
2. Options presented as tradeoffs, not mandates
3. Craftsman makes taste decisions, agent handles mechanics
4. ProcessContextProvider not referenced in client code

---

## Test Impact

No new tests created in Sprint 1 (documentation and skill rewrites only).

Existing tests still pass — Process layer functions still work for agent use.

---

## Breaking Changes

| Change | Impact | Migration |
|--------|--------|-----------|
| `ProcessContextProvider` removed | Apps using it will fail at import | Remove from app, use props |
| `useProcessContext` removed | Hook no longer exported | Agent embeds context at generation |
| Version 3.0.0 | New major version | Update package.json |

---

## Verification Checklist

- [x] `ProcessContextProvider` not exported from `sigil-mark/index.ts`
- [x] Types-only export for backwards compatibility
- [x] `'use client'` removed from process-context.tsx
- [x] `@server-only` documented in process/index.ts
- [x] CLAUDE.md has agent protocol section
- [x] CLAUDE.md has philosophy section
- [x] consulting-decisions skill philosophy aligned
- [x] crafting-guidance skill philosophy aligned
- [x] crafting-guidance skill no longer references useProcessContext
- [x] All skills audited for philosophy alignment
- [x] Version bumped to 3.0.0

---

## Files Changed

```
sigil-mark/index.ts                           # ProcessContext exports removed
sigil-mark/process/index.ts                   # @server-only documentation
sigil-mark/process/process-context.tsx        # 'use client' removed
CLAUDE.md                                     # Complete v3.0 rewrite
.claude/skills/consulting-decisions/SKILL.md  # Philosophy rewrite
.claude/skills/crafting-guidance/SKILL.md     # Philosophy + code fix
```

---

## Next Sprint

Sprint 2 (P1 - Foundation) will implement:
- Vocabulary layer (`vocabulary.yaml` + `vocabulary-reader.ts`)
- Persona rename (`lens-array/` → `personas/`)
- Layout-only zone documentation cleanup

---

*Implementation Report Generated: 2026-01-06*
*Sprint Status: COMPLETED*
