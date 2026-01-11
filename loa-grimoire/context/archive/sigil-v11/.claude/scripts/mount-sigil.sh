#!/bin/bash
# Sigil v11: Soul Engine
# One-liner install: curl -fsSL https://raw.githubusercontent.com/[org]/sigil/main/.claude/scripts/mount-sigil.sh | bash

set -e

SIGIL_VERSION="11.0.0"
SIGIL_HOME="${SIGIL_HOME:-$HOME/.sigil/sigil}"
SIGIL_REPO="${SIGIL_REPO:-https://github.com/[org]/sigil.git}"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    SIGIL SOUL ENGINE v11                      ║"
echo "║           'You are an apprentice in 2007.'                    ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Clone or update Sigil
# ─────────────────────────────────────────────────────────────────────────────

if [[ -d "$SIGIL_HOME" ]]; then
    echo "→ Updating existing Sigil installation..."
    cd "$SIGIL_HOME"
    git fetch origin main --quiet
    git reset --hard origin/main --quiet
    echo "  ✓ Updated to latest"
else
    echo "→ Installing Sigil..."
    mkdir -p "$(dirname "$SIGIL_HOME")"
    git clone --depth 1 "$SIGIL_REPO" "$SIGIL_HOME" --quiet
    echo "  ✓ Installed to $SIGIL_HOME"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Create .claude directories
# ─────────────────────────────────────────────────────────────────────────────

echo "→ Setting up .claude directories..."
mkdir -p .claude/commands
mkdir -p .claude/skills
mkdir -p .claude/scripts
mkdir -p .claude/protocols

# ─────────────────────────────────────────────────────────────────────────────
# Symlink commands
# ─────────────────────────────────────────────────────────────────────────────

echo "→ Symlinking commands..."
for cmd in "$SIGIL_HOME/.claude/commands/"*.md; do
    if [[ -f "$cmd" ]]; then
        name=$(basename "$cmd")
        ln -sf "$cmd" ".claude/commands/$name"
        echo "  ✓ $name"
    fi
done

# ─────────────────────────────────────────────────────────────────────────────
# Symlink skills (8 agents)
# ─────────────────────────────────────────────────────────────────────────────

echo "→ Symlinking skills (8 agents)..."
for skill in "$SIGIL_HOME/.claude/skills/"*/; do
    if [[ -d "$skill" ]]; then
        name=$(basename "$skill")
        ln -sf "$skill" ".claude/skills/$name"
        echo "  ✓ $name"
    fi
done

# ─────────────────────────────────────────────────────────────────────────────
# Symlink scripts
# ─────────────────────────────────────────────────────────────────────────────

echo "→ Symlinking scripts..."
for script in "$SIGIL_HOME/.claude/scripts/"*.sh; do
    if [[ -f "$script" ]]; then
        name=$(basename "$script")
        ln -sf "$script" ".claude/scripts/$name"
    fi
done

# ─────────────────────────────────────────────────────────────────────────────
# Symlink protocols
# ─────────────────────────────────────────────────────────────────────────────

echo "→ Symlinking protocols..."
for protocol in "$SIGIL_HOME/.claude/protocols/"*.md; do
    if [[ -f "$protocol" ]]; then
        name=$(basename "$protocol")
        ln -sf "$protocol" ".claude/protocols/$name"
    fi
done

# ─────────────────────────────────────────────────────────────────────────────
# Create version manifest
# ─────────────────────────────────────────────────────────────────────────────

echo "→ Creating version manifest..."
cat > .sigil-version.json << EOF
{
  "version": "$SIGIL_VERSION",
  "mounted_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "sigil_home": "$SIGIL_HOME"
}
EOF

# ─────────────────────────────────────────────────────────────────────────────
# Done
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    SIGIL MOUNTED ✓                            ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║                                                               ║"
echo "║  Next steps:                                                  ║"
echo "║                                                               ║"
echo "║    1. Start Claude Code:  claude                              ║"
echo "║    2. Run setup:          /setup                              ║"
echo "║    3. Capture soul:       /envision                           ║"
echo "║    4. Define materials:   /codify                             ║"
echo "║    5. Generate with soul: /craft                              ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
