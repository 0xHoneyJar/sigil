# PRD: Sigil Release Format Standardization

**Version:** 1.0.0
**Status:** Draft
**Author:** Claude + User
**Date:** 2026-01-21

---

## 1. Problem Statement

Sigil's current release format is detailed but lacks the scannable, high-level clarity that makes releases easy to understand at a glance. Looking at Loa's release structure, each version has:
- A clear **intent** communicated in the title
- **Emoji-based visual hierarchy** for quick scanning
- **High-level summaries** before detailed changes
- **Separation of concerns** between release notes (high-level) and changelog (detailed)

**Current state:** Sigil's CHANGELOG is comprehensive but the GitHub releases don't have the same polish and structure.

**Desired state:** Releases that communicate purpose instantly, are easy to scan, and follow the same quality standard as Loa.

---

## 2. Goals & Success Metrics

### Goals
1. Create a consistent release format that matches Loa's quality
2. Establish clear separation between Release Notes (GitHub) and Changelog (detailed)
3. Make releases scannable in under 30 seconds
4. Communicate the "why" of each release, not just the "what"

### Success Metrics
- Release titles communicate intent in ≤10 words
- Each release has ≤3 highlight sections before details
- Emoji usage is consistent and purposeful
- Users can understand release scope from title + first paragraph

---

## 3. Release Format Specification

### 3.1 Release Title Format

```
vX.Y.Z — [Intent-Based Title]
```

**Examples:**
- `v3.3.0 — Unified Mount Experience`
- `v3.2.0 — Diagnostic HUD & Package Architecture`
- `v3.2.1 — BigInt Safety Fixes`

**Rules:**
- Use em-dash (—) not hyphen (-)
- Title describes the **purpose/intent**, not a feature list
- Major releases can have subtitles in parentheses: `v4.0.0 — Design Physics (Breaking Changes)`

### 3.2 Release Body Structure

#### For Major Releases (X.0.0)

```markdown
# 🎉 Sigil vX.0.0 — [Title]

[1-2 sentence vision statement explaining why this release matters]

## ✨ Highlights

### [Key Feature 1]
[Brief description]

### [Key Feature 2]
[Brief description]

## 📦 What's Included

| Feature | Description |
|---------|-------------|
| ... | ... |

## 🚀 Quick Start

```bash
[Installation/usage command]
```

## ⚠️ Breaking Changes

[List of breaking changes with migration paths]

## 📊 Stats (optional)

| Metric | Count |
|--------|-------|
| ... | ... |

## 📚 Documentation

- [Full Changelog](link)
- [Migration Guide](link)
```

#### For Minor Releases (0.X.0)

```markdown
## [Title Describing Purpose]

[1-2 sentences explaining the theme of this release]

### ✨ Highlights

- **[Feature 1]** — Brief description
- **[Feature 2]** — Brief description

### Added

- [Item] (TASK-XXX)
- [Item]

### Changed

- [Item]

### Fixed

- [Item]

### Full Changelog

[Link to CHANGELOG.md section]
```

#### For Patch Releases (0.0.X)

```markdown
## [Brief Title]

[1 sentence explaining what this fixes]

### Fixed

- **[Issue]** — Description
  - Technical detail if needed

### Full Changelog

[Link]
```

### 3.3 Emoji Usage Guide

| Emoji | Purpose | When to Use |
|-------|---------|-------------|
| 🎉 | Celebration | Major releases only |
| ✨ | Highlights | Feature highlights section |
| 📦 | Package/Contents | What's included tables |
| 🚀 | Quick Start | Installation/usage sections |
| ⚠️ | Warning/Breaking | Breaking changes |
| 🔄 | Migration | Migration guides |
| 🛡️ | Security | Security fixes/features |
| 🐛 | Bug | Bug fixes (sparingly) |
| 📊 | Stats | Statistics sections |
| 📚 | Docs | Documentation links |

**Rules:**
- Use sparingly — max 5-6 different emojis per release
- Emojis mark section headers, not individual items
- Patch releases may have no emojis

### 3.4 Changelog vs Release Notes

| Aspect | GitHub Release | CHANGELOG.md |
|--------|----------------|--------------|
| Purpose | High-level overview | Complete record |
| Audience | Users scanning releases | Users investigating specifics |
| Detail | Intent + highlights | Every change with task IDs |
| Length | 50-200 lines | Unlimited |
| Emojis | Yes (section headers) | Minimal |
| Tables | Summaries only | Detailed breakdowns |

---

## 4. Current Changelog Analysis

Sigil's current CHANGELOG follows Keep a Changelog format well:
- ✅ Semantic versioning
- ✅ Date stamps
- ✅ Added/Changed/Fixed/Removed sections
- ✅ Task ID references
- ✅ Package version tables

**What to keep:** The detailed CHANGELOG format is good.

**What to add:** GitHub Release notes that summarize the CHANGELOG with better visual hierarchy.

---

## 5. Implementation Plan

### Phase 1: Template Creation
- [ ] Create `RELEASE_TEMPLATE.md` with major/minor/patch templates
- [ ] Add to `.github/` directory for easy access

### Phase 2: Apply to Existing Releases
- [ ] Update v3.3.0 release (current PR) with new format
- [ ] Backfill v3.2.0 release notes

### Phase 3: Documentation
- [ ] Add release process to CONTRIBUTING.md
- [ ] Document emoji guide

---

## 6. Example: v3.3.0 Release Notes

```markdown
# ✨ Sigil v3.3.0 — Unified Mount Experience

One command to install everything. Pre-flight checks, Rust CLIs, npm packages, verification — all orchestrated into a seamless mount experience.

## Highlights

### 🚀 Single-Command Installation
```bash
/mount sigil
# or
curl -fsSL https://raw.githubusercontent.com/0xHoneyJar/sigil/main/scripts/mount-sigil.sh | bash
```

### 🛡️ Pre-flight Verification
Automatic checks for Node 20+, git, Loa, and platform support before installation.

### 📦 Rust CLI Distribution
Pre-built binaries for macOS (arm64, x64) and Linux (x64, arm64) with checksum verification.

### 🔄 Update Mechanism
Check for updates and upgrade components individually or all at once.

## What's New

| Feature | Description |
|---------|-------------|
| `mount-sigil.sh` | 4-phase installation orchestrator |
| `install-cli.sh` | Curl-installable CLI installer |
| `update-sigil.sh` | Version checking and upgrades |
| `preflight-sigil.sh` | Pre-installation verification |
| `verify-sigil.sh` | Post-installation validation |

## Quick Start

```bash
# Mount Sigil (from Claude Code)
/mount sigil

# Or manual installation
./scripts/mount-sigil.sh

# Check for updates
./scripts/update-sigil.sh --check
```

## Documentation

- [Full Changelog](https://github.com/0xHoneyJar/sigil/blob/main/CHANGELOG.md#330---2026-01-21--unified-mount-experience)
- [Troubleshooting Guide](https://github.com/0xHoneyJar/sigil/blob/main/docs/TROUBLESHOOTING.md)
- [Compatibility Matrix](https://github.com/0xHoneyJar/sigil/blob/main/docs/COMPATIBILITY.md)
```

---

## 7. Dependencies

- Existing CHANGELOG.md format (no changes needed)
- GitHub Releases feature
- Team agreement on emoji usage

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Inconsistent formatting | Create templates, document process |
| Over-engineering releases | Keep patch releases minimal |
| Emoji overload | Strict usage guide |

---

## Source Tracing

| Section | Source |
|---------|--------|
| Release structure | Loa releases (gh release view v1.0.0, v1.3.1) |
| Current format analysis | CHANGELOG.md:1-150 |
| User requirements | Initial request |
