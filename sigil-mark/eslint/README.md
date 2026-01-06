# Sigil ESLint Plugin Configuration

> v1.2.4 - Enforcement Layer

This directory contains documentation for the Sigil ESLint plugin.

The plugin source is at `sigil-mark/eslint-plugin/`.

## Quick Setup

```bash
# Install from local package
npm install ./sigil-mark/eslint-plugin --save-dev

# Or link locally for development
cd sigil-mark/eslint-plugin && npm link && cd ../.. && npm link eslint-plugin-sigil
```

```javascript
// eslint.config.js
import sigilPlugin from 'eslint-plugin-sigil';

export default [
  {
    plugins: {
      sigil: sigilPlugin,
    },
    rules: {
      'sigil/no-raw-physics': 'error',
      'sigil/require-recipe': 'error',
      'sigil/no-optimistic-in-decisive': 'error',
      'sigil/sandbox-stale': 'warn',
    },
  },
];
```

## Rules

### sigil/no-raw-physics

Disallows raw `stiffness`, `damping`, `transition` properties outside sandbox files.

**Passes:**
```tsx
// sigil-sandbox
const SPRING = { stiffness: 300, damping: 8 };
```

```tsx
import { Button } from '@sigil/recipes/decisive';
<Button>Click me</Button>
```

**Fails:**
```tsx
// No sandbox header
<motion.button transition={{ type: 'spring', stiffness: 180 }}>
```

### sigil/require-recipe

Requires `@sigil/recipes` import in components with animation.

**Passes:**
```tsx
import { Button } from '@sigil/recipes/decisive';
```

**Fails:**
```tsx
import { motion } from 'framer-motion';
// Missing recipe import
```

### sigil/no-optimistic-in-decisive

Prevents optimistic UI patterns in server_authoritative zones.

**Passes:**
```tsx
// src/checkout/Button.tsx (decisive zone)
const { execute, isPending } = useServerTick(action);
```

**Fails:**
```tsx
// src/checkout/Button.tsx (decisive zone)
const [state, setState] = useState();
// Optimistic update before server confirmation
```

### sigil/sandbox-stale

Warns when sandbox files are older than 7 days.

## Sandbox Detection

Files with `// sigil-sandbox` header at the start are treated as sandboxes:
- Skip `sigil/no-raw-physics`
- Skip `sigil/require-recipe`
- Check `sigil/sandbox-stale`

## Zone-Specific Rules

The plugin reads `.sigilrc.yaml` to determine zone constraints:

```yaml
# src/checkout/.sigilrc.yaml
constraints:
  optimistic_ui: forbidden
```

When `optimistic_ui: forbidden`, the `sigil/no-optimistic-in-decisive` rule applies.

## CI Integration

See `.github/workflows/sigil.yml` for CI configuration.
