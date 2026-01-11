---
name: envision
description: Capture product essence and soul through interview
skill: envisioning-soul
skill_path: .sigil/skills/envisioning-soul/SKILL.md
allowed_tools:
  - Read
  - Write
  - AskUserQuestion
preflight: []
---

# /envision

Capture the product's soul through a structured interview.

## What It Creates

`sigil-mark/resonance/essence.yaml` containing:
- Soul statement
- Reference products (games, apps, physical)
- Feel descriptors by context
- Anti-patterns
- Key moments

## Interview Flow

1. **Reference Products**: "What apps/games inspire this product's feel?"
2. **Feel by Context**: "How should users feel during transactions/success/loading/errors?"
3. **Anti-Patterns**: "What patterns should we explicitly avoid?"
4. **Key Moments**: "Describe your ideal high-stakes/celebration/recovery moment"

## Usage

```
/envision              # Start fresh
/envision --inherit    # Bootstrap from existing codebase
```

## Output

Creates or updates `sigil-mark/resonance/essence.yaml`
