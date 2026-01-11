# Sigil v1.2.4

> "See the diff. Feel the result. Learn by doing."

Sigil is a design physics framework for building consistent, craft-driven interfaces with Claude Code.

## Aesthetic

**Adhesion** — The brand typeface, bundled in `assets/fonts/`.

- Colors: `#000000` background, `#FFFFFF` text
- No gradients. No shadows. Sharp edges convey precision.

## Philosophy

**Apprenticeship through Diff + Feel**

Design engineers learn spring physics by:
1. Claude adjusts → You see `stiffness: 180 → 300`
2. You click the component → You FEEL the snap
3. You toggle A/B → You FEEL the difference
4. Numbers gain meaning through your fingers

## Quick Start

```bash
# Install
curl -fsSL https://raw.githubusercontent.com/zksoju/sigil/main/.claude/scripts/mount-sigil.sh | bash

# Start Claude Code
claude

# Generate a component
/craft "confirmation button for checkout"

# Open the workbench (optional)
sigil workbench
```

## Core Concepts

### Recipes

Pre-validated physics implementations. Using a recipe guarantees compliance.

```tsx
import { Button } from '@sigil/recipes/decisive';

<Button onAction={confirm} variant="primary">
  Confirm Purchase
</Button>
```

### Zones

Directories with `.sigilrc.yaml` configuration. The folder IS the zone.

```
src/
├── checkout/
│   └── .sigilrc.yaml    # recipes: decisive
├── admin/
│   └── .sigilrc.yaml    # recipes: machinery
└── marketing/
    └── .sigilrc.yaml    # recipes: glass
```

### Recipe Sets

| Set | Feel | Use Case |
|-----|------|----------|
| `decisive` | Heavy, deliberate | Checkout, transactions |
| `machinery` | Instant, efficient | Admin, dashboards |
| `glass` | Delightful, polished | Marketing, landing |

### Workbench

Learning environment with diff + browser side by side.

```
┌─────────────────────────────────────────────────────────────┐
│ DIFF                    │  BROWSER                         │
│ - stiffness: 180        │  [Confirm Purchase]              │
│ + stiffness: 300        │  ← click to test                 │
│                         │                                  │
│ [A] Before  [B] After   │  Toggle A/B to feel difference   │
├─────────────────────────┴──────────────────────────────────┤
│ CLAUDE CODE                                                │
│ > More Nintendo Switch                                     │
│ Adjusted: spring(180, 12) → spring(300, 8)                 │
└────────────────────────────────────────────────────────────┘
```

## Commands

| Command | Purpose |
|---------|---------|
| `/craft` | Generate component using recipes |
| `/sandbox` | Enable exploration (raw physics allowed) |
| `/codify` | Extract physics to recipe |
| `/inherit` | Bootstrap from existing codebase |
| `/validate` | Check compliance |
| `/garden` | Health report |

## PR-Native Refinement

Feedback flows from Vercel/GitHub comments directly to adjustments:

```
Designer comments: "More Nintendo Switch"
     ↓
Claude commits: spring(180, 12) → spring(300, 8)
     ↓
Engineer sees diff, learns the delta
```

## File Structure

```
project/
├── CLAUDE.md              # Sigil prompt for Claude
├── .sigilrc.yaml          # Root config
├── sigil-mark/
│   └── recipes/
│       ├── decisive/      # spring(180, 12)
│       ├── machinery/     # instant
│       └── glass/         # spring(200, 20)
└── src/
    └── [zones]/
        └── .sigilrc.yaml  # Zone config
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - Full architectural overview
- [CLAUDE.md](CLAUDE.md) - Claude CLI prompt

## License

MIT
