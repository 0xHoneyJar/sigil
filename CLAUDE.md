# Sigil v1.2.4: Design Physics Framework

> "See the diff. Feel the result. Learn by doing."

You are operating within **Sigil**, a design physics framework for building consistent, craft-driven interfaces. Sigil provides recipes (pre-validated physics implementations) and a workbench environment where engineers learn by seeing diffs AND feeling results.

---

## Core Philosophy

<sigil_philosophy>
**Apprenticeship Through Diff + Feel**

Design engineers learn by:
1. Claude adjusts → Engineer sees `stiffness: 180 → 300`
2. Engineer clicks component in browser → FEELS the snap
3. Engineer toggles A/B → FEELS the difference
4. Numbers gain meaning through fingers

Do NOT lecture. Do NOT explain unless asked. Make the change. The diff + feel is the lesson.

**Claude's Training IS the Vibe Map**

You already know what "Nintendo Switch snap" feels like. You know what "Linear's deliberate feel" looks like. You know what "anxious" means for THIS component in THIS context.

No vibes.yaml dictionary. Infer from context. Same word ("anxious") means different physics for different components:
- Toast: appears too fast → add delay, soften entrance
- Delete button: feels shaky → more deliberate, steadier
- Spinner: too urgent → slow down

**Recipes Over Raw Physics**

Generate code using recipes from `sigil-mark/recipes/`. Do not generate raw spring/timing values unless in sandbox mode. Recipes contain the physics — using them guarantees compliance.
</sigil_philosophy>

---

## Commands

<sigil_commands>
### /craft [component_description] [--file path]

Generate a component using recipes from the current zone.

**Behavior:**
1. Resolve zone from file path → find `.sigilrc.yaml`
2. Load available recipes for that zone
3. Select appropriate recipe based on component description
4. Generate component that imports and configures the recipe
5. Show the diff if updating existing file

**Output format:**
```
ZONE: src/checkout (decisive)
RECIPE: decisive/Button

[generated code]

PHYSICS: spring(180, 12), server-tick
```

### /sandbox [path]

Enable exploration mode for a file or directory. Raw physics allowed.

**Behavior:**
1. Mark file with `// sigil-sandbox` header
2. Relax ESLint rules for this file
3. Allow raw spring/timing values
4. Track in /garden as active sandbox

**Exit sandbox:** Run `/codify` to extract physics to recipe.

### /codify [path] [--name recipe_name]

Extract physics from a component into a recipe.

**Behavior:**
1. Analyze component for spring/timing/animation values
2. Suggest recipe name based on zone and behavior
3. Create recipe file in `sigil-mark/recipes/{zone}/`
4. Update component to import the new recipe
5. Remove sandbox markers if present

### /inherit

Bootstrap Sigil from an existing codebase.

**Behavior:**
1. Scan for component directories
2. Detect existing patterns (colors, spacing, motion)
3. Report findings with pattern clusters
4. DO NOT auto-generate recipes (human decides)

### /validate

Check recipe compliance across codebase.

**Behavior:**
1. Find all components
2. Check each imports from `@sigil/recipes/` (or local recipes)
3. Flag raw physics outside sandbox
4. Report compliance percentage

### /garden

Health report on recipes, sandboxes, and variants.

**Behavior:**
1. Count components using recipes vs raw physics
2. List active sandboxes (with age — flag stale ones >7 days)
3. List recipe variants created
4. Show coverage by zone
5. Recommend actions (codify old sandboxes, review variants)
</sigil_commands>

---

## Zone Resolution

<sigil_zones>
Zones are directories. Each directory can have a `.sigilrc.yaml` that specifies which recipes to use.

**Resolution algorithm:**
```
File: src/checkout/ConfirmButton.tsx
1. Check src/checkout/.sigilrc.yaml → found: recipes: decisive
2. Merge with src/.sigilrc.yaml → inherit defaults
3. Apply decisive recipes
```

**Zone config format:**
```yaml
sigil: "1.2.4"
recipes: decisive          # Which recipe set
sync: server_authoritative # Metadata for context
tick: 600ms

# Optional constraints
constraints:
  optimistic_ui: forbidden
  loading_spinners: forbidden
```
</sigil_zones>

---

## Recipe Sets

<sigil_recipes>
Three recipe sets with different physics profiles:

### Decisive (checkout, transactions)
- **Physics:** `spring(180, 12)`, whileTap scale 0.98
- **Feel:** Heavy, deliberate, trustworthy
- **Sync:** server_authoritative
- **Use for:** Critical actions where trust matters

### Machinery (admin, utilities)
- **Physics:** `spring(400, 30)` or instant
- **Feel:** Efficient, instant, no-nonsense
- **Sync:** client_authoritative
- **Use for:** Admin tools, settings, repetitive tasks

### Glass (marketing, exploration)
- **Physics:** `spring(200, 20)`, float on hover
- **Feel:** Light, delightful, polished
- **Sync:** client_authoritative
- **Use for:** Marketing pages, exploratory interfaces

**Recipe location:** `sigil-mark/recipes/{set}/`

**Variants:** Created when refinement produces reusable pattern:
```
sigil-mark/recipes/decisive/
├── Button.tsx              # Base
├── Button.nintendo.tsx     # Variant: spring(300, 8)
├── Button.relaxed.tsx      # Variant: spring(140, 16)
└── index.ts
```
</sigil_recipes>

---

## Three Laws

<sigil_laws>
| Level | Meaning | Example |
|-------|---------|---------|
| **IMPOSSIBLE** | Violates trust model, build fails | Optimistic UI in server_authoritative zone |
| **BLOCK** | Requires explicit override | Raw physics outside sandbox |
| **WARN** | Logged for /garden | Sandbox open > 7 days |

**IMPOSSIBLE constraints cannot be overridden.** They represent physics that would break user trust (e.g., showing success before server confirms in a transaction).
</sigil_laws>

---

## Context Injection

<sigil_context_format>
When processing commands, inject this context:

```xml
<sigil_context version="1.2.4">
  <zone path="{current_path}">
    <recipes>{recipe_set}</recipes>
    <sync>{sync_mode}</sync>
  </zone>

  <available_recipes>
    <recipe name="{name}" physics="{spring_values}">
      <variant name="{variant}" physics="{values}" />
    </recipe>
  </available_recipes>

  <constraints>
    <rule level="impossible">{hard_constraint}</rule>
    <rule level="block">{soft_constraint}</rule>
  </constraints>

  <sandbox_files>
    <file path="{path}" />
  </sandbox_files>
</sigil_context>
```
</sigil_context_format>

---

## Workbench Mode

<sigil_workbench>
When user runs `sigil workbench`, they enter a tmux session with:
- **Left pane:** Diff view + physics values + A/B toggle
- **Right pane:** Browser via Chrome MCP
- **Bottom pane:** Claude Code interaction

**The A/B toggle is crucial for learning:**
- Press [A]: Load previous physics, user clicks component, feels it
- Press [B]: Load adjusted physics, user clicks component, feels difference
- This is how `stiffness: 180` gains meaning — through fingers, not lectures

**When in workbench mode:**
1. After every adjustment, prompt user to test: "Toggle A/B to feel the difference"
2. Show the diff prominently
3. Keep browser URL in sync with component being edited
4. Track history of adjustments for comparison
</sigil_workbench>

---

## PR-Native Refinement

<sigil_refinement>
When feedback comes from PR comments (Vercel, GitHub, Linear):

1. **Read context:** Component code + zone + current physics
2. **Infer intent:** "Nintendo Switch" = high snap; "anxious" = too fast/stiff (FOR THIS COMPONENT)
3. **Adjust:** Make the physics change
4. **Commit:** With descriptive message showing the delta
5. **No lecture:** The diff is the lesson

**Commit format:**
```
refine({component}): {description} - {physics_delta}

Example:
refine(CheckoutButton): Nintendo Switch feel - spring(180,12)→(300,8)
```
</sigil_refinement>

---

## Behavioral Guidelines

<sigil_behavior>
**DO:**
- Use recipes for all physics
- Show diffs prominently after changes
- Infer context-specific meaning for feeling words
- Suggest A/B comparison in workbench
- Create variants when refinements are reusable
- Respect zone constraints

**DON'T:**
- Generate raw spring/timing values outside sandbox
- Lecture about physics (the diff is the lesson)
- Apply global meaning to subjective words
- Skip showing the physics delta
- Auto-apply without showing what changed

**WHEN FEEDBACK IS RECEIVED:**
1. Understand the feeling in context of THIS component
2. Make the adjustment
3. Show: `spring(180, 12) → spring(300, 8)`
4. In workbench: "Toggle A/B to feel the difference"
5. Ask if worth saving as variant

**LEARNING HAPPENS THROUGH:**
- Seeing `stiffness: 180 → 300` in the diff
- Clicking the component and feeling the snap
- Toggling A/B and feeling both
- NOT through reading explanations
</sigil_behavior>

---

## File Structure

<sigil_structure>
```
project/
├── .sigilrc.yaml              # Root config
├── .sigil-version.json        # Version tracking
├── CLAUDE.md                  # This file
│
├── src/
│   ├── .sigilrc.yaml          # recipes: machinery (default)
│   ├── checkout/
│   │   └── .sigilrc.yaml      # recipes: decisive
│   ├── admin/
│   │   └── .sigilrc.yaml      # recipes: machinery
│   └── marketing/
│       └── .sigilrc.yaml      # recipes: glass
│
├── sigil-mark/
│   ├── recipes/
│   │   ├── decisive/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.nintendo.tsx
│   │   │   ├── ConfirmFlow.tsx
│   │   │   └── index.ts
│   │   ├── machinery/
│   │   │   ├── Table.tsx
│   │   │   └── index.ts
│   │   └── glass/
│   │       ├── HeroCard.tsx
│   │       └── index.ts
│   ├── hooks/
│   │   ├── useServerTick.ts
│   │   └── index.ts
│   ├── history/
│   │   └── YYYY-MM-DD.md
│   └── reports/
│       └── garden-{date}.yaml
│
└── .claude/
    ├── commands/
    │   └── *.md
    └── skills/
        └── sigil-core/
```
</sigil_structure>

---

## Coexistence with Loa

Sigil and Loa can coexist. They have separate:
- State zones (sigil-mark/ vs loa-grimoire/)
- Config files (.sigilrc.yaml vs .loa.config.yaml)
- Skills (design-focused vs workflow-focused)

No automatic cross-loading — developer decides when to reference design context.
