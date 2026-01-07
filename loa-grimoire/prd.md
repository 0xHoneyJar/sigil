# Sigil v3.0 PRD — "Living Engine"

**Version:** 3.0.0
**Codename:** Living Engine
**Status:** Draft
**Date:** 2026-01-06

> *"Sweat the art. We handle the mechanics. Return to flow."*

---

## Executive Summary

Sigil v3.0 evolves from a "Physics Engine for a closed system" to a "Product Engine for a living market." This release addresses fatal runtime bugs, naming confusion, and fundamental product strategy gaps identified in the v2.6 review.

**Core Insight:** Users are fluid, markets are living, and soul must resonate — not just enforce.

### Key Changes

| Area | v2.6 (Current) | v3.0 (Target) |
|------|----------------|---------------|
| Process Layer | Runtime (crashes in browser) | Agent-only (generation time) |
| Personas | Called "Lenses" (confusing) | Renamed, distinct from UI Lenses |
| Zone Detection | Path-based claims, layout-based code | Layout-based only |
| User Experience | One persona per zone | Persona fluidity per zone |
| Vocabulary | None | Rosetta Stone (term → feel mapping) |
| Philosophy | Implicit | Explicit Intent Layer |
| Vibe Testing | Git commits only | Remote config for marketing |

---

## Problem Statement

### What We Built (v2.6)
A sophisticated design physics engine with clean Core/Layout/Lens separation, Constitution-based governance, and time-locked decisions.

### What's Broken

1. **Fatal Runtime Bug:** Process layer uses Node.js `fs` but is marked `'use client'` — crashes in browser
2. **Naming Collision:** "Lens" means both UI components AND user personas
3. **Philosophy Drift:** Skills contradict agreed principles
4. **Static World Model:** Same zone = same experience, regardless of user type
5. **No Vocabulary:** "Pot" and "Vault" have same physics but need different feels
6. **Locked Soul:** Marketing can't test vibes without engineering PRs

### Success Criteria

| Metric | Target |
|--------|--------|
| Runtime crashes from Process layer | 0 |
| Naming collisions in documentation | 0 |
| Skill files matching philosophy | 100% |
| Vocabulary coverage for core terms | 100% |
| Agent can generate correct code | Yes |

---

## User Personas

### Primary: The Craftsman (Agent User)

The developer using Claude Code with Sigil installed. They want to:
- Generate UI that feels right without manual design decisions
- Get clear guidance on zones, materials, and motions
- Focus on product logic, not design system mechanics

**Pain Points (v2.6):**
- Agent tries to use missing components (InspectorOverlay, VibeSurvey)
- Confusing "Lens" terminology
- Skills say "decide fast" but philosophy says "sweat the art"

### Secondary: The Newcomer (End User - Henlocker)

A novice user visiting high-stakes pages. They need:
- Reassurance and warmth
- Guidance through complex flows
- Clear error messages and recovery paths

**Pain Point (v2.6):** Gets same "power user" experience as experts because zone = path.

### Secondary: The Power User (End User - Chef)

An expert user who lives in the product. They need:
- Density and speed
- Keyboard shortcuts
- Minimal hand-holding

**Pain Point (v2.6):** Gets same "newcomer" experience as novices in marketing zones.

---

## Functional Requirements

### FR-1: Agent-Only Process Layer (P0)

**Problem:** Process readers use `fs` module but ProcessContextProvider is `'use client'`.

**Solution:** Process layer becomes agent-context-only. The agent reads YAML during code generation. Runtime never touches these files.

**Changes:**
- Remove `ProcessContextProvider` from exports
- Remove `'use client'` directive from process files
- Add agent protocol to CLAUDE.md for Process context loading
- Document clearly: "Process = Generation Time, Core = Runtime"

**Acceptance Criteria:**
- [ ] No `fs` imports in any file that could be bundled for browser
- [ ] CLAUDE.md clearly states Process is agent-only
- [ ] Agent can load Constitution, Personas, Decisions during generation
- [ ] No runtime errors when using Sigil in Next.js app

---

### FR-2: Vocabulary Layer — The Rosetta Stone (P1)

**Problem:** Same physics can apply to different concepts that need different feels.

**Solution:** Add vocabulary.yaml that maps product terms to recommended materials and motions.

**Schema:**
```yaml
# sigil-mark/vocabulary.yaml
version: "3.0.0"

terms:
  pot:
    engineering_name: "savings_container"
    user_facing: "Pot"
    mental_model: "Piggy bank, casual saving"
    recommended:
      material: glass
      motion: warm
      tone: friendly
    zones: [marketing, dashboard]

  vault:
    engineering_name: "savings_container"  # Same backend!
    user_facing: "Vault"
    mental_model: "Bank vault, security"
    recommended:
      material: machinery
      motion: deliberate
      tone: serious
    zones: [critical]

  claim:
    engineering_name: "reward_claim"
    user_facing: "Claim"
    mental_model: "Receiving earned reward"
    recommended:
      material: decisive
      motion: celebratory_then_deliberate
      tone: exciting
    zones: [critical]
```

**Agent Protocol:**
1. Agent identifies the noun being rendered (e.g., "Pot")
2. Agent looks up term in vocabulary.yaml
3. Agent applies term's recommended material/motion, not just zone's default
4. Zone physics still apply, but material adapts to noun

**Acceptance Criteria:**
- [ ] vocabulary.yaml schema defined with JSON Schema validation
- [ ] Agent protocol documented in CLAUDE.md
- [ ] README mentions vocabulary as API surface
- [ ] At least 10 core terms defined for initial vocabulary

---

### FR-3: Persona Rename (P1)

**Problem:** "Lens" means both UI components and user personas.

**Solution:** Rename `lens-array/` to `personas/` throughout codebase.

**Changes:**
| Old | New |
|-----|-----|
| `sigil-mark/lens-array/` | `sigil-mark/personas/` |
| `sigil-mark/lens-array/lenses.yaml` | `sigil-mark/personas/personas.yaml` |
| `LensArray` type | `PersonaArray` type |
| `readLensArray()` | `readPersonaArray()` |
| `getPersona()` (from lens-array) | `getPersona()` (from personas) |

**Keep "Lens" for:**
- `sigil-mark/lenses/` — UI rendering components (DefaultLens, StrictLens, A11yLens)
- `useLens()` hook — Returns UI Lens based on zone + preference
- `LensProvider` — Context for user lens preference

**Acceptance Criteria:**
- [ ] No file or type uses "Lens" to mean persona
- [ ] Documentation consistently uses "Persona" for user archetypes
- [ ] Documentation consistently uses "Lens" for UI rendering variants

---

### FR-4: Persona Fluidity (P2)

**Problem:** Zone determines experience. Novice and expert in same zone get same treatment.

**Solution:** Persona overrides per zone. Zone provides default, but persona can customize.

**Schema:**
```yaml
# .sigilrc.yaml
zones:
  critical:
    layout: CriticalZone
    default_persona: power_user
    persona_overrides:
      newcomer:
        lens: guided          # Softer UI
        motion: reassuring    # Slower, more explanatory
        show_help: always
      power_user:
        lens: strict
        motion: snappy
        show_help: on_demand
```

**Runtime Behavior:**
1. User's persona is determined (from preferences, onboarding, or detection)
2. Zone provides base configuration
3. Persona override (if present) modifies zone behavior
4. Final config = Zone defaults + Persona overrides

**Acceptance Criteria:**
- [ ] persona_overrides schema defined in .sigilrc.yaml
- [ ] Agent can read persona overrides and apply them
- [ ] Documentation shows persona fluidity example
- [ ] At least critical + marketing zones have persona overrides defined

---

### FR-5: Philosophy Alignment (P0)

**Problem:** Skills say "Decide fast. Lock it. Move on." Philosophy says "Sweat the art."

**Solution:** Rewrite all skill files to match agreed philosophy.

**Philosophy Principles:**
1. **Craftsman SHOULD think deeply** — Deliberation is valuable
2. **Agent handles mechanics** — Not taste decisions
3. **/consult locks AFTER deliberation** — Not to shortcut thinking
4. **Return to flow** — Remove friction, not judgment

**Skill Rewrites:**
| Skill | Current Problem | Fix |
|-------|-----------------|-----|
| consulting-decisions | "Decide fast" | "Record your deliberated decision" |
| crafting-guidance | "Just pick one" | "Here are the tradeoffs to consider" |
| gardening-entropy | "Fix this pattern" | "This pattern may need attention" |

**Acceptance Criteria:**
- [ ] All skill files reviewed for philosophy alignment
- [ ] No skill encourages rushing decisions
- [ ] Skills present options with tradeoffs, not mandates
- [ ] CLAUDE.md philosophy section is explicit and cited in skills

---

### FR-6: Intent Layer (P2)

**Problem:** Constitution governs what's protected, but no explicit "why."

**Solution:** Add philosophy.yaml that documents intent hierarchy.

**Schema:**
```yaml
# sigil-mark/soul-binder/philosophy.yaml
version: "3.0.0"

intent:
  primary: "Protect user trust in high-stakes moments"
  secondary: "Enable power user efficiency without sacrificing newcomer safety"

principles:
  - id: trust_over_speed
    when: "Trust conflicts with speed"
    decision: "Trust wins"
    rationale: "Speed can be recovered. Trust cannot."

  - id: newcomer_safety
    when: "Newcomer needs conflict with power user preferences"
    decision: "Newcomer safety first"
    rationale: "Power users can customize. Newcomers can't recover from mistakes."

  - id: security_over_marketing
    when: "Marketing wants to modify protected capabilities"
    decision: "Security wins"
    rationale: "Constitution exists for a reason."

conflict_resolution:
  - trust_vs_speed: trust_wins
  - newcomer_vs_power_user: newcomer_safety_first
  - marketing_vs_security: security_wins
```

**Agent Protocol:**
When generating UI, agent checks philosophy for:
1. Does this decision involve conflicting concerns?
2. What does the intent hierarchy say?
3. Apply the winning principle

**Acceptance Criteria:**
- [ ] philosophy.yaml schema defined
- [ ] At least 5 principles documented
- [ ] Agent protocol for conflict resolution documented
- [ ] CLAUDE.md references philosophy for decision-making

---

### FR-7: Layout-Only Zone Detection (P1)

**Problem:** Documentation claims path-based zones, code uses layout-based zones.

**Solution:** Remove all path-based zone claims. Zones are declared via Layout components.

**Changes:**
- Remove `component_paths` from .sigilrc.yaml (deprecated)
- Remove path-based examples from CLAUDE.md
- Update zone detection documentation to layout-only
- Remove `get-zone.sh` references (never implemented)

**Zone Declaration:**
```tsx
// Zones are declared by wrapping in Layout components
<CriticalZone financial>
  {/* This is now in critical zone */}
</CriticalZone>

<MachineryLayout>
  {/* This is now in admin zone */}
</MachineryLayout>

<GlassLayout>
  {/* This is now in marketing zone */}
</GlassLayout>
```

**Acceptance Criteria:**
- [ ] No documentation mentions path-based zone detection
- [ ] .sigilrc.yaml zones section only configures layout behavior
- [ ] Agent instructions use layout-based zone examples only

---

### FR-8: Remote Soul Configuration (P3)

**Problem:** Marketing can't test vibe changes without code commits.

**Solution:** Support remote config for marketing-controlled aspects, while engineering controls Constitution.

**Schema:**
```yaml
# sigil-mark/remote-config.yaml
version: "3.0.0"

marketing_controlled:
  - campaigns.seasonal_vibe     # Summer gold, winter silver
  - landing.hero_energy         # Playful vs professional
  - onboarding.warmth_level     # How friendly vs direct

engineering_controlled:
  - constitution                # Protected capabilities
  - protected_capabilities      # Never remote
  - physics                     # Core timing unchanged

integration:
  provider: "launchdarkly"  # or statsig, split, etc.
  fallback: "local_yaml"    # When offline
```

**Constraint:** Physics (Core) stays immutable. Vibe (Material tones, copy warmth) can be remote.

**Acceptance Criteria:**
- [ ] remote-config.yaml schema defined
- [ ] Clear separation: physics local, vibe remote-capable
- [ ] Agent knows which aspects can be dynamic
- [ ] Fallback to local YAML when offline

---

### FR-9: Observer Pattern for Vibe Checks (P3)

**Problem:** Polling favors existing users, misses potential users.

**Solution:** Add behavioral triggers to vibe checks, not just explicit surveys.

**Schema:**
```yaml
# sigil-mark/surveys/vibe-checks.yaml
version: "3.0.0"

# Existing: Explicit surveys (keep)
explicit_checks:
  - id: claim_flow_satisfaction
    trigger: after_claim_success
    type: micro_survey

# New: Behavioral observations
behavioral_signals:
  - id: information_seeking
    trigger: "card_expanded_5x_in_session"
    insight: "User seeking information not immediately visible"
    recommendation: "Consider surfacing key data earlier"

  - id: confirmation_friction
    trigger: "abandon_at_confirmation_step"
    insight: "Confirmation may be too heavy"
    recommendation: "Review deliberate motion timing"

  - id: rage_clicking
    trigger: "same_element_clicked_3x_in_2s"
    insight: "Element not responding as expected"
    recommendation: "Check loading states and feedback"
```

**Agent Protocol:**
Agent can reference behavioral signals when making recommendations:
- "Based on `information_seeking` signal, consider surfacing X"
- "Based on `confirmation_friction` signal, review timing"

**Acceptance Criteria:**
- [ ] behavioral_signals schema added to vibe-checks.yaml
- [ ] At least 5 behavioral signals defined
- [ ] Agent can cite behavioral signals in recommendations
- [ ] /garden report includes behavioral signal analysis

---

## Non-Functional Requirements

### NFR-1: No Runtime Dependencies on Process Layer

The Process layer (YAML readers) must not be bundled for browser. All Process access happens at agent generation time or build time.

### NFR-2: Documentation Consistency

Every concept must have exactly one name:
- "Persona" = user archetype (power_user, newcomer)
- "Lens" = UI rendering variant (DefaultLens, StrictLens)
- "Zone" = Layout-declared context (CriticalZone, MachineryLayout)
- "Material" = deprecated v1 concept, use Zone

### NFR-3: Vocabulary as API Surface

The vocabulary.yaml is the primary interface between product and engineering:
- Product defines terms and mental models
- Engineering implements with appropriate materials
- README prominently features vocabulary concept

### NFR-4: Backward Compatibility

v2.6 code should work in v3.0 with deprecation warnings:
- Old imports work but warn
- Old file locations work but warn
- Migration guide provided

---

## Out of Scope (v3.0)

| Feature | Reason | Future Version |
|---------|--------|----------------|
| ESLint plugin enforcement | Requires build tooling | v3.1 |
| CI/CD integration | Requires pipeline work | v3.1 |
| Real-time collaboration | Complex infrastructure | v4.0 |
| Visual editor for vocabulary | Nice-to-have | v4.0 |
| A/B testing integration | Requires analytics | v3.2 |

---

## Architecture Changes

### v2.6 Architecture
```
Process (YAML) ──runtime──> ProcessContext (React) ──> Core ──> Layout ──> Lens
       ↑
       └── fs module (CRASHES IN BROWSER)
```

### v3.0 Architecture
```
Process (YAML) ──agent reads──> CLAUDE.md context ──> Agent generates code
                                                              ↓
                                              Core ──> Layout ──> Lens (runtime)
```

**Key Change:** Process layer is agent-context-only. No runtime YAML reading.

---

## Migration Guide

### From v2.6 to v3.0

1. **Remove ProcessContextProvider** — No longer exported
2. **Rename imports:**
   - `readLensArray` → `readPersonaArray`
   - `lens-array/` → `personas/`
3. **Update .sigilrc.yaml:**
   - Remove `component_paths`
   - Add `persona_overrides` to zones
4. **Add vocabulary.yaml** — Define your product terms
5. **Add philosophy.yaml** — Document your intent hierarchy

---

## Success Metrics

| Metric | v2.6 Baseline | v3.0 Target |
|--------|---------------|-------------|
| Runtime errors from Process | Crashes | 0 |
| Naming confusion reports | High | 0 |
| Agent code generation accuracy | ~70% | 95% |
| Time to add new product term | N/A | <5 min |
| Philosophy alignment in skills | 0% | 100% |

---

## Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| P0 Fixes | 1 sprint | fs removal, philosophy alignment |
| P1 Fixes | 1 sprint | Persona rename, layout-only zones, vocabulary |
| P2 Features | 1 sprint | Persona fluidity, intent layer |
| P3 Features | 1 sprint | Remote config, observer pattern |
| Documentation | Continuous | README, CLAUDE.md, migration guide |

---

## Appendix A: Vocabulary Layer README Section

```markdown
## Vocabulary — The API Surface

Sigil's vocabulary layer maps product terms to design recommendations.

### Why Vocabulary Matters

A "Pot" and a "Vault" might share the same backend (`savings_container`),
but they evoke completely different mental models:

| Term | Mental Model | Recommended Feel |
|------|--------------|------------------|
| Pot | Piggy bank | Warm, glass, friendly |
| Vault | Bank vault | Cold, machinery, secure |

### Defining Terms

```yaml
# sigil-mark/vocabulary.yaml
terms:
  pot:
    user_facing: "Pot"
    mental_model: "Piggy bank, casual saving"
    recommended:
      material: glass
      motion: warm
```

### Agent Protocol

When generating UI for a "Pot," the agent will:
1. Check vocabulary.yaml for "pot"
2. Apply recommended material (glass) and motion (warm)
3. Zone physics still apply, but material adapts to the noun

This ensures consistent UX across the product without manual specification.
```

---

## Appendix B: Philosophy Section for CLAUDE.md

```markdown
## Philosophy

> "Sweat the art. We handle the mechanics. Return to flow."

### What This Means

1. **Sweat the art** — Craftsman deliberation is valuable. Don't rush decisions.
2. **We handle the mechanics** — Agent manages physics, zones, materials.
3. **Return to flow** — Once decided, lock it and move on.

### Decision Hierarchy

When concerns conflict, apply this hierarchy:

| Conflict | Winner | Rationale |
|----------|--------|-----------|
| Trust vs Speed | Trust | Speed can be recovered. Trust cannot. |
| Newcomer vs Power User | Newcomer safety | Power users can customize. |
| Marketing vs Security | Security | Constitution exists for a reason. |

### Agent Role

The agent:
- Presents options with tradeoffs
- Does NOT make taste decisions
- Respects locked decisions
- Cites philosophy when relevant
```

---

*Sources: loa-grimoire/context/SIGIL-v2.6-REVIEW.md, v2.6 implementation*
