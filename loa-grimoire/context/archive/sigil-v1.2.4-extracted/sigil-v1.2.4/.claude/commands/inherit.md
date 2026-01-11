---
name: inherit
description: Bootstrap Sigil from an existing codebase
skill: sigil-core
---

# /inherit

Bootstrap Sigil recipes and zones from an existing codebase.

## Usage

```
/inherit
/inherit --dry-run
```

## Behavior

1. Scan for component directories
2. Detect existing patterns (animation values, colors, spacing)
3. Infer zones based on directory structure
4. Generate draft recipes from common patterns
5. Create `.sigilrc.yaml` files per zone
6. Create `sigil-mark/` structure

## Output

```
SCANNING CODEBASE...

Found 47 components in:
  - src/components/ (23)
  - src/features/checkout/ (8)
  - src/features/admin/ (12)
  - src/features/marketing/ (4)

DETECTED PATTERNS:

Spring Physics:
  - spring(180, 12) — found in 15 components (checkout)
  - spring(200, 20) — found in 4 components (marketing)
  - No spring — found in 12 components (admin)

INFERRED ZONES:

  src/features/checkout/
    → Zone: decisive
    → Pattern: Heavy springs, server-tick
    
  src/features/admin/
    → Zone: machinery
    → Pattern: Instant, no animation
    
  src/features/marketing/
    → Zone: glass
    → Pattern: Soft springs, float effects

GENERATING...

Created: sigil-mark/recipes/decisive/Button.tsx
Created: sigil-mark/recipes/decisive/Modal.tsx
Created: sigil-mark/recipes/machinery/Table.tsx
Created: sigil-mark/recipes/glass/HeroCard.tsx

Created: src/features/checkout/.sigilrc.yaml
Created: src/features/admin/.sigilrc.yaml
Created: src/features/marketing/.sigilrc.yaml

NEXT STEPS:
  1. Review generated recipes in sigil-mark/recipes/
  2. Adjust zone configs in .sigilrc.yaml files
  3. Gradually migrate components to import recipes
  4. Run /garden to track coverage
```

## Notes

- Does NOT modify existing components
- Creates draft recipes based on detected patterns
- Human review required before migration
