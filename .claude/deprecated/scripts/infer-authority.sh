#!/opt/homebrew/bin/bash
# Sigil v10.1 "Usage Reality" - Authority Inferrer
# Combines import count and stability to infer authority tier
#
# @version 10.1.0
# @usage infer-authority.sh path/to/Component.tsx
# @output JSON with component, file, imports, stability_days, tier
#
# Thresholds (from grimoires/sigil/authority.yaml):
#   Gold:   10+ imports AND 14+ days stable
#   Silver: 5+ imports
#   Draft:  Everything else
#
# Example:
#   .claude/scripts/infer-authority.sh src/hooks/useMotion.ts
#   {"component":"useMotion","file":"src/hooks/useMotion.ts","imports":12,"stability_days":21,"tier":"gold"}

set -euo pipefail

FILE="${1:-}"

if [[ -z "$FILE" ]]; then
  echo "Usage: infer-authority.sh path/to/Component.tsx" >&2
  echo "" >&2
  echo "Example:" >&2
  echo "  infer-authority.sh src/hooks/useMotion.ts" >&2
  echo "  infer-authority.sh src/components/Button.tsx" >&2
  exit 1
fi

# Extract component name from file path
# Handles: Component.tsx, useHook.ts, component.jsx
BASENAME=$(basename "$FILE")
COMPONENT="${BASENAME%.*}"  # Remove extension

# Get script directory for relative calls
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Get import count
IMPORTS=$("$SCRIPT_DIR/count-imports.sh" "$COMPONENT" 2>/dev/null || echo "0")

# Get stability days
STABILITY=$("$SCRIPT_DIR/check-stability.sh" "$FILE" 2>/dev/null || echo "0")

# Thresholds from authority.yaml
GOLD_IMPORTS=10
GOLD_STABILITY=14
SILVER_IMPORTS=5

# Determine tier
if [[ "$IMPORTS" -ge "$GOLD_IMPORTS" && "$STABILITY" -ge "$GOLD_STABILITY" ]]; then
  TIER="gold"
elif [[ "$IMPORTS" -ge "$SILVER_IMPORTS" ]]; then
  TIER="silver"
else
  TIER="draft"
fi

# Output JSON
cat <<EOF
{
  "component": "$COMPONENT",
  "file": "$FILE",
  "imports": $IMPORTS,
  "stability_days": $STABILITY,
  "tier": "$TIER"
}
EOF
