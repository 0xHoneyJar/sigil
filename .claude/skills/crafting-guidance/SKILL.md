---
zones:
  state:
    paths:
      - sigil-mark/moodboard.md
      - sigil-mark/rules.md
      - sigil-mark/core/physics.ts
      - sigil-mark/constitution/protected-capabilities.yaml
      - sigil-mark/lens-array/lenses.yaml
      - sigil-mark/consultation-chamber/decisions/
      - .sigilrc.yaml
    permission: read
  config:
    paths:
      - .sigil-setup-complete
    permission: read
---

# Sigil Crafting Skill (v2.6)

## Purpose

Provide design guidance during implementation with full **Process Context**:
1. **Constitution** — Protected capabilities that MUST always work
2. **Locked Decisions** — Design decisions that are time-locked
3. **Persona Physics** — User persona constraints and preferences
4. **Zone Context** — File path to zone + persona mapping
5. **Moodboard** — Product feel and anti-patterns
6. **Rules** — Design rules by category

## Philosophy

> "Context before code. Constitution before creativity."
> "Engineers learn by seeing diffs and feeling the physics."
> "Make the right path easy. Make the wrong path visible."

Do NOT lecture. Do NOT explain unless asked. Make the change. The diff + feel is the lesson.

**NEW in v2.6:** Always surface Process context (Constitution, Decisions, Persona) before implementation guidance.

## Pre-Flight Checks

1. **Sigil Setup**: Verify `.sigil-setup-complete` exists
2. **Process Context**: Load Constitution, Decisions, Personas (NEW in v2.6)
3. **Design Context**: Check for moodboard.md and rules.md (warn if missing)
4. **Zone Config**: Load zones from `.sigilrc.yaml`
5. **Physics**: Load from `sigil-mark/core/physics.ts`

## Context Loading (v2.6)

### Process Layer (NEW — Load First)

```
sigil-mark/constitution/protected-capabilities.yaml
├── protected[] — Capabilities that MUST always work
│   ├── withdraw, deposit, risk_alert, etc.
│   └── enforcement: block | warn | log
└── override_audit — When overrides occurred

sigil-mark/consultation-chamber/decisions/*.yaml
├── Active decisions for current zone
├── Lock status and expiry dates
└── LOCK_PERIODS: { strategic: 180, direction: 90, execution: 30 }

sigil-mark/lens-array/lenses.yaml
├── Personas: power_user, newcomer, mobile, accessibility
├── physics: { tap_targets, input_method, shortcuts }
├── constraints: { max_actions_per_screen, reading_level }
└── stacking: { allowed_combinations, conflict_resolution }
```

### Design Layer (Original)

```
sigil-mark/moodboard.md
├── Reference Products
├── Feel Descriptors (by context)
├── Anti-Patterns
└── Key Moments

sigil-mark/rules.md
├── Colors
├── Typography
├── Spacing
├── Motion (by zone)
└── Components

sigil-mark/core/physics.ts
├── PHYSICS.decisive (spring: 180/12, tap: 0.98)
├── PHYSICS.machinery (spring: 400/30, tap: 0.96)
└── PHYSICS.glass (spring: 200/20, tap: 0.97)

.sigilrc.yaml
├── zones (paths → material mapping)
└── rejections (patterns to warn about)
```

### Zone Detection (v2.6)

If a file path is provided, determine zone from `.sigilrc.yaml`:

- `critical` → decisive physics (heavy, deliberate) → **power_user** persona
- `checkout` → decisive physics → **power_user** persona
- `admin` → machinery physics (instant, efficient) → **power_user** persona
- `marketing` → glass physics (smooth, delightful) → **newcomer** persona
- `landing` → glass physics → **newcomer** persona
- `mobile` → touch physics → **mobile** persona
- `a11y` → accessible physics → **accessibility** persona
- `default` → glass physics → **newcomer** persona

## Response Format (v2.6)

### Always Start with Process Context

Before any implementation guidance, surface:

```
═══════════════════════════════════════════════════════════
                     PROCESS CONTEXT
═══════════════════════════════════════════════════════════

ZONE: {zone} ({sub-zone if applicable})
PERSONA: {persona_id} ({alias})
  Input: {input_method}
  Tap targets: {min_size}
  Max actions/screen: {max_actions_per_screen}

CONSTITUTION:
  {List protected capabilities for this zone}
  {Or "None for this zone"}

LOCKED DECISIONS:
  {List active locked decisions for this zone}
  {Or "None for this zone"}
```

### When Asked About Physics

Show the actual values with persona context:

```
Zone Physics:
  decisive: spring(180, 12), tap 0.98, minPending 600ms
  machinery: spring(400, 30), tap 0.96, minPending 0ms
  glass: spring(200, 20), tap 0.97, minPending 200ms

Persona Physics (power_user):
  tap_targets: 32px min
  input_method: keyboard
  shortcuts: enabled
  reading_level: advanced
```

### When Given a File Path

```
/craft src/features/checkout/Button.tsx
```

Response:

```
═══════════════════════════════════════════════════════════
                     PROCESS CONTEXT
═══════════════════════════════════════════════════════════

ZONE: critical (checkout)
PERSONA: power_user (Chef)
  Input: keyboard
  Tap targets: 32px min
  Max actions/screen: 10

CONSTITUTION:
  ⚠️ PROTECTED: withdraw (enforcement: block)
  ⚠️ PROTECTED: deposit (enforcement: block)

LOCKED DECISIONS:
  🔒 DEC-2026-003: Confirmation flow (2-step) — 90 days remaining

═══════════════════════════════════════════════════════════
                     IMPLEMENTATION
═══════════════════════════════════════════════════════════

Zone: critical
Material: decisive
Physics: spring(180, 12)
Layout: CriticalZone (financial=true)
Lens: StrictLens (forced)
Time Authority: server-tick

Use <CriticalZone financial> with useCriticalAction
Component must follow 2-step confirmation per locked decision.
```

### When Implementing

Don't explain, just write the code with Process context awareness:

```tsx
import { useCriticalAction, CriticalZone, useLens } from 'sigil-mark';
import { useProcessContext } from 'sigil-mark/process';

function ConfirmPurchase() {
  const { constitution, decisions } = useProcessContext();
  const Lens = useLens();

  const payment = useCriticalAction({
    mutation: () => api.pay(amount),
    timeAuthority: 'server-tick',
  });

  return (
    <CriticalZone financial>
      {/* 2-step confirmation per DEC-2026-003 */}
      <Lens.CriticalButton state={payment.state} onAction={payment.execute}>
        Confirm Purchase
      </Lens.CriticalButton>
    </CriticalZone>
  );
}
```

## Warning About Rejected Patterns

When user mentions a rejected pattern:

1. Note the rejection reason (from .sigilrc.yaml)
2. Offer alternatives
3. Allow override - never refuse

Example:

```
User: "Add a spinner to checkout"

Spinners are noted in rejections for critical zones.

Alternatives:
1. Skeleton loading
2. Progress with copy
3. Confirmation animation

If you still want a spinner, I can add it.
```

## Constitution Warnings (NEW in v2.6)

When component affects a protected capability:

```
⚠️ CONSTITUTION WARNING

Action 'withdraw' is PROTECTED

Enforcement: block
Rationale: Users must always be able to withdraw their funds

DO NOT:
  - Disable this button based on external conditions
  - Hide this capability behind feature flags
  - Gate behind unnecessary verification steps

This capability MUST always be functional for users with funds.
```

**Important:** Constitution warnings are informational, not blocking. The agent surfaces the warning but proceeds with implementation.

## Locked Decision Warnings (NEW in v2.6)

When implementation contradicts a locked decision:

```
🔒 DECISION CONFLICT DETECTED

Decision: DEC-2026-003
Topic: Confirmation flow
Locked value: 2-step confirmation
Your implementation: 1-step confirmation

This decision was locked 45 days ago and expires in 45 days.

Options:
1. Update implementation to match locked decision (recommended)
2. Request early unlock: /consult --unlock DEC-2026-003
3. Proceed anyway (will be flagged in /garden)
```

## Layout + Persona Selection

| Zone | Layout | Lens | Persona | Time Authority |
|------|--------|------|---------|----------------|
| critical | CriticalZone | StrictLens (forced) | power_user | server-tick |
| checkout | CriticalZone | StrictLens (forced) | power_user | server-tick |
| admin | MachineryLayout | User preference | power_user | optimistic |
| marketing | GlassLayout | User preference | newcomer | optimistic |
| landing | GlassLayout | User preference | newcomer | optimistic |
| mobile | CriticalZone/Glass | User preference | mobile | any |
| a11y | Any | A11yLens | accessibility | any |

## Error Handling

| Situation | Response |
|-----------|----------|
| No moodboard.md | "Run `/envision` to capture product feel." |
| No rules.md | "Run `/codify` to define design rules." |
| No constitution | "Run `/sigil-setup` to initialize Process layer." |
| No decisions | "No locked decisions for this zone." |
| Unknown zone | "Using default (glass) physics with newcomer persona." |
| Unknown persona | "Using default persona (newcomer)." |
| Missing Process files | Graceful degradation - use defaults, surface warning |

## Key Principles

1. **Process context first**: Always surface Constitution, Decisions, Persona before code
2. **Show, don't tell**: Write code, show diffs
3. **Context-aware**: Components inherit from zone + persona
4. **Physics tokens**: Single source of truth
5. **Never refuse**: Warn, offer alternatives, allow override
6. **Respect locks**: Flag conflicts with locked decisions
7. **Protect constitution**: Surface warnings for protected capabilities
