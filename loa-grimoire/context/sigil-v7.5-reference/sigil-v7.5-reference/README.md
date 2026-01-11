# Sigil v7.5 — The Reference Studio

> A design context framework that helps AI agents make consistent design decisions.

## Quick Start

### 1. Copy Sigil files to your project

```bash
cp -r .sigil/ your-project/
cp CLAUDE.md your-project/
cp -r src/gold/ your-project/src/
cp -r src/silver/ your-project/src/
```

### 2. Install ESLint plugin

```bash
npm install ./eslint-plugin-sigil
```

Add to `.eslintrc.js`:
```javascript
module.exports = {
  plugins: ['sigil'],
  rules: {
    'sigil/gold-imports-only': 'error',
    'sigil/no-gold-imports-draft': 'error',
  },
};
```

### 3. Create your registries

```typescript
// src/gold/index.ts — Your canonical components
export { Button } from '../components/Button';
export { CriticalButton } from '../components/CriticalButton';

// src/silver/index.ts — Proven but not canonical
export { Tooltip } from '../components/Tooltip';

// src/draft/index.ts — Experimental (quarantined)
export { ExperimentalNav } from '../components/ExperimentalNav';
```

### 4. Configure taste profile

Edit `.sigil/taste-profile.yaml` to match your design system.

### 5. Use with Claude Code

The `CLAUDE.md` file will be automatically read by Claude Code agents.

---

## Architecture

See `ARCHITECTURE.md` for the complete architectural specification.

## Key Concepts

### Registry-Based Authority

Components live in `src/components/` (stable paths). Status is defined by which registry exports them:

- `src/gold/index.ts` → Gold (canonical, copy exactly)
- `src/silver/index.ts` → Silver (proven, use as fallback)
- `src/draft/index.ts` → Draft (experimental, quarantined)

**Promotion = Add export line. Zero refactoring.**

### Contagion Rules

```
Gold can import: Gold only
Silver can import: Gold, Silver
Draft can import: anything
```

Draft code can exist and be merged, but it cannot infect Gold.

### Speculative Streaming

Agent streams code immediately (0ms delay), validates in parallel, and rolls back if violations detected. Movement > stalling.

### Nomination Pattern

Agent never auto-promotes. It identifies candidates and opens nomination PRs for human approval. Human remains sovereign.

---

## Files

```
.sigil/
└── taste-profile.yaml     # Physics, zones, vocabulary

src/
├── gold/index.ts          # Gold registry (canonical)
├── silver/index.ts        # Silver registry (proven)
├── draft/index.ts         # Draft registry (experimental)
└── components/            # All implementations (stable paths)

CLAUDE.md                  # Agent instructions
ARCHITECTURE.md            # Full specification
eslint-plugin-sigil/       # ESLint rules for contagion
types/sigil.d.ts           # TypeScript definitions
```

---

## License

MIT
