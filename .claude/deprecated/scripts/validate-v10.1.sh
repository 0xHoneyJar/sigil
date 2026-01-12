#!/opt/homebrew/bin/bash
# Sigil v10.1 "Usage Reality" - Validation Test Script
# Validates the complete v10.1 pipeline is correctly configured
#
# @version 10.1.0
# @usage validate-v10.1.sh
# @output Pass/fail for each check with summary

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

pass() {
  echo -e "${GREEN}✓${NC} $1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  echo -e "${RED}✗${NC} $1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

warn() {
  echo -e "${YELLOW}⚠${NC} $1"
  WARN_COUNT=$((WARN_COUNT + 1))
}

echo "=== Sigil v10.1 Validation Suite ==="
echo ""

# =============================================================================
# 1. Core Library Modules (6 modules)
# =============================================================================
echo "## Core Library Modules"
echo ""

LIBRARY_MODULES=(
  "src/lib/sigil/index.ts"
  "src/lib/sigil/context.ts"
  "src/lib/sigil/survival.ts"
  "src/lib/sigil/physics.ts"
  "src/lib/sigil/ast-reader.ts"
  "src/lib/sigil/diagnostician.ts"
  "src/lib/sigil/search.ts"
)

for MODULE in "${LIBRARY_MODULES[@]}"; do
  if [[ -f "$MODULE" ]]; then
    pass "$MODULE exists"
  else
    fail "$MODULE missing"
  fi
done

echo ""

# =============================================================================
# 2. Skill Files (3 skills)
# =============================================================================
echo "## Skill Files"
echo ""

SKILL_FILES=(
  ".claude/skills/mason/SKILL.md"
  ".claude/skills/gardener/SKILL.md"
  ".claude/skills/diagnostician/SKILL.md"
)

for SKILL in "${SKILL_FILES[@]}"; do
  if [[ -f "$SKILL" ]]; then
    pass "$SKILL exists"
  else
    fail "$SKILL missing"
  fi
done

echo ""

# =============================================================================
# 3. Configuration Files
# =============================================================================
echo "## Configuration Files"
echo ""

# Constitution with effect_physics
CONSTITUTION="grimoires/sigil/constitution.yaml"
if [[ -f "$CONSTITUTION" ]]; then
  if grep -q "effect_physics:" "$CONSTITUTION"; then
    pass "constitution.yaml has effect_physics section"
  else
    fail "constitution.yaml missing effect_physics section"
  fi
else
  fail "constitution.yaml missing"
fi

# Authority with tier thresholds
AUTHORITY="grimoires/sigil/authority.yaml"
if [[ -f "$AUTHORITY" ]]; then
  if grep -q "gold:" "$AUTHORITY" && grep -q "silver:" "$AUTHORITY"; then
    pass "authority.yaml has tier thresholds"
  else
    fail "authority.yaml missing tier thresholds"
  fi
else
  fail "authority.yaml missing"
fi

echo ""

# =============================================================================
# 4. Hooks Configuration
# =============================================================================
echo "## Hooks Configuration"
echo ""

SETTINGS=".claude/settings.local.json"
if [[ -f "$SETTINGS" ]]; then
  if grep -q "SessionStart" "$SETTINGS"; then
    pass "SessionStart hook configured"
  else
    fail "SessionStart hook not configured"
  fi
  if grep -q "PreToolUse" "$SETTINGS"; then
    pass "PreToolUse hook configured"
  else
    fail "PreToolUse hook not configured"
  fi
else
  fail ".claude/settings.local.json missing"
fi

echo ""

# =============================================================================
# 5. Helper Scripts (executable)
# =============================================================================
echo "## Helper Scripts"
echo ""

SCRIPTS=(
  ".claude/scripts/sigil-init.sh"
  ".claude/scripts/validate-physics.sh"
  ".claude/scripts/count-imports.sh"
  ".claude/scripts/check-stability.sh"
  ".claude/scripts/infer-authority.sh"
)

for SCRIPT in "${SCRIPTS[@]}"; do
  if [[ -f "$SCRIPT" ]]; then
    if [[ -x "$SCRIPT" ]]; then
      pass "$SCRIPT is executable"
    else
      warn "$SCRIPT exists but not executable"
    fi
  else
    fail "$SCRIPT missing"
  fi
done

echo ""

# =============================================================================
# 6. useMotion Hook
# =============================================================================
echo "## Physics Hook"
echo ""

USEMOTION="src/hooks/useMotion.ts"
if [[ -f "$USEMOTION" ]]; then
  pass "useMotion.ts exists"
else
  fail "useMotion.ts missing"
fi

echo ""

# =============================================================================
# 7. Context Directory
# =============================================================================
echo "## Context Directory"
echo ""

CONTEXT_DIR="grimoires/sigil/.context"
if [[ -d "$CONTEXT_DIR" ]]; then
  pass ".context/ directory exists"
  
  CONTEXT_FILES=(
    "$CONTEXT_DIR/taste.json"
    "$CONTEXT_DIR/persona.json"
    "$CONTEXT_DIR/project.json"
    "$CONTEXT_DIR/recent.json"
  )
  
  for CONTEXT_FILE in "${CONTEXT_FILES[@]}"; do
    if [[ -f "$CONTEXT_FILE" ]]; then
      pass "$(basename $CONTEXT_FILE) exists"
    else
      fail "$(basename $CONTEXT_FILE) missing"
    fi
  done
else
  fail ".context/ directory missing"
fi

echo ""

# =============================================================================
# 8. Skill Content Verification
# =============================================================================
echo "## Skill Content Verification"
echo ""

# Mason - Required Reading and Physics Decision Tree
MASON_SKILL=".claude/skills/mason/SKILL.md"
if [[ -f "$MASON_SKILL" ]]; then
  if grep -q "## Required Reading" "$MASON_SKILL"; then
    pass "Mason has Required Reading section"
  else
    fail "Mason missing Required Reading section"
  fi
  if grep -q "## Physics Decision Tree" "$MASON_SKILL"; then
    pass "Mason has Physics Decision Tree section"
  else
    fail "Mason missing Physics Decision Tree section"
  fi
fi

# Gardener - Authority Computation
GARDENER_SKILL=".claude/skills/gardener/SKILL.md"
if [[ -f "$GARDENER_SKILL" ]]; then
  if grep -q "Authority Computation" "$GARDENER_SKILL"; then
    pass "Gardener has Authority Computation section"
  else
    fail "Gardener missing Authority Computation section"
  fi
fi

# Diagnostician - Required Reading and Never Ask
DIAGNOSTICIAN_SKILL=".claude/skills/diagnostician/SKILL.md"
if [[ -f "$DIAGNOSTICIAN_SKILL" ]]; then
  if grep -q "## Required Reading" "$DIAGNOSTICIAN_SKILL"; then
    pass "Diagnostician has Required Reading section"
  else
    fail "Diagnostician missing Required Reading section"
  fi
  if grep -q "## Never Ask" "$DIAGNOSTICIAN_SKILL"; then
    pass "Diagnostician has Never Ask section"
  else
    fail "Diagnostician missing Never Ask section"
  fi
fi

echo ""

# =============================================================================
# Summary
# =============================================================================
echo "=== SUMMARY ==="
echo ""
echo -e "Passed:  ${GREEN}$PASS_COUNT${NC}"
echo -e "Failed:  ${RED}$FAIL_COUNT${NC}"
echo -e "Warnings: ${YELLOW}$WARN_COUNT${NC}"
echo ""

if [[ $FAIL_COUNT -eq 0 ]]; then
  echo -e "${GREEN}✓ All checks passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ $FAIL_COUNT check(s) failed${NC}"
  exit 1
fi
