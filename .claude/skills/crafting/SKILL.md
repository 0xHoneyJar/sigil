---
name: crafting
description: Generate or validate UI with design physics
user-invocable: true
disable-model-invocation: true
allowed-tools:
  - Read
  - Write
  - Glob
---

# Crafting

Generate UI components with correct design physics, or validate existing ones.

## Usage

```
/glyph "component description"
/glyph validate file.tsx
```

## Workflow: Generate

1. Read taste.md for user preferences
2. Detect effect from keywords/types
3. Show physics analysis
4. On confirmation, generate complete code
5. Match codebase conventions

## Workflow: Validate

1. Read the target file
2. Detect what effect it should have
3. Check physics alignment
4. Report violations or confirm compliance

## Physics Analysis Box

```
Effect: Financial (keyword: claim)
Sync: Pessimistic
Timing: 800ms
Confirmation: Required
Animation: ease-out
```

## Rules Loaded

- `.claude/rules/glyph/*.md` (always)
- `.claude/rules/sigil/01-sigil-taste.md` (for reading taste)

## Reference Skills

Load on-demand when detailed tables needed:
- `physics-reference` - Full physics tables
- `patterns-reference` - Golden implementations
