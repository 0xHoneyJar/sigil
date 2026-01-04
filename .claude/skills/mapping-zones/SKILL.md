# Sigil Agent: Mapping Zones

> "Zones are design contexts. Different zones, different physics."

## Role

**Zone Architect** — Configures path-based design zones with material, sync, and tension defaults.

## Commands

```
/zone                    # List zones and mappings
/zone add [name]         # Add custom zone
/zone configure [name]   # Configure existing zone
/zone map [path] [zone]  # Map path to zone
```

## Outputs

| Path | Description |
|------|-------------|
| `sigil-mark/soul/zones.yaml` | Zone definitions and mappings |

## Prerequisites

- Run `/codify` first (need materials defined)

## Workflow

### Phase 1: Review Default Zones

```
Current zone configuration:

┌────────────────────────────────────────────────────────────────┐
│ CRITICAL                                                        │
│ Material: clay | Sync: server_tick | Speed: 40                  │
│ Paths:                                                          │
│   - src/features/checkout/**                                    │
│   - src/features/claim/**                                       │
│   - src/features/trade/**                                       │
├────────────────────────────────────────────────────────────────┤
│ TRANSACTIONAL                                                   │
│ Material: machinery | Sync: lww | Speed: 95                     │
│ Paths:                                                          │
│   - src/features/admin/**                                       │
│   - src/features/settings/**                                    │
├────────────────────────────────────────────────────────────────┤
│ EXPLORATORY                                                     │
│ Material: glass | Sync: lww | Speed: 60                         │
│ Paths:                                                          │
│   - src/features/browse/**                                      │
│   - src/features/search/**                                      │
├────────────────────────────────────────────────────────────────┤
│ MARKETING                                                       │
│ Material: clay | Sync: local_only | Speed: 50                   │
│ Paths:                                                          │
│   - src/features/landing/**                                     │
│   - app/(marketing)/**                                          │
└────────────────────────────────────────────────────────────────┘

Modify? [zone name or 'done']
```

### Phase 2: Add Paths

For each zone, ask:
```
Which paths should map to [zone]?

Current patterns:
{{zone.paths}}

Add more paths (glob patterns):
> src/features/wallet/**
> app/(app)/checkout/**

[Added]
```

### Phase 3: Configure Zone Defaults

For each zone:
```
Configure [zone]:

Material: [current: {{zone.material}}]
  Options: glass, clay, machinery
  Change? [enter to keep]

Sync: [current: {{zone.sync}}]
  Options: crdt, lww, server_tick, local_only
  Change? [enter to keep]

Tensions: [current values shown]
  playfulness: {{zone.tensions.playfulness}}
  weight: {{zone.tensions.weight}}
  density: {{zone.tensions.density}}
  speed: {{zone.tensions.speed}}
  
  Modify any? [tension=value or enter to keep]
```

### Phase 4: Add Custom Zone

```
/zone add gaming

Creating new zone: gaming

Description: [What is this zone for?]
> Game-related interfaces with tick-based timing

Paths (glob patterns):
> src/features/game/**
> src/features/combat/**

Material: [glass/clay/machinery]
> clay

Sync: [crdt/lww/server_tick/local_only]
> server_tick

Motion style: [instant/ease/spring/step]
> step

Tick rate (if step): [ms]
> 600

Tensions:
  playfulness: 30
  weight: 60
  density: 60
  speed: 20

[Zone 'gaming' created]
```

### Phase 5: Pattern Overrides

For specific files that need different zone:
```
Some files need zone override.

Add comment at top of file:
// @sigil-zone critical

This forces the file to use critical zone regardless of path.

Configure any overrides? [file path]
```

## Zone Resolution Algorithm

```python
def resolve_zone(file_path: str) -> Zone:
    # 1. Check for @sigil-zone comment in file
    if has_zone_override(file_path):
        return get_override_zone(file_path)
    
    # 2. Match against zone paths in priority order
    for zone_name in ["critical", "celebration", "transactional", 
                       "exploratory", "marketing", "default"]:
        zone = zones[zone_name]
        for pattern in zone.paths:
            if glob_match(file_path, pattern):
                return zone
    
    # 3. Return default
    return zones["default"]
```

## Validation

After configuration, validate:
```
Validating zone configuration...

✓ All paths are valid glob patterns
✓ All materials exist in materials.yaml
✓ All sync strategies are valid
✓ No overlapping paths with different zones
✓ Default zone is configured

Zone configuration saved to sigil-mark/soul/zones.yaml
```

## Success Criteria

- [ ] All feature paths are mapped to zones
- [ ] Each zone has material, sync, and tension defaults
- [ ] No path conflicts (same path → different zones)
- [ ] Critical paths use server_tick
- [ ] Admin paths use machinery

## Next Step

After `/zone`: Ready to use `/craft` for generation.
