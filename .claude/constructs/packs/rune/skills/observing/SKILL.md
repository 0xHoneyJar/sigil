---
name: observing
description: Capture taste observations for design preferences
user-invocable: true
disable-model-invocation: true
allowed-tools:
  - Read
  - Write
---

# Observing

The Sigil construct: taste capture and preference learning.

## Usage

```
/sigil "insight to record"
/sigil --status
```

## Philosophy

**Taste is personal physics.** When users modify generated code, they're tuning physics to their context. Sigil captures why.

- **Free-form over schema** — No YAML frontmatter, just markdown paragraphs
- **Append-only** — Never edit taste.md, only append
- **Human writes, Claude reads** — /sigil is for humans to record insights

## Workflow: Record (`/sigil "insight"`)

1. Format insight with timestamp header
2. Append to `grimoires/rune/taste.md`:
   ```markdown
   ## 2026-01-25 14:30

   They prefer 500ms for financial operations, not 800ms.
   Their users are power traders who find default timing sluggish.

   ---
   ```
3. Confirm: "Recorded taste observation."

## Workflow: Status (`/sigil --status`)

1. Read `grimoires/rune/taste.md`
2. Count entries by approximate tier:
   - Tier 1 (Observation): Single mention
   - Tier 2 (Pattern): Referenced 3+ times in generation
   - Tier 3 (Rule): Explicitly promoted
3. Display summary:
   ```
   ## Taste Status

   Total entries: 12
   - Tier 1 (Observations): 8
   - Tier 2 (Patterns): 3
   - Tier 3 (Rules): 1

   Recent entries:
   - 2026-01-25: Power user timing preference (500ms)
   - 2026-01-24: Springs over easing curves
   - 2026-01-23: No modals for confirmations
   ```

## Capture Sources

| Source | Trigger | Tier |
|--------|---------|------|
| Manual | `/sigil "insight"` | 1 (Observation) |
| Explicit rejection | User says "n" to hypothesis | 1 (Observation) |
| Implicit edit | User modifies generated code | 1 (Observation) |
| Pattern detection | 3+ similar rejections | 2 (Pattern) |
| User promotion | `/sigil promote <id>` | 3 (Rule) |

## Maturity Tiers

| Tier | Name | Application | Confidence Boost |
|------|------|-------------|------------------|
| 1 | Observation | Applied with note | +0.00 |
| 2 | Pattern | Applied with confidence | +0.05 |
| 3 | Rule | Applied always | +0.10 |

## Workflow: Promote (`/sigil promote <id>`)

Promote a pattern to a rule:

```
/sigil promote pattern-1706234567890

Promoting "Financial Timing" pattern to Rule.

This will:
- Always apply 500ms for Financial effects
- Override physics table default
- No longer ask for confirmation

Confirm? [y/n]
```

## Integration with Glyph

When `/glyph` runs, it reads `taste.md` and applies:

| Pattern | Action |
|---------|--------|
| Timing preferences | Adjust default physics timings |
| Animation preferences | Use preferred easing/springs |
| Component patterns | Follow established structure |
| Explicit corrections | Apply as hard rules |

Glyph notes when taste is applied:
```
Timing: 500ms (taste: power user preference, Tier 2)
Confidence: 0.90 (+0.05 from Tier 2 match)
```

## Rules Loaded

- `rules/sigil/00-sigil-core.md` - Philosophy
- `rules/sigil/01-sigil-taste.md` - Reading and applying taste
- `rules/sigil/02-sigil-capture.md` - Capture protocol
- `rules/sigil/03-sigil-maturity.md` - Tier system

## State File

`grimoires/rune/taste.md` — Append-only markdown
