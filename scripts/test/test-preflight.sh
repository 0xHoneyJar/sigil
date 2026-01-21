#!/usr/bin/env bash
# =============================================================================
# Pre-flight Script Tests
# =============================================================================
# Tests for scripts/preflight-sigil.sh
#
# Usage:
#   ./scripts/test/test-preflight.sh
#
# Exit Codes:
#   0 = all tests passed
#   1 = test(s) failed
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PREFLIGHT_SCRIPT="$PROJECT_ROOT/scripts/preflight-sigil.sh"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test helper functions
test_start() {
    echo -e "\n${YELLOW}TEST:${NC} $1"
    TESTS_RUN=$((TESTS_RUN + 1))
}

test_pass() {
    echo -e "  ${GREEN}✓ PASS${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

test_fail() {
    echo -e "  ${RED}✗ FAIL:${NC} $1"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

# Test: Script exists and is executable
test_script_exists() {
    test_start "Script exists and is executable"

    if [[ -x "$PREFLIGHT_SCRIPT" ]]; then
        test_pass
    else
        test_fail "Script not found or not executable: $PREFLIGHT_SCRIPT"
    fi
}

# Test: JSON output is valid
test_json_output() {
    test_start "JSON output is valid JSON"

    local output
    output=$("$PREFLIGHT_SCRIPT" --json 2>/dev/null) || true

    if echo "$output" | python3 -c "import sys, json; json.load(sys.stdin)" 2>/dev/null; then
        test_pass
    elif command -v jq &>/dev/null && echo "$output" | jq . &>/dev/null; then
        test_pass
    else
        test_fail "Invalid JSON output"
        echo "Output was: $output"
    fi
}

# Test: JSON contains required fields
test_json_fields() {
    test_start "JSON output contains required fields"

    local output
    output=$("$PREFLIGHT_SCRIPT" --json 2>/dev/null) || true

    local has_success has_checks
    if command -v jq &>/dev/null; then
        has_success=$(echo "$output" | jq -r 'has("success")' 2>/dev/null)
        has_checks=$(echo "$output" | jq -r 'has("checks")' 2>/dev/null)
    else
        # Fallback check
        has_success="true"
        has_checks="true"
        if ! echo "$output" | grep -q '"success"'; then
            has_success="false"
        fi
        if ! echo "$output" | grep -q '"checks"'; then
            has_checks="false"
        fi
    fi

    if [[ "$has_success" == "true" ]] && [[ "$has_checks" == "true" ]]; then
        test_pass
    else
        test_fail "Missing required fields (success=$has_success, checks=$has_checks)"
    fi
}

# Test: Quiet mode produces no output
test_quiet_mode() {
    test_start "Quiet mode produces no output"

    local output
    output=$("$PREFLIGHT_SCRIPT" --quiet 2>&1) || true

    if [[ -z "$output" ]]; then
        test_pass
    else
        test_fail "Quiet mode produced output: $output"
    fi
}

# Test: Exit code meanings
test_exit_codes() {
    test_start "Exit codes follow specification"

    # Run from the project root where prerequisites should pass
    cd "$PROJECT_ROOT"

    local exit_code
    "$PREFLIGHT_SCRIPT" --quiet >/dev/null 2>&1
    exit_code=$?

    # Exit 0 = all pass, 1 = required fail, 2 = optional warn
    if [[ $exit_code -le 2 ]]; then
        test_pass
        echo "  (exit code: $exit_code)"
    else
        test_fail "Unexpected exit code: $exit_code (expected 0, 1, or 2)"
    fi
}

# Test: Platform detection
test_platform_detection() {
    test_start "Platform is detected in output"

    local output
    output=$("$PREFLIGHT_SCRIPT" --json 2>/dev/null) || true

    # The JSON stores status in .checks.platform ("pass"/"fail")
    # and actual platform value needs to be inferred from the pre-flight run
    local platform_status
    if command -v jq &>/dev/null; then
        platform_status=$(echo "$output" | jq -r '.checks.platform // "none"' 2>/dev/null)
    else
        platform_status=$(echo "$output" | grep -o '"platform": "[^"]*"' | sed 's/.*: "\([^"]*\)"/\1/')
    fi

    # Platform is considered detected if status is "pass"
    if [[ "$platform_status" == "pass" ]]; then
        # Get actual platform from system
        local actual_platform
        actual_platform=$(uname -s)-$(uname -m)
        case "$actual_platform" in
            Darwin-arm64) actual_platform="darwin-arm64" ;;
            Darwin-x86_64) actual_platform="darwin-x64" ;;
            Linux-x86_64) actual_platform="linux-x64" ;;
            Linux-aarch64) actual_platform="linux-arm64" ;;
        esac
        test_pass
        echo "  (platform: $actual_platform, status: pass)"
    else
        test_fail "Platform detection failed: status=$platform_status"
    fi
}

# Test: Node version detection
test_node_detection() {
    test_start "Node version is detected"

    if ! command -v node &>/dev/null; then
        echo "  ${YELLOW}SKIP${NC}: Node not installed"
        return
    fi

    local output
    output=$("$PREFLIGHT_SCRIPT" --json 2>/dev/null) || true

    local node_version
    if command -v jq &>/dev/null; then
        node_version=$(echo "$output" | jq -r '.checks.node_version // "none"' 2>/dev/null)
    else
        node_version=$(echo "$output" | grep -o '"node_version": "[^"]*"' | sed 's/.*: "\([^"]*\)"/\1/')
    fi

    if [[ -n "$node_version" ]] && [[ "$node_version" != "none" ]] && [[ "$node_version" != "null" ]]; then
        test_pass
        echo "  (version: $node_version)"
    else
        test_fail "Node version not detected"
    fi
}

# Summary
print_summary() {
    echo ""
    echo "========================================"
    echo "Test Summary"
    echo "========================================"
    echo -e "Tests run:    $TESTS_RUN"
    echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"
    echo ""

    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "${GREEN}All tests passed!${NC}"
        return 0
    else
        echo -e "${RED}Some tests failed.${NC}"
        return 1
    fi
}

# Main
main() {
    echo "========================================"
    echo "Pre-flight Script Tests"
    echo "========================================"

    test_script_exists
    test_json_output
    test_json_fields
    test_quiet_mode
    test_exit_codes
    test_platform_detection
    test_node_detection

    print_summary
}

main "$@"
