---
name: "canonize"
version: "3.0.0"
description: "Register an emergent behavior in the Canon of Flaws"
skill: "canonizing-flaws"
command_type: "interview"

arguments:
  - name: "behavior"
    type: "string"
    required: false
    description: "Name of the behavior to protect"

pre_flight:
  - check: "file_exists"
    path: ".sigil-setup-complete"
    error: "Sigil not initialized. Run /sigil-setup first."

outputs:
  - path: "sigil-mark/soul-binder/canon-of-flaws.yaml"
    type: "file"
    description: "Updated Canon of Flaws"

strictness_behavior:
  # Canonization is always allowed regardless of strictness
  discovery: "allow"
  guiding: "allow"
  enforcing: "allow"
  strict: "allow"

mode:
  default: "foreground"
  allow_background: false
---

# Canonize

Register an emergent behavior in the Canon of Flaws. Protected flaws cannot be accidentally "fixed" by well-meaning optimizations.

## Purpose

Protect beloved behaviors that emerged from use, not design. The Canon of Flaws recognizes that "perfect" often isn't what users actually want.

## Invocation

```
/canonize
/canonize "double-click submit"
```

## Agent

Launches `canonizing-flaws` skill from `.claude/skills/canonizing-flaws/`.

See: `.claude/skills/canonizing-flaws/SKILL.md` for full workflow details.

## What Gets Protected

Emergent behaviors that:
- Were not originally intended
- Users have come to expect or rely on
- Removing would cause confusion or complaints

## Interview Questions

1. **Intended vs Emergent**: What should happen vs what actually happens
2. **Discovery**: How did you learn users valued this?
3. **Usage**: What percentage rely on this behavior?
4. **Attachment**: How would users react if "fixed"?
5. **Code Patterns**: What code might accidentally break this?
6. **Protection Rule**: What must be blocked?

## Protection Levels

| Status | Meaning |
|--------|---------|
| PROTECTED | Full protection, violations blocked in enforcing/strict |
| UNDER_REVIEW | < 5% usage, warnings only |
| DE_CANONIZED | No longer protected |

## Enforcement by Strictness

| Strictness | Protected Flaw Violation |
|------------|--------------------------|
| discovery | Informational only |
| guiding | Warning with explanation |
| enforcing | BLOCK with override option |
| strict | BLOCK with override option |

## Example

```
/canonize "keyboard shortcut timing"

Agent: "Let me interview you about this behavior..."

[Interview captures intended vs emergent behavior]
[Interview determines usage and attachment level]
[Interview defines protection patterns]

Agent: "FLAW-001 has been added to the Canon of Flaws.
        Changes to *shortcut*timing* will be blocked."
```

## De-Canonization

To remove protection in the future:

```
/de-canonize FLAW-001
```

Requires:
- 70% community approval
- Taste Owner sign-off
- 180-day cooldown before reconsideration

## Philosophy

> "Beloved 'bugs' are registered and protected from optimization"

The emergent soul of a product is as important as the intended soul. This command protects behaviors that users love, even if they weren't designed.

## See Also

- `/envision` - Capture intended soul (values)
- `/craft` - Guidance that respects Canon of Flaws
- `/de-canonize` - Remove protection (high bar)
