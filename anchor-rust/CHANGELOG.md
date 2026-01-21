# Changelog

All notable changes to the Sigil Anchor & Lens CLIs will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-20

### Added

#### Anchor CLI (`sigil-anchor`)
- **Zone/Effect Validation**: Map keywords to physics zones (Critical, Cautious, Standard)
- **Effect Detection**: Detect Financial, Destructive, SoftDelete, Standard, Local, Navigation effects
- **Data Source Verification**: Validate correct data source for use cases (on-chain vs indexed)
- **Vocabulary Publishing**: Export vocabulary.yaml and zones.yaml to pub/ directory
- **Exit Code System**: Consistent exit codes (0=success, 10=critical, 11=cautious, 12=standard, 20=schema, 30=I/O)

#### Lens CLI (`sigil-lens`)
- **CEL Constraint Engine**: Formal verification using Common Expression Language
- **Constraint Categories**: timing, confirmation, sync, undo, animation constraints
- **Heuristic Linting**: Tree-sitter based code analysis for TSX components
- **Correction Context**: Actionable fix suggestions when violations detected
- **Constraint Publishing**: Export constraints.yaml to pub/ directory

#### Shared Infrastructure
- **pub/ Directory IPC**: Request/response communication via `grimoires/pub/`
- **UUID-Based Requests**: Secure request identification with full UUID validation
- **Security Hardening**: Path traversal prevention, file size limits, input validation
- **Advisory Locking**: Safe concurrent file access using `fs2`
- **TTL Cleanup**: Automatic cleanup of stale files after 1 hour
- **Parallel Execution**: Run anchor and lens validation concurrently

#### Integration
- **Sigil Rules**: New rule `22-sigil-anchor-lens.md` for /craft integration
- **Correction Loop**: Max 2 attempts to fix violations before user escalation
- **Violation UX**: Clear violation boxes with apply/override/cancel options
- **Taste Logging**: Validation results logged to taste.md for learning

### Performance

| CLI | Target | Actual |
|-----|--------|--------|
| Anchor validate | <100ms | ~10ms |
| Lens verify | <200ms | ~27ms |

### Security

- Path traversal prevention in request ID validation
- UUID validation for all request IDs (RFC 4122)
- File size limits (1MB max request size)
- Sandboxed I/O to grimoires/pub/ directory only
- No shell execution or network access
- Deterministic output for reproducibility

### Dependencies

- Rust 2021 edition
- CEL interpreter 0.8 for constraint evaluation
- Tree-sitter 0.24 for TSX parsing
- Alloy 1.0 for Ethereum RPC (optional)

## [Unreleased]

### Planned
- Cross-platform testing (Windows, Linux)
- Release automation via GitHub Actions
- Homebrew formula for easy installation
- VS Code extension integration
