---
name: craft
description: Generate a component using zone-appropriate recipes
skill: sigil-core
---

# /craft

Generate a component using recipes from the current zone.

## Usage

```
/craft "button for checkout"
/craft --file src/checkout/ConfirmButton.tsx "confirmation button"
```

## Behavior

1. Resolve zone from file path or current directory
2. Load `.sigilrc.yaml` to determine available recipes
3. Select appropriate recipe based on component description
4. Generate component that imports and uses the recipe
5. Show physics being applied

## Output

```
ZONE: src/checkout (decisive)
RECIPE: decisive/Button

[generated component code]

PHYSICS: spring(180, 12), server-tick

Next: Test in browser | /sandbox (experiment) | /codify (new recipe)
```

## In Workbench Mode

After generation, prompt:
- "Toggle A/B to feel the difference"
- Browser pane updates automatically
- Show diff prominently for learning
