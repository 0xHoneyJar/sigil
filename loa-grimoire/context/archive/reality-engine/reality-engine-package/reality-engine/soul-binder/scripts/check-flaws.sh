#!/bin/bash
# Soul Binder — Canon of Flaws Check
# Checks if code changes would affect protected flaws

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REALITY_ENGINE_DIR="${SCRIPT_DIR}/../.."
CANON_FILE="${REALITY_ENGINE_DIR}/soul-binder/canon-of-flaws.yaml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "═══════════════════════════════════════════════════════════════"
echo "  SOUL BINDER — Canon of Flaws Check"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check if canon file exists
if [[ ! -f "$CANON_FILE" ]]; then
    echo -e "${YELLOW}Warning: Canon of Flaws file not found at $CANON_FILE${NC}"
    echo "Skipping flaw check."
    exit 0
fi

# Get changed files (works with git diff or provided list)
if [[ -n "$1" ]]; then
    CHANGED_FILES="$@"
else
    CHANGED_FILES=$(git diff --cached --name-only 2>/dev/null || git diff --name-only HEAD~1 2>/dev/null || echo "")
fi

if [[ -z "$CHANGED_FILES" ]]; then
    echo "No changed files to check."
    exit 0
fi

echo "Checking files:"
echo "$CHANGED_FILES" | sed 's/^/  /'
echo ""

# Extract flaw patterns from YAML (simplified parsing)
# In production, use yq or a proper YAML parser
FLAW_PATTERNS=$(grep -A 100 "affected_code_patterns:" "$CANON_FILE" 2>/dev/null | \
    grep -E '^\s+- "' | \
    sed 's/.*- "\(.*\)"/\1/' | \
    tr '\n' '|' | \
    sed 's/|$//')

if [[ -z "$FLAW_PATTERNS" ]]; then
    echo "No flaw patterns found in canon file."
    exit 0
fi

# Check each file for flaw patterns
VIOLATIONS=0
for file in $CHANGED_FILES; do
    if [[ -f "$file" ]]; then
        # Check file content against patterns
        if grep -qE "$FLAW_PATTERNS" "$file" 2>/dev/null; then
            echo -e "${RED}⚠️  POTENTIAL FLAW IMPACT: $file${NC}"
            echo "   This file may affect a Protected Flaw."
            echo "   Patterns matched:"
            grep -oE "$FLAW_PATTERNS" "$file" 2>/dev/null | sort -u | sed 's/^/     - /'
            echo ""
            VIOLATIONS=$((VIOLATIONS + 1))
        fi
    fi
done

echo "═══════════════════════════════════════════════════════════════"

if [[ $VIOLATIONS -gt 0 ]]; then
    echo -e "${RED}RESULT: $VIOLATIONS file(s) may affect Protected Flaws${NC}"
    echo ""
    echo "Before proceeding, verify that your changes:"
    echo "  1. Do not break any canonized emergent behavior"
    echo "  2. Preserve prayer flicking, tick manipulation, etc."
    echo "  3. Have been reviewed against the Canon of Flaws"
    echo ""
    echo "Run with SKIP_FLAW_CHECK=1 to bypass (requires justification)."
    
    if [[ "$SKIP_FLAW_CHECK" != "1" ]]; then
        exit 1
    else
        echo -e "${YELLOW}SKIP_FLAW_CHECK=1 set. Proceeding with caution.${NC}"
    fi
else
    echo -e "${GREEN}RESULT: No Protected Flaw impacts detected${NC}"
fi

exit 0
