# Sigil: Design Physics Engine

> "Physics, not opinions. Constraints, not debates."

Sigil is a design context framework that gives AI agents the physics they need to make consistent design decisions. It captures product "taste" as immutable laws and tunable parameters.

## Core Philosophy

1. **Physics over Law**: The agent respects physics (tick rate, sync model), not statutes
2. **Eras over Precedents**: Decisions are versioned; what was true in Era 1 may be false in Era 2
3. **Taste Key over Council**: One person holds the key; they dictate execution, not a committee
4. **Mutations over Compliance**: Breaking precedent is allowed in sandbox; survivors become canon
5. **Resonance over Strategy**: The product "feels right" because physics align

## The 8 Commands

| Command | Purpose |
|---------|---------|
| `/envision` | Capture product essence and soul |
| `/codify` | Define material physics (clay, machinery, glass) |
| `/map` | Define zones and their physics |
| `/craft` | Generate components (Hammer diagnoses, Chisel executes) |
| `/validate` | Check physics and budget violations |
| `/garden` | Detect drift, stale decisions, mutations |
| `/approve` | Taste Key rulings on patterns |
| `/greenlight` | Concept approval before building |

## The `/craft` Toolkit

`/craft` contains two tools, selected based on input:

### 🔨 Hammer (Diagnose + Route)
- **When**: Ambiguous symptoms ("feels slow", "doesn't feel right")
- **Method**: AskUserQuestion loop to find ROOT CAUSE
- **Speed**: Deliberate (investigate before solving)
- **Outputs**: Routes to Chisel (aesthetic) / Loa (structural) / Approve (taste)

### 🪓 Chisel (Execute)
- **When**: Clear aesthetic fix ("adjust padding", "change spring tension")
- **Method**: Quick execution
- **Speed**: Fast (minimal ceremony)
- **Precondition**: Root cause already understood

### The Linear Test
```
User: "The claim button feels slow"

❌ FAIL: Immediately add skeleton loader (bandaid)
❌ FAIL: Add optimistic UI without checking zone physics
✓ PASS: Ask "What kind of slow?" → Diagnose → Route correctly
```

## Physics Violations

Physics violations are IMPOSSIBLE, not just blocked:

```
Zone: critical
Tick: discrete (600ms)
Sync: server_authoritative

VIOLATION: Optimistic UI

This is not a style preference. It is a physics violation.
You cannot exceed the speed of light.
You cannot show state before the server confirms in this zone.

The delay IS the trust.
```

## Budget Violations

Budgets prevent "too much" even when each element passes physics:

```
Zone: critical
Budget: 5 interactive elements max
Found: 12 elements

"A screen with 50 perfect buttons is still bad design."

Budget violations CAN be overridden by Taste Key with justification.
```

## Loa Handoff

When Hammer diagnoses a structural issue (not UI), hand off to Loa:

```yaml
handoff:
  from: sigil
  to: loa
  problem:
    symptom: "Claim feels slow"
    diagnosis: "Envio indexer latency (3-4s)"
  constraints:
    zone: critical
    physics: "Cannot use optimistic UI"
  target: "<500ms confirmation"
```

## Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TASTE KEY                                    │
│  Single holder with absolute authority over visual execution.       │
└─────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────────┐
│                         MEMORY                                       │
│  Era-versioned decisions. History informs, not constrains.          │
└─────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────────┐
│                        RESONANCE                                     │
│  Product tuning: Materials, zones, tensions.                        │
└─────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────────┐
│                          CORE                                        │
│  Immutable physics: Tick, sync, budgets, fidelity, lens.            │
└─────────────────────────────────────────────────────────────────────┘
```

## File Locations

```
sigil-mark/
├── core/           # Immutable physics
├── resonance/      # Product tuning
├── memory/         # Era-versioned decisions
├── taste-key/      # Authority and rulings
└── .sigil/         # Commands and skills
```

## Key Concepts

### Temporal Governor
Time is a design material:
- **Discrete tick (600ms)**: "The delay IS the trust" (OSRS style)
- **Continuous (0ms)**: "The lie IS the speed" (Linear style, optimistic UI)

### Fidelity Ceiling (Mod Ghost Rule)
Technical superiority is NOT justification for breaking resonance.
"Better graphics" that don't match the product's soul are WORSE.

### Lens Registry
HD and SD coexist:
- **Vanilla**: Gold standard, core fidelity
- **High-fidelity**: 117HD style, user opt-in
- **Utility**: Overlays, markers (RuneLite style)
- **Accessibility**: High contrast, reduced motion

### Materials
- **Clay**: Heavy, spring, depress. For critical zones.
- **Machinery**: Instant, flat, efficient. For transactional zones.
- **Glass**: Weightless, refract, glow. For exploratory zones.

### Zones
- **Critical**: Server-authoritative, discrete tick, max 5 elements
- **Transactional**: Client-authoritative, continuous, optimistic OK
- **Exploratory**: Client-authoritative, continuous, delight allowed

## When NOT to Use Sigil

- Pure logic/backend work → Use Loa directly
- Infrastructure issues → Hand off to Loa
- Security/auth concerns → Not Sigil's domain
- Content writing → Not Sigil's domain
