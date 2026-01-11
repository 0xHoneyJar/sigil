# Agent Working Memory (NOTES.md)

> This file persists agent context across sessions and compaction cycles.
> Updated automatically by agents. Manual edits are preserved.

## Active Sub-Goals
<!-- Current objectives being pursued -->
1. ~~Implement missing Sigil commands (/codify, /craft, /approve)~~ DONE (v11)
2. ~~Fix documentation drift (license, command counts)~~ DONE (v11)
3. ~~Add governance files (CHANGELOG, CONTRIBUTING, SECURITY)~~ DONE (v11)
4. Test Sigil v11 on S&F repo for feedback loops
5. Refine based on real-world usage

## Versioning Warnings
<!-- Important notes about version management -->

### PRD Version Number
The PRD contains a `version: "x.x"` field in the YAML frontmatter. This version:
- Is **document version**, not framework version
- Should be incremented when PRD content changes significantly
- Does NOT auto-sync with VERSION file or package.json
- Can cause confusion if not updated during major rewrites

**Best Practice**: When doing major version bumps (e.g., v0.4 → v11):
1. Update `VERSION` file in root
2. Update `package.json` versions in packages/
3. Update PRD frontmatter version
4. Update SDD frontmatter version
5. Update mount script version strings
6. Grep for old version numbers: `grep -r "v0.4\|0\.4\." --include="*.md"`

### Current Version State (2026-01-04)
- Framework: v11.0.0 (VERSION file)
- Mount script: v11.0.0
- PRD: Check and update if stale
- SDD: Check and update if stale

## Discovered Technical Debt
<!-- Issues found during implementation that need future attention -->
- ~~10 TODO markers in framework files~~ Reduced in v11
- ~~3 missing commands documented but not implemented~~ Fixed in v11 (14 commands)
- ~~README claims MIT license but actual is AGPL~~ Fixed (MIT)
- ~~No CHANGELOG.md for version history~~ Added
- gold-standard/ needs actual reference assets (currently placeholder README only)
- essence.yaml values are null (populated via /envision)

## Blockers & Dependencies
<!-- External factors affecting progress -->
None - all dependencies are optional (jq, yq)

## Session Continuity
<!-- Key context to restore on next session -->
| Timestamp | Agent | Summary |
|-----------|-------|---------|
| 2026-01-04 | implementing-tasks | Completed Sigil v11 (Sprints 13-19), security audit, drift fixes |
| 2026-01-04 | auditing-security | Security audit APPROVED - 0 HIGH issues (all fixed) |
| 2026-01-04 | - | Fixed mount-sigil.sh for v11 skills/commands, testing on S&F |
| 2026-01-01 | riding-codebase | Completed /ride - analyzed codebase, 35% drift, 6 ghost features |

## Decision Log
<!-- Major decisions with rationale -->
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-01 | Skip legacy deprecation | Framework repo - docs are primary, not legacy |
| 2026-01-01 | Mark PRD/SDD as reality-checked | Added grounding markers to existing docs |

## Ride Summary (2026-01-01)

### Key Metrics
- Commands: 4 Sigil + 16 Loa
- Skills: 4 Sigil + 10 Loa
- Drift Score: 35%
- Consistency: 8/10
- Grounding: ~80%

### Critical Action Items
1. **HIGH**: Implement /codify, /craft, /approve commands
2. **HIGH**: Fix LICENSE reference in README.md
3. **MEDIUM**: Create CHANGELOG.md
4. **MEDIUM**: Add git tags for v2.0.0

### Files Created
- loa-grimoire/context/claims-to-verify.md
- loa-grimoire/reality/code-inventory.md
- loa-grimoire/reality/hygiene-report.md
- loa-grimoire/legacy/INVENTORY.md
- loa-grimoire/drift-report.md
- loa-grimoire/consistency-report.md
- loa-grimoire/governance-report.md
- loa-grimoire/trajectory-audit.md
