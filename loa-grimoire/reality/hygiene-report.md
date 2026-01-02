# Code Hygiene Audit

> Generated: 2026-01-01
> Target: sigil

## Files Outside Standard Directories

| Location | Type | Question for Human |
|----------|------|-------------------|
| (None found) | - | Codebase is well-organized |

## Potential Temporary/WIP Folders

| Folder | Status | Question |
|--------|--------|----------|
| .claude/templates/ | Intentional | Template files for Sigil setup |
| .claude/skills/*/resources/templates/ | Intentional | Loa skill templates |

**Verdict**: No WIP or temporary folders detected. All `/templates/` directories are intentional.

## Tech Debt Markers

| File | Count | Markers |
|------|-------|---------|
| .claude/protocols/structured-memory.md | 2 | TODO |
| .claude/skills/riding-codebase/SKILL.md | 2 | TODO |
| .claude/protocols/session-end.md | 1 | TODO |
| .claude/protocols/beads-workflow.md | 1 | TODO |
| .claude/skills/discovering-requirements/resources/BIBLIOGRAPHY.md | 1 | TODO |
| .claude/skills/auditing-security/resources/REFERENCE.md | 1 | TODO |
| .claude/skills/reviewing-code/resources/REFERENCE.md | 1 | TODO |

**Total**: 10 TODO/FIXME markers across 8 files

## Commented-Out Code Blocks

| Location | Question |
|----------|----------|
| (Not detected in framework files) | Clean |

## Potential Dependency Conflicts

None detected. Sigil is shell/markdown only with no package dependencies.

## Missing Commands (Documented but Not Implemented)

| Command | Documented In | Status |
|---------|---------------|--------|
| /codify | README, CLAUDE.md | **NOT FOUND** |
| /craft | README, CLAUDE.md | **NOT FOUND** |
| /approve | README, CLAUDE.md | **NOT FOUND** |

**Question for Human**: Are /codify, /craft, and /approve planned for implementation or should documentation be updated?

## Important: Dead Code Philosophy

Items flagged above are for **HUMAN DECISION**, not automatic fixing.

Possible dispositions:
- **Keep (WIP)**: Intentionally incomplete, will be finished
- **Keep (Reference)**: Useful for copy-paste or learning
- **Archive**: Move to `_archive/` folder
- **Delete**: Confirmed abandoned

Add disposition decisions to `loa-grimoire/NOTES.md` Decision Log.
