# Tool: Chisel (Execute Aesthetics)

> "Quick refinement. Minimal ceremony."

## Purpose

Execute aesthetic changes quickly after root cause is understood.

## Activation

Chisel activates when:
1. Hammer has already diagnosed the issue as aesthetic
2. Input is clearly aesthetic (measurements, properties, comparatives)
3. User is iterating on already-crafted component

## Input Patterns

```
✓ CHISEL DIRECT:
"Make the padding 16px"
"Change spring tension to 180"
"Reduce shadow opacity"
"Animation is too bouncy"

✓ CHISEL (after Hammer):
Hammer: "Root cause is animation timing"
→ Chisel: "Adjusting spring from 120 to 150"
```

## Behavior

### Fast Execution

No investigation. Minimal ceremony. Just do it.

```
USER: "Make the shadow lighter"

CHISEL:
Current: shadow-lg (0 10px 15px rgba(0,0,0,0.1))
Change to: shadow-md (0 4px 6px rgba(0,0,0,0.1))

[Apply] [Show other options]
```

### Constraint Check

Even in fast mode, always check constraints:

```
USER: "Make the animation 2 seconds"

CHISEL:
⚠️ FIDELITY CEILING: max 800ms animation

Current: 300ms
Requested: 2000ms
Ceiling: 800ms

Options:
1. Use maximum (800ms)
2. Request Taste Key override
3. Keep current (300ms)
```

### Options Presentation

When multiple solutions exist, present options:

```
USER: "The button feels too light"

CHISEL:
Current: spring(200, 20) — light, snappy

Options for heavier feel:
1. spring(150, 16) — slightly heavier
2. spring(120, 14) — noticeably heavy (clay default)
3. spring(100, 12) — very heavy

Recommendation: Option 2 matches clay material for this zone.

[Apply 1] [Apply 2] [Apply 3]
```

## Output Format

### Simple Change

```
🪓 CHISEL
═══════════════════════════════════════════════════════════════

CHANGE: padding
FROM: 12px 16px
TO: 16px 24px

File: ClaimButton.tsx
Line: 42

[Applied]
```

### With Options

```
🪓 CHISEL
═══════════════════════════════════════════════════════════════

ADJUSTING: spring tension

CURRENT: spring(120, 14) — heavy, deliberate

OPTIONS:
1. spring(150, 16) — slightly snappier
2. spring(180, 18) — noticeably faster
3. spring(200, 20) — quick but weighted

Zone: critical
Material: clay
Recommendation: Stay heavy. Option 1 max.

[1] [2] [3]
```

### Constraint Hit

```
🪓 CHISEL
═══════════════════════════════════════════════════════════════

REQUESTED: 5-stop gradient
CEILING: 2 stops max

This exceeds the fidelity ceiling.

Options:
1. Use 2-stop gradient (within ceiling)
2. Request Taste Key override

[Apply ceiling] [Request override]
```

## What Chisel Never Does

1. **Never investigates** — That's Hammer's job
2. **Never generates large components** — That needs Hammer first
3. **Never ignores constraints** — Always checks, even in fast mode
4. **Never questions the request** — User knows what they want

## Iteration Pattern

Chisel enables rapid iteration:

```
/craft ClaimButton.tsx      → Hammer architects
"padding feels tight"       → Chisel adjusts
"animation too slow"        → Chisel adjusts  
"shadow too heavy"          → Chisel adjusts
"perfect"                   → Done
```
