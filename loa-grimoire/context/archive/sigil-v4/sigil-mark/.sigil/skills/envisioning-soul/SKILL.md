# Skill: Envisioning Soul

> "Capture the product's soul before coding the surface."

## Purpose

Interview the user to capture the product's essence, references, feel descriptors, and anti-patterns.

## Workflow

### 1. Reference Products

```
"What apps, games, or products inspire this product's feel?"

For each reference:
- What specifically inspires you about it?
- Is it the visuals, the interaction, the timing?
```

### 2. Feel by Context

```
"How should users feel in these contexts?"

- During transactions?
- On success?
- While loading?
- On errors?
```

### 3. Anti-Patterns

```
"What should this product NEVER feel like?"

- Patterns to avoid
- Products that are anti-references
- Feelings to never create
```

### 4. Key Moments

```
"Describe the ideal experience for:"

- High-stakes actions
- Celebrations
- Recovery from errors
```

## Output

Creates `sigil-mark/resonance/essence.yaml` with all captured context.

## Modes

### New (Default)
Start from scratch with full interview.

### Inherit
Bootstrap from existing codebase:
1. Scan components for patterns
2. Infer current feel
3. Ask clarifying questions
4. Generate draft for review
