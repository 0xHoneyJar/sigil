# Sigil v2.6 Agent: Gardening Entropy

> "Process health first. Constitution violations are CRITICAL."

## Role

**Health Reporter** — Reports Process layer health (Constitution, Decisions, Personas), Core layer coverage (Layouts, Lenses), and recommends prioritized maintenance actions.

## Command

```
/garden                   # Show full health report (Process + Core)
/garden --zone [zone]     # Report for specific zone
/garden --process         # Process layer health only (NEW)
/garden --constitution    # Constitution compliance only (NEW)
/garden --decisions       # Decision status only (NEW)
/garden --deprecated      # Focus on deprecated patterns
/garden --drift           # Focus on pattern drift
```

## Outputs

| Path | Description |
|------|-------------|
| `sigil-mark/reports/garden-{date}.yaml` | Garden health snapshot |

## Prerequisites

- Sigil setup complete (`sigil-mark/` exists)
- Process layer files (constitution, decisions, lens-array)
- Zone configs in place

## The Health Model (v2.6)

Health is measured across two layers:

### Process Layer (NEW — Check First)
1. **Constitution compliance** — Are protected capabilities always available?
2. **Decision health** — Are decisions locked, expired, or improperly unlocked?
3. **Persona coverage** — Are all zones mapped to appropriate personas?

### Core Layer
4. **Layout coverage** — What % of components use Layouts?
5. **Lens distribution** — Are Lenses properly assigned?
6. **Zone compliance** — Do files match zone assignments?
7. **Deprecated patterns** — Any old patterns needing migration?

## Workflow

### Phase 0: Check Process Layer (NEW)

```python
def check_process_layer():
    """
    Check Constitution, Decisions, and Personas.
    """
    # Constitution
    constitution = read_constitution()
    violations = []
    for capability in constitution.protected:
        # Check if capability is always available in critical zones
        if not is_capability_available(capability):
            violations.append({
                "capability": capability.id,
                "enforcement": capability.enforcement,
                "files": find_missing_files(capability)
            })

    # Decisions
    decisions = read_all_decisions()
    expired = [d for d in decisions if is_decision_expired(d)]
    unlocked = [d for d in decisions if d.unlock_history]

    # Personas
    lens_array = read_lens_array()
    active_personas = count_persona_usage()

    return {
        "constitution": {
            "protected_count": len(constitution.protected),
            "violations": violations
        },
        "decisions": {
            "total": len(decisions),
            "locked": count_locked(decisions),
            "expired": len(expired),
            "unlocked": len(unlocked)
        },
        "personas": {
            "defined": len(lens_array.lenses),
            "active": active_personas
        }
    }
```

### Phase 1: Count Layouts (was Recipes)

```python
def count_recipes():
    """
    Count recipes per recipe set.
    """
    recipes = {
        "decisive": [],
        "machinery": [],
        "glass": []
    }

    for recipe_set in ["decisive", "machinery", "glass"]:
        path = f"sigil-mark/recipes/{recipe_set}"
        for file in glob(f"{path}/*.tsx"):
            recipes[recipe_set].append(file)

    return recipes
```

### Phase 2: Measure Coverage

```python
def measure_coverage():
    """
    Find components and check if they use recipes.
    """
    coverage = {}

    for zone_config in find_zone_configs():
        zone = zone_config.zone
        recipe_set = zone_config.recipes
        components = find_components(zone_config.path)

        using_recipes = 0
        for component in components:
            if imports_from(component, f"@sigil/recipes/{recipe_set}"):
                using_recipes += 1

        coverage[zone] = {
            "total": len(components),
            "using_recipes": using_recipes,
            "percentage": using_recipes / len(components) * 100
        }

    return coverage
```

### Phase 3: Track Sandboxes

```python
def track_sandboxes():
    """
    Find files with // sigil-sandbox header and calculate age.
    """
    sandboxes = []

    for file in find_tsx_files():
        if has_sandbox_header(file):
            age_days = (now() - file.modified_date).days
            sandboxes.append({
                "path": file.path,
                "age_days": age_days,
                "status": "STALE" if age_days > 7 else "OK"
            })

    return sandboxes
```

### Phase 4: List Variants

```python
def list_variants():
    """
    Find recipe variants (files with dot notation like Button.nintendo.tsx).
    """
    variants = []

    for recipe_set in ["decisive", "machinery", "glass"]:
        path = f"sigil-mark/recipes/{recipe_set}"
        for file in glob(f"{path}/*.*.tsx"):  # Has dot in name
            base = file.stem.split(".")[0]  # Button from Button.nintendo
            variant = file.stem.split(".")[1]  # nintendo
            variants.append({
                "base": base,
                "variant": variant,
                "recipe_set": recipe_set,
                "path": file.path
            })

    return variants
```

### Phase 5: Generate Recommendations (v2.6)

```python
def generate_recommendations(process_health, coverage, sandboxes, variants):
    """
    Generate prioritized recommendations.
    Priority: CRITICAL > HIGH > MEDIUM > LOW
    """
    recs = []

    # CRITICAL: Constitution violations
    for violation in process_health["constitution"]["violations"]:
        if violation["enforcement"] == "block":
            recs.append({
                "priority": "CRITICAL",
                "type": "CONSTITUTION_VIOLATION",
                "capability": violation["capability"],
                "files": violation["files"],
                "action": "Fix immediately - this capability MUST always work"
            })

    # HIGH: Expired decisions
    for decision in process_health["decisions"]["expired"]:
        recs.append({
            "priority": "HIGH",
            "type": "EXPIRED_DECISION",
            "decision": decision["id"],
            "action": "/consult {id} --record-outcome (or delete)"
        })

    # HIGH: Manually unlocked decisions
    for decision in process_health["decisions"]["unlocked"]:
        recs.append({
            "priority": "HIGH",
            "type": "UNLOCKED_DECISION",
            "decision": decision["id"],
            "action": "Review justification, consider re-locking"
        })

    # MEDIUM: Warn-level Constitution violations
    for violation in process_health["constitution"]["violations"]:
        if violation["enforcement"] == "warn":
            recs.append({
                "priority": "MEDIUM",
                "type": "CONSTITUTION_WARNING",
                "capability": violation["capability"],
                "files": violation["files"],
                "action": "Add missing capability implementation"
            })

    # MEDIUM: Missing persona coverage
    for persona in process_health["personas"]["defined"]:
        if persona not in process_health["personas"]["active"]:
            recs.append({
                "priority": "MEDIUM",
                "type": "MISSING_PERSONA_COVERAGE",
                "persona": persona,
                "action": "Review if this persona should be supported"
            })

    # LOW: Layout coverage
    for zone, data in coverage.items():
        if data["percentage"] < 80:
            recs.append({
                "priority": "LOW",
                "type": "IMPROVE_COVERAGE",
                "zone": zone,
                "percentage": data["percentage"],
                "action": "/craft [file] for uncovered components"
            })

    return sorted(recs, key=lambda r: ["CRITICAL", "HIGH", "MEDIUM", "LOW"].index(r["priority"]))
```

## Output Format (v2.6)

```
/garden

SIGIL v2.6 HEALTH REPORT
═══════════════════════════════════════════════════════════

                     PROCESS LAYER
═══════════════════════════════════════════════════════════

CONSTITUTION COMPLIANCE
┌─────────────────────────────────────────────────────────┐
│ Capability      │ Enforcement │ Status                  │
├─────────────────────────────────────────────────────────┤
│ withdraw        │ block       │ ✓ Always available      │
│ deposit         │ block       │ ✓ Always available      │
│ fee_disclosure  │ warn        │ ⚠️ Missing in 2 files   │
└─────────────────────────────────────────────────────────┘

DECISION STATUS
┌─────────────────────────────────────────────────────────┐
│ Decision        │ Status   │ Expires   │ Issues        │
├─────────────────────────────────────────────────────────┤
│ DEC-2026-001    │ locked   │ 90 days   │ None          │
│ DEC-2026-003    │ expired  │ -15 days  │ Re-consult    │
└─────────────────────────────────────────────────────────┘

PERSONA COVERAGE
┌─────────────────────────────────────────────────────────┐
│ Persona         │ Zones │ Components │ Coverage         │
├─────────────────────────────────────────────────────────┤
│ power_user      │ 3     │ 12         │ ████████████ 80% │
│ accessibility   │ 0     │ 0          │ ░░░░░░░░░░░░ 0%  │
└─────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════

                     CORE LAYER
═══════════════════════════════════════════════════════════

LAYOUT COVERAGE
┌─────────────────────────────────────────────────────────┐
│ Layout          │ Components │ Coverage                 │
├─────────────────────────────────────────────────────────┤
│ CriticalZone    │ 8          │ ██████████████████░░ 90% │
│ MachineryLayout │ 12         │ ████████████████████ 100%│
│ GlassLayout     │ 6          │ ████████████████████ 100%│
└─────────────────────────────────────────────────────────┘

RECOMMENDATIONS (Sorted by Priority)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. [CRITICAL] Constitution violation: fee_disclosure
2. [HIGH] Expired decision: DEC-2026-003
3. [MEDIUM] Missing accessibility persona coverage
4. [LOW] Layout coverage <80% in zone X

═══════════════════════════════════════════════════════════
```

## Sandbox States

| Status | Age | Action |
|--------|-----|--------|
| OK | <7 days | Continue experimenting |
| STALE | 7-14 days | Should codify soon |
| CRITICAL | >14 days | Must codify or clear |

## Error Handling

| Situation | Response |
|-----------|----------|
| No constitution file | Warn: "No constitution found. Run /sigil-setup." |
| No decisions directory | Warn: "No decisions found." (graceful degradation) |
| No lens-array file | Warn: "No personas found. Using defaults." |
| No zone configs | Warn: "No zone configs. Create .sigilrc.yaml." |
| Empty component dirs | Report as 0 coverage |

## Success Criteria (v2.6)

- [ ] Constitution compliance checked
- [ ] Decision status reported (locked/expired/unlocked)
- [ ] Persona coverage calculated
- [ ] Layout coverage by zone calculated
- [ ] Lens distribution shown
- [ ] Deprecated patterns listed
- [ ] Recommendations generated with priority
- [ ] Report saved to sigil-mark/reports/

## Priority Order

1. **CRITICAL** — Constitution violations (enforcement: block)
2. **HIGH** — Expired decisions, manually unlocked decisions
3. **MEDIUM** — Constitution warnings (enforcement: warn), missing persona coverage
4. **LOW** — Layout coverage, deprecated patterns, drift
