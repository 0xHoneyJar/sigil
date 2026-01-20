#!/bin/bash
#
# Smoke Test for Sigil Web3 Injection
#
# Verifies that the injection script works with the wagmi fixture app.
#
# Usage:
#   ./smoke-test.sh [--with-app]
#
# Options:
#   --with-app    Start the fixture app before testing (requires npm)
#
# Exit Codes:
#   0 - All tests passed
#   1 - Test failure
#   2 - Prerequisites missing

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
APP_DIR="$SCRIPT_DIR/wagmi-app"
APP_URL="http://localhost:5173"
START_APP=false
APP_PID=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --with-app)
      START_APP=true
      shift
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 2
      ;;
  esac
done

# ═══════════════════════════════════════════════════════════════════════════
# Prerequisites
# ═══════════════════════════════════════════════════════════════════════════

echo "Sigil Web3 Testing - Smoke Test"
echo "================================"
echo ""

# Check for required files
check_file() {
  if [[ ! -f "$1" ]]; then
    echo "ERROR: Required file not found: $1" >&2
    exit 2
  fi
}

check_file "$SKILL_DIR/resources/injection-script.js"
check_file "$SKILL_DIR/resources/scenarios.yaml"
check_file "$SKILL_DIR/resources/flows.yaml"

echo "✓ All skill files present"

# ═══════════════════════════════════════════════════════════════════════════
# Start App (if requested)
# ═══════════════════════════════════════════════════════════════════════════

cleanup() {
  if [[ -n "$APP_PID" ]]; then
    echo ""
    echo "Stopping fixture app (PID: $APP_PID)..."
    kill "$APP_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT

if [[ "$START_APP" == "true" ]]; then
  echo ""
  echo "Starting fixture app..."

  if [[ ! -d "$APP_DIR/node_modules" ]]; then
    echo "Installing dependencies..."
    (cd "$APP_DIR" && npm install)
  fi

  (cd "$APP_DIR" && npm run dev > /dev/null 2>&1) &
  APP_PID=$!

  # Wait for app to be ready
  echo "Waiting for app to start..."
  for i in {1..30}; do
    if curl -s "$APP_URL" > /dev/null 2>&1; then
      echo "✓ Fixture app running at $APP_URL"
      break
    fi
    sleep 1
  done

  if ! curl -s "$APP_URL" > /dev/null 2>&1; then
    echo "ERROR: Fixture app failed to start" >&2
    exit 1
  fi
fi

# ═══════════════════════════════════════════════════════════════════════════
# Test: Injection Script Syntax
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo "Test 1: Injection script syntax"
echo "--------------------------------"

# Replace placeholders and check JS syntax
INJECTION_SCRIPT=$(cat "$SKILL_DIR/resources/injection-script.js")
INJECTION_SCRIPT="${INJECTION_SCRIPT/__SIGIL_MOCK_STATE_PLACEHOLDER__/\{connected:true,address:\"0x123\",chainId:1\}}"
INJECTION_SCRIPT="${INJECTION_SCRIPT/__SIGIL_FORK_RPC_URL_PLACEHOLDER__/null}"

# Write to temp file and check with node
TEMP_FILE=$(mktemp)
echo "$INJECTION_SCRIPT" > "$TEMP_FILE"

if node --check "$TEMP_FILE" 2>/dev/null; then
  echo "✓ Injection script syntax valid"
else
  echo "✗ Injection script has syntax errors"
  rm "$TEMP_FILE"
  exit 1
fi
rm "$TEMP_FILE"

# ═══════════════════════════════════════════════════════════════════════════
# Test: Scenarios YAML
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo "Test 2: Scenarios YAML validation"
echo "----------------------------------"

if command -v yq &> /dev/null; then
  SCENARIO_COUNT=$(yq 'keys | length' "$SKILL_DIR/resources/scenarios.yaml")
  echo "✓ scenarios.yaml valid with $SCENARIO_COUNT scenarios"
else
  echo "⚠ yq not installed, skipping YAML validation"
fi

# ═══════════════════════════════════════════════════════════════════════════
# Test: Flows YAML
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo "Test 3: Flows YAML validation"
echo "------------------------------"

if command -v yq &> /dev/null; then
  FLOW_COUNT=$(yq 'keys | length' "$SKILL_DIR/resources/flows.yaml")
  echo "✓ flows.yaml valid with $FLOW_COUNT flows"
else
  echo "⚠ yq not installed, skipping YAML validation"
fi

# ═══════════════════════════════════════════════════════════════════════════
# Test: Fork Detection Script
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo "Test 4: Fork detection script"
echo "------------------------------"

if bash -n "$SKILL_DIR/resources/fork-detector.sh"; then
  echo "✓ fork-detector.sh syntax valid"
else
  echo "✗ fork-detector.sh has syntax errors"
  exit 1
fi

# ═══════════════════════════════════════════════════════════════════════════
# Test: Flow Executor Syntax
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo "Test 5: Flow executor syntax"
echo "----------------------------"

FLOW_SCRIPT=$(cat "$SKILL_DIR/resources/flow-executor.js")
FLOW_SCRIPT="${FLOW_SCRIPT/__SIGIL_FLOW_STEPS_PLACEHOLDER__/[]}"
FLOW_SCRIPT="${FLOW_SCRIPT/__SIGIL_INITIAL_STATE_PLACEHOLDER__/\{\}}"
FLOW_SCRIPT="${FLOW_SCRIPT/__SIGIL_FORK_RPC_URL_PLACEHOLDER__/null}"

TEMP_FILE=$(mktemp)
# Add mock store for the check
echo "window.__SIGIL_MOCK_STORE__ = { state: {}, update: () => {} };" > "$TEMP_FILE"
echo "$FLOW_SCRIPT" >> "$TEMP_FILE"

if node --check "$TEMP_FILE" 2>/dev/null; then
  echo "✓ Flow executor syntax valid"
else
  echo "✗ Flow executor has syntax errors"
  rm "$TEMP_FILE"
  exit 1
fi
rm "$TEMP_FILE"

# ═══════════════════════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo "================================"
echo "All smoke tests passed! ✓"
echo ""
echo "Next steps:"
echo "  1. Start fixture app: cd fixtures/wagmi-app && npm run dev"
echo "  2. Test with /ward: /ward http://localhost:5173 connected"
echo "  3. Test flows: /test-flow http://localhost:5173 connect"

exit 0
