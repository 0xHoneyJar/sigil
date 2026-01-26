---
name: ui-skills
description: UI quality enforcement skills from ibelick/ui-skills. Prevents AI-generated interface slop.
source: https://github.com/ibelick/ui-skills
version: 2026-01
construct: glyph
---

# UI Skills Reference

Collection of UI quality enforcement skills. Prevents AI-generated interface slop.

## Skills

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| [baseline-ui](baseline-ui.md) | Opinionated UI constraints | Any UI work |
| [fixing-accessibility](fixing-accessibility.md) | A11y issue fixes | Accessibility review |
| [fixing-motion-performance](fixing-motion-performance.md) | Animation performance | Motion/animation work |
| [fixing-metadata](fixing-metadata.md) | SEO/metadata fixes | Pages, metadata |

## Key Constraints (from baseline-ui)

### Stack
- Use Tailwind CSS defaults
- Use `motion/react` for JS animations
- Use `cn` utility (clsx + tailwind-merge)

### Components
- Use accessible primitives (Base UI, React Aria, Radix)
- Never rebuild keyboard/focus behavior by hand
- Add `aria-label` to icon-only buttons

### Animation
- Never add animation unless explicitly requested
- Only animate compositor props (transform, opacity)
- Never animate layout properties

### Interaction
- Use AlertDialog for destructive actions
- Use structural skeletons for loading
- Never use `h-screen`, use `h-dvh`
- Respect `safe-area-inset` for fixed elements

## Integration with Glyph

These skills complement Glyph rules:
- `baseline-ui.md` → `rules/glyph/07-glyph-practices.md`
- `fixing-accessibility.md` → `rules/glyph/03-glyph-protected.md`
- `fixing-motion-performance.md` → `rules/glyph/05-glyph-animation.md`
