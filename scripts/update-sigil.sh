#!/usr/bin/env bash
# =============================================================================
# Update Sigil - Version Check and Upgrade
# =============================================================================
# Checks for updates and upgrades Sigil components.
#
# Usage:
#   update-sigil.sh [options]
#
# Options:
#   --check          Check for updates only (no installation)
#   --force          Reinstall even if already up-to-date
#   --construct      Update construct pack only
#   --cli            Update Rust CLIs only
#   --npm            Update npm packages only
#
# Exit Codes:
#   0 = success (or up-to-date)
#   1 = update available (with --check)
#   2 = update failed
#   3 = version check failed
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source platform utilities if available
if [[ -f "$SCRIPT_DIR/lib/platform.sh" ]]; then
    source "$SCRIPT_DIR/lib/platform.sh"
fi

# Configuration
CHECK_ONLY=false
FORCE=false
UPDATE_CONSTRUCT=true
UPDATE_CLI=true
UPDATE_NPM=true
SIGIL_REPO="0xHoneyJar/sigil"
VERSION_URL="https://raw.githubusercontent.com/$SIGIL_REPO/main/VERSION.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --check) CHECK_ONLY=true; shift ;;
        --force) FORCE=true; shift ;;
        --construct)
            UPDATE_CONSTRUCT=true
            UPDATE_CLI=false
            UPDATE_NPM=false
            shift
            ;;
        --cli)
            UPDATE_CONSTRUCT=false
            UPDATE_CLI=true
            UPDATE_NPM=false
            shift
            ;;
        --npm)
            UPDATE_CONSTRUCT=false
            UPDATE_CLI=false
            UPDATE_NPM=true
            shift
            ;;
        *) shift ;;
    esac
done

# Logging
info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
header() { echo -e "\n${BLUE}$1${NC}"; }

# Version comparison (v1 >= v2)
version_ge() {
    local v1="$1"
    local v2="$2"
    local IFS='.'
    read -ra V1 <<< "$v1"
    read -ra V2 <<< "$v2"
    for i in 0 1 2; do
        local n1="${V1[$i]:-0}"
        local n2="${V2[$i]:-0}"
        if (( n1 > n2 )); then return 0
        elif (( n1 < n2 )); then return 1
        fi
    done
    return 0
}

# Version comparison (v1 > v2)
version_gt() {
    local v1="$1"
    local v2="$2"
    if version_ge "$v1" "$v2" && [[ "$v1" != "$v2" ]]; then
        return 0
    fi
    return 1
}

# Fetch remote VERSION.json
fetch_remote_version() {
    local content
    content=$(curl -fsSL "$VERSION_URL" 2>/dev/null) || {
        error "Failed to fetch remote VERSION.json"
        return 3
    }
    echo "$content"
}

# Get local installed versions
get_local_versions() {
    local local_versions="{}"

    # Construct pack version
    if [[ -f ".claude/constructs/packs/sigil/VERSION" ]]; then
        local construct_ver
        construct_ver=$(cat ".claude/constructs/packs/sigil/VERSION")
        local_versions=$(echo "$local_versions" | jq --arg v "$construct_ver" '. + {construct: $v}')
    elif [[ -f "VERSION.json" ]]; then
        local construct_ver
        construct_ver=$(jq -r '.constructs_pack // "0.0.0"' VERSION.json 2>/dev/null || echo "0.0.0")
        local_versions=$(echo "$local_versions" | jq --arg v "$construct_ver" '. + {construct: $v}')
    else
        local_versions=$(echo "$local_versions" | jq '. + {construct: "0.0.0"}')
    fi

    # CLI versions
    if command -v anchor &>/dev/null; then
        local anchor_ver
        anchor_ver=$(anchor --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "0.0.0")
        local_versions=$(echo "$local_versions" | jq --arg v "$anchor_ver" '. + {anchor: $v}')
    elif [[ -f "$HOME/.sigil/bin/anchor" ]]; then
        local anchor_ver
        anchor_ver=$("$HOME/.sigil/bin/anchor" --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "0.0.0")
        local_versions=$(echo "$local_versions" | jq --arg v "$anchor_ver" '. + {anchor: $v}')
    else
        local_versions=$(echo "$local_versions" | jq '. + {anchor: "0.0.0"}')
    fi

    if command -v lens &>/dev/null; then
        local lens_ver
        lens_ver=$(lens --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "0.0.0")
        local_versions=$(echo "$local_versions" | jq --arg v "$lens_ver" '. + {lens: $v}')
    elif [[ -f "$HOME/.sigil/bin/lens" ]]; then
        local lens_ver
        lens_ver=$("$HOME/.sigil/bin/lens" --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "0.0.0")
        local_versions=$(echo "$local_versions" | jq --arg v "$lens_ver" '. + {lens: $v}')
    else
        local_versions=$(echo "$local_versions" | jq '. + {lens: "0.0.0"}')
    fi

    echo "$local_versions"
}

# Check for updates
check_updates() {
    header "Checking for Sigil updates..."

    local remote
    remote=$(fetch_remote_version) || return 3

    local local_versions
    local_versions=$(get_local_versions)

    local remote_sigil remote_cli
    remote_sigil=$(echo "$remote" | jq -r '.sigil // "0.0.0"')
    remote_cli=$(echo "$remote" | jq -r '.rust_cli // "0.0.0"')

    local local_construct local_anchor local_lens
    local_construct=$(echo "$local_versions" | jq -r '.construct // "0.0.0"')
    local_anchor=$(echo "$local_versions" | jq -r '.anchor // "0.0.0"')
    local_lens=$(echo "$local_versions" | jq -r '.lens // "0.0.0"')

    local updates_available=false

    echo ""
    echo "Component          Local      Remote     Status"
    echo "─────────────────────────────────────────────────"

    # Construct pack
    if version_gt "$remote_sigil" "$local_construct"; then
        echo -e "Construct Pack     ${YELLOW}$local_construct${NC}      $remote_sigil      ${YELLOW}Update available${NC}"
        updates_available=true
    else
        echo -e "Construct Pack     $local_construct      $remote_sigil      ${GREEN}Up to date${NC}"
    fi

    # Anchor CLI
    if version_gt "$remote_cli" "$local_anchor"; then
        echo -e "anchor CLI         ${YELLOW}$local_anchor${NC}      $remote_cli      ${YELLOW}Update available${NC}"
        updates_available=true
    else
        echo -e "anchor CLI         $local_anchor      $remote_cli      ${GREEN}Up to date${NC}"
    fi

    # Lens CLI
    if version_gt "$remote_cli" "$local_lens"; then
        echo -e "lens CLI           ${YELLOW}$local_lens${NC}      $remote_cli      ${YELLOW}Update available${NC}"
        updates_available=true
    else
        echo -e "lens CLI           $local_lens      $remote_cli      ${GREEN}Up to date${NC}"
    fi

    echo ""

    if $updates_available; then
        if $CHECK_ONLY; then
            info "Updates available. Run 'update-sigil.sh' to install."
            return 1
        fi
        return 0
    else
        if $FORCE; then
            info "All components up to date. Use --force to reinstall."
            return 0
        else
            info "All components are up to date!"
            return 0
        fi
    fi
}

# Update construct pack
update_construct() {
    if ! $UPDATE_CONSTRUCT; then
        return 0
    fi

    header "Updating Construct Pack..."

    if [[ -f "$SCRIPT_DIR/mount-sigil.sh" ]]; then
        # Use mount script for construct installation
        "$SCRIPT_DIR/mount-sigil.sh" --skip-cli --skip-npm --force
    else
        # Fallback: git-based installation
        local temp_dir
        temp_dir=$(mktemp -d)
        trap "rm -rf $temp_dir" RETURN

        info "Cloning Sigil repository..."
        git clone --depth 1 "https://github.com/$SIGIL_REPO" "$temp_dir/sigil" 2>/dev/null || {
            error "Failed to clone repository"
            return 2
        }

        # Copy rules
        info "Updating rules..."
        mkdir -p .claude/rules
        cp -r "$temp_dir/sigil/.claude/rules/"*.md .claude/rules/ 2>/dev/null || true

        # Copy commands
        info "Updating commands..."
        mkdir -p .claude/commands
        cp -r "$temp_dir/sigil/.claude/commands/"*.md .claude/commands/ 2>/dev/null || true

        # Copy skills
        if [[ -d "$temp_dir/sigil/.claude/skills" ]]; then
            info "Updating skills..."
            mkdir -p .claude/skills
            cp -r "$temp_dir/sigil/.claude/skills/"* .claude/skills/ 2>/dev/null || true
        fi

        # Update version marker
        mkdir -p .claude/constructs/packs/sigil
        local remote
        remote=$(fetch_remote_version) || return 3
        local sigil_ver
        sigil_ver=$(echo "$remote" | jq -r '.sigil // "0.0.0"')
        echo "$sigil_ver" > .claude/constructs/packs/sigil/VERSION

        info "Construct pack updated to v$sigil_ver"
    fi
}

# Update Rust CLIs
update_cli() {
    if ! $UPDATE_CLI; then
        return 0
    fi

    header "Updating Rust CLIs..."

    if [[ -f "$SCRIPT_DIR/install-cli.sh" ]]; then
        "$SCRIPT_DIR/install-cli.sh"
    else
        info "Downloading CLI installer..."
        curl -fsSL "https://raw.githubusercontent.com/$SIGIL_REPO/main/scripts/install-cli.sh" | bash
    fi
}

# Update npm packages
update_npm() {
    if ! $UPDATE_NPM; then
        return 0
    fi

    # Only update if package.json exists and has React
    if [[ ! -f "package.json" ]]; then
        return 0
    fi

    local has_react=""
    if command -v jq &>/dev/null; then
        has_react=$(jq -r '.dependencies.react // .devDependencies.react // empty' package.json 2>/dev/null)
    else
        has_react=$(grep -o '"react"' package.json 2>/dev/null || true)
    fi

    if [[ -z "$has_react" ]]; then
        return 0
    fi

    header "Updating npm packages..."

    # Detect package manager
    local pkg_manager="npm"
    if [[ -f "pnpm-lock.yaml" ]] || command -v pnpm &>/dev/null; then
        pkg_manager="pnpm"
    elif [[ -f "yarn.lock" ]]; then
        pkg_manager="yarn"
    fi

    # Check which packages are installed
    local has_hud has_toolbar
    has_hud=$(jq -r '.dependencies["@thehoneyjar/sigil-hud"] // .devDependencies["@thehoneyjar/sigil-hud"] // empty' package.json 2>/dev/null)
    has_toolbar=$(jq -r '.dependencies["@thehoneyjar/sigil-dev-toolbar"] // .devDependencies["@thehoneyjar/sigil-dev-toolbar"] // empty' package.json 2>/dev/null)

    if [[ -n "$has_hud" ]]; then
        info "Updating @thehoneyjar/sigil-hud..."
        $pkg_manager update @thehoneyjar/sigil-hud 2>/dev/null || warn "Failed to update sigil-hud"
    fi

    if [[ -n "$has_toolbar" ]]; then
        info "Updating @thehoneyjar/sigil-dev-toolbar..."
        $pkg_manager update @thehoneyjar/sigil-dev-toolbar 2>/dev/null || warn "Failed to update sigil-dev-toolbar"
    fi
}

# Run verification
run_verification() {
    header "Verifying installation..."

    if [[ -f "$SCRIPT_DIR/verify-sigil.sh" ]]; then
        "$SCRIPT_DIR/verify-sigil.sh" --quiet
    else
        # Basic verification
        local rule_count
        rule_count=$(find .claude/rules -name "*.md" 2>/dev/null | wc -l | tr -d ' ')

        if [[ "$rule_count" -ge 20 ]]; then
            info "Rules: $rule_count files ✓"
        else
            warn "Rules: only $rule_count files found"
        fi

        if [[ -f ".claude/commands/craft.md" ]]; then
            info "/craft command available ✓"
        else
            warn "/craft command missing"
        fi

        if command -v anchor &>/dev/null; then
            info "anchor CLI available ✓"
        elif [[ -f "$HOME/.sigil/bin/anchor" ]]; then
            warn "anchor CLI installed but not in PATH"
        fi

        if command -v lens &>/dev/null; then
            info "lens CLI available ✓"
        elif [[ -f "$HOME/.sigil/bin/lens" ]]; then
            warn "lens CLI installed but not in PATH"
        fi
    fi
}

# Main
main() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                      SIGIL UPDATE                              ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"

    # Check for jq dependency
    if ! command -v jq &>/dev/null; then
        error "jq is required for version checking. Install with: brew install jq"
        exit 3
    fi

    # Check for updates
    check_updates
    local check_result=$?

    if $CHECK_ONLY; then
        exit $check_result
    fi

    if [[ $check_result -eq 3 ]]; then
        exit 3
    fi

    # If no updates and not forcing, exit
    if [[ $check_result -eq 0 ]] && ! $FORCE; then
        exit 0
    fi

    # Perform updates
    update_construct || exit 2
    update_cli || exit 2
    update_npm || exit 2

    # Verify
    run_verification

    echo ""
    info "Sigil update complete!"
}

main "$@"
