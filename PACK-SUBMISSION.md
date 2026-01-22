# Sigil Pack Submission

## Pack Details

| Field | Value |
|-------|-------|
| **Name** | sigil |
| **Version** | 4.0.0 |
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
5. **Web3 Flow Patterns** — Specialized handling for blockchain transactions, staking, claiming
6. **Formal Verification** — Optional Anchor/Lens CLI integration for physics compliance
7. **Visual Validation** — Optional browser-based validation via agent-browser integration

## Skills Included (25)

### Core Sigil Skills

| Skill | Command | Description |
|-------|---------|-------------|
| crafting-physics | /craft | Full 3-layer physics generation |
| styling-material | /style | Material physics only |
| animating-motion | /animate | Animation physics only |
| applying-behavior | /behavior | Behavioral physics only |
| validating-physics | /ward | Physics compliance audit |
| surveying-patterns | /garden | Component authority report |
| inscribing-taste | /inscribe | Codify learnings into rules |
| synthesizing-taste | /taste-synthesize | Synthesize patterns from signals |
| distilling-components | /distill | Bridge architecture to physics |
| observing-users | /observe | Capture user behavior insights |
| mounting-sigil | /mount | Install Sigil onto repositories |
| updating-sigil | /update | Update from upstream |

### Extended Skills

| Skill | Command | Description |
|-------|---------|-------------|
| agent-browser | — | Visual validation (optional) |
| blockchain-inspector | — | Inspect blockchain state |
| continuous-learning | — | Autonomous skill extraction |
| run-mode | /run | Autonomous sprint execution |
| discovering-requirements | /plan-and-analyze | PRD discovery |
| designing-architecture | /architect | Software design documents |
| planning-sprints | /sprint-plan | Sprint planning |
| implementing-tasks | /implement | Execute sprint tasks |
| reviewing-code | /review-sprint | Review implementations |
| auditing-security | /audit | Security audits |
| deploying-infrastructure | /deploy-production | Production deployment |
| translating-for-executives | /translate | Executive summaries |
| riding-codebase | /ride | Extract ground truth |

## Rules Included (24)

### Core Physics Rules

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

### React Implementation Rules

| Rule | Description |
|------|-------------|
| react-core | React implementation patterns |
| react-async | Async patterns and waterfalls |
| react-bundle | Bundle optimization |
| react-rendering | Rendering optimization |
| react-rerender | Re-render prevention |
| react-server | Server-side patterns |
| react-js | JavaScript micro-optimizations |

### Specialized Rules

| Rule | Description |
|------|-------------|
| semantic-search | Semantic code search integration |
| sigil-complexity | Complexity detection and handoff protocols |
| sigil-data-physics | Data source selection (indexed vs on-chain) |
| sigil-web3-flows | Web3 transaction flow patterns |
| sigil-ui-copy | UI copy physics and terminology |
| sigil-anchor-lens | Formal verification integration |
| sigil-hud | Diagnostic HUD integration |
| rlm-core-summary | Condensed decision tree for RLM |

## Commands Included (25)

### Sigil Commands

| Command | Description |
|---------|-------------|
| /craft | Generate component with full design physics |
| /style | Apply material physics only |
| /animate | Apply animation physics only |
| /behavior | Apply behavioral physics only |
| /ward | Check for physics violations |
| /ward-all | Check all components for violations |
| /garden | Survey pattern authority |
| /inscribe | Inscribe taste learnings |
| /taste-synthesize | Synthesize taste patterns |
| /distill | Distill tasks into components |
| /observe | Observe user behavior |
| /mount | Mount Sigil onto repository |
| /update | Update from upstream |
| /setup | First-time setup |
| /feedback | Submit feedback |
| /understand | Research before crafting |
| /validate | Validate against physics rules |

### Loa Integration Commands

| Command | Description |
|---------|-------------|
| /plan-and-analyze | PRD discovery |
| /architect | Create SDD |
| /sprint-plan | Create sprint plan |
| /implement | Execute tasks |
| /review-sprint | Review implementation |
| /audit | Security audit |
| /ride | Extract ground truth |
| /run | Autonomous execution |

## Dependencies

- **Required**: Claude Code with skill support
- **Optional**:
  - `anchor` CLI v1.0.0+ (formal verification)
  - `lens` CLI v1.0.0+ (constraint validation)
  - `agent-browser` (visual validation)
  - `ck` (semantic search)

## Compatibility

- Minimum Loa Version: 0.7.0
- Node.js: 20.0.0+
- Claude Code: Any version with skill support

## Installation

Via LOA Constructs Registry (when available):
```bash
loa install sigil
```

Or via curl installer:
```bash
curl -fsSL https://cdn.jsdelivr.net/gh/0xHoneyJar/sigil@v4.0.0/scripts/mount-sigil.sh | bash
```

Or manually:
```bash
git clone https://github.com/0xHoneyJar/sigil.git
cd sigil && ./scripts/mount-sigil.sh
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
│  Implementation:                                       │
│  ✓ async-suspense-boundaries (loading state)           │
│  ✓ rendering-hydration-no-flicker (SSR)                │
│  ✓ rerender-memo (confirmation dialog)                 │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Multi-Component Architecture

Sigil includes additional components distributed separately:

| Component | Distribution | Description |
|-----------|--------------|-------------|
| Construct Pack | LOA Registry | Rules, commands, skills |
| Rust CLIs | `install-cli.sh` | anchor, lens binaries |
| NPM Packages | npm registry | @thehoneyjar/sigil-* |

## Submission Checklist

- [x] manifest.json valid against schema
- [x] All skills have index.yaml and SKILL.md
- [x] All commands have frontmatter with agent routing
- [x] README includes installation instructions
- [x] License file present (MIT)
- [x] Repository is public
- [x] Version follows semver (4.0.0)

## Contact

- Issues: https://github.com/0xHoneyJar/sigil/issues
- Discussions: https://github.com/0xHoneyJar/sigil/discussions
