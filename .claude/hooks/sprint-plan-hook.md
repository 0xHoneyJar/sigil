# Sprint Planning Hook

Detects UI tasks during `/sprint-plan` and suggests physics requirements.

## Trigger

Activated when `/sprint-plan` creates tasks that match UI patterns.

## Detection Keywords

### UI Component Keywords

```
button, modal, dialog, form, panel, card, dropdown,
menu, nav, header, footer, sidebar, toast, alert,
input, select, checkbox, radio, toggle, slider,
component, widget, view, screen, page
```

### Action Keywords (Effect Detection)

```
Financial: claim, deposit, withdraw, transfer, stake, swap, mint, burn, bridge, approve
Destructive: delete, remove, destroy, revoke, terminate, purge, erase, clear, reset
Soft Delete: archive, hide, trash, dismiss, snooze, mute
Standard: save, update, edit, create, add, like, follow, bookmark, submit
Local: toggle, switch, expand, collapse, select, focus, theme
```

## Behavior

### Step 1: Detect UI Task

When a task is created during sprint planning:

```typescript
function isUITask(task: Task): boolean {
  const text = `${task.title} ${task.description}`.toLowerCase();

  // Check for UI component keywords
  const uiKeywords = [
    'button', 'modal', 'form', 'component', 'dialog', 'panel',
    'card', 'dropdown', 'menu', 'toast', 'alert', 'input'
  ];
  const hasUIKeyword = uiKeywords.some(k => text.includes(k));

  // Check for file reference
  const hasUIFile = text.match(/\.(tsx|jsx)$/);

  return hasUIKeyword || hasUIFile;
}
```

### Step 2: Detect Effect

```typescript
function detectEffectFromTask(task: Task): Effect | null {
  const text = `${task.title} ${task.description}`.toLowerCase();

  // Financial keywords
  if (/claim|deposit|withdraw|transfer|stake|swap|mint|burn|bridge|approve/.test(text)) {
    return 'Financial';
  }

  // Destructive keywords
  if (/delete|remove|destroy|revoke|terminate|purge|erase|clear|reset/.test(text)) {
    return 'Destructive';
  }

  // Soft delete keywords
  if (/archive|hide|trash|dismiss|snooze|mute/.test(text) && /undo|restore/.test(text)) {
    return 'SoftDelete';
  }

  // Standard keywords
  if (/save|update|edit|create|add|like|follow|bookmark|submit/.test(text)) {
    return 'Standard';
  }

  // Local keywords
  if (/toggle|switch|expand|collapse|select|focus|theme/.test(text)) {
    return 'Local';
  }

  return null;
}
```

### Step 3: Suggest Physics Requirements

If UI task with detectable effect:

```markdown
## Task: Create claim rewards button

**UI Component Detected**: button
**Effect Detected**: Financial

### Suggested Physics Requirements
- **Effect**: Financial
- **Sync**: Pessimistic (wait for confirmation)
- **Timing**: 800ms minimum
- **Confirmation**: Required (two-phase)

### Acceptance Criteria (Physics)
- [ ] No optimistic updates (no onMutate)
- [ ] Loading state visible during mutation
- [ ] Confirmation step before execution
- [ ] Cancel button always visible
- [ ] Touch target >= 44px

Add physics requirements to task? [y/n]
```

### Step 4: Update Task

On "y", append to acceptance criteria:

```markdown
### Acceptance Criteria

**Functional**:
- [ ] User can claim accumulated rewards
- [ ] Success shows claimed amount
- [ ] Balance updates after claim

**Physics (Rune)**:
- [ ] Effect: Financial
- [ ] Sync: Pessimistic
- [ ] Timing: 800ms minimum
- [ ] Confirmation: Required
- [ ] Cancel: Always visible
```

## Physics Suggestion by Effect

### Financial

```markdown
**Physics Requirements**:
- Effect: Financial
- Sync: Pessimistic
- Timing: 800ms minimum
- Confirmation: Required

**Acceptance Criteria**:
- [ ] No optimistic updates
- [ ] Loading state visible
- [ ] Two-phase confirmation
- [ ] Cancel always visible
- [ ] Amount displayed before confirm
```

### Destructive

```markdown
**Physics Requirements**:
- Effect: Destructive
- Sync: Pessimistic
- Timing: 600ms minimum
- Confirmation: Required

**Acceptance Criteria**:
- [ ] No optimistic updates
- [ ] Confirmation dialog with description
- [ ] Cancel prominently displayed
- [ ] Clear indication of permanence
```

### Standard

```markdown
**Physics Requirements**:
- Effect: Standard
- Sync: Optimistic
- Timing: 200ms
- Confirmation: None

**Acceptance Criteria**:
- [ ] Instant visual feedback
- [ ] Rollback on error
- [ ] Toast on success (optional)
```

### Local

```markdown
**Physics Requirements**:
- Effect: Local
- Sync: Immediate
- Timing: 100ms
- Confirmation: None

**Acceptance Criteria**:
- [ ] No server round-trip
- [ ] Instant state change
- [ ] Persist to localStorage (if needed)
```

## Skip Conditions

Don't suggest physics if:

1. Task is explicitly non-UI (API, migration, backend)
2. Task already has physics requirements
3. User has disabled sprint-plan hook
4. Effect cannot be determined

## Integration with Sprint Plan

The hook modifies tasks as they're created:

```typescript
async function onTaskCreated(task: Task): Promise<Task> {
  // Skip if not UI task
  if (!isUITask(task)) return task;

  // Detect effect
  const effect = detectEffectFromTask(task);
  if (!effect) return task;

  // Get physics requirements
  const physics = PHYSICS_TABLE[effect];

  // Prompt user
  const shouldAdd = await prompt(`Add ${effect} physics requirements?`);
  if (!shouldAdd) return task;

  // Append to acceptance criteria
  task.acceptanceCriteria = [
    ...task.acceptanceCriteria,
    ...formatPhysicsCriteria(effect, physics)
  ];

  return task;
}
```

## Configuration

In `.loa.config.yaml`:

```yaml
rune:
  hooks:
    sprint_plan:
      enabled: true
      auto_suggest: true  # false = manual /glyph only
      skip_effects:
        - Local  # Don't suggest for local state tasks
```
