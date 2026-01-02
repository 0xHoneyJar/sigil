# Consistency Analysis

> Generated: 2026-01-01
> Target: sigil

## Naming Patterns Detected

### Skill Directory Naming

| Pattern | Count | Examples | Consistency |
|---------|-------|----------|-------------|
| `sigil-{verb}ing` | 4 | sigil-setup, sigil-updating, sigil-envisioning, sigil-inheriting | Consistent (Sigil) |
| `{verb}ing-{noun}` | 10 | auditing-security, deploying-infrastructure, designing-architecture | Consistent (Loa) |

**Analysis**: Two clear naming conventions coexist:
- **Sigil skills**: `sigil-{action}` prefix
- **Loa skills**: `{verb}ing-{noun}` pattern (present participle)

### Command File Naming

| Pattern | Count | Examples |
|---------|-------|----------|
| `{verb}.md` | 12 | setup, update, inherit, envision, implement, translate |
| `{verb}-{noun}.md` | 8 | audit-sprint, audit-deployment, deploy-production, sprint-plan |
| `{noun}.md` | 1 | architect |

**Analysis**: Mixed patterns, but all use kebab-case consistently.

### Skill File Structure

| Component | Pattern | Consistency |
|-----------|---------|-------------|
| index.yaml | All 14 skills | 100% |
| SKILL.md | All 14 skills | 100% |
| scripts/ | 8 of 14 skills | 57% |
| resources/ | 10 of 14 skills (Loa only) | 71% |

**Analysis**: Loa skills have more structure (resources/, scripts/). Sigil skills are simpler.

## Consistency Score: 8/10

**Scoring Criteria:**
- 10: Single consistent pattern throughout
- 7-9: Minor deviations, clear dominant pattern
- 4-6: Mixed patterns, no clear standard
- 1-3: Inconsistent, multiple competing patterns

**Reasoning**:
- Clear separation between Sigil (sigil-*) and Loa naming conventions (+2)
- All skills have index.yaml + SKILL.md (+2)
- kebab-case used throughout (+2)
- Minor inconsistency in command naming patterns (-1)
- Resources directory presence varies (-1)

## Pattern Conflicts Detected

| Conflict | Examples | Impact |
|----------|----------|--------|
| Skill prefix | `sigil-setup` vs `auditing-security` | Low - intentional separation |
| Command verbs | `setup` vs `plan-and-analyze` | Low - both readable |
| Resource presence | Loa skills have resources/, Sigil don't | Medium - structural inconsistency |

## Sigil vs Loa Comparison

| Aspect | Sigil Pattern | Loa Pattern |
|--------|---------------|-------------|
| Skill naming | `sigil-{action}` | `{verb}ing-{noun}` |
| Skill structure | index.yaml, SKILL.md, scripts/ | index.yaml, SKILL.md, scripts/, resources/ |
| Resources | None | BIBLIOGRAPHY.md, REFERENCE.md, templates/ |
| Complexity | Simple | Enterprise-grade |

## Improvement Opportunities (Non-Breaking)

| Change | Type | Impact |
|--------|------|--------|
| Add resources/ to Sigil skills | Additive | Consistency with Loa structure |
| Document naming conventions | Additive | Onboarding clarity |

## Breaking Changes (Flag Only - DO NOT IMPLEMENT)

| Change | Why Breaking | Impact |
|--------|--------------|--------|
| Rename Sigil skills to Loa pattern | Would break existing symlinks | High |
| Rename Loa commands to Sigil pattern | Would break user muscle memory | High |

## Template Consistency

| Template | Location | Format |
|----------|----------|--------|
| moodboard.md | .claude/templates/ | Markdown with frontmatter |
| rules.md | .claude/templates/ | Markdown with tables |
| sigilrc.yaml | .claude/templates/ | YAML with comments |

**Verdict**: Templates are consistent in structure and format.

## Script Naming

| Pattern | Examples | Consistency |
|---------|----------|-------------|
| `{verb}-{noun}.sh` | detect-components.sh, infer-patterns.sh | Consistent |
| `{noun}.sh` | update.sh | Exception |

**Analysis**: kebab-case throughout, minor verb-first vs noun-first variation.
