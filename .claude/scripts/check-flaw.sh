#!/bin/sh
# check-flaw.sh — Check if a file path matches any protected flaw patterns
#
# Usage: ./check-flaw.sh <file_path> [canon_path]
#
# Returns:
#   JSON with matching flaws or empty array
#   {"matches": [], "status": "clean"} if no matches
#   {"matches": [{flaw_id, name, pattern, protection_rule}], "status": "protected"} if matches
#
# Exit codes:
#   0 - Success (clean or matches found)
#   1 - Missing file path argument
#   2 - Canon file not found

set -e

FILE_PATH="${1:-}"
CANON_PATH="${2:-sigil-mark/soul-binder/canon-of-flaws.yaml}"

# Validate arguments
if [ -z "$FILE_PATH" ]; then
    echo '{"error": "Missing file path argument", "status": "error"}'
    exit 1
fi

# Check if canon exists
if [ ! -f "$CANON_PATH" ]; then
    echo '{"matches": [], "status": "no_canon"}'
    exit 0
fi

# Function to check if file matches a glob pattern
matches_pattern() {
    file="$1"
    pattern="$2"

    # Convert glob pattern to regex
    # Replace * with .* and escape dots
    regex_pattern=$(echo "$pattern" | sed 's/\./\\./g' | sed 's/\*/.*/g')

    # Check if file matches
    echo "$file" | grep -qE "$regex_pattern" && return 0 || return 1
}

# Try yq first for YAML parsing
if command -v yq >/dev/null 2>&1; then
    # Get all protected flaws with their patterns
    MATCHES="[]"

    # Read each protected flaw
    FLAW_COUNT=$(yq eval '.flaws | length' "$CANON_PATH" 2>/dev/null || echo "0")

    if [ "$FLAW_COUNT" = "0" ] || [ "$FLAW_COUNT" = "null" ]; then
        echo '{"matches": [], "status": "clean"}'
        exit 0
    fi

    i=0
    while [ "$i" -lt "$FLAW_COUNT" ]; do
        STATUS=$(yq eval ".flaws[$i].status" "$CANON_PATH" 2>/dev/null)

        if [ "$STATUS" = "PROTECTED" ]; then
            FLAW_ID=$(yq eval ".flaws[$i].id" "$CANON_PATH" 2>/dev/null)
            FLAW_NAME=$(yq eval ".flaws[$i].name" "$CANON_PATH" 2>/dev/null)
            PROTECTION_RULE=$(yq eval ".flaws[$i].protection_rule" "$CANON_PATH" 2>/dev/null | tr '\n' ' ' | sed 's/  */ /g')

            # Check each pattern
            PATTERN_COUNT=$(yq eval ".flaws[$i].affected_code_patterns | length" "$CANON_PATH" 2>/dev/null || echo "0")

            j=0
            while [ "$j" -lt "$PATTERN_COUNT" ]; do
                PATTERN=$(yq eval ".flaws[$i].affected_code_patterns[$j]" "$CANON_PATH" 2>/dev/null)

                if matches_pattern "$FILE_PATH" "$PATTERN"; then
                    # Add to matches
                    MATCH_JSON="{\"flaw_id\": \"$FLAW_ID\", \"name\": \"$FLAW_NAME\", \"pattern\": \"$PATTERN\", \"protection_rule\": \"$PROTECTION_RULE\"}"

                    if [ "$MATCHES" = "[]" ]; then
                        MATCHES="[$MATCH_JSON]"
                    else
                        MATCHES=$(echo "$MATCHES" | sed 's/\]$//')
                        MATCHES="$MATCHES, $MATCH_JSON]"
                    fi
                fi

                j=$((j + 1))
            done
        fi

        i=$((i + 1))
    done

    if [ "$MATCHES" = "[]" ]; then
        echo '{"matches": [], "status": "clean"}'
    else
        echo "{\"matches\": $MATCHES, \"status\": \"protected\"}"
    fi
else
    # Fallback: basic grep-based check
    # This is less accurate but works without yq

    # Check if file path contains any of the common protected patterns
    # Extract patterns from YAML using grep
    PATTERNS=$(grep -A 100 "affected_code_patterns:" "$CANON_PATH" 2>/dev/null | grep "^\s*-\s*\"" | sed 's/.*"\(.*\)".*/\1/' | head -20)

    FOUND=false
    for pattern in $PATTERNS; do
        # Simple glob match
        case "$FILE_PATH" in
            *$pattern*) FOUND=true; break ;;
        esac
    done

    if [ "$FOUND" = true ]; then
        echo '{"matches": [{"flaw_id": "unknown", "name": "Pattern match (yq not available for details)", "pattern": "matched"}], "status": "protected"}'
    else
        echo '{"matches": [], "status": "clean"}'
    fi
fi

exit 0
