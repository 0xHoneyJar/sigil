#!/bin/bash
# Graphing Imports - Scan src/ for package dependencies
# Performance target: <1s

set -e

# Configuration
SRC_DIR="${1:-src}"
OUTPUT_FILE="${2:-grimoires/sigil/state/imports.yaml}"
DRY_RUN="${3:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if ripgrep is available
if ! command -v rg &> /dev/null; then
    echo -e "${RED}Error: ripgrep (rg) is required but not installed.${NC}"
    exit 1
fi

# Check if source directory exists
if [ ! -d "$SRC_DIR" ]; then
    echo -e "${YELLOW}Warning: Source directory '$SRC_DIR' not found.${NC}"
    exit 0
fi

echo -e "${GREEN}Scanning $SRC_DIR for imports...${NC}"

# Find all external imports
# Pattern: from 'package' or from "package" (not starting with . or /)
IMPORTS=$(rg "from ['\"]([^.'\"/@][^'\"]*|@[^'\"]+)['\"]" "$SRC_DIR" -o --no-filename 2>/dev/null | \
    sed "s/from ['\"]//g" | \
    sed "s/['\"]//g" | \
    sed 's|/.*||g' | \
    sort | uniq | \
    grep -v "^$" || true)

# Handle scoped packages - merge @scope/pkg back together
SCOPED_IMPORTS=$(rg "from ['\"]@[^'\"]+['\"]" "$SRC_DIR" -o --no-filename 2>/dev/null | \
    sed "s/from ['\"]//g" | \
    sed "s/['\"]//g" | \
    sed 's|/[^/]*$||g' | \
    sort | uniq | \
    grep "^@" || true)

# Combine and dedupe
ALL_IMPORTS=$(echo -e "$IMPORTS\n$SCOPED_IMPORTS" | grep -v "^@$" | sort | uniq | grep -v "^$" || true)

# Count imports
COUNT=$(echo "$ALL_IMPORTS" | grep -c "." || echo "0")

echo -e "${GREEN}Found $COUNT unique packages${NC}"

if [ "$DRY_RUN" = "--dry-run" ] || [ "$DRY_RUN" = "true" ]; then
    echo -e "${YELLOW}Dry run - imports would be:${NC}"
    echo "$ALL_IMPORTS" | while read -r pkg; do
        echo "  - $pkg"
    done
    exit 0
fi

# Ensure output directory exists
OUTPUT_DIR=$(dirname "$OUTPUT_FILE")
mkdir -p "$OUTPUT_DIR"

# Write to imports.yaml
{
    echo "# Auto-generated import list"
    echo "# Source: $SRC_DIR"
    echo "# Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "# Packages: $COUNT"
    echo ""
    echo "$ALL_IMPORTS" | while read -r pkg; do
        if [ -n "$pkg" ]; then
            echo "- $pkg"
        fi
    done
} > "$OUTPUT_FILE"

echo -e "${GREEN}Written to $OUTPUT_FILE${NC}"
