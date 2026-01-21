#!/usr/bin/env bash
# =============================================================================
# Sigil Post-Install Verification
# =============================================================================
# Verifies all Sigil components are properly installed.
#
# Usage:
#   ./verify-sigil.sh [--json] [--quiet]
#
# Exit Codes:
#   0 = all checks passed
#   1 = critical check failed
#   2 = optional check failed (warning only)
# =============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Flags
JSON_OUTPUT=false
QUIET=false

# Results
RESULT_rules=""
RESULT_rules_count=""
RESULT_craft_command=""
RESULT_grimoire=""
RESULT_taste_md=""
RESULT_anchor_cli=""
RESULT_anchor_version=""
RESULT_lens_cli=""
RESULT_lens_version=""
RESULT_ipc_dirs=""

# Expected values
MIN_RULES_COUNT=20

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --json) JSON_OUTPUT=true; shift ;;
        --quiet) QUIET=true; shift ;;
        *) shift ;;
    esac
done

# Logging functions
log_check() {
    if ! $QUIET && ! $JSON_OUTPUT; then
        echo -e "  ${1}"
    fi
}

log_pass() {
    local key="$1"
    local msg="$2"
    eval "RESULT_${key}=pass"
    log_check "${GREEN}✓${NC} $msg"
}

log_fail() {
    local key="$1"
    local msg="$2"
    eval "RESULT_${key}=fail"
    log_check "${RED}✗${NC} $msg"
}

log_warn() {
    local key="$1"
    local msg="$2"
    eval "RESULT_${key}=warn"
    log_check "${YELLOW}⚠${NC} $msg"
}

# Check: Rules installed
check_rules() {
    local count
    count=$(find .claude/rules -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    RESULT_rules_count="$count"

    if [[ "$count" -ge "$MIN_RULES_COUNT" ]]; then
        log_pass "rules" "Rules installed ($count files)"
        return 0
    else
        log_fail "rules" "Rules missing (found $count, expected >= $MIN_RULES_COUNT)"
        return 1
    fi
}

# Check: /craft command exists
check_craft_command() {
    if [[ -f ".claude/commands/craft.md" ]]; then
        log_pass "craft_command" "/craft command available"
        return 0
    else
        log_fail "craft_command" "/craft command missing"
        return 1
    fi
}

# Check: Grimoire directory
check_grimoire() {
    if [[ -d "grimoires/sigil" ]]; then
        log_pass "grimoire" "Grimoire directory exists"
        return 0
    else
        log_fail "grimoire" "Grimoire directory missing"
        return 1
    fi
}

# Check: taste.md exists
check_taste_md() {
    if [[ -f "grimoires/sigil/taste.md" ]]; then
        log_pass "taste_md" "taste.md initialized"
        return 0
    else
        log_fail "taste_md" "taste.md missing"
        return 1
    fi
}

# Check: Anchor CLI
check_anchor_cli() {
    if command -v anchor &>/dev/null; then
        local version
        version=$(anchor --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "unknown")
        RESULT_anchor_version="$version"
        log_pass "anchor_cli" "anchor CLI v$version"
        return 0
    elif [[ -f "$HOME/.sigil/bin/anchor" ]]; then
        local version
        version=$("$HOME/.sigil/bin/anchor" --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "unknown")
        RESULT_anchor_version="$version"
        log_warn "anchor_cli" "anchor CLI v$version (not in PATH)"
        return 2
    else
        log_warn "anchor_cli" "anchor CLI not installed"
        return 2
    fi
}

# Check: Lens CLI
check_lens_cli() {
    if command -v lens &>/dev/null; then
        local version
        version=$(lens --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "unknown")
        RESULT_lens_version="$version"
        log_pass "lens_cli" "lens CLI v$version"
        return 0
    elif [[ -f "$HOME/.sigil/bin/lens" ]]; then
        local version
        version=$("$HOME/.sigil/bin/lens" --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "unknown")
        RESULT_lens_version="$version"
        log_warn "lens_cli" "lens CLI v$version (not in PATH)"
        return 2
    else
        log_warn "lens_cli" "lens CLI not installed"
        return 2
    fi
}

# Check: IPC directories
check_ipc_dirs() {
    if [[ -d "grimoires/sigil/pub/requests" ]] && [[ -d "grimoires/sigil/pub/responses" ]]; then
        log_pass "ipc_dirs" "IPC directories exist"
        return 0
    else
        log_fail "ipc_dirs" "IPC directories missing"
        return 1
    fi
}

# Output JSON results
output_json() {
    local success="$1"

    echo "{"
    echo "  \"success\": $success,"
    echo "  \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\","
    echo "  \"checks\": {"
    echo "    \"rules\": \"$RESULT_rules\","
    echo "    \"rules_count\": \"$RESULT_rules_count\","
    echo "    \"craft_command\": \"$RESULT_craft_command\","
    echo "    \"grimoire\": \"$RESULT_grimoire\","
    echo "    \"taste_md\": \"$RESULT_taste_md\","
    echo "    \"anchor_cli\": \"$RESULT_anchor_cli\","
    echo "    \"anchor_version\": \"$RESULT_anchor_version\","
    echo "    \"lens_cli\": \"$RESULT_lens_cli\","
    echo "    \"lens_version\": \"$RESULT_lens_version\","
    echo "    \"ipc_dirs\": \"$RESULT_ipc_dirs\""
    echo "  }"
    echo "}"
}

# Main
main() {
    local critical_failed=false
    local optional_warned=false

    if ! $JSON_OUTPUT && ! $QUIET; then
        echo ""
        echo -e "┌─ ${BLUE}Sigil Verification${NC} ──────────────────────────────────────────┐"
        echo -e "│                                                                │"
        echo -e "│  ${BLUE}Core Components:${NC}                                              │"
    fi

    # Critical checks
    check_rules || critical_failed=true
    check_craft_command || critical_failed=true
    check_grimoire || critical_failed=true
    check_taste_md || critical_failed=true
    check_ipc_dirs || critical_failed=true

    if ! $JSON_OUTPUT && ! $QUIET; then
        echo -e "│                                                                │"
        echo -e "│  ${BLUE}CLI Tools:${NC}                                                    │"
    fi

    # Optional checks (CLIs) - use || true to prevent set -e from aborting on exit code 2
    local anchor_result=0
    check_anchor_cli || anchor_result=$?
    if [[ $anchor_result -eq 2 ]]; then
        optional_warned=true
    fi

    local lens_result=0
    check_lens_cli || lens_result=$?
    if [[ $lens_result -eq 2 ]]; then
        optional_warned=true
    fi

    if ! $JSON_OUTPUT && ! $QUIET; then
        echo -e "│                                                                │"
        if $critical_failed; then
            echo -e "│  ${RED}Verification failed. Some components missing.${NC}                │"
        elif $optional_warned; then
            echo -e "│  ${GREEN}Core verified.${NC} CLIs need PATH configuration.                  │"
        else
            echo -e "│  ${GREEN}All components verified. Sigil ready.${NC}                         │"
        fi
        echo -e "│                                                                │"
        echo -e "└────────────────────────────────────────────────────────────────┘"
        echo ""
    fi

    # JSON output
    if $JSON_OUTPUT; then
        if $critical_failed; then
            output_json "false"
        else
            output_json "true"
        fi
    fi

    # Exit code
    if $critical_failed; then
        exit 1
    elif $optional_warned; then
        exit 2
    else
        exit 0
    fi
}

main "$@"
