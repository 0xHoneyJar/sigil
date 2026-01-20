# /taste-synthesize Command

Extract patterns from accumulated taste signals and propose rule changes.

---

## Usage

```
/taste-synthesize [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--days N` | Analyze signals from last N days | 30 |
| `--min-confidence` | Minimum confidence level (LOW/MEDIUM/HIGH) | LOW |
| `--effect TYPE` | Filter to specific effect type | all |
| `--auto-inscribe` | Auto-inscribe HIGH confidence patterns | false |
| `--report` | Generate report file only (no prompts) | false |

---

## What It Does

1. **Loads** all taste signals from `grimoires/sigil/taste.md`
2. **Filters** to MODIFY/REJECT signals (ACCEPT has no learning value)
3. **Groups** signals by effect, change, user type, and expected feel
4. **Detects** patterns where 3+ signals show same preference
5. **Generates** recommendations for rule changes
6. **Presents** synthesis report with actionable items
7. **Integrates** with `/inscribe` for permanent rule changes

---

## Pattern Types

| Type | Detection | Example |
|------|-----------|---------|
| **Timing** | 3+ same timing change | "800ms → 500ms for Financial" |
| **User Segment** | 3+ same user_type + change | "Mobile users prefer 500ms" |
| **Effect Mismatch** | Expected feel ≠ physics tier | "Users expect snappy, got trustworthy" |
| **Animation** | 3+ same easing change | "ease-out → spring(400, 25)" |
| **Frequency** | Goal contains "quickly"/"checking" | "May be misclassified mutation" |

---

## Confidence Levels

| Count | Level | Action |
|-------|-------|--------|
| 3-4 signals | LOW | Surface only |
| 5-7 signals | MEDIUM | Suggest review |
| 8+ signals | HIGH | Recommend inscribe |

---

## Examples

### Basic synthesis
```
/taste-synthesize
```

### Last 7 days only
```
/taste-synthesize --days 7
```

### Only HIGH confidence patterns
```
/taste-synthesize --min-confidence HIGH
```

### Filter to Financial effect
```
/taste-synthesize --effect Financial
```

### Auto-inscribe approved patterns
```
/taste-synthesize --auto-inscribe
```

### Generate report file
```
/taste-synthesize --report
```
Output: `grimoires/sigil/synthesis-report.md`

---

## Related Files

| File | Purpose |
|------|---------|
| `grimoires/sigil/taste.md` | Source signals |
| `grimoires/sigil/inscribed-patterns.yaml` | Patterns already inscribed |
| `grimoires/sigil/dismissed-patterns.yaml` | Patterns explicitly dismissed |
| `grimoires/sigil/synthesis-report.md` | Generated report (with --report) |

---

## When to Run

- **Weekly**: Regular health check of feedback patterns
- **Pre-release**: Consolidate learnings before shipping
- **After friction reports**: When users report consistent issues
- **Threshold**: When 10+ MODIFY/REJECT signals accumulated

---

## Related Commands

- `/craft` - Generation (reads applied patterns)
- `/inscribe` - Apply patterns permanently
- `/ward` - Validation (checks pattern compliance)
