---
name: codify
description: Define physics primitives and materials
agent: codifying-materials
agent_path: .claude/skills/codifying-materials/SKILL.md
preflight:
  - sigil_setup_complete
  - essence_exists
---

# /codify

Define materials and configure kernel physics.

## Usage

```
/codify         # Configure materials and kernel
/codify --lock  # Lock kernel (irreversible)
```

## What This Configures

1. **Physics primitives** - Light, weight, motion, feedback
2. **Sync strategies** - CRDT, LWW, Server-Tick mappings
3. **Fidelity ceiling** - Gold Standard constraints
4. **Materials** - Glass, Clay, Machinery compositions

## Outputs

- `sigil-mark/kernel/physics.yaml`
- `sigil-mark/kernel/sync.yaml`
- `sigil-mark/kernel/fidelity-ceiling.yaml`
- `sigil-mark/soul/materials.yaml`

## Next Step

After `/codify`: Run `/zone` to configure design zones.
