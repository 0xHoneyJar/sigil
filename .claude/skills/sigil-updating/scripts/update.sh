#!/usr/bin/env bash
# Sigil Update Script
# Usage: update.sh [--check] [--force]
set -e

# === Colors ===
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${GREEN}[sigil]${NC} $*"; }
warn() { echo -e "${YELLOW}[sigil]${NC} $*"; }
info() { echo -e "${CYAN}[sigil]${NC} $*"; }

# === Parse Arguments ===
CHECK_ONLY=false
FORCE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --check) CHECK_ONLY=true; shift ;;
    --force) FORCE=true; shift ;;
    *) shift ;;
  esac
done

# === Check Prerequisites ===
if [[ ! -f ".sigil-version.json" ]]; then
  echo "ERROR: Sigil not mounted. Run mount-sigil.sh first."
  exit 1
fi

# Read current config
if command -v jq &> /dev/null; then
  SIGIL_HOME=$(jq -r '.sigil_home' .sigil-version.json)
  CURRENT_VERSION=$(jq -r '.version' .sigil-version.json)
else
  SIGIL_HOME=$(grep -o '"sigil_home"[[:space:]]*:[[:space:]]*"[^"]*"' .sigil-version.json | cut -d'"' -f4)
  CURRENT_VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' .sigil-version.json | cut -d'"' -f4)
fi

if [[ ! -d "$SIGIL_HOME" ]]; then
  echo "ERROR: Sigil home not found at $SIGIL_HOME"
  exit 1
fi

# === Fetch Remote ===
cd "$SIGIL_HOME"
git fetch origin main --quiet 2>/dev/null || {
  warn "Could not fetch remote. Working offline."
}

# Get versions
LOCAL_VERSION=$(cat VERSION 2>/dev/null || echo "unknown")
REMOTE_VERSION=$(git show origin/main:VERSION 2>/dev/null || echo "$LOCAL_VERSION")

cd - > /dev/null

# === Check Mode ===
if [[ "$CHECK_ONLY" == "true" ]]; then
  echo ""
  log "Sigil Update Check"
  echo ""
  info "Current version: $CURRENT_VERSION"
  info "Local version:   $LOCAL_VERSION"
  info "Remote version:  $REMOTE_VERSION"
  echo ""

  if [[ "$LOCAL_VERSION" != "$REMOTE_VERSION" ]]; then
    log "Status: Update available"
    echo ""
    info "Run '/update' to apply updates."
  else
    log "Status: Up to date"
  fi
  exit 0
fi

# === Apply Updates ===
if [[ "$LOCAL_VERSION" == "$REMOTE_VERSION" ]] && [[ "$FORCE" != "true" ]]; then
  log "Sigil is up to date (version $LOCAL_VERSION)"
  echo ""
  info "Use '--force' to refresh symlinks anyway."
  exit 0
fi

log "Updating Sigil..."

# Pull updates
cd "$SIGIL_HOME"
git pull origin main --quiet 2>/dev/null || warn "Pull failed, using cached version"
NEW_VERSION=$(cat VERSION 2>/dev/null || echo "$LOCAL_VERSION")
cd - > /dev/null

# Refresh symlinks
log "Refreshing symlinks..."

# Skills
skill_count=0
for skill in "$SIGIL_HOME/.claude/skills/sigil-"*; do
  if [[ -d "$skill" ]]; then
    skill_name=$(basename "$skill")
    rm -rf ".claude/skills/$skill_name"
    ln -sf "$skill" ".claude/skills/$skill_name"
    ((skill_count++))
  fi
done

# Commands
cmd_count=0
for cmd in setup envision codify craft approve inherit update; do
  if [[ -f "$SIGIL_HOME/.claude/commands/${cmd}.md" ]]; then
    rm -f ".claude/commands/${cmd}.md"
    ln -sf "$SIGIL_HOME/.claude/commands/${cmd}.md" ".claude/commands/${cmd}.md"
    ((cmd_count++))
  fi
done

# Update version file
if command -v jq &> /dev/null; then
  jq --arg v "$NEW_VERSION" --arg t "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    '.version = $v | .updated_at = $t' .sigil-version.json > .sigil-version.json.tmp
  mv .sigil-version.json.tmp .sigil-version.json
else
  # Simple sed fallback
  sed -i.bak "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" .sigil-version.json
  sed -i.bak "s/\"updated_at\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"updated_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"/" .sigil-version.json
  rm -f .sigil-version.json.bak
fi

echo ""
log "Sigil Updated"
echo ""
info "Previous version: $CURRENT_VERSION"
info "New version:      $NEW_VERSION"
echo ""
info "Refreshed:"
info "  - $skill_count skills"
info "  - $cmd_count commands"
echo ""
info "Your state files are preserved:"
info "  - sigil-mark/moodboard.md"
info "  - sigil-mark/rules.md"
info "  - .sigilrc.yaml"
echo ""
