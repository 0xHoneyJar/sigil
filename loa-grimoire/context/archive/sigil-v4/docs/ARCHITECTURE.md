# Sigil v4: Architectural Overview

**Version**: 4.0
**Status**: Implementation Ready
**Date**: 2026-01-05

---

## Executive Summary

Sigil is a Design Physics Engine that gives AI agents the constraints they need to make consistent design decisions. Unlike traditional design systems that document patterns, Sigil enforces physics—immutable laws that cannot be violated.

### The Evolution

| Version | Metaphor | Problem |
|---------|----------|---------|
| Canon | Philosophy Department | Debate without resolution |
| Codex | Legal System | Precedent blocks innovation |
| Resonance | Physics Engine | ✓ Laws of nature, not laws of man |
| **Platform v4** | **Physics + Economy** | ✓ Adds budgets, temporal governor, lens |

---

## 1. Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TASTE KEY                                    │
│                                                                     │
│  Single holder with absolute authority over visual execution.       │
│  Polls concepts. Dictates craft. Cannot be overridden by vote.      │
└─────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────────┐
│                         MEMORY                                       │
│                                                                     │
│  Era-versioned decisions. What worked, what didn't, in context.     │
│  NOT case law. Historical record that informs, not constrains.      │
└─────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────────┐
│                        RESONANCE                                     │
│                                                                     │
│  Product-specific tuning. Materials, zones, tensions.               │
│  How the physics manifest in THIS product.                          │
└─────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────────┐
│                          CORE                                        │
│                                                                     │
│  Immutable physics. Tick rate. Sync model. Budgets. Fidelity.       │
│  The ONLY things that cannot be broken.                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Layer

The Core defines physics that CANNOT be violated.

### 2.1 Temporal Governor

Time is a design material, not just a technical constraint.

```yaml
temporal_governor:
  discrete:
    rate_ms: 600
    feel: "Heavy, rhythmic, ceremonial"
    ui_behavior: "UI waits for tick. Delay validates the action."
    example: "OSRS combat, bank transactions"
    
  continuous:
    rate_ms: 0
    feel: "Instant, fluid, seamless"
    ui_behavior: "Optimistic updates. UI lies to create flow."
    example: "Linear task creation, Figma canvas"
```

**Key insight**: OSRS 600ms tick isn't latency to hide—it's the rhythm. Linear's "instant" isn't fast—it's a lie (optimistic) that creates flow.

### 2.2 Sync Authority

```yaml
authority:
  server_authoritative:
    meaning: "Server is truth. Client waits."
    ui_constraint: "NO optimistic updates. Ever."
    violation: "PHYSICS_VIOLATION — Cannot be overridden"
    
  client_authoritative:
    meaning: "Client is truth. Server syncs eventually."
    ui_constraint: "Optimistic updates expected."
```

### 2.3 Budgets (Inflation Guardrails)

Fidelity ceiling prevents "too good." Budgets prevent "too much."

```yaml
budgets:
  cognitive:
    interactive_elements:
      critical: 5       # High-stakes = focused
      transactional: 12 # Work = efficient
      exploratory: 20   # Browse = abundant
      
  visual:
    animation_count:
      critical: 1       # One thing moves, user focuses
      transactional: 3
      exploratory: 5
      
  complexity:
    props_per_component: 10
    variants_per_component: 12
```

**Key insight**: "A screen with 50 perfect buttons is still bad design."

### 2.4 Fidelity Ceiling (Mod Ghost Rule)

```yaml
fidelity:
  rule: |
    Technical superiority is NOT justification for breaking resonance.
    "Better graphics" that don't match the product's soul are WORSE.
    
  ceiling:
    gradients: { max_stops: 2 }
    shadows: { max_layers: 3 }
    animation: { max_duration_ms: 800 }
```

### 2.5 Lens Registry

HD and SD coexist without fighting:

```yaml
lens:
  vanilla:
    description: "Gold standard. Core fidelity."
    
  high_fidelity:
    description: "117HD style. User opted-in."
    constraint: "Cannot change geometry. Only rendering."
    
  utility:
    description: "RuneLite style. Overlays, markers."
    constraint: "Additive only."
    
  accessibility:
    description: "High contrast, reduced motion."
```

**Rule**: "NEVER bake lens features into core assets. Core is truth. Lens is experience."

---

## 3. Resonance Layer

Product-specific tuning of the physics.

### 3.1 Materials

```yaml
materials:
  clay:
    physics: { light: diffuse, weight: heavy, motion: spring, feedback: depress }
    feel: "Things made of clay have weight. They resist. They confirm."
    zone_affinity: [critical, celebration]
    
  machinery:
    physics: { light: flat, weight: none, motion: instant, feedback: highlight }
    feel: "Machinery has no personality. It has function."
    zone_affinity: [transactional, admin]
    
  glass:
    physics: { light: refract, weight: weightless, motion: ease, feedback: glow }
    feel: "Glass elements float above the surface."
    zone_affinity: [exploratory, marketing]
```

### 3.2 Zones

```yaml
zones:
  critical:
    physics:
      sync: server_authoritative
      tick: discrete
      material: clay
    rules:
      - "Server confirms before state changes"
      - "Pending state is always visible"
      - "No optimistic updates (physics violation)"
    paths: ["**/checkout/**", "**/claim/**", "**/trade/**"]
    
  transactional:
    physics:
      sync: client_authoritative
      tick: continuous
      material: machinery
    rules:
      - "Optimistic updates expected"
      - "Instant feedback"
    paths: ["**/dashboard/**", "**/settings/**"]
    
  exploratory:
    physics:
      sync: client_authoritative
      tick: continuous
      material: glass
    rules:
      - "Animation aids orientation"
      - "Spring physics for delight"
    paths: ["**/browse/**", "**/discover/**"]
```

### 3.3 Tensions (Sliders)

```yaml
tensions:
  playfulness: [0-100]  # Serious ↔ Fun
  weight: [0-100]       # Light ↔ Heavy
  density: [0-100]      # Spacious ↔ Dense
  speed: [0-100]        # Slow ↔ Fast
  
  presets:
    critical: { playfulness: 20, weight: 80, density: 50, speed: 30 }
    transactional: { playfulness: 30, weight: 20, density: 80, speed: 95 }
    exploratory: { playfulness: 70, weight: 50, density: 40, speed: 60 }
```

---

## 4. Memory Layer

Era-versioned history that informs, not constrains.

### 4.1 Eras

```yaml
era:
  id: 2
  name: "The Warmth Era"
  started: "2025-06-01"
  context:
    - "Airbnb reintroduces skeuomorphism"
    - "Flat design fatigue"
  truths:
    - "Animation aids retention"
    - "Depth communicates hierarchy"
  deprecated:
    - statement: "Animation is latency"
      was_true_in: "era_1"
```

### 4.2 Decisions

```yaml
decision:
  id: "loading-states"
  rulings:
    - era: 1
      verdict: "skeleton"
    - era: 2
      verdict: "text-pending-in-critical"
      context: "Skeletons confused users in critical zones"
```

### 4.3 Mutations

Experimental sandbox for breaking precedent:

```yaml
mutation:
  id: "bouncy-claim-button"
  breaks: "deliberate-timing decision"
  status: "dogfooding"
  expires: "2026-01-12"
  success_criteria:
    - "Completion rate >= 94%"
    - "Trust score >= 4.0"
```

Survivors → promoted to canon. Failures → graveyard (training data).

---

## 5. Taste Key

Single owner authority (not committee).

```yaml
taste_key:
  holder: "@soju"
  
  authority:
    absolute: ["visual execution", "animation", "color"]
    cannot_override: ["core physics", "fidelity ceiling"]
    
  process:
    greenlight: "Poll the concept (community/founder)"
    execution: "Taste Key dictates (no poll)"
    integrity: "Engineering team, no approval needed"
```

**Key insight**: "Quality doesn't come from committees... it comes from individuals with taste." — Karri Saarinen

---

## 6. The 8 Commands

| # | Command | Agent | Purpose |
|---|---------|-------|---------|
| 1 | `/envision` | envisioning-soul | Capture product essence |
| 2 | `/codify` | codifying-materials | Define material physics |
| 3 | `/map` | mapping-zones | Define zones and paths |
| 4 | `/craft` | crafting-components | Generate with Hammer/Chisel |
| 5 | `/validate` | validating-fidelity | Check violations |
| 6 | `/garden` | gardening-entropy | Detect drift, mutations |
| 7 | `/approve` | approving-patterns | Taste Key rulings |
| 8 | `/greenlight` | greenlighting-concepts | Concept approval |

### Workflow

```
SETUP:    /envision → /codify → /map
BUILD:    /greenlight → /craft → /validate → /approve
MAINTAIN: /garden
```

---

## 7. The Craft Toolkit

### 7.1 Hammer (Diagnose + Route)

```
Purpose: Find ROOT CAUSE before solving
Method: AskUserQuestion loop
Speed: Deliberate

Routes to:
├── 🪓 Chisel → If aesthetic
├── Loa Handoff → If structural
└── /approve → If taste decision needed
```

### 7.2 Chisel (Execute)

```
Purpose: Refine aesthetics AFTER diagnosis
Method: Quick execution
Speed: Fast
Precondition: Root cause understood
```

### 7.3 Loa Handoff

When issue is structural (not UI):

```yaml
handoff:
  from: sigil
  to: loa
  problem:
    symptom: "Claim feels slow"
    diagnosis: "Envio indexer (3-4s)"
  constraints:
    zone: critical
    physics: "Cannot use optimistic UI"
  target: "<500ms confirmation"
```

---

## 8. Violation Hierarchy

| Type | Severity | Override |
|------|----------|----------|
| Physics Violation | IMPOSSIBLE | None. Cannot exceed speed of light. |
| Budget Violation | BLOCK | Taste Key can override with justification |
| Fidelity Violation | BLOCK | Taste Key can override |
| Resonance Drift | WARN | Proceed, flagged for review |

---

## 9. Directory Structure

```
sigil-mark/
├── core/
│   ├── sync.yaml           # Temporal Governor + Authority
│   ├── budgets.yaml        # Cognitive, Visual, Complexity
│   ├── fidelity.yaml       # Mod Ghost Rule
│   └── lens.yaml           # Rendering layers
│
├── resonance/
│   ├── essence.yaml        # Product soul
│   ├── materials.yaml      # Clay, Machinery, Glass
│   ├── zones.yaml          # Critical, Transactional, Exploratory
│   └── tensions.yaml       # Tuning sliders
│
├── memory/
│   ├── eras/               # Era definitions
│   ├── decisions/          # Era-versioned decisions
│   ├── mutations/active/   # Current experiments
│   └── graveyard/          # Failed experiments
│
├── taste-key/
│   ├── holder.yaml         # Who holds the key
│   └── rulings/            # Taste Key decisions
│
└── .sigil/
    ├── commands/           # The 8 commands
    ├── skills/             # Agent skills
    └── scripts/            # mount.sh, etc.
```

---

## 10. Success Criteria

The implementation is complete when:

1. **Temporal Governor enforced** — Discrete tick zones wait; continuous zones lie
2. **Budgets enforced** — Cognitive budget blocks "too many elements"
3. **Hammer investigates** — Never jumps to solution without diagnosis
4. **Chisel executes fast** — No investigation for clearly aesthetic input
5. **Loa handoffs work** — Structural issues generate proper context
6. **Physics block impossible** — Cannot generate violations
7. **8 commands only** — No command creep
8. **Single Taste Key** — No committee language
9. **Era-versioned** — Decisions tagged with era

### The Linear Test

```
User: "The claim button feels slow"

❌ FAIL: Add skeleton loader (bandaid)
❌ FAIL: Add optimistic UI without checking zone
✓ PASS: Ask "What kind of slow?"
✓ PASS: Check zone temporal physics
✓ PASS: Route correctly (Chisel vs Loa)
```

---

## Appendix: Key Insights

### From OSRS
- The 600ms tick isn't lag—it's rhythm
- 117HD as Lens, not replacement
- Mod Ghost Rule: "Better" can be worse
- Poll concepts, dictate execution

### From Linear
- "Spinners mean broken architecture"
- Local-first = optimistic lies
- Quality is removing, not adding
- Individuals with taste, not committees

### From Uniswap
- Immutable core, extensible hooks
- Protocol vs Interface separation
- Abstraction as design

### From Airbnb
- Materials as physics
- Era transitions happen
- Skeuomorphism returns
