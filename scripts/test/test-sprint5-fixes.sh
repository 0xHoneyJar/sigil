#!/usr/bin/env bash
# =============================================================================
# Sprint 5 Bug Fix Tests
# =============================================================================
# Tests for the bugs fixed in Sprint 5:
#   - Checksum verification against archives
#   - VERSION marker resolution
#   - Optional check exit code handling
#
# Usage:
#   ./scripts/test/test-sprint5-fixes.sh
#
# Exit Codes:
#   0 = all tests passed
#   1 = test(s) failed
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

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

# =============================================================================
# SPRINT-5.1: Checksum Verification Tests
# =============================================================================

test_verify_checksums_uses_archives() {
    test_start "verify_checksums uses archive names (not binary names)"

    # Check that the function signature now includes platform
    if grep -q 'verify_checksums()' "$PROJECT_ROOT/scripts/install-cli.sh" && \
       grep -A 5 'verify_checksums()' "$PROJECT_ROOT/scripts/install-cli.sh" | grep -q 'platform'; then
        test_pass
    else
        test_fail "verify_checksums doesn't accept platform parameter"
    fi
}

test_checksum_uses_grep_F() {
    test_start "checksum lookup uses -F for exact match"

    if grep -q 'grep -F' "$PROJECT_ROOT/scripts/install-cli.sh"; then
        test_pass
    else
        test_fail "checksum lookup should use grep -F for exact archive name match"
    fi
}

test_download_separate_from_extract() {
    test_start "download_archive and extract_and_install are separate functions"

    local has_download has_extract
    has_download=$(grep -c 'download_archive()' "$PROJECT_ROOT/scripts/install-cli.sh" || echo 0)
    has_extract=$(grep -c 'extract_and_install()' "$PROJECT_ROOT/scripts/install-cli.sh" || echo 0)

    if [[ "$has_download" -ge 1 ]] && [[ "$has_extract" -ge 1 ]]; then
        test_pass
    else
        test_fail "Missing separate download/extract functions (download=$has_download, extract=$has_extract)"
    fi
}

test_checksum_before_extract() {
    test_start "verify_checksums is called before extract_and_install"

    # Extract line numbers - look for calls in main(), not function definitions
    # Calls are identified by being indented (start with whitespace) and not being inside a function definition
    local verify_line extract_line

    # Get the line number where verify_checksums is CALLED (not defined)
    verify_line=$(grep -n '^\s*verify_checksums ' "$PROJECT_ROOT/scripts/install-cli.sh" | head -1 | cut -d: -f1 || echo 0)
    # Get the line number where extract_and_install is CALLED
    extract_line=$(grep -n '^\s*extract_and_install ' "$PROJECT_ROOT/scripts/install-cli.sh" | head -1 | cut -d: -f1 || echo 0)

    if [[ "$verify_line" -gt 0 ]] && [[ "$extract_line" -gt 0 ]] && [[ "$verify_line" -lt "$extract_line" ]]; then
        test_pass
        echo "  (verify at line $verify_line, extract at line $extract_line)"
    else
        test_fail "verify_checksums should be called before extract_and_install (verify=$verify_line, extract=$extract_line)"
    fi
}

# =============================================================================
# SPRINT-5.2: VERSION Marker Tests
# =============================================================================

test_version_resolution_exists() {
    test_start "install_construct_git resolves 'latest' to semver"

    if grep -A 30 'install_construct_git()' "$PROJECT_ROOT/scripts/mount-sigil.sh" | grep -q 'resolved_version'; then
        test_pass
    else
        test_fail "install_construct_git doesn't resolve version"
    fi
}

test_version_checks_json() {
    test_start "VERSION resolution reads from VERSION.json"

    # Look for VERSION.json anywhere in the install_construct_git function (use 60 lines for safety)
    if grep -A 60 'install_construct_git()' "$PROJECT_ROOT/scripts/mount-sigil.sh" | grep -q 'VERSION.json'; then
        test_pass
    else
        test_fail "VERSION resolution doesn't check VERSION.json"
    fi
}

test_version_fallback() {
    test_start "VERSION resolution has fallback to 0.0.0"

    # Look for 0.0.0 fallback anywhere in the install_construct_git function
    if grep -A 60 'install_construct_git()' "$PROJECT_ROOT/scripts/mount-sigil.sh" | grep -q '0.0.0'; then
        test_pass
    else
        test_fail "VERSION resolution doesn't have 0.0.0 fallback"
    fi
}

test_version_json_exists() {
    test_start "VERSION.json exists at repo root"

    if [[ -f "$PROJECT_ROOT/VERSION.json" ]]; then
        test_pass
    else
        test_fail "VERSION.json not found at repo root"
    fi
}

test_version_json_has_sigil() {
    test_start "VERSION.json contains 'sigil' version"

    if [[ -f "$PROJECT_ROOT/VERSION.json" ]] && grep -q '"sigil"' "$PROJECT_ROOT/VERSION.json"; then
        local version
        version=$(grep -o '"sigil"[[:space:]]*:[[:space:]]*"[^"]*"' "$PROJECT_ROOT/VERSION.json" | sed 's/.*"\([^"]*\)"$/\1/')
        # Check it looks like semver (X.Y.Z)
        if [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            test_pass
            echo "  (version: $version)"
        else
            test_fail "sigil version is not semver format: $version"
        fi
    else
        test_fail "VERSION.json missing 'sigil' field"
    fi
}

# =============================================================================
# SPRINT-5.3: Exit Code Handling Tests
# =============================================================================

test_preflight_optional_or_true() {
    test_start "preflight-sigil.sh uses || pattern for optional checks"

    if grep -A 3 'Optional checks' "$PROJECT_ROOT/scripts/preflight-sigil.sh" | grep -q '|| '; then
        test_pass
    else
        test_fail "preflight-sigil.sh doesn't use || pattern for optional checks"
    fi
}

test_verify_optional_or_true() {
    test_start "verify-sigil.sh uses || pattern for optional checks"

    if grep -A 3 'Optional checks' "$PROJECT_ROOT/scripts/verify-sigil.sh" | grep -q '|| '; then
        test_pass
    else
        test_fail "verify-sigil.sh doesn't use || pattern for optional checks"
    fi
}

test_preflight_json_with_warnings() {
    test_start "preflight-sigil.sh --json outputs valid JSON even with warnings"

    cd "$PROJECT_ROOT"

    local output exit_code
    set +e
    output=$("$PROJECT_ROOT/scripts/preflight-sigil.sh" --json 2>/dev/null)
    exit_code=$?
    set -e

    # Should output valid JSON even on exit code 2 (warnings)
    if [[ $exit_code -le 2 ]]; then
        if echo "$output" | grep -q '"success"'; then
            test_pass
            echo "  (exit code: $exit_code)"
        else
            test_fail "JSON output missing 'success' field"
        fi
    else
        test_fail "Unexpected exit code: $exit_code"
    fi
}

test_verify_json_with_warnings() {
    test_start "verify-sigil.sh --json outputs valid JSON even with warnings"

    cd "$PROJECT_ROOT"

    local output exit_code
    set +e
    output=$("$PROJECT_ROOT/scripts/verify-sigil.sh" --json 2>/dev/null)
    exit_code=$?
    set -e

    # Should output valid JSON even on exit code 2 (warnings)
    if [[ $exit_code -le 2 ]]; then
        if echo "$output" | grep -q '"success"'; then
            test_pass
            echo "  (exit code: $exit_code)"
        else
            test_fail "JSON output missing 'success' field"
        fi
    else
        test_fail "Unexpected exit code: $exit_code"
    fi
}

# =============================================================================
# Summary
# =============================================================================

print_summary() {
    echo ""
    echo "========================================"
    echo "Sprint 5 Bug Fix Test Summary"
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
    echo "Sprint 5 Bug Fix Tests"
    echo "========================================"
    echo "Testing fixes for:"
    echo "  - SPRINT-5.1: Checksum verification"
    echo "  - SPRINT-5.2: VERSION marker resolution"
    echo "  - SPRINT-5.3: Optional check exit codes"
    echo "  - SPRINT-5.4: VERSION.json existence"

    # SPRINT-5.1 tests
    test_verify_checksums_uses_archives
    test_checksum_uses_grep_F
    test_download_separate_from_extract
    test_checksum_before_extract

    # SPRINT-5.2 tests
    test_version_resolution_exists
    test_version_checks_json
    test_version_fallback
    test_version_json_exists
    test_version_json_has_sigil

    # SPRINT-5.3 tests
    test_preflight_optional_or_true
    test_verify_optional_or_true
    test_preflight_json_with_warnings
    test_verify_json_with_warnings

    print_summary
}

main "$@"
