/**
 * Diagnostics Panel Component
 *
 * Panel for physics compliance checking and issue detection.
 * Implements TASK-201 requirements:
 * - Physics analysis display
 * - Data source indicators
 * - Issue detection
 * - Quick action buttons
 */

import { useState, useCallback, useEffect } from 'react'
import { useHud } from '../providers/HudProvider'
import { PhysicsAnalysis } from './PhysicsAnalysis'
import { IssueList } from './IssueList'
import { DataSourceIndicator } from './DataSourceIndicator'
import type { EffectType, ComplianceResult, DiagnosticIssue } from '../types'

/**
 * Props for DiagnosticsPanel
 */
export interface DiagnosticsPanelProps {
  /** Custom class name */
  className?: string
}

/**
 * Current analysis state
 */
interface AnalysisState {
  component: string | null
  effect: EffectType | null
  compliance: ComplianceResult | null
  issues: DiagnosticIssue[]
  isLoading: boolean
}

const initialAnalysisState: AnalysisState = {
  component: null,
  effect: null,
  compliance: null,
  issues: [],
  isLoading: false,
}

/**
 * Diagnostics panel for physics analysis
 */
export function DiagnosticsPanel({ className = '' }: DiagnosticsPanelProps) {
  const { diagnosticsService, activePanel, config } = useHud()
  const [analysis, setAnalysis] = useState<AnalysisState>(initialAnalysisState)
  const [symptom, setSymptom] = useState('')
  const [diagnosis, setDiagnosis] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSymptomInput, setShowSymptomInput] = useState(false)

  // Analyze component when selected (placeholder - could be wired to component selection)
  const analyzeComponent = useCallback(
    async (componentName: string, code?: string) => {
      if (!diagnosticsService) return

      setAnalysis((prev) => ({ ...prev, isLoading: true }))
      try {
        const result = await diagnosticsService.analyze(componentName, code)
        setAnalysis({
          component: result.component,
          effect: result.effect,
          compliance: result.compliance,
          issues: result.issues,
          isLoading: false,
        })
      } catch (error) {
        setAnalysis({
          ...initialAnalysisState,
          isLoading: false,
        })
      }
    },
    [diagnosticsService]
  )

  // Handle diagnose symptom
  const handleDiagnose = useCallback(async () => {
    if (!diagnosticsService || !symptom) return

    setIsLoading(true)
    try {
      const result = diagnosticsService.diagnose(symptom)
      setDiagnosis(result)
    } catch (error) {
      setDiagnosis(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }, [diagnosticsService, symptom])

  // Handle clear
  const handleClear = useCallback(() => {
    setSymptom('')
    setDiagnosis(null)
    setShowSymptomInput(false)
  }, [])

  // Handle capture observation (quick action)
  const handleCaptureObservation = useCallback(() => {
    // Trigger observation capture modal via keyboard shortcut simulation
    const event = new KeyboardEvent('keydown', {
      key: 'o',
      metaKey: true,
      shiftKey: true,
    })
    window.dispatchEvent(event)
  }, [])

  // Handle record signal (quick action)
  const handleRecordSignal = useCallback(() => {
    // TODO: Implement signal recording - TASK-204
    console.log('Record signal triggered')
  }, [])

  // Handle issue click
  const handleIssueClick = useCallback((issue: DiagnosticIssue) => {
    // Could open a detail panel or link to docs
    console.log('Issue clicked:', issue.code)
  }, [])

  // Don't render if not the active panel
  if (activePanel !== 'diagnostics') return null

  // Show message if diagnostics service not available
  if (!diagnosticsService) {
    return (
      <div className={className} style={styles.container}>
        <div style={styles.header}>
          <span style={styles.title}>Diagnostics</span>
        </div>
        <div style={styles.unavailable}>
          <p style={styles.unavailableText}>Diagnostics service not available.</p>
          <p style={styles.unavailableHint}>
            Install @sigil/diagnostics to enable physics analysis.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={className} style={styles.container}>
      {/* Header with Quick Actions */}
      <div style={styles.header}>
        <span style={styles.title}>Diagnostics</span>
        <div style={styles.quickActions}>
          {config.observationCapture && (
            <button
              onClick={handleCaptureObservation}
              style={styles.quickActionButton}
              title="Capture Observation (Cmd+Shift+O)"
            >
              📸
            </button>
          )}
          {config.signalCapture && (
            <button
              onClick={handleRecordSignal}
              style={styles.quickActionButton}
              title="Record Signal"
            >
              📡
            </button>
          )}
        </div>
      </div>

      {/* Physics Analysis Section */}
      <PhysicsAnalysis
        effect={analysis.effect}
        compliance={analysis.compliance}
        isLoading={analysis.isLoading}
      />

      {/* Data Source Indicator (placeholder for TASK-202) */}
      <div style={styles.section}>
        <span style={styles.sectionLabel}>Data Sources</span>
        <div style={styles.dataSourceRow}>
          <DataSourceIndicator source="on-chain" blockNumber={19234567} currentBlock={19234569} />
        </div>
      </div>

      {/* Issues Section */}
      <div style={styles.section}>
        <IssueList
          issues={analysis.issues}
          onIssueClick={handleIssueClick}
          maxVisible={3}
        />
      </div>

      {/* Symptom Input (toggleable) */}
      {!showSymptomInput ? (
        <button
          onClick={() => setShowSymptomInput(true)}
          style={styles.showDiagnoseButton}
        >
          + Describe a symptom to diagnose
        </button>
      ) : (
        <div style={styles.diagnoseSection}>
          <label style={styles.inputLabel}>Describe the issue or symptom</label>
          <textarea
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            placeholder="e.g., Dialog flickers on open, Hydration mismatch, Button feels slow..."
            rows={2}
            style={styles.textarea}
          />
          <div style={styles.diagnoseActions}>
            <button
              onClick={handleDiagnose}
              disabled={!symptom || isLoading}
              style={{
                ...styles.diagnoseButton,
                opacity: symptom ? 1 : 0.5,
                cursor: symptom ? 'pointer' : 'not-allowed',
              }}
            >
              {isLoading ? 'Analyzing...' : 'Diagnose'}
            </button>
            <button onClick={handleClear} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Diagnosis Result */}
      {diagnosis && (
        <div style={styles.diagnosisResult}>
          <div
            style={styles.diagnosisContent}
            dangerouslySetInnerHTML={{
              __html: formatDiagnosis(diagnosis),
            }}
          />
        </div>
      )}

      {/* Quick Diagnose Buttons */}
      <div style={styles.quickDiagnose}>
        <span style={styles.quickDiagnoseLabel}>Quick Diagnose</span>
        <div style={styles.quickDiagnoseGrid}>
          {['hydration mismatch', 'dialog glitch', 'slow performance', 'layout shift'].map(
            (quick) => (
              <button
                key={quick}
                onClick={() => {
                  setSymptom(quick)
                  setShowSymptomInput(true)
                }}
                style={styles.quickDiagnoseButton}
              >
                {quick}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Format diagnosis for display (simple markdown-like formatting)
 */
function formatDiagnosis(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #10b981">$1</strong>')
    .replace(
      /`([^`]+)`/g,
      '<code style="background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 2px;">$1</code>'
    )
    .replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      '<pre style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px; overflow-x: auto; margin: 8px 0;">$2</pre>'
    )
}

/**
 * Styles
 */
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#fff',
  },
  quickActions: {
    display: 'flex',
    gap: '4px',
  },
  quickActionButton: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background-color 0.15s ease-out',
  },
  unavailable: {
    padding: '16px',
    textAlign: 'center',
  },
  unavailableText: {
    color: '#666',
    fontSize: '11px',
    margin: 0,
  },
  unavailableHint: {
    color: '#555',
    fontSize: '10px',
    marginTop: '4px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionLabel: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  dataSourceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  showDiagnoseButton: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px dashed rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    color: '#666',
    fontSize: '11px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  diagnoseSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  inputLabel: {
    fontSize: '10px',
    color: '#888',
  },
  textarea: {
    width: '100%',
    padding: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '11px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  diagnoseActions: {
    display: 'flex',
    gap: '8px',
  },
  diagnoseButton: {
    flex: 1,
    padding: '6px 12px',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '4px',
    color: '#10b981',
    fontSize: '11px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '6px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    color: '#888',
    fontSize: '11px',
    cursor: 'pointer',
  },
  diagnosisResult: {
    padding: '12px',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '4px',
  },
  diagnosisContent: {
    fontSize: '11px',
    color: '#fff',
    whiteSpace: 'pre-wrap',
    lineHeight: 1.6,
  },
  quickDiagnose: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  quickDiagnoseLabel: {
    fontSize: '10px',
    color: '#888',
  },
  quickDiagnoseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '4px',
  },
  quickDiagnoseButton: {
    padding: '6px 8px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '4px',
    color: '#888',
    fontSize: '10px',
    cursor: 'pointer',
    textAlign: 'center',
  },
}
