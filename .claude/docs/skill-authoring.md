# Skill Authoring Guide

This guide documents how to create new skills for Sigil and Loa. Skills are Claude Code extensions that provide specialized workflows for specific tasks.

## Table of Contents

1. [Progressive Disclosure Pattern](#progressive-disclosure-pattern)
2. [Mode Architecture](#mode-architecture)
3. [RLM Integration](#rlm-integration)
4. [Context Management](#context-management)
5. [Quality Gates](#quality-gates)
6. [Feedback Loops](#feedback-loops)
7. [Checklist for New Skills](#checklist-for-new-skills)

---

## Progressive Disclosure Pattern

Skills should reveal complexity progressively, not all at once. Users see what they need when they need it.

### Layers of Disclosure

| Layer | What's Shown | When |
|-------|--------------|------|
| **L0: Command** | Just the command name | User types `/skill-name` |
| **L1: Analysis** | Initial assessment box | Immediately after invocation |
| **L2: Questions** | Clarifying questions | Only if needed |
| **L3: Action** | Generated output | After confirmation |
| **L4: Details** | Verbose explanation | Only if user asks "why" |

### Example: /craft Progressive Flow

```
User: /craft "claim button"

L1 (Analysis):
┌─ Physics Analysis ─────────────────────────────────────┐
│  Effect: Financial (keyword "claim")                   │
│  Physics: Pessimistic, 800ms, confirmation             │
│                                                        │
│  Proceed? (y/n)                                        │
└────────────────────────────────────────────────────────┘

User: y

L3 (Action):
[Generates component]

L4 (Details - only if asked):
Why 800ms? Because financial operations need time for users
to verify amounts before irreversible transfer...
```

### Anti-Pattern: Information Dump

```
# DON'T DO THIS
┌─ Analysis ──────────────────────────────────────────────────────────────────┐
│  Component: ClaimButton                                                     │
│  Effect: Financial mutation                                                 │
│  Keywords detected: claim                                                   │
│  Type overrides: none                                                       │
│  Context signals: web3, wallet                                              │
│  Physics: Pessimistic sync, 800ms timing, confirmation required             │
│  Animation: ease-out, 800ms                                                 │
│  Material: elevated surface, soft shadow, 8px radius                        │
│  Protected capabilities verified: withdraw reachable, cancel visible        │
│  Taste patterns: none (cold start)                                          │
│  Codebase conventions: React, Tailwind, Framer Motion                       │
│  Implementation rules: async-suspense-boundaries, rerender-memo             │
│  Token budget: green zone (45% used)                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

Keep it simple. Show 3-5 key facts, not 15.

---

## Mode Architecture

Skills can operate in different modes. Modes change what the skill does, not just how verbose it is.

### Standard Modes

| Mode | Purpose | Behavior |
|------|---------|----------|
| **analyze** | Understand before acting | Read-only, shows analysis box |
| **generate** | Create new output | Full workflow with writes |
| **diagnose** | Debug existing code | Read + comparison + suggestions |
| **repair** | Fix issues | Targeted edits only |

### Mode Detection

Detect mode from user intent:

```typescript
function detectMode(input: string): Mode {
  // Explicit mode flags
  if (input.includes('--analyze')) return 'analyze'
  if (input.includes('--diagnose')) return 'diagnose'

  // Intent keywords
  if (/what|why|explain|understand/.test(input)) return 'analyze'
  if (/fix|repair|broken|wrong/.test(input)) return 'repair'
  if (/debug|issue|problem/.test(input)) return 'diagnose'

  // Default: generate
  return 'generate'
}
```

### Mode-Specific Outputs

```
/craft "claim button" --analyze
→ Shows physics analysis only, no generation

/craft "claim button"
→ Analyzes → confirms → generates

/craft "this button feels slow" --diagnose
→ Reads existing code → compares to physics → suggests changes
```

---

## RLM Integration

Rules are Loaded on-demand via the Rule Loading Mechanism (RLM). This keeps context fresh and relevant.

### RLM Structure

```
.claude/rules/
├── rlm-core-summary.md    # Always loaded, ~1000 tokens
├── index.yaml              # Maps triggers to rules
├── 01-sigil-physics.md     # Loaded when physics needed
├── 02-sigil-detection.md   # Loaded when detecting effects
└── ...
```

### index.yaml Schema

```yaml
rules:
  - id: physics
    file: 01-sigil-physics.md
    triggers:
      - keywords: [timing, sync, pessimistic, optimistic]
      - effects: [Financial, Destructive, Standard]
    weight: 100  # Higher = loaded first

  - id: detection
    file: 02-sigil-detection.md
    triggers:
      - keywords: [detect, effect, keywords, type]
      - mode: [analyze, diagnose]
    weight: 90

  - id: web3-flows
    file: 20-sigil-web3-flows.md
    triggers:
      - keywords: [stake, claim, withdraw, approve, swap]
      - packages: [wagmi, viem]
    weight: 80
```

### Triggering Rule Loading

Skills should trigger appropriate rules:

```typescript
// In your skill's entry point
async function invokeSkill(input: string, context: SkillContext) {
  // Detect what rules we need
  const triggers = detectTriggers(input)

  // Load rules via RLM
  const rules = await context.loadRules(triggers)

  // Proceed with loaded context
  return executeWithRules(input, rules)
}
```

### Token Budget

| Zone | Usage | Rule Loading |
|------|-------|--------------|
| Green (0-60%) | Full exploration | Load all triggered rules |
| Yellow (60-80%) | Compact mode | Load essential rules only |
| Orange (80-90%) | Minimal | Core summary only |
| Red (90-100%) | Emergency | Direct action, skip rules |

---

## Context Management

Skills must manage context efficiently. Never assume context persists across turns.

### Context Sources

| Source | Trust Level | Usage |
|--------|-------------|-------|
| **Files** | Highest | Always read to verify claims |
| **grimoires/** | High | Verified state (taste.md, craft-state.md) |
| **Conversation** | Medium | Use for recent context only |
| **Memory** | Low | May be stale, always verify |

### State Persistence

For multi-turn workflows, persist state to files:

```markdown
# grimoires/sigil/craft-state.md

session_id: abc123
started_at: 2026-01-20T10:00:00Z
component: ClaimButton
iteration: 2
last_action: generated
rules_loaded:
  - 01-sigil-physics.md
  - 03-sigil-patterns.md
loop_detection:
  same_fix_count: 0
  last_fix: null
```

### Recovery Protocol

When resuming after context clear:

1. Read `grimoires/sigil/NOTES.md` (summary)
2. Read `grimoires/sigil/craft-state.md` (session state)
3. Read target file (current code)
4. Resume from `last_action`

Budget: <100 tokens for state recovery.

---

## Quality Gates

Skills should have quality gates that prevent bad outputs.

### Pre-Generation Gates

| Gate | Check | Action if Fails |
|------|-------|-----------------|
| **Protected capabilities** | Withdraw reachable? Cancel visible? | Block generation |
| **Type safety** | All types resolve? | Warn + suggest fixes |
| **Dependency check** | Required packages exist? | List missing deps |
| **Convention match** | Matches codebase style? | Warn + adapt |

### Post-Generation Gates

| Gate | Check | Action if Fails |
|------|-------|-----------------|
| **Builds** | TypeScript compiles? | Show errors |
| **Physics compliance** | Matches detected effect? | Warn + explain |
| **Accessibility** | Touch targets ≥44px? Focus rings? | Auto-fix or warn |

### Gate Implementation

```typescript
interface QualityGate {
  name: string
  severity: 'block' | 'warn' | 'info'
  check: (output: GeneratedOutput) => GateResult
}

const protectedCapabilities: QualityGate = {
  name: 'Protected Capabilities',
  severity: 'block',
  check: (output) => {
    if (output.effect === 'Financial' && !output.hasCancelButton) {
      return {
        passed: false,
        message: 'Financial flows must have a cancel button'
      }
    }
    return { passed: true }
  }
}
```

---

## Feedback Loops

Skills should learn from usage via feedback loops.

### Signal Types

| Signal | Weight | Detection |
|--------|--------|-----------|
| ACCEPT | +1 | User confirms, moves on |
| MODIFY | +5 | User edits generated output |
| REJECT | -3 | User says no, deletes, rewrites |

### Capturing Feedback

```typescript
async function captureSignal(
  component: string,
  signal: 'ACCEPT' | 'MODIFY' | 'REJECT',
  context: SignalContext
) {
  const entry = {
    timestamp: new Date().toISOString(),
    signal,
    source: context.source, // 'cli' | 'toolbar' | 'product'
    component: {
      name: component,
      effect: context.effect,
      craft_type: context.craftType,
    },
    physics: context.physics,
    ...(signal === 'MODIFY' && {
      change: context.change,
      learning: inferLearning(context),
    }),
    ...(signal === 'REJECT' && {
      rejection_reason: context.reason,
    }),
  }

  await appendToTasteLog(entry)
}
```

### Pattern Detection

After capturing signals, detect patterns:

```typescript
function detectPatterns(signals: Signal[]): Pattern[] {
  const patterns: Pattern[] = []

  // Group by change type
  const timingChanges = signals.filter(s =>
    s.signal === 'MODIFY' &&
    s.change?.field === 'timing'
  )

  // Check for 3+ consistent changes
  if (timingChanges.length >= 3) {
    const commonValue = mode(timingChanges.map(s => s.change.to))
    patterns.push({
      type: 'timing',
      value: commonValue,
      confidence: timingChanges.length / signals.length
    })
  }

  return patterns
}
```

### Applying Patterns

At generation time, check for applicable patterns:

```typescript
function applyPatterns(defaults: Physics, patterns: Pattern[]): Physics {
  let adjusted = { ...defaults }

  for (const pattern of patterns) {
    if (pattern.type === 'timing' && pattern.confidence > 0.5) {
      adjusted.timing = pattern.value
      // Note adjustment in analysis
      adjusted._adjustments.push(
        `Timing adjusted to ${pattern.value} based on taste log`
      )
    }
  }

  return adjusted
}
```

---

## Checklist for New Skills

Use this checklist when creating a new skill:

### Structure

- [ ] Create `skills/{skill-name}/SKILL.md` with full documentation
- [ ] Define entry point in `.claude/commands/{skill-name}.md`
- [ ] Add to index.yaml with appropriate triggers
- [ ] Create test cases in `skills/{skill-name}/tests/`

### Progressive Disclosure

- [ ] L0: Command name is clear and memorable
- [ ] L1: Analysis box shows 3-5 key facts max
- [ ] L2: Questions only ask what's necessary
- [ ] L3: Action output is complete and working
- [ ] L4: Detailed explanation available on request

### Modes

- [ ] Default mode makes sense for common use case
- [ ] Mode detection handles explicit flags
- [ ] Mode detection handles intent keywords
- [ ] Each mode has distinct output format

### Context

- [ ] State persisted to grimoires/ if multi-turn
- [ ] Recovery protocol handles context clear
- [ ] Files are read, not assumed
- [ ] Token budget respected

### Quality

- [ ] Pre-generation gates defined
- [ ] Post-generation gates defined
- [ ] Protected capabilities checked (if applicable)
- [ ] Builds verified before output

### Feedback

- [ ] Signals captured to taste.md
- [ ] Patterns detected from signals
- [ ] Patterns applied at generation time
- [ ] Adjustments noted in analysis

### Documentation

- [ ] SKILL.md has purpose, invocation, workflow
- [ ] Examples show common use cases
- [ ] Error handling documented
- [ ] Token budget guidance provided

---

## Example: /oracle-analyze Skill

A real-world example from Loa:

### SKILL.md Structure

```markdown
# Oracle Analyze Skill

## Purpose
Analyze Anthropic documentation to answer technical questions.

## Invocation
/oracle-analyze "how does tool use work?"

## Workflow
1. Parse question
2. Search relevant docs
3. Extract key information
4. Synthesize answer
5. Cite sources

## Modes
- default: Full analysis with citations
- quick: Brief answer, fewer sources
- deep: Comprehensive with examples

## Token Budget
- Green: Load 3+ relevant docs
- Yellow: Load 1-2 most relevant
- Orange: Answer from cache if available
- Red: Decline or defer
```

### Fragment System

For large reference materials, use fragments:

```yaml
# skills/oracle-analyze/fragments.yaml
fragments:
  - id: tool-use-basics
    path: docs/tool-use/basics.md
    triggers: [tool use, function calling, tools]
    tokens: ~500

  - id: tool-use-advanced
    path: docs/tool-use/advanced.md
    triggers: [parallel tools, tool choice, auto tools]
    tokens: ~800
```

Load fragments based on query:

```typescript
function selectFragments(query: string, budget: number): Fragment[] {
  const triggered = fragments.filter(f =>
    f.triggers.some(t => query.toLowerCase().includes(t))
  )

  // Fit within budget
  let total = 0
  const selected: Fragment[] = []
  for (const f of triggered.sort((a, b) => b.tokens - a.tokens)) {
    if (total + f.tokens <= budget) {
      selected.push(f)
      total += f.tokens
    }
  }

  return selected
}
```

---

## Token Budget Guidance

### Estimating Token Usage

| Content Type | Tokens/KB | Notes |
|--------------|-----------|-------|
| English prose | ~250 | ~4 chars/token |
| Code | ~300 | More tokens due to syntax |
| JSON/YAML | ~350 | Structural overhead |
| Markdown | ~280 | Formatting markers |

### Budget Allocation

For a skill with 40k token budget:

| Component | Allocation |
|-----------|------------|
| System prompt | 5k (12%) |
| Loaded rules | 10k (25%) |
| Codebase context | 15k (37%) |
| Working memory | 10k (25%) |

### Reducing Context

When over budget:

1. **Summarize instead of include** - "3 similar components found" vs including all 3
2. **Reference instead of embed** - "See 01-sigil-physics.md" vs pasting
3. **Defer to subagent** - Spawn Task for exploration, return summary
4. **Use fragments** - Load only triggered fragments
5. **Compact analysis** - Switch to 1-line format

---

*This guide is a living document. Update it as patterns emerge from skill development.*
