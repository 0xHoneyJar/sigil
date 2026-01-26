# SDD: Sigil Simplification & UNIX Decomposition

**Version**: 1.1
**Date**: 2026-01-25
**Status**: Draft
**PRD Reference**: `grimoires/loa/prd-sigil-simplification.md`

---

## Executive Summary

This SDD defines the technical architecture for decomposing Sigil from a 6,231-line monolith into three focused constructs following UNIX philosophy:

| Construct | Domain | Rules | Command | Task Skill | Reference Skills |
|-----------|--------|-------|---------|------------|------------------|
| **Sigil** | Taste | ~150 | /sigil | `observing` | — |
| **Glyph** | Craft | ~860 | /glyph | `crafting` | `physics-reference`, `patterns-reference` |
| **Rigor** | Correctness | ~300 | /rigor | `enforcing` | — |

**Key architectural decisions** (per Anthropic best practices):
- **One command per construct** — dead simple
- **Task skills with `disable-model-invocation: true`** — user-invoked workflows
- **Reference skills with `user-invocable: false`** — knowledge loaded by task skills
- **SKILL.md under 500 lines** — keep skills focused
- Native `paths:` frontmatter for rule loading (no custom RLM)

---

## System Architecture

### High-Level Structure

```
.claude/
├── rules/
│   ├── sigil/           # Taste (WHY)
│   │   ├── 00-sigil-core.md
│   │   └── 01-sigil-taste.md
│   │
│   ├── glyph/           # Craft (HOW)
│   │   ├── 00-glyph-core.md
│   │   ├── 01-glyph-physics.md
│   │   ├── 02-glyph-detection.md
│   │   ├── 03-glyph-protected.md
│   │   ├── 04-glyph-patterns.md
│   │   ├── 05-glyph-animation.md
│   │   ├── 06-glyph-material.md
│   │   └── 07-glyph-practices.md
│   │
│   └── rigor/           # Correctness (WHAT)
│       ├── 00-rigor-core.md
│       ├── 01-rigor-data.md
│       └── 02-rigor-web3.md
│
├── commands/
│   ├── sigil.md         # /sigil → invokes observing
│   ├── glyph.md         # /glyph → invokes crafting
│   └── rigor.md         # /rigor → invokes enforcing
│
└── skills/
    ├── observing/           # Task: taste capture
    ├── crafting/            # Task: design physics + validation
    ├── enforcing/           # Task: data correctness
    ├── physics-reference/   # Reference: physics tables (loaded by crafting)
    ├── patterns-reference/  # Reference: golden patterns (loaded by crafting)
    └── agent-browser/       # Utility (unchanged)

grimoires/
└── sigil/
    ├── taste.md             # Append-only taste log
    └── observations/        # Structured observation files
```

### Construct Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Workflow                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   User talks to customers                                        │
│           │                                                      │
│           ▼                                                      │
│   ┌───────────────┐                                              │
│   │    SIGIL      │  /sigil → observing → taste.md              │
│   │    (Taste)    │  "Why should it feel this way?"             │
│   └───────┬───────┘                                              │
│           │ reads                                                │
│           ▼                                                      │
│   ┌───────────────┐                                              │
│   │    GLYPH      │  /glyph → crafting → component code         │
│   │    (Craft)    │  "How do we achieve that feel?"             │
│   │               │  + validation (ward merged in)              │
│   └───────┬───────┘                                              │
│           │ validates                                            │
│           ▼                                                      │
│   ┌───────────────┐                                              │
│   │    RIGOR      │  /rigor → enforcing → correctness check     │
│   │ (Correctness) │  "What must be true?"                       │
│   └───────────────┘                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Design

### 1. Sigil (Taste System)

**Purpose**: Capture artist intuition from user conversations.

**Philosophy**: Free-form insights, not structured signals.

#### Files

| File | Lines | Purpose |
|------|-------|---------|
| `00-sigil-core.md` | ~50 | Philosophy, when to use /observe |
| `01-sigil-taste.md` | ~100 | How to read and apply taste.md |

#### 00-sigil-core.md Structure

```markdown
# Sigil: Taste Core

Sigil captures the artist's intuition — why things should feel a certain way.

## When to Use

- After user conversations (Mom Test insights)
- When observing users interact with the product
- When inspiration strikes from other products
- When stepping back reveals a pattern

## Philosophy

Taste is NOT:
- Automated signal detection
- ACCEPT/MODIFY/REJECT weights
- Structured YAML schemas

Taste IS:
- Human insights in plain language
- Patterns noticed over time
- The "why" behind design decisions

## Command

`/observe` — Add insight to taste.md
```

#### 01-sigil-taste.md Structure

```markdown
# Sigil: Reading Taste

How Glyph reads and applies taste when crafting.

## Location

`grimoires/sigil/taste.md` — Append-only log

## Format

Free-form markdown with date headers:

```
## 2026-01-25

Insight from user conversation...
```

## Applying Taste

When /craft runs:
1. Read taste.md
2. Find insights relevant to component type
3. Surface in analysis box
4. Let insight inform physics choices

## Examples

Taste says: "Users want to feel confident before claiming"
Glyph applies: 800ms timing, confirmation required, prominent amount
```

#### taste.md Format

```markdown
# Taste Log

Append-only insights from user conversations, observations, and inspiration.
No schema. No weights. Just human insights that Claude reads and applies.

---

## 2026-01-25

[Insights go here, free-form]

---
```

---

### 2. Glyph (Design Physics)

**Purpose**: Apply correct physics to UI components.

**Philosophy**: The physics table is the gem. Everything else supports it.

#### Files

| File | Lines | Purpose |
|------|-------|---------|
| `00-glyph-core.md` | ~100 | Instruction priority, permissions, action default |
| `01-glyph-physics.md` | ~70 | THE physics table (6 effects × 4 columns) |
| `02-glyph-detection.md` | ~150 | Effect detection + merged keywords |
| `03-glyph-protected.md` | ~80 | Non-negotiable capabilities |
| `04-glyph-patterns.md` | ~100 | 3 golden patterns (Financial, Standard, Local) |
| `05-glyph-animation.md` | ~80 | Animation essentials (easing, springs, timing) |
| `06-glyph-material.md` | ~80 | Material essentials (surface, shadow, radius) |
| `07-glyph-practices.md` | ~200 | Best practices (WCAG, React, performance) |

#### 00-glyph-core.md Structure

```markdown
# Glyph: Core

Glyph applies design physics to UI components.

## Instruction Priority

1. Protected capabilities (03) — Never violate
2. Physics table (01) — The source of truth
3. Taste (from Sigil) — Informs choices
4. Best practices (07) — Implementation quality

## Action Default

After user confirms analysis: generate complete, working code immediately.

DO:
- Write complete code
- Match codebase conventions
- Apply physics from table

DO NOT:
- Ask "would you like me to generate?"
- Provide partial implementations
- Add unnecessary comments

## Permissions

Proactive (no ask): Read files, show analysis, detect effect
Requires confirmation: Write component files
Never: Skip protected capability checks
```

#### 01-glyph-physics.md Structure

```markdown
# Glyph: Physics Table

The source of truth. 6 effects, 4 columns.

| Effect | Sync | Timing | Confirmation |
|--------|------|--------|--------------|
| Financial | Pessimistic | 800ms | Required |
| Destructive | Pessimistic | 600ms | Required |
| Soft Delete | Optimistic | 200ms | Toast+Undo |
| Standard | Optimistic | 200ms | None |
| Navigation | Immediate | 150ms | None |
| Local | Immediate | 100ms | None |

## Sync Strategies

**Pessimistic**: Server confirms before UI updates.
- Use for: Money, irreversible actions
- User sees: Pending → Success/Failure

**Optimistic**: UI updates immediately, rolls back on error.
- Use for: Reversible actions, low stakes
- User sees: Instant change, rare rollback

**Immediate**: No server round-trip.
- Use for: Client-only state (theme, toggles)
- User sees: Instant response

## Why These Timings

800ms (Financial): Time for users to verify amount + mentally commit
200ms (Standard): Perceived as "instant" while allowing visual feedback
100ms (Local): No network latency to hide, instant expected
```

#### 02-glyph-detection.md Structure

```markdown
# Glyph: Effect Detection

Detect effect from keywords, types, and context.

## Priority

1. Types — Currency, Wei, Token, BigInt → Always Financial
2. Keywords — See tables below
3. Context — "with undo", "for wallet" modify effect

## Keywords

### Financial
claim, deposit, withdraw, transfer, swap, send, pay, purchase,
mint, burn, stake, unstake, bridge, approve, redeem

### Destructive
delete, remove, destroy, revoke, terminate, close, end

### Soft Delete
archive, hide, trash, dismiss, snooze (or "with undo" context)

### Standard
save, update, edit, create, add, like, follow, bookmark, comment

### Local
toggle, switch, expand, collapse, select, focus, show, hide

## Ambiguity Resolution

| Question | If Yes | If No |
|----------|--------|-------|
| Can it be undone? | Optimistic | Pessimistic |
| Involves money/tokens? | Financial | Check other |
| Hits a server? | Optimistic/Pessimistic | Immediate |
| Has undo button? | Soft Delete | Destructive |
```

#### 03-glyph-protected.md Structure

```markdown
# Glyph: Protected Capabilities

Non-negotiable. Take priority over all other rules.

## Capabilities

| Capability | Rule | Why |
|------------|------|-----|
| Withdraw | Always reachable | Users must access funds |
| Cancel | Always visible | Every flow needs escape |
| Balance | Always accurate | Stale data = harm |
| Error Recovery | Always available | No dead ends |
| Touch Target | Min 44px | Accessibility |
| Focus Ring | Always visible | Keyboard navigation |

## Verification Checklist

Before generating financial components:
- [ ] Cancel button present (even during loading)
- [ ] Amount displayed before confirmation
- [ ] Balance shown and current
- [ ] Error state has retry option
- [ ] No optimistic updates for money

## Forbidden Patterns

| Pattern | Why | Fix |
|---------|-----|-----|
| `{!isPending && <Cancel />}` | User trapped | Always show cancel |
| `onMutate` for financial | Can't rollback money | Pessimistic sync |
| No confirmation for delete | Accidental loss | Require confirmation |
```

#### 04-glyph-patterns.md Structure

```markdown
# Glyph: Golden Patterns

Three reference implementations. Adapt to project conventions.

## 1. Financial (ClaimButton)

Physics: Pessimistic, 800ms, confirmation required

```tsx
function ClaimButton({ amount, onSuccess }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const { mutate, isPending } = useMutation({
    mutationFn: () => claim(amount),
    // NO onMutate - pessimistic
  })

  if (!showConfirm) {
    return <button onClick={() => setShowConfirm(true)}>
      Claim {formatAmount(amount)}
    </button>
  }

  return (
    <div>
      <p>Claim {formatAmount(amount)}?</p>
      <button onClick={() => setShowConfirm(false)}>Cancel</button>
      <button onClick={() => mutate()} disabled={isPending}>
        {isPending ? 'Claiming...' : 'Confirm'}
      </button>
    </div>
  )
}
```

## 2. Standard (LikeButton)

Physics: Optimistic, 200ms, no confirmation

```tsx
function LikeButton({ postId, isLiked }) {
  const { mutate } = useMutation({
    mutationFn: () => toggleLike(postId),
    onMutate: async () => {
      // Optimistic update
      queryClient.setQueryData(['post', postId], old => ({
        ...old, isLiked: !old.isLiked
      }))
    },
    onError: () => {
      // Rollback
      queryClient.invalidateQueries(['post', postId])
    }
  })

  return <button onClick={() => mutate()}>
    {isLiked ? '❤️' : '🤍'}
  </button>
}
```

## 3. Local (ThemeToggle)

Physics: Immediate, 100ms, no confirmation

```tsx
function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
    {theme === 'dark' ? '☀️' : '🌙'}
  </button>
}
```
```

#### 05-glyph-animation.md Structure

```markdown
# Glyph: Animation

Animation makes physics visible.

## Easing Blueprint

| Easing | When | Why |
|--------|------|-----|
| ease-out | Entering | Fast start = responsive |
| ease-in-out | Morphing | Natural acceleration |
| spring | Organic motion | Interruptible, natural |
| linear | ONLY progress bars | Constant for time |

## Spring Presets

| Name | Stiffness | Damping | Use For |
|------|-----------|---------|---------|
| Snappy | 700 | 35 | Local state, toggles |
| Responsive | 500 | 30 | Standard mutations |
| Organic | 300 | 25 | Drag, morphs |
| Deliberate | 200 | 30 | Financial, important |

## Timing by Effect

| Effect | Timing | Easing |
|--------|--------|--------|
| Financial | 800ms | ease-out |
| Destructive | 600ms | ease-out |
| Soft Delete | 200ms | spring(500) |
| Standard | 200ms | spring(500) |
| Local | 100ms | spring(700) |

## Performance

Only animate: transform, opacity (GPU accelerated)
Avoid: width, height, margin, padding (triggers layout)
Always: Respect prefers-reduced-motion
```

#### 06-glyph-material.md Structure

```markdown
# Glyph: Material

Material is how physics looks.

## Fidelity by Effect

| Effect | Shadow | Border | Radius |
|--------|--------|--------|--------|
| Financial | 1 soft | Solid | 4-8px |
| Destructive | None/glow | Strong | 4-8px |
| Standard | 1 | Optional | 8-12px |
| Local | Minimal | Subtle | Flexible |

## Constraints

| Element | Max |
|---------|-----|
| Gradients | 2 stops |
| Shadows | 1 layer |
| Borders | 1px (2px for focus) |
| Radius | 16px (pill = 9999px) |

## Touch Targets

| Context | Minimum |
|---------|---------|
| Mobile | 44×44px |
| Desktop | 32×32px |

## Contrast

WCAG AA: 4.5:1 minimum
```

#### 07-glyph-practices.md Structure

```markdown
# Glyph: Best Practices

Consolidated from React rules. Essential patterns only.

## Accessibility (WCAG)

- Touch targets: 44px minimum
- Focus rings: Always visible (2px, contrasting)
- Contrast: 4.5:1 for text
- Reduced motion: Respect prefers-reduced-motion
- Labels: All interactive elements need accessible names

## Async Patterns

### Suspense Boundaries
Wrap async components in Suspense for loading states:
```tsx
<Suspense fallback={<Skeleton />}>
  <AsyncComponent />
</Suspense>
```

### Parallel Fetching
Don't waterfall:
```tsx
// Bad: sequential
const user = await fetchUser()
const posts = await fetchPosts()

// Good: parallel
const [user, posts] = await Promise.all([
  fetchUser(),
  fetchPosts()
])
```

## Bundle Optimization

### Direct Imports
```tsx
// Bad: imports entire library
import { Check } from 'lucide-react'

// Good: imports only icon
import Check from 'lucide-react/dist/esm/icons/check'
```

### Dynamic Imports
```tsx
const HeavyComponent = dynamic(() => import('./Heavy'), {
  ssr: false
})
```

## Performance

### Memoization
Extract expensive computations:
```tsx
const ExpensiveChild = memo(function({ data }) {
  const processed = useMemo(() => process(data), [data])
  return <div>{processed}</div>
})
```

### Transitions
Mark non-urgent updates:
```tsx
startTransition(() => {
  setFilteredItems(filter(items))
})
```

## Server Components

### Minimize Serialization
Only pass needed props across RSC boundary:
```tsx
// Bad: passes entire user object
<ClientComponent user={user} />

// Good: passes only needed field
<ClientComponent userName={user.name} />
```
```

---

### 3. Rigor (Data Correctness)

**Purpose**: Prevent data bugs in Web3 flows.

**Philosophy**: Correctness over feel. A component can feel right but be wrong.

#### Files

| File | Lines | Purpose |
|------|-------|---------|
| `00-rigor-core.md` | ~50 | Philosophy, when to use /rigor |
| `01-rigor-data.md` | ~100 | Indexed vs on-chain decisions |
| `02-rigor-web3.md` | ~150 | BigInt, receipts, stale closures |

#### 00-rigor-core.md Structure

```markdown
# Rigor: Core

Rigor enforces data correctness. Different from Glyph.

Glyph: "Does it feel right?"
Rigor: "Is it correct?"

A button can feel great (800ms, confirmation) but show stale data.

## When to Use

- Web3 data flows (stake, claim, swap)
- Financial displays (balances, amounts)
- Transaction-dependent UI (button states)

## Command

`/rigor` — Validate data correctness in component
```

#### 01-rigor-data.md Structure

```markdown
# Rigor: Data Sources

Choose data source by use case, not by default.

## Decision Table

| Use Case | Source | Rationale |
|----------|--------|-----------|
| Display (read-only) | Indexed | Faster, acceptable stale |
| Transaction amounts | On-chain | Must be accurate |
| Button visibility | On-chain | Prevents failed tx |
| Balance display | On-chain | Users verify before tx |
| Historical queries | Indexed | Optimized for aggregation |

## Anti-Pattern: Fallback Chains

```tsx
// BAD: Hides which source is used
const shares = envio ?? onChain ?? 0n

// GOOD: Explicit per use case
const displayShares = envioData?.shares ?? '—'  // Display: OK stale
const txShares = onChainData?.shares            // Transaction: must be fresh
const canAct = (txShares ?? 0n) > 0n            // Button: must be fresh
```

## Default Rule

When in doubt, use on-chain. Indexed is optimization, not truth.
```

#### 02-rigor-web3.md Structure

```markdown
# Rigor: Web3 Patterns

Patterns that prevent $100k bugs.

## BigInt Safety

0n is falsy in JavaScript:
```tsx
if (0n) console.log('true')  // Never prints!
```

Safe patterns:
```tsx
// Check existence AND positive
if (amount != null && amount > 0n) { ... }

// With default for display
const display = amount ?? 0n
```

## Receipt Guards

Prevent re-execution when receipt updates:
```tsx
const [lastHash, setLastHash] = useState<string>()

useEffect(() => {
  if (!receipt) return
  if (receipt.transactionHash === lastHash) return
  setLastHash(receipt.transactionHash)
  // Process receipt once
}, [receipt])
```

## Stale Closure Prevention

useEffect callbacks capture state at creation:
```tsx
// BAD: amount may be stale
useEffect(() => {
  if (receipt) process(amount)
}, [receipt])

// GOOD: use ref
const amountRef = useRef(amount)
amountRef.current = amount

useEffect(() => {
  if (receipt) process(amountRef.current)
}, [receipt])
```

## Multi-Step Flows

For approve → execute patterns:
```tsx
type TxState = 'idle' | 'approve_pending' | 'approve_success' |
               'execute_pending' | 'success' | 'error'

// Each step needs:
// 1. Receipt guard (don't re-trigger)
// 2. Error handling (rollback to previous state)
// 3. Amount from on-chain at execution time
```
```

---

## Command Design

Commands are thin — they invoke skills. One command per construct.

### sigil.md

```markdown
---
name: sigil
description: Capture taste insight
skill: observing
---

# /sigil

Invoke the `observing` skill to capture taste insights.

## Usage

/sigil "Users hesitate at confirmation - too much text"
/sigil (prompts for insight)

## Invokes

`observing` skill → See skills/observing/SKILL.md
```

### glyph.md

```markdown
---
name: glyph
description: Generate or validate UI with design physics
skill: crafting
---

# /glyph

Invoke the `crafting` skill to generate or validate components.

## Usage

/glyph "claim button for staking rewards"   # Generate
/glyph validate src/components/Claim.tsx    # Validate (ward merged)
/glyph "dark mode toggle"                   # Generate

## Invokes

`crafting` skill → See skills/crafting/SKILL.md
```

### rigor.md

```markdown
---
name: rigor
description: Validate data correctness
skill: enforcing
---

# /rigor

Invoke the `enforcing` skill to check data correctness.

## Usage

/rigor src/components/StakePanel.tsx
/rigor (checks current file)

## Invokes

`enforcing` skill → See skills/enforcing/SKILL.md
```

---

## Skill Design

Following Anthropic's official Claude Code best practices:

**Key principles:**
- Skills are the recommended extension pattern (not rule hierarchies)
- SKILL.md should be under 500 lines
- Use `disable-model-invocation: true` for workflows with side effects
- Put detailed reference in separate files, referenced from SKILL.md
- Use frontmatter to control invocation behavior

**Skill types:**
- **Task skills**: Workflows user invokes (generate, validate)
- **Reference skills**: Knowledge Claude applies (physics tables, patterns)

**Naming**: Gerunds (`observing`, `crafting`, `enforcing`)

---

### observing/SKILL.md (Task Skill)

```markdown
---
name: observing
description: Capture taste insights from user conversations
user-invocable: true
disable-model-invocation: true
allowed-tools: Read, Write
---

# Observing

Capture insights from user conversations using Mom Test principles.

## Workflow

1. If no insight provided, ask: "What did you observe or hear?"
2. Read grimoires/sigil/taste.md
3. Append insight with today's date
4. Confirm: "Added to taste log."

## Mom Test Reminders

- Focus on past behavior, not future intentions
- Ask about specific instances
- Listen for the problem behind the request
```

**~30 lines** — No rules to load, just simple append workflow.

---

### crafting/SKILL.md (Task Skill)

```markdown
---
name: crafting
description: Generate or validate UI with design physics
user-invocable: true
disable-model-invocation: true
allowed-tools: Read, Write, Glob
---

# Crafting

Apply design physics to generate or validate UI components.

## Modes

| Input | Mode |
|-------|------|
| `/glyph "claim button"` | Generate |
| `/glyph validate file.tsx` | Validate |

## Generate Workflow

1. Detect effect type from keywords (Financial/Destructive/Standard/Local)
2. Look up physics (see: physics-reference skill)
3. Check protected capabilities
4. Read taste.md for insights
5. Show compact analysis, generate code
6. Let user interrupt/correct if needed (no modal confirmation)

## Validate Workflow

1. Detect effect type
2. Check physics compliance
3. Check protected capabilities
4. Output report

## Reference

For detailed physics tables, see `physics-reference` skill.
For golden patterns, see `patterns-reference` skill.
```

**~50 lines** — Workflow only. Detailed reference in separate skills.

---

### enforcing/SKILL.md (Task Skill)

```markdown
---
name: enforcing
description: Validate data correctness in Web3 components
user-invocable: true
disable-model-invocation: true
allowed-tools: Read, Glob, Grep
---

# Enforcing

Check components for data correctness issues.

## Workflow

1. Parse file for data patterns
2. Check: indexed vs on-chain appropriate?
3. Check: BigInt falsy patterns
4. Check: receipt guards present?
5. Check: stale closure risks?
6. Output report

## Quick Reference

| Use Case | Source |
|----------|--------|
| Display | Indexed OK |
| Transaction amounts | On-chain required |
| Button visibility | On-chain required |

## BigInt Safety

```js
// WRONG: 0n is falsy
if (amount) { ... }

// CORRECT
if (amount != null && amount > 0n) { ... }
```
```

**~50 lines** — Essential checks inline, no external rule loading needed.

---

### physics-reference/SKILL.md (Reference Skill)

```markdown
---
name: physics-reference
description: Design physics tables and timing rationale
user-invocable: false
---

# Physics Reference

## The Physics Table

| Effect | Sync | Timing | Confirmation |
|--------|------|--------|--------------|
| Financial | Pessimistic | 800ms | Required |
| Destructive | Pessimistic | 600ms | Required |
| Soft Delete | Optimistic | 200ms | Toast+Undo |
| Standard | Optimistic | 200ms | None |
| Navigation | Immediate | 150ms | None |
| Local | Immediate | 100ms | None |

## Sync Strategies

**Pessimistic**: Server confirms before UI updates.
- Money, irreversible actions
- User sees: Pending → Success/Failure

**Optimistic**: UI updates immediately, rolls back on error.
- Reversible, low stakes
- User sees: Instant change, rare rollback

**Immediate**: No server round-trip.
- Client-only state
- User sees: Instant response

## Why These Timings

- 800ms (Financial): Time for users to verify amount + commit
- 200ms (Standard): Perceived as "instant" with visual feedback
- 100ms (Local): No network latency, instant expected

## Protected Capabilities

| Capability | Rule |
|------------|------|
| Withdraw | Always reachable |
| Cancel | Always visible |
| Balance | Always accurate |
| Touch target | 44px minimum |
| Focus ring | Always visible |
```

**~80 lines** — Loaded by `crafting` skill when needed.

---

### patterns-reference/SKILL.md (Reference Skill)

```markdown
---
name: patterns-reference
description: Golden implementation patterns for each effect type
user-invocable: false
---

# Golden Patterns

## Financial (ClaimButton)

```tsx
function ClaimButton({ amount, onSuccess }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const { mutate, isPending } = useMutation({
    mutationFn: () => claim(amount),
    // NO onMutate - pessimistic
  })

  if (!showConfirm) {
    return <button onClick={() => setShowConfirm(true)}>
      Claim {formatAmount(amount)}
    </button>
  }

  return (
    <div>
      <p>Claim {formatAmount(amount)}?</p>
      <button onClick={() => setShowConfirm(false)}>Cancel</button>
      <button onClick={() => mutate()} disabled={isPending}>
        {isPending ? 'Claiming...' : 'Confirm'}
      </button>
    </div>
  )
}
```

## Standard (LikeButton)

```tsx
function LikeButton({ postId, isLiked }) {
  const { mutate } = useMutation({
    mutationFn: () => toggleLike(postId),
    onMutate: async () => {
      queryClient.setQueryData(['post', postId], old => ({
        ...old, isLiked: !old.isLiked
      }))
    },
    onError: () => queryClient.invalidateQueries(['post', postId])
  })

  return <button onClick={() => mutate()}>
    {isLiked ? '❤️' : '🤍'}
  </button>
}
```

## Local (ThemeToggle)

```tsx
function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
    {theme === 'dark' ? '☀️' : '🌙'}
  </button>
}
```
```

**~80 lines** — Loaded by `crafting` skill when generating code.

---

### Skill Architecture Summary

```
.claude/skills/
├── observing/           # Task: /sigil command
│   └── SKILL.md         # ~30 lines, disable-model-invocation: true
│
├── crafting/            # Task: /glyph command
│   └── SKILL.md         # ~50 lines, disable-model-invocation: true
│
├── enforcing/           # Task: /rigor command
│   └── SKILL.md         # ~50 lines, disable-model-invocation: true
│
├── physics-reference/   # Reference: loaded by crafting
│   └── SKILL.md         # ~80 lines, user-invocable: false
│
├── patterns-reference/  # Reference: loaded by crafting
│   └── SKILL.md         # ~80 lines, user-invocable: false
│
└── agent-browser/       # Utility (unchanged)
```

**Total skill content: ~290 lines**

### Frontmatter Reference

| Field | Purpose |
|-------|---------|
| `user-invocable: true` | Can be invoked with `/skillname` |
| `user-invocable: false` | Reference only, loaded by other skills |
| `disable-model-invocation: true` | Claude won't auto-trigger; only user invokes |
| `allowed-tools` | Restrict tools available to skill |

---

## Data Architecture

### grimoires/sigil/taste.md

**Type**: Append-only markdown log
**Location**: `grimoires/sigil/taste.md`
**Format**: Free-form with date headers

```markdown
# Taste Log

Append-only insights from user conversations, observations, and inspiration.
No schema. No weights. Just human insights that Claude reads and applies.

---

## YYYY-MM-DD

[Free-form insight text]

---
```

**Read by**: /craft (via sigil/01-sigil-taste.md)
**Written by**: /observe

### grimoires/sigil/observations/

**Type**: Optional structured observation files
**Location**: `grimoires/sigil/observations/*.md`
**Purpose**: Longer-form observation notes if needed

Not required. taste.md is sufficient for most cases.

---

## Migration Implementation

### Phase 1: Delete Dead Code

```bash
#!/bin/bash
# Phase 1: Delete dead code

# Dead skills (0 references)
rm -rf .claude/skills/changelog-generation
rm -rf .claude/skills/mounting-framework
rm -rf .claude/skills/synthesizing-taste
rm -rf .claude/skills/updating-framework
rm -rf .claude/skills/updating-sigil

# Theoretical rules
rm -f .claude/rules/18-sigil-complexity.md
rm -f .claude/rules/22-sigil-anchor-lens.md
rm -f .claude/rules/23-sigil-hud.md
rm -f .claude/rules/24-sigil-agentation.md

echo "Phase 1 complete: ~2,000 lines removed"
```

### Phase 2: Archive Unused Commands

```bash
#!/bin/bash
# Phase 2: Archive unused commands, create new thin commands

mkdir -p grimoires/archive/commands

# Archive ALL existing commands
mv .claude/commands/*.md grimoires/archive/commands/ 2>/dev/null || true

# Create new thin commands (3 total, one per construct)
cat > .claude/commands/sigil.md << 'EOF'
---
name: sigil
description: Capture taste insight
skill: observing
---

# /sigil

Invoke the `observing` skill to capture taste insights.

## Usage

/sigil "Users hesitate at confirmation - too much text"
/sigil (prompts for insight)
EOF

cat > .claude/commands/glyph.md << 'EOF'
---
name: glyph
description: Generate or validate UI with design physics
skill: crafting
---

# /glyph

Invoke the `crafting` skill to generate or validate components.

## Usage

/glyph "claim button for staking rewards"
/glyph validate src/components/Claim.tsx
EOF

cat > .claude/commands/rigor.md << 'EOF'
---
name: rigor
description: Validate data correctness
skill: enforcing
---

# /rigor

Invoke the `enforcing` skill to check data correctness.

## Usage

/rigor src/components/StakePanel.tsx
/rigor (checks current file)
EOF

echo "Phase 2 complete: 3 thin commands created"
```

### Phase 3: Create Glyph Best Practices

```bash
#!/bin/bash
# Phase 3: Consolidate React rules into 07-glyph-practices.md

# This is done by writing the new file (see Component Design section)
# Then delete originals

rm -f .claude/rules/10-react-core.md
rm -f .claude/rules/11-react-async.md
rm -f .claude/rules/12-react-bundle.md
rm -f .claude/rules/13-react-rendering.md
rm -f .claude/rules/14-react-rerender.md
rm -f .claude/rules/15-react-server.md
rm -f .claude/rules/16-react-js.md
rm -f .claude/rules/17-semantic-search.md

echo "Phase 3 complete: React rules consolidated"
```

### Phase 4: Restructure into Constructs

```bash
#!/bin/bash
# Phase 4: Create new directory structure

mkdir -p .claude/rules/sigil
mkdir -p .claude/rules/glyph
mkdir -p .claude/rules/rigor

# Move and transform files (see File Mapping in PRD)
# Each file needs to be rewritten to new format

echo "Phase 4 complete: Directories created"
```

### Phase 5: Create Skills (Anthropic Best Practices)

Following Anthropic's skill design recommendations:
- Task skills with `disable-model-invocation: true`
- Reference skills with `user-invocable: false`
- SKILL.md under 500 lines each

```bash
#!/bin/bash
# Phase 5: Create skills following Anthropic best practices

mkdir -p grimoires/archive/skills

# Archive all existing skills except agent-browser
for skill in .claude/skills/*/; do
  name=$(basename "$skill")
  case "$name" in
    agent-browser)
      echo "Keeping utility: $name"
      ;;
    *)
      mv "$skill" grimoires/archive/skills/
      echo "Archived: $name"
      ;;
  esac
done

# Create task skills (user-invocable, disable-model-invocation)
mkdir -p .claude/skills/observing
mkdir -p .claude/skills/crafting
mkdir -p .claude/skills/enforcing

# Create reference skills (user-invocable: false)
mkdir -p .claude/skills/physics-reference
mkdir -p .claude/skills/patterns-reference

echo "Phase 5 complete: 5 skills created (3 task + 2 reference)"
echo "Next: Write SKILL.md files per SDD specification"
```

### Phase 6: Fresh taste.md

```bash
#!/bin/bash
# Phase 6: Fresh taste.md

mv grimoires/sigil/taste.md grimoires/archive/taste-legacy.md

cat > grimoires/sigil/taste.md << 'EOF'
# Taste Log

Append-only insights from user conversations, observations, and inspiration.
No schema. No weights. Just human insights that Claude reads and applies.

---

EOF

echo "Phase 6 complete: Fresh taste.md created"
```

### Phase 7: Archive UI Copy

```bash
#!/bin/bash
# Phase 7: Archive UI copy for future Voice construct

mkdir -p grimoires/archive/future-voice
mv .claude/rules/21-sigil-ui-copy.md grimoires/archive/future-voice/

echo "Phase 7 complete: UI copy archived for Voice"
```

---

## Verification Checklist

After migration, verify:

### Structure
- [ ] `.claude/rules/sigil/` exists with 2 files
- [ ] `.claude/rules/glyph/` exists with 8 files
- [ ] `.claude/rules/rigor/` exists with 3 files
- [ ] `.claude/commands/` has only 3 files (sigil.md, glyph.md, rigor.md)
- [ ] `.claude/skills/` has 6 directories:
  - [ ] `observing/` (task, ~30 lines)
  - [ ] `crafting/` (task, ~50 lines)
  - [ ] `enforcing/` (task, ~50 lines)
  - [ ] `physics-reference/` (reference, ~80 lines)
  - [ ] `patterns-reference/` (reference, ~80 lines)
  - [ ] `agent-browser/` (utility)
- [ ] `grimoires/sigil/taste.md` is fresh format

### Skill Frontmatter
- [ ] Task skills have `disable-model-invocation: true`
- [ ] Reference skills have `user-invocable: false`
- [ ] All skills under 500 lines

### Commands → Skills
- [ ] `/sigil` → invokes `observing` → adds to taste.md
- [ ] `/glyph` → invokes `crafting` → generates code OR validates
- [ ] `/rigor` → invokes `enforcing` → checks data correctness

### Line Counts
- [ ] Sigil rules: ~150 lines
- [ ] Glyph rules: ~860 lines
- [ ] Rigor rules: ~300 lines
- [ ] Total: ~1,310 lines (79% reduction from 6,231)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Lost functionality | Git preserves history; archive don't delete |
| Missing edge case | Start minimal, add back based on friction |
| Confusion between constructs | Clear README in each directory |
| Broken /craft | Test immediately after Phase 4 |

---

## Future Considerations

### Voice Construct

When ready, create from archived `21-sigil-ui-copy.md`:

```
.claude/rules/voice/
  00-voice-core.md      # Philosophy
  01-voice-copy.md      # Terminology, framing
  02-voice-tone.md      # Tone by context
```

### Agentation

When actually used, consider adding back annotation support.
Test the tool first, understand the workflow, then encode rules.

---

## Appendix A: Invocation Chain

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   COMMAND       TASK SKILL         REFERENCE SKILLS              │
│   (thin)        (workflow)         (knowledge)                   │
│                                                                  │
│   /sigil  ───►  observing   ───►   (none needed)                │
│                 └─ taste.md                                      │
│                                                                  │
│   /glyph  ───►  crafting    ───►   physics-reference            │
│                     │              patterns-reference             │
│                     └─ taste.md                                  │
│                                                                  │
│   /rigor  ───►  enforcing   ───►   (inline, no ref needed)      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

Skill Types (per Anthropic):
• Task skills:      user-invocable: true, disable-model-invocation: true
• Reference skills: user-invocable: false (loaded by task skills)
```

---

## Appendix B: File Size Estimates

| File | Estimated Lines |
|------|-----------------|
| sigil/00-sigil-core.md | 50 |
| sigil/01-sigil-taste.md | 100 |
| glyph/00-glyph-core.md | 100 |
| glyph/01-glyph-physics.md | 70 |
| glyph/02-glyph-detection.md | 150 |
| glyph/03-glyph-protected.md | 80 |
| glyph/04-glyph-patterns.md | 100 |
| glyph/05-glyph-animation.md | 80 |
| glyph/06-glyph-material.md | 80 |
| glyph/07-glyph-practices.md | 200 |
| rigor/00-rigor-core.md | 50 |
| rigor/01-rigor-data.md | 100 |
| rigor/02-rigor-web3.md | 150 |
| **Total Rules** | **~1,310** |

| Commands | Task Skills | Reference Skills |
|----------|-------------|------------------|
| sigil.md (~10 lines) | observing/SKILL.md (~30 lines) | — |
| glyph.md (~10 lines) | crafting/SKILL.md (~50 lines) | physics-reference (~80 lines) |
| rigor.md (~10 lines) | enforcing/SKILL.md (~50 lines) | patterns-reference (~80 lines) |
| **~30 lines** | **~130 lines** | **~160 lines** |

**Grand Total**: ~1,630 lines (74% reduction from 6,231)

---

## Appendix C: Quick Reference

| Construct | Command | Task Skill | Reference Skills | Domain |
|-----------|---------|------------|------------------|--------|
| Sigil | `/sigil` | `observing` | — | Taste (WHY) |
| Glyph | `/glyph` | `crafting` | `physics-reference`, `patterns-reference` | Craft (HOW) |
| Rigor | `/rigor` | `enforcing` | — | Correctness (WHAT) |

**Per construct: One command → One task skill → Zero or more reference skills**

## Appendix D: Anthropic Best Practices Applied

| Best Practice | How We Apply It |
|---------------|-----------------|
| SKILL.md < 500 lines | All skills under 100 lines |
| `disable-model-invocation: true` for workflows | All task skills have this |
| `user-invocable: false` for reference | Reference skills are internal |
| Detailed reference in separate files | physics-reference, patterns-reference |
| Conversational feedback (interrupt/steer) | No modal confirmations in workflow |
| Context is the constraint | Minimal rules, skills load on-demand |
