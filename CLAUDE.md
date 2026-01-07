# Sigil: Design Context Framework

> "Make the right path easy. Make the wrong path visible. Don't make the wrong path impossible."

## What is Sigil?

Sigil is a design context framework that helps AI agents make consistent design decisions by:

1. **Providing zone context** — Knowing if you're in "critical" vs "marketing" context
2. **Surfacing design rules** — Colors, typography, spacing, motion patterns
3. **Capturing product feel** — Moodboard with references and anti-patterns
4. **Human accountability** — All validation is human approval, not automation

---

## v3.0 Architecture: Agent-Time vs Runtime

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AGENT TIME (Generation)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ Constitution │  │  Vocabulary  │  │   Personas   │  │ Philosophy │  │
│  │    (YAML)    │  │    (YAML)    │  │    (YAML)    │  │   (YAML)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │
│                              │                                          │
│                    Agent reads & embeds context                         │
│                              ↓                                          │
│                   ┌──────────────────┐                                  │
│                   │   Generated Code │                                  │
│                   └──────────────────┘                                  │
└─────────────────────────────────────────────────────────────────────────┘
                               │
                               ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         RUNTIME (Browser)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │     Core     │  │    Layout    │  │     Lens     │                  │
│  │  (Hooks,     │  │ (CriticalZone│  │ (DefaultLens │                  │
│  │   Physics)   │  │  Machinery)  │  │  StrictLens) │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                         │
│               Pure React, no fs, no YAML parsing                        │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Insight:** Process layer (YAML) is agent-only. Runtime never touches YAML files.

---

## Philosophy

> "Sweat the art. We handle the mechanics. Return to flow."

### What This Means

1. **Sweat the art** — Craftsman deliberation is valuable. Don't rush decisions.
2. **We handle the mechanics** — Agent manages physics, zones, materials.
3. **Return to flow** — Once decided, lock it and move on.

### Decision Hierarchy

When concerns conflict, apply this hierarchy:

| Conflict | Winner | Rationale |
|----------|--------|-----------|
| Trust vs Speed | Trust | Speed can be recovered. Trust cannot. |
| Newcomer vs Power User | Newcomer safety | Power users can customize. |
| Marketing vs Security | Security | Constitution exists for a reason. |

### Agent Role

The agent:
- Presents options with tradeoffs
- Does NOT make taste decisions
- Respects locked decisions
- Cites philosophy when relevant

---

## Quick Reference

### Commands

| Command | Purpose |
|---------|---------|
| `/setup` | Initialize Sigil on a repo |
| `/envision` | Capture product moodboard (interview) |
| `/codify` | Define design rules (interview) |
| `/craft` | Get design guidance during implementation |
| `/consult` | Lock design decisions |
| `/approve` | Human review and sign-off |
| `/inherit` | Bootstrap from existing codebase |
| `/update` | Pull framework updates |
| `/garden` | Health report (recipes, sandboxes, variants) |
| `/validate` | Check recipe compliance across codebase |
| `/unlock` | Early unlock a locked decision |

### Key Files

| File | Purpose |
|------|---------|
| `sigil-mark/moodboard/` | Inspiration collection (v3.1) |
| `sigil-mark/moodboard.md` | Product feel (legacy, if no folder) |
| `sigil-mark/rules.md` | Design rules by category |
| `sigil-mark/inventory.md` | Component list |
| `.sigilrc.yaml` | Zone definitions, rejections |
| `.sigil-version.json` | Version tracking |

---

## Agent Protocol (v3.0)

### Process Layer is Agent-Only

⚠️ **CRITICAL:** The Process layer (YAML readers) is for agent use during code generation only.

**DO NOT** import Process layer in client code:
```typescript
// ❌ WRONG - will crash in browser
import { ProcessContextProvider } from 'sigil-mark';
import { readConstitution } from 'sigil-mark/process';

// ✅ CORRECT - agent/build time only
// Agent reads YAML, embeds context in generated code
```

### Before Generating UI Code

1. **Read Process Context** (at generation time, not runtime)
   - Read Constitution for protected capabilities
   - Read Vocabulary for term → feel mapping
   - Find locked decisions for this zone
   - Get persona for this zone

2. **Determine Zone:**
   - Zones are declared via Layout components (not file paths)
   - What persona maps to this zone?
   - What constraints apply?

3. **Check Constitution:**
   - Does this component touch protected capabilities?
   - Surface warnings (don't block, but inform)

4. **Apply Vocabulary:**
   - What term is being rendered? (e.g., "Pot", "Vault")
   - What feel does vocabulary recommend?
   - Apply term's material/motion, not just zone's default

5. **Generate Code:**
   - Use appropriate Layout + Lens
   - Respect persona physics
   - Configuration via props, NOT ProcessContext

### Zone Detection (Layout-Based)

Zones are declared by wrapping in Layout components:

```tsx
// Zone declared by Layout component
<CriticalZone financial>
  {/* This is in critical zone */}
</CriticalZone>

<MachineryLayout>
  {/* This is in admin zone */}
</MachineryLayout>

<GlassLayout>
  {/* This is in marketing zone */}
</GlassLayout>
```

**NOT** by file path. This is a common misconception from v2.6.

---

## Process Layer (Agent-Only)

The Process layer provides design context during code generation.

### Constitution

Protected capabilities that MUST always work. Never disable, hide, or gate these.

```yaml
# sigil-mark/constitution/protected-capabilities.yaml
protected:
  - id: withdraw
    name: "Withdraw Funds"
    enforcement: block    # CRITICAL - never compromise
    rationale: "Users must always be able to withdraw their funds"
```

### Vocabulary (v3.0)

Maps product terms to design recommendations. **This is the API surface.**

```yaml
# sigil-mark/vocabulary/vocabulary.yaml
terms:
  pot:
    engineering_name: "savings_container"
    user_facing: "Pot"
    mental_model: "Piggy bank, casual saving"
    recommended:
      material: glass
      motion: warm
      tone: friendly
    zones: [marketing, dashboard]

  vault:
    engineering_name: "savings_container"  # Same backend!
    user_facing: "Vault"
    mental_model: "Bank vault, security"
    recommended:
      material: machinery
      motion: deliberate
      tone: serious
    zones: [critical]
```

**Why Vocabulary Matters:**

A "Pot" and a "Vault" might share the same backend, but they evoke different mental models:
- Pot → Piggy bank → Warm, glass, friendly
- Vault → Bank vault → Cold, machinery, secure

Agent checks vocabulary before applying zone defaults.

### Personas (renamed from Lens Array)

User archetypes with physics and constraints.

```yaml
# sigil-mark/personas/personas.yaml
personas:
  power_user:
    alias: "Chef"
    description: "Expert user who lives in the product"
    default_lens: strict
    preferences:
      motion: snappy
      help: on_demand
      density: high

  newcomer:
    alias: "Henlocker"
    description: "New user learning the product"
    default_lens: guided
    preferences:
      motion: reassuring
      help: always
      density: low
```

**Note:** "Lens" now ONLY refers to UI rendering variants (DefaultLens, StrictLens). Use "Persona" for user archetypes.

### Locked Decisions

Design decisions with time-based locks to prevent endless bikeshedding.

```yaml
# sigil-mark/consultation-chamber/decisions/DEC-2026-001.yaml
id: "DEC-2026-001"
topic: "Primary CTA color"
decision: "Blue (#3B82F6)"
scope: direction          # 90-day lock
locked_at: "2026-01-06"
expires_at: "2026-04-06"
status: locked
rationale: "Blue tested highest for trust"
```

---

## Moodboard Folder (v3.1)

A folder-based inspiration collection that agents reference during `/craft`.

### Structure

```
sigil-mark/moodboard/
├── index.yaml          # Optional: curated highlights, featured refs
├── README.md           # Usage instructions
│
├── references/         # Product/app inspiration (organize by source)
│   └── stripe/
│       ├── checkout-flow.md
│       └── confirmation.gif
│
├── articles/           # Synthesized design learnings
│   └── motion-principles.md
│
├── anti-patterns/      # Patterns to avoid
│   └── spinner-anxiety.md
│
├── gtm/                # Brand voice, messaging
│   └── tone-of-voice.md
│
└── screenshots/        # Quick drops (unorganized is fine)
    └── toast-pattern.png
```

### Usage

**Drop files anytime** — No metadata required. Just drop screenshots, markdown notes, or references.

**Optional frontmatter** — Add metadata for better querying:

```markdown
---
source: "Stripe"
zones: [critical]
materials: [decisive]
terms: [deposit]
severity: high  # For anti-patterns
tags: [motion, confirmation]
---

# Stripe Checkout Flow

Content here...
```

### Agent Protocol

During `/craft`, read the moodboard folder:

```typescript
import { readMoodboard, getEntriesForZone, getAntiPatterns } from 'sigil-mark/process';

const moodboard = await readMoodboard();
const zoneRefs = getEntriesForZone(moodboard, 'critical');
const antiPatterns = getAntiPatterns(moodboard);
```

Include 1-3 relevant references in DESIGN CONTEXT output.

### Query Helpers

| Function | Purpose |
|----------|---------|
| `getEntriesForZone(moodboard, zone)` | Filter by zone |
| `getAntiPatterns(moodboard, severity?)` | Get anti-patterns |
| `getEntriesForTerm(moodboard, term)` | Filter by vocabulary term |
| `getFeaturedReferences(moodboard)` | Get curated highlights |
| `searchMoodboard(moodboard, query)` | Full-text search |

---

## Runtime Layer

### Core Layer (Runtime)

Physics hooks that manage state streams.

```tsx
const action = useCriticalAction({
  mutation: () => api.doThing(),
  timeAuthority: 'server-tick' | 'optimistic' | 'hybrid',
});

// State stream
action.state.status    // 'idle' | 'confirming' | 'pending' | 'confirmed' | 'failed'

// Actions
action.confirm()       // Enter confirming state
action.commit()        // Execute mutation
```

### Layout Layer (Runtime)

Zone primitives that provide context.

```tsx
<CriticalZone financial={true}>
  {/* Zone context: { type: 'critical', financial: true } */}
  {/* useLens() returns StrictLens */}
</CriticalZone>

<MachineryLayout>
  {/* Zone context: { type: 'admin' } */}
  {/* Keyboard nav: j/k, Enter, Delete */}
</MachineryLayout>

<GlassLayout variant="card">
  {/* Zone context: { type: 'marketing' } */}
  {/* Hover physics: scale 1.02, translateY -4px */}
</GlassLayout>
```

### Lens Layer (Runtime)

Interchangeable UI rendering variants.

```tsx
const Lens = useLens();

// In CriticalZone with financial=true → StrictLens (forced)
// In other zones → User preference or DefaultLens
```

| Lens | Touch Target | Contrast | Animations |
|------|-------------|----------|------------|
| `DefaultLens` | 44px | Standard | Yes |
| `StrictLens` | 48px | High | No |
| `A11yLens` | 56px | WCAG AAA | No |

---

## Dynamic vs Local Configuration (v3.0)

Understanding what CAN be dynamic and what MUST stay local.

### Always Local (Never Remote)

| Aspect | Rationale |
|--------|-----------|
| **Physics** | Affects trust perception. Must be consistent. |
| **Zone definitions** | Architectural choice, not runtime config. |
| **Protected capabilities** | Constitution is sacred. |
| **Security settings** | Never allow remote override. |

### Can Be Dynamic (Remote-Capable)

| Aspect | Controlled By | Example |
|--------|--------------|---------|
| **UI Copy** | Marketing | Hero headline, CTA text |
| **Feature flags** | Marketing/Product | `show_new_dashboard: true` |
| **Survey triggers** | Marketing | Enable/disable specific surveys |
| **Promotions** | Marketing | Seasonal banners |
| **Rate limits** | Engineering | API throttling |
| **Timeouts** | Engineering | Session duration |

### Behavioral Signals (v3.0)

Vibe checks now support passive observation:

```yaml
behavioral_signals:
  - id: rage_clicking
    triggers:
      - event: element_click
        count_threshold: 3
        within_ms: 2000
    insight: "User expects something to happen"
    severity: high
    enabled: true
```

**Signal Categories:**
- `info` — Neutral observation
- `warning` — Potential friction
- `high` — Likely frustration
- `positive` — Good engagement

### Remote Config File

```yaml
# sigil-mark/remote-config/remote-config.yaml
version: "3.0.0"

integration:
  provider: local_yaml  # or launchdarkly, statsig, firebase

marketing_controlled:
  copy:
    hero_headline:
      value: "Your Crypto, Your Way"
  feature_flags:
    show_new_dashboard:
      enabled: false
      rollout_percentage: 0

engineering_controlled:
  physics: local_only  # Constitutional constraint
  rate_limits:
    api_general:
      requests_per_minute: 60
```

---

## File Structure (v3.0)

```
sigil-mark/
├── index.ts                    # Main entry (runtime exports only)
│
├── process/                    # AGENT-ONLY (do not import in browser)
│   ├── index.ts                # Barrel export with @server-only
│   ├── constitution-reader.ts
│   ├── vocabulary-reader.ts    # NEW in v3.0
│   ├── persona-reader.ts       # Renamed from lens-array-reader
│   ├── decision-reader.ts
│   ├── philosophy-reader.ts    # NEW in v3.0
│   ├── vibe-check-reader.ts
│   └── moodboard-reader.ts     # NEW in v3.1
│
├── moodboard/                  # NEW in v3.1 - Inspiration collection
│   ├── README.md
│   ├── index.yaml              # Optional curated highlights
│   ├── references/             # Product inspiration by source
│   ├── articles/               # Synthesized learnings
│   ├── anti-patterns/          # Patterns to avoid
│   ├── gtm/                    # Brand voice, messaging
│   └── screenshots/            # Quick visual drops
│
├── constitution/               # Constitution YAML
│   └── protected-capabilities.yaml
│
├── vocabulary/                 # NEW in v3.0
│   └── vocabulary.yaml
│
├── personas/                   # Renamed from lens-array/
│   └── personas.yaml
│
├── consultation-chamber/       # Decisions YAML
│   └── decisions/*.yaml
│
├── soul-binder/                # NEW in v3.0
│   └── philosophy.yaml
│
├── core/                       # Physics engines (runtime)
│   ├── use-critical-action.ts
│   ├── zone-resolver.ts
│   └── persona-context.tsx     # Runtime persona (NEW in v3.0)
│
├── layouts/                    # Zones + Structural Physics
│   ├── critical-zone.tsx
│   ├── machinery-layout.tsx
│   └── glass-layout.tsx
│
└── lenses/                     # Interchangeable UIs
    ├── default/
    ├── strict/
    └── a11y/
```

---

## Migration from v2.6

### Breaking Changes

1. **ProcessContextProvider removed** — Use agent protocol instead
2. **lens-array/ renamed to personas/** — Update imports
3. **LensArray type renamed to PersonaArray** — Update types
4. **Path-based zone detection removed** — Use Layout components

### Migration Steps

1. Remove `ProcessContextProvider` from your app
2. Update imports: `readLensArray` → `readPersonaArray`
3. Update file paths: `lens-array/` → `personas/`
4. Add `vocabulary.yaml` with your product terms
5. Add `philosophy.yaml` with your intent hierarchy

---

## Coexistence with Loa

Sigil and Loa can coexist. They have separate:
- State zones (sigil-mark/ vs loa-grimoire/)
- Config files (.sigilrc.yaml vs .loa.config.yaml)
- Skills (design-focused vs workflow-focused)

No automatic cross-loading — developer decides when to reference design context.
