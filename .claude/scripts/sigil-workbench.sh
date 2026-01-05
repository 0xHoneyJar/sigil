#!/usr/bin/env bash
# Sigil Workbench: 4-Panel Development Environment
# Launches tmux session with Claude, preview, tensions, and validation panels
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
SESSION_NAME="${SIGIL_SESSION:-sigil-workbench}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# === Helper Functions ===
log() { echo -e "${GREEN}[workbench]${NC} $*"; }
warn() { echo -e "${YELLOW}[workbench]${NC} $*"; }
err() { echo -e "${RED}[workbench]${NC} ERROR: $*" >&2; exit 1; }
info() { echo -e "${CYAN}[workbench]${NC} $*"; }

# Check if a command exists
has_command() {
  command -v "$1" >/dev/null 2>&1
}

# === Prerequisite Checks ===
check_prerequisites() {
  log "Checking prerequisites..."

  local missing=()

  # Required: tmux
  if ! has_command tmux; then
    missing+=("tmux")
  fi

  # Required: claude (Claude Code CLI)
  if ! has_command claude; then
    missing+=("claude")
  fi

  # Optional: fswatch (for auto-validation)
  if ! has_command fswatch; then
    warn "fswatch not found - validation will run in manual mode"
    warn "Install with: brew install fswatch"
  fi

  # Check for Sigil setup
  if [[ ! -f ".sigil-version.json" ]] && [[ ! -d "sigil-mark" ]]; then
    warn "Sigil not mounted - run mount-sigil.sh first"
  fi

  if [[ ${#missing[@]} -gt 0 ]]; then
    err "Missing required dependencies: ${missing[*]}"
  fi

  log "Prerequisites OK"
}

# === Session Management ===
session_exists() {
  tmux has-session -t "$SESSION_NAME" 2>/dev/null
}

kill_session() {
  if session_exists; then
    log "Killing existing session: $SESSION_NAME"
    tmux kill-session -t "$SESSION_NAME"
  fi
}

# === Panel Layout ===
# Layout:
# ┌─────────────────┬─────────────────┐
# │                 │                 │
# │   Pane 0        │   Pane 1        │
# │   Claude CLI    │   Preview       │
# │                 │   (placeholder) │
# │                 │                 │
# ├─────────────────┼─────────────────┤
# │                 │                 │
# │   Pane 2        │   Pane 3        │
# │   Tensions      │   Validation    │
# │                 │                 │
# └─────────────────┴─────────────────┘

create_session() {
  log "Creating tmux session: $SESSION_NAME"

  # Create new session with first pane (Claude)
  tmux new-session -d -s "$SESSION_NAME" -n "workbench"

  # Split horizontally for pane 1 (Preview)
  tmux split-window -h -t "$SESSION_NAME:0"

  # Split pane 0 vertically for pane 2 (Tensions)
  tmux split-window -v -t "$SESSION_NAME:0.0"

  # Split pane 1 vertically for pane 3 (Validation)
  tmux split-window -v -t "$SESSION_NAME:0.1"

  # Set layout - main-horizontal gives us 2x2 grid
  tmux select-layout -t "$SESSION_NAME" tiled

  log "Session created with 4 panes"
}

launch_panels() {
  log "Launching panel applications..."

  # Pane 0: Claude CLI
  log "  Pane 0: Claude Code CLI"
  tmux send-keys -t "$SESSION_NAME:0.0" "echo -e '${BOLD}${CYAN}SIGIL WORKBENCH - Claude CLI${NC}'" Enter
  tmux send-keys -t "$SESSION_NAME:0.0" "echo 'Starting Claude Code...'" Enter
  tmux send-keys -t "$SESSION_NAME:0.0" "echo ''" Enter
  tmux send-keys -t "$SESSION_NAME:0.0" "claude" Enter

  # Pane 1: Preview placeholder (Chrome MCP instructions)
  log "  Pane 1: Preview (Chrome MCP)"
  tmux send-keys -t "$SESSION_NAME:0.1" "echo -e '${BOLD}${CYAN}SIGIL WORKBENCH - Live Preview${NC}'" Enter
  tmux send-keys -t "$SESSION_NAME:0.1" "echo ''" Enter
  tmux send-keys -t "$SESSION_NAME:0.1" "echo 'Chrome MCP Preview Panel'" Enter
  tmux send-keys -t "$SESSION_NAME:0.1" "echo '─────────────────────────────────'" Enter
  tmux send-keys -t "$SESSION_NAME:0.1" "echo ''" Enter
  tmux send-keys -t "$SESSION_NAME:0.1" "echo 'For live preview, use Chrome MCP:'" Enter
  tmux send-keys -t "$SESSION_NAME:0.1" "echo '  1. Install Claude in Chrome extension'" Enter
  tmux send-keys -t "$SESSION_NAME:0.1" "echo '  2. Open your dev server (npm run dev)'" Enter
  tmux send-keys -t "$SESSION_NAME:0.1" "echo '  3. Claude can control browser for preview'" Enter
  tmux send-keys -t "$SESSION_NAME:0.1" "echo ''" Enter
  tmux send-keys -t "$SESSION_NAME:0.1" "echo 'Manual preview:'" Enter
  tmux send-keys -t "$SESSION_NAME:0.1" "echo '  Open http://localhost:3000 in browser'" Enter
  tmux send-keys -t "$SESSION_NAME:0.1" "echo ''" Enter
  tmux send-keys -t "$SESSION_NAME:0.1" "echo -e '${DIM}This pane is for documentation.${NC}'" Enter
  tmux send-keys -t "$SESSION_NAME:0.1" "echo -e '${DIM}Run your dev server in a separate terminal.${NC}'" Enter

  # Pane 2: Tensions monitor
  log "  Pane 2: Tension Monitor"
  if [[ -f "$SCRIPT_DIR/sigil-tensions.sh" ]]; then
    tmux send-keys -t "$SESSION_NAME:0.2" "$SCRIPT_DIR/sigil-tensions.sh" Enter
  else
    tmux send-keys -t "$SESSION_NAME:0.2" "echo 'Tension monitor not found'" Enter
    tmux send-keys -t "$SESSION_NAME:0.2" "echo 'Run: sigil-tensions.sh'" Enter
  fi

  # Pane 3: Validation monitor
  log "  Pane 3: Validation Monitor"
  if [[ -f "$SCRIPT_DIR/sigil-validate.sh" ]]; then
    tmux send-keys -t "$SESSION_NAME:0.3" "$SCRIPT_DIR/sigil-validate.sh --once" Enter
    tmux send-keys -t "$SESSION_NAME:0.3" "echo ''" Enter
    tmux send-keys -t "$SESSION_NAME:0.3" "echo 'Run sigil-validate.sh <file> to validate'" Enter
  else
    tmux send-keys -t "$SESSION_NAME:0.3" "echo 'Validation monitor not found'" Enter
    tmux send-keys -t "$SESSION_NAME:0.3" "echo 'Run: sigil-validate.sh'" Enter
  fi

  # Focus on Claude pane
  tmux select-pane -t "$SESSION_NAME:0.0"
}

attach_session() {
  log "Attaching to session..."
  tmux attach-session -t "$SESSION_NAME"
}

# === Display Functions ===
display_banner() {
  echo ""
  echo -e "${BOLD}${CYAN}"
  echo "╔═══════════════════════════════════════════════════════════╗"
  echo "║            SIGIL WORKBENCH v1.0                           ║"
  echo "║      Design Physics Engine Development Environment        ║"
  echo "╚═══════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

display_layout() {
  echo -e "${BOLD}PANEL LAYOUT${NC}"
  echo ""
  echo "  ┌─────────────────┬─────────────────┐"
  echo "  │                 │                 │"
  echo "  │   Claude CLI    │   Preview       │"
  echo "  │   (Pane 0)      │   (Pane 1)      │"
  echo "  │                 │                 │"
  echo "  ├─────────────────┼─────────────────┤"
  echo "  │                 │                 │"
  echo "  │   Tensions      │   Validation    │"
  echo "  │   (Pane 2)      │   (Pane 3)      │"
  echo "  │                 │                 │"
  echo "  └─────────────────┴─────────────────┘"
  echo ""
}

display_keybindings() {
  echo -e "${BOLD}TMUX KEYBINDINGS${NC}"
  echo ""
  echo "  Navigation:"
  echo "    Ctrl+b ↑/↓/←/→   Move between panes"
  echo "    Ctrl+b o         Cycle through panes"
  echo "    Ctrl+b q         Show pane numbers"
  echo "    Ctrl+b z         Toggle pane zoom"
  echo ""
  echo "  Session:"
  echo "    Ctrl+b d         Detach from session"
  echo "    Ctrl+b &         Kill window"
  echo ""
  echo -e "${DIM}  Reattach with: tmux attach -t $SESSION_NAME${NC}"
  echo ""
}

display_commands() {
  echo -e "${BOLD}SIGIL COMMANDS${NC}"
  echo ""
  echo "  Setup:"
  echo "    /envision    Capture product soul"
  echo "    /codify      Define materials"
  echo "    /map         Configure zones"
  echo ""
  echo "  Generation:"
  echo "    /craft       Generate components with physics"
  echo "    /validate    Check against constraints"
  echo ""
  echo "  Approval:"
  echo "    /approve     Taste Key ruling"
  echo "    /greenlight  Concept approval"
  echo ""
  echo "  Maintenance:"
  echo "    /garden      Check for drift"
  echo ""
}

# === Individual Command Mode ===
run_individual() {
  warn "tmux not available - running in individual mode"
  echo ""
  echo "Run these commands in separate terminals:"
  echo ""
  echo "  Terminal 1: claude"
  echo "  Terminal 2: sigil-tensions.sh"
  echo "  Terminal 3: sigil-validate.sh"
  echo "  Terminal 4: npm run dev (your dev server)"
  echo ""
}

# === Main ===
main() {
  display_banner

  # Check for help
  if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    display_layout
    display_keybindings
    display_commands
    echo ""
    echo "Usage: sigil-workbench.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --kill       Kill existing session"
    echo "  --status     Show session status"
    echo "  -h, --help   Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  SIGIL_SESSION  Session name (default: sigil-workbench)"
    echo ""
    exit 0
  fi

  # Handle --kill
  if [[ "${1:-}" == "--kill" ]]; then
    kill_session
    log "Session killed"
    exit 0
  fi

  # Handle --status
  if [[ "${1:-}" == "--status" ]]; then
    if session_exists; then
      log "Session '$SESSION_NAME' is running"
      tmux list-panes -t "$SESSION_NAME" -F "  Pane #{pane_index}: #{pane_current_command}"
    else
      log "Session '$SESSION_NAME' is not running"
    fi
    exit 0
  fi

  # Check if tmux is available
  if ! has_command tmux; then
    run_individual
    exit 0
  fi

  check_prerequisites

  # Check for existing session
  if session_exists; then
    warn "Session '$SESSION_NAME' already exists"
    read -p "Attach to existing session? (Y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Nn]$ ]]; then
      read -p "Kill and recreate? (y/N) " -n 1 -r
      echo ""
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill_session
      else
        log "Aborted"
        exit 0
      fi
    else
      attach_session
      exit 0
    fi
  fi

  display_layout
  display_keybindings
  display_commands

  echo -e "${BOLD}Starting Workbench...${NC}"
  echo ""

  create_session
  launch_panels
  attach_session
}

main "$@"
