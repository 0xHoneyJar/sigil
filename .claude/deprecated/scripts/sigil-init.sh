#!/opt/homebrew/bin/bash
# Sigil v10.1 "Usage Reality" - Session Initialization Hook
# Injects physics rules and authority thresholds into Claude's context
#
# @version 10.1.0
# @hook SessionStart

set -euo pipefail

SIGIL_DIR="grimoires/sigil"
CONSTITUTION="$SIGIL_DIR/constitution.yaml"
AUTHORITY="$SIGIL_DIR/authority.yaml"
CONTEXT_DIR="$SIGIL_DIR/.context"

echo "=== SIGIL v10.1 PHYSICS CONTEXT ==="
echo ""

# -----------------------------------------------------------------------------
# 1. Inject Constitution (Effect Physics)
# -----------------------------------------------------------------------------
if [[ -f "$CONSTITUTION" ]]; then
  echo "## Effect Physics (from constitution.yaml)"
  echo ""
  cat "$CONSTITUTION"
  echo ""
else
  echo "WARNING: constitution.yaml not found at $CONSTITUTION"
  echo ""
fi

echo "---"
echo ""

# -----------------------------------------------------------------------------
# 2. Inject Authority Thresholds
# -----------------------------------------------------------------------------
if [[ -f "$AUTHORITY" ]]; then
  echo "## Authority Thresholds (from authority.yaml)"
  echo ""
  cat "$AUTHORITY"
  echo ""
else
  echo "WARNING: authority.yaml not found at $AUTHORITY"
  echo ""
fi

echo "---"
echo ""

# -----------------------------------------------------------------------------
# 3. Inject Accumulated Context (if exists)
# -----------------------------------------------------------------------------
CONTEXT_FOUND=0

if [[ -d "$CONTEXT_DIR" ]]; then
  echo "## Accumulated Context (from .context/)"
  echo ""

  # Taste preferences
  if [[ -f "$CONTEXT_DIR/taste.json" ]]; then
    TASTE_CONTENT=$(cat "$CONTEXT_DIR/taste.json")
    # Check if preferences object has any keys
    if echo "$TASTE_CONTENT" | grep -q '"preferences": {[^}]*[a-zA-Z]'; then
      echo "### Taste Preferences"
      echo "$TASTE_CONTENT"
      echo ""
      CONTEXT_FOUND=1
    fi
  fi

  # Recent generations
  if [[ -f "$CONTEXT_DIR/recent.json" ]]; then
    RECENT_CONTENT=$(cat "$CONTEXT_DIR/recent.json")
    # Check if generations array has entries
    if echo "$RECENT_CONTENT" | grep -q '"generations": \[[^]]*{'; then
      echo "### Recent Generations (last 10)"
      echo "$RECENT_CONTENT"
      echo ""
      CONTEXT_FOUND=1
    fi
  fi

  # Persona context
  if [[ -f "$CONTEXT_DIR/persona.json" ]]; then
    PERSONA_CONTENT=$(cat "$CONTEXT_DIR/persona.json")
    # Check if audience object has any keys
    if echo "$PERSONA_CONTENT" | grep -q '"audience": {[^}]*[a-zA-Z]'; then
      echo "### Persona Context"
      echo "$PERSONA_CONTENT"
      echo ""
      CONTEXT_FOUND=1
    fi
  fi

  # Project conventions
  if [[ -f "$CONTEXT_DIR/project.json" ]]; then
    PROJECT_CONTENT=$(cat "$CONTEXT_DIR/project.json")
    # Check if conventions object has any keys
    if echo "$PROJECT_CONTENT" | grep -q '"conventions": {[^}]*[a-zA-Z]'; then
      echo "### Project Conventions"
      echo "$PROJECT_CONTENT"
      echo ""
      CONTEXT_FOUND=1
    fi
  fi

  if [[ $CONTEXT_FOUND -eq 0 ]]; then
    echo "(No accumulated context yet - will learn from session)"
    echo ""
  fi
else
  echo "## Accumulated Context"
  echo "(Context directory not initialized - run /implement sprint-3)"
  echo ""
fi

echo "=== END SIGIL CONTEXT ==="
echo ""
echo "Physics Decision Guide:"
echo "- MUTATION (POST/PUT/DELETE) → pessimistic sync, 800ms, useMotion('deliberate')"
echo "- QUERY (GET/fetch) → optimistic sync, 150ms, useMotion('snappy')"
echo "- LOCAL_STATE (useState) → immediate sync, 0ms, no animation needed"
echo "- SENSITIVE_MUTATION (transfer/delete/withdraw) → 1200ms, requires confirmation"
echo ""
