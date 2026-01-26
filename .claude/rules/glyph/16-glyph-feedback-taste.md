# Glyph: Feedback Loop Taste Capture

Protocol for capturing design preferences during sprint feedback.

## Trigger

After sprint review feedback is collected, prompt for taste recording.

## Integration Points

### After `/review-sprint`

When engineer feedback is collected:

```typescript
async function afterReviewFeedback(feedback: Feedback): Promise<void> {
  // Check if feedback contains design-related comments
  const hasDesignFeedback = detectDesignFeedback(feedback);

  if (hasDesignFeedback) {
    await promptForTasteCapture(feedback);
  }
}
```

### After Manual Code Review

When reviewer leaves design-related comments:

```
Detected design feedback in review:

"The 800ms delay feels too slow for our power users"
"Can we use spring animations instead of easing?"

Record as taste? [y/n/select]
```

## Design Feedback Detection

```typescript
function detectDesignFeedback(feedback: Feedback): boolean {
  const designKeywords = [
    // Timing
    'slow', 'fast', 'delay', 'timing', 'ms', 'millisecond',
    'sluggish', 'snappy', 'responsive',

    // Animation
    'animation', 'transition', 'easing', 'spring', 'bounce',
    'smooth', 'jarring', 'abrupt',

    // UX
    'feel', 'feels', 'experience', 'confusing', 'intuitive',
    'modal', 'confirmation', 'toast', 'notification',

    // Visual
    'button', 'touch', 'click', 'tap', 'target'
  ];

  const text = feedback.comments.join(' ').toLowerCase();
  return designKeywords.some(k => text.includes(k));
}
```

## Prompt Flow

### Step 1: Present Detected Feedback

```
## Design Feedback Detected

From sprint-1 review:

1. "800ms feels too slow for power users" (ClaimButton)
2. "Spring animations would feel more natural" (global)

Record as taste? [y/n/select]
```

### Step 2: On Select

```
Select feedback to record:

[x] 1. Timing preference (500ms for Financial)
[x] 2. Animation preference (springs over easing)
[ ] 3. Skip

Confirm? [y/n]
```

### Step 3: Format and Save

```typescript
async function saveFeedbackAsTaste(
  selectedFeedback: FeedbackItem[]
): Promise<void> {
  for (const item of selectedFeedback) {
    const entry = formatTasteFromFeedback(item);
    await appendToFile('grimoires/rune/taste.md', entry);
  }
}

function formatTasteFromFeedback(item: FeedbackItem): string {
  return `
## ${formatDate(new Date())} — Review Feedback

${item.comment}

**Context**: ${item.context.sprint}, ${item.context.component}
**Source**: Sprint review feedback
**Tier**: 1 (Observation)

---
`;
}
```

## Taste Entry Format

```markdown
## 2026-01-26 14:30 — Review Feedback

Power users find 800ms too slow for financial operations.
Prefer 500ms for claim/withdraw buttons.

**Context**: Sprint-1, ClaimButton
**Source**: Sprint review feedback
**Reviewer**: @engineer
**Tier**: 1 (Observation)

---
```

## Deduplication

Before saving, check for existing similar entries:

```typescript
async function checkDuplicate(entry: TasteEntry): Promise<boolean> {
  const existing = await readTasteEntries();

  return existing.some(e =>
    e.effect === entry.effect &&
    e.field === entry.field &&
    daysSince(e.timestamp) < 7
  );
}
```

If duplicate found:

```
Similar taste entry exists from 3 days ago:
"Prefer 500ms for Financial effects"

Options:
1. Reinforce existing entry (increase confidence)
2. Add as separate observation
3. Skip

[1/2/3]
```

## Reinforce Existing

When user selects "reinforce":

```typescript
async function reinforceEntry(existingId: string): Promise<void> {
  const entry = await getTasteEntry(existingId);

  // Increment reinforcement count
  entry.reinforcements = (entry.reinforcements || 0) + 1;

  // Check for tier promotion
  if (entry.tier === 1 && entry.reinforcements >= 3) {
    entry.tier = 2;  // Promote to Pattern
    console.log('Entry promoted to Tier 2 (Pattern) due to reinforcement');
  }

  await updateTasteEntry(entry);
}
```

## Skip Conditions

Don't prompt for taste capture if:

1. No design-related feedback detected
2. User has disabled feedback taste capture
3. All feedback already has existing taste entries
4. Feedback is purely functional (bugs, missing features)

## Configuration

In `.loa.config.yaml`:

```yaml
rune:
  feedback:
    taste_capture: true        # Enable/disable prompts
    auto_detect: true          # Auto-detect design feedback
    require_confirmation: true # Always ask before recording
    deduplication: true        # Check for similar entries
```
