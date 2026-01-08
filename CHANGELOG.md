# Changelog

All notable changes to Sigil will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.1.0] - 2026-01-07 — "Living Guardrails"

### Summary

v4.1 adds the **enforcement layer** that makes physics real. Three enforcement surfaces—compile-time (ESLint), runtime (hooks), and agent-time (skills)—all consume the same context. The framework is no longer a "hollow shell"—it has teeth.

### Added

- **`useSigilMutation` Hook** — Zone+Persona-aware mutation hook that auto-resolves physics from context

  ```tsx
  const { execute, state, cssVars } = useSigilMutation({
    mutation: () => api.claim(poolId),
    intent: 'claim',  // From vocabulary.yaml
  });
  // cssVars: { '--sigil-duration': '800ms', '--sigil-easing': 'ease-out' }
  ```

- **`eslint-plugin-sigil`** — Three ESLint rules for compile-time enforcement
  - `sigil/enforce-tokens` — No arbitrary Tailwind values like `[13px]`
  - `sigil/zone-compliance` — Timing must match zone physics
  - `sigil/input-physics` — Admin zones require keyboard navigation

- **`SigilProvider`** — Runtime context provider for zones, personas, and remote config

  ```tsx
  <SigilProvider remoteAdapter={launchDarklyAdapter}>
    <App />
  </SigilProvider>
  ```

- **Physics Kernel** — `sigil-mark/kernel/physics.yaml` defines 7 motion profiles
  - instant, snappy, warm, deliberate, reassuring, celebratory, reduced
  - Each with duration, easing, and constraints

- **Vocabulary Layer** — 10 DeFi terms with recommended physics
  - pot, vault, claim, deposit, withdraw, boost, stake, unstake, harvest, connect
  - Maps intent → motion → CSS values

- **Remote Soul** — A/B test motion timing without code changes
  - `timing_modifier` adjusts duration (0.5 = faster, 2.0 = slower)
  - Kernel-locked values cannot be modified remotely
  - LaunchDarkly/Statsig adapter support

- **`/observe` Skill** — Visual feedback loop with MCP integration
  - Automatic screenshots via Claude in Chrome
  - Falls back to manual screenshot upload
  - L1/L2/L3 progressive disclosure

- **Persona Overrides** — Zone × Persona matrix for differentiated experiences

  ```yaml
  zones:
    critical:
      default_physics: deliberate
      persona_overrides:
        power_user: warm      # Faster for power users
        newcomer: reassuring  # Extra feedback for newcomers
  ```

### Changed

- **Physics Resolution Algorithm** — Zone → Persona Override → Remote Modifier
- **Layout Components** — Now register zone context for `useSigilMutation`
- **Process Layer** — Added `physics-reader.ts` for kernel reading

### Deprecated

- **`useCriticalAction`** — Use `useSigilMutation` instead (deprecation warning added)

### Migration

See [MIGRATION-v4.1.md](MIGRATION-v4.1.md) for complete migration guide.

| v4.0 | v4.1 |
|------|------|
| `useCriticalAction` | `useSigilMutation` |
| Manual physics wiring | Auto-resolved from context |
| No ESLint | `eslint-plugin-sigil` |
| No remote config | Remote Soul adapters |

---

## [4.0.0] - 2026-01-06 — "Sharp Tools"

### Summary

v4.0 collapses 37 commands into **7 discrete tools** with progressive disclosure. Every tool supports L1 (sensible defaults), L2 (targeted options), and L3 (full control).

### Breaking Changes

- **Command Consolidation** — Many v3 commands merged into unified tools

  | v3.0 | v4.0 |
  |------|------|
  | `/setup` | (automatic) |
  | `/inherit` | `/envision` |
  | `/approve` | `/consult` |
  | `/canonize` | `/consult --protect` |
  | `/unlock` | `/consult --unlock` |
  | `/validate` | `/garden --validate` |

### Added

- **Progressive Disclosure** — All 7 tools support three grip levels
  - L1: Sensible defaults, minimal input
  - L2: Targeted options for specific needs
  - L3: Full control for power users

- **Evidence-Based Context** — Personas and zones can cite real evidence

  ```yaml
  personas:
    - name: depositor
      source: analytics
      evidence:
        - id: EV-2026-001
          summary: "Mixpanel shows 80% completion rate"
  ```

- **Visual Feedback Loop** — `/craft` → `/observe` → `/refine` cycle
  - MCP integration for automatic screenshots
  - Structural analysis against rules.md
  - Feedback questions for human judgment

- **Journey-Based Zones** — Zones include journey stage and persona likelihood

  ```yaml
  zones:
    critical:
      journey_stage: active
      persona_likely: depositor
      trust_state: critical
  ```

- **Health Monitoring** — `/garden` for ongoing maintenance
  - Summary health reports
  - Schema validation for CI (`--validate`)
  - Evidence aging detection

- **Build-Time Export** — `sigil export-config` for runtime consumption
  - JSON export for non-Claude environments
  - Minify option for production
  - Watch mode for development

### Changed

- **Tool Naming** — Verbs that describe actions (envision, codify, craft, observe, refine, consult, garden)
- **Gap Detection** — `/craft` shows context gaps with specific `/refine` commands
- **Decision Recording** — `/consult` consolidates all decision locking

### The 7 Tools

| Tool | Purpose |
|------|---------|
| `/envision` | Capture product moodboard |
| `/codify` | Define design rules |
| `/craft` | Get design guidance |
| `/observe` | Visual feedback loop |
| `/refine` | Incremental updates |
| `/consult` | Record decisions |
| `/garden` | Health monitoring |

---

## [3.0.0] - 2026-01-06 — "Living Engine"

### Summary

v3.0 introduces a fundamental architectural split between **Agent-Time** (YAML processing) and **Runtime** (React components). The Process layer is now agent-only and cannot be imported in browser code.

### Breaking Changes

- **ProcessContextProvider removed from runtime** — The `ProcessContextProvider` component no longer works in browser environments. Process layer is now agent-context-only. Use `PersonaProvider` and `ZoneProvider` for runtime context.

  ```tsx
  // v2.6 (BROKEN)
  import { ProcessContextProvider } from 'sigil-mark';

  // v3.0 (CORRECT)
  import { PersonaProvider, ZoneProvider } from 'sigil-mark';
  ```

- **Lens Array renamed to Personas** — The `lens-array/` directory is renamed to `personas/`. Types `LensArray` renamed to `PersonaArray`. Deprecated aliases available with console warnings.

  ```tsx
  // v2.6
  import { readLensArray, type LensArray } from 'sigil-mark/process';

  // v3.0
  import { readPersonas, type PersonaArray } from 'sigil-mark/process';
  ```

- **Process layer is agent-only** — All YAML readers in `sigil-mark/process/` use Node.js `fs` and will crash if imported in browser bundles.

### Added

- **Vocabulary Layer** — Maps product terms to design recommendations. Vocabulary is Sigil's public API surface.

  ```yaml
  # sigil-mark/vocabulary/vocabulary.yaml
  terms:
    - id: vault
      engineering_name: PositionDisplay
      user_facing: ["Vault", "Position"]
      feel:
        critical: { material: fortress, motion: deliberate }
  ```

- **Philosophy Layer (Soul Binder)** — Captures intent hierarchy, principles, and conflict resolution rules.

  ```yaml
  # sigil-mark/soul-binder/philosophy.yaml
  primary_intent: "Make DeFi feel trustworthy"
  principles:
    - id: security_first
      statement: "Security indicators must be visible"
      priority: 1
  ```

- **User Fluidity** — Persona (who) + Zone (where) = Effective Experience. New runtime providers:

  ```tsx
  <PersonaProvider defaultPersona="power_user">
    <ZoneProvider zone="critical">
      <App />
    </ZoneProvider>
  </PersonaProvider>
  ```

- **Behavioral Signals** — Passive observation patterns in vibe-checks.yaml for UX insights without user interruption:
  - `rage_clicking` — User frustration indicator
  - `back_button_loop` — User may be lost
  - `form_abandonment` — Form complexity issues
  - `deep_engagement` — Positive content resonance
  - `information_seeking` — User wants more context
  - `confirmation_friction` — Uncertainty at confirmation dialogs
  - `security_checking` — User verifying security indicators
  - `price_comparison` — Price sensitivity detection

- **Remote Configuration Schema** — Clear separation between marketing-controlled and engineering-controlled values:

  ```yaml
  # sigil-mark/remote-config/remote-config.yaml
  marketing_controlled:
    copy: { hero_headline: { value: "Your Crypto, Your Way" }}
    feature_flags: { show_new_dashboard: { enabled: false }}
  engineering_controlled:
    physics: local_only  # Constitutional constraint
  ```

- **vocabulary-reader.ts** — Functions for reading and querying vocabulary:
  - `readVocabulary()`, `readVocabularySync()`
  - `getTerm()`, `getTermFeel()`, `getTermsForZone()`
  - `formatVocabularySummary()`

- **philosophy-reader.ts** — Functions for reading philosophy and resolving conflicts:
  - `readPhilosophy()`, `readPhilosophySync()`
  - `getPrinciple()`, `getPrinciplesByPriority()`
  - `resolveConflict()`, `getPrimaryIntent()`

- **persona-context.tsx** — Runtime persona provider with localStorage persistence
- **zone-context.tsx** — Runtime zone provider with zone override support

### Changed

- **Zone detection is layout-based** — Zones declared via `<CriticalZone>`, `<MachineryLayout>`, `<GlassLayout>` components, not file paths.
- **Skills rewritten for philosophy alignment** — Skills present options with tradeoffs, not mandates. No more "decide fast" language.
- **Process module has @server-only JSDoc** — Clear documentation that process layer is agent-only.

### Deprecated

- `readLensArray()` — Use `readPersonas()` instead
- `LensArray` type — Use `PersonaArray` instead
- `DEFAULT_LENS_ARRAY` — Use `DEFAULT_PERSONA_ARRAY` instead

### Fixed

- **Browser crash on ProcessContextProvider import** — Process layer now properly separated from runtime
- **Path-based zone detection inconsistencies** — Zones now declared by Layout components

---

## [2.6.0] - 2026-01-05 — "Craftsman's Flow"

### Added

- Process Layer for human-AI collaboration
- Constitution system (protected capabilities)
- Decision locking with time-based expiry
- Persona system (zone-persona mapping)
- Vibe Checks (micro-surveys)
- `/consult` command for decision locking
- `/garden` command for health reports

---

## [2.0.0] - 2025-12-01 — "Reality Engine"

### Added

- Truth vs Experience architecture (Core/Layout/Lens)
- `useCriticalAction` hook with time authority
- `CriticalZone`, `MachineryLayout`, `GlassLayout` components
- `useLens` hook for automatic lens selection
- `DefaultLens`, `StrictLens`, `A11yLens` variants

### Breaking Changes

- `SigilZone` replaced with Layout components
- `useServerTick` replaced with `useCriticalAction`
- `useSigilPhysics` replaced with `useLens`

---

## [1.2.5] - 2025-11-01 — "Zone Provider"

### Added

- Context-based physics via SigilZone
- Zone configuration via file paths
- Material-based styling

---

## [1.0.0] - 2025-10-01 — "Full Workbench"

### Added

- 4-panel tmux workbench
- Material system (decisive, machinery, glass)
- Recipe-based components

---

## [0.5.0] - 2025-09-01 — "Design Physics Engine"

### Added

- Simplified physics model
- Hook-based API

---

## [0.4.x] - 2025-08-01 — "Soul Engine"

### Added

- npm package
- React hooks

---

## [0.3.0] - 2026-01-02

### Why This Release

**Sigil 0.3** introduces the Constitutional Design Framework — a four-pillar architecture that protects both intended soul (Immutable Values) and emergent soul (Canon of Flaws). This release adds layered decision authority, user persona validation, and feature proving at scale.

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

- **Configuration Schema**: Updated `.sigilrc.yaml` for 0.3
  - Added `strictness` field
  - Added `taste_owners` configuration
  - Added `domains` for proving monitors
  - Added `consultation` settings
  - Added `proving` settings

### Breaking Changes

- **0.2 → 0.3 Migration Required**
  - Zones replaced by Lenses (user personas)
  - Rejections replaced by Canon of Flaws
  - New strictness levels control blocking behavior
  - See `MIGRATION.md` for migration steps

### Philosophy

Sigil 0.3 follows constitutional design principles:

1. **Soul Protection**: Both intended and emergent soul are protected
2. **Multiple Truths**: Different users can have different valid experiences
3. **Layered Authority**: Not every decision needs community input
4. **Prove at Scale**: Features must demonstrate stability before becoming canonical
5. **Human Accountability**: All automated decisions can be overridden (with logging)

---

## [0.2.0] - 2026-01-02

### Why This Release

**Sigil 0.2** is a complete reimagining of the framework. The original 0.1 was built on top of Loa's enterprise workflow patterns. 0.2 strips away that complexity to focus purely on what Sigil does best: **capturing and preserving design context for AI-assisted development**.

This is a breaking change from 0.1, but a much simpler, cleaner foundation.

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

- **0.1 → 0.2 Migration**: This is a complete rewrite
  - Old 0.1 commands are replaced with new 0.2 commands
  - State zone changed from mixed structure to `sigil-mark/`
  - Configuration changed to `.sigilrc.yaml`

### Coexistence with Loa

Sigil 0.2 can coexist with Loa on the same repository:
- Separate state zones (`sigil-mark/` vs `loa-grimoire/`)
- Separate configs (`.sigilrc.yaml` vs `.loa.config.yaml`)
- No command conflicts

---

## [0.1.0] - 2025-12-20

### Added

- Initial release of Sigil (built on Loa v0.6.0)
- Design context capture commands
- Basic moodboard and rules structure

[4.1.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v4.1.0
[4.0.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v4.0.0
[3.0.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v3.0.0
[2.6.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v2.6.0
[2.0.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v2.0.0
[1.2.5]: https://github.com/0xHoneyJar/sigil/releases/tag/v1.2.5
[1.0.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v1.0.0
[0.5.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v0.5.0
[0.4.x]: https://github.com/0xHoneyJar/sigil/releases/tag/v0.4.0
[0.3.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v0.3.0
[0.2.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v0.2.0
[0.1.0]: https://github.com/0xHoneyJar/sigil/releases/tag/v0.1.0
