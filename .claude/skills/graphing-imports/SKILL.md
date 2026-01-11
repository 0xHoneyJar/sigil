# Graphing Imports

## Purpose

Scan src/ for actual package dependencies and generate imports.yaml.
Provides the list of frameworks/libraries used in the codebase.

## Trigger

- Startup (when workshop is stale)
- After package install
- Manual invocation for dependency audit

## Performance Target

- Full scan: <1s on typical codebase

## Script

Located at: `scripts/scan-imports.sh`

### Process

1. Use ripgrep to find all ES imports in src/
2. Filter for external packages (not relative imports)
3. Extract unique package names
4. Handle scoped packages (@scope/package)
5. Write to grimoires/sigil/state/imports.yaml

### Ripgrep Pattern

```bash
rg "from ['\"]([^.'/\"]+)" src/ -o --no-filename | \
  sort | uniq | \
  sed "s/from ['\"]//g" | \
  sed 's/[\"'\'']//g'
```

## Output

Writes to `grimoires/sigil/state/imports.yaml`:

```yaml
# Auto-generated import list
# Generated: 2026-01-08T00:00:00Z
- framer-motion
- react
- @tanstack/react-query
- wagmi
- viem
```

## Workshop Integration

1. imports.yaml hash used for staleness detection
2. Changes trigger workshop rebuild
3. Materials section populated from this list

## Example Invocation

```bash
# Scan and update imports.yaml
.claude/skills/graphing-imports/scripts/scan-imports.sh

# Check imports without updating
.claude/skills/graphing-imports/scripts/scan-imports.sh --dry-run
```
