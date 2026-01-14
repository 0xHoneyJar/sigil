# Sigil: Material Physics

> Material is the third layer of design physics. Behavioral, animation, material — together they define feel.

## What is Material Physics?

Material physics describes how components *look*—their surface qualities, visual constraints, and cultural signatures. It's not separate from physics; it IS physics. Just as behavioral physics determines timing and animation physics determines movement, material physics determines surface.

---

## The Fidelity Table

Visual constraints scale with importance. Higher stakes = more visual weight.

| Effect | Gradient | Shadow | Border | Radius | Why |
|--------|----------|--------|--------|--------|-----|
| **Financial** | None/subtle | 1 layer, soft | Solid, visible | Small (4-8px) | Trust through clarity |
| **Destructive** | None | None or warning glow | Strong, red-tinted | Small | Danger reads instantly |
| **Standard** | Up to 2 stops | 1 layer | Optional | Medium (8-12px) | Comfortable, familiar |
| **Local** | Subtle | Minimal | None or subtle | Flexible | Lightweight, unobtrusive |
| **Accent/CTA** | Brand gradient OK | 1-2 layers | None | Medium-large | Draw attention |

### Fidelity Ceiling

Never exceed these maximums regardless of effect:

```
Gradients:     2 stops max (3+ looks dated)
Shadows:       1 layer max (stacking = noise)
Borders:       1px solid (2px only for focus)
Border-radius: 16px max (pill = 9999px OK for pills only)
```

---

## Typography Constraints

| Context | Size | Weight | Line Height |
|---------|------|--------|-------------|
| **Primary action** | 14-16px | 500-600 | 1.25 |
| **Secondary action** | 13-14px | 400-500 | 1.25 |
| **Body** | 14-16px | 400 | 1.5-1.6 |
| **Caption** | 12-13px | 400 | 1.4 |
| **Label** | 11-12px | 500-600 | 1.25 |

**Rules:**
- Max 2 font weights per component
- Max 3 font sizes per component
- Line height ≥ 1.4 for readability

---

## Ergonomic Constraints

These are non-negotiable for usability:

| Constraint | Minimum | Why |
|------------|---------|-----|
| **Touch target** | 44×44px | Apple HIG, accessibility |
| **Click target** | 32×32px | Desktop minimum |
| **Focus ring** | 2px, visible | Keyboard navigation |
| **Input latency** | <100ms | Feels responsive |
| **Contrast ratio** | 4.5:1 | WCAG AA |

---

## Grit Signatures

Some products need *texture*—rough edges, visible banding, chunky silhouettes. This is **grit**.

### When to Apply Grit

- Gaming products
- Retro/nostalgic aesthetics
- Products where "too polished" feels wrong
- Community-driven products

### Grit Dimensions

| Dimension | Description | Range |
|-----------|-------------|-------|
| **Edge roughness** | Anti-aliasing sharpness | 0 (crisp) - 1 (rough) |
| **Color banding** | Visible gradient steps | 0 (smooth) - 1 (stepped) |
| **Texture noise** | Surface grain | 0 (clean) - 1 (noisy) |
| **Silhouette chunkiness** | Shape complexity | 0 (smooth) - 1 (blocky) |

### Grit Presets

```
Clean:     edge: 0.0, banding: 0.0, noise: 0.0, chunky: 0.0
Subtle:    edge: 0.1, banding: 0.1, noise: 0.1, chunky: 0.1
Retro:     edge: 0.3, banding: 0.4, noise: 0.2, chunky: 0.3
Pixel:     edge: 0.8, banding: 0.8, noise: 0.0, chunky: 0.9
```

---

## Color System

### Effect → Color Mapping

| Effect | Primary Tendency | Accents |
|--------|------------------|---------|
| **Financial** | Green/Gold | Muted, trustworthy |
| **Destructive** | Red/Orange | Warning colors |
| **Standard** | Brand primary | Brand secondary |
| **Disabled** | Gray/Muted | Low contrast |
| **Success** | Green | Celebratory |
| **Error** | Red | Alert |

### State Colors

Each interactive element needs these states:
- Default
- Hover (+5-10% brightness or overlay)
- Active/Pressed (-5-10% brightness)
- Focus (ring, not color change)
- Disabled (50% opacity or muted)

---

## Material Detection

Parse descriptions for material cues:

```
"glassmorphism"     → blur backdrop, transparency, subtle border
"neumorphism"       → soft shadows, same-color bg, subtle depth
"flat"              → no shadows, solid colors, sharp edges
"elevated"          → shadow, slight lift
"outlined"          → border only, transparent bg
"ghost"             → no border, no bg, text only
"gradient"          → brand gradient allowed
"minimal"           → reduce all visual elements
"bold"              → increase weight, size, contrast
"retro/pixel"       → apply grit signature
```

---

## Integration with Behavioral & Animation Physics

Material is detected and applied alongside behavioral and animation physics in `/craft`:

```
/craft "trustworthy claim button"

Physics Analysis:
┌─ Behavioral ─────────────────────────────────────┐
│  Sync: Pessimistic, Timing: 800ms, Confirm: Yes  │
└──────────────────────────────────────────────────┘
┌─ Animation ──────────────────────────────────────┐
│  Easing: ease-out, Interruptible: No             │
└──────────────────────────────────────────────────┘
┌─ Material ───────────────────────────────────────┐
│  Surface: Elevated, Shadow: soft, Radius: 8px    │
│  Color: Green (financial), Grit: Clean           │
└──────────────────────────────────────────────────┘
```

All three layers are inferred from the same input and shown together.

---

## Validation Checklist

Before outputting, verify material:

```
□ Gradient ≤ 2 stops
□ Shadow ≤ 1 layer
□ Border ≤ 1px (2px for focus only)
□ Touch target ≥ 44px
□ Contrast ratio ≥ 4.5:1
□ Focus ring visible
□ Font weights ≤ 2
□ Font sizes ≤ 3
□ Grit matches product context
```

---

## Examples

### Financial Button Material

```tsx
// Material: trust through clarity
<button className={cn(
  // Surface
  "bg-emerald-600 hover:bg-emerald-700",
  "shadow-sm",
  "border border-emerald-700",
  "rounded-lg", // 8px
  // Typography
  "text-white font-medium text-sm",
  // Ergonomics
  "min-h-[44px] px-6",
  "focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
)}>
  Claim Rewards
</button>
```

### Glassmorphism Card Material

```tsx
// Material: glassmorphism
<div className={cn(
  // Surface
  "bg-white/10 backdrop-blur-xl",
  "border border-white/20",
  "rounded-2xl",
  "shadow-lg"
)}>
  {children}
</div>
```

### Retro Button Material

```tsx
// Material: retro/pixel with grit
<button className={cn(
  // Surface - intentionally chunky
  "bg-amber-400",
  "border-2 border-amber-800",
  "rounded-none", // sharp edges
  // Grit via pixel font or image-rendering
  "font-pixel text-amber-900",
  "[image-rendering:pixelated]"
)}>
  START
</button>
```
