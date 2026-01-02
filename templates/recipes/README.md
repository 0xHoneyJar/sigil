# Sigil Motion Recipes

Pre-built motion hooks for zone-appropriate animations. Each recipe is tuned for a specific zone's feel.

## Installation

These recipes use `@react-spring/web`. Install it first:

```bash
npm install @react-spring/web
# or
pnpm add @react-spring/web
```

Copy the recipe files you need into your project.

## Recipes

### useDeliberateEntrance (Critical Zone)

For high-stakes contexts: checkout, transactions, confirmations.

```tsx
import { useDeliberateEntrance, animated } from "./useDeliberateEntrance";

function CheckoutSummary() {
  const { style } = useDeliberateEntrance();

  return (
    <animated.div style={style}>
      <OrderTotal />
    </animated.div>
  );
}
```

**Feel**: Weighty, confident, builds trust
**Timing**: 800ms+ entrance
**Spring**: Low tension (120), high friction (14), mass (1.2)

### usePlayfulBounce (Marketing Zone)

For engagement contexts: landing pages, CTAs, celebrations.

```tsx
import { usePlayfulBounce, animated } from "./usePlayfulBounce";

function HeroButton() {
  const { style, bounce } = usePlayfulBounce();

  return (
    <animated.button style={style} onMouseEnter={bounce}>
      Get Started Free
    </animated.button>
  );
}
```

**Feel**: Energetic, attention-grabbing, fun
**Timing**: Variable, bouncy
**Spring**: High stiffness (200), low damping (10)

### useSnappyTransition (Admin Zone)

For efficiency contexts: dashboards, settings, data tables.

```tsx
import { useSnappyTransition, animated } from "./useSnappyTransition";

function SettingsPanel() {
  const { style, toggle, isVisible } = useSnappyTransition();

  return (
    <>
      <button onClick={toggle}>Settings</button>
      {isVisible && (
        <animated.div style={style}>
          <SettingsForm />
        </animated.div>
      )}
    </>
  );
}
```

**Feel**: Instant, efficient, no-nonsense
**Timing**: <200ms
**Spring**: High tension (400), high friction (30), clamped

## Zone Selection Guide

| Zone | Recipe | When to Use |
|------|--------|-------------|
| Critical | `useDeliberateEntrance` | Checkout, payments, confirmations |
| Marketing | `usePlayfulBounce` | Landing pages, CTAs, celebrations |
| Admin | `useSnappyTransition` | Dashboards, settings, utilities |

## Adapting for Framer Motion

These recipes use react-spring, but can be adapted to framer-motion:

```tsx
// react-spring
const { style } = useDeliberateEntrance();
<animated.div style={style}>

// framer-motion equivalent
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.8,
    ease: [0.25, 0.1, 0.25, 1.0]
  }}
>
```

### Spring to Duration Mapping

| Zone | react-spring | framer-motion |
|------|--------------|---------------|
| Critical | tension: 120, friction: 14 | duration: 0.8, ease: easeOut |
| Marketing | tension: 200, friction: 10 | type: "spring", stiffness: 200, damping: 10 |
| Admin | tension: 400, friction: 30 | duration: 0.15, ease: linear |

## Utility Hooks

Each recipe includes additional utility hooks:

### Deliberate

- `useDeliberateStagger` - Staggered entrance for lists

### Playful

- `useAttentionPulse` - Continuous pulse for CTAs
- `useStaggerReveal` - Staggered reveal for content sections

### Snappy

- `useInstantFeedback` - Button press feedback
- `useQuickFade` - Fast content switching
- `useSnappyCollapse` - Expandable sections

## Philosophy

> "Make the right path easy."

These recipes encode your design system's motion rules. Using them ensures consistent feel across your application without memorizing timing values.

When you need different motion, reach for `/craft` to discuss alternatives.
