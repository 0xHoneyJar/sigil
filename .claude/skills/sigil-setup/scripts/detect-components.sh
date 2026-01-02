#!/usr/bin/env bash
# Detect component directories in codebase
# Usage: detect-components.sh [--json]
set -e

JSON_OUTPUT=false
if [[ "${1:-}" == "--json" ]]; then
  JSON_OUTPUT=true
fi

# Common component directory patterns
PATTERNS=(
  "components"
  "app/components"
  "src/components"
  "lib/components"
  "src/ui"
  "app/ui"
)

# Feature-based patterns (check for nested components)
FEATURE_PATTERNS=(
  "src/features"
  "app/(app)"
  "app/(marketing)"
)

FOUND_PATHS=()

# Check standard patterns
for pattern in "${PATTERNS[@]}"; do
  if [[ -d "$pattern" ]]; then
    FOUND_PATHS+=("$pattern/")
  fi
done

# Check feature-based patterns for nested components
for feature_dir in "${FEATURE_PATTERNS[@]}"; do
  if [[ -d "$feature_dir" ]]; then
    # Look for components directories inside features
    while IFS= read -r -d '' comp_dir; do
      # Get relative path
      rel_path="${comp_dir#./}"
      FOUND_PATHS+=("$rel_path/")
    done < <(find "$feature_dir" -type d -name "components" -print0 2>/dev/null)
  fi
done

# Output results
if [[ "$JSON_OUTPUT" == "true" ]]; then
  echo "["
  first=true
  for path in "${FOUND_PATHS[@]}"; do
    if [[ "$first" == "true" ]]; then
      first=false
    else
      echo ","
    fi
    echo -n "  \"$path\""
  done
  echo ""
  echo "]"
else
  if [[ ${#FOUND_PATHS[@]} -eq 0 ]]; then
    echo "No component directories found."
    echo "Will use default paths: components/, app/components/, src/components/"
  else
    echo "Found component directories:"
    for path in "${FOUND_PATHS[@]}"; do
      echo "  - $path"
    done
  fi
fi
