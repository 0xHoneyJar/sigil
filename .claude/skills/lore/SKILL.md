---
name: lore
description: Slot external knowledge into Rune constructs
user-invocable: true
disable-model-invocation: true
allowed-tools:
  - Read
  - Write
  - Glob
  - Bash
---

# Lore

Slot external knowledge into Rune constructs.

## Usage

```bash
# Interactive mode
/lore

# With source
/lore --source "curl -s https://animations.dev/... | bash"
/lore --source ./local-patterns/
/lore --url https://example.com/guide.md

# Specify target construct
/lore --construct glyph
```

## Purpose

Add external expertise (courses, best practices, patterns) to enhance a Rune construct. Unlike continuous-learning (which captures organic discoveries), enhance imports curated external knowledge.

## Workflow

### Step 1: Acquire Source

Identify the knowledge source:

| Source Type | Example |
|-------------|---------|
| Curl installer | `curl -s https://example.com/skill \| bash` |
| Local directory | `./my-patterns/` |
| Single URL | `https://example.com/guide.md` |
| Git repo | `git clone https://github.com/user/patterns` |

### Step 2: Map to Construct

Determine which construct this knowledge enhances:

| If the knowledge is about... | Map to |
|------------------------------|--------|
| Animations, UI polish, components, forms | **Glyph** (craft) |
| User preferences, taste, feedback | **Sigil** (taste) |
| Security, data correctness, validation | **Rigor** (correctness) |
| Learning patterns, confidence | **Wyrd** (learning) |

### Step 3: Slot In

Install to `.claude/references/{source-name}/`:

```bash
mkdir -p .claude/references/{source-name}
# Copy/download content
```

### Step 4: Wire to Rules

Update relevant rules to reference the new knowledge:

```markdown
# In rules/glyph/05-glyph-animation.md

## External Reference

See `references/design-engineering/animations.md` for:
- Easing curve selection (ease-out for enters, ease-in-out for moves)
- Spring physics (stiffness 100-500, damping 10-40)
- Performance (transform + opacity only)
```

## Example: animations.dev

**Source**: Emil Kowalski's Design Engineering course

```bash
curl -s "https://animations.dev/api/activate-design-engineering?email=..." | bash
```

**Mapping**: -> Glyph (animation, material, practices)

**Installed to**: `.claude/references/design-engineering/`

**Files**:
- `SKILL.md` - Overview, quick reference, review checklist
- `animations.md` - Easing, timing, springs
- `ui-polish.md` - Typography, shadows, gradients
- `forms-controls.md` - Inputs, buttons, validation
- `touch-accessibility.md` - Mobile, keyboard, a11y
- `component-design.md` - Composition, compound components
- `marketing.md` - Landing pages, CTAs
- `performance.md` - Virtualization, preloading

**Wired to**:
- `rules/glyph/05-glyph-animation.md`
- `rules/glyph/06-glyph-material.md`
- `rules/glyph/07-glyph-practices.md`

## Reference Index

| Reference | Construct | Source | Version |
|-----------|-----------|--------|---------|
| `design-engineering/` | Glyph | animations.dev | 2026-01 |
| `ui-skills/` | Glyph | github.com/ibelick/ui-skills | 2026-01 |
| `rams/` | Glyph/Rigor | rams.ai | 2026-01 |
| `vercel-react/` | Glyph | vercel-labs/agent-skills | 2026-01 |
| `skill-creator/` | Meta | anthropics/skills | 2026-01 |

## Conflict Resolution

When external knowledge conflicts with existing rules:

1. **Physics table wins** - Core timing/sync from `01-glyph-physics.md` is authoritative
2. **External refines** - External knowledge provides implementation detail
3. **Note overrides** - If external contradicts, note in rules with rationale

Example:
```markdown
# rules/glyph/05-glyph-animation.md

## Timing

Physics table: 200ms for Standard effects.
Emil recommends: 150-250ms for user-initiated.

**Resolution**: Use 200ms (physics), within Emil's range.
```

## Updating References

When source releases updates:

```bash
# Re-fetch
/lore --source "curl -s https://..." --update

# Or manually
rm -rf .claude/references/{source}
# Re-install
```

Track version in reference SKILL.md frontmatter.
