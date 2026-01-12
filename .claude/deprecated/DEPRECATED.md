# Deprecated v10.1 Components

**Deprecated**: 2026-01-11
**Reason**: Migrated to v11 "Pure Craft" architecture

## What Changed

v11 "Pure Craft" eliminates custom tools, hooks, and scripts in favor of a simpler prompt-only approach:

- **CLAUDE.md** now contains all physics knowledge (no external tools)
- **constitution.yaml** is the single source of truth
- Claude uses native tools (`grep`, `read`) instead of custom MCP tools/hooks

## Deprecated Scripts

| Script | v11 Replacement |
|--------|-----------------|
| `sigil-init.sh` | No longer needed - no SessionStart hook |
| `validate-physics.sh` | No longer needed - no PreToolUse hook |
| `count-imports.sh` | Claude uses `grep` directly |
| `check-stability.sh` | Claude uses `git log` directly |
| `infer-authority.sh` | Claude infers from `grep` |
| `validate-v10.1.sh` | Version-specific, obsolete |

## Deprecated Skills

| Skill | v11 Replacement |
|-------|-----------------|
| `mason/` | Merged into CLAUDE.md |
| `gardener/` | Merged into CLAUDE.md |
| `diagnostician/` | Merged into CLAUDE.md |

## Rollback

If you need to restore v10.1 functionality:

1. Move scripts back to `.claude/scripts/`
2. Move skills back to `.claude/skills/`
3. Restore CLAUDE.md from `CLAUDE.md.v10.1.bak`
4. Restore constitution.yaml from `constitution.yaml.v10.1.bak`

## Why Simpler is Better

- **No maintenance** — No tools to update when APIs change
- **No build step** — Copy files and go
- **Portable** — Works in any Claude Code environment
- **Debuggable** — Everything is visible in the prompt
- **Extensible** — Edit YAML, not TypeScript
