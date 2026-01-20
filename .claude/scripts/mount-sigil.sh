#!/usr/bin/env bash
# Sigil v13 — Mount Script
# Design Physics + React Implementation Rules
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
SIGIL_VERSION="13.0.0"
AUTO_YES=false
FORCE_GIT=false
CONSTRUCTS_SCRIPT=".claude/scripts/constructs-install.sh"

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
    --git)
      FORCE_GIT=true
      shift
      ;;
    -y|--yes)
      AUTO_YES=true
      shift
      ;;
    -h|--help)
      echo "Usage: mount-sigil.sh [OPTIONS]"
      echo ""
      echo "Mount Sigil v13 — Design Physics for AI Code Generation"
      echo ""
      echo "Installation Priority:"
      echo "  1. Loa Constructs (if API key available and pack published)"
      echo "  2. Git-based installation (fallback)"
      echo ""
      echo "Options:"
      echo "  --branch <name>   Sigil branch to use for git install (default: main)"
      echo "  --home <path>     Sigil home directory (default: ~/.sigil/sigil)"
      echo "  --git             Force git-based installation (skip constructs)"
      echo "  -y, --yes         Auto-confirm updates (for piped installation)"
      echo "  -h, --help        Show this help message"
      echo ""
      echo "What this does:"
      echo "  1. Creates .claude/rules/ with Sigil physics (behavioral, animation, material)"
      echo "  2. Creates .claude/rules/ with React implementation rules (from Vercel Labs)"
      echo "  3. Creates .claude/commands/ with /craft command"
      echo "  4. Creates grimoires/sigil/ with taste.md"
      echo "  5. NEVER touches existing CLAUDE.md in your repo"
      echo ""
      echo "Examples:"
      echo "  curl -fsSL https://raw.githubusercontent.com/0xHoneyJar/sigil/main/.claude/scripts/mount-sigil.sh | bash"
      echo "  curl ... | bash -s -- -y         # Auto-confirm updates"
      echo "  curl ... | bash -s -- --git      # Force git installation"
      echo ""
      echo "To use Loa Constructs:"
      echo "  1. Set LOA_CONSTRUCTS_API_KEY environment variable"
      echo "  2. Or create ~/.loa/credentials.json with {\"api_key\": \"your-key\"}"
      echo "  3. Run: constructs-install.sh pack sigil"
      exit 0
      ;;
    *)
      warn "Unknown option: $1"
      shift
      ;;
  esac
done

# === Get API Key ===
get_api_key() {
  # Check environment variable first
  if [[ -n "${LOA_CONSTRUCTS_API_KEY:-}" ]]; then
    echo "$LOA_CONSTRUCTS_API_KEY"
    return 0
  fi

  # Check credentials file
  local creds_file="${HOME}/.loa/credentials.json"
  if [[ -f "$creds_file" ]]; then
    local key
    key=$(jq -r '.api_key // empty' "$creds_file" 2>/dev/null)
    if [[ -n "$key" ]]; then
      echo "$key"
      return 0
    fi
  fi

  # Alternative credentials location
  local alt_creds="${HOME}/.loa-constructs/credentials.json"
  if [[ -f "$alt_creds" ]]; then
    local key
    key=$(jq -r '.api_key // .apiKey // empty' "$alt_creds" 2>/dev/null)
    if [[ -n "$key" ]]; then
      echo "$key"
      return 0
    fi
  fi

  echo ""
}

# === Try Loa Constructs Installation ===
try_constructs_install() {
  if [[ "$FORCE_GIT" == "true" ]]; then
    info "Skipping Loa Constructs (--git flag)"
    return 1
  fi

  # Check if constructs script exists
  if [[ ! -x "$CONSTRUCTS_SCRIPT" ]]; then
    info "Loa Constructs script not found, using git installation"
    return 1
  fi

  # Check for API key
  local api_key
  api_key=$(get_api_key)
  if [[ -z "$api_key" ]]; then
    info "No Loa Constructs API key found, using git installation"
    info "  To use constructs: Set LOA_CONSTRUCTS_API_KEY or run /skill-login"
    return 1
  fi

  step "Attempting Loa Constructs installation..."

  # Try to install via constructs
  if LOA_CONSTRUCTS_API_KEY="$api_key" "$CONSTRUCTS_SCRIPT" pack sigil 2>/dev/null; then
    log "Sigil installed via Loa Constructs!"
    init_state_zone_only
    return 0
  else
    warn "Constructs installation failed, falling back to git"
    return 1
  fi
}

# === Initialize State Zone Only (for constructs install) ===
init_state_zone_only() {
  step "Initializing State Zone..."

  mkdir -p grimoires/sigil/{context,moodboard}

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
}

# === Pre-flight Checks ===
preflight() {
  log "Running pre-flight checks..."

  if ! git rev-parse --git-dir > /dev/null 2>&1; then
    err "Not a git repository. Initialize with 'git init' first."
  fi

  # Check for constructs-based installation first
  if [[ -d ".claude/constructs/packs/sigil" ]]; then
    local existing=$(jq -r '.version // "unknown"' .claude/constructs/packs/sigil/manifest.json 2>/dev/null || echo "unknown")
    log "Sigil already installed via Loa Constructs (v$existing)"
    info "To update: constructs-install.sh pack sigil"
    exit 0
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

  # Copy all rule files (physics + React implementation)
  if [[ -d "$SIGIL_HOME/.claude/rules" ]]; then
    local physics_count=0
    local react_count=0
    for rule_file in "$SIGIL_HOME/.claude/rules"/*.md; do
      if [[ -f "$rule_file" ]]; then
        local filename=$(basename "$rule_file")
        cp "$rule_file" ".claude/rules/$filename"
        # Count by category
        if [[ "$filename" =~ ^[0-9]{2}-sigil ]] || [[ "$filename" =~ ^0[0-8]- ]]; then
          physics_count=$((physics_count + 1))
        elif [[ "$filename" =~ ^1[0-6]-react ]]; then
          react_count=$((react_count + 1))
        fi
      fi
    done
    log "Installed $physics_count physics rules (00-08)"
    log "Installed $react_count React implementation rules (10-16)"
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

# === Install Commands ===
install_commands() {
  step "Installing commands..."

  mkdir -p .claude/commands

  # Install all Sigil commands
  for cmd_file in "$SIGIL_HOME/.claude/commands"/*.md; do
    if [[ -f "$cmd_file" ]]; then
      local filename=$(basename "$cmd_file")
      cp "$cmd_file" ".claude/commands/$filename"
      local cmd_name="${filename%.md}"
      log "  Installed /$cmd_name command"
    fi
  done
}

# === Install Scripts ===
install_scripts() {
  step "Installing helper scripts..."

  mkdir -p .claude/scripts

  # Install Sigil-specific scripts (agent-browser, sigil-* utilities)
  local script_count=0
  for script_file in "$SIGIL_HOME/.claude/scripts"/agent-browser*.sh \
                     "$SIGIL_HOME/.claude/scripts"/check-agent-browser.sh \
                     "$SIGIL_HOME/.claude/scripts"/sigil-*.sh; do
    if [[ -f "$script_file" ]]; then
      local filename=$(basename "$script_file")
      cp "$script_file" ".claude/scripts/$filename"
      chmod +x ".claude/scripts/$filename"
      script_count=$((script_count + 1))
    fi
  done

  if [[ $script_count -gt 0 ]]; then
    log "Installed $script_count helper scripts"
  fi
}

# === Install Protocols ===
install_protocols() {
  step "Installing protocols..."

  mkdir -p .claude/protocols

  # Install Sigil-specific protocols
  local protocol_count=0
  for protocol_file in "$SIGIL_HOME/.claude/protocols"/browser-automation.md; do
    if [[ -f "$protocol_file" ]]; then
      local filename=$(basename "$protocol_file")
      cp "$protocol_file" ".claude/protocols/$filename"
      protocol_count=$((protocol_count + 1))
    fi
  done

  if [[ $protocol_count -gt 0 ]]; then
    log "Installed $protocol_count protocols"
  fi
}

# === Install Skills ===
install_skills() {
  step "Installing skills..."

  mkdir -p .claude/skills

  # Install all skill directories (exclude symlinks to avoid cycles)
  if [[ -d "$SIGIL_HOME/.claude/skills" ]]; then
    local skill_count=0
    for skill_dir in "$SIGIL_HOME/.claude/skills"/*/; do
      if [[ -d "$skill_dir" && ! -L "$skill_dir" ]]; then
        local dirname=$(basename "$skill_dir")
        # Use rsync to safely copy, excluding symlinks
        if command -v rsync >/dev/null 2>&1; then
          rsync -a --exclude='*.symlink' --no-links "$skill_dir" ".claude/skills/"
        else
          # Fallback: cp without following symlinks
          cp -RP "$skill_dir" ".claude/skills/$dirname"
        fi
        skill_count=$((skill_count + 1))
      fi
    done
    log "Installed $skill_count skills"
  else
    warn "No .claude/skills/ found in Sigil home"
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
  "layers": {
    "physics": ["behavioral", "animation", "material"],
    "implementation": ["async", "bundle", "rendering", "rerender", "server", "js"]
  },
  "note": "Sigil uses .claude/rules/ - does not modify root CLAUDE.md"
}
EOF

  log "Version manifest created"
}

# === Main ===
main() {
  echo ""
  log "======================================================================="
  log "  Sigil v13.0.0"
  log "  Design Physics + React Implementation Rules"
  log "======================================================================="
  if [[ "$FORCE_GIT" == "true" ]]; then
    log "  Mode: Git-based installation (forced)"
  else
    log "  Mode: Loa Constructs preferred, git fallback"
  fi
  log "  Branch: $SIGIL_BRANCH"
  echo ""

  preflight

  # Try Loa Constructs first (preferred path)
  if try_constructs_install; then
    echo ""
    log "======================================================================="
    log "  Sigil Successfully Installed via Loa Constructs!"
    log "======================================================================="
    echo ""
    info "What was installed:"
    info "  .claude/constructs/packs/sigil/ -> Sigil pack from registry"
    info "  .claude/commands/               -> Symlinked from pack"
    info "  .claude/constructs/skills/sigil/ -> Symlinked from pack"
    info "  grimoires/sigil/taste.md        -> Taste accumulation"
    echo ""
    info "Commands:"
    info "  /craft \"claim button\"         -> Full physics (behavioral + animation + material)"
    info "  /style \"glassmorphism card\"   -> Material physics only"
    info "  /animate \"bouncy modal\"       -> Animation physics only"
    info "  /behavior \"optimistic save\"   -> Behavioral physics only"
    echo ""
    info "Updates:"
    info "  constructs-install.sh pack sigil -> Update to latest version"
    echo ""
    info "Sigil learns from your corrections. Use it, and it becomes yours."
    echo ""
    exit 0
  fi

  # Fallback to git-based installation
  log "Using git-based installation..."
  setup_sigil_home
  install_rules
  install_commands
  install_scripts
  install_protocols
  install_skills
  install_grimoire
  create_version_file

  echo ""
  log "======================================================================="
  log "  Sigil Successfully Mounted! (git-based)"
  log "======================================================================="
  echo ""
  info "What was installed:"
  info "  .claude/rules/00-08-sigil-*.md -> Physics (behavioral, animation, material)"
  info "  .claude/rules/10-16-react-*.md -> React implementation (Vercel best practices)"
  info "  .claude/commands/              -> /craft, /ward, /style, /animate, /behavior"
  info "  .claude/scripts/               -> Helper scripts (agent-browser, utilities)"
  info "  .claude/protocols/             -> Usage protocols (browser-automation)"
  info "  .claude/skills/                -> Skill definitions for Claude Code"
  info "  grimoires/sigil/taste.md       -> Taste accumulation"
  info "  .sigil-version.json            -> Version tracking"
  echo ""
  info "What was NOT touched:"
  info "  CLAUDE.md                      -> Your existing file is preserved!"
  echo ""
  info "Commands:"
  info "  /craft \"claim button\"         -> Full physics (behavioral + animation + material)"
  info "  /style \"glassmorphism card\"   -> Material physics only"
  info "  /animate \"bouncy modal\"       -> Animation physics only"
  info "  /behavior \"optimistic save\"   -> Behavioral physics only"
  echo ""
  info "Physics + Implementation:"
  info "  Sigil detects effect -> applies physics -> uses React best practices"
  info "  45 Vercel Labs rules ensure correct React patterns automatically"
  echo ""
  info "Upgrade to Loa Constructs:"
  info "  1. Set LOA_CONSTRUCTS_API_KEY or run /skill-login"
  info "  2. Run: constructs-install.sh pack sigil"
  echo ""
  info "Sigil learns from your corrections. Use it, and it becomes yours."
  echo ""
}

main "$@"

