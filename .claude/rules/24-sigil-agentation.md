# Sigil: Agentation Integration

Visual feedback tool for AI agents. Annotate UI issues directly in the browser.

<overview>
## Overview

[Agentation](https://agentation.dev) lets users click UI elements and generate structured markdown with selectors that AI agents can grep directly.

**Installation**: Automatically installed during `/mount`. Manual install:
```bash
npx add-skill benjitaylor/agentation
```

**Package**: For React apps, also install:
```bash
npm install agentation
```
</overview>

<react_integration>
## React Integration

Add the Agentation component to your app root (dev only):

```tsx
import { Agentation } from "agentation"

function App() {
  return (
    <>
      <YourApp />
      {process.env.NODE_ENV === "development" && <Agentation />}
    </>
  )
}
```

**Props** (optional):
- `onAnnotationAdd`: Callback when annotation is added
- `copyToClipboard`: Boolean (default: true)
</react_integration>

<usage_workflow>
## Usage Workflow

1. **Open app in browser** with Agentation component
2. **Activate annotation mode** (keyboard shortcut or HUD toggle)
3. **Click elements** to annotate issues
4. **Copy markdown output** to clipboard
5. **Paste into Claude Code**
6. **Run `/observe parse`** to store as observation

### What Gets Captured

| Action | Data Captured |
|--------|---------------|
| Click element | CSS selector, class names, position |
| Select text | Selected content, context |
| Pause animation | Current frame state |
</usage_workflow>

<observation_bridge>
## Observation Bridge

Paste Agentation output into Claude Code, then run:
```
/observe parse
```

This will:
1. **Parse selectors** from the markdown
2. **Grep codebase** for matching elements
3. **Link to source code** when found
4. **Store observation** with code references

### Expected Format

```markdown
## Agentation Feedback

### Element: `.claim-button`
- **Selector**: `button.claim-button.bg-emerald-600`
- **Issue**: Button text unclear - "Claim" doesn't show amount
- **Position**: (245, 380)

### Text Selection: "Claim your rewards"
- **Issue**: Should show actual HENLO amount
```

### Stored Observation

```yaml
---
timestamp: "2026-01-25T10:00:00Z"
source: agentation
type: ui-annotation
elements:
  - selector: "button.claim-button.bg-emerald-600"
    issue: "Button text unclear - doesn't show amount"
    position: { x: 245, y: 380 }
    code_ref: "src/components/ClaimButton.tsx:45"
---
```
</observation_bridge>

<hud_integration>
## HUD Integration

When using `@thehoneyjar/sigil-hud`, the Dev Toolbar includes an Agentation toggle:

```tsx
// The HUD provides a toggle button
<button onClick={() => window.__agentation?.toggle()}>
  📌 Annotate
</button>
```

**Keyboard shortcut**: Configurable via Agentation settings
</hud_integration>

<commands>
## Commands

After Agentation skill is installed:

| Command | Action |
|---------|--------|
| `/agentation` | Auto-detect framework, wire up component |
| `/agentation parse` | Parse pasted Agentation output |
| `/agentation observe` | Parse + store as observation |
</commands>

<best_practices>
## Best Practices

1. **Annotate specific elements**, not general areas
2. **Include context** in issue descriptions
3. **Capture before/after** for comparison issues
4. **Use text selection** for copy issues
5. **Pause animations** before annotating moving elements

### Good Annotation

```
Element: .claim-button
Issue: Button says "Claim" but should show "Claim 1,234 HENLO"
Context: User can't see amount before clicking
```

### Poor Annotation

```
Element: .claim-button
Issue: Doesn't work
```
</best_practices>

<trigger_conditions>
## When to Load This Rule

Load when detecting:
- Keywords: "agentation", "annotate", "visual feedback"
- Commands: `/agentation`
- Agentation output format in conversation
- HUD integration requests
</trigger_conditions>
