#!/opt/homebrew/bin/bash
# Sigil v10.1 "Usage Reality" - Physics Validation Hook
# Validates generated code matches physics constraints before Edit/Write
#
# @version 10.1.0
# @hook PreToolUse (Edit, Write)
#
# This hook runs BEFORE Claude writes or edits files.
# It validates that generated component code follows physics rules.
# Returns warnings only (non-blocking) - Claude can proceed but sees issues.

set -euo pipefail

# Hook receives context via environment variables
TOOL_NAME="${CLAUDE_TOOL_NAME:-unknown}"
FILE_PATH="${CLAUDE_FILE_PATH:-unknown}"

# Read content from stdin if available
CONTENT=""
if [[ ! -t 0 ]]; then
  CONTENT=$(cat)
fi

# Skip validation for non-component files
if [[ ! "$FILE_PATH" =~ \.(tsx|jsx)$ ]]; then
  exit 0
fi

# Skip test files
if [[ "$FILE_PATH" =~ \.(test|spec)\.(tsx|jsx)$ ]]; then
  exit 0
fi

WARNINGS=()

# -----------------------------------------------------------------------------
# Check 1: Financial mutations should have confirmation flow
# -----------------------------------------------------------------------------
# Keywords that indicate financial/sensitive operations
FINANCIAL_PATTERNS="claim|withdraw|transfer|deposit|swap|burn|stake|unstake"

if echo "$CONTENT" | grep -qiE "($FINANCIAL_PATTERNS)"; then
  # Check for confirmation flow indicators
  if ! echo "$CONTENT" | grep -qiE "(confirm|confirmation|Confirm|modal|dialog|preview|simulate)"; then
    WARNINGS+=("PHYSICS: Financial mutation detected without confirmation flow")
    WARNINGS+=("  Keywords found: $(echo "$CONTENT" | grep -oiE "($FINANCIAL_PATTERNS)" | head -3 | tr '\n' ', ')")
    WARNINGS+=("  Recommendation: Add confirmation dialog or simulation step before execution")
  fi
fi

# -----------------------------------------------------------------------------
# Check 2: Mutations should use deliberate/server-tick timing, not snappy
# -----------------------------------------------------------------------------
if echo "$CONTENT" | grep -qE "useMutation|mutation:|mutate\(|\.mutate\(|POST|PUT|DELETE|PATCH"; then
  # Check for snappy timing (too fast for mutations)
  if echo "$CONTENT" | grep -qE "useMotion\(['\"]snappy['\"]|duration:\s*(100|150)|transition.*150"; then
    WARNINGS+=("PHYSICS: Mutation using snappy (150ms) timing")
    WARNINGS+=("  Mutations should use 'deliberate' (800ms) or 'server-tick' (600ms)")
    WARNINGS+=("  Change: useMotion('snappy') → useMotion('deliberate')")
  fi
fi

# -----------------------------------------------------------------------------
# Check 3: Interactive components should have motion/transition
# -----------------------------------------------------------------------------
if echo "$CONTENT" | grep -qE "onClick|onSubmit|onPress|onSelect"; then
  # Check for motion/transition/animation indicators
  if ! echo "$CONTENT" | grep -qE "useMotion|motion\.|transition|animate|framer-motion|Animation|Transition"; then
    WARNINGS+=("PHYSICS: Interactive component without motion/transition")
    WARNINGS+=("  Consider adding: import { useMotion } from '@/hooks/useMotion'")
  fi
fi

# -----------------------------------------------------------------------------
# Check 4: Sensitive operations should have server-tick or longer timing
# -----------------------------------------------------------------------------
SENSITIVE_PATTERNS="ownership|permission|delete|remove|destroy|burn|revoke"

if echo "$CONTENT" | grep -qiE "($SENSITIVE_PATTERNS)"; then
  # These should NOT be optimistic
  if echo "$CONTENT" | grep -qE "optimistic|instant"; then
    WARNINGS+=("PHYSICS: Sensitive operation using optimistic/instant sync")
    WARNINGS+=("  Sensitive ops require pessimistic sync with server confirmation")
  fi
fi

# -----------------------------------------------------------------------------
# Check 5: Verify useMotion preset matches expected physics
# -----------------------------------------------------------------------------
# Check for mismatched presets
if echo "$CONTENT" | grep -qE "useMotion\(['\"]smooth['\"]|useMotion\(['\"]instant['\"]"; then
  # smooth/instant are for local state, not mutations
  if echo "$CONTENT" | grep -qE "useMutation|mutation:|mutate\("; then
    WARNINGS+=("PHYSICS: Using smooth/instant preset with mutation")
    WARNINGS+=("  Mutations should use 'deliberate' or 'server-tick' preset")
  fi
fi

# -----------------------------------------------------------------------------
# Output warnings if any
# -----------------------------------------------------------------------------
if [[ ${#WARNINGS[@]} -gt 0 ]]; then
  echo ""
  echo "=== SIGIL v10.1 PHYSICS WARNINGS ==="
  echo ""
  for warning in "${WARNINGS[@]}"; do
    echo "  $warning"
  done
  echo ""
  echo "Physics Reference:"
  echo "  mutation → pessimistic sync, 800ms, useMotion('deliberate')"
  echo "  query → optimistic sync, 150ms, useMotion('snappy')"
  echo "  sensitive_mutation → pessimistic, 1200ms, requires confirmation"
  echo ""
  echo "=== END WARNINGS ==="
  echo ""
fi

# Always exit 0 (warn, don't block)
# Future: Could exit 1 to block writes with --strict flag
exit 0
