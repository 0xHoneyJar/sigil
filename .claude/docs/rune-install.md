# Rune Pack Installation

Installation guide for the Rune Construct Pack.

## Prerequisites

- Claude Code CLI installed
- Git repository initialized
- (Optional) Loa framework for full workflow integration

## Installation Methods

### Method 1: With Loa (Recommended)

If you have Loa installed:

```bash
loa install rune
```

This will:
1. Copy pack to `.claude/constructs/packs/rune/`
2. Create `grimoires/rune/` state directory
3. Add Design Physics section to NOTES.md
4. Register commands: /sigil, /glyph, /rigor, /wyrd

### Method 2: Manual Installation

1. **Copy the pack directory**:

```bash
# From Rune repository
cp -r .claude/constructs/packs/rune /path/to/your/project/.claude/constructs/packs/
```

2. **Create state directory**:

```bash
mkdir -p grimoires/rune
```

3. **Initialize state files**:

```bash
# taste.md
cat > grimoires/rune/taste.md << 'EOF'
# Taste

Human preferences for design physics.

---
EOF

# wyrd.md
cat > grimoires/rune/wyrd.md << 'EOF'
# Wyrd State

## Confidence Calibration

| Effect | Base | Taste Adj | Rejection Adj | Final | Last Updated |
|--------|------|-----------|---------------|-------|--------------|
| Financial | 0.90 | +0.00 | -0.00 | 0.90 | — |
| Destructive | 0.90 | +0.00 | -0.00 | 0.90 | — |
| Standard | 0.85 | +0.00 | -0.00 | 0.85 | — |
| Local | 0.95 | +0.00 | -0.00 | 0.95 | — |

## Metrics

- **Total Hypotheses**: 0
- **Accepted**: 0
- **Rejected**: 0
- **Patterns Detected**: 0
EOF

# rejections.md
cat > grimoires/rune/rejections.md << 'EOF'
# Rejections

Append-only log of hypothesis rejections.

---
EOF

# patterns.md
cat > grimoires/rune/patterns.md << 'EOF'
# Detected Patterns

Patterns extracted from 3+ similar rejections.

---
EOF
```

4. **Add to CLAUDE.md** (or create if missing):

```markdown
# Rune

Design physics for AI-generated UI.

## Commands

| Command | Purpose |
|---------|---------|
| `/sigil "insight"` | Record taste preference |
| `/glyph "description"` | Generate UI component |
| `/glyph validate file.tsx` | Validate existing component |
| `/rigor file.tsx` | Check web3 safety |
| `/wyrd` | View confidence state |

## Physics Table

| Effect | Sync | Timing | Confirmation |
|--------|------|--------|--------------|
| Financial | Pessimistic | 800ms | Required |
| Destructive | Pessimistic | 600ms | Required |
| Standard | Optimistic | 200ms | None |
| Local | Immediate | 100ms | None |
```

## Verification

After installation, verify with:

```bash
# Check directory structure
ls -la .claude/constructs/packs/rune/

# Expected output:
# manifest.yaml
# skills/
# rules/
# hooks/
# templates/

# Check state directory
ls -la grimoires/rune/

# Expected output:
# taste.md
# wyrd.md
# rejections.md
# patterns.md
```

Run a test command:

```
/wyrd
```

Expected output:
```
## Wyrd State

| Effect | Base | Adjustment | Current |
|--------|------|------------|---------|
| Financial | 0.90 | 0.00 | 0.90 |
...
```

## Configuration (Optional)

Create `.loa.config.yaml` for customization:

```yaml
rune:
  hooks:
    implement:
      enabled: true
      auto_invoke: false
    sprint_plan:
      enabled: true
    review_sprint:
      enabled: true
    audit_sprint:
      enabled: true

  reality_anchoring:
    enabled: true
    auto_update_tests: false

  feedback:
    taste_capture: true
    auto_detect: true
```

## Uninstallation

### Remove pack:
```bash
rm -rf .claude/constructs/packs/rune
```

### Keep state (recommended):
```bash
# State in grimoires/rune/ is preserved
```

### Full removal:
```bash
rm -rf .claude/constructs/packs/rune
rm -rf grimoires/rune
```

## Upgrading

### With Loa:
```bash
loa upgrade rune
```

### Manual:
1. Backup `grimoires/rune/` (state is preserved)
2. Remove old pack: `rm -rf .claude/constructs/packs/rune`
3. Install new version
4. State files are compatible across versions

## Troubleshooting

### Commands not recognized

Check that pack is in correct location:
```bash
ls .claude/constructs/packs/rune/manifest.yaml
```

### State files missing

Run repair:
```
/wyrd repair
```

### Confidence not updating

Recalibrate manually:
```
/wyrd calibrate
```

## Support

- Issues: https://github.com/your-org/rune/issues
- Documentation: See rules/ directory for full documentation
