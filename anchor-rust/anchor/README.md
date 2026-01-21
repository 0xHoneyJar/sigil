# Sigil Anchor

Ground truth enforcement for Sigil design physics. Part of the [Loa Constructs Triad](../README.md).

## Overview

Anchor validates physics keywords against zones, mapping user requests to the correct physics profile before code generation. It ensures that financial operations get pessimistic sync, destructive operations require confirmation, etc.

## Installation

```bash
# From crates.io (coming soon)
cargo install sigil-anchor

# From source
cd anchor-rust/anchor
cargo build --release
```

## Usage

### Validate Physics

```bash
# Validate a physics request from pub/ directory
anchor validate --request <UUID>
```

### Check Data Source

```bash
# Verify correct data source for a use case
anchor check-source --use-case transaction --source indexed
# Exit code 11: Warning - transaction should use on-chain

anchor check-source --use-case display --source indexed
# Exit code 0: OK
```

### Publish Vocabulary/Zones

```bash
# Generate vocabulary.yaml and zones.yaml to pub/
anchor publish
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
    }
  },
  "keywords": ["claim", "rewards"],
  "context": {
    "file_path": "src/components/ClaimButton.tsx",
    "effect_source": "keyword:claim"
  }
}
```

## Exit Codes

| Code | Meaning | Action |
|------|---------|--------|
| 0 | Success | Proceed with generation |
| 10 | Critical zone violation | Must fix before proceeding |
| 11 | Cautious zone warning | Can proceed with caution |
| 12 | Standard zone info | Informational only |
| 20 | Schema validation error | Fix request format |
| 30 | I/O error | Check file permissions |

## Zone Hierarchy

| Zone | Effect Types | Validation Level |
|------|--------------|------------------|
| Critical | Financial, Destructive | Strict - all constraints enforced |
| Cautious | SoftDelete | Warnings for potential issues |
| Standard | Standard, Local, Navigation | Minimal validation |

## Integration with Sigil

Anchor is invoked automatically by `/craft` when:
- Effect is Financial, Destructive, or SoftDelete
- Keywords match Critical or Cautious zones
- User has enabled formal verification

See `.claude/rules/22-sigil-anchor-lens.md` for integration details.

## Library Usage

```rust
use sigil_anchor_core::{
    commands::validate::validate,
    types::{request::ValidateRequest, vocabulary::detect_effect},
};

// Detect effect from keywords
let effect = detect_effect(&["claim", "rewards"]);
assert_eq!(effect, "Financial");

// Validate physics request
let request = ValidateRequest { /* ... */ };
let response = validate(&request)?;
```

## License

MIT License - see [LICENSE](../LICENSE)
