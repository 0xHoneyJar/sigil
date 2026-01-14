# Sigil Repository

This is the Sigil framework repository — design physics for AI code generation.

## For Users Installing Sigil

When you install Sigil into your project, it uses `.claude/rules/` for its instructions.
**Your existing CLAUDE.md will NOT be modified.**

See: `.claude/rules/sigil-*.md` for the physics system.

## For Contributors

- `.claude/rules/` — Sigil instructions (auto-discovered by Claude Code)
- `.claude/commands/` — /craft command
- `grimoires/sigil/` — Taste log and configuration
- `examples/` — Reference component implementations

## Design Physics

Physics is everything that determines feel — three layers, unified.

### Behavioral

| Effect | Sync | Timing | Confirmation |
|--------|------|--------|--------------|
| Financial | Pessimistic | 800ms | Required |
| Destructive | Pessimistic | 600ms | Required |
| Standard | Optimistic | 200ms | None |
| Local state | Immediate | 100ms | None |

### Animation

| Effect | Easing | Spring | Interruptible |
|--------|--------|--------|---------------|
| Financial | ease-out | — | No |
| Standard | spring | 500, 30 | Yes |
| Local | spring | 700, 35 | Yes |
| High-freq | none | — | — |

### Material

| Surface | Shadow | Border | Radius | Grit |
|---------|--------|--------|--------|------|
| Elevated | soft | subtle | 8-12px | Clean |
| Glass | lg + blur | white/20 | 12-16px | Clean |
| Flat | none | optional | 4-8px | Clean |
| Retro | hard | solid 2px | 0px | Pixel |

## Command

`/craft "description"` — Generate components with unified physics (behavioral + animation + material)

## Taste

Accumulated preferences across all three physics layers. Corrections weight 5x.
