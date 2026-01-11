---
name: greenlight
description: Concept approval before building
skill: greenlighting-concepts
skill_path: .sigil/skills/greenlighting-concepts/SKILL.md
allowed_tools:
  - Read
  - Write
  - AskUserQuestion
preflight:
  - sigil_setup_complete
---

# /greenlight

Approve concepts before building. Polls the "what", not the "how".

## The Distinction

| Phase | Question | Who Decides |
|-------|----------|-------------|
| Greenlight | "Should we build X?" | Poll or Founder |
| Execution | "How should X look?" | Taste Key only |

## OSRS Model

Jagex learned to separate these:
- **Poll**: "Should we add Sailing skill?" (Community)
- **Don't Poll**: "What color is the Sailing icon?" (Taste Owner)

## Usage

```
/greenlight "dark mode"              # Check if concept is greenlighted
/greenlight --poll "new checkout"    # Create poll for concept
/greenlight --founder "animations"   # Founder decision (no poll)
/greenlight --status                 # Show greenlight status
```

## Output

```yaml
greenlight:
  concept: "dark-mode"
  status: "approved"
  method: "founder"
  date: "2026-01-05"
  by: "@username"
  notes: |
    User research shows 60% want dark mode.
    Approved for implementation.
    
    Execution decisions (colors, contrast, timing)
    are delegated to Taste Key.
```

## Rules

1. Greenlight BEFORE building
2. Poll concepts, not execution
3. Once greenlighted, Taste Key owns execution
4. Integrity changes bypass greenlight
