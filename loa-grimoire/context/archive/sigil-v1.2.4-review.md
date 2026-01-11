# Sigil v1.2.4-lite Critical Review

**Reviewer**: Staff Design Engineer (15+ years)  
**Date**: 2026-01-06  
**Verdict**: **Significant gaps between architecture and implementation**

---

## Executive Summary

The implementation shows ambition but suffers from three fatal flaws:

1. **The A/B toggle doesn't actually work** — CSS custom properties aren't read by framer-motion
2. **Scope creep in skills** — The crafting skill references Soul Binder, Canon of Flaws, Lenses, Consultation Chamber — systems that don't exist in this implementation and contradict the v1.2.4 "diff + feel" philosophy
3. **Tests don't test** — They're tautologies comparing hardcoded values to themselves

The workbench is **UI theater** — it looks right but doesn't function. An engineer following this implementation would hit walls immediately.

---

## Critical Issues

### 1. A/B Toggle Fundamental Disconnect

**File**: `sigil-mark/workbench/ab-toggle.ts`

The toggle sets CSS custom properties:
```typescript
root.style.setProperty('--sigil-stiffness', String(physics.stiffness));
root.style.setProperty('--sigil-damping', String(physics.damping));
```

**Problem**: Framer-motion components don't read from CSS custom properties. The Button recipe uses:
```typescript
const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 180,  // ← Hardcoded, not var(--sigil-stiffness)
  damping: 12,
};
```

**Result**: Toggling A/B does nothing. The engineer sees the diff, clicks the component, but **feels nothing different**. This defeats the entire learning model.

**Fix Required**: Either:
- Use React context to propagate physics values
- Hot-reload the component via HMR with different values
- Use Storybook-style knobs with actual state binding

---

### 2. Skill File Contains Ghost Systems

**File**: `.claude/skills/crafting-guidance/SKILL.md`

This skill references systems that don't exist in the implementation:

```markdown
sigil-mark/soul-binder/immutable-values.yaml
sigil-mark/soul-binder/canon-of-flaws.yaml
sigil-mark/lens-array/lenses.yaml
sigil-mark/consultation-chamber/decisions/
```

**Reality check**:
```bash
$ find . -name "soul-binder" -o -name "lens-array" -o -name "consultation-chamber"
# Returns nothing
```

The skill also references scripts that don't exist:
- `.claude/scripts/check-flaw.sh`
- `.claude/scripts/get-lens.sh`
- `.claude/scripts/check-decision.sh`
- `.claude/scripts/get-strictness.sh`

**Impact**: Claude will fail when trying to execute this skill. The skill is written for a different (future?) version.

**v1.2.4 Philosophy Violation**: The whole point of v1.2.4 was "apprenticeship through diff + feel" — no vibes.yaml, no dictionaries, no complex systems. This skill has scope-crept back to the complexity we explicitly rejected.

---

### 3. Tests Are Tautologies

**File**: `sigil-mark/__tests__/recipes.test.tsx`

```typescript
it('should have correct physics values in transition', () => {
  const expectedPhysics = {
    type: 'spring',
    stiffness: 180,
    damping: 12,
  };

  // This tests... nothing. It's comparing a local object to itself.
  expect(expectedPhysics.stiffness).toBe(180);
  expect(expectedPhysics.damping).toBe(12);
});
```

**What should be tested**:
1. Import the actual Button component
2. Render it with @testing-library/react
3. Assert the motion props are correct
4. Test isPending state behavior
5. Test the actual spring transition fires

**Current state**: 0% of actual component behavior is tested.

---

### 4. useServerTick Has a Re-render Bug

**File**: `sigil-mark/hooks/useServerTick.ts`

```typescript
const execute = useCallback(async (): Promise<T | undefined> => {
  // ...
}, [action, isPending, minPendingTime, onError, onSuccess]);
//   ^^^^^^ BUG: action changes on every render if not memoized
```

**Problem**: If the caller passes `onAction={() => api.confirm()}`, the `action` reference changes every render, causing `execute` to be recreated, which can cause infinite loops or stale closures.

**Fix**:
```typescript
const actionRef = useRef(action);
actionRef.current = action;

const execute = useCallback(async () => {
  // Use actionRef.current instead of action
}, [minPendingTime]); // action removed from deps
```

---

### 5. ESLint Rule Will False-Positive

**File**: `sigil-mark/eslint-plugin/rules/no-raw-physics.js`

```javascript
const PHYSICS_PROPERTIES = ['stiffness', 'damping', 'mass', 'velocity'];

// ...

if (PHYSICS_PROPERTIES.includes(node.key.name)) {
  // Report violation
}
```

**Problem**: These property names appear in many non-animation contexts:
- `{ stiffness: 'high' }` — describing a material
- `{ damping: true }` — boolean config
- Physics simulation code that isn't for UI

The rule tries to check if it's inside a `transition` or `spring` object, but the tree-walking logic is fragile:
```javascript
if (parentKey.name === 'transition' || parentKey.name === 'spring') {
```

This misses:
- `animate={{ transition: { ... } }}`
- Named exports like `springConfig`
- Object spread patterns

**Fix**: Use TypeScript type checking or detect framer-motion/react-spring imports.

---

### 6. Zone Resolver YAML Parser Will Break

**File**: `sigil-mark/core/zone-resolver.ts`

```typescript
function parseSimpleYaml(content: string): RawConfig {
  // Hand-rolled YAML parser
}
```

**What breaks**:
- Multi-line strings
- Arrays with complex objects
- Anchors and aliases
- Comments with colons
- Values containing quotes

**Example that breaks**:
```yaml
constraints:
  message: "Don't use: this pattern"  # Colon in value breaks parsing
```

**Fix**: Use `js-yaml` or `yaml` package. The "no dependencies" goal isn't worth broken parsing.

---

### 7. Import Path Confusion

**Recipe file** (`Button.tsx`):
```typescript
import { useServerTick } from '../../hooks';
```

**Documentation** (`PROCESS.md`):
```typescript
import { Button } from '@sigil/recipes/decisive';
```

**CLAUDE.md**:
```typescript
import { Button } from '@sigil/recipes/decisive';
```

**Problem**: `@sigil/recipes/` isn't configured anywhere. There's no `package.json` with the alias, no `tsconfig.json` paths, no bundler config.

**Impact**: Copy-paste from docs will fail immediately.

---

### 8. Workbench Is UI Theater

The workbench script creates a beautiful 3-pane tmux layout:

```
┌─────────────────┬─────────────────────────┐
│   PHYSICS       │                         │
│   + DIFF        │     BROWSER             │
│   + A/B         │     (via Chrome MCP)    │
├─────────────────┴─────────────────────────┤
│              CLAUDE CODE                  │
└───────────────────────────────────────────┘
```

**But**:
1. The diff pane just echoes static text — no actual diff watching
2. The browser pane says "via Chrome MCP" but there's no MCP connection code
3. The A/B toggle doesn't connect to anything running
4. Space key binding mentioned in status bar isn't actually bound

**What's missing**:
- File watcher to update diff pane when physics change
- Browser sync (browser-sync, vite HMR, etc.)
- Actual A/B state management between panes
- IPC between tmux panes

---

### 9. Missing Adhesion Font

The workbench and docs reference the Adhesion font:
```bash
# BRANDING: Adhesion aesthetic
```

**But**: `assets/fonts/Adhesion-Regular.otf` is not in the zip.

---

### 10. Command/Skill Duplication

**Commands defined**:
- `/setup`, `/envision`, `/codify`, `/craft`, `/sandbox`, `/inherit`, `/validate`, `/garden`

**Skills defined**:
- `crafting-guidance`
- `codifying-rules`
- `codifying-recipes`
- `inheriting-design`
- `validating-fidelity`
- `gardening-entropy`
- `initializing-sigil`
- `envisioning-moodboard`
- `sigil-core`

**Problem**: 
- `setup.md` and `sigil-setup.md` both exist
- `codifying-rules` and `codifying-recipes` are separate but CLAUDE.md only mentions `/codify`
- Skills reference scripts that don't exist

---

## Medium Issues

### 11. Recipe Variant Naming Inconsistency

```
Button.tsx           # Base
Button.nintendo.tsx  # Variant (dot notation)
Button.relaxed.tsx   # Variant
```

The export names don't match file names:
```typescript
// Button.nintendo.tsx
export const Button = forwardRef<...>  // Same export name as base
```

**Impact**: Can't import both in same file:
```typescript
import { Button } from './Button';
import { Button } from './Button.nintendo';  // ← Name collision
```

**Fix**: Use named exports: `NintendoButton`, `RelaxedButton`

---

### 12. No TypeScript Config

No `tsconfig.json` means:
- IDE can't validate imports
- Path aliases won't work
- Module resolution undefined

---

### 13. History System Incomplete

`sigil-mark/history/` contains:
- `TEMPLATE.md` — Template file
- `.gitkeep` — Empty marker

`sigil-mark/core/history.ts` references:
```typescript
export function extractPatterns() { ... }
```

**But**: The `extractPatterns` function would need to:
1. Glob `history/*.md` files
2. Parse markdown
3. Extract patterns

None of this is implemented.

---

## Structural Issues

### 14. CLAUDE.md vs Skill Files Conflict

`CLAUDE.md` says:
> Do NOT lecture. Do NOT explain unless asked. Make the change. The diff + feel is the lesson.

`crafting-guidance/SKILL.md` says:
```markdown
### Block Message (⛔)
⛔ {VIOLATION_TYPE} VIOLATION
{Violation description}
CONTEXT: {Why this matters...}
```

These are philosophically opposite approaches.

---

### 15. No CI Pipeline Tests

`.github/workflows/sigil.yml` exists but:
```yaml
- run: npm ci
- run: npm test
```

Given the tests don't test anything, CI will always pass.

---

## What Works

To be fair, these parts are solid:

1. **Recipe component structure** — Good patterns, proper TypeScript
2. **Zone resolution algorithm** — Logic is sound (if YAML parser worked)
3. **useServerTick concept** — Right idea, just has the dependency bug
4. **Workbench shell script** — Well-structured bash, proper error handling
5. **Documentation breadth** — CLAUDE.md, PROCESS.md, MIGRATION.md, README.md all exist

---

## Recommendations

### Immediate (Block shipping)

1. **Delete the A/B toggle** — It's worse than nothing (implies functionality that doesn't exist)
2. **Fix useServerTick deps** — This will cause bugs in production
3. **Remove ghost systems from skill** — Soul Binder, Lenses, etc. don't exist
4. **Use real YAML parser** — `npm install yaml`
5. **Write one real test** — Actually render a Button and check its behavior

### Short-term

1. **Implement actual hot-swap** — Storybook, or custom HMR solution
2. **Add tsconfig.json** — Enable IDE support
3. **Fix import paths** — Either set up aliases or use relative paths consistently
4. **Add Adhesion font** — Or remove references to it

### Philosophical

**The implementation has drifted from v1.2.4's core insight:**

> "Engineers learn by seeing diffs and feeling the physics."

Currently:
- ❌ Diffs are visible (static echo, not real)
- ❌ Physics are feelable (toggle doesn't work)
- ❌ Learning happens (no feedback loop)

The framework promises a **workbench** but delivers a **poster of a workbench**.

---

## Verdict

**Do not ship this version.**

The gap between what's documented and what's implemented is too large. An engineer following the docs will hit failures within minutes:
1. Import from `@sigil/recipes/decisive` — fails
2. Toggle A/B in workbench — nothing happens
3. Run `/craft` — skill references missing scripts

Fix the A/B toggle, remove the ghost systems, and write real tests before continuing.

---

## Appendix: Files Reviewed

| File | Status |
|------|--------|
| `CLAUDE.md` | ⚠️ Good, but contradicted by skill |
| `PROCESS.md` | ⚠️ Comprehensive, but references broken features |
| `sigil-mark/recipes/decisive/Button.tsx` | ✅ Solid recipe pattern |
| `sigil-mark/hooks/useServerTick.ts` | ❌ Dependency bug |
| `sigil-mark/workbench/ab-toggle.ts` | ❌ Fundamentally broken |
| `sigil-mark/core/zone-resolver.ts` | ⚠️ Fragile YAML parsing |
| `sigil-mark/eslint-plugin/rules/no-raw-physics.js` | ⚠️ False positive prone |
| `sigil-mark/__tests__/recipes.test.tsx` | ❌ Tests nothing |
| `.claude/skills/crafting-guidance/SKILL.md` | ❌ References ghost systems |
| `.claude/scripts/sigil-workbench.sh` | ⚠️ UI theater, no functionality |
