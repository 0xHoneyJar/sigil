#!/usr/bin/env bash
# Sigil Workbench v1.2.4: Learning Environment
# 3-pane tmux session: diff + browser + Claude Code
# Philosophy: "See the diff. Feel the result. Learn by doing."
#
# BRANDING: Adhesion aesthetic
# Colors: #000000 bg, #FFFFFF text (monochrome)
set -euo pipefail

# === Colors (Monochrome for Adhesion aesthetic) ===
WHITE='\033[1;37m'
DIM='\033[2m'
NC='\033[0m'
BOLD='\033[1m'

# Error colors (minimal)
RED='\033[0;31m'
YELLOW='\033[1;33m'

# === Configuration ===
SESSION_NAME="${SIGIL_SESSION:-sigil-workbench}"
DEV_URL="${SIGIL_DEV_URL:-http://localhost:3000}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# === Helper Functions ===
log() { echo -e "${WHITE}[sigil]${NC} $*"; }
warn() { echo -e "${YELLOW}[sigil]${NC} $*"; }
err() { echo -e "${RED}[sigil]${NC} ERROR: $*" >&2; exit 1; }

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

  # Check for Sigil setup
  if [[ ! -f ".sigil-version.json" ]] && [[ ! -d "sigil-mark" ]]; then
    warn "Sigil not initialized - run /setup first"
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

# === Panel Layout (v1.2.4 - 3 panes) ===
# Layout:
#   ┌─────────────────┬─────────────────────────┐
#   │   PHYSICS       │                         │
#   │   + DIFF        │     BROWSER             │
#   │   + A/B         │     (via Chrome MCP)    │
#   ├─────────────────┴─────────────────────────┤
#   │              CLAUDE CODE                  │
#   └───────────────────────────────────────────┘

create_session() {
  log "Creating tmux session: $SESSION_NAME"

  # Create new session with larger size
  tmux new-session -d -s "$SESSION_NAME" -n "workbench" -x 200 -y 50

  # Split horizontally (top/bottom) - Claude at bottom (40%)
  tmux split-window -v -t "$SESSION_NAME" -p 40

  # Split top pane vertically (diff left / browser right)
  tmux select-pane -t "$SESSION_NAME:0.0"
  tmux split-window -h -t "$SESSION_NAME" -p 65

  log "Session created with 3 panes"
}

launch_panels() {
  log "Launching panel applications..."

  # Pane 0 (top-left): Physics/Diff viewer with A/B toggle
  log "  Pane 0: Physics + Diff"
  tmux select-pane -t "$SESSION_NAME:0.0"
  tmux send-keys "clear && echo ''" Enter
  tmux send-keys "echo '  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'" Enter
  tmux send-keys "echo '  ┃         SIGIL · PHYSICS            ┃'" Enter
  tmux send-keys "echo '  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'" Enter
  tmux send-keys "echo ''" Enter
  tmux send-keys "echo '  ZONE: (waiting for /craft)'" Enter
  tmux send-keys "echo '  RECIPE: -'" Enter
  tmux send-keys "echo ''" Enter
  tmux send-keys "echo '  ┌─────────────────────────────────┐'" Enter
  tmux send-keys "echo '  │ DIFF                            │'" Enter
  tmux send-keys "echo '  │                                 │'" Enter
  tmux send-keys "echo '  │   (no changes yet)              │'" Enter
  tmux send-keys "echo '  │                                 │'" Enter
  tmux send-keys "echo '  └─────────────────────────────────┘'" Enter
  tmux send-keys "echo ''" Enter
  tmux send-keys "echo '  COMPARE:'" Enter
  tmux send-keys "echo '    [A] Before'" Enter
  tmux send-keys "echo '    [B] After'" Enter
  tmux send-keys "echo ''" Enter
  tmux send-keys "echo '  ─────────────────────────────────'" Enter
  tmux send-keys "echo '  Space to toggle · See diff, feel result'" Enter

  # Pane 1 (top-right): Browser placeholder (Chrome MCP)
  log "  Pane 1: Browser (Chrome MCP)"
  tmux select-pane -t "$SESSION_NAME:0.1"
  tmux send-keys "clear && echo ''" Enter
  tmux send-keys "echo '  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'" Enter
  tmux send-keys "echo '  ┃                  BROWSER PREVIEW                     ┃'" Enter
  tmux send-keys "echo '  ┃              (via Claude MCP)                        ┃'" Enter
  tmux send-keys "echo '  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'" Enter
  tmux send-keys "echo ''" Enter
  tmux send-keys "echo '  Browser preview controlled via Claude MCP.'" Enter
  tmux send-keys "echo ''" Enter
  tmux send-keys "echo '  To enable:'" Enter
  tmux send-keys "echo '    1. Chrome running with Claude in Chrome extension'" Enter
  tmux send-keys "echo '    2. Navigate to: $DEV_URL'" Enter
  tmux send-keys "echo '    3. Claude controls browser via MCP'" Enter
  tmux send-keys "echo ''" Enter
  tmux send-keys "echo '  ─────────────────────────────────────────────────'" Enter
  tmux send-keys "echo ''" Enter
  tmux send-keys "echo '  Click components to feel the physics.'" Enter
  tmux send-keys "echo '  Toggle A/B to compare before/after.'" Enter
  tmux send-keys "echo ''" Enter
  tmux send-keys "echo '  The diff is visible. The feel is testable.'" Enter
  tmux send-keys "echo '  Numbers gain meaning through your fingers.'" Enter

  # Pane 2 (bottom): Claude Code
  log "  Pane 2: Claude Code"
  tmux select-pane -t "$SESSION_NAME:0.2"
  tmux send-keys "clear && echo ''" Enter
  tmux send-keys "echo '  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'" Enter
  tmux send-keys "echo '  ┃                            CLAUDE CODE                                   ┃'" Enter
  tmux send-keys "echo '  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'" Enter
  tmux send-keys "echo ''" Enter
  tmux send-keys "echo '  Starting Claude Code...'" Enter
  tmux send-keys "echo ''" Enter
  tmux send-keys "claude" Enter

  # Focus on Claude pane
  tmux select-pane -t "$SESSION_NAME:0.2"
}

attach_session() {
  log "Attaching to session..."
  tmux attach-session -t "$SESSION_NAME"
}

# === Display Functions (v1.2.4 - Adhesion aesthetic) ===

# Adhesion-inspired ASCII header (monochrome, geometric)
SIGIL_HEADER='
███████╗██╗ ██████╗ ██╗██╗
██╔════╝██║██╔════╝ ██║██║
███████╗██║██║  ███╗██║██║
╚════██║██║██║   ██║██║██║
███████║██║╚██████╔╝██║███████╗
╚══════╝╚═╝ ╚═════╝ ╚═╝╚══════╝'

display_banner() {
  echo ""
  echo -e "${BOLD}${WHITE}"
  echo "$SIGIL_HEADER"
  echo ""
  echo "  WORKBENCH v1.2.4"
  echo "  See the diff. Feel the result. Learn by doing."
  echo -e "${NC}"
}

display_layout() {
  echo -e "${BOLD}PANEL LAYOUT${NC}"
  echo ""
  echo "  ┌─────────────────┬─────────────────────────┐"
  echo "  │   PHYSICS       │                         │"
  echo "  │   + DIFF        │     BROWSER             │"
  echo "  │   + A/B         │     (via Chrome MCP)    │"
  echo "  ├─────────────────┴─────────────────────────┤"
  echo "  │              CLAUDE CODE                  │"
  echo "  └───────────────────────────────────────────┘"
  echo ""
}

display_keybindings() {
  echo -e "${BOLD}TMUX KEYBINDINGS${NC}"
  echo ""
  echo "  Navigation:"
  echo "    Ctrl+b ↑/↓/←/→   Move between panes"
  echo "    Ctrl+b o         Cycle through panes"
  echo "    Ctrl+b z         Toggle pane zoom"
  echo ""
  echo "  A/B Toggle:"
  echo "    Space            Switch between Before/After"
  echo ""
  echo "  Session:"
  echo "    Ctrl+b d         Detach from session"
  echo "    q                Quit workbench"
  echo ""
  echo -e "${DIM}  Reattach with: tmux attach -t $SESSION_NAME${NC}"
  echo ""
}

display_commands() {
  echo -e "${BOLD}SIGIL COMMANDS (v1.2.4)${NC}"
  echo ""
  echo "  Generation:"
  echo "    /craft       Generate component using zone recipe"
  echo "    /sandbox     Enable raw physics for experimentation"
  echo "    /codify      Extract physics from sandbox to recipe"
  echo ""
  echo "  Analysis:"
  echo "    /inherit     Scan existing codebase for patterns"
  echo "    /validate    Check recipe compliance"
  echo "    /garden      Health report (coverage, sandboxes)"
  echo ""
}

# === Status Bar Configuration (Monochrome - Adhesion aesthetic) ===
configure_status_bar() {
  tmux set-option -t "$SESSION_NAME" status-style "bg=black,fg=white"
  tmux set-option -t "$SESSION_NAME" status-left "#[fg=white,bold] SIGIL "
  tmux set-option -t "$SESSION_NAME" status-right "#[fg=white] [A]Before [B]After │ Space:Toggle │ q:Quit "
  tmux set-option -t "$SESSION_NAME" status-left-length 30
  tmux set-option -t "$SESSION_NAME" status-right-length 60
}

# === Individual Command Mode ===
run_individual() {
  warn "tmux not available - running in individual mode"
  echo ""
  echo "Run these commands in separate terminals:"
  echo ""
  echo "  Terminal 1: claude"
  echo "  Terminal 2: Open $DEV_URL in browser"
  echo "  Terminal 3: npm run dev (your dev server)"
  echo ""
  echo "Install tmux for full workbench experience:"
  echo "  brew install tmux (macOS)"
  echo "  apt install tmux (Linux)"
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
    echo "  SIGIL_SESSION   Session name (default: sigil-workbench)"
    echo "  SIGIL_DEV_URL   Dev server URL (default: http://localhost:3000)"
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
  configure_status_bar
  attach_session
}

main "$@"
