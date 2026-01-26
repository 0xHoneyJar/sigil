# Sigil Version Compatibility

This document describes version compatibility between Sigil components.

---

## Version Manifest

Sigil uses `VERSION.json` as the single source of truth for version coordination:

```json
{
  "sigil": "3.3.0",
  "constructs_pack": "3.3.0",
  "rust_cli": "1.0.0",
  "npm_packages": {
    "@thehoneyjar/sigil-hud": "0.1.0",
    "@thehoneyjar/sigil-anchor": "4.3.1",
    "@thehoneyjar/sigil-diagnostics": "0.1.0",
    "@thehoneyjar/sigil-fork": "0.1.0",
    "@thehoneyjar/sigil-lens": "0.1.0",
    "@thehoneyjar/sigil-simulation": "0.1.0",
    "@thehoneyjar/sigil-dev-toolbar": "0.1.0"
  },
  "compatibility": {
    "rust_cli": {
      "min": "1.0.0",
      "recommended": "1.0.0"
    },
    "node": {
      "min": "20.0.0"
    },
    "loa": {
      "min": "0.7.0"
    }
  }
}
```

---

## Compatibility Matrix

### Sigil Version ↔ CLI Version

| Sigil Version | Minimum CLI | Recommended CLI | Notes |
|---------------|-------------|-----------------|-------|
| 3.3.x | 1.0.0 | 1.0.0 | Initial unified release |
| 3.2.x | — | — | CLIs not required |
| 3.1.x | — | — | CLIs not required |

### Sigil Version ↔ npm Packages

| Sigil Version | HUD | Diagnostics | Dev Toolbar |
|---------------|-----|-------------|-------------|
| 3.3.x | 0.1.0+ | 0.1.0+ | 0.1.0+ |
| 3.2.x | 0.1.0 | 0.1.0 | 0.1.0 |

### Sigil Version ↔ Node.js

| Sigil Version | Minimum Node | Recommended Node |
|---------------|--------------|------------------|
| 3.3.x | 20.0.0 | 22.x |
| 3.2.x | 18.0.0 | 20.x |

### Sigil Version ↔ Loa Framework

| Sigil Version | Minimum Loa | Recommended Loa |
|---------------|-------------|-----------------|
| 3.3.x | 0.7.0 | 0.8.x |
| 3.2.x | 0.6.0 | 0.7.x |

---

## Component Dependencies

### Rust CLIs (anchor, lens)

| Component | Dependencies | Notes |
|-----------|--------------|-------|
| anchor | None | Standalone binary |
| lens | None | Standalone binary |

Both CLIs communicate via `grimoires/pub/` filesystem protocol. No network dependencies.

### npm Packages

| Package | Peer Dependencies |
|---------|-------------------|
| `@thehoneyjar/sigil-hud` | `react >= 18.0.0`, `react-dom >= 18.0.0` |
| `@thehoneyjar/sigil-diagnostics` | None |
| `@thehoneyjar/sigil-fork` | `viem >= 2.0.0` |
| `@thehoneyjar/sigil-lens` | `viem >= 2.0.0`, `wagmi >= 2.0.0` |
| `@thehoneyjar/sigil-simulation` | `viem >= 2.0.0` |
| `@thehoneyjar/sigil-dev-toolbar` | `react >= 18.0.0`, `viem >= 2.0.0`, `wagmi >= 2.0.0` |
| `@thehoneyjar/sigil-anchor` | None |

---

## Breaking Change Policy

### Semantic Versioning

Sigil follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (x.0.0): Breaking changes to rules, commands, or APIs
- **MINOR** (0.x.0): New features, backward-compatible
- **PATCH** (0.0.x): Bug fixes, backward-compatible

### What Constitutes a Breaking Change

**Breaking (Major version bump):**
- Removing or renaming a rule file
- Changing physics table values
- Changing command behavior
- Removing protected capabilities
- CLI protocol changes

**Non-Breaking (Minor or Patch):**
- Adding new rules
- Adding new commands
- Improving detection accuracy
- Bug fixes in existing rules
- CLI performance improvements

### Deprecation Policy

1. **Announce** — Deprecation noted in CHANGELOG
2. **Warn** — Feature shows deprecation warning for 1 minor version
3. **Remove** — Feature removed in next major version

---

## Migration Guides

### Migrating to 3.3.x

**From 3.2.x:**

1. **Update constructs:**
   ```bash
   ./scripts/update-sigil.sh --construct
   ```

2. **Install CLIs (new in 3.3.x):**
   ```bash
   ./scripts/install-cli.sh
   ```

3. **Update npm packages:**
   ```bash
   pnpm update @thehoneyjar/sigil-hud
   ```

**Breaking changes:**
- None

**New features:**
- Unified mount experience
- Pre-flight verification
- Rust CLI distribution
- Update mechanism

---

### Migrating to 3.2.x

**From 3.1.x:**

1. **Update constructs:**
   ```bash
   ./scripts/update-sigil.sh --construct
   ```

2. **Install HUD packages (new in 3.2.x):**
   ```bash
   pnpm add @thehoneyjar/sigil-hud
   ```

**Breaking changes:**
- None

**New features:**
- Diagnostic HUD components
- Package architecture (@thehoneyjar scope)

---

## Checking Compatibility

### Pre-flight Check

Run the pre-flight script to verify all dependencies:

```bash
./scripts/preflight-sigil.sh
```

Output shows:
- Node.js version (pass/fail)
- Git availability (pass/fail)
- Loa framework (pass/warn)
- Platform support (pass/fail)
- Rust toolchain (info)

### Version Check

Check installed versions against recommended:

```bash
./scripts/update-sigil.sh --check
```

Output shows:
```
Component          Local      Remote     Status
─────────────────────────────────────────────────
Construct Pack     3.2.0      3.3.0      Update available
anchor CLI         0.0.0      1.0.0      Update available
lens CLI           0.0.0      1.0.0      Update available
```

---

## Platform Support

### Operating Systems

| OS | Architecture | Support | Notes |
|----|--------------|---------|-------|
| macOS | arm64 (Apple Silicon) | Full | Primary development platform |
| macOS | x86_64 (Intel) | Full | |
| Linux | x86_64 | Full | |
| Linux | aarch64 | Full | Cross-compiled |
| Windows | x86_64 | Via WSL | Native not supported |

### Shell Support

| Shell | Support | Notes |
|-------|---------|-------|
| bash 3.x+ | Full | macOS default |
| bash 4.x+ | Full | |
| zsh | Full | |
| fish | Partial | PATH instructions differ |

---

## Reporting Compatibility Issues

If you encounter compatibility issues:

1. **Run diagnostics:**
   ```bash
   ./scripts/preflight-sigil.sh --json > preflight.json
   ./scripts/verify-sigil.sh > verify.txt
   ```

2. **Include in issue:**
   - `preflight.json` output
   - `verify.txt` output
   - OS and architecture (`uname -a`)
   - Node version (`node --version`)
   - Package manager and version

3. **Open issue:** [github.com/0xHoneyJar/rune/issues](https://github.com/0xHoneyJar/rune/issues)
