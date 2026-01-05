---
name: codify
version: "0.5.0"
description: Configure material selection and zone-material mappings
agent: codifying-materials
agent_path: .claude/skills/codifying-materials/SKILL.md
preflight:
  - sigil_setup_complete
  - essence_exists
---

# /codify

Configure material selection for zones. Reviews essence and maps materials to zones based on product feel.

## Usage

```
/codify           # Review and update material mappings
/codify --review  # Review current configuration only
/codify --custom  # Define a custom material
```

## What This Configures

### Zone-Material Mappings

Each zone has a default material:

| Zone | Default Material | Physics |
|------|------------------|---------|
| critical | clay | heavy, spring, depress |
| transactional | machinery | flat, instant, highlight |
| exploratory | glass | refract, ease, glow |
| marketing | glass | refract, ease, glow |
| admin | machinery | flat, instant, highlight |

### Material Selection by Action

| Action Type | Material | Reason |
|-------------|----------|--------|
| Irreversible | clay | Weight communicates consequence |
| Frequent | machinery | Efficiency reduces friction |
| Exploratory | glass | Delight encourages discovery |

## Outputs

| Path | Description |
|------|-------------|
| `sigil-mark/resonance/materials.yaml` | Material definitions (updated) |
| `sigil-mark/resonance/zones.yaml` | Zone-material mappings (updated) |

## Workflow

1. **Load essence** — Read soul statement and references
2. **Analyze fit** — Recommend materials based on references
3. **Review mapping** — Confirm or change zone-material assignments
4. **Customize (optional)** — Define custom materials if needed
5. **Validate** — Check physics consistency

## Physics Validation

Materials are validated against zone authority:
- `server_authoritative` zones → clay (spring waits for tick)
- `client_authoritative` zones → machinery or glass (instant)

## Next Step

After `/codify`: Run `/map` to configure zone path mappings.
