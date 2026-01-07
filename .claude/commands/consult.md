---
name: "consult"
version: "2.6.0"
description: "Start a consultation process or manage locked decisions"
skill: "consulting-decisions"
command_type: "interview"

arguments:
  - name: "topic_or_id"
    type: "string"
    required: false
    description: "Topic to consult on, or decision ID for operations"
  - name: "--record-outcome"
    type: "flag"
    required: false
    description: "Record outcome for existing decision"
  - name: "--unlock"
    type: "flag"
    required: false
    description: "Request early unlock of a locked decision"
  - name: "--status"
    type: "flag"
    required: false
    description: "Show status of a decision"

pre_flight:
  - check: "file_exists"
    path: ".sigil-setup-complete"
    error: "Sigil not initialized. Run /setup first."

outputs:
  - path: "sigil-mark/consultation-chamber/decisions/{id}.yaml"
    type: "file"
    description: "Decision record"

strictness_behavior:
  discovery: "allow"
  guiding: "allow"
  enforcing: "allow"
  strict: "allow"

mode:
  default: "foreground"
  allow_background: false
---

# Consult (v2.6)

Start a consultation process or manage locked decisions. The process follows three tiers based on decision scope.

## Purpose

Route design decisions to the appropriate authority level. Not every decision needs community input, and not every detail should be debated.

## Invocation

```
/consult                                    # Start new consultation
/consult "button color"                     # Consult on specific topic
/consult DEC-2026-001 --status              # Check decision status
/consult DEC-2026-001 --record-outcome      # Record outcome
/consult DEC-2026-001 --unlock              # Request early unlock (NEW)
```

## Agent

Launches `consulting-decisions` skill from `.claude/skills/consulting-decisions/`.

See: `.claude/skills/consulting-decisions/SKILL.md` for full workflow details.

## Decision Layers

| Layer | Scope | Process | Authority |
|-------|-------|---------|-----------|
| **Strategic** | New features, major changes | Community poll | Binding vote |
| **Direction** | Visual style A vs B, tone | Sentiment gathering | Taste Owner |
| **Execution** | Pixel-level details | None | Taste Owner dictates |

## What Happens

1. Agent determines appropriate layer (strategic/direction/execution)
2. For Strategic: Creates poll format for community channels
3. For Direction: Creates comparison format, gathers sentiment
4. For Execution: Informs user this is a Taste Owner decision
5. Creates decision record in `sigil-mark/consultation-chamber/decisions/`

## After Decision

Direction and Execution layers **LOCK** after decision:
- No further polling on details
- Time-based unlock allows future revisitation
- `/craft` will warn/block when touching locked decisions

## Recording Outcomes

After consultation is complete:

```
/consult DEC-2026-001 --record-outcome
```

This prompts for:
- Which option was chosen
- Reasoning for the decision
- Locks the decision

## Lock Durations

| Layer | Default Lock |
|-------|--------------|
| Strategic | 180 days |
| Direction | 90 days |
| Execution | 30 days |

## Early Unlock (NEW in v2.6)

Request early unlock of a locked decision:

```
/consult DEC-2026-001 --unlock
```

The unlock flow:

1. **Load decision** — Read decision from consultation-chamber/decisions/
2. **Verify locked** — Confirm decision is currently locked
3. **Show context** — Display original decision, rationale, time remaining
4. **Request justification** — Ask for justification for early unlock
5. **Record unlock** — Add to unlock_history, update status
6. **Warn about implications** — Note that /garden will flag this

### Unlock Output

```
🔓 EARLY UNLOCK REQUEST

Decision: DEC-2026-003
Topic: Confirmation flow (2-step)
Locked at: 2026-01-06
Expires: 2026-04-06 (90 days remaining)

Original rationale:
  2-step confirmation reduces accidental transactions
  Decided by: Taste Owner
  Scope: direction

⚠️ WARNING: Early unlocks should be rare and justified.

Why do you need to unlock this decision early?
[User provides justification]

🔓 DECISION UNLOCKED

Decision: DEC-2026-003
Unlocked at: 2026-01-06
Justification: {user's justification}
Previous lock: 90 days (45 days remaining)

Note: This unlock has been recorded in the decision history.
/garden will flag this decision as manually unlocked.

The decision can now be modified or re-consulted.
```

### Unlock History

Each unlock is recorded:

```yaml
unlock_history:
  - unlocked_at: "2026-01-06T12:00:00Z"
    unlocked_by: "Developer"
    justification: "New UX research shows 1-step is acceptable"
    remaining_days: 45
```

## Decision Status (NEW in v2.6)

Check status of a decision:

```
/consult DEC-2026-001 --status
```

Output:

```
📋 DECISION STATUS

ID: DEC-2026-001
Topic: Primary CTA color
Scope: direction
Status: locked

Decision: Blue (#3B82F6)
Decided by: Taste Owner
Decided at: 2026-01-06

Lock:
  Locked at: 2026-01-06
  Expires: 2026-04-06
  Days remaining: 90

Unlock history: (none)

Related decisions: (none)
```

## Example

```
/consult "primary CTA color"

Agent: "What type of decision is this?"
[User selects: Direction]

Agent: "I'll prepare a comparison for sentiment gathering..."

📊 Direction Decision: Primary CTA Color

Comparing:
| Blue (#3B82F6) | Green (#22C55E) |
|----------------|-----------------|
| Trust, reliability | Action, energy |

[Creates decision record DEC-2026-001]
```

## See Also

- `/craft` — Respects locked decisions, surfaces conflicts
- `/garden` — Reports expired/unlocked decisions
- `/approve` — Sign-off includes decision lock status
