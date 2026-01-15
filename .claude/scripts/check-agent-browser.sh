#!/bin/bash
# check-agent-browser.sh
# Purpose: Check if agent-browser CLI is installed and functional
# Usage: ./check-agent-browser.sh [--quiet]
#
# Exit codes:
#   0 - agent-browser is installed and functional
#   1 - agent-browser is not installed (returns install instructions)
#   2 - agent-browser installed but browser not set up
#
# Output (when not installed):
#   NOT_INSTALLED|npm install -g agent-browser && agent-browser install
#
# Reference: https://github.com/vercel-labs/agent-browser

set -euo pipefail

QUIET=false
if [[ "${1:-}" == "--quiet" ]]; then
    QUIET=true
fi

# Find agent-browser binary
# Check PATH first, then common NVM locations
find_agent_browser() {
    # Check if in PATH
    if command -v agent-browser &> /dev/null; then
        command -v agent-browser
        return 0
    fi

    # Check NVM installations (common locations)
    local nvm_dirs=(
        "$HOME/.nvm/versions/node"
        "$HOME/.local/share/nvm"
        "/usr/local/nvm/versions/node"
    )

    for nvm_dir in "${nvm_dirs[@]}"; do
        if [[ -d "$nvm_dir" ]]; then
            # Find most recent node version with agent-browser (may be symlink)
            local found=$(find "$nvm_dir" -maxdepth 3 -name "agent-browser" \( -type f -o -type l \) 2>/dev/null | head -1)
            if [[ -n "$found" && -x "$found" ]]; then
                echo "$found"
                return 0
            fi
        fi
    done

    # Check common global npm locations
    local npm_dirs=(
        "/usr/local/bin/agent-browser"
        "$HOME/.npm-global/bin/agent-browser"
        "/opt/homebrew/bin/agent-browser"
    )

    for bin in "${npm_dirs[@]}"; do
        if [[ -x "$bin" ]]; then
            echo "$bin"
            return 0
        fi
    done

    return 1
}

AGENT_BROWSER_BIN=$(find_agent_browser) || AGENT_BROWSER_BIN=""

if [[ -n "$AGENT_BROWSER_BIN" ]]; then
    export LOA_AGENT_BROWSER_AVAILABLE=1
    export LOA_AGENT_BROWSER_BIN="$AGENT_BROWSER_BIN"

    # Verify it runs (agent-browser doesn't have --version, so just check help works)
    if "$AGENT_BROWSER_BIN" --help &> /dev/null; then
        if [[ "${QUIET}" == false ]]; then
            echo "INSTALLED|$AGENT_BROWSER_BIN"
        else
            echo "INSTALLED"
        fi
        exit 0
    else
        # CLI exists but something is wrong
        if [[ "${QUIET}" == false ]]; then
            echo "NEEDS_SETUP|agent-browser install"
        else
            echo "NEEDS_SETUP"
        fi
        exit 2
    fi
else
    export LOA_AGENT_BROWSER_AVAILABLE=0

    if [[ "${QUIET}" == true ]]; then
        echo "NOT_INSTALLED"
    else
        echo "NOT_INSTALLED|npm install -g agent-browser && agent-browser install"
    fi
    exit 1
fi
