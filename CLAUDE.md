# Sigil: Design Context Framework

> "Make the right path easy. Make the wrong path visible. Don't make the wrong path impossible."

## What is Sigil?

Sigil is a design context framework that helps AI agents make consistent design decisions by:

1. **Providing zone context** — Knowing if you're in "critical" vs "marketing" context
2. **Surfacing design rules** — Colors, typography, spacing, motion patterns
3. **Capturing product feel** — Moodboard with references and anti-patterns
4. **Human accountability** — All validation is human approval, not automation

---

## v4.0 "Sharp Tools" — 7 Discrete Tools

v4.0 consolidates 37 commands into 7 discrete tools with progressive disclosure:

```
CAPTURE              CREATE               OBSERVE
───────              ──────               ───────
/envision            /craft               /observe
/codify

REFINE               DECIDE               TEND
──────               ──────               ────
/refine              /consult             /garden
```

### Progressive Disclosure (L1/L2/L3)

All tools support three grip levels:

| Level | Usage | Example |
|-------|-------|---------|
| L1 | Default behavior | `/craft "button"` |
| L2 | Targeted options | `/craft "button" --zone critical` |
| L3 | Full control | `/craft "button" --zone critical --persona depositor --no-gaps` |

---

## Quick Reference

### Commands (v4.0)

| Command | Purpose | L1 | L2 | L3 |
|---------|---------|----|----|-----|
| `/envision` | Capture product moodboard | Full interview | `--quick` | `--from <file>` |
| `/codify` | Define design rules | Guided interview | `--zone <name>` | `--from <design-system.json>` |
| `/craft` | Get design guidance | Auto-context | `--zone`, `--persona` | `--no-gaps` |
| `/observe` | Visual feedback loop | Capture screen | `--component` | `--screenshot`, `--rules` |
| `/refine` | Incremental updates | Review feedback | `--persona`, `--zone` | `--evidence` |
| `/consult` | Record decisions | 30d lock | `--scope`, `--lock` | `--protect`, `--evidence` |
| `/garden` | Health monitoring | Summary | `--personas`, `--feedback` | `--validate` (CI) |

### Key Files

| File | Purpose |
|------|---------|
| `sigil-mark/moodboard.md` | Product feel, references, anti-patterns |
| `sigil-mark/rules.md` | Design rules by category |
| `sigil-mark/personas/personas.yaml` | User archetypes with evidence |
| `sigil-mark/evidence/` | Analytics, interviews, observations |
| `sigil-mark/.sigil-observations/` | Screenshots and feedback |
| `sigil-mark/consultation-chamber/decisions/` | Locked decisions |
| `.sigilrc.yaml` | Zone definitions with journey context |
| `.sigil-version.json` | Version tracking |

---

## Agent Protocol (v4.0)

### Before Generating UI Code

1. **Check for Sigil setup**: Look for `sigil-mark/` (auto-created by first /envision or /codify)

2. **Load design context** (graceful fallbacks):
   ```
   sigil-mark/moodboard.md     → Product feel
   sigil-mark/rules.md         → Design rules
   sigil-mark/personas/personas.yaml → User archetypes
   sigil-mark/vocabulary.yaml  → Term → feel mapping
   sigil-mark/philosophy.yaml  → Decision hierarchy
   ```

3. **Determine zone**: Match current file path to zones in `.sigilrc.yaml`
   ```yaml
   zones:
     critical:
       paths: ["src/features/claim/**"]
       journey_stage: active
       persona_likely: depositor
       trust_state: critical
   ```

4. **Check active decisions**: Load from `consultation-chamber/decisions/`

5. **Generate code with context**

### Zone Resolution

```
1. Get current file path
2. Read .sigilrc.yaml zones section
3. For each zone, check if path matches any glob pattern
4. Return matching zone with journey context
5. Resolve persona from zone.persona_likely
```

### Gap Detection

At the END of /craft output, surface missing context:

```
═══════════════════════════════════════════════════════════
                     CONTEXT GAPS
═══════════════════════════════════════════════════════════

⚠️ 2 gaps detected that may affect this guidance:

1. UNDEFINED PERSONA: "whale"
   You mentioned "whale users" but no whale persona exists.
   → /refine --persona whale "high-value depositor"

2. MISSING EVIDENCE: depositor persona
   No evidence linked to depositor persona.
   → /refine --persona depositor --evidence analytics.yaml
```

---

## Evidence-Based Context (v4.0)

### Personas with Evidence

```yaml
# sigil-mark/personas/personas.yaml
personas:
  - name: depositor
    trust_level: high
    default_lens: power_user
    source: analytics           # NEW: where data came from
    evidence:                   # NEW: supporting evidence
      - id: EV-2026-001
        summary: "Mixpanel data shows 80% completion"
    journey_stages:             # NEW: which zones they visit
      - discovery
      - onboarding
      - active
    characteristics:
      patience: low
      technical_skill: high
    preferences:
      motion: deliberate
      density: high
    last_refined: "2026-01-07"  # NEW: update tracking
```

### Zones with Journey Context

```yaml
# .sigilrc.yaml
zones:
  critical:
    paths:
      - "src/features/claim/**"
      - "src/features/deposit/**"
    journey_stage: active       # NEW: where in user journey
    persona_likely: depositor   # NEW: expected user
    trust_state: critical       # NEW: building/established/critical
    motion: deliberate
    evidence:                   # NEW: supporting evidence
      - id: EV-2026-002
```

### Evidence Files

```yaml
# sigil-mark/evidence/analytics-2026-01.yaml
source_type: analytics
source_name: Mixpanel
date_range:
  start: "2026-01-01"
  end: "2026-01-31"
metrics:
  - name: deposit_completion
    value: 0.82
insights:
  - "82% of users complete deposits on first try"
  - "Average time to first deposit: 4.2 minutes"
```

---

## /observe Feedback Loop (v4.0)

Visual feedback via Claude in Chrome MCP:

```
/observe                         # Capture current screen
/observe --component ClaimButton # Focus on component
```

### Workflow

```
/craft "button" → generates code
           ↓
/observe → captures screenshot, compares to rules
           ↓
User answers: "Yes — update rules" or "No — fix component"
           ↓
/refine → applies feedback to context
```

### MCP Requirement

- Requires Claude in Chrome extension for automatic screenshots
- Falls back to manual screenshot upload when MCP unavailable

---

## Decision Recording (v4.0)

### Consolidated /consult

```bash
# L1: Quick decision (30d lock)
/consult "button border radius is 8px"

# L2: Scoped decision
/consult "use deliberate motion" --scope critical --lock 90d

# L3: Protected capability
/consult "withdraw must always work" --protect --evidence OBS-2026-001

# Unlock existing decision
/consult DEC-2026-001 --unlock "new user research"
```

### Decision File

```yaml
# consultation-chamber/decisions/DEC-2026-001.yaml
id: "DEC-2026-001"
topic: "Button border radius"
decision: "All buttons use 8px border radius"
scope: execution
protected: false
locked_at: "2026-01-07T14:30:00Z"
expires_at: "2026-02-06T14:30:00Z"
status: locked
evidence:
  - type: observation
    id: OBS-2026-0107-001
context:
  zone: critical
  components: ["*Button*"]
```

---

## Health Monitoring (v4.0)

### /garden Output

```
╔══════════════════════════════════════════════════════════╗
║                    SIGIL HEALTH: 78%                     ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  TOP ISSUES:                                             ║
║  ⚠️ 2 personas lack evidence                             ║
║  ⚠️ 3 feedback sessions unapplied                        ║
║  ℹ️ 2 zones missing journey context                      ║
║                                                          ║
║  Run /garden --personas for details                      ║
╚══════════════════════════════════════════════════════════╝
```

### CI Mode

```bash
/garden --validate  # Returns exit code 0/1
```

---

## Build-Time Export (v4.0)

Export design context for runtime use:

```bash
sigil export-config                    # Default JSON
sigil export-config --minify           # Production
sigil export-config --typescript       # With types
sigil export-config --watch            # Development
```

### Output

```json
{
  "version": "4.0.0",
  "personas": [...],  // Runtime fields only (no evidence)
  "zones": [...],     // Runtime fields only (no paths)
  "vocabulary": {...},
  "philosophy": {...}
}
```

---

## Deprecation Warnings

When you use deprecated commands, you'll see warnings:

| Deprecated | Replacement | Message |
|------------|-------------|---------|
| /setup | (automatic) | "Setup is automatic. First /envision or /codify initializes." |
| /inherit | /envision | "/envision auto-detects existing codebase" |
| /approve | /consult | "Use /consult to record decisions" |
| /canonize | /consult --protect | "Use /consult --protect" |
| /unlock | /consult --unlock | "Use /consult --unlock" |
| /validate | /garden --validate | "Use /garden --validate" |

See `MIGRATION-v4.md` for full migration guide.

---

## Philosophy

> "Sweat the art. We handle the mechanics. Return to flow."

### Decision Hierarchy

When concerns conflict:

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
- Surfaces gaps at end of output

---

## Coexistence with Loa

Sigil and Loa can coexist. They have separate:
- State zones (sigil-mark/ vs loa-grimoire/)
- Config files (.sigilrc.yaml vs .loa.config.yaml)
- Skills (design-focused vs workflow-focused)

No automatic cross-loading — developer decides when to reference design context.

---

*Sigil v4.0.0 "Sharp Tools"*
*Last Updated: 2026-01-07*
