---
name: craft
description: Generate UI with context injection
agent: crafting-components
agent_path: .claude/skills/crafting-components/SKILL.md
preflight:
  - sigil_setup_complete
  - essence_exists
  - materials_exist
context_injection: true
---

# /craft

Generate UI components with soul. Context is automatically injected.

## Usage

```
/craft [prompt]
/craft [prompt] --zone [zone]
/craft [prompt] --material [material]
/craft [prompt] --tension "playfulness=80"
```

## What Gets Injected

Before generation, `/craft` injects:
- Zone configuration
- Material physics
- Sync strategy
- Fidelity ceiling
- Soul statement and invariants
- Tension values

## Examples

```
/craft "Create a checkout button"
-> Detects critical zone
-> Injects clay material, server_tick sync
-> Generates with pending state, spring physics

/craft "Build a command palette" --zone transactional
-> Uses machinery material
-> Instant transitions, no animation
-> Keyboard-first design

/craft "Design a card hover effect" --material glass
-> Uses glass physics
-> Glow feedback, ease motion
```

## Post-Generation

After generation, constitution check runs:
- Invariant violations -> BLOCK
- Fidelity violations -> WARN
- Sync violations -> BLOCK
