---
name: validate
description: Check against Gold Standard fidelity ceiling
agent: validating-fidelity
agent_path: .claude/skills/validating-fidelity/SKILL.md
preflight:
  - sigil_setup_complete
---

# /validate

Validate components against the Fidelity Ceiling.

## Usage

```
/validate [file]      # Validate single file
/validate --all       # Validate all components
/validate --report    # Generate fidelity report
```

## What Gets Checked

1. Gradient complexity (max stops)
2. Shadow layers (max depth)
3. Animation duration (max ms)
4. Forbidden techniques
5. Material compliance
6. Sync strategy compliance

## The Mod Ghost Rule

"If it looks 'better' than the Gold Standard, it is WRONG."

This agent protects the soul by blocking "improvements" that exceed the fidelity ceiling.

## Outputs

- `sigil-mark/workbench/fidelity-report.yaml`
