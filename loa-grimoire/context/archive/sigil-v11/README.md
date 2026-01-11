# Sigil v11: Soul Engine

> "You are an apprentice in 2007. You do not know what Ambient Occlusion is."

Design craft framework for AI agents. 8 agents, physics-based materials, context injection.

## Philosophy

**Studio OS, not Sovereign.**

| Wrong (Bureaucracy) | Right (Workshop) |
|---------------------|------------------|
| Poll everything | Poll concepts only |
| Committees decide visuals | Taste Owner dictates visuals |
| Flag "low quality" as bad | Flag "high fidelity" as bad |
| Advisory feedback | Context injection |
| 26 commands | 10 commands |

### The Three Laws

1. **Fidelity Ceiling**: "Better" is often "worse." Block improvements that exceed the Gold Standard.
2. **Taste Owner Authority**: Visuals and vibe are dictated, never polled.
3. **Poll Concepts, Not Pixels**: Community votes on "should this exist?" not "what color?"

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

# Generate with soul
/craft "Create a checkout button"
```

## The 8 Agents

| # | Agent | Role | Command |
|---|-------|------|---------|
| 1 | envisioning-soul | Soul Keeper | `/envision` |
| 2 | codifying-materials | Material Smith | `/codify`, `/material` |
| 3 | mapping-zones | Zone Architect | `/zone` |
| 4 | crafting-components | Apprentice Smith | `/craft` |
| 5 | validating-fidelity | Fidelity Guardian | `/validate` |
| 6 | gardening-entropy | Gardener | `/garden` |
| 7 | approving-patterns | Taste Owner | `/approve` |
| 8 | greenlighting-concepts | Pollster | `/greenlight` |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SIGIL SOUL ENGINE v11                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  AGENTS (8)                                                                  │
│  envisioning │ codifying │ mapping │ crafting                               │
│  validating  │ gardening │ approving │ greenlighting                        │
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

## Materials

Three built-in materials compose physics primitives:

### Glass
Light, translucent, refractive. VisionOS, iOS.
```
Light: refract │ Weight: weightless │ Motion: ease │ Feedback: glow
```

### Clay
Warm, tactile, weighted. Airbnb, Nintendo, OSRS.
```
Light: diffuse │ Weight: heavy │ Motion: spring │ Feedback: lift, depress
```

### Machinery
Instant, precise, zero-latency. Linear, Terminal.
```
Light: flat │ Weight: none │ Motion: instant │ Feedback: highlight
```

## Sync Strategies

| Strategy | Use Case | UI Behavior |
|----------|----------|-------------|
| **server_tick** | Money, trades, inventory | NEVER optimistic, show pending |
| **crdt** | Documents, chat, comments | Optimistic, show presence |
| **lww** | Preferences, toggles, positions | Instant local, background sync |
| **local_only** | Modals, dropdowns, hover | No sync needed |

## Zones

Path-based design contexts:

| Zone | Material | Sync | When |
|------|----------|------|------|
| **critical** | clay | server_tick | Checkout, trade, claim |
| **transactional** | machinery | lww | Admin, settings, dashboard |
| **exploratory** | glass | lww | Browse, search, discover |
| **marketing** | clay | local_only | Landing, home |

## The Mod Ghost Rule

When Mod Ghost joined Jagex, he created objectively "better" assets. The community rejected them because they didn't look like 2007.

**The Fidelity Ceiling protects the "jank" that constitutes the soul.**

```yaml
agent_instruction: |
  You are an apprentice in 2007.
  You do not know what Ambient Occlusion is.
  If your output looks "better" than the Gold Standard, it is WRONG.
```

## Governance

### What Gets Polled (70% threshold)
- "Should we build feature X?"
- "Should we ship feature X?"

### What Gets Dictated (Taste Owner)
- Colors, fonts, animation timing
- Border radius, spacing, shadows
- Any visual or "vibe" decision

### The Green Pixel Incident

OSRS players once rioted over a single green pixel. This is why visuals are NEVER polled.

**Taste Owners absorb the neuroticism so the product can ship.**

## File Structure

```
sigil-mark/
├── kernel/                    # IMMUTABLE after lock
│   ├── physics.yaml          # Light, weight, motion, feedback
│   ├── sync.yaml             # CRDT, LWW, Server-Tick
│   └── fidelity-ceiling.yaml # Gold Standard constraints
├── soul/
│   ├── essence.yaml          # Soul statement, invariants
│   ├── materials.yaml        # Material compositions
│   ├── zones.yaml            # Path-based zones
│   └── tensions.yaml         # Current tension state
├── workbench/
│   └── paper-cuts.yaml       # Entropy tracking
├── governance/
│   ├── taste-owners.yaml     # Named authorities
│   └── greenlight.yaml       # Poll records
└── moodboard.md              # Human-readable reference
```

## Integration with Loa

Sigil coexists with Loa:

| Aspect | Loa | Sigil |
|--------|-----|-------|
| Focus | Product lifecycle | Design craft |
| State | loa-grimoire/ | sigil-mark/ |
| Agents | 8 (PM, Arch, Eng...) | 8 (Soul, Materials...) |

```yaml
# .loa.config.yaml
integrations:
  sigil:
    enabled: true
    auto_inject: true  # Inject design context during /implement
```

## Commands

| Command | Purpose |
|---------|---------|
| `/setup` | Initialize Sigil |
| `/envision` | Capture product soul |
| `/codify` | Define materials and physics |
| `/material` | Register custom material |
| `/zone` | Configure design zones |
| `/craft` | Generate with context injection |
| `/validate` | Check Fidelity Ceiling |
| `/garden` | Manage paper cuts (3:1 rule) |
| `/approve` | Taste Owner sign-off |
| `/greenlight` | Community polling for concepts |

## License

AGPL-3.0

---

*"Quality doesn't come from committees... it comes from individuals with taste."*
— Karri Saarinen, Linear
