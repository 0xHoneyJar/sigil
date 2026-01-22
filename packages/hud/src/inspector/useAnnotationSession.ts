/**
 * Annotation Session Hook
 *
 * Manages a collection of annotated elements and exports them to markdown.
 * Designed for design review workflows.
 */

import { useState, useCallback, useMemo } from 'react'
import type { InspectedElement } from './useElementInspector'

/**
 * An annotation on an element
 */
export interface Annotation {
  /** Unique identifier */
  id: string
  /** The inspected element info */
  element: InspectedElement
  /** User's note about this element */
  note: string
  /** Category of the annotation */
  category: AnnotationCategory
  /** Timestamp when annotation was created */
  timestamp: number
  /** Optional screenshot data URL */
  screenshot?: string
}

/**
 * Categories for annotations
 */
export type AnnotationCategory =
  | 'physics'
  | 'layout'
  | 'accessibility'
  | 'performance'
  | 'ux'
  | 'bug'
  | 'suggestion'
  | 'other'

/**
 * Options for the annotation session hook
 */
export interface UseAnnotationSessionOptions {
  /** Session name/title */
  sessionName?: string
  /** Callback when session is exported */
  onExport?: (markdown: string, annotations: Annotation[]) => void
}

/**
 * Return type for useAnnotationSession
 */
export interface UseAnnotationSessionReturn {
  /** All annotations in the session */
  annotations: Annotation[]
  /** Add a new annotation */
  addAnnotation: (
    element: InspectedElement,
    note: string,
    category: AnnotationCategory,
    screenshot?: string
  ) => Annotation
  /** Remove an annotation */
  removeAnnotation: (id: string) => void
  /** Update an annotation */
  updateAnnotation: (id: string, updates: Partial<Pick<Annotation, 'note' | 'category'>>) => void
  /** Clear all annotations */
  clearAnnotations: () => void
  /** Export annotations to markdown */
  exportToMarkdown: () => string
  /** Get annotations by category */
  getByCategory: (category: AnnotationCategory) => Annotation[]
  /** Session statistics */
  stats: {
    total: number
    byCategory: Record<AnnotationCategory, number>
  }
}

/**
 * Category display names and icons
 */
const CATEGORY_INFO: Record<AnnotationCategory, { label: string; emoji: string }> = {
  physics: { label: 'Physics', emoji: '⚡' },
  layout: { label: 'Layout', emoji: '📐' },
  accessibility: { label: 'Accessibility', emoji: '♿' },
  performance: { label: 'Performance', emoji: '🚀' },
  ux: { label: 'UX', emoji: '👤' },
  bug: { label: 'Bug', emoji: '🐛' },
  suggestion: { label: 'Suggestion', emoji: '💡' },
  other: { label: 'Other', emoji: '📝' },
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `ann_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Hook for managing annotation sessions
 */
export function useAnnotationSession(
  options: UseAnnotationSessionOptions = {}
): UseAnnotationSessionReturn {
  const { sessionName = 'Design Review', onExport } = options

  const [annotations, setAnnotations] = useState<Annotation[]>([])

  // Add annotation
  const addAnnotation = useCallback(
    (
      element: InspectedElement,
      note: string,
      category: AnnotationCategory,
      screenshot?: string
    ): Annotation => {
      const annotation: Annotation = {
        id: generateId(),
        element,
        note,
        category,
        timestamp: Date.now(),
        screenshot,
      }

      setAnnotations((prev) => [...prev, annotation])
      return annotation
    },
    []
  )

  // Remove annotation
  const removeAnnotation = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id))
  }, [])

  // Update annotation
  const updateAnnotation = useCallback(
    (id: string, updates: Partial<Pick<Annotation, 'note' | 'category'>>) => {
      setAnnotations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
      )
    },
    []
  )

  // Clear all annotations
  const clearAnnotations = useCallback(() => {
    setAnnotations([])
  }, [])

  // Get annotations by category
  const getByCategory = useCallback(
    (category: AnnotationCategory) => {
      return annotations.filter((a) => a.category === category)
    },
    [annotations]
  )

  // Export to markdown
  const exportToMarkdown = useCallback((): string => {
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const timeStr = now.toTimeString().split(' ')[0]

    const lines: string[] = [
      `# ${sessionName}`,
      '',
      `**Date:** ${dateStr}`,
      `**Time:** ${timeStr}`,
      `**Total Annotations:** ${annotations.length}`,
      '',
      '---',
      '',
    ]

    // Group by category
    const byCategory = new Map<AnnotationCategory, Annotation[]>()
    for (const annotation of annotations) {
      const list = byCategory.get(annotation.category) ?? []
      list.push(annotation)
      byCategory.set(annotation.category, list)
    }

    // Generate sections for each category
    for (const [category, categoryAnnotations] of byCategory) {
      const info = CATEGORY_INFO[category]
      lines.push(`## ${info.emoji} ${info.label}`)
      lines.push('')

      for (const annotation of categoryAnnotations) {
        const time = new Date(annotation.timestamp).toLocaleTimeString()
        lines.push(`### ${annotation.element.componentName ?? annotation.element.tagName}`)
        lines.push('')
        lines.push(`**Selector:** \`${annotation.element.selector}\``)
        lines.push(`**Annotated at:** ${time}`)
        lines.push('')
        lines.push(annotation.note)
        lines.push('')

        // Add element details
        if (annotation.element.id) {
          lines.push(`- **ID:** ${annotation.element.id}`)
        }
        if (annotation.element.classList.length > 0) {
          lines.push(`- **Classes:** ${annotation.element.classList.join(', ')}`)
        }
        if (Object.keys(annotation.element.dataAttributes).length > 0) {
          lines.push(`- **Data attributes:** ${JSON.stringify(annotation.element.dataAttributes)}`)
        }
        lines.push('')
        lines.push('---')
        lines.push('')
      }
    }

    // Summary section
    lines.push('## Summary')
    lines.push('')
    lines.push('| Category | Count |')
    lines.push('|----------|-------|')
    for (const [category, categoryAnnotations] of byCategory) {
      const info = CATEGORY_INFO[category]
      lines.push(`| ${info.emoji} ${info.label} | ${categoryAnnotations.length} |`)
    }
    lines.push('')

    const markdown = lines.join('\n')
    onExport?.(markdown, annotations)
    return markdown
  }, [annotations, sessionName, onExport])

  // Calculate stats
  const stats = useMemo(() => {
    const byCategory: Record<AnnotationCategory, number> = {
      physics: 0,
      layout: 0,
      accessibility: 0,
      performance: 0,
      ux: 0,
      bug: 0,
      suggestion: 0,
      other: 0,
    }

    for (const annotation of annotations) {
      byCategory[annotation.category]++
    }

    return {
      total: annotations.length,
      byCategory,
    }
  }, [annotations])

  return {
    annotations,
    addAnnotation,
    removeAnnotation,
    updateAnnotation,
    clearAnnotations,
    exportToMarkdown,
    getByCategory,
    stats,
  }
}

// Export category info for use in UI
export { CATEGORY_INFO }
