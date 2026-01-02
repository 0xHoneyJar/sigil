#!/usr/bin/env bash
# Sigil Framework: Mount Script
# Design context framework for AI-assisted development
set -euo pipefail

# === Colors ===
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[sigil]${NC} $*"; }
warn() { echo -e "${YELLOW}[sigil]${NC} $*"; }
err() { echo -e "${RED}[sigil]${NC} ERROR: $*" >&2; exit 1; }
info() { echo -e "${CYAN}[sigil]${NC} $*"; }
step() { echo -e "${BLUE}[sigil]${NC} -> $*"; }

# === Configuration ===
SIGIL_HOME="${SIGIL_HOME:-$HOME/.sigil/sigil}"
SIGIL_REPO="${SIGIL_REPO:-https://github.com/zksoju/sigil.git}"
SIGIL_BRANCH="${SIGIL_BRANCH:-main}"
VERSION_FILE=".sigil-version.json"

# === Argument Parsing ===
while [[ $# -gt 0 ]]; do
  case $1 in
    --branch)
      SIGIL_BRANCH="$2"
      shift 2
      ;;
    --home)
      SIGIL_HOME="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: mount-sigil.sh [OPTIONS]"
      echo ""
      echo "Mount Sigil design context framework onto a repository."
      echo ""
      echo "Options:"
      echo "  --branch <name>   Sigil branch to use (default: main)"
      echo "  --home <path>     Sigil home directory (default: ~/.sigil/sigil)"
      echo "  -h, --help        Show this help message"
      echo ""
      echo "Examples:"
      echo "  curl -fsSL https://raw.githubusercontent.com/zksoju/sigil/main/.claude/scripts/mount-sigil.sh | bash"
      echo "  ./mount-sigil.sh --branch develop"
      exit 0
      ;;
    *)
      warn "Unknown option: $1"
      shift
      ;;
  esac
done

# === Pre-flight Checks ===
preflight() {
  log "Running pre-flight checks..."

  if ! git rev-parse --git-dir > /dev/null 2>&1; then
    err "Not a git repository. Initialize with 'git init' first."
  fi

  if [[ -f "$VERSION_FILE" ]]; then
    local existing=$(jq -r '.version // "unknown"' "$VERSION_FILE" 2>/dev/null || echo "unknown")
    warn "Sigil is already mounted (version: $existing)"
    read -p "Remount/upgrade? This will refresh symlinks. (y/N) " -n 1 -r
    echo ""
    [[ $REPLY =~ ^[Yy]$ ]] || { log "Aborted."; exit 0; }
  fi

  command -v git >/dev/null || err "git is required"
  command -v jq >/dev/null || warn "jq not found (optional, for better JSON handling)"

  log "Pre-flight checks passed"
}

# === Clone or Update Sigil ===
setup_sigil_home() {
  step "Setting up Sigil home..."

  if [[ -d "$SIGIL_HOME" ]]; then
    log "Updating existing Sigil installation..."
    cd "$SIGIL_HOME"
    git fetch origin "$SIGIL_BRANCH" --quiet
    git checkout "$SIGIL_BRANCH" --quiet 2>/dev/null || git checkout -b "$SIGIL_BRANCH" "origin/$SIGIL_BRANCH" --quiet
    git pull origin "$SIGIL_BRANCH" --quiet
    cd - > /dev/null
  else
    log "Installing Sigil..."
    mkdir -p "$(dirname "$SIGIL_HOME")"
    git clone --branch "$SIGIL_BRANCH" "$SIGIL_REPO" "$SIGIL_HOME"
  fi

  log "Sigil home ready at $SIGIL_HOME"
}

# === Create Symlinks ===
create_symlinks() {
  step "Creating symlinks..."

  # Create .claude directories if needed
  mkdir -p .claude/skills
  mkdir -p .claude/commands

  # Symlink all sigil-* skills
  local skill_count=0
  for skill in "$SIGIL_HOME/.claude/skills/sigil-"*; do
    if [[ -d "$skill" ]]; then
      local skill_name=$(basename "$skill")
      # Remove existing symlink or directory
      rm -rf ".claude/skills/$skill_name"
      ln -sf "$skill" ".claude/skills/$skill_name"
      ((skill_count++))
    fi
  done
  log "Linked $skill_count skills"

  # Symlink commands
  local cmd_count=0
  for cmd in setup envision codify craft approve inherit update; do
    if [[ -f "$SIGIL_HOME/.claude/commands/${cmd}.md" ]]; then
      rm -f ".claude/commands/${cmd}.md"
      ln -sf "$SIGIL_HOME/.claude/commands/${cmd}.md" ".claude/commands/${cmd}.md"
      ((cmd_count++))
    fi
  done
  log "Linked $cmd_count commands"

  # Symlink scripts
  mkdir -p .claude/scripts
  for script in "$SIGIL_HOME/.claude/scripts/"*.sh; do
    if [[ -f "$script" ]]; then
      local script_name=$(basename "$script")
      # Don't overwrite mount script
      if [[ "$script_name" != "mount-sigil.sh" ]]; then
        rm -f ".claude/scripts/$script_name"
        ln -sf "$script" ".claude/scripts/$script_name"
      fi
    fi
  done
  log "Linked scripts"
}

# === Create Version File ===
create_version_file() {
  step "Creating version manifest..."

  local sigil_version="2.0.0"
  if [[ -f "$SIGIL_HOME/VERSION" ]]; then
    sigil_version=$(cat "$SIGIL_HOME/VERSION" | tr -d '[:space:]')
  fi

  cat > "$VERSION_FILE" << EOF
{
  "version": "$sigil_version",
  "mounted_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "sigil_home": "$SIGIL_HOME",
  "branch": "$SIGIL_BRANCH"
}
EOF

  log "Version manifest created"
}

# === Main ===
main() {
  echo ""
  log "======================================================================="
  log "  Sigil Framework Mount v2.0.0"
  log "  Design Context for AI-Assisted Development"
  log "======================================================================="
  log "  Branch: $SIGIL_BRANCH"
  echo ""

  preflight
  setup_sigil_home
  create_symlinks
  create_version_file

  echo ""
  log "======================================================================="
  log "  Sigil Successfully Mounted!"
  log "======================================================================="
  echo ""
  info "Next steps:"
  info "  1. Run 'claude' to start Claude Code"
  info "  2. Issue '/setup' to initialize Sigil"
  info "  3. Then '/envision' or '/inherit' to capture design context"
  echo ""
  info "Framework structure:"
  info "  .claude/skills/sigil-*  -> Symlinked from $SIGIL_HOME"
  info "  .claude/commands/       -> Symlinked commands"
  info "  sigil-mark/             -> Your design context (created by /setup)"
  info "  .sigilrc.yaml           -> Zone configuration (created by /setup)"
  echo ""
  info "Philosophy: Make the right path easy. Make the wrong path visible."
  echo ""
}

main "$@"
