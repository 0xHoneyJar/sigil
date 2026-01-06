#!/usr/bin/env bash
# Sigil Diff Panel v1.2.4
# Watches component files and displays physics value changes
# Part of the Sigil Workbench learning environment
set -euo pipefail

# === Colors (Monochrome) ===
WHITE='\033[1;37m'
DIM='\033[2m'
NC='\033[0m'
BOLD='\033[1m'
RED='\033[0;31m'
GREEN='\033[0;32m'

# === Configuration ===
WATCH_PATH="${1:-.}"
PHYSICS_PATTERNS="stiffness|damping|spring|transition|duration|delay"

# === Display Functions ===
display_header() {
  clear
  echo ""
  echo -e "${BOLD}${WHITE}  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓${NC}"
  echo -e "${BOLD}${WHITE}  ┃         SIGIL · PHYSICS            ┃${NC}"
  echo -e "${BOLD}${WHITE}  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛${NC}"
  echo ""
}

display_zone() {
  local file="$1"
  local zone="unknown"

  # Simple zone detection from path
  if [[ "$file" == *checkout* ]] || [[ "$file" == *transaction* ]]; then
    zone="decisive"
  elif [[ "$file" == *admin* ]] || [[ "$file" == *dashboard* ]]; then
    zone="machinery"
  elif [[ "$file" == *marketing* ]] || [[ "$file" == *landing* ]]; then
    zone="glass"
  fi

  echo -e "  ZONE: ${BOLD}$zone${NC}"
}

display_recipe() {
  local file="$1"
  local recipe="-"

  # Check for recipe import
  if grep -q "@sigil/recipes" "$file" 2>/dev/null; then
    recipe=$(grep -o "@sigil/recipes/[^'\"]*" "$file" 2>/dev/null | head -1 | sed 's/@sigil\/recipes\///')
  fi

  echo -e "  RECIPE: ${BOLD}$recipe${NC}"
}

display_diff() {
  local file="$1"

  echo ""
  echo "  ┌─────────────────────────────────┐"
  echo "  │ DIFF                            │"
  echo "  │                                 │"

  # Get git diff for physics values
  if git diff --quiet "$file" 2>/dev/null; then
    echo "  │   (no changes)                 │"
  else
    git diff "$file" 2>/dev/null | grep -E "^[-+].*($PHYSICS_PATTERNS)" | head -6 | while read -r line; do
      if [[ "$line" == -* ]]; then
        printf "  │ ${RED}%-31s${NC} │\n" "${line:0:31}"
      elif [[ "$line" == +* ]]; then
        printf "  │ ${GREEN}%-31s${NC} │\n" "${line:0:31}"
      fi
    done
  fi

  echo "  │                                 │"
  echo "  └─────────────────────────────────┘"
}

display_compare() {
  echo ""
  echo "  COMPARE:"
  echo "    [A] Before"
  echo "    [B] After"
  echo ""
  echo "  ─────────────────────────────────"
  echo "  Space to toggle · See diff, feel result"
}

# === Watch Mode ===
watch_file() {
  local file="$1"

  display_header
  display_zone "$file"
  display_recipe "$file"
  display_diff "$file"
  display_compare
}

# === Main ===
main() {
  local file="${1:-}"

  if [[ -z "$file" ]]; then
    display_header
    echo "  ZONE: (waiting for /craft)"
    echo "  RECIPE: -"
    echo ""
    echo "  ┌─────────────────────────────────┐"
    echo "  │ DIFF                            │"
    echo "  │                                 │"
    echo "  │   (no file selected)            │"
    echo "  │                                 │"
    echo "  │   Run: sigil-diff.sh <file>     │"
    echo "  │                                 │"
    echo "  └─────────────────────────────────┘"
    display_compare
    exit 0
  fi

  if [[ ! -f "$file" ]]; then
    echo "Error: File not found: $file"
    exit 1
  fi

  watch_file "$file"

  # If fswatch is available, watch for changes
  if command -v fswatch &>/dev/null; then
    echo ""
    echo -e "${DIM}  Watching for changes...${NC}"
    fswatch -o "$file" | while read -r _; do
      watch_file "$file"
    done
  fi
}

main "$@"
