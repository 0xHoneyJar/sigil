/**
 * Element Inspector Component
 *
 * Visual overlay for element inspection with hover highlighting
 * and element info display.
 */

import { useState, useCallback, useMemo } from 'react'
import { colors, typography, spacing, radii, shadows, zIndex } from '../styles/theme'
import type { InspectedElement } from './useElementInspector'
import type { AnnotationCategory } from './useAnnotationSession'

/**
 * Props for ElementInspector component
 */
export interface ElementInspectorProps {
  /** Currently hovered element */
  hoveredElement: InspectedElement | null
  /** Currently selected element */
  selectedElement: InspectedElement | null
  /** Whether inspector is active */
  isInspecting: boolean
  /** Callback to add annotation */
  onAnnotate?: (element: InspectedElement, note: string, category: AnnotationCategory) => void
  /** Callback when selection is cleared */
  onClearSelection?: () => void
  /** Callback to stop inspecting */
  onStopInspecting?: () => void
}

/**
 * Styles for ElementInspector
 */
const styles = {
  // Highlight overlay for hovered elements
  highlightOverlay: {
    position: 'fixed' as const,
    pointerEvents: 'none' as const,
    zIndex: zIndex.tooltip,
    border: `2px solid ${colors.primary}`,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: radii.sm,
    transition: 'all 0.1s ease-out',
  },

  // Label showing component/element name
  highlightLabel: {
    position: 'absolute' as const,
    bottom: '100%',
    left: '0',
    marginBottom: '4px',
    padding: `2px ${spacing.sm}`,
    backgroundColor: colors.primary,
    color: '#000',
    fontSize: typography.xs,
    fontFamily: typography.fontFamily,
    fontWeight: typography.semibold,
    borderRadius: radii.sm,
    whiteSpace: 'nowrap' as const,
  },

  // Selection overlay (darker border)
  selectionOverlay: {
    position: 'fixed' as const,
    pointerEvents: 'none' as const,
    zIndex: zIndex.tooltip + 1,
    border: `3px solid ${colors.info}`,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: radii.sm,
  },

  // Info panel for selected element
  infoPanel: {
    position: 'fixed' as const,
    zIndex: zIndex.modal,
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
    boxShadow: shadows.xl,
    fontFamily: typography.fontFamily,
    fontSize: typography.sm,
    color: colors.text,
    minWidth: '300px',
    maxWidth: '400px',
    overflow: 'hidden',
  },

  infoPanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottom: `1px solid ${colors.borderSubtle}`,
    backgroundColor: colors.backgroundHover,
  },

  infoPanelTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    fontWeight: typography.semibold,
    color: colors.text,
  },

  componentBadge: {
    padding: `2px ${spacing.sm}`,
    backgroundColor: colors.infoLight,
    color: colors.info,
    border: `1px solid ${colors.infoBorder}`,
    borderRadius: radii.sm,
    fontSize: typography.xs,
  },

  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.textMuted,
    cursor: 'pointer',
    padding: spacing.xs,
    fontSize: typography.md,
    lineHeight: 1,
    borderRadius: radii.sm,
    transition: 'color 0.15s',
  },

  infoPanelContent: {
    padding: spacing.md,
  },

  infoRow: {
    display: 'flex',
    marginBottom: spacing.sm,
  },

  infoLabel: {
    width: '80px',
    flexShrink: 0,
    color: colors.textMuted,
    fontSize: typography.xs,
    textTransform: 'uppercase' as const,
    letterSpacing: typography.letterSpacingWide,
  },

  infoValue: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.fontFamily,
    wordBreak: 'break-all' as const,
  },

  selectorValue: {
    padding: `2px ${spacing.xs}`,
    backgroundColor: colors.backgroundInput,
    borderRadius: radii.sm,
    fontSize: typography.xs,
    wordBreak: 'break-all' as const,
  },

  annotateSection: {
    padding: spacing.md,
    borderTop: `1px solid ${colors.borderSubtle}`,
  },

  annotateTextarea: {
    width: '100%',
    padding: spacing.sm,
    backgroundColor: colors.backgroundInput,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.md,
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: typography.sm,
    resize: 'vertical' as const,
    minHeight: '60px',
    marginBottom: spacing.sm,
    outline: 'none',
  },

  categorySelect: {
    width: '100%',
    padding: spacing.sm,
    backgroundColor: colors.backgroundInput,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.md,
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: typography.sm,
    marginBottom: spacing.sm,
    outline: 'none',
    cursor: 'pointer',
  },

  buttonRow: {
    display: 'flex',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },

  button: {
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: radii.md,
    fontSize: typography.sm,
    fontWeight: typography.medium,
    fontFamily: typography.fontFamily,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    border: '1px solid',
  },

  primaryButton: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
    color: colors.primary,
  },

  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
    color: colors.textMuted,
  },

  // Inspector mode indicator
  modeIndicator: {
    position: 'fixed' as const,
    top: spacing.md,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: zIndex.modal,
    padding: `${spacing.sm} ${spacing.lg}`,
    backgroundColor: colors.background,
    border: `1px solid ${colors.primaryBorder}`,
    borderRadius: radii.full,
    fontFamily: typography.fontFamily,
    fontSize: typography.sm,
    color: colors.text,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    boxShadow: shadows.md,
  },

  modeIndicatorDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: colors.primary,
    animation: 'pulse 2s infinite',
  },

  escHint: {
    color: colors.textMuted,
    fontSize: typography.xs,
  },
}

// CSS for pulse animation (injected via style tag)
const pulseAnimation = `
@keyframes sigil-inspector-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
`

/**
 * Category options for annotation
 */
const CATEGORY_OPTIONS: { value: AnnotationCategory; label: string }[] = [
  { value: 'physics', label: '⚡ Physics' },
  { value: 'layout', label: '📐 Layout' },
  { value: 'accessibility', label: '♿ Accessibility' },
  { value: 'performance', label: '🚀 Performance' },
  { value: 'ux', label: '👤 UX' },
  { value: 'bug', label: '🐛 Bug' },
  { value: 'suggestion', label: '💡 Suggestion' },
  { value: 'other', label: '📝 Other' },
]

/**
 * Element Inspector component
 */
export function ElementInspector({
  hoveredElement,
  selectedElement,
  isInspecting,
  onAnnotate,
  onClearSelection,
  onStopInspecting,
}: ElementInspectorProps) {
  const [note, setNote] = useState('')
  const [category, setCategory] = useState<AnnotationCategory>('ux')

  // Calculate info panel position
  const infoPanelPosition = useMemo(() => {
    if (!selectedElement) return null

    const rect = selectedElement.rect
    const panelWidth = 350
    const panelHeight = 300 // Approximate
    const margin = 16

    let left = rect.right + margin
    let top = rect.top

    // Check if panel would overflow right
    if (left + panelWidth > window.innerWidth - margin) {
      left = rect.left - panelWidth - margin
    }

    // Check if panel would overflow left
    if (left < margin) {
      left = margin
    }

    // Check if panel would overflow bottom
    if (top + panelHeight > window.innerHeight - margin) {
      top = window.innerHeight - panelHeight - margin
    }

    // Check if panel would overflow top
    if (top < margin) {
      top = margin
    }

    return { left, top }
  }, [selectedElement])

  // Handle annotation submit
  const handleAnnotate = useCallback(() => {
    if (!selectedElement || !note.trim()) return
    onAnnotate?.(selectedElement, note.trim(), category)
    setNote('')
    onClearSelection?.()
  }, [selectedElement, note, category, onAnnotate, onClearSelection])

  // Handle close
  const handleClose = useCallback(() => {
    setNote('')
    onClearSelection?.()
  }, [onClearSelection])

  if (!isInspecting && !selectedElement) {
    return null
  }

  return (
    <>
      {/* Inject pulse animation */}
      <style>{pulseAnimation}</style>

      {/* Mode indicator when inspecting */}
      {isInspecting && (
        <div style={styles.modeIndicator} data-sigil-hud="inspector-indicator">
          <div
            style={{
              ...styles.modeIndicatorDot,
              animation: 'sigil-inspector-pulse 2s infinite',
            }}
          />
          <span>Inspector Mode</span>
          <span style={styles.escHint}>Press ESC to exit</span>
        </div>
      )}

      {/* Hover highlight */}
      {hoveredElement && isInspecting && (
        <div
          style={{
            ...styles.highlightOverlay,
            left: hoveredElement.rect.left - 2,
            top: hoveredElement.rect.top - 2,
            width: hoveredElement.rect.width + 4,
            height: hoveredElement.rect.height + 4,
          }}
          data-sigil-hud="inspector-highlight"
        >
          <div style={styles.highlightLabel}>
            {hoveredElement.componentName ?? hoveredElement.tagName}
          </div>
        </div>
      )}

      {/* Selection highlight */}
      {selectedElement && (
        <div
          style={{
            ...styles.selectionOverlay,
            left: selectedElement.rect.left - 3,
            top: selectedElement.rect.top - 3,
            width: selectedElement.rect.width + 6,
            height: selectedElement.rect.height + 6,
          }}
          data-sigil-hud="inspector-selection"
        />
      )}

      {/* Info panel for selected element */}
      {selectedElement && infoPanelPosition && (
        <div
          style={{
            ...styles.infoPanel,
            left: infoPanelPosition.left,
            top: infoPanelPosition.top,
          }}
          data-sigil-hud="inspector-panel"
        >
          {/* Header */}
          <div style={styles.infoPanelHeader}>
            <div style={styles.infoPanelTitle}>
              <span>{selectedElement.tagName}</span>
              {selectedElement.componentName && (
                <span style={styles.componentBadge}>{selectedElement.componentName}</span>
              )}
            </div>
            <button
              style={styles.closeButton}
              onClick={handleClose}
              onMouseOver={(e) => (e.currentTarget.style.color = colors.text)}
              onMouseOut={(e) => (e.currentTarget.style.color = colors.textMuted)}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div style={styles.infoPanelContent}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Selector</span>
              <code style={{ ...styles.infoValue, ...styles.selectorValue }}>
                {selectedElement.selector}
              </code>
            </div>

            {selectedElement.id && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>ID</span>
                <span style={styles.infoValue}>{selectedElement.id}</span>
              </div>
            )}

            {selectedElement.classList.length > 0 && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Classes</span>
                <span style={styles.infoValue}>
                  {selectedElement.classList.slice(0, 5).join(', ')}
                  {selectedElement.classList.length > 5 &&
                    ` +${selectedElement.classList.length - 5} more`}
                </span>
              </div>
            )}

            {selectedElement.sigilAttribute && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Sigil</span>
                <span style={styles.infoValue}>{selectedElement.sigilAttribute}</span>
              </div>
            )}
          </div>

          {/* Annotation section */}
          {onAnnotate && (
            <div style={styles.annotateSection}>
              <textarea
                style={styles.annotateTextarea}
                placeholder="Add a note about this element..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onFocus={(e) => (e.currentTarget.style.borderColor = colors.primary)}
                onBlur={(e) => (e.currentTarget.style.borderColor = colors.border)}
              />

              <select
                style={styles.categorySelect}
                value={category}
                onChange={(e) => setCategory(e.target.value as AnnotationCategory)}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <div style={styles.buttonRow}>
                <button
                  style={{ ...styles.button, ...styles.secondaryButton }}
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  style={{ ...styles.button, ...styles.primaryButton }}
                  onClick={handleAnnotate}
                  disabled={!note.trim()}
                >
                  Add Annotation
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
