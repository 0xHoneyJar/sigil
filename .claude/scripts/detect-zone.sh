#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# Sigil Zone Detection
# Determines the design zone for a given file path
# ═══════════════════════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ZONES_FILE="$PROJECT_ROOT/sigil-mark/soul/zones.yaml"

# ─────────────────────────────────────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────────────────────────────────────

log_info() {
    echo "→ $1" >&2
}

log_error() {
    echo "✗ $1" >&2
}

# ─────────────────────────────────────────────────────────────────────────────
# Usage
# ─────────────────────────────────────────────────────────────────────────────

usage() {
    cat << EOF
Usage: detect-zone.sh <file-path> [options]

Detects the design zone for a given file path.

Arguments:
  file-path     The file path to detect zone for (relative or absolute)

Options:
  --json        Output as JSON
  --verbose     Show matching details
  --help        Show this help message

Examples:
  detect-zone.sh src/features/checkout/CheckoutButton.tsx
  detect-zone.sh src/features/dashboard/Stats.tsx --json
  detect-zone.sh components/claim/ClaimModal.tsx --verbose

Zones:
  critical      High-stakes transactions (checkout, claim, trade)
  transactional Data entry, admin, settings
  exploratory   Discovery, browsing, search
  marketing     Landing pages, promotional content
  celebration   Success states, achievements, rewards
  default       Fallback for unmatched paths
EOF
}

# ─────────────────────────────────────────────────────────────────────────────
# Check dependencies
# ─────────────────────────────────────────────────────────────────────────────

check_dependencies() {
    if ! command -v yq &> /dev/null; then
        # Fall back to grep-based detection
        return 1
    fi
    return 0
}

# ─────────────────────────────────────────────────────────────────────────────
# Glob pattern matching
# ─────────────────────────────────────────────────────────────────────────────

# Convert glob pattern to regex
glob_to_regex() {
    local pattern="$1"
    # Escape special regex chars
    pattern=$(echo "$pattern" | sed 's/\./\\./g')
    # Convert ** to match any path
    pattern=$(echo "$pattern" | sed 's/\*\*/\.\*/g')
    # Convert * to match any segment
    pattern=$(echo "$pattern" | sed 's/\*/[^\/]*/g')
    echo "^${pattern}$"
}

# Check if path matches pattern
matches_pattern() {
    local path="$1"
    local pattern="$2"
    local regex=$(glob_to_regex "$pattern")
    echo "$path" | grep -qE "$regex"
}

# ─────────────────────────────────────────────────────────────────────────────
# Zone patterns (fallback if yq not available)
# ─────────────────────────────────────────────────────────────────────────────

declare -A ZONE_PATTERNS

ZONE_PATTERNS["critical"]="checkout claim trade wallet transfer"
ZONE_PATTERNS["transactional"]="dashboard settings admin profile"
ZONE_PATTERNS["exploratory"]="discovery browse search explore"
ZONE_PATTERNS["marketing"]="marketing landing home"
ZONE_PATTERNS["celebration"]="success achievement reward"

# ─────────────────────────────────────────────────────────────────────────────
# Detection with yq
# ─────────────────────────────────────────────────────────────────────────────

detect_zone_yq() {
    local file_path="$1"
    local verbose="$2"

    # Priority order from zones.yaml
    local zones=("critical" "celebration" "transactional" "exploratory" "marketing")

    for zone in "${zones[@]}"; do
        # Get paths for this zone
        local patterns=$(yq -r ".zones.${zone}.paths[]" "$ZONES_FILE" 2>/dev/null)

        if [ -n "$patterns" ]; then
            while IFS= read -r pattern; do
                if matches_pattern "$file_path" "$pattern"; then
                    if [ "$verbose" = "true" ]; then
                        log_info "Matched pattern: $pattern"
                    fi
                    echo "$zone"
                    return 0
                fi
            done <<< "$patterns"
        fi
    done

    echo "default"
}

# ─────────────────────────────────────────────────────────────────────────────
# Detection with grep fallback
# ─────────────────────────────────────────────────────────────────────────────

detect_zone_fallback() {
    local file_path="$1"
    local verbose="$2"

    # Normalize path
    local path_lower=$(echo "$file_path" | tr '[:upper:]' '[:lower:]')

    # Check each zone's keywords
    for zone in critical celebration transactional exploratory marketing; do
        local keywords=""
        case "$zone" in
            critical)     keywords="checkout claim trade wallet transfer" ;;
            celebration)  keywords="success achievement reward" ;;
            transactional) keywords="dashboard settings admin profile" ;;
            exploratory)  keywords="discovery browse search explore" ;;
            marketing)    keywords="marketing landing home" ;;
        esac

        for keyword in $keywords; do
            if echo "$path_lower" | grep -q "$keyword"; then
                if [ "$verbose" = "true" ]; then
                    log_info "Matched keyword: $keyword"
                fi
                echo "$zone"
                return 0
            fi
        done
    done

    echo "default"
}

# ─────────────────────────────────────────────────────────────────────────────
# Get zone details
# ─────────────────────────────────────────────────────────────────────────────

get_zone_details() {
    local zone="$1"

    if [ ! -f "$ZONES_FILE" ]; then
        echo "{}"
        return
    fi

    if check_dependencies; then
        yq -o=json ".zones.${zone} // .default" "$ZONES_FILE" 2>/dev/null || echo "{}"
    else
        # Minimal JSON for fallback
        case "$zone" in
            critical)
                echo '{"material":"clay","sync":"server_tick","motion":{"style":"deliberate"}}'
                ;;
            transactional)
                echo '{"material":"machinery","sync":"lww","motion":{"style":"instant"}}'
                ;;
            exploratory)
                echo '{"material":"glass","sync":"lww","motion":{"style":"flowing"}}'
                ;;
            marketing)
                echo '{"material":"clay","sync":"local_only","motion":{"style":"expressive"}}'
                ;;
            celebration)
                echo '{"material":"clay","sync":"server_tick","motion":{"style":"triumphant"}}'
                ;;
            *)
                echo '{"material":"clay","sync":"lww","motion":{"style":"balanced"}}'
                ;;
        esac
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

main() {
    local file_path=""
    local json_output=false
    local verbose=false

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --json)
                json_output=true
                shift
                ;;
            --verbose)
                verbose=true
                shift
                ;;
            --help|-h)
                usage
                exit 0
                ;;
            -*)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
            *)
                if [ -z "$file_path" ]; then
                    file_path="$1"
                fi
                shift
                ;;
        esac
    done

    if [ -z "$file_path" ]; then
        log_error "File path required"
        usage
        exit 1
    fi

    # Check for zones file
    if [ ! -f "$ZONES_FILE" ]; then
        log_error "zones.yaml not found at $ZONES_FILE"
        log_error "Run /zone to configure zones"
        exit 1
    fi

    # Detect zone
    local zone
    if check_dependencies; then
        zone=$(detect_zone_yq "$file_path" "$verbose")
    else
        if [ "$verbose" = "true" ]; then
            log_info "yq not found, using keyword fallback"
        fi
        zone=$(detect_zone_fallback "$file_path" "$verbose")
    fi

    # Output
    if [ "$json_output" = true ]; then
        local details=$(get_zone_details "$zone")
        echo "{\"zone\":\"$zone\",\"path\":\"$file_path\",\"config\":$details}"
    else
        echo "$zone"
    fi
}

main "$@"
