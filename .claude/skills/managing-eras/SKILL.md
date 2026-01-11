# Managing Eras

## Purpose

Era versioning for design direction shifts.
Track when the design language fundamentally changes.

## Command

```
/new-era "Tactile"
```

## Philosophy

> "Design evolves. Eras capture when it transforms."

An era marks a fundamental shift in design direction. Not every change
is an era - eras are reserved for when the visual language itself changes.

Examples of era-worthy shifts:
- From skeuomorphic to flat design
- From dark mode dominant to light mode dominant
- From dense interfaces to spacious layouts
- From subtle to bold accent colors

## Era Structure

```typescript
interface Era {
  name: string;           // Human-readable name (e.g., "Tactile")
  started: string;        // ISO timestamp
  ended?: string;         // ISO timestamp (when archived)
  description?: string;   // Optional description
}
```

## Survival.json Era Fields

```yaml
era: "v1-Flat"
era_started: "2026-01-09T00:00:00Z"
```

## Era Transition

When `/new-era` is invoked:

1. **Archive Current Era**:
   - Create `grimoires/sigil/state/eras/{era-name}.json`
   - Copy current survival patterns
   - Add `era_ended` timestamp
   - Mark archive as read-only

2. **Start New Era**:
   - Update `era` field in survival.json
   - Update `era_started` timestamp
   - Clear current patterns (fresh start)
   - Canonical status resets

3. **Update Rules.md**:
   - Add new era marker
   - List historical eras

## Pattern Behavior

In a new era:
- Old patterns don't block exploration
- Canonical patterns don't carry over
- Rejection list is preserved (safety)
- Physics constraints unchanged

## Craft Log Integration

Each craft log entry includes:
```yaml
era: "Tactile"
```

Logs can be filtered by era for historical analysis.

## Era Archive Format

`grimoires/sigil/state/eras/v1-Flat.json`:
```json
{
  "era": "v1-Flat",
  "started": "2025-01-01T00:00:00Z",
  "ended": "2026-01-09T12:00:00Z",
  "patterns": {
    "survived": { ... },
    "canonical": [ ... ],
    "rejected": [ ... ]
  }
}
```

## When to Trigger Era Change

Good triggers:
- Complete design system refresh
- Major visual language shift
- Strategic rebranding
- New design philosophy adoption

Not era-worthy:
- Adding new components
- Tweaking colors
- Minor adjustments
- Bug fixes

## Default Era

New projects start in era: "v1"

## Era Listing

Current era and historical eras visible in:
- survival.json (current only)
- rules.md (all eras)
- craft logs (per-entry)
- `grimoires/sigil/state/eras/` directory (archives)
