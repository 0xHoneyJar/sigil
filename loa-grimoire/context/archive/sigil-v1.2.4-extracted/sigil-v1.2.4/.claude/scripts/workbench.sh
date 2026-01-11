#!/bin/bash
# Sigil Workbench - Learning Environment
# Launch tmux session with diff pane, browser, and Claude Code
#
# BRANDING: Adhesion font (bundled in assets/fonts/Adhesion-Regular.otf)
# Colors: #000000 bg, #FFFFFF text

set -e

SESSION_NAME="sigil-workbench"
DEV_URL="${SIGIL_DEV_URL:-http://localhost:3000}"

# ============================================================================
# Branding Constants
# ============================================================================

# Adhesion-inspired ASCII header (monochrome, geometric)
SIGIL_HEADER='
███████╗██╗ ██████╗ ██╗██╗     
██╔════╝██║██╔════╝ ██║██║     
███████╗██║██║  ███╗██║██║     
╚════██║██║██║   ██║██║██║     
███████║██║╚██████╔╝██║███████╗
╚══════╝╚═╝ ╚═════╝ ╚═╝╚══════╝'

# ============================================================================
# Check Dependencies
# ============================================================================

if ! command -v tmux &> /dev/null; then
  echo "Error: tmux is required for workbench"
  echo "Install: brew install tmux (macOS) or apt install tmux (Linux)"
  exit 1
fi

# ============================================================================
# Kill existing session if running
# ============================================================================

tmux kill-session -t "$SESSION_NAME" 2>/dev/null || true

# ============================================================================
# Create Session
# ============================================================================

echo "$SIGIL_HEADER"
echo ""
echo "Starting Sigil Workbench..."
echo "Dev URL: $DEV_URL"
echo ""

# Create new session with three panes
# Layout:
#   ┌─────────────┬─────────────────────┐
#   │   PHYSICS   │                     │
#   │   + DIFF    │     BROWSER         │
#   │   + A/B     │     (via MCP)       │
#   ├─────────────┴─────────────────────┤
#   │         CLAUDE CODE               │
#   └───────────────────────────────────┘

tmux new-session -d -s "$SESSION_NAME" -x 200 -y 50

# Split horizontally (top/bottom)
tmux split-window -v -t "$SESSION_NAME" -p 40

# Split top pane vertically (left/right)
tmux select-pane -t "$SESSION_NAME:0.0"
tmux split-window -h -t "$SESSION_NAME" -p 65

# ============================================================================
# Configure Panes
# ============================================================================

# Pane 0 (top-left): Physics/Diff viewer
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

# Pane 1 (top-right): Browser placeholder
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
tmux send-keys "echo '    1. Chrome running with MCP extension'" Enter
tmux send-keys "echo '    2. Navigate to: $DEV_URL'" Enter
tmux send-keys "echo '    3. Claude controls via MCP'" Enter
tmux send-keys "echo ''" Enter
tmux send-keys "echo '  ─────────────────────────────────────────────────'" Enter
tmux send-keys "echo ''" Enter
tmux send-keys "echo '  Click components to feel the physics.'" Enter
tmux send-keys "echo '  Toggle A/B to compare before/after.'" Enter
tmux send-keys "echo ''" Enter
tmux send-keys "echo '  The diff is visible. The feel is testable.'" Enter
tmux send-keys "echo '  Numbers gain meaning through your fingers.'" Enter

# Pane 2 (bottom): Claude Code
tmux select-pane -t "$SESSION_NAME:0.2"
tmux send-keys "clear && echo ''" Enter
tmux send-keys "echo '  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'" Enter
tmux send-keys "echo '  ┃                            CLAUDE CODE                                   ┃'" Enter
tmux send-keys "echo '  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'" Enter
tmux send-keys "echo ''" Enter
tmux send-keys "echo '  Starting Claude Code...'" Enter
tmux send-keys "echo ''" Enter
tmux send-keys "claude" Enter

# ============================================================================
# Set Status Bar (Monochrome - Adhesion aesthetic)
# ============================================================================

tmux set-option -t "$SESSION_NAME" status-style "bg=black,fg=white"
tmux set-option -t "$SESSION_NAME" status-left "#[fg=white,bold] SIGIL "
tmux set-option -t "$SESSION_NAME" status-right "#[fg=white] [A]Before [B]After │ Space:Toggle │ q:Quit "
tmux set-option -t "$SESSION_NAME" status-left-length 30
tmux set-option -t "$SESSION_NAME" status-right-length 60

# ============================================================================
# Attach to Session
# ============================================================================

echo "Workbench ready. Attaching..."
tmux attach-session -t "$SESSION_NAME"
