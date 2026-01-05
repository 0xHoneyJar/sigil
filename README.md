# Sigil v0.5: Design Physics Engine

Physics constraints for AI-assisted design.

> "Physics, not opinions. Constraints, not debates."

## What is Sigil?

Sigil is a Design Physics Engine that gives AI agents physics constraints for consistent design decisions. It defines **materials** (physics), **zones** (context), and **fidelity constraints** to prevent design drift.

**The Three Laws:**

1. **Physics violations are IMPOSSIBLE** — No override exists for server authority
2. **Budget/fidelity violations are BLOCK** — Taste Key can override
3. **Drift warnings are WARN** — Suggestions only

**Core Concepts:**

| Concept | Description |
|---------|-------------|
| **Temporal Governor** | Discrete (600ms) vs continuous (0ms) tick |
| **Materials** | Physics primitives (clay, machinery, glass) |
| **Zones** | Path-based design context with physics |
| **Fidelity Ceiling** | Maximum allowed complexity (Mod Ghost Rule) |
| **Taste Key** | Human authority for overrides |

## Installation

### Recommended (Verify Before Execute)

```bash
# Download the install script
curl -fsSL https://raw.githubusercontent.com/0xHoneyJar/sigil/main/.claude/scripts/mount-sigil.sh -o mount-sigil.sh

# Review the script (optional but recommended)
less mount-sigil.sh

# Execute
bash mount-sigil.sh
```

### Quick Install (Convenience)

> **Note:** This executes remote code without review. Only use if you trust the source.

```bash
curl -fsSL https://raw.githubusercontent.com/0xHoneyJar/sigil/main/.claude/scripts/mount-sigil.sh | bash
```

## Quick Start

```bash
# 1. Mount Sigil onto your repo
bash mount-sigil.sh

# 2. Start Claude Code
claude

# 3. Initialize and capture soul
/sigil-setup        # Initialize physics schemas
/envision           # Capture product soul (interview)
/codify             # Define materials
/map                # Configure zones

# 4. During development
/craft              # Get design guidance (Hammer/Chisel)
/validate           # Check violations
/approve            # Taste Key sign-off
```

**Time to first `/craft`:** <15 minutes

## Commands (9 total)

| Command | Purpose |
|---------|---------|
| `/sigil-setup` | Initialize v0.5 state zone structure |
| `/envision` | Capture product soul (interview) |
| `/codify` | Define material physics |
| `/map` | Configure zone mappings |
| `/craft` | Generate with physics context (Hammer/Chisel) |
| `/validate` | Check violations (IMPOSSIBLE/BLOCK/WARN) |
| `/approve` | Taste Key rulings and sign-off |
| `/greenlight` | Concept approval (not execution) |
| `/garden` | Manage entropy and drift |

## Materials

Materials define physics, not just styles:

| Material | Light | Weight | Motion | Feedback |
|----------|-------|--------|--------|----------|
| **Clay** | Diffuse | Heavy | Spring (120/14) | Depress |
| **Machinery** | Flat | None | Instant | Highlight |
| **Glass** | Refract | Weightless | Ease (200ms) | Glow |

### Zone Affinity

```yaml
zone_materials:
  critical: clay       # Heavy, deliberate
  transactional: clay  # Reliable, grounded
  exploratory: glass   # Light, fluid
  marketing: glass     # Ethereal, inviting
```

## Zones

Zones determine physics by file path:

| Zone | Material | Sync | Elements |
|------|----------|------|----------|
| Critical | clay | server_authoritative | 5 max |
| Transactional | clay | client_authoritative | 12 max |
| Exploratory | glass | client_authoritative | 20 max |
| Marketing | glass | client_authoritative | 15 max |

Configure in `sigil-mark/resonance/zones.yaml`:

```yaml
zones:
  critical:
    paths:
      - "src/features/checkout/**"
      - "src/features/claim/**"
    material: clay
    sync: server_authoritative
    budgets:
      interactive_elements: 5
      decisions: 2
```

## Three-Tier Violation System

| Tier | Type | Override |
|------|------|----------|
| 1 | **IMPOSSIBLE** (Physics) | NEVER |
| 2 | **BLOCK** (Budget/Fidelity) | Taste Key can override |
| 3 | **WARN** (Drift) | Suggestions only |

### Physics Violations (IMPOSSIBLE)

Cannot be generated. Ever. No override exists.

- Optimistic update in server_authoritative zone
- Bypassing discrete tick in critical zone
- Continuous animation in discrete tick zone
- Missing pending state in server_authoritative zone

### Fidelity Ceiling (Mod Ghost Rule)

```yaml
fidelity_ceiling:
  gradient_stops: 2
  shadow_layers: 3
  animation_duration: 800ms
  blur_radius: 16px
  border_radius: 24px
```

## Hammer/Chisel Toolkit

The `/craft` command uses a diagnostic-first approach:

### Hammer (Diagnosis)

When user reports a problem ("button feels slow"):
1. Load zone physics
2. Analyze complaint
3. Identify root cause
4. Suggest appropriate fix

**Never apply bandaids to physics issues.**

### Chisel (Execution)

After diagnosis:
1. Generate code with physics context
2. Check against constraints
3. Route structural issues to Loa

### Loa Handoff

When a design problem requires structural change:

```
/craft "checkout feels slow"

DIAGNOSIS: Physics conflict detected.

The claim button is in critical zone (server_authoritative).
Physics requires pending state and discrete tick (600ms).

This is NOT a design problem. This is architecture.

Handoff to Loa:
/consult "Evaluate if checkout should remain server_authoritative"
```

## Directory Structure

```
your-repo/
├── .claude/
│   ├── commands/           # Symlinked commands (9)
│   ├── skills/             # Symlinked skills (9)
│   └── scripts/            # Utility scripts
├── sigil-mark/             # Your design context
│   ├── core/               # Physics (immutable after lock)
│   │   ├── sync.yaml       # Temporal Governor
│   │   ├── budgets.yaml    # Budget limits
│   │   ├── fidelity.yaml   # Fidelity Ceiling
│   │   └── lens.yaml       # Rendering layers
│   ├── resonance/          # Tuning (product-specific)
│   │   ├── materials.yaml  # Material definitions
│   │   ├── zones.yaml      # Zone mappings
│   │   ├── tensions.yaml   # 4-axis tuning
│   │   └── essence.yaml    # Soul statement
│   ├── memory/             # History
│   │   ├── eras/           # Era snapshots
│   │   ├── decisions/      # Greenlight records
│   │   ├── mutations/      # Active changes
│   │   └── graveyard/      # Archived items
│   └── taste-key/          # Authority
│       ├── holder.yaml     # Current Taste Key holder
│       └── rulings/        # Override records
├── .sigilrc.yaml           # Configuration
├── .sigil-version.json     # Version tracking
└── .sigil-setup-complete   # Setup marker
```

## Workflow

### New Project

```
/sigil-setup → /envision → /codify → /map → /craft → /validate → /approve
```

### During Development

```
/craft → (code) → /validate → /approve
```

### Maintenance

```
/garden → Review entropy → /approve --revoke obsolete rulings
```

## Taste Key Authority

### CAN Override

- Budgets (element count, animation count)
- Fidelity (gradient stops, shadow layers)
- Taste (colors, typography, spacing)

### CANNOT Override

- Physics (sync authority, tick modes)
- Security (auth, validation)
- Accessibility (contrast, keyboard nav)

## Philosophy

Sigil provides physics, not opinions.

- **Physics are immutable** — No escape hatch for server_authoritative violations
- **Taste is overridable** — Taste Key can create rulings
- **Concepts are greenlit** — "Should we build?" is separate from "How should it look?"
- **Entropy is managed** — Gardens need tending

## Requirements

- Git
- Claude Code CLI
- jq (optional, for better JSON handling)

## Version

v0.5.0 (Design Physics Engine)

## Version History

| Version | Codename | Description |
|---------|----------|-------------|
| v0.3.x | Constitutional Design Framework | Four pillars, progressive strictness |
| v0.4.x | Soul Engine | npm package, React hooks, workbench |
| v0.5.0 | Design Physics Engine | Simplified architecture, physics focus |

## License

MIT
