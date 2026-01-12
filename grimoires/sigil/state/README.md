# Sigil State

This directory contains runtime state files that are generated during usage.

**Status:** Gitignored (private, per-project)

## Files (Phase 2)

| File | Purpose |
|------|---------|
| `workshop.json` | Pre-computed index for fast queries |
| `survival-stats.json` | Component usage and stability tracking |
| `pending-ops.json` | CI/CD operation queue |
| `survival.json` | Pattern survival tracking |
| `craft-log/` | Session craft logs |

## Phase 1 (Current)

Empty — using defaults. State tracking activates in Phase 2 when observability infrastructure is ready.

## Why Gitignored

State files are:
- Generated per-project
- Contain project-specific usage data
- Should not be shared across repositories

---

*Migrated from .sigil/ in v9.0*
