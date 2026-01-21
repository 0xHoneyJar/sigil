# Sprint Plan: Release Format Standardization

**PRD:** `grimoires/loa/prd-release-format.md`
**SDD:** `grimoires/loa/sdd-release-format.md`
**Created:** 2026-01-21

---

## Overview

| Aspect | Value |
|--------|-------|
| Total Sprints | 1 |
| Sprint Duration | Single session |
| Team | Claude + User |
| Scope | Template creation + v3.3.0 release update |

This is a lightweight documentation task requiring no code changes. All work can be completed in a single sprint.

---

## Sprint 1: Release Format Implementation

**Goal:** Create release template and apply new format to v3.3.0 release.

### Task 1.1: Create Release Template File

**Description:** Create `.github/RELEASE_TEMPLATE.md` with major, minor, and patch templates.

**Acceptance Criteria:**
- [ ] File exists at `.github/RELEASE_TEMPLATE.md`
- [ ] Contains major release template with all variables
- [ ] Contains minor release template with all variables
- [ ] Contains patch release template with all variables
- [ ] Includes emoji quick reference table
- [ ] Uses em-dash (—) not hyphen in examples

**Dependencies:** None

**Effort:** Small

---

### Task 1.2: Update v3.3.0 GitHub Release

**Description:** Apply new release format to the upcoming v3.3.0 release notes.

**Acceptance Criteria:**
- [ ] Title follows format: `v3.3.0 — Unified Mount Experience`
- [ ] Body uses minor release template structure
- [ ] Emojis only on section headers
- [ ] Highlights section present with key features
- [ ] What's New table included
- [ ] Quick Start section with installation commands
- [ ] Documentation links to CHANGELOG, TROUBLESHOOTING, COMPATIBILITY

**Dependencies:** Task 1.1 (template created)

**Effort:** Small

---

### Task 1.3: Commit and Document

**Description:** Commit the release template and update PR if needed.

**Acceptance Criteria:**
- [ ] Template committed with descriptive message
- [ ] PR description references new release format (if applicable)

**Dependencies:** Task 1.1, Task 1.2

**Effort:** Trivial

---

## Deliverables Summary

| Deliverable | Path | Status |
|-------------|------|--------|
| Release Template | `.github/RELEASE_TEMPLATE.md` | Pending |
| v3.3.0 Release Notes | GitHub Release (draft) | Pending |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Template completeness | All 3 release types covered |
| Format consistency | Matches Loa release style |
| Scannable | Release intent clear in <30 seconds |

---

## Notes

- This is a process/documentation change only
- No code modifications required
- Backfilling v3.2.0 is optional (P2) and not included in this sprint
- Future releases should use the template as a starting point
