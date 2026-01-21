# Sigil Lens

Formal verification and heuristic linting for Sigil design physics. Part of the [Loa Constructs Triad](../README.md).

## Overview

Lens verifies physics analysis against formal constraints using CEL (Common Expression Language) and heuristic rules. It ensures generated code follows Sigil physics rules and provides correction context when violations are detected.

## Installation

```bash
# From crates.io (coming soon)
cargo install sigil-lens

# From source
cd anchor-rust/lens
cargo build --release
```

## Usage

### Verify Physics

```bash
# Verify physics against all constraints
lens verify --request-id <UUID>

# Verify from file
lens verify --file physics.json

# Output formats
lens verify --request-id <UUID> --output json
```

### Lint Component

```bash
# Lint physics with heuristic checks
lens lint --request-id <UUID>

# Auto-fix where possible
lens lint --request-id <UUID> --fix
```

### List Constraints

```bash
# Show all constraints
lens constraints

# Filter by category
lens constraints --category behavioral
lens constraints --category animation
lens constraints --category protected

# Show enabled only
lens constraints --enabled-only

# JSON output
lens constraints --output json
```

## Request Format

Write requests to `grimoires/pub/requests/<uuid>.json`:

```json
{
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "physics": {
    "effect": "Financial",
    "behavioral": {
      "sync": "pessimistic",
      "timing": 800,
      "confirmation": true
    },
    "animation": {
      "easing": "ease-out",
      "duration": 800
    },
    "material": {
      "surface": "elevated",
      "shadow": "soft",
      "radius": 8
    }
  }
}
```

## Constraint Categories

| Category | Description | Example Constraints |
|----------|-------------|---------------------|
| Behavioral | Timing, sync, confirmation | financial-timing-001, financial-sync-001 |
| Animation | Easing, duration, springs | animation-easing-001 |
| Material | Surface, shadow, radius | material-shadow-001 |
| Protected | Non-negotiable accessibility | touch-target-001, focus-ring-001 |
| General | Cross-cutting concerns | general-timing-001 |

## Built-in Constraints

### Financial (Critical)
- `financial-timing-001`: Timing >= 800ms
- `financial-sync-001`: Sync must be pessimistic
- `financial-confirmation-001`: Confirmation required

### Destructive (Critical)
- `destructive-timing-001`: Timing >= 600ms
- `destructive-sync-001`: Sync must be pessimistic
- `destructive-confirmation-001`: Confirmation required

### SoftDelete (Cautious)
- `softdelete-undo-001`: Must have undo capability

### Standard
- `standard-timing-001`: Timing around 200ms
- `standard-sync-001`: Should use optimistic sync

## Correction Context

When violations are detected, Lens provides a correction context:

```json
{
  "violations": [
    {
      "constraint_id": "financial-timing-001",
      "rule": "Financial operations require minimum 800ms timing",
      "current_value": "400",
      "required_value": "800"
    }
  ],
  "fixes": [
    {
      "target": "behavioral.timing",
      "current_value": "400",
      "required_value": "800",
      "reason": "Financial operations need 800ms for user verification"
    }
  ],
  "attempt": 1,
  "max_attempts": 2
}
```

## Exit Codes

| Code | Meaning | Action |
|------|---------|--------|
| 0 | All constraints passed | Proceed with generation |
| 1 | Constraint violations | Apply fixes or override |
| 20 | Schema validation error | Fix request format |
| 30 | I/O error | Check file permissions |

## Heuristic Rules

Beyond formal constraints, Lens applies heuristic checks:

| Rule | Description |
|------|-------------|
| touch-target | Interactive elements >= 44px |
| nesting-depth | JSX nesting <= 10 levels |
| element-count | Component elements <= 50 |
| interactive-balance | Click handlers have corresponding keyboard handlers |

## Integration with Sigil

Lens is invoked automatically by `/craft` when:
- Effect is Financial, Destructive, or SoftDelete
- User confirms physics analysis
- Correction loop is active (retry after violations)

See `.claude/rules/22-sigil-anchor-lens.md` for integration details.

## Library Usage

```rust
use sigil_lens_core::{
    verify_constraints,
    types::physics::{PhysicsAnalysis, BehavioralPhysics},
};

let physics = PhysicsAnalysis {
    effect: "Financial".to_string(),
    behavioral: BehavioralPhysics {
        sync: "pessimistic".to_string(),
        timing: 800,
        confirmation: true,
        has_undo: false,
    },
    animation: None,
    material: None,
    metadata: None,
};

let results = verify_constraints(&physics)?;
for result in &results {
    if !result.passed {
        println!("Violation: {}", result.message);
    }
}
```

## Tree-sitter Integration

Lens uses tree-sitter for parsing TypeScript/TSX components:

```rust
use sigil_lens_core::parser::ComponentParser;

let parser = ComponentParser::new()?;
let source = r#"
function Button({ onClick }) {
    return <button onClick={onClick}>Click me</button>;
}
"#;

let metrics = parser.analyze(source)?;
println!("Elements: {}", metrics.element_count);
println!("Hooks: {:?}", metrics.hooks);
```

## License

MIT License - see [LICENSE](../LICENSE)
