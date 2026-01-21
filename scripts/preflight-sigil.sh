#!/usr/bin/env bash
# =============================================================================
# Sigil Pre-flight Verification
# =============================================================================
# Verifies all prerequisites before Sigil installation.
#
# Usage:
#   ./preflight-sigil.sh [--json] [--quiet]
#
# Exit Codes:
#   0 = all checks passed
#   1 = required check failed
#   2 = optional check failed (warning only)
# =============================================================================

set -euo pipefail

# Configuration
MIN_NODE_VERSION="20.0.0"
MIN_LOA_VERSION="0.7.0"
REQUIRED_TOOLS=("git" "curl")

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Flags
JSON_OUTPUT=false
QUIET=false

# Results stored as simple variables (bash 3.x compatible)
RESULT_node=""
RESULT_node_version=""
RESULT_package_manager=""
RESULT_package_manager_type=""
RESULT_git_repo=""
RESULT_loa=""
RESULT_loa_version=""
RESULT_platform=""
RESULT_required_tools=""
RESULT_rust=""
RESULT_existing_sigil=""
RESULT_existing_sigil_version=""
RESULT_existing_cli_version=""

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
    log_check "${GREEN}✓${NC} $key: $msg"
}

log_fail() {
    local key="$1"
    local msg="$2"
    eval "RESULT_${key}=fail"
    log_check "${RED}✗${NC} $key: $msg"
}

log_warn() {
    local key="$1"
    local msg="$2"
    eval "RESULT_${key}=warn"
    log_check "${YELLOW}⚠${NC} $key: $msg"
}

# Version comparison (works with bash 3.x)
version_ge() {
    local v1="$1"
    local v2="$2"

    # Split versions into arrays
    local IFS='.'
    read -ra V1 <<< "$v1"
    read -ra V2 <<< "$v2"

    # Compare each segment
    for i in 0 1 2; do
        local n1="${V1[$i]:-0}"
        local n2="${V2[$i]:-0}"

        if (( n1 > n2 )); then
            return 0
        elif (( n1 < n2 )); then
            return 1
        fi
    done
    return 0
}

# Check: Node.js
check_node() {
    if command -v node &>/dev/null; then
        local version
        version=$(node --version | sed 's/v//')
        RESULT_node_version="$version"
        if version_ge "$version" "$MIN_NODE_VERSION"; then
            log_pass "node" "$version"
            return 0
        else
            log_fail "node" "$version (need >= $MIN_NODE_VERSION)"
            return 1
        fi
    else
        log_fail "node" "not installed"
        return 1
    fi
}

# Check: Package manager
check_package_manager() {
    if command -v pnpm &>/dev/null; then
        local version
        version=$(pnpm --version 2>/dev/null || echo "unknown")
        log_pass "package_manager" "pnpm $version"
        RESULT_package_manager_type="pnpm"
        return 0
    elif command -v npm &>/dev/null; then
        local version
        version=$(npm --version 2>/dev/null || echo "unknown")
        log_pass "package_manager" "npm $version"
        RESULT_package_manager_type="npm"
        return 0
    elif command -v yarn &>/dev/null; then
        local version
        version=$(yarn --version 2>/dev/null || echo "unknown")
        log_pass "package_manager" "yarn $version"
        RESULT_package_manager_type="yarn"
        return 0
    else
        log_fail "package_manager" "none found (need pnpm, npm, or yarn)"
        return 1
    fi
}

# Check: Git repository
check_git_repo() {
    if git rev-parse --git-dir &>/dev/null; then
        local repo_name
        repo_name=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "unknown")
        log_pass "git_repo" "$repo_name"
        return 0
    else
        log_fail "git_repo" "not a git repository"
        return 1
    fi
}

# Check: Loa framework
check_loa() {
    if [[ -f ".loa-version.json" ]]; then
        local version
        if command -v jq &>/dev/null; then
            version=$(jq -r '.version // "unknown"' .loa-version.json 2>/dev/null || echo "unknown")
        else
            # Fallback without jq
            version=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' .loa-version.json 2>/dev/null | sed 's/.*"\([^"]*\)"$/\1/' || echo "unknown")
        fi
        RESULT_loa_version="$version"
        if [[ "$version" != "unknown" ]] && version_ge "$version" "$MIN_LOA_VERSION"; then
            log_pass "loa" "$version"
            return 0
        else
            log_fail "loa" "$version (need >= $MIN_LOA_VERSION)"
            return 1
        fi
    else
        log_fail "loa" "not installed (run /mount first)"
        return 1
    fi
}

# Check: Platform
check_platform() {
    local os arch platform

    os=$(uname -s)
    arch=$(uname -m)

    case "$os" in
        Darwin)
            case "$arch" in
                arm64) platform="darwin-arm64" ;;
                x86_64) platform="darwin-x64" ;;
                *) platform="unsupported" ;;
            esac
            ;;
        Linux)
            case "$arch" in
                x86_64|amd64) platform="linux-x64" ;;
                aarch64|arm64) platform="linux-arm64" ;;
                *) platform="unsupported" ;;
            esac
            ;;
        MINGW*|MSYS*|CYGWIN*)
            platform="windows-unsupported"
            ;;
        *)
            platform="unsupported"
            ;;
    esac

    RESULT_platform="$platform"

    if [[ "$platform" == *"unsupported"* ]]; then
        log_fail "platform" "$os/$arch (not supported)"
        return 1
    else
        log_pass "platform" "$platform"
        return 0
    fi
}

# Check: Rust toolchain (optional)
check_rust() {
    if command -v cargo &>/dev/null; then
        local version
        version=$(cargo --version 2>/dev/null | cut -d' ' -f2 || echo "unknown")
        log_pass "rust" "$version (can build from source)"
        return 0
    else
        log_warn "rust" "not installed (will use pre-built binaries)"
        return 2
    fi
}

# Check: Existing Sigil installation
check_existing_sigil() {
    local sigil_version=""
    local cli_version=""

    # Check construct installation
    if [[ -f ".claude/constructs/packs/sigil/VERSION" ]]; then
        sigil_version=$(cat .claude/constructs/packs/sigil/VERSION 2>/dev/null || echo "")
    fi

    # Check CLI installation
    if command -v anchor &>/dev/null; then
        cli_version=$(anchor --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "")
    fi

    RESULT_existing_sigil_version="$sigil_version"
    RESULT_existing_cli_version="$cli_version"

    if [[ -n "$sigil_version" ]] || [[ -n "$cli_version" ]]; then
        log_warn "existing_sigil" "construct=${sigil_version:-none} cli=${cli_version:-none}"
        return 2
    else
        log_pass "existing_sigil" "fresh install"
        return 0
    fi
}

# Check: Required tools
check_required_tools() {
    local missing=()

    for tool in "${REQUIRED_TOOLS[@]}"; do
        if ! command -v "$tool" &>/dev/null; then
            missing+=("$tool")
        fi
    done

    if [[ ${#missing[@]} -eq 0 ]]; then
        log_pass "required_tools" "git, curl"
        return 0
    else
        log_fail "required_tools" "missing: ${missing[*]}"
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
    echo "    \"node\": \"$RESULT_node\","
    echo "    \"node_version\": \"$RESULT_node_version\","
    echo "    \"package_manager\": \"$RESULT_package_manager\","
    echo "    \"package_manager_type\": \"$RESULT_package_manager_type\","
    echo "    \"git_repo\": \"$RESULT_git_repo\","
    echo "    \"loa\": \"$RESULT_loa\","
    echo "    \"loa_version\": \"$RESULT_loa_version\","
    echo "    \"platform\": \"$RESULT_platform\","
    echo "    \"required_tools\": \"$RESULT_required_tools\","
    echo "    \"rust\": \"$RESULT_rust\","
    echo "    \"existing_sigil\": \"$RESULT_existing_sigil\","
    echo "    \"existing_sigil_version\": \"$RESULT_existing_sigil_version\","
    echo "    \"existing_cli_version\": \"$RESULT_existing_cli_version\""
    echo "  }"
    echo "}"
}

# Main
main() {
    local required_failed=false
    local optional_warned=false

    if ! $JSON_OUTPUT && ! $QUIET; then
        echo ""
        echo -e "┌─ ${BLUE}Sigil Pre-flight${NC} ─────────────────────────────────────────────┐"
        echo -e "│                                                                │"
        echo -e "│  ${BLUE}Prerequisites:${NC}                                                │"
    fi

    # Required checks
    check_node || required_failed=true
    check_package_manager || required_failed=true
    check_git_repo || required_failed=true
    check_loa || required_failed=true
    check_platform || required_failed=true
    check_required_tools || required_failed=true

    if ! $JSON_OUTPUT && ! $QUIET; then
        echo -e "│                                                                │"
        echo -e "│  ${BLUE}Optional:${NC}                                                     │"
    fi

    # Optional checks - use || true to prevent set -e from aborting on exit code 2
    local rust_result=0
    check_rust || rust_result=$?
    if [[ $rust_result -eq 2 ]]; then
        optional_warned=true
    elif [[ $rust_result -eq 1 ]]; then
        # Unexpected failure in optional check, treat as warning
        optional_warned=true
    fi

    local existing_result=0
    check_existing_sigil || existing_result=$?
    if [[ $existing_result -eq 2 ]]; then
        optional_warned=true
    elif [[ $existing_result -eq 1 ]]; then
        optional_warned=true
    fi

    if ! $JSON_OUTPUT && ! $QUIET; then
        echo -e "│                                                                │"
        if $required_failed; then
            echo -e "│  ${RED}Required checks failed. Cannot proceed.${NC}                       │"
        elif $optional_warned; then
            echo -e "│  ${GREEN}Required checks passed.${NC} Some optional items noted.            │"
        else
            echo -e "│  ${GREEN}All checks passed. Ready to install Sigil.${NC}                    │"
        fi
        echo -e "│                                                                │"
        echo -e "└────────────────────────────────────────────────────────────────┘"
        echo ""
    fi

    # JSON output
    if $JSON_OUTPUT; then
        if $required_failed; then
            output_json "false"
        else
            output_json "true"
        fi
    fi

    # Exit code
    if $required_failed; then
        exit 1
    elif $optional_warned; then
        exit 2
    else
        exit 0
    fi
}

main "$@"
