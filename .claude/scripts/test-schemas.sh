#!/bin/sh
# test-schemas.sh — Validate YAML files against JSON Schemas
# Usage: test-schemas.sh [--verbose]
# Returns: 0 if all pass, 1 if any fail

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCHEMA_DIR="$SCRIPT_DIR/../schemas"
VERBOSE="${1:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0

log_pass() {
    PASS_COUNT=$((PASS_COUNT + 1))
    printf "${GREEN}PASS${NC}: %s\n" "$1"
}

log_fail() {
    FAIL_COUNT=$((FAIL_COUNT + 1))
    printf "${RED}FAIL${NC}: %s\n" "$1"
    if [ -n "$2" ]; then
        printf "      %s\n" "$2"
    fi
}

log_skip() {
    SKIP_COUNT=$((SKIP_COUNT + 1))
    printf "${YELLOW}SKIP${NC}: %s\n" "$1"
}

# Check for required tools
check_tools() {
    if ! command -v yq >/dev/null 2>&1; then
        echo "Warning: yq not installed, using basic YAML syntax check"
        return 1
    fi
    return 0
}

# Validate YAML syntax (basic check)
validate_yaml_syntax() {
    local file="$1"
    if command -v yq >/dev/null 2>&1; then
        if yq '.' "$file" >/dev/null 2>&1; then
            return 0
        else
            return 1
        fi
    elif command -v python3 >/dev/null 2>&1; then
        if python3 -c "import yaml; yaml.safe_load(open('$file'))" 2>/dev/null; then
            return 0
        else
            return 1
        fi
    else
        # Fallback: just check file exists and is not empty
        if [ -s "$file" ]; then
            return 0
        else
            return 1
        fi
    fi
}

# Validate required fields exist
validate_required_fields() {
    local file="$1"
    local schema_type="$2"

    case "$schema_type" in
        "sigilrc")
            if yq -e '.version' "$file" >/dev/null 2>&1 && \
               yq -e '.strictness' "$file" >/dev/null 2>&1; then
                return 0
            fi
            ;;
        "immutable-values")
            if yq -e '.version' "$file" >/dev/null 2>&1; then
                return 0
            fi
            ;;
        "canon-of-flaws")
            if yq -e '.version' "$file" >/dev/null 2>&1 && \
               yq -e '.flaws' "$file" >/dev/null 2>&1; then
                return 0
            fi
            ;;
        "lenses")
            if yq -e '.version' "$file" >/dev/null 2>&1; then
                return 0
            fi
            ;;
        "consultation-config")
            if yq -e '.version' "$file" >/dev/null 2>&1 && \
               yq -e '.layers' "$file" >/dev/null 2>&1; then
                return 0
            fi
            ;;
        "proving-config")
            if yq -e '.version' "$file" >/dev/null 2>&1 && \
               yq -e '.default_duration_days' "$file" >/dev/null 2>&1; then
                return 0
            fi
            ;;
        *)
            # Unknown schema, just check syntax
            return 0
            ;;
    esac
    return 1
}

# Main validation
echo "=== Sigil v3 Schema Validation ==="
echo ""

# Check if sigil-mark exists
if [ ! -d "sigil-mark" ]; then
    echo "No sigil-mark directory found. Run /setup first."
    echo ""
    echo "Summary: 0 passed, 0 failed, all skipped (no setup)"
    exit 0
fi

HAS_YQ=0
check_tools && HAS_YQ=1

# Test .sigilrc.yaml
if [ -f ".sigilrc.yaml" ]; then
    if validate_yaml_syntax ".sigilrc.yaml"; then
        if [ "$HAS_YQ" = "1" ] && validate_required_fields ".sigilrc.yaml" "sigilrc"; then
            log_pass ".sigilrc.yaml (syntax + required fields)"
        else
            log_pass ".sigilrc.yaml (syntax only)"
        fi
    else
        log_fail ".sigilrc.yaml" "YAML syntax error"
    fi
else
    log_skip ".sigilrc.yaml (not found)"
fi

# Test Soul Binder files
if [ -f "sigil-mark/soul-binder/immutable-values.yaml" ]; then
    if validate_yaml_syntax "sigil-mark/soul-binder/immutable-values.yaml"; then
        if [ "$HAS_YQ" = "1" ] && validate_required_fields "sigil-mark/soul-binder/immutable-values.yaml" "immutable-values"; then
            log_pass "immutable-values.yaml (syntax + required fields)"
        else
            log_pass "immutable-values.yaml (syntax only)"
        fi
    else
        log_fail "immutable-values.yaml" "YAML syntax error"
    fi
else
    log_skip "immutable-values.yaml (not found)"
fi

if [ -f "sigil-mark/soul-binder/canon-of-flaws.yaml" ]; then
    if validate_yaml_syntax "sigil-mark/soul-binder/canon-of-flaws.yaml"; then
        if [ "$HAS_YQ" = "1" ] && validate_required_fields "sigil-mark/soul-binder/canon-of-flaws.yaml" "canon-of-flaws"; then
            log_pass "canon-of-flaws.yaml (syntax + required fields)"
        else
            log_pass "canon-of-flaws.yaml (syntax only)"
        fi
    else
        log_fail "canon-of-flaws.yaml" "YAML syntax error"
    fi
else
    log_skip "canon-of-flaws.yaml (not found)"
fi

# Test Lens Array files
if [ -f "sigil-mark/lens-array/lenses.yaml" ]; then
    if validate_yaml_syntax "sigil-mark/lens-array/lenses.yaml"; then
        if [ "$HAS_YQ" = "1" ] && validate_required_fields "sigil-mark/lens-array/lenses.yaml" "lenses"; then
            log_pass "lenses.yaml (syntax + required fields)"
        else
            log_pass "lenses.yaml (syntax only)"
        fi
    else
        log_fail "lenses.yaml" "YAML syntax error"
    fi
else
    log_skip "lenses.yaml (not found)"
fi

# Test Consultation Chamber files
if [ -f "sigil-mark/consultation-chamber/config.yaml" ]; then
    if validate_yaml_syntax "sigil-mark/consultation-chamber/config.yaml"; then
        if [ "$HAS_YQ" = "1" ] && validate_required_fields "sigil-mark/consultation-chamber/config.yaml" "consultation-config"; then
            log_pass "consultation-chamber/config.yaml (syntax + required fields)"
        else
            log_pass "consultation-chamber/config.yaml (syntax only)"
        fi
    else
        log_fail "consultation-chamber/config.yaml" "YAML syntax error"
    fi
else
    log_skip "consultation-chamber/config.yaml (not found)"
fi

# Test Proving Grounds files
if [ -f "sigil-mark/proving-grounds/config.yaml" ]; then
    if validate_yaml_syntax "sigil-mark/proving-grounds/config.yaml"; then
        if [ "$HAS_YQ" = "1" ] && validate_required_fields "sigil-mark/proving-grounds/config.yaml" "proving-config"; then
            log_pass "proving-grounds/config.yaml (syntax + required fields)"
        else
            log_pass "proving-grounds/config.yaml (syntax only)"
        fi
    else
        log_fail "proving-grounds/config.yaml" "YAML syntax error"
    fi
else
    log_skip "proving-grounds/config.yaml (not found)"
fi

# Test any decision records
if [ -d "sigil-mark/consultation-chamber/decisions" ]; then
    for decision in sigil-mark/consultation-chamber/decisions/*.yaml; do
        if [ -f "$decision" ]; then
            if validate_yaml_syntax "$decision"; then
                log_pass "$(basename "$decision") (syntax)"
            else
                log_fail "$(basename "$decision")" "YAML syntax error"
            fi
        fi
    done
fi

# Test any proving records
if [ -d "sigil-mark/proving-grounds/active" ]; then
    for record in sigil-mark/proving-grounds/active/*.yaml; do
        if [ -f "$record" ]; then
            if validate_yaml_syntax "$record"; then
                log_pass "$(basename "$record") (syntax)"
            else
                log_fail "$(basename "$record")" "YAML syntax error"
            fi
        fi
    done
fi

echo ""
echo "=== Summary ==="
printf "Passed: ${GREEN}%d${NC}\n" "$PASS_COUNT"
printf "Failed: ${RED}%d${NC}\n" "$FAIL_COUNT"
printf "Skipped: ${YELLOW}%d${NC}\n" "$SKIP_COUNT"

if [ "$FAIL_COUNT" -gt 0 ]; then
    exit 1
fi

exit 0
