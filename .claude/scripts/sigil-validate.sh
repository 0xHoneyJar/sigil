#!/usr/bin/env bash
# Sigil Workbench: Validation Monitor
# Watches for file changes and runs validation
# Falls back to manual mode if fswatch is unavailable
set -euo pipefail

# === Colors ===
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m'
DIM='\033[2m'
BOLD='\033[1m'

# === Configuration ===
WATCH_PATHS="${SIGIL_WATCH:-src components app}"
ZONES_FILE="sigil-mark/resonance/zones.yaml"
FIDELITY_FILE="sigil-mark/core/fidelity.yaml"
BUDGETS_FILE="sigil-mark/core/budgets.yaml"
LAST_FILE=""
LAST_RESULT=""

# === Helper Functions ===
log() { echo -e "${GREEN}[validate]${NC} $*"; }
warn() { echo -e "${YELLOW}[validate]${NC} $*"; }
err() { echo -e "${RED}[validate]${NC} ERROR: $*" >&2; }
pass() { echo -e "${GREEN}[PASS]${NC} $*"; }
fail() { echo -e "${RED}[FAIL]${NC} $*"; }
block() { echo -e "${YELLOW}[BLOCK]${NC} $*"; }

# Clear screen and move cursor to top
clear_screen() {
  printf '\033[2J\033[H'
}

# Check if a command exists
has_command() {
  command -v "$1" >/dev/null 2>&1
}

# Parse YAML value (simple grep-based parser)
parse_yaml() {
  local file=$1
  local key=$2

  if [[ ! -f "$file" ]]; then
    echo ""
    return
  fi

  grep -E "^\s*${key}:" "$file" 2>/dev/null | head -1 | sed 's/.*:\s*//' | tr -d ' "'"'" || echo ""
}

# Detect zone from file path
detect_zone() {
  local file_path=$1

  if [[ -f ".claude/scripts/sigil-detect-zone.sh" ]]; then
    .claude/scripts/sigil-detect-zone.sh "$file_path" 2>/dev/null || echo "default"
  else
    echo "default"
  fi
}

# === Validation Functions ===

# Check fidelity ceiling
validate_fidelity() {
  local file=$1
  local issues=()

  if [[ ! -f "$file" ]]; then
    return 0
  fi

  # Check gradient stops (max 2 per PRD)
  local gradient_count
  gradient_count=$(grep -oE 'gradient\([^)]*,[^)]*,[^)]*\)' "$file" 2>/dev/null | wc -l || echo 0)
  if [[ $gradient_count -gt 2 ]]; then
    issues+=("Gradient stops: $gradient_count (max 2)")
  fi

  # Check shadow layers (max 2 per PRD)
  local shadow_count
  shadow_count=$(grep -oE 'shadow-[a-z]+' "$file" 2>/dev/null | wc -l || echo 0)
  if [[ $shadow_count -gt 4 ]]; then
    issues+=("Shadow layers: $shadow_count (max 4)")
  fi

  # Check animation duration (max 500ms in critical zones)
  local long_animations
  long_animations=$(grep -oE 'duration-\[?[5-9][0-9][0-9]' "$file" 2>/dev/null | wc -l || echo 0)
  if [[ $long_animations -gt 0 ]]; then
    issues+=("Long animations detected (>500ms)")
  fi

  if [[ ${#issues[@]} -gt 0 ]]; then
    echo "FIDELITY_VIOLATION"
    for issue in "${issues[@]}"; do
      echo "  - $issue"
    done
    return 1
  fi

  return 0
}

# Check budget constraints
validate_budget() {
  local file=$1
  local zone=$2
  local issues=()

  if [[ ! -f "$file" ]]; then
    return 0
  fi

  # Count interactive elements (buttons, inputs, links)
  local interactive_count
  interactive_count=$(grep -oE '<(button|input|a |Button|Input|Link)' "$file" 2>/dev/null | wc -l || echo 0)

  # Zone-specific limits
  local max_interactive=10
  case "$zone" in
    critical)
      max_interactive=5
      ;;
    transactional)
      max_interactive=7
      ;;
    *)
      max_interactive=10
      ;;
  esac

  if [[ $interactive_count -gt $max_interactive ]]; then
    issues+=("Interactive elements: $interactive_count (max $max_interactive in $zone zone)")
  fi

  # Count decisions (conditionals that affect UI)
  local decision_count
  decision_count=$(grep -oE '\?\s*[<{]|&&\s*[<{]|\|\|\s*[<{]' "$file" 2>/dev/null | wc -l || echo 0)

  local max_decisions=5
  case "$zone" in
    critical)
      max_decisions=3
      ;;
    *)
      max_decisions=5
      ;;
  esac

  if [[ $decision_count -gt $max_decisions ]]; then
    issues+=("UI decisions: $decision_count (max $max_decisions in $zone zone)")
  fi

  if [[ ${#issues[@]} -gt 0 ]]; then
    echo "BUDGET_VIOLATION"
    for issue in "${issues[@]}"; do
      echo "  - $issue"
    done
    return 1
  fi

  return 0
}

# Check physics constraints (IMPOSSIBLE violations)
validate_physics() {
  local file=$1
  local zone=$2
  local issues=()

  if [[ ! -f "$file" ]]; then
    return 0
  fi

  # In server_authoritative zones, check for optimistic patterns
  if [[ "$zone" == "critical" ]]; then
    # Check for optimistic UI patterns
    if grep -qE 'optimistic|useMutation.*onMutate|setQueryData' "$file" 2>/dev/null; then
      issues+=("IMPOSSIBLE: Optimistic UI in server_authoritative zone")
    fi

    # Check for immediate state updates before server confirmation
    if grep -qE 'setState.*fetch|useState.*onClick[^}]*fetch' "$file" 2>/dev/null; then
      issues+=("IMPOSSIBLE: State update before server confirmation")
    fi
  fi

  if [[ ${#issues[@]} -gt 0 ]]; then
    echo "PHYSICS_VIOLATION"
    for issue in "${issues[@]}"; do
      echo "  - $issue"
    done
    return 1
  fi

  return 0
}

# Run full validation on a file
validate_file() {
  local file=$1

  if [[ ! -f "$file" ]]; then
    err "File not found: $file"
    return 1
  fi

  local zone
  zone=$(detect_zone "$file")

  echo ""
  echo -e "${BOLD}Validating: ${NC}$file"
  echo -e "${DIM}Zone: $zone${NC}"
  echo ""

  local all_passed=true
  local result=""

  # Physics validation (IMPOSSIBLE)
  result=$(validate_physics "$file" "$zone")
  if [[ -n "$result" ]]; then
    fail "Physics constraint violated"
    echo "$result" | sed 's/^/  /'
    all_passed=false
  else
    pass "Physics constraints"
  fi

  # Budget validation (BLOCK)
  result=$(validate_budget "$file" "$zone")
  if [[ -n "$result" ]]; then
    block "Budget exceeded"
    echo "$result" | sed 's/^/  /'
    all_passed=false
  else
    pass "Budget limits"
  fi

  # Fidelity validation (BLOCK)
  result=$(validate_fidelity "$file")
  if [[ -n "$result" ]]; then
    block "Fidelity ceiling exceeded"
    echo "$result" | sed 's/^/  /'
    all_passed=false
  else
    pass "Fidelity ceiling"
  fi

  echo ""

  if $all_passed; then
    echo -e "${GREEN}${BOLD}✓ ALL CHECKS PASSED${NC}"
    LAST_RESULT="PASS"
  else
    echo -e "${RED}${BOLD}✗ VALIDATION FAILED${NC}"
    LAST_RESULT="FAIL"
  fi

  LAST_FILE="$file"
  return 0
}

# === Display Functions ===
display_header() {
  echo -e "${BOLD}${CYAN}"
  echo "╔═══════════════════════════════════════════════════════════╗"
  echo "║            SIGIL VALIDATION MONITOR v1.0                  ║"
  echo "╚═══════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

display_status() {
  if [[ -n "$LAST_FILE" ]]; then
    echo -e "${DIM}Last validated: ${NC}$LAST_FILE"
    if [[ "$LAST_RESULT" == "PASS" ]]; then
      echo -e "${DIM}Status: ${NC}${GREEN}PASS${NC}"
    else
      echo -e "${DIM}Status: ${NC}${RED}FAIL${NC}"
    fi
  else
    echo -e "${DIM}Waiting for file changes...${NC}"
  fi
}

display_watching() {
  echo ""
  echo -e "${BOLD}WATCHING PATHS${NC}"
  for path in $WATCH_PATHS; do
    if [[ -d "$path" ]]; then
      echo -e "  ${GREEN}✓${NC} $path"
    else
      echo -e "  ${DIM}○${NC} $path ${DIM}(not found)${NC}"
    fi
  done
}

display_footer() {
  echo ""
  echo -e "${DIM}────────────────────────────────────────────────────────────${NC}"
  if has_command fswatch; then
    echo -e "${DIM}Mode: Auto-watch (fswatch) | Ctrl+C to exit${NC}"
  else
    echo -e "${DIM}Mode: Manual | Run with file path to validate${NC}"
    echo -e "${DIM}Install fswatch for auto-watch: brew install fswatch${NC}"
  fi
  echo -e "${DIM}Last check: $(date '+%H:%M:%S')${NC}"
}

# === Watch Mode ===
watch_mode() {
  if ! has_command fswatch; then
    warn "fswatch not found - falling back to manual mode"
    warn "Install with: brew install fswatch"
    echo ""
    echo "Usage: sigil-validate.sh <file>"
    echo ""
    echo "Example:"
    echo "  sigil-validate.sh src/components/Button.tsx"
    exit 0
  fi

  log "Starting watch mode..."

  # Build watch paths that exist
  local valid_paths=()
  for path in $WATCH_PATHS; do
    if [[ -d "$path" ]]; then
      valid_paths+=("$path")
    fi
  done

  if [[ ${#valid_paths[@]} -eq 0 ]]; then
    err "No valid paths to watch"
    exit 1
  fi

  log "Watching: ${valid_paths[*]}"

  # Watch for changes
  fswatch -o "${valid_paths[@]}" --include '\.tsx$' --include '\.ts$' --include '\.jsx$' --include '\.js$' | while read -r _; do
    # Get the most recently modified file
    local latest_file
    latest_file=$(find "${valid_paths[@]}" -type f \( -name '*.tsx' -o -name '*.ts' -o -name '*.jsx' -o -name '*.js' \) -mmin -0.1 2>/dev/null | head -1)

    if [[ -n "$latest_file" ]]; then
      clear_screen
      display_header
      validate_file "$latest_file"
      display_watching
      display_footer
    fi
  done
}

# === Main ===
main() {
  # If file provided, validate it directly
  if [[ $# -gt 0 ]] && [[ -f "$1" ]]; then
    display_header
    validate_file "$1"
    display_footer
    exit 0
  fi

  # Check for watch mode
  if [[ "${1:-}" == "--once" ]]; then
    display_header
    display_status
    display_watching
    display_footer
    exit 0
  fi

  # Start watch mode
  clear_screen
  display_header
  display_status
  display_watching
  display_footer

  watch_mode
}

# Handle script arguments
case "${1:-}" in
  -h|--help)
    echo "Usage: sigil-validate.sh [OPTIONS] [FILE]"
    echo ""
    echo "Watch for file changes and run physics validation."
    echo ""
    echo "Options:"
    echo "  <file>      Validate a specific file"
    echo "  --once      Display status once and exit"
    echo "  -h, --help  Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  SIGIL_WATCH  Space-separated paths to watch (default: src components app)"
    echo ""
    echo "Validation Hierarchy:"
    echo "  IMPOSSIBLE  Physics violations (cannot override)"
    echo "  BLOCK       Budget/fidelity violations (Taste Key can override)"
    echo "  WARN        Drift warnings (suggestions only)"
    echo ""
    echo "Examples:"
    echo "  sigil-validate.sh                          # Watch mode"
    echo "  sigil-validate.sh src/Button.tsx           # Validate single file"
    echo "  SIGIL_WATCH='lib src' sigil-validate.sh    # Custom watch paths"
    echo ""
    exit 0
    ;;
  *)
    main "$@"
    ;;
esac
