#!/bin/bash
# check-sync-declarations.sh
# Claude Code hook script for checking sync declarations in SQLite
#
# Sprint 11: Interaction Router
# Queries and validates sync declarations from the database.

set -euo pipefail

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project root detection
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}/../.."

# Default database path
DB_PATH="${PROJECT_ROOT}/.sigil/sigil.db"

usage() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS] [COMMAND]

Query and manage sync strategy declarations.

COMMANDS:
    list                  List all declarations
    get <path>            Get declaration for a specific path
    count                 Count declarations by strategy
    validate              Validate all declarations
    find <strategy>       Find all declarations for a strategy

OPTIONS:
    -d, --db <path>       Path to SQLite database (default: .sigil/sigil.db)
    -j, --json            Output as JSON
    -q, --quiet           Suppress headers and formatting
    -h, --help            Show this help message

EXAMPLES:
    $(basename "$0") list
    $(basename "$0") get user.balance
    $(basename "$0") find server_tick
    $(basename "$0") count --json
EOF
    exit 0
}

# Default values
COMMAND="list"
JSON_OUTPUT=false
QUIET=false
PATH_ARG=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--db)
            DB_PATH="$2"
            shift 2
            ;;
        -j|--json)
            JSON_OUTPUT=true
            shift
            ;;
        -q|--quiet)
            QUIET=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        list|get|count|validate|find)
            COMMAND="$1"
            shift
            if [[ $# -gt 0 && ! "$1" =~ ^- ]]; then
                PATH_ARG="$1"
                shift
            fi
            ;;
        *)
            if [[ -z "$PATH_ARG" ]]; then
                PATH_ARG="$1"
            fi
            shift
            ;;
    esac
done

# Check database exists
if [[ ! -f "$DB_PATH" ]]; then
    if [[ "$JSON_OUTPUT" == true ]]; then
        echo '{"error": "Database not found. Run sigil init first."}'
    else
        echo -e "${RED}Error: Database not found at ${DB_PATH}${NC}" >&2
        echo "Run 'sigil init' to create the database." >&2
    fi
    exit 1
fi

# Check sqlite3 is available
if ! command -v sqlite3 &> /dev/null; then
    if [[ "$JSON_OUTPUT" == true ]]; then
        echo '{"error": "sqlite3 command not found"}'
    else
        echo -e "${RED}Error: sqlite3 command not found${NC}" >&2
    fi
    exit 1
fi

# List all declarations
cmd_list() {
    if [[ "$JSON_OUTPUT" == true ]]; then
        sqlite3 -json "$DB_PATH" "SELECT data_path, strategy, declared_by, declared_at, rationale FROM sync_declarations ORDER BY declared_at DESC"
    else
        if [[ "$QUIET" != true ]]; then
            echo -e "${CYAN}Sync Declarations${NC}"
            echo "=================="
            echo ""
        fi

        local count
        count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sync_declarations")

        if [[ "$count" -eq 0 ]]; then
            echo "No declarations found."
            return 0
        fi

        # Format output
        sqlite3 -header -column "$DB_PATH" "SELECT data_path as 'Data Path', strategy as 'Strategy', declared_by as 'Declared By', declared_at as 'Date' FROM sync_declarations ORDER BY declared_at DESC"

        if [[ "$QUIET" != true ]]; then
            echo ""
            echo -e "${BLUE}Total: ${count} declaration(s)${NC}"
        fi
    fi
}

# Get specific declaration
cmd_get() {
    if [[ -z "$PATH_ARG" ]]; then
        echo -e "${RED}Error: Path argument required${NC}" >&2
        exit 1
    fi

    if [[ "$JSON_OUTPUT" == true ]]; then
        sqlite3 -json "$DB_PATH" "SELECT data_path, strategy, declared_by, declared_at, rationale FROM sync_declarations WHERE data_path = '$PATH_ARG'"
    else
        local result
        result=$(sqlite3 -separator '|' "$DB_PATH" "SELECT data_path, strategy, declared_by, declared_at, rationale FROM sync_declarations WHERE data_path = '$PATH_ARG'")

        if [[ -z "$result" ]]; then
            echo -e "${YELLOW}No declaration found for: ${PATH_ARG}${NC}"
            exit 0
        fi

        IFS='|' read -r data_path strategy declared_by declared_at rationale <<< "$result"

        echo -e "${CYAN}Declaration for: ${data_path}${NC}"
        echo "========================="
        echo -e "Strategy:    ${GREEN}${strategy}${NC}"
        echo -e "Declared by: ${declared_by}"
        echo -e "Date:        ${declared_at}"
        echo -e "Rationale:   ${rationale}"
    fi
}

# Count by strategy
cmd_count() {
    if [[ "$JSON_OUTPUT" == true ]]; then
        sqlite3 -json "$DB_PATH" "SELECT strategy, COUNT(*) as count FROM sync_declarations GROUP BY strategy"
    else
        if [[ "$QUIET" != true ]]; then
            echo -e "${CYAN}Declaration Counts by Strategy${NC}"
            echo "==============================="
            echo ""
        fi

        sqlite3 -header -column "$DB_PATH" "SELECT strategy as 'Strategy', COUNT(*) as 'Count' FROM sync_declarations GROUP BY strategy ORDER BY COUNT(*) DESC"

        local total
        total=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sync_declarations")
        if [[ "$QUIET" != true ]]; then
            echo ""
            echo -e "${BLUE}Total: ${total} declaration(s)${NC}"
        fi
    fi
}

# Validate declarations
cmd_validate() {
    local valid_strategies="server_tick crdt lww none"
    local errors=()
    local valid_count=0
    local invalid_count=0

    while IFS='|' read -r data_path strategy; do
        if [[ " $valid_strategies " =~ " $strategy " ]]; then
            ((valid_count++))
        else
            errors+=("Invalid strategy '${strategy}' for path '${data_path}'")
            ((invalid_count++))
        fi
    done < <(sqlite3 -separator '|' "$DB_PATH" "SELECT data_path, strategy FROM sync_declarations")

    if [[ "$JSON_OUTPUT" == true ]]; then
        local errors_json="[]"
        if [[ ${#errors[@]} -gt 0 ]]; then
            errors_json=$(printf '%s\n' "${errors[@]}" | jq -R . | jq -s .)
        fi
        echo "{\"valid\": ${valid_count}, \"invalid\": ${invalid_count}, \"errors\": ${errors_json}}"
    else
        if [[ "$QUIET" != true ]]; then
            echo -e "${CYAN}Declaration Validation${NC}"
            echo "======================"
            echo ""
        fi

        if [[ $invalid_count -eq 0 ]]; then
            echo -e "${GREEN}All ${valid_count} declarations are valid${NC}"
        else
            echo -e "${RED}Found ${invalid_count} invalid declaration(s):${NC}"
            for err in "${errors[@]}"; do
                echo -e "  ${RED}!${NC} $err"
            done
            echo ""
            echo -e "${GREEN}Valid: ${valid_count}${NC}"
        fi
    fi

    [[ $invalid_count -eq 0 ]]
}

# Find by strategy
cmd_find() {
    if [[ -z "$PATH_ARG" ]]; then
        echo -e "${RED}Error: Strategy argument required${NC}" >&2
        echo "Valid strategies: server_tick, crdt, lww, none" >&2
        exit 1
    fi

    local strategy="$PATH_ARG"
    local valid_strategies="server_tick crdt lww none"

    if [[ ! " $valid_strategies " =~ " $strategy " ]]; then
        echo -e "${RED}Error: Invalid strategy '${strategy}'${NC}" >&2
        echo "Valid strategies: server_tick, crdt, lww, none" >&2
        exit 1
    fi

    if [[ "$JSON_OUTPUT" == true ]]; then
        sqlite3 -json "$DB_PATH" "SELECT data_path, strategy, declared_by, declared_at, rationale FROM sync_declarations WHERE strategy = '$strategy' ORDER BY declared_at DESC"
    else
        if [[ "$QUIET" != true ]]; then
            echo -e "${CYAN}Declarations with strategy: ${strategy}${NC}"
            echo "========================================="
            echo ""
        fi

        local count
        count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sync_declarations WHERE strategy = '$strategy'")

        if [[ "$count" -eq 0 ]]; then
            echo "No declarations found for strategy: ${strategy}"
            return 0
        fi

        sqlite3 -header -column "$DB_PATH" "SELECT data_path as 'Data Path', declared_by as 'Declared By', declared_at as 'Date' FROM sync_declarations WHERE strategy = '$strategy' ORDER BY declared_at DESC"

        if [[ "$QUIET" != true ]]; then
            echo ""
            echo -e "${BLUE}Total: ${count} declaration(s)${NC}"
        fi
    fi
}

# Execute command
case "$COMMAND" in
    list)
        cmd_list
        ;;
    get)
        cmd_get
        ;;
    count)
        cmd_count
        ;;
    validate)
        cmd_validate
        ;;
    find)
        cmd_find
        ;;
    *)
        echo -e "${RED}Unknown command: ${COMMAND}${NC}" >&2
        usage
        ;;
esac
