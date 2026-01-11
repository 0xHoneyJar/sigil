# Sigil v4.1 Sprint Plan — "Living Guardrails"

**Version:** 4.1.0
**Codename:** Living Guardrails
**Generated:** 2026-01-07
**Total Sprints:** 6
**Status:** COMPLETED

---

## Overview

This sprint plan implements Sigil v4.1 "Living Guardrails" — adding enforcement capabilities to the v4.0 context documentation system based on two independent reviews.

| Sprint | Theme | Priority | PRD Requirements |
|--------|-------|----------|------------------|
| Sprint 1 | Foundation: Version Coherence & Provider | P0 | FR-7, FR-2 (partial) |
| Sprint 2 | Foundation: useSigilMutation Hook | P0 | FR-1 |
| Sprint 3 | Foundation: ESLint Plugin | P0 | FR-3 |
| Sprint 4 | Context: Vocabulary & Physics Timing | P1 | FR-4, FR-6 |
| Sprint 5 | Marketing: Remote Soul & /observe Skill | P2 | FR-5, FR-9 |
| Sprint 6 | Polish: Deprecated Code & Migration | P1 | FR-8, NFR-4 |

### Key Architecture Changes

```
v4.0: "Context as documentation — agents read, nothing enforces"
v4.1: "Context as enforcement — compile + runtime + agent all consume"

┌─────────────────────────────────────────────────────────────────────────┐
│                           AGENT TIME                                     │
│  zone-reader → persona-reader → vocab-reader → physics-reader           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                      ┌─────────────┴─────────────┐
                      ▼                           ▼
┌─────────────────────────────────┐  ┌────────────────────────────────────┐
│       COMPILE TIME              │  │           RUNTIME                   │
│  eslint-plugin-sigil            │  │  SigilProvider + useSigilMutation  │
│  • enforce-tokens               │  │  • Auto-resolved physics            │
│  • zone-compliance              │  │  • Persona overrides                │
│  • input-physics                │  │  • Remote soul vibes                │
└─────────────────────────────────┘  └────────────────────────────────────┘
```

---

## MVP Definition

**MVP Scope (Sprints 1-3):**
- Version coherence (single source of truth)
- SigilProvider context
- useSigilMutation with auto-resolved physics
- ESLint plugin with 3 rules

**Post-MVP (Sprints 4-6):**
- Vocabulary layer with 10 terms
- Physics timing mapping
- Remote soul for marketing vibes
- /observe skill implementation
- Deprecated code cleanup
- Migration guide

---

## Sprint 1: Foundation — Version Coherence & Provider

**Goal:** Establish single source of version truth and create SigilProvider context foundation.
**Status:** COMPLETED
**Completed:** 2026-01-07
**Report:** loa-grimoire/a2a/v4.1-sprint-1/reviewer.md

### Tasks

#### v4.1-S1-T1: Version Coherence Audit
**Description:** Audit all version strings in codebase and consolidate to single source.

**Acceptance Criteria:**
- [x] `.sigil-version.json` created as single source of truth with version `4.1.0`
- [x] `.sigilrc.yaml` version updated to `4.1.0`
- [x] All hook files version comments removed or updated
- [x] All process files updated to v4.1
- [x] `sigil-mark/package.json` version updated to `4.1.0`
- [ ] `grep -r "v2\|v3\|3\.0\|2\.0" .` returns 0 results (excluding changelogs, archives) - **Deferred to Sprint 6**

**Files to modify:**
- `.sigil-version.json` (create)
- `.sigilrc.yaml`
- `sigil-mark/core/*.ts`
- `sigil-mark/process/*.ts`
- `sigil-mark/package.json`

**Testing:** Version coherence verification script

---

#### v4.1-S1-T2: Create SigilProvider Context
**Description:** Create the main context provider that will hold zone, persona, and remote soul state.

**Acceptance Criteria:**
- [x] `SigilProvider` component created at `sigil-mark/providers/sigil-provider.tsx`
- [x] `ZoneContext` with `current` and `setZone`
- [x] `PersonaContext` with `current`, `setPersona`, `traits`
- [x] `RemoteSoulContext` placeholder (stub for Sprint 5)
- [x] Export hooks: `useZoneContext`, `usePersonaContext`, `useRemoteSoulContext`
- [x] TypeScript types for all context values
- [x] `SigilProviderProps` accepts `persona`, `remoteConfigKey`, `localVibes`

**Files to create:**
- `sigil-mark/providers/sigil-provider.tsx`
- `sigil-mark/providers/index.ts`

**Testing:** Unit tests for SigilProvider context

---

#### v4.1-S1-T3: Update .sigilrc.yaml Schema for Persona Overrides
**Description:** Extend zone schema to support `default_physics` and `persona_overrides`.

**Acceptance Criteria:**
- [x] Zones support `default_physics` block with `sync`, `timing`, `motion`
- [x] Zones support `persona_overrides` object keyed by persona name
- [x] Each persona override can specify `timing`, `motion`, `show_help`
- [x] At least `critical` and `marketing` zones have overrides defined
- [x] Example overrides: `newcomer` (slower, reassuring) and `power_user` (faster, snappy)
- [x] Schema validated with existing readers
- [ ] CLAUDE.md updated with new schema documentation - **Deferred to Sprint 6**

**Files to modify:**
- `.sigilrc.yaml`
- `CLAUDE.md`

**Testing:** Schema validation tests

---

#### v4.1-S1-T4: Zone Layout Wrapper Updates
**Description:** Update existing layout wrappers to set zone context.

**Acceptance Criteria:**
- [x] `CriticalZone` layout sets zone context on mount via `useZoneContext().setZone('critical')`
- [x] Zone context cleared on unmount (return to null)
- [x] Data attributes added for debugging (`data-sigil-zone="critical"`)
- [x] Additional layouts updated if present (marketing, admin)

**Files to modify:**
- `sigil-mark/layouts/critical-zone.tsx` (or equivalent)

**Dependencies:** v4.1-S1-T2 (SigilProvider must exist)

**Testing:** Integration test for zone context setting/clearing

---

### Sprint 1 Dependencies
- None (foundation sprint)

### Sprint 1 Testing Requirements
- Unit tests for SigilProvider context
- Integration test for zone context setting/clearing
- Version coherence verification script

---

## Sprint 2: Foundation — useSigilMutation Hook

**Goal:** Create the zone+persona-aware mutation hook that auto-resolves physics.
**Status:** COMPLETED
**Completed:** 2026-01-07
**Report:** loa-grimoire/a2a/v4.1-sprint-2/reviewer.md

### Tasks

#### v4.1-S2-T1: Physics Resolution Algorithm
**Description:** Implement the core algorithm that resolves physics from zone + persona + remote soul.

**Acceptance Criteria:**
- [x] `resolvePhysics(zone, persona, remoteSoul)` function implemented
- [x] Returns `ResolvedPhysics` with `sync`, `timing`, `motion`, `easing`, `disabled_while_pending`
- [x] Zone base physics loaded from cached config
- [x] Persona overrides applied when present in zone config
- [x] Remote vibe modifiers applied (placeholder for Sprint 5)
- [x] `getMotionTiming(motion)` returns concrete ms value
- [x] `getMotionEasing(motion)` returns easing string
- [x] Default motion mappings: instant=0, snappy=150, warm=300, deliberate=800, reassuring=1200, celebratory=1200

**Files to create:**
- `sigil-mark/hooks/physics-resolver.ts`

**Testing:** Unit tests for resolvePhysics

---

#### v4.1-S2-T2: useSigilMutation Hook Implementation
**Description:** Create the main hook that replaces `useCriticalAction`.

**Acceptance Criteria:**
- [x] Hook accepts `SigilMutationConfig<TData, TVariables>` with:
  - `mutation: (variables) => Promise<TData>`
  - `zone?: string` (optional override)
  - `persona?: string` (optional override)
  - `unsafe_override_physics?: Partial<ResolvedPhysics>`
  - `unsafe_override_reason?: string`
  - `onSuccess?: (data) => void`
  - `onError?: (error) => void`
- [x] Auto-resolves zone from context (explicit > layout > 'default')
- [x] Auto-resolves persona from context (explicit > context > 'power_user')
- [x] Returns `SigilMutationResult<TData, TVariables>` with:
  - `status`: 'idle' | 'pending' | 'confirmed' | 'failed'
  - `data`, `error`
  - `physics`: resolved physics
  - `disabled`: true when pessimistic sync and pending
  - `isPending`: boolean
  - `style`: { '--sigil-duration', '--sigil-easing' }
  - `execute`, `reset`
- [x] Console warning logged when `unsafe_override_physics` used

**Files to create:**
- `sigil-mark/hooks/use-sigil-mutation.ts`
- `sigil-mark/hooks/index.ts` (update exports)

**Dependencies:** v4.1-S2-T1 (physics resolver)

**Testing:** Unit tests for useSigilMutation

---

#### v4.1-S2-T3: useCriticalAction Deprecation Warning
**Description:** Add deprecation warning to existing hook pointing to new hook.

**Acceptance Criteria:**
- [x] `useCriticalAction` logs deprecation warning on first use
- [x] Warning message: "useCriticalAction is deprecated. Use useSigilMutation instead."
- [x] Warning includes migration example
- [x] Warning only logs once per session (not every render)
- [x] Hook continues to work for backward compatibility

**Files to modify:**
- `sigil-mark/core/use-critical-action.ts`

**Testing:** Deprecation warning test

---

#### v4.1-S2-T4: useSigilMutation Unit Tests
**Description:** Comprehensive test coverage for the new hook.

**Acceptance Criteria:**
- [x] Test: Auto-resolves zone from context
- [x] Test: Auto-resolves persona from context
- [x] Test: Applies persona overrides correctly
- [x] Test: Returns correct CSS variables
- [x] Test: `disabled` true when pessimistic sync and pending
- [x] Test: Override with `unsafe_` prefix works
- [x] Test: Console warning logged on override
- [x] Test: Mutation lifecycle (idle -> pending -> confirmed/failed)

**Files to create:**
- `sigil-mark/hooks/__tests__/use-sigil-mutation.test.ts`

**Testing:** Full test coverage

---

### Sprint 2 Dependencies
- Sprint 1 (SigilProvider, version coherence)

### Sprint 2 Testing Requirements
- Unit tests for `resolvePhysics`
- Unit tests for `useSigilMutation`
- Integration test with SigilProvider

---

## Sprint 3: Foundation — ESLint Plugin

**Goal:** Create eslint-plugin-sigil with three enforcement rules.
**Status:** COMPLETED
**Completed:** 2026-01-07
**Report:** loa-grimoire/a2a/v4.1-sprint-3/reviewer.md

### Tasks

#### v4.1-S3-T1: ESLint Plugin Scaffold
**Description:** Create the plugin package structure with config loader.

**Acceptance Criteria:**
- [x] `packages/eslint-plugin-sigil/` directory created
- [x] `package.json` with dependencies:
  - `@typescript-eslint/utils: ^6.0.0`
  - `minimatch: ^9.0.0`
  - `yaml: ^2.4.0`
- [x] `tsconfig.json` configured for ESLint plugin development
- [x] `src/index.ts` plugin entry point exporting rules and configs
- [x] `src/config-loader.ts` loads and caches `.sigilrc.yaml`
- [x] `src/zone-resolver.ts` resolves file path to zone using minimatch
- [x] Build script with `tsup` in package.json

**Files to create:**
- `packages/eslint-plugin-sigil/package.json`
- `packages/eslint-plugin-sigil/tsconfig.json`
- `packages/eslint-plugin-sigil/src/index.ts`
- `packages/eslint-plugin-sigil/src/config-loader.ts`
- `packages/eslint-plugin-sigil/src/zone-resolver.ts`

**Testing:** Config loading tests

---

#### v4.1-S3-T2: enforce-tokens Rule
**Description:** Rule that disallows arbitrary Tailwind values.

**Acceptance Criteria:**
- [x] Detects arbitrary values: `[13px]`, `[2rem]`, `[#ff0000]`, etc. in className
- [x] Reports error with messageId `noMagicNumber`
- [x] Message includes the detected value
- [x] Handles template literals in className (basic support)
- [x] Handles string concatenation in className (basic support)

**Examples:**
```javascript
// ✗ Error: Use token value instead of arbitrary value: [13px]
<div className="gap-[13px]">

// ✓ OK
<div className="gap-2">
```

**Files to create:**
- `packages/eslint-plugin-sigil/src/rules/enforce-tokens.ts`
- `packages/eslint-plugin-sigil/tests/enforce-tokens.test.ts`

**Testing:** Unit tests for various patterns

---

#### v4.1-S3-T3: zone-compliance Rule
**Description:** Rule that enforces zone-appropriate timing values.

**Acceptance Criteria:**
- [x] Detects `duration` property in objects (framer-motion transitions)
- [x] Converts seconds to milliseconds (framer uses seconds)
- [x] Detects `duration-N` Tailwind classes in className
- [x] Reports warning if timing too fast for zone's motion type
- [x] Reports warning if timing too slow for zone's motion type
- [x] Loads zone constraints from `.sigilrc.yaml` via config-loader
- [x] Motion → timing constraints mapping:
  - instant: 0-50ms
  - snappy: 100-200ms
  - warm: 200-400ms
  - deliberate: 500-1000ms
  - reassuring: 800-1500ms

**Examples:**
```javascript
// In critical zone file (motion: deliberate):
// ✗ Warning: Duration 200ms is too fast for critical zone (min: 500ms)
<motion.div animate={{ transition: { duration: 0.2 } }}>

// ✓ OK
<motion.div animate={{ transition: { duration: 0.8 } }}>
```

**Files to create:**
- `packages/eslint-plugin-sigil/src/rules/zone-compliance.ts`
- `packages/eslint-plugin-sigil/tests/zone-compliance.test.ts`

**Testing:** Unit tests for critical and marketing zones

---

#### v4.1-S3-T4: input-physics Rule
**Description:** Rule that enforces keyboard navigation in machinery/admin zones.

**Acceptance Criteria:**
- [x] Detects elements with `onClick` but no `onKeyDown`
- [x] Detects elements with `onClick` but no `tabIndex`
- [x] Only enforces in `admin` zone (configurable)
- [x] Exempts native interactive elements: button, a, input, select, textarea
- [x] Reports warning with zone context in message

**Examples:**
```javascript
// In admin zone:
// ✗ Warning: Interactive element should have onKeyDown and tabIndex in admin zone
<div onClick={handleClick}>

// ✓ OK
<div onClick={handleClick} onKeyDown={handleKey} tabIndex={0}>

// ✓ OK (native interactive)
<button onClick={handleClick}>
```

**Files to create:**
- `packages/eslint-plugin-sigil/src/rules/input-physics.ts`
- `packages/eslint-plugin-sigil/tests/input-physics.test.ts`

**Testing:** Unit tests for various element types

---

#### v4.1-S3-T5: Recommended Config Preset
**Description:** Create preset configuration for easy adoption.

**Acceptance Criteria:**
- [x] `configs/recommended.ts` exports flat ESLint config
- [x] `sigil/enforce-tokens` set to `error`
- [x] `sigil/zone-compliance` set to `warn`
- [x] `sigil/input-physics` set to `warn`
- [ ] Integration documented in CLAUDE.md - **Deferred to Sprint 6**

**Usage:**
```javascript
// eslint.config.js
import sigil from 'eslint-plugin-sigil';

export default [
  sigil.configs.recommended,
];
```

**Files to create:**
- `packages/eslint-plugin-sigil/src/configs/recommended.ts`

**Files to modify:**
- `CLAUDE.md` (add ESLint integration section)

**Testing:** Config integration test

---

### Sprint 3 Dependencies
- Sprint 1 (.sigilrc.yaml schema updates for zone motion)

### Sprint 3 Testing Requirements
- Unit tests for each rule
- Integration test with real codebase files
- Test config loading from .sigilrc.yaml

---

## Sprint 4: Context — Vocabulary & Physics Timing

**Goal:** Add vocabulary layer and concrete physics timing mapping.
**Status:** COMPLETED
**Completed:** 2026-01-07
**Report:** loa-grimoire/a2a/v4.1-sprint-4/reviewer.md

### Tasks

#### v4.1-S4-T1: Physics Timing YAML
**Description:** Create physics.yaml with motion name -> timing mapping.

**Acceptance Criteria:**
- [x] `sigil-mark/kernel/physics.yaml` created
- [x] All motion names defined: `instant`, `snappy`, `warm`, `deliberate`, `reassuring`, `celebratory`, `reduced`
- [x] Each motion has:
  - `duration`: value (or min/max/default for ranges)
  - `unit`: ms
  - `easing`: CSS easing string
  - `description`: human-readable explanation
- [x] Sync strategies defined: `pessimistic`, `optimistic`, `hybrid`
- [x] JSON Schema at `sigil-mark/kernel/schemas/physics.schema.json`

**Files created:**
- `sigil-mark/kernel/physics.yaml`
- `sigil-mark/kernel/schemas/physics.schema.json`

---

#### v4.1-S4-T2: Physics Reader
**Description:** Create/update reader to load physics.yaml for agent and hook use.

**Acceptance Criteria:**
- [x] `physics-reader.ts` loads and parses physics.yaml
- [x] `getMotionConfig(motion)` returns full motion config
- [x] `getMotionTiming(motion)` returns concrete ms value (uses default for ranges)
- [x] `getMotionEasing(motion)` returns easing string
- [x] `getMotionConstraints(motion)` returns { min, max } for zone-compliance rule
- [x] Results cached for performance
- [x] Fallback to hardcoded defaults if physics.yaml missing

**Files created:**
- `sigil-mark/process/physics-reader.ts`

**Files modified:**
- `sigil-mark/hooks/physics-resolver.ts` (added getMotionConstraints export)
- `sigil-mark/process/index.ts` (added physics exports)

---

#### v4.1-S4-T3: Vocabulary YAML with 10 Terms
**Description:** Update vocabulary.yaml with 10 product term definitions.

**Acceptance Criteria:**
- [x] `sigil-mark/vocabulary/vocabulary.yaml` updated with 10 core terms
- [x] 10 terms defined: `pot`, `vault`, `claim`, `deposit`, `withdraw`, `boost`, `stake`, `unstake`, `harvest`, `connect`
- [x] Each term has:
  - `engineering_name`: backend/code name
  - `user_facing`: display name
  - `mental_model`: user's mental model description
  - `recommended`: { material, motion, tone }
  - `zones`: where this term is typically used
  - `last_refined`: null (updated by /refine)
- [x] JSON Schema updated at `sigil-mark/vocabulary/schemas/vocabulary.schema.json`

**Files modified:**
- `sigil-mark/vocabulary/vocabulary.yaml`
- `sigil-mark/vocabulary/schemas/vocabulary.schema.json`

---

#### v4.1-S4-T4: Vocabulary Reader
**Description:** Update reader for vocabulary.yaml with new functions.

**Acceptance Criteria:**
- [x] `getTerm(termId)` returns full term definition (existing)
- [x] `getRecommendedPhysics(termId)` returns { material, motion, tone }
- [x] `findByEngineeringName(name)` reverse lookup from code name
- [x] `getAllTerms()` returns all terms for gap detection
- [x] Missing terms return null (for gap detection)

**Files modified:**
- `sigil-mark/process/vocabulary-reader.ts`
- `sigil-mark/process/index.ts` (added new exports)

---

#### v4.1-S4-T5: /craft Vocabulary Integration
**Description:** Update crafting-guidance skill to reference vocabulary.

**Acceptance Criteria:**
- [x] `/craft` loads vocabulary when generating (documented in SKILL.md)
- [x] If component name matches a vocabulary term, uses term's recommended physics
- [x] Gap detection surfaces undefined terms at end of output
- [x] Suggests `/refine --vocab <term>` for new terms
- [x] SKILL.md updated with vocabulary section

**Files modified:**
- `.claude/skills/crafting-guidance/SKILL.md`

---

### Sprint 4 Dependencies
- Sprint 2 (physics resolver for hook integration) - SATISFIED

### Sprint 4 Testing Requirements
- [x] Schema validation (physics.schema.json, vocabulary.schema.json)
- [x] Integration with /craft skill (documented)

---

## Sprint 5: Marketing — Remote Soul & /observe Skill

**Goal:** Enable marketing-controlled vibes and complete visual feedback loop.
**Status:** COMPLETED
**Completed:** 2026-01-07
**Report:** loa-grimoire/a2a/v4.1-sprint-5/reviewer.md

### Tasks

#### v4.1-S5-T1: Remote Soul Schema
**Description:** Define the boundary between kernel (immutable) and vibe (remote).

**Acceptance Criteria:**
- [x] `sigil-mark/remote-soul.yaml` created
- [x] `kernel_locked` list defines engineering-controlled keys: physics, sync, protected_zones
- [x] `vibe_remote` list defines marketing-controlled keys:
  - essence.seasonal_theme
  - landing.hero_energy
  - onboarding.warmth
  - celebration.intensity
- [x] `integration` block for provider config (provider, fallback, refresh)
- [x] Clear documentation comments explaining boundary

**Files created:**
- `sigil-mark/remote-soul.yaml`

**Testing:** Schema review

---

#### v4.1-S5-T2: Remote Soul Adapter Implementation
**Description:** Create the adapter for LaunchDarkly/Statsig integration.

**Acceptance Criteria:**
- [x] `RemoteConfigAdapter` interface defined with `subscribe()` and `getVibes()`
- [x] `LaunchDarklyAdapter` implements interface
- [x] `useRemoteSoul(configKey, fallback)` hook created
- [x] 100ms timeout with local fallback (NFR-3)
- [x] Vibes merged with local defaults
- [x] Stub for Statsig adapter (interface only, no implementation)
- [x] `VibeConfig` type defined with: seasonal_theme, hero_energy, warmth_level, celebration_intensity, timing_modifier

**Files created:**
- `sigil-mark/providers/remote-soul.ts`

**Files modified:**
- `sigil-mark/providers/sigil-provider.tsx` (integrate RemoteSoulContext)
- `sigil-mark/providers/index.ts` (export remote soul utilities)

**Dependencies:** Sprint 1 (SigilProvider stub) - SATISFIED

**Testing:** Type safety via TypeScript

---

#### v4.1-S5-T3: useSigilMutation Remote Vibe Integration
**Description:** Connect remote vibes to physics resolution.

**Acceptance Criteria:**
- [x] `resolvePhysics` receives remote soul state
- [x] `timing_modifier` from vibes applied as multiplier to timing
- [x] Other vibe keys available in return value for component use
- [x] Graceful fallback when remote unavailable (uses local timing)

**Files modified:**
- `sigil-mark/hooks/physics-resolver.ts` (timing_modifier, vibes in ResolvedPhysics)
- `sigil-mark/hooks/use-sigil-mutation.ts` (documentation updates)

**Dependencies:** v4.1-S5-T2 - SATISFIED

**Testing:** Type safety via TypeScript

---

#### v4.1-S5-T4: /observe Skill Implementation
**Description:** Create the observing-feedback skill for visual feedback loop.

**Acceptance Criteria:**
- [x] `.claude/skills/observing-feedback/index.yaml` created with command `/observe`
- [x] `.claude/skills/observing-feedback/SKILL.md` with full workflow:
  1. Check MCP availability
  2. Capture screenshot via `mcp__claude-in-chrome__computer` action: screenshot
  3. Load rules.md constraints
  4. Analyze screenshot against rules (structural, measurable)
  5. Generate feedback questions
  6. Store output in `.sigil-observations/feedback/`
  7. Link to `/refine` for updates
- [x] Fallback documented when MCP unavailable (manual screenshot upload)
- [x] Progressive disclosure: L1 (capture), L2 (--component), L3 (--screenshot --rules)

**Files created:**
- `.claude/skills/observing-feedback/index.yaml`
- `.claude/skills/observing-feedback/SKILL.md`

**Testing:** Manual test with MCP

---

#### v4.1-S5-T5: Marketing Documentation
**Description:** Document how marketing uses remote config for vibe testing.

**Acceptance Criteria:**
- [x] `docs/MARKETING-VIBES.md` created
- [x] Explains kernel vs vibe boundary
- [x] LaunchDarkly setup instructions (flag names, context)
- [x] Available vibe flags documented with valid values
- [x] Example campaign configuration (Summer Gold vibe)
- [x] Warning about what marketing CANNOT control (physics, sync)

**Files created:**
- `docs/MARKETING-VIBES.md`

**Testing:** Documentation review

---

### Sprint 5 Dependencies
- Sprint 2 (useSigilMutation) - SATISFIED
- Sprint 4 (physics timing for modifier) - SATISFIED

### Sprint 5 Testing Requirements
- [x] Type safety via TypeScript
- [x] Manual test for /observe skill workflow
- [ ] Integration test with LaunchDarkly (future)

---

## Sprint 6: Polish — Deprecated Code & Migration

**Goal:** Clean up deprecated code and create comprehensive migration guide.
**Status:** COMPLETED
**Completed:** 2026-01-07
**Report:** loa-grimoire/a2a/v4.1-sprint-6/reviewer.md

### Tasks

#### v4.1-S6-T1: Delete Process Layer Runtime Exports
**Description:** Remove React hooks from process layer (agent-only).

**Acceptance Criteria:**
- [x] `ProcessContextProvider` export removed from process/
- [x] `useProcessContext` export removed
- [x] `useConstitution` export removed
- [x] `useDecisions` export removed
- [x] No 'use client' directive in any process files
- [x] Comment added at top of each process file: "// AGENT-ONLY: Do not import in browser code"
- [x] Process index.ts only exports reader functions, not hooks

**Files modified:**
- `sigil-mark/process/process-context.tsx`
- `sigil-mark/process/index.ts`

**Testing:** Build test to verify no client imports

---

#### v4.1-S6-T2: Build-Time Enforcement for Process Layer
**Description:** Ensure process layer cannot be bundled for browser.

**Acceptance Criteria:**
- [x] CI check script greps for process imports in client files
- [x] Attempting to import process layer in 'use client' file causes clear error
- [x] Error message explains that process is agent-only

**Files created:**
- `scripts/check-process-imports.sh`

**Testing:** CI check passes

---

#### v4.1-S6-T3: useCriticalAction Migration Path
**Description:** Provide clear migration from old hook to new.

**Acceptance Criteria:**
- [x] Deprecation warning includes example migration
- [x] Warning shows before/after code comparison
- [x] Warning lists benefits of useSigilMutation
- [x] `useCriticalAction` still works but warns

**Files modified:**
- `sigil-mark/core/use-critical-action.ts`

**Testing:** Migration example works

---

#### v4.1-S6-T4: MIGRATION-v4.1.md Guide
**Description:** Comprehensive migration guide from v4.0 to v4.1.

**Acceptance Criteria:**
- [x] Step-by-step migration instructions
- [x] .sigilrc.yaml schema changes documented
- [x] Hook replacement examples (useCriticalAction -> useSigilMutation)
- [x] ESLint configuration guide
- [x] Vocabulary setup guide
- [x] Remote soul setup (optional)
- [x] Breaking changes highlighted
- [x] FAQ section

**Files created:**
- `MIGRATION-v4.1.md`

**Testing:** Documentation review

---

#### v4.1-S6-T5: CLAUDE.md Final Update
**Description:** Update CLAUDE.md to reflect complete v4.1 architecture.

**Acceptance Criteria:**
- [x] Version updated to v4.1
- [x] useSigilMutation documented with usage example
- [x] ESLint plugin integration documented
- [x] Vocabulary layer documented
- [x] Remote soul documented (optional)
- [x] Physics timing reference
- [x] Process layer marked as agent-only
- [x] All commands accurate
- [x] Key files section updated

**Files modified:**
- `CLAUDE.md`

**Testing:** Documentation review

---

#### v4.1-S6-T6: Final Version Verification
**Description:** CI script to verify version coherence.

**Acceptance Criteria:**
- [x] `scripts/verify-version.sh` created
- [x] Script checks all version references match `.sigil-version.json`
- [x] CI-compatible (exit code 0/1)
- [x] Clear error if version mismatch detected
- [x] Package.json version matches

**Files created:**
- `scripts/verify-version.sh`

**Testing:** Script execution passes

---

### Sprint 6 Dependencies
- Sprints 1-5 (all previous work complete)

### Sprint 6 Testing Requirements
- Build test for process layer isolation
- Version coherence verification
- Migration guide walkthrough test

---

## Dependencies Graph

```
Sprint 1 (Foundation: Version & Provider)
    │
    └───────────────────────────────────────────────────────────────────┐
                                                                        │
Sprint 2 (Foundation: useSigilMutation) ←───────────────────────────────┤
    │                                                                   │
    ├───────────────────────────────────────────────────────────────────┤
    │                                                                   │
Sprint 3 (Foundation: ESLint Plugin) ←──────────────────────────────────┤
    │                                                                   │
    │                                                                   │
Sprint 4 (Context: Vocabulary & Physics) ←──────────────────────────────┤
    │                                                                   │
    └───────────────────────────────────────────────────────────────────┤
                                                                        │
Sprint 5 (Marketing: Remote Soul & /observe) ←──────────────────────────┤
    │                                                                   │
    └───────────────────────────────────────────────────────────────────┤
                                                                        │
                                                                        ▼
                                                          Sprint 6 (Polish)
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ESLint plugin complexity | Medium | Medium | Start with enforce-tokens, simplest rule |
| Zone detection edge cases | Medium | Low | Allow explicit zone prop override in hooks |
| Breaking existing useCriticalAction users | High | Medium | Keep deprecated hook working with warning |
| Remote config latency | Low | Low | 100ms timeout with local fallback |
| Vocabulary scope creep | Medium | Low | Fixed 10 terms for v4.1, more in v4.2 |
| Process layer accidental import | Medium | Medium | Build-time error + CI check |

---

## Success Metrics

| Metric | Current (v4.0) | Target (v4.1) | Sprint |
|--------|----------------|---------------|--------|
| Version strings | 4 different | 1 unified | Sprint 1 |
| ESLint rules enforcing | 0 | 3 | Sprint 3 |
| Physics auto-resolved | No | Yes | Sprint 2 |
| Vocabulary terms defined | 0 | 10 | Sprint 4 |
| Process runtime exports | Possible | Build error | Sprint 6 |
| useSigilMutation coverage | 0% | 100% internal | Sprint 6 |
| Remote vibe configuration | No | Yes (optional) | Sprint 5 |

---

## Review Traceability

This sprint plan addresses findings from:

**SIGIL-V4-LITE-REVIEW.md (Technical, Grade C-):**
| Issue | PRD Requirement | Sprint |
|-------|-----------------|--------|
| Issue 1 (Version Schizophrenia) | FR-7 | Sprint 1 |
| Issue 3 (No Transaction Objects) | FR-1 | Sprint 2 |
| Issue 4 (No Token Enforcement) | FR-3 | Sprint 3 |
| Issue 5 (Hollow Shell) | FR-1, FR-3 | Sprint 2, 3 |
| Issue 6 (Process Layer Confusion) | FR-8 | Sprint 6 |
| Issue 7 (Physics Without Timing) | FR-6 | Sprint 4 |
| Issue 11 (Commands vs Skills) | FR-9 | Sprint 5 |

**V4-REVIEW-2.md (Product, Grade A-/C):**
| Issue | PRD Requirement | Sprint |
|-------|-----------------|--------|
| Issue 1 (Path is Destiny) | FR-2 | Sprint 1 |
| Issue 2 (Hardcoded Soul) | FR-5 | Sprint 5 |
| Issue 4 (Physics Without Language) | FR-4 | Sprint 4 |

---

## Previous Version

Sigil v4.0 "Sharp Tools" (completed 2026-01-07):
- 10 sprints completed
- 7 tools implemented
- Progressive disclosure added
- All sprints COMPLETED

---

## Version History

| Sprint | Status | Completed |
|--------|--------|-----------|
| Sprint 1 (Version & Provider) | COMPLETED | 2026-01-07 |
| Sprint 2 (useSigilMutation) | COMPLETED | 2026-01-07 |
| Sprint 3 (ESLint Plugin) | COMPLETED | 2026-01-07 |
| Sprint 4 (Vocabulary & Physics) | COMPLETED | 2026-01-07 |
| Sprint 5 (Remote Soul & /observe) | COMPLETED | 2026-01-07 |
| Sprint 6 (Polish & Migration) | COMPLETED | 2026-01-07 |

---

## Next Step

Sigil v4.1 "Living Guardrails" is now complete.

All 6 sprints have been implemented:
- Sprint 1: Version Coherence & SigilProvider
- Sprint 2: useSigilMutation Hook
- Sprint 3: ESLint Plugin (3 rules)
- Sprint 4: Vocabulary Layer & Physics Timing
- Sprint 5: Remote Soul & /observe Skill
- Sprint 6: Polish & Migration Guide

### v4.1 Release Checklist

```
[ ] Review all sprint reports in loa-grimoire/a2a/v4.1-sprint-*/reviewer.md
[ ] Run ./scripts/verify-version.sh
[ ] Run ./scripts/check-process-imports.sh
[ ] Review MIGRATION-v4.1.md for accuracy
[ ] Update CHANGELOG.md
[ ] Tag release: git tag -a v4.1.0 -m "Sigil v4.1.0 Living Guardrails"
```

---

*Generated: 2026-01-07*
*Version: Sigil v4.1 "Living Guardrails"*
*Sources: loa-grimoire/prd.md, loa-grimoire/sdd.md*
