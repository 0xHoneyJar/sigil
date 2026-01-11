# Sigil v4: Design Physics Engine

> "Physics, not opinions. Constraints, not debates."

Sigil is a design context framework that gives AI agents the physics they need to make consistent design decisions. It captures product "taste" as immutable laws and tunable parameters.

## Quick Start

```bash
# Mount Sigil on your project
./sigil-mark/.sigil/scripts/mount.sh

# Start defining your product
/envision    # Capture product essence
/codify      # Define material physics
/map         # Define zones

# Build with physics
/craft       # Generate components
/validate    # Check violations
/approve     # Taste Key rulings
```

## The 8 Commands

| Command | Purpose |
|---------|---------|
| `/envision` | Capture product essence |
| `/codify` | Define material physics |
| `/map` | Define zones and paths |
| `/craft` | Generate with Hammer/Chisel |
| `/validate` | Check violations |
| `/garden` | Detect drift and entropy |
| `/approve` | Taste Key rulings |
| `/greenlight` | Concept approval |

## Core Concepts

### Temporal Governor

Time is a design material:
- **Discrete tick (600ms)**: "The delay IS the trust" (OSRS style)
- **Continuous (0ms)**: "The lie IS the speed" (Linear style)

### Materials

- **Clay**: Heavy, spring, depress. For critical zones.
- **Machinery**: Instant, flat. For transactional zones.
- **Glass**: Weightless, glow. For exploratory zones.

### Zones

- **Critical**: Server-authoritative, no optimistic UI
- **Transactional**: Client-authoritative, optimistic expected
- **Exploratory**: Delight allowed, animations welcome

### Budgets

Fidelity ceiling prevents "too good." Budgets prevent "too much."

```yaml
cognitive:
  critical: 5 elements max
  transactional: 12 elements max
```

## The Craft Toolkit

`/craft` uses two tools:

### 🔨 Hammer (Diagnose)
For ambiguous symptoms. Asks questions to find root cause.
Routes to Chisel, Loa, or Approve.

### 🪓 Chisel (Execute)
For clear aesthetic fixes. Quick execution, minimal ceremony.

## Directory Structure

```
sigil-mark/
├── core/           # Immutable physics
├── resonance/      # Product tuning
├── memory/         # Era-versioned decisions
├── taste-key/      # Authority and rulings
└── .sigil/         # Commands and skills
```

## Documentation

- `CLAUDE.md` — Agent instructions
- `docs/ARCHITECTURE.md` — Full architecture

## License

MIT
