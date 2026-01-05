---
zones:
  state:
    paths:
      - sigil-mark/
      - .sigilrc.yaml
      - .sigil-setup-complete
      - .sigil-version.json
    permission: read-write
  app:
    paths:
      - components/
      - app/components/
      - src/components/
      - src/features/
    permission: read
---

# Sigil v0.5 Setup Skill

## Purpose

Initialize Sigil v0.5 Design Physics Engine on a repository. Creates the physics-based directory structure, copies core schemas, and prepares for design capture through interviews.

## Philosophy

> "Physics, not opinions. Constraints, not debates."

Sigil v0.5 is a Design Physics Engine that gives AI agents physics constraints for consistent design decisions. The setup creates:

1. **Core Layer** — Immutable physics (sync, budgets, fidelity, lens)
2. **Resonance Layer** — Product tuning (materials, zones, tensions, essence)
3. **Memory Layer** — Decision versioning (eras, decisions, mutations)
4. **Taste Key** — Human authority (holder, rulings)

## Pre-Flight Checks

1. **Not Already Setup**: Check for `.sigil-setup-complete`
   - If exists, warn and offer refresh options
   - Never overwrite existing state files

## Workflow

### Step 1: Detect Component Directories

Scan for common component directory patterns:
- `components/`
- `app/components/`
- `src/components/`
- `src/features/**/components/`

### Step 2: Create v0.5 Directory Structure

Create the complete Sigil v0.5 directory tree:

```bash
# Core layer (physics)
mkdir -p sigil-mark/core

# Resonance layer (tuning)
mkdir -p sigil-mark/resonance

# Memory layer (versioning)
mkdir -p sigil-mark/memory/eras
mkdir -p sigil-mark/memory/decisions
mkdir -p sigil-mark/memory/mutations/active
mkdir -p sigil-mark/memory/graveyard

# Taste Key (authority)
mkdir -p sigil-mark/taste-key/rulings
```

### Step 3: Copy Core Physics Schemas

The core layer schemas are already created during sprints 1-2. If they don't exist, create them from templates:

**Core files (from Sprint 1):**
- `sigil-mark/core/sync.yaml` — Temporal Governor
- `sigil-mark/core/budgets.yaml` — Budget limits
- `sigil-mark/core/fidelity.yaml` — Fidelity Ceiling
- `sigil-mark/core/lens.yaml` — Lens Registry

**Resonance files (from Sprint 2):**
- `sigil-mark/resonance/materials.yaml` — Materials physics
- `sigil-mark/resonance/zones.yaml` — Zone definitions
- `sigil-mark/resonance/tensions.yaml` — Tension sliders
- `sigil-mark/resonance/essence.yaml` — Essence template

**Memory files (from Sprint 2):**
- `sigil-mark/memory/eras/era-1.yaml` — Era-1 template

**Taste Key files (from Sprint 2):**
- `sigil-mark/taste-key/holder.yaml` — Holder template

### Step 4: Create Configuration

Create `.sigilrc.yaml` with v0.5 schema:

```yaml
# Sigil v0.5 Configuration
# Design Physics Engine

version: "4.0"

# Detected component paths
component_paths:
  - "components/"
  # - "src/components/"

# Active zones (from zones.yaml)
zones:
  critical:
    enabled: true
  transactional:
    enabled: true
  exploratory:
    enabled: true
  marketing:
    enabled: true
  admin:
    enabled: true

# Taste Key holder (set via /envision)
taste_key:
  holder: null
  # holder:
  #   name: "Design Lead"
  #   email: "lead@example.com"
  #   github: "@designlead"

# Physics mode
physics:
  # IMPOSSIBLE: Cannot override (sync authority, tick modes)
  # BLOCK: Taste Key can override (budgets, fidelity)
  enforcement: "physics"
```

### Step 5: Create Marker and Version Files

Create `.sigil-setup-complete`:
```
Sigil v0.5 setup completed at [timestamp]
Framework version: 0.5.0
Mode: Design Physics Engine

Next steps:
  - /envision to capture product soul
  - /codify to configure materials
  - /craft to get design guidance
```

Create/update `.sigil-version.json`:
```json
{
  "version": "0.5.0",
  "schema_version": "4.0",
  "setup_at": "[timestamp]",
  "layers": {
    "core": true,
    "resonance": true,
    "memory": true,
    "taste_key": true
  }
}
```

### Step 6: Report Success

Output:
```
Sigil v0.5 Setup Complete

Design Physics Engine initialized with four layers:

  1. Core (sigil-mark/core/)
     - sync.yaml (Temporal Governor)
     - budgets.yaml (Cognitive, Visual, Complexity)
     - fidelity.yaml (Mod Ghost Rule)
     - lens.yaml (Rendering Layers)

  2. Resonance (sigil-mark/resonance/)
     - materials.yaml (Clay, Machinery, Glass)
     - zones.yaml (Critical, Transactional, Exploratory, Marketing, Admin)
     - tensions.yaml (Playfulness, Weight, Density, Speed)
     - essence.yaml (Product Soul - run /envision to populate)

  3. Memory (sigil-mark/memory/)
     - eras/ (Era versioning)
     - decisions/ (Decision records)
     - mutations/ (Active mutations)
     - graveyard/ (Deprecated)

  4. Taste Key (sigil-mark/taste-key/)
     - holder.yaml (Authority definition)
     - rulings/ (Override records)

Configuration:
  - .sigilrc.yaml
  - Detected component paths: [list]

Physics Mode: Active
  IMPOSSIBLE violations are blocked automatically.
  BLOCK violations require Taste Key approval.

Next steps:
  - /envision → Capture product soul
  - /codify → Configure materials and zones
  - /craft → Get physics-aware design guidance

Philosophy: "Physics, not opinions. Constraints, not debates."
```

## Idempotency

If already set up:
1. Warn user that v0.5 setup already complete
2. Show current configuration
3. Offer options:
   - Refresh directory structure (add missing directories)
   - View current physics configuration
   - Proceed to /envision

Never overwrite existing state files.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Setup already complete" | `.sigil-setup-complete` exists | Offer refresh or proceed to /envision |
| "Cannot detect components" | No standard component paths | Proceed with empty paths; user can edit .sigilrc.yaml |
| "Permission denied" | File system issue | Check directory permissions |

## Key Concepts

### Physics Enforcement

| Level | Behavior |
|-------|----------|
| IMPOSSIBLE | Cannot override (sync authority, tick modes) |
| BLOCK | Requires Taste Key approval (budgets, fidelity) |

### Temporal Governor

| Mode | Tick Rate | Authority | Example |
|------|-----------|-----------|---------|
| Discrete | 600ms | Server | Checkout, claims |
| Continuous | 0ms | Client | Dashboard, settings |

### Materials

| Material | Feel | Motion | Zones |
|----------|------|--------|-------|
| Clay | Heavy, deliberate | Spring | Critical |
| Machinery | Efficient, invisible | Instant | Transactional, Admin |
| Glass | Light, magical | Ease | Exploratory, Marketing |

## Scripts

None required for v4. All configuration is YAML-based.
