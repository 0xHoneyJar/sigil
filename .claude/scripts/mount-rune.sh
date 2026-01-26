#!/usr/bin/env bash
# Rune — Mount Script
# Design Physics for AI-Generated UI
#
# Uses .claude/rules/ and .claude/skills/ (Claude Code native discovery)
set -euo pipefail

# === Colors ===
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

log() { echo -e "${GREEN}[rune]${NC} $*"; }
warn() { echo -e "${YELLOW}[rune]${NC} $*"; }
err() { echo -e "${RED}[rune]${NC} ERROR: $*" >&2; exit 1; }
info() { echo -e "${CYAN}[rune]${NC} $*"; }
step() { echo -e "${BLUE}[rune]${NC} -> $*"; }

# === Configuration ===
RUNE_HOME="${RUNE_HOME:-$HOME/.rune}"
RUNE_REPO="${RUNE_REPO:-https://github.com/0xHoneyJar/rune.git}"
RUNE_BRANCH="${RUNE_BRANCH:-main}"
VERSION_FILE=".rune-version.json"
RUNE_VERSION="1.1.0"
AUTO_YES=false
MINIMAL=false

# === Argument Parsing ===
while [[ $# -gt 0 ]]; do
  case $1 in
    --branch)
      RUNE_BRANCH="$2"
      shift 2
      ;;
    --home)
      RUNE_HOME="$2"
      shift 2
      ;;
    --minimal)
      MINIMAL=true
      shift
      ;;
    -y|--yes)
      AUTO_YES=true
      shift
      ;;
    -h|--help)
      cat << 'HELP'
Usage: mount-rune.sh [OPTIONS]

Mount Rune — Design Physics for AI-Generated UI

Options:
  --branch <name>   Rune branch to use (default: main)
  --home <path>     Rune home directory (default: ~/.rune)
  --minimal         Install only physics rules (no skills/hooks)
  -y, --yes         Auto-confirm updates
  -h, --help        Show this help message

What this installs:

  .claude/rules/
    glyph/    (21 files) — Craft: UI generation with physics
    sigil/    (4 files)  — Taste: preference capture
    rigor/    (3 files)  — Correctness: web3 safety
    wyrd/     (11 files) — Learning: feedback loop

  .claude/skills/
    glyph/              — /glyph command (craft)
    sigil/              — /sigil command (taste)
    rigor/              — /rigor command (correctness)
    wyrd/               — /wyrd command (learning)
    lore/               — /lore command (knowledge)
    validating/         — /validate command
    physics-reference/  — Reference skill
    patterns-reference/ — Reference skill

  grimoires/rune/
    taste.md   — Accumulated preferences
    wyrd.md    — Learning state

Commands after install:
  /glyph "claim button"  — Generate UI with correct physics
  /sigil "insight"       — Record taste preference
  /rigor file.tsx        — Validate web3 safety
  /wyrd                  — Check learning state

Examples:
  curl -fsSL https://raw.githubusercontent.com/0xHoneyJar/rune/main/.claude/scripts/mount-rune.sh | bash
  curl ... | bash -s -- -y              # Auto-confirm
  curl ... | bash -s -- --minimal       # Physics rules only

HELP
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
    warn "Rune is already mounted (version: $existing)"
    if [[ "$AUTO_YES" == "true" ]]; then
      log "Auto-confirming update (-y flag)"
    else
      read -p "Update Rune? This will refresh rules and skills. (y/N) " -n 1 -r </dev/tty
      echo ""
      [[ $REPLY =~ ^[Yy]$ ]] || { log "Aborted."; exit 0; }
    fi
  fi

  if [[ -f "CLAUDE.md" ]]; then
    info "Found existing CLAUDE.md — Rune will NOT modify it"
    info "Rune instructions go in .claude/rules/ instead"
  fi

  command -v git >/dev/null || err "git is required"

  log "Pre-flight checks passed"
}

# === Cleanup Deprecated Artifacts ===
cleanup_deprecated() {
  step "Cleaning up deprecated artifacts..."

  local cleaned=0

  # Remove old Rune command files (now handled by skills)
  local deprecated_commands=(glyph sigil rigor enhance)
  for cmd in "${deprecated_commands[@]}"; do
    if [[ -f ".claude/commands/${cmd}.md" ]]; then
      rm -f ".claude/commands/${cmd}.md"
      log "  Removed deprecated: .claude/commands/${cmd}.md"
      cleaned=$((cleaned + 1))
    fi
  done

  # Remove old skill directories (renamed to construct names)
  local deprecated_skills=(crafting observing enforcing fating enhancing enhance)
  for skill in "${deprecated_skills[@]}"; do
    if [[ -d ".claude/skills/${skill}" ]]; then
      rm -rf ".claude/skills/${skill}"
      log "  Removed deprecated: .claude/skills/${skill}/"
      cleaned=$((cleaned + 1))
    fi
  done

  if [[ $cleaned -gt 0 ]]; then
    log "Cleaned up $cleaned deprecated artifacts"
  else
    log "No deprecated artifacts found"
  fi
}

# === Clone or Update Rune Home ===
setup_rune_home() {
  step "Setting up Rune home..."

  if [[ -d "$RUNE_HOME" ]]; then
    log "Updating existing Rune installation..."
    cd "$RUNE_HOME"
    git fetch origin "$RUNE_BRANCH" --quiet
    git checkout "$RUNE_BRANCH" --quiet 2>/dev/null || git checkout -b "$RUNE_BRANCH" "origin/$RUNE_BRANCH" --quiet
    git reset --hard "origin/$RUNE_BRANCH" --quiet
    log "Reset to origin/$RUNE_BRANCH"
    cd - > /dev/null
  else
    log "Installing Rune..."
    mkdir -p "$(dirname "$RUNE_HOME")"
    git clone --branch "$RUNE_BRANCH" --depth 1 "$RUNE_REPO" "$RUNE_HOME"
  fi

  log "Rune home ready at $RUNE_HOME"
}

# === Install Rules ===
install_rules() {
  step "Installing Rune rules to .claude/rules/..."

  mkdir -p .claude/rules

  local total=0

  # Install each rule directory
  for rule_dir in glyph sigil rigor wyrd; do
    if [[ -d "$RUNE_HOME/.claude/rules/$rule_dir" ]]; then
      mkdir -p ".claude/rules/$rule_dir"
      local count=0
      for rule_file in "$RUNE_HOME/.claude/rules/$rule_dir"/*.md; do
        if [[ -f "$rule_file" ]]; then
          cp "$rule_file" ".claude/rules/$rule_dir/"
          count=$((count + 1))
        fi
      done
      log "  $rule_dir/ — $count files"
      total=$((total + count))
    fi
  done

  log "Installed $total rule files"
}

# === Install Skills ===
install_skills() {
  if [[ "$MINIMAL" == "true" ]]; then
    info "Skipping skills (--minimal flag)"
    return 0
  fi

  step "Installing Rune skills to .claude/skills/..."

  mkdir -p .claude/skills

  # Rune-specific skills
  local rune_skills=(
    "glyph"
    "sigil"
    "rigor"
    "wyrd"
    "lore"
    "validating"
    "physics-reference"
    "patterns-reference"
  )

  local count=0
  for skill in "${rune_skills[@]}"; do
    if [[ -d "$RUNE_HOME/.claude/skills/$skill" ]]; then
      cp -r "$RUNE_HOME/.claude/skills/$skill" ".claude/skills/"
      count=$((count + 1))
    fi
  done

  log "Installed $count skills"
}

# === Install Hooks ===
install_hooks() {
  if [[ "$MINIMAL" == "true" ]]; then
    info "Skipping hooks (--minimal flag)"
    return 0
  fi

  step "Installing Rune hooks..."

  if [[ -d "$RUNE_HOME/.claude/hooks" ]]; then
    mkdir -p .claude/hooks
    local count=0
    for hook_file in "$RUNE_HOME/.claude/hooks"/*.md; do
      if [[ -f "$hook_file" ]]; then
        cp "$hook_file" ".claude/hooks/"
        count=$((count + 1))
      fi
    done
    if [[ $count -gt 0 ]]; then
      log "Installed $count hooks"
    fi
  fi
}

# === Install State Directory ===
install_state() {
  step "Initializing grimoires/rune/..."

  mkdir -p grimoires/rune

  # Create taste.md if not exists
  if [[ ! -f "grimoires/rune/taste.md" ]]; then
    cat > "grimoires/rune/taste.md" << 'EOF'
# Taste

Human preferences for design physics.

---

EOF
    log "  Created taste.md"
  else
    log "  taste.md already exists (preserved)"
  fi

  # Create wyrd.md if not exists
  if [[ ! -f "grimoires/rune/wyrd.md" ]]; then
    cat > "grimoires/rune/wyrd.md" << 'EOF'
# Wyrd State

## Confidence Calibration

| Effect | Base | Taste Adj | Rejection Adj | Final | Last Updated |
|--------|------|-----------|---------------|-------|--------------|
| Financial | 0.90 | +0.00 | -0.00 | 0.90 | — |
| Destructive | 0.90 | +0.00 | -0.00 | 0.90 | — |
| Standard | 0.85 | +0.00 | -0.00 | 0.85 | — |
| Local | 0.95 | +0.00 | -0.00 | 0.95 | — |

## Metrics

- **Total Hypotheses**: 0
- **Accepted**: 0
- **Rejected**: 0
- **Patterns Detected**: 0

EOF
    log "  Created wyrd.md"
  else
    log "  wyrd.md already exists (preserved)"
  fi
}

# === Create Version File ===
create_version_file() {
  step "Creating version manifest..."

  # Build skills list based on minimal flag
  local skills_json
  if [[ "$MINIMAL" == "true" ]]; then
    skills_json='[]'
  else
    skills_json='["glyph", "sigil", "rigor", "wyrd", "lore", "validating", "physics-reference", "patterns-reference"]'
  fi

  cat > "$VERSION_FILE" << EOF
{
  "version": "$RUNE_VERSION",
  "mounted_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "rune_home": "$RUNE_HOME",
  "branch": "$RUNE_BRANCH",
  "constructs": {
    "sigil": "Taste (WHY)",
    "glyph": "Craft (HOW)",
    "rigor": "Correctness (WHAT)",
    "wyrd": "Learning (FEEDBACK)"
  },
  "skills_installed": $skills_json,
  "migration": "1.0.0 -> 1.1.0: Commands merged into skills"
}
EOF

  log "Version manifest created"
}

# === Print Physics Table ===
print_physics_table() {
  echo ""
  echo -e "${MAGENTA}Physics Table:${NC}"
  echo "  ┌────────────┬─────────────┬────────┬──────────────┐"
  echo "  │ Effect     │ Sync        │ Timing │ Confirmation │"
  echo "  ├────────────┼─────────────┼────────┼──────────────┤"
  echo "  │ Financial  │ Pessimistic │ 800ms  │ Required     │"
  echo "  │ Destructive│ Pessimistic │ 600ms  │ Required     │"
  echo "  │ Soft Delete│ Optimistic  │ 200ms  │ Toast + Undo │"
  echo "  │ Standard   │ Optimistic  │ 200ms  │ None         │"
  echo "  │ Navigation │ Immediate   │ 150ms  │ None         │"
  echo "  │ Local State│ Immediate   │ 100ms  │ None         │"
  echo "  └────────────┴─────────────┴────────┴──────────────┘"
}

# === Main ===
main() {
  echo ""
  echo -e "${MAGENTA}╔═══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${MAGENTA}║${NC}  ${GREEN}Rune${NC} — Design Physics for AI-Generated UI                    ${MAGENTA}║${NC}"
  echo -e "${MAGENTA}╚═══════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  log "Branch: $RUNE_BRANCH"
  if [[ "$MINIMAL" == "true" ]]; then
    log "Mode: Minimal (rules only)"
  fi
  echo ""

  preflight
  setup_rune_home
  cleanup_deprecated
  install_rules
  install_skills
  install_hooks
  install_state
  create_version_file

  echo ""
  echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║${NC}  ${GREEN}✓ Rune Successfully Mounted!${NC}                                  ${GREEN}║${NC}"
  echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
  echo ""

  info "What was installed:"
  info "  .claude/rules/glyph/   — Craft (21 rules)"
  info "  .claude/rules/sigil/   — Taste (4 rules)"
  info "  .claude/rules/rigor/   — Correctness (3 rules)"
  info "  .claude/rules/wyrd/    — Learning (11 rules)"
  if [[ "$MINIMAL" != "true" ]]; then
    info "  .claude/skills/        — 8 skills"
    info "  .claude/hooks/         — Workflow hooks"
  fi
  info "  grimoires/rune/        — State directory"
  info "  .rune-version.json     — Version tracking"
  echo ""

  info "What was NOT touched:"
  info "  CLAUDE.md              — Your existing file is preserved"
  echo ""

  print_physics_table
  echo ""

  info "Commands:"
  info "  /glyph \"claim button\"  — Generate UI with correct physics"
  info "  /sigil \"insight\"       — Record taste preference"
  info "  /rigor file.tsx        — Validate web3 safety"
  info "  /wyrd                  — Check learning state"
  info "  /lore                  — Slot external knowledge"
  echo ""

  info "Effect detection:"
  info "  \"claim\", \"withdraw\"    → Financial (pessimistic, 800ms)"
  info "  \"delete\", \"remove\"     → Destructive (pessimistic, 600ms)"
  info "  \"save\", \"update\"       → Standard (optimistic, 200ms)"
  info "  \"toggle\", \"theme\"      → Local (immediate, 100ms)"
  echo ""

  log "Rune learns from your corrections. Use it, and it becomes yours."
  echo ""
}

main "$@"
