# Refinement History - YYYY-MM-DD

> This file logs physics refinements made on this date.
> Format designed for Claude parsing and pattern extraction.

---

## Entry Template

```markdown
### HH:MM - Component Name

**Feedback:** "User feedback in quotes"
**Zone:** decisive | machinery | glass
**Recipe:** Recipe used

**Before:**
```tsx
spring(stiffness, damping)
```

**After:**
```tsx
spring(stiffness, damping)
```

**Variant Created:** Yes/No (variant-name if yes)
**Notes:** Optional notes about the refinement
```

---

## Example Entry

### 14:30 - CheckoutButton

**Feedback:** "Feels too sluggish, want Nintendo Switch snap"
**Zone:** decisive
**Recipe:** decisive/Button

**Before:**
```tsx
spring(180, 12)
```

**After:**
```tsx
spring(300, 8)
```

**Variant Created:** Yes (Button.nintendo)
**Notes:** High stiffness + low damping = snappy feel

---

## How to Read This File

1. Each `### HH:MM` section is one refinement
2. Feedback maps to physics adjustment
3. Before/After shows the delta
4. Variant indicates if pattern was worth keeping

## How Claude Uses This

Claude parses recent history to:
- Learn feedback → physics patterns
- Calculate average adjustments for similar feedback
- Suggest variants based on successful refinements
