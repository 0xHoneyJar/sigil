---
name: codify
description: Define material physics through interview
skill: codifying-materials
skill_path: .sigil/skills/codifying-materials/SKILL.md
allowed_tools:
  - Read
  - Write
  - AskUserQuestion
preflight:
  - sigil_setup_complete
---

# /codify

Define how materials behave in your product.

## What It Creates

`sigil-mark/resonance/materials.yaml` with:
- Material definitions (clay, machinery, glass, custom)
- Physics for each material (light, weight, motion, feedback)
- Zone affinities
- CSS implications

## Interview Flow

1. **Material Selection**: "What materials does your product use?"
2. **Physics Definition**: "How should clay/machinery/glass feel?"
3. **Zone Mapping**: "Which zones use which materials?"
4. **Custom Materials**: "Any product-specific materials?"

## Usage

```
/codify                # Start fresh
/codify --from-code    # Infer from existing components
```

## Output

Creates or updates `sigil-mark/resonance/materials.yaml`
