#!/usr/bin/env bash
# .claude/scripts/sigil-search.sh
#
# Sigil Search Abstraction Layer
# Detects ck availability and provides fallback to grep
# Used by /craft RLM system for codebase search
#
# Usage:
#   source .claude/scripts/sigil-search.sh
#   sigil_search "authentication flow"
#   sigil_search "error handling" --path src/components
#
# Environment:
#   SIGIL_SEARCH_MODE: "ck" | "grep" (auto-detected if not set)

set -euo pipefail

PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

# ============================================================================
# SEARCH MODE DETECTION
# ============================================================================

detect_search_mode() {
    # Detect search mode once per session
    # Sets SIGIL_SEARCH_MODE environment variable
    #
    # Priority:
    #   1. Existing SIGIL_SEARCH_MODE (if set)
    #   2. ck binary (if available)
    #   3. grep fallback (always available)

    if [[ -n "${SIGIL_SEARCH_MODE:-}" ]]; then
        return 0
    fi

    if command -v ck >/dev/null 2>&1; then
        export SIGIL_SEARCH_MODE="ck"
    else
        export SIGIL_SEARCH_MODE="grep"
    fi
}

get_search_mode() {
    # Return current search mode (for logging/debugging)
    detect_search_mode
    echo "${SIGIL_SEARCH_MODE}"
}

# ============================================================================
# MAIN SEARCH FUNCTION
# ============================================================================

sigil_search() {
    # Unified search function for /craft
    # Automatically uses ck or grep based on availability
    #
    # Args:
    #   $1: query (required) - search query
    #   --path <path>: search path (default: current directory)
    #   --limit <n>: max results (default: 20)
    #   --type <semantic|hybrid|regex>: search type (default: semantic)
    #
    # Returns:
    #   JSONL output: {"file": "path", "line": N, "snippet": "...", "score": 0.0}
    #
    # Example:
    #   sigil_search "authentication flow"
    #   sigil_search "useState" --type regex --path src/
    #   sigil_search "error handling" --limit 10

    local query=""
    local search_path="${PROJECT_ROOT}"
    local limit=20
    local search_type="semantic"

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --path)
                search_path="$2"
                shift 2
                ;;
            --limit)
                limit="$2"
                shift 2
                ;;
            --type)
                search_type="$2"
                shift 2
                ;;
            -*)
                echo "Error: Unknown option: $1" >&2
                return 1
                ;;
            *)
                if [[ -z "${query}" ]]; then
                    query="$1"
                else
                    query="${query} $1"
                fi
                shift
                ;;
        esac
    done

    if [[ -z "${query}" ]]; then
        echo "Error: Query is required" >&2
        echo "Usage: sigil_search <query> [--path <path>] [--limit <n>] [--type <semantic|hybrid|regex>]" >&2
        return 1
    fi

    # Normalize path
    if [[ ! "${search_path}" =~ ^/ ]]; then
        search_path="${PROJECT_ROOT}/${search_path}"
    fi

    # Detect mode
    detect_search_mode

    # Route to appropriate backend
    if [[ "${SIGIL_SEARCH_MODE}" == "ck" ]]; then
        _sigil_search_ck "${query}" "${search_path}" "${limit}" "${search_type}"
    else
        _sigil_search_grep "${query}" "${search_path}" "${limit}" "${search_type}"
    fi
}

# ============================================================================
# BACKEND: CK (Semantic Search)
# ============================================================================

_sigil_search_ck() {
    local query="$1"
    local search_path="$2"
    local limit="$3"
    local search_type="$4"

    case "${search_type}" in
        semantic)
            ck --semantic "${query}" \
                --path "${search_path}" \
                --top-k "${limit}" \
                --threshold 0.4 \
                --jsonl 2>/dev/null || echo ""
            ;;
        hybrid)
            ck --hybrid "${query}" \
                --path "${search_path}" \
                --top-k "${limit}" \
                --threshold 0.4 \
                --jsonl 2>/dev/null || echo ""
            ;;
        regex)
            ck --regex "${query}" \
                --path "${search_path}" \
                --jsonl 2>/dev/null | head -n "${limit}" || echo ""
            ;;
        *)
            echo "Error: Unknown search type: ${search_type}" >&2
            return 1
            ;;
    esac
}

# ============================================================================
# BACKEND: GREP (Fallback)
# ============================================================================

_sigil_search_grep() {
    local query="$1"
    local search_path="$2"
    local limit="$3"
    local search_type="$4"

    # File type includes for common code files
    local include_flags=(
        --include="*.js" --include="*.jsx"
        --include="*.ts" --include="*.tsx"
        --include="*.py"
        --include="*.go"
        --include="*.rs"
        --include="*.java"
        --include="*.cpp" --include="*.c" --include="*.h"
        --include="*.sh" --include="*.bash"
        --include="*.md"
        --include="*.yaml" --include="*.yml"
        --include="*.json"
        --include="*.toml"
    )

    local results=""

    case "${search_type}" in
        semantic|hybrid)
            # Convert query to keyword pattern (OR)
            local keywords
            keywords=$(echo "${query}" | tr '[:space:]' '\n' | grep -v '^$' | sort -u | paste -sd '|' -)

            if [[ -n "${keywords}" ]]; then
                results=$(grep -rn -E "${keywords}" "${include_flags[@]}" \
                    "${search_path}" 2>/dev/null | head -n "${limit}" || echo "")
            fi
            ;;
        regex)
            results=$(grep -rn -E "${query}" "${include_flags[@]}" \
                "${search_path}" 2>/dev/null | head -n "${limit}" || echo "")
            ;;
        *)
            echo "Error: Unknown search type: ${search_type}" >&2
            return 1
            ;;
    esac

    # Convert grep output to JSONL for consistent format
    _grep_to_jsonl <<< "${results}"
}

_grep_to_jsonl() {
    # Convert grep output (file:line:snippet) to JSONL format
    while IFS=: read -r file line snippet; do
        [[ -z "${file}" ]] && continue
        [[ -z "${line}" ]] && line=0

        # Normalize to absolute path
        if [[ ! "${file}" =~ ^/ ]]; then
            file="${PROJECT_ROOT}/${file}"
        fi

        # Output JSONL (score is 0.0 for grep results)
        jq -n \
            --arg file "${file}" \
            --argjson line "${line}" \
            --arg snippet "${snippet:-}" \
            '{file: $file, line: $line, snippet: $snippet, score: 0.0}'
    done
}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

sigil_search_files() {
    # Search for files by name pattern
    #
    # Args:
    #   $1: pattern (required) - glob pattern
    #   $2: path (optional) - search path (default: PROJECT_ROOT)
    #
    # Example:
    #   sigil_search_files "*.tsx" src/components

    local pattern="$1"
    local search_path="${2:-${PROJECT_ROOT}}"

    find "${search_path}" -type f -name "${pattern}" 2>/dev/null
}

sigil_search_definition() {
    # Search for function/class definitions
    #
    # Args:
    #   $1: name (required) - function or class name
    #   $2: path (optional) - search path (default: PROJECT_ROOT)
    #
    # Example:
    #   sigil_search_definition "ClaimButton"
    #   sigil_search_definition "useStake" src/hooks

    local name="$1"
    local search_path="${2:-${PROJECT_ROOT}}"

    # Pattern matches common definition syntaxes
    local pattern="(function|const|class|export|def|fn|func) +${name}"

    sigil_search "${pattern}" --type regex --path "${search_path}"
}

# ============================================================================
# EXPORT FUNCTIONS
# ============================================================================

export -f detect_search_mode
export -f get_search_mode
export -f sigil_search
export -f sigil_search_files
export -f sigil_search_definition
export -f _sigil_search_ck
export -f _sigil_search_grep
export -f _grep_to_jsonl

# Auto-detect on source
detect_search_mode
