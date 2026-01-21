/**
 * Issue List Component
 *
 * Displays detected diagnostic issues with severity and suggestions.
 */

import type { DiagnosticIssue } from '../types'

type Severity = 'error' | 'warning' | 'info'

/**
 * Props for IssueList
 */
export interface IssueListProps {
  /** Issues to display */
  issues: DiagnosticIssue[]
  /** Maximum issues to show (expandable) */
  maxVisible?: number
  /** Callback when issue is clicked */
  onIssueClick?: (issue: DiagnosticIssue) => void
  /** Custom class name */
  className?: string
}

/**
 * Severity colors
 */
const severityColors: Record<Severity, { bg: string; border: string; text: string }> = {
  error: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' },
  warning: { bg: 'rgba(234, 179, 8, 0.1)', border: 'rgba(234, 179, 8, 0.3)', text: '#eab308' },
  info: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6' },
}

/**
 * Severity icons
 */
const severityIcons: Record<Severity, string> = {
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

/**
 * Issue List component
 */
export function IssueList({
  issues,
  maxVisible = 5,
  onIssueClick,
  className = '',
}: IssueListProps) {
  const hasMore = issues.length > maxVisible
  const visibleIssues = hasMore ? issues.slice(0, maxVisible) : issues

  if (issues.length === 0) {
    return (
      <div className={className} style={styles.container}>
        <div style={styles.header}>
          <span style={styles.title}>Issues</span>
          <span style={styles.count}>0</span>
        </div>
        <div style={styles.empty}>
          <span style={styles.checkIcon}>✓</span>
          No issues detected
        </div>
      </div>
    )
  }

  // Count by severity
  const errorCount = issues.filter((i) => i.severity === 'error').length
  const warningCount = issues.filter((i) => i.severity === 'warning').length

  return (
    <div className={className} style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.title}>Issues</span>
        <div style={styles.counts}>
          {errorCount > 0 && (
            <span style={{ ...styles.countBadge, ...severityColors.error }}>
              {errorCount} error{errorCount !== 1 ? 's' : ''}
            </span>
          )}
          {warningCount > 0 && (
            <span style={{ ...styles.countBadge, ...severityColors.warning }}>
              {warningCount} warning{warningCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Issue List */}
      <div style={styles.list}>
        {visibleIssues.map((issue, index) => {
          const colors = severityColors[issue.severity]
          const icon = severityIcons[issue.severity]

          return (
            <button
              key={`${issue.code}-${index}`}
              onClick={() => onIssueClick?.(issue)}
              style={{
                ...styles.issue,
                backgroundColor: colors.bg,
                borderColor: colors.border,
              }}
            >
              <span style={{ ...styles.icon, color: colors.text }}>{icon}</span>
              <div style={styles.issueContent}>
                <span style={styles.issueCode}>[{issue.code}]</span>
                <span style={styles.issueMessage}>{issue.message}</span>
                {issue.suggestion && (
                  <span style={styles.issueSuggestion}>Fix: {issue.suggestion}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* More indicator */}
      {hasMore && (
        <div style={styles.more}>+ {issues.length - maxVisible} more issues</div>
      )}
    </div>
  )
}

/**
 * Styles
 */
const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  title: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  count: {
    fontSize: '10px',
    color: '#666',
  },
  counts: {
    display: 'flex',
    gap: '6px',
  },
  countBadge: {
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    border: '1px solid',
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: '#22c55e',
  },
  checkIcon: {
    fontWeight: 600,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  issue: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '8px',
    border: '1px solid',
    borderRadius: '4px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'opacity 0.15s ease-out',
  },
  icon: {
    fontSize: '12px',
    fontWeight: 600,
    flexShrink: 0,
    marginTop: '1px',
  },
  issueContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflow: 'hidden',
  },
  issueCode: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#888',
    fontFamily: 'monospace',
  },
  issueMessage: {
    fontSize: '11px',
    color: '#fff',
    lineHeight: 1.4,
  },
  issueSuggestion: {
    fontSize: '10px',
    color: '#888',
    fontStyle: 'italic',
  },
  more: {
    marginTop: '8px',
    fontSize: '10px',
    color: '#666',
    textAlign: 'center',
  },
}
