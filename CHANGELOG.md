# Changelog

All notable changes to Sigil will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-01-02

### Why This Release

**Sigil v3** introduces the Constitutional Design Framework — a four-pillar architecture that protects both intended soul (Immutable Values) and emergent soul (Canon of Flaws). V3 adds layered decision authority, user persona validation, and feature proving at scale.

> "Culture is the Reality. Code is Just the Medium."

### Added

- **Soul Binder (Pillar 1)**: Protect core values and emergent behaviors
  - Immutable Values: Hard-block violations of core principles
  - Canon of Flaws: Protect beloved "bugs" from optimization
  - Visual Soul: Grit signatures for cultural validation (future)

- **Lens Array (Pillar 2)**: Multi-truth validation system
  - User persona definitions with priority ordering
  - Most constrained lens = truth test
  - Immutable properties that cannot vary between lenses
  - Lens stacking and conflict resolution

- **Consultation Chamber (Pillar 3)**: Layered decision authority
  - Strategic: Community poll, binding vote
  - Direction: Sentiment gathering, Taste Owner decides
  - Execution: Taste Owner dictates
  - Time-based decision locking (180/90/30 days)

- **Proving Grounds (Pillar 4)**: Feature validation at scale
  - Domain-specific monitors (DeFi, Creative, Community, Games)
  - Proving periods (7/14/30 days)
  - Graduation with Taste Owner sign-off
  - Living Canon for graduated features

- **Progressive Strictness**
  | Level | Behavior |
  |-------|----------|
  | `discovery` | All suggestions, no blocks |
  | `guiding` | Warnings on violations |
  | `enforcing` | Blocks on protected flaws/values |
  | `strict` | Blocks on all violations |

- **New Commands**
  | Command | Purpose |
  |---------|---------|
  | `/canonize` | Protect emergent behaviors |
  | `/consult` | Start decision consultation |
  | `/prove` | Register feature for proving |
  | `/graduate` | Graduate feature to canon |

- **Updated Commands**
  | Command | Changes |
  |---------|---------|
  | `/setup` | Creates v3 directory structure |
  | `/envision` | Extended for values + lenses |
  | `/craft` | Respects flaws, values, lenses, decisions |

- **Helper Scripts**
  - `get-strictness.sh` — Return current strictness level
  - `get-monitors.sh` — Get domain-specific monitors
  - `get-lens.sh` — Detect lens for file path
  - `check-flaw.sh` — Check if component affects flaws
  - `check-decision.sh` — Check for locked decisions

- **JSON Schema Validation**
  - Schemas for all YAML config files
  - `test-schemas.sh` for validation
  - `test-helpers.sh` for script testing

- **Audit Trail**: All human overrides logged to `sigil-mark/audit/overrides.yaml`

- **Migration Guide**: `MIGRATION-V3.md` for v2 → v3 migration

### Changed

- **Directory Structure**: Four-pillar organization
  ```
  sigil-mark/
  ├── soul-binder/           # Values + Flaws
  ├── lens-array/            # User personas
  ├── consultation-chamber/  # Decisions
  ├── proving-grounds/       # Feature proving
  ├── canon/                 # Graduated features
  └── audit/                 # Override logging
  ```

- **Configuration Schema**: Updated `.sigilrc.yaml` for v3
  - Added `strictness` field
  - Added `taste_owners` configuration
  - Added `domains` for proving monitors
  - Added `consultation` settings
  - Added `proving` settings

### Breaking Changes

- **v2 → v3 Migration Required**
  - Zones replaced by Lenses (user personas)
  - Rejections replaced by Canon of Flaws
  - New strictness levels control blocking behavior
  - See `MIGRATION-V3.md` for migration steps

### Philosophy

Sigil v3 follows constitutional design principles:

1. **Soul Protection**: Both intended and emergent soul are protected
2. **Multiple Truths**: Different users can have different valid experiences
3. **Layered Authority**: Not every decision needs community input
4. **Prove at Scale**: Features must demonstrate stability before becoming canonical
5. **Human Accountability**: All automated decisions can be overridden (with logging)

---

## [2.0.0] - 2026-01-02

### Why This Release

**Sigil v2** is a complete reimagining of the framework. The original v1 was built on top of Loa's enterprise workflow patterns. V2 strips away that complexity to focus purely on what Sigil does best: **capturing and preserving design context for AI-assisted development**.

This is a breaking change from v1, but a much simpler, cleaner foundation.

### Added

- **Zone System**: Path-based design context for different areas of your app
  - Configure zones in `.sigilrc.yaml`
  - Each zone has its own motion profile (deliberate, playful, snappy)
  - Pattern preferences and warnings per zone

- **Motion Recipes**: Pre-built animation hooks for different contexts
  - `useDeliberateEntrance` - Critical zones (800ms+, tension: 120)
  - `usePlayfulBounce` - Marketing zones (bouncy, tension: 200)
  - `useSnappyTransition` - Admin zones (<200ms, tension: 400)

- **Core Commands**
  | Command | Purpose |
  |---------|---------|
  | `/setup` | Initialize Sigil on a repo |
  | `/envision` | Capture product moodboard (interview) |
  | `/codify` | Define design rules (interview) |
  | `/craft` | Get design guidance during implementation |
  | `/approve` | Human sign-off on patterns |
  | `/inherit` | Bootstrap from existing codebase |
  | `/update` | Pull framework updates |

- **Skills Architecture**: 3-level structure for all skills
  - Level 1: `index.yaml` - Metadata (~100 tokens)
  - Level 2: `SKILL.md` - Instructions (~2000 tokens)
  - Level 3: `scripts/` - Bash utilities

- **State Zone Structure**
  ```
  sigil-mark/
  ├── moodboard.md    # Product feel, references, anti-patterns
  ├── rules.md        # Design rules by category
  └── inventory.md    # Component list with zone assignments
  ```

- **Rejections Philosophy**: Warn, don't block
  - Patterns to avoid are documented with reasons
  - Agents explain concerns and offer alternatives
  - Users can always override

- **Version Tracking**: `.sigil-version.json` for framework versioning

### Changed

- **Complete Architecture Rewrite**: Simplified from Loa's 8-phase enterprise workflow
- **Separate Identity**: Sigil now has its own documentation (README, INSTALLATION, PROCESS)
- **Focused Scope**: Design context only, no product development workflow

### Breaking Changes

- **v1 → v2 Migration**: This is a complete rewrite
  - Old v1 commands are replaced with new v2 commands
  - State zone changed from mixed structure to `sigil-mark/`
  - Configuration changed to `.sigilrc.yaml`

### Coexistence with Loa

Sigil v2 can coexist with Loa on the same repository:
- Separate state zones (`sigil-mark/` vs `loa-grimoire/`)
- Separate configs (`.sigilrc.yaml` vs `.loa.config.yaml`)
- No command conflicts

---

## [1.0.0] - 2025-12-20

### Added

- Initial release of Sigil (built on Loa v0.6.0)
- Design context capture commands
- Basic moodboard and rules structure

[3.0.0]: https://github.com/zksoju/sigil/releases/tag/v3.0.0
[2.0.0]: https://github.com/zksoju/sigil/releases/tag/v2.0.0
[1.0.0]: https://github.com/zksoju/sigil/releases/tag/v1.0.0
