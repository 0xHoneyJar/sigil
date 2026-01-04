# Migration Guide: v0.4 → v11

> How to upgrade from Sigil v0.4 (Soul Binder) to v11 (Soul Engine)

## Overview

Sigil v11 is a complete rewrite that introduces:

| Feature | v0.4 | v11 |
|---------|------|-----|
| Architecture | Four Pillars | Kernel + Soul |
| Materials | Not present | Physics primitives |
| Zones | Basic | Full sync/material/motion |
| Fidelity | Not present | Fidelity Ceiling |
| Sync | Not present | CRDT/LWW/Server-Tick |
| HUD | Not present | @sigil/hud package |
| Governance | Consultation Chamber | Taste Owner + Pollster |

## Breaking Changes

### Directory Structure

**v0.4:**
```
sigil-mark/
├── moodboard.md
├── rules.md
├── inventory.md
├── soul-binder/
├── lens-array/
├── consultation-chamber/
└── proving-grounds/
```

**v11:**
```
sigil-mark/
├── kernel/           # NEW - Immutable primitives
│   ├── physics.yaml
│   ├── sync.yaml
│   └── fidelity-ceiling.yaml
├── soul/             # NEW - Product soul
│   ├── essence.yaml
│   ├── materials.yaml
│   ├── zones.yaml
│   └── tensions.yaml
├── workbench/        # NEW - Active work
│   ├── fidelity-report.yaml
│   └── paper-cuts.yaml
└── governance/       # Replaces consultation-chamber
    ├── taste-owners.yaml
    ├── approvals.yaml
    ├── greenlight.yaml
    └── archaeology.yaml
```

### Commands

| v0.4 Command | v11 Command | Notes |
|--------------|-------------|-------|
| `/canonize` | Removed | Use `/approve` |
| `/consult` | `/greenlight` | Now polls concepts |
| `/unlock` | Still available | For locked decisions |
| `/prove` | `/prove` | Similar API |
| `/graduate` | Auto on prove complete | Simplified |
| `/setup` | `/setup` | New structure |
| `/envision` | `/envision` | Updated output |
| `/codify` | `/codify` | Now creates materials |
| `/craft` | `/craft` | Zone-aware |
| `/approve` | `/approve` | Now Taste Owner role |
| N/A | `/sync` | NEW - Generates CLAUDE.md |
| N/A | `/zone` | NEW - Zone management |
| N/A | `/validate` | NEW - Fidelity check |
| N/A | `/garden` | NEW - Paper cuts |
| N/A | `/material` | NEW - Material management |

### Configuration

**v0.4 .sigilrc.yaml:**
```yaml
version: "1.0"
strictness: "discovery"
component_paths:
  - "components/"
zones:
  critical:
    paths: ["src/features/checkout/**"]
    motion: "deliberate"
    patterns:
      prefer: ["deliberate-entrance"]
```

**v11 .sigilrc.yaml:**
```yaml
version: "2.0"
strictness: "discovery"
component_paths:
  - "components/"
  - "src/components/"
zones:
  critical:
    paths:
      - "src/features/checkout/**"
      - "src/features/trade/**"
    material: "clay"
    sync: "server_tick"
    motion:
      style: "deliberate"
      entrance_ms: 800
governance:
  taste_owners:
    - "@design-lead"
```

## Migration Steps

### 1. Backup Current State

```bash
cp -r sigil-mark sigil-mark-v04-backup
cp .sigilrc.yaml .sigilrc-v04.yaml
```

### 2. Run Migration

```bash
# Pull latest Sigil
/update

# Re-run setup (preserves existing data)
/setup --migrate
```

### 3. Create Kernel

The kernel is new in v11. Run `/codify` to create:

```bash
/codify
```

This creates:
- `sigil-mark/kernel/physics.yaml` - Physics primitives
- `sigil-mark/kernel/sync.yaml` - Sync strategies
- `sigil-mark/kernel/fidelity-ceiling.yaml` - Constraints

### 4. Define Materials

Materials replace ad-hoc styling rules:

```bash
/codify --materials
```

Maps your existing rules to materials:
- **glass** — Light, translucent UI
- **clay** — Warm, tactile buttons/cards
- **machinery** — Instant, no-animation admin

### 5. Update Zones

Add material and sync to zones:

```yaml
# Old
zones:
  critical:
    paths: ["src/features/checkout/**"]
    motion: "deliberate"

# New
zones:
  critical:
    paths:
      - "src/features/checkout/**"
    material: "clay"
    sync: "server_tick"
    motion:
      style: "deliberate"
      entrance_ms: 800
```

### 6. Generate CLAUDE.md

```bash
/sync
```

This creates `CLAUDE.md` from your sigil-mark/ state.

### 7. Lock Kernel (Optional)

When ready to protect your primitives:

```bash
/codify --lock
```

**Warning:** Locked kernel cannot be modified without forking.

## Mapping v0.4 Concepts to v11

### Soul Binder → Soul

| v0.4 | v11 |
|------|-----|
| `immutable-values.yaml` | `soul/essence.yaml` (invariants) |
| `canon-of-flaws.yaml` | `governance/archaeology.yaml` (near misses) |
| `visual-soul.yaml` | `soul/materials.yaml` |

### Lens Array → Lenses

Lenses are now used via `/craft --lens`:

```bash
# v0.4
/craft  # implicit lens detection

# v11
/craft --lens power_user  # explicit lens
```

### Consultation Chamber → Governance

| v0.4 | v11 |
|------|-----|
| `/consult` | `/greenlight` (concepts) or `/approve` (visuals) |
| `decisions/` | `governance/greenlight.yaml` |
| Trust scores | `governance/taste-owners.yaml` |

### Proving Grounds → Prove

Similar API, simplified workflow:

```bash
# v0.4
/prove register <feature>
/prove status
/prove graduate

# v11
/prove <feature>  # Register and track
# Auto-graduates on success
```

## New Concepts

### Materials

Materials are compositions of physics primitives:

```yaml
# soul/materials.yaml
materials:
  clay:
    primitives:
      light: "diffuse"
      weight: "heavy"
      motion: "spring"
      feedback: ["lift", "depress"]
```

### Fidelity Ceiling

Prevents "improvement" from destroying soul:

```yaml
# kernel/fidelity-ceiling.yaml
constraints:
  visual:
    gradients:
      max_stops: 2
  animation:
    max_duration_ms: 800
```

### Sync Strategies

Data synchronization affects UI behavior:

| Strategy | Optimistic | Use Cases |
|----------|------------|-----------|
| server_tick | NEVER | Money, trades |
| crdt | Yes | Documents |
| lww | Yes | Settings |
| local_only | Yes | Modals |

### HUD Overlay

Development-only UI for testing:

```tsx
import { SigilHUD } from '@sigil/hud';

<SigilHUD position="bottom-right" />
```

## Troubleshooting

### "Kernel is locked"

The kernel was locked with `/codify --lock`. To modify:
1. Fork a new version
2. Or contact the original locker

### "Zone not found"

Add the path to zones.yaml:

```yaml
zones:
  your_zone:
    paths:
      - "your/path/**"
    material: "clay"
    sync: "lww"
```

### "Material physics mismatch"

Material uses primitives not in kernel. Either:
1. Add primitives to physics.yaml (if unlocked)
2. Use existing primitives

### "Fidelity violation"

Output exceeds fidelity ceiling. Either:
1. Simplify the output
2. Get Taste Owner approval
3. Request exception in fidelity-ceiling.yaml

## Rollback

To rollback to v0.4:

```bash
# Restore backup
rm -rf sigil-mark
mv sigil-mark-v04-backup sigil-mark
mv .sigilrc-v04.yaml .sigilrc.yaml

# Downgrade framework
/update --branch v0.4
```

## Support

- [GitHub Issues](https://github.com/0xHoneyJar/sigil/issues)
- [Documentation](https://github.com/0xHoneyJar/sigil/tree/main/docs)

---

*"Culture is the Reality. Code is Just the Medium."*
