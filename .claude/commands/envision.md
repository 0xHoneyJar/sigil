---
name: envision
version: "1.0.0"
description: Capture product soul through structured interview
agent: envisioning-soul
agent_path: .claude/skills/envisioning-soul/SKILL.md
preflight:
  - sigil_mark_exists
---

# /envision

Capture the product's essence through structured interview. Populates the essence template with soul statement, invariants, references, and tension defaults.

## Usage

```
/envision           # Start soul interview
/envision --refresh # Update existing essence
```

## What This Captures

### Product Identity
- Name and tagline
- Version

### Soul Statement
- One sentence essence
- The deeper "why"

### Invariants & Anti-Invariants
- What must ALWAYS be true
- What must NEVER be true

### Reference Products
- Games (e.g., OSRS, Hollow Knight)
- Apps (e.g., Linear, Notion)
- Physical products (e.g., Leica, Muji)

### Feel Descriptors
- At first glance
- During use
- After completion
- On error

### Key Moments
- High stakes (transactions, deletions)
- Celebration (rewards, milestones)
- Recovery (errors, retries)
- Discovery (exploration, learning)

### Anti-Patterns
- Patterns that violate the soul
- Why they're wrong
- What to use instead

### Tension Defaults
- Playfulness (0-100)
- Weight (0-100)
- Density (0-100)
- Speed (0-100)

### Taste Key Holder
- Who has absolute visual authority
- Contact for approvals

## Outputs

| Path | Description |
|------|-------------|
| `sigil-mark/resonance/essence.yaml` | Complete product essence |
| `sigil-mark/taste-key/holder.yaml` | Taste Key holder (partial update) |

## Interview Flow

1. **Identity** — Name, tagline
2. **Soul** — One sentence essence
3. **Invariants** — Non-negotiable rules
4. **References** — Games, apps, physical products
5. **Feel** — Context-specific descriptors
6. **Moments** — How key interactions should feel
7. **Anti-patterns** — What to avoid
8. **Tensions** — Where on the spectrums
9. **Taste Key** — Who has authority

## Presets

If you want a quick start, choose a preset:

| Preset | Playfulness | Weight | Density | Speed |
|--------|-------------|--------|---------|-------|
| Linear | 20 | 60 | 50 | 90 |
| Airbnb | 60 | 40 | 30 | 50 |
| Nintendo | 80 | 50 | 40 | 60 |
| OSRS | 30 | 80 | 60 | 30 |

## Next Step

After `/envision`: Run `/codify` to define materials and zones.
