# References

External knowledge sources slotted into Rune constructs.

## Structure

```
references/
├── design-engineering/    # Emil Kowalski's animations.dev course
│   ├── SKILL.md          # Overview and quick reference
│   ├── animations.md     # Easing, timing, springs
│   ├── component-design.md
│   ├── forms-controls.md
│   ├── marketing.md
│   ├── performance.md
│   ├── touch-accessibility.md
│   └── ui-polish.md
└── {future-sources}/     # Additional knowledge sources
```

## Mapping to Constructs

| Reference | Construct | Enhances |
|-----------|-----------|----------|
| `design-engineering/` | **Glyph** | Animation, material, practices |
| `web3-security/` | **Rigor** | Security patterns (future) |
| `user-research/` | **Sigil** | Taste capture (future) |

## Adding References

Use `/enhance` to add new knowledge sources:

```bash
# From curl installer
/enhance --source "curl -s https://example.com/skill | bash" --construct glyph

# From local directory
/enhance --source ./my-patterns/ --construct rigor

# From URL
/enhance --url https://example.com/patterns.md --construct sigil
```

## How Rules Reference Knowledge

Rules in `.claude/rules/{construct}/` can reference this knowledge:

```markdown
# In rules/glyph/05-glyph-animation.md

See `references/design-engineering/animations.md` for:
- Easing curve selection
- Spring physics parameters
- Performance optimization
```

## Quality Standards

References must:
1. **Be attributable** — Clear source/author
2. **Be relevant** — Map to a specific construct
3. **Not conflict** — Align with existing rules or note overrides
4. **Be versioned** — Track source version for updates
