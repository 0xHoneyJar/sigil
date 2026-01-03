---
name: "consult"
version: "3.0.0"
description: "Start a consultation process for a design decision"
skill: "consulting-decisions"
command_type: "interview"

arguments:
  - name: "topic"
    type: "string"
    required: false
    description: "Topic to consult on"

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

# Consult

Start a consultation process for a design decision. The process follows three tiers based on decision scope.

## Purpose

Route design decisions to the appropriate authority level. Not every decision needs community input, and not every detail should be debated.

## Invocation

```
/consult
/consult "button color"
/consult "new onboarding flow"
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

- `/craft` - Respects locked decisions
- `/approve` - Sign-off includes decision lock status
