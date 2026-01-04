---
name: zone
description: Configure path-based design zones
agent: mapping-zones
agent_path: .claude/skills/mapping-zones/SKILL.md
preflight:
  - sigil_setup_complete
  - materials_exist
---

# /zone

Configure design zones with material, sync, and tension defaults.

## Usage

```
/zone                      # List zones
/zone add [name]           # Add custom zone
/zone configure [name]     # Configure zone
/zone map [path] [zone]    # Map path to zone
```

## Default Zones

- **critical** - Checkout, trade, claim (clay, server_tick)
- **transactional** - Admin, settings (machinery, lww)
- **exploratory** - Browse, search (glass, lww)
- **marketing** - Landing pages (clay, local_only)
- **celebration** - Success states (clay, server_tick)

## Outputs

- `sigil-mark/soul/zones.yaml`

## Next Step

After `/zone`: Ready to use `/craft` for generation.
