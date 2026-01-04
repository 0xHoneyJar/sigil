---
name: material
description: Register or manage custom materials
agent: codifying-materials
agent_path: .claude/skills/codifying-materials/SKILL.md
preflight:
  - sigil_setup_complete
---

# /material

Manage custom materials.

## Usage

```
/material                    # List all materials
/material register [name]    # Register new material
/material show [name]        # Show material details
/material delete [name]      # Delete custom material
```

## Custom Material Registration

```
/material register paper

Name: paper
Extends: clay
Overrides:
  weight: light
  feedback: [fold, crinkle]
Config:
  texture: paper-grain.svg
```

## Built-in Materials

- **glass** - Refractive, weightless, ease motion
- **clay** - Diffuse, heavy, spring motion
- **machinery** - Flat, instant, no animation
