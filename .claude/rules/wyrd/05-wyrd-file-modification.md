# Wyrd: File Modification Capture

Detect and learn from user modifications to generated components.

## Philosophy

**Implicit feedback is gold.** When users modify generated code, they're correcting our physics assumptions. Capture this.

## Trigger

After `/glyph` generates and writes a file:

1. Record file path and timestamp
2. Start 30-minute monitoring window
3. On file change within window, analyze diff

## Monitoring State

Store in session memory (not persisted):

```typescript
interface MonitoredFile {
  path: string;
  generatedAt: Date;
  effect: Effect;
  physics: Physics;
  confidence: number;
  expiresAt: Date;  // generatedAt + 30 minutes
}

const monitoredFiles: Map<string, MonitoredFile> = new Map();
```

## Detection Methods

### Method 1: Git Diff (Preferred)

```typescript
async function detectChanges(filePath: string): Promise<Change[]> {
  // Get diff since generation
  const diff = await exec(`git diff ${filePath}`);

  if (!diff) return [];

  // Parse hunks
  return parseGitDiff(diff);
}
```

### Method 2: File Watch (Fallback)

```typescript
function watchFile(filePath: string, callback: (changes: Change[]) => void) {
  const watcher = fs.watch(filePath, async (eventType) => {
    if (eventType === 'change') {
      const changes = await detectChanges(filePath);
      if (changes.length > 0) {
        callback(changes);
      }
    }
  });

  // Auto-cleanup after window expires
  setTimeout(() => watcher.close(), 30 * 60 * 1000);
}
```

## Change Detection Flow

```
1. File modified within 30-minute window
   ↓
2. Get git diff
   ↓
3. Parse for physics-relevant changes (see 06-wyrd-change-analysis.md)
   ↓
4. If physics change detected:
   ↓
5. Present to user:

   Detected modification to ClaimButton.tsx

   Changes detected:
   - Timing: 800ms → 500ms (line 23)
   - Animation: ease-out → spring(500, 30) (line 45)

   Record as taste? [y/n]
```

## Change Categories

| Category | Examples | Action |
|----------|----------|--------|
| Physics | Timing, sync, confirmation | Prompt for taste |
| Style | Colors, spacing | Ignore |
| Logic | Business rules | Ignore |
| Structure | Component split | Ignore |

Only physics-relevant changes trigger the taste prompt.

## User Responses

### On "y" (Record as Taste)

1. Extract change context
2. Format as taste entry
3. Append to `grimoires/rune/taste.md`
4. Log to `grimoires/rune/rejections.md` with outcome
5. Update confidence calibration

### On "n" (Decline Recording)

1. Log to rejections.md as `implicit_edit` type
2. Mark `taste_created: false`
3. Still count toward pattern detection

### On No Response (Timeout)

1. Log as `implicit_edit_no_response`
2. Don't count toward pattern detection
3. Clear monitoring state

## Rejection Log Entry

```markdown
## 2026-01-25 14:30 - ClaimButton Modification

**Original Hypothesis**:
- Effect: Financial
- Timing: 800ms
- Confidence: 0.85

**Modification**:
- Type: implicit_edit
- Changes:
  - Timing: 800ms → 500ms
  - Animation: ease-out → spring(500, 30)
- File: src/components/ClaimButton.tsx
- Line Range: 23-45

**User Response**: recorded_as_taste

**Outcome**:
- Taste Created: yes (taste-2026-01-25-002)
- Pattern Detected: checking...
- Confidence Adjustment: pending recalibration

---
```

## Window Extension

If user is actively editing (multiple saves), extend window:

```typescript
function onFileChange(filePath: string) {
  const monitored = monitoredFiles.get(filePath);
  if (!monitored) return;

  // Extend window by 5 minutes on each save (max 1 hour total)
  const maxExpiry = new Date(monitored.generatedAt.getTime() + 60 * 60 * 1000);
  const newExpiry = new Date(Date.now() + 5 * 60 * 1000);

  monitored.expiresAt = newExpiry < maxExpiry ? newExpiry : maxExpiry;
}
```

## Batch Changes

If multiple physics changes in same edit session:

```
Detected modifications to ClaimButton.tsx

Changes detected:
1. Timing: 800ms → 500ms
2. Animation: ease-out → spring(500, 30)
3. Confirmation: modal → inline

Record all as taste? [y/n/select]
```

On "select", allow choosing which changes to record.

## Skip Conditions

Don't monitor or prompt if:

1. File is test file (`*.test.tsx`)
2. File is story file (`*.stories.tsx`)
3. User previously selected "never ask for this file"
4. Sprint has taste capture disabled

## Integration with Wyrd

File modification is one input to the Wyrd learning loop:

```
Explicit Rejection (n to hypothesis) ─┐
                                       ├──→ rejections.md ──→ Pattern Detection
Implicit Edit (file modification) ────┘

3+ similar rejections ──→ Pattern ──→ Tier Promotion ──→ taste.md
```
