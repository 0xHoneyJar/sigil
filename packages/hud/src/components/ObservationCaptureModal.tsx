/**
 * Observation Capture Modal Component
 *
 * Modal for capturing user observations and insights.
 * Triggered by Cmd+Shift+O keyboard shortcut.
 * Implements TASK-203 requirements.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useObservationCapture } from '../hooks/useObservationCapture'
import type { Observation } from '../types'

/**
 * Observation type for display
 */
type ObservationType = Observation['type']

/**
 * Props for ObservationCaptureModal
 */
export interface ObservationCaptureModalProps {
  /** Whether the modal is visible */
  isOpen: boolean
  /** Callback to close the modal */
  onClose: () => void
  /** Callback when observation is captured */
  onCapture?: (observation: Observation) => void
  /** Current component context */
  componentContext?: {
    name?: string
    effect?: string
    lensAddress?: string
  }
  /** Custom class name */
  className?: string
}

/**
 * Type labels and colors
 */
const typeConfig: Record<ObservationType, { label: string; color: string; bgColor: string; description: string }> = {
  'user-truth': {
    label: 'User Truth',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    description: 'What users actually do vs. what we assumed',
  },
  issue: {
    label: 'Issue',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    description: 'Problems, bugs, or friction points',
  },
  insight: {
    label: 'Insight',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    description: 'Patterns, discoveries, or aha moments',
  },
}

/**
 * Suggested tags by type
 */
const suggestedTags: Record<ObservationType, string[]> = {
  'user-truth': ['assumption-violated', 'behavior-change', 'feedback', 'preference'],
  issue: ['ux', 'performance', 'physics-violation', 'accessibility', 'mobile'],
  insight: ['pattern', 'optimization', 'physics', 'taste', 'workflow'],
}

/**
 * Observation Capture Modal
 */
export function ObservationCaptureModal({
  isOpen,
  onClose,
  onCapture,
  componentContext,
  className = '',
}: ObservationCaptureModalProps) {
  const [type, setType] = useState<ObservationType>('insight')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const contentRef = useRef<HTMLTextAreaElement>(null)

  const { capture } = useObservationCapture({
    enabled: true,
    onObservation: onCapture,
  })

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.focus()
    }
  }, [isOpen])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setType('insight')
      setContent('')
      setTags([])
      setCustomTag('')
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
      if (e.key === 'Enter' && e.metaKey) {
        handleSubmit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, content])

  // Toggle a tag
  const toggleTag = useCallback((tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }, [])

  // Add custom tag
  const addCustomTag = useCallback(() => {
    if (customTag && !tags.includes(customTag)) {
      setTags((prev) => [...prev, customTag])
      setCustomTag('')
    }
  }, [customTag, tags])

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!content.trim()) return

    await capture(
      content.trim(),
      type,
      componentContext,
      tags
    )

    onClose()
  }, [content, type, componentContext, tags, capture, onClose])

  if (!isOpen) return null

  const config = typeConfig[type]
  const suggested = suggestedTags[type]

  return (
    <div className={className} style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Capture Observation</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ×
          </button>
        </div>

        {/* Type Selection */}
        <div style={styles.section}>
          <label style={styles.label}>Type</label>
          <div style={styles.typeButtons}>
            {(Object.keys(typeConfig) as ObservationType[]).map((t) => {
              const c = typeConfig[t]
              const isSelected = type === t
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  style={{
                    ...styles.typeButton,
                    backgroundColor: isSelected ? c.bgColor : 'rgba(255, 255, 255, 0.02)',
                    borderColor: isSelected ? c.color : 'rgba(255, 255, 255, 0.1)',
                    color: isSelected ? c.color : '#888',
                  }}
                >
                  {c.label}
                </button>
              )
            })}
          </div>
          <p style={styles.typeDescription}>{config.description}</p>
        </div>

        {/* Content */}
        <div style={styles.section}>
          <label style={styles.label}>What did you observe?</label>
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              type === 'user-truth'
                ? 'e.g., "Users expected the claim button to show pending state, but it shows stale balance..."'
                : type === 'issue'
                ? 'e.g., "Dialog animation causes layout shift on mobile Safari..."'
                : 'e.g., "Power users prefer 500ms timing over 800ms for financial operations..."'
            }
            rows={4}
            style={styles.textarea}
          />
        </div>

        {/* Tags */}
        <div style={styles.section}>
          <label style={styles.label}>Tags</label>
          <div style={styles.tagContainer}>
            {/* Suggested tags */}
            {suggested.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  ...styles.tag,
                  backgroundColor: tags.includes(tag)
                    ? config.bgColor
                    : 'rgba(255, 255, 255, 0.02)',
                  borderColor: tags.includes(tag)
                    ? config.color
                    : 'rgba(255, 255, 255, 0.1)',
                  color: tags.includes(tag) ? config.color : '#888',
                }}
              >
                {tag}
              </button>
            ))}
            {/* Custom tags */}
            {tags
              .filter((t) => !suggested.includes(t))
              .map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    ...styles.tag,
                    backgroundColor: config.bgColor,
                    borderColor: config.color,
                    color: config.color,
                  }}
                >
                  {tag} ×
                </button>
              ))}
          </div>
          {/* Custom tag input */}
          <div style={styles.customTagRow}>
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
              placeholder="Add custom tag..."
              style={styles.customTagInput}
            />
            <button
              onClick={addCustomTag}
              disabled={!customTag}
              style={{
                ...styles.addTagButton,
                opacity: customTag ? 1 : 0.5,
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Context (if available) */}
        {componentContext && (
          <div style={styles.section}>
            <label style={styles.label}>Context</label>
            <div style={styles.contextRow}>
              {componentContext.name && (
                <span style={styles.contextBadge}>
                  Component: {componentContext.name}
                </span>
              )}
              {componentContext.effect && (
                <span style={styles.contextBadge}>
                  Effect: {componentContext.effect}
                </span>
              )}
              {componentContext.lensAddress && (
                <span style={styles.contextBadge}>
                  Lens: {componentContext.lensAddress.slice(0, 6)}...
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={styles.actions}>
          <button onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            style={{
              ...styles.submitButton,
              backgroundColor: content.trim() ? config.bgColor : 'rgba(255, 255, 255, 0.02)',
              borderColor: content.trim() ? config.color : 'rgba(255, 255, 255, 0.1)',
              color: content.trim() ? config.color : '#666',
              cursor: content.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Capture (⌘+Enter)
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Styles
 */
const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  modal: {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
  },
  closeButton: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: '#888',
    fontSize: '20px',
    cursor: 'pointer',
  },
  section: {
    padding: '16px 20px',
  },
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  typeButtons: {
    display: 'flex',
    gap: '8px',
  },
  typeButton: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease-out',
  },
  typeDescription: {
    margin: '8px 0 0 0',
    fontSize: '11px',
    color: '#666',
    fontStyle: 'italic',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '13px',
    fontFamily: 'inherit',
    resize: 'vertical',
    lineHeight: 1.5,
  },
  tagContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  tag: {
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'all 0.15s ease-out',
  },
  customTagRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  customTagInput: {
    flex: 1,
    padding: '6px 10px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '11px',
    fontFamily: 'inherit',
  },
  addTagButton: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    color: '#888',
    fontSize: '16px',
    cursor: 'pointer',
  },
  contextRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  contextBadge: {
    padding: '4px 8px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '4px',
    fontSize: '10px',
    color: '#888',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    padding: '16px 20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#888',
    fontSize: '12px',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '12px',
    fontWeight: 500,
    transition: 'all 0.15s ease-out',
  },
}
