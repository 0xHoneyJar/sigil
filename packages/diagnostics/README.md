# @sigil/diagnostics

Physics compliance checking and issue detection for Sigil.

## Installation

```bash
pnpm add @sigil/diagnostics
```

## Usage

### Quick Diagnosis

```typescript
import { createDiagnosticsService } from '@sigil/diagnostics'

const diagnosticsService = createDiagnosticsService()

// Diagnose a symptom
const diagnosis = diagnosticsService.diagnose('dialog flickers on open')
console.log(diagnosis)
// **Found: Dialog/Modal Instability** (70% confidence)
// **Cause:** ResponsiveDialog hydration
// ...
```

### Effect Detection

```typescript
import { detectEffect, getExpectedPhysics } from '@sigil/diagnostics'

// Detect effect from keywords
const effect = detectEffect(['claim', 'button'])
console.log(effect) // 'financial'

// Get expected physics for effect
const physics = getExpectedPhysics('financial')
console.log(physics)
// { sync: 'pessimistic', timing: 800, confirmation: true }
```

### Compliance Checking

```typescript
import { checkCompliance, isFullyCompliant } from '@sigil/diagnostics'

const compliance = checkCompliance('financial', {
  behavioral: {
    sync: 'optimistic', // Wrong! Should be pessimistic
    timing: 200,
    confirmation: false,
  },
})

console.log(isFullyCompliant(compliance)) // false
console.log(compliance.behavioral.reason)
// 'sync should be pessimistic, got optimistic; ...'
```

### Pattern Matching

```typescript
import { createDiagnosticsService } from '@sigil/diagnostics'

const diagnosticsService = createDiagnosticsService()

// Match symptoms to patterns
const matches = diagnosticsService.matchPatterns('hydration mismatch flicker')

for (const match of matches) {
  console.log(`${match.pattern.name}: ${match.confidence * 100}%`)
  console.log(match.matchedCause.solution)
}
```

## API

### Service

| Method | Description |
|--------|-------------|
| `analyze(component, code?)` | Analyze component for issues |
| `checkCompliance(effect, physics)` | Check physics compliance |
| `detectEffect(keywords, types?)` | Detect effect type |
| `matchPatterns(symptoms)` | Match symptoms to patterns |
| `diagnose(symptom)` | Get quick diagnosis |

### Detection

| Function | Description |
|----------|-------------|
| `detectEffect(keywords, types?)` | Detect effect from keywords/types |
| `getExpectedPhysics(effect)` | Get expected physics for effect |

### Compliance

| Function | Description |
|----------|-------------|
| `checkBehavioralCompliance(effect, actual)` | Check behavioral physics |
| `checkAnimationCompliance(effect, actual)` | Check animation physics |
| `checkMaterialCompliance(effect, actual)` | Check material physics |
| `checkCompliance(effect, physics)` | Check all physics |
| `isFullyCompliant(compliance)` | Check if fully compliant |

### Patterns

| Function | Description |
|----------|-------------|
| `PATTERNS` | Array of all diagnostic patterns |
| `getPatterns()` | Get all patterns |
| `getPatternsByCategory(category)` | Get patterns by category |
| `getPatternById(id)` | Get pattern by ID |

## Built-in Patterns

- `hydration-media-query` - useMediaQuery hydration mismatch
- `dialog-instability` - Dialog/modal glitches
- `render-performance` - Performance issues
- `layout-shift` - CLS issues
- `server-component-error` - Server component hook errors
- `react-19-changes` - React 19 breaking changes
- `physics-financial-optimistic` - Financial with wrong sync
- `physics-destructive-no-confirm` - Destructive without confirm

## License

MIT
