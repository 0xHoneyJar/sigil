#!/bin/bash
# validate-sync-strategy.sh
# Claude Code hook script for sync strategy validation
#
# Sprint 11: Interaction Router
# Validates sync strategy usage before changes are applied.

set -euo pipefail

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root detection
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}/../.."

usage() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS] <description>

Validate sync strategy for a given feature or data interaction.

OPTIONS:
    -p, --path <path>     Data path to check (e.g., user.balance)
    -d, --description     Feature description for keyword analysis
    -s, --strict          Fail on unknown patterns (require declaration)
    -q, --quiet           Suppress informational output
    -h, --help            Show this help message

EXAMPLES:
    $(basename "$0") -p user.balance -d "withdraw from wallet"
    $(basename "$0") -d "edit collaborative document"
    $(basename "$0") -p game.inventory -d "drop item" --strict

OUTPUT:
    Returns JSON with strategy, rationale, and warnings.
    Exit code 0 for successful detection, 1 for unknown pattern (if strict).
EOF
    exit 0
}

# Default values
DATA_PATH=""
DESCRIPTION=""
STRICT=false
QUIET=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--path)
            DATA_PATH="$2"
            shift 2
            ;;
        -d|--description)
            DESCRIPTION="$2"
            shift 2
            ;;
        -s|--strict)
            STRICT=true
            shift
            ;;
        -q|--quiet)
            QUIET=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            if [[ -z "$DESCRIPTION" ]]; then
                DESCRIPTION="$1"
            fi
            shift
            ;;
    esac
done

# Validate input
if [[ -z "$DESCRIPTION" && -z "$DATA_PATH" ]]; then
    echo -e "${RED}Error: Either description or data path is required${NC}" >&2
    usage
fi

# Strategy signal keywords (mirrors InteractionRouter.ts)
declare -A STRATEGY_KEYWORDS

STRATEGY_KEYWORDS[server_tick]="trade transfer buy sell purchase payment transaction money currency balance wallet deposit withdraw refund price cost fee credit debit invoice checkout attack defend combat damage heal health hp mp mana stamina energy xp experience level stats inventory item equip unequip drop pickup loot craft enchant upgrade consumable potion claim stake unstake mint burn lock unlock vest delegate undelegate competitive ranked match score leaderboard tournament bet wager gamble"

STRATEGY_KEYWORDS[crdt]="edit type write draft compose author document doc page article post blog text content body description bio about comment reply thread discussion feedback message chat conversation collaborative shared realtime live multiplayer note memo journal diary log"

STRATEGY_KEYWORDS[lww]="toggle switch enable disable on off select choose pick option choice move drag resize reorder sort position location coordinates preference setting config configuration customize theme mode layout display status state flag mark pin star favorite archive trash delete restore avatar profile username nickname presence"

STRATEGY_KEYWORDS[none]="modal dialog popup overlay tooltip dropdown menu submenu context hover focus blur active pressed expand collapse open close show hide tab panel sidebar drawer sheet view screen route navigate animation transition loading skeleton placeholder preview thumbnail"

# Detect strategy from description
detect_strategy() {
    local text="${1,,}"  # lowercase
    local matched_strategy=""
    local matched_keywords=""
    local confidence="low"
    local match_count=0

    # Priority order: server_tick > crdt > lww > none
    for strategy in server_tick crdt lww none; do
        local keywords=${STRATEGY_KEYWORDS[$strategy]}
        local matches=()

        for keyword in $keywords; do
            if [[ "$text" == *"$keyword"* ]]; then
                matches+=("$keyword")
            fi
        done

        if [[ ${#matches[@]} -gt 0 ]]; then
            matched_strategy="$strategy"
            matched_keywords="${matches[*]}"
            match_count=${#matches[@]}

            if [[ $match_count -ge 3 ]]; then
                confidence="high"
            elif [[ $match_count -ge 2 ]]; then
                confidence="medium"
            fi

            break  # Use first matched strategy (priority order)
        fi
    done

    echo "$matched_strategy|$matched_keywords|$confidence"
}

# Get warnings for strategy
get_warnings() {
    local strategy="$1"
    local warnings=""

    case "$strategy" in
        server_tick)
            warnings="NEVER use optimistic UI for server-tick data|User actions must be disabled while pending"
            ;;
        crdt)
            warnings="Consider adding presence cursors for collaborators|CRDT operations can increase payload size"
            ;;
        lww)
            warnings="Last write wins - potential for data loss in conflicts"
            ;;
        none)
            warnings=""
            ;;
    esac

    echo "$warnings"
}

# Get rationale for strategy
get_rationale() {
    local strategy="$1"

    case "$strategy" in
        server_tick)
            echo "High stakes - server is absolute truth, tick-aligned"
            ;;
        crdt)
            echo "Collaborative text - every keystroke merges without conflict"
            ;;
        lww)
            echo "Property state - last write wins per property"
            ;;
        none)
            echo "Local UI state only - no sync needed"
            ;;
        *)
            echo "Unknown pattern - requires explicit declaration"
            ;;
    esac
}

# Main logic
main() {
    local input="$DESCRIPTION"
    if [[ -n "$DATA_PATH" ]]; then
        input="$DATA_PATH $input"
    fi

    # Detect strategy
    local result
    result=$(detect_strategy "$input")

    IFS='|' read -r strategy keywords confidence <<< "$result"

    # Build output
    local rationale
    rationale=$(get_rationale "$strategy")

    local warnings
    warnings=$(get_warnings "$strategy")

    # Output JSON
    if [[ -n "$strategy" ]]; then
        if [[ "$QUIET" != true ]]; then
            echo -e "${GREEN}Strategy detected: ${strategy}${NC}"
            echo -e "${BLUE}Confidence: ${confidence}${NC}"
            echo -e "${BLUE}Matched keywords: ${keywords}${NC}"
            echo ""
        fi

        cat << EOF
{
  "strategy": "${strategy}",
  "rationale": "${rationale}",
  "confidence": "${confidence}",
  "matchedKeywords": [$(echo "$keywords" | sed 's/ /", "/g' | sed 's/^/"/' | sed 's/$/"/')],
  "warnings": [$(echo "$warnings" | sed 's/|/", "/g' | sed 's/^/"/' | sed 's/$/"/')],
  "requiresDeclaration": false
}
EOF

        # Print warnings
        if [[ "$QUIET" != true && -n "$warnings" ]]; then
            echo ""
            echo -e "${YELLOW}Warnings:${NC}"
            IFS='|' read -ra warning_arr <<< "$warnings"
            for w in "${warning_arr[@]}"; do
                echo -e "  ${YELLOW}!${NC} $w"
            done
        fi

        exit 0
    else
        if [[ "$QUIET" != true ]]; then
            echo -e "${YELLOW}No strategy detected from keywords${NC}"
            echo ""
        fi

        cat << EOF
{
  "strategy": null,
  "rationale": "Unknown pattern - requires explicit declaration",
  "confidence": "none",
  "matchedKeywords": [],
  "warnings": ["Pattern not recognized. Use declareSyncStrategy() to specify."],
  "requiresDeclaration": true,
  "suggestions": ["lww", "server_tick", "crdt"]
}
EOF

        if [[ "$STRICT" == true ]]; then
            echo -e "${RED}STRICT MODE: Unknown pattern requires explicit declaration${NC}" >&2
            exit 1
        fi

        exit 0
    fi
}

main
