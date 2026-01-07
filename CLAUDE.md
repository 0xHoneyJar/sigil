# Sigil v2.6: Craftsman's Flow

> "Context before code. Constitution before creativity."

You are operating within **Sigil v2.6**, a design physics framework with a **Process Layer** for human-AI collaboration. The key architectural insight: **Humans capture "what" and "why" in Process, AI implements "how" in Core**.

---

## Architecture (4 Layers)

```
┌────────────────────────────────────────────────────────────┐
│  PROCESS LAYER — Human decisions (v2.6)                   │
│  Constitution, Lens Array, Consultation Chamber, Surveys  │
│  YAML/Markdown captured by Claude, referenced in code     │
├────────────────────────────────────────────────────────────┤
│  CORE LAYER — Physics engines (Truth)                     │
│  useCriticalAction → State Stream                         │
│  { status, timeAuthority, selfPrediction, worldTruth }    │
├────────────────────────────────────────────────────────────┤
│  LAYOUT LAYER — Zones + Structural Physics                │
│  CriticalZone, MachineryLayout, GlassLayout               │
│  Layouts ARE Zones. Physics is DOM, not lint.             │
├────────────────────────────────────────────────────────────┤
│  LENS LAYER — Interchangeable UIs (Experience)            │
│  useLens() → Lens components                              │
│  DefaultLens, StrictLens, A11yLens                        │
└────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Source | Manages | Examples |
|-------|--------|---------|----------|
| **Process** | YAML/Markdown | Design decisions | Constitution, Decisions, Personas |
| **Core** | TypeScript | State streams | `useCriticalAction`, `useLocalCache` |
| **Layout** | React | Zone context | `CriticalZone`, `MachineryLayout` |
| **Lens** | React | UI rendering | `DefaultLens`, `StrictLens`, `A11yLens` |

---

## Process Layer (v2.6)

<sigil_process>
The Process layer captures human decisions that inform AI behavior.

### Constitution

Protected capabilities that MUST always work. Never disable, hide, or gate these.

```yaml
# sigil-mark/constitution/protected-capabilities.yaml
protected:
  - id: withdraw
    name: "Withdraw Funds"
    enforcement: block    # CRITICAL - never compromise
    rationale: "Users must always be able to withdraw their funds"
  - id: fee_disclosure
    name: "Fee Disclosure"
    enforcement: warn     # Important but not blocking
    rationale: "Transparency builds trust"
```

**Enforcement Levels:**
- `block` — CRITICAL. This capability must ALWAYS work.
- `warn` — Important. Surface warning if affected.
- `log` — Informational. Track but don't interrupt.

### Locked Decisions

Design decisions with time-based locks to prevent endless bikeshedding.

```yaml
# sigil-mark/consultation-chamber/decisions/DEC-2026-001.yaml
id: "DEC-2026-001"
topic: "Primary CTA color"
decision: "Blue (#3B82F6)"
scope: direction          # 90-day lock
locked_at: "2026-01-06"
expires_at: "2026-04-06"
status: locked
rationale: "Blue tested highest for trust"
```

**Lock Periods:**
- `strategic` — 180 days (6 months)
- `direction` — 90 days (3 months)
- `execution` — 30 days (1 month)

### Personas (Lens Array)

User archetypes with physics and constraints.

```yaml
# sigil-mark/lens-array/lenses.yaml
lenses:
  power_user:
    alias: "Chef"
    physics:
      tap_targets: "32px min"
      input_method: keyboard
      shortcuts: { expected: true }
    constraints:
      max_actions_per_screen: 10
      reading_level: advanced

  newcomer:
    alias: "Henlocker"
    physics:
      tap_targets: "48px min"
      input_method: mouse
    constraints:
      max_actions_per_screen: 5
      reading_level: beginner
```

### Zone-Persona Mapping

Zones automatically map to personas:

| Zone | Persona | Input | Key Constraint |
|------|---------|-------|----------------|
| critical | power_user | keyboard | max_actions: 10 |
| checkout | power_user | keyboard | reading_level: advanced |
| marketing | newcomer | mouse | max_actions: 5 |
| landing | newcomer | mouse | reading_level: beginner |
| admin | power_user | keyboard | shortcuts: enabled |
| mobile | mobile | touch | tap_targets: 48px |
| a11y | accessibility | mixed | high_contrast: required |
</sigil_process>

---

## Commands

<sigil_commands>
### /craft

Get design guidance with full Process context.

```
/craft "Create a confirm button for checkout"

═══════════════════════════════════════════════════════════
                     PROCESS CONTEXT
═══════════════════════════════════════════════════════════

ZONE: critical (checkout)
PERSONA: power_user (Chef)
  Input: keyboard
  Tap targets: 32px min

CONSTITUTION:
  ⚠️ PROTECTED: withdraw (enforcement: block)
  ⚠️ PROTECTED: deposit (enforcement: block)

LOCKED DECISIONS:
  🔒 DEC-2026-003: Confirmation flow (2-step) — 90 days remaining

═══════════════════════════════════════════════════════════
                     IMPLEMENTATION
═══════════════════════════════════════════════════════════

LAYOUT: CriticalZone (financial=true)
LENS: StrictLens (forced)
TIME AUTHORITY: server-tick

[Code example follows]
```

### /consult

Lock design decisions to prevent endless debates.

```
/consult "Primary CTA color"     # Start new consultation
/consult DEC-2026-001 --status   # Check decision status
/consult DEC-2026-001 --unlock   # Request early unlock
```

**Decision Flow:**
1. Determine scope (strategic/direction/execution)
2. Gather input (poll, sentiment, or direct decision)
3. Lock decision with appropriate duration
4. Surface in /craft when relevant

### /garden

Health report including Process layer status.

```
/garden                   # Full health report
/garden --process         # Process layer only
/garden --constitution    # Constitution compliance only
/garden --decisions       # Decision status only
```

**Reports:**
- Constitution violations (CRITICAL priority)
- Expired decisions (HIGH priority)
- Missing persona coverage (MEDIUM priority)
- Layout coverage (LOW priority)
</sigil_commands>

---

## Agent Protocol

<sigil_agent_protocol>
### Before Generating UI Code

1. **Load Process Context** (v2.6)
   - Read Constitution for protected capabilities
   - Find locked decisions for this zone
   - Get persona for this zone

2. **Determine Zone:**
   - Is this inside a Layout? Read the zone context.
   - What persona maps to this zone?
   - What constraints apply?

3. **Check Constitution:**
   - Does this component touch protected capabilities?
   - Surface warnings (don't block, but inform)

4. **Surface Locked Decisions:**
   - Are there active decisions affecting this zone?
   - Warn if implementation contradicts a locked decision

5. **Generate Code:**
   - Use appropriate Layout + Lens
   - Respect persona physics
   - Include ProcessContext if needed

### Example: Payment Button

```tsx
import { useCriticalAction, CriticalZone, useLens } from 'sigil-mark';
import { useProcessContext } from 'sigil-mark/process';

function PaymentButton({ amount }: { amount: number }) {
  // v2.6: Process context for Constitution awareness
  const { constitution } = useProcessContext();

  const payment = useCriticalAction({
    mutation: () => api.pay(amount),
    timeAuthority: 'server-tick',
  });

  const Lens = useLens(); // StrictLens forced in CriticalZone

  return (
    <CriticalZone financial>
      {/* 2-step confirmation per locked decision DEC-2026-003 */}
      <CriticalZone.Content>
        <h2>Confirm Payment</h2>
        <p>${amount}</p>
      </CriticalZone.Content>
      <CriticalZone.Actions>
        <Lens.CriticalButton state={payment.state} onAction={payment.commit}>
          Pay Now
        </Lens.CriticalButton>
      </CriticalZone.Actions>
    </CriticalZone>
  );
}
```

### Constitution Warnings

When component touches protected capability:

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

### Locked Decision Conflicts

When implementation contradicts a locked decision:

```
🔒 DECISION CONFLICT DETECTED

Decision: DEC-2026-003
Topic: Confirmation flow
Locked value: 2-step confirmation
Your implementation: 1-step confirmation

Options:
1. Update implementation to match locked decision (recommended)
2. Request early unlock: /consult --unlock DEC-2026-003
3. Proceed anyway (will be flagged in /garden)
```
</sigil_agent_protocol>

---

## Core Layer

<sigil_core>
### useCriticalAction

The main physics hook. Emits a state stream with time authority.

```tsx
const action = useCriticalAction({
  mutation: () => api.doThing(),
  timeAuthority: 'server-tick' | 'optimistic' | 'hybrid',
});

// State stream
action.state.status    // 'idle' | 'confirming' | 'pending' | 'confirmed' | 'failed'
action.state.error     // Error | null

// Actions
action.confirm()       // Enter confirming state
action.commit()        // Execute mutation
action.cancel()        // Cancel (if confirming)
action.reset()         // Reset to idle
```

### Time Authorities

| Authority | Behavior | Use Case |
|-----------|----------|----------|
| `server-tick` | Wait for server confirmation | Payments, destructive actions |
| `optimistic` | Instant update, silent rollback | Admin tools, lists |
| `hybrid` | Instant + sync indicator | Real-time collaboration |
</sigil_core>

---

## Layout Layer

<sigil_layouts>
### CriticalZone

For high-stakes actions (payments, destructive operations).

```tsx
<CriticalZone financial={true}>
  {/* Zone context: { type: 'critical', financial: true } */}
  {/* useLens() returns StrictLens for critical buttons */}
  {/* Persona: power_user (Chef) */}
</CriticalZone>
```

### MachineryLayout

For keyboard-driven admin interfaces.

```tsx
<MachineryLayout stateKey="items" onAction={(id) => {}}>
  {/* Zone context: { type: 'admin' } */}
  {/* Keyboard nav: j/k, Enter, Delete */}
  {/* Persona: power_user (Chef) */}
</MachineryLayout>
```

### GlassLayout

For hover-driven marketing/showcase interfaces.

```tsx
<GlassLayout variant="card">
  {/* Zone context: { type: 'marketing' } */}
  {/* Hover physics: scale 1.02, translateY -4px */}
  {/* Persona: newcomer (Henlocker) */}
</GlassLayout>
```
</sigil_layouts>

---

## Lens Layer

<sigil_lenses>
### useLens Hook

Returns the appropriate lens based on zone context.

```tsx
const Lens = useLens();

// In CriticalZone with financial=true → StrictLens (forced)
// In MachineryLayout → User preference or DefaultLens
// In GlassLayout → User preference or DefaultLens
```

### Built-in Lenses

| Lens | Touch Target | Contrast | Animations |
|------|-------------|----------|------------|
| `DefaultLens` | 44px | Standard | Yes |
| `StrictLens` | 48px | High | No |
| `A11yLens` | 56px | WCAG AAA | No |
</sigil_lenses>

---

## File Structure

<sigil_structure>
```
sigil-mark/
├── index.ts                    # Main entry (v2.6 exports)
│
├── process/                    # Process layer (v2.6)
│   ├── index.ts                # Barrel export
│   ├── constitution-reader.ts  # Protected capabilities
│   ├── decision-reader.ts      # Locked decisions
│   ├── lens-array-reader.ts    # Personas
│   ├── vibe-check-reader.ts    # Surveys
│   └── process-context.tsx     # React context
│
├── constitution/               # Constitution YAML
│   └── protected-capabilities.yaml
│
├── consultation-chamber/       # Decisions YAML
│   ├── config.yaml
│   └── decisions/*.yaml
│
├── lens-array/                 # Personas YAML
│   └── lenses.yaml
│
├── core/                       # Physics engines
│   ├── use-critical-action.ts
│   ├── zone-resolver.ts        # Zone-persona mapping
│   └── ...
│
├── layouts/                    # Zones + Structural Physics
│   ├── critical-zone.tsx
│   ├── machinery-layout.tsx
│   └── glass-layout.tsx
│
└── lenses/                     # Interchangeable UIs
    ├── default/
    ├── strict/
    └── a11y/
```
</sigil_structure>

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `/craft` | Get design guidance with Process context |
| `/consult` | Lock design decisions |
| `/garden` | Health report (Constitution, Decisions, Coverage) |
| `/validate` | Check recipe compliance |
| `/approve` | Human review and sign-off |

---

## Coexistence with Loa

Sigil and Loa can coexist. They have separate:
- State zones (sigil-mark/ vs loa-grimoire/)
- Config files (.sigilrc.yaml vs .loa.config.yaml)
- Skills (design-focused vs workflow-focused)

No automatic cross-loading — developer decides when to reference design context.
