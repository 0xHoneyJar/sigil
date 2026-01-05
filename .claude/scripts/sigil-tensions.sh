#!/usr/bin/env bash
# Sigil Workbench: Tension Monitor
# Displays current tension values as ASCII progress bars
# Auto-refreshes every 2 seconds
set -euo pipefail

# === Colors ===
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'
DIM='\033[2m'
BOLD='\033[1m'

# === Configuration ===
REFRESH_INTERVAL="${SIGIL_REFRESH:-2}"
TENSIONS_FILE="sigil-mark/resonance/tensions.yaml"
ZONES_FILE="sigil-mark/resonance/zones.yaml"

# === Helper Functions ===
log() { echo -e "${GREEN}[tensions]${NC} $*"; }
warn() { echo -e "${YELLOW}[tensions]${NC} $*"; }
err() { echo -e "${RED}[tensions]${NC} ERROR: $*" >&2; exit 1; }

# Clear screen and move cursor to top
clear_screen() {
  printf '\033[2J\033[H'
}

# Draw a progress bar
# Usage: draw_bar <value> <max> <color> <width>
draw_bar() {
  local value=$1
  local max=$2
  local color=$3
  local width=${4:-30}

  # Calculate filled portion
  local filled=$((value * width / max))
  local empty=$((width - filled))

  # Build bar
  local bar=""
  for ((i=0; i<filled; i++)); do
    bar+="█"
  done
  for ((i=0; i<empty; i++)); do
    bar+="░"
  done

  echo -e "${color}${bar}${NC}"
}

# Parse YAML value (simple grep-based parser)
# Usage: parse_yaml <file> <key>
parse_yaml() {
  local file=$1
  local key=$2

  if [[ ! -f "$file" ]]; then
    echo "0"
    return
  fi

  # Simple YAML parsing - look for key: value
  local value
  value=$(grep -E "^\s*${key}:" "$file" 2>/dev/null | head -1 | sed 's/.*:\s*//' | tr -d ' "'"'" || echo "0")

  # Handle empty value
  if [[ -z "$value" ]]; then
    echo "50"  # Default to middle
  else
    echo "$value"
  fi
}

# Parse zone-specific tensions
# Usage: parse_zone_tensions <zone_name>
parse_zone_tensions() {
  local zone=$1

  if [[ ! -f "$ZONES_FILE" ]]; then
    return
  fi

  # Use awk to extract zone tensions (simple approach)
  awk -v zone="$zone" '
    $0 ~ "^  " zone ":" { in_zone=1; next }
    in_zone && /^  [a-z]/ { in_zone=0 }
    in_zone && /tensions:/ { in_tensions=1; next }
    in_tensions && /^      [a-z]/ {
      gsub(/[: ]/, "");
      split($0, a, ":");
      if (length(a) >= 2) print a[1] ":" a[2]
    }
    in_tensions && /^    [a-z]/ && !/tensions:/ { in_tensions=0 }
  ' "$ZONES_FILE" 2>/dev/null
}

# Get current zone (from environment or default)
get_current_zone() {
  local zone="${SIGIL_ZONE:-default}"

  # If editing a file, try to detect zone
  if [[ -n "${SIGIL_FILE:-}" ]] && [[ -f ".claude/scripts/sigil-detect-zone.sh" ]]; then
    zone=$(.claude/scripts/sigil-detect-zone.sh "$SIGIL_FILE" 2>/dev/null || echo "default")
  fi

  echo "$zone"
}

# === Display Functions ===
display_header() {
  echo -e "${BOLD}${CYAN}"
  echo "╔═══════════════════════════════════════════════════════════╗"
  echo "║            SIGIL TENSION MONITOR v1.0                     ║"
  echo "╚═══════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

display_tensions() {
  local zone=$(get_current_zone)

  # Read base tensions
  local playfulness=$(parse_yaml "$TENSIONS_FILE" "playfulness")
  local weight=$(parse_yaml "$TENSIONS_FILE" "weight")
  local density=$(parse_yaml "$TENSIONS_FILE" "density")
  local speed=$(parse_yaml "$TENSIONS_FILE" "speed")

  # Display zone context
  echo -e "${DIM}Zone: ${NC}${BOLD}${zone}${NC}"
  echo -e "${DIM}Source: ${NC}${TENSIONS_FILE}"
  echo ""

  # Display each tension axis
  echo -e "${BOLD}TENSION AXES${NC}"
  echo ""

  # Playfulness (0 = Serious, 100 = Playful)
  echo -e "${MAGENTA}Playfulness${NC}  [Serious ←→ Playful]"
  printf "  %3d%% " "$playfulness"
  draw_bar "$playfulness" 100 "$MAGENTA" 40
  echo ""

  # Weight (0 = Light, 100 = Heavy)
  echo -e "${BLUE}Weight${NC}       [Light ←→ Heavy]"
  printf "  %3d%% " "$weight"
  draw_bar "$weight" 100 "$BLUE" 40
  echo ""

  # Density (0 = Sparse, 100 = Dense)
  echo -e "${GREEN}Density${NC}      [Sparse ←→ Dense]"
  printf "  %3d%% " "$density"
  draw_bar "$density" 100 "$GREEN" 40
  echo ""

  # Speed (0 = Slow, 100 = Fast)
  echo -e "${YELLOW}Speed${NC}        [Slow ←→ Fast]"
  printf "  %3d%% " "$speed"
  draw_bar "$speed" 100 "$YELLOW" 40
  echo ""
}

display_presets() {
  echo ""
  echo -e "${BOLD}PRESETS${NC}"
  echo -e "${DIM}  Linear:   P=10  W=20  D=30  S=40${NC}"
  echo -e "${DIM}  Airbnb:   P=30  W=40  D=50  S=60${NC}"
  echo -e "${DIM}  Nintendo: P=80  W=30  D=40  S=70${NC}"
  echo -e "${DIM}  OSRS:     P=20  W=90  D=80  S=20${NC}"
}

display_css_vars() {
  echo ""
  echo -e "${BOLD}CSS VARIABLES${NC}"

  local playfulness=$(parse_yaml "$TENSIONS_FILE" "playfulness")
  local weight=$(parse_yaml "$TENSIONS_FILE" "weight")
  local density=$(parse_yaml "$TENSIONS_FILE" "density")
  local speed=$(parse_yaml "$TENSIONS_FILE" "speed")

  # Calculate derived values
  local border_radius=$((playfulness * 16 / 100))
  local shadow_blur=$((weight * 24 / 100))
  local gap=$((8 + density * 16 / 100))
  local duration=$((100 + (100 - speed) * 4))

  echo -e "${DIM}  --sigil-playfulness: ${NC}${playfulness}%"
  echo -e "${DIM}  --sigil-weight: ${NC}${weight}%"
  echo -e "${DIM}  --sigil-density: ${NC}${density}%"
  echo -e "${DIM}  --sigil-speed: ${NC}${speed}%"
  echo ""
  echo -e "${DIM}  --sigil-border-radius: ${NC}${border_radius}px"
  echo -e "${DIM}  --sigil-shadow-blur: ${NC}${shadow_blur}px"
  echo -e "${DIM}  --sigil-gap: ${NC}${gap}px"
  echo -e "${DIM}  --sigil-duration: ${NC}${duration}ms"
}

display_footer() {
  echo ""
  echo -e "${DIM}────────────────────────────────────────────────────────────${NC}"
  echo -e "${DIM}Auto-refresh: ${REFRESH_INTERVAL}s | Ctrl+C to exit | SIGIL_ZONE=<zone> to override${NC}"
  echo -e "${DIM}Last update: $(date '+%H:%M:%S')${NC}"
}

# === Main Loop ===
main() {
  # Check for tensions file
  if [[ ! -f "$TENSIONS_FILE" ]]; then
    warn "Tensions file not found: $TENSIONS_FILE"
    warn "Run '/envision' to create initial tensions"

    # Create default tensions
    mkdir -p "$(dirname "$TENSIONS_FILE")"
    cat > "$TENSIONS_FILE" << 'EOF'
# Sigil Tension Values
# 0-100 scale for each axis

# Playfulness: Serious (0) to Playful (100)
playfulness: 50

# Weight: Light (0) to Heavy (100)
weight: 50

# Density: Sparse (0) to Dense (100)
density: 50

# Speed: Slow (0) to Fast (100)
speed: 50

# Preset used (if any)
preset: null
EOF
    log "Created default tensions file"
  fi

  # Check for watch mode
  if [[ "${1:-}" == "--once" ]]; then
    clear_screen
    display_header
    display_tensions
    display_presets
    display_css_vars
    display_footer
    exit 0
  fi

  # Continuous monitoring mode
  while true; do
    clear_screen
    display_header
    display_tensions
    display_presets
    display_css_vars
    display_footer

    sleep "$REFRESH_INTERVAL"
  done
}

# Handle script arguments
case "${1:-}" in
  -h|--help)
    echo "Usage: sigil-tensions.sh [OPTIONS]"
    echo ""
    echo "Display current tension values as ASCII progress bars."
    echo ""
    echo "Options:"
    echo "  --once      Display once and exit (no auto-refresh)"
    echo "  -h, --help  Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  SIGIL_REFRESH  Refresh interval in seconds (default: 2)"
    echo "  SIGIL_ZONE     Override current zone detection"
    echo "  SIGIL_FILE     File path for automatic zone detection"
    echo ""
    exit 0
    ;;
  *)
    main "$@"
    ;;
esac
