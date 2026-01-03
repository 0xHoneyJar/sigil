#!/bin/sh
# test-helpers.sh — Test all Sigil v3 helper scripts
# Usage: test-helpers.sh [--verbose]
# Returns: 0 if all pass, 1 if any fail

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VERBOSE="${1:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0

log_pass() {
    PASS_COUNT=$((PASS_COUNT + 1))
    printf "${GREEN}PASS${NC}: %s\n" "$1"
}

log_fail() {
    FAIL_COUNT=$((FAIL_COUNT + 1))
    printf "${RED}FAIL${NC}: %s\n" "$1"
    if [ -n "$2" ]; then
        printf "      Expected: %s\n" "$2"
    fi
    if [ -n "$3" ]; then
        printf "      Got: %s\n" "$3"
    fi
}

echo "=== Sigil v3 Helper Script Tests ==="
echo ""

# ============================================
# Test get-strictness.sh
# ============================================
echo "--- Testing get-strictness.sh ---"

# Test 1: Invalid strictness returns error
test_strictness_no_config() {
    # Create temp directory with no config
    TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR"

    OUTPUT=$("$SCRIPT_DIR/get-strictness.sh" 2>&1 || true)

    if echo "$OUTPUT" | grep -q "error"; then
        log_pass "get-strictness: returns error when no config"
    else
        log_fail "get-strictness: returns error when no config" "error message" "$OUTPUT"
    fi

    cd - >/dev/null
    rm -rf "$TEMP_DIR"
}

# Test 2: Valid strictness values
test_strictness_valid_values() {
    TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR"

    # Test discovery
    echo 'version: "3.0"' > .sigilrc.yaml
    echo 'strictness: "discovery"' >> .sigilrc.yaml

    OUTPUT=$("$SCRIPT_DIR/get-strictness.sh" 2>&1 || true)

    if echo "$OUTPUT" | grep -q "discovery"; then
        log_pass "get-strictness: returns 'discovery'"
    else
        log_fail "get-strictness: returns 'discovery'" "discovery" "$OUTPUT"
    fi

    # Test enforcing
    echo 'version: "3.0"' > .sigilrc.yaml
    echo 'strictness: "enforcing"' >> .sigilrc.yaml

    OUTPUT=$("$SCRIPT_DIR/get-strictness.sh" 2>&1 || true)

    if echo "$OUTPUT" | grep -q "enforcing"; then
        log_pass "get-strictness: returns 'enforcing'"
    else
        log_fail "get-strictness: returns 'enforcing'" "enforcing" "$OUTPUT"
    fi

    cd - >/dev/null
    rm -rf "$TEMP_DIR"
}

test_strictness_no_config
test_strictness_valid_values

# ============================================
# Test get-monitors.sh
# ============================================
echo ""
echo "--- Testing get-monitors.sh ---"

# Test 1: Invalid domain returns error
test_monitors_invalid_domain() {
    OUTPUT=$("$SCRIPT_DIR/get-monitors.sh" invalid_domain 2>&1 || true)

    if echo "$OUTPUT" | grep -q "error"; then
        log_pass "get-monitors: rejects invalid domain"
    else
        log_fail "get-monitors: rejects invalid domain" "error message" "$OUTPUT"
    fi
}

# Test 2: Valid domains return JSON
test_monitors_valid_domains() {
    for domain in defi creative community games general; do
        OUTPUT=$("$SCRIPT_DIR/get-monitors.sh" "$domain" 2>&1 || true)

        if echo "$OUTPUT" | grep -q "monitors"; then
            log_pass "get-monitors: returns monitors for '$domain'"
        else
            log_fail "get-monitors: returns monitors for '$domain'" "monitors array" "$OUTPUT"
        fi
    done
}

# Test 3: No domain lists available domains
test_monitors_list_domains() {
    OUTPUT=$("$SCRIPT_DIR/get-monitors.sh" 2>&1 || true)

    if echo "$OUTPUT" | grep -q "domains"; then
        log_pass "get-monitors: lists domains when no arg"
    else
        log_fail "get-monitors: lists domains when no arg" "domains list" "$OUTPUT"
    fi
}

test_monitors_invalid_domain
test_monitors_valid_domains
test_monitors_list_domains

# ============================================
# Test get-lens.sh
# ============================================
echo ""
echo "--- Testing get-lens.sh ---"

# Test 1: No config returns error
test_lens_no_config() {
    TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR"

    OUTPUT=$("$SCRIPT_DIR/get-lens.sh" "some/path.tsx" 2>&1 || true)

    if echo "$OUTPUT" | grep -q "error\|default"; then
        log_pass "get-lens: handles missing config"
    else
        log_fail "get-lens: handles missing config" "error or default" "$OUTPUT"
    fi

    cd - >/dev/null
    rm -rf "$TEMP_DIR"
}

test_lens_no_config

# ============================================
# Test check-flaw.sh
# ============================================
echo ""
echo "--- Testing check-flaw.sh ---"

# Test 1: No flaws file returns clean
test_flaw_no_file() {
    TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR"

    OUTPUT=$("$SCRIPT_DIR/check-flaw.sh" "test-component" 2>&1 || true)

    if echo "$OUTPUT" | grep -qE "clean|not_found|no_flaws"; then
        log_pass "check-flaw: handles missing flaws file"
    else
        log_fail "check-flaw: handles missing flaws file" "clean or not_found" "$OUTPUT"
    fi

    cd - >/dev/null
    rm -rf "$TEMP_DIR"
}

test_flaw_no_file

# ============================================
# Test check-decision.sh
# ============================================
echo ""
echo "--- Testing check-decision.sh ---"

# Test 1: No decisions returns clean
test_decision_no_file() {
    TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR"

    OUTPUT=$("$SCRIPT_DIR/check-decision.sh" "some/path.tsx" 2>&1 || true)

    if echo "$OUTPUT" | grep -qE "clean|not_found|no_decisions"; then
        log_pass "check-decision: handles missing decisions"
    else
        log_fail "check-decision: handles missing decisions" "clean or not_found" "$OUTPUT"
    fi

    cd - >/dev/null
    rm -rf "$TEMP_DIR"
}

test_decision_no_file

# ============================================
# Test detect-components.sh
# ============================================
echo ""
echo "--- Testing detect-components.sh ---"

test_detect_components() {
    TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR"

    # Create standard component directories
    mkdir -p components
    mkdir -p src/components

    OUTPUT=$("$SCRIPT_DIR/detect-components.sh" 2>&1 || true)

    if echo "$OUTPUT" | grep -q "components"; then
        log_pass "detect-components: finds component directories"
    else
        log_fail "detect-components: finds component directories" "components path" "$OUTPUT"
    fi

    cd - >/dev/null
    rm -rf "$TEMP_DIR"
}

test_detect_components

# ============================================
# Summary
# ============================================
echo ""
echo "=== Summary ==="
printf "Passed: ${GREEN}%d${NC}\n" "$PASS_COUNT"
printf "Failed: ${RED}%d${NC}\n" "$FAIL_COUNT"

if [ "$FAIL_COUNT" -gt 0 ]; then
    exit 1
fi

exit 0
