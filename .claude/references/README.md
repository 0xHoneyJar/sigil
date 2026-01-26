# References

External knowledge sources slotted into Rune constructs.

## Structure

```
references/
├── design-engineering/    # Emil Kowalski's animations.dev
├── ui-skills/             # ibelick/ui-skills collection
├── rams/                  # Rams design review checks
└── {future-sources}/
```

## Installed References

| Reference | Construct | Source | Content |
|-----------|-----------|--------|---------|
| `design-engineering/` | **Glyph** | animations.dev | Animation, UI polish, forms, accessibility |
| `ui-skills/` | **Glyph** | github.com/ibelick/ui-skills | UI baseline, motion perf, a11y, metadata |
| `rams/` | **Glyph/Rigor** | rams.ai | A11y review, visual design checks |

## Mapping to Constructs

| If content is about... | Maps to |
|------------------------|---------|
| Animation, UI, components, forms | **Glyph** |
| Security, data correctness | **Rigor** |
| User preferences, taste | **Sigil** |
| Learning, confidence | **Wyrd** |

## Adding References

Use `/enhance` to add new knowledge sources:

```bash
# From curl installer
curl -fsSL https://rams.ai/install | bash

# From npx
npx skills add ibelick/ui-skills

# Manual fetch
curl -sL https://example.com/skill.md -o .claude/references/{source}/SKILL.md
```

## How Rules Reference Knowledge

Rules in `.claude/rules/{construct}/` reference this knowledge:

```markdown
# In rules/glyph/05-glyph-animation.md

See `references/design-engineering/animations.md` for:
- Easing curve selection
- Spring physics parameters

See `references/ui-skills/baseline-ui.md` for:
- Stack requirements (Tailwind, motion/react)
- Component primitives (Base UI, Radix)
```

## Quality Standards

References must:
1. **Be attributable** — Clear source/author
2. **Be relevant** — Map to a specific construct
3. **Not conflict** — Align with existing rules or note overrides
4. **Be versioned** — Track source version for updates
