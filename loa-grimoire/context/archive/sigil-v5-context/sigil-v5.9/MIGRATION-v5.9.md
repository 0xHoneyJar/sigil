# Migration Guide: Sigil v4.1 to v5.9

**Version:** 5.9.0 "The Lucid Studio"  
**Date:** 2026-01-08

This guide covers migrating from Sigil v4.1 "Living Guardrails" to v5.9 "The Lucid Studio".

---

## Overview

v5.9 is a significant architectural shift focused on transparency, speed, and human agency:

| Aspect | v4.1 | v5.9 |
|--------|------|------|
| Component lookup | `sigil.map` cache | Live grep (ripgrep) |
| Code fixing | Auto-fix on save | JIT polish on demand |
| Import rules | Blocking contagion | Status propagation |
| Constitution | Static, immutable | Amendment protocol |
| Visual enforcement | Pixel rules only | Cohesion + ergonomic |
| Physics binding | Zone-based | Type-driven |

---

## Breaking Changes

### 1. sigil.map Deleted

The cached component index is gone. All lookups use live grep.

**Before (v4.1):**
```typescript
// Agent reads sigil.map
const goldComponents = sigilMap.components.filter(c => c.tier === 'gold');
```

**After (v5.9):**
```bash
# Agent runs ripgrep
rg "@sigil-tier gold" -l --type ts
```

**Why:** Cache invalidation caused hallucinations after branch switches.

### 2. Auto-Fix on Save Removed

The system no longer fixes code automatically when you save.

**Before (v4.1):**
```
Save file → Agent auto-fixes violations → File changes
```

**After (v5.9):**
```
Save file → Nothing happens
Run /polish → Agent shows diff → You approve → File changes
```

**Why:** Engineers couldn't debug with `border: 1px solid red`.

### 3. useSigilMutation Enhanced for Type-Driven Physics

The hook now reads data types from function signatures.

**Before (v4.1):**
```tsx
const { execute, cssVars } = useSigilMutation({
  mutation: () => api.claim(amount),
  intent: 'claim',  // Vocabulary lookup
});
```

**After (v5.9):**
```tsx
const { 
  simulate,    // NEW: Preview before commit
  confirm,     // NEW: User confirms after preview
  execute,
  state,       // NEW: 'idle' | 'simulating' | 'confirming' | 'committing'
  preview,     // NEW: Simulation result
  cssVars 
} = useSigilMutation({
  mutation: () => api.claim(amount),
  // Physics auto-resolved from type annotation: (amount: Money) => ...
});
```

### 4. Blocking Contagion → Status Propagation

Gold files could not import Draft files in v4.1. Now they can, but their status downgrades.

**Before (v4.1):**
```
Gold imports Draft → ERROR: Blocked
```

**After (v5.9):**
```
Gold imports Draft → Gold becomes Draft (warning, not error)
```

**Why:** Blocking encouraged copy-paste hacks to bypass the rule.

### 5. JSDoc Pragmas Required

Components must declare their tier via JSDoc for discovery.

**Before (v4.1):**
```tsx
// Tier stored in sigil.map, component had no marker
export function ClaimButton() { ... }
```

**After (v5.9):**
```tsx
/**
 * @sigil-tier gold
 * @sigil-zone critical
 * @sigil-data-type Money
 */
export function ClaimButton({ amount }: { amount: Money }) { ... }
```

---

## Step-by-Step Migration

### Step 1: Delete sigil.map

```bash
rm sigil.map
rm sigil-mark/sigil.map
```

The file watcher that maintained this file should also be removed.

### Step 2: Add JSDoc Pragmas to Components

For each component, add tier, zone, and data-type annotations:

```tsx
/**
 * @sigil-tier gold
 * @sigil-zone critical
 * @sigil-data-type Money
 */
export function TransferButton({ amount }: { amount: Money }) {
  // ...
}
```

**Automation script:**
```bash
# Find components in sigil.map and generate pragmas
node scripts/migrate-to-jsdoc.js
```

### Step 3: Update Kernel Files

Create or update the kernel directory:

```bash
mkdir -p sigil-mark/kernel
```

**constitution.yaml:**
```yaml
data_physics:
  financial:
    types: [Money, Balance, Transfer, Withdrawal, Deposit]
    physics: server-tick
    requires: [simulation, confirmation, explicit-pending]
    forbidden: [useOptimistic, instant-commit]
    
  collaborative:
    types: [Task, Document, Comment, Thread]
    physics: crdt
    requires: [conflict-resolution, background-sync]
    forbidden: [blocking-save]
    
  local:
    types: [Preference, Draft, Toggle, UI_State]
    physics: local-first
    requires: [useOptimistic, instant-feedback]
    forbidden: [loading-spinner-on-local]
```

### Step 4: Update useSigilMutation Calls

Add simulation flow for Money types:

**Before:**
```tsx
const { execute, isPending } = useSigilMutation({
  mutation: () => api.claim(amount),
  intent: 'claim',
});

<button onClick={execute} disabled={isPending}>
  {isPending ? 'Claiming...' : 'Claim'}
</button>
```

**After:**
```tsx
const { simulate, confirm, state, preview } = useSigilMutation({
  mutation: () => api.claim(amount),
});

{state === 'idle' && (
  <button onClick={simulate}>Claim</button>
)}

{state === 'simulating' && <Spinner />}

{state === 'confirming' && (
  <ConfirmDialog
    preview={preview}
    onConfirm={confirm}
    onCancel={() => reset()}
  />
)}

{state === 'committing' && <p>Claiming...</p>}
```

### Step 5: Update .sigilrc.yaml

Add workflow configuration:

```yaml
# .sigilrc.yaml
sigil: "5.9.0"

zones:
  critical:
    paths: ["src/features/checkout/**", "src/features/claim/**"]
    default_physics: server-tick
    
  standard:
    paths: ["src/features/**"]
    default_physics: crdt
    
workflow:
  method: cycles  # or: sprints, kanban
  
governance:
  justification_required: true
  amendment_protocol: true
```

### Step 6: Configure Pre-Commit Hook

Replace auto-fix with JIT polish:

```bash
# .husky/pre-commit
#!/bin/sh
npx sigil polish --check

if [ $? -ne 0 ]; then
  echo "Sigil violations detected."
  echo "Run '/polish' in Claude Code to fix."
  exit 1
fi
```

### Step 7: Update ESLint Config

Add data-physics rule:

```js
// eslint.config.js
import sigil from 'eslint-plugin-sigil';

export default [
  sigil.configs.recommended,
  {
    rules: {
      'sigil/enforce-tokens': 'error',
      'sigil/zone-compliance': 'warn',
      'sigil/input-physics': 'warn',
      'sigil/data-physics': 'error',  // NEW in v5.9
    },
  },
];
```

---

## API Comparison

### useSigilMutation

| Property | v4.1 | v5.9 |
|----------|------|------|
| `execute` | ✓ | ✓ |
| `isPending` | ✓ | ✓ (via `state === 'committing'`) |
| `disabled` | ✓ | ✓ |
| `style` / `cssVars` | ✓ | ✓ |
| `physics` | ✓ | ✓ (enhanced) |
| `simulate` | ✗ | ✓ NEW |
| `confirm` | ✗ | ✓ NEW |
| `preview` | ✗ | ✓ NEW |
| `state` | Limited | Full state machine |

### State Machine

**v4.1:**
```
idle → pending → done
              ↘ failed
```

**v5.9 (for Money types):**
```
idle → simulating → confirming → committing → done
                              ↘ cancelled   ↘ error
```

---

## Skill Migration

### v4.1 Commands → v5.9 Skills

| v4.1 Command | v5.9 Skill | Notes |
|--------------|------------|-------|
| `/craft` | All skills combined | Enhanced with type analysis |
| `/observe` | Auditing Cohesion | Visual context check |
| `/garden` | Scanning + Auditing | Drift detection |
| `/consult` | Negotiating Integrity | Amendment protocol |
| `/polish` (new) | Polishing Code | Replaces auto-fix |

---

## Configuration Migration

### .sigilrc.yaml Schema Changes

**v4.1:**
```yaml
sigil: "4.1.0"

zones:
  critical:
    paths: ["**/checkout/**"]
    default_physics: deliberate
    persona_overrides:
      power_user: warm
```

**v5.9:**
```yaml
sigil: "5.9.0"

zones:
  critical:
    paths: ["**/checkout/**"]
    default_physics: server-tick  # Changed from motion name
    data_types: [Money, Balance]  # NEW: explicit type binding
    
workflow:
  method: cycles
  forbidden: [sprint, backlog]
  
governance:
  justification_required: true
  amendment_protocol: true
  contagion: propagate  # NEW: 'propagate' | 'block' | 'warn'
```

---

## Rollback Plan

If you need to rollback to v4.1:

1. Restore `sigil.map` from git history
2. Remove JSDoc pragmas (or leave them, they're harmless)
3. Revert `useSigilMutation` calls to simple execute pattern
4. Re-enable auto-fix on save
5. Update `.sigilrc.yaml` version to `4.1.0`

```bash
# Quick rollback
git checkout v4.1.0 -- sigil-mark/
git checkout v4.1.0 -- .sigilrc.yaml
```

---

## FAQ

### Q: Why remove sigil.map?

Cache invalidation is one of the hardest problems in computer science. When you switch branches, the filesystem changes instantly but the cache is stale. The agent reads stale data and hallucinates components that don't exist or misses ones that do.

ripgrep is fast enough (< 50ms) for interactive use. No cache, no drift.

### Q: Why remove auto-fix on save?

Engineers need to debug. `border: 1px solid red` is a legitimate debugging technique. If the system fights you, you disable the system.

JIT polish gives you control. Fix when you're ready, not when the system decides.

### Q: What if I want blocking contagion back?

Set in `.sigilrc.yaml`:

```yaml
governance:
  contagion: block  # 'propagate' | 'block' | 'warn'
```

We don't recommend this—it encourages copy-paste hacks—but the option exists.

### Q: Do I need to add JSDoc pragmas to every component?

Only components you want discovered by tier/zone/data-type. Non-annotated components are treated as "unclassified" and inherit zone defaults from file path.

### Q: How do I handle the simulation flow for Money types?

The agent generates the full simulation pattern automatically when it detects Money types. For manual implementation:

```tsx
const { simulate, confirm, state, preview } = useSigilMutation({
  mutation: () => api.transfer(amount),
});

// 1. User clicks → simulate()
// 2. Show preview from preview object
// 3. User confirms → confirm()
// 4. Watch state for completion
```

---

## Support

- GitHub Issues: [sigil/issues](https://github.com/0xHoneyJar/sigil/issues)
- Migration script: `npx sigil migrate --from 4.1 --to 5.9`

---

*Sigil v5.9.0 "The Lucid Studio"*  
*Generated: 2026-01-08*
