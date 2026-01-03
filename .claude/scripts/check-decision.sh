#!/bin/sh
# check-decision.sh — Check decision lock status and related information
#
# Usage: ./check-decision.sh <decision_id|file_path> [decisions_dir]
#
# Returns:
#   JSON with decision lock status and details
#   {"locked": true, "unlock_date": "...", "decision": {...}, "status": "locked"}
#   {"locked": false, "status": "unlocked"} if not locked
#   {"locked": false, "status": "not_found"} if decision doesn't exist
#
# Exit codes:
#   0 - Success (decision found or not found)
#   1 - Missing decision ID argument

set -e

DECISION_ID="${1:-}"
DECISIONS_DIR="${2:-sigil-mark/consultation-chamber/decisions}"

# Validate arguments
if [ -z "$DECISION_ID" ]; then
    echo '{"error": "Missing decision ID argument", "status": "error"}'
    exit 1
fi

# Determine file path
if [ -f "$DECISION_ID" ]; then
    # Full path provided
    DECISION_FILE="$DECISION_ID"
elif [ -f "${DECISIONS_DIR}/${DECISION_ID}.yaml" ]; then
    # ID provided, find in directory
    DECISION_FILE="${DECISIONS_DIR}/${DECISION_ID}.yaml"
else
    # Try to find by pattern
    DECISION_FILE=$(find "$DECISIONS_DIR" -name "${DECISION_ID}*.yaml" 2>/dev/null | head -1)
fi

# Check if decision file exists
if [ -z "$DECISION_FILE" ] || [ ! -f "$DECISION_FILE" ]; then
    echo '{"locked": false, "status": "not_found"}'
    exit 0
fi

# Parse decision file
if command -v yq >/dev/null 2>&1; then
    # Use yq for proper YAML parsing
    DECISION_ID=$(yq eval '.id // "unknown"' "$DECISION_FILE" 2>/dev/null)
    TITLE=$(yq eval '.decision.title // "Untitled"' "$DECISION_FILE" 2>/dev/null)
    SCOPE=$(yq eval '.decision.scope // "unknown"' "$DECISION_FILE" 2>/dev/null)
    LOCKED=$(yq eval '.lock.locked // false' "$DECISION_FILE" 2>/dev/null)
    LOCKED_AT=$(yq eval '.lock.locked_at // null' "$DECISION_FILE" 2>/dev/null)
    UNLOCK_DATE=$(yq eval '.lock.unlock_date // null' "$DECISION_FILE" 2>/dev/null)
    LOCK_MESSAGE=$(yq eval '.lock.message // ""' "$DECISION_FILE" 2>/dev/null | tr '\n' ' ' | sed 's/  */ /g')
    OUTCOME=$(yq eval '.outcome.decision // null' "$DECISION_FILE" 2>/dev/null)

    # Check if unlock date has passed
    if [ "$LOCKED" = "true" ] && [ "$UNLOCK_DATE" != "null" ]; then
        CURRENT_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
        if [ "$CURRENT_DATE" \> "$UNLOCK_DATE" ]; then
            # Unlock date has passed
            echo "{\"locked\": false, \"status\": \"unlockable\", \"unlock_date\": \"$UNLOCK_DATE\", \"decision\": {\"id\": \"$DECISION_ID\", \"title\": \"$TITLE\", \"scope\": \"$SCOPE\", \"outcome\": \"$OUTCOME\"}}"
            exit 0
        fi
    fi

    if [ "$LOCKED" = "true" ]; then
        echo "{\"locked\": true, \"status\": \"locked\", \"locked_at\": \"$LOCKED_AT\", \"unlock_date\": \"$UNLOCK_DATE\", \"message\": \"$LOCK_MESSAGE\", \"decision\": {\"id\": \"$DECISION_ID\", \"title\": \"$TITLE\", \"scope\": \"$SCOPE\", \"outcome\": \"$OUTCOME\"}}"
    else
        # Check if outcome exists (pending vs open)
        if [ "$OUTCOME" = "null" ]; then
            echo "{\"locked\": false, \"status\": \"pending\", \"decision\": {\"id\": \"$DECISION_ID\", \"title\": \"$TITLE\", \"scope\": \"$SCOPE\"}}"
        else
            echo "{\"locked\": false, \"status\": \"decided\", \"decision\": {\"id\": \"$DECISION_ID\", \"title\": \"$TITLE\", \"scope\": \"$SCOPE\", \"outcome\": \"$OUTCOME\"}}"
        fi
    fi
else
    # Fallback: basic grep-based check
    if grep -q "locked: true" "$DECISION_FILE" 2>/dev/null; then
        UNLOCK_DATE=$(grep "unlock_date:" "$DECISION_FILE" 2>/dev/null | sed 's/.*unlock_date: *//' | tr -d '"' | head -1)
        echo "{\"locked\": true, \"status\": \"locked\", \"unlock_date\": \"$UNLOCK_DATE\", \"note\": \"yq not available for full details\"}"
    else
        echo '{"locked": false, "status": "unlocked", "note": "yq not available for full details"}'
    fi
fi

exit 0
