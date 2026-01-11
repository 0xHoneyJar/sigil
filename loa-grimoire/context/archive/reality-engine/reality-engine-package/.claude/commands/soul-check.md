---
name: soul-check
description: Check code changes against the Canon of Flaws and Immutable Values
agent: reality-engine
agent_path: .claude/skills/reality-engine/SKILL.md
---

# /soul-check

Validates code changes against the Reality Engine's Soul Binder:

1. **Canon of Flaws** — Checks if changes would break protected emergent behaviors
2. **Immutable Values** — Verifies adherence to core principles
3. **Visual Soul** — Checks grit signatures for assets

## Usage

```
/soul-check                    # Check staged changes
/soul-check path/to/file.ts    # Check specific file
/soul-check --asset image.png  # Check asset with grit validation
```

## What Gets Checked

### Canon of Flaws
- Prayer flicking patterns
- Tick manipulation code
- Animation canceling logic
- Other protected emergent behaviors

### Immutable Values
- The Grind (no pay-to-skip)
- The Click (tick-aligned actions)
- The Risk (meaningful consequences)
- The Look (low-fidelity with soul)

## Outcomes

- **PASS**: Changes don't affect protected behaviors
- **BLOCK**: Changes would break a Protected Flaw
- **WARN**: Changes touch sensitive code, review recommended
