/**
 * Sigil Web3 Mock Injection Script
 *
 * Three-layer interception for wagmi/viem mocking:
 * 1. Reactive State Store - Central state with event emission
 * 2. EIP-1193 Provider - window.ethereum with full method support
 * 3. Fetch Interception - Catch viem transport RPC calls
 *
 * Template placeholders:
 * - __SIGIL_MOCK_STATE_PLACEHOLDER__ - Initial state object
 * - __SIGIL_FORK_RPC_URL_PLACEHOLDER__ - Fork RPC URL (null for mock mode)
 */
(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════

  const INITIAL_STATE = __SIGIL_MOCK_STATE_PLACEHOLDER__;
  const FORK_RPC_URL = __SIGIL_FORK_RPC_URL_PLACEHOLDER__;

  // ═══════════════════════════════════════════════════════════════════════════
  // LAYER 1: REACTIVE STATE STORE
  // ═══════════════════════════════════════════════════════════════════════════

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
      if (prev.address !== this._state.address || prev.connected !== this._state.connected) {
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
          // In fork mode, forward to fork RPC
          if (FORK_RPC_URL) {
            return await forwardToFork({ method, params });
          }
          const [address] = params || [];
          const ethBalance = state.balances?.ETH || '0';
          const weiValue = parseEther(ethBalance);
          return '0x' + weiValue.toString(16);
        }

        case 'eth_call':
          // In fork mode, forward to fork RPC for real contract reads
          if (FORK_RPC_URL) {
            return await forwardToFork({ method, params });
          }
          return handleContractRead(params, state);

        case 'eth_getBlockByNumber':
        case 'eth_blockNumber':
        case 'eth_getCode':
        case 'eth_getStorageAt':
          // Always forward these to fork if available
          if (FORK_RPC_URL) {
            return await forwardToFork({ method, params });
          }
          return handleReadOnlyMethod(method, params);

        case 'eth_estimateGas':
          if (FORK_RPC_URL) {
            return await forwardToFork({ method, params });
          }
          return '0x5208'; // 21000 gas (standard transfer)

        case 'eth_gasPrice':
          if (FORK_RPC_URL) {
            return await forwardToFork({ method, params });
          }
          return '0x' + (30n * 10n ** 9n).toString(16); // 30 gwei

        case 'eth_getTransactionCount':
          if (FORK_RPC_URL) {
            return await forwardToFork({ method, params });
          }
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
    configurable: true
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
    /^https?:\/\/.*arbitrum/,
    /^https?:\/\/.*optimism/,
    /^https?:\/\/.*polygon/,
    /^https?:\/\/.*base\./,
    /^https?:\/\/localhost:\d+/,
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
  // FORK MODE HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  async function forwardToFork({ method, params }) {
    const response = await originalFetch(FORK_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params
      })
    });

    const data = await response.json();
    if (data.error) {
      throw data.error;
    }
    return data.result;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // Parse ether string to wei BigInt (preserves precision)
  function parseEther(etherString) {
    const str = String(etherString);
    const [whole, decimal = ''] = str.split('.');
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

  // Handle read-only methods in mock mode
  function handleReadOnlyMethod(method, params) {
    switch (method) {
      case 'eth_blockNumber':
        return '0x' + (19000000).toString(16); // Recent block
      case 'eth_getBlockByNumber':
        return {
          number: '0x' + (19000000).toString(16),
          timestamp: '0x' + Math.floor(Date.now() / 1000).toString(16),
          hash: '0x' + 'a'.repeat(64),
          parentHash: '0x' + 'b'.repeat(64),
          gasLimit: '0x1c9c380',
          gasUsed: '0x0',
          transactions: []
        };
      case 'eth_getCode':
        return '0x'; // No code (EOA)
      case 'eth_getStorageAt':
        return '0x' + '0'.repeat(64);
      default:
        return null;
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
    chainId: SigilMockStore.state.chainId,
    mode: FORK_RPC_URL ? 'fork' : 'mock',
    forkRpc: FORK_RPC_URL || 'none'
  });
})();
