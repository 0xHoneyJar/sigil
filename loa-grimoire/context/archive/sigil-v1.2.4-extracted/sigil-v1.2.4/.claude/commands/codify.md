---
name: codify
description: Extract physics from component into a recipe
skill: sigil-core
---

# /codify

Extract physics from a component into a reusable recipe.

## Usage

```
/codify src/checkout/Experiment.tsx
/codify src/checkout/Experiment.tsx --name "Button.snappy"
```

## Behavior

1. Analyze component for spring/timing/animation values
2. Suggest recipe name based on zone and behavior
3. Create recipe file in `sigil-mark/recipes/{zone}/`
4. Update component to import the new recipe
5. Remove `// sigil-sandbox` markers if present

## Output

```
ANALYZING: src/checkout/Experiment.tsx

Detected physics:
  spring: { stiffness: 240, damping: 10 }
  scale: 0.96 on press
  
Zone: checkout (decisive)

SUGGESTED RECIPE: decisive/Button.snappy

Create recipe? (y/n) > y

Created: sigil-mark/recipes/decisive/Button.snappy.tsx
Updated: src/checkout/Experiment.tsx → imports recipe
Removed: // sigil-sandbox markers

Recipe ready for use:
  import { Button } from '@sigil/recipes/decisive/Button.snappy';
```

## Recipe Naming

Convention: `{zone}/{Component}.{variant}.tsx`

Examples:
- `decisive/Button.nintendo.tsx` — snappier variant
- `decisive/Button.relaxed.tsx` — less anxious variant
- `glass/Card.floating.tsx` — with float effect
