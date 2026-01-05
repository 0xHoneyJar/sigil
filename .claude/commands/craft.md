---
name: craft
version: "0.5.0"
description: Generate UI with physics context using Hammer/Chisel toolkit
agent: crafting-components
agent_path: .claude/skills/crafting-components/SKILL.md
preflight:
  - sigil_setup_complete
context_injection: true
---

# /craft

Generate UI components with physics constraints. Uses Hammer to diagnose, Chisel to execute.

## Usage

```
/craft [prompt]                    # Diagnose and generate
/craft [prompt] --zone [zone]      # Force zone context
/craft [prompt] --material [mat]   # Force material
```

## The Hammer/Chisel Workflow

Every `/craft` follows this pattern:

```
1. HAMMER (Diagnose)
   - Detect zone from file path
   - Load zone physics (sync, tick, material)
   - Analyze user request against physics
   - Classify: WITHIN_PHYSICS / BUDGET_VIOLATION / IMPOSSIBLE / STRUCTURAL

2. CHISEL (Execute)
   - Apply material physics (clay/machinery/glass)
   - Apply sync pattern (server_tick/optimistic)
   - Apply tensions (playfulness, weight, density, speed)
   - Respect budget and fidelity ceiling
   - Generate component
```

## The Linear Test

Before any change, the agent asks:

```
User: "The claim button feels slow"

WRONG: Add optimistic UI, speed up animation
RIGHT: Check zone physics first

Zone: critical → server_authoritative → 600ms discrete tick
Material: clay → heavy, deliberate

Diagnosis: "Slow" IS the design. The delay is trust.
```

## Zone to Physics

| Zone | Sync | Tick | Material |
|------|------|------|----------|
| critical | server_authoritative | discrete (600ms) | clay |
| transactional | client_authoritative | continuous (0ms) | machinery |
| exploratory | client_authoritative | continuous (0ms) | glass |
| marketing | client_authoritative | continuous (0ms) | glass |
| admin | client_authoritative | continuous (0ms) | machinery |

## Physics Violations

### IMPOSSIBLE (Cannot Override)

- Optimistic UI in server_authoritative zone
- Bypassing discrete tick in critical zone
- Breaking trust model

### BLOCK (Taste Key Can Override)

- Exceeding element budget
- Exceeding fidelity ceiling
- Drift from essence

## Examples

```
/craft "Create a claim button"
→ Zone: critical
→ Material: clay (heavy spring)
→ Sync: server_authoritative (no optimistic)
→ Generates: ServerTickButton with pending state

/craft "Build a settings toggle"
→ Zone: transactional
→ Material: machinery (instant)
→ Sync: client_authoritative (optimistic)
→ Generates: instant toggle, no animation

/craft "Design a gallery card"
→ Zone: exploratory
→ Material: glass (ease, glow)
→ Sync: client_authoritative
→ Generates: hover effect, smooth transition
```

## Loa Handoff

If request requires structural change (changing zone physics):

```
LOA HANDOFF

The request requires changing:
- Zone sync authority
- Tick mode

This is a STRUCTURAL change. Route to Loa:
/consult
```

## Next Step

After `/craft`: Run `/validate` to check generated code against physics.
