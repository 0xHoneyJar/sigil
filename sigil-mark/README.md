# Sigil v1.2.4 - Design Physics Framework

> "See the diff. Feel the result. Learn by doing."

## Quick Start

```bash
# 1. Setup Sigil
/setup

# 2. Generate a component
/craft "checkout button" src/checkout/

# 3. Experiment with physics
/sandbox src/checkout/Experiment.tsx

# 4. Extract to recipe
/codify src/checkout/Experiment.tsx --name ButtonSnappy
```

## Commands

| Command | Purpose |
|---------|---------|
| `/craft` | Generate component using zone recipe |
| `/sandbox` | Enable raw physics for experimentation |
| `/codify` | Extract physics from sandbox to recipe |
| `/inherit` | Scan existing codebase for patterns |
| `/validate` | Check recipe compliance |
| `/garden` | Health report (coverage, sandboxes) |

## Directory Structure

```
sigil-mark/
├── recipes/           # Physics implementations
│   ├── decisive/      # Checkout, transactions (heavy feel)
│   ├── machinery/     # Admin, utilities (efficient)
│   └── glass/         # Marketing, exploration (delightful)
├── hooks/             # Shared React hooks
│   └── useServerTick.ts
├── core/              # Zone resolver, history
├── workbench/         # A/B toggle utilities
├── eslint-plugin/     # ESLint rules
├── eslint/            # ESLint documentation
├── history/           # Refinement logs
└── reports/           # Garden reports
```

## Recipe Sets

### Decisive
- **Physics:** `spring(180, 12)`, whileTap scale 0.98
- **Feel:** Heavy, deliberate, trustworthy
- **Use for:** Checkout, transactions, critical actions

### Machinery
- **Physics:** `spring(400, 30)` or instant
- **Feel:** Efficient, instant, no-nonsense
- **Use for:** Admin panels, settings, utilities

### Glass
- **Physics:** `spring(200, 20)`, float on hover
- **Feel:** Light, delightful, polished
- **Use for:** Marketing pages, landing pages

## Zone Configuration

Create `.sigilrc.yaml` in directories to set zone:

```yaml
# src/checkout/.sigilrc.yaml
sigil: "1.2.4"
recipes: decisive
sync: server_authoritative

constraints:
  optimistic_ui: forbidden
```

## Three Laws

| Level | Meaning |
|-------|---------|
| **IMPOSSIBLE** | Cannot be overridden (breaks trust) |
| **BLOCK** | Requires sandbox mode |
| **WARN** | Advisory only |

## Workbench

```bash
./.claude/scripts/sigil-workbench.sh
```

3-pane tmux environment:
- **Left:** Physics diff + A/B toggle
- **Right:** Browser (via Chrome MCP)
- **Bottom:** Claude Code

Press **Space** to toggle A/B comparison.

## ESLint Integration

```bash
npm install ./sigil-mark/eslint-plugin --save-dev
```

```js
// eslint.config.js
import sigil from 'eslint-plugin-sigil';
export default [sigil.configs.recommended];
```

## Philosophy

Sigil teaches through experience, not lectures:

1. **See the diff**: `spring(180, 12) → spring(300, 8)`
2. **Feel the result**: Click the component
3. **Compare A/B**: Toggle to understand difference
4. **Build intuition**: Numbers gain meaning through fingers

## Migration from v1.0

1. Archive v1.0: `mv sigil-mark sigil-mark-v1`
2. Run `/setup` to create v1.2.4 structure
3. Run `/inherit` to scan existing patterns
4. Migrate components to use recipes

## Clean Removal

```bash
rm -rf sigil-mark/ .sigilrc.yaml .sigil-version.json
```

No daemons. No database. No hooks. Just files.
