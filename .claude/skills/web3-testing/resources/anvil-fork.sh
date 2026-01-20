#!/bin/bash
#
# Anvil Fork Management
#
# Manages local Anvil instances for Web3 testing.
#
# Usage:
#   ./anvil-fork.sh start [--chain CHAIN_ID] [--fork-url URL] [--port PORT]
#   ./anvil-fork.sh stop [--port PORT]
#   ./anvil-fork.sh status [--port PORT]
#
# Environment Variables:
#   ANVIL_FORK_URL - Default RPC URL to fork from
#   ANVIL_PORT     - Default port (default: 8545)
#
# Output:
#   On success: rpc_url=http://localhost:8545, pid=12345

set -euo pipefail

# ═══════════════════════════════════════════════════════════════════════════
# Configuration
# ═══════════════════════════════════════════════════════════════════════════

DEFAULT_PORT="${ANVIL_PORT:-8545}"
DEFAULT_FORK_URL="${ANVIL_FORK_URL:-}"

# Known RPC URLs for common chains
declare -A CHAIN_RPCS=(
  [1]="https://eth.llamarpc.com"
  [10]="https://mainnet.optimism.io"
  [137]="https://polygon-rpc.com"
  [42161]="https://arb1.arbitrum.io/rpc"
  [8453]="https://mainnet.base.org"
  [11155111]="https://rpc.sepolia.org"
)

# ═══════════════════════════════════════════════════════════════════════════
# Functions
# ═══════════════════════════════════════════════════════════════════════════

check_anvil() {
  if ! command -v anvil &> /dev/null; then
    echo "ERROR: anvil not found. Install Foundry: https://getfoundry.sh" >&2
    exit 1
  fi
}

get_fork_url() {
  local chain_id="$1"
  local explicit_url="$2"

  # Explicit URL takes priority
  if [[ -n "$explicit_url" ]]; then
    echo "$explicit_url"
    return
  fi

  # Environment variable
  if [[ -n "$DEFAULT_FORK_URL" ]]; then
    echo "$DEFAULT_FORK_URL"
    return
  fi

  # Known chain RPC
  if [[ -n "${CHAIN_RPCS[$chain_id]:-}" ]]; then
    echo "${CHAIN_RPCS[$chain_id]}"
    return
  fi

  # No fork URL - run in standalone mode
  echo ""
}

start_anvil() {
  local port="$DEFAULT_PORT"
  local chain_id="1"
  local fork_url=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --port)
        port="$2"
        shift 2
        ;;
      --chain)
        chain_id="$2"
        shift 2
        ;;
      --fork-url)
        fork_url="$2"
        shift 2
        ;;
      *)
        echo "Unknown option: $1" >&2
        exit 1
        ;;
    esac
  done

  check_anvil

  # Check if already running
  if curl -s -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_chainId","id":1}' \
    "http://localhost:${port}" &> /dev/null; then
    echo "WARN: Anvil already running on port $port" >&2
    echo "rpc_url=http://localhost:${port}"
    echo "status=existing"
    return
  fi

  # Get fork URL
  local resolved_fork_url
  resolved_fork_url=$(get_fork_url "$chain_id" "$fork_url")

  # Build anvil command
  local anvil_args=("--port" "$port" "--chain-id" "$chain_id")

  if [[ -n "$resolved_fork_url" ]]; then
    anvil_args+=("--fork-url" "$resolved_fork_url")
    echo "Forking from: $resolved_fork_url" >&2
  else
    echo "Starting standalone anvil (no fork)" >&2
  fi

  # Start anvil in background
  anvil "${anvil_args[@]}" &> /tmp/anvil-${port}.log &
  local pid=$!

  # Wait for anvil to be ready
  local retries=30
  while [[ $retries -gt 0 ]]; do
    if curl -s -X POST -H "Content-Type: application/json" \
      --data '{"jsonrpc":"2.0","method":"eth_chainId","id":1}' \
      "http://localhost:${port}" &> /dev/null; then
      break
    fi
    sleep 0.5
    ((retries--))
  done

  if [[ $retries -eq 0 ]]; then
    echo "ERROR: Anvil failed to start. Check /tmp/anvil-${port}.log" >&2
    kill "$pid" 2>/dev/null || true
    exit 1
  fi

  echo "rpc_url=http://localhost:${port}"
  echo "pid=$pid"
  echo "chain_id=$chain_id"
  echo "status=started"

  # Save PID for cleanup
  echo "$pid" > "/tmp/anvil-${port}.pid"
}

stop_anvil() {
  local port="$DEFAULT_PORT"

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --port)
        port="$2"
        shift 2
        ;;
      *)
        echo "Unknown option: $1" >&2
        exit 1
        ;;
    esac
  done

  local pid_file="/tmp/anvil-${port}.pid"

  if [[ -f "$pid_file" ]]; then
    local pid
    pid=$(cat "$pid_file")
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid"
      rm -f "$pid_file"
      echo "stopped=$pid"
      return
    fi
  fi

  # Try to find by port
  local pid
  pid=$(lsof -ti ":${port}" 2>/dev/null || true)
  if [[ -n "$pid" ]]; then
    kill "$pid"
    echo "stopped=$pid"
    return
  fi

  echo "status=not_running"
}

status_anvil() {
  local port="$DEFAULT_PORT"

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --port)
        port="$2"
        shift 2
        ;;
      *)
        echo "Unknown option: $1" >&2
        exit 1
        ;;
    esac
  done

  local response
  response=$(curl -s -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"web3_clientVersion","id":1}' \
    "http://localhost:${port}" 2>/dev/null || echo "")

  if [[ "$response" == *"anvil"* ]]; then
    local chain_response
    chain_response=$(curl -s -X POST -H "Content-Type: application/json" \
      --data '{"jsonrpc":"2.0","method":"eth_chainId","id":1}' \
      "http://localhost:${port}")

    local chain_id
    chain_id=$(echo "$chain_response" | jq -r '.result' | xargs printf "%d" 2>/dev/null || echo "unknown")

    echo "status=running"
    echo "rpc_url=http://localhost:${port}"
    echo "chain_id=$chain_id"
    echo "client=$response"
  else
    echo "status=not_running"
  fi
}

# ═══════════════════════════════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════════════════════════════

case "${1:-help}" in
  start)
    shift
    start_anvil "$@"
    ;;

  stop)
    shift
    stop_anvil "$@"
    ;;

  status)
    shift
    status_anvil "$@"
    ;;

  help|--help|-h)
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  start [--chain CHAIN_ID] [--fork-url URL] [--port PORT]"
    echo "        Start anvil with optional fork"
    echo ""
    echo "  stop [--port PORT]"
    echo "        Stop running anvil instance"
    echo ""
    echo "  status [--port PORT]"
    echo "        Check if anvil is running"
    echo ""
    echo "Environment:"
    echo "  ANVIL_FORK_URL  Default RPC URL to fork from"
    echo "  ANVIL_PORT      Default port (default: 8545)"
    echo ""
    echo "Supported Chains for Auto-Fork:"
    echo "  1 (Mainnet), 10 (Optimism), 137 (Polygon),"
    echo "  42161 (Arbitrum), 8453 (Base), 11155111 (Sepolia)"
    ;;

  *)
    echo "Unknown command: $1" >&2
    echo "Use '$0 help' for usage" >&2
    exit 1
    ;;
esac
