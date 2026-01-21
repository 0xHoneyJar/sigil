/**
 * Simulation Panel Component
 *
 * Displays transaction simulation results in the dev toolbar.
 * Shows success/failure, gas estimates, balance deltas, and event logs.
 */

import { useState, useCallback } from 'react'
import type { Address, Hex } from 'viem'
import type {
  SimulationResult,
  SimulationTransactionRequest,
  BalanceChange,
  SimulationLog,
} from '../services/simulation'

/**
 * Format wei to human-readable ETH
 */
function formatEther(wei: bigint, decimals = 4): string {
  const ethString = (Number(wei) / 1e18).toFixed(decimals)
  return `${ethString} ETH`
}

/**
 * Format gas to human-readable string
 */
function formatGas(gas: bigint): string {
  if (gas >= 1_000_000n) {
    return `${(Number(gas) / 1_000_000).toFixed(2)}M`
  }
  if (gas >= 1_000n) {
    return `${(Number(gas) / 1_000).toFixed(1)}K`
  }
  return gas.toString()
}

/**
 * Truncate address for display
 */
function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Format balance change
 */
function formatBalanceChange(change: BalanceChange): string {
  const sign = change.delta >= 0n ? '+' : ''
  return `${sign}${formatEther(change.delta)}`
}

/**
 * Estimate USD value (placeholder - would use price feed in production)
 */
function estimateUSD(wei: bigint, ethPrice = 2000): string {
  const eth = Number(wei) / 1e18
  const usd = eth * ethPrice
  return `~$${usd.toFixed(2)}`
}

/**
 * Simulation Panel Props
 */
export interface SimulationPanelProps {
  /** Function to run simulation */
  onSimulate?: (tx: SimulationTransactionRequest) => Promise<SimulationResult>
  /** Latest simulation result */
  result?: SimulationResult | null
  /** Whether simulation is in progress */
  isSimulating?: boolean
  /** Error message if simulation failed */
  error?: string | null
  /** ETH price for USD estimates (optional) */
  ethPrice?: number
  /** Whether to show detailed state changes */
  showStateChanges?: boolean
  /** Whether to show decoded logs (requires ABI) */
  showDecodedLogs?: boolean
}

/**
 * Balance Changes Section
 */
function BalanceChangesSection({ changes }: { changes: BalanceChange[] }) {
  if (changes.length === 0) return null

  return (
    <div className="sigil-simulation-section sigil-simulation-balances">
      <h4>Balance Changes</h4>
      <ul>
        {changes.map((change, i) => (
          <li key={i} className="sigil-simulation-balance-item">
            <span className="sigil-simulation-address" title={change.address}>
              {truncateAddress(change.address)}
            </span>
            <span className={`sigil-simulation-delta ${change.delta >= 0n ? 'positive' : 'negative'}`}>
              {formatBalanceChange(change)}
            </span>
            <span className="sigil-simulation-token">
              {change.symbol ?? (change.token ? truncateAddress(change.token) : 'ETH')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Event Logs Section
 */
function EventLogsSection({ logs, showDecoded }: { logs: SimulationLog[]; showDecoded: boolean }) {
  if (logs.length === 0) return null

  return (
    <div className="sigil-simulation-section sigil-simulation-logs">
      <h4>Event Logs ({logs.length})</h4>
      <ul>
        {logs.slice(0, 10).map((log, i) => (
          <li key={i} className="sigil-simulation-log-item">
            <span className="sigil-simulation-address" title={log.address}>
              {truncateAddress(log.address)}
            </span>
            {showDecoded && log.eventName ? (
              <span className="sigil-simulation-event-name">
                {log.eventName}
              </span>
            ) : (
              <span className="sigil-simulation-topic" title={log.topics[0]}>
                {log.topics[0]?.slice(0, 10)}...
              </span>
            )}
          </li>
        ))}
        {logs.length > 10 && (
          <li className="sigil-simulation-more">
            +{logs.length - 10} more events
          </li>
        )}
      </ul>
    </div>
  )
}

/**
 * Gas Summary Section
 */
function GasSummarySection({
  result,
  ethPrice,
}: {
  result: SimulationResult
  ethPrice: number
}) {
  return (
    <div className="sigil-simulation-section sigil-simulation-gas">
      <h4>Gas</h4>
      <div className="sigil-simulation-gas-grid">
        <div className="sigil-simulation-gas-item">
          <span className="sigil-simulation-label">Used</span>
          <span className="sigil-simulation-value">{formatGas(result.gasUsed)}</span>
        </div>
        <div className="sigil-simulation-gas-item">
          <span className="sigil-simulation-label">Limit</span>
          <span className="sigil-simulation-value">{formatGas(result.gasLimit)}</span>
        </div>
        <div className="sigil-simulation-gas-item">
          <span className="sigil-simulation-label">Price</span>
          <span className="sigil-simulation-value">
            {(Number(result.effectiveGasPrice) / 1e9).toFixed(2)} gwei
          </span>
        </div>
        <div className="sigil-simulation-gas-item sigil-simulation-gas-total">
          <span className="sigil-simulation-label">Total Cost</span>
          <span className="sigil-simulation-value">
            {formatEther(result.totalCost)}
            <span className="sigil-simulation-usd">
              {estimateUSD(result.totalCost, ethPrice)}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Simulation Result Display
 */
function SimulationResultDisplay({
  result,
  ethPrice,
  showDecodedLogs,
}: {
  result: SimulationResult
  ethPrice: number
  showDecodedLogs: boolean
}) {
  return (
    <div className={`sigil-simulation-result ${result.success ? 'success' : 'failure'}`}>
      {/* Status Banner */}
      <div className="sigil-simulation-status">
        <span className="sigil-simulation-status-icon">
          {result.success ? '✓' : '✗'}
        </span>
        <span className="sigil-simulation-status-text">
          {result.success ? 'Transaction Successful' : 'Transaction Failed'}
        </span>
      </div>

      {/* Revert Reason (if failed) */}
      {!result.success && result.revertReason && (
        <div className="sigil-simulation-revert">
          <h4>Revert Reason</h4>
          <pre className="sigil-simulation-revert-message">
            {result.revertReason}
          </pre>
        </div>
      )}

      {/* Gas Summary */}
      <GasSummarySection result={result} ethPrice={ethPrice} />

      {/* Balance Changes */}
      <BalanceChangesSection changes={result.balanceChanges} />

      {/* Event Logs */}
      <EventLogsSection logs={result.logs} showDecoded={showDecodedLogs} />

      {/* Metadata */}
      <div className="sigil-simulation-section sigil-simulation-meta">
        <span className="sigil-simulation-block">
          Block: {result.blockNumber.toString()}
        </span>
        <span className="sigil-simulation-time">
          {new Date(result.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  )
}

/**
 * Transaction Input Form
 */
function TransactionInputForm({
  onSimulate,
  isSimulating,
}: {
  onSimulate: (tx: SimulationTransactionRequest) => void
  isSimulating: boolean
}) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [value, setValue] = useState('')
  const [data, setData] = useState('')

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (!from || !to) return

      const tx: SimulationTransactionRequest = {
        from: from as Address,
        to: to as Address,
        value: value ? BigInt(value) : undefined,
        data: data ? (data as Hex) : undefined,
      }

      onSimulate(tx)
    },
    [from, to, value, data, onSimulate]
  )

  return (
    <form onSubmit={handleSubmit} className="sigil-simulation-form">
      <div className="sigil-simulation-field">
        <label htmlFor="sim-from">From</label>
        <input
          id="sim-from"
          type="text"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="0x..."
          disabled={isSimulating}
        />
      </div>

      <div className="sigil-simulation-field">
        <label htmlFor="sim-to">To</label>
        <input
          id="sim-to"
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="0x..."
          disabled={isSimulating}
        />
      </div>

      <div className="sigil-simulation-field">
        <label htmlFor="sim-value">Value (wei)</label>
        <input
          id="sim-value"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0"
          disabled={isSimulating}
        />
      </div>

      <div className="sigil-simulation-field">
        <label htmlFor="sim-data">Data</label>
        <input
          id="sim-data"
          type="text"
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="0x..."
          disabled={isSimulating}
        />
      </div>

      <button
        type="submit"
        disabled={isSimulating || !from || !to}
        className="sigil-simulation-submit"
      >
        {isSimulating ? 'Simulating...' : 'Simulate'}
      </button>
    </form>
  )
}

/**
 * Simulation Panel Component
 */
export function SimulationPanel({
  onSimulate,
  result,
  isSimulating = false,
  error,
  ethPrice = 2000,
  showDecodedLogs = true,
}: SimulationPanelProps) {
  const handleSimulate = useCallback(
    async (tx: SimulationTransactionRequest) => {
      if (onSimulate) {
        await onSimulate(tx)
      }
    },
    [onSimulate]
  )

  return (
    <div className="sigil-simulation-panel">
      {/* Header */}
      <div className="sigil-simulation-header">
        <h3>Transaction Simulation</h3>
      </div>

      {/* Input Form */}
      {onSimulate && (
        <TransactionInputForm
          onSimulate={handleSimulate}
          isSimulating={isSimulating}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="sigil-simulation-error">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isSimulating && !result && (
        <div className="sigil-simulation-loading">
          <span className="sigil-simulation-spinner" />
          <span>Running simulation...</span>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <SimulationResultDisplay
          result={result}
          ethPrice={ethPrice}
          showDecodedLogs={showDecodedLogs}
        />
      )}

      {/* Empty State */}
      {!result && !isSimulating && !error && (
        <div className="sigil-simulation-empty">
          <p>No simulation results yet.</p>
          <p>Enter transaction details above to simulate.</p>
        </div>
      )}
    </div>
  )
}
