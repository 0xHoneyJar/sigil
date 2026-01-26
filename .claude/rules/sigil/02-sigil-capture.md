# Sigil: Taste Capture

Protocol for capturing taste from rejections and user feedback.

## Capture Sources

| Source | Trigger | Tier |
|--------|---------|------|
| User records | `/sigil "insight"` | 1 (Observation) |
| Explicit rejection | User says "n" to hypothesis | 1 (Observation) |
| Implicit edit | User modifies generated code | 1 (Observation) |
| Pattern detection | 3+ similar rejections | 2 (Pattern) |
| User promotion | `/sigil promote <id>` | 3 (Rule) |

## Capture from Explicit Rejection

When user rejects hypothesis with "n":

### Step 1: Prompt for Reason

```
Your hypothesis was rejected.

What should be different?
> [user input]
```

### Step 2: Prompt for Taste Capture

```
Record this as a taste preference? [y/n]

This will help future generations match your preferences.
```

### Step 3: Format Entry

```typescript
function formatTasteFromRejection(
  rejection: Rejection,
  reason: string
): TasteEntry {
  return {
    timestamp: new Date(),
    description: formatDescription(rejection, reason),
    effect: rejection.hypothesis.effect,
    field: inferFieldFromReason(reason),
    tier: 1,
    source: 'explicit_rejection',
    rejectionId: rejection.id
  };
}

function formatDescription(rejection: Rejection, reason: string): string {
  const effect = rejection.hypothesis.effect;

  // Natural language description
  return `For ${effect} effects: ${reason}

Context: Rejected ${rejection.component} hypothesis
Original: ${JSON.stringify(rejection.hypothesis.physics)}`;
}
```

### Step 4: Write to taste.md

```markdown
## 2026-01-25 14:30

For Financial effects: 500ms feels more responsive for power users.
800ms default is too sluggish.

Context: Rejected ClaimButton hypothesis
Original: { timing: 800ms, sync: pessimistic }
Tier: 1 (Observation)

---
```

## Capture from Implicit Edit

When user modifies generated file:

### Step 1: Detect Physics Changes

See `wyrd/06-wyrd-change-analysis.md` for detection logic.

### Step 2: Present Changes

```
Detected modification to ClaimButton.tsx

Changes detected:
- Timing: 800ms → 500ms (line 23)
- Animation: ease-out → spring(500, 30) (line 45)

Record as taste? [y/n]
```

### Step 3: Format Entry

```typescript
function formatTasteFromEdit(
  changes: PhysicsChange[],
  originalPhysics: Physics
): TasteEntry {
  const descriptions = changes.map(c => formatChangeDescription(c));

  return {
    timestamp: new Date(),
    description: descriptions.join('\n'),
    effect: originalPhysics.effect,
    fields: changes.map(c => c.field),
    tier: 1,
    source: 'implicit_edit',
    changes
  };
}
```

### Step 4: Write to taste.md

```markdown
## 2026-01-25 14:45

Timing preference: 500ms over 800ms for Financial effects.
Animation preference: spring(500, 30) over ease-out.

Detected from edit to ClaimButton.tsx
Changes: timing (800ms → 500ms), animation (ease-out → spring)
Tier: 1 (Observation)

---
```

## Capture from Pattern

When 3+ similar rejections detected:

### Step 1: Pattern Notification

```
🔮 Pattern Detected

3 similar rejections for Financial timing found.

Pattern: Users prefer 500ms for Financial effects
Confidence: 0.85

Create taste entry? [y/n/review]
```

### Step 2: Format Entry (Auto)

```typescript
function formatTasteFromPattern(pattern: Pattern): TasteEntry {
  const rejectionSummary = pattern.rejections
    .map(r => `${r.component} (${r.from} → ${r.to})`)
    .join(', ');

  return {
    timestamp: new Date(),
    description: `Prefer ${pattern.suggestedValue} for ${pattern.effect} ${pattern.field}.

Pattern detected from ${pattern.rejections.length} rejections:
${rejectionSummary}`,
    effect: pattern.effect,
    field: pattern.field,
    value: pattern.suggestedValue,
    tier: 2,
    source: 'pattern_detection',
    patternId: pattern.id,
    confidence: pattern.confidence
  };
}
```

### Step 3: Write to taste.md

```markdown
## 2026-01-25 15:30 — Pattern: Financial Timing

Prefer 500ms for Financial effects (not default 800ms).

Pattern detected from 3 rejections:
- ClaimButton (800ms → 500ms)
- WithdrawButton (800ms → 550ms)
- StakeButton (800ms → 500ms)

**Tier**: 2 (Pattern)
**Confidence**: 0.85
**Pattern ID**: pattern-1706234567890

---
```

## Entry Validation

Before writing, validate:

```typescript
function validateTasteEntry(entry: TasteEntry): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!entry.description) errors.push('Description required');
  if (!entry.effect) errors.push('Effect required');
  if (!entry.tier) errors.push('Tier required');

  // Tier validation
  if (entry.tier === 2 && !entry.patternId) {
    errors.push('Pattern ID required for Tier 2');
  }

  // Description length
  if (entry.description.length < 10) {
    errors.push('Description too short');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

## Duplicate Prevention

Before writing, check for similar existing entries:

```typescript
async function checkDuplicate(entry: TasteEntry): Promise<boolean> {
  const existing = await readTasteEntries();

  return existing.some(e =>
    e.effect === entry.effect &&
    e.field === entry.field &&
    daysSince(e.timestamp) < 7  // Same type within 7 days
  );
}
```

If duplicate found:

```
Similar taste entry exists from 2 days ago:
"Prefer 500ms for Financial effects"

Options:
1. Update existing entry
2. Add as separate observation
3. Cancel

[1/2/3]
```

## Manual Capture

User can always record directly:

```
/sigil "They prefer springs over easing for all animations"
```

This creates a Tier 1 entry immediately:

```markdown
## 2026-01-25 16:00

They prefer springs over easing for all animations.

Tier: 1 (Observation)
Source: manual

---
```
