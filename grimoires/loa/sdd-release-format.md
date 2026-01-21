# SDD: Sigil Release Format Standardization

**Version:** 1.0.0
**Status:** Draft
**Author:** Claude + User
**Date:** 2026-01-21
**PRD Reference:** `grimoires/loa/prd-release-format.md`

---

## 1. Architecture Overview

This SDD describes a lightweight documentation system for standardizing Sigil releases. No code changes are required — this is a process and template implementation.

```
.github/
└── RELEASE_TEMPLATE.md      # Templates for major/minor/patch releases

CHANGELOG.md                  # Detailed changelog (existing, no changes)

GitHub Releases               # High-level release notes (new format)
```

---

## 2. Component Design

### 2.1 Release Template File

**Location:** `.github/RELEASE_TEMPLATE.md`

**Purpose:** Provides copy-paste templates for creating GitHub releases with consistent formatting.

**Structure:**
```markdown
# Release Templates

## Major Release (X.0.0)
[template content]

## Minor Release (0.X.0)
[template content]

## Patch Release (0.0.X)
[template content]

## Emoji Reference
[quick reference table]
```

### 2.2 Template Variables

Templates use placeholder variables for easy substitution:

| Variable | Description | Example |
|----------|-------------|---------|
| `${VERSION}` | Full semver | `3.3.0` |
| `${TITLE}` | Intent-based title | `Unified Mount Experience` |
| `${VISION}` | 1-2 sentence purpose | Why this release matters |
| `${FEATURE_N}` | Feature name | `Single-Command Installation` |
| `${FEATURE_N_DESC}` | Feature description | Brief explanation |
| `${CHANGELOG_LINK}` | Link to CHANGELOG section | `CHANGELOG.md#330` |

---

## 3. Template Specifications

### 3.1 Major Release Template

```markdown
# 🎉 Sigil v${VERSION} — ${TITLE}

${VISION}

## ✨ Highlights

### ${FEATURE_1}
${FEATURE_1_DESC}

### ${FEATURE_2}
${FEATURE_2_DESC}

## 📦 What's Included

| Feature | Description |
|---------|-------------|
| ${ITEM_1} | ${ITEM_1_DESC} |
| ${ITEM_2} | ${ITEM_2_DESC} |

## 🚀 Quick Start

\`\`\`bash
${INSTALL_COMMAND}
\`\`\`

## ⚠️ Breaking Changes

${BREAKING_CHANGES}

## 📚 Documentation

- [Full Changelog](${CHANGELOG_LINK})
- [Migration Guide](${MIGRATION_LINK})
```

### 3.2 Minor Release Template

```markdown
## ${TITLE}

${THEME_SENTENCE}

### ✨ Highlights

- **${FEATURE_1}** — ${FEATURE_1_DESC}
- **${FEATURE_2}** — ${FEATURE_2_DESC}

### Added

- ${ADDED_ITEM} (TASK-XXX)

### Changed

- ${CHANGED_ITEM}

### Fixed

- ${FIXED_ITEM}

### Full Changelog

[CHANGELOG.md#${VERSION_ANCHOR}](${CHANGELOG_LINK})
```

### 3.3 Patch Release Template

```markdown
## ${TITLE}

${FIX_SENTENCE}

### Fixed

- **${ISSUE}** — ${ISSUE_DESC}
  - ${TECHNICAL_DETAIL}

### Full Changelog

[CHANGELOG.md#${VERSION_ANCHOR}](${CHANGELOG_LINK})
```

---

## 4. Emoji Specification

### 4.1 Approved Emoji Set

| Emoji | Unicode | Purpose | Placement |
|-------|---------|---------|-----------|
| 🎉 | U+1F389 | Celebration | Major release title only |
| ✨ | U+2728 | Highlights | Highlights section header |
| 📦 | U+1F4E6 | Package | What's included section |
| 🚀 | U+1F680 | Quick start | Installation section |
| ⚠️ | U+26A0 | Warning | Breaking changes section |
| 🔄 | U+1F504 | Migration | Migration section |
| 🛡️ | U+1F6E1 | Security | Security fixes |
| 🐛 | U+1F41B | Bug | Bug fix highlights (sparingly) |
| 📊 | U+1F4CA | Stats | Statistics section |
| 📚 | U+1F4DA | Docs | Documentation links |

### 4.2 Emoji Rules

1. **Section headers only** — Never on individual list items
2. **Max 5-6 per release** — Avoid visual noise
3. **Patch releases** — May have zero emojis
4. **Consistent mapping** — Same emoji always means same thing

---

## 5. Title Format Specification

### 5.1 Structure

```
vX.Y.Z — [Intent-Based Title]
```

**Character:** Em-dash (—) Unicode U+2014, not hyphen (-) or en-dash (–)

### 5.2 Title Guidelines

| Release Type | Title Style | Example |
|--------------|-------------|---------|
| Major | Vision/Theme | `Design Physics` |
| Minor | Primary Feature | `Unified Mount Experience` |
| Patch | Issue Fixed | `BigInt Safety Fixes` |

### 5.3 Title Constraints

- Maximum 5-6 words
- No version number in title (already in prefix)
- Describes purpose, not feature list
- Uses title case

---

## 6. Implementation Workflow

### 6.1 Release Creation Process

```
1. CHANGELOG.md updated with detailed changes
   ↓
2. Open .github/RELEASE_TEMPLATE.md
   ↓
3. Copy appropriate template (major/minor/patch)
   ↓
4. Replace variables with actual content
   ↓
5. Create GitHub release with formatted content
   ↓
6. Tag follows semver: v3.3.0
```

### 6.2 Checklist for Release Authors

**Before creating release:**
- [ ] CHANGELOG.md is updated with all changes
- [ ] Version bump completed in VERSION.json
- [ ] All PRs merged to main

**Creating release:**
- [ ] Copy correct template from `.github/RELEASE_TEMPLATE.md`
- [ ] Title follows format: `vX.Y.Z — Intent Title`
- [ ] Em-dash used (—), not hyphen
- [ ] Emojis only on section headers
- [ ] All variables replaced
- [ ] CHANGELOG link is correct
- [ ] Tag matches version

**After creating release:**
- [ ] Release appears correctly on GitHub
- [ ] Links work
- [ ] Formatting renders properly

---

## 7. File Deliverables

### 7.1 Files to Create

| File | Purpose | Priority |
|------|---------|----------|
| `.github/RELEASE_TEMPLATE.md` | Release templates | P0 |

### 7.2 Files to Update

| File | Change | Priority |
|------|--------|----------|
| GitHub Release v3.3.0 | Apply new format | P0 |
| GitHub Release v3.2.0 | Backfill format (optional) | P2 |

### 7.3 Files Unchanged

| File | Reason |
|------|--------|
| `CHANGELOG.md` | Already well-formatted, serves different purpose |
| `VERSION.json` | No changes needed |

---

## 8. Example: v3.3.0 Release

**GitHub Release Title:**
```
v3.3.0 — Unified Mount Experience
```

**GitHub Release Body:**
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

## 📚 Documentation

- [Full Changelog](https://github.com/0xHoneyJar/sigil/blob/main/CHANGELOG.md#330---2026-01-21--unified-mount-experience)
- [Troubleshooting Guide](https://github.com/0xHoneyJar/sigil/blob/main/docs/TROUBLESHOOTING.md)
- [Compatibility Matrix](https://github.com/0xHoneyJar/sigil/blob/main/docs/COMPATIBILITY.md)
```

---

## 9. Validation Criteria

### 9.1 Template Validation

| Criterion | Test |
|-----------|------|
| Variables complete | All `${VAR}` placeholders documented |
| Emoji consistency | Each emoji has single defined purpose |
| Markdown renders | Preview in GitHub before publishing |
| Links work | All CHANGELOG links resolve |

### 9.2 Release Validation

| Criterion | Test |
|-----------|------|
| Title format | Matches `vX.Y.Z — Title` |
| Em-dash correct | Character is U+2014 |
| Scannable | Purpose clear in <30 seconds |
| No orphan emojis | All emojis on section headers |

---

## 10. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Inconsistent formatting | Medium | Low | Template + checklist |
| Wrong dash character | High | Low | Copy from template |
| Over-engineered releases | Low | Medium | Patch template is minimal |
| Emoji overload | Medium | Low | Strict 5-6 max rule |

---

## 11. Dependencies

- GitHub Releases feature
- Existing CHANGELOG.md format (no changes)
- Team adoption of new process

---

## 12. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Title clarity | Intent in ≤10 words | Manual review |
| Scannable | <30 seconds to understand | User feedback |
| Emoji consistency | Same emoji = same meaning | Audit |
| Template adoption | 100% of releases | GitHub review |

---

## Source Tracing

| Section | Source |
|---------|--------|
| Template structure | PRD Section 3, Loa releases |
| Emoji guide | PRD Section 3.3 |
| Title format | PRD Section 3.1 |
| Example release | PRD Section 6 |
