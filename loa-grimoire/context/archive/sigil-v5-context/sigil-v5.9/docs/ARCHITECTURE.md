# Sigil v5.9 Architecture: The Lucid Studio

> *"Filesystem is truth. Agency stays with the human. Rules evolve."*

This document provides the deep architectural overview of Sigil v5.9.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [The Seven Laws](#2-the-seven-laws)
3. [System Architecture](#3-system-architecture)
4. [The Kernel](#4-the-kernel)
5. [The Six Skills](#5-the-six-skills)
6. [Status Propagation](#6-status-propagation)
7. [JIT Polish](#7-jit-polish)
8. [The Amendment Protocol](#8-the-amendment-protocol)
9. [The Chrono-Kernel](#9-the-chrono-kernel)
10. [Implementation Details](#10-implementation-details)

---

## 1. Design Philosophy

### 1.1 The Problem with Previous Approaches

| Version | Approach | Fatal Flaw |
|---------|----------|------------|
| v5.4 | Static registries | Maintenance nightmare, lies to agent |
| v5.5 | Context dump | Pollution degrades agent reasoning |
| v5.6 | MCP research | 45-second latency breaks flow |
| v5.7 | Name-based inference | "Transfer" means different things |
| v5.8 | sigil.map cache | Branch switch = stale = hallucination |

### 1.2 The Lucid Approach

v5.9 prioritizes **transparency** and **agency**:

```
┌─────────────────────────────────────────────────────────────────┐
│  MAGIC (Bad)                    LUCID (Good)                    │
├─────────────────────────────────────────────────────────────────┤
│  Cached index                   Live grep                       │
│  Auto-fix on save               Polish on demand                │
│  Block invalid imports          Propagate status honestly       │
│  Refuse violations              Negotiate amendments            │
│  Guess from names               Read from types                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Key Insight: Data is Constitution

The button name lies. The data type doesn't.

```typescript
// Same word "Transfer" — OPPOSITE physics

// Linear: Transfer a task → CRDT (optimistic, conflict resolution)
function TransferTask({ task }: { task: Task }) { ... }

// Family: Transfer ETH → Server-tick (simulation, confirmation)  
function TransferFunds({ amount }: { amount: Money }) { ... }
```

**The schema is the constitution.** The agent reads type annotations, not button labels.

---

## 2. The Seven Laws

These are immutable principles. Everything else flows from them.

### Law 1: Filesystem is Truth

```bash
# Always use live grep
rg "@sigil-tier gold" -l --type ts

# Never use cached indexes
# sigil.map → DELETED
```

**Why:** Caches drift. Git checkout changes files instantly. A cached index becomes stale. The agent reads stale data and hallucinates components that don't exist.

**Implementation:** ripgrep < 50ms on any codebase. Fast enough for interactive use.

### Law 2: Agency Stays with Human

```
ON SAVE:     Nothing happens
ON /polish:  Agent shows diff, asks for approval
ON COMMIT:   Pre-commit hook runs /polish
```

**Why:** Engineers need to debug. `border: 1px solid red` is a valid debugging technique. If the system fights them, they disable the system.

### Law 3: Status Propagates, Doesn't Block

```
Tier(Component) = min(DeclaredTier, Tier(Dependencies))

Gold imports Draft → Gold becomes Draft
```

**Why:** Blocking imports encourages copy-paste hacks. Engineers copy the Draft code into the Gold file to bypass the rule. Now you have duplication AND debt.

### Law 4: Constitution Can Amend

```
VIOLATION DETECTED → Negotiate:
  1. COMPLY (use compliant alternative)
  2. BYPASS (override with justification)
  3. AMEND (propose constitution change)
```

**Why:** Static rules block innovation. Family uses simulation to make server-tick feel instant. Figma uses hybrid sync. Rules must evolve.

### Law 5: Cohesion over Technology

```
Check: Does this component COHERE with its neighbors?
Not:   Does this component COMPLY with pixel rules?
```

**Why:** The Mod Ghost lesson. Technically superior OSRS assets were rejected because they clashed visually. 117 HD was accepted because it cohered.

### Law 6: Workflow is Soul

```yaml
# sigil-mark/kernel/workflow.yaml
method: cycles  # Not sprints
forbidden: [sprint, backlog, story_points]
```

**Why:** Linear isn't just fast components. It's a specific method of working. Building a "Sprint Backlog" for a Cycles team violates the product soul.

### Law 7: Capture the Why

```tsx
// @sigil-override: no-shadows
// Reason: Marketing page needs depth
<Card className="shadow-lg" />
```

**Why:** One good justification is worth more than 15% silent mutiny. Capture immediately, not at threshold.

---

## 3. System Architecture

### 3.1 High-Level View

```
┌─────────────────────────────────────────────────────────────────┐
│                        ARTIST LAYER                             │
│  Input: Natural language about FEEL                             │
│  Output: Code (messy is fine during draft)                      │
│  Polish: On demand, when ready                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SKILL LAYER                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │  SCANNING   │ │  ANALYZING  │ │  AUDITING   │               │
│  │  SANCTUARY  │ │  DATA RISK  │ │  COHESION   │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ NEGOTIATING │ │ SIMULATING  │ │  POLISHING  │               │
│  │  INTEGRITY  │ │ INTERACTION │ │    CODE     │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     GOVERNANCE LAYER                            │
│  Status Propagation │ Amendment Protocol │ Justification Log    │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow

```
/craft "transfer button"
         │
         ▼
┌────────────────┐
│    SCANNING    │  rg "@sigil-tier gold" -l
│   SANCTUARY    │  rg "@sigil-data-type Money" -l
│                │  Returns: TransferButton.tsx
│                │  Latency: < 50ms
└───────┬────────┘
        │
        ▼
┌────────────────┐
│   ANALYZING    │  Signature: (amount: Money) => ...
│   DATA RISK    │  Lookup: Money → server-tick
│                │  Requires: simulation, confirmation
│                │  Forbids: useOptimistic
└───────┬────────┘
        │
        ▼
┌────────────────┐
│   AUDITING     │  Context: Dashboard with flat cards
│   COHESION     │  Generated: shadow-lg
│  (optional)    │  Report: "Variance detected"
└───────┬────────┘
        │
        ▼
┌────────────────┐
│   GENERATE     │  Apply Chrono-Kernel:
│                │    simulate → confirm → commit → reconcile
│                │  Inject simulation layer for Money
└───────┬────────┘
        │
        ▼
┌────────────────┐
│    STREAM      │  Ghost text (Summon Protocol)
│                │  Tab to accept, Esc to reject
└────────────────┘
```

---

## 4. The Kernel

The Kernel is always loaded in the agent's system prompt (~600 tokens). No lookup required.

### 4.1 Constitution

```yaml
# sigil-mark/kernel/constitution.yaml

data_physics:
  
  financial:
    types: [Money, Balance, Transfer, Withdrawal, Deposit]
    physics: server-tick
    requires:
      - simulation      # Preview before commit
      - confirmation    # Explicit user action
      - explicit-pending
    forbidden:
      - useOptimistic
      - instant-commit
    rationale: "Loss of funds is irreversible. Wait for truth."
    
  health:
    types: [Health, HP, Hardcore, Permadeath]
    physics: server-tick
    requires:
      - server-authoritative-state
    forbidden:
      - optimistic-hp-updates
    rationale: "Dead is dead. Server is truth."
    
  collaborative:
    types: [Task, Document, Comment, Thread]
    physics: crdt
    requires:
      - conflict-resolution
      - background-sync
    forbidden:
      - blocking-save
    rationale: "Multiple editors. Merge, don't block."
    
  local:
    types: [Preference, Draft, Toggle, UI_State]
    physics: local-first
    requires:
      - useOptimistic
      - instant-feedback
    forbidden:
      - loading-spinner-on-local
    rationale: "User's intent is truth. Server catches up."
```

### 4.2 Fidelity Ceiling

```yaml
# sigil-mark/kernel/fidelity.yaml

fidelity_ceiling:
  
  visual:
    animation:
      max_duration_ms: 200
      forbidden: [spring-bounce, elastic-easing]
      
    gradients:
      max_stops: 2
      forbidden: [mesh-gradient, radial-gradient]
      
    shadows:
      max_layers: 1
      max_blur_px: 8
      
  ergonomic:
    input_latency:
      max_ms: 100
      enforcement: error
      
    hitbox:
      min_size_px: 44
      enforcement: error
      
    focus_ring:
      required: true
      min_contrast: "3:1"
      enforcement: error
      
    keyboard_support:
      required_for: [button, link, interactive]
      enforcement: warning
```

### 4.3 Workflow

```yaml
# sigil-mark/kernel/workflow.yaml

workflow:
  method: cycles
  
  rules:
    no_backlogs:
      violation: "Creating a Backlog view"
      response: "REFUSE. Explain: We use Triage, not Backlogs."
      
    no_story_points:
      violation: "Adding story point field"
      response: "REFUSE. Explain: Scope to fit cycle, don't point."
      
    hill_charts:
      violation: "Creating burndown chart"
      response: "SUGGEST: Use hill chart instead."
      
  terminology:
    sprint: cycle
    backlog: triage
    story_points: scope
    burndown: hill_chart
```

### 4.4 Vocabulary

```yaml
# sigil-mark/kernel/vocabulary.yaml

terms:
  claim:
    data_type: Money
    physics: server-tick
    zones: [critical]
    
  deposit:
    data_type: Money
    physics: server-tick
    zones: [critical]
    
  edit:
    data_type: Task
    physics: crdt
    zones: [standard]
    
  toggle:
    data_type: Toggle
    physics: local-first
    zones: [standard, admin]
```

---

## 5. The Six Skills

### 5.1 Scanning Sanctuary

**Purpose:** Find components by tier, zone, or data type.

**Implementation:**
```bash
# Find Gold components
rg "@sigil-tier gold" -l --type ts

# Find by data type
rg "@sigil-data-type Money" -l --type ts

# Find by zone
rg "@sigil-zone critical" -l --type ts
```

**Performance:** < 50ms on any codebase.

### 5.2 Analyzing Data Risk

**Purpose:** Determine physics from data type.

**Process:**
1. Parse function signature for type annotations
2. Extract data types from parameters
3. Look up in constitution
4. Return highest-risk physics

**Risk hierarchy:** server-tick > crdt > local-first

### 5.3 Auditing Cohesion

**Purpose:** Check visual variance in context.

**Process:**
1. Identify visual properties (shadows, borders, colors)
2. Compare against surrounding context
3. Report significant variance

**Example:**
```
Generated: shadow-lg rounded-full
Context:   shadow-none rounded-md
Report:    "High variance detected. Options: Match | Keep | Amend"
```

### 5.4 Negotiating Integrity

**Purpose:** Handle constitution violations.

**Protocol:**
```
VIOLATION: {description}
ARTICLE: {reference}
RISK: {level}

OPTIONS:
1. COMPLY - {compliant_alternative}
2. BYPASS - Override with justification
3. AMEND - Propose constitution change
```

### 5.5 Simulating Interaction

**Purpose:** Verify timing meets physics.

**Measurements:**
- click_to_feedback: < 100ms
- keypress_to_action: < 50ms
- hover_to_tooltip: < 200ms

**Tool:** Playwright/Puppeteer headless browser.

### 5.6 Polishing Code

**Purpose:** Standardize on demand.

**Triggers:**
- User runs `/polish`
- Pre-commit hook
- CI check

**Process:**
1. Scan for violations
2. Generate fixes
3. Present diff
4. Apply on approval

---

## 6. Status Propagation

### 6.1 The Rule

```
Tier(Component) = min(DeclaredTier, Tier(Dependencies))
```

### 6.2 Behavior

| Scenario | Result |
|----------|--------|
| Gold imports Gold | Stays Gold |
| Gold imports Silver | Becomes Silver |
| Gold imports Draft | Becomes Draft |

### 6.3 Recovery

When the dependency upgrades, status recalculates automatically.

### 6.4 Implementation

```typescript
function calculateEffectiveTier(
  component: string,
  declaredTier: Tier,
  dependencies: string[]
): Tier {
  const depTiers = dependencies.map(d => getTier(d));
  const minDepTier = Math.min(...depTiers.map(tierToNumber));
  return Math.min(tierToNumber(declaredTier), minDepTier);
}
```

---

## 7. JIT Polish

### 7.1 The Problem with Auto-Fix

Engineers need messy code:
- `border: 1px solid red` for debugging
- `console.log()` for tracing
- Incomplete implementations during iteration

### 7.2 The Solution

```
DURING COMPOSITION:
  Linter marks violations (subtle underline)
  Linter does NOT fix them
  
ON /polish:
  Agent shows diff
  User approves or rejects
  
ON COMMIT:
  Pre-commit hook runs /polish
  Clean history enforced at gate
```

### 7.3 Violation Types

| Type | Fix |
|------|-----|
| inline_style | Convert to design tokens |
| custom_color | Use theme color |
| missing_focus | Add focus ring |
| wrong_spacing | Use spacing scale |

---

## 8. The Amendment Protocol

### 8.1 Why Amendments?

Static rules block innovation:
- Family uses simulation to make server-tick feel instant
- Figma uses hybrid sync (cursors optimistic, deletions consistent)
- Rules must evolve

### 8.2 The Protocol

When violation detected:

```
VIOLATION: Optimistic update on Money type
ARTICLE: data_physics.financial
RISK: HIGH

OPTIONS:
1. COMPLY - Use simulation preview (feels instant, actually safe)
2. BYPASS - Override with justification (logged)
3. AMEND - Propose constitution change (team review)
```

### 8.3 Justification Capture

On BYPASS:
```tsx
// @sigil-override: server-tick
// Reason: Read-only balance display, no mutation risk
<OptimisticBalance amount={balance} />
```

Logged to `sigil-mark/governance/justifications.log`.

### 8.4 Amendment Flow

On AMEND:
1. Agent generates amendment proposal
2. PR opened to `sigil-mark/governance/amendments/`
3. Team reviews
4. If approved, constitution updated

---

## 9. The Chrono-Kernel

### 9.1 The Three-State Model

Critical actions have three states:

```
PREDICTION (The Lie)
  - Instant feedback on user action
  - Shows what WILL happen
  
TRUTH (The Server)
  - Actual result from authority
  - May confirm or contradict
  
RECONCILIATION (The Merge)
  - If truth matches: smooth transition
  - If truth contradicts: snap back + explain
```

### 9.2 The Four-State Hook

For Money types:

```
idle → simulating → confirming → committing → done
                                          ↘ error
```

### 9.3 Implementation

```typescript
const {
  simulate,    // Preview what WILL happen
  confirm,     // User says "yes, do it"
  commit,      // Execute on server
  reconcile,   // Handle result
  state,
  preview,
} = useSigilMutation({ mutation, dataType: 'Money' });
```

---

## 10. Implementation Details

### 10.1 JSDoc Pragmas

Components declare status via JSDoc:

```typescript
/**
 * @sigil-tier gold
 * @sigil-zone critical
 * @sigil-data-type Money
 */
export function TransferButton({ amount }: { amount: Money }) {
  // ...
}
```

**Discovery:**
```bash
rg "@sigil-tier gold" -l
```

**Zero runtime cost.** Compilers ignore comments.

### 10.2 No Cache

**Deleted:** `sigil.map`

**Reason:** Cache invalidation is one of the hardest problems. Branch switch, git merge, external edit—all cause drift. Live grep is fast enough (< 50ms).

### 10.3 Pre-Commit Hook

```bash
#!/bin/sh
# .husky/pre-commit

npx sigil polish --check

if [ $? -ne 0 ]; then
  echo "Sigil violations detected. Run /polish to fix."
  exit 1
fi
```

### 10.4 CI Integration

```yaml
# .github/workflows/sigil.yml
jobs:
  sigil:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check Sigil compliance
        run: npx sigil polish --ci
```

---

## Summary

| Aspect | Implementation |
|--------|----------------|
| Component lookup | Live grep (ripgrep) |
| Physics determination | Type-driven constitution |
| Code fixing | JIT on demand |
| Import rules | Status propagation |
| Constitution | Amendment protocol |
| Visual checks | Cohesion overlay |
| Timing checks | Playwright simulation |

---

*Sigil v5.9 "The Lucid Studio"*  
*"Filesystem is truth. Agency stays with human. Rules evolve."*
