/**
 * State Comparison Component
 *
 * Side-by-side comparison of app state with diff highlighting.
 * Shows data source tracing (indexed vs on-chain) and discrepancies.
 */

import { useState, useCallback, useMemo } from 'react'

/**
 * Data source type
 */
export type DataSource = 'on-chain' | 'indexed' | 'cache' | 'local' | 'unknown'

/**
 * State value with metadata
 */
export interface StateValue {
  /** The actual value */
  value: unknown
  /** Data source */
  source: DataSource
  /** Timestamp when value was fetched */
  fetchedAt?: number
  /** Key path in state tree */
  path: string
}

/**
 * Comparison result for a single value
 */
export interface ComparisonItem {
  /** Key/path of the value */
  path: string
  /** Left side value (e.g., "before" or "indexed") */
  left?: StateValue
  /** Right side value (e.g., "after" or "on-chain") */
  right?: StateValue
  /** Whether values differ */
  isDifferent: boolean
  /** Change type */
  changeType: 'added' | 'removed' | 'modified' | 'unchanged'
}

/**
 * State snapshot for comparison
 */
export interface StateSnapshot {
  /** Snapshot ID */
  id: string
  /** Snapshot label */
  label: string
  /** Timestamp */
  timestamp: number
  /** State values */
  values: Record<string, StateValue>
}

/**
 * Props for StateComparison component
 */
export interface StateComparisonProps {
  /** Left state snapshot (e.g., "before" or "indexed") */
  leftSnapshot?: StateSnapshot | null
  /** Right state snapshot (e.g., "after" or "on-chain") */
  rightSnapshot?: StateSnapshot | null
  /** Left label */
  leftLabel?: string
  /** Right label */
  rightLabel?: string
  /** Filter to show only differences */
  showOnlyDifferences?: boolean
  /** Filter by data source */
  filterSource?: DataSource | null
  /** Callback when export is requested */
  onExport?: (data: ComparisonItem[]) => void
}

/**
 * Format a value for display
 */
function formatValue(value: unknown): string {
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  if (typeof value === 'bigint') return `${value.toString()}n`
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return '[Object]'
    }
  }
  return String(value)
}

/**
 * Check if two values are equal
 */
function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a === 'bigint' && typeof b === 'bigint') return a === b
  if (typeof a === 'object' && typeof b === 'object') {
    try {
      return JSON.stringify(a) === JSON.stringify(b)
    } catch {
      return false
    }
  }
  return false
}

/**
 * Get source badge color
 */
function getSourceColor(source: DataSource): string {
  switch (source) {
    case 'on-chain':
      return 'sigil-source-onchain'
    case 'indexed':
      return 'sigil-source-indexed'
    case 'cache':
      return 'sigil-source-cache'
    case 'local':
      return 'sigil-source-local'
    default:
      return 'sigil-source-unknown'
  }
}

/**
 * Get change type badge color
 */
function getChangeColor(type: ComparisonItem['changeType']): string {
  switch (type) {
    case 'added':
      return 'sigil-change-added'
    case 'removed':
      return 'sigil-change-removed'
    case 'modified':
      return 'sigil-change-modified'
    default:
      return 'sigil-change-unchanged'
  }
}

/**
 * Comparison Item Row
 */
function ComparisonRow({ item }: { item: ComparisonItem }) {
  const [expanded, setExpanded] = useState(false)

  const leftValue = item.left ? formatValue(item.left.value) : '—'
  const rightValue = item.right ? formatValue(item.right.value) : '—'
  const isLongValue = leftValue.length > 50 || rightValue.length > 50

  return (
    <div className={`sigil-comparison-row ${item.isDifferent ? 'different' : ''}`}>
      {/* Path and Change Type */}
      <div className="sigil-comparison-path">
        <code>{item.path}</code>
        <span className={`sigil-comparison-badge ${getChangeColor(item.changeType)}`}>
          {item.changeType}
        </span>
      </div>

      {/* Values */}
      <div className="sigil-comparison-values">
        {/* Left Value */}
        <div className="sigil-comparison-value sigil-comparison-left">
          {item.left ? (
            <>
              <span className={`sigil-comparison-source ${getSourceColor(item.left.source)}`}>
                {item.left.source}
              </span>
              {isLongValue ? (
                <button
                  className="sigil-comparison-expand"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? 'Collapse' : 'Expand'}
                </button>
              ) : (
                <code className="sigil-comparison-value-text">{leftValue}</code>
              )}
            </>
          ) : (
            <span className="sigil-comparison-empty">—</span>
          )}
        </div>

        {/* Right Value */}
        <div className="sigil-comparison-value sigil-comparison-right">
          {item.right ? (
            <>
              <span className={`sigil-comparison-source ${getSourceColor(item.right.source)}`}>
                {item.right.source}
              </span>
              {isLongValue ? (
                <button
                  className="sigil-comparison-expand"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? 'Collapse' : 'Expand'}
                </button>
              ) : (
                <code className="sigil-comparison-value-text">{rightValue}</code>
              )}
            </>
          ) : (
            <span className="sigil-comparison-empty">—</span>
          )}
        </div>
      </div>

      {/* Expanded Values */}
      {expanded && isLongValue && (
        <div className="sigil-comparison-expanded">
          <div className="sigil-comparison-expanded-left">
            <pre>{leftValue}</pre>
          </div>
          <div className="sigil-comparison-expanded-right">
            <pre>{rightValue}</pre>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * State Comparison Component
 */
export function StateComparison({
  leftSnapshot,
  rightSnapshot,
  leftLabel = 'Before',
  rightLabel = 'After',
  showOnlyDifferences = false,
  filterSource = null,
  onExport,
}: StateComparisonProps) {
  const [filter, setFilter] = useState('')
  const [onlyDiff, setOnlyDiff] = useState(showOnlyDifferences)
  const [sourceFilter, setSourceFilter] = useState<DataSource | null>(filterSource)

  // Compute comparison items
  const comparisonItems = useMemo((): ComparisonItem[] => {
    const items: ComparisonItem[] = []
    const allPaths = new Set<string>()

    // Collect all paths from both snapshots
    if (leftSnapshot) {
      Object.keys(leftSnapshot.values).forEach(path => allPaths.add(path))
    }
    if (rightSnapshot) {
      Object.keys(rightSnapshot.values).forEach(path => allPaths.add(path))
    }

    // Create comparison items
    for (const path of allPaths) {
      const left = leftSnapshot?.values[path]
      const right = rightSnapshot?.values[path]

      let changeType: ComparisonItem['changeType'] = 'unchanged'
      let isDifferent = false

      if (left && !right) {
        changeType = 'removed'
        isDifferent = true
      } else if (!left && right) {
        changeType = 'added'
        isDifferent = true
      } else if (left && right && !valuesEqual(left.value, right.value)) {
        changeType = 'modified'
        isDifferent = true
      }

      items.push({
        path,
        left,
        right,
        isDifferent,
        changeType,
      })
    }

    // Sort by path
    items.sort((a, b) => a.path.localeCompare(b.path))

    return items
  }, [leftSnapshot, rightSnapshot])

  // Filter items
  const filteredItems = useMemo(() => {
    return comparisonItems.filter(item => {
      // Text filter
      if (filter && !item.path.toLowerCase().includes(filter.toLowerCase())) {
        return false
      }

      // Only differences
      if (onlyDiff && !item.isDifferent) {
        return false
      }

      // Source filter
      if (sourceFilter) {
        const leftMatch = item.left?.source === sourceFilter
        const rightMatch = item.right?.source === sourceFilter
        if (!leftMatch && !rightMatch) {
          return false
        }
      }

      return true
    })
  }, [comparisonItems, filter, onlyDiff, sourceFilter])

  // Statistics
  const stats = useMemo(() => {
    const added = comparisonItems.filter(i => i.changeType === 'added').length
    const removed = comparisonItems.filter(i => i.changeType === 'removed').length
    const modified = comparisonItems.filter(i => i.changeType === 'modified').length
    const unchanged = comparisonItems.filter(i => i.changeType === 'unchanged').length
    return { added, removed, modified, unchanged, total: comparisonItems.length }
  }, [comparisonItems])

  // Export handler
  const handleExport = useCallback(() => {
    if (onExport) {
      onExport(filteredItems)
    } else {
      // Default: download as JSON
      const blob = new Blob([JSON.stringify(filteredItems, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `state-comparison-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }, [filteredItems, onExport])

  return (
    <div className="sigil-state-comparison">
      {/* Header */}
      <div className="sigil-comparison-header">
        <h3>State Comparison</h3>
        <div className="sigil-comparison-stats">
          <span className="sigil-stat sigil-stat-added">+{stats.added}</span>
          <span className="sigil-stat sigil-stat-removed">-{stats.removed}</span>
          <span className="sigil-stat sigil-stat-modified">~{stats.modified}</span>
          <span className="sigil-stat sigil-stat-unchanged">={stats.unchanged}</span>
        </div>
      </div>

      {/* Snapshot Info */}
      <div className="sigil-comparison-snapshots">
        <div className="sigil-comparison-snapshot-left">
          <span className="sigil-comparison-label">{leftLabel}</span>
          {leftSnapshot && (
            <span className="sigil-comparison-time">
              {new Date(leftSnapshot.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="sigil-comparison-snapshot-right">
          <span className="sigil-comparison-label">{rightLabel}</span>
          {rightSnapshot && (
            <span className="sigil-comparison-time">
              {new Date(rightSnapshot.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="sigil-comparison-filters">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by path..."
          className="sigil-comparison-filter-input"
        />

        <label className="sigil-comparison-filter-checkbox">
          <input
            type="checkbox"
            checked={onlyDiff}
            onChange={(e) => setOnlyDiff(e.target.checked)}
          />
          Only differences
        </label>

        <select
          value={sourceFilter ?? ''}
          onChange={(e) => setSourceFilter(e.target.value as DataSource || null)}
          className="sigil-comparison-filter-select"
        >
          <option value="">All sources</option>
          <option value="on-chain">On-chain</option>
          <option value="indexed">Indexed</option>
          <option value="cache">Cache</option>
          <option value="local">Local</option>
        </select>

        <button onClick={handleExport} className="sigil-comparison-export">
          Export JSON
        </button>
      </div>

      {/* Comparison Items */}
      <div className="sigil-comparison-items">
        {filteredItems.length === 0 ? (
          <div className="sigil-comparison-empty-state">
            {comparisonItems.length === 0
              ? 'No state to compare. Capture snapshots first.'
              : 'No items match the current filters.'}
          </div>
        ) : (
          filteredItems.map((item) => (
            <ComparisonRow key={item.path} item={item} />
          ))
        )}
      </div>
    </div>
  )
}

/**
 * Hook for managing state snapshots
 */
export function useStateSnapshots() {
  const [snapshots, setSnapshots] = useState<StateSnapshot[]>([])
  const [leftId, setLeftId] = useState<string | null>(null)
  const [rightId, setRightId] = useState<string | null>(null)

  const captureSnapshot = useCallback((label: string, values: Record<string, StateValue>): StateSnapshot => {
    const snapshot: StateSnapshot = {
      id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label,
      timestamp: Date.now(),
      values,
    }

    setSnapshots(prev => [...prev, snapshot])
    return snapshot
  }, [])

  const deleteSnapshot = useCallback((id: string) => {
    setSnapshots(prev => prev.filter(s => s.id !== id))
    if (leftId === id) setLeftId(null)
    if (rightId === id) setRightId(null)
  }, [leftId, rightId])

  const clearSnapshots = useCallback(() => {
    setSnapshots([])
    setLeftId(null)
    setRightId(null)
  }, [])

  const leftSnapshot = snapshots.find(s => s.id === leftId) ?? null
  const rightSnapshot = snapshots.find(s => s.id === rightId) ?? null

  return {
    snapshots,
    leftSnapshot,
    rightSnapshot,
    leftId,
    rightId,
    setLeftId,
    setRightId,
    captureSnapshot,
    deleteSnapshot,
    clearSnapshots,
  }
}
