#!/bin/sh
# get-lens.sh — Detect applicable lens(es) for a file path or context
#
# Usage: ./get-lens.sh [file_path] [lenses_path]
#
# Returns:
#   JSON with detected lenses sorted by priority
#   {"lenses": ["power_user", "mobile"], "primary": "power_user", "status": "detected"}
#   {"lenses": [], "primary": "default", "status": "no_match"} if no match
#
# Exit codes:
#   0 - Success (lenses detected or no match)
#   1 - Missing arguments
#   2 - Lenses file not found

set -e

FILE_PATH="${1:-}"
LENSES_PATH="${2:-sigil-mark/lens-array/lenses.yaml}"

# If no file path, return all available lenses
if [ -z "$FILE_PATH" ]; then
    if [ ! -f "$LENSES_PATH" ]; then
        echo '{"lenses": [], "primary": "default", "status": "no_config"}'
        exit 0
    fi

    # Return all lenses sorted by priority
    if command -v yq >/dev/null 2>&1; then
        LENS_COUNT=$(yq eval '.lenses | keys | length' "$LENSES_PATH" 2>/dev/null || echo "0")

        if [ "$LENS_COUNT" = "0" ] || [ "$LENS_COUNT" = "null" ]; then
            echo '{"lenses": [], "primary": "default", "status": "no_lenses"}'
            exit 0
        fi

        # Get all lenses with priorities
        LENSES_JSON="["
        FIRST=true

        for lens in $(yq eval '.lenses | keys | .[]' "$LENSES_PATH" 2>/dev/null); do
            PRIORITY=$(yq eval ".lenses.${lens}.priority // 99" "$LENSES_PATH" 2>/dev/null)
            NAME=$(yq eval ".lenses.${lens}.name // \"$lens\"" "$LENSES_PATH" 2>/dev/null)

            if [ "$FIRST" = true ]; then
                FIRST=false
            else
                LENSES_JSON="${LENSES_JSON},"
            fi
            LENSES_JSON="${LENSES_JSON}{\"id\": \"$lens\", \"name\": \"$NAME\", \"priority\": $PRIORITY}"
        done
        LENSES_JSON="${LENSES_JSON}]"

        # Sort by priority and get primary (lowest priority number)
        PRIMARY=$(yq eval '.lenses | to_entries | sort_by(.value.priority) | .[0].key // "default"' "$LENSES_PATH" 2>/dev/null)

        echo "{\"lenses\": $LENSES_JSON, \"primary\": \"$PRIMARY\", \"status\": \"available\"}"
    else
        # Fallback: basic grep
        if grep -q "^lenses:" "$LENSES_PATH" 2>/dev/null; then
            echo '{"lenses": [], "primary": "default", "status": "available_no_yq"}'
        else
            echo '{"lenses": [], "primary": "default", "status": "no_lenses"}'
        fi
    fi
    exit 0
fi

# Check if lenses file exists
if [ ! -f "$LENSES_PATH" ]; then
    echo '{"lenses": [], "primary": "default", "status": "no_config"}'
    exit 0
fi

# Detect lens from file path patterns
detect_lens_from_path() {
    path="$1"

    # Mobile patterns
    case "$path" in
        *mobile*|*ios*|*android*|*touch*|*.native.*)
            echo "mobile"
            return 0
            ;;
    esac

    # Accessibility patterns
    case "$path" in
        *a11y*|*accessibility*|*aria*|*screen-reader*)
            echo "accessibility"
            return 0
            ;;
    esac

    # Power user patterns (admin, dashboard, pro)
    case "$path" in
        *admin*|*dashboard*|*pro*|*advanced*|*power*)
            echo "power_user"
            return 0
            ;;
    esac

    # Newcomer patterns (onboarding, tutorial, getting-started)
    case "$path" in
        *onboarding*|*tutorial*|*getting-started*|*welcome*|*intro*)
            echo "newcomer"
            return 0
            ;;
    esac

    echo ""
    return 1
}

# Try to detect lens from path
DETECTED=$(detect_lens_from_path "$FILE_PATH" || echo "")

if [ -n "$DETECTED" ]; then
    # Verify this lens exists in config
    if command -v yq >/dev/null 2>&1; then
        EXISTS=$(yq eval ".lenses.${DETECTED} != null" "$LENSES_PATH" 2>/dev/null || echo "false")
        if [ "$EXISTS" = "true" ]; then
            PRIORITY=$(yq eval ".lenses.${DETECTED}.priority // 99" "$LENSES_PATH" 2>/dev/null)
            NAME=$(yq eval ".lenses.${DETECTED}.name // \"$DETECTED\"" "$LENSES_PATH" 2>/dev/null)
            echo "{\"lenses\": [{\"id\": \"$DETECTED\", \"name\": \"$NAME\", \"priority\": $PRIORITY}], \"primary\": \"$DETECTED\", \"status\": \"detected\"}"
            exit 0
        fi
    else
        # Assume it exists without yq
        echo "{\"lenses\": [{\"id\": \"$DETECTED\", \"name\": \"$DETECTED\", \"priority\": 0}], \"primary\": \"$DETECTED\", \"status\": \"detected\"}"
        exit 0
    fi
fi

# No lens detected from path - return default
echo '{"lenses": [], "primary": "default", "status": "no_match"}'
exit 0
