# CRAFT.md

Ralph-style prompt for Sigil. Run in a loop, inscribe learnings until consistent.

```bash
while :; do cat CRAFT.md | claude-code ; done
```

---

## Instructions

For each component listed below, run `/craft` with the full description.
Apply any learnings from the Learnings section below.

---

## Components

<!--
Format: /craft "description with effect, feel, and material hints"
The more specific, the better the physics detection.
-->

/craft "claim rewards button for staking pool — trustworthy, deliberate, elevated"

/craft "like button for posts — snappy, playful, minimal"

/craft "dark mode toggle — instant, smooth, minimal"

<!-- Add more /craft commands as needed -->

---

## Acceptance

Before marking complete:

- [ ] Physics analysis shown for each component
- [ ] Effect correctly detected from keywords/context
- [ ] Timing matches effect (800ms financial, 200ms standard, etc.)
- [ ] Animation matches frequency (springs for interactive, ease for deliberate)
- [ ] Material matches feel adjectives
- [ ] Protected capabilities verified (cancel visible, 44px targets, etc.)
- [ ] Matches existing codebase conventions
- [ ] No TypeScript errors
- [ ] Runs without runtime errors

---

## Learnings

<!--
Operator: Add learnings here after each loop iteration.
These marks persist and refine future generations.
Run /inscribe to make them permanent in Sigil's rules.
Format: YYYY-MM-DD: observation → correction
-->

### Keywords
<!-- Wrong effect detected? Note what it should be. -->

### Timing
<!-- Wrong duration? Note preferred values. -->

### Animation
<!-- Wrong easing? Note preferred springs/curves. -->

### Material
<!-- Wrong surface? Note preferred treatments. -->

### Codebase
<!-- Wrong patterns? Note conventions to follow. -->

---

## Example Learnings

After a few iterations, your learnings might look like:

```markdown
### Keywords
- 2026-01-13: "harvest" should be financial
- 2026-01-13: "archive" correctly detected as soft-delete ✓

### Timing
- 2026-01-13: Prefer 600ms over 800ms for financial (faster brand)

### Animation
- 2026-01-13: Using spring(500,25) everywhere — bouncier feel

### Material
- 2026-01-13: All buttons use 8px radius (design system)
- 2026-01-13: No shadows on standard buttons (minimal aesthetic)

### Codebase
- 2026-01-13: Use sonner for toasts, not react-hot-toast
- 2026-01-13: Mutations use @tanstack/react-query
```

Run `/inscribe` to promote these learnings into Sigil's rules.
