# Sigil v1.2.4 Agent: Gardening Entropy

> "Recipes over physics. Coverage over drift."

## Role

**Health Reporter** — Reports recipe coverage, tracks sandboxes, lists variants, and recommends actions for maintaining design system health.

## Command

```
/garden                 # Show health report
/garden --zone [zone]   # Report for specific zone
/garden --sandboxes     # Focus on sandbox status
/garden --variants      # Show recipe variants
```

## Outputs

| Path | Description |
|------|-------------|
| `sigil-mark/reports/garden-{date}.yaml` | Garden health snapshot |

## Prerequisites

- Sigil setup complete (`sigil-mark/` exists)
- Recipes defined in `sigil-mark/recipes/`
- Zone configs in place

## The Health Model (v1.2.4)

Health is measured by:
1. **Recipe coverage** — What % of components use recipes?
2. **Sandbox age** — How old are active experiments?
3. **Variant proliferation** — Are variants justified?
4. **Zone compliance** — Do files match zone assignments?

## Workflow

### Phase 1: Count Recipes

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

### Phase 5: Generate Recommendations

```python
def generate_recommendations(coverage, sandboxes, variants):
    """
    Generate actionable recommendations.
    """
    recs = []

    # Stale sandboxes
    for sandbox in sandboxes:
        if sandbox["status"] == "STALE":
            recs.append({
                "type": "CODIFY_SANDBOX",
                "file": sandbox["path"],
                "action": f"/codify {sandbox['path']}"
            })

    # Low coverage zones
    for zone, data in coverage.items():
        if data["percentage"] < 80:
            recs.append({
                "type": "IMPROVE_COVERAGE",
                "zone": zone,
                "percentage": data["percentage"],
                "action": f"Use /craft for uncovered components"
            })

    # Excessive variants
    variant_counts = {}
    for v in variants:
        variant_counts[v["base"]] = variant_counts.get(v["base"], 0) + 1

    for base, count in variant_counts.items():
        if count > 3:
            recs.append({
                "type": "REVIEW_VARIANTS",
                "base": base,
                "count": count,
                "action": "Consider consolidating variants"
            })

    return recs
```

## Output Format

```
/garden

SIGIL HEALTH REPORT
═══════════════════════════════════════════════════════════

RECIPE COVERAGE
┌─────────────────────────────────────────────────────────┐
│ Zone       │ Recipes │ Components │ Coverage           │
├─────────────────────────────────────────────────────────┤
│ decisive   │ 4       │ 12         │ ████████████░░ 85% │
│ machinery  │ 3       │ 8          │ ████████████░░ 88% │
│ glass      │ 3       │ 6          │ ██████████████ 100%│
└─────────────────────────────────────────────────────────┘

ACTIVE SANDBOXES (N)
[List with age and status]

RECIPE VARIANTS (N)
[List with base, variant, physics]

RECOMMENDATIONS
[Actionable items]

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
| No recipes found | Warn: "No recipes found. Run /craft first." |
| No zone configs | Warn: "No zone configs. Create .sigilrc.yaml files." |
| Empty component dirs | Report as 0 coverage |

## Success Criteria

- [ ] Recipe count by set shown
- [ ] Coverage percentage by zone calculated
- [ ] Sandboxes listed with age
- [ ] Variants listed with base recipe
- [ ] Recommendations generated
- [ ] Report saved to sigil-mark/reports/
