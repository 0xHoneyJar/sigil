# Changelog

All notable changes to Sigil are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [5.9.0] - 2026-01-08 "The Lucid Studio"

### Philosophy

This release prioritizes **transparency over magic**. The system is now lucid, direct, and deferential to human agency.

> "Filesystem is truth. Agency stays with the human. Rules evolve."

### Added

- **Live Grep** — Component discovery via ripgrep. No cache, no drift.
- **Type-Driven Physics** — Data schema determines physics, not button names. `Transfer(Money)` ≠ `Transfer(Task)`.
- **Simulation Layer** — Money types require `simulate()` before `commit()`. Preview before irreversible action.
- **Status Propagation** — Non-blocking tier downgrades. Gold imports Draft → becomes Draft.
- **Amendment Protocol** — Constitution violations offer COMPLY/BYPASS/AMEND options.
- **Cohesion Overlay** — Visual context checks, not just pixel rules.
- **Workflow Engine** — Process enforcement. "Cycles, not Sprints."
- **Justification Capture** — Override reasons captured immediately.
- **JIT Polish** — `/polish` command for on-demand standardization.
- **JSDoc Pragmas** — Zero-runtime component metadata via comments.

### Changed

- **useSigilMutation** — Now returns `simulate`, `confirm`, `preview` for Money types.
- **State machine** — Extended to: `idle → simulating → confirming → committing → done`.
- **Skills architecture** — 6 named skills replace ad-hoc capabilities.
- **.sigilrc.yaml** — New `workflow` and `governance` sections.

### Removed

- **sigil.map** — Cached index deleted. Live grep replaces it.
- **Auto-fix on save** — Replaced with JIT polish on demand.
- **Blocking contagion** — Replaced with status propagation.
- **Name-based physics inference** — Replaced with type-driven constitution.

### Migration

See [MIGRATION-v5.9.md](MIGRATION-v5.9.md) for detailed upgrade instructions.

---

## [4.1.0] - 2026-01-07 "Living Guardrails"

### Added

- **useSigilMutation** — Zone+Persona-aware hook that auto-resolves physics.
- **eslint-plugin-sigil** — Lint rules: enforce-tokens, zone-compliance, input-physics.
- **SigilProvider** — Runtime context for zones, personas, and remote config.
- **Remote Soul** — A/B test motion timing without touching code.
- **sigil.map** — Pre-computed component index for fast lookups.

### Changed

- **useCriticalAction** — Deprecated in favor of useSigilMutation.
- **Physics resolution** — Now considers persona overrides and remote vibes.

### Removed

- **ProcessContextProvider** — Node.js fs calls removed from runtime exports.

---

## [4.0.0] - 2026-01-05 "Sharp Tools"

### Added

- **Zone Layouts** — CriticalZone, GlassLayout, MachineryLayout.
- **Physics kernel** — 7 motion profiles (instant, snappy, warm, deliberate, reassuring, celebratory, reduced).
- **Vocabulary layer** — Term → physics mapping.
- **Persona system** — User archetype-based physics overrides.

### Changed

- **Architecture** — Separated Truth (physics) from Experience (rendering).
- **File structure** — Reorganized around kernel/layouts/lenses pattern.

---

## [3.0.0] - 2026-01-01 "Reality Engine"

### Added

- **useCriticalAction** — Main physics hook with time authority.
- **Time authorities** — server-tick, optimistic, hybrid.
- **Lens system** — DefaultLens, StrictLens, A11yLens.
- **LensProvider** — App-wide lens preference.

### Changed

- **Zone detection** — Layouts ARE zones (no file-path resolution).
- **Proprioception** — Components aware of their physics context.

---

## [2.0.0] - 2025-12-15 "The Workshop"

### Added

- **Moodboard** — Product feel capture via /envision.
- **Rules** — Design rules by category via /codify.
- **Sandbox** — Experimentation space for physics testing.

### Changed

- **Command structure** — Unified command interface.
- **State zone** — sigil-mark/ directory structure.

---

## [1.0.0] - 2025-12-01 "First Mark"

### Added

- Initial release.
- Basic zone detection from file paths.
- Simple physics profiles.
- /craft command for design guidance.

---

## Version Naming

| Version | Codename | Theme |
|---------|----------|-------|
| 5.9.0 | The Lucid Studio | Transparency, agency, evolution |
| 4.1.0 | Living Guardrails | Enforcement, remote config |
| 4.0.0 | Sharp Tools | Zones, physics kernel |
| 3.0.0 | Reality Engine | Truth vs Experience |
| 2.0.0 | The Workshop | Moodboard, rules |
| 1.0.0 | First Mark | Initial release |
