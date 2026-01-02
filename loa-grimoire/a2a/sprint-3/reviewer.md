# Sprint 3 Implementation Report: Sigil v2 Rules

**Sprint**: Sprint 3 - Rules
**Status**: Complete
**Date**: 2026-01-01

---

## Summary

Implemented the rules phase of Sigil v2, enabling design rule definition through interview (`/codify`) and the zone system for path-based design context resolution.

---

## Tasks Completed

### SIGIL-7: Implement /codify Command ✅

**Files Created**:
- `.claude/commands/codify.md`
- `.claude/skills/sigil-codifying/index.yaml`
- `.claude/skills/sigil-codifying/SKILL.md`

**Features**:
- Pre-flight check for `.sigil-setup-complete`
- Reads `sigil-mark/moodboard.md` for context
- 8-phase interview flow:
  1. Color strategy (Tailwind, custom tokens, brand colors)
  2. Typography (system fonts, custom, scale)
  3. Spacing (4px base, 8px base, Tailwind, custom)
  4. Critical zone motion
  5. Marketing zone motion
  6. Admin zone motion
  7. Zone paths assignment
  8. Component-specific rules
- Generates complete `sigil-mark/rules.md`
- Updates `.sigilrc.yaml` with zone definitions
- Handles existing rules (update vs replace)

### SIGIL-8: Implement Zone System ✅

**Files Created**:
- `.claude/scripts/get-zone.sh`
- `.claude/scripts/parse-rules.sh`
- Updated `.claude/templates/sigilrc.yaml`

**Features**:

#### get-zone.sh
- Resolves file path to zone name
- Supports glob patterns (`**`, `*`)
- Uses yq if available, fallback to grep-based parsing
- Returns "default" if no match
- Usage: `get-zone.sh src/features/checkout/Cart.tsx` → `critical`

#### parse-rules.sh
- Extracts sections from rules.md
- Supports `--section <name>` for specific sections
- Supports `--json` for machine-readable output
- Parses markdown tables to JSON
- Sections: colors, typography, spacing, motion, components

#### sigilrc.yaml Template
- Enhanced with example paths (commented)
- Added timing hints per zone
- Added more pattern examples
- Clear documentation of zone purpose

---

## File Structure

```
.claude/
├── commands/
│   └── codify.md                  # /codify command
├── scripts/
│   ├── get-zone.sh                # Zone resolution
│   └── parse-rules.sh             # Rules parsing
├── skills/
│   └── sigil-codifying/
│       ├── index.yaml
│       └── SKILL.md
└── templates/
    └── sigilrc.yaml               # Updated template
```

---

## Acceptance Criteria Met

### SIGIL-7: /codify command
- [x] Checks for .sigil-setup-complete (preflight)
- [x] Reads moodboard.md for context
- [x] Uses AskUserQuestion for each category
- [x] Captures color tokens (light/dark)
- [x] Captures typography rules
- [x] Captures spacing conventions
- [x] Captures motion rules by zone
- [x] Captures component-specific rules
- [x] Writes sigil-mark/rules.md organized by category
- [x] Updates .sigilrc.yaml with zone definitions

### SIGIL-8: Zone system
- [x] .sigilrc.yaml supports zones section
- [x] Each zone has paths (glob patterns)
- [x] Each zone has motion preference
- [x] Each zone has preferred/warned patterns
- [x] get-zone.sh resolves file path to zone
- [x] Fallback to "default" zone if no match

---

## Interview Question Design

### /codify Questions

1. **Color Strategy**
   - Tailwind defaults
   - Custom tokens
   - Brand colors only
   - I'll specify

2. **Typography**
   - System fonts
   - Single custom font
   - Heading + Body fonts
   - Custom scale

3. **Spacing**
   - 4px base
   - 8px base
   - Tailwind default
   - Custom

4. **Critical Zone Motion**
   - Deliberate (800ms+)
   - Measured (400-600ms)
   - Quick (200-400ms)
   - Custom

5. **Marketing Zone Motion**
   - Playful & Bouncy
   - Elegant & Smooth
   - Bold & Dynamic
   - Custom

6. **Admin Zone Motion**
   - Snappy (<200ms)
   - Minimal
   - Subtle (200-300ms)
   - Same as critical

7. **Zone Paths** (multiSelect per zone)
   - checkout/**
   - claim/**
   - auth/**
   - I'll specify

8. **Component Rules** (multiSelect)
   - Buttons
   - Modals/Dialogs
   - Toasts/Notifications
   - None for now

---

## Zone System Details

### Zone Resolution Logic

```
1. Read file path
2. Load .sigilrc.yaml
3. For each zone:
   - For each glob pattern in zone.paths:
     - If path matches pattern → return zone
4. No match → return "default"
```

### Glob Pattern Support

| Pattern | Matches |
|---------|---------|
| `src/features/checkout/**` | Any file under checkout/ |
| `components/*.tsx` | .tsx files directly in components/ |
| `app/(app)/transactions/**` | Next.js route groups |

### Zone Configuration

| Zone | Motion | Timing | Purpose |
|------|--------|--------|---------|
| critical | deliberate | 800ms+ | High-stakes actions |
| marketing | playful | variable | Showcase, landing |
| admin | snappy | <200ms | Internal tools |
| default | - | - | Fallback |

---

## Notes

- Zone system uses yq if available, falls back to grep-based parsing
- `parse-rules.sh` can extract specific sections for tooling
- Template includes commented example paths for quick customization
- All questions use 2-4 options per AskUserQuestion constraint

---

## Next Sprint

Sprint 4: Guidance
- SIGIL-9: /craft command
- SIGIL-10: /approve command
- SIGIL-11: Recipe templates
