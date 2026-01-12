# Sigil Grimoire

> Design context framework for consistent AI-driven design decisions.

**Version:** 9.0.0  
**Codename:** Core Scaffold

## Structure

```
grimoires/sigil/
├── constitution/     # Core design laws (physics, zones, vocabulary)
├── moodboard/        # Visual references and feel documents
├── process/          # Agent-time utilities (39 modules)
└── state/            # Runtime state (gitignored)
```

## Philosophy

> "Using Sigil IS the experience. Everything else is invisible."

The designer never configures Sigil. The agent reads constitution, infers zone from vocabulary, and applies physics automatically.

## Key Concepts

### Physics
Motion timing that communicates data importance:
- `server-tick` (600ms) - Critical financial actions
- `deliberate` (800ms) - Important confirmations
- `snappy` (150ms) - Casual interactions
- `smooth` (300ms) - Standard transitions

### Zones
Contexts that map to physics:
- `critical` → server-tick (deposit, claim, stake)
- `important` → deliberate (settings, profile)
- `casual` → snappy (navigation, tooltips)

### Component Registry
Path-based tier system:
- `src/components/gold/` - Stable, production-ready
- `src/components/draft/` - Experimental, in development

## Usage

The `/craft` command reads from this grimoire to generate components with correct physics.

---

*Migrated from sigil-mark/ in v9.0*
