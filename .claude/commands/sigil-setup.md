---
name: "sigil-setup"
version: "4.0.0"
description: |
  Initialize Sigil v4 Design Physics Engine on a repository.
  Creates physics-based directory structure and configuration files.

command_type: "wizard"

arguments: []

pre_flight:
  - check: "file_not_exists"
    path: ".sigil-setup-complete"
    error: "Sigil v4 setup already completed. Edit .sigilrc.yaml to modify settings."

outputs:
  # Core layer (physics)
  - path: sigil-mark/core/sync.yaml
    type: "file"
    description: "Temporal Governor (tick modes, sync authority)"
  - path: sigil-mark/core/budgets.yaml
    type: "file"
    description: "Cognitive, visual, complexity budgets"
  - path: sigil-mark/core/fidelity.yaml
    type: "file"
    description: "Fidelity Ceiling (Mod Ghost Rule)"
  - path: sigil-mark/core/lens.yaml
    type: "file"
    description: "Lens Registry (rendering layers)"

  # Resonance layer (tuning)
  - path: sigil-mark/resonance/materials.yaml
    type: "file"
    description: "Clay, Machinery, Glass physics"
  - path: sigil-mark/resonance/zones.yaml
    type: "file"
    description: "Path-based zone definitions"
  - path: sigil-mark/resonance/tensions.yaml
    type: "file"
    description: "Tuning sliders"
  - path: sigil-mark/resonance/essence.yaml
    type: "file"
    description: "Product soul (populated by /envision)"

  # Memory layer
  - path: sigil-mark/memory/eras/
    type: "directory"
    description: "Era versioning"
  - path: sigil-mark/memory/decisions/
    type: "directory"
    description: "Decision records"
  - path: sigil-mark/memory/mutations/active/
    type: "directory"
    description: "Active mutations"
  - path: sigil-mark/memory/graveyard/
    type: "directory"
    description: "Deprecated decisions"

  # Taste Key
  - path: sigil-mark/taste-key/holder.yaml
    type: "file"
    description: "Taste Key authority definition"
  - path: sigil-mark/taste-key/rulings/
    type: "directory"
    description: "Taste Key rulings"

  # Configuration
  - path: .sigilrc.yaml
    type: "file"
    description: "Framework configuration"
  - path: .sigil-setup-complete
    type: "file"
    description: "Setup completion marker"
  - path: .sigil-version.json
    type: "file"
    description: "Version tracking"

mode:
  default: "foreground"
  allow_background: false
---

# Sigil v4 Setup

## Purpose

Initialize Sigil v4 Design Physics Engine on a repository. Creates the physics-based directory structure, configuration files, and prepares for design capture through interviews.

## Philosophy

> "Physics, not opinions. Constraints, not debates."

Sigil v4 is a Design Physics Engine that gives AI agents physics constraints for consistent design decisions.

## Invocation

```
/sigil-setup
```

## Agent

Launches `initializing-sigil` skill from `.claude/skills/initializing-sigil/`.

See: `.claude/skills/initializing-sigil/SKILL.md` for full workflow details.

## Workflow

1. **Pre-flight**: Check if already setup
2. **Detect**: Find component directories
3. **Create**: Build v4 directory structure (4 layers)
4. **Configure**: Initialize `.sigilrc.yaml`
5. **Report**: Show completion message with next steps

## Four Layers

| Layer | Directory | Purpose |
|-------|-----------|---------|
| Core | `sigil-mark/core/` | Immutable physics (sync, budgets, fidelity, lens) |
| Resonance | `sigil-mark/resonance/` | Product tuning (materials, zones, tensions, essence) |
| Memory | `sigil-mark/memory/` | Decision versioning (eras, decisions, mutations) |
| Taste Key | `sigil-mark/taste-key/` | Human authority (holder, rulings) |

## Physics Enforcement

| Level | Behavior |
|-------|----------|
| IMPOSSIBLE | Cannot override (sync authority, tick modes) |
| BLOCK | Requires Taste Key approval (budgets, fidelity) |

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Setup already complete" | `.sigil-setup-complete` exists | Edit `.sigilrc.yaml` to modify settings |
| "Cannot detect components" | No standard component paths | Proceed with empty paths; edit .sigilrc.yaml |
| "Permission denied" | File system issue | Check directory permissions |

## Next Step

After setup: `/envision` to capture product soul
