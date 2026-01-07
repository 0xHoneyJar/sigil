---
zones: [critical, marketing, admin]
materials: [decisive, glass, machinery]
tags: [motion, animation, timing]
---

# Motion Design Principles

## Core Philosophy

> "Motion is communication. Every animation tells the user something."

Motion should serve a purpose:
- **Communicate state** — Something changed
- **Guide attention** — Look here
- **Build trust** — We're taking this seriously
- **Create delight** — This feels good

## Timing by Zone

| Zone | Duration | Feel | Example |
|------|----------|------|---------|
| Critical | 600-800ms | Deliberate, weighty | Payment confirmation |
| Marketing | 200-400ms | Playful, bouncy | Card hover effects |
| Admin | 100-200ms | Snappy, efficient | Table row selection |

## Easing Functions

### Critical Zone
```css
/* Deliberate out */
transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
```

### Marketing Zone
```css
/* Bouncy spring */
transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Admin Zone
```css
/* Sharp snap */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
```

## Motion Categories

### Entrance Animations

1. **Deliberate Entrance** (Critical)
   - Fade in from 80% opacity
   - Scale from 0.98 to 1.0
   - Duration: 600ms

2. **Playful Entrance** (Marketing)
   - Bounce in from scale 0.9
   - Slight overshoot to 1.02
   - Duration: 300ms

3. **Snap Entrance** (Admin)
   - Immediate fade in
   - No scale transform
   - Duration: 150ms

### Confirmation Animations

1. **Success** — Checkmark draws in with weight (500ms)
2. **Failure** — Gentle shake, not aggressive (400ms)
3. **Processing** — Pulse with progress indicator

## Reduced Motion

Always respect `prefers-reduced-motion`:

```tsx
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

<motion.div
  animate={prefersReducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6 }}
/>
```

## Anti-Patterns

- **Instant transitions in critical zones** — Feels cheap
- **Playful motion in financial contexts** — Undermines trust
- **Long animations in admin zones** — Frustrates power users

## References

- Stripe checkout flow for confirmation timing
- Linear app for keyboard-driven motion
