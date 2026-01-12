#!/opt/homebrew/bin/bash
# Sigil v10.1 "Usage Reality" - Stability Checker
# Calculate days since last modification of a file
#
# @version 10.1.0
# @usage check-stability.sh path/to/file.tsx
# @output Number of days since last modification
#
# Example:
#   .claude/scripts/check-stability.sh src/hooks/useMotion.ts
#   14

set -euo pipefail

FILE="${1:-}"

if [[ -z "$FILE" ]]; then
  echo "Usage: check-stability.sh path/to/file.tsx" >&2
  echo "" >&2
  echo "Example:" >&2
  echo "  check-stability.sh src/hooks/useMotion.ts" >&2
  echo "  check-stability.sh src/components/Button.tsx" >&2
  exit 1
fi

if [[ ! -f "$FILE" ]]; then
  echo "0"
  exit 0
fi

# Try to get last commit timestamp from git
LAST_MOD=$(git log -1 --format="%ct" -- "$FILE" 2>/dev/null || echo "0")

# If not in git or no commits, fall back to file modification time
if [[ "$LAST_MOD" == "0" || -z "$LAST_MOD" ]]; then
  # macOS stat format
  LAST_MOD=$(stat -f "%m" "$FILE" 2>/dev/null || true)

  # Linux stat format fallback
  if [[ -z "$LAST_MOD" || "$LAST_MOD" == "0" ]]; then
    LAST_MOD=$(stat -c "%Y" "$FILE" 2>/dev/null || echo "0")
  fi
fi

# Handle case where we still couldn't get modification time
if [[ -z "$LAST_MOD" || "$LAST_MOD" == "0" ]]; then
  echo "0"
  exit 0
fi

NOW=$(date +%s)
DAYS=$(( (NOW - LAST_MOD) / 86400 ))

# Ensure we don't return negative days
if [[ $DAYS -lt 0 ]]; then
  DAYS=0
fi

echo "$DAYS"
