# PRD: Sigil/Loa Command Consolidation

**Version:** 1.0
**Date:** 2026-01-09
**Status:** DRAFT

---

## 1. Problem Statement

The Sigil framework has accumulated **39 commands** and **49 skills** (88 total entry points) over 6+ major versions. This creates:

1. **Cognitive overload** — Users don't know which command to use
2. **Maintenance burden** — Many commands are outdated or redundant
3. **Inconsistent behavior** — Some commands reference deprecated concepts
4. **Version drift** — Commands reference v1.2.4, v2.0, v4.0, v5.0, v6.0 concepts

### Evidence

| Metric | Count | Issue |
|--------|-------|-------|
| Commands | 39 | Too many to remember |
| Skills | 49 | Many orphaned or internal-only |
| Deprecated commands | 5+ | Still in codebase |
| Version references | 6 | v1.2.4, v2.0, v4.0, v5.0, v6.0, v6.1 |

---

## 2. Goals & Success Metrics

### Primary Goals

1. **Reduce command count** — From 39 to ~15 essential commands
2. **Clarify skill purpose** — Internal vs user-invocable
3. **Align with v6.1** — All commands reference current architecture
4. **Separate Loa from Sigil** — Clear ownership of each command

### Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Sigil commands | 39 | 10-12 |
| User-facing skills | ~20 | 0 (all via commands) |
| Internal skills | ~29 | 15-20 |
| Version references | 6 | 1 (v6.1) |
| Commands in CLAUDE.md | 8 | All essential |

---

## 3. Command Audit Results

### Category 1: KEEP (Core Sigil v6.1)

These commands are documented in CLAUDE.md and actively used:

| Command | Skill | Purpose | Keep |
|---------|-------|---------|------|
| `/craft` | crafting-guidance | Design guidance | ✅ |
| `/garden` | gardening-entropy | Pattern gardening | ✅ |
| `/audit` | auditing-cohesion | Visual consistency | ✅ |
| `/approve` | approving-patterns | Canonical promotion | ✅ |
| `/reset-seed` | seeding-sanctuary | Virtual Sanctuary reset | ✅ |

**5 commands** — These form the v6.1 core.

### Category 2: KEEP (Loa Framework)

These are Loa workflow commands, not Sigil design commands:

| Command | Purpose | Owner |
|---------|---------|-------|
| `/plan-and-analyze` | PRD discovery | Loa |
| `/architect` | SDD creation | Loa |
| `/sprint-plan` | Sprint planning | Loa |
| `/implement` | Task implementation | Loa |
| `/review-sprint` | Code review | Loa |
| `/audit-sprint` | Security audit | Loa |
| `/ride` | Codebase analysis | Loa |
| `/setup` | Loa initialization | Loa |
| `/mount` | Framework mounting | Loa |
| `/feedback` | Issue submission | Loa |

**10 commands** — Move to separate Loa namespace or keep as-is.

### Category 3: DEPRECATED (Remove)

These commands reference deprecated concepts or have been superseded:

| Command | Version | Reason | Action |
|---------|---------|--------|--------|
| `/forge` | v6.0 | Replaced by optimistic divergence | DELETE |
| `/zone` | v0.5 | Deprecated, redirects to /map | DELETE |
| `/sandbox` | v1.2.4 | Old experimentation mode | DELETE |
| `/material` | v4.0 | Not used in v6.x | DELETE |
| `/validate` | v2.0 | Superseded by validating-physics hook | DELETE |
| `/greenlight` | v1.2.4 | Old approval workflow | DELETE |
| `/sync` | Unknown | Not documented | DELETE |

**7 commands** — Mark as deprecated, then remove.

### Category 4: CONSOLIDATE (Merge or Simplify)

These commands overlap or could be merged:

| Commands | Issue | Proposal |
|----------|-------|----------|
| `/envision`, `/codify` | Both create design rules | Merge into `/codify` |
| `/map` | Overlaps with zone detection | Consider removing |
| `/consult`, `/unlock` | Decision management | Keep /consult, remove /unlock |
| `/translate`, `/translate-ride` | Similar purpose | Keep /translate only |
| `/prove`, `/graduate` | Feature lifecycle | Review necessity |

**~8 commands** — Consolidate to ~3-4.

### Category 5: UNCERTAIN (Review Needed)

| Command | Notes |
|---------|-------|
| `/canonize` | Canon of Flaws — still relevant? |
| `/inherit` | Design inheritance — still used? |
| `/contribute` | PR workflow — Loa or Sigil? |
| `/mcp-config` | MCP setup — one-time use |
| `/sigil-setup` | Initial setup — merge with /setup? |
| `/deploy-production` | Deployment — Loa concern |
| `/audit-deployment` | Deployment audit — Loa concern |
| `/update` | Framework update — Loa concern |

**8 commands** — Need stakeholder input.

---

## 4. Skill Audit Results

### Category A: KEEP (Hook-Triggered)

These run automatically via Claude hooks:

| Skill | Trigger | Purpose |
|-------|---------|---------|
| validating-physics | PreToolUse | Physics validation |
| observing-survival | PostToolUse | Pattern tracking |
| chronicling-rationale | Stop | Craft log |
| graphing-imports | Startup | Dependency scan |

**4 skills** — Essential for v6.1 lifecycle.

### Category B: KEEP (Internal)

These are used internally by commands/other skills:

| Skill | Used By | Purpose |
|-------|---------|---------|
| scanning-sanctuary | /craft | Component discovery |
| querying-workshop | /craft | Index queries |
| seeding-sanctuary | /reset-seed | Virtual Sanctuary |
| managing-eras | /new-era | Era transitions |
| auditing-cohesion | /audit | Visual checks |
| approving-patterns | /approve | Pattern promotion |

**6 skills** — Keep as internal implementation.

### Category C: DEPRECATED (Remove)

| Skill | Reason |
|-------|--------|
| forging-patterns | /forge deprecated |
| codifying-recipes | v1.2.4 concept |
| codifying-materials | v4.0 concept |
| validating-fidelity | Merged into validating-physics |
| validating-lenses | v2.0 concept |
| mapping-zones | Path-based detection deprecated |
| greenlighting-concepts | Old workflow |

**7 skills** — Remove with deprecated commands.

### Category D: LOA SKILLS (Move or Keep)

| Skill | Owner |
|-------|-------|
| discovering-requirements | Loa |
| designing-architecture | Loa |
| planning-sprints | Loa |
| implementing-tasks | Loa |
| reviewing-code | Loa |
| auditing-security | Loa |
| riding-codebase | Loa |

**7 skills** — Loa framework, not Sigil.

---

## 5. Proposed Final Structure

### Sigil Commands (10)

| Command | Purpose |
|---------|---------|
| `/craft` | Design guidance with workshop |
| `/garden` | Pattern gardening and health |
| `/audit` | Visual consistency check |
| `/approve` | Promote canonical-candidate |
| `/reset-seed` | Restore Virtual Sanctuary |
| `/new-era` | Era transition |
| `/envision` | Create moodboard |
| `/codify` | Extract rules from code |
| `/consult` | Decision management |
| `/sigil-setup` | Initialize Sigil |

### Loa Commands (10)

| Command | Purpose |
|---------|---------|
| `/setup` | Initialize Loa |
| `/plan-and-analyze` | PRD discovery |
| `/architect` | SDD creation |
| `/sprint-plan` | Sprint planning |
| `/implement` | Task implementation |
| `/review-sprint` | Code review |
| `/audit-sprint` | Security audit |
| `/ride` | Codebase analysis |
| `/mount` | Framework mounting |
| `/feedback` | Issue submission |

### Sigil Skills (Internal Only)

| Skill | Trigger |
|-------|---------|
| validating-physics | PreToolUse hook |
| observing-survival | PostToolUse hook |
| chronicling-rationale | Stop hook |
| graphing-imports | Startup |
| scanning-sanctuary | Internal |
| querying-workshop | Internal |
| seeding-sanctuary | Internal |
| managing-eras | Internal |
| auditing-cohesion | Internal |
| approving-patterns | Internal |
| crafting-guidance | /craft |
| gardening-entropy | /garden |

**12 skills** — All internal, no direct user invocation.

---

## 6. Migration Plan

### Phase 1: Deprecation (Sprint 1)

1. Add `deprecated: true` to 7 command files
2. Add deprecation warning to skill files
3. Update CLAUDE.md with deprecation notices
4. Create deprecation-guide.md

### Phase 2: Removal (Sprint 2)

1. Delete deprecated command files
2. Delete deprecated skill directories
3. Update CLAUDE.md to final list
4. Update settings.json skill list

### Phase 3: Documentation (Sprint 3)

1. Update all remaining commands to v6.1
2. Consolidate version references
3. Create command reference guide
4. Update README with current commands

---

## 7. Risks & Dependencies

| Risk | Impact | Mitigation |
|------|--------|------------|
| Users rely on deprecated commands | High | Deprecation warnings first |
| Breaking existing workflows | Medium | Phase out gradually |
| Missing useful functionality | Medium | Audit before removal |
| Documentation drift | Low | Update docs in same sprint |

---

## 8. Out of Scope

- Loa/Sigil separation into different repos
- Renaming commands (except for consolidation)
- New command features
- Skill rewrite/refactoring

---

## 9. Decision Points

### Q1: Should Loa commands move to separate namespace?

Options:
- A) Keep as-is (both in .claude/commands/)
- B) Add prefix (/loa-implement, /sigil-craft)
- C) Separate directories

**Recommendation:** A — Keep as-is, document ownership in each file.

### Q2: What to do with /validate?

Options:
- A) Keep as manual validation
- B) Merge into /garden
- C) Delete (hook handles it)

**Recommendation:** C — validating-physics hook handles all validation.

### Q3: Should skills be user-invocable?

Options:
- A) All internal (via commands only)
- B) Some user-invocable
- C) All user-invocable

**Recommendation:** A — Commands are the user interface, skills are implementation.

---

## 10. Next Steps

1. **Review this PRD** — Get stakeholder approval
2. **Run /architect** — Create technical design for consolidation
3. **Run /sprint-plan** — Break into implementation sprints
4. **Execute** — Implement in 3 sprints

---

*PRD generated from /plan-and-analyze on 2026-01-09*
