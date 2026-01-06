# Sigil v1.2.4 Agent: Codifying Recipes

> "Extract the physics. Graduate the experiment."

## Role

**Recipe Extractor** — Parses sandbox files for physics values and generates reusable recipes.

## Command

```
/codify [path]                           # Extract to recipe (auto-name)
/codify [path] --name [recipe_name]      # Extract with specific name
/codify [path] --variant [base_recipe]   # Create variant of existing recipe
```

## Workflow

### Step 1: Validate Sandbox

```python
def validate_sandbox(file_path):
    """
    Ensure file is in sandbox mode before extracting.
    """
    content = read_file(file_path)

    if not content.startswith("// sigil-sandbox"):
        raise Error("File not in sandbox mode. Run /sandbox first.")

    return True
```

### Step 2: Extract Physics

```python
def extract_physics(content):
    """
    Parse file for spring, timing, and animation values.
    """
    physics = {
        "springs": [],
        "timings": [],
        "scales": [],
        "other": []
    }

    # Find spring configs
    # Pattern: stiffness: N, damping: N
    spring_matches = regex.findall(
        r'stiffness:\s*(\d+).*?damping:\s*(\d+)',
        content
    )
    for s, d in spring_matches:
        physics["springs"].append({"stiffness": int(s), "damping": int(d)})

    # Find timing values
    # Pattern: duration: N or delay: N
    timing_matches = regex.findall(
        r'(duration|delay):\s*([\d.]+)',
        content
    )
    for key, value in timing_matches:
        physics["timings"].append({key: float(value)})

    # Find scale values
    # Pattern: scale: N or scale(N)
    scale_matches = regex.findall(
        r'scale[:\s]+([0-9.]+)',
        content
    )
    physics["scales"] = [float(s) for s in scale_matches]

    return physics
```

### Step 3: Suggest Name

```python
def suggest_name(file_path, physics, zone_config):
    """
    Generate recipe name from file and physics characteristics.
    """
    # Get base component name from file
    base_name = get_component_name(file_path)

    # Characterize physics
    if physics["springs"]:
        spring = physics["springs"][0]
        if spring["stiffness"] > 250:
            suffix = "snappy"
        elif spring["stiffness"] < 150:
            suffix = "relaxed"
        else:
            suffix = ""
    else:
        suffix = ""

    if suffix:
        return f"{base_name}.{suffix}"
    return base_name
```

### Step 4: Generate Recipe

```python
def generate_recipe(name, physics, zone_config):
    """
    Generate recipe file with proper anatomy.
    """
    spring = physics["springs"][0] if physics["springs"] else DEFAULT_SPRING

    template = f'''
/**
 * @sigil-recipe {zone_config.recipes}/{name}
 * @physics spring({spring["stiffness"]}, {spring["damping"]})
 * @zone {zone_config.zone}
 */

import React from 'react';
import {{ motion }} from 'framer-motion';

const SPRING_CONFIG = {{
  type: 'spring' as const,
  stiffness: {spring["stiffness"]},
  damping: {spring["damping"]},
}};

// ... component implementation
'''
    return template
```

### Step 5: Update Source File

```python
def update_source_file(file_path, recipe_name, zone_config):
    """
    Replace raw physics with recipe import.
    """
    content = read_file(file_path)

    # Remove sandbox header
    content = content.replace("// sigil-sandbox\n", "")

    # Add recipe import
    import_statement = f"import {{ {recipe_name} }} from '@sigil/recipes/{zone_config.recipes}';"
    content = import_statement + "\n\n" + content

    # Remove raw physics (this is a simplification)
    # Actual implementation would parse and replace

    write_file(file_path, content)
```

### Step 6: Cleanup Sandbox

```python
def cleanup_sandbox(file_path, zone_config):
    """
    Remove file from zone's sandbox list.
    """
    zone_config_path = find_zone_config(file_path)
    config = read_yaml(zone_config_path)

    if "sandbox" in config and file_path in config["sandbox"]:
        config["sandbox"].remove(file_path)

    write_yaml(zone_config_path, config)
```

## Recipe Anatomy

Every generated recipe must include:

1. **JSDoc block** with:
   - `@sigil-recipe {zone}/{name}`
   - `@physics spring(stiffness, damping)`
   - `@zone {applicable zones}`

2. **Named spring config**:
   ```typescript
   const SPRING_CONFIG = {
     type: 'spring' as const,
     stiffness: 180,
     damping: 12,
   };
   ```

3. **TypeScript interface**:
   ```typescript
   export interface ButtonProps {
     children: React.ReactNode;
     onAction: () => Promise<void>;
     // ...
   }
   ```

4. **Component with physics**:
   ```typescript
   export function Button({ children, onAction }: ButtonProps) {
     return (
       <motion.button
         transition={SPRING_CONFIG}
         // ...
       >
         {children}
       </motion.button>
     );
   }
   ```

## Variant Mode

When using `--variant`:

1. Load base recipe
2. Copy structure
3. Replace physics values with extracted ones
4. Name as `{BaseRecipe}.{suffix}.tsx`

## Error Handling

| Situation | Response |
|-----------|----------|
| Not in sandbox | Error: "Run /sandbox first" |
| No physics found | Error: "No spring/timing values found" |
| Recipe exists | Error: "Recipe already exists. Use --variant or different name" |
| Invalid zone | Error: "Cannot determine zone from path" |

## Output Format

```
/codify src/checkout/ExperimentButton.tsx

EXTRACTING from src/checkout/ExperimentButton.tsx

Found physics:
  spring(300, 8)
  whileTap scale: 0.96
  duration: 0.2

ZONE: decisive
SUGGESTED NAME: Button.snappy

[Press Enter to confirm or type new name]

GENERATING recipe...
  Created: sigil-mark/recipes/decisive/Button.snappy.tsx

UPDATING source...
  Replaced raw physics with recipe import
  Removed sandbox header

CLEANING UP...
  Removed from sandbox list in .sigilrc.yaml

COMPLETE
  Recipe: sigil-mark/recipes/decisive/Button.snappy.tsx
  Source: Updated to use recipe
```

## Success Criteria

- [ ] File validated as sandbox
- [ ] Physics values extracted
- [ ] Recipe name suggested or provided
- [ ] Recipe generated with full anatomy
- [ ] Source file updated to import recipe
- [ ] Sandbox markers removed
- [ ] Zone config updated
