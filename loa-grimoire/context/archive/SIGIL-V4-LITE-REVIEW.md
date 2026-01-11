# Sigil v4-lite Implementation Review

**Reviewer:** Staff Design Engineer (15+ years)
**Date:** 2026-01-07
**Verdict:** 🔴 **Not Production Ready** — Significant architectural drift from v4.9 spec

---

## Executive Summary

The implementation attempts to bridge v3.0 "Living Engine" concepts with v4.0 "Sharp Tools" commands, but fails to implement the core v4.9 "Invisible Guardrail" innovations. The result is a **hollow shell**: rich schemas without enforcement, readers without runtime binding, and zones without physics integration.

**Critical Finding:** This implementation will not achieve the stated goal of "Make the right path easy. Make the wrong path visible." because the wrong path is currently invisible — there's no enforcement layer.

---

## 🔴 Critical Issues

### 1. Version Schizophrenia

The codebase can't decide what version it is:

| File | Claims |
|------|--------|
| `CLAUDE.md` | v4.0 "Sharp Tools" |
| `.sigilrc.yaml` | v3.0.0 "Living Engine" |
| `process-context.tsx` | v3.0 (DEPRECATED) |
| `zone-reader.ts` | v4.0 |
| `useCriticalAction.ts` | v2.0 |
| `persona-reader.ts` | v4.0 |

**Impact:** Agents reading this will be confused. Which version's concepts apply? The CLAUDE.md says one thing, the code does another.

**Fix:** Pick one version and make everything consistent.

---

### 2. Layout Primitives Still Present (v4.9 Removed These)

`.sigilrc.yaml` still defines:
```yaml
zones:
  critical:
    layout: CriticalZone
  admin:
    layout: MachineryLayout
  marketing:
    layout: GlassLayout
```

**v4.9 explicitly removed layout primitives** in favor of token enforcement. The rationale:

> "Replacing `<div>` with `<CriticalZone>` creates cognitive load. Agents trained on HTML/CSS, not custom components."

**Impact:** You're asking agents to learn a proprietary DSL when they could write standard HTML with token classes. This is the opposite of "invisible guardrail."

**Fix:** Remove layout-based zones. Enforce via ESLint tokens on standard HTML.

---

### 3. No Transaction Objects (Core v4.9 Innovation Missing)

The implementation has `useCriticalAction` which takes `timeAuthority` as a **manual parameter**:

```typescript
// Current: Developer must know what to pass
const payment = useCriticalAction({
  mutation: () => api.pay(amount),
  timeAuthority: 'server-tick',  // Manual - developer can get this wrong
});
```

v4.9's `useSigilMutation` **binds physics to zone automatically**:

```typescript
// v4.9: Physics determined by zone
const payment = useSigilMutation({
  mutation: () => api.pay(amount),
  physics: 'critical',  // Zone determines: pessimistic + 800ms + disabled
});
```

**Impact:** The developer must manually match time authority to zone context. Nothing prevents using `optimistic` in a critical zone. The "wrong path" is not visible.

**Fix:** Create hook that resolves physics from zone context automatically.

---

### 4. No Token Enforcement

The `eslint-plugin` folder exists but appears to be a shell. Where are the rules that enforce:

- No magic numbers (`gap-[13px]` → error)
- Zone-appropriate timing (`duration-200` in critical zone → warning)
- Input physics (`onClick` without `onKeyDown` in machinery zone → warning)

**Impact:** Developers can write any CSS values. The system has rules.md but no enforcement. This is "documentation that rots."

**Fix:** Implement `eslint-plugin-sigil` with:
- `enforce-tokens`
- `zone-compliance`
- `input-physics`

---

### 5. Hollow Shell Problem

The implementation has elaborate readers:
- `zone-reader.ts` (450 lines)
- `persona-reader.ts` (850 lines)
- `vocabulary-reader.ts`
- `decision-reader.ts`

But **no enforcement mechanism** that uses these readers at compile time or PR time.

**What's Missing:**
```
zone-reader.ts reads zones
         ↓
         ??? (nothing connects here)
         ↓
useCriticalAction doesn't know the zone
```

**Impact:** You have a library of readers that nothing uses to enforce behavior.

---

### 6. Process Layer Confusion

`process-context.tsx` is marked `@deprecated` but contains 350+ lines of implementation including:
- `ProcessContextProvider` 
- `useProcessContext`
- `useConstitution`
- `useDecisions`

The skill says: "Process layer is agent-only. Do NOT generate code that imports from `sigil-mark/process`."

**But the code exists and exports React hooks.** Developers will find and use them.

**Impact:** Mixed signals. Is this agent-only or runtime? The code says both.

**Fix:** Either:
1. Delete the runtime code entirely (agent-only)
2. Remove the deprecation and make it a proper runtime (runtime)

Don't ship deprecated code that still works.

---

### 7. Physics Without Timing

Zones define `motion: deliberate` but there's no mapping to actual CSS timing:

```yaml
critical:
  motion: deliberate  # What does this mean in ms?
```

v4.9 specifies:
```yaml
critical:
  physics:
    duration: { min: 500, max: 1000 }  # Concrete values
```

**Impact:** An agent seeing `motion: deliberate` doesn't know to use `duration-500`. The connection is missing.

---

### 8. Input Physics Not Enforced

`persona-reader.ts` defines physics:
```typescript
export interface PersonaPhysics {
  input_method: InputMethod;
  tap_targets?: TapTargets;
  shortcuts?: ShortcutConfig;
}
```

But there's **no enforcement** that machinery zones require keyboard navigation.

**v4.9 requires:**
```typescript
// Machinery zone without keyboard = lint error
<div onClick={handleClick}>  // ✗ Missing tabIndex, onKeyDown
```

---

### 9. Graduation System Missing

v4.9 has:
```typescript
GoldComponent<T>    // Verified
SilverComponent<T>  // Probationary
Draft<T>            // Exploration
```

This implementation has none of these type markers. There's no way to:
- Mark components as stable/probationary
- Block `Draft<T>` from merging
- Track graduation over time

---

### 10. No Friction Budget

v4.9 tracks overrides:
```typescript
useSigilMutation({
  physics: 'critical',
  unsafe_override_physics: { duration: 200 },
  unsafe_override_reason: 'User research showed 800ms felt slow',
});
```

This implementation has no override tracking, no friction log, no mutiny protocol.

---

## 🟡 Medium Issues

### 11. Commands Don't Match Skills

CLAUDE.md lists 7 commands:
```
/envision, /codify, /craft, /observe, /refine, /consult, /garden
```

Skills folder has 8:
```
initializing-sigil, envisioning-moodboard, codifying-rules,
crafting-guidance, refining-context, consulting-decisions,
gardening-entropy, exporting-config
```

Where's `/observe`? There's no `observing-*` skill.

### 12. Schema Files Without Validators

Multiple `schemas/` folders with JSON Schema files:
- `personas.schema.json`
- `evidence.schema.json`
- `feedback.schema.json`

But no code that actually validates against these schemas. They're documentation, not enforcement.

### 13. Evidence System Orphaned

Elaborate evidence system:
```yaml
evidence:
  - id: EV-2026-001
    summary: "Mixpanel data shows 80% completion"
```

But:
- No CLI to add evidence
- No integration with `/craft` output
- No validation that evidence IDs exist

---

## 🟢 What Works

### 14. Skill Structure Is Clean

The 3-level skill structure is good:
```
.claude/skills/{skill-name}/
├── index.yaml
└── SKILL.md
```

### 15. Progressive Disclosure Pattern

L1/L2/L3 grip levels are well-designed:
```
/craft "button"                           # L1
/craft "button" --zone critical           # L2
/craft "button" --zone critical --no-gaps # L3
```

### 16. Gap Detection Concept

The idea of surfacing missing context at end of `/craft` is good:
```
⚠️ UNDEFINED PERSONA: "whale"
→ /refine --persona whale "high-value depositor"
```

### 17. Decision Locking

`/consult` with time-locked decisions is sound:
```yaml
locked_at: "2026-01-07T14:30:00Z"
expires_at: "2026-02-06T14:30:00Z"
status: locked
```

---

## Architecture Gap Analysis

### What v4.9 Specifies vs What's Implemented

| v4.9 Pillar | Specified | Implemented | Gap |
|-------------|-----------|-------------|-----|
| Token Enforcement | ESLint on HTML/CSS | ❌ | No ESLint rules |
| Transaction Objects | `useSigilMutation` binds sync+visual+input | ⚠️ Partial | `useCriticalAction` only does sync |
| Draft<T> Escape | Type marker + CI block | ❌ | No type markers |
| Async Friction | Taste Debt at PR | ❌ | No PR integration |
| Atomic Graduation | Gold/Silver in primitives | ❌ | No graduation system |
| Input Physics | Keyboard enforcement | ❌ | No input validation |

---

## Recommended Path Forward

### Option A: Align to v4.9 (Recommended)

1. **Delete layout primitives** — Remove `CriticalZone`, `MachineryLayout`, `GlassLayout`
2. **Implement `useSigilMutation`** — Replace `useCriticalAction` with zone-aware hook
3. **Build ESLint plugin** — Token enforcement, zone compliance, input physics
4. **Add type markers** — `GoldComponent<T>`, `SilverComponent<T>`, `Draft<T>`
5. **Add Gardener workflow** — Taste debt calculation at PR time
6. **Delete deprecated code** — Remove process-context.tsx runtime

### Option B: Ship v3.0 + Skills

If v4.9 alignment is too much:

1. **Rename to v3.1** — Acknowledge this is v3.0 with skill additions
2. **Remove v4.0 claims** — Update CLAUDE.md to reflect actual version
3. **Document limitations** — Be clear there's no enforcement layer
4. **Ship as "context framework"** — Not "guardrail framework"

---

## The Core Question

The PRD says:
> "Make the right path easy. Make the wrong path visible. Don't make the wrong path impossible."

**Current implementation:**
- Right path: Somewhat defined (zones, personas, decisions)
- Wrong path: **Completely invisible** (no enforcement)
- Impossible path: **Nothing is prevented**

This is a **context documentation system**, not a **guardrail system**.

If the goal is documentation, this works. If the goal is enforcement, this needs significant work.

---

## Final Verdict

| Aspect | Grade | Notes |
|--------|-------|-------|
| Concept | A | Sound ideas, good progressive disclosure |
| Coherence | D | Version confusion, deprecated code ships |
| Enforcement | F | None exists |
| Agent Usability | B | Skills are clear, commands reasonable |
| Runtime | D | Hollow shell, readers without consumers |
| Type Safety | F | No type markers, no compile-time checks |

**Overall: C-** — Good documentation, no teeth.

---

## One Thing to Fix First

If I could only fix one thing:

**Implement `useSigilMutation` that auto-resolves physics from file path.**

```typescript
// The missing piece that connects everything
function useSigilMutation(config) {
  const zone = resolveZoneFromPath(getCurrentFilePath());
  const physics = ZONE_TO_PHYSICS[zone.id];
  
  return {
    ...mutation logic,
    disabled: physics.sync === 'pessimistic' && isPending,
    style: { '--duration': `${physics.timing}ms` },
  };
}
```

This single hook would:
1. Connect zone readers to runtime behavior
2. Enforce sync strategy automatically
3. Provide CSS variables for timing
4. Make wrong physics visible (type errors)

Without this hook, the zones are just documentation.
