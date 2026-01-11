# Sprint 3 Implementation Report: ESLint Plugin

**Sprint:** v4.1-Sprint-3
**Theme:** Foundation - ESLint Plugin
**Status:** COMPLETED
**Completed:** 2026-01-07
**Implementer:** Claude

---

## Summary

Implemented the `eslint-plugin-sigil` package providing compile-time enforcement of Sigil design system constraints. The plugin includes three rules that work with `.sigilrc.yaml` configuration to enforce design tokens, zone-appropriate animation timing, and keyboard accessibility in admin zones.

---

## Tasks Completed

### v4.1-S3-T1: ESLint Plugin Scaffold

**Status:** COMPLETED

Created the plugin package structure at `packages/eslint-plugin-sigil/`:

| File | Purpose |
|------|---------|
| `package.json` | Dependencies: @typescript-eslint/utils, minimatch, yaml |
| `tsconfig.json` | TypeScript configuration for ESLint plugin development |
| `src/index.ts` | Plugin entry point exporting rules and configs |
| `src/config-loader.ts` | Loads and caches .sigilrc.yaml configuration |
| `src/zone-resolver.ts` | Resolves file paths to zones using minimatch |

**Key Implementation Details:**

1. **Config Loader** (`config-loader.ts`):
   - Walks up directory tree to find `.sigilrc.yaml`
   - Caches parsed config with mtime-based invalidation
   - Exports `MOTION_CONSTRAINTS` for zone-compliance rule
   - Provides default config when `.sigilrc.yaml` not found

2. **Zone Resolver** (`zone-resolver.ts`):
   - Uses minimatch for glob pattern matching
   - Falls back to default zone patterns if not configured
   - Tracks which zones require input physics (admin)
   - Returns `ResolvedZone` with name, config, motion, requiresInputPhysics

---

### v4.1-S3-T2: enforce-tokens Rule

**Status:** COMPLETED

Created `src/rules/enforce-tokens.ts`:

**Detection Patterns:**
- Arbitrary pixel values: `gap-[13px]`, `w-[100px]`
- Arbitrary rem/em values: `p-[2rem]`, `m-[1.5em]`
- Arbitrary color values: `text-[#ff0000]`, `bg-[#123456]`
- Arbitrary percentage values: `w-[50%]`, `h-[100vh]`

**Features:**
- Checks className and class attributes
- Handles string literals: `className="gap-[13px]"`
- Handles expression containers: `className={"gap-[13px]"}`
- Handles template literals: `className={\`gap-[13px] ${condition}\`}`
- Handles string concatenation: `className={"gap-[13px] " + more}`
- Configurable `allowPatterns` for exceptions (e.g., grid-cols)

**Message:**
```
Use token value instead of arbitrary value: [13px]. Consider using a design token from your Sigil configuration.
```

---

### v4.1-S3-T3: zone-compliance Rule

**Status:** COMPLETED

Created `src/rules/zone-compliance.ts`:

**Motion Timing Constraints (ms):**
| Motion | Min | Max |
|--------|-----|-----|
| instant | 0 | 50 |
| snappy | 100 | 200 |
| warm | 200 | 400 |
| deliberate | 500 | 1000 |
| reassuring | 800 | 1500 |

**Detection:**
1. **Framer-motion duration property:**
   - Detects `{ duration: 0.2 }` in object literals
   - Converts seconds to milliseconds (0.2s = 200ms)

2. **Tailwind duration classes:**
   - Detects `duration-100`, `duration-500`, etc. in className
   - Values are already in milliseconds

**Zone Resolution:**
- Resolves zone from file path using zone-resolver
- Loads motion constraints from .sigilrc.yaml
- Supports explicit `zone` option for overrides

**Messages:**
```
Duration 200ms is too fast for critical zone (motion: deliberate). Minimum: 500ms.
Duration 1500ms is too slow for critical zone (motion: deliberate). Maximum: 1000ms.
```

---

### v4.1-S3-T4: input-physics Rule

**Status:** COMPLETED

Created `src/rules/input-physics.ts`:

**Requirements (admin zone only):**
- Elements with `onClick` must have `onKeyDown` (or `onKeyUp`/`onKeyPress`)
- Elements with `onClick` must have `tabIndex`

**Exempt Elements:**
- Native interactive: `button`, `a`, `input`, `select`, `textarea`, `summary`, `details`
- Elements with interactive roles: `role="button"`, `role="link"`, etc.
- Custom elements via `exemptElements` option

**Features:**
- Only enforces in admin zone by default
- Configurable `additionalZones` for other zones requiring keyboard nav
- Handles JSX member expressions (e.g., `motion.div`)

**Messages:**
```
Interactive element in admin zone should have onKeyDown handler for keyboard navigation.
Interactive element in admin zone should have tabIndex for keyboard focus.
```

---

### v4.1-S3-T5: Recommended Config Preset

**Status:** COMPLETED

Created `src/configs/recommended.ts`:

**Configurations:**

1. **recommended** (default):
   - `sigil/enforce-tokens`: `error`
   - `sigil/zone-compliance`: `warn`
   - `sigil/input-physics`: `warn`

2. **strict**:
   - All rules as `error`

3. **relaxed**:
   - All rules as `warn`

**Usage:**
```javascript
// eslint.config.js (flat config)
import sigil from 'eslint-plugin-sigil';

export default [
  sigil.configs.recommended,
];
```

---

## Files Created

```
packages/eslint-plugin-sigil/
├── package.json                    # Plugin package manifest
├── tsconfig.json                   # TypeScript configuration
├── src/
│   ├── index.ts                    # Plugin entry point
│   ├── config-loader.ts            # .sigilrc.yaml loader with caching
│   ├── zone-resolver.ts            # File path to zone resolution
│   ├── configs/
│   │   └── recommended.ts          # Preset configurations
│   └── rules/
│       ├── enforce-tokens.ts       # No arbitrary Tailwind values
│       ├── zone-compliance.ts      # Zone-appropriate timing
│       └── input-physics.ts        # Keyboard nav in admin
└── tests/
    ├── enforce-tokens.test.ts      # enforce-tokens tests
    ├── zone-compliance.test.ts     # zone-compliance tests
    └── input-physics.test.ts       # input-physics tests
```

---

## Architecture Notes

### Plugin Structure
```
┌─────────────────────────────────────────────────────────────────┐
│                    eslint-plugin-sigil                          │
├─────────────────────────────────────────────────────────────────┤
│  index.ts                                                       │
│  ├── exports: rules, configs, meta                              │
│  └── re-exports: loadConfig, resolveZone                        │
├─────────────────────────────────────────────────────────────────┤
│  config-loader.ts                                               │
│  ├── findConfigFile() - walks up directory tree                 │
│  ├── loadConfig() - parses YAML with caching                    │
│  ├── getMotionConstraints() - timing min/max for motion         │
│  └── clearConfigCache() - for testing                           │
├─────────────────────────────────────────────────────────────────┤
│  zone-resolver.ts                                               │
│  ├── resolveZone() - file path → zone                           │
│  ├── isInZone() - check if file in zone                         │
│  ├── getAllZones() - get zone configs                           │
│  └── zoneRequiresInputPhysics() - admin zone check              │
├─────────────────────────────────────────────────────────────────┤
│  rules/                                                         │
│  ├── enforce-tokens.ts - arbitrary value detection              │
│  ├── zone-compliance.ts - timing constraint enforcement         │
│  └── input-physics.ts - keyboard accessibility                  │
├─────────────────────────────────────────────────────────────────┤
│  configs/                                                       │
│  └── recommended.ts - preset configurations                     │
└─────────────────────────────────────────────────────────────────┘
```

### Integration with v4.1 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AGENT TIME                                │
│  zone-reader → persona-reader → vocab-reader → physics-reader   │
└─────────────────────────────────────────────────────────────────┘
                                │
              ┌─────────────────┴─────────────────┐
              ▼                                   ▼
┌─────────────────────────────┐   ┌────────────────────────────────┐
│       COMPILE TIME          │   │           RUNTIME              │
│  eslint-plugin-sigil  ★     │   │  SigilProvider + useSigilMutation
│  • enforce-tokens           │   │  • Auto-resolved physics        │
│  • zone-compliance          │   │  • Persona overrides            │
│  • input-physics            │   │  • Remote soul vibes            │
└─────────────────────────────┘   └────────────────────────────────┘
```

---

## Test Coverage

### enforce-tokens.test.ts
- Valid: Token values, expressions, template literals
- Invalid: Arbitrary px/rem/color/percentage values
- Invalid: Multiple arbitrary values in same className
- Options: allowPatterns for exceptions

### zone-compliance.test.ts
- deliberate zone: 500-1000ms valid, <500ms too fast, >1000ms too slow
- snappy zone: 100-200ms valid, <100ms too fast, >200ms too slow
- warm zone: 200-400ms valid, <200ms too fast, >400ms too slow
- Tailwind duration classes tested alongside framer-motion

### input-physics.test.ts
- Native interactive elements exempt
- Interactive roles exempt
- Full keyboard support valid
- Missing onKeyDown reported
- Missing tabIndex reported
- Non-admin zones skip rule
- Custom exemptElements option

---

## PRD Requirement Mapping

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| FR-3: Token enforcement | COMPLETED | enforce-tokens rule |
| FR-3: Zone timing | COMPLETED | zone-compliance rule |
| FR-3: Keyboard accessibility | COMPLETED | input-physics rule |
| NFR-1: Performance | COMPLETED | Config caching with mtime |
| NFR-2: Type safety | COMPLETED | Full TypeScript |

---

## Dependencies

- `@typescript-eslint/utils: ^6.0.0` - ESLint rule utilities
- `minimatch: ^9.0.0` - Glob pattern matching for zone resolution
- `yaml: ^2.4.0` - YAML parsing for .sigilrc.yaml

---

## Next Steps

1. **Sprint 4:** Vocabulary & Physics Timing
   - physics.yaml with detailed timing definitions
   - vocabulary.yaml with 10 terms
   - Physics and vocabulary readers

2. **Post-Sprint Integration:**
   - Add ESLint plugin to root eslint.config.js
   - Document integration in CLAUDE.md (Sprint 6)

---

## Sign-off

- [ ] Implementation reviewed
- [ ] Tests written
- [ ] Documentation updated
- [ ] Ready for `/audit-sprint`

---

*Generated: 2026-01-07*
*Sprint: v4.1-Sprint-3*
*Theme: ESLint Plugin*
