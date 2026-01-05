---
name: map
version: "0.5.0"
description: Configure path-based design zones with physics and budgets
agent: mapping-zones
agent_path: .claude/skills/mapping-zones/SKILL.md
preflight:
  - sigil_setup_complete
  - essence_exists
---

# /map

Configure path-based design zones. Maps file paths to zones with physics, materials, and budgets.

## Usage

```
/map              # Review and update zone configuration
/map --add        # Add a new custom zone
/map --paths      # Focus on path mapping only
```

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
    - "**/transaction/**"

transactional:
  paths:
    - "**/dashboard/**"
    - "**/settings/**"
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

## Workflow

1. **Review zones** — Display current zone configuration
2. **Add paths** — Map new paths to zones
3. **Configure physics** — Adjust zone physics if needed
4. **Add custom zone** — Create new zone with `/map --add`
5. **Validate** — Check for path conflicts

## Next Step

After `/map`: Ready to use `/craft` for component generation.
