# Sigil Archive

This directory contains legacy code from previous Sigil architecture versions.

**Do not import from this directory.** These files are preserved for reference only.

## Versions

| Version | Era | Key Features |
|---------|-----|--------------|
| v1.0 | Original | Soul, resonance, governance, memory |
| v3.0 | Lens Array | Soul-binder, lens-array, zone configs |
| v4.0 | Living Guardrails | Consultation-chamber, surveys, personas, evidence |

## Why Archived?

These architectures were superseded by:
- **v6.0**: Survival-based patterns, workshop index
- **v7.0**: Survival engine, linter gate, executable principles

The current active code lives in:
- `sigil-mark/core/` — Runtime physics
- `sigil-mark/layouts/` — Zone layouts
- `sigil-mark/lenses/` — UI lenses
- `sigil-mark/process/` — Agent-time utilities
- `sigil-mark/kernel/` — Agent configuration
- `sigil-mark/moodboard/` — User taste curation

## Restoring Archived Code

If you need functionality from an archived version:

```bash
# Copy specific file
cp sigil-mark/.archive/v4.0/personas/personas.yaml sigil-mark/kernel/

# Or restore entire directory
cp -r sigil-mark/.archive/v3.0/soul-binder sigil-mark/
```

Then update imports and test thoroughly.
