# Workshop Schema

## Overview

The workshop index is a pre-computed JSON file stored at `.sigil/workshop.json`.
It provides <5ms lookups for framework APIs and component metadata.

## Location

```
.sigil/
└── workshop.json    # Pre-computed index
```

## Schema

```typescript
interface Workshop {
  // Metadata
  indexed_at: string;      // ISO timestamp
  package_hash: string;    // MD5 of package.json
  imports_hash: string;    // MD5 of imports.yaml

  // Content
  materials: Record<string, MaterialEntry>;
  components: Record<string, ComponentEntry>;
  physics: Record<string, PhysicsDefinition>;
  zones: Record<string, ZoneDefinition>;
}
```

## Material Entry

```typescript
interface MaterialEntry {
  version: string;                    // "3.0.0"
  exports: string[];                  // ["motion", "AnimatePresence"]
  types_available: boolean;           // true if .d.ts exists
  readme_available: boolean;          // true if README.md exists
  signatures?: Record<string, string>; // Top 10 type signatures
}
```

### Example

```json
{
  "framer-motion": {
    "version": "11.0.0",
    "exports": ["motion", "AnimatePresence", "useAnimation"],
    "types_available": true,
    "readme_available": true,
    "signatures": {
      "motion": "<T extends keyof HTMLElements>(component: T) => MotionComponent<T>",
      "useAnimation": "() => AnimationControls"
    }
  }
}
```

## Component Entry

```typescript
interface ComponentEntry {
  path: string;           // Relative path from project root
  tier: ComponentTier;    // "gold" | "silver" | "bronze" | "draft"
  zone?: string;          // Zone assignment
  physics?: string;       // Physics profile
  vocabulary?: string[];  // Vocabulary terms
  imports: string[];      // Package dependencies
}
```

### Example

```json
{
  "ClaimButton": {
    "path": "src/sanctuary/gold/ClaimButton.tsx",
    "tier": "gold",
    "zone": "critical",
    "physics": "deliberate",
    "vocabulary": ["claim", "withdraw"],
    "imports": ["framer-motion", "react"]
  }
}
```

## Physics Definition

```typescript
interface PhysicsDefinition {
  timing: string;       // "800ms"
  easing: string;       // "cubic-bezier(0.4, 0, 0.2, 1)"
  description: string;  // Human-readable
}
```

### Example

```json
{
  "deliberate": {
    "timing": "800ms",
    "easing": "cubic-bezier(0.4, 0, 0.2, 1)",
    "description": "Weighty actions that demand attention"
  }
}
```

## Zone Definition

```typescript
interface ZoneDefinition {
  physics: string;      // Physics profile to use
  timing: string;       // Default timing
  description: string;  // Human-readable
}
```

### Example

```json
{
  "critical": {
    "physics": "deliberate",
    "timing": "800ms",
    "description": "Irreversible actions requiring confirmation"
  }
}
```

## Staleness Detection

The workshop tracks content hashes for staleness detection:

| Hash | Source | Triggers Rebuild |
|------|--------|------------------|
| `package_hash` | package.json | Materials section |
| `imports_hash` | .sigil/imports.yaml | Materials section |

## Performance Characteristics

| Operation | Target | Typical |
|-----------|--------|---------|
| Load workshop | <10ms | 5ms |
| Material query | <5ms | <1ms |
| Component query | <5ms | <1ms |
| Physics query | <5ms | <1ms |
| Zone query | <5ms | <1ms |
| Full rebuild | <2s | 500ms |

## File Size

Expected workshop.json sizes:

| Project Size | Materials | Components | File Size |
|--------------|-----------|------------|-----------|
| Small | 10 | 20 | ~50KB |
| Medium | 30 | 100 | ~200KB |
| Large | 50 | 500 | ~1MB |

## Example Queries

```typescript
// Get framer-motion exports
const fm = queryMaterial(workshop, 'framer-motion');
console.log(fm.exports); // ["motion", "AnimatePresence", ...]

// Find gold-tier components
const goldComps = Object.entries(workshop.components)
  .filter(([_, c]) => c.tier === 'gold')
  .map(([name, _]) => name);

// Get physics timing
const timing = queryPhysics(workshop, 'deliberate')?.timing;
// "800ms"
```
