# Validating Physics

## Purpose

Physics-only validation that blocks physics violations, not novelty.
Runs via PreToolUse hook on Write|Edit operations.

## Trigger

- PreToolUse hook on Write|Edit tools
- Called before code is written to file
- Can block generation if physics violation found

## Philosophy

> "Block physics violations, not novelty."

This skill enforces physical constraints (timing, easing, zone compatibility)
but **never** blocks based on pattern existence or style novelty.

### What We Block

1. **Zone Violations** — Critical zone + playful physics
2. **Material Violations** — Clay material + instant timing
3. **API Errors** — Incorrect framework API usage
4. **Fidelity Violations** — 3D effects in standard zone

### What We Allow

1. **New Patterns** — Novel approaches that respect physics
2. **Style Variations** — Different visual styles
3. **Experimentation** — Any approach that passes physics checks

## Performance Target

- Validation: <10ms
- No file I/O in hot path (uses workshop)

## Validation Types

### Zone Constraint Checking

Zone physics compatibility:

| Zone | Required Physics | Violation |
|------|-----------------|-----------|
| critical | deliberate | playful, snappy |
| marketing | playful, flashy | deliberate (unless justified) |
| admin | snappy | deliberate |

```typescript
// BLOCKS
<CriticalZone physics="playful"> // ❌ Critical requires deliberate

// ALLOWS
<CriticalZone physics="deliberate"> // ✅
```

### Material Constraint Checking

Material timing compatibility:

| Material | Allowed Timing | Violation |
|----------|---------------|-----------|
| clay | 500ms+ | 0-100ms |
| glass | 100-400ms | 0ms, 500ms+ |
| metal | 50-200ms | 0ms |

```typescript
// BLOCKS
<ClayButton duration={0}> // ❌ Clay requires 500ms+

// ALLOWS
<ClayButton duration={800}> // ✅
```

### API Correctness Verification

Framework API validation using workshop:

```typescript
// BLOCKS
motion.animate // ❌ Not a valid framer-motion export

// ALLOWS
motion.div // ✅ Valid export
```

### Fidelity Ceiling Check

Zone fidelity constraints from fidelity.yaml:

| Zone | Max Fidelity | Violation |
|------|--------------|-----------|
| critical | subtle | 3D, particles |
| marketing | flashy | none |
| admin | minimal | gradients, shadows |

## Hook Response

### ALLOW (no violation)

```json
{
  "allow": true
}
```

### BLOCK (violation found)

```json
{
  "allow": false,
  "reason": "Zone violation: Critical zone requires deliberate physics, got playful",
  "suggestion": "Change physics to 'deliberate' or use a different zone"
}
```

## Integration

```typescript
// In Claude Code settings.json hooks
{
  "hooks": {
    "PreToolUse": {
      "Write|Edit": "validate_physics"
    }
  }
}
```

## Not Checked (Survival's Job)

These are observed, not blocked:

- Pattern repetition
- Style consistency
- Component reuse
- Naming conventions

Survival observes these via PostToolUse hook (Sprint 10).
