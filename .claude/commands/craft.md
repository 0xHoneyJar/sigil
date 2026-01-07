---
name: craft
version: "2.6.0"
description: Get design guidance with full Process context (Constitution + Decisions + Persona)
agent: crafting-guidance
agent_path: .claude/skills/crafting-guidance/SKILL.md
preflight:
  - sigil_mark_exists
context_injection: true
---

# /craft

Get design guidance with full Process context. Restores Constitution, locked decisions, and persona physics for your current zone.

## Usage

```
/craft [component_description]               # Get guidance with full context
/craft [component_description] --file [path] # Specify target file
/craft [path]                                # Diagnose existing file
/craft --persona [id]                        # Force specific persona
/craft --zone [name]                         # Override zone detection
```

## Workflow (v2.6)

```
1. LOAD PROCESS CONTEXT (NEW IN v2.6)
   - Read Constitution (protected capabilities)
   - Read locked decisions for current zone
   - Determine persona from zone mapping
   - Load persona physics and constraints

2. DETERMINE ZONE
   - Get file path (from --file or description)
   - Match to zone in .sigilrc.yaml
   - Get persona for zone (critical → power_user, marketing → newcomer)

3. CHECK CONSTITUTION
   - Verify no protected capabilities are affected
   - Warn if component touches protected actions (withdraw, deposit, etc.)
   - Never block, but surface enforcement level

4. SURFACE LOCKED DECISIONS
   - Find decisions affecting this zone
   - Show locked decisions with expiry date
   - Warn if implementation contradicts locked decision

5. SELECT LAYOUT + LENS
   - CriticalZone → StrictLens (forced for financial)
   - MachineryLayout → User preference
   - GlassLayout → User preference

6. APPLY PERSONA PHYSICS
   - Load physics from persona (tap_targets, input_method, shortcuts)
   - Load constraints (max_actions_per_screen, reading_level)
   - Apply to recommendations

7. OUTPUT GUIDANCE
   - Show recommended pattern with persona context
   - Show code example
   - Note protected capabilities
   - Note locked decisions
```

## Output Format (v2.6)

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
  ⚠️  PROTECTED: withdraw (enforcement: block)
  ⚠️  PROTECTED: deposit (enforcement: block)
  ℹ️  PROTECTED: fee_disclosure (enforcement: warn)

LOCKED DECISIONS:
  🔒 DEC-2026-001: Primary CTA color (blue) — expires in 45 days
  🔒 DEC-2026-003: Confirmation flow (2-step) — expires in 90 days

═══════════════════════════════════════════════════════════
                     IMPLEMENTATION
═══════════════════════════════════════════════════════════

LAYOUT: CriticalZone (financial=true)
TIME AUTHORITY: server-tick
LENS: StrictLens (forced by CriticalZone)

RECOMMENDED PATTERN:
┌─────────────────────────────────────────────────────────┐
│ import { useCriticalAction, CriticalZone, useLens }     │
│ from 'sigil-mark';                                      │
│ import { useProcessContext } from 'sigil-mark/process'; │
│                                                         │
│ const { constitution } = useProcessContext();           │
│ const payment = useCriticalAction({                     │
│   mutation: () => api.pay(amount),                      │
│   timeAuthority: 'server-tick',                         │
│ });                                                     │
│                                                         │
│ const Lens = useLens();                                 │
│                                                         │
│ <CriticalZone financial>                                │
│   <Lens.CriticalButton state={payment.state} ... />    │
│ </CriticalZone>                                         │
└─────────────────────────────────────────────────────────┘

PERSONA PHYSICS:
- Touch target: 32px (power_user) → 48px (StrictLens override)
- Input method: keyboard (power_user shortcuts enabled)
- Animations: None (StrictLens)
- State machine: idle → confirming → pending → confirmed/failed
```

## Layout Selection Guide

| Use Case | Layout | Lens | Time Authority | Persona |
|----------|--------|------|----------------|---------|
| Payment, checkout | CriticalZone | StrictLens (forced) | server-tick | power_user |
| Delete, destructive | CriticalZone | StrictLens (forced) | server-tick | power_user |
| Admin list, table | MachineryLayout | User preference | optimistic | power_user |
| Product card | GlassLayout | User preference | optimistic | newcomer |
| Marketing hero | GlassLayout | User preference | optimistic | newcomer |
| Mobile checkout | CriticalZone | StrictLens | server-tick | mobile |
| Accessible mode | Any | A11yLens | any | accessibility |

## Lens Characteristics

| Lens | Touch Target | Contrast | Animations |
|------|-------------|----------|------------|
| DefaultLens | 44px | Standard | Yes |
| StrictLens | 48px | High | No |
| A11yLens | 56px | WCAG AAA | No |

## Persona → Zone Mapping (v2.6)

| Zone | Default Persona | Input Method | Key Constraint |
|------|-----------------|--------------|----------------|
| critical | power_user (Chef) | keyboard | max_actions: 10 |
| checkout | power_user (Chef) | keyboard | reading_level: advanced |
| marketing | newcomer (Henlocker) | mouse | reading_level: beginner |
| landing | newcomer (Henlocker) | mouse | max_actions: 5 |
| admin | power_user (Chef) | keyboard | shortcuts: enabled |
| mobile | mobile (Thumbzone) | touch | tap_targets: 48px min |
| a11y | accessibility (A11y) | mixed | high_contrast: required |

## Examples (v2.6)

```
/craft "Create a confirm button for checkout"
→ PROCESS CONTEXT:
  Zone: critical | Persona: power_user
  Constitution: withdraw (block), deposit (block)
  Locked: DEC-2026-003 (confirmation flow: 2-step)
→ LAYOUT: CriticalZone (financial=true)
→ LENS: StrictLens (forced)
→ TIME AUTHORITY: server-tick
→ Generates: useCriticalAction + CriticalZone + Lens.CriticalButton
→ Note: Component must use 2-step confirmation per locked decision

/craft "Build a data table for admin"
→ PROCESS CONTEXT:
  Zone: admin | Persona: power_user
  Constitution: (no protected capabilities in admin)
  Locked: (none)
→ LAYOUT: MachineryLayout
→ LENS: DefaultLens (user preference)
→ TIME AUTHORITY: optimistic
→ PERSONA PHYSICS: keyboard shortcuts enabled
→ Generates: MachineryLayout + Lens.MachineryItem

/craft "Design a product card" --zone marketing
→ PROCESS CONTEXT:
  Zone: marketing | Persona: newcomer
  Constitution: (none)
  Locked: DEC-2026-001 (Primary CTA: blue)
→ LAYOUT: GlassLayout (variant="card")
→ LENS: DefaultLens (user preference)
→ HOVER PHYSICS: scale 1.02, translateY -4px
→ Note: Use blue (#3B82F6) for CTA per locked decision

/craft "Create withdraw button" --file src/features/wallet/Withdraw.tsx
→ PROCESS CONTEXT:
  Zone: critical | Persona: power_user
  ⚠️ CONSTITUTION WARNING:
    Action 'withdraw' is PROTECTED (enforcement: block)
    This capability MUST always work. Do not disable, hide, or gate.
→ LAYOUT: CriticalZone (financial=true)
→ Implementation must preserve withdraw capability at all times
```

## Diagnostic Mode (v2.6)

When given a file path, diagnose current implementation with full Process context:

```
/craft src/features/checkout/PaymentForm.tsx

═══════════════════════════════════════════════════════════
                       DIAGNOSIS
═══════════════════════════════════════════════════════════

PROCESS CONTEXT:
  Zone: critical (checkout)
  Persona: power_user
  Protected: withdraw, deposit, fee_disclosure
  Locked: DEC-2026-003 (confirmation: 2-step)

CURRENT IMPLEMENTATION:
┌─────────────────────────────────────────────────────────┐
│ Current: Raw <button> with onClick                      │
│ Issues:                                                 │
│   ❌ Missing Layout context                              │
│   ❌ Missing Lens components                             │
│   ⚠️  No ProcessContext for Constitution checking        │
│   ⚠️  1-step confirmation (locked decision says 2-step) │
└─────────────────────────────────────────────────────────┘

RECOMMENDED:
  - Wrap in CriticalZone (financial=true)
  - Use useCriticalAction with server-tick
  - Use Lens.CriticalButton for proper state handling
  - Add useProcessContext to check protected capabilities
  - Update to 2-step confirmation per DEC-2026-003
```

## Constitution Warning

When component touches protected capabilities:

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

## Next Steps

- `/validate` — Check Layout and Lens compliance
- `/garden` — Health report including Constitution and decision status
- `/consult` — Lock a new design decision
- `/consult --unlock [id]` — Request early unlock of a decision
