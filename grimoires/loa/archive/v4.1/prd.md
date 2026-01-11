# Sigil v4.1 PRD — "Living Guardrails"

**Version:** 4.1.0
**Codename:** Living Guardrails
**Status:** Draft
**Date:** 2026-01-07

> *"Make the right path easy. Make the wrong path visible. Respond to the living market."*

---

## Executive Summary

Sigil v4.0 "Sharp Tools" successfully consolidated 37 commands into 7 discrete tools with progressive disclosure. However, two independent reviews reveal the implementation is a **hollow shell**: rich context documentation without runtime enforcement, and a static physics engine that ignores user fluidity.

**v4.1 "Living Guardrails"** addresses both the technical and product strategy gaps:

1. **Add Teeth** — Connect readers to enforcement (ESLint + runtime hooks)
2. **Add Fluidity** — Context-aware physics based on (Zone + Persona), not just Path
3. **Add Vocabulary** — Map product terms to physics feels
4. **Add Remote Soul** — Enable marketing vibe testing without code commits

### Key Changes

| Area | v4.0 (Current) | v4.1 (Target) |
|------|----------------|---------------|
| Enforcement | Readers without consumers | ESLint + `useSigilMutation` |
| Zone Resolution | Path-based only | Path + Persona + Intent |
| Soul Configuration | Git commits only | Remote config for vibe layer |
| Vocabulary | None | Term → Physics mapping |
| Physics Binding | Manual (`timeAuthority` param) | Auto-resolved from context |
| Version Coherence | Multiple versions in codebase | Single v4.1 throughout |

---

## Problem Statement

### What We Built (v4.0)

A comprehensive context documentation system with:
- 7 discrete tools (envision, codify, craft, observe, refine, consult, garden)
- Progressive disclosure (L1/L2/L3)
- Evidence-based personas and zones
- Visual feedback loop via MCP
- 10 YAML readers for agent context

### What's Broken

#### Technical Review Findings (Grade: C-)

1. **Hollow Shell** — Readers exist but nothing enforces behavior at runtime or compile time
2. **Version Schizophrenia** — CLAUDE.md claims v4.0, .sigilrc.yaml claims v3.0, hooks claim v2.0
3. **Layout Primitives Persist** — `CriticalZone` wrapper requires proprietary DSL learning
4. **No Transaction Objects** — `useCriticalAction` requires manual `timeAuthority` parameter
5. **No Token Enforcement** — ESLint plugin is a shell with no rules
6. **Process Layer Confusion** — Deprecated code still ships and works
7. **Physics Without Timing** — `motion: deliberate` has no concrete ms mapping

#### Product Strategy Review Findings (Grade: C)

1. **Path is Destiny Fallacy** — A Henlocker (novice) and Chef (power user) in `/trade` get identical physics
2. **Hardcoded Soul Trap** — Marketing can't test "Summer Gold" vibe without PR
3. **Democracy ≠ Research** — Polling favors retention over growth
4. **Physics Without Language** — "Pot" and "Vault" need different feels despite same backend

### Success Criteria

| Metric | v4.0 | v4.1 Target |
|--------|------|-------------|
| ESLint rules enforcing tokens | 0 | 3 (enforce-tokens, zone-compliance, input-physics) |
| Physics auto-resolved from context | No | Yes |
| Persona-aware zone physics | No | Yes |
| Remote vibe configuration | No | Yes |
| Vocabulary coverage for core terms | 0% | 10 terms |
| Version coherence | 4 different versions | 1 (v4.1) |

---

## User Personas

### Primary: The Craftsman (Agent User)

The developer using Claude Code with Sigil installed.

**Pain Points (v4.0):**
- Must manually pass `timeAuthority` to hooks (can get wrong)
- Zone readers don't connect to runtime behavior
- No lint errors for wrong physics in zone

**Desired State (v4.1):**
- `useSigilMutation` auto-resolves physics from zone
- ESLint catches `duration-200` in critical zone
- Wrong path is visible, not invisible

### Secondary: The Henlocker (Novice End User)

First-time user visiting high-stakes pages.

**Pain Point (v4.0):** Gets same machinery physics as power users because zone = path.

**Desired State (v4.1):** Zone physics adapt based on persona (warmer, more guidance).

### Secondary: The Chef (Power User)

Expert who lives in the product.

**Pain Point (v4.0):** Gets same novice physics in all zones.

**Desired State (v4.1):** Zone physics adapt based on persona (denser, snappier).

### Secondary: The Marketer

Non-engineer who owns campaigns and vibes.

**Pain Point (v4.0):** Can't test seasonal vibes without engineering PR.

**Desired State (v4.1):** Can toggle vibe flags in remote config (LaunchDarkly/Statsig).

---

## Functional Requirements

### FR-1: useSigilMutation Hook (P0)

**Problem:** Current `useCriticalAction` requires manual `timeAuthority` parameter. Developer can use `optimistic` in critical zone. Wrong path is invisible.

**Solution:** Create `useSigilMutation` that auto-resolves physics from zone context.

**Current (v4.0):**
```typescript
// Developer must know what to pass - can get wrong
const payment = useCriticalAction({
  mutation: () => api.pay(amount),
  timeAuthority: 'server-tick',  // Manual
});
```

**Target (v4.1):**
```typescript
// Physics auto-resolved from file path + persona context
const payment = useSigilMutation({
  mutation: () => api.pay(amount),
  // Zone determines: pessimistic + 800ms + disabled-while-pending
});

// Override requires explicit unsafe_ prefix
const payment = useSigilMutation({
  mutation: () => api.pay(amount),
  unsafe_override_physics: { duration: 200 },
  unsafe_override_reason: 'User research showed 800ms felt slow',
});
```

**Implementation:**
```typescript
function useSigilMutation<T>(config: SigilMutationConfig<T>) {
  const zone = useZoneFromFilePath();
  const persona = usePersonaContext();
  const physics = resolvePhysics(zone, persona);

  return {
    execute: async () => { /* mutation with physics */ },
    isPending,
    disabled: physics.sync === 'pessimistic' && isPending,
    style: { '--sigil-duration': `${physics.timing}ms` },
  };
}
```

**Acceptance Criteria:**
- [ ] Hook auto-resolves zone from file path
- [ ] Hook auto-resolves persona from context
- [ ] Physics determined by (zone × persona) matrix
- [ ] Override requires `unsafe_` prefix + reason
- [ ] TypeScript errors if physics mismatch zone

---

### FR-2: Persona-Aware Zone Physics (P0)

**Problem:** Path determines physics. Henlocker and Chef in same path get identical experience.

**Solution:** Zone provides defaults, persona provides overrides.

**Schema Update (.sigilrc.yaml):**
```yaml
zones:
  critical:
    default_physics:
      sync: pessimistic
      timing: 800
      motion: deliberate
    persona_overrides:
      newcomer:
        timing: 1200        # Slower, more reassuring
        show_help: always
        motion: reassuring
      power_user:
        timing: 500         # Faster for experts
        show_help: on_demand
        motion: snappy
```

**Resolution Algorithm:**
```
1. Detect zone from file path
2. Load zone.default_physics
3. Detect persona from context/props
4. If persona_overrides[persona] exists:
   - Merge overrides onto defaults
5. Return final physics
```

**Acceptance Criteria:**
- [ ] Zones support `persona_overrides` in schema
- [ ] `useSigilMutation` consumes persona overrides
- [ ] Agent can detect and apply persona context
- [ ] At least critical + marketing zones have overrides defined

---

### FR-3: ESLint Plugin with Enforcement (P0)

**Problem:** ESLint plugin folder exists but has no rules. Developers can write any CSS values.

**Solution:** Implement three core rules that enforce tokens.

**Rules:**

1. **`sigil/enforce-tokens`**
   ```javascript
   // ✗ Error: Magic number
   <div className="gap-[13px]">

   // ✓ OK: Token value
   <div className="gap-2">
   ```

2. **`sigil/zone-compliance`**
   ```javascript
   // In critical zone file:
   // ✗ Warning: duration-200 too fast for critical zone (min: 500ms)
   <motion.div animate={{ transition: { duration: 0.2 } }}>

   // ✓ OK
   <motion.div animate={{ transition: { duration: 0.8 } }}>
   ```

3. **`sigil/input-physics`**
   ```javascript
   // In machinery zone:
   // ✗ Warning: Missing keyboard navigation
   <div onClick={handleClick}>

   // ✓ OK
   <div onClick={handleClick} onKeyDown={handleKey} tabIndex={0}>
   ```

**Acceptance Criteria:**
- [ ] `eslint-plugin-sigil` npm package exists
- [ ] Three rules implemented with tests
- [ ] Rules read zone from file path
- [ ] Rules read physics constraints from .sigilrc.yaml
- [ ] Integration documented in CLAUDE.md

---

### FR-4: Vocabulary Layer (P1)

**Problem:** "Pot" and "Vault" share backend but need different feels. No language-to-physics mapping.

**Solution:** Add vocabulary.yaml that maps product terms to recommended physics.

**Schema:**
```yaml
# sigil-mark/vocabulary/vocabulary.yaml
version: "4.1.0"

terms:
  pot:
    engineering_name: savings_container
    user_facing: "Pot"
    mental_model: "Piggy bank, casual saving"
    recommended:
      material: glass
      motion: warm
      tone: friendly
    zones: [marketing, dashboard]

  vault:
    engineering_name: savings_container  # Same backend!
    user_facing: "Vault"
    mental_model: "Bank vault, security"
    recommended:
      material: machinery
      motion: deliberate
      tone: serious
    zones: [critical]

  claim:
    engineering_name: reward_claim
    user_facing: "Claim"
    mental_model: "Receiving earned reward"
    recommended:
      material: decisive
      motion: celebratory_then_deliberate
    zones: [critical, celebration]
```

**Agent Protocol:**
1. Agent identifies noun being rendered (e.g., "Pot")
2. Agent looks up term in vocabulary.yaml
3. Agent applies term's recommended material, adapting zone defaults
4. Gap detection surfaces undefined terms

**Acceptance Criteria:**
- [ ] vocabulary.yaml schema with JSON Schema validation
- [ ] At least 10 core terms defined
- [ ] `/craft` references vocabulary when generating
- [ ] Gap detection surfaces undefined terms
- [ ] `/refine --vocab` adds new terms

---

### FR-5: Remote Soul Configuration (P2)

**Problem:** Marketing can't test vibe changes without code commits.

**Solution:** Split soul into immutable kernel (engineering) and mutable vibe (marketing).

**Schema:**
```yaml
# sigil-mark/remote-soul.yaml
version: "4.1.0"

# Engineering controlled (immutable without PR)
kernel_locked:
  - physics            # Timing constraints
  - sync               # Server-tick rules
  - protected_zones    # Critical zone behavior

# Marketing controlled (remote config)
vibe_remote:
  - essence.seasonal_theme    # Summer Gold, Winter Silver
  - landing.hero_energy       # Playful vs Professional
  - onboarding.warmth         # How friendly vs direct
  - celebration.intensity     # How triumphant

integration:
  provider: launchdarkly  # or statsig, split
  fallback: local_yaml
  refresh: 5m
```

**Runtime Behavior:**
```typescript
function useEssence() {
  const local = readLocalEssence();
  const remote = useRemoteConfig('sigil.essence');

  // Remote overrides local for vibe keys only
  return {
    ...local,
    ...remote?.vibe,  // Only vibe keys from remote
  };
}
```

**Acceptance Criteria:**
- [ ] remote-soul.yaml schema defines boundary
- [ ] Clear separation: kernel local, vibe remote-capable
- [ ] Hook that merges local + remote
- [ ] Fallback to local when offline
- [ ] Marketing docs for flag setup

---

### FR-6: Physics Timing Mapping (P1)

**Problem:** `motion: deliberate` has no concrete ms value. Agent doesn't know what CSS to generate.

**Solution:** Map motion names to concrete timing values.

**Schema Update:**
```yaml
# sigil-mark/kernel/physics.yaml
motion:
  instant:
    duration: { value: 0, unit: ms }
    easing: linear
  snappy:
    duration: { value: 150, unit: ms }
    easing: ease-out
  warm:
    duration: { value: 300, unit: ms }
    easing: ease-in-out
  deliberate:
    duration: { min: 500, max: 1000, default: 800, unit: ms }
    easing: ease-out
    wait_for_confirm: true
  celebratory:
    duration: { value: 1200, unit: ms }
    easing: spring
    spring: { stiffness: 100, damping: 10 }
```

**Agent Protocol:**
```
When generating motion:
1. Resolve motion name from zone
2. Look up concrete timing in physics.yaml
3. Generate CSS: transition: all ${physics.duration.default}ms ${physics.easing}
```

**Acceptance Criteria:**
- [ ] All motion names have concrete ms values
- [ ] ESLint rule can validate timing against motion
- [ ] Agent generates correct CSS from motion name
- [ ] CLAUDE.md documents motion → timing mapping

---

### FR-7: Version Coherence (P0)

**Problem:** Codebase claims v2.0, v3.0, v4.0 in different files.

**Solution:** Single source of truth in `.sigil-version.json`, all files reference it.

**Changes:**
- [ ] Update `.sigilrc.yaml` version to `4.1.0`
- [ ] Update all hook files to remove version comments
- [ ] Update process files to v4.1
- [ ] Add version check to ESLint plugin
- [ ] `sigil version` CLI command

**Acceptance Criteria:**
- [ ] `grep -r "v2\|v3\|3\.0\|2\.0" .` returns 0 results (excluding changelogs)
- [ ] Single version source: `.sigil-version.json`
- [ ] CI check for version consistency

---

### FR-8: Delete Deprecated Code (P1)

**Problem:** `process-context.tsx` marked deprecated but ships working React hooks.

**Solution:** Agent-only means no runtime exports. Delete or make clearly runtime.

**Decision:** Delete runtime exports. Process is agent-only.

**Changes:**
- [ ] Remove `ProcessContextProvider` export
- [ ] Remove `useProcessContext` export
- [ ] Remove `useConstitution` export
- [ ] Remove `useDecisions` export
- [ ] Keep readers as agent-only (no 'use client')
- [ ] Add clear comment: "// AGENT-ONLY: Do not import in browser code"

**Acceptance Criteria:**
- [ ] No React hooks exported from process/
- [ ] No 'use client' in process files
- [ ] Attempting to import in browser = build error
- [ ] CLAUDE.md clearly states agent-only

---

### FR-9: /observe Skill Implementation (P1)

**Problem:** CLAUDE.md lists `/observe` but no `observing-*` skill exists.

**Solution:** Create `observing-feedback` skill.

**Location:** `.claude/skills/observing-feedback/`

**Workflow:**
1. Capture screenshot via MCP (Claude in Chrome)
2. Load rules.md constraints
3. Analyze screenshot against rules
4. Generate feedback questions
5. Store in `.sigil-observations/feedback/`

**Acceptance Criteria:**
- [ ] `observing-feedback/SKILL.md` exists
- [ ] Skill uses MCP for screenshot
- [ ] Skill references rules.md
- [ ] Output stored in feedback directory
- [ ] Links to `/refine` for updates

---

## Non-Functional Requirements

### NFR-1: No Runtime Dependencies on Process Layer

Process layer readers must not be bundleable for browser. Build must fail if imported in client code.

### NFR-2: Enforcement Surfaces in Dev Experience

- ESLint errors show in IDE
- Type errors show in IDE
- Console warnings at runtime for violations
- `/garden --validate` for CI

### NFR-3: Remote Config Latency

Vibe flags must resolve within 100ms. Use cached values if remote unavailable.

### NFR-4: Backward Compatibility

v4.0 code should work with deprecation warnings:
- `useCriticalAction` → warning to use `useSigilMutation`
- Old zone schema → warning to add `persona_overrides`

---

## Out of Scope (v4.1)

| Feature | Reason | Future Version |
|---------|--------|----------------|
| Type markers (Gold/Silver/Draft) | Complex TypeScript | v4.2 |
| Friction budget tracking | Requires metrics | v4.2 |
| PR-time taste debt | Requires CI integration | v4.2 |
| Visual editor for vocabulary | Nice-to-have | v5.0 |
| Real-time collaboration | Infrastructure | v5.0 |

---

## Architecture

### v4.0 Architecture (Hollow Shell)
```
Readers (zone, persona, vocab)
         ↓
         ??? (nothing consumes)
         ↓
useCriticalAction (manual params, no enforcement)
```

### v4.1 Architecture (Living Guardrails)
```
Readers (zone, persona, vocab)
         ↓
    ┌────┴────┐
    ↓         ↓
ESLint    useSigilMutation
(compile)  (runtime)
    ↓         ↓
Errors    Auto-physics
in IDE    + CSS vars
```

---

## Migration Guide

### From v4.0 to v4.1

1. **Update .sigilrc.yaml:**
   - Add `persona_overrides` to zones
   - Add concrete timing to motion names

2. **Replace hooks:**
   ```typescript
   // Before
   useCriticalAction({ timeAuthority: 'server-tick' })

   // After
   useSigilMutation() // Auto-resolved
   ```

3. **Add ESLint config:**
   ```javascript
   // eslint.config.js
   import sigil from 'eslint-plugin-sigil';

   export default [
     sigil.configs.recommended,
   ];
   ```

4. **Add vocabulary.yaml:**
   - Define 10 core product terms
   - Map to recommended physics

5. **Remove deprecated imports:**
   - Delete any imports from `sigil-mark/process`

---

## Success Metrics

| Metric | v4.0 | v4.1 Target |
|--------|------|-------------|
| ESLint violations caught | 0 | >90% of magic numbers |
| Manual physics params | Required | Auto-resolved |
| Persona-aware zones | 0 | All zones |
| Vocabulary terms | 0 | 10 |
| Version strings | 4 different | 1 |
| Runtime process imports | Possible | Build error |

---

## Timeline

| Phase | Sprints | Deliverables |
|-------|---------|--------------|
| P0 Foundation | 2 | useSigilMutation, ESLint rules, version coherence |
| P1 Context | 2 | Persona overrides, vocabulary, physics timing |
| P2 Marketing | 1 | Remote soul, /observe skill |
| Polish | 1 | Migration guide, deprecated code removal |

---

## Review Traceability

This PRD addresses findings from:

**SIGIL-V4-LITE-REVIEW.md (Technical, Grade C-):**
- Issue 1 (Version Schizophrenia) → FR-7
- Issue 2 (Layout Primitives) → Out of scope, tracked for v4.2
- Issue 3 (No Transaction Objects) → FR-1
- Issue 4 (No Token Enforcement) → FR-3
- Issue 5 (Hollow Shell) → FR-1, FR-3
- Issue 6 (Process Layer Confusion) → FR-8
- Issue 7 (Physics Without Timing) → FR-6
- Issue 11 (Commands vs Skills) → FR-9

**V4-REVIEW-2.md (Product, Grade A-/C):**
- Issue 1 (Path is Destiny) → FR-2
- Issue 2 (Hardcoded Soul) → FR-5
- Issue 3 (Democracy ≠ Research) → Out of scope (metrics)
- Issue 4 (Physics Without Language) → FR-4

---

*Sources: loa-grimoire/context/SIGIL-V4-LITE-REVIEW.md, loa-grimoire/context/V4-REVIEW-2.md*
