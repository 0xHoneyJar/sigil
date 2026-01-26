# Glyph: Session Continuity

Protocol for preserving Rune context across session boundaries.

## Purpose

After `/clear` or session restart, restore Rune state so generation continues seamlessly.

## Context to Preserve

### Rune Context Block (~50 tokens)

```markdown
### Rune Context
- **Active Craft**: ClaimButton (iteration 2)
- **Effect**: Financial
- **Last Action**: generated
- **Taste Applied**: [power-user-timing]
- **Wyrd Confidence**: 0.85
```

### Full State (for NOTES.md)

```markdown
## Design Physics (Rune)

### Active Craft
- **Component**: ClaimButton
- **Effect**: Financial
- **Physics**: Pessimistic, 500ms, confirmation required
- **Iteration**: 2
- **Confidence**: 0.85

### Taste Applied
- **power-user-timing** (Tier 2): 500ms for Financial effects

### Physics Decisions
| Date | Component | Effect | Timing | Taste Override | Rationale |
|------|-----------|--------|--------|----------------|-----------|
| 2026-01-26 | ClaimButton | Financial | 500ms | power-user | Sprint-1 |

### Wyrd State
- **Last Calibration**: 2026-01-26
- **Total Hypotheses**: 15
- **Validation Rate**: 80%
- **Avg Confidence**: 0.87
```

## Storage Location

Rune context is stored in NOTES.md "Design Physics (Rune)" section.

## Restoration Protocol

### On Session Start

```typescript
async function restoreRuneContext(): Promise<RuneContext | null> {
  // Read NOTES.md
  const notes = await readFile('grimoires/loa/NOTES.md');

  // Find Design Physics section
  const section = extractSection(notes, '## Design Physics (Rune)');
  if (!section) return null;

  // Parse context
  return parseRuneContext(section);
}

function parseRuneContext(section: string): RuneContext {
  return {
    activeCraft: extractField(section, 'Component'),
    effect: extractField(section, 'Effect'),
    physics: extractField(section, 'Physics'),
    iteration: parseInt(extractField(section, 'Iteration') || '0'),
    confidence: parseFloat(extractField(section, 'Confidence') || '0'),
    tasteApplied: extractList(section, 'Taste Applied'),
    lastCalibration: extractField(section, 'Last Calibration')
  };
}
```

### On `/clear`

Before clearing, persist current state:

```typescript
async function beforeClear(): Promise<void> {
  // Get current Rune state
  const state = getCurrentRuneState();

  // Update NOTES.md
  await updateNotesDesignPhysics(state);

  // Log to session continuity section
  await updateSessionContinuity({
    runeContext: formatRuneContextSummary(state)
  });
}
```

## Session Continuity Section

Add to NOTES.md Session Continuity:

```markdown
## Session Continuity

### Last Updated
2026-01-26 14:30

### Rune Context
- **Active Craft**: ClaimButton (iteration 2)
- **Effect**: Financial
- **Last Action**: generated
- **Taste Applied**: [power-user-timing]
- **Wyrd Confidence**: 0.85

### Resume Instructions
If continuing Rune work:
1. Current component: ClaimButton
2. Effect: Financial (500ms, pessimistic)
3. Last action was generation, awaiting user feedback
4. File monitoring active for 30 minutes
```

## Active Craft Tracking

### On Generation Start

```typescript
async function onGenerationStart(component: string, effect: Effect): Promise<void> {
  await updateActiveCraft({
    component,
    effect,
    physics: PHYSICS_TABLE[effect],
    iteration: 1,
    confidence: await getConfidence(effect),
    startedAt: new Date()
  });
}
```

### On Generation Complete

```typescript
async function onGenerationComplete(
  component: string,
  filePath: string
): Promise<void> {
  await updateActiveCraft({
    lastAction: 'generated',
    filePath,
    monitoringUntil: new Date(Date.now() + 30 * 60 * 1000)
  });
}
```

### On Iteration

```typescript
async function onIteration(component: string): Promise<void> {
  const current = await getActiveCraft();
  await updateActiveCraft({
    ...current,
    iteration: current.iteration + 1
  });
}
```

### On Complete (No Active Craft)

```typescript
async function onCraftComplete(): Promise<void> {
  await updateActiveCraft({
    component: '[none]',
    effect: '[none]',
    physics: '[none]',
    iteration: 0,
    confidence: '[none]'
  });
}
```

## Integration with Loa Session Continuity

The Rune context integrates with Loa's broader session continuity:

```markdown
## Session Continuity

### Context Summary
[Loa summary...]

### Active Sprint
Sprint-1: Foundation

### Rune Context
- **Active Craft**: ClaimButton (iteration 2)
- **Effect**: Financial
- **Taste Applied**: [power-user-timing]

### Next Steps
1. Review ClaimButton.tsx for user modifications
2. Check file monitoring (expires in 15 minutes)
3. Continue with next task if no edits
```

## Restoration Message

When session resumes with Rune context:

```
🔮 Rune Context Restored

Active Craft: ClaimButton (iteration 2)
Effect: Financial
Last Action: Generated 15 minutes ago
File Monitoring: Active (15 minutes remaining)

Awaiting user feedback or modifications to ClaimButton.tsx.
```

## Edge Cases

### No Active Craft

```markdown
### Rune Context
- **Active Craft**: [none]
- **Last Action**: completed ClaimButton
- **Wyrd Confidence**: 0.87 (Financial)
```

### Stale Monitoring

If monitoring window expired during session gap:

```
🔮 Rune Context Restored

Previous: ClaimButton monitoring
Status: Monitoring window expired (was 30 minutes, now 2 hours ago)

No implicit feedback captured. Continuing normally.
```

### Multiple Components

If multiple components were being worked on:

```markdown
### Rune Context
- **Active Craft**: DeleteModal (iteration 1)
- **Previous**: ClaimButton (completed)
- **Effect**: Destructive
- **Pending Review**: ClaimButton.tsx (monitoring expired)
```
