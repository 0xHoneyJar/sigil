#!/usr/bin/env bash
# Sigil v1.0 Zone Detection Script
# Detects design zone from file path using zones.yaml patterns
#
# Usage: sigil-detect-zone.sh <file_path>
# Output: Zone name (critical, transactional, exploratory, marketing, admin, or default)

set -euo pipefail

# === Configuration ===
SIGIL_ROOT="${SIGIL_ROOT:-$(pwd)}"
ZONES_FILE="$SIGIL_ROOT/sigil-mark/resonance/zones.yaml"

# === Helper Functions ===
err() {
  echo "Error: $1" >&2
  exit 1
}

usage() {
  echo "Usage: sigil-detect-zone.sh <file_path>"
  echo ""
  echo "Detects design zone from file path."
  echo ""
  echo "Examples:"
  echo "  sigil-detect-zone.sh src/features/checkout/Button.tsx  # Returns: critical"
  echo "  sigil-detect-zone.sh src/features/dashboard/Card.tsx   # Returns: transactional"
  echo "  sigil-detect-zone.sh src/components/Button.tsx         # Returns: default"
  echo ""
  echo "Options:"
  echo "  --verbose    Show matching details"
  echo "  --json       Output as JSON"
  echo "  --help       Show this help"
}

# === Parse Arguments ===
FILE_PATH=""
VERBOSE=false
JSON_OUTPUT=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --verbose)
      VERBOSE=true
      shift
      ;;
    --json)
      JSON_OUTPUT=true
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    -*)
      err "Unknown option: $1"
      ;;
    *)
      FILE_PATH="$1"
      shift
      ;;
  esac
done

# === Validate Input ===
if [[ -z "$FILE_PATH" ]]; then
  err "File path required. Use --help for usage."
fi

if [[ ! -f "$ZONES_FILE" ]]; then
  err "Zones file not found: $ZONES_FILE. Run mount-sigil.sh first."
fi

# === Zone Detection ===
# Pattern matching using simple string matching
# Priority order: critical, admin, marketing, transactional, exploratory, default

# Function to check if path matches patterns for a zone
check_critical() {
  local path="$1"
  for pattern in checkout claim confirm delete transaction payment withdraw; do
    if [[ "$path" == *"/$pattern/"* ]] || [[ "$path" == *"/$pattern" ]]; then
      echo "$pattern"
      return 0
    fi
  done
  return 1
}

check_admin() {
  local path="$1"
  for pattern in admin console debug tools internal; do
    if [[ "$path" == *"/$pattern/"* ]] || [[ "$path" == *"/$pattern" ]]; then
      echo "$pattern"
      return 0
    fi
  done
  return 1
}

check_marketing() {
  local path="$1"
  for pattern in landing marketing promo home about pricing; do
    if [[ "$path" == *"/$pattern/"* ]] || [[ "$path" == *"/$pattern" ]]; then
      echo "$pattern"
      return 0
    fi
  done
  return 1
}

check_transactional() {
  local path="$1"
  for pattern in dashboard settings list table form edit; do
    if [[ "$path" == *"/$pattern/"* ]] || [[ "$path" == *"/$pattern" ]]; then
      echo "$pattern"
      return 0
    fi
  done
  return 1
}

check_exploratory() {
  local path="$1"
  for pattern in explore discover browse gallery learn docs; do
    if [[ "$path" == *"/$pattern/"* ]] || [[ "$path" == *"/$pattern" ]]; then
      echo "$pattern"
      return 0
    fi
  done
  return 1
}

# Detect zone (priority order)
detected_zone="default"
matched_pattern=""

if matched=$(check_critical "$FILE_PATH"); then
  detected_zone="critical"
  matched_pattern="**/$matched/**"
elif matched=$(check_admin "$FILE_PATH"); then
  detected_zone="admin"
  matched_pattern="**/$matched/**"
elif matched=$(check_marketing "$FILE_PATH"); then
  detected_zone="marketing"
  matched_pattern="**/$matched/**"
elif matched=$(check_transactional "$FILE_PATH"); then
  detected_zone="transactional"
  matched_pattern="**/$matched/**"
elif matched=$(check_exploratory "$FILE_PATH"); then
  detected_zone="exploratory"
  matched_pattern="**/$matched/**"
fi

# === Output ===
if $JSON_OUTPUT; then
  cat << EOF
{
  "zone": "$detected_zone",
  "path": "$FILE_PATH",
  "matched_pattern": "$matched_pattern"
}
EOF
elif $VERBOSE; then
  echo "Path: $FILE_PATH"
  echo "Zone: $detected_zone"
  if [[ -n "$matched_pattern" ]]; then
    echo "Matched: $matched_pattern"
  fi
else
  echo "$detected_zone"
fi
