# Sigil v1.2.4: Architectural Overview

> "See the diff. Feel the result. Learn by doing."

**Version**: 1.2.4  
**Date**: 2026-01-05

---

## Executive Summary

Sigil is a design physics framework that enables consistent, craft-driven interface development through:

1. **Recipes** — Pre-validated physics implementations that guarantee compliance
2. **Zones** — Directory-based configuration (folder = zone)
3. **Workbench** — Learning environment where diff + browser enable embodied knowledge
4. **PR-Native Refinement** — Async feedback workflow without CLI context switches

### Core Insight

Design engineers learn physics through **diff + feel**, not lectures:
- See `stiffness: 180 → 300` in the diff
- Click the component, FEEL the snap
- Toggle A/B, FEEL the difference
- Numbers gain meaning through fingers

---

## Philosophy

### Apprenticeship Over Lecture

| Approach | Method | Learning Speed |
|----------|--------|----------------|
| Lecture | Read explanation, then apply | Slow |
| Diff Only | See code change | Fast but shallow |
| **Diff + Feel** | See change + feel result | Fast and deep |

Blacksmiths don't read about hammer technique. They watch, then do, then FEEL the metal respond.

### Claude's Training IS the Vibe Map

No `vibes.yaml` dictionary. Claude's training data contains:
- What "Nintendo Switch snap" feels like
- What "Linear's deliberate feel" looks like
- What "anxious" means for THIS component in THIS context

Same word, different physics based on context:
- Toast "anxious" = appears too fast → add delay
- Button "anxious" = feels shaky → more deliberate
- Spinner "anxious" = too urgent → slow down

### Recipes Over Raw Physics

Engineers import recipes, not spring values:
```tsx
// Good: Uses recipe
import { Button } from '@sigil/recipes/decisive';

// Bad: Raw physics (blocked outside sandbox)
<motion.div transition={{ stiffness: 180 }} />
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              SIGIL                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │   RECIPES   │    │    ZONES    │    │  WORKBENCH  │                 │
│  │             │    │             │    │             │                 │
│  │ Physics in  │    │ Folder =    │    │ Diff + Feel │                 │
│  │ code form   │    │ Zone        │    │ A/B toggle  │                 │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                 │
│         │                  │                  │                         │
│         └────────────┬─────┴──────────────────┘                         │
│                      │                                                  │
│              ┌───────▼───────┐                                          │
│              │    CLAUDE     │                                          │
│              │               │                                          │
│              │ Context       │                                          │
│              │ Injection     │                                          │
│              └───────┬───────┘                                          │
│                      │                                                  │
│         ┌────────────┼────────────┐                                     │
│         ▼            ▼            ▼                                     │
│    ┌─────────┐  ┌─────────┐  ┌─────────┐                               │
│    │ /craft  │  │ /refine │  │ /garden │                               │
│    └─────────┘  └─────────┘  └─────────┘                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Branding: Adhesion

Sigil's visual identity uses the Adhesion typeface (bundled).

### Typography

- **Display:** Adhesion (`assets/fonts/Adhesion-Regular.otf`)
- **Mono:** JetBrains Mono / Fira Code
- **Fallback:** System monospace for terminal

### Colors

| Token | Value | Use |
|-------|-------|-----|
| `bg` | `#000000` | Background |
| `fg` | `#FFFFFF` | Primary text |
| `muted` | `#666666` | Secondary |
| `border` | `#333333` | Dividers |

### Principles

- No gradients
- No shadows  
- No rounded corners (terminal)
- Sharp edges convey precision
- Dense information display

See [BRANDING.md](BRANDING.md) for full guidelines.

---

## Core Components

### 1. Recipes

Pre-validated physics implementations. Using a recipe guarantees compliance.

**Structure:**
```
sigil-mark/recipes/
├── decisive/           # For critical actions (checkout, transactions)
│   ├── Button.tsx      # spring(180, 12), server-tick
│   ├── ConfirmFlow.tsx # Multi-step confirmation
│   └── index.ts
├── machinery/          # For admin/utility (instant, efficient)
│   ├── Table.tsx       # No animation
│   └── Toggle.tsx      # Instant state
└── glass/              # For marketing (delightful, polished)
    ├── HeroCard.tsx    # Glow, float effects
    └── Tooltip.tsx     # Soft entrance
```

**Recipe Anatomy:**
```tsx
/**
 * @sigil-recipe decisive/Button
 * @physics spring(180, 12), timing(150-250ms)
 * @zone checkout, transaction
 */

interface Props {
  children: React.ReactNode;
  onAction: () => Promise<void>;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({ children, onAction, variant = 'primary' }: Props) {
  const { execute, isPending } = useServerTick(onAction);

  return (
    <motion.button
      onClick={execute}
      disabled={isPending}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 180, damping: 12 }}
      className={cn(
        'px-4 py-2 rounded-lg font-medium',
        variant === 'primary' && 'bg-primary text-white',
        variant === 'secondary' && 'bg-surface border',
        variant === 'danger' && 'bg-danger text-white',
      )}
    >
      {isPending ? 'Processing...' : children}
    </motion.button>
  );
}
```

**Variants:** Created through refinement
```
decisive/Button.tsx           # Base: spring(180, 12)
decisive/Button.nintendo.tsx  # Variant: spring(300, 8) — snappier
decisive/Button.relaxed.tsx   # Variant: spring(140, 16) — less anxious
```

### 2. Zones

Directories with `.sigilrc.yaml` configuration. The folder IS the zone.

**Resolution:**
```
File: src/checkout/ConfirmButton.tsx

1. Check src/checkout/.sigilrc.yaml  → recipes: decisive
2. Merge with src/.sigilrc.yaml      → inherit defaults
3. Apply decisive zone rules
```

**Zone Config:**
```yaml
# src/checkout/.sigilrc.yaml
sigil: "1.2.4"
recipes: decisive
sync: server_authoritative
tick: 600ms

constraints:
  optimistic_ui: forbidden
  loading_spinners: forbidden
```

**Cascading:** Child directories inherit from parent, can override.

### 3. Workbench

The learning environment. Diff on left, browser on right, toggle to compare.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  sigil workbench                                      [checkout/decisive] │
├────────────────────────┬────────────────────────────────────────────────┤
│ DIFF                   │                                                │
│                        │  ┌──────────────────────────────────────────┐  │
│ - stiffness: 180       │  │                                          │  │
│ + stiffness: 300       │  │         [Confirm Purchase]               │  │
│ - damping: 12          │  │                                          │  │
│ + damping: 8           │  │         ← click to test                  │  │
│                        │  │                                          │  │
│ PHYSICS                │  └──────────────────────────────────────────┘  │
│ spring(300, 8)         │                                                │
│                        │  BROWSER                                       │
│ COMPARE                │  See the diff. Feel the diff.                  │
│ [A] Before  180/12     │                                                │
│ [B] After   300/8      │                                                │
├────────────────────────┴────────────────────────────────────────────────┤
│ CLAUDE CODE                                                             │
│                                                                         │
│ > More Nintendo Switch                                                  │
│ Adjusted: spring(180, 12) → spring(300, 8)                              │
│ [Toggle A/B to feel the difference]                                     │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ [A] Before  [B] After  │  Space to toggle                    ● Learning │
└─────────────────────────────────────────────────────────────────────────┘
```

**A/B Toggle:** The core learning mechanism
- Press [A]: Load previous physics → click component → feel it
- Press [B]: Load adjusted physics → click component → feel difference
- Numbers gain meaning through repetition

### 4. PR-Native Refinement

Async feedback without CLI context switches.

**Flow:**
```
1. Engineer: /craft → pushes PR
2. Vercel: Deploys preview
3. Designer: Comments "More Nintendo Switch"
4. Claude: Reads comment + context → infers → commits
5. Engineer: Sees diff in GitHub
6. Preview: Rebuilds
7. Designer: Confirms
```

**Commit Format:**
```
refine(CheckoutButton): Nintendo Switch feel - spring(180,12)→(300,8)
```

---

## Commands

| Command | Purpose | Primary Use |
|---------|---------|-------------|
| `/craft` | Generate component using recipes | **Primary entry** |
| `/sandbox` | Enable exploration (raw physics allowed) | Experimenting |
| `/codify` | Extract physics to recipe | After experiment |
| `/inherit` | Bootstrap from existing codebase | New project |
| `/validate` | Check compliance | Pre-commit/CI |
| `/garden` | Health report | Maintenance |
| `sigil refine` | Manual refinement trigger | When needed |

### /craft

```
/craft "confirmation button for checkout"

ZONE: src/checkout (decisive)
RECIPE: decisive/Button

import { Button } from '@sigil/recipes/decisive';

export function CheckoutConfirm({ onConfirm }) {
  return (
    <Button onAction={onConfirm} variant="primary">
      Confirm Purchase
    </Button>
  );
}

PHYSICS: spring(180, 12), server-tick
```

### /sandbox

```
/sandbox src/checkout/Experiment.tsx

SANDBOX ENABLED

Rules relaxed:
  - Raw physics: Allowed
  - Recipe import: Suggested, not required

File marked with // sigil-sandbox header.
When ready: /codify to extract to recipe.
```

### /garden

```
/garden

RECIPE COVERAGE:
  Components: 47
  Using recipes: 44 (94%)
  In sandbox: 2 (4%)
  Raw override: 1 (2%)

SANDBOXES:
  src/checkout/Experiment.tsx — 3 days (ready for /codify?)
  src/marketing/NewHero.tsx — 12 days ← STALE

VARIANTS:
  decisive/Button.nintendo — created 2 days ago
  decisive/Button.relaxed — created 5 days ago

RECOMMENDATIONS:
  1. /codify src/checkout/Experiment.tsx
  2. Review stale sandbox: src/marketing/NewHero.tsx
```

---

## Context Injection

Claude receives this context for each command:

```xml
<sigil_context version="1.2.4">
  <zone path="src/checkout">
    <recipes>decisive</recipes>
    <sync>server_authoritative</sync>
    <tick>600ms</tick>
  </zone>

  <available_recipes>
    <recipe name="Button" physics="spring(180, 12)">
      <variant name="nintendo" physics="spring(300, 8)" />
      <variant name="relaxed" physics="spring(140, 16)" />
    </recipe>
    <recipe name="ConfirmFlow" physics="multi-step, 600ms between" />
  </available_recipes>

  <constraints>
    <rule level="impossible">Optimistic UI in server_authoritative</rule>
    <rule level="block">Raw physics outside sandbox</rule>
  </constraints>

  <sandbox_files>
    <file path="src/checkout/Experiment.tsx" />
  </sandbox_files>

  <refinement>
    <mode>auto_commit</mode>
    <sources>vercel, github, linear</sources>
  </refinement>
</sigil_context>
```

---

## Three Laws

| Level | Meaning | Override | Example |
|-------|---------|----------|---------|
| **IMPOSSIBLE** | Violates trust | Never | Optimistic UI in server_authoritative |
| **BLOCK** | Requires explicit action | Sandbox/Override | Raw physics in governed zone |
| **WARN** | Logged for review | N/A | Stale sandbox (>7 days) |

---

## File Structure

```
project/
├── CLAUDE.md                  # Sigil prompt for Claude CLI
├── .sigilrc.yaml              # Root config
│
├── src/
│   ├── .sigilrc.yaml          # recipes: machinery (default)
│   ├── checkout/
│   │   └── .sigilrc.yaml      # recipes: decisive
│   ├── admin/
│   │   └── .sigilrc.yaml      # recipes: machinery
│   └── marketing/
│       └── .sigilrc.yaml      # recipes: glass
│
├── sigil-mark/
│   ├── recipes/
│   │   ├── decisive/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.nintendo.tsx
│   │   │   ├── ConfirmFlow.tsx
│   │   │   ├── ServerTickWrapper.tsx
│   │   │   └── index.ts
│   │   ├── machinery/
│   │   │   ├── Table.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── Form.tsx
│   │   │   └── index.ts
│   │   └── glass/
│   │       ├── HeroCard.tsx
│   │       ├── FeatureCard.tsx
│   │       ├── Tooltip.tsx
│   │       └── index.ts
│   └── reports/
│       └── garden-{date}.yaml
│
├── .claude/
│   ├── commands/
│   │   └── *.md
│   ├── skills/
│   │   └── sigil-core/
│   └── scripts/
│       └── *.sh
│
└── .sigil-version.json
```

---

## Decision Tree

```
Building new component?
  │
  └─ /craft → Ship → Feedback?
                        │
        ┌───────────────┴───────────────┐
        ↓                               ↓
   Async (PR)                    Sync (Workbench)
        ↓                               ↓
   Designer comments             Designer speaks
        ↓                               ↓
   Claude commits                Claude adjusts
        ↓                               ↓
   See diff in GitHub            See diff + feel result
        ↓                               ↓
   Test in Vercel preview        Toggle A/B instantly
        ↓                               ↓
   Learning (slower)             Learning (faster)
        ↓                               ↓
   Save variant?                 Save variant?


Exploring new physics?
  │
  └─ /sandbox → Experiment → Looks good?
                                  │
                    ┌─────────────┴─────────────┐
                    ↓                           ↓
                   Yes                          No
                    ↓                           ↓
               /codify → Recipe            Keep iterating
                    ↓
               Available for /craft
```

---

## Integration Points

### ESLint

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['sigil'],
  rules: {
    'sigil/require-recipe': 'error',      // Must import from recipes
    'sigil/no-raw-physics': 'error',      // No inline spring/timing
    'sigil/valid-props': 'error',         // Recipe prop constraints
    'sigil/sandbox-stale': 'warn',        // Sandbox > 7 days
  }
};
```

### CI/CD

```yaml
# .github/workflows/sigil.yml
name: Sigil Validation

on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx sigil validate
      - run: npx eslint --ext .tsx,.ts src/
```

### PR Comments (Auto-Refinement)

```yaml
# .sigilrc.yaml
refinement:
  sources:
    - vercel_preview_comments
    - github_pr_comments
    - linear_issue_comments
  auto_commit: true
  commit_prefix: "refine"
```

---

## Migration Guide

### From No System

1. Run `/inherit` to scan codebase
2. Review generated recipes in `sigil-mark/recipes/`
3. Add `.sigilrc.yaml` to zone directories
4. Gradually migrate components to use recipes

### From v1.2.3

| v1.2.3 | v1.2.4 |
|--------|--------|
| vibes.yaml | **Deleted** — Claude's training |
| /tune wizard | **Deleted** — PR-native refinement |
| /learn | **Deleted** — No dictionary |
| Lecture-first | **Diff + feel** |

---

## Summary

Sigil v1.2.4 provides:

1. **Recipes** — Physics in code form, compliance by construction
2. **Zones** — Folder = zone, cascading configuration
3. **Workbench** — Diff + browser + A/B toggle for learning
4. **Refinement** — PR-native, no CLI context switch
5. **Claude** — Infers context, makes changes, shows diffs

The engineer learns by shipping, not reading. The diff is visible. The feel is testable. The craft develops through hands-on iteration.

> "See the diff. Feel the result. Learn by doing."
