# Sigil v11 Soul Engine

Constitutional Design Framework for AI-assisted development.

> "Culture is the Reality. Code is Just the Medium."

## What is Sigil?

Sigil v11 is a Soul Engine that captures product soul and makes it available to AI agents during code generation. It defines **materials** (physics), **zones** (context), and **fidelity constraints** to ensure consistent design decisions.

**The Three Laws:**

1. **Server-tick data MUST show pending state** — Never optimistic for money/inventory/trades
2. **Fidelity ceiling cannot be exceeded** — "Better" is often "worse"
3. **Visuals are dictated, never polled** — Taste Owner decides pixels

**Core Concepts:**

| Concept | Description |
|---------|-------------|
| **Materials** | Physics primitives (glass, clay, machinery) |
| **Zones** | Path-based design context |
| **Fidelity Ceiling** | Maximum allowed complexity |
| **Sync Strategies** | Data synchronization rules |
| **Governance** | Taste Owner + Pollster model |

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

### Alternative: Clone and Mount

```bash
git clone https://github.com/0xHoneyJar/sigil.git ~/.sigil/sigil
~/.sigil/sigil/.claude/scripts/mount-sigil.sh
```

### Quick Install (Convenience)

> **Note:** This executes remote code without review. Only use if you trust the source.

```bash
curl -fsSL https://raw.githubusercontent.com/0xHoneyJar/sigil/main/.claude/scripts/mount-sigil.sh | bash
```

## Quick Start

```bash
# 1. Mount Sigil onto your repo (see Installation above)
bash mount-sigil.sh

# 2. Start Claude Code
claude

# 3. Initialize and capture soul
/setup              # Initialize Sigil
/envision           # Capture product soul (interview)
/codify             # Define materials, lock kernel
/sync               # Generate CLAUDE.md

# 4. During development
/craft              # Get design guidance
/validate           # Check fidelity ceiling
/approve            # Taste Owner sign-off
```

**Time to first `/craft`:** <30 minutes

## Commands

### Core Commands

| Command | Purpose |
|---------|---------|
| `/setup` | Initialize Sigil on a repo |
| `/envision` | Capture product soul (interview) |
| `/codify` | Define materials, lock kernel |
| `/zone` | Configure path-based zones |
| `/sync` | Generate CLAUDE.md |
| `/craft` | Get design guidance |
| `/validate` | Check fidelity ceiling |
| `/garden` | Track paper cuts (3:1 ratio) |

### Governance Commands

| Command | Purpose |
|---------|---------|
| `/approve` | Taste Owner visual approval |
| `/greenlight` | Community concept polling |
| `/prove` | Register feature for proving |

### Migration Commands

| Command | Purpose |
|---------|---------|
| `/inherit` | Bootstrap from existing codebase |
| `/mount` | Install Sigil framework |
| `/update` | Pull framework updates |

See [docs/COMMANDS.md](docs/COMMANDS.md) for complete reference.

## Materials

Materials define physics, not just styles:

| Material | Description | Use Cases |
|----------|-------------|-----------|
| **Glass** | Light, translucent, refractive | Overlays, modals, nav |
| **Clay** | Warm, tactile, weighted | Buttons, cards, forms |
| **Machinery** | Instant, precise, zero-latency | Admin, dashboards, CLI |

Each material has:
- **Primitives** (light, weight, motion, feedback)
- **CSS Variables** (for implementation)
- **Forbidden Patterns** (what violates the material)

## Zones

Zones determine material, sync, and motion by file path:

| Zone | Material | Sync | Motion |
|------|----------|------|--------|
| Critical | clay | server_tick | deliberate |
| Transactional | machinery | lww | instant |
| Exploratory | glass | lww | flowing |
| Marketing | clay | local_only | expressive |
| Celebration | clay | server_tick | triumphant |

Configure in `sigil-mark/soul/zones.yaml`:

```yaml
zones:
  critical:
    paths:
      - "src/features/checkout/**"
      - "src/features/trade/**"
    material: "clay"
    sync: "server_tick"
```

## Fidelity Ceiling

"Better" is often "worse." The Mod Ghost Rule protects the soul.

**Constraints:**
- Max gradient stops: 2
- Max shadow layers: 3
- Max animation duration: 800ms
- Max border radius: 16px

**Forbidden Techniques:**
- Mesh gradients
- 3D transforms
- Particle systems
- Bounce/elastic easing

## Directory Structure

```
your-repo/
├── .claude/
│   ├── commands/           # Symlinked commands
│   ├── skills/             # Symlinked skills
│   └── scripts/            # Utility scripts
├── sigil-mark/             # Your design context
│   ├── kernel/             # IMMUTABLE after lock
│   │   ├── physics.yaml    # Physics primitives
│   │   ├── sync.yaml       # Sync strategies
│   │   └── fidelity-ceiling.yaml
│   ├── soul/               # Product soul
│   │   ├── essence.yaml    # Soul statement
│   │   ├── materials.yaml  # Material definitions
│   │   ├── zones.yaml      # Zone mappings
│   │   └── tensions.yaml   # Tension sliders
│   ├── workbench/          # Active work
│   │   ├── fidelity-report.yaml
│   │   └── paper-cuts.yaml
│   └── governance/         # Approvals and polls
│       ├── taste-owners.yaml
│       ├── approvals.yaml
│       └── greenlight.yaml
├── .sigilrc.yaml           # Zone configuration
├── .sigil-version.json     # Version tracking
├── .sigil-setup-complete   # Setup marker
└── CLAUDE.md               # Generated design context
```

## Workflow

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

## Governance Model

Sigil v11 introduces a dual governance model:

| Role | Scope | Authority |
|------|-------|-----------|
| **Taste Owner** | Visuals | Dictates (not polls) |
| **Pollster** | Concepts | Polls community |

**Taste Owner** approves:
- Color palettes
- Typography choices
- Animation timing
- Component layouts

**Pollster** polls:
- New features
- Major UX changes
- Breaking changes
- High-stakes decisions

## HUD Overlay

The `@sigil/hud` package provides development-only UI:

```tsx
import { SigilHUD } from '@sigil/hud';

function App() {
  return (
    <>
      <YourApp />
      <SigilHUD position="bottom-right" />
    </>
  );
}
```

**Features:**
- Tension sliders (<16ms RAF updates)
- Material picker
- Fidelity status
- Zero production footprint

## Philosophy

Sigil enables craft, it doesn't police it.

- **Right path easy** — Clear rules, zone context, pattern suggestions
- **Wrong path visible** — Warnings on rejected patterns, not blocks
- **Escape hatches exist** — Human can always override
- **Humans accountable** — Approval is human, not automated

## Requirements

- Git
- Claude Code CLI
- Node.js >= 18 (for HUD package)
- jq (optional, for better JSON handling)

## Version

v11.0.0 (Soul Engine)

See [docs/MIGRATION.md](docs/MIGRATION.md) for migration from v0.4.

## License

MIT
