# Wyrd: Error Handling & Graceful Degradation

Protocol for handling missing state files, malformed data, and edge cases.

## Philosophy

**Never block on bad state.** If state files are missing or corrupted, use defaults and continue. Log issues for later resolution.

## Missing State Files

### grimoires/rune/ Directory

```typescript
async function ensureRuneDirectory(): Promise<void> {
  const runePath = 'grimoires/rune';

  if (!await directoryExists(runePath)) {
    await createDirectory(runePath);
    await createDefaultStateFiles(runePath);

    console.log('Created grimoires/rune/ with default state files.');
  }
}

async function createDefaultStateFiles(basePath: string): Promise<void> {
  // taste.md
  await writeFile(`${basePath}/taste.md`, `# Taste

Human preferences for design physics.

---
`);

  // wyrd.md
  await writeFile(`${basePath}/wyrd.md`, `# Wyrd State

## Confidence Calibration

| Effect | Base | Taste Adj | Rejection Adj | Final | Last Updated |
|--------|------|-----------|---------------|-------|--------------|
| Financial | 0.90 | +0.00 | -0.00 | 0.90 | — |
| Destructive | 0.90 | +0.00 | -0.00 | 0.90 | — |
| Standard | 0.85 | +0.00 | -0.00 | 0.85 | — |
| Local | 0.95 | +0.00 | -0.00 | 0.95 | — |

## Metrics

- **Total Hypotheses**: 0
- **Accepted**: 0
- **Rejected**: 0
- **Patterns Detected**: 0
`);

  // rejections.md
  await writeFile(`${basePath}/rejections.md`, `# Rejections

Append-only log of hypothesis rejections.

---
`);

  // patterns.md
  await writeFile(`${basePath}/patterns.md`, `# Detected Patterns

Patterns extracted from 3+ similar rejections.

---
`);
}
```

### Missing Individual Files

```typescript
async function readStateFile(
  filename: string,
  defaultContent: string
): Promise<string> {
  const path = `grimoires/rune/${filename}`;

  try {
    return await readFile(path);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, create with default
      await writeFile(path, defaultContent);
      console.log(`Created ${path} with default content.`);
      return defaultContent;
    }
    throw error;
  }
}
```

## Malformed Data

### taste.md Parsing Errors

```typescript
function parseTasteEntries(content: string): TasteEntry[] {
  const entries: TasteEntry[] = [];
  const sections = content.split(/^## /m).filter(s => s.trim());

  for (const section of sections) {
    try {
      const entry = parseTasteEntry(section);
      if (entry) {
        entries.push(entry);
      }
    } catch (error) {
      // Log warning but continue
      console.warn(`Skipping malformed taste entry: ${error.message}`);
      logWarning({
        file: 'taste.md',
        section: section.substring(0, 50),
        error: error.message
      });
    }
  }

  return entries;
}
```

### wyrd.md Calibration Table Errors

```typescript
function parseCalibrationTable(content: string): CalibrationState[] {
  try {
    // Try to parse markdown table
    const tableMatch = content.match(/\|.*Effect.*\|[\s\S]*?(?=\n\n|\n#|$)/);
    if (tableMatch) {
      return parseMarkdownTable(tableMatch[0]);
    }
  } catch (error) {
    console.warn('Failed to parse calibration table, using defaults.');
  }

  // Return defaults
  return DEFAULT_CALIBRATION;
}

const DEFAULT_CALIBRATION: CalibrationState[] = [
  { effect: 'Financial', baseConfidence: 0.90, tasteAdjustment: 0, rejectionAdjustment: 0, finalConfidence: 0.90 },
  { effect: 'Destructive', baseConfidence: 0.90, tasteAdjustment: 0, rejectionAdjustment: 0, finalConfidence: 0.90 },
  { effect: 'Standard', baseConfidence: 0.85, tasteAdjustment: 0, rejectionAdjustment: 0, finalConfidence: 0.85 },
  { effect: 'Local', baseConfidence: 0.95, tasteAdjustment: 0, rejectionAdjustment: 0, finalConfidence: 0.95 }
];
```

### rejections.md Corruption

```typescript
async function handleCorruptedRejections(): Promise<void> {
  const path = 'grimoires/rune/rejections.md';
  const content = await readFile(path);

  // Check if parseable
  try {
    parseRejections(content);
  } catch (error) {
    // Archive corrupted file
    const archivePath = `grimoires/rune/rejections.${Date.now()}.bak`;
    await moveFile(path, archivePath);

    // Create fresh file
    await writeFile(path, `# Rejections

Previous file archived to ${archivePath} due to corruption.

---
`);

    console.warn(`Corrupted rejections.md archived. Fresh file created.`);
  }
}
```

## Graceful Degradation

### Missing Taste

If taste.md is empty or missing:

```typescript
async function getTasteForEffect(effect: Effect): Promise<TasteEntry[]> {
  const entries = await readTasteEntries();

  if (entries.length === 0) {
    // No taste, use physics defaults
    return [];
  }

  return entries.filter(e => e.effect === effect);
}
```

Output indicates default:

```
**Taste Applied**: [none - using physics defaults]
```

### Missing Wyrd State

If wyrd.md is missing or corrupted:

```typescript
async function getConfidence(effect: Effect): Promise<number> {
  try {
    const calibration = await readCalibration();
    const state = calibration.find(c => c.effect === effect);
    return state?.finalConfidence ?? BASE_CONFIDENCE[effect];
  } catch (error) {
    console.warn('Using base confidence due to wyrd.md error.');
    return BASE_CONFIDENCE[effect];
  }
}
```

Output indicates fallback:

```
**Confidence**: 0.90 (base - calibration unavailable)
```

### Missing Patterns

If patterns.md is missing:

```typescript
async function checkPatternMatch(effect: Effect, field: string): Promise<Pattern | null> {
  try {
    const patterns = await readPatterns();
    return patterns.find(p => p.effect === effect && p.field === field);
  } catch (error) {
    // No patterns, continue without
    return null;
  }
}
```

## Error Logging

All errors logged to session:

```typescript
interface ErrorLog {
  timestamp: Date;
  file: string;
  error: string;
  action: 'created_default' | 'used_fallback' | 'archived';
  details?: any;
}

async function logError(error: ErrorLog): Promise<void> {
  // Log to console
  console.warn(`[Rune Error] ${error.file}: ${error.error}`);

  // Append to NOTES.md warnings section
  const notesPath = getNotesPath();
  const warningEntry = `
### ${formatDate(error.timestamp)} - ${error.file}
- **Error**: ${error.error}
- **Action**: ${error.action}
${error.details ? `- **Details**: ${JSON.stringify(error.details)}` : ''}
`;

  await appendToSection(notesPath, '## Warnings', warningEntry);
}
```

## Recovery Commands

### `/wyrd repair`

```typescript
async function repairWyrdState(): Promise<void> {
  console.log('Repairing Wyrd state...');

  // Ensure directory
  await ensureRuneDirectory();

  // Recalculate calibration from rejections
  await recalibrate();

  // Validate all state files
  await validateStateFiles();

  console.log('Wyrd state repaired.');
}
```

### `/sigil repair`

```typescript
async function repairTasteState(): Promise<void> {
  console.log('Repairing Sigil state...');

  // Ensure taste.md exists
  await ensureFile('grimoires/rune/taste.md', DEFAULT_TASTE);

  // Validate entries
  const entries = await readTasteEntries();
  const validEntries = entries.filter(e => validateTasteEntry(e));

  if (validEntries.length < entries.length) {
    console.log(`Removed ${entries.length - validEntries.length} invalid entries.`);
    await rewriteTasteFile(validEntries);
  }

  console.log('Sigil state repaired.');
}
```

## Startup Validation

On first command run:

```typescript
async function validateRuneState(): Promise<ValidationResult> {
  const issues: string[] = [];

  // Check directory
  if (!await directoryExists('grimoires/rune')) {
    issues.push('grimoires/rune/ missing - will create');
  }

  // Check state files
  for (const file of ['taste.md', 'wyrd.md', 'rejections.md', 'patterns.md']) {
    if (!await fileExists(`grimoires/rune/${file}`)) {
      issues.push(`${file} missing - will create with defaults`);
    }
  }

  // Report if issues found
  if (issues.length > 0) {
    console.log('🔮 Rune state check:');
    for (const issue of issues) {
      console.log(`  - ${issue}`);
    }
    console.log('Fixing automatically...\n');
    await ensureRuneDirectory();
  }

  return { valid: issues.length === 0, issues };
}
```
