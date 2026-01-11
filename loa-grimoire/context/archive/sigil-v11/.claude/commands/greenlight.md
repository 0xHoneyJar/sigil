---
name: greenlight
description: Community polling for concepts only
agent: greenlighting-concepts
agent_path: .claude/skills/greenlighting-concepts/SKILL.md
preflight:
  - sigil_setup_complete
---

# /greenlight

Community polling for CONCEPTS only. Never pixels.

## Usage

```
/greenlight [concept]      # Start greenlight poll
/greenlight --lockin       # Start lock-in poll
/greenlight --status       # Show active polls
/greenlight --archaeology  # Search rejection history
```

## Two-Phase Model

1. **Greenlight** (70%): "Should we explore building X?"
2. **Refinement** (No poll): Taste Owners design it
3. **Lock-in** (70%): "We built X. Ship it?"

## What Gets Polled

✓ New features
✓ Feature removal
✓ Major direction changes

## What Never Gets Polled

✗ Colors
✗ Fonts
✗ Animation timing
✗ Any visual decision

## Archaeology

Tracks near-misses (60-70%) and hard rejections (<60%) with cooldown periods.

## Outputs

- `sigil-mark/governance/greenlight.yaml`
