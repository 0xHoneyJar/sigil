#!/bin/bash
# Detect React/Vue/Svelte components in configured paths
# Usage: detect-components.sh [--json]

set -e

OUTPUT_FORMAT="text"
if [[ "$1" == "--json" ]]; then
  OUTPUT_FORMAT="json"
fi

# ============================================================================
# Read Configuration
# ============================================================================

if [[ -f ".sigilrc.yaml" ]]; then
  # Try yq first, fall back to grep
  if command -v yq &> /dev/null; then
    PATHS=$(yq -r '.component_paths[]' .sigilrc.yaml 2>/dev/null || echo "")
  else
    PATHS=$(grep -A 10 'component_paths:' .sigilrc.yaml | grep '^ *-' | sed 's/^ *- *//' | tr -d '"' || echo "")
  fi
fi

# Default paths if not configured
if [[ -z "$PATHS" ]]; then
  PATHS="components/
src/components/
app/components/
src/features/**/components/"
fi

# ============================================================================
# Find Components
# ============================================================================

COMPONENTS=()

while IFS= read -r path; do
  # Skip empty lines
  [[ -z "$path" ]] && continue
  
  # Handle glob patterns
  if [[ "$path" == *"**"* ]]; then
    # Convert ** glob to find pattern
    base_path="${path%%\*\**}"
    
    if [[ -d "$base_path" ]]; then
      while IFS= read -r file; do
        if grep -qE "^export (default )?(function|const|class) [A-Z]" "$file" 2>/dev/null; then
          COMPONENTS+=("$file")
        fi
      done < <(find "$base_path" -name "*.tsx" -o -name "*.jsx" 2>/dev/null)
    fi
  else
    # Regular path
    if [[ -d "$path" ]]; then
      while IFS= read -r file; do
        if grep -qE "^export (default )?(function|const|class) [A-Z]" "$file" 2>/dev/null; then
          COMPONENTS+=("$file")
        fi
      done < <(find "$path" -name "*.tsx" -o -name "*.jsx" 2>/dev/null)
    fi
  fi
done <<< "$PATHS"

# ============================================================================
# Output
# ============================================================================

if [[ "$OUTPUT_FORMAT" == "json" ]]; then
  echo "{"
  echo "  \"count\": ${#COMPONENTS[@]},"
  echo "  \"components\": ["
  for i in "${!COMPONENTS[@]}"; do
    if [[ $i -lt $((${#COMPONENTS[@]} - 1)) ]]; then
      echo "    \"${COMPONENTS[$i]}\","
    else
      echo "    \"${COMPONENTS[$i]}\""
    fi
  done
  echo "  ]"
  echo "}"
else
  echo "Found ${#COMPONENTS[@]} components:"
  echo ""
  for comp in "${COMPONENTS[@]}"; do
    echo "  $comp"
  done
fi
