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
| 2026-01-20 | planning-sprints | Created Sprint Plan: /craft Optimization (6 sprints, solo dev, 1-week cycles) |
| 2026-01-20 | architecting-system | Created SDD: /craft Optimization & Dev Toolbar (craft.md split, Anchor LensContext, Toolbar architecture) |
| 2026-01-20 | discovering-requirements | Created PRD: /craft Optimization & Dev Toolbar Integration (Issue #39) |
| 2026-01-20 | implementing-tasks | Completed Anchor/Lens Rust CLIs (Sprints 1-6), all 155 tests pass |
| 2026-01-20 | discovering-requirements | Created PRD v3.0.0 "Loa Constructs Triad" - Sigil, Anchor, Persona |
| 2026-01-04 | implementing-tasks | Completed Sigil v11 (Sprints 13-19), security audit, drift fixes |
| 2026-01-04 | auditing-security | Security audit APPROVED - 0 HIGH issues (all fixed) |
| 2026-01-04 | - | Fixed mount-sigil.sh for v11 skills/commands, testing on S&F |
| 2026-01-01 | riding-codebase | Completed /ride - analyzed codebase, 35% drift, 6 ghost features |

## Decision Log
<!-- Major decisions with rationale -->
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-20 | Add Persona as third Loa Construct | SimCity-inspired user simulation completes Design→Validate→Simulate loop |
| 2026-01-20 | Rename PRD to "Loa Constructs Triad" | Reflects three constructs: Sigil (Feel), Anchor (Reality), Persona (Simulate) |
| 2026-01-01 | Skip legacy deprecation | Framework repo - docs are primary, not legacy |
| 2026-01-01 | Mark PRD/SDD as reality-checked | Added grounding markers to existing docs |

## Ride Summary (2026-01-01) - SUPERSEDED

See Ride Summary (2026-01-20) for current state.

---

## Ride Summary (2026-01-20)

### Key Metrics
- Commands: 47 (was 20)
- Rules: 21
- Skills: 28 (was 14)
- Subagents: 4 (new)
- Protocols: 33 (new)
- Drift Score: 8/100 (was 35/100) ✅ HEALTHY
- Governance Score: 85/100

### Health Status
| Category | Status |
|----------|--------|
| Code ↔ CLAUDE.md | 95% |
| Code ↔ README.md | 90% |
| Code ↔ CHANGELOG | 85% |
| Overall | ✅ HEALTHY |

### Drift Findings (Minor)
**Ghosts** (documented but missing):
1. Voice Physics rule file (README mentions, no file)
2. `loa install sigil` command (README, not implemented)
3. `sigil-toolbar` extension (CHANGELOG, not shipped)

**Shadows** (code but undocumented):
1. Data Physics layer (rule 19, not in README)
2. Run Mode commands (7 commands, not in README)
3. Subagent system (4 validators)
4. Constitution feature flags

### Recommendations
**Quick Fixes**:
1. Add CODEOWNERS file
2. Add v2.5.0 CHANGELOG entry
3. Update README physics diagram (5 layers not 3)

**Documentation**:
1. Create 09-sigil-voice.md rule file
2. Add Run Mode section to README
3. Document feature flags in constitution

### Files Updated/Created
- grimoires/loa/reality/code-inventory.md (updated)
- grimoires/loa/drift-report.md (created)
- grimoires/loa/governance-report.md (created)
- grimoires/loa/prd-v3-operational-infrastructure.md (updated with implementation status)
