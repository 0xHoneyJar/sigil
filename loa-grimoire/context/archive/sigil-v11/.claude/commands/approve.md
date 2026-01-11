---
name: approve
description: Taste Owner sign-off on patterns
agent: approving-patterns
agent_path: .claude/skills/approving-patterns/SKILL.md
preflight:
  - sigil_setup_complete
---

# /approve

Taste Owner approval for visual patterns.

## Usage

```
/approve [pattern]         # Approve pattern
/approve --list            # List pending
/approve --history         # Show history
/approve --challenge [id]  # Challenge integrity change
```

## Taste Owner Authority

Taste Owners DICTATE:
- Colors, fonts, spacing
- Animation timing
- Border radius
- Shadows
- All visual decisions

Taste Owners do NOT control (requires poll):
- New features
- Feature removal
- Product direction

## Challenge Period

Integrity changes auto-deploy but can be challenged within 24 hours.

## Outputs

- `sigil-mark/governance/taste-owners.yaml`
