/**
 * Data Source Hook
 *
 * Track data source and staleness for displayed values.
 * Implements TASK-202: State source tracing.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import type { DataSourceType } from '../components/DataSourceIndicator'

/**
 * Data source metadata
 */
export interface DataSourceMeta {
  /** Data source type */
  source: DataSourceType
  /** When the data was fetched */
  fetchedAt: number
  /** Block number (for on-chain data) */
  blockNumber?: number
  /** Current block (for staleness calculation) */
  currentBlock?: number
  /** Whether the data is stale */
  isStale: boolean
  /** Staleness level */
  stalenessLevel: 'fresh' | 'stale' | 'very-stale'
  /** Human-readable staleness label */
  stalenessLabel: string
}

/**
 * Props for useDataSource
 */
export interface UseDataSourceProps {
  /** Data source type */
  source: DataSourceType
  /** Block number for on-chain data */
  blockNumber?: number
  /** Interval to check staleness (ms) */
  pollInterval?: number
  /** Threshold for "stale" in seconds (for time-based) */
  staleThresholdSeconds?: number
  /** Threshold for "very stale" in seconds (for time-based) */
  veryStaleThresholdSeconds?: number
  /** Threshold for "stale" in blocks (for block-based) */
  staleThresholdBlocks?: number
  /** Threshold for "very stale" in blocks (for block-based) */
  veryStaleThresholdBlocks?: number
  /** Callback when data becomes stale */
  onStale?: () => void
}

/**
 * Default staleness thresholds
 */
const DEFAULT_STALE_SECONDS = 60 // 1 minute
const DEFAULT_VERY_STALE_SECONDS = 300 // 5 minutes
const DEFAULT_STALE_BLOCKS = 5
const DEFAULT_VERY_STALE_BLOCKS = 20
const DEFAULT_POLL_INTERVAL = 10000 // 10 seconds

/**
 * Calculate staleness for time-based data
 */
function calculateTimeStaleness(
  fetchedAt: number,
  staleThreshold: number,
  veryStaleThreshold: number
): { isStale: boolean; level: 'fresh' | 'stale' | 'very-stale'; label: string } {
  const secondsAgo = Math.floor((Date.now() - fetchedAt) / 1000)

  if (secondsAgo < 30) {
    return { isStale: false, level: 'fresh', label: 'just now' }
  }
  if (secondsAgo < 60) {
    return { isStale: false, level: 'fresh', label: `${secondsAgo}s ago` }
  }
  if (secondsAgo < staleThreshold) {
    return { isStale: false, level: 'fresh', label: `${Math.floor(secondsAgo / 60)}m ago` }
  }
  if (secondsAgo < veryStaleThreshold) {
    return { isStale: true, level: 'stale', label: `${Math.floor(secondsAgo / 60)}m ago` }
  }
  return { isStale: true, level: 'very-stale', label: `${Math.floor(secondsAgo / 60)}m ago` }
}

/**
 * Calculate staleness for block-based data
 */
function calculateBlockStaleness(
  blockNumber: number,
  currentBlock: number,
  staleThreshold: number,
  veryStaleThreshold: number
): { isStale: boolean; level: 'fresh' | 'stale' | 'very-stale'; label: string } {
  const blocksBehind = currentBlock - blockNumber

  if (blocksBehind <= 1) {
    return { isStale: false, level: 'fresh', label: 'current' }
  }
  if (blocksBehind <= staleThreshold) {
    return { isStale: false, level: 'fresh', label: `${blocksBehind} blocks behind` }
  }
  if (blocksBehind <= veryStaleThreshold) {
    return { isStale: true, level: 'stale', label: `${blocksBehind} blocks behind` }
  }
  return { isStale: true, level: 'very-stale', label: `${blocksBehind} blocks behind` }
}

/**
 * Hook to track data source and staleness
 */
export function useDataSource({
  source,
  blockNumber,
  pollInterval = DEFAULT_POLL_INTERVAL,
  staleThresholdSeconds = DEFAULT_STALE_SECONDS,
  veryStaleThresholdSeconds = DEFAULT_VERY_STALE_SECONDS,
  staleThresholdBlocks = DEFAULT_STALE_BLOCKS,
  veryStaleThresholdBlocks = DEFAULT_VERY_STALE_BLOCKS,
  onStale,
}: UseDataSourceProps) {
  const [meta, setMeta] = useState<DataSourceMeta>(() => ({
    source,
    fetchedAt: Date.now(),
    blockNumber,
    currentBlock: blockNumber,
    isStale: false,
    stalenessLevel: 'fresh',
    stalenessLabel: 'just now',
  }))

  const wasStaleRef = useRef(false)
  const onStaleRef = useRef(onStale)
  onStaleRef.current = onStale

  /**
   * Mark data as refreshed
   */
  const markRefreshed = useCallback(
    (newBlockNumber?: number) => {
      setMeta((prev) => ({
        ...prev,
        fetchedAt: Date.now(),
        blockNumber: newBlockNumber ?? prev.blockNumber,
        currentBlock: newBlockNumber ?? prev.currentBlock,
        isStale: false,
        stalenessLevel: 'fresh',
        stalenessLabel: 'just now',
      }))
      wasStaleRef.current = false
    },
    []
  )

  /**
   * Update current block (for on-chain data)
   */
  const updateCurrentBlock = useCallback((newCurrentBlock: number) => {
    setMeta((prev) => ({
      ...prev,
      currentBlock: newCurrentBlock,
    }))
  }, [])

  /**
   * Recalculate staleness
   */
  const recalculateStaleness = useCallback(() => {
    setMeta((prev) => {
      let staleness: { isStale: boolean; level: 'fresh' | 'stale' | 'very-stale'; label: string }

      if (source === 'on-chain' && prev.blockNumber && prev.currentBlock) {
        staleness = calculateBlockStaleness(
          prev.blockNumber,
          prev.currentBlock,
          staleThresholdBlocks,
          veryStaleThresholdBlocks
        )
      } else {
        staleness = calculateTimeStaleness(
          prev.fetchedAt,
          staleThresholdSeconds,
          veryStaleThresholdSeconds
        )
      }

      // Trigger callback when becoming stale
      if (staleness.isStale && !wasStaleRef.current) {
        wasStaleRef.current = true
        onStaleRef.current?.()
      }

      return {
        ...prev,
        isStale: staleness.isStale,
        stalenessLevel: staleness.level,
        stalenessLabel: staleness.label,
      }
    })
  }, [
    source,
    staleThresholdSeconds,
    veryStaleThresholdSeconds,
    staleThresholdBlocks,
    veryStaleThresholdBlocks,
  ])

  // Poll for staleness updates
  useEffect(() => {
    const interval = setInterval(recalculateStaleness, pollInterval)
    return () => clearInterval(interval)
  }, [recalculateStaleness, pollInterval])

  // Recalculate when source changes
  useEffect(() => {
    setMeta((prev) => ({
      ...prev,
      source,
      blockNumber: blockNumber ?? prev.blockNumber,
    }))
    recalculateStaleness()
  }, [source, blockNumber, recalculateStaleness])

  return {
    meta,
    markRefreshed,
    updateCurrentBlock,
    recalculateStaleness,
  }
}

/**
 * Props for multiple data sources
 */
export interface DataSourceEntry {
  /** Unique key for this data source */
  key: string
  /** Data source type */
  source: DataSourceType
  /** Block number (for on-chain) */
  blockNumber?: number
  /** Label for display */
  label?: string
}

/**
 * Hook to track multiple data sources
 */
export function useMultipleDataSources(entries: DataSourceEntry[]) {
  const [sources, setSources] = useState<Map<string, DataSourceMeta>>(new Map())

  // Initialize sources
  useEffect(() => {
    const newSources = new Map<string, DataSourceMeta>()
    const now = Date.now()

    for (const entry of entries) {
      newSources.set(entry.key, {
        source: entry.source,
        fetchedAt: now,
        blockNumber: entry.blockNumber,
        currentBlock: entry.blockNumber,
        isStale: false,
        stalenessLevel: 'fresh',
        stalenessLabel: 'just now',
      })
    }

    setSources(newSources)
  }, [entries])

  /**
   * Mark a specific source as refreshed
   */
  const markRefreshed = useCallback((key: string, newBlockNumber?: number) => {
    setSources((prev) => {
      const newMap = new Map(prev)
      const existing = newMap.get(key)
      if (existing) {
        newMap.set(key, {
          ...existing,
          fetchedAt: Date.now(),
          blockNumber: newBlockNumber ?? existing.blockNumber,
          currentBlock: newBlockNumber ?? existing.currentBlock,
          isStale: false,
          stalenessLevel: 'fresh',
          stalenessLabel: 'just now',
        })
      }
      return newMap
    })
  }, [])

  /**
   * Get metadata for a specific source
   */
  const getMeta = useCallback(
    (key: string): DataSourceMeta | undefined => {
      return sources.get(key)
    },
    [sources]
  )

  /**
   * Get all stale sources
   */
  const getStaleSources = useCallback((): string[] => {
    const stale: string[] = []
    sources.forEach((meta, key) => {
      if (meta.isStale) {
        stale.push(key)
      }
    })
    return stale
  }, [sources])

  return {
    sources,
    markRefreshed,
    getMeta,
    getStaleSources,
  }
}
