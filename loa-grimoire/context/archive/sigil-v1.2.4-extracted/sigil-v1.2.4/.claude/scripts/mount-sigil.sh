#!/bin/bash
# Mount Sigil v1.2.4 Framework
# Usage: curl -fsSL https://raw.githubusercontent.com/.../mount-sigil.sh | bash

set -e

SIGIL_VERSION="1.2.4"
SIGIL_HOME="${SIGIL_HOME:-$HOME/.sigil/sigil}"
SIGIL_REPO="${SIGIL_REPO:-https://github.com/zksoju/sigil.git}"

echo "╔═══════════════════════════════════════════╗"
echo "║       Sigil v${SIGIL_VERSION} Installation           ║"
echo "║  \"See the diff. Feel the result.\"         ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# ============================================================================
# Clone or Update Framework
# ============================================================================

if [[ -d "$SIGIL_HOME" ]]; then
  echo "→ Updating existing installation..."
  cd "$SIGIL_HOME"
  git fetch origin main --quiet
  
  LOCAL=$(git rev-parse HEAD)
  REMOTE=$(git rev-parse origin/main)
  
  if [[ "$LOCAL" != "$REMOTE" ]]; then
    git pull origin main --quiet
    echo "  Updated to latest version"
  else
    echo "  Already up to date"
  fi
  cd - > /dev/null
else
  echo "→ Installing Sigil..."
  mkdir -p "$(dirname "$SIGIL_HOME")"
  git clone --quiet "$SIGIL_REPO" "$SIGIL_HOME"
  echo "  Cloned to $SIGIL_HOME"
fi

# ============================================================================
# Create Project Structure
# ============================================================================

echo "→ Setting up project structure..."

# Create .claude directories
mkdir -p .claude/commands
mkdir -p .claude/skills/sigil-core
mkdir -p .claude/scripts

# Create sigil-mark directories
mkdir -p sigil-mark/recipes/decisive
mkdir -p sigil-mark/recipes/machinery
mkdir -p sigil-mark/recipes/glass
mkdir -p sigil-mark/reports

# ============================================================================
# Copy/Symlink Files
# ============================================================================

echo "→ Linking framework files..."

# Copy CLAUDE.md (main prompt)
if [[ -f "$SIGIL_HOME/CLAUDE.md" ]]; then
  cp "$SIGIL_HOME/CLAUDE.md" ./CLAUDE.md
  echo "  Copied CLAUDE.md"
fi

# Symlink or copy skills
if [[ -d "$SIGIL_HOME/.claude/skills/sigil-core" ]]; then
  ln -sf "$SIGIL_HOME/.claude/skills/sigil-core" .claude/skills/
  echo "  Linked skills"
fi

# Symlink or copy commands
for cmd in "$SIGIL_HOME/.claude/commands"/*.md; do
  if [[ -f "$cmd" ]]; then
    ln -sf "$cmd" .claude/commands/
  fi
done
echo "  Linked commands"

# Copy templates if sigil-mark is empty
if [[ ! -f "sigil-mark/recipes/decisive/Button.tsx" ]]; then
  if [[ -d "$SIGIL_HOME/sigil-mark/recipes" ]]; then
    cp -r "$SIGIL_HOME/sigil-mark/recipes/"* sigil-mark/recipes/
    echo "  Copied recipe templates"
  fi
fi

# ============================================================================
# Create Default Config
# ============================================================================

if [[ ! -f ".sigilrc.yaml" ]]; then
  cat > .sigilrc.yaml << 'EOF'
# Sigil Configuration
sigil: "1.2.4"

# Default recipe set
recipes: machinery

# Default sync mode  
sync: client_authoritative

# PR-native refinement
refinement:
  sources:
    - vercel_preview_comments
    - github_pr_comments
  auto_commit: true
  commit_prefix: "refine"

# Workbench
workbench:
  browser:
    provider: claude-mcp
    url: http://localhost:3000
  compare:
    enabled: true
    history: 5

# Component paths
component_paths:
  - "src/components/"
  - "components/"
EOF
  echo "  Created .sigilrc.yaml"
fi

# ============================================================================
# Create Version File
# ============================================================================

cat > .sigil-version.json << EOF
{
  "version": "${SIGIL_VERSION}",
  "mounted_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "sigil_home": "${SIGIL_HOME}"
}
EOF
echo "  Created .sigil-version.json"

# ============================================================================
# Create Marker
# ============================================================================

touch .sigil-setup-complete

# ============================================================================
# Done
# ============================================================================

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║         Sigil installed successfully!     ║"
echo "╚═══════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "  1. Start Claude Code:"
echo "     $ claude"
echo ""
echo "  2. Generate your first component:"
echo "     /craft \"button for checkout\""
echo ""
echo "  3. Open the workbench (optional):"
echo "     $ sigil workbench"
echo ""
echo "  4. For existing codebases:"
echo "     /inherit"
echo ""
