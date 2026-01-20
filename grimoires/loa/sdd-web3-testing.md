# SDD: Sigil Web3 Testing Capability

**Version:** 1.2.0
**Status:** Draft (Revised)
**Author:** Claude (from /architect)
**Date:** 2026-01-19
**PRD Reference:** `grimoires/loa/prd-web3-testing.md`

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | 2026-01-19 | **UNIX philosophy interface:** Scenarios as positional args (no flags), `web3.yaml` for config, fork/live modes as simple modifiers, Loa-style command design |
| 1.1.0 | 2026-01-19 | **Major architecture revision:** Three-layer interception model (state store + EIP-1193 + fetch), reactive state with event emission, function selector-based contract mocking, valid checksummed addresses in presets, fixture app testing strategy |
| 1.0.0 | 2026-01-18 | Initial draft |

---

## Design Principles

### UNIX Philosophy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INTERFACE DESIGN PRINCIPLES                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. SCENARIOS REPLACE FLAGS                                                  │
│     /ward url connected       NOT    /ward url --web3 --preset connected     │
│                                                                              │
│  2. CONFIG OVER FLAGS                                                        │
│     Complex setup in web3.yaml, commands stay simple                         │
│                                                                              │
│  3. SENSIBLE DEFAULTS                                                        │
│     Works without config. Config adds customization.                         │
│                                                                              │
│  4. POSITIONAL ARGS ARE MEANINGFUL                                           │
│     /ward <url> [scenario] [mode]                                            │
│     /test-flow <url> <flow> [mode]                                           │
│                                                                              │
│  5. AUTO-DETECTION                                                           │
│     Fork provider detected from environment, not flags                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Three Modes

| Mode | What it does | When to use |
|------|--------------|-------------|
| **mock** | Full mocking, no network | Default. Fast, deterministic, offline. |
| **fork** | Real contract state, mock wallet | Testing against real data without transactions. |
| **live** | Real testnet | E2E testing with deployed contracts. |

---

## 1. Executive Summary

This document describes the technical architecture for adding Web3 dApp testing capabilities to Sigil. The implementation enables AI-driven validation of wallet-dependent UI components without requiring real blockchain connections or wallet extensions.

**Key Deliverables:**
1. `web3-testing` skill — Browser context injection for mock wallet state
2. `/snapshot` command — Screenshot capture with Web3 state support
3. `/test-flow` command — Multi-step flow execution and validation
4. `/ward --web3` extension — Visual validation with mock state injection

**Architecture Principle:** Intercept at three layers—EIP-1193 provider, fetch transport, and RPC responses—to fully mock the viem/wagmi stack without application modification. State is reactive with event emission to trigger wagmi re-renders.

---

## 2. System Architecture

### 2.1 High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SIGIL FRAMEWORK                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────┐    ┌──────────────────────┐                       │
│  │   /ward --web3       │    │   /snapshot          │                       │
│  │   /test-flow         │    │                      │                       │
│  │                      │    │   (commands)         │                       │
│  └──────────┬───────────┘    └──────────┬───────────┘                       │
│             │                           │                                    │
│             ▼                           ▼                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     web3-testing SKILL                                │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │ State       │  │ Injection   │  │ Flow        │  │ Screenshot  │  │   │
│  │  │ Manager     │  │ Script      │  │ Executor    │  │ Capture     │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     agent-browser SKILL (existing)                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │ Navigation  │  │ Interaction │  │ Snapshot    │  │ Screenshot  │  │   │
│  │  │ (open, etc) │  │ (click,fill)│  │ (refs)      │  │ (capture)   │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
└────────────────────────────────────┼─────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TARGET dApp (Browser)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                   INJECTED MOCK LAYER                           │        │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │        │
│  │  │ Mock        │  │ Mock        │  │ Mock        │             │        │
│  │  │ Connector   │  │ Balance     │  │ Contract    │             │        │
│  │  │             │  │ Provider    │  │ Reads       │             │        │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │        │
│  └─────────┼────────────────┼────────────────┼─────────────────────┘        │
│            │                │                │                               │
│            ▼                ▼                ▼                               │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                   wagmi / viem LAYER                            │        │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │        │
│  │  │ useAccount  │  │ useBalance  │  │ useRead     │             │        │
│  │  │             │  │             │  │ Contract    │             │        │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                   REACT APPLICATION                             │        │
│  │  ┌─────────────────────────────────────────────────────┐       │        │
│  │  │   Components (ClaimButton, BalanceDisplay, etc.)    │       │        │
│  │  └─────────────────────────────────────────────────────┘       │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INJECTION SEQUENCE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. User invokes:  /ward http://localhost:3000/claim --web3                  │
│                                                                              │
│  2. web3-testing skill:                                                      │
│     ├── Parse flags (--web3, --balance, --address, --mock)                   │
│     ├── Generate injection script with mock state                            │
│     └── Pass to agent-browser                                                │
│                                                                              │
│  3. agent-browser:                                                           │
│     ├── Launch browser (headless)                                            │
│     ├── BEFORE page load: page.evaluateOnNewDocument(injectionScript)        │
│     ├── Navigate to URL                                                      │
│     └── Wait for network idle                                                │
│                                                                              │
│  4. Browser context (THREE-LAYER INTERCEPTION):                              │
│     ├── Injection script runs FIRST (before any app code)                    │
│     ├── Layer 1: Reactive state store (SigilMockStore)                       │
│     ├── Layer 2: EIP-1193 provider with event emitter (window.ethereum)      │
│     ├── Layer 3: Fetch interception for viem transport RPC calls             │
│     └── Stores state in sessionStorage for navigation persistence            │
│                                                                              │
│  5. React app loads:                                                         │
│     ├── wagmi detects patched connector                                      │
│     ├── useAccount() returns mock address                                    │
│     ├── useBalance() returns mock balances                                   │
│     └── Components render with mock data                                     │
│                                                                              │
│  6. agent-browser continues:                                                 │
│     ├── Snapshot interactive elements                                        │
│     ├── Validate touch targets, focus rings                                  │
│     ├── Capture screenshot                                                   │
│     └── Return results to skill                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### 3.1 Dependencies

| Component | Technology | Justification |
|-----------|------------|---------------|
| Browser automation | agent-browser (existing) | Already integrated with Sigil |
| Mock state | JavaScript injection | No app modification required |
| State persistence | sessionStorage | Survives navigation within origin |
| Screenshot storage | File system | Integrates with grimoires pattern |
| PR integration | gh CLI | Standard GitHub workflow tool |

### 3.2 Target Framework Compatibility

| Framework | Version | Support Level |
|-----------|---------|---------------|
| wagmi | v2.x | Full (primary target) |
| viem | v2.x | Full |
| React | 18+ | Full |
| Next.js | 13+, 14+ | Full (App Router and Pages) |
| ethers.js | v6.x | Partial (via provider patching) |

---

## 4. Component Design

### 4.1 web3-testing Skill

**Location:** `.claude/skills/web3-testing/SKILL.md`

#### 4.1.1 Skill Structure

```
.claude/skills/web3-testing/
├── SKILL.md                    # Main skill definition
├── resources/
│   ├── injection-script.js     # Browser injection template
│   ├── state-presets.json      # Pre-built mock scenarios
│   └── flow-definitions.json   # Built-in flow templates
└── templates/
    └── flow-report.md          # Flow execution report template
```

#### 4.1.2 Core Functions

```typescript
// Conceptual interface (implemented as skill workflow)

interface Web3MockState {
  connected: boolean
  address: `0x${string}`            // Valid checksummed address
  chainId: number
  balances: Record<string, string>  // token symbol → human-readable balance
  contractReads: Record<string, any> // selector or fnName → return value
  transactionState: 'idle' | 'pending' | 'success' | 'error'
  transactionHash?: `0x${string}`
  transactionError?: string
}

/**
 * Contract read mocking supports three key formats:
 *
 * 1. Function selector:  "0x70a08231" → value
 * 2. Address + selector: "0xContract:0x70a08231" → value
 * 3. Function name:      "balanceOf" → value (common functions only)
 *
 * Known function selectors (auto-resolved):
 * - 0x70a08231: balanceOf(address)
 * - 0x18160ddd: totalSupply()
 * - 0x313ce567: decimals()
 * - 0x06fdde03: name()
 * - 0x95d89b41: symbol()
 * - 0xdd62ed3e: allowance(address,address)
 */
type ContractReadKey = `0x${string}` | `0x${string}:0x${string}` | string

interface Web3TestingSkill {
  // State management
  createMockState(options: Partial<Web3MockState>): Web3MockState
  generateInjectionScript(state: Web3MockState): string

  // Browser integration (via agent-browser evaluateOnNewDocument)
  injectState(url: string, state: Web3MockState): Promise<void>

  // Runtime state updates (triggers wagmi re-renders via events)
  updateState(stateUpdate: Partial<Web3MockState>): Promise<void>

  // Flow execution
  executeFlow(flowName: string, url: string): Promise<FlowResult>
  executeCustomFlow(steps: FlowStep[], url: string): Promise<FlowResult>

  // Screenshot capture
  captureState(name: string): Promise<string>  // returns file path
}

// Global store exposed on window for runtime updates
interface SigilMockStore {
  state: Web3MockState
  update(partial: Partial<Web3MockState>): void
  on(event: 'accountsChanged' | 'chainChanged' | 'connect' | 'disconnect', cb: Function): void
  removeListener(event: string, cb: Function): void
}

declare global {
  interface Window {
    __SIGIL_MOCK_STORE__: SigilMockStore
    __SIGIL_WEB3_MOCK__: Web3MockState // Read-only snapshot for debugging
  }
}
```

#### 4.1.3 Injection Script Architecture

The injection script implements a three-layer interception strategy to fully mock viem/wagmi:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     THREE-LAYER INTERCEPTION MODEL                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  LAYER 1: REACTIVE STATE STORE                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  SigilMockStore                                                      │   │
│  │  • Mutable state with getter pattern                                 │   │
│  │  • Event emission on state changes                                   │   │
│  │  • sessionStorage persistence                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼                                              │
│  LAYER 2: EIP-1193 PROVIDER                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  window.ethereum                                                     │   │
│  │  • Full EIP-1193 request() method                                    │   │
│  │  • EventEmitter for accountsChanged, chainChanged                    │   │
│  │  • Reads from SigilMockStore.state (always current)                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼                                              │
│  LAYER 3: FETCH TRANSPORT INTERCEPTION                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  window.fetch (monkey-patched)                                       │   │
│  │  • Intercepts JSON-RPC calls to known RPC URLs                       │   │
│  │  • Returns mock responses for eth_call, eth_getBalance, etc.         │   │
│  │  • Allows viem publicClient reads without real network               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

```javascript
// resources/injection-script.js (template)
(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // LAYER 1: REACTIVE STATE STORE
  // ═══════════════════════════════════════════════════════════════════════════

  const INITIAL_STATE = __SIGIL_MOCK_STATE_PLACEHOLDER__;

  // Restore from sessionStorage if navigating within origin
  const storedState = sessionStorage.getItem('__sigil_web3_mock__');
  const initialState = storedState ? JSON.parse(storedState) : INITIAL_STATE;

  const SigilMockStore = {
    _state: initialState,
    _listeners: new Map(),

    // Getter ensures handlers always read current state
    get state() {
      return this._state;
    },

    // Update state and emit relevant events
    update(partial) {
      const prev = this._state;
      this._state = { ...this._state, ...partial };

      // Persist to sessionStorage
      sessionStorage.setItem('__sigil_web3_mock__', JSON.stringify(this._state));

      // Emit wagmi-compatible events
      if (prev.address !== this._state.address) {
        const accounts = this._state.connected && this._state.address
          ? [this._state.address]
          : [];
        this._emit('accountsChanged', accounts);
      }
      if (prev.chainId !== this._state.chainId) {
        this._emit('chainChanged', '0x' + this._state.chainId.toString(16));
      }
      if (prev.connected !== this._state.connected) {
        if (this._state.connected) {
          this._emit('connect', { chainId: '0x' + this._state.chainId.toString(16) });
        } else {
          this._emit('disconnect', { error: { code: 4900, message: 'Disconnected' } });
        }
      }

      // Custom event for React components that want to listen
      window.dispatchEvent(new CustomEvent('sigil-state-update', { detail: this._state }));
    },

    on(event, callback) {
      if (!this._listeners.has(event)) {
        this._listeners.set(event, new Set());
      }
      this._listeners.get(event).add(callback);
    },

    removeListener(event, callback) {
      const listeners = this._listeners.get(event);
      if (listeners) {
        listeners.delete(callback);
      }
    },

    _emit(event, data) {
      const listeners = this._listeners.get(event);
      if (listeners) {
        listeners.forEach(callback => {
          try {
            callback(data);
          } catch (e) {
            console.error('[Sigil] Event listener error:', e);
          }
        });
      }
    }
  };

  // Expose store globally for state updates from test flows
  window.__SIGIL_MOCK_STORE__ = SigilMockStore;
  window.__SIGIL_WEB3_MOCK__ = SigilMockStore.state; // Legacy compat (read-only snapshot)

  // ═══════════════════════════════════════════════════════════════════════════
  // LAYER 2: EIP-1193 PROVIDER WITH EVENT EMITTER
  // ═══════════════════════════════════════════════════════════════════════════

  const mockProvider = {
    // Standard detection flags
    isMetaMask: true,
    isSigil: true,
    isConnected: () => SigilMockStore.state.connected,

    // Getters for legacy dapp compatibility
    get selectedAddress() {
      return SigilMockStore.state.connected ? SigilMockStore.state.address : null;
    },
    get chainId() {
      return '0x' + SigilMockStore.state.chainId.toString(16);
    },
    get networkVersion() {
      return String(SigilMockStore.state.chainId);
    },

    // EIP-1193 request method
    async request({ method, params }) {
      const state = SigilMockStore.state; // Always read current state

      switch (method) {
        case 'eth_accounts':
          return state.connected && state.address ? [state.address] : [];

        case 'eth_requestAccounts':
          if (!state.address) {
            throw { code: 4001, message: 'User rejected the request' };
          }
          // Simulate connection flow
          if (!state.connected) {
            SigilMockStore.update({ connected: true });
          }
          return [state.address];

        case 'eth_chainId':
          return '0x' + state.chainId.toString(16);

        case 'net_version':
          return String(state.chainId);

        case 'eth_getBalance': {
          const [address] = params || [];
          const ethBalance = state.balances?.ETH || '0';
          // Use string parsing to preserve precision for large values
          const weiValue = parseEther(ethBalance);
          return '0x' + weiValue.toString(16);
        }

        case 'eth_call':
          return handleContractRead(params, state);

        case 'eth_estimateGas':
          return '0x5208'; // 21000 gas (standard transfer)

        case 'eth_gasPrice':
          return '0x' + (30n * 10n ** 9n).toString(16); // 30 gwei

        case 'eth_getTransactionCount':
          return '0x0';

        case 'eth_sendTransaction':
          return handleTransaction(state);

        case 'eth_getTransactionReceipt':
          return handleTransactionReceipt(params, state);

        case 'wallet_switchEthereumChain': {
          const [{ chainId }] = params;
          const newChainId = parseInt(chainId, 16);
          SigilMockStore.update({ chainId: newChainId });
          return null;
        }

        case 'wallet_addEthereumChain':
          return null; // Accept silently

        case 'personal_sign':
        case 'eth_signTypedData_v4':
          // Return a mock signature
          return '0x' + '1'.repeat(130);

        default:
          console.log('[Sigil Mock] Unhandled method:', method, params);
          return null;
      }
    },

    // Event emitter interface (delegates to store)
    on(event, callback) {
      SigilMockStore.on(event, callback);
      return this;
    },

    removeListener(event, callback) {
      SigilMockStore.removeListener(event, callback);
      return this;
    },

    // Deprecated but some dapps use it
    enable() {
      return this.request({ method: 'eth_requestAccounts' });
    },

    // Some dapps check for this
    _metamask: {
      isUnlocked: () => Promise.resolve(true)
    }
  };

  // Inject provider ALWAYS (even when disconnected - needed for connect flows)
  Object.defineProperty(window, 'ethereum', {
    value: mockProvider,
    writable: false,
    configurable: true // Allow re-injection if needed
  });

  // Also announce via EIP-6963 (modern wallet discovery)
  window.dispatchEvent(new CustomEvent('eip6963:announceProvider', {
    detail: {
      info: {
        uuid: 'sigil-mock-provider',
        name: 'Sigil Mock Wallet',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
        rdns: 'dev.sigil.mock'
      },
      provider: mockProvider
    }
  }));

  // ═══════════════════════════════════════════════════════════════════════════
  // LAYER 3: FETCH INTERCEPTION FOR VIEM TRANSPORT
  // ═══════════════════════════════════════════════════════════════════════════

  const originalFetch = window.fetch;
  const RPC_URL_PATTERNS = [
    /^https?:\/\/.*\.infura\.io/,
    /^https?:\/\/.*\.alchemy\.com/,
    /^https?:\/\/.*\.ankr\.com/,
    /^https?:\/\/.*\.quicknode\.com/,
    /^https?:\/\/rpc\./,
    /^https?:\/\/.*mainnet/,
    /^https?:\/\/.*goerli/,
    /^https?:\/\/.*sepolia/,
    /^https?:\/\/localhost:\d+/, // Local nodes
    /^https?:\/\/127\.0\.0\.1:\d+/
  ];

  function isRpcUrl(url) {
    const urlStr = typeof url === 'string' ? url : url?.toString?.() || '';
    return RPC_URL_PATTERNS.some(pattern => pattern.test(urlStr));
  }

  window.fetch = async function(input, init) {
    const url = typeof input === 'string' ? input : input?.url;

    // Only intercept RPC calls
    if (!isRpcUrl(url) || !init?.body) {
      return originalFetch.call(window, input, init);
    }

    try {
      const body = JSON.parse(init.body);
      const state = SigilMockStore.state;

      // Handle batched requests
      if (Array.isArray(body)) {
        const results = await Promise.all(
          body.map(req => handleRpcRequest(req, state))
        );
        return new Response(JSON.stringify(results), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Single request
      const result = await handleRpcRequest(body, state);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (e) {
      // If parsing fails, fall through to real fetch
      console.log('[Sigil] Fetch intercept parse error, falling through:', e);
      return originalFetch.call(window, input, init);
    }
  };

  async function handleRpcRequest(req, state) {
    const { id, method, params } = req;

    let result;
    try {
      result = await mockProvider.request({ method, params });
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: error.code || -32000, message: error.message }
      };
    }

    return {
      jsonrpc: '2.0',
      id,
      result
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // Parse ether string to wei BigInt (preserves precision)
  function parseEther(etherString) {
    const [whole, decimal = ''] = etherString.split('.');
    const paddedDecimal = (decimal + '000000000000000000').slice(0, 18);
    return BigInt(whole + paddedDecimal);
  }

  // Contract read handler with function selector mapping
  function handleContractRead(params, state) {
    const [callParams] = params || [{}];
    const { to, data } = callParams;

    if (!data || data.length < 10) {
      return '0x';
    }

    // Extract function selector (first 4 bytes)
    const selector = data.slice(0, 10).toLowerCase();

    // Check contractReads for selector-based mock
    const contractReads = state.contractReads || {};

    // Try exact selector match: "0x70a08231" (balanceOf)
    if (contractReads[selector]) {
      return encodeResult(contractReads[selector]);
    }

    // Try address + selector match: "0xContractAddr:0x70a08231"
    const addressKey = to ? `${to.toLowerCase()}:${selector}` : null;
    if (addressKey && contractReads[addressKey]) {
      return encodeResult(contractReads[addressKey]);
    }

    // Try human-readable function name match with selector lookup
    const KNOWN_SELECTORS = {
      '0x70a08231': 'balanceOf',      // balanceOf(address)
      '0x18160ddd': 'totalSupply',    // totalSupply()
      '0x313ce567': 'decimals',       // decimals()
      '0x06fdde03': 'name',           // name()
      '0x95d89b41': 'symbol',         // symbol()
      '0xdd62ed3e': 'allowance',      // allowance(address,address)
      '0x01ffc9a7': 'supportsInterface', // supportsInterface(bytes4)
    };

    const fnName = KNOWN_SELECTORS[selector];
    if (fnName && contractReads[fnName] !== undefined) {
      return encodeResult(contractReads[fnName]);
    }

    // Default responses for common functions
    switch (selector) {
      case '0x313ce567': // decimals()
        return '0x' + (18).toString(16).padStart(64, '0');
      case '0x06fdde03': // name()
        return encodeString('Mock Token');
      case '0x95d89b41': // symbol()
        return encodeString('MOCK');
      case '0x18160ddd': // totalSupply()
        return '0x' + (10n ** 27n).toString(16).padStart(64, '0'); // 1B tokens
      default:
        return '0x' + '0'.repeat(64); // Return zero
    }
  }

  // ABI encode result based on type
  function encodeResult(value) {
    if (typeof value === 'string') {
      if (value.startsWith('0x')) return value;
      // Assume it's a number string
      return '0x' + BigInt(value).toString(16).padStart(64, '0');
    }
    if (typeof value === 'number' || typeof value === 'bigint') {
      return '0x' + BigInt(value).toString(16).padStart(64, '0');
    }
    if (typeof value === 'boolean') {
      return '0x' + (value ? '1' : '0').padStart(64, '0');
    }
    return '0x' + '0'.repeat(64);
  }

  // ABI encode string
  function encodeString(str) {
    const hex = [...str].map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
    const offset = '0000000000000000000000000000000000000000000000000000000000000020';
    const length = str.length.toString(16).padStart(64, '0');
    const paddedHex = hex.padEnd(Math.ceil(hex.length / 64) * 64, '0');
    return '0x' + offset + length + paddedHex;
  }

  // Transaction handler
  function handleTransaction(state) {
    if (state.transactionState === 'error') {
      throw { code: 4001, message: state.transactionError || 'User rejected the request' };
    }
    // Return mock transaction hash
    const hash = state.transactionHash || '0x' + 'a'.repeat(64);

    // If pending, simulate transition to success after delay
    if (state.transactionState === 'pending') {
      setTimeout(() => {
        SigilMockStore.update({
          transactionState: 'success',
          transactionHash: hash
        });
      }, 2000);
    }

    return hash;
  }

  // Transaction receipt handler
  function handleTransactionReceipt(params, state) {
    const [txHash] = params || [];

    if (state.transactionState === 'pending') {
      return null; // Receipt not yet available
    }

    if (state.transactionState === 'success') {
      return {
        transactionHash: txHash || state.transactionHash,
        blockNumber: '0x' + (1000000).toString(16),
        blockHash: '0x' + 'b'.repeat(64),
        from: state.address,
        to: '0x' + '1'.repeat(40),
        gasUsed: '0x5208',
        cumulativeGasUsed: '0x5208',
        status: '0x1', // Success
        logs: []
      };
    }

    return null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('[Sigil] Web3 mock injected', {
    connected: SigilMockStore.state.connected,
    address: SigilMockStore.state.address,
    chainId: SigilMockStore.state.chainId
  });
})();
```

#### 4.1.4 State Presets

All addresses are valid checksummed Ethereum addresses. Use these for deterministic testing.

```json
// resources/state-presets.json
{
  "disconnected": {
    "connected": false,
    "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "chainId": 1,
    "balances": {},
    "contractReads": {},
    "transactionState": "idle"
  },
  "default": {
    "connected": true,
    "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "chainId": 1,
    "balances": {
      "ETH": "10.0"
    },
    "contractReads": {},
    "transactionState": "idle"
  },
  "whale": {
    "connected": true,
    "address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "chainId": 1,
    "balances": {
      "ETH": "1000.0",
      "USDC": "1000000.0",
      "WETH": "500.0"
    },
    "contractReads": {
      "balanceOf": "1000000000000000000000"
    },
    "transactionState": "idle"
  },
  "empty": {
    "connected": true,
    "address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "chainId": 1,
    "balances": {
      "ETH": "0.001"
    },
    "contractReads": {},
    "transactionState": "idle"
  },
  "pending": {
    "connected": true,
    "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "chainId": 1,
    "balances": {
      "ETH": "10.0"
    },
    "contractReads": {},
    "transactionState": "pending",
    "transactionHash": "0xabc123def456789abc123def456789abc123def456789abc123def456789abc1"
  },
  "success": {
    "connected": true,
    "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "chainId": 1,
    "balances": {
      "ETH": "9.95"
    },
    "contractReads": {},
    "transactionState": "success",
    "transactionHash": "0xabc123def456789abc123def456789abc123def456789abc123def456789abc1"
  },
  "error": {
    "connected": true,
    "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "chainId": 1,
    "balances": {
      "ETH": "10.0"
    },
    "contractReads": {},
    "transactionState": "error",
    "transactionError": "User rejected the request"
  },
  "arbitrum": {
    "connected": true,
    "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "chainId": 42161,
    "balances": {
      "ETH": "5.0",
      "ARB": "10000.0"
    },
    "contractReads": {},
    "transactionState": "idle"
  },
  "base": {
    "connected": true,
    "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "chainId": 8453,
    "balances": {
      "ETH": "2.0"
    },
    "contractReads": {},
    "transactionState": "idle"
  }
}
```

**Note:** Addresses `0xf39F...`, `0x7099...`, `0x3C44...` are Foundry/Anvil default test accounts with well-known private keys. They are used here for determinism in testing scenarios.

---

### 4.2 /snapshot Command

**Location:** `.claude/commands/snapshot.md`

#### 4.2.1 Command Definition

```yaml
---
name: "snapshot"
version: "2.0.0"
agent: "web3-testing"
description: |
  Capture screenshots for PR documentation with optional Web3 state.

  Simple invocation: /snapshot <url> [scenario] [label]

arguments:
  - name: "url"
    type: "string"
    required: true
    description: "URL to capture"

  - name: "scenario"
    type: "string"
    required: false
    description: "Web3 scenario (connected, whale, etc.)"

  - name: "label"
    type: "string"
    required: false
    description: "Screenshot label (before, after, or custom)"
    notes: |
      "before" - Stashes changes, captures on main branch
      "after"  - Captures current branch state
      Other    - Custom label for the screenshot

outputs:
  - path: "grimoires/sigil/snapshots/"
    type: "directory"
    description: "Screenshot storage"
---
```

**Invocation:**

```bash
# Simple capture
/snapshot http://localhost:3000/claim

# With Web3 scenario
/snapshot http://localhost:3000/claim connected

# Before/after for PR comparison
/snapshot http://localhost:3000/claim connected before
# ... make changes ...
/snapshot http://localhost:3000/claim connected after
```

#### 4.2.2 Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        /snapshot WORKFLOW                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  STEP 1: Parse Arguments                                                     │
│  ├── Determine capture mode (single, before/after, flow)                     │
│  ├── Parse Web3 flags (--web3, --address, --balance)                         │
│  └── Validate URL format                                                     │
│                                                                              │
│  STEP 2: Prepare Capture                                                     │
│  ├── If --before: git stash && git checkout main                             │
│  ├── If --web3: Generate mock state from flags                               │
│  └── Create output directory: grimoires/sigil/snapshots/{date}/              │
│                                                                              │
│  STEP 3: Inject and Navigate                                                 │
│  ├── Generate injection script (if Web3)                                     │
│  ├── agent-browser open {url} (with evaluateOnNewDocument)                   │
│  └── agent-browser wait --load networkidle                                   │
│                                                                              │
│  STEP 4: Capture                                                             │
│  ├── Single: agent-browser screenshot {path}                                 │
│  ├── Before/After: Capture, label appropriately                              │
│  └── Flow: Iterate steps, capture each state                                 │
│                                                                              │
│  STEP 5: Cleanup                                                             │
│  ├── If --before: git stash pop                                              │
│  └── agent-browser close                                                     │
│                                                                              │
│  STEP 6: Generate Output                                                     │
│  ├── If before/after: Generate comparison markdown                           │
│  ├── If flow: Generate flow-report.md                                        │
│  └── If --attach-pr: Update PR description                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 4.2.3 PR Attachment Logic

```bash
# Get current PR number
PR_NUMBER=$(gh pr view --json number -q '.number' 2>/dev/null)

if [ -n "$PR_NUMBER" ]; then
  # Get existing body
  EXISTING_BODY=$(gh pr view --json body -q '.body')

  # Generate image section
  IMAGE_SECTION="
## Visual Changes

| Before | After |
|--------|-------|
| ![before](grimoires/sigil/snapshots/{date}/{name}-before.png) | ![after](grimoires/sigil/snapshots/{date}/{name}-after.png) |
"

  # Append to PR body
  gh pr edit $PR_NUMBER --body "${EXISTING_BODY}${IMAGE_SECTION}"
fi
```

---

### 4.3 /test-flow Command

**Location:** `.claude/commands/test-flow.md`

#### 4.3.1 Command Definition

```yaml
---
name: "test-flow"
version: "2.0.0"
agent: "web3-testing"
description: |
  Execute and validate complete user flows with automatic state management.

  Simple invocation: /test-flow <url> <flow> [mode]

  Built-in flows: connect, claim, switch, error
  Custom flows: Define in grimoires/sigil/web3.yaml

arguments:
  - name: "url"
    type: "string"
    required: true
    description: "Base URL for flow"

  - name: "flow"
    type: "string"
    required: true
    description: "Flow name (built-in or from web3.yaml)"
    examples:
      - "connect"   # Wallet connection flow
      - "claim"     # Full claim with states
      - "switch"    # Chain switching
      - "error"     # Error recovery
      - "stake"     # Custom flow from web3.yaml

  - name: "mode"
    type: "string"
    required: false
    description: "Execution mode"
    default: "mock"
    options:
      - "mock"   # Full mocking (default)
      - "fork"   # Real contract state

outputs:
  - path: "grimoires/sigil/snapshots/flows/{flow}/"
    type: "directory"
    description: "Flow screenshots"
  - path: "grimoires/sigil/snapshots/flows/{flow}/report.md"
    type: "file"
    description: "Flow execution report"
---
```

**Invocation:**

```bash
# Run built-in flow (mock mode)
/test-flow http://localhost:3000 claim

# Run with fork mode
/test-flow http://localhost:3000 claim fork

# Run custom flow (defined in web3.yaml)
/test-flow http://localhost:3000 stake
```

#### 4.3.2 Flow Definition Schema

```json
// resources/flow-definitions.json
{
  "connect-wallet": {
    "name": "Connect Wallet",
    "description": "Simulate wallet connection flow with proper event emission",
    "steps": [
      {
        "action": "inject",
        "comment": "Start with provider installed but disconnected",
        "state": {
          "connected": false,
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "chainId": 1,
          "balances": { "ETH": "10.0" }
        }
      },
      {
        "action": "screenshot",
        "name": "01-disconnected"
      },
      {
        "action": "click",
        "selector": "[data-testid='connect-button'], button:has-text('Connect')"
      },
      {
        "action": "update",
        "comment": "Triggers accountsChanged event → wagmi re-renders",
        "state": { "connected": true }
      },
      {
        "action": "wait",
        "duration": 300,
        "comment": "Allow React re-render"
      },
      {
        "action": "screenshot",
        "name": "02-connected"
      }
    ]
  },
  "claim-rewards": {
    "name": "Claim Rewards",
    "description": "Full claim flow with confirmation and transaction lifecycle",
    "steps": [
      {
        "action": "inject",
        "state": {
          "connected": true,
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "chainId": 1,
          "balances": { "ETH": "10.0" },
          "contractReads": {
            "0x70a08231": "100000000000000000000",
            "balanceOf": "100000000000000000000"
          },
          "transactionState": "idle"
        }
      },
      {
        "action": "navigate",
        "path": "/claim"
      },
      {
        "action": "screenshot",
        "name": "01-claim-page"
      },
      {
        "action": "click",
        "selector": "[data-testid='claim-button'], button:has-text('Claim')"
      },
      {
        "action": "screenshot",
        "name": "02-confirmation"
      },
      {
        "action": "click",
        "selector": "[data-testid='confirm-button'], button:has-text('Confirm')"
      },
      {
        "action": "update",
        "state": {
          "transactionState": "pending",
          "transactionHash": "0xabc123def456789abc123def456789abc123def456789abc123def456789abc1"
        }
      },
      {
        "action": "screenshot",
        "name": "03-pending"
      },
      {
        "action": "wait",
        "duration": 1500
      },
      {
        "action": "update",
        "state": {
          "transactionState": "success",
          "balances": { "ETH": "10.05" },
          "contractReads": {
            "0x70a08231": "0",
            "balanceOf": "0"
          }
        }
      },
      {
        "action": "screenshot",
        "name": "04-success"
      }
    ]
  },
  "switch-chain": {
    "name": "Switch Chain",
    "description": "Test chain switching flow",
    "steps": [
      {
        "action": "inject",
        "state": {
          "connected": true,
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "chainId": 1,
          "balances": { "ETH": "10.0" }
        }
      },
      {
        "action": "screenshot",
        "name": "01-mainnet"
      },
      {
        "action": "click",
        "selector": "[data-testid='chain-selector'], button:has-text('Ethereum')"
      },
      {
        "action": "click",
        "selector": "[data-testid='chain-arbitrum'], button:has-text('Arbitrum')"
      },
      {
        "action": "update",
        "comment": "Triggers chainChanged event",
        "state": {
          "chainId": 42161,
          "balances": { "ETH": "5.0", "ARB": "10000.0" }
        }
      },
      {
        "action": "wait",
        "duration": 300
      },
      {
        "action": "screenshot",
        "name": "02-arbitrum"
      }
    ]
  },
  "transaction-error": {
    "name": "Transaction Error",
    "description": "Test error handling and recovery UI",
    "steps": [
      {
        "action": "inject",
        "preset": "default"
      },
      {
        "action": "navigate",
        "path": "/send"
      },
      {
        "action": "fill",
        "selector": "[data-testid='amount-input']",
        "value": "1.0"
      },
      {
        "action": "click",
        "selector": "[data-testid='send-button']"
      },
      {
        "action": "update",
        "state": {
          "transactionState": "error",
          "transactionError": "User rejected the request"
        }
      },
      {
        "action": "screenshot",
        "name": "01-error-state"
      },
      {
        "action": "click",
        "selector": "[data-testid='retry-button'], button:has-text('Retry')"
      },
      {
        "action": "update",
        "state": { "transactionState": "idle" }
      },
      {
        "action": "screenshot",
        "name": "02-recovered"
      }
    ]
  }
}
```

**Action Types:**

| Action | Description |
|--------|-------------|
| `inject` | Initial state injection (before page load or on navigation) |
| `update` | Runtime state update via `store.update()` — triggers events |
| `screenshot` | Capture screenshot with name |
| `click` | Click element by CSS selector |
| `fill` | Fill input field |
| `navigate` | Navigate to path (relative to base URL) |
| `wait` | Wait for duration (ms) or selector |

**Note:** Use `inject` for initial state and `update` for runtime changes. Only `update` triggers wagmi event emission.

#### 4.3.3 Step DSL for Custom Flows

```
Step syntax: action:target

Actions:
  navigate:/path        - Navigate to path (appended to base URL)
  click:@ref           - Click element by agent-browser ref
  click:selector       - Click element by CSS selector
  fill:@ref=value      - Fill input with value
  inject:preset        - Inject preset state (default, whale, pending, etc.)
  inject:json          - Inject custom JSON state
  wait:ms              - Wait for duration
  wait:selector        - Wait for element
  screenshot:name      - Capture screenshot with name

Example:
  /test-flow http://localhost:3000 --steps "navigate:/claim,inject:default,screenshot:claim-page,click:@e3,screenshot:confirmation"
```

---

### 4.4 /ward Web3 Extension

**Modification to:** `.claude/commands/ward.md`

#### 4.4.1 Extended Arguments (Loa Style)

```yaml
# Add to existing ward.md arguments section
arguments:
  - name: "scope"
    type: "string"
    required: false
    description: "What to audit"
    default: "all"

  - name: "url"
    type: "string"
    required: false
    description: "URL for visual validation"

  - name: "scenario"
    type: "string"
    required: false
    description: "Web3 scenario name (presence implies web3 mode)"
    examples:
      - "connected"      # Default connected wallet
      - "whale"          # High balance
      - "disconnected"   # Wallet installed, not connected
      - "empty"          # Low balance
      - "pending"        # Mid-transaction
      - "error"          # Transaction failed
    notes: |
      Custom scenarios defined in grimoires/sigil/web3.yaml

  - name: "mode"
    type: "string"
    required: false
    description: "Execution mode"
    default: "mock"
    options:
      - "mock"   # Full mocking, no network (default)
      - "fork"   # Real contract state from forked chain
      - "live"   # Real testnet transactions
```

**Invocation Examples:**

```bash
# Standard ward (no web3)
/ward http://localhost:3000

# Web3 with scenario (mock mode)
/ward http://localhost:3000 connected
/ward http://localhost:3000 whale

# Web3 with fork mode
/ward http://localhost:3000 whale fork
```

#### 4.4.2 Detection Logic

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ARGUMENT PARSING                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Input: /ward http://localhost:3000 whale fork                               │
│                                                                              │
│  1. Is arg[0] a URL?                                                         │
│     └── Yes → url = "http://localhost:3000"                                  │
│                                                                              │
│  2. Is arg[1] a known scenario or in web3.yaml?                              │
│     └── Yes → scenario = "whale", web3_mode = true                           │
│                                                                              │
│  3. Is arg[2] a mode keyword (mock|fork|live)?                               │
│     └── Yes → mode = "fork"                                                  │
│                                                                              │
│  Result: { url, scenario: "whale", mode: "fork", web3: true }                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 4.4.3 Visual Validation Workflow

```
**2g. Visual Check (if URL provided):**

1. **Parse arguments:**
   - Detect if scenario provided → enable web3 mode
   - Load scenario from built-ins or web3.yaml
   - Detect mode (mock/fork/live)

2. **Prepare state (if web3 mode):**
   ```
   If mode == "mock":
     Generate injection script with full mocking

   If mode == "fork":
     Load fork config from web3.yaml or auto-detect
     Generate injection script with fork RPC redirect

   If mode == "live":
     Load live config from web3.yaml
     Inject test wallet only (minimal interception)
   ```

3. **Open URL with injection:**
   ```bash
   agent-browser open <url> --evaluate-on-new-document <injection-script>
   ```

4. **Standard validation:**
   - `agent-browser snapshot -i` — Get interactive elements
   - Verify touch targets ≥44px
   - Test focus rings
   - `agent-browser screenshot grimoires/sigil/observations/ward-$(date +%Y%m%d-%H%M%S).png`

5. **Close browser:**
   - `agent-browser close`
```

---

## 5. Data Architecture

### 5.1 File System Structure

```
grimoires/sigil/
├── snapshots/
│   ├── {YYYY-MM-DD}/
│   │   ├── {component}-before.png
│   │   ├── {component}-after.png
│   │   └── comparison.md
│   └── flows/
│       └── {flow-name}/
│           ├── step-01-{name}.png
│           ├── step-02-{name}.png
│           └── flow-report.md
├── observations/
│   └── ward-{YYYYMMDD}.png      # /ward screenshots
└── taste.md                      # Existing taste log
```

### 5.2 Flow Report Schema

```markdown
# Flow Report: {flow-name}

**Executed:** {timestamp}
**URL:** {base-url}
**Duration:** {total-ms}ms

## Steps

| Step | Action | Result | Screenshot |
|------|--------|--------|------------|
| 1 | Navigate to /claim | ✓ | [step-01](step-01-claim-page.png) |
| 2 | Click Claim button | ✓ | [step-02](step-02-confirmation.png) |
| 3 | Confirm transaction | ✓ | [step-03](step-03-pending.png) |
| 4 | Transaction success | ✓ | [step-04](step-04-success.png) |

## Physics Validation

| Check | Status | Details |
|-------|--------|---------|
| Touch targets | ✓ | All buttons ≥44px |
| Focus rings | ✓ | Visible on keyboard nav |
| Confirmation present | ✓ | Financial action confirmed |
| Error recovery | ✓ | Retry button present |

## State Transitions

```
disconnected → connected → pending → success
```

## Screenshots

### Step 1: Claim Page
![step-01](step-01-claim-page.png)

### Step 2: Confirmation
![step-02](step-02-confirmation.png)

...
```

---

## 6. API Design

### 6.1 Command Interface (UNIX Philosophy)

**Principle:** Scenarios replace flags. The presence of a scenario name implies Web3 mode.

```bash
# ═══════════════════════════════════════════════════════════════════════════
# /ward — Visual validation with optional Web3 state
# ═══════════════════════════════════════════════════════════════════════════

/ward <url> [scenario] [mode]

# No scenario = normal ward (no web3)
/ward http://localhost:3000

# Scenario name = web3 mode with that state
/ward http://localhost:3000 connected       # Wallet connected, 10 ETH
/ward http://localhost:3000 whale           # Whale balance (1000 ETH)
/ward http://localhost:3000 disconnected    # Wallet installed, not connected
/ward http://localhost:3000 empty           # Connected, nearly empty wallet
/ward http://localhost:3000 pending         # Mid-transaction state
/ward http://localhost:3000 error           # Transaction error state

# Mode modifier (optional, after scenario)
/ward http://localhost:3000 whale fork      # Real contract state from mainnet fork
/ward http://localhost:3000 whale live      # Real testnet (Berachain Bartio, etc.)

# ═══════════════════════════════════════════════════════════════════════════
# /test-flow — Multi-step flow execution
# ═══════════════════════════════════════════════════════════════════════════

/test-flow <url> <flow> [mode]

# Built-in flows (mock mode by default)
/test-flow http://localhost:3000 connect    # Connect wallet flow
/test-flow http://localhost:3000 claim      # Full claim flow
/test-flow http://localhost:3000 switch     # Chain switch flow
/test-flow http://localhost:3000 error      # Error recovery flow

# With fork mode
/test-flow http://localhost:3000 claim fork

# ═══════════════════════════════════════════════════════════════════════════
# /snapshot — Screenshot capture for PRs
# ═══════════════════════════════════════════════════════════════════════════

/snapshot <url> [scenario] [label]

# Simple capture
/snapshot http://localhost:3000/claim connected

# Before/after comparison (uses git)
/snapshot http://localhost:3000/claim connected before
/snapshot http://localhost:3000/claim connected after
```

**No flags needed.** Complex configuration lives in `grimoires/sigil/web3.yaml`.

### 6.2 Configuration File

All complex configuration lives in one file. Commands stay simple.

**Location:** `grimoires/sigil/web3.yaml`

```yaml
# grimoires/sigil/web3.yaml
# ═══════════════════════════════════════════════════════════════════════════
# Web3 Testing Configuration
# ═══════════════════════════════════════════════════════════════════════════

# Default chain for mock mode
chain: 1  # mainnet

# ───────────────────────────────────────────────────────────────────────────
# Fork Mode Configuration
# ───────────────────────────────────────────────────────────────────────────
fork:
  # Auto-detected from environment if not specified:
  #   TENDERLY_ACCESS_KEY → tenderly
  #   anvil on :8545      → anvil
  provider: tenderly  # tenderly | anvil | hardhat

  # Tenderly settings (if using tenderly)
  tenderly:
    project: my-project    # or use TENDERLY_PROJECT env
    # access_key from TENDERLY_ACCESS_KEY env

  # Anvil settings (if using anvil)
  anvil:
    url: http://localhost:8545

  # Fork from this block (optional, default: latest)
  block: latest

# ───────────────────────────────────────────────────────────────────────────
# Live Mode Configuration (Real Testnet)
# ───────────────────────────────────────────────────────────────────────────
live:
  chain: bartio  # berachain bartio testnet

  # Contract addresses for testing (deployed on testnet)
  contracts:
    claim: "0x..."
    staking: "0x..."

# ───────────────────────────────────────────────────────────────────────────
# Custom Scenarios
# ───────────────────────────────────────────────────────────────────────────
# Extend or override built-in scenarios
scenarios:
  # Custom scenario for your specific use case
  staker:
    balance: 50 ETH
    tokens:
      HONEY: 10000
    contracts:
      # Mock contract reads by selector or function name
      balanceOf: "5000000000000000000000"  # 5000 tokens staked
      pendingRewards: "100000000000000000000"  # 100 pending

  # High gas scenario
  congested:
    balance: 10 ETH
    gasPrice: 100 gwei

  # Multi-chain scenario
  arbitrum-whale:
    chain: 42161  # Arbitrum
    balance: 100 ETH
    tokens:
      ARB: 50000
      USDC: 100000

# ───────────────────────────────────────────────────────────────────────────
# Custom Flows
# ───────────────────────────────────────────────────────────────────────────
flows:
  # Define project-specific flows
  stake:
    - scenario: staker
    - navigate: /stake
    - screenshot: stake-page
    - click: "[data-testid='stake-input']"
    - fill: "1000"
    - click: "[data-testid='stake-button']"
    - update: { transactionState: pending }
    - screenshot: stake-pending
    - update: { transactionState: success }
    - screenshot: stake-success
```

**Auto-Detection:**

When no config exists, the system detects from environment:

| Environment | Fork Provider |
|-------------|---------------|
| `TENDERLY_ACCESS_KEY` set | Tenderly |
| `anvil` running on `:8545` | Anvil |
| `hardhat` running on `:8545` | Hardhat |
| Neither | Mock only (fork unavailable) |

### 6.3 State Update Protocol

For multi-step flows, state updates use the reactive store which automatically:
1. Updates internal state
2. Persists to sessionStorage
3. Emits wagmi-compatible EIP-1193 events
4. Triggers React re-renders

```javascript
// Executed in browser context via page.evaluate()
// DO NOT mutate __SIGIL_WEB3_MOCK__ directly — use the store

// ✅ Correct: Use store.update() — triggers events automatically
window.__SIGIL_MOCK_STORE__.update({
  transactionState: 'pending'
});

// ✅ Correct: Simulate wallet connection
window.__SIGIL_MOCK_STORE__.update({
  connected: true,
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
});
// → Emits 'accountsChanged' event
// → wagmi useAccount() re-renders

// ✅ Correct: Switch chain
window.__SIGIL_MOCK_STORE__.update({
  chainId: 42161  // Arbitrum
});
// → Emits 'chainChanged' event
// → wagmi useChainId() re-renders

// ❌ Wrong: Direct mutation (won't trigger re-renders)
window.__SIGIL_WEB3_MOCK__.connected = true;  // No events, UI won't update
```

**Event Flow:**
```
store.update({ connected: true })
       │
       ├──▶ sessionStorage.setItem()  (persistence)
       │
       ├──▶ emit('accountsChanged')   (wagmi connector listens)
       │           │
       │           └──▶ wagmi re-queries account state
       │                      │
       │                      └──▶ React re-renders
       │
       └──▶ dispatchEvent('sigil-state-update')  (custom listeners)
```

---

## 7. Security Considerations

### 7.1 Injection Safety

| Concern | Mitigation |
|---------|------------|
| Script injection in production | Only runs in test/local environments (URL validation) |
| State leakage | sessionStorage scoped to origin, cleared on session end |
| Mock state confusion | Clear `isSigil: true` flag identifies mock provider |

### 7.2 URL Validation

```javascript
// Only allow localhost and known staging patterns
const ALLOWED_PATTERNS = [
  /^https?:\/\/localhost(:\d+)?/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?/,
  /^https?:\/\/([\w-]+\.)?staging\./,
  /^https?:\/\/([\w-]+\.)?preview\./,
  /^https?:\/\/([\w-]+\.)?dev\./
];

function isAllowedUrl(url) {
  return ALLOWED_PATTERNS.some(pattern => pattern.test(url));
}
```

---

## 8. Implementation Roadmap

### Sprint 1: Core Injection (Mock Mode)

| Task | Files | Priority |
|------|-------|----------|
| Create web3-testing skill structure | `.claude/skills/web3-testing/SKILL.md` | P0 |
| Three-layer injection script | `resources/injection-script.js` | P0 |
| Scenario-based /ward extension | `.claude/commands/ward.md` | P0 |
| Built-in scenarios (connected, whale, etc.) | `resources/scenarios.yaml` | P0 |
| Basic /snapshot command | `.claude/commands/snapshot.md` | P0 |

**Acceptance:** `/ward http://localhost:3000 connected` captures wallet-connected UI.

### Sprint 2: Flows & Config

| Task | Files | Priority |
|------|-------|----------|
| web3.yaml config loader | skill workflow | P1 |
| /test-flow command | `.claude/commands/test-flow.md` | P1 |
| Built-in flows (connect, claim, switch, error) | `resources/flows.yaml` | P1 |
| Custom scenario support | config loader | P1 |
| Custom flow support | flow executor | P1 |

**Acceptance:** `/test-flow http://localhost:3000 claim` executes full flow.

### Sprint 3: PR Integration

| Task | Files | Priority |
|------|-------|----------|
| Before/after snapshot workflow | /snapshot enhancement | P2 |
| Git worktree-based capture | snapshot workflow | P2 |
| Flow report generation | `templates/flow-report.md` | P2 |
| PR image upload (GitHub assets) | snapshot workflow | P2 |

**Acceptance:** `/snapshot url connected before` + `/snapshot url connected after` creates comparison.

### Sprint 4: Fork Mode

| Task | Files | Priority |
|------|-------|----------|
| Fork provider auto-detection | injection script | P3 |
| Tenderly integration | fork mode | P3 |
| Anvil integration | fork mode | P3 |
| RPC redirect in injection | injection script | P3 |
| Fork config in web3.yaml | config loader | P3 |

**Acceptance:** `/ward http://localhost:3000 whale fork` uses real contract state.

### Sprint 5: Live Mode (Future)

| Task | Files | Priority |
|------|-------|----------|
| Testnet configuration | web3.yaml | P4 |
| Test wallet injection | live mode | P4 |
| Contract deployment script support | live mode | P4 |
| Berachain Bartio integration | live mode | P4 |

**Acceptance:** `/ward http://localhost:3000 connected live` uses real testnet.

---

## 9. Testing Strategy

### 9.1 Validation Approach

Since Sigil is a framework (not an application), testing is done via:

1. **Fixture app** — Minimal wagmi v2 + viem app for deterministic testing
2. **Manual validation** — Test commands against real wagmi projects
3. **Documentation examples** — All examples in skill docs must work
4. **CI smoke tests** — Automated verification of injection on fixture app

### 9.2 Fixture App Requirements

Create `.claude/skills/web3-testing/fixtures/wagmi-app/` with:

```
fixtures/wagmi-app/
├── package.json          # wagmi v2, viem v2, react 18
├── src/
│   ├── App.tsx           # Main app with wagmi provider
│   ├── components/
│   │   ├── ConnectButton.tsx    # Tests useAccount, useConnect
│   │   ├── BalanceDisplay.tsx   # Tests useBalance (provider + publicClient)
│   │   ├── TokenBalance.tsx     # Tests useReadContract (eth_call)
│   │   ├── SendTransaction.tsx  # Tests useSendTransaction
│   │   └── ChainSwitcher.tsx    # Tests useSwitchChain
│   └── wagmi.config.ts   # Standard wagmi config
└── README.md
```

**Key test points:**
- `useBalance` uses publicClient (viem transport) — verifies fetch interception
- `useAccount` uses connector events — verifies event emission
- `useReadContract` uses eth_call — verifies contract read mocking

### 9.3 Test Scenarios

| Scenario | Command | Expected Result | Validates |
|----------|---------|-----------------|-----------|
| Basic injection | `/ward localhost:3000 --web3` | Screenshot shows connected wallet | Layer 2 (EIP-1193) |
| Balance display | `/ward localhost:3000 --balance ETH=100` | UI shows 100 ETH balance | Layer 3 (fetch) |
| Connect flow | `/test-flow localhost:3000 --flow connect-wallet` | 2 screenshots, UI transitions | Event emission |
| Contract mock | `/ward localhost:3000 --mock "0x70a08231=1000"` | Component shows balance | eth_call interception |
| Chain switch | `/test-flow localhost:3000 --flow switch-chain` | Chain ID updates in UI | chainChanged event |
| Transaction states | `/test-flow localhost:3000 --flow claim-rewards` | Pending → Success screenshots | State updates |

### 9.4 Compatibility Testing

| Project Type | Test Command | Coverage |
|--------------|--------------|----------|
| Next.js 14 + wagmi v2 | Full suite | Primary target |
| Vite + wagmi v2 | Full suite | Secondary target |
| Create React App + wagmi | Basic injection | Legacy support |
| ethers.js v6 (no wagmi) | Basic injection | Partial (EIP-1193 only) |

### 9.5 CI Smoke Test Script

```bash
#!/bin/bash
# .claude/skills/web3-testing/fixtures/smoke-test.sh

cd fixtures/wagmi-app
npm install
npm run dev &
DEV_PID=$!
sleep 5

# Test 1: Basic injection
/ward http://localhost:3000 --web3 --preset default
[ -f grimoires/sigil/observations/ward-*.png ] || exit 1

# Test 2: Connect flow
/test-flow http://localhost:3000 --flow connect-wallet
[ -f grimoires/sigil/snapshots/flows/connect-wallet/02-connected.png ] || exit 1

# Test 3: Balance mock
/ward http://localhost:3000 --balance ETH=999
# Verify screenshot shows 999 ETH (manual or OCR)

kill $DEV_PID
echo "✓ All smoke tests passed"
```

---

## 10. Technical Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| wagmi v3 breaks injection | Medium | High | EIP-1193 + event emission is standard; fetch intercept is transport-agnostic |
| viem changes transport internals | Low | Medium | Fetch interception is at network layer, not viem-specific |
| React 19 concurrent features | Low | Medium | Event-driven state updates work with concurrent mode |
| agent-browser timing issues | Medium | Medium | Add retry logic, increase wait times, use `waitForSelector` |
| sessionStorage size limits | Low | Low | Compress state, warn on large mocks (5MB limit) |
| RPC URL patterns miss custom nodes | Medium | Low | Allow custom patterns via `--rpc-pattern` flag |
| Function selector collisions | Very Low | Low | Support address:selector format for disambiguation |

### 10.1 Why This Architecture is Robust

**Three-layer interception** ensures coverage regardless of how the dApp is structured:

1. **Layer 1 (State Store)**: Reactive pattern means updates always propagate
2. **Layer 2 (EIP-1193)**: Standard interface wagmi/ethers rely on
3. **Layer 3 (Fetch)**: Catches viem publicClient reads that bypass window.ethereum

**Event emission** is key to wagmi compatibility:
- wagmi connectors listen for `accountsChanged`, `chainChanged`
- Without events, wagmi caches stale state
- Our store emits these on every relevant update

**Getter pattern** ensures freshness:
```javascript
// ❌ Old approach: closure captures state at injection time
const state = { connected: false };
request: () => state.connected  // Always returns initial value

// ✅ New approach: getter reads current state
get state() { return this._state; }
request: () => SigilMockStore.state.connected  // Always current
```

---

## 11. Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| State file format | Not MVP - command flags sufficient for now |
| Multi-wallet testing | Not MVP - single address focus |
| Real RPC fallback | Not MVP - full mocking preferred for determinism |

---

## Appendix A: Full Injection Script

See `resources/injection-script.js` in Section 4.1.3.

## Appendix B: Example Command Sessions

### B.1 Basic Ward with Web3

```bash
User: /ward http://localhost:3000/dashboard connected

Scanning 12 component files for Sigil compliance...

Web3: connected scenario
  Address: 0xf39F...2266
  Chain: Ethereum Mainnet (1)
  Balance: 10.0 ETH
  Mode: mock (3-layer interception)

Opening http://localhost:3000/dashboard...
✓ Page loaded

Physics validation:
  ✓ Touch targets: All ≥44px
  ✓ Focus rings: Visible

Screenshot: grimoires/sigil/observations/ward-20260119-143022.png

┌─ Ward Report ─────────────────────────────────────────────┐
│  Scanned: 12 components                                   │
│  Critical: 0  Warnings: 2  Info: 1                        │
│                                                           │
│  🟡 Performance: Barrel import lucide-react               │
│  🟡 Animation: Missing reduced motion check               │
│  🟢 Material: Consider reducing shadow layers             │
└───────────────────────────────────────────────────────────┘
```

### B.2 Ward with Fork Mode

```bash
User: /ward http://localhost:3000/dashboard whale fork

Scanning 12 component files for Sigil compliance...

Web3: whale scenario
  Address: 0x7099...79C8
  Chain: Ethereum Mainnet (1)
  Balance: 1000.0 ETH
  Mode: fork (Tenderly detected)

Forking mainnet at block 19500000...
✓ Fork ready

Opening http://localhost:3000/dashboard...
✓ Page loaded (contract reads from fork)

[Ward Report...]
```

### B.3 Full Claim Flow

```bash
User: /test-flow http://localhost:3000 claim

Executing flow: claim
Base URL: http://localhost:3000
Mode: mock

Step 1/10: Inject initial state
  ✓ Address: 0xf39F...2266
  ✓ Balance: 10.0 ETH
  ✓ Pending rewards: 100.0

Step 2/10: Navigate to /claim
  ✓ Page loaded

Step 3/10: Screenshot
  → grimoires/sigil/snapshots/flows/claim/01-claim-page.png

Step 4/10: Click Claim button
  ✓ Clicked [data-testid='claim-button']

Step 5/10: Screenshot
  → grimoires/sigil/snapshots/flows/claim/02-confirmation.png

Step 6/10: Click Confirm
  ✓ Clicked [data-testid='confirm-button']

Step 7/10: Update state (pending)
  ✓ store.update({ transactionState: 'pending' })
  ✓ Transaction hash: 0xabc1...abc1

Step 8/10: Screenshot
  → grimoires/sigil/snapshots/flows/claim/03-pending.png

Step 9/10: Update state (success)
  ✓ store.update({ transactionState: 'success' })
  ✓ Balance updated: 10.05 ETH

Step 10/10: Screenshot
  → grimoires/sigil/snapshots/flows/claim/04-success.png

Flow completed in 3.8s

Physics validation:
  ✓ Confirmation dialog present (financial action)
  ✓ Cancel button visible during pending
  ✓ Touch targets ≥44px
  ✓ Focus rings visible

Report: grimoires/sigil/snapshots/flows/claim/report.md
```

### B.4 Connect Wallet Flow

```bash
User: /test-flow http://localhost:3000 connect

Executing flow: connect
Base URL: http://localhost:3000
Mode: mock

Step 1/6: Inject disconnected state
  ✓ Provider installed
  ✓ Connected: false

Step 2/6: Screenshot
  → grimoires/sigil/snapshots/flows/connect/01-disconnected.png

Step 3/6: Click Connect button
  ✓ Clicked [data-testid='connect-button']

Step 4/6: Update state (connected)
  ✓ store.update({ connected: true })
  ✓ Emitted: accountsChanged

Step 5/6: Wait for React
  ✓ 300ms

Step 6/6: Screenshot
  → grimoires/sigil/snapshots/flows/connect/02-connected.png

Flow completed in 1.2s

Report: grimoires/sigil/snapshots/flows/connect/report.md
```

### B.5 Custom Flow (from web3.yaml)

```bash
User: /test-flow http://localhost:3000 stake

Executing flow: stake (from web3.yaml)
Base URL: http://localhost:3000
Mode: mock

Step 1/7: Load scenario: staker
  ✓ Balance: 50 ETH
  ✓ HONEY: 10000
  ✓ Staked: 5000 tokens

Step 2/7: Navigate to /stake
  ✓ Page loaded

Step 3/7: Screenshot
  → grimoires/sigil/snapshots/flows/stake/stake-page.png

[Continues with steps from web3.yaml...]

Flow completed in 4.1s
```

### B.6 Snapshot for PR

```bash
User: /snapshot http://localhost:3000/claim connected before

Stashing local changes...
Checking out main branch...

Web3: connected scenario
Opening http://localhost:3000/claim...
✓ Screenshot: grimoires/sigil/snapshots/2026-01-19/claim-before.png

Restoring branch and changes...
✓ Done

---

User: /snapshot http://localhost:3000/claim connected after

Web3: connected scenario
Opening http://localhost:3000/claim...
✓ Screenshot: grimoires/sigil/snapshots/2026-01-19/claim-after.png

Comparison ready:
  Before: grimoires/sigil/snapshots/2026-01-19/claim-before.png
  After:  grimoires/sigil/snapshots/2026-01-19/claim-after.png

Add to PR? (y/n)
```

---

*End of SDD*
