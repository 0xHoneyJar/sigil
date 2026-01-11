# Sigil Mark

This directory contains your product's design physics configuration.

## Structure

```
sigil-mark/
├── core/              # IMMUTABLE — Physics that cannot be violated
│   ├── sync.yaml      # Temporal Governor (tick, authority)
│   ├── budgets.yaml   # Cognitive, visual, complexity limits
│   ├── fidelity.yaml  # Mod Ghost Rule (ceiling)
│   └── lens.yaml      # Rendering layers (HD/SD)
│
├── resonance/         # TUNABLE — Product-specific configuration
│   ├── essence.yaml   # Product soul (from /envision)
│   ├── materials.yaml # Physics per material (clay, machinery, glass)
│   ├── zones.yaml     # Zone definitions and path mapping
│   └── tensions.yaml  # Tuning sliders
│
├── memory/            # VERSIONED — Historical decisions
│   ├── eras/          # Era definitions
│   ├── decisions/     # Era-versioned decisions
│   ├── mutations/     # Active experiments
│   │   └── active/
│   └── graveyard/     # Failed experiments (training data)
│
├── taste-key/         # AUTHORITY — Who decides
│   ├── holder.yaml    # Taste Key holder
│   └── rulings/       # Recorded rulings
│
└── .sigil/            # MACHINERY — Commands and skills
    ├── commands/
    ├── skills/
    └── scripts/
```

## Getting Started

1. Run `/envision` to capture your product's essence
2. Run `/codify` to define material physics
3. Run `/map` to map zones to paths
4. Start using `/craft` to generate components

## Commands

| Command | Purpose |
|---------|---------|
| `/envision` | Capture product soul |
| `/codify` | Define materials |
| `/map` | Define zones |
| `/craft` | Generate components |
| `/validate` | Check violations |
| `/garden` | Detect entropy |
| `/approve` | Taste Key rulings |
| `/greenlight` | Concept approval |
