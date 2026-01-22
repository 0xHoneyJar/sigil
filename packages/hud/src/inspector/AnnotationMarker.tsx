/**
 * Annotation Marker Component
 *
 * Visual markers displayed on annotated elements.
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { colors, typography, spacing, radii, shadows, zIndex } from '../styles/theme'
import type { Annotation, AnnotationCategory } from './useAnnotationSession'

/**
 * Props for AnnotationMarker component
 */
export interface AnnotationMarkerProps {
  /** The annotation to display */
  annotation: Annotation
  /** Index number for display */
  index: number
  /** Whether the marker is highlighted */
  isHighlighted?: boolean
  /** Callback when marker is clicked */
  onClick?: (annotation: Annotation) => void
  /** Callback when annotation is deleted */
  onDelete?: (id: string) => void
}

/**
 * Category colors
 */
const CATEGORY_COLORS: Record<AnnotationCategory, string> = {
  physics: colors.warning,
  layout: colors.info,
  accessibility: '#a855f7', // purple
  performance: colors.success,
  ux: '#ec4899', // pink
  bug: colors.error,
  suggestion: colors.primary,
  other: colors.textMuted,
}

/**
 * Category emojis
 */
const CATEGORY_EMOJIS: Record<AnnotationCategory, string> = {
  physics: '⚡',
  layout: '📐',
  accessibility: '♿',
  performance: '🚀',
  ux: '👤',
  bug: '🐛',
  suggestion: '💡',
  other: '📝',
}

/**
 * Styles for AnnotationMarker
 */
const createStyles = (color: string) => ({
  marker: {
    position: 'fixed' as const,
    zIndex: zIndex.tooltip,
    pointerEvents: 'auto' as const,
    cursor: 'pointer',
  },

  badge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: color,
    color: '#000',
    fontSize: typography.xs,
    fontWeight: typography.bold,
    fontFamily: typography.fontFamily,
    boxShadow: shadows.md,
    transition: 'transform 0.15s ease-out',
    border: '2px solid #fff',
  },

  badgeHovered: {
    transform: 'scale(1.2)',
  },

  tooltip: {
    position: 'absolute' as const,
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
    boxShadow: shadows.lg,
    minWidth: '200px',
    maxWidth: '280px',
    fontFamily: typography.fontFamily,
    fontSize: typography.sm,
    color: colors.text,
    zIndex: 1,
  },

  tooltipHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottom: `1px solid ${colors.borderSubtle}`,
  },

  tooltipCategory: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: `2px ${spacing.sm}`,
    backgroundColor: `${color}20`,
    color: color,
    border: `1px solid ${color}40`,
    borderRadius: radii.sm,
    fontSize: typography.xs,
    fontWeight: typography.medium,
  },

  tooltipElement: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },

  tooltipNote: {
    lineHeight: typography.lineHeightNormal,
    wordBreak: 'break-word' as const,
  },

  tooltipFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTop: `1px solid ${colors.borderSubtle}`,
  },

  tooltipTime: {
    fontSize: typography.xs,
    color: colors.textDim,
  },

  deleteButton: {
    backgroundColor: 'transparent',
    border: `1px solid ${colors.errorBorder}`,
    color: colors.error,
    padding: `2px ${spacing.sm}`,
    borderRadius: radii.sm,
    fontSize: typography.xs,
    cursor: 'pointer',
    fontFamily: typography.fontFamily,
    transition: 'background-color 0.15s',
  },

  outline: {
    position: 'fixed' as const,
    pointerEvents: 'none' as const,
    border: `2px dashed ${color}`,
    borderRadius: radii.sm,
    zIndex: zIndex.tooltip - 1,
  },
})

/**
 * Annotation Marker component
 */
export function AnnotationMarker({
  annotation,
  index,
  isHighlighted = false,
  onClick,
  onDelete,
}: AnnotationMarkerProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)

  const color = CATEGORY_COLORS[annotation.category]
  const emoji = CATEGORY_EMOJIS[annotation.category]
  const styles = useMemo(() => createStyles(color), [color])

  // Update rect when annotation changes or on resize
  useEffect(() => {
    const updateRect = () => {
      try {
        const element = document.querySelector(annotation.element.selector)
        if (element) {
          setRect(element.getBoundingClientRect())
        } else {
          setRect(null)
        }
      } catch {
        setRect(null)
      }
    }

    updateRect()

    // Update on resize and scroll
    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, true)

    return () => {
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect, true)
    }
  }, [annotation.element.selector])

  const handleClick = useCallback(() => {
    onClick?.(annotation)
  }, [annotation, onClick])

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDelete?.(annotation.id)
    },
    [annotation.id, onDelete]
  )

  const formatTime = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [])

  // Don't render if element not found
  if (!rect) {
    return null
  }

  const showTooltip = isHovered || isHighlighted

  return (
    <>
      {/* Element outline when hovered */}
      {showTooltip && (
        <div
          style={{
            ...styles.outline,
            left: rect.left - 2,
            top: rect.top - 2,
            width: rect.width + 4,
            height: rect.height + 4,
          }}
          data-sigil-hud="annotation-outline"
        />
      )}

      {/* Marker badge */}
      <div
        style={{
          ...styles.marker,
          left: rect.right - 12,
          top: rect.top - 12,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        data-sigil-hud="annotation-marker"
      >
        <div
          style={{
            ...styles.badge,
            ...(showTooltip ? styles.badgeHovered : {}),
          }}
        >
          {index + 1}
        </div>

        {/* Tooltip */}
        {showTooltip && (
          <div style={styles.tooltip}>
            <div style={styles.tooltipHeader}>
              <span style={styles.tooltipCategory}>
                <span>{emoji}</span>
                <span>{annotation.category}</span>
              </span>
              <span style={styles.tooltipElement}>
                {annotation.element.componentName ?? annotation.element.tagName}
              </span>
            </div>

            <div style={styles.tooltipNote}>{annotation.note}</div>

            <div style={styles.tooltipFooter}>
              <span style={styles.tooltipTime}>{formatTime(annotation.timestamp)}</span>
              {onDelete && (
                <button
                  style={styles.deleteButton}
                  onClick={handleDelete}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = colors.errorLight)
                  }
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

/**
 * Props for AnnotationMarkerList component
 */
export interface AnnotationMarkerListProps {
  /** All annotations to display */
  annotations: Annotation[]
  /** ID of highlighted annotation */
  highlightedId?: string | null
  /** Callback when a marker is clicked */
  onMarkerClick?: (annotation: Annotation) => void
  /** Callback when an annotation is deleted */
  onDelete?: (id: string) => void
}

/**
 * Component to render all annotation markers
 */
export function AnnotationMarkerList({
  annotations,
  highlightedId,
  onMarkerClick,
  onDelete,
}: AnnotationMarkerListProps) {
  return (
    <>
      {annotations.map((annotation, index) => (
        <AnnotationMarker
          key={annotation.id}
          annotation={annotation}
          index={index}
          isHighlighted={annotation.id === highlightedId}
          onClick={onMarkerClick}
          onDelete={onDelete}
        />
      ))}
    </>
  )
}
