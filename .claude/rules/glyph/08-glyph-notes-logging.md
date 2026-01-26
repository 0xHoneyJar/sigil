# Glyph: NOTES.md Logging

Protocol for logging physics decisions to the Loa blackboard.

## When to Log

Log to NOTES.md Design Physics section after:
- Successful component generation
- Hypothesis acceptance (even without generation)
- Validation completion
- Taste application

## NOTES.md Section Location

The "Design Physics (Rune)" section should appear in NOTES.md after the Learnings section:

```markdown
## Learnings
...

## Design Physics (Rune)

### Active Craft
...
```

## Logging Protocol

### Step 1: Read Current NOTES.md

```
Read grimoires/loa/NOTES.md
Parse to find "## Design Physics (Rune)" section
If not found, append template from templates/notes-design-physics.md
```

### Step 2: Update Active Craft

When starting generation:

```markdown
### Active Craft
- **Component**: ClaimButton
- **Effect**: Financial
- **Physics**: Pessimistic, 800ms, confirmation required
- **Iteration**: 1
- **Confidence**: 0.85
```

On subsequent iterations:

```markdown
### Active Craft
- **Component**: ClaimButton
- **Effect**: Financial
- **Physics**: Pessimistic, 500ms, confirmation required
- **Iteration**: 2
- **Confidence**: 0.80
```

### Step 3: Append to Physics Decisions

After successful generation:

```markdown
### Physics Decisions
| Date | Component | Effect | Timing | Taste Override | Rationale |
|------|-----------|--------|--------|----------------|-----------|
| 2026-01-25 | ClaimButton | Financial | 500ms | power-user-timing | Sprint-1 task |
```

Format:
- **Date**: YYYY-MM-DD
- **Component**: Component name
- **Effect**: Effect type (Financial, Destructive, Standard, etc.)
- **Timing**: Final timing value in ms
- **Taste Override**: Taste entry ID if applied, or "—" if default
- **Rationale**: Brief reason (sprint reference, user request, etc.)

### Step 4: Update Wyrd State Summary

After any confidence change:

```markdown
### Wyrd State
- **Last Calibration**: 2026-01-25
- **Total Hypotheses**: 12
- **Validation Rate**: 83%
- **Avg Confidence**: 0.87
```

### Step 5: Update Taste Applied

When taste influences generation:

```markdown
### Taste Applied
- **power-user-timing** (Tier 2): 500ms for Financial effects
- **springs-everywhere** (Tier 1): Prefer spring animations
```

## Implementation

```typescript
async function logToNotes(decision: PhysicsDecision): Promise<void> {
  // Read current NOTES.md
  const notes = await read('grimoires/loa/NOTES.md');

  // Find or create Design Physics section
  let section = findSection(notes, '## Design Physics (Rune)');
  if (!section) {
    const template = await read('.claude/constructs/packs/rune/templates/notes-design-physics.md');
    notes = appendSection(notes, template);
    section = findSection(notes, '## Design Physics (Rune)');
  }

  // Update Active Craft
  section = updateActiveCraft(section, decision);

  // Append to Physics Decisions table
  section = appendDecision(section, decision);

  // Update Wyrd State if changed
  if (decision.confidenceChanged) {
    section = updateWyrdState(section, decision.wyrdState);
  }

  // Update Taste Applied if used
  if (decision.tasteApplied.length > 0) {
    section = updateTasteApplied(section, decision.tasteApplied);
  }

  // Write back
  await write('grimoires/loa/NOTES.md', notes);
}
```

## Clear Active Craft

After generation is complete (file written):

```markdown
### Active Craft
- **Component**: [none]
- **Effect**: [none]
- **Physics**: [none]
- **Iteration**: 0
- **Confidence**: [none]
```

## Example Full Section

```markdown
## Design Physics (Rune)

### Active Craft
- **Component**: [none]
- **Effect**: [none]
- **Physics**: [none]
- **Iteration**: 0
- **Confidence**: [none]

### Taste Applied
- **power-user-timing** (Tier 2): 500ms for Financial effects

### Physics Decisions
| Date | Component | Effect | Timing | Taste Override | Rationale |
|------|-----------|--------|--------|----------------|-----------|
| 2026-01-25 | ClaimButton | Financial | 500ms | power-user-timing | Sprint-1 |
| 2026-01-25 | DeleteModal | Destructive | 600ms | — | Sprint-1 |
| 2026-01-24 | LikeButton | Standard | 200ms | — | Sprint-1 |

### Wyrd State
- **Last Calibration**: 2026-01-25
- **Total Hypotheses**: 3
- **Validation Rate**: 100%
- **Avg Confidence**: 0.88
```
