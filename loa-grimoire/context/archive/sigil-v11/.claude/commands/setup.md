---
name: setup
description: Initialize Sigil on a repository
agent: null
preflight: []
---

# /setup

Initialize Sigil Soul Engine on this repository.

## What This Does

1. Creates `sigil-mark/` directory structure
2. Copies kernel templates (physics, sync, fidelity)
3. Copies soul templates (materials, zones, tensions, essence)
4. Creates governance structure
5. Creates workbench structure
6. Generates `.sigilrc.yaml` configuration

## Directory Structure Created

```
sigil-mark/
├── kernel/                    # IMMUTABLE after lock
│   ├── physics.yaml          # Light, weight, motion, feedback
│   ├── sync.yaml             # CRDT, LWW, Server-Tick
│   └── fidelity-ceiling.yaml # Gold Standard constraints
├── soul/
│   ├── essence.yaml          # Soul statement, invariants
│   ├── materials.yaml        # Material compositions
│   ├── zones.yaml            # Design zones
│   └── tensions.yaml         # Adjustable parameters
├── workbench/
│   ├── paper-cuts.yaml       # Entropy tracking
│   └── fidelity-report.yaml  # Validation results
├── governance/
│   ├── taste-owners.yaml     # Named authorities
│   ├── greenlight.yaml       # Polling records
│   └── approvals.yaml        # Sign-off records
├── gold-standard/            # Reference assets
└── moodboard.md              # Human-readable references
```

## Usage

```
/setup
```

## Post-Setup

After setup, run:
1. `/envision` - Capture product soul
2. `/codify` - Define materials
3. `/zone` - Configure zones

## Idempotency

Safe to run multiple times. Will not overwrite existing files.
