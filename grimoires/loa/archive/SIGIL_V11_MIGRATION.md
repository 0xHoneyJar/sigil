# Sigil v11 "Pure Craft" Migration Plan

**From:** v10.1 "Usage Reality" (Hooks-based)
**To:** v11 "Pure Craft" (Prompt-only)
**Date:** 2026-01-11

---

## Executive Summary

Migrate from the complex hooks/scripts architecture to the simpler "Pure Craft" approach where:
- CLAUDE.md contains all physics knowledge (no external tools)
- constitution.yaml is the single source of truth
- Claude uses native tools (grep, read) instead of custom MCP tools/hooks

---

## Architecture Comparison

| Aspect | v10.1 (Current) | v11 (Target) |
|--------|-----------------|--------------|
| CLAUDE.md | 280 lines, references skills | 464 lines, self-contained physics |
| Tools | 6 bash scripts, 2 hooks | None (native Claude tools) |
| Skills | 3 directories (mason/gardener/diagnostician) | None (merged into CLAUDE.md) |
| Constitution | Split (constitution.yaml + authority.yaml) | Single comprehensive YAML |
| Complexity | Medium | Minimal |
| Examples | None | 4 reference components |

---

## Files to Change

### REPLACE
| Current File | New Content Source |
|--------------|-------------------|
| `CLAUDE.md` | `/tmp/sigil-craft/sigil-craft/.claude/CLAUDE.md` |
| `grimoires/sigil/constitution.yaml` | `/tmp/sigil-craft/sigil-craft/grimoires/sigil/constitution.yaml` |

### ADD
| New File | Source |
|----------|--------|
| `examples/components/ClaimButton.tsx` | sigil-craft.zip |
| `examples/components/DeleteButton.tsx` | sigil-craft.zip |
| `examples/components/LikeButton.tsx` | sigil-craft.zip |
| `examples/components/ThemeToggle.tsx` | sigil-craft.zip |
| `examples/README.md` | sigil-craft.zip |

### DEPRECATE (keep but mark as legacy)
| File | Reason |
|------|--------|
| `.claude/settings.local.json` | Hooks no longer needed |
| `.claude/scripts/sigil-init.sh` | SessionStart hook deprecated |
| `.claude/scripts/validate-physics.sh` | PreToolUse hook deprecated |
| `.claude/scripts/count-imports.sh` | Claude uses grep directly |
| `.claude/scripts/check-stability.sh` | Claude uses git log directly |
| `.claude/scripts/infer-authority.sh` | Claude infers from grep |
| `.claude/scripts/validate-v10.1.sh` | Version-specific |
| `.claude/skills/mason/` | Merged into CLAUDE.md |
| `.claude/skills/gardener/` | Merged into CLAUDE.md |
| `.claude/skills/diagnostician/` | Merged into CLAUDE.md |
| `grimoires/sigil/authority.yaml` | Merged into constitution.yaml |

### KEEP
| File | Reason |
|------|--------|
| `src/lib/sigil/*.ts` | Runtime library still useful |
| `src/hooks/useMotion.ts` | Physics hook implementation |
| `grimoires/sigil/.context/` | Context accumulation |
| `.claude/commands/craft.md` | Command definition (update agent reference) |

---

## Key Changes in v11 CLAUDE.md

1. **Self-Contained Physics Table** — Complete effect → physics mapping with timings
2. **Detection Rules** — Keywords and patterns for identifying effects
3. **Workflow Definition** — Parse → Physics → Search → Generate → Validate
4. **Complete Examples** — Financial button, toggle, delete with undo
5. **Validation Checklist** — What to verify before outputting
6. **No External Dependencies** — Uses grep/read instead of custom tools

---

## Key Changes in v11 constitution.yaml

1. **Comprehensive Effects** — 8 effect categories with full physics
2. **Built-in Authority** — Gold/Silver/Draft criteria in same file
3. **Protected Capabilities** — withdraw, cancel, balance, error_recovery
4. **Product Vocabulary** — claim, deposit, stake, swap, etc.
5. **Animation Presets** — deliberate, snappy, instant, fade
6. **Project Conventions** — Placeholder for discovered patterns

---

## Migration Steps

1. **Backup** — Archive current CLAUDE.md and constitution.yaml
2. **Apply CLAUDE.md** — Replace with v11 version
3. **Apply constitution.yaml** — Replace with comprehensive version
4. **Add examples** — Copy reference components
5. **Update /craft command** — Point to CLAUDE.md instead of skill
6. **Mark deprecated** — Add deprecation notices to old files
7. **Test** — Verify `/craft "claim button"` works correctly

---

## Rollback Plan

If migration fails:
1. Restore CLAUDE.md from backup
2. Restore constitution.yaml from backup
3. Remove examples directory
4. Hooks and scripts still work (not deleted)

---

## Success Criteria

| Test | Expected Result |
|------|-----------------|
| `/craft "claim button"` | Generates with 800ms pessimistic physics |
| `/craft "like button"` | Generates with 200ms optimistic physics |
| `/craft "dark mode toggle"` | Generates with 100ms immediate physics |
| No questions asked | Physics inferred automatically |

---

---

## Migration Status

**COMPLETED**: 2026-01-11

### Actions Taken

1. ✅ Backed up CLAUDE.md → CLAUDE.md.v10.1.bak
2. ✅ Backed up constitution.yaml → constitution.yaml.v10.1.bak
3. ✅ Applied v11 CLAUDE.md (464 lines, self-contained physics)
4. ✅ Applied v11 constitution.yaml (comprehensive with effects, authority, vocabulary)
5. ✅ Created examples/ directory with reference components
6. ✅ Moved deprecated scripts to .claude/deprecated/scripts/
7. ✅ Moved deprecated skills to .claude/deprecated/skills/
8. ✅ Removed hooks from settings.local.json

---

*Migration Plan Created: 2026-01-11*
*Migration Completed: 2026-01-11*
