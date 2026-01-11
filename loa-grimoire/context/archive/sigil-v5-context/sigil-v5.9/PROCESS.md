# Development Process

This document outlines the Sigil v5.9 workflow for building with The Lucid Studio architecture.

> "Filesystem is truth. Agency stays with the human. Rules evolve."

## Philosophy: The Lucid Studio

Sigil v5.9 separates concerns into layers:

- **Kernel Layer** — Constitution, fidelity, workflow, vocabulary (always in context)
- **Skill Layer** — Six capabilities the agent uses to assist you
- **Governance Layer** — Status propagation, amendment protocol, justification capture

The key insight: **Data is Constitution**. The type annotation determines physics, not the button name.

---

## Overview

Sigil's workflow has two paths:

### New Project Path
```
/envision → /codify → (build) → /craft → /polish → /garden
```

### Existing Codebase Path
```
/inherit → /envision → /codify → (build) → /craft → /polish
```

---

## Architecture (3 Layers)

```
┌────────────────────────────────────────────────────────────────┐
│  KERNEL LAYER — Always in context (Constitution)              │
│  constitution.yaml, fidelity.yaml, workflow.yaml, vocabulary  │
├────────────────────────────────────────────────────────────────┤
│  SKILL LAYER — Agent capabilities                             │
│  Scanning, Analyzing, Auditing, Negotiating, Simulating,      │
│  Polishing                                                    │
├────────────────────────────────────────────────────────────────┤
│  GOVERNANCE LAYER — Evolution & tracking                      │
│  Status Propagation, Amendment Protocol, Justifications       │
└────────────────────────────────────────────────────────────────┘
```

---

## The 6 Skills

### Scanning Sanctuary

**Purpose:** Find components via live filesystem search.

**When Used:** Any component lookup.

**Implementation:**
```bash
rg "@sigil-tier gold" -l --type ts
rg "@sigil-data-type Money" -l --type ts
```

**Key Point:** No cache. Filesystem is truth.

---

### Analyzing Data Risk

**Purpose:** Determine physics from data type in function signature.

**When Used:** Generating action handlers.

**Process:**
1. Parse function signature
2. Extract data types from parameters
3. Look up in constitution
4. Return physics class

**Example:**
```
Signature: (amount: Money) => Promise<void>
Lookup: Money → financial → server-tick
Result: { physics: 'server-tick', requires: ['simulation'], forbidden: ['useOptimistic'] }
```

---

### Auditing Cohesion

**Purpose:** Check if new component coheres visually with context.

**When Used:** New component generation, visual changes.

**Process:**
1. Identify visual properties (shadows, borders, colors)
2. Compare against surrounding context
3. Report variance

**Output:**
```
Generated: shadow-lg rounded-full
Context:   shadow-none rounded-md

Variance: HIGH
Options: [Match Context] [Keep Current] [Propose Amendment]
```

---

### Negotiating Integrity

**Purpose:** Handle constitution violations gracefully.

**When Used:** User request conflicts with constitution.

**Protocol:**
```
VIOLATION: Optimistic update on Money type
ARTICLE: data_physics.financial
RISK: HIGH

OPTIONS:
1. COMPLY - Use simulation (feels instant, actually safe)
2. BYPASS - Override with justification (logged)
3. AMEND - Propose constitution change (team review)
```

**Never refuse outright. Always negotiate.**

---

### Simulating Interaction

**Purpose:** Verify timing meets physics requirements.

**When Used:** Critical components, `/craft --simulate`.

**Measurements:**
- click_to_feedback: < 100ms
- keypress_to_action: < 50ms
- hover_to_tooltip: < 200ms

**Tool:** Playwright/Puppeteer headless browser.

---

### Polishing Code

**Purpose:** Standardize code on demand.

**When Used:** `/polish`, pre-commit hook, CI.

**Process:**
1. Scan for violations
2. Generate fixes
3. Present diff
4. Apply on approval

**Key Point:** Never auto-fix on save. Human decides when to polish.

---

## Commands

| Command | Skills Used | Description |
|---------|-------------|-------------|
| `/envision` | — | Capture product soul via interview |
| `/codify` | — | Define zones and rules |
| `/craft <prompt>` | All | Generate code with physics |
| `/craft --simulate` | Simulating | Force timing verification |
| `/polish` | Polishing | Standardize on demand |
| `/polish --diff` | Polishing | Show diff without applying |
| `/garden` | Scanning, Auditing | Check system health |
| `/garden --drift` | Auditing | Report visual drift |
| `/amend <rule>` | Negotiating | Propose constitution change |
| `/inherit` | Scanning, Analyzing | Bootstrap from existing code |

---

## Core Patterns

### useSigilMutation

The main hook with type-driven physics:

```tsx
import { useSigilMutation } from 'sigil-mark/hooks';

function ClaimButton({ amount }: { amount: Money }) {
  const {
    simulate,    // Preview what will happen
    confirm,     // User confirms after preview
    execute,     // Direct execution (for non-Money types)
    reset,       // Return to idle
    state,       // 'idle' | 'simulating' | 'confirming' | 'committing' | 'done' | 'error'
    preview,     // Simulation result
    cssVars,     // { '--sigil-duration', '--sigil-easing' }
  } = useSigilMutation({
    mutation: () => api.claim(amount),
    onSuccess: (data) => toast('Claimed!'),
    onError: (error) => toast.error(error.message),
  });

  return (
    <>
      {state === 'idle' && (
        <button onClick={simulate} style={cssVars}>
          Claim {amount.toString()}
        </button>
      )}
      
      {state === 'simulating' && <Spinner />}
      
      {state === 'confirming' && (
        <ConfirmDialog
          title="Confirm Claim"
          preview={preview}
          onConfirm={confirm}
          onCancel={reset}
        />
      )}
      
      {state === 'committing' && <p>Processing...</p>}
      
      {state === 'done' && <p>Success!</p>}
      
      {state === 'error' && (
        <button onClick={reset}>Try Again</button>
      )}
    </>
  );
}
```

### Zone Layouts

```tsx
import { CriticalZone, GlassLayout, MachineryLayout } from 'sigil-mark/layouts';

// Critical zone: server-tick physics
<CriticalZone financial>
  <ClaimButton amount={amount} />
</CriticalZone>

// Glass layout: local-first physics
<GlassLayout>
  <BrowsePanel />
</GlassLayout>

// Machinery layout: instant physics
<MachineryLayout>
  <AdminDashboard />
</MachineryLayout>
```

### JSDoc Pragmas

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

---

## Status Propagation

### The Rule

```
Tier(Component) = min(DeclaredTier, Tier(Dependencies))
```

### Behavior

```
Gold imports Gold   → stays Gold
Gold imports Silver → becomes Silver
Gold imports Draft  → becomes Draft
```

### Agent Notification

```
Note: ClaimButton is now effectively Silver.
      It imports DraftModal (Draft tier).
      
      Status will restore to Gold when DraftModal is upgraded.
      Continue? [Y/n]
```

---

## Workflow Engine

### Configuration

```yaml
# sigil-mark/kernel/workflow.yaml
workflow:
  method: cycles
  
  rules:
    no_backlogs:
      violation: "Creating a Backlog view"
      response: "REFUSE. Suggest Triage instead."
      
    hill_charts:
      violation: "Creating burndown chart"
      response: "SUGGEST: Use hill chart instead."
```

### Agent Behavior

```
User: "Create a sprint burndown chart"

Agent: I can't create a sprint burndown chart.

       Your workflow is configured as "Cycles":
         - "Sprint" → "Cycle"
         - "Burndown" → "Hill Chart"
       
       Would you like me to create a Hill Chart instead?
```

---

## Example Workflows

### New Project

```bash
# 1. Capture product soul
/envision
# → Answer questions about references, feel, anti-patterns
# → Review sigil-mark/moodboard.md

# 2. Define zones and types
/codify
# → Configure .sigilrc.yaml
# → Define data types in types/index.ts

# 3. Build your product
# Use patterns: CriticalZone, useSigilMutation, JSDoc pragmas

# 4. Get guidance during implementation
/craft "claim button for vault rewards"
# → Agent analyzes: Money type → server-tick → simulation required
# → Generates full simulation flow

# 5. Polish before commit
/polish
# → Shows diff of violations
# → Apply on approval

# 6. Detect entropy
/garden
# → Reports drift, stale overrides, status downgrades
```

### Existing Codebase Migration

```bash
# 1. Scan codebase to detect existing patterns
/inherit
# → Identifies components, infers types
# → Suggests JSDoc pragmas

# 2. Refine moodboard
/envision

# 3. Add JSDoc pragmas
# Run migration script or add manually

# 4. Continue with craft/polish/garden
```

---

## Best Practices

### Using Data Types

Define branded types for automatic physics:

```typescript
// types/index.ts
export type Money = { _brand: 'Money'; amount: bigint; currency: string };
export type Task = { _brand: 'Task'; id: string; title: string };
export type Draft = { _brand: 'Draft'; content: string };
```

### Using /polish

- Run `/polish` before commits
- Use `/polish --diff` to preview without applying
- Set up pre-commit hook for enforcement

### Using Overrides

When you must override:

```tsx
// @sigil-override: server-tick
// Reason: Read-only balance display, no mutation risk
<OptimisticBalance amount={balance} />
```

Always provide a reason. One good justification changes the law.

### Using Amendment Protocol

When the constitution is wrong:

```
/amend "Add 'optimistic-with-reconciliation' for low-risk Money displays"
```

The agent generates an amendment proposal for team review.

---

## Related Documentation

- **[README.md](README.md)** — Quick start guide
- **[CLAUDE.md](CLAUDE.md)** — Agent protocol reference
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Deep architectural overview
- **[MIGRATION-v5.9.md](MIGRATION-v5.9.md)** — v4.1 → v5.9 migration guide

---

*Sigil v5.9.0 "The Lucid Studio"*
