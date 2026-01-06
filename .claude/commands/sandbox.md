---
name: sandbox
version: "1.2.4"
description: Enable raw physics for experimentation
agent: null
preflight:
  - sigil_mark_exists
---

# /sandbox

Enable raw physics in a file or directory. Relaxes ESLint rules and allows direct spring/timing values.

## Usage

```
/sandbox [path]              # Enable sandbox mode for file/directory
/sandbox --list              # List active sandboxes
/sandbox --clear [path]      # Remove sandbox mode from path
```

## What This Does

1. **Marks file with header** — Adds `// sigil-sandbox` to top of file
2. **Updates zone config** — Adds path to zone's `sandbox` list in `.sigilrc.yaml`
3. **Relaxes ESLint** — Sandbox files skip `sigil/no-raw-physics` rule
4. **Tracks in /garden** — Active sandboxes show in health report

## Sandbox Header

```tsx
// sigil-sandbox
// Created: 2026-01-05
// Purpose: Experimenting with snappier button physics
// Exit: Run /codify to extract to recipe

import { motion } from 'framer-motion';

// Raw physics allowed here
const SPRING = { stiffness: 300, damping: 8 };
```

## Zone Config Update

```yaml
# src/checkout/.sigilrc.yaml
sigil: "1.2.4"
recipes: decisive
sync: server_authoritative

sandbox:
  - src/checkout/ExperimentButton.tsx
```

## Exit Sandbox

When experimentation is complete:

```
/codify src/checkout/ExperimentButton.tsx --name Button.snappy
```

This will:
1. Extract physics values to recipe
2. Update file to import recipe
3. Remove `// sigil-sandbox` header
4. Remove from zone's sandbox list

## Stale Sandboxes

Sandboxes open >7 days appear in `/garden` as stale. Stale sandboxes should either:
- Be codified into recipes
- Be cleared if abandoned

## Examples

```
/sandbox src/checkout/ExperimentButton.tsx
→ Added // sigil-sandbox header
→ Updated src/checkout/.sigilrc.yaml
→ Raw physics now allowed

/sandbox --list
→ Active sandboxes:
→   src/checkout/ExperimentButton.tsx (2 days old)
→   src/marketing/HeroExperiment.tsx (5 days old)

/sandbox --clear src/marketing/HeroExperiment.tsx
→ Removed sandbox header
→ Updated .sigilrc.yaml
→ Warning: Raw physics will now trigger ESLint errors
```

## Next Steps

- Experiment with raw physics values
- Use A/B toggle in workbench to feel differences
- When ready: `/codify [path]` to extract to recipe
