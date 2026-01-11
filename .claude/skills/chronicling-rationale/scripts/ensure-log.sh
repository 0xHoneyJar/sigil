#!/bin/bash
#
# Sigil v6.1 — Craft Log Ensure Hook
#
# Stop hook for ensuring craft session is logged.
# Bridges Claude Code hooks to chronicling-rationale.ts TypeScript module.
#
# Usage: ensure-log.sh [project_root]
# Exit code: Always 0 (non-blocking)
#
# Output: JSON to stdout with { logPath, written }
#

set -euo pipefail

# Get script directory for relative imports
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${1:-$(cd "$SCRIPT_DIR/../../../../.." && pwd)}"

# Path to pending session file
PENDING_SESSION_PATH="$PROJECT_ROOT/grimoires/sigil/state/.pending-session.json"

# Check if pending session exists
if [[ ! -f "$PENDING_SESSION_PATH" ]]; then
  echo '{"logPath":null,"written":false,"reason":"no_pending_session"}'
  exit 0
fi

# Run TypeScript logging
cd "$PROJECT_ROOT"

# Execute logging via npx tsx
RESULT=$(npx tsx -e "
import { ensureSessionLog } from './sigil-mark/process/chronicling-rationale.js';

const projectRoot = '$PROJECT_ROOT';
const result = ensureSessionLog(projectRoot);
console.log(JSON.stringify(result));
" 2>/dev/null || echo '{"logPath":null,"written":false,"reason":"execution_error"}')

# Output result
echo "$RESULT"

# Clean up pending session file on successful write
if echo "$RESULT" | grep -q '"written":true'; then
  rm -f "$PENDING_SESSION_PATH" 2>/dev/null || true
fi

# Always exit 0 (non-blocking)
exit 0
