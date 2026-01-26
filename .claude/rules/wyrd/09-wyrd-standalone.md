# Wyrd: Standalone Mode

Detection and behavior when running without Loa framework.

## Purpose

Rune can operate standalone without Loa. Detect this mode and adjust behavior accordingly.

## Detection

```typescript
async function isStandaloneMode(): Promise<boolean> {
  // Check for Loa version file
  const loaVersionPath = '.loa-version.json';
  const loaVersionExists = await fileExists(loaVersionPath);

  // Check for Loa grimoire structure
  const loaNotesPath = 'grimoires/loa/NOTES.md';
  const loaNotesExists = await fileExists(loaNotesPath);

  // Standalone if no Loa markers
  return !loaVersionExists && !loaNotesExists;
}
```

## Mode Differences

| Feature | Loa Mode | Standalone Mode |
|---------|----------|-----------------|
| NOTES.md logging | grimoires/loa/NOTES.md | grimoires/rune/NOTES.md |
| Workflow hooks | Active | Disabled |
| Sprint integration | Active | Disabled |
| Session continuity | NOTES.md + Loa | grimoires/rune/ only |
| Validation commands | /validate | /glyph validate |

## Standalone Behavior

### State Storage

```typescript
function getStatePaths(standalone: boolean): StatePaths {
  if (standalone) {
    return {
      taste: 'grimoires/rune/taste.md',
      wyrd: 'grimoires/rune/wyrd.md',
      rejections: 'grimoires/rune/rejections.md',
      patterns: 'grimoires/rune/patterns.md',
      notes: 'grimoires/rune/NOTES.md'  // Standalone NOTES
    };
  }

  return {
    taste: 'grimoires/rune/taste.md',
    wyrd: 'grimoires/rune/wyrd.md',
    rejections: 'grimoires/rune/rejections.md',
    patterns: 'grimoires/rune/patterns.md',
    notes: 'grimoires/loa/NOTES.md'  // Loa NOTES
  };
}
```

### Command Availability

In standalone mode, all core commands work:

| Command | Standalone | Description |
|---------|------------|-------------|
| `/sigil` | ✓ | Record taste |
| `/glyph` | ✓ | Generate components |
| `/rigor` | ✓ | Validate web3 code |
| `/wyrd` | ✓ | Check confidence state |

Workflow commands are disabled:

| Command | Standalone | Reason |
|---------|------------|--------|
| `/validate physics` | ✗ | Requires sprint context |
| `/validate rigor` | ✗ | Requires sprint context |

Use `/glyph validate` and `/rigor` directly instead.

### Hook Behavior

```typescript
function shouldRunHook(hookName: string, standalone: boolean): boolean {
  if (standalone) {
    // Only file monitoring works in standalone
    return hookName === 'file_modification';
  }

  return true;
}
```

### Logging

In standalone mode, create standalone NOTES.md if needed:

```typescript
async function ensureNotesFile(standalone: boolean): Promise<string> {
  const notesPath = standalone
    ? 'grimoires/rune/NOTES.md'
    : 'grimoires/loa/NOTES.md';

  if (!await fileExists(notesPath)) {
    await createFile(notesPath, NOTES_TEMPLATE);
  }

  return notesPath;
}

const NOTES_TEMPLATE = `# Rune Notes

## Design Physics

### Active Craft
- **Component**: [none]
- **Effect**: [none]
- **Physics**: [none]
- **Iteration**: 0
- **Confidence**: [none]

### Taste Applied
[No taste entries yet. Use /sigil to record preferences.]

### Physics Decisions
| Date | Component | Effect | Timing | Taste Override | Rationale |
|------|-----------|--------|--------|----------------|-----------|

### Wyrd State
- **Last Calibration**: [never]
- **Total Hypotheses**: 0
- **Validation Rate**: —
- **Avg Confidence**: —
`;
```

## Mode Indicator

Show mode in output:

```markdown
## Hypothesis

**Mode**: Standalone (Loa not detected)
**Effect**: Financial
**Physics**: Pessimistic, 800ms, confirmation required
**Confidence**: 0.85

[y/n/adjust]
```

## Migration to Loa

When Loa is installed later:

```typescript
async function migrateToLoa(): Promise<void> {
  // Check if standalone state exists
  const standaloneNotes = 'grimoires/rune/NOTES.md';
  if (await fileExists(standaloneNotes)) {
    // Merge into Loa NOTES
    const standaloneContent = await readFile(standaloneNotes);
    const loaNotes = await readFile('grimoires/loa/NOTES.md');

    // Extract Design Physics section
    const physicsSection = extractSection(standaloneContent, '## Design Physics');

    // Append to Loa NOTES
    const merged = loaNotes + '\n\n' + physicsSection;
    await writeFile('grimoires/loa/NOTES.md', merged);

    // Archive standalone NOTES
    await moveFile(standaloneNotes, 'grimoires/rune/NOTES.standalone.bak');

    console.log('Migrated standalone state to Loa.');
  }
}
```

## Configuration

In `.claude/settings.json` or project settings:

```json
{
  "rune": {
    "standalone": {
      "auto_detect": true,
      "force_standalone": false,
      "create_notes": true
    }
  }
}
```

## Startup Message

On first run in standalone mode:

```
🔮 Rune (Standalone Mode)

Loa framework not detected. Running in standalone mode.

Available commands:
- /sigil "insight" — Record taste preference
- /glyph "description" — Generate component
- /glyph validate file.tsx — Validate component
- /rigor file.tsx — Check web3 safety
- /wyrd — View confidence state

State stored in: grimoires/rune/

To enable full features, install Loa: /loa mount
```
