#!/usr/bin/env bash
# Get zone for a file path based on .sigilrc.yaml
# Usage: get-zone.sh <file-path>
# Returns: zone name (critical, marketing, admin, or default)
set -e

FILE_PATH="${1:-}"

if [[ -z "$FILE_PATH" ]]; then
  echo "default"
  exit 0
fi

CONFIG_FILE=".sigilrc.yaml"

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "default"
  exit 0
fi

# Function to check if path matches a glob pattern
matches_pattern() {
  local path="$1"
  local pattern="$2"

  # Remove quotes if present
  pattern="${pattern//\"/}"
  pattern="${pattern//\'/}"

  # Convert glob to regex
  # ** matches any path
  # * matches anything except /
  local regex="${pattern//\*\*/.*}"
  regex="${regex//\*/[^/]*}"
  regex="^${regex}$"

  if [[ "$path" =~ $regex ]]; then
    return 0
  fi
  return 1
}

# Try to use yq if available
if command -v yq &> /dev/null; then
  # Get all zones
  ZONES=$(yq -r '.zones | keys | .[]' "$CONFIG_FILE" 2>/dev/null || echo "")

  for zone in $ZONES; do
    # Get paths for this zone
    PATHS=$(yq -r ".zones.${zone}.paths[]" "$CONFIG_FILE" 2>/dev/null || echo "")

    for pattern in $PATHS; do
      if matches_pattern "$FILE_PATH" "$pattern"; then
        echo "$zone"
        exit 0
      fi
    done
  done
else
  # Fallback: grep-based parsing
  # Look for zone definitions and their paths

  CURRENT_ZONE=""
  IN_PATHS=false

  while IFS= read -r line; do
    # Check for zone definition (e.g., "  critical:")
    if [[ "$line" =~ ^[[:space:]]{2}([a-z]+):[[:space:]]*$ ]]; then
      CURRENT_ZONE="${BASH_REMATCH[1]}"
      IN_PATHS=false
    fi

    # Check for paths section
    if [[ "$line" =~ ^[[:space:]]+paths: ]]; then
      IN_PATHS=true
      continue
    fi

    # Check for end of paths section (new key at same level)
    if [[ "$IN_PATHS" == "true" && "$line" =~ ^[[:space:]]{4}[a-z]+: ]]; then
      IN_PATHS=false
    fi

    # Check for path entries
    if [[ "$IN_PATHS" == "true" && "$line" =~ ^[[:space:]]+-[[:space:]]*[\"\']?([^\"\']+)[\"\']? ]]; then
      pattern="${BASH_REMATCH[1]}"
      if matches_pattern "$FILE_PATH" "$pattern"; then
        echo "$CURRENT_ZONE"
        exit 0
      fi
    fi
  done < "$CONFIG_FILE"
fi

# No match found
echo "default"
