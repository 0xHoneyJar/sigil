#!/usr/bin/env bash
# =============================================================================
# Mount Sigil - Unified Installation
# =============================================================================
# Installs the complete Sigil ecosystem:
#   1. Pre-flight verification
#   2. Construct pack (rules, commands, skills)
#   3. Rust CLIs (anchor, lens)
#   4. Post-install verification
#
# Usage:
#   mount-sigil.sh [options]
#
# Options:
#   --skip-cli       Skip Rust CLI installation
#   --skip-npm       Skip npm package suggestions
#   --force          Force reinstall even if already installed
#   --version VER    Install specific version (default: latest)
#
# Exit Codes:
#   0 = success
#   1 = pre-flight failed
#   2 = construct install failed
#   3 = CLI install failed
#   4 = verification failed
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source platform utilities if available
if [[ -f "$SCRIPT_DIR/lib/platform.sh" ]]; then
    source "$SCRIPT_DIR/lib/platform.sh"
fi

# Configuration
SKIP_CLI=false
SKIP_NPM=false
FORCE=false
VERSION="latest"
SIGIL_REPO="https://github.com/0xHoneyJar/sigil"

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
        --skip-cli) SKIP_CLI=true; shift ;;
        --skip-npm) SKIP_NPM=true; shift ;;
        --force) FORCE=true; shift ;;
        --version) VERSION="$2"; shift 2 ;;
        *) shift ;;
    esac
done

# Logging
info() { echo -e "│  ${GREEN}✓${NC} $1"; }
warn() { echo -e "│  ${YELLOW}⚠${NC} $1"; }
fail() { echo -e "│  ${RED}✗${NC} $1"; }
header() {
    echo ""
    echo -e "┌─ ${CYAN}$1${NC} ───────────────────────────────────────────────────────┐"
    echo -e "│                                                                │"
}
footer() {
    echo -e "│                                                                │"
    echo -e "└────────────────────────────────────────────────────────────────┘"
    echo ""
}

# Phase 1: Pre-flight
run_preflight() {
    header "Phase 1: Pre-flight Verification"

    if [[ -f "$SCRIPT_DIR/preflight-sigil.sh" ]]; then
        local result
        if "$SCRIPT_DIR/preflight-sigil.sh" --quiet 2>/dev/null; then
            result=$?
        else
            result=$?
        fi

        if [[ $result -eq 0 ]]; then
            info "All required checks passed"
        elif [[ $result -eq 2 ]]; then
            info "Required checks passed (some optional items noted)"
        else
            fail "Pre-flight checks failed"
            footer
            echo ""
            echo "Run for details:"
            echo "  $SCRIPT_DIR/preflight-sigil.sh"
            echo ""
            exit 1
        fi
    else
        warn "Pre-flight script not found, checking basics..."

        # Basic checks
        if ! command -v node &>/dev/null; then
            fail "Node.js not found"
            exit 1
        fi

        if ! git rev-parse --git-dir &>/dev/null; then
            fail "Not a git repository"
            exit 1
        fi

        info "Basic checks passed"
    fi

    footer
}

# Phase 2: Install Construct Pack
install_construct() {
    header "Phase 2: Installing Sigil Construct"

    # Check for existing installation
    if [[ -d ".claude/rules" ]] && [[ -f ".claude/commands/craft.md" ]] && ! $FORCE; then
        local rule_count
        rule_count=$(find .claude/rules -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
        if [[ "$rule_count" -ge 20 ]]; then
            info "Sigil already installed ($rule_count rules)"
            warn "Use --force to reinstall"
            footer
            return 0
        fi
    fi

    # Try Loa Constructs first
    if command -v constructs &>/dev/null || [[ -f ".claude/scripts/constructs-install.sh" ]]; then
        info "Installing via Loa Constructs Registry..."

        local constructs_script="${SCRIPT_DIR}/constructs-install.sh"
        if [[ ! -f "$constructs_script" ]] && [[ -f ".claude/scripts/constructs-install.sh" ]]; then
            constructs_script=".claude/scripts/constructs-install.sh"
        fi

        if [[ -f "$constructs_script" ]] && "$constructs_script" pack sigil 2>/dev/null; then
            info "Construct pack installed successfully"
        else
            warn "Constructs install failed, using git fallback..."
            install_construct_git
        fi
    else
        info "Using git-based installation..."
        install_construct_git
    fi

    # Initialize grimoire
    mkdir -p grimoires/sigil/pub/{requests,responses}

    if [[ ! -f "grimoires/sigil/taste.md" ]]; then
        cat > grimoires/sigil/taste.md << 'EOF'
# Sigil Taste Log

Accumulated understanding from usage signals.

---

EOF
        info "Initialized grimoires/sigil/taste.md"
    fi

    footer
}

# Git-based construct installation
install_construct_git() {
    local temp_dir
    temp_dir=$(mktemp -d)
    trap "rm -rf $temp_dir" RETURN

    info "Cloning Sigil repository..."
    if ! git clone --depth 1 "$SIGIL_REPO" "$temp_dir/sigil" 2>/dev/null; then
        fail "Failed to clone Sigil repository"
        return 2
    fi

    # Copy rules
    info "Installing rules..."
    mkdir -p .claude/rules
    cp -r "$temp_dir/sigil/.claude/rules/"*.md .claude/rules/ 2>/dev/null || true

    # Copy commands
    info "Installing commands..."
    mkdir -p .claude/commands
    cp -r "$temp_dir/sigil/.claude/commands/"*.md .claude/commands/ 2>/dev/null || true

    # Copy skills if they exist
    if [[ -d "$temp_dir/sigil/.claude/skills" ]]; then
        info "Installing skills..."
        mkdir -p .claude/skills
        cp -r "$temp_dir/sigil/.claude/skills/"* .claude/skills/ 2>/dev/null || true
    fi

    # Resolve version before writing marker
    local resolved_version="$VERSION"
    if [[ "$resolved_version" == "latest" ]]; then
        # Try to get version from cloned repo's VERSION.json
        if [[ -f "$temp_dir/sigil/VERSION.json" ]]; then
            if command -v jq &>/dev/null; then
                resolved_version=$(jq -r '.sigil // .constructs_pack // "0.0.0"' "$temp_dir/sigil/VERSION.json" 2>/dev/null || echo "0.0.0")
            else
                # Fallback without jq - extract sigil version
                resolved_version=$(grep -o '"sigil"[[:space:]]*:[[:space:]]*"[^"]*"' "$temp_dir/sigil/VERSION.json" 2>/dev/null | sed 's/.*"\([^"]*\)"$/\1/' || echo "0.0.0")
            fi
        else
            # Fallback: fetch from remote
            resolved_version=$(curl -fsSL "https://raw.githubusercontent.com/0xHoneyJar/sigil/main/VERSION.json" 2>/dev/null | grep -o '"sigil"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"\([^"]*\)"$/\1/' || echo "0.0.0")
        fi
    fi

    # Create version marker with resolved semver
    mkdir -p .claude/constructs/packs/sigil
    echo "$resolved_version" > .claude/constructs/packs/sigil/VERSION

    local rule_count
    rule_count=$(find .claude/rules -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    info "Installed $rule_count rules (v$resolved_version)"
}

# Phase 3: Install Rust CLIs
install_cli() {
    if $SKIP_CLI; then
        header "Phase 3: Rust CLI Installation (skipped)"
        warn "Skipping CLI installation (--skip-cli)"
        footer
        return 0
    fi

    header "Phase 3: Installing Rust CLIs"

    # Check if already installed and up to date
    if command -v anchor &>/dev/null && command -v lens &>/dev/null && ! $FORCE; then
        local anchor_ver lens_ver
        anchor_ver=$(anchor --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "0.0.0")
        lens_ver=$(lens --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "0.0.0")

        info "anchor v$anchor_ver already installed"
        info "lens v$lens_ver already installed"
        warn "Use --force to reinstall"
        footer
        return 0
    fi

    # Run install script
    if [[ -f "$SCRIPT_DIR/install-cli.sh" ]]; then
        info "Running CLI installer..."
        SIGIL_CLI_VERSION="$VERSION" SIGIL_SKIP_PATH=true "$SCRIPT_DIR/install-cli.sh"
    else
        info "Downloading CLI installer..."
        curl -fsSL https://raw.githubusercontent.com/0xHoneyJar/sigil/main/scripts/install-cli.sh \
            | SIGIL_CLI_VERSION="$VERSION" SIGIL_SKIP_PATH=true bash
    fi

    # PATH instructions
    local sigil_bin="$HOME/.sigil/bin"
    if [[ ":$PATH:" != *":$sigil_bin:"* ]]; then
        echo ""
        warn "Add to your shell profile:"
        echo -e "│    export PATH=\"\$HOME/.sigil/bin:\$PATH\""
    fi

    footer
}

# Phase 3.5: npm package suggestions
suggest_npm_packages() {
    if $SKIP_NPM; then
        return 0
    fi

    # Check if this is a JavaScript/TypeScript project
    if [[ ! -f "package.json" ]]; then
        return 0
    fi

    # Check for React
    local has_react=""
    if command -v jq &>/dev/null; then
        has_react=$(jq -r '.dependencies.react // .devDependencies.react // empty' package.json 2>/dev/null)
    else
        has_react=$(grep -o '"react"' package.json 2>/dev/null || true)
    fi

    if [[ -z "$has_react" ]]; then
        return 0
    fi

    header "React Project Detected"

    echo -e "│  Would you like to install Sigil npm packages?                │"
    echo -e "│                                                                │"
    echo -e "│  Packages:                                                     │"
    echo -e "│  • @thehoneyjar/sigil-hud (diagnostic components)             │"
    echo -e "│  • @thehoneyjar/sigil-dev-toolbar (full toolbar)              │"
    echo -e "│                                                                │"
    echo -e "│  [${GREEN}y${NC}] Install both  [${BLUE}h${NC}] HUD only  [${BLUE}t${NC}] Toolbar only  [${YELLOW}n${NC}] Skip   │"
    echo -e "│                                                                │"

    read -r -p "  Choice [y/h/t/n]: " choice

    # Detect package manager
    local pkg_manager="npm"
    if [[ -f "pnpm-lock.yaml" ]] || command -v pnpm &>/dev/null; then
        pkg_manager="pnpm"
    elif [[ -f "yarn.lock" ]]; then
        pkg_manager="yarn"
    fi

    case "$choice" in
        y|Y)
            info "Installing @thehoneyjar/sigil-hud and @thehoneyjar/sigil-dev-toolbar..."
            $pkg_manager add @thehoneyjar/sigil-hud @thehoneyjar/sigil-dev-toolbar 2>/dev/null || {
                warn "npm install failed - you can install manually later"
            }
            ;;
        h|H)
            info "Installing @thehoneyjar/sigil-hud..."
            $pkg_manager add @thehoneyjar/sigil-hud 2>/dev/null || {
                warn "npm install failed - you can install manually later"
            }
            ;;
        t|T)
            info "Installing @thehoneyjar/sigil-dev-toolbar..."
            $pkg_manager add @thehoneyjar/sigil-dev-toolbar 2>/dev/null || {
                warn "npm install failed - you can install manually later"
            }
            ;;
        *)
            info "Skipping npm packages"
            ;;
    esac

    footer
}

# Phase 4: Verification
run_verification() {
    header "Phase 4: Verification"

    local all_passed=true

    # Check rules
    local rule_count
    rule_count=$(find .claude/rules -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    if [[ "$rule_count" -ge 20 ]]; then
        info "Rules installed ($rule_count files)"
    else
        fail "Rules missing (found $rule_count, expected >= 20)"
        all_passed=false
    fi

    # Check /craft command
    if [[ -f ".claude/commands/craft.md" ]]; then
        info "/craft command available"
    else
        fail "/craft command missing"
        all_passed=false
    fi

    # Check grimoire
    if [[ -f "grimoires/sigil/taste.md" ]]; then
        info "Grimoire initialized"
    else
        fail "Grimoire missing"
        all_passed=false
    fi

    # Check CLIs (if not skipped)
    if ! $SKIP_CLI; then
        if command -v anchor &>/dev/null; then
            local anchor_ver
            anchor_ver=$(anchor --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "?")
            info "anchor CLI v$anchor_ver"
        elif [[ -f "$HOME/.sigil/bin/anchor" ]]; then
            local anchor_ver
            anchor_ver=$("$HOME/.sigil/bin/anchor" --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "?")
            warn "anchor CLI v$anchor_ver (not in PATH)"
        else
            warn "anchor CLI not installed"
        fi

        if command -v lens &>/dev/null; then
            local lens_ver
            lens_ver=$(lens --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "?")
            info "lens CLI v$lens_ver"
        elif [[ -f "$HOME/.sigil/bin/lens" ]]; then
            local lens_ver
            lens_ver=$("$HOME/.sigil/bin/lens" --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "?")
            warn "lens CLI v$lens_ver (not in PATH)"
        else
            warn "lens CLI not installed"
        fi
    fi

    echo -e "│                                                                │"

    if $all_passed; then
        echo -e "│  ${GREEN}Sigil ready. Run /craft to start.${NC}                              │"
    else
        echo -e "│  ${RED}Some checks failed. Review errors above.${NC}                       │"
    fi

    footer

    if ! $all_passed; then
        exit 4
    fi
}

# Main
main() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                    SIGIL INSTALLATION                          ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"

    run_preflight
    install_construct
    install_cli
    suggest_npm_packages
    run_verification
}

main "$@"
