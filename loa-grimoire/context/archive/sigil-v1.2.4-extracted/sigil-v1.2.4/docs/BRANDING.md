# Sigil Branding Guidelines

> Monochrome. Geometric. Confident.

## Typography

### Primary: Adhesion

**Adhesion** is Sigil's brand typeface.

- **File:** `assets/fonts/Adhesion-Regular.otf` (included in package)
- **Use:** Headers, wordmark, workbench UI
- **Fallback:** system monospace for terminal contexts

### Installation

```css
@font-face {
  font-family: 'Adhesion';
  src: url('./assets/fonts/Adhesion-Regular.otf') format('opentype');
  font-weight: normal;
  font-style: normal;
}
```

### Terminal Contexts

When Adhesion isn't available (terminal, CLI):
- Use ASCII art approximations
- Maintain geometric, blocky aesthetic
- Box-drawing characters: `┏ ┓ ┗ ┛ ━ ┃`

## Color Palette

### Monochrome Core

| Token | Hex | Use |
|-------|-----|-----|
| `bg` | `#000000` | Background |
| `fg` | `#FFFFFF` | Primary text |
| `muted` | `#666666` | Secondary text |
| `border` | `#333333` | Dividers |

### Accent (Minimal)

| Token | Hex | Use |
|-------|-----|-----|
| `success` | `#00FF00` | Pass states |
| `warning` | `#FFFF00` | Sandbox markers |
| `error` | `#FF0000` | Violations |

Accents are used sparingly. The interface should feel like a well-crafted instrument, not a dashboard.

## Voice

### Tagline

> "See the diff. Feel the result. Learn by doing."

### Principles

- **Direct**: No marketing fluff. Say what it does.
- **Confident**: Sigil has opinions. State them clearly.
- **Craft-focused**: Every word should feel intentional.

### Examples

**Good:**
- "Physics: spring(180, 12)"
- "Toggle A/B to feel the difference"
- "The diff is the lesson"

**Avoid:**
- "Leverage synergies in your design workflow"
- "Empowering designers to..."
- Exclamation points

## ASCII Art

### Wordmark

```
███████╗██╗ ██████╗ ██╗██╗     
██╔════╝██║██╔════╝ ██║██║     
███████╗██║██║  ███╗██║██║     
╚════██║██║██║   ██║██║██║     
███████║██║╚██████╔╝██║███████╗
╚══════╝╚═╝ ╚═════╝ ╚═╝╚══════╝
```

### Section Headers

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃         SECTION TITLE              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Boxes

```
┌─────────────────────────────────┐
│ Content                         │
└─────────────────────────────────┘
```

## Workbench Aesthetic

The workbench should feel like a professional tool:

- Black background (`#000000`)
- White text (`#FFFFFF`)
- Minimal borders
- No gradients
- No shadows
- No rounded corners (in terminal)
- Dense information display
- Clear visual hierarchy through spacing, not color

### Layout

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                              SIGIL                                    ┃
┣━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  PHYSICS            ┃                                                 ┃
┃                     ┃  BROWSER                                        ┃
┃  spring(180, 12)    ┃                                                 ┃
┃                     ┃  See the diff.                                  ┃
┃  DIFF               ┃  Feel the result.                               ┃
┃  - stiffness: 180   ┃                                                 ┃
┃  + stiffness: 300   ┃                                                 ┃
┃                     ┃                                                 ┃
┃  [A] Before         ┃                                                 ┃
┃  [B] After          ┃                                                 ┃
┣━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  CLAUDE CODE                                                          ┃
┃                                                                       ┃
┃  > More Nintendo Switch                                               ┃
┃  Adjusted: spring(180, 12) → spring(300, 8)                           ┃
┃                                                                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

## Web Contexts (Future)

If Sigil ever has a web UI:

```css
@font-face {
  font-family: 'Adhesion';
  src: url('./assets/fonts/Adhesion-Regular.otf') format('opentype');
  font-weight: normal;
  font-style: normal;
}

:root {
  /* Adhesion for headers */
  --font-display: 'Adhesion', system-ui, sans-serif;
  
  /* Monospace for code/physics */
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Colors */
  --bg: #000000;
  --fg: #FFFFFF;
  --muted: #666666;
  --border: #333333;
}
```

No gradients. No shadows. No border-radius. Sharp edges convey precision.
