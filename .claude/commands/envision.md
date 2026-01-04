---
name: envision
description: Capture product soul through interview
agent: envisioning-soul
agent_path: .claude/skills/envisioning-soul/SKILL.md
preflight:
  - sigil_setup_complete
---

# /envision

Capture the product's essence through structured interview.

## Usage

```
/envision           # Start soul interview
/envision --refresh # Update existing essence
```

## What This Captures

1. **Soul Statement** - One sentence essence
2. **Invariants** - Non-negotiable rules
3. **Feel by Context** - Transactions, success, loading, errors
4. **Reference Products** - Inspiration and anti-patterns
5. **Anti-Patterns** - What to avoid

## Outputs

- `sigil-mark/soul/essence.yaml`
- `sigil-mark/moodboard.md`

## Next Step

After `/envision`: Run `/codify` to define materials.
