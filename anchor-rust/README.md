# Sigil Constructs: Anchor & Lens

Formal verification CLIs for Sigil design physics. These tools validate that generated UI components follow the correct physics rules before code generation.

## The Triad

| Construct | Role | Invocation |
|-----------|------|------------|
| **Anchor** | Validate keywords → zones, detect effects | `anchor validate` |
| **Lens** | Verify physics + lint components | `lens lint` |
| **Claude** | Generate code with physics | `/craft` |

## Quick Start

```bash
# Build both CLIs
cargo build --release

# Validate a physics request
./target/release/anchor validate --request <UUID>

# Verify physics constraints
./target/release/lens verify --request-id <UUID>

# Lint a component
./target/release/lens lint --file component.tsx
```

## Architecture

```
anchor-rust/
├── Cargo.toml          # Workspace manifest
├── anchor/             # Ground truth enforcement
│   ├── src/
│   │   ├── commands/   # validate, check-source, publish
│   │   ├── types/      # vocabulary, zones, requests
│   │   └── io.rs       # pub/ directory I/O
│   └── README.md
├── lens/               # Formal verification + heuristics
│   ├── src/
│   │   ├── cel/        # CEL constraint engine
│   │   ├── commands/   # verify, lint
│   │   ├── heuristics/ # Tree-sitter based checks
│   │   ├── parser/     # TSX parsing
│   │   └── correction/ # Fix suggestions
│   └── README.md
└── grimoires/pub/      # Shared request/response directory
    ├── requests/       # Input requests (UUID.json)
    └── responses/      # Output responses (UUID.json)
```

## Communication Protocol

Anchor and Lens communicate via the shared `grimoires/pub/` directory:

1. **Write Request**: Claude writes physics analysis to `pub/requests/<uuid>.json`
2. **Validate**: `anchor validate --request-id <uuid>` checks zone/effect mapping
3. **Verify**: `lens verify --request-id <uuid>` checks formal constraints
4. **Read Response**: Claude reads results from `pub/responses/<uuid>.json`
5. **Correction**: If violations found, apply fixes and retry (max 2 attempts)

## Physics Zones

| Zone | Effects | Constraints |
|------|---------|-------------|
| Critical | Financial, Destructive | Strict timing, confirmation required |
| Cautious | SoftDelete | Undo required, warnings on edge cases |
| Standard | Standard, Local, Navigation | Minimal constraints |

## Exit Codes

Both CLIs use consistent exit codes:

| Code | Meaning |
|------|---------|
| 0 | Success |
| 10 | Critical zone violations |
| 11 | Cautious zone warnings |
| 12 | Standard zone info |
| 20 | Schema validation error |
| 30 | I/O error |

## Security

Both CLIs implement defense-in-depth security measures:

### Input Validation

| Protection | Implementation |
|------------|----------------|
| **Path Traversal** | Request IDs are validated to reject `/`, `\`, and `..` sequences |
| **UUID Validation** | All request IDs must be valid UUIDs (RFC 4122) |
| **File Size Limits** | Requests capped at 1MB to prevent memory exhaustion |
| **Schema Validation** | JSON input validated via serde deserialization |

### File System Safety

| Protection | Implementation |
|------------|----------------|
| **Sandboxed Directory** | All I/O confined to `grimoires/pub/` |
| **Advisory Locking** | Concurrent access uses `fs2` file locks |
| **TTL Cleanup** | Stale files auto-deleted after 1 hour |
| **Gitignore** | Request/response files excluded from version control |

### Best Practices

- **No arbitrary file access**: CLIs only read/write within the pub/ directory
- **No shell execution**: All operations are pure Rust with no shell invocation
- **No network access**: CLIs are offline tools operating on local files
- **Deterministic output**: Same input always produces same output

## Development

```bash
# Run all tests
cargo test --workspace

# Run specific crate tests
cargo test -p sigil-anchor
cargo test -p sigil-lens

# Run integration tests
cargo test --workspace --test integration

# Run E2E workflow test
./tests/e2e_workflow.sh

# Check for warnings
cargo clippy --workspace
```

## Integration with Sigil

These CLIs integrate with the Sigil framework via Claude Code. When `/craft` detects a high-stakes effect (Financial, Destructive, SoftDelete), it:

1. Writes a physics request to `pub/requests/`
2. Runs `anchor validate` and `lens lint` in parallel
3. Reads responses from `pub/responses/`
4. Shows violations/corrections to the user
5. Applies fixes and retries if needed (max 2 attempts)

See `.claude/rules/22-sigil-anchor-lens.md` for the full integration protocol.

## Crates

| Crate | Description | Binary |
|-------|-------------|--------|
| `sigil-anchor` | Zone/effect validation | `anchor` |
| `sigil-lens` | Constraint verification | `lens` |

Both crates expose a library (`sigil_anchor_core`, `sigil_lens_core`) for programmatic use.

## License

MIT License
