# Sigil Repository

This is the Sigil framework repository — a design physics system for AI code generation.

## For Users Installing Sigil

When you install Sigil into your project, it uses `.claude/rules/` for its instructions.
**Your existing CLAUDE.md will NOT be modified.**

See: `.claude/rules/sigil-*.md` for the physics system.

## For Contributors

- `.claude/rules/` — Sigil physics instructions (auto-discovered by Claude Code)
- `grimoires/sigil/constitution.yaml` — Physics configuration
- `examples/` — Reference component implementations
- `.claude/scripts/mount-sigil.sh` — Installation script

## Quick Reference

| Effect | Sync | Timing | Confirmation |
|--------|------|--------|--------------|
| Financial | Pessimistic | 800ms | Required |
| Destructive | Pessimistic | 600ms | Required |
| Standard | Optimistic | 200ms | None |
| Local state | Immediate | 100ms | None |

Use `/craft "description"` to generate components with correct physics.
