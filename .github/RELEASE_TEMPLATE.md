# Sigil Release Templates

Copy the appropriate template when creating a GitHub release.

**Important:**
- Use em-dash (—) not hyphen (-) in titles
- Emojis only on section headers, max 5-6 per release
- Keep titles ≤5-6 words describing intent, not feature lists

---

## Major Release Template (X.0.0)

**Title:** `vX.0.0 — [Vision/Theme Title]`

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
| [Feature] | [Description] |
| [Feature] | [Description] |

## 🚀 Quick Start

```bash
[Installation command]
```

## ⚠️ Breaking Changes

- [Breaking change with migration path]

## 📊 Stats

| Metric | Count |
|--------|-------|
| Files changed | X |
| New rules | X |

## 📚 Documentation

- [Full Changelog](https://github.com/0xHoneyJar/sigil/blob/main/CHANGELOG.md#version-anchor)
- [Migration Guide](link)
```

---

## Minor Release Template (0.X.0)

**Title:** `vX.Y.0 — [Primary Feature Title]`

```markdown
## [Theme/Purpose Title]

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

### 📚 Full Changelog

[CHANGELOG.md#version](https://github.com/0xHoneyJar/sigil/blob/main/CHANGELOG.md#version-anchor)
```

---

## Patch Release Template (0.0.X)

**Title:** `vX.Y.Z — [Brief Fix Title]`

```markdown
## [Brief Title]

[1 sentence explaining what this fixes]

### Fixed

- **[Issue]** — Description
  - Technical detail if needed

### Full Changelog

[CHANGELOG.md#version](https://github.com/0xHoneyJar/sigil/blob/main/CHANGELOG.md#version-anchor)
```

---

## Emoji Quick Reference

| Emoji | Purpose | When to Use |
|-------|---------|-------------|
| 🎉 | Celebration | Major releases only |
| ✨ | Highlights | Feature highlights section |
| 📦 | Package | What's included tables |
| 🚀 | Quick start | Installation sections |
| ⚠️ | Warning | Breaking changes |
| 🔄 | Migration | Migration sections |
| 🛡️ | Security | Security fixes |
| 🐛 | Bug | Bug fix highlights (sparingly) |
| 📊 | Stats | Statistics sections |
| 📚 | Docs | Documentation links |

---

## Title Examples

| Version | Title Style | Example |
|---------|-------------|---------|
| Major | Vision/Theme | `v4.0.0 — Design Physics` |
| Minor | Primary Feature | `v3.3.0 — Unified Mount Experience` |
| Patch | Issue Fixed | `v3.2.1 — BigInt Safety Fixes` |

---

## Checklist

Before publishing:
- [ ] Title uses em-dash (—), not hyphen
- [ ] Title ≤5-6 words
- [ ] Emojis only on section headers
- [ ] CHANGELOG link is correct
- [ ] Tag matches version (vX.Y.Z)
