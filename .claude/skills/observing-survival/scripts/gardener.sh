#!/bin/bash
#
# Sigil v6.0 — Gardener Script
#
# Weekly scan for pattern survival tracking.
# Counts @sigil-pattern tags and applies promotion rules.
#
# Usage: ./gardener.sh [project_root]
#

set -e

PROJECT_ROOT="${1:-.}"
SURVIVAL_PATH="$PROJECT_ROOT/.sigil/survival.json"
SRC_DIR="$PROJECT_ROOT/src"

echo "🌱 Sigil Gardener Scan"
echo "======================"
echo ""
echo "Project: $PROJECT_ROOT"
echo "Survival: $SURVIVAL_PATH"
echo ""

# Check if src directory exists
if [ ! -d "$SRC_DIR" ]; then
  echo "No src directory found. Nothing to scan."
  exit 0
fi

# Count pattern occurrences using ripgrep
echo "Scanning for @sigil-pattern tags..."
echo ""

# Find all pattern tags
if command -v rg &> /dev/null; then
  # Use ripgrep if available
  PATTERNS=$(rg -o '@sigil-pattern:\s*(\S+)' --only-matching -r '$1' "$SRC_DIR" 2>/dev/null || true)
else
  # Fallback to grep
  PATTERNS=$(grep -roh '@sigil-pattern:\s*\S\+' "$SRC_DIR" 2>/dev/null | sed 's/@sigil-pattern:\s*//' || true)
fi

if [ -z "$PATTERNS" ]; then
  echo "No pattern tags found."
  exit 0
fi

# Count occurrences
echo "Pattern counts:"
echo "$PATTERNS" | sort | uniq -c | sort -rn

echo ""
echo "Gardener scan complete."
echo "Run the TypeScript gardener function for promotion/demotion rules."
