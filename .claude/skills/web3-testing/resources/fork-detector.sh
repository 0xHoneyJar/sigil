#!/bin/bash
#
# Fork Provider Auto-Detection
#
# Detects available fork providers in this order:
# 1. Tenderly (via TENDERLY_ACCESS_KEY env var)
# 2. Anvil (via running process on :8545)
# 3. Hardhat (via running process on :8545)
#
# Usage:
#   ./fork-detector.sh [--json]
#
# Output (default):
#   provider=tenderly
#   rpc_url=https://rpc.tenderly.co/fork/...
#
# Output (--json):
#   {"provider":"tenderly","rpc_url":"...","available":true}

set -euo pipefail

JSON_OUTPUT=false
if [[ "${1:-}" == "--json" ]]; then
  JSON_OUTPUT=true
fi

# Result variables
PROVIDER=""
RPC_URL=""
AVAILABLE=false

# ═══════════════════════════════════════════════════════════════════════════
# Detection Functions
# ═══════════════════════════════════════════════════════════════════════════

detect_tenderly() {
  if [[ -n "${TENDERLY_ACCESS_KEY:-}" ]]; then
    PROVIDER="tenderly"
    # RPC URL will be created when fork is initialized
    RPC_URL="pending"
    AVAILABLE=true
    return 0
  fi
  return 1
}

detect_anvil() {
  # Check if anvil is running on default port
  if command -v curl &> /dev/null; then
    local response
    response=$(curl -s -X POST -H "Content-Type: application/json" \
      --data '{"jsonrpc":"2.0","method":"web3_clientVersion","id":1}' \
      http://localhost:8545 2>/dev/null || echo "")

    if [[ "$response" == *"anvil"* ]]; then
      PROVIDER="anvil"
      RPC_URL="http://localhost:8545"
      AVAILABLE=true
      return 0
    fi
  fi
  return 1
}

detect_hardhat() {
  # Check if hardhat is running on default port
  if command -v curl &> /dev/null; then
    local response
    response=$(curl -s -X POST -H "Content-Type: application/json" \
      --data '{"jsonrpc":"2.0","method":"web3_clientVersion","id":1}' \
      http://localhost:8545 2>/dev/null || echo "")

    if [[ "$response" == *"hardhat"* ]] || [[ "$response" == *"HardhatNetwork"* ]]; then
      PROVIDER="hardhat"
      RPC_URL="http://localhost:8545"
      AVAILABLE=true
      return 0
    fi
  fi
  return 1
}

detect_local_node() {
  # Check if any Ethereum node is running on default port
  if command -v curl &> /dev/null; then
    local response
    response=$(curl -s -X POST -H "Content-Type: application/json" \
      --data '{"jsonrpc":"2.0","method":"eth_chainId","id":1}' \
      http://localhost:8545 2>/dev/null || echo "")

    if [[ "$response" == *"result"* ]]; then
      PROVIDER="local"
      RPC_URL="http://localhost:8545"
      AVAILABLE=true
      return 0
    fi
  fi
  return 1
}

# ═══════════════════════════════════════════════════════════════════════════
# Main Detection Logic
# ═══════════════════════════════════════════════════════════════════════════

# Try detection in priority order
detect_tenderly || detect_anvil || detect_hardhat || detect_local_node || true

# ═══════════════════════════════════════════════════════════════════════════
# Output
# ═══════════════════════════════════════════════════════════════════════════

if [[ "$JSON_OUTPUT" == "true" ]]; then
  if [[ "$AVAILABLE" == "true" ]]; then
    echo "{\"provider\":\"$PROVIDER\",\"rpc_url\":\"$RPC_URL\",\"available\":true}"
  else
    echo "{\"provider\":null,\"rpc_url\":null,\"available\":false}"
  fi
else
  if [[ "$AVAILABLE" == "true" ]]; then
    echo "provider=$PROVIDER"
    echo "rpc_url=$RPC_URL"
    echo "available=true"
  else
    echo "provider="
    echo "rpc_url="
    echo "available=false"
  fi
fi

exit 0
