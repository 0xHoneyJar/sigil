#!/bin/sh
# get-monitors.sh — Get domain-specific monitors for proving
#
# Usage: ./get-monitors.sh [domain] [config_file]
#
# Returns:
#   JSON array of monitor definitions for the specified domain
#   If no domain specified, returns all available domains
#
# Exit codes:
#   0 - Success
#   1 - Invalid domain

set -e

DOMAIN="${1:-}"
CONFIG_FILE="${2:-sigil-mark/proving-grounds/config.yaml}"

# Default monitor definitions (used if config file doesn't exist)
get_default_monitors() {
    domain="$1"

    case "$domain" in
        defi)
            cat <<'MONITORS'
[
  {"id": "tx_success_rate", "name": "Transaction Success Rate", "threshold": "99%", "description": "Percentage of successful transactions"},
  {"id": "slippage_tolerance", "name": "Slippage Tolerance", "threshold": "1%", "description": "Maximum allowed slippage"},
  {"id": "gas_efficiency", "name": "Gas Efficiency", "threshold": "90%", "description": "Gas usage vs baseline"},
  {"id": "liquidity_health", "name": "Liquidity Health", "threshold": "green", "description": "Pool health status"}
]
MONITORS
            ;;
        creative)
            cat <<'MONITORS'
[
  {"id": "load_performance", "name": "Load Performance", "threshold": "3s", "description": "Asset load time"},
  {"id": "render_quality", "name": "Render Quality", "threshold": "0 glitches", "description": "Visual glitch count"},
  {"id": "accessibility_score", "name": "Accessibility Score", "threshold": "AA", "description": "WCAG compliance level"},
  {"id": "engagement_metrics", "name": "Engagement Metrics", "threshold": "positive", "description": "User engagement trend"}
]
MONITORS
            ;;
        community)
            cat <<'MONITORS'
[
  {"id": "response_latency", "name": "Response Latency", "threshold": "500ms", "description": "API response time"},
  {"id": "error_rate", "name": "Error Rate", "threshold": "1%", "description": "Error percentage"},
  {"id": "user_feedback", "name": "User Feedback", "threshold": "no P1s", "description": "Critical user complaints"},
  {"id": "governance_compliance", "name": "Governance Compliance", "threshold": "100%", "description": "Rule adherence"}
]
MONITORS
            ;;
        games)
            cat <<'MONITORS'
[
  {"id": "frame_rate", "name": "Frame Rate", "threshold": "60fps", "description": "Target frame rate"},
  {"id": "fairness_check", "name": "Fairness Check", "threshold": "0 exploits", "description": "Exploit detection"},
  {"id": "reward_balance", "name": "Reward Balance", "threshold": "healthy", "description": "Economy health"},
  {"id": "player_retention", "name": "Player Retention", "threshold": "stable", "description": "Engagement trend"}
]
MONITORS
            ;;
        general|*)
            cat <<'MONITORS'
[
  {"id": "error_rate", "name": "Error Rate", "threshold": "1%", "description": "Error percentage"},
  {"id": "uptime", "name": "Uptime", "threshold": "99%", "description": "Service availability"},
  {"id": "user_feedback", "name": "User Feedback", "threshold": "no P1s", "description": "Critical issues"}
]
MONITORS
            ;;
    esac
}

# List available domains
list_domains() {
    cat <<'DOMAINS'
{
  "domains": [
    {"id": "defi", "name": "DeFi", "description": "Financial transactions, token operations"},
    {"id": "creative", "name": "Creative", "description": "Art, content, media"},
    {"id": "community", "name": "Community", "description": "Social features, governance"},
    {"id": "games", "name": "Games", "description": "Gaming mechanics, rewards"},
    {"id": "general", "name": "General", "description": "Default monitors"}
  ]
}
DOMAINS
}

# If no domain specified, list available domains
if [ -z "$DOMAIN" ]; then
    list_domains
    exit 0
fi

# Validate domain
case "$DOMAIN" in
    defi|creative|community|games|general)
        # Valid domain
        ;;
    *)
        echo '{"error": "Invalid domain. Use: defi, creative, community, games, or general", "status": "error"}'
        exit 1
        ;;
esac

# Try to load from config file if it exists
if [ -f "$CONFIG_FILE" ] && command -v yq >/dev/null 2>&1; then
    MONITORS=$(yq eval ".monitors.${DOMAIN} // null" "$CONFIG_FILE" 2>/dev/null)
    if [ "$MONITORS" != "null" ] && [ -n "$MONITORS" ]; then
        echo "$MONITORS"
        exit 0
    fi
fi

# Fall back to default monitors
get_default_monitors "$DOMAIN"
exit 0
