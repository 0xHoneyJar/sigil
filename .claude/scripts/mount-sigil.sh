#!/usr/bin/env bash
# Sigil v12 — Mount Script
# Design Physics for AI Code Generation
#
# Key principle: NEVER override existing CLAUDE.md
# Uses .claude/rules/ for framework instructions (Claude Code native discovery)
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
SIGIL_REPO="${SIGIL_REPO:-https://github.com/0xHoneyJar/sigil.git}"
SIGIL_BRANCH="${SIGIL_BRANCH:-main}"
VERSION_FILE=".sigil-version.json"
SIGIL_VERSION="12.5.0"
AUTO_YES=false

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
    -y|--yes)
      AUTO_YES=true
      shift
      ;;
    -h|--help)
      echo "Usage: mount-sigil.sh [OPTIONS]"
      echo ""
      echo "Mount Sigil v12 — Design Physics for AI Code Generation"
      echo ""
      echo "Options:"
      echo "  --branch <name>   Sigil branch to use (default: main)"
      echo "  --home <path>     Sigil home directory (default: ~/.sigil/sigil)"
      echo "  -y, --yes         Auto-confirm updates (for piped installation)"
      echo "  -h, --help        Show this help message"
      echo ""
      echo "What this does:"
      echo "  1. Creates .claude/rules/ with Sigil physics (behavioral, animation, material)"
      echo "  2. Creates .claude/commands/ with /craft command"
      echo "  3. Creates grimoires/sigil/ with taste.md"
      echo "  4. Creates examples/ with reference components"
      echo "  5. NEVER touches existing CLAUDE.md in your repo"
      echo ""
      echo "Examples:"
      echo "  curl -fsSL https://raw.githubusercontent.com/0xHoneyJar/sigil/main/.claude/scripts/mount-sigil.sh | bash"
      echo "  curl ... | bash -s -- -y    # Auto-confirm updates"
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
    if [[ "$AUTO_YES" == "true" ]]; then
      log "Auto-confirming update (-y flag)"
    else
      read -p "Update Sigil? This will refresh .claude/rules/ and skills. (y/N) " -n 1 -r </dev/tty
      echo ""
      [[ $REPLY =~ ^[Yy]$ ]] || { log "Aborted."; exit 0; }
    fi
  fi

  # Check for existing CLAUDE.md (info only, we don't touch it)
  if [[ -f "CLAUDE.md" ]]; then
    info "Found existing CLAUDE.md — Sigil will NOT modify it"
    info "Sigil instructions will go in .claude/rules/ instead"
  fi

  command -v git >/dev/null || err "git is required"

  log "Pre-flight checks passed"
}

# === Clone or Update Sigil Home ===
setup_sigil_home() {
  step "Setting up Sigil home..."

  if [[ -d "$SIGIL_HOME" ]]; then
    log "Updating existing Sigil installation..."
    cd "$SIGIL_HOME"
    git fetch origin "$SIGIL_BRANCH" --quiet
    git checkout "$SIGIL_BRANCH" --quiet 2>/dev/null || git checkout -b "$SIGIL_BRANCH" "origin/$SIGIL_BRANCH" --quiet
    git reset --hard "origin/$SIGIL_BRANCH" --quiet
    log "Reset to origin/$SIGIL_BRANCH"
    cd - > /dev/null
  else
    log "Installing Sigil..."
    mkdir -p "$(dirname "$SIGIL_HOME")"
    git clone --branch "$SIGIL_BRANCH" "$SIGIL_REPO" "$SIGIL_HOME"
  fi

  log "Sigil home ready at $SIGIL_HOME"
}

# === Install Rules ===
install_rules() {
  step "Installing Sigil rules to .claude/rules/..."

  mkdir -p .claude/rules

  # Copy Sigil rule files (numbered 00-07 and sigil-*.md)
  if [[ -d "$SIGIL_HOME/.claude/rules" ]]; then
    local count=0
    for rule_file in "$SIGIL_HOME/.claude/rules"/*.md; do
      if [[ -f "$rule_file" ]]; then
        local filename=$(basename "$rule_file")
        # Only copy Sigil rules (numbered or sigil- prefixed)
        if [[ "$filename" =~ ^[0-9]{2}- ]] || [[ "$filename" =~ ^sigil- ]]; then
          cp "$rule_file" ".claude/rules/$filename"
          log "  Installed $filename"
          count=$((count + 1))
        fi
      fi
    done
    log "Installed $count rule files"
  else
    err "No .claude/rules/ found in Sigil home"
  fi
}

# === Install Grimoire ===
install_grimoire() {
  step "Installing grimoires/sigil/..."

  mkdir -p grimoires/sigil

  # Create empty taste.md for accumulation
  if [[ ! -f "grimoires/sigil/taste.md" ]]; then
    cat > "grimoires/sigil/taste.md" << 'EOF'
# Sigil Taste Log

Accumulated preferences across physics layers.

---

EOF
    log "  Created taste.md"
  else
    log "  taste.md already exists (preserved)"
  fi

  # Copy constitution if exists
  if [[ -f "$SIGIL_HOME/grimoires/sigil/constitution.yaml" ]]; then
    cp "$SIGIL_HOME/grimoires/sigil/constitution.yaml" "grimoires/sigil/constitution.yaml"
    log "  Installed constitution.yaml"
  fi
}

# === Install Examples ===
install_examples() {
  step "Installing example components..."

  if [[ -d "$SIGIL_HOME/examples" ]]; then
    mkdir -p examples
    cp -r "$SIGIL_HOME/examples/"* examples/ 2>/dev/null || true
    log "  Installed examples/"
  else
    info "No examples directory in Sigil home (optional)"
  fi
}

# === Install Commands ===
install_commands() {
  step "Installing commands..."

  mkdir -p .claude/commands

  if [[ -f "$SIGIL_HOME/.claude/commands/craft.md" ]]; then
    cp "$SIGIL_HOME/.claude/commands/craft.md" ".claude/commands/craft.md"
    log "  Installed /craft command"
  fi

  if [[ -f "$SIGIL_HOME/.claude/commands/garden.md" ]]; then
    cp "$SIGIL_HOME/.claude/commands/garden.md" ".claude/commands/garden.md"
    log "  Installed /garden command"
  fi
}

# === Create Version File ===
create_version_file() {
  step "Creating version manifest..."

  cat > "$VERSION_FILE" << EOF
{
  "version": "$SIGIL_VERSION",
  "mounted_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "sigil_home": "$SIGIL_HOME",
  "branch": "$SIGIL_BRANCH",
  "physics": ["behavioral", "animation", "material"],
  "note": "Sigil uses .claude/rules/ - does not modify root CLAUDE.md"
}
EOF

  log "Version manifest created"
}

# === Main ===
main() {
  echo ""
  log "======================================================================="
  log "  Sigil v12.5.0"
  log "  Design Physics for AI Code Generation"
  log "======================================================================="
  log "  Branch: $SIGIL_BRANCH"
  echo ""

  preflight
  setup_sigil_home
  install_rules
  install_commands
  install_grimoire
  install_examples
  create_version_file

  echo ""
  log "======================================================================="
  log "  Sigil Successfully Mounted!"
  log "======================================================================="
  echo ""
  info "What was installed:"
  info "  .claude/rules/00-07-sigil-*.md -> Physics (behavioral, animation, material)"
  info "  .claude/commands/craft.md      -> /craft command"
  info "  grimoires/sigil/taste.md       -> Taste accumulation"
  info "  examples/                      -> Reference components"
  info "  .sigil-version.json            -> Version tracking"
  echo ""
  info "What was NOT touched:"
  info "  CLAUDE.md                      -> Your existing file is preserved!"
  echo ""
  info "Usage:"
  info "  /craft \"claim button\"   -> Financial: 800ms pessimistic, confirmation"
  info "  /craft \"like button\"    -> Standard: 200ms optimistic, spring"
  info "  /craft \"dark mode toggle\" -> Local: 100ms immediate"
  echo ""
  info "Sigil learns from your corrections. Use it, and it becomes yours."
  echo ""
}

main "$@"
