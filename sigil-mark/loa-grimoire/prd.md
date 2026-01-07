# PRD: Sigil Moodboard Collection System

**Version:** v3.1.0
**Codename:** "Taste Memory"
**Date:** 2026-01-06
**Status:** Draft

---

## 1. Problem Statement

Currently, Sigil provides structured design guidance through Vocabulary, Philosophy, and Personas, but lacks a place to **collect and reference design inspiration** — screenshots, articles, product references, and taste artifacts that inform design decisions.

Designers and product teams naturally collect inspiration from various sources:
- Screenshots of UI patterns they admire
- Articles about design philosophy
- Product references that embody desired feel
- Anti-patterns to avoid
- GTM messaging and tone examples

This inspiration currently has nowhere to live within Sigil, forcing teams to maintain separate Notion pages, Figma files, or scattered bookmarks that aren't accessible to the agent during `/craft` sessions.

---

## 2. Vision

> "Your taste, versioned and queryable."

The Moodboard system transforms scattered inspiration into structured design context that the agent can reference during code generation. Like a designer's personal swipe file, but machine-readable.

---

## 3. Goals & Success Metrics

### Goals

1. **Collection**: Easy to drop in inspiration artifacts (images, markdown, links)
2. **Organization**: Lightweight structure that doesn't require curation overhead
3. **Queryability**: Agent can find relevant inspiration during `/craft`
4. **Synthesis**: Support for markdown summaries that distill learnings

### Success Metrics

| Metric | Target |
|--------|--------|
| Time to add inspiration | < 30 seconds |
| Agent finds relevant inspiration | 80% of `/craft` sessions |
| User satisfaction with suggestions | Qualitative feedback |

---

## 4. User Stories

### US-1: Designer Drops Screenshot
> As a designer, I want to drop a screenshot into a folder and have it inform future design decisions, without writing metadata.

**Acceptance Criteria:**
- Drop image into `sigil-mark/moodboard/screenshots/`
- Filename can be descriptive (e.g., `stripe-checkout-confirmation.png`)
- Agent references during relevant `/craft` sessions

### US-2: PM Adds Article Synthesis
> As a PM, I want to capture key insights from a design article as markdown, tagged with what it applies to.

**Acceptance Criteria:**
- Create markdown file in `sigil-mark/moodboard/articles/`
- Frontmatter supports optional tags (`zones`, `materials`, `terms`)
- Agent can query by tag

### US-3: Team Captures Anti-Pattern
> As a team, we want to document patterns to avoid, with clear reasoning.

**Acceptance Criteria:**
- `sigil-mark/moodboard/anti-patterns/` directory
- Markdown files with pattern name, why to avoid, what to do instead

### US-4: Agent References Moodboard During Craft
> As an agent running `/craft`, I want to surface relevant inspiration from the moodboard.

**Acceptance Criteria:**
- Agent reads moodboard index during `/craft`
- Surfaces 1-3 relevant references based on zone/term/material
- Includes image paths or article excerpts in guidance

---

## 5. Proposed Structure

```
sigil-mark/moodboard/
├── index.yaml              # Optional: curated highlights, featured refs
├── README.md               # Instructions for adding to moodboard
│
├── references/             # Product/app inspiration
│   ├── stripe/
│   │   ├── checkout-flow.md
│   │   └── confirmation-animation.gif
│   ├── linear/
│   │   ├── keyboard-navigation.md
│   │   └── command-palette.png
│   └── vercel/
│       └── deploy-button.md
│
├── screenshots/            # Quick drops, unorganized
│   ├── interesting-toast-pattern.png
│   └── hover-state-i-liked.png
│
├── articles/               # Synthesized learnings
│   ├── motion-design-principles.md
│   ├── why-we-chose-deliberate-animations.md
│   └── stripe-design-philosophy.md
│
├── anti-patterns/          # What to avoid
│   ├── spinner-anxiety.md
│   └── modal-fatigue.md
│
└── gtm/                    # Brand voice, messaging
    ├── tone-of-voice.md
    ├── tagline-evolution.md
    └── competitor-positioning.md
```

---

## 6. File Formats

### Reference Markdown (Optional Frontmatter)

```markdown
---
source: "Stripe"
url: "https://stripe.com/checkout"
zones: [critical]
materials: [decisive]
terms: [deposit, withdraw]
captured: 2026-01-06
---

# Stripe Checkout Flow

## What I Love
- Deliberate motion on confirmation
- Clear visual hierarchy
- Trust indicators placed prominently

## Key Pattern
The confirmation animation is ~800ms, giving weight to the action.

## Screenshot
![Confirmation](./checkout-confirmation.gif)
```

### Anti-Pattern Markdown

```markdown
---
severity: high
zones: [critical]
---

# Spinner Anxiety

## The Pattern
Loading spinners during financial transactions.

## Why to Avoid
- Creates uncertainty ("Is it working?")
- No sense of progress
- Users may rage-click, causing duplicate transactions

## What to Do Instead
1. Skeleton loading with deliberate reveal
2. Progress indicators with copy ("Confirming transaction...")
3. Immediate optimistic UI with server reconciliation
```

### Index YAML (Optional)

```yaml
# sigil-mark/moodboard/index.yaml
version: "1.0"

featured:
  - path: references/stripe/checkout-flow.md
    why: "Gold standard for financial confirmation"

  - path: anti-patterns/spinner-anxiety.md
    why: "Core principle we never violate"

tags:
  deliberate_motion:
    - references/stripe/confirmation-animation.gif
    - articles/why-we-chose-deliberate-animations.md

  keyboard_first:
    - references/linear/keyboard-navigation.md
    - references/linear/command-palette.png
```

---

## 7. Agent Integration

### During `/craft`

1. Agent reads `sigil-mark/moodboard/index.yaml` (if exists)
2. Scans relevant directories based on current zone/term
3. Includes 1-3 relevant references in guidance:

```
Based on your moodboard:
- See references/stripe/checkout-flow.md for confirmation pattern
- Avoid: anti-patterns/spinner-anxiety.md

The Stripe pattern uses ~800ms deliberate motion.
Your current zone (critical) aligns with this approach.
```

### During `/envision`

Agent can ask: "Drop any inspiration screenshots into `sigil-mark/moodboard/screenshots/` — I'll reference them when providing guidance."

---

## 8. Implementation Approach

### Phase 1: Structure Only (No Code)
- Create directory structure
- Add README.md with instructions
- Document in CLAUDE.md

### Phase 2: Moodboard Reader (Agent-Only)
- `process/moodboard-reader.ts` — Reads and indexes moodboard
- Scans directories, parses frontmatter
- Returns queryable structure

### Phase 3: Integration
- Update `/craft` skill to reference moodboard
- Update `/envision` to prompt for inspiration collection

---

## 9. Out of Scope (v3.1)

- Automatic screenshot capture from URLs
- Image analysis/description generation
- Sync with external tools (Figma, Notion)
- Version control for moodboard changes

---

## 10. Open Questions

1. **Image handling**: Should agent attempt to describe images, or just reference paths?
2. **Curation overhead**: Is optional frontmatter enough, or do we need auto-tagging?
3. **Size limits**: How many screenshots before we need better organization?

---

## 11. Dependencies

- Sigil v3.0 (current) — Process layer reader pattern
- No external dependencies

---

## 12. Risks

| Risk | Mitigation |
|------|------------|
| Moodboard becomes dumping ground | README with organization guidance |
| Agent overwhelmed by too many refs | Index.yaml for curated highlights |
| Images not queryable | Frontmatter + descriptive filenames |

---

*PRD Author: Claude*
*Date: 2026-01-06*
