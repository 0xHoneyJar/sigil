# Legacy Documentation Inventory

> Generated: 2026-01-01
> Target: sigil

## Non-Framework Documentation Files

| File | Type | Lines | Key Topics | AI Guidance Quality |
|------|------|-------|------------|---------------------|
| README.md | Product | 144 | Installation, Commands, Workflow | Good - Clear user guide |
| CLAUDE.md | AI Guidance | 213 | Agent Protocol, Zone System, Philosophy | Excellent - Detailed agent instructions |
| AGENTS.md | Agent | 41 | Beads workflow, Session completion | Good - Operational guide |
| LICENSE.md | Legal | 41 | AGPL v3 license | N/A |
| .beads/README.md | Internal | ? | Beads configuration | Internal |

## AI Guidance Quality Assessment (CLAUDE.md)

| Criteria | Score | Notes |
|----------|-------|-------|
| Lines | 213 | Sufficient depth |
| Tech Stack | Yes | Describes Bash + YAML + Markdown |
| Patterns | Yes | Zone system, pattern preferences |
| Warnings | Yes | What to avoid (don't refuse, just warn) |
| **Overall Score** | 7/7 | Excellent AI guidance |

## Claims Extracted from Documentation

### From README.md

| Claim | Location | Type |
|-------|----------|------|
| "7 commands available" | README:49-59 | Feature |
| "Zone system uses path-based context" | README:96-108 | Architecture |
| "Version 2.0.0" | README:139 | Version |
| "MIT License" | README:143 | CONFLICT - Actually AGPL |

### From CLAUDE.md

| Claim | Location | Type |
|-------|----------|------|
| "Available Skills: 7" | CLAUDE.md:157-165 | Feature |
| "Commands: 7" | CLAUDE.md:20-28 | Feature |
| "Zone resolution via .sigilrc.yaml" | CLAUDE.md:53-58 | Architecture |
| "Warn on rejected patterns, don't refuse" | CLAUDE.md:69-84 | Behavior |

### From AGENTS.md

| Claim | Location | Type |
|-------|----------|------|
| "Uses bd (beads) for issue tracking" | AGENTS.md:3 | Integration |
| "MUST push before ending session" | AGENTS.md:28 | Behavior |

## Documentation Conflicts Detected

| Conflict | Sources | Resolution |
|----------|---------|------------|
| License: "MIT" vs "AGPL" | README:143 vs LICENSE.md | LICENSE.md is source of truth (AGPL) |
| Commands count: 7 | Docs say 7, code has 4 Sigil + 16 Loa | Documentation outdated |
| Skills count: 7 | Docs say 7, code has 4 Sigil + 10 Loa | Documentation outdated |
