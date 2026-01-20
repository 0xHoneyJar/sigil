#!/bin/bash
#
# Tenderly Fork Management
#
# Creates and manages Tenderly forks for Web3 testing.
#
# Usage:
#   ./tenderly-fork.sh create [--chain CHAIN_ID] [--block BLOCK]
#   ./tenderly-fork.sh delete FORK_ID
#   ./tenderly-fork.sh list
#
# Environment Variables:
#   TENDERLY_ACCESS_KEY - Required. Tenderly API key.
#   TENDERLY_PROJECT    - Required. Tenderly project slug.
#   TENDERLY_ACCOUNT    - Optional. Tenderly account name (defaults to project).
#
# Output:
#   On success: fork_id=xxx, rpc_url=https://...

set -euo pipefail

# ═══════════════════════════════════════════════════════════════════════════
# Configuration
# ═══════════════════════════════════════════════════════════════════════════

TENDERLY_API="${TENDERLY_API:-https://api.tenderly.co/api/v1}"
ACCESS_KEY="${TENDERLY_ACCESS_KEY:-}"
PROJECT="${TENDERLY_PROJECT:-}"
ACCOUNT="${TENDERLY_ACCOUNT:-$PROJECT}"

# Validate required environment
validate_env() {
  if [[ -z "$ACCESS_KEY" ]]; then
    echo "ERROR: TENDERLY_ACCESS_KEY not set" >&2
    exit 1
  fi
  if [[ -z "$PROJECT" ]]; then
    echo "ERROR: TENDERLY_PROJECT not set" >&2
    exit 1
  fi
}

# ═══════════════════════════════════════════════════════════════════════════
# API Functions
# ═══════════════════════════════════════════════════════════════════════════

create_fork() {
  local chain_id="${1:-1}"  # Default to mainnet
  local block="${2:-}"      # Empty = latest

  validate_env

  local body
  if [[ -n "$block" ]]; then
    body=$(cat <<EOF
{
  "network_id": "$chain_id",
  "block_number": $block
}
EOF
)
  else
    body=$(cat <<EOF
{
  "network_id": "$chain_id"
}
EOF
)
  fi

  local response
  response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "X-Access-Key: $ACCESS_KEY" \
    -d "$body" \
    "${TENDERLY_API}/account/${ACCOUNT}/project/${PROJECT}/fork")

  # Check for error
  if echo "$response" | grep -q '"error"'; then
    local error_msg
    error_msg=$(echo "$response" | jq -r '.error.message // .error // "Unknown error"')
    echo "ERROR: Failed to create fork: $error_msg" >&2
    exit 1
  fi

  # Extract fork details
  local fork_id
  local rpc_url
  fork_id=$(echo "$response" | jq -r '.simulation_fork.id // .fork.id // empty')
  rpc_url=$(echo "$response" | jq -r '.simulation_fork.rpc_url // .fork.rpc_url // empty')

  if [[ -z "$fork_id" || -z "$rpc_url" ]]; then
    # Try alternate response format
    fork_id=$(echo "$response" | jq -r '.id // empty')
    if [[ -n "$fork_id" ]]; then
      rpc_url="https://rpc.tenderly.co/fork/${fork_id}"
    fi
  fi

  if [[ -z "$fork_id" ]]; then
    echo "ERROR: Could not extract fork ID from response" >&2
    echo "Response: $response" >&2
    exit 1
  fi

  echo "fork_id=$fork_id"
  echo "rpc_url=$rpc_url"
  echo "chain_id=$chain_id"
}

delete_fork() {
  local fork_id="$1"

  validate_env

  local response
  response=$(curl -s -X DELETE \
    -H "X-Access-Key: $ACCESS_KEY" \
    "${TENDERLY_API}/account/${ACCOUNT}/project/${PROJECT}/fork/${fork_id}")

  if echo "$response" | grep -q '"error"'; then
    local error_msg
    error_msg=$(echo "$response" | jq -r '.error.message // .error // "Unknown error"')
    echo "ERROR: Failed to delete fork: $error_msg" >&2
    exit 1
  fi

  echo "deleted=$fork_id"
}

list_forks() {
  validate_env

  local response
  response=$(curl -s -X GET \
    -H "X-Access-Key: $ACCESS_KEY" \
    "${TENDERLY_API}/account/${ACCOUNT}/project/${PROJECT}/forks")

  if echo "$response" | grep -q '"error"'; then
    local error_msg
    error_msg=$(echo "$response" | jq -r '.error.message // .error // "Unknown error"')
    echo "ERROR: Failed to list forks: $error_msg" >&2
    exit 1
  fi

  echo "$response" | jq -r '.simulation_forks[] // .forks[] | "\(.id)\t\(.network_id)\t\(.created_at)"' 2>/dev/null || echo "No forks found"
}

# ═══════════════════════════════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════════════════════════════

case "${1:-help}" in
  create)
    shift
    chain_id="1"
    block=""

    while [[ $# -gt 0 ]]; do
      case "$1" in
        --chain)
          chain_id="$2"
          shift 2
          ;;
        --block)
          block="$2"
          shift 2
          ;;
        *)
          echo "Unknown option: $1" >&2
          exit 1
          ;;
      esac
    done

    create_fork "$chain_id" "$block"
    ;;

  delete)
    if [[ -z "${2:-}" ]]; then
      echo "Usage: $0 delete FORK_ID" >&2
      exit 1
    fi
    delete_fork "$2"
    ;;

  list)
    list_forks
    ;;

  help|--help|-h)
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  create [--chain CHAIN_ID] [--block BLOCK]  Create a new fork"
    echo "  delete FORK_ID                              Delete a fork"
    echo "  list                                        List all forks"
    echo ""
    echo "Environment:"
    echo "  TENDERLY_ACCESS_KEY  API key (required)"
    echo "  TENDERLY_PROJECT     Project slug (required)"
    echo "  TENDERLY_ACCOUNT     Account name (optional, defaults to project)"
    ;;

  *)
    echo "Unknown command: $1" >&2
    echo "Use '$0 help' for usage" >&2
    exit 1
    ;;
esac
