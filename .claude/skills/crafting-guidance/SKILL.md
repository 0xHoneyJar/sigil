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
      - sigil-mark/evidence/
      - sigil-mark/philosophy/philosophy.yaml
      - .sigilrc.yaml
    permission: read
  config:
    paths:
      - .sigil-setup-complete
    permission: read
---

# Crafting Guidance Skill (v4.0)

## Purpose

Provide design guidance during implementation with full context, gap detection, and journey awareness. Present **options with tradeoffs** — do NOT make taste decisions for the craftsman.

## Philosophy (v4.0)

> "Sweat the art. We handle the mechanics. Return to flow."

v4.0 adds:
1. **Progressive disclosure** — L1/L2/L3 grip levels for context control
2. **Gap detection** — Surface missing context at end of output
3. **Journey context** — Show zone journey_stage and persona trust_level
4. **Decision checking** — Respect locked decisions with conflict warnings

---

## Progressive Disclosure (v4.0)

### L1: Auto-Detect (Default)
```
/craft "button"
/craft "checkout form"
```
Uses auto-detected context from current file path:
- Zone from file path → `.sigilrc.yaml` zone paths
- Persona from zone's `persona_likely`
- All context loaded automatically

### L2: Explicit Zone
```
/craft "button" --zone critical
/craft "modal" --zone admin
```
Explicit zone context, persona from zone's `persona_likely`.

### L3: Full Control
```
/craft "button" --zone critical --persona depositor --lens strict --no-gaps
```
Full control over all context:
- `--zone <name>` — Explicit zone
- `--persona <id>` — Explicit persona
- `--lens <name>` — Explicit lens (strict, default, guided)
- `--no-gaps` — Suppress gap detection output

---

## Auto-Setup (v4.0)

If Sigil is not initialized, auto-setup before guidance:

```
I notice Sigil hasn't been set up yet. I'll initialize it now...

Created:
  - sigil-mark/
  - .sigilrc.yaml (defaults)

For design context, run:
  - /envision to capture product feel
  - /codify to define design rules

Proceeding with default context...
```

---

## Pre-Flight Checks

1. **Auto-Setup**: If `.sigil-setup-complete` missing, initialize Sigil
2. **Design Context**: Check for moodboard + rules
3. **Zone Config**: Load zones from `.sigilrc.yaml`
4. **Personas**: Load from `sigil-mark/personas/personas.yaml`
5. **Vocabulary**: Load from `sigil-mark/vocabulary/vocabulary.yaml`
6. **Philosophy**: Load from `sigil-mark/philosophy/philosophy.yaml`
7. **Decisions**: Load from `sigil-mark/consultation-chamber/decisions/`

---

## Context Loading (v4.0)

### Graceful Loading with Fallbacks

Each context file has a fallback if missing:

| File | Fallback |
|------|----------|
| `moodboard.md` | "No moodboard — run /envision" |
| `rules.md` | "No rules — run /codify" |
| `personas.yaml` | Default generic persona |
| `vocabulary.yaml` | "No vocabulary defined" |
| `philosophy.yaml` | Built-in defaults |
| `.sigilrc.yaml` | Default zone (marketing, newcomer) |

### Zone Resolution from File Path (v4.0)

```
1. Get current file path (e.g., src/features/checkout/ConfirmPage.tsx)
2. Load zones from .sigilrc.yaml
3. For each zone:
   - Check if path matches any zone.paths[] glob
   - If match, return zone with full v4.0 context
4. If no match, return "default" zone
```

**Zone context includes:**
- `journey_stage` — Where in user journey (discovery, active_use, claiming, etc.)
- `persona_likely` — Which persona is most likely here
- `trust_state` — User trust context (building, established, critical)
- `motion` — Zone motion style
- `patterns.prefer` — Preferred patterns for this zone
- `patterns.warn` — Patterns that should warn

### Persona Resolution from Zone (v4.0)

```
1. Get resolved zone
2. If zone.persona_likely is set:
   - Load persona from personas.yaml
   - Include persona's trust_level, journey_stages, evidence
3. If no persona_likely:
   - Use zone's default persona based on layout
4. Persona context includes:
   - trust_level — How much trust persona has
   - journey_stages — Where this persona appears
   - preferences — motion, help, density
   - constraints — max_actions, error_tolerance
```

---

## Gap Detection (v4.0)

Gap detection surfaces missing context at the END of output.

### What Gets Detected

| Gap Type | Detection | Refine Command |
|----------|-----------|----------------|
| Undefined persona | Request mentions persona not in personas.yaml | `/refine --persona newcomer "new user type"` |
| Undefined zone | Request mentions zone not in .sigilrc.yaml | `/refine --zone checkout "new zone"` |
| Missing vocabulary | Request uses term not in vocabulary.yaml | `/refine --vocab pot "define pot feel"` |
| No moodboard | moodboard.md/folder doesn't exist | `/envision` |
| No rules | rules.md doesn't exist | `/codify` |

### Gap Output Format

```
═══════════════════════════════════════════════════════════
                     CONTEXT GAPS
═══════════════════════════════════════════════════════════

⚠️ 2 gaps detected that may affect this guidance:

1. UNDEFINED PERSONA: "whale"
   You mentioned "whale users" but no whale persona exists.
   → /refine --persona whale "high-value depositor"

2. MISSING VOCABULARY: "vault"
   "vault" is used but not defined in vocabulary.
   → /refine --vocab vault "secure storage feel"

These gaps don't block implementation, but defining them
improves future guidance consistency.
```

### Suppress Gaps

Use `--no-gaps` to suppress gap detection output:
```
/craft "button" --no-gaps
```

---

## Decision Lock Checking (v4.0)

### Loading Decisions

```
1. Read sigil-mark/consultation-chamber/decisions/*.yaml
2. Filter for active (non-expired) decisions
3. Check decision scope against current zone/component
4. Warn if implementation conflicts with locked decision
```

### Decision Conflict Warning

```
🔒 LOCKED DECISION CONFLICT

Decision: DEC-2026-003
Topic: Confirmation pattern for transactions > $100
Lock expires: 2026-04-07

Your implementation appears to use single-click confirmation,
but the locked decision requires 2-step confirmation.

Options:
1. Align with decision (2-step pattern shown below)
2. Proceed with your approach (will be flagged in /garden)
3. Unlock decision: /consult DEC-2026-003 --unlock

Which approach?
```

### Decision Scope Check

Decisions have scope that affects when they apply:

```yaml
scope:
  zones: [critical]
  components: ["*Button*", "*Confirm*"]
```

Only warn when current zone/component matches decision scope.

---

## Journey Context in Output (v4.0)

### Response Header Format

```
═══════════════════════════════════════════════════════════
                     DESIGN CONTEXT
═══════════════════════════════════════════════════════════

ZONE: critical
  Journey: claiming (withdrawing value)
  Trust State: critical (reinforcement needed)
  Motion: deliberate (800ms+)

PERSONA: depositor
  Trust Level: high (established user)
  Evidence: 2,993 depositors in 30 days
  Preferences: deliberate motion, contextual help, medium density

PATTERN RATIONALE:
  ✓ Using deliberate-entrance (zone: critical → deliberate motion)
  ✓ Using 2-step confirmation (decision: DEC-2026-003)
  ⚠️ Avoiding playful-bounce (zone.patterns.warn)

VOCABULARY:
  pot → glass material, warm motion, friendly tone
  "Mental model: Piggy bank, casual saving"

LOCKED DECISIONS:
  DEC-2026-003: 2-step confirmation for > $100 (expires 2026-04-07)
```

### Explaining Pattern Choices

For each pattern used, explain why:

```
PATTERN RATIONALE:
  ✓ deliberate-entrance — Zone is critical, requires 800ms+ motion
  ✓ confirmation-flow — Locked decision DEC-2026-003
  ✓ error-with-recovery — Persona has low error tolerance
  ⚠️ NOT using instant-transition — Zone patterns.warn includes it
```

---

## Response Format

### Full Response Structure

```
═══════════════════════════════════════════════════════════
                     DESIGN CONTEXT
═══════════════════════════════════════════════════════════

[Zone, Persona, Vocabulary, Decisions — with journey context]

═══════════════════════════════════════════════════════════
                     YOUR CALL (if multiple approaches)
═══════════════════════════════════════════════════════════

[Options with tradeoffs]

═══════════════════════════════════════════════════════════
                     IMPLEMENTATION
═══════════════════════════════════════════════════════════

[Code with layout, lens, material, time authority]

═══════════════════════════════════════════════════════════
                     CONTEXT GAPS (if any)
═══════════════════════════════════════════════════════════

[Gap detection output with /refine commands]
```

### Options with Tradeoffs

When there are multiple valid approaches:

```
═══════════════════════════════════════════════════════════
                     YOUR CALL
═══════════════════════════════════════════════════════════

**Option A: 2-step confirmation**
  Aligns with: DEC-2026-003 (locked)
  Tradeoff: More friction, higher trust
  Journey fit: Good for claiming stage

**Option B: Single-click with undo**
  Tradeoff: Less friction, relies on recovery
  Journey fit: Better for active_use stage
  Note: Conflicts with locked decision

Which approach works better for your use case?
```

---

## Code Generation (v4.0)

**IMPORTANT:** Process layer is agent-only. Do NOT generate code that imports from `sigil-mark/process`.

### Correct Pattern

```tsx
import { useCriticalAction, CriticalZone, useLens } from 'sigil-mark';

function ConfirmPurchase({ amount }: { amount: number }) {
  const Lens = useLens();

  const payment = useCriticalAction({
    mutation: () => api.pay(amount),
    timeAuthority: 'server-tick', // Critical zone = server-tick
  });

  return (
    <CriticalZone financial>
      {/* Journey: claiming, Trust: critical, Pattern: 2-step per DEC-2026-003 */}
      <CriticalZone.Content>
        <h2>Confirm Payment</h2>
        <p>${amount}</p>
      </CriticalZone.Content>
      <CriticalZone.Actions>
        <Lens.CriticalButton
          state={payment.state}
          onAction={payment.commit}
        >
          Confirm Purchase
        </Lens.CriticalButton>
      </CriticalZone.Actions>
    </CriticalZone>
  );
}
```

### Code Comments Include Journey Context

```tsx
// Zone: critical | Journey: claiming | Trust: critical
// Persona: depositor | Trust level: high
// Pattern: deliberate-entrance (800ms) per zone.motion
```

---

## Error Handling

| Situation | Response |
|-----------|----------|
| No setup complete | Auto-initialize Sigil, proceed with defaults |
| No moodboard | "Run `/envision` to capture product feel." |
| No rules | "Run `/codify` to define design rules." |
| No vocabulary | "No vocabulary defined. Using zone defaults." |
| No decisions | "No locked decisions for this zone." |
| Unknown zone | "Zone not found. Using default context." |
| Unknown persona | "Persona not found. Using zone default." |
| Persona not in zone | "Persona rarely appears in this zone." |

---

## When to Ask vs Proceed

| Context | Ask | Proceed |
|---------|-----|---------|
| Multiple valid approaches | ✓ Present options | |
| Decision conflict | ✓ Warn and ask | |
| Single clear approach | | ✓ Implement |
| Gap detected | | ✓ Proceed, surface gap at end |
| Missing context files | | ✓ Use defaults, note in output |
| Constitution warning | | ✓ Surface warning, implement |

---

## Philosophy

This skill enables craft, it doesn't police it.

1. **Options, not mandates** — Present tradeoffs, let craftsman choose
2. **Context, not opinions** — Surface Constitution, Vocabulary, Decisions, Journey
3. **Never refuse** — Warn, offer alternatives, implement per request
4. **Respect locks** — Flag conflicts, don't override
5. **Gaps at end** — Don't interrupt flow with missing context
6. **Journey awareness** — Surface why patterns were chosen

Do NOT:
- Make design decisions for the craftsman
- Refuse to implement something based on opinion
- Choose between equivalent options without asking
- Override craftsman preferences
- Block on missing context (use defaults, surface gap)

DO:
- Surface all relevant context (zone, persona, journey, decisions)
- Explain pattern choices with journey rationale
- Present options with tradeoffs when multiple approaches exist
- Surface gaps at END with actionable /refine commands
- Proceed with implementation after warnings
