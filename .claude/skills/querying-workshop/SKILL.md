# Querying Workshop

## Purpose

Fast lookups from the pre-computed workshop index.
Provides <5ms access to framework APIs and component signatures.

## Trigger

- /craft command needs framework context
- Component generation requires imports
- Physics resolution needs timing values

## Performance Target

- All queries: <5ms from workshop
- Fallback queries: <50ms from node_modules

## Query Types

### Material Query

Look up framework/library information:

```typescript
const material = queryMaterial(workshop, 'framer-motion');
// Returns: { version, exports, types_available, signatures }
```

### Component Query

Look up Sanctuary component:

```typescript
const component = queryComponent(workshop, 'ClaimButton');
// Returns: { path, tier, zone, physics, vocabulary, imports }
```

### Physics Query

Look up physics definition:

```typescript
const physics = queryPhysics(workshop, 'deliberate');
// Returns: { timing, easing, description }
```

### Zone Query

Look up zone definition:

```typescript
const zone = queryZone(workshop, 'critical');
// Returns: { physics, timing, description }
```

## Source Resolution

Query results include source tracking:

- `workshop` - From pre-computed index (fastest)
- `seed` - From seed file (no rebuild needed)
- `fallback` - From direct file read (slower)

```typescript
interface QueryResult<T> {
  found: boolean;
  data: T | null;
  source: 'workshop' | 'seed' | 'fallback';
}
```

## Fallback Behavior

If workshop lacks a signature:
1. Read from `node_modules/{pkg}/dist/index.d.ts`
2. Parse specific export
3. Cache result in memory
4. Log fallback decision

## Integration

```typescript
import { ensureWorkshopReady, queryMaterial } from 'sigil-mark/process';

// Get workshop (rebuilds if stale)
const { workshop } = await ensureWorkshopReady(projectRoot);

// Query with <5ms performance
const motion = queryMaterial(workshop, 'framer-motion');
```
