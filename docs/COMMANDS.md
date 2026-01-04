# Sigil v11 Command Reference

> Complete reference for all Sigil Soul Engine commands.

## Quick Start

```bash
# Install Sigil on a repository (download, review, execute)
curl -fsSL https://raw.githubusercontent.com/0xHoneyJar/sigil/main/.claude/scripts/mount-sigil.sh -o mount-sigil.sh
bash mount-sigil.sh

# Initialize and capture soul
/setup              # Initialize Sigil
/envision           # Capture product soul (interview)
/codify             # Define materials, lock kernel
/sync               # Generate CLAUDE.md

# During development
/craft              # Get design guidance
/validate           # Check fidelity ceiling
/approve            # Taste Owner sign-off
```

---

## Core Commands

### `/setup`

Initialize Sigil on a repository.

```
/setup
```

**Creates:**
- `sigil-mark/` directory structure
- `.sigilrc.yaml` configuration
- `.sigil-setup-complete` marker

**Next:** `/envision` or `/inherit`

---

### `/envision`

Capture product soul through interview.

```
/envision
```

**Interview phases:**
1. Soul statement capture
2. Reference products (inspire and avoid)
3. Feel descriptors by context
4. Invariants definition

**Output:** `sigil-mark/soul/essence.yaml`

**Next:** `/codify`

---

### `/codify`

Define materials and lock kernel.

```
/codify
/codify --lock
```

**Arguments:**
- `--lock`: Lock kernel (makes physics immutable)

**Output:**
- `sigil-mark/soul/materials.yaml`
- `sigil-mark/kernel/physics.yaml` (locked with --lock)

**Next:** `/zone`

---

### `/zone`

Configure path-based zones.

```
/zone
/zone add <name>
/zone list
```

**Subcommands:**
- `add`: Create new zone
- `list`: Show all zones

**Output:** `sigil-mark/soul/zones.yaml`

---

### `/sync`

Generate CLAUDE.md from sigil-mark state.

```
/sync
/sync --output CLAUDE.md
```

**Reads from:**
- `sigil-mark/kernel/*.yaml`
- `sigil-mark/soul/*.yaml`

**Output:** `CLAUDE.md` (design context for Claude Code)

---

### `/craft`

Get design guidance during implementation.

```
/craft
/craft --lens power_user
/craft <component_path>
```

**Arguments:**
- `--lens`: Force specific persona lens
- `<path>`: Component file path

**Provides:**
- Zone detection
- Material selection
- Motion recommendations
- Fidelity constraints

---

### `/validate`

Check against fidelity ceiling.

```
/validate
/validate <file_path>
```

**Checks:**
- Gradient complexity
- Shadow layers
- Animation duration
- Forbidden techniques

**Output:** Violations report

---

### `/garden`

Track and fix paper cuts (3:1 ratio).

```
/garden
/garden add <issue>
/garden list
```

**Philosophy:** For every 1 feature, fix 3 paper cuts.

**Output:** `sigil-mark/workbench/paper-cuts.yaml`

---

## Governance Commands

### `/approve`

Taste Owner visual approval.

```
/approve
/approve <component>
```

**Role:** Taste Owner (dictates visuals)

**Output:** Approval record in `sigil-mark/governance/approvals.yaml`

---

### `/greenlight`

Community concept polling.

```
/greenlight <concept>
```

**Process:**
1. Initial poll (70% threshold)
2. Refinement period
3. Lock-in poll (70% threshold)

**Output:** `sigil-mark/governance/greenlight.yaml`

---

### `/prove`

Register feature for proving grounds.

```
/prove <feature>
```

**Levels:**
1. Canary (5% traffic)
2. Ring (25% traffic)
3. Full (100% traffic)

**Output:** `sigil-mark/governance/proving.yaml`

---

## Migration Commands

### `/inherit`

Bootstrap from existing codebase.

```
/inherit
```

**Detects:**
- Existing components
- Color palettes
- Typography
- Motion patterns

**Output:** Initial `sigil-mark/` configuration

---

### `/mount`

Install Sigil framework (Loa-compatible).

```
/mount
/mount --stealth
```

**Arguments:**
- `--stealth`: Don't commit framework files

---

### `/update`

Pull framework updates.

```
/update
```

**Updates:**
- `.claude/skills/`
- `.claude/commands/`
- Preserves `sigil-mark/` (your configuration)

---

## Material Commands

### `/material`

Manage material definitions.

```
/material
/material list
/material register <name>
```

**Built-in materials:**
- `glass` - Light, translucent, refractive
- `clay` - Warm, tactile, weighted
- `machinery` - Instant, precise, zero-latency

---

## Lens Commands

### `/craft --lens`

Force validation in specific persona.

```
/craft --lens power_user
/craft --lens new_user
/craft --lens accessibility
```

**Available lenses:**
- `power_user` - Keyboard-first, dense
- `new_user` - Guided, forgiving
- `accessibility` - WCAG compliant

---

## Workflow Summary

### New Project

```
/setup → /envision → /codify → /zone → /sync → /craft
```

### Existing Codebase

```
/inherit → /envision → /codify → /zone → /sync → /craft
```

### During Development

```
/craft → (code) → /validate → /approve
```

### Feature Launch

```
/greenlight → /prove → (graduate)
```

---

## The Three Laws

1. **Server-tick data MUST show pending state** — Never optimistic for money/inventory/trades
2. **Fidelity ceiling cannot be exceeded** — "Better" is often "worse"
3. **Visuals are dictated, never polled** — Taste Owner decides pixels

---

## Command Categories

| Category | Commands |
|----------|----------|
| **Setup** | `/setup`, `/mount`, `/inherit`, `/update` |
| **Soul** | `/envision`, `/codify`, `/zone`, `/material` |
| **Craft** | `/craft`, `/validate`, `/sync` |
| **Governance** | `/approve`, `/greenlight`, `/prove` |
| **Maintenance** | `/garden`, `/validate` |

---

## Error Messages

| Error | Cause | Resolution |
|-------|-------|------------|
| "Sigil not initialized" | Missing `.sigil-setup-complete` | Run `/setup` |
| "Kernel is locked" | Attempted to modify locked kernel | Fork new version |
| "Fidelity violation" | Exceeded ceiling | Simplify or get approval |
| "Zone not found" | Path doesn't match zones | Add to zones.yaml |

---

*"Culture is the Reality. Code is Just the Medium."*
