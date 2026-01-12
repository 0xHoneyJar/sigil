# Sigil Moodboard

> "Your taste, versioned and queryable."

Drop design inspiration here. The agent references it during `/craft`.

## Artifact Model

Moodboard content follows the Sigil artifact model:

| Category | Path | Tracked | Purpose |
|----------|------|---------|---------|
| **Curated** | `references/`, `articles/`, `anti-patterns/` | Yes | Team taste, proven patterns |
| **Sandbox** | `sandbox/` | No | Local experimentation |
| **Raw Assets** | `*.png`, `*.gif`, etc. | No | Unprocessed images |

### Mental Model

```
┌─────────────────────────────────────────────────────────────┐
│                    SIGIL MOODBOARD                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  sandbox/          →  YOUR experimentation (gitignored)     │
│       ↓                                                     │
│  [curate]          →  Process, document, tag                │
│       ↓                                                     │
│  references/       →  TEAM taste (tracked)                  │
│  articles/                                                  │
│  anti-patterns/                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Workflow**: Drop raw assets in `sandbox/`. When valuable, curate to `references/` with markdown documentation. Delete the sandbox original.

## Directory Structure

```
moodboard/
├── sandbox/          # Local experimentation (gitignored)
│   └── README.md
│
├── references/       # Product/app inspiration (organize by source)
│   └── stripe/
│       ├── checkout-flow.md
│       └── confirmation.gif
│
├── articles/         # Synthesized learnings from design articles
│
├── anti-patterns/    # Patterns to avoid (with reasoning)
│
├── gtm/              # Brand voice, messaging, tone
│
├── screenshots/      # Quick drops (unorganized is fine)
│
└── index.yaml        # Optional: curated highlights
```

## Adding Inspiration

### Quick Drop (No Metadata)

Just drop files into the appropriate folder:
- Screenshots → `screenshots/`
- Product references → `references/{source}/`

Descriptive filenames help: `stripe-checkout-confirmation.png`

### With Metadata (Optional)

Add frontmatter to markdown files:

```markdown
---
source: "Stripe"
url: "https://stripe.com/checkout"
zones: [critical]
materials: [decisive]
terms: [deposit, withdraw]
captured: 2026-01-06
tags: [motion, confirmation]
---

# Stripe Checkout Flow

## What I Love
- Deliberate motion on confirmation
- Clear visual hierarchy

## Key Pattern
The confirmation animation is ~800ms, giving weight to the action.
```

### Anti-Patterns

Document patterns to avoid:

```markdown
---
severity: high
zones: [critical]
---

# Spinner Anxiety

## The Pattern
Loading spinners during financial transactions.

## Why to Avoid
- Creates uncertainty
- Users may rage-click

## What to Do Instead
1. Skeleton loading with deliberate reveal
2. Progress indicators with copy
```

## Curated Index (Optional)

Create `index.yaml` to highlight key references:

```yaml
version: "1.0"

featured:
  - path: references/stripe/checkout-flow.md
    why: "Gold standard for financial confirmation"

  - path: anti-patterns/spinner-anxiety.md
    why: "Core principle we never violate"

tags:
  deliberate_motion:
    - references/stripe/confirmation-animation.gif
    - articles/motion-principles.md
```

## How It's Used

During `/craft`, the agent:
1. Reads the moodboard
2. Finds relevant references for your current zone/term
3. Surfaces 1-3 inspirations in guidance

```
Based on your moodboard:
- See: references/stripe/checkout-flow.md for confirmation pattern
- Avoid: anti-patterns/spinner-anxiety.md
```

## Supported File Types

| Type | Extensions |
|------|------------|
| Markdown | `.md` |
| Images | `.png`, `.gif`, `.jpg`, `.jpeg`, `.webp`, `.svg` |

## Tips

- **Organize by source** in `references/` (e.g., `stripe/`, `linear/`)
- **Use descriptive filenames** for images
- **Add frontmatter** for better filtering (zones, materials, terms)
- **Keep anti-patterns** focused with clear "what to do instead"
