# Three-Way Drift Report

> Generated: 2026-01-01
> Target: sigil (Design Context Framework v2.0.0)

## Truth Hierarchy Reminder

```
CODE wins every conflict. Always.
```

## Summary

| Category | Code Reality | Legacy Docs | User Context | Aligned |
|----------|--------------|-------------|--------------|---------|
| Commands | 4 Sigil-native + 16 Loa | "7 commands" | "Being finished" | 0% |
| Skills | 4 Sigil + 10 Loa | "7 skills" | - | 0% |
| License | AGPL v3 | "MIT" in README | - | 50% |
| Version | 2.0.0 | 2.0.0 | - | 100% |

## Drift Score: 35% (lower is better)

## Drift Breakdown by Type

| Type | Count | Impact Level |
|------|-------|--------------|
| Missing (code exists, no docs) | 0 | - |
| Stale (docs outdated) | 3 | High |
| Hallucinated (docs claim non-existent) | 3 | Critical |
| Ghost (feature never existed) | 3 | Critical |
| Shadow (undocumented code) | 0 | - |

## Critical Drift Items

### Hallucinated Documentation (CRITICAL)

**These claims in legacy docs are NOT supported by code:**

| Claim | Source Doc | Verification Attempt | Verdict |
|-------|------------|---------------------|---------|
| "/codify command" | README:54, CLAUDE.md:24 | `find .claude/commands -name "codify*"` = 0 results | GHOST |
| "/craft command" | README:55, CLAUDE.md:25 | `find .claude/commands -name "craft*"` = 0 results | GHOST |
| "/approve command" | README:56, CLAUDE.md:26 | `find .claude/commands -name "approve*"` = 0 results | GHOST |

### Stale Documentation (HIGH)

**These docs exist but reality has changed:**

| Doc Claim | Source | Code Reality | Drift Type |
|-----------|--------|--------------|------------|
| "MIT License" | README:143 | LICENSE.md shows AGPL v3 | STALE |
| "7 commands available" | README:49 | 4 Sigil + 16 Loa commands | STALE |
| "7 skills" | CLAUDE.md:157 | 4 Sigil + 10 Loa skills | STALE |

### Ghost Features (Documented but Missing)

| Item | Claimed By | Evidence Searched | Verdict |
|------|------------|-------------------|---------|
| /codify | README, CLAUDE.md | Glob .claude/commands/codify* = 0 | GHOST |
| /craft | README, CLAUDE.md | Glob .claude/commands/craft* = 0 | GHOST |
| /approve | README, CLAUDE.md | Glob .claude/commands/approve* = 0 | GHOST |
| sigil-codifying skill | CLAUDE.md | Glob .claude/skills/sigil-codifying = 0 | GHOST |
| sigil-crafting skill | CLAUDE.md | Glob .claude/skills/sigil-crafting = 0 | GHOST |
| sigil-approving skill | CLAUDE.md | Glob .claude/skills/sigil-approving = 0 | GHOST |

### Conflicts (Context + Docs disagree with Code)

| Claim | Sources | Code Reality | Confidence |
|-------|---------|--------------|------------|
| "7 commands" | README, CLAUDE.md | 4 Sigil + 16 Loa hybrid | HIGH |
| "MIT license" | README | AGPL v3 in LICENSE.md | HIGH |

## Verification Evidence

### Search Commands Executed

| Claim Searched | Command | Result |
|----------------|---------|--------|
| codify command | `find .claude/commands -name "codify*"` | 0 matches |
| craft command | `find .claude/commands -name "craft*"` | 0 matches |
| approve command | `find .claude/commands -name "approve*"` | 0 matches |
| sigil-codifying | `find .claude/skills -name "sigil-codifying*"` | 0 matches |
| sigil-crafting | `find .claude/skills -name "sigil-crafting*"` | 0 matches |
| sigil-approving | `find .claude/skills -name "sigil-approving*"` | 0 matches |

## What EXISTS in Code

### Sigil-Native Commands (Implemented)
1. `/setup` - Initialize Sigil (.claude/commands/setup.md)
2. `/envision` - Capture moodboard (.claude/commands/envision.md)
3. `/inherit` - Bootstrap from codebase (.claude/commands/inherit.md)
4. `/update` - Pull updates (.claude/commands/update.md)

### Sigil-Native Skills (Implemented)
1. `sigil-setup` - Setup workflow
2. `sigil-updating` - Update workflow
3. `sigil-envisioning` - Moodboard capture
4. `sigil-inheriting` - Pattern inference

### Loa Commands (Inherited via loa-upstream)
- /architect, /audit, /audit-deployment, /audit-sprint
- /contribute, /deploy-production, /feedback, /implement
- /mcp-config, /mount, /plan-and-analyze, /review-sprint
- /ride, /sprint-plan, /translate, /translate-ride

## Recommendations

### Immediate Actions (Ghost Features)

1. **EITHER** Implement missing commands:
   - Create `/codify` command + sigil-codifying skill
   - Create `/craft` command + sigil-crafting skill
   - Create `/approve` command + sigil-approving skill

2. **OR** Update documentation to reflect reality:
   - Update README.md command table
   - Update CLAUDE.md command list
   - Add "(Coming Soon)" markers for planned features

### Documentation Fixes (Stale)

1. **Fix license in README.md**: Change "MIT" to "AGPL v3"
2. **Update command count**: Clarify Sigil vs Loa commands
3. **Update skill count**: Clarify Sigil vs Loa skills

### Workflow Gap Analysis

| Documented Workflow | Status | Missing Piece |
|---------------------|--------|---------------|
| `/setup` → `/envision` → `/codify` | Partial | /codify missing |
| `/codify` → (build) → `/craft` | Broken | /codify, /craft missing |
| `/craft` → `/approve` | Broken | /craft, /approve missing |
| `/setup` → `/inherit` → `/envision` | Works | All pieces exist |

## User Context Integration

From interview:
- "Being finished now" - Confirms WIP status
- "Designer-agent collaboration" - Core vision
- "Component graduation system" - Planned feature

**Assessment**: Documentation reflects v2.0 vision, code reflects partial implementation. This is expected for WIP status.
