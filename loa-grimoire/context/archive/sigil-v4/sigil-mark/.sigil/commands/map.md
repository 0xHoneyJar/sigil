---
name: map
description: Define zones and their physics
skill: mapping-zones
skill_path: .sigil/skills/mapping-zones/SKILL.md
allowed_tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
preflight:
  - sigil_setup_complete
---

# /map

Define zones and map paths to physics contexts.

## What It Creates

`sigil-mark/resonance/zones.yaml` with:
- Zone definitions (critical, transactional, exploratory, custom)
- Path patterns for each zone
- Physics per zone (sync, tick, material)
- Budget overrides per zone
- Tension presets per zone

## Interview Flow

1. **Zone Identification**: "What types of interactions exist in your product?"
2. **Path Mapping**: "What paths belong to each zone?"
3. **Physics Assignment**: "What physics should each zone use?"
4. **Budget Tuning**: "How many elements should each zone allow?"

## Usage

```
/map                # Start fresh
/map --scan         # Auto-detect from directory structure
/map --visualize    # Show zone coverage map
```

## Output

Creates or updates `sigil-mark/resonance/zones.yaml`
