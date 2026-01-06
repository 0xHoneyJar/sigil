---
name: codify
version: "1.2.4"
description: Extract physics from sandbox into a recipe
agent: codifying-recipes
agent_path: .claude/skills/codifying-recipes/SKILL.md
preflight:
  - sigil_mark_exists
---

# /codify

Extract physics values from a sandbox file into a reusable recipe.

## Usage

```
/codify [path]                           # Extract to recipe (auto-name)
/codify [path] --name [recipe_name]      # Extract with specific name
/codify [path] --variant [base_recipe]   # Create variant of existing recipe
```

## What This Does

1. **Parses sandbox file** — Finds spring, timing, animation values
2. **Generates recipe** — Creates recipe file with proper anatomy
3. **Updates source** — Replaces raw physics with recipe import
4. **Cleans up** — Removes sandbox header and zone listing

## Recipe Generation

From sandbox:
```tsx
// sigil-sandbox
const SPRING = { stiffness: 300, damping: 8 };

<motion.button
  whileTap={{ scale: 0.96 }}
  transition={{ type: 'spring', ...SPRING }}
>
```

To recipe:
```tsx
/**
 * @sigil-recipe decisive/Button.snappy
 * @physics spring(300, 8), whileTap scale 0.96
 * @zone checkout, transaction
 */

const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 8,
};
```

## Recipe Anatomy

Every generated recipe includes:
1. `@sigil-recipe` JSDoc tag
2. `@physics` description
3. `@zone` where it applies
4. Named spring config object
5. TypeScript interface for props

## Variant Mode

Create variants of existing recipes:

```
/codify src/checkout/ExperimentButton.tsx --variant Button
→ Creates: sigil-mark/recipes/decisive/Button.snappy.tsx
→ Based on: Button.tsx with extracted physics
```

## Source File Update

Before:
```tsx
// sigil-sandbox
const SPRING = { stiffness: 300, damping: 8 };
// ... raw physics
```

After:
```tsx
import { ButtonSnappy } from '@sigil/recipes/decisive';
// ... uses recipe
```

## Output Files

| Path | Description |
|------|-------------|
| `sigil-mark/recipes/{zone}/{RecipeName}.tsx` | New recipe |
| Source file | Updated to import recipe |
| Zone `.sigilrc.yaml` | Sandbox entry removed |

## Workflow

1. **Analyze** — Parse file for physics values
2. **Suggest name** — Based on zone and physics characteristics
3. **Confirm** — User approves name and location
4. **Generate** — Create recipe with full anatomy
5. **Update source** — Replace raw physics with import
6. **Cleanup** — Remove sandbox markers

## Examples

```
/codify src/checkout/ExperimentButton.tsx
→ Found physics:
→   spring(300, 8), whileTap scale 0.96
→ Suggested name: Button.snappy
→ Zone: decisive
→
→ Created: sigil-mark/recipes/decisive/Button.snappy.tsx
→ Updated: src/checkout/ExperimentButton.tsx
→ Removed sandbox markers

/codify src/marketing/HeroExperiment.tsx --name FloatingCard
→ Created: sigil-mark/recipes/glass/FloatingCard.tsx
→ Physics: spring(180, 25), float -12px
```

## Error Handling

| Error | Resolution |
|-------|------------|
| File not in sandbox | Must enable `/sandbox` first |
| No physics found | Check for spring/timing values |
| Recipe name exists | Use variant mode or different name |
| Invalid zone | File path doesn't match any zone |

## Next Steps

After codifying:
- Recipe is immediately available for `/craft`
- Use `/validate` to check compliance
- Check `/garden` for sandbox cleanup
