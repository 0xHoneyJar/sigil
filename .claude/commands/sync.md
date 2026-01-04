---
name: "sync"
version: "1.0.0"
description: |
  Generate CLAUDE.md from sigil-mark/ state.
  Synchronizes design context for Claude Code consumption.

command_type: "utility"

arguments:
  - name: "output"
    type: "string"
    required: false
    default: "CLAUDE.md"
    description: "Output file path"
  - name: "force"
    type: "flag"
    required: false
    description: "Overwrite existing CLAUDE.md without confirmation"

pre_flight:
  - check: "file_exists"
    path: ".sigil-setup-complete"
    error: "Sigil setup not complete. Run /setup first."

outputs:
  - path: "CLAUDE.md"
    type: "file"
    description: "Design context for Claude Code"

mode:
  default: "foreground"
  allow_background: false
---

# /sync - Generate CLAUDE.md from Sigil State

> *"Synchronize design context for AI consumption."*

## Purpose

Generate a `CLAUDE.md` file from `sigil-mark/` that Claude Code can read for design context. This makes materials, zones, fidelity constraints, and sync strategies available during code generation.

## Invocation

```
/sync
/sync --output CLAUDE.md
/sync --force
```

## What It Does

Reads from sigil-mark/ and generates CLAUDE.md with:

1. **The Three Laws** - Core invariants
2. **Materials** - Physics primitives and forbidden patterns
3. **Zones** - Path-based design rules
4. **Fidelity Ceiling** - Constraint limits
5. **Sync Strategies** - Data synchronization rules
6. **Agent Protocol** - How to use this context
7. **Commands Reference** - Available Sigil commands

## Generated Structure

```markdown
# Sigil Design Context

## The Three Laws
1. Server-tick data MUST show pending state
2. Fidelity ceiling cannot be exceeded
3. Visuals are dictated, never polled

## Materials
### Glass
Light, translucent, refractive...

### Clay
Warm, tactile, weighted...

## Zones
| Zone | Material | Sync | Motion |
...

## Fidelity Ceiling
Max gradient stops: 2
Max animation duration: 800ms
...

## Sync Strategies
| Strategy | Optimistic | Use Cases |
...

## Agent Protocol
1. Detect zone from file path
2. Load material for that zone
...

## Commands Reference
| Command | Purpose |
...
```

## Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| `--output` | Output file path (default: CLAUDE.md) | No |
| `--force` | Overwrite without confirmation | No |

## Source Files

CLAUDE.md is generated from:

| Source File | Section |
|-------------|---------|
| `sigil-mark/soul/materials.yaml` | Materials |
| `sigil-mark/soul/zones.yaml` | Zones |
| `sigil-mark/soul/tensions.yaml` | Tensions |
| `sigil-mark/soul/essence.yaml` | Soul Statement |
| `sigil-mark/kernel/physics.yaml` | Physics primitives |
| `sigil-mark/kernel/sync.yaml` | Sync strategies |
| `sigil-mark/kernel/fidelity-ceiling.yaml` | Fidelity constraints |

## When to Run

Run `/sync` after:
- Completing `/codify` (locks kernel, defines materials)
- Modifying zone configurations
- Updating fidelity constraints
- Adding custom materials

## Example Output

```markdown
## Materials

### Glass
Light, translucent, refractive material for floating UI

**Forbidden:**
- Solid backgrounds
- Hard shadows (blur < 8px)
- Heavy borders (> 1px)
- Spring animations

### Clay
Warm, tactile, weighted material with physical presence

**Forbidden:**
- Flat design (no shadows)
- Instant transitions
- Shadowless elements
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Sigil setup not complete" | Missing `.sigil-setup-complete` | Run `/setup` first |
| "Missing kernel files" | Incomplete setup | Run `/codify` to create kernel |
| "Failed to parse YAML" | Invalid YAML syntax | Check sigil-mark/ files |

## Integration

After running `/sync`, CLAUDE.md is automatically loaded as project context when Claude Code starts. This provides design guidance during all code generation.

## Script

This command runs `.claude/scripts/generate-claude-md.sh`.

## Next Step

After sync: Run `/craft` during implementation to get zone-aware design guidance.
