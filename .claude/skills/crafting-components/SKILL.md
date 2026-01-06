# Sigil v1.2.4 Agent: Crafting Components

> "Recipes over raw physics. The diff is the lesson."

## Role

**Apprentice Smith** — Generates components using zone-appropriate recipes. No raw physics outside sandbox.

## Command

```
/craft [component_description]               # Auto-detect zone
/craft [component_description] --file [path] # Specify target file
/craft [component_description] --zone [zone] # Force zone context
```

## Workflow

### Step 1: Resolve Zone

```python
def resolve_zone(file_path):
    """
    Walk up directories looking for .sigilrc.yaml
    Merge configs (deeper overrides shallower)
    Return ZoneConfig object
    """
    current_dir = dirname(file_path)

    while current_dir >= project_root:
        config = load_sigilrc(current_dir)
        if config:
            # Merge with parent configs
            merged = merge_configs(parent_config, config)
        current_dir = parent(current_dir)

    return ZoneConfig(
        zone=zone_name,
        recipes=merged.recipes,  # decisive | machinery | glass
        sync=merged.sync,        # server_authoritative | client_authoritative
        tick=merged.tick,        # Optional timing
        constraints=merged.constraints
    )
```

### Step 2: Select Recipe

```python
def select_recipe(description, zone_config):
    """
    Parse component description and match to available recipes.
    """
    recipe_set = zone_config.recipes

    # Map keywords to recipes
    if recipe_set == "decisive":
        if "button" in description.lower():
            return "Button"
        if "confirm" in description.lower():
            return "ConfirmFlow"

    if recipe_set == "machinery":
        if "table" in description.lower():
            return "Table"
        if "toggle" in description.lower():
            return "Toggle"
        if "form" in description.lower():
            return "Form"

    if recipe_set == "glass":
        if "hero" in description.lower():
            return "HeroCard"
        if "feature" in description.lower():
            return "FeatureCard"
        if "tooltip" in description.lower():
            return "Tooltip"

    # Default to most common recipe in set
    return get_default_recipe(recipe_set)
```

### Step 3: Check Constraints

```python
def check_constraints(description, zone_config):
    """
    Check if request violates zone constraints.
    """
    violations = []

    for constraint, level in zone_config.constraints.items():
        if violates(description, constraint):
            violations.append({
                "constraint": constraint,
                "level": level,  # forbidden | warn
                "action": "BLOCK" if level == "forbidden" else "WARN"
            })

    return violations
```

### Step 4: Generate Component

```python
def generate_component(recipe_name, zone_config, props):
    """
    Generate component that imports and uses the recipe.
    """
    import_path = f"@sigil/recipes/{zone_config.recipes}"
    physics = get_recipe_physics(zone_config.recipes, recipe_name)

    return f"""
import {{ {recipe_name} }} from '{import_path}';

export function {component_name}(props) {{
  return (
    <{recipe_name}
      {...props}
    />
  );
}}
"""
```

### Step 5: Output Format

Always show:
1. Zone resolved
2. Recipe selected
3. Physics being applied
4. Generated code
5. Diff (if updating existing file)

```
ZONE: src/checkout (decisive)
RECIPE: decisive/Button

[generated code]

PHYSICS: spring(180, 12), server-tick
```

## Recipe Sets Reference

### decisive
- **Purpose:** Checkout, transactions, critical actions
- **Physics:** spring(180, 12), heavy, deliberate
- **Sync:** server_authoritative
- **Recipes:** Button, ButtonNintendo, ButtonRelaxed, ConfirmFlow

### machinery
- **Purpose:** Admin panels, dashboards, data-heavy UI
- **Physics:** instant or spring(400, 30)
- **Sync:** client_authoritative
- **Recipes:** Table, Toggle, Form

### glass
- **Purpose:** Marketing, landing pages, showcase
- **Physics:** spring(200, 20), float, glow
- **Sync:** client_authoritative
- **Recipes:** HeroCard, FeatureCard, Tooltip

## Three Laws

| Level | Meaning | Example |
|-------|---------|---------|
| IMPOSSIBLE | Cannot override, violates trust | Optimistic UI in server_authoritative |
| BLOCK | Requires sandbox or override | Raw physics outside sandbox |
| WARN | Logged in /garden | Sandbox open >7 days |

## Constraint Handling

When zone has constraints:

```yaml
# src/checkout/.sigilrc.yaml
constraints:
  optimistic_ui: forbidden
  loading_spinners: forbidden
```

Behavior:
1. `forbidden` → IMPOSSIBLE, refuse with explanation
2. `warn` → WARN, proceed but log

## Learning Philosophy

**Do NOT lecture. The diff is the lesson.**

When making changes:
1. Show the physics delta: `spring(180, 12) → spring(300, 8)`
2. In workbench: "Toggle A/B to feel the difference"
3. Save variant if reusable: `Button.nintendo.tsx`

## Error Handling

| Situation | Response |
|-----------|----------|
| Unknown zone | Use default (machinery) |
| No matching recipe | Use closest match, explain |
| IMPOSSIBLE constraint | Block, explain why |
| BLOCK constraint | Block, suggest sandbox |
| Missing recipe set | Error, suggest /setup |

## Context Injection

When processing /craft, inject:

```xml
<sigil_context version="1.2.4">
  <zone path="{file_path}">
    <recipes>{recipe_set}</recipes>
    <sync>{sync_mode}</sync>
    <tick>{tick}</tick>
  </zone>

  <available_recipes>
    <recipe name="{name}" physics="{spring_config}" />
  </available_recipes>

  <constraints>
    <rule level="impossible">{constraint}</rule>
  </constraints>
</sigil_context>
```

## Next Steps

After /craft:
- `/sandbox [path]` — Enable raw physics for experimentation
- `/codify [path]` — Extract physics to recipe
- `/validate` — Check recipe compliance
