---
name: craft
version: "1.2.4"
description: Generate UI components using zone-appropriate recipes
agent: crafting-components
agent_path: .claude/skills/crafting-components/SKILL.md
preflight:
  - sigil_mark_exists
context_injection: true
---

# /craft

Generate UI components using recipes from the current zone.

## Usage

```
/craft [component_description]               # Auto-detect zone
/craft [component_description] --file [path] # Specify target file
/craft [component_description] --zone [zone] # Force zone context
```

## Workflow

```
1. RESOLVE ZONE
   - Get file path (from --file or current context)
   - Walk up directories for .sigilrc.yaml
   - Load zone config (recipes, sync, constraints)

2. SELECT RECIPE
   - Parse component description
   - Match against available recipes in zone's recipe set
   - Select most appropriate recipe

3. GENERATE COMPONENT
   - Import from @sigil/recipes/{zone}
   - Configure recipe with appropriate props
   - Show physics being applied

4. OUTPUT
   - Show ZONE, RECIPE, PHYSICS
   - Show generated code
   - If updating: show diff
```

## Output Format

```
ZONE: src/checkout (decisive)
RECIPE: decisive/Button

[generated code]

PHYSICS: spring(180, 12), server-tick
```

## Recipe Sets

| Zone | Recipe Set | Example Recipes |
|------|------------|-----------------|
| checkout | decisive | Button, ConfirmFlow |
| admin | machinery | Table, Toggle, Form |
| marketing | glass | HeroCard, FeatureCard, Tooltip |

## Physics by Set

| Recipe Set | Spring | Feel |
|------------|--------|------|
| decisive | (180, 12) | Heavy, deliberate |
| machinery | (400, 30) or instant | Efficient, no-nonsense |
| glass | (200, 20) | Smooth, delightful |

## Constraints

When zone has constraints:

```yaml
# src/checkout/.sigilrc.yaml
constraints:
  optimistic_ui: forbidden
  loading_spinners: forbidden
```

Claude will:
1. Check request against constraints
2. Refuse IMPOSSIBLE violations
3. Warn on BLOCK violations
4. Suggest alternatives

## Examples

```
/craft "Create a confirm button for checkout"
→ ZONE: src/checkout (decisive)
→ RECIPE: decisive/Button
→ PHYSICS: spring(180, 12), server-tick
→ Generates: <Button onAction={...} variant="primary" />

/craft "Build a data table for admin"
→ ZONE: src/admin (machinery)
→ RECIPE: machinery/Table
→ PHYSICS: none (instant)
→ Generates: <Table data={...} columns={...} />

/craft "Design a hero card for landing page"
→ ZONE: src/marketing (glass)
→ RECIPE: glass/HeroCard
→ PHYSICS: spring(200, 20), float
→ Generates: <HeroCard glowColor="..." />
```

## Next Steps

- `/sandbox [path]` — Enable raw physics for experimentation
- `/codify [path]` — Extract physics to recipe
- `/validate` — Check recipe compliance
