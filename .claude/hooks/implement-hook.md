# Implementation Hook

Suggests Glyph invocation for UI tasks during `/implement`.

## Trigger

Activated when `/implement` works on a task that:
- Has "UI", "component", "button", "modal", "form" in title/description
- References a .tsx or .jsx file
- Contains physics requirements in acceptance criteria

## Detection Keywords

### UI Component Keywords (High Signal)
```
button, modal, dialog, form, panel, card, dropdown,
menu, nav, header, footer, sidebar, toast, alert,
input, select, checkbox, radio, toggle, slider
```

### Action Keywords (Effect Detection)
```
Financial: claim, deposit, withdraw, transfer, stake, swap, mint
Destructive: delete, remove, destroy, revoke, purge, clear
Standard: save, update, edit, create, add, submit
Local: toggle, switch, expand, collapse, theme
```

## Behavior

### Step 1: Detect UI Task

```typescript
function isUITask(task: Task): boolean {
  const text = `${task.title} ${task.description}`.toLowerCase();

  // Check for UI keywords
  const uiKeywords = ['button', 'modal', 'form', 'component', 'ui', 'dialog'];
  const hasUIKeyword = uiKeywords.some(k => text.includes(k));

  // Check for file reference
  const hasUIFile = text.match(/\.(tsx|jsx)$/);

  // Check for physics requirements in acceptance criteria
  const hasPhysics = task.acceptanceCriteria?.some(ac =>
    ac.includes('Effect:') || ac.includes('Physics:')
  );

  return hasUIKeyword || hasUIFile || hasPhysics;
}
```

### Step 2: Extract Physics from Sprint

If task has physics requirements from `/sprint-plan`:

```markdown
## Physics Requirements (from sprint)
- **Effect**: Financial
- **Sync**: Pessimistic
- **Timing**: 800ms
- **Confirmation**: Required
```

### Step 3: Check Confidence

Read `grimoires/rune/wyrd.md` for current confidence:

```markdown
Current confidence for Financial: 0.85 (moderate)
Recent adjustments: -0.05 from 1 similar rejection
```

### Step 4: Prompt User

```
🔮 UI Component Detected

Task: Create claim rewards button

Physics Requirements (from sprint):
- Effect: Financial
- Sync: Pessimistic
- Timing: 800ms
- Confidence: 0.85

Generate with /glyph? [y/n/skip-always]
```

### Step 5: On Accept

1. Extract component description from task
2. Invoke `/glyph "{description}"`
3. Pass sprint context for logging
4. Auto-apply taste from `grimoires/rune/taste.md`

### Step 6: Log to NOTES.md

After generation, append to Design Physics section:

```markdown
### Physics Decisions
| Date | Component | Effect | Timing | Taste Override | Rationale |
|------|-----------|--------|--------|----------------|-----------|
| 2026-01-25 | ClaimButton | Financial | 500ms | power-user-timing | Sprint-1 task |
```

## Skip Conditions

Don't prompt if:
- Task is explicitly non-UI (e.g., "API endpoint", "database migration")
- User has disabled Rune hooks via `skip-always` response
- `/glyph` was already invoked this task
- Task has `no-glyph` tag

## User Preferences

Store hook preferences in `.loa.config.yaml`:

```yaml
rune:
  hooks:
    implement:
      enabled: true
      auto_invoke: false  # true = skip prompt, auto-invoke
      skip_keywords:
        - "api"
        - "migration"
        - "backend"
```

## Integration with Wyrd

The hook reads Wyrd state to:
1. Show current confidence for detected effect
2. Note any recent rejections
3. Warn if confidence is low

```
⚠️ Low confidence (0.65) for Financial effect
3 recent rejections - hypothesis may need adjustment

Generate with /glyph? [y/n/adjust]
```

If user selects `adjust`, open hypothesis adjustment flow before generation.
