#!/opt/homebrew/bin/bash
# Sigil v10.1 "Usage Reality" - Import Counter
# Count how many files import a given component
#
# @version 10.1.0
# @usage count-imports.sh ComponentName
# @output Number of files importing the component
#
# Example:
#   .claude/scripts/count-imports.sh Button
#   15

set -euo pipefail

COMPONENT="${1:-}"

if [[ -z "$COMPONENT" ]]; then
  echo "Usage: count-imports.sh ComponentName" >&2
  echo "" >&2
  echo "Example:" >&2
  echo "  count-imports.sh Button" >&2
  echo "  count-imports.sh useMotion" >&2
  exit 1
fi

# Search for import statements containing the component name
# Handles various import patterns:
#   import { Component } from '...'
#   import Component from '...'
#   import { Component, Other } from '...'
#   import * as Component from '...'

COUNT=$(grep -rE "import.*[{, ]${COMPONENT}[}, ].*from|import\s+${COMPONENT}\s+from|import\s+\*\s+as\s+${COMPONENT}\s+from" \
  src/ \
  --include="*.tsx" \
  --include="*.ts" \
  --include="*.jsx" \
  --include="*.js" \
  2>/dev/null | wc -l | tr -d ' ')

echo "$COUNT"
