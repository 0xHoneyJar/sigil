# Skill: Codifying Materials

> "Materials are physics, not palettes."

## Purpose

Define how materials behave physically in the product.

## Workflow

### 1. Material Selection

```
"Which materials does your product use?"

□ Clay — heavy, spring, depress (critical actions)
□ Machinery — instant, flat, highlight (efficiency)
□ Glass — weightless, refract, glow (exploration)
□ Custom — define your own
```

### 2. Physics Definition

For each material, define:
- **Light**: diffuse / flat / refract
- **Weight**: heavy / none / weightless
- **Motion**: spring / instant / ease
- **Feedback**: depress / highlight / glow

### 3. Zone Mapping

```
"Which zones use which materials?"

critical → clay
transactional → machinery
exploratory → glass
```

### 4. CSS Implications

Generate CSS custom properties for each material:
```css
--clay-shadow: 0 2px 4px rgba(0,0,0,0.1);
--clay-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--clay-press: scale(0.97);
```

## Output

Creates `sigil-mark/resonance/materials.yaml`
