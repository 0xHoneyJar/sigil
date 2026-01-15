#!/usr/bin/env bash
# .claude/scripts/agent-browser-api.sh
#
# Agent Browser API Functions - Bash function library for browser automation
# Wraps the agent-browser CLI from https://github.com/vercel-labs/agent-browser
#
# Usage:
#   source .claude/scripts/agent-browser-api.sh
#   ab_open "https://example.com"
#   ab_screenshot "/tmp/screenshot.png"
#   snapshot=$(ab_snapshot --filter interactive)
#
# Session Management:
#   All commands use --session sigil by default for state persistence.
#   Override with AB_SESSION environment variable.

set -euo pipefail

PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

# Default session name for Sigil operations
AB_SESSION="${AB_SESSION:-sigil}"

# Output directory for screenshots
AB_OUTPUT_DIR="${AB_OUTPUT_DIR:-${PROJECT_ROOT}/grimoires/sigil/observations}"

# Ensure output directory exists
mkdir -p "${AB_OUTPUT_DIR}" 2>/dev/null || true

# ============================================================================
# INTERNAL HELPERS
# ============================================================================

# Find agent-browser binary (handles NVM installations)
_ab_find_binary() {
    # Check if already cached
    if [[ -n "${LOA_AGENT_BROWSER_BIN:-}" && -x "${LOA_AGENT_BROWSER_BIN}" ]]; then
        echo "${LOA_AGENT_BROWSER_BIN}"
        return 0
    fi

    # Check if in PATH
    if command -v agent-browser &> /dev/null; then
        echo "agent-browser"
        return 0
    fi

    # Check NVM installations
    local nvm_dirs=(
        "$HOME/.nvm/versions/node"
        "$HOME/.local/share/nvm"
        "/usr/local/nvm/versions/node"
    )

    for nvm_dir in "${nvm_dirs[@]}"; do
        if [[ -d "$nvm_dir" ]]; then
            local found=$(find "$nvm_dir" -maxdepth 3 -name "agent-browser" \( -type f -o -type l \) 2>/dev/null | head -1)
            if [[ -n "$found" && -x "$found" ]]; then
                echo "$found"
                return 0
            fi
        fi
    done

    return 1
}

# Cache the binary path
AB_BIN=$(_ab_find_binary 2>/dev/null) || AB_BIN=""

_ab_check() {
    # Check if agent-browser is available
    if [[ -z "${AB_BIN}" ]]; then
        echo "Error: agent-browser not installed. Run: npm install -g agent-browser && agent-browser install" >&2
        return 1
    fi
}

_ab_exec() {
    # Execute agent-browser command with session
    # All args are passed through
    _ab_check || return 1
    "${AB_BIN}" "$@" --session "${AB_SESSION}"
}

_ab_exec_json() {
    # Execute agent-browser command with JSON output
    _ab_check || return 1
    "${AB_BIN}" "$@" --session "${AB_SESSION}" --json
}

# ============================================================================
# NAVIGATION FUNCTIONS
# ============================================================================

ab_open() {
    # Navigate to a URL
    #
    # Args:
    #   $1: url (required) - URL to navigate to
    #   $2: wait_for (optional) - selector to wait for after load
    #
    # Returns:
    #   0 on success, 1 on failure
    #
    # Example:
    #   ab_open "https://example.com"
    #   ab_open "https://example.com" "button.submit"

    local url="${1}"
    local wait_for="${2:-}"

    _ab_exec open "${url}"

    if [[ -n "${wait_for}" ]]; then
        _ab_exec wait "${wait_for}"
    fi
}

ab_back() {
    # Navigate back in browser history
    _ab_exec back
}

ab_forward() {
    # Navigate forward in browser history
    _ab_exec forward
}

ab_reload() {
    # Reload the current page
    _ab_exec reload
}

# ============================================================================
# CAPTURE FUNCTIONS
# ============================================================================

ab_screenshot() {
    # Capture screenshot of current page
    #
    # Args:
    #   $1: output_path (optional) - path to save screenshot
    #       Default: ${AB_OUTPUT_DIR}/screenshot-{timestamp}.png
    #
    # Returns:
    #   Path to saved screenshot on stdout
    #
    # Example:
    #   path=$(ab_screenshot)
    #   ab_screenshot "/tmp/my-screenshot.png"

    local output_path="${1:-}"

    if [[ -z "${output_path}" ]]; then
        local timestamp=$(date +%Y%m%d-%H%M%S)
        output_path="${AB_OUTPUT_DIR}/screenshot-${timestamp}.png"
    fi

    _ab_exec screenshot "${output_path}"
    echo "${output_path}"
}

ab_snapshot() {
    # Get accessibility tree snapshot of the page
    # Returns structured representation for AI analysis
    #
    # Args:
    #   --filter: "interactive" to show only interactive elements
    #   --depth N: limit tree depth (default: unlimited)
    #   --compact: compact output format
    #
    # Returns:
    #   Accessibility tree as text/JSON on stdout
    #
    # Example:
    #   snapshot=$(ab_snapshot)
    #   snapshot=$(ab_snapshot --filter interactive --compact)

    _ab_exec_json snapshot "$@"
}

ab_get_text() {
    # Get text content of an element
    #
    # Args:
    #   $1: selector (required) - CSS selector or semantic locator
    #
    # Returns:
    #   Element text on stdout
    #
    # Example:
    #   title=$(ab_get_text "h1")
    #   price=$(ab_get_text "[data-testid='price']")

    local selector="${1}"
    _ab_exec get text "${selector}"
}

ab_get_html() {
    # Get HTML content of an element
    #
    # Args:
    #   $1: selector (required) - CSS selector
    #
    # Returns:
    #   Element HTML on stdout

    local selector="${1}"
    _ab_exec get html "${selector}"
}

ab_get_value() {
    # Get value of a form element
    #
    # Args:
    #   $1: selector (required) - CSS selector for input/select
    #
    # Returns:
    #   Form element value on stdout

    local selector="${1}"
    _ab_exec get value "${selector}"
}

# ============================================================================
# INTERACTION FUNCTIONS
# ============================================================================

ab_click() {
    # Click an element
    #
    # Args:
    #   $1: selector (required) - CSS selector or semantic locator
    #
    # Example:
    #   ab_click "button.submit"
    #   ab_click "[data-testid='claim-button']"

    local selector="${1}"
    _ab_exec click "${selector}"
}

ab_fill() {
    # Fill a form input with text (clears existing value)
    #
    # Args:
    #   $1: selector (required) - CSS selector for input
    #   $2: value (required) - text to fill
    #
    # Example:
    #   ab_fill "input[name='email']" "user@example.com"

    local selector="${1}"
    local value="${2}"
    _ab_exec fill "${selector}" "${value}"
}

ab_type() {
    # Type text into focused element (appends to existing)
    #
    # Args:
    #   $1: text (required) - text to type
    #
    # Example:
    #   ab_type "Hello World"

    local text="${1}"
    _ab_exec type "${text}"
}

ab_hover() {
    # Hover over an element
    #
    # Args:
    #   $1: selector (required) - CSS selector

    local selector="${1}"
    _ab_exec hover "${selector}"
}

ab_scroll() {
    # Scroll page or element
    #
    # Args:
    #   $1: direction (required) - "up", "down", "left", "right"
    #   $2: amount (optional) - pixels to scroll (default: viewport height)
    #
    # Example:
    #   ab_scroll down
    #   ab_scroll down 500

    local direction="${1}"
    local amount="${2:-}"

    if [[ -n "${amount}" ]]; then
        _ab_exec scroll "${direction}" "${amount}"
    else
        _ab_exec scroll "${direction}"
    fi
}

# ============================================================================
# STATE CHECK FUNCTIONS
# ============================================================================

ab_is_visible() {
    # Check if element is visible
    #
    # Args:
    #   $1: selector (required)
    #
    # Returns:
    #   Exit 0 if visible, 1 if not visible

    local selector="${1}"
    _ab_exec is visible "${selector}"
}

ab_is_enabled() {
    # Check if element is enabled (not disabled)
    #
    # Args:
    #   $1: selector (required)
    #
    # Returns:
    #   Exit 0 if enabled, 1 if disabled

    local selector="${1}"
    _ab_exec is enabled "${selector}"
}

ab_is_checked() {
    # Check if checkbox/radio is checked
    #
    # Args:
    #   $1: selector (required)
    #
    # Returns:
    #   Exit 0 if checked, 1 if not checked

    local selector="${1}"
    _ab_exec is checked "${selector}"
}

# ============================================================================
# WAIT FUNCTIONS
# ============================================================================

ab_wait() {
    # Wait for element to appear
    #
    # Args:
    #   $1: selector (required) - CSS selector to wait for
    #   $2: timeout (optional) - max wait in ms (default: 30000)
    #
    # Example:
    #   ab_wait "button.loaded"
    #   ab_wait "[data-ready='true']" 5000

    local selector="${1}"
    local timeout="${2:-30000}"
    _ab_exec wait "${selector}" --timeout "${timeout}"
}

ab_wait_hidden() {
    # Wait for element to disappear
    #
    # Args:
    #   $1: selector (required)
    #   $2: timeout (optional) - max wait in ms

    local selector="${1}"
    local timeout="${2:-30000}"
    _ab_exec wait "${selector}" --state hidden --timeout "${timeout}"
}

# ============================================================================
# ADVANCED FUNCTIONS
# ============================================================================

ab_eval() {
    # Execute JavaScript in page context
    #
    # Args:
    #   $1: script (required) - JavaScript to execute
    #
    # Returns:
    #   Script result as JSON on stdout
    #
    # Example:
    #   result=$(ab_eval "document.title")
    #   data=$(ab_eval "JSON.stringify(window.appState)")

    local script="${1}"
    _ab_exec_json eval "${script}"
}

ab_find() {
    # Find elements using semantic/natural language query
    #
    # Args:
    #   $1: query (required) - natural language description
    #
    # Returns:
    #   Matching elements as JSON on stdout
    #
    # Example:
    #   results=$(ab_find "login button")
    #   results=$(ab_find "price display")

    local query="${1}"
    _ab_exec_json find "${query}"
}

ab_close() {
    # Close the browser session
    #
    # Terminates the session and releases resources

    _ab_exec close 2>/dev/null || true
}

# ============================================================================
# SIGIL-SPECIFIC HELPERS
# ============================================================================

ab_capture_for_audit() {
    # Capture screenshot and snapshot for Sigil physics audit
    #
    # Args:
    #   $1: component_name (required) - name for the capture
    #   $2: url (optional) - URL to navigate to first
    #
    # Returns:
    #   JSON with paths to screenshot and snapshot
    #
    # Example:
    #   result=$(ab_capture_for_audit "ClaimButton" "http://localhost:3000")

    local component_name="${1}"
    local url="${2:-}"

    local timestamp=$(date +%Y%m%d-%H%M%S)
    local screenshot_path="${AB_OUTPUT_DIR}/${component_name}-${timestamp}.png"
    local snapshot_path="${AB_OUTPUT_DIR}/${component_name}-${timestamp}.json"

    # Navigate if URL provided
    if [[ -n "${url}" ]]; then
        ab_open "${url}" || return 1
    fi

    # Capture screenshot
    ab_screenshot "${screenshot_path}" > /dev/null

    # Capture interactive snapshot
    ab_snapshot --filter interactive > "${snapshot_path}"

    # Return paths as JSON
    jq -n \
        --arg name "${component_name}" \
        --arg screenshot "${screenshot_path}" \
        --arg snapshot "${snapshot_path}" \
        --arg timestamp "${timestamp}" \
        '{
            component: $name,
            screenshot: $screenshot,
            snapshot: $snapshot,
            timestamp: $timestamp
        }'
}

ab_check_touch_targets() {
    # Check if interactive elements meet 44px touch target minimum
    #
    # Returns:
    #   JSON array of elements with violations
    #
    # Example:
    #   violations=$(ab_check_touch_targets)

    ab_eval "
        (function() {
            const violations = [];
            const interactive = document.querySelectorAll('button, a, input, select, [role=\"button\"]');
            interactive.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.width < 44 || rect.height < 44) {
                    violations.push({
                        selector: el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ')[0] : ''),
                        width: rect.width,
                        height: rect.height,
                        text: el.textContent?.slice(0, 50)
                    });
                }
            });
            return violations;
        })()
    "
}

ab_check_focus_rings() {
    # Check if interactive elements have visible focus styles
    #
    # Returns:
    #   JSON array of elements missing focus visibility
    #
    # Note: This focuses each element and checks computed styles

    ab_eval "
        (function() {
            const missing = [];
            const interactive = document.querySelectorAll('button, a, input, select, [role=\"button\"]');
            interactive.forEach(el => {
                el.focus();
                const styles = window.getComputedStyle(el);
                const outline = styles.outline;
                const boxShadow = styles.boxShadow;
                // Check if there's a visible focus indicator
                const hasOutline = outline && !outline.includes('none') && !outline.includes('0px');
                const hasShadow = boxShadow && boxShadow !== 'none';
                if (!hasOutline && !hasShadow) {
                    missing.push({
                        selector: el.tagName + (el.id ? '#' + el.id : ''),
                        text: el.textContent?.slice(0, 50)
                    });
                }
            });
            document.activeElement?.blur();
            return missing;
        })()
    "
}

# ============================================================================
# EXPORT FUNCTIONS
# ============================================================================

export -f ab_open
export -f ab_back
export -f ab_forward
export -f ab_reload
export -f ab_screenshot
export -f ab_snapshot
export -f ab_get_text
export -f ab_get_html
export -f ab_get_value
export -f ab_click
export -f ab_fill
export -f ab_type
export -f ab_hover
export -f ab_scroll
export -f ab_is_visible
export -f ab_is_enabled
export -f ab_is_checked
export -f ab_wait
export -f ab_wait_hidden
export -f ab_eval
export -f ab_find
export -f ab_close
export -f ab_capture_for_audit
export -f ab_check_touch_targets
export -f ab_check_focus_rings

# Log API initialization
if [[ -n "${LOA_AGENT_NAME:-}" ]]; then
    echo "Agent Browser API loaded for agent: ${LOA_AGENT_NAME}" >&2
fi
