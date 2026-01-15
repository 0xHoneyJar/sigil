# Sigil Versioning Strategy

Sigil follows [Semantic Versioning 2.0.0](https://semver.org/).

## Version Format

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]

Examples:
1.0.0        # Stable release
1.1.0        # New feature (backward compatible)
1.1.1        # Bug fix
2.0.0        # Breaking change
1.0.0-beta.1 # Pre-release
```

## When to Increment

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Breaking change to physics rules | MAJOR | Changing 800ms → 600ms for financial |
| Breaking change to command API | MAJOR | Removing required argument |
| New command | MINOR | Adding `/ward` |
| New physics layer | MINOR | Adding audio physics |
| New detection keywords | MINOR | Adding "checkout" to financial |
| Bug fix in detection | PATCH | Fixing keyword matching |
| Documentation update | PATCH | Clarifying usage |
| Refactoring (no API change) | PATCH | Internal restructure |

## Two Version Scopes

### 1. Framework Version (Git Tags)

The overall Sigil framework version, tracked via git tags.

```bash
git tag v1.0.0
git push origin v1.0.0
```

**Current release:** v1.3.0 (stable)

### 2. Command Versions (YAML Frontmatter)

Individual command versions in their `.md` files.

```yaml
---
name: "craft"
version: "1.0.0"
---
```

**Rule:** Command versions increment independently but follow SemVer.

## Version Alignment

All Sigil-native commands should share the same MAJOR version as the framework:

| Command | Version | Notes |
|---------|---------|-------|
| `/craft` | 1.3.0 | Core command (session health added) |
| `/ward` | 1.0.0 | Physics audit |
| `/garden` | 1.0.0 | Component authority |
| `/style` | 1.0.0 | Material physics |
| `/animate` | 1.0.0 | Animation physics |
| `/behavior` | 1.0.0 | Behavioral physics |
| `/inscribe` | 1.0.0 | Pattern promotion |
| `/distill` | 1.0.0 | Task decomposition |

Loa-origin commands (e.g., `/audit`, `/setup`) keep their Loa versions.

## Pre-Release Labels

| Label | Meaning | Stability |
|-------|---------|-----------|
| `-alpha.N` | Active development, API unstable | Experimental |
| `-beta.N` | Feature complete, API stabilizing | Testing |
| `-rc.N` | Release candidate, API frozen | Final testing |
| (none) | Stable release | Production |

## Release Process

### For PATCH releases (bug fixes):

```bash
# 1. Make fix
# 2. Update command version if command-specific
# 3. Commit with conventional commit
git commit -m "fix(craft): correct financial keyword detection"

# 4. Tag if releasing
git tag v1.0.1
git push origin v1.0.1
```

### For MINOR releases (new features):

```bash
# 1. Implement feature
# 2. Update command versions
# 3. Update README if needed
# 4. Commit
git commit -m "feat(commands): add /ward for physics audit"

# 5. Tag
git tag v1.1.0
git push origin v1.1.0
```

### For MAJOR releases (breaking changes):

```bash
# 1. Document breaking changes in CHANGELOG.md
# 2. Update all Sigil command versions to new MAJOR
# 3. Update README version
# 4. Commit
git commit -m "feat!: redesign physics detection system

BREAKING CHANGE: Detection now requires explicit effect annotation"

# 5. Tag
git tag v2.0.0
git push origin v2.0.0
```

## Conventional Commits

Use [Conventional Commits](https://www.conventionalcommits.org/) for clear history:

```
feat:     New feature (MINOR)
fix:      Bug fix (PATCH)
docs:     Documentation only (PATCH)
refactor: Code change, no API change (PATCH)
feat!:    Breaking feature (MAJOR)
fix!:     Breaking fix (MAJOR)

Scope examples:
feat(craft): ...
fix(ward): ...
docs(README): ...
```

## Changelog

Maintain `CHANGELOG.md` with:

```markdown
# Changelog

## [1.1.0] - 2025-01-15

### Added
- `/ward` command for physics auditing
- `/garden` command for component authority

### Changed
- `/craft` now supports refine, configure, polish modes

### Fixed
- Financial keyword detection for "checkout"

## [1.0.0] - 2025-01-14

### Added
- Initial stable release
- Core commands: /craft, /style, /animate, /behavior
- Physics rules for behavioral, animation, material
- Taste learning system
- Protected capabilities enforcement
```

## Migration from Pre-1.0

Previous versions (v0.5.0, v2.0.0, v5.0.0, v11.0.0, v11.1.0) did not follow SemVer.
They are deprecated and should not be referenced.

The v1.0.0 release represents the first stable, SemVer-compliant version.
