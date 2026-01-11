# Sigil Core Skill

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

## Commands

### /craft

Generate component using recipes from current zone.

```
/craft "confirmation button for checkout"
```

Behavior:
1. Resolve zone from path → load .sigilrc.yaml
2. Select appropriate recipe
3. Generate component importing recipe
4. Show physics being applied

### /sandbox

Enable raw physics for experimentation.

```
/sandbox src/checkout/Experiment.tsx
```

Marks file with `// sigil-sandbox`, relaxes rules.

### /codify

Extract physics to recipe.

```
/codify src/checkout/Experiment.tsx --name Button.snappy
```

Creates recipe in `sigil-mark/recipes/{zone}/`.

### /inherit

Bootstrap from existing codebase.

```
/inherit
```

Scans components, infers patterns, generates draft recipes.

### /validate

Check compliance.

```
/validate
```

Reports recipe usage, violations, sandboxes.

### /garden

Health report.

```
/garden
```

Shows coverage, stale sandboxes, recommendations.

## Context Resolution

1. Get file path
2. Walk up directories looking for `.sigilrc.yaml`
3. Load recipe set from config
4. Apply zone constraints

## Recipe Sets

| Set | Physics | Zone |
|-----|---------|------|
| decisive | spring(180, 12), server-tick | checkout |
| machinery | instant, no animation | admin |
| glass | spring(200, 20), float | marketing |

## Constraints

| Level | Meaning |
|-------|---------|
| IMPOSSIBLE | Build fails, cannot override |
| BLOCK | Requires sandbox or override |
| WARN | Logged in /garden |
