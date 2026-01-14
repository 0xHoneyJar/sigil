# CRAFT: Taste Tuning

Discover your design physics preferences. Generate, observe, tune, repeat.

```bash
./ralph.sh 15 grimoires/sigil/CRAFT_taste.md
```

---

## Deterministic Stack

Load every loop:
- `.claude/rules/sigil-*` — Default physics
- `grimoires/sigil/taste.md` — Current preferences

---

## Queue

Generate these components to discover your taste across physics layers:

### Behavioral (timing, sync)
- [ ] primary CTA button — main action, brand authority
- [ ] secondary action — supportive, less prominent
- [ ] destructive action — warning, but fits brand tone

### Animation (easing, springs)
- [ ] dropdown menu — reveal/hide pattern
- [ ] modal dialog — entrance/exit feel
- [ ] toggle switch — quick state flip

### Material (surface, shadow, radius)
- [ ] card container — content wrapper
- [ ] input field — form element
- [ ] badge/tag — small label element

---

## Task

1. Pick ONE component from Queue
2. Run `/craft` with brand context (e.g., "minimal", "playful", "premium")
3. Observe: Does it **feel right** for your brand?
4. If wrong → add Sign describing what felt off
5. If right → mark `[x]`, note what worked in Learnings
6. Pattern 3+ times → ready for `/inscribe`

**Goal: Discover preferences, not ship components.**

---

## Signs

<!--
When something feels wrong, describe the correction.
These tune future generations.
-->

### Timing
<!-- e.g., "financial feels better at 600ms not 800ms" -->

### Animation
<!-- e.g., "prefer springs over ease-out for all interactions" -->

### Material
<!-- e.g., "no shadows, flat aesthetic" -->
<!-- e.g., "radius should be 12px not 8px" -->

### Brand
<!-- e.g., "warm not clinical", "playful not serious" -->

---

## Backpressure

For taste tuning, ask:

- [ ] Does it feel like **our brand**?
- [ ] Would I ship this without changes?
- [ ] Is it consistent with other components?

If hesitating on any → it's wrong. Add Sign.

---

## Learnings

<!--
Format: YYYY-MM-DD: observation
Note both what worked AND what didn't.
-->

### Worked Well


### Felt Wrong


### Ready for /inscribe
<!-- Patterns that appeared 3+ times -->

---

## After Tuning

When Queue is complete:

1. Review Learnings section
2. Run `/inscribe` to promote patterns
3. Future `/craft` applies your taste automatically

---

## Example Session

```
Loop 1: /craft "primary CTA — minimal, premium"
        → 800ms, ease-out, shadow-md
        → Feels too heavy, slow
        → Sign: "timing: 500ms", "material: no shadow"

Loop 2: /craft "primary CTA — minimal, premium"
        → Reads signs, applies 500ms, no shadow
        → Feels right
        → Mark [x], Learning: "500ms + flat = premium minimal"

Loop 3: /craft "secondary action — minimal, premium"
        → Already applies 500ms from taste.md
        → Feels right first try
        → Mark [x]

...

Loop 10: Queue complete
         → 3 timing adjustments, 4 material adjustments
         → /inscribe
         → Taste is now permanent
```

---

## Taste Dimensions

What you're discovering:

| Dimension | Questions |
|-----------|-----------|
| **Timing** | Fast and snappy? Deliberate and weighty? |
| **Animation** | Mechanical (ease)? Organic (spring)? None? |
| **Surface** | Elevated (shadows)? Flat? Glass? |
| **Radius** | Sharp (4px)? Soft (12px)? Pill? |
| **Density** | Compact? Spacious? |
| **Tone** | Serious? Playful? Neutral? |

Your answers become your sigil.
