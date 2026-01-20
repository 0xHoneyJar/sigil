import { useAccount, useConnect, useDisconnect, useBalance, useChainId, useSwitchChain } from 'wagmi'

export function App() {
  const { address, isConnected } = useAccount()
  const { connectors, connect, isPending: isConnecting, error: connectError } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { chains, switchChain } = useSwitchChain()

  const { data: balance, isLoading: isLoadingBalance } = useBalance({
    address,
    query: { enabled: isConnected }
  })

  return (
    <div>
      <h1>Sigil wagmi Fixture</h1>

      {/* Connection Status Card */}
      <div className="card">
        <div className="label">Status</div>
        <span className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Connect/Disconnect */}
      <div className="card">
        {isConnected ? (
          <>
            <div className="label">Address</div>
            <div className="address" data-testid="address">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
            <br /><br />
            <button
              onClick={() => disconnect()}
              data-testid="disconnect-button"
            >
              Disconnect
            </button>
          </>
        ) : (
          <>
            <div className="label">Connect Wallet</div>
            <br />
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                disabled={isConnecting}
                data-testid="connect-button"
                style={{ marginRight: 8 }}
              >
                {isConnecting ? 'Connecting...' : `Connect ${connector.name}`}
              </button>
            ))}
            {connectError && (
              <p className="error">{connectError.message}</p>
            )}
          </>
        )}
      </div>

      {/* Balance Card (only when connected) */}
      {isConnected && (
        <div className="card">
          <div className="label">Balance</div>
          <div className="balance" data-testid="balance">
            {isLoadingBalance ? (
              'Loading...'
            ) : balance ? (
              `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
            ) : (
              '0.0000 ETH'
            )}
          </div>
        </div>
      )}

      {/* Chain Switcher (only when connected) */}
      {isConnected && (
        <div className="card">
          <div className="label">Chain</div>
          <div style={{ marginBottom: 12 }} data-testid="chain-id">
            Current: {chainId}
          </div>
          <div>
            {chains.map((chain) => (
              <button
                key={chain.id}
                onClick={() => switchChain({ chainId: chain.id })}
                disabled={chain.id === chainId}
                data-testid={`chain-${chain.id}`}
                style={{ marginRight: 8, marginBottom: 8 }}
              >
                {chain.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons (only when connected) */}
      {isConnected && (
        <div className="card">
          <div className="label">Actions</div>
          <br />
          <button
            data-testid="claim-button"
            style={{ marginRight: 8, background: '#28a745' }}
          >
            Claim Rewards
          </button>
          <button
            data-testid="send-button"
            style={{ marginRight: 8 }}
          >
            Send
          </button>
          <button
            data-testid="stake-button"
            style={{ background: '#6f42c1' }}
          >
            Stake
          </button>
        </div>
      )}
    </div>
  )
}
