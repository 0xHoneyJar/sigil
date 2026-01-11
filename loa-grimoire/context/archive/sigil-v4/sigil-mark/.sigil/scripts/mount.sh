#!/bin/bash
# Sigil Mount Script
# Usage: ./mount.sh [project-directory]

set -e

SIGIL_VERSION="4.0.0"
PROJECT_DIR="${1:-.}"

echo "🎛️ Sigil v${SIGIL_VERSION} — Design Physics Engine"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check if sigil-mark already exists
if [ -d "${PROJECT_DIR}/sigil-mark" ]; then
    echo "⚠️  sigil-mark/ already exists in ${PROJECT_DIR}"
    echo "   To reinstall, remove it first: rm -rf sigil-mark/"
    exit 1
fi

# Get the directory where this script lives
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SIGIL_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Copy sigil-mark to project
echo "📁 Creating sigil-mark/ in ${PROJECT_DIR}..."
cp -r "${SIGIL_ROOT}/sigil-mark" "${PROJECT_DIR}/"

# Create .claude/commands symlinks
echo "🔗 Creating command symlinks..."
mkdir -p "${PROJECT_DIR}/.claude/commands"

for cmd in envision codify map craft validate garden approve greenlight; do
    ln -sf "../../sigil-mark/.sigil/commands/${cmd}.md" "${PROJECT_DIR}/.claude/commands/${cmd}.md"
done

# Add CLAUDE.md include suggestion
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ Sigil mounted successfully!"
echo ""
echo "📝 Recommended: Add this to your CLAUDE.md:"
echo ""
echo "   ## Sigil Design System"
echo "   "
echo "   This project uses Sigil for design consistency."
echo "   Use /craft for component generation, /validate for checks."
echo "   See sigil-mark/README for details."
echo ""
echo "🚀 Next steps:"
echo "   1. Run /envision to capture product essence"
echo "   2. Run /codify to define materials"
echo "   3. Run /map to define zones"
echo "   4. Start crafting with /craft"
echo ""
