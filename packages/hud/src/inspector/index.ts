/**
 * Element Inspector Module
 *
 * Provides element inspection and annotation capabilities for design review.
 */

// Hooks
export { useElementInspector } from './useElementInspector'
export type {
  InspectedElement,
  UseElementInspectorOptions,
  UseElementInspectorReturn,
} from './useElementInspector'

export { useAnnotationSession, CATEGORY_INFO } from './useAnnotationSession'
export type {
  Annotation,
  AnnotationCategory,
  UseAnnotationSessionOptions,
  UseAnnotationSessionReturn,
} from './useAnnotationSession'

// Components
export { ElementInspector } from './ElementInspector'
export type { ElementInspectorProps } from './ElementInspector'

export { AnnotationMarker, AnnotationMarkerList } from './AnnotationMarker'
export type { AnnotationMarkerProps, AnnotationMarkerListProps } from './AnnotationMarker'
