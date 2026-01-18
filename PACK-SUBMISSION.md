# Sigil Pack Submission

## Pack Details

| Field | Value |
|-------|-------|
| **Name** | sigil |
| **Version** | 2.1.0 |
| **Author** | THJ Team |
| **License** | MIT |
| **Repository** | https://github.com/0xHoneyJar/sigil |
| **Homepage** | https://sigil.design |

## Description

Design physics framework for AI-generated UI components. Sigil teaches Claude how to generate UI with correct feel through three-layer physics: Behavioral + Animation + Material = Feel.

## What It Does

Sigil detects the **effect** of an action (financial, destructive, standard, local) and applies the correct **physics** automatically:

- **Behavioral Physics**: Sync strategy, timing, confirmation patterns
- **Animation Physics**: Easing, springs, frequency-based optimization
- **Material Physics**: Surface, shadow, typography constraints

The framework also accumulates **taste** from usage — when users modify generated code, Sigil learns their preferences and applies them in future generations.

## Key Features

1. **Effect Detection** — Automatically detects financial, destructive, soft-delete, standard, and local state effects from keywords and types
2. **Three-Layer Physics** — Unified approach to behavioral, animation, and material design
3. **Taste Accumulation** — Learns user preferences from usage without configuration
4. **Protected Capabilities** — Enforces non-negotiable UX patterns (cancel visibility, error recovery, touch targets)
5. **Visual Validation** — Optional browser-based validation via agent-browser integration

## Skills Included

| Skill | Command | Description |
|-------|---------|-------------|
| crafting-physics | /craft | Full 3-layer physics generation |
| styling-material | /style | Material physics only |
| animating-motion | /animate | Animation physics only |
| applying-behavior | /behavior | Behavioral physics only |
| validating-physics | /ward | Physics compliance audit |
| surveying-patterns | /garden | Component authority report |
| inscribing-taste | /inscribe | Codify learnings into rules |
| distilling-components | /distill | Bridge architecture to physics |
| mounting-sigil | /mount | Install Sigil onto repositories |
| updating-sigil | /update | Update from upstream |
| agent-browser | — | Visual validation (optional) |

## Rules Included

| Rule | Description |
|------|-------------|
| sigil-core | Core physics principles and action defaults |
| sigil-physics | Behavioral physics - sync, timing, confirmation |
| sigil-detection | Effect detection from keywords and types |
| sigil-patterns | Golden pattern implementations |
| sigil-protected | Non-negotiable protected capabilities |
| sigil-animation | Animation physics - easing, springs, frequency |
| sigil-taste | Taste accumulation system |
| sigil-material | Material physics - surface, fidelity, grit |
| sigil-lexicon | Keyword and adjective lookup tables |
| react-core | React implementation patterns |
| react-async | Async patterns and waterfalls |
| react-bundle | Bundle optimization |
| react-rendering | Rendering optimization |
| react-rerender | Re-render prevention |
| react-server | Server-side patterns |
| react-js | JavaScript micro-optimizations |
| semantic-search | Semantic code search integration |

## Dependencies

- **Required**: Claude Code
- **Optional**: agent-browser (for visual validation)
- **Integrations**: ck (semantic search)

## Compatibility

- Minimum Loa Version: 1.0.0
- Claude Code: Any version with skill support

## Installation

```bash
loa install sigil
```

Or manually:

```bash
curl -fsSL https://sigil.dev/install | bash
```

## Usage Example

```
/craft "claim button"

┌─ Physics Analysis ─────────────────────────────────────┐
│                                                        │
│  Component:    ClaimButton                             │
│  Effect:       Financial mutation                      │
│                                                        │
│  Behavioral    pessimistic, 800ms, confirmation        │
│  Animation     ease-out, deliberate                    │
│  Material      elevated, soft shadow, 8px radius       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Submission Checklist

- [x] manifest.json valid against schema
- [x] All skills have index.yaml and SKILL.md
- [x] All commands have frontmatter with agent routing
- [x] README includes installation instructions
- [x] License file present (MIT)
- [x] Repository is public
- [x] Version follows semver

## Contact

- Issues: https://github.com/0xHoneyJar/sigil/issues
- Discussions: https://github.com/0xHoneyJar/sigil/discussions
