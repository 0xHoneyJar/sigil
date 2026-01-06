#!/bin/bash
# Sigil v1.2.4 - Zone Detection Script
# Walks up directory tree, merges .sigilrc.yaml configs, returns JSON

set -e

FILE_PATH="${1:-.}"
PROJECT_ROOT="${PROJECT_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"

# Convert to absolute path
if [[ ! "$FILE_PATH" = /* ]]; then
    FILE_PATH="$(cd "$(dirname "$FILE_PATH")" 2>/dev/null && pwd)/$(basename "$FILE_PATH")"
fi

# Get directory (if file, use parent)
if [[ -f "$FILE_PATH" ]]; then
    CURRENT_DIR="$(dirname "$FILE_PATH")"
else
    CURRENT_DIR="$FILE_PATH"
fi

# Default zone config
RECIPES="machinery"
SYNC="client_authoritative"
TICK=""
CONSTRAINTS=""
SANDBOX_FILES=""

# Walk up directories, collect configs (deepest wins)
CONFIG_CHAIN=""
while [[ "$CURRENT_DIR" =~ ^"$PROJECT_ROOT" ]]; do
    CONFIG_FILE="$CURRENT_DIR/.sigilrc.yaml"

    if [[ -f "$CONFIG_FILE" ]]; then
        CONFIG_CHAIN="$CONFIG_FILE $CONFIG_CHAIN"
    fi

    # Move up
    PARENT_DIR="$(dirname "$CURRENT_DIR")"
    if [[ "$PARENT_DIR" == "$CURRENT_DIR" ]]; then
        break
    fi
    CURRENT_DIR="$PARENT_DIR"
done

# Also check project root
if [[ -f "$PROJECT_ROOT/.sigilrc.yaml" ]]; then
    if [[ ! "$CONFIG_CHAIN" =~ "$PROJECT_ROOT/.sigilrc.yaml" ]]; then
        CONFIG_CHAIN="$PROJECT_ROOT/.sigilrc.yaml $CONFIG_CHAIN"
    fi
fi

# Parse configs (earlier in chain = base, later = override)
for CONFIG in $CONFIG_CHAIN; do
    if [[ -f "$CONFIG" ]]; then
        # Extract values using grep/sed (portable, no yq dependency)
        MAYBE_RECIPES=$(grep -E "^recipes:" "$CONFIG" 2>/dev/null | sed 's/recipes:[[:space:]]*//' | tr -d '"' || true)
        MAYBE_SYNC=$(grep -E "^sync:" "$CONFIG" 2>/dev/null | sed 's/sync:[[:space:]]*//' | tr -d '"' || true)
        MAYBE_TICK=$(grep -E "^tick:" "$CONFIG" 2>/dev/null | sed 's/tick:[[:space:]]*//' | tr -d '"' || true)

        [[ -n "$MAYBE_RECIPES" ]] && RECIPES="$MAYBE_RECIPES"
        [[ -n "$MAYBE_SYNC" ]] && SYNC="$MAYBE_SYNC"
        [[ -n "$MAYBE_TICK" ]] && TICK="$MAYBE_TICK"
    fi
done

# Determine zone name from path
ZONE_PATH="${FILE_PATH#$PROJECT_ROOT/}"
ZONE_NAME=$(echo "$ZONE_PATH" | cut -d'/' -f1-2)

# Output JSON
cat <<EOF
{
  "zone": "$ZONE_NAME",
  "recipes": "$RECIPES",
  "sync": "$SYNC",
  "tick": "$TICK",
  "config_chain": [$(echo "$CONFIG_CHAIN" | sed 's/[^ ]*/\"&\"/g' | sed 's/ /, /g')],
  "resolved_from": "${FILE_PATH}"
}
EOF
