# Skill: Mapping Zones

> "Zones are physics contexts, not folders."

## Purpose

Define zones and map file paths to physics contexts.

## Workflow

### 1. Zone Identification

```
"What types of interactions exist in your product?"

□ Critical — irreversible, high-stakes
□ Transactional — daily work, efficiency
□ Exploratory — discovery, browsing
□ Marketing — first impressions
□ Admin — power users
```

### 2. Path Mapping

For each zone, define path patterns:
```
critical:
  - "**/checkout/**"
  - "**/claim/**"
  - "**/trade/**"
```

### 3. Physics Assignment

Each zone gets:
- Sync model (server/client authoritative)
- Tick mode (discrete/continuous)
- Material default
- Tension presets

### 4. Budget Configuration

Set budgets per zone:
```
critical:
  interactive_elements: 5
  animations: 1
  decisions: 2
```

## Output

Creates `sigil-mark/resonance/zones.yaml`

## Mode: Scan

Auto-detect zones from directory structure:
1. Find common patterns (checkout, dashboard, etc.)
2. Suggest zone assignments
3. User confirms or adjusts
