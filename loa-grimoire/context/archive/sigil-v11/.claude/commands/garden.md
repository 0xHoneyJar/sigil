---
name: garden
description: Track paper cuts and enforce 3:1 rule
agent: gardening-entropy
agent_path: .claude/skills/gardening-entropy/SKILL.md
preflight:
  - sigil_setup_complete
---

# /garden

Manage design entropy through paper cut tracking.

## Usage

```
/garden              # Show status
/garden scan         # Scan for paper cuts
/garden add [desc]   # Add paper cut manually
/garden fix [id]     # Mark as fixed
/garden debt         # Show debt status
```

## The 3:1 Rule

Before 1 new feature, fix 3 paper cuts.

## Paper Cut Categories

- **P0** - Breaks functionality
- **P1** - Visually jarring
- **P2** - Noticeable on inspection
- **P3** - Only designers notice

## Detection

- Spacing drift (non-token values)
- Color drift (hardcoded hex)
- Animation drift (non-standard timing)
- Component duplication

## Outputs

- `sigil-mark/workbench/paper-cuts.yaml`
