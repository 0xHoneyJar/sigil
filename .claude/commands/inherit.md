---
name: inherit
version: "1.2.4"
description: Bootstrap Sigil from existing codebase (analysis only)
agent: inheriting-design
agent_path: .claude/skills/inheriting-design/SKILL.md
preflight:
  - sigil_mark_exists
---

# /inherit

Bootstrap Sigil from an existing codebase. Scans for physics values and reports findings (does NOT auto-generate recipes).

## Usage

```
/inherit                # Full codebase scan
/inherit --path [dir]   # Scan specific directory
/inherit --report       # Generate detailed report only
```

## What This Does

1. **Scans codebase** — Finds physics values in TSX files
2. **Clusters patterns** — Groups similar physics configurations
3. **Reports findings** — Shows what was found and where
4. **Does NOT auto-generate** — Human decides which become recipes

## Why No Auto-Generation?

Recipe creation is a design decision. `/inherit` provides the data; humans make the calls about what deserves to be a recipe.

## Physics Detection

Scans for:
- `stiffness` / `damping` (spring configs)
- `transition` / `duration` (timing)
- `scale` / `opacity` / `transform` (animation)
- `ease*` (easing functions)

## Output Format

```
/inherit

SCANNING CODEBASE...

Found 23 files with physics values

SPRING CONFIGURATIONS:
┌────────────────────────────────────────────────────────────┐
│ Pattern A: spring(180, 12)                                 │
│ Files: 8                                                    │
│   - src/checkout/ClaimButton.tsx                           │
│   - src/checkout/ConfirmDialog.tsx                         │
│   - ...                                                     │
├────────────────────────────────────────────────────────────┤
│ Pattern B: spring(300, 8)                                  │
│ Files: 3                                                    │
│   - src/dashboard/QuickAction.tsx                          │
│   - ...                                                     │
├────────────────────────────────────────────────────────────┤
│ Pattern C: spring(200, 20)                                 │
│ Files: 5                                                    │
│   - src/marketing/HeroSection.tsx                          │
│   - ...                                                     │
└────────────────────────────────────────────────────────────┘

TIMING CONFIGURATIONS:
┌────────────────────────────────────────────────────────────┐
│ duration: 0.2s (12 occurrences)                            │
│ duration: 0.3s (6 occurrences)                             │
│ delay: 100-200ms (staggered patterns)                      │
└────────────────────────────────────────────────────────────┘

RECOMMENDATIONS:
  1. Pattern A matches 'decisive' recipe set — already covered
  2. Pattern B could become Button.snappy variant
  3. Pattern C matches 'glass' recipe set — already covered

NEXT STEPS:
  - For new patterns: /sandbox [file] then /codify
  - For zone assignment: Edit .sigilrc.yaml per directory
  - For recipe coverage: Run /validate
```

## Detailed Report

With `--report`, writes to `sigil-mark/reports/inherit-{date}.md`:

```markdown
# Inherit Report

**Date:** 2026-01-05
**Files Scanned:** 156
**Files with Physics:** 23

## Spring Patterns

| Pattern | Stiffness | Damping | Count | Files |
|---------|-----------|---------|-------|-------|
| A | 180 | 12 | 8 | [list] |
| B | 300 | 8 | 3 | [list] |
| ... |

## Recommendations

[Detailed analysis]
```

## Error Handling

| Error | Resolution |
|-------|------------|
| No physics found | Check file extensions, component structure |
| Sigil not setup | Run /setup first |
| Path not found | Verify --path argument |

## Next Steps

After inherit:
- Create zone configs for identified directories
- Use `/sandbox` + `/codify` for new patterns
- Run `/validate` to check coverage
