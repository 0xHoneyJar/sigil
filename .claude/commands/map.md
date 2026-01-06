---
name: map
version: "1.0.0"
description: Analyze codebase and configure path-based design zones
agent: mapping-zones
agent_path: .claude/skills/mapping-zones/SKILL.md
preflight:
  - sigil_mark_exists
  - essence_exists
---

# /map

Zone Architect — Analyzes codebase structure, suggests zone mappings, and configures path-based design zones. Zones live in Sigil; codebase stays clean.

## Usage

```
/map              # Analyze codebase and review zone configuration
/map --analyze    # Deep analysis: scan codebase, suggest zone mappings
/map --suggest    # Suggest file reorganization (optional, non-destructive)
/map --refine     # Refine existing zones: gaps, conflicts, specificity
/map --add        # Add a new custom zone
/map --paths      # Focus on path mapping only
```

## Philosophy

**Zones adapt to codebases, not vice versa.**

- Zone definitions live in `sigil-mark/resonance/zones.yaml`
- Codebase structure is respected, not dictated
- Glob patterns are flexible enough for any structure
- Suggestions are optional; existing taste is preserved

## Default Zones

| Zone | Physics | Material | Budget |
|------|---------|----------|--------|
| critical | server_authoritative, 600ms | clay | 5 elements |
| transactional | client_authoritative, 0ms | machinery | 12 elements |
| exploratory | client_authoritative, 0ms | glass | 20 elements |
| marketing | client_authoritative, 0ms | glass | 15 elements |
| admin | client_authoritative, 0ms | machinery | 30 elements |

## Path Patterns

Zones use glob patterns for path matching:

```yaml
critical:
  paths:
    - "**/checkout/**"
    - "**/claim/**"
    - "**/withdraw/**"

transactional:
  paths:
    - "**/dashboard/**"
    - "**/settings/**"
    - "**/profile/**"
```

## Zone Resolution

1. Check for `@sigil-zone` comment in file
2. Match path against zone patterns (priority order)
3. Return first matching zone
4. Fall back to default zone

## Outputs

| Path | Description |
|------|-------------|
| `sigil-mark/resonance/zones.yaml` | Zone definitions and mappings |

## Workflow Modes

### Default (`/map`)
- Load current zone configuration
- Scan codebase structure
- Show coverage analysis with suggestions
- Interactive refinement

### Deep Analysis (`/map --analyze`)
- Full codebase scan
- Pattern detection (high-stakes vs low-stakes indicators)
- Generate comprehensive zone map
- Recommended for new or inherited codebases

### Suggest Reorganization (`/map --suggest`)
- Advisory only — no forced changes
- Suggests file moves for better zone alignment
- Respects existing taste and structure
- Option to add paths to zones.yaml instead of moving files

### Refine Zones (`/map --refine`)
- Gap analysis (files using default when they shouldn't)
- Conflict resolution (paths matching multiple zones)
- Specificity suggestions (split broad patterns)

## Next Step

After `/map`: Ready to use `/craft` for component generation with automatic zone physics.
