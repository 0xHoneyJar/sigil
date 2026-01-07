---
zones:
  state:
    paths:
      - sigil-mark/moodboard/
      - sigil-mark/moodboard.md
      - sigil-mark/rules.md
      - sigil-mark/vocabulary/vocabulary.yaml
      - sigil-mark/constitution/protected-capabilities.yaml
      - sigil-mark/personas/personas.yaml
      - sigil-mark/consultation-chamber/decisions/
      - .sigilrc.yaml
    permission: read
  config:
    paths:
      - .sigil-setup-complete
    permission: read
---

# Crafting Guidance (v3.0)

## Purpose

Provide design guidance during implementation with full Process context. Present **options with tradeoffs** — do NOT make taste decisions for the craftsman.

## Philosophy (v3.0)

> "Sweat the art. We handle the mechanics. Return to flow."

### What This Means

1. **Present options, not mandates** — Show tradeoffs, let craftsman choose
2. **Surface context, not opinions** — Constitution, decisions, vocabulary
3. **Respect locked decisions** — Flag conflicts, don't override
4. **Agent handles mechanics** — Physics, zones, materials
5. **Craftsman handles taste** — Color choices, copy, feel

### What This Skill Does

- Surfaces Process context (Constitution, Vocabulary, Decisions, Persona)
- Presents implementation options with clear tradeoffs
- Shows relevant locked decisions
- Warns about Constitution constraints (informational, not blocking)
- Provides code with appropriate Layout + Lens

### What This Skill Does NOT Do

- Make design decisions for the craftsman
- Refuse to implement something based on opinion
- Choose between equivalent options without asking
- Override craftsman preferences

## Process Context (Agent-Only)

⚠️ **v3.0 Change:** Process layer is agent-only. Do NOT generate code that imports from `sigil-mark/process`.

The agent reads Process context during code generation:
- `sigil-mark/constitution/protected-capabilities.yaml`
- `sigil-mark/vocabulary/vocabulary.yaml`
- `sigil-mark/personas/personas.yaml`
- `sigil-mark/consultation-chamber/decisions/*.yaml`

Runtime code receives configuration via **props**, not ProcessContext.

## Pre-Flight Checks

1. **Sigil Setup**: Verify `.sigil-setup-complete` exists
2. **Design Context**: Check for moodboard/ folder OR moodboard.md, and rules.md
3. **Zone Config**: Load zones from `.sigilrc.yaml`
4. **Vocabulary**: Load from `sigil-mark/vocabulary/vocabulary.yaml`
5. **Moodboard (v3.1)**: Load from `sigil-mark/moodboard/` if folder exists

## Context Loading

### Process Layer (Read First)

```
sigil-mark/constitution/protected-capabilities.yaml
├── protected[] — Capabilities that MUST always work
└── enforcement: block | warn | log

sigil-mark/vocabulary/vocabulary.yaml
├── terms[] — Product terms with feel recommendations
│   ├── pot: { material: glass, motion: warm }
│   └── vault: { material: machinery, motion: deliberate }

sigil-mark/personas/personas.yaml (renamed from lens-array)
├── power_user, newcomer, mobile, accessibility
├── preferences: { motion, help, density }
└── default_lens: strict | default | guided

sigil-mark/consultation-chamber/decisions/*.yaml
├── Locked decisions for current zone
└── LOCK_PERIODS: { strategic: 180, direction: 90, execution: 30 }
```

### Design Layer

```
sigil-mark/moodboard/ — Inspiration collection (v3.1)
├── references/     — Product inspiration by source
├── articles/       — Synthesized design learnings
├── anti-patterns/  — Patterns to avoid (with severity)
├── gtm/            — Brand voice, messaging
├── screenshots/    — Visual references
└── index.yaml      — Optional curated highlights

sigil-mark/moodboard.md — Legacy feel document (if no folder)
sigil-mark/rules.md — Colors, typography, spacing, motion
.sigilrc.yaml — Zone definitions
```

### Moodboard Loading (v3.1)

If `sigil-mark/moodboard/` folder exists, use `readMoodboard()` to:

1. **Get zone-relevant references**: `getEntriesForZone(moodboard, zone)`
2. **Get anti-patterns**: `getAntiPatterns(moodboard)`
3. **Get featured references**: `getFeaturedReferences(moodboard)`
4. **Search by term**: `getEntriesForTerm(moodboard, term)`

Include 1-3 relevant references in the DESIGN CONTEXT output.

## Zone Detection (Layout-Based)

Zones are declared by Layout components, NOT file paths:

```tsx
<CriticalZone financial>  // Zone: critical
<MachineryLayout>         // Zone: admin
<GlassLayout>             // Zone: marketing
```

| Zone | Layout | Default Persona | Time Authority |
|------|--------|-----------------|----------------|
| critical | CriticalZone | power_user | server-tick |
| admin | MachineryLayout | power_user | optimistic |
| marketing | GlassLayout | newcomer | optimistic |

## Response Format

### Always Start with Context

```
═══════════════════════════════════════════════════════════
                     DESIGN CONTEXT
═══════════════════════════════════════════════════════════

ZONE: {zone}
PERSONA: {persona_id} ({alias})
  Preferences: {motion}, {density}, {help}

VOCABULARY:
  Term: {term} → {material}, {motion}, {tone}
  Mental model: "{mental_model}"

MOODBOARD (v3.1):
  References: {1-3 relevant entries from getEntriesForZone or searchMoodboard}
  Anti-patterns: {Relevant anti-patterns to avoid}
  Featured: {Any featured references for this context}

CONSTITUTION:
  {List protected capabilities, or "No constraints for this zone"}

LOCKED DECISIONS:
  {List relevant decisions, or "None for this zone"}
```

### Present Options with Tradeoffs

When there are multiple valid approaches:

```
═══════════════════════════════════════════════════════════
                     YOUR CALL
═══════════════════════════════════════════════════════════

**Option A: {description}**
  Tradeoff: {pros and cons}
  Code: {brief code example}

**Option B: {description}**
  Tradeoff: {pros and cons}
  Code: {brief code example}

Which approach works better for your use case?
```

### Implementation Section

After craftsman chooses (or if only one approach makes sense):

```
═══════════════════════════════════════════════════════════
                     IMPLEMENTATION
═══════════════════════════════════════════════════════════

Layout: {CriticalZone | MachineryLayout | GlassLayout}
Lens: {StrictLens | DefaultLens | A11yLens}
Material: {machinery | glass | decisive}
Time Authority: {server-tick | optimistic | hybrid}

{Code implementation}
```

## Code Generation (v3.0)

**IMPORTANT:** Do NOT import from `sigil-mark/process` in client code.

### Correct (v3.0)

```tsx
import { useCriticalAction, CriticalZone, useLens } from 'sigil-mark';

function ConfirmPurchase({ amount }: { amount: number }) {
  const Lens = useLens();

  const payment = useCriticalAction({
    mutation: () => api.pay(amount),
    timeAuthority: 'server-tick',
  });

  return (
    <CriticalZone financial>
      {/* 2-step confirmation per DEC-2026-003 */}
      <CriticalZone.Content>
        <h2>Confirm Payment</h2>
        <p>${amount}</p>
      </CriticalZone.Content>
      <CriticalZone.Actions>
        <Lens.CriticalButton state={payment.state} onAction={payment.commit}>
          Confirm Purchase
        </Lens.CriticalButton>
      </CriticalZone.Actions>
    </CriticalZone>
  );
}
```

### Wrong (v2.6 - Removed)

```tsx
// ❌ DO NOT USE - crashes in browser
import { useProcessContext } from 'sigil-mark/process';

const { constitution } = useProcessContext();
```

## Constitution Warnings

When component affects a protected capability:

```
⚠️ CONSTITUTION NOTE

Action '{capability}' is PROTECTED

Enforcement: {block | warn | log}
Rationale: {rationale}

Consider:
  - Keep this capability always accessible
  - Don't gate behind unnecessary verification
  - Surface warnings don't block implementation
```

**Important:** Constitution warnings are informational. The agent surfaces them but proceeds with implementation per craftsman request.

## Locked Decision Conflicts

When implementation might contradict a locked decision:

```
🔒 LOCKED DECISION

Decision: {id}
Topic: {topic}
Current lock: {decision_value}

Your implementation appears to {conflict description}.

Options:
1. Align with locked decision (shown below)
2. Proceed differently (will be flagged in /garden)
3. Unlock decision: /consult {id} --unlock

Which approach do you prefer?
```

Do NOT refuse to implement. Present options, let craftsman choose.

## Vocabulary Integration (v3.0)

When a term has vocabulary entry, apply its feel:

```
User: "Create a UI for the user's Pot"

Agent reads vocabulary:
  pot:
    mental_model: "Piggy bank, casual saving"
    recommended:
      material: glass
      motion: warm
      tone: friendly

Applies glass material + warm motion to the component,
even if zone default would be different.
```

**Vocabulary overrides zone defaults for specific terms.**

## Error Handling

| Situation | Response |
|-----------|----------|
| No moodboard/ folder AND no moodboard.md | "Run `/envision` to capture product feel, or drop files in `sigil-mark/moodboard/`." |
| Empty moodboard/ folder | "Moodboard folder exists but is empty. Drop inspiration files into `sigil-mark/moodboard/references/`." |
| No rules.md | "Run `/codify` to define design rules." |
| No vocabulary | "No vocabulary defined. Using zone defaults." |
| No decisions | "No locked decisions for this zone." |
| Unknown zone | "Using default (glass) physics with newcomer persona." |

## Key Principles

1. **Options, not mandates** — Present tradeoffs, let craftsman choose
2. **Context, not opinions** — Surface Constitution, Vocabulary, Decisions
3. **Never refuse** — Warn, offer alternatives, implement per request
4. **Respect locks** — Flag conflicts, don't override
5. **Agent-only Process** — Don't generate `useProcessContext` imports
6. **Vocabulary before zone** — Term feel overrides zone defaults
