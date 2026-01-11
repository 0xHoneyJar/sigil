# Seeding Sanctuary

## Purpose

Provide virtual taste for cold start projects.
When Sanctuary is empty, seeds provide opinionated design context.

## Trigger

- Empty `src/sanctuary/` detected
- No components with `@sigil-tier` pragmas found
- First `/craft` command on new project

## Philosophy

> "Don't start from nothing. Start from somewhere."

Seeds provide a taste profile for new projects, allowing /craft to
generate consistent components even before any real components exist.

## Available Seeds

| Seed | Description | Feel |
|------|-------------|------|
| linear-like | Linear-inspired minimal | Snappy, monochrome, efficient |
| vercel-like | Vercel-inspired bold | Sharp, high-contrast, modern |
| stripe-like | Stripe-inspired soft | Smooth, gradient-friendly, premium |
| blank | No opinions | Pure physics, no taste |

## Output

- `grimoires/sigil/state/seed.yaml` - Selected seed configuration

## Seed Selection Flow

```
1. Detect empty Sanctuary
2. Present seed options via AskUserQuestion
3. User selects seed (or blank)
4. Write seed to grimoires/sigil/state/seed.yaml
5. Scanning skill uses seed as virtual components
```

## Seed Schema

```yaml
seed: "linear-like"
version: "1.0.0"
description: "Linear-inspired minimal interface"

physics:
  default: "snappy"
  critical: "deliberate"
  marketing: "smooth"

materials:
  background: "#000000"
  surface: "#111111"
  text: "#FFFFFF"
  muted: "#666666"
  accent: "#5E6AD2"

typography:
  font_family: "Inter"
  base_size: "14px"
  scale: 1.25

spacing:
  unit: "4px"
  scale: [4, 8, 12, 16, 24, 32, 48, 64]

virtual_components:
  Button:
    tier: "gold"
    zone: "standard"
    physics: "snappy"
    vocabulary: ["action", "submit"]

  Card:
    tier: "silver"
    zone: "standard"
    physics: "smooth"
    vocabulary: ["container", "group"]
```

## Fade Behavior

When real components are created, virtual ones "fade":

1. Real `ClaimButton.tsx` created with `@sigil-tier gold`
2. Virtual `Button` marked as "faded"
3. Queries return real component, not virtual
4. Faded virtual never appears in suggestions

```typescript
// In scanning-sanctuary
if (realComponentExists(name)) {
  return { ...realComponent, source: 'sanctuary' };
}
if (virtualComponentExists(name) && !isFaded(name)) {
  return { ...virtualComponent, source: 'seed' };
}
```

## Performance

- Seed loading: <5ms (YAML parse)
- Virtual component query: <1ms

## Integration with Workshop

Virtual components are NOT added to workshop.json.
They exist only in seed.yaml and are queried at runtime.

This keeps workshop focused on real components.
