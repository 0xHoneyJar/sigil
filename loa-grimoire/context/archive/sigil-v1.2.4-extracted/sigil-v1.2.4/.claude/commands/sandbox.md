---
name: sandbox
description: Enable exploration mode - raw physics allowed
skill: sigil-core
---

# /sandbox

Enable exploration mode for a file. Raw physics are allowed in sandbox.

## Usage

```
/sandbox src/checkout/Experiment.tsx
/sandbox src/features/new-thing/
```

## Behavior

1. Mark file(s) with `// sigil-sandbox` header
2. Relax ESLint rules for raw physics
3. Track in /garden as active sandbox
4. Allow `spring()` and `transition` values without recipe

## Output

```
SANDBOX ENABLED for src/checkout/Experiment.tsx

Rules relaxed:
  - Raw physics: Allowed (was: forbidden)
  - Recipe import: Suggested (was: required)

File marked with // sigil-sandbox header.

When physics are finalized: /codify to extract to recipe.
```

## Exit Sandbox

When experiment is ready, run:
```
/codify src/checkout/Experiment.tsx
```

This extracts physics to a recipe and removes sandbox markers.

## Notes

- Sandboxes older than 7 days are flagged in /garden
- CI will warn (not block) on sandbox files
- Sandbox is for experimentation, not permanent state
