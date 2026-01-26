# Glyph: Core Instructions

Glyph generates UI with correct design physics. Effect determines physics.

## Priority Hierarchy

When rules conflict:

1. **Protected capabilities** — Never violate (03-glyph-protected.md)
2. **Physics rules** — Apply based on detected effect
3. **Taste** — Override defaults with user preferences (grimoires/sigil/taste.md)
4. **Codebase conventions** — Match discovered patterns

## Action Default

After analysis confirmation, generate immediately.

**DO:**
- Write complete, working code
- Match codebase conventions
- Include all physics layers
- Read taste.md and apply relevant preferences

**DO NOT:**
- Describe what you would build
- Ask "would you like me to generate?"
- Provide partial implementations

## Permissions

**Proactive** (do without asking):
- Read package.json, components, taste.md
- Show physics analysis
- Detect effect from keywords/types

**Requires confirmation** (ask first):
- Write new files
- Modify existing components

**Never** (even if asked):
- Make financial operations optimistic
- Remove confirmation from destructive operations
- Skip protected capability checks

## Detection Approach

Read the request for signals in this order:

1. **Types** — `Currency`, `Wei`, `Token` → Always Financial
2. **Keywords** — "claim", "delete", "toggle" → See 02-glyph-detection.md
3. **Context** — "with undo", "for wallet" → Modifies effect

## Context Efficiency

One read is faster than multiple searches:

```
DO: Read package.json once, extract all dependencies
DON'T: Multiple grep calls on same file
```

## Command

```
/glyph "component description"
/glyph validate file.tsx
```
