# Glyph: Animation Physics

Animation makes physics visible. Timing and curve communicate weight.

## Easing Blueprint

| Easing | When | Why |
|--------|------|-----|
| ease-out | Elements entering | Fast start = responsive, slow end = settled |
| ease-in-out | Elements morphing | Natural acceleration/deceleration |
| spring | Organic motion | Physics-based, interruptible |
| linear | Only progress/timers | Constant speed for time visualization |
| ease-in | Avoid | Slow start feels sluggish |

## Spring Presets

| Name | Stiffness | Damping | Use For |
|------|-----------|---------|---------|
| Snappy | 700 | 35 | Local state, toggles |
| Responsive | 500 | 30 | Standard mutations |
| Organic | 300 | 25 | Drag gestures, morphs |
| Deliberate | 200 | 30 | Financial, important |

## Timing by Effect

| Effect | Duration | Easing |
|--------|----------|--------|
| Financial | 800ms | ease-out |
| Destructive | 600ms | ease-out |
| Standard | 200ms | spring(500, 30) |
| Local | 100ms | spring(700, 35) |
| High-frequency | 0ms | none |

## Entrance vs Exit

Entrances deserve attention. Exits get out of the way.

```
Entrance: opacity 0→1, y 8→0, 300ms ease-out
Exit: opacity 1→0, y 0→-4, 150ms ease-in
```

## Performance Rules

**Animate only transform and opacity** — Skip layout recalculation, GPU-accelerated.

```
Safe: transform (translate, scale, rotate), opacity
Avoid: width, height, padding, margin, top, left
```

**Respect reduced motion:**

```tsx
const prefersReduced = useReducedMotion()
const transition = prefersReduced ? { duration: 0 } : { duration: 0.3 }
```

## Anti-Patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| ease-in on UI | Feels sluggish | Use ease-out |
| Animating padding | Layout jank | Use transform |
| Animation on keyboard nav | Disconnected | Use 0ms |
| Bounce everywhere | Unprofessional | Reserve for drag releases |
| `transition: all` | Performance hit | Specify exact properties |

## External Reference

See `references/design-engineering/animations.md` for expanded guidance:

- **Decision flowchart**: Should I animate this? (100+ daily views → skip)
- **Easing selection**: Enter/exit → ease-out, moving → ease-in-out
- **Spring physics**: stiffness 100-500, damping 10-40
- **Performance**: Only transform + opacity, use `will-change` sparingly
- **Reduced motion**: Always implement `prefers-reduced-motion`
