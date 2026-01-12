---
name: craft
version: "10.1.0"
description: Get design guidance with full context (Taste + Persona + Project)
agent: mason
agent_path: .claude/skills/mason/SKILL.md
context_injection: true
---

# /craft

Generate design-aware components with invisible context. The only Sigil entry point you need.

## Usage

```
/craft "trustworthy claim button"
/craft "admin data table with sorting"
/craft "product card with hover effects"
```

## What Happens

Mason reads context invisibly:

1. **Taste** — Your accept/modify/reject history
2. **Persona** — Your prompt language and copy preferences
3. **Project** — Your codebase conventions

Then generates appropriate UI with:
- Zone-appropriate physics
- Consistent patterns from Gold components
- Copy that matches your audience

## No Configuration Needed

Mason infers everything:
- "claim" → critical zone → deliberate physics
- "admin" → machinery zone → snappy physics
- "product" → marketing zone → warm physics

Just describe what you want. Mason handles the rest.

## Examples

```
/craft "withdraw button with confirmation"
→ Infers critical zone, server-tick, deliberate motion
→ Uses Gold patterns if they exist
→ Generates with appropriate physics

/craft "sortable table for user management"
→ Infers admin zone, optimistic, instant motion
→ Keyboard navigation enabled
→ High density layout

/craft "testimonial carousel"
→ Infers marketing zone, warm motion
→ Mouse/touch optimized
→ Celebratory transitions
```

## The Three Laws

1. **Code is Precedent** — Patterns that survive become canonical
2. **Survival + Cleanliness = Gold** — Usage determines authority
3. **Never Interrupt Flow** — No questions, no dialogs
