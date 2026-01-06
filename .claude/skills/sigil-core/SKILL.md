# Sigil Core Skill v1.2.4

Core skill for the Sigil design physics framework.

## Purpose

Provide Claude with the ability to:
- Generate components using zone-appropriate recipes
- Manage sandbox mode for experimentation
- Extract physics into reusable recipes
- Track compliance and health via garden reports

## Philosophy

**Apprenticeship through Diff + Feel**

Engineers learn by seeing diffs and feeling results, not by reading lectures.

When making changes:
1. Show the physics delta prominently: `spring(180, 12) → spring(300, 8)`
2. In workbench, prompt: "Toggle A/B to feel the difference"
3. Do NOT lecture about spring physics unless asked
4. The diff + feel IS the lesson

## Commands (v1.2.4)

### /craft [description] [--file path]

Generate component using recipes from current zone.

```
/craft "confirmation button for checkout"
/craft "data table" --file src/admin/Users.tsx
```

Behavior:
1. Resolve zone from path → load `.sigilrc.yaml`
2. Select appropriate recipe from zone's recipe set
3. Generate component importing recipe
4. Show physics being applied

Output format:
```
ZONE: src/checkout (decisive)
RECIPE: decisive/Button

[generated code]

PHYSICS: spring(180, 12), server-tick
```

### /sandbox [path]

Enable raw physics for experimentation.

```
/sandbox src/checkout/Experiment.tsx
```

Behavior:
1. Add `// sigil-sandbox` header to file
2. Update zone's sandbox list
3. Relax ESLint rules
4. Track in /garden as active sandbox

Exit sandbox: Run `/codify` to extract physics to recipe.

### /codify [path] [--name recipe_name]

Extract physics to recipe.

```
/codify src/checkout/Experiment.tsx --name Button.snappy
```

Behavior:
1. Parse file for spring/timing values
2. Generate recipe in `sigil-mark/recipes/{zone}/`
3. Update source to import recipe
4. Remove sandbox markers

### /inherit

Bootstrap from existing codebase (analysis only, no auto-generation).

```
/inherit
```

Behavior:
1. Scan component directories
2. Detect physics patterns
3. Report findings (do NOT auto-create recipes)
4. Suggest recipes to create

### /validate

Check compliance across codebase.

```
/validate
```

Behavior:
1. Find all components
2. Check recipe imports
3. Flag raw physics outside sandbox
4. Report compliance percentage

### /garden

Health report on recipes and sandboxes.

```
/garden
```

Behavior:
1. Recipe coverage by zone
2. Active sandboxes with age
3. Recipe variants list
4. Recommendations

## Zone Resolution

1. Get file path
2. Walk up directories looking for `.sigilrc.yaml`
3. Merge configs (deeper overrides shallower)
4. Return full ZoneConfig

### Zone Config Schema (v1.2.4)

```yaml
sigil: "1.2.4"
recipes: decisive | machinery | glass
sync: server_authoritative | client_authoritative
tick: 600ms  # optional

constraints:
  optimistic_ui: forbidden | warn
  loading_spinners: forbidden | warn
```

## Recipe Sets

| Set | Physics | Purpose |
|-----|---------|---------|
| decisive | spring(180, 12), server-tick | Checkout, transactions |
| machinery | instant, minimal animation | Admin, dashboards |
| glass | spring(200, 20), float/glow | Marketing, showcase |

## Three Laws

| Level | Meaning |
|-------|---------|
| IMPOSSIBLE | Violates trust model, cannot override |
| BLOCK | Requires sandbox or explicit override |
| WARN | Logged in /garden |

## Files

| Path | Purpose |
|------|---------|
| `.sigilrc.yaml` | Zone configuration (per directory) |
| `sigil-mark/recipes/` | Recipe implementations |
| `sigil-mark/core/zone-resolver.ts` | Zone resolution logic |
| `sigil-mark/hooks/` | Shared hooks (useServerTick) |
| `sigil-mark/history/` | Refinement history |
| `sigil-mark/reports/` | Garden reports |

## Scripts

| Script | Purpose |
|--------|---------|
| `sigil-detect-zone.sh` | Bash zone detection (outputs JSON) |

Usage:
```bash
./sigil-detect-zone.sh src/checkout/Button.tsx
# Returns: { "zone": "src/checkout", "recipes": "decisive", ... }
```
