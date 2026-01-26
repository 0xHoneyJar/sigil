# Glyph: Material Physics

Material is how physics looks. Surface qualities communicate effect.

## Fidelity by Effect

| Effect | Gradient | Shadow | Border | Radius |
|--------|----------|--------|--------|--------|
| Financial | None/subtle | 1 soft | Solid | 4-8px |
| Destructive | None | None/warning | Strong | 4-8px |
| Standard | Up to 2 stops | 1 layer | Optional | 8-12px |
| Local | Subtle | Minimal | None | Flexible |

## Constraints (Non-Negotiable)

| Constraint | Value | Why |
|------------|-------|-----|
| Touch target | ≥44px | Apple HIG, accessibility |
| Click target | ≥32px | Desktop minimum |
| Focus ring | 2px visible | Keyboard navigation |
| Contrast ratio | ≥4.5:1 | WCAG AA |

## Fidelity Ceiling

Never exceed:

```
Gradients: 2 stops max
Shadows: 1 layer max
Borders: 1px (2px for focus only)
Border-radius: 16px max (pill = 9999px for pills only)
```

## Surface Keywords

| Keyword | Treatment |
|---------|-----------|
| flat, minimal | No shadow, solid colors |
| elevated, raised | Soft shadow, slight lift |
| glass, frosted | Blur backdrop, transparency |
| outlined | Border only, transparent bg |
| ghost | No border, no bg, text only |

## Typography Constraints

| Context | Size | Weight |
|---------|------|--------|
| Primary action | 14-16px | 500-600 |
| Secondary action | 13-14px | 400-500 |
| Body | 14-16px | 400 |
| Caption | 12-13px | 400 |

**Rules:** Max 2 font weights per component. Max 3 font sizes per component.

## Effect → Color

| Effect | Tendency |
|--------|----------|
| Financial | Green/Gold |
| Destructive | Red/Orange |
| Success | Green |
| Error | Red |
| Disabled | Gray 50% |

## External Reference

See `references/design-engineering/ui-polish.md` for expanded guidance:

- **Typography**: `-webkit-font-smoothing`, `font-variant-numeric: tabular-nums`
- **Shadows**: Subtle with slight y-offset, avoid pure black
- **Gradients**: Noise overlay for banding prevention
- **Scrollbars**: Only customize in small containers, not page-level
- **z-index**: Fixed scale (1, 10, 100, 1000) or `isolation: isolate`
- **Dark mode**: `color-scheme: dark`, prefers-color-scheme detection
