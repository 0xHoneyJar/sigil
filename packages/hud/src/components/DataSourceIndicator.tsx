/**
 * Data Source Indicator Component
 *
 * Shows the source and staleness of displayed data values.
 * Full implementation in TASK-202.
 */

/**
 * Data source type
 */
export type DataSourceType = 'on-chain' | 'indexed' | 'cached' | 'unknown'

/**
 * Props for DataSourceIndicator
 */
export interface DataSourceIndicatorProps {
  /** Data source type */
  source: DataSourceType
  /** Block number for on-chain data */
  blockNumber?: number
  /** Current block for staleness calculation */
  currentBlock?: number
  /** Timestamp for time-based staleness */
  timestamp?: number
  /** Whether to show expanded details */
  expanded?: boolean
  /** Callback when clicked */
  onClick?: () => void
  /** Custom class name */
  className?: string
}

/**
 * Source type colors and labels
 */
const sourceConfig: Record<
  DataSourceType,
  { label: string; color: string; bgColor: string }
> = {
  'on-chain': { label: 'On-Chain', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' },
  indexed: { label: 'Indexed', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  cached: { label: 'Cached', color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.1)' },
  unknown: { label: 'Unknown', color: '#666', bgColor: 'rgba(100, 100, 100, 0.1)' },
}

/**
 * Calculate staleness status
 */
function getStaleness(props: DataSourceIndicatorProps): {
  level: 'fresh' | 'stale' | 'very-stale'
  label: string
} {
  const { source, blockNumber, currentBlock, timestamp } = props

  // Block-based staleness for on-chain data
  if (source === 'on-chain' && blockNumber && currentBlock) {
    const blocksBehind = currentBlock - blockNumber
    if (blocksBehind <= 1) return { level: 'fresh', label: 'current' }
    if (blocksBehind <= 5) return { level: 'stale', label: `${blocksBehind} blocks behind` }
    return { level: 'very-stale', label: `${blocksBehind} blocks behind` }
  }

  // Time-based staleness for indexed/cached
  if (timestamp) {
    const secondsAgo = Math.floor((Date.now() - timestamp) / 1000)
    if (secondsAgo < 30) return { level: 'fresh', label: 'just now' }
    if (secondsAgo < 60) return { level: 'fresh', label: `${secondsAgo}s ago` }
    if (secondsAgo < 300) return { level: 'stale', label: `${Math.floor(secondsAgo / 60)}m ago` }
    return { level: 'very-stale', label: `${Math.floor(secondsAgo / 60)}m ago` }
  }

  return { level: 'fresh', label: '' }
}

/**
 * Staleness color mapping
 */
const stalenessColors = {
  fresh: '#22c55e',
  stale: '#eab308',
  'very-stale': '#ef4444',
}

/**
 * Data Source Indicator component
 */
export function DataSourceIndicator({
  source,
  blockNumber,
  currentBlock,
  timestamp,
  expanded = false,
  onClick,
  className = '',
}: DataSourceIndicatorProps) {
  const config = sourceConfig[source]
  const staleness = getStaleness({ source, blockNumber, currentBlock, timestamp })

  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        ...styles.container,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Source Badge */}
      <span
        style={{
          ...styles.badge,
          backgroundColor: config.bgColor,
          borderColor: `${config.color}40`,
          color: config.color,
        }}
      >
        {config.label}
      </span>

      {/* Staleness Indicator */}
      {staleness.label && (
        <span style={{ ...styles.staleness, color: stalenessColors[staleness.level] }}>
          <span style={styles.dot}>●</span>
          {staleness.label}
        </span>
      )}

      {/* Expanded Details */}
      {expanded && blockNumber && (
        <div style={styles.expanded}>
          <span style={styles.detailLabel}>Block:</span>
          <span style={styles.detailValue}>#{blockNumber.toLocaleString()}</span>
        </div>
      )}
    </button>
  )
}

/**
 * Styles
 */
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '0',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '10px',
    fontFamily: 'inherit',
  },
  badge: {
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '9px',
    fontWeight: 600,
    border: '1px solid',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  staleness: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '10px',
  },
  dot: {
    fontSize: '6px',
  },
  expanded: {
    display: 'flex',
    gap: '4px',
    marginLeft: '4px',
    paddingLeft: '4px',
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
  },
  detailLabel: {
    color: '#666',
  },
  detailValue: {
    color: '#888',
    fontFamily: 'monospace',
  },
}
