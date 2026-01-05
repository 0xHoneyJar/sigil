# Sigil v0.5: Design Physics Engine

> "Physics, not opinions. Constraints, not debates."

## What is Sigil?

Sigil is a Design Physics Engine that gives AI agents physics constraints for consistent design decisions:

1. **Temporal Governor** — Discrete tick (600ms) vs continuous (0ms)
2. **Budgets** — Cognitive, visual, complexity limits per zone
3. **Fidelity Ceiling** — Maximum gradient stops, shadow layers, animation duration
4. **Authority Model** — Physics immutable, taste overridable, concepts greenlit

---

## Quick Reference

### Commands (9 total)

| Command | Purpose |
|---------|---------|
| `/sigil-setup` | Initialize v4 state zone structure |
| `/envision` | Capture product soul (interview) |
| `/codify` | Define material physics |
| `/map` | Configure zone mappings |
| `/craft` | Generate with physics context (Hammer/Chisel) |
| `/validate` | Check violations (IMPOSSIBLE/BLOCK/WARN) |
| `/approve` | Taste Key rulings and sign-off |
| `/greenlight` | Concept approval (not execution) |
| `/garden` | Manage entropy and drift |

### State Zone Structure

```
sigil-mark/
├── core/                    # Physics (immutable after lock)
│   ├── sync.yaml            # Temporal Governor
│   ├── budgets.yaml         # Cognitive/visual/complexity limits
│   ├── fidelity.yaml        # Fidelity ceiling (Mod Ghost Rule)
│   └── lens.yaml            # Rendering layers
│
├── resonance/               # Tuning (product-specific)
│   ├── materials.yaml       # Clay, machinery, glass
│   ├── zones.yaml           # Path-based zones
│   ├── tensions.yaml        # 4-axis tuning
│   └── essence.yaml         # Soul statement and invariants
│
├── memory/                  # History
│   ├── eras/                # Era snapshots
│   ├── decisions/           # Greenlight records
│   ├── mutations/active/    # Active changes
│   └── graveyard/           # Archived items
│
└── taste-key/               # Authority
    ├── holder.yaml          # Current Taste Key holder
    └── rulings/             # Override records
```

---

## Agent Protocol

### Before Generating UI Code

1. **Check for Sigil setup**: Look for `.sigil-setup-complete`
2. **Load physics context**: Read `sigil-mark/core/sync.yaml` and `budgets.yaml`
3. **Determine zone**: Match file path to `sigil-mark/resonance/zones.yaml`
4. **Apply physics**: Use zone-specific constraints

### Zone Resolution

```
1. Check for @sigil-zone comment in file
2. Match file path against zones.yaml patterns
3. Return zone name or "default"
```

### The Three-Tier Violation System

| Tier | Type | Override |
|------|------|----------|
| 1 | **IMPOSSIBLE** (Physics) | NEVER |
| 2 | **BLOCK** (Budget/Fidelity) | Taste Key can override |
| 3 | **WARN** (Drift) | Suggestions only |

### Physics Violations (IMPOSSIBLE)

Cannot be generated. Ever. No override exists.

```yaml
physics_violations:
  - "Optimistic update in server_authoritative zone"
  - "Bypassing discrete tick in critical zone"
  - "Continuous animation in discrete tick zone"
  - "Missing pending state in server_authoritative zone"
```

### Budget/Fidelity Violations (BLOCK)

Blocked by default. Taste Key can create ruling to override.

```yaml
budget_violations:
  - interactive_elements: { critical: 5, transactional: 12, exploratory: 20 }
  - decisions: { critical: 2, transactional: 5, exploratory: 10 }
  - animations: { critical: 1, transactional: 2, exploratory: 5 }

fidelity_ceiling:
  - gradient_stops: 2
  - shadow_layers: 3
  - animation_duration: 800ms
  - blur_radius: 16px
  - border_radius: 24px
```

---

## Hammer/Chisel Toolkit

The `/craft` command uses a diagnostic-first approach:

### Hammer (Diagnosis)

When user reports a problem ("button feels slow"):
1. Load zone physics
2. Analyze complaint
3. Identify root cause
4. Suggest appropriate fix

**Never apply bandaids to physics issues.**

### Chisel (Execution)

After diagnosis:
1. Generate code with physics context
2. Check against constraints
3. Route structural issues to Loa

### Loa Handoff

When a design problem requires structural change:

```
/craft "checkout feels slow"

DIAGNOSIS: Physics conflict detected.

The claim button is in critical zone (server_authoritative).
Physics requires pending state and discrete tick (600ms).

This is NOT a design problem. This is architecture.

Handoff to Loa:
/consult "Evaluate if checkout should remain server_authoritative"

Options Loa will consider:
1. Keep server_authoritative (accept the delay)
2. Move to client_authoritative (accept the risk)
3. Hybrid approach (optimistic for non-critical parts)
```

---

## Materials

Three base materials with physics properties:

| Material | Light | Weight | Motion | Feedback |
|----------|-------|--------|--------|----------|
| **Clay** | Diffuse | Heavy | Spring (120/14) | Depress |
| **Machinery** | Flat | None | Instant | Highlight |
| **Glass** | Refract | Weightless | Ease (200ms) | Glow |

### Zone Affinity

```yaml
zone_materials:
  critical: clay       # Heavy, deliberate
  transactional: clay  # Reliable, grounded
  exploratory: glass   # Light, fluid
  marketing: glass     # Ethereal, inviting
  celebration: glass   # Sparkle, reward
```

---

## Taste Key Authority

### CAN Override

- Budgets (element count, animation count)
- Fidelity (gradient stops, shadow layers)
- Taste (colors, typography, spacing)

### CANNOT Override

- Physics (sync authority, tick modes)
- Security (auth, validation)
- Accessibility (contrast, keyboard nav)

---

## Workflow

### New Project

```
/sigil-setup → /envision → /codify → /map → (build) → /craft → /validate → /approve
```

### During Implementation

1. Load physics context (zone, material, sync)
2. Generate with constraints
3. Check violations:
   - IMPOSSIBLE → Block, cannot proceed
   - BLOCK → Suggest Taste Key override
   - WARN → Note for review

### Maintenance

```
/garden → Review entropy → /approve --revoke obsolete rulings
```

---

## Philosophy

Sigil provides physics, not opinions.

- **Physics are immutable**: No escape hatch for server_authoritative violations
- **Taste is overridable**: Taste Key can create rulings
- **Concepts are greenlit**: "Should we build?" is separate from "How should it look?"
- **Entropy is managed**: Gardens need tending

---

## Coexistence with Loa

Sigil and Loa coexist with different responsibilities:

| Aspect | Sigil | Loa |
|--------|-------|-----|
| Domain | Design physics | Product architecture |
| State zone | sigil-mark/ | loa-grimoire/ |
| Handoff | Physics issues | Structural decisions |

Loa handoff happens when design issues are actually architecture issues.

---

## Key Concepts

### Temporal Governor

- **Discrete tick** (600ms): Critical zones, heavy spring
- **Continuous tick** (0ms): Exploratory zones, fluid animations

### Server Authority

- **server_authoritative**: Must show pending state, no optimistic updates
- **client_authoritative**: Optimistic updates allowed
- **collaborative**: CRDT with conflict resolution

### Fidelity Ceiling (Mod Ghost Rule)

Generate at ceiling, not above. A skilled modder can enhance, but base must stand alone.

---

## Skills (9 total)

| Skill | Role | Command |
|-------|------|---------|
| `initializing-sigil` | Framework Installer | /sigil-setup |
| `envisioning-soul` | Soul Keeper | /envision |
| `codifying-materials` | Material Smith | /codify |
| `mapping-zones` | Zone Architect | /map |
| `crafting-components` | Apprentice Smith | /craft |
| `validating-fidelity` | Fidelity Guardian | /validate |
| `approving-patterns` | Taste Key Guardian | /approve |
| `greenlighting-concepts` | Concept Gatekeeper | /greenlight |
| `gardening-entropy` | Entropy Gardener | /garden |
