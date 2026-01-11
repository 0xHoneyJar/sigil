# Sigil v11: Soul Engine

> "You are an apprentice in 2007. You do not know what Ambient Occlusion is."

Sigil is a design craft framework that gives AI agents the physics, constraints, and taste authority needed to generate UI with soul. It is **not** a governance bureaucracy—it is a workshop.

## Philosophy

### Studio OS, Not Sovereign

| Wrong (Bureaucracy) | Right (Workshop) |
|---------------------|------------------|
| Poll everything | Poll concepts only |
| Committees decide visuals | Taste Owner dictates visuals |
| Flag "low quality" as bad | Flag "high fidelity" as bad |
| "Integrity" bypass loophole | 24hr Challenge Period |
| Advisory feedback | Context injection |

### The Three Laws

1. **Fidelity Ceiling**: "Better" is often "worse." Block improvements that exceed the Gold Standard.
2. **Taste Owner Authority**: Visuals and vibe are dictated, never polled.
3. **Poll Concepts, Not Pixels**: Community votes on "should this exist?" not "what color?"

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SIGIL SOUL ENGINE v11                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  AGENTS (8)                                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│  │envisioning │ │codifying   │ │mapping     │ │crafting    │               │
│  │-soul       │ │-materials  │ │-zones      │ │-components │               │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘               │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│  │validating  │ │gardening   │ │approving   │ │greenlighting│              │
│  │-fidelity   │ │-entropy    │ │-patterns   │ │-concepts   │               │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘               │
├─────────────────────────────────────────────────────────────────────────────┤
│  SOUL LAYER                                                                  │
│  Materials │ Zones │ Sync Router │ Context Injector │ Tensions              │
├─────────────────────────────────────────────────────────────────────────────┤
│  KERNEL (Immutable)                                                          │
│  Physics Primitives │ Sync Primitives │ Fidelity Ceiling                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  GOVERNANCE                                                                  │
│  Taste Owner (dictates) │ Greenlight (polls concepts) │ Challenge Period    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## The 8 Agents

| Agent | Role | Command |
|-------|------|---------|
| envisioning-soul | Soul Keeper | `/envision` |
| codifying-materials | Material Smith | `/codify`, `/material` |
| mapping-zones | Zone Architect | `/zone` |
| crafting-components | Apprentice Smith | `/craft` |
| validating-fidelity | Fidelity Guardian | `/validate` |
| gardening-entropy | Gardener | `/garden` |
| approving-patterns | Taste Owner | `/approve` |
| greenlighting-concepts | Pollster | `/greenlight` |

## Quick Start

```bash
# Install
curl -fsSL https://raw.githubusercontent.com/[org]/sigil/main/.claude/scripts/mount-sigil.sh | bash

# Initialize
claude
/setup

# Capture soul
/envision

# Define materials
/codify

# Configure zones
/zone

# Generate with soul
/craft "Create a checkout button"
```

## Zone Model

| Zone | Path | Owner | Permission |
|------|------|-------|------------|
| **Kernel** | `sigil-mark/kernel/` | Framework | IMMUTABLE after lock |
| **Soul** | `sigil-mark/soul/` | Project | Read/Write |
| **Workbench** | `sigil-mark/workbench/` | Project | Read/Write |
| **Governance** | `sigil-mark/governance/` | Taste Owner | Dictate only |

## Key Files

```
sigil-mark/
├── kernel/                    # IMMUTABLE after /codify --lock
│   ├── physics.yaml          # Light, weight, motion, feedback primitives
│   ├── sync.yaml             # CRDT, LWW, Server-Tick definitions
│   └── fidelity-ceiling.yaml # Gold Standard constraints
├── soul/
│   ├── essence.yaml          # Soul statement, invariants
│   ├── materials.yaml        # Material compositions
│   ├── zones.yaml            # Path-based design zones
│   └── tensions.yaml         # Current tension state
├── workbench/
│   ├── paper-cuts.yaml       # Entropy tracking
│   └── fidelity-report.yaml  # Validation results
├── governance/
│   ├── taste-owners.yaml     # Named authorities
│   ├── approvals.yaml        # Sign-off records
│   ├── polls.yaml            # Greenlight polls
│   └── archaeology.yaml      # Rejection history
├── moodboard.md              # References, anti-patterns
└── gold-standard/            # Reference assets for Fidelity Ceiling
```

## The Mod Ghost Rule

When Mod Ghost joined Jagex, he created objectively "better" assets—smoother gradients, higher poly counts. The community rejected them because they didn't look like 2007.

**The Fidelity Ceiling protects the "jank" that constitutes the soul.**

```yaml
# Agent instruction for crafting-components
instruction: |
  You are an apprentice in 2007.
  You do not know what Ambient Occlusion is.
  You cannot generate textures above 64x64.
  If your output looks "better" than the Gold Standard, it is WRONG.
```

## Governance Model

### What Gets Polled (Greenlight)

- "Should we build a Sailing skill?" → 70% threshold
- "Should we add dark mode?" → 70% threshold
- "Lock-in: We built Sailing. Ship it?" → 70% threshold

### What Gets Dictated (Taste Owner)

- Color of the buttons
- Animation timing
- Border radius
- Typography choices
- Any visual or "vibe" decision

### The Challenge Period

Integrity changes auto-deploy but enter a 24hr Challenge Period.

If a Taste Owner flags an "Integrity" change as "Content," it reverts immediately and the deployer loses Trust Score.

## Commands

| Command | Agent | Purpose |
|---------|-------|---------|
| `/setup` | - | Initialize Sigil |
| `/envision` | envisioning-soul | Capture product soul |
| `/codify` | codifying-materials | Define materials |
| `/material` | codifying-materials | Register custom material |
| `/zone` | mapping-zones | Configure zones |
| `/craft` | crafting-components | Generate with injection |
| `/validate` | validating-fidelity | Check Fidelity Ceiling |
| `/garden` | gardening-entropy | Manage paper cuts |
| `/approve` | approving-patterns | Taste Owner sign-off |
| `/greenlight` | greenlighting-concepts | Community polling |

## Integration with Loa

Sigil can coexist with Loa on the same repository:

| Aspect | Loa | Sigil |
|--------|-----|-------|
| State Zone | `loa-grimoire/` | `sigil-mark/` |
| Config | `.loa.config.yaml` | `.sigilrc.yaml` |
| Focus | Product lifecycle | Design craft |
| Agents | 8 (PM, Arch, Eng...) | 8 (Soul, Materials, Craft...) |

When Loa's `/implement` runs, it can optionally load Sigil context:

```yaml
# .loa.config.yaml
integrations:
  sigil:
    enabled: true
    auto_inject: true  # Inject design context during /implement
```

## References

- **OSRS Polling Charter**: Poll concepts, dictate pixels
- **Linear Method**: Taste Owners, not committees
- **Airbnb 2014→2023**: Skeuomorphism returns when it solves problems
- **Teenage Engineering**: Friction as feature
- **Uniswap v4 Hooks**: Extensible primitives

---

*"Quality doesn't come from committees... it comes from individuals with taste."*
— Karri Saarinen, Linear
