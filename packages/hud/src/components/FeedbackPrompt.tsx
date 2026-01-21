/**
 * Feedback Prompt Component
 *
 * Prompts users for feedback after diagnostics or crafting.
 * Emits MODIFY signals and links to observations.
 * Implements TASK-204 requirements.
 */

import { useState, useCallback } from 'react'
import { useSignalCapture } from '../hooks/useSignalCapture'
import { useObservationCapture } from '../hooks/useObservationCapture'
import type { Signal, Observation } from '../types'

/**
 * Feedback option
 */
interface FeedbackOption {
  id: string
  label: string
  description: string
  signal: 'ACCEPT' | 'MODIFY' | 'REJECT'
}

/**
 * Default feedback options
 */
const defaultOptions: FeedbackOption[] = [
  {
    id: 'looks-good',
    label: 'Looks good',
    description: 'The physics feel right for this use case',
    signal: 'ACCEPT',
  },
  {
    id: 'timing-off',
    label: 'Timing feels off',
    description: 'The duration should be faster or slower',
    signal: 'MODIFY',
  },
  {
    id: 'animation-wrong',
    label: 'Animation wrong',
    description: 'The easing or motion feels incorrect',
    signal: 'MODIFY',
  },
  {
    id: 'needs-confirmation',
    label: 'Needs confirmation',
    description: 'Should have (or shouldn\'t have) a confirmation step',
    signal: 'MODIFY',
  },
  {
    id: 'other',
    label: 'Something else',
    description: 'Describe what feels wrong',
    signal: 'MODIFY',
  },
]

/**
 * Props for FeedbackPrompt
 */
export interface FeedbackPromptProps {
  /** Component name being reviewed */
  componentName: string
  /** Detected effect type */
  effect: string
  /** Current physics values */
  physics?: {
    behavioral?: { sync: string; timing: string; confirmation: string }
    animation?: { easing: string; duration: string }
    material?: { surface: string; shadow: string; radius: string }
  }
  /** Custom feedback options */
  options?: FeedbackOption[]
  /** Callback when feedback is submitted */
  onFeedback?: (signal: Signal, observation?: Observation) => void
  /** Callback to close the prompt */
  onClose?: () => void
  /** Whether to show the prompt */
  visible?: boolean
  /** Custom class name */
  className?: string
}

/**
 * Feedback Prompt Component
 */
export function FeedbackPrompt({
  componentName,
  effect,
  physics,
  options = defaultOptions,
  onFeedback,
  onClose,
  visible = true,
  className = '',
}: FeedbackPromptProps) {
  const [selectedOption, setSelectedOption] = useState<FeedbackOption | null>(null)
  const [customFeedback, setCustomFeedback] = useState('')
  const [showDetailInput, setShowDetailInput] = useState(false)

  const { accept, modify, reject } = useSignalCapture({ enabled: true })
  const { captureInsight, captureIssue } = useObservationCapture({ enabled: true })

  // Handle option selection
  const handleSelectOption = useCallback((option: FeedbackOption) => {
    setSelectedOption(option)

    if (option.signal === 'ACCEPT') {
      // Immediate accept - no detail needed
      handleSubmit(option, '')
    } else if (option.id === 'other') {
      // Show detail input for custom feedback
      setShowDetailInput(true)
    } else {
      // Show detail input for MODIFY signals
      setShowDetailInput(true)
    }
  }, [])

  // Handle submit
  const handleSubmit = useCallback(
    async (option: FeedbackOption, detail: string) => {
      let observation: Observation | undefined

      if (option.signal === 'ACCEPT') {
        await accept(componentName, effect, 'diagnose')
      } else if (option.signal === 'MODIFY') {
        // Capture an observation for the modification
        const content = detail || option.description
        observation = await captureInsight(content, {
          component: componentName,
          effect,
        })

        // Emit MODIFY signal
        await modify(
          componentName,
          effect,
          { from: 'current', to: content },
          { inference: `User feedback: ${option.label}` }
        )
      } else if (option.signal === 'REJECT') {
        // Capture an issue observation
        observation = await captureIssue(detail || option.description, {
          component: componentName,
          effect,
        })

        await reject(componentName, effect, detail || option.description)
      }

      // Notify callback
      const signal: Signal = {
        timestamp: new Date().toISOString(),
        signal: option.signal,
        source: 'hud',
        component: {
          name: componentName,
          effect,
          craft_type: 'diagnose',
        },
        physics,
        hud_context: {
          panel_visible: true,
          diagnostics_shown: true,
          observation_linked: observation?.id,
        },
      }

      onFeedback?.(signal, observation)

      // Reset and close
      setSelectedOption(null)
      setCustomFeedback('')
      setShowDetailInput(false)
      onClose?.()
    },
    [componentName, effect, physics, accept, modify, reject, captureInsight, captureIssue, onFeedback, onClose]
  )

  // Handle cancel
  const handleCancel = useCallback(() => {
    setSelectedOption(null)
    setCustomFeedback('')
    setShowDetailInput(false)
    onClose?.()
  }, [onClose])

  if (!visible) return null

  return (
    <div className={className} style={styles.container}>
      {/* Prompt */}
      <div style={styles.promptRow}>
        <span style={styles.promptText}>Does this feel right for your user?</span>
      </div>

      {/* Options */}
      {!showDetailInput && (
        <div style={styles.optionsGrid}>
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option)}
              style={{
                ...styles.optionButton,
                borderColor:
                  option.signal === 'ACCEPT'
                    ? 'rgba(34, 197, 94, 0.3)'
                    : option.signal === 'REJECT'
                    ? 'rgba(239, 68, 68, 0.3)'
                    : 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <span style={styles.optionLabel}>{option.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Detail Input */}
      {showDetailInput && selectedOption && (
        <div style={styles.detailSection}>
          <p style={styles.detailPrompt}>
            {selectedOption.id === 'other'
              ? 'What feels wrong?'
              : `Describe what would feel better:`}
          </p>
          <textarea
            value={customFeedback}
            onChange={(e) => setCustomFeedback(e.target.value)}
            placeholder={
              selectedOption.id === 'timing-off'
                ? 'e.g., "Should be faster, around 500ms..."'
                : selectedOption.id === 'animation-wrong'
                ? 'e.g., "Should use spring instead of ease-out..."'
                : 'Describe the issue or desired feel...'
            }
            rows={2}
            style={styles.detailTextarea}
            autoFocus
          />
          <div style={styles.detailActions}>
            <button onClick={handleCancel} style={styles.cancelButton}>
              Cancel
            </button>
            <button
              onClick={() => handleSubmit(selectedOption, customFeedback)}
              disabled={selectedOption.id === 'other' && !customFeedback.trim()}
              style={{
                ...styles.submitButton,
                opacity: selectedOption.id === 'other' && !customFeedback.trim() ? 0.5 : 1,
              }}
            >
              Submit Feedback
            </button>
          </div>
        </div>
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
  promptRow: {
    marginBottom: '12px',
  },
  promptText: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '6px',
  },
  optionButton: {
    padding: '8px 10px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid',
    borderRadius: '4px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s ease-out',
  },
  optionLabel: {
    fontSize: '11px',
    color: '#fff',
  },
  detailSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  detailPrompt: {
    margin: 0,
    fontSize: '12px',
    color: '#888',
  },
  detailTextarea: {
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
  detailActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  cancelButton: {
    padding: '6px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    color: '#888',
    fontSize: '11px',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '6px 12px',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '4px',
    color: '#3b82f6',
    fontSize: '11px',
    cursor: 'pointer',
  },
}
