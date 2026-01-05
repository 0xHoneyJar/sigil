# Sigil

[![Version](https://img.shields.io/badge/version-0.5.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> *"Physics, not opinions. Constraints, not debates."*

Design Physics Engine for AI-assisted development. Gives AI agents physics constraints for consistent design decisions—materials, zones, fidelity ceilings, and human authority.

## Quick Start

### Mount onto Existing Repository (Recommended)

```bash
# One-liner install
curl -fsSL https://raw.githubusercontent.com/0xHoneyJar/sigil/main/.claude/scripts/mount-sigil.sh | bash

# Start Claude Code
claude

# Initialize and capture soul
/sigil-setup
/envision
```

### Clone and Mount

```bash
git clone https://github.com/0xHoneyJar/sigil.git ~/.sigil/sigil
~/.sigil/sigil/.claude/scripts/mount-sigil.sh
```

## Architecture: State Zone Model

Sigil uses a **state zone** architecture for design context:

| Zone | Path | Purpose |
|------|------|---------|
| **Core** | `sigil-mark/core/` | Physics (immutable after lock) |
| **Resonance** | `sigil-mark/resonance/` | Product tuning (materials, zones, tensions) |
| **Memory** | `sigil-mark/memory/` | History (eras, decisions, mutations) |
| **Taste Key** | `sigil-mark/taste-key/` | Human authority (holder, rulings) |

**Key principle**: Physics violations are IMPOSSIBLE. Budget/fidelity violations are BLOCK (Taste Key can override). Drift is WARN (suggestions only).

## The Workflow

| Phase | Command | Agent | Output |
|-------|---------|-------|--------|
| 0 | `/sigil-setup` | initializing-sigil | State zone structure |
| 1 | `/envision` | envisioning-soul | `resonance/essence.yaml` |
| 2 | `/codify` | codifying-materials | `resonance/materials.yaml` |
| 3 | `/map` | mapping-zones | `resonance/zones.yaml` |
| 4 | `/craft` | crafting-components | Design guidance (Hammer/Chisel) |
| 5 | `/validate` | validating-fidelity | Violation report |
| 6 | `/approve` | approving-patterns | Taste Key rulings |
| 7 | `/greenlight` | greenlighting-concepts | Concept approval |
| 8 | `/garden` | gardening-entropy | Entropy management |

## The Three Laws

1. **Physics violations are IMPOSSIBLE** — No override for server authority, tick modes
2. **Budget/fidelity violations are BLOCK** — Taste Key can create rulings to override
3. **Drift warnings are WARN** — Suggestions only, human decides

## Materials

Materials define physics, not just styles:

| Material | Light | Weight | Motion | Feedback | Zone Affinity |
|----------|-------|--------|--------|----------|---------------|
| **Clay** | Diffuse | Heavy | Spring (120/14) | Depress | Critical, Transactional |
| **Machinery** | Flat | None | Instant | Highlight | Admin |
| **Glass** | Refract | Weightless | Ease (200ms) | Glow | Exploratory, Marketing |

## Zones

Zones determine physics by file path:

| Zone | Material | Sync | Elements | Decisions |
|------|----------|------|----------|-----------|
| Critical | clay | server_authoritative | 5 max | 2 max |
| Transactional | clay | client_authoritative | 12 max | 5 max |
| Exploratory | glass | client_authoritative | 20 max | 10 max |
| Marketing | glass | client_authoritative | 15 max | 8 max |

## Hammer/Chisel Toolkit

The `/craft` command uses a diagnostic-first approach:

**Hammer** (Diagnosis): Load zone physics → Analyze complaint → Identify root cause → Suggest fix

**Chisel** (Execution): Generate with context → Check constraints → Route structural issues to Loa

```
/craft "checkout feels slow"

DIAGNOSIS: Physics conflict detected.
The claim button is in critical zone (server_authoritative).
Physics requires pending state and discrete tick (600ms).

This is NOT a design problem. This is architecture.

Handoff to Loa:
/consult "Evaluate if checkout should remain server_authoritative"
```

## Repository Structure

```
.claude/                        # System Zone (framework-managed)
├── skills/                     # 9 agent skills
├── commands/                   # 9 slash commands
└── scripts/                    # Helper scripts
    └── mount-sigil.sh          # One-command install

sigil-mark/                     # State Zone (design context)
├── core/                       # Physics (immutable)
│   ├── sync.yaml               # Temporal Governor
│   ├── budgets.yaml            # Cognitive/visual limits
│   ├── fidelity.yaml           # Fidelity Ceiling
│   └── lens.yaml               # Rendering layers
├── resonance/                  # Tuning (product-specific)
│   ├── materials.yaml          # Material definitions
│   ├── zones.yaml              # Zone mappings
│   ├── tensions.yaml           # 4-axis tuning
│   └── essence.yaml            # Soul statement
├── memory/                     # History
│   ├── eras/                   # Era snapshots
│   ├── decisions/              # Greenlight records
│   ├── mutations/active/       # Active changes
│   └── graveyard/              # Archived items
└── taste-key/                  # Authority
    ├── holder.yaml             # Current Taste Key holder
    └── rulings/                # Override records

.sigilrc.yaml                   # Configuration
.sigil-version.json             # Version manifest
.sigil-setup-complete           # Setup marker
```

## Configuration

`.sigilrc.yaml` is user-owned:

```yaml
version: "0.5"

component_paths:
  - "components/"
  - "src/components/"

zones:
  critical:
    paths: ["src/features/checkout/**", "src/features/claim/**"]
    material: clay
    sync: server_authoritative

taste_key:
  holder:
    name: "Design Lead"
    email: "lead@example.com"

physics:
  enforcement: "physics"  # IMPOSSIBLE/BLOCK/WARN
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

## Coexistence with Loa

Sigil and Loa coexist with different responsibilities:

| Aspect | Sigil | Loa |
|--------|-------|-----|
| Domain | Design physics | Product architecture |
| State zone | `sigil-mark/` | `loa-grimoire/` |
| Handoff | Physics issues → Loa | Structural decisions |

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - Agent instructions
- **[CHANGELOG.md](CHANGELOG.md)** - Version history

## Why "Sigil"?

A sigil is a symbolic representation of intent—a mark that carries meaning beyond its form. Sigil captures your product's design intent and makes it available to AI agents, ensuring every generated component carries the same soul.

## Requirements

- Git
- Claude Code CLI
- jq (optional, for better JSON handling)

## Version History

| Version | Codename | Description |
|---------|----------|-------------|
| v0.3.x | Constitutional Design Framework | Four pillars, progressive strictness |
| v0.4.x | Soul Engine | npm package, React hooks, workbench |
| v0.5.0 | Design Physics Engine | Simplified architecture, physics focus |

## License

[MIT](LICENSE)

## Links

- [Claude Code](https://claude.ai/code)
- [Repository](https://github.com/0xHoneyJar/sigil)
- [Issues](https://github.com/0xHoneyJar/sigil/issues)
