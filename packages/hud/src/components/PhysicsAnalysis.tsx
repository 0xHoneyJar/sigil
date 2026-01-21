/**
 * Physics Analysis Component
 *
 * Displays detected effect type and physics values for the current context.
 */

import type { EffectType, ComplianceResult } from '../types'

/**
 * Props for PhysicsAnalysis
 */
export interface PhysicsAnalysisProps {
  /** Detected effect type */
  effect: EffectType | null
  /** Physics compliance result */
  compliance?: ComplianceResult | null
  /** Whether analysis is loading */
  isLoading?: boolean
  /** Custom class name */
  className?: string
}

/**
 * Display label for effect types
 */
const effectLabels: Record<EffectType, string> = {
  financial: 'Financial',
  destructive: 'Destructive',
  'soft-delete': 'Soft Delete',
  standard: 'Standard',
  local: 'Local State',
  navigation: 'Navigation',
  query: 'Query',
}

/**
 * Color for effect types
 */
const effectColors: Record<EffectType, string> = {
  financial: '#ef4444', // red
  destructive: '#f97316', // orange
  'soft-delete': '#eab308', // yellow
  standard: '#22c55e', // green
  local: '#3b82f6', // blue
  navigation: '#8b5cf6', // purple
  query: '#06b6d4', // cyan
}

/**
 * Physics Analysis component
 */
export function PhysicsAnalysis({
  effect,
  compliance,
  isLoading = false,
  className = '',
}: PhysicsAnalysisProps) {
  if (isLoading) {
    return (
      <div className={className} style={styles.container}>
        <div style={styles.header}>
          <span style={styles.title}>Physics</span>
          <span style={styles.loading}>Analyzing...</span>
        </div>
      </div>
    )
  }

  if (!effect) {
    return (
      <div className={className} style={styles.container}>
        <div style={styles.header}>
          <span style={styles.title}>Physics</span>
        </div>
        <div style={styles.empty}>
          No component selected. Select a component to view physics analysis.
        </div>
      </div>
    )
  }

  const color = effectColors[effect]
  const behavioral = compliance?.behavioral
  const animation = compliance?.animation
  const material = compliance?.material

  return (
    <div className={className} style={styles.container}>
      {/* Effect Badge */}
      <div style={styles.effectRow}>
        <span
          style={{
            ...styles.effectBadge,
            backgroundColor: `${color}20`,
            borderColor: `${color}50`,
            color,
          }}
        >
          {effectLabels[effect]}
        </span>
        {behavioral && !behavioral.compliant && (
          <span style={styles.warningBadge}>⚠ Non-compliant</span>
        )}
      </div>

      {/* Physics Grid */}
      {compliance && (
        <div style={styles.grid}>
          {/* Behavioral */}
          <div style={styles.section}>
            <span style={styles.sectionLabel}>Behavioral</span>
            <div style={styles.values}>
              <span style={styles.value}>
                <span style={styles.valueLabel}>Sync:</span>
                <span style={getValueStyle(behavioral?.compliant)}>
                  {behavioral?.sync ?? 'unknown'}
                </span>
              </span>
              <span style={styles.value}>
                <span style={styles.valueLabel}>Timing:</span>
                <span style={getValueStyle(behavioral?.compliant)}>
                  {behavioral?.timing ? `${behavioral.timing}ms` : 'unknown'}
                </span>
              </span>
              <span style={styles.value}>
                <span style={styles.valueLabel}>Confirm:</span>
                <span style={getValueStyle(behavioral?.compliant)}>
                  {behavioral?.confirmation ? 'yes' : 'no'}
                </span>
              </span>
            </div>
          </div>

          {/* Animation */}
          <div style={styles.section}>
            <span style={styles.sectionLabel}>Animation</span>
            <div style={styles.values}>
              <span style={styles.value}>
                <span style={styles.valueLabel}>Easing:</span>
                <span style={getValueStyle(animation?.compliant)}>
                  {animation?.easing ?? 'unknown'}
                </span>
              </span>
              <span style={styles.value}>
                <span style={styles.valueLabel}>Duration:</span>
                <span style={getValueStyle(animation?.compliant)}>
                  {animation?.duration ? `${animation.duration}ms` : 'unknown'}
                </span>
              </span>
            </div>
          </div>

          {/* Material */}
          <div style={styles.section}>
            <span style={styles.sectionLabel}>Material</span>
            <div style={styles.values}>
              <span style={styles.value}>
                <span style={styles.valueLabel}>Surface:</span>
                <span style={getValueStyle(material?.compliant)}>
                  {material?.surface ?? 'unknown'}
                </span>
              </span>
              <span style={styles.value}>
                <span style={styles.valueLabel}>Shadow:</span>
                <span style={getValueStyle(material?.compliant)}>
                  {material?.shadow ?? 'unknown'}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Get value text style based on compliance
 */
function getValueStyle(compliant?: boolean): React.CSSProperties {
  if (compliant === undefined) return styles.valueText
  return compliant
    ? { ...styles.valueText, color: '#22c55e' }
    : { ...styles.valueText, color: '#ef4444' }
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
    marginBottom: '8px',
  },
  title: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  loading: {
    fontSize: '10px',
    color: '#666',
  },
  empty: {
    fontSize: '11px',
    color: '#666',
    fontStyle: 'italic',
  },
  effectRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  effectBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    border: '1px solid',
  },
  warningBadge: {
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  sectionLabel: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  values: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  value: {
    display: 'flex',
    gap: '4px',
    fontSize: '11px',
  },
  valueLabel: {
    color: '#888',
  },
  valueText: {
    color: '#fff',
  },
}
