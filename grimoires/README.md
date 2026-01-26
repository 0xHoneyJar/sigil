# Grimoires

State stores with clear input/output boundaries. Each grimoire is self-contained.

## Structure

```
grimoires/
├── loa/          # Workflow orchestration state
├── rune/         # Design physics state
└── pub/          # Published artifacts (read-only)
```

## Grimoire: loa/

Loa framework state for development workflow.

| File | I/O | Description |
|------|-----|-------------|
| `ledger.json` | State | Sprint numbering across cycles |
| `NOTES.md` | State | Session memory, decisions, blockers |
| `context/` | Input | User-provided docs for PRD discovery |
| `prd.md` | Output | Product Requirements Document |
| `sdd.md` | Output | Software Design Document |
| `sprint.md` | Output | Current sprint plan |
| `cycles/` | Archive | Completed cycle documents |

## Grimoire: rune/

Rune construct state for design physics.

| File | I/O | Description |
|------|-----|-------------|
| `taste.md` | Output | Accumulated preferences (Sigil) |
| `wyrd.md` | State | Learning loop state (Wyrd) |
| `patterns.md` | Output | Detected patterns from rejections |
| `rejections.md` | State | Rejection log for pattern detection |

## Grimoire: pub/

Published artifacts. Read-only outputs for sharing.

| Directory | Description |
|-----------|-------------|
| `artifacts/` | Generated deliverables |
| `docs/` | Documentation for external consumption |
| `research/` | Research findings, analyses |

## Pub/Sub Model

```
Input → Process → Output

context/     → /plan-and-analyze → prd.md
prd.md       → /architect        → sdd.md
sdd.md       → /sprint-plan      → sprint.md
rejections   → Wyrd loop         → patterns.md → taste.md
```

Each grimoire owns its state. Cross-grimoire dependencies are explicit.
