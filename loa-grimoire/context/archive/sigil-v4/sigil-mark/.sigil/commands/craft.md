---
name: craft
description: Generate components with physics-aware toolkit (Hammer diagnoses, Chisel executes)
skill: crafting-components
skill_path: .sigil/skills/crafting-components/SKILL.md
allowed_tools:
  - Read
  - Write
  - Edit
  - Bash
  - AskUserQuestion
preflight:
  - sigil_setup_complete
---

# /craft

Generate or refine UI components within Sigil's physics constraints.

## The Toolkit

`/craft` contains two tools, selected based on your input:

### 🔨 Hammer (Diagnose + Route)
For ambiguous symptoms: "feels slow", "doesn't feel right", "something's off"
- Asks questions to find ROOT CAUSE
- Routes to correct solution (Chisel / Loa / Approve)

### 🪓 Chisel (Execute)
For clear aesthetic fixes: "adjust padding", "change spring tension", "lighter shadow"
- Quick execution
- Minimal ceremony

## Usage

```
/craft                           # Start conversation
/craft ClaimButton.tsx           # Work on specific file
/craft "the animation feels off" # Describe the issue
```

## The Linear Test

```
User: "The claim button feels slow"

❌ FAIL: Immediately add skeleton loader
❌ FAIL: Add optimistic UI without checking zone
✓ PASS: Ask "What kind of slow?" → Diagnose → Route
```

## Physics Enforcement

- Zone physics are IMPOSSIBLE to violate (not just blocked)
- Budget violations can be overridden by Taste Key
- Resonance drift is warned but allowed
