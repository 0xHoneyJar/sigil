#!/bin/bash
# Sigil v7.7.0 Migration Script
# Run by /update command to clean up legacy directories
#
# This script:
# 1. Deletes empty legacy directories
# 2. Consolidates archives under .archive/
# 3. Reports what was changed

set -e

SIGIL_MARK="sigil-mark"

echo "🔄 Sigil v7.7.0 Migration: Directory Cleanup"
echo "============================================="
echo ""

# Track changes
DELETED=()
ARCHIVED=()
SKIPPED=()

# Function to safely delete empty directory
delete_empty() {
    local dir="$SIGIL_MARK/$1"
    if [ -d "$dir" ]; then
        # Check if empty or only has empty subdirs
        if [ -z "$(find "$dir" -type f 2>/dev/null)" ]; then
            rm -rf "$dir"
            DELETED+=("$1")
            echo "  ✓ Deleted empty: $1"
        else
            SKIPPED+=("$1 (not empty)")
        fi
    fi
}

# Function to archive directory
archive_to() {
    local src="$SIGIL_MARK/$1"
    local dest="$SIGIL_MARK/.archive/$2/$1"
    if [ -d "$src" ]; then
        mkdir -p "$SIGIL_MARK/.archive/$2"
        mv "$src" "$dest"
        ARCHIVED+=("$1 → .archive/$2/")
        echo "  ✓ Archived: $1 → .archive/$2/"
    fi
}

echo "Step 1: Deleting empty directories..."
delete_empty "canon"
delete_empty "codebase"
delete_empty "knowledge"
delete_empty "sigil-mark"
echo ""

echo "Step 2: Archiving v3.0 legacy..."
archive_to "lens-array" "v3.0"
archive_to "soul-binder" "v3.0"
archive_to "zones" "v3.0"
archive_to "components" "v3.0"
echo ""

echo "Step 3: Archiving v4.0 legacy..."
archive_to "consultation-chamber" "v4.0"
archive_to "evidence" "v4.0"
archive_to "governance" "v4.0"
archive_to "personas" "v4.0"
archive_to "remote-config" "v4.0"
archive_to "surveys" "v4.0"
archive_to "skills" "v4.0"
archive_to ".sigil-observations" "v4.0"
echo ""

echo "Step 4: Consolidating archives..."
if [ -d "$SIGIL_MARK/.archive-v1.0" ]; then
    mkdir -p "$SIGIL_MARK/.archive"
    mv "$SIGIL_MARK/.archive-v1.0" "$SIGIL_MARK/.archive/v1.0"
    ARCHIVED+=(".archive-v1.0 → .archive/v1.0/")
    echo "  ✓ Moved: .archive-v1.0 → .archive/v1.0/"
fi
echo ""

echo "============================================="
echo "Migration Summary"
echo "============================================="
echo ""

if [ ${#DELETED[@]} -gt 0 ]; then
    echo "Deleted (${#DELETED[@]}):"
    for item in "${DELETED[@]}"; do
        echo "  - $item"
    done
    echo ""
fi

if [ ${#ARCHIVED[@]} -gt 0 ]; then
    echo "Archived (${#ARCHIVED[@]}):"
    for item in "${ARCHIVED[@]}"; do
        echo "  - $item"
    done
    echo ""
fi

if [ ${#SKIPPED[@]} -gt 0 ]; then
    echo "Skipped (${#SKIPPED[@]}):"
    for item in "${SKIPPED[@]}"; do
        echo "  - $item"
    done
    echo ""
fi

if [ ${#DELETED[@]} -eq 0 ] && [ ${#ARCHIVED[@]} -eq 0 ]; then
    echo "✓ No migration needed - already clean"
else
    echo "✓ Migration complete"
fi

echo ""
echo "Active sigil-mark/ structure:"
ls -1 "$SIGIL_MARK" | grep -v "node_modules" | grep -v "^\\." | head -20

echo ""
echo "Done! Run 'git status' to see changes."
