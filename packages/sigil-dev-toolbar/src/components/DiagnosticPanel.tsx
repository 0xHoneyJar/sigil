/**
 * Diagnostic Panel Component
 *
 * Query-first diagnostics for validating on-chain state against UI.
 * Shows verified data vs items needing user confirmation.
 */

import { useState, useCallback, useEffect } from 'react'
import { useDevToolbar, useDevToolbarSelector } from '../providers/DevToolbarProvider'
import { useIPCClient } from '../hooks/useIPCClient'
import { useLensAwareAccount } from '../hooks/useUserLens'
import type { LensContext, LensValidationIssue, Zone } from '../types'

/** Diagnostic query item */
interface DiagnosticItem {
  id: string
  label: string
  component: string
  observedValue: string
  onChainValue?: string
  indexedValue?: string
  dataSource: 'on-chain' | 'indexed' | 'mixed' | 'unknown'
  zone: Zone
  status: 'pending' | 'verified' | 'mismatch' | 'unknown'
}

/** Diagnostic question for user */
interface DiagnosticQuestion {
  id: string
  question: string
  context: string
  severity: 'critical' | 'important' | 'info'
}

/**
 * Generate diagnostic questions from lens issues
 */
function generateQuestions(issues: LensValidationIssue[]): DiagnosticQuestion[] {
  return issues.map((issue, index) => {
    let question: string
    let severity: DiagnosticQuestion['severity']

    switch (issue.type) {
      case 'data_source_mismatch':
        question = `The ${issue.component} shows "${issue.actual}" but on-chain value is "${issue.expected}". Which is correct?`
        severity = issue.severity === 'error' ? 'critical' : 'important'
        break
      case 'stale_indexed_data':
        question = `The indexer shows stale data for ${issue.component}. Expected: "${issue.expected}", Got: "${issue.actual}". Has this been recently updated?`
        severity = issue.severity === 'error' ? 'critical' : 'info'
        break
      case 'lens_financial_check':
        question = `${issue.component} uses indexed data for financial operations. Should this use on-chain data instead?`
        severity = 'critical'
        break
      case 'impersonation_leak':
        question = `${issue.component} appears to show the real address instead of the impersonated one. Is this intentional?`
        severity = 'critical'
        break
      default:
        question = issue.message
        severity = 'info'
    }

    return {
      id: `q-${index}`,
      question,
      context: issue.suggestion ?? '',
      severity,
    }
  })
}

/**
 * Diagnostic Panel Props
 */
export interface DiagnosticPanelProps {
  /** Items to diagnose */
  items?: DiagnosticItem[]
  /** Whether to auto-query on mount */
  autoQuery?: boolean
  /** Callback when diagnosis completes */
  onDiagnosisComplete?: (result: { verified: DiagnosticItem[]; issues: LensValidationIssue[] }) => void
}

/**
 * Diagnostic Panel Component
 */
export function DiagnosticPanel({
  items: initialItems = [],
  autoQuery = false,
  onDiagnosisComplete,
}: DiagnosticPanelProps) {
  const [items, setItems] = useState<DiagnosticItem[]>(initialItems)
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([])
  const [isQuerying, setIsQuerying] = useState(false)

  const { validateLens, isLoading, error } = useIPCClient()
  const { address, isImpersonating, realAddress, impersonatedAddress } = useLensAwareAccount()
  const diagnosticsState = useDevToolbarSelector((state) => state.diagnostics)
  const { addViolation } = useDevToolbar()

  // Run diagnostics for all items
  const runDiagnostics = useCallback(async () => {
    if (!address) return

    setIsQuerying(true)
    const newIssues: LensValidationIssue[] = []
    const updatedItems = [...items]

    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i]

      // Build lens context
      const context: LensContext = {
        impersonatedAddress: isImpersonating ? (impersonatedAddress as string) : (address as string),
        realAddress: realAddress as string | undefined,
        component: item.component,
        observedValue: item.observedValue,
        onChainValue: item.onChainValue,
        indexedValue: item.indexedValue,
        dataSource: item.dataSource,
      }

      try {
        const result = await validateLens(context, item.zone)

        if (result.valid) {
          updatedItems[i] = { ...item, status: 'verified' }
        } else {
          updatedItems[i] = { ...item, status: 'mismatch' }
          newIssues.push(...result.issues)

          // Add violations to diagnostics state
          result.issues.forEach((issue) => {
            addViolation({
              id: `${item.id}-${issue.type}`,
              timestamp: Date.now(),
              type: 'behavioral',
              severity: issue.severity,
              message: issue.message,
              element: issue.component,
              suggestion: issue.suggestion,
            })
          })
        }
      } catch {
        updatedItems[i] = { ...item, status: 'unknown' }
      }
    }

    setItems(updatedItems)
    setQuestions(generateQuestions(newIssues))
    setIsQuerying(false)

    // Notify parent
    if (onDiagnosisComplete) {
      onDiagnosisComplete({
        verified: updatedItems.filter((i) => i.status === 'verified'),
        issues: newIssues,
      })
    }
  }, [address, items, isImpersonating, impersonatedAddress, realAddress, validateLens, addViolation, onDiagnosisComplete])

  // Auto-query on mount if enabled
  useEffect(() => {
    if (autoQuery && address && items.length > 0) {
      runDiagnostics()
    }
  }, [autoQuery, address]) // eslint-disable-line react-hooks/exhaustive-deps

  // Split items into verified and needs attention
  const verifiedItems = items.filter((i) => i.status === 'verified')
  const attentionItems = items.filter((i) => i.status === 'mismatch' || i.status === 'unknown')
  const pendingItems = items.filter((i) => i.status === 'pending')

  return (
    <div className="sigil-diagnostic-panel">
      {/* Header */}
      <div className="sigil-diagnostic-header">
        <h3>Diagnostics</h3>
        {isImpersonating && (
          <span className="sigil-diagnostic-lens-badge">
            Lens Active: {impersonatedAddress?.slice(0, 6)}...{impersonatedAddress?.slice(-4)}
          </span>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="sigil-diagnostic-error">
          {error}
        </div>
      )}

      {/* Query button */}
      <div className="sigil-diagnostic-actions">
        <button
          onClick={runDiagnostics}
          disabled={isLoading || isQuerying || items.length === 0}
          className="sigil-diagnostic-query-btn"
        >
          {isQuerying ? 'Querying...' : 'Run Diagnostics'}
        </button>
      </div>

      {/* Verified Section */}
      {verifiedItems.length > 0 && (
        <div className="sigil-diagnostic-section sigil-diagnostic-verified">
          <h4>✓ Verified ({verifiedItems.length})</h4>
          <ul>
            {verifiedItems.map((item) => (
              <li key={item.id} className="sigil-diagnostic-item verified">
                <span className="sigil-diagnostic-label">{item.label}</span>
                <span className="sigil-diagnostic-value">{item.observedValue}</span>
                <span className="sigil-diagnostic-source">{item.dataSource}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Needs Attention Section */}
      {attentionItems.length > 0 && (
        <div className="sigil-diagnostic-section sigil-diagnostic-attention">
          <h4>⚠ Needs Attention ({attentionItems.length})</h4>
          <ul>
            {attentionItems.map((item) => (
              <li key={item.id} className="sigil-diagnostic-item attention">
                <span className="sigil-diagnostic-label">{item.label}</span>
                <div className="sigil-diagnostic-comparison">
                  <span className="sigil-diagnostic-observed">
                    UI: {item.observedValue}
                  </span>
                  {item.onChainValue && (
                    <span className="sigil-diagnostic-onchain">
                      On-chain: {item.onChainValue}
                    </span>
                  )}
                  {item.indexedValue && (
                    <span className="sigil-diagnostic-indexed">
                      Indexed: {item.indexedValue}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pending Section */}
      {pendingItems.length > 0 && (
        <div className="sigil-diagnostic-section sigil-diagnostic-pending">
          <h4>○ Pending ({pendingItems.length})</h4>
          <ul>
            {pendingItems.map((item) => (
              <li key={item.id} className="sigil-diagnostic-item pending">
                <span className="sigil-diagnostic-label">{item.label}</span>
                <span className="sigil-diagnostic-value">{item.observedValue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Diagnostic Questions */}
      {questions.length > 0 && (
        <div className="sigil-diagnostic-section sigil-diagnostic-questions">
          <h4>Questions for User</h4>
          <ul>
            {questions.map((q) => (
              <li key={q.id} className={`sigil-diagnostic-question ${q.severity}`}>
                <span className="sigil-diagnostic-question-text">{q.question}</span>
                {q.context && (
                  <span className="sigil-diagnostic-question-context">
                    Suggestion: {q.context}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Anchor Issues from State */}
      {diagnosticsState.violations.length > 0 && (
        <div className="sigil-diagnostic-section sigil-diagnostic-violations">
          <h4>Recent Violations ({diagnosticsState.violations.length})</h4>
          <ul>
            {diagnosticsState.violations.slice(0, 5).map((v) => (
              <li key={v.id} className={`sigil-diagnostic-violation ${v.severity}`}>
                <span className="sigil-diagnostic-violation-msg">{v.message}</span>
                {v.suggestion && (
                  <span className="sigil-diagnostic-violation-suggestion">
                    → {v.suggestion}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="sigil-diagnostic-empty">
          <p>No items to diagnose.</p>
          <p>Add diagnostic items to validate on-chain state.</p>
        </div>
      )}
    </div>
  )
}

/**
 * Hook for managing diagnostic items
 */
export function useDiagnosticItems() {
  const [items, setItems] = useState<DiagnosticItem[]>([])

  const addItem = useCallback((item: Omit<DiagnosticItem, 'id' | 'status'>) => {
    setItems((prev) => [
      ...prev,
      {
        ...item,
        id: `diag-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        status: 'pending',
      },
    ])
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const clearItems = useCallback(() => {
    setItems([])
  }, [])

  const updateItem = useCallback((id: string, updates: Partial<DiagnosticItem>) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
    )
  }, [])

  return {
    items,
    addItem,
    removeItem,
    clearItems,
    updateItem,
  }
}
