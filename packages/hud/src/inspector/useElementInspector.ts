/**
 * Element Inspector Hook
 *
 * Provides element inspection capabilities for the HUD.
 * Detects hovered elements, extracts React component info from fiber,
 * and generates CSS selectors.
 */

import { useState, useCallback, useEffect, useRef } from 'react'

/**
 * Information about an inspected element
 */
export interface InspectedElement {
  /** The DOM element being inspected */
  element: HTMLElement
  /** React component name (if found in fiber) */
  componentName: string | null
  /** Generated CSS selector */
  selector: string
  /** Element's bounding rect */
  rect: DOMRect
  /** Tag name */
  tagName: string
  /** Element's id attribute */
  id: string | null
  /** Element's class list */
  classList: string[]
  /** Data attributes */
  dataAttributes: Record<string, string>
  /** Sigil HUD attribute (if present) */
  sigilAttribute: string | null
}

/**
 * Options for the inspector hook
 */
export interface UseElementInspectorOptions {
  /** Elements to exclude from inspection (e.g., the HUD itself) */
  excludeSelectors?: string[]
  /** Callback when an element is inspected */
  onInspect?: (element: InspectedElement) => void
  /** Callback when inspection mode ends */
  onExit?: () => void
}

/**
 * Return type for useElementInspector
 */
export interface UseElementInspectorReturn {
  /** Whether inspector mode is active */
  isInspecting: boolean
  /** Start inspector mode */
  startInspecting: () => void
  /** Stop inspector mode */
  stopInspecting: () => void
  /** Toggle inspector mode */
  toggleInspecting: () => void
  /** Currently hovered element info */
  hoveredElement: InspectedElement | null
  /** Currently selected (clicked) element info */
  selectedElement: InspectedElement | null
  /** Clear selection */
  clearSelection: () => void
}

// React internal key for accessing fiber
const FIBER_KEYS = [
  '__reactFiber$',
  '__reactInternalInstance$',
  '_reactRootContainer',
]

/**
 * Extract React component name from a DOM element's fiber
 */
function getReactComponentName(element: HTMLElement): string | null {
  // Try to find React fiber key on the element
  for (const key of Object.keys(element)) {
    for (const fiberKey of FIBER_KEYS) {
      if (key.startsWith(fiberKey)) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fiber = (element as any)[key]
          if (fiber) {
            // Walk up the fiber tree to find a named component
            let current = fiber
            while (current) {
              const name = getComponentNameFromFiber(current)
              if (name && !isInternalComponent(name)) {
                return name
              }
              current = current.return
            }
          }
        } catch {
          // Fiber access failed, continue
        }
      }
    }
  }
  return null
}

/**
 * Get component name from a fiber node
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getComponentNameFromFiber(fiber: any): string | null {
  if (!fiber) return null

  // Function component or class component
  if (fiber.type) {
    if (typeof fiber.type === 'function') {
      return fiber.type.displayName || fiber.type.name || null
    }
    if (typeof fiber.type === 'string') {
      return null // This is a DOM element, not a component
    }
    // ForwardRef, memo, etc.
    if (fiber.type.displayName) {
      return fiber.type.displayName
    }
    if (fiber.type.render?.displayName || fiber.type.render?.name) {
      return fiber.type.render.displayName || fiber.type.render.name
    }
  }

  return null
}

/**
 * Check if a component name is internal (should be skipped)
 */
function isInternalComponent(name: string): boolean {
  // Skip React internal components and common wrappers
  const internalPatterns = [
    /^Fragment$/,
    /^Suspense$/,
    /^Provider$/,
    /^Consumer$/,
    /^Context\./,
    /^ForwardRef\(/,
    /^Memo\(/,
    /^__/,
  ]
  return internalPatterns.some((pattern) => pattern.test(name))
}

/**
 * Generate a CSS selector for an element
 */
function getSelector(element: HTMLElement): string {
  // If element has an id, use that
  if (element.id) {
    return `#${CSS.escape(element.id)}`
  }

  // If element has data-testid, use that
  const testId = element.getAttribute('data-testid')
  if (testId) {
    return `[data-testid="${CSS.escape(testId)}"]`
  }

  // If element has data-sigil-hud, use that
  const sigilAttr = element.getAttribute('data-sigil-hud')
  if (sigilAttr) {
    return `[data-sigil-hud="${CSS.escape(sigilAttr)}"]`
  }

  // Build a path selector
  const path: string[] = []
  let current: HTMLElement | null = element

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase()

    if (current.id) {
      selector = `#${CSS.escape(current.id)}`
      path.unshift(selector)
      break
    }

    // Add class names (first 2 non-utility classes)
    const meaningfulClasses = Array.from(current.classList)
      .filter((c) => !isUtilityClass(c))
      .slice(0, 2)

    if (meaningfulClasses.length > 0) {
      selector += meaningfulClasses.map((c) => `.${CSS.escape(c)}`).join('')
    }

    // Add nth-child if needed for uniqueness
    const parent = current.parentElement
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (child) => child.tagName === current!.tagName
      )
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1
        selector += `:nth-of-type(${index})`
      }
    }

    path.unshift(selector)
    current = current.parentElement
  }

  return path.join(' > ')
}

/**
 * Check if a class name looks like a utility class (Tailwind, etc.)
 */
function isUtilityClass(className: string): boolean {
  const utilityPatterns = [
    /^(p|m|w|h|min|max)(-|$)/,
    /^(flex|grid|block|inline|hidden)$/,
    /^(bg|text|border|rounded|shadow)-/,
    /^(absolute|relative|fixed|sticky)$/,
    /^(overflow|z)-/,
    /^(gap|space)-/,
    /^(font|leading|tracking)-/,
    /^(opacity|cursor|pointer-events)-/,
  ]
  return utilityPatterns.some((pattern) => pattern.test(className))
}

/**
 * Extract element information
 */
function extractElementInfo(element: HTMLElement): InspectedElement {
  const dataAttributes: Record<string, string> = {}
  for (const attr of Array.from(element.attributes)) {
    if (attr.name.startsWith('data-')) {
      dataAttributes[attr.name] = attr.value
    }
  }

  return {
    element,
    componentName: getReactComponentName(element),
    selector: getSelector(element),
    rect: element.getBoundingClientRect(),
    tagName: element.tagName.toLowerCase(),
    id: element.id || null,
    classList: Array.from(element.classList),
    dataAttributes,
    sigilAttribute: element.getAttribute('data-sigil-hud'),
  }
}

/**
 * Hook for element inspection
 */
export function useElementInspector(
  options: UseElementInspectorOptions = {}
): UseElementInspectorReturn {
  const { excludeSelectors = ['[data-sigil-hud]'], onInspect, onExit } = options

  const [isInspecting, setIsInspecting] = useState(false)
  const [hoveredElement, setHoveredElement] = useState<InspectedElement | null>(null)
  const [selectedElement, setSelectedElement] = useState<InspectedElement | null>(null)

  const isInspectingRef = useRef(isInspecting)
  isInspectingRef.current = isInspecting

  // Check if element should be excluded from inspection
  const shouldExclude = useCallback(
    (element: HTMLElement): boolean => {
      return excludeSelectors.some((selector) => {
        try {
          return element.closest(selector) !== null
        } catch {
          return false
        }
      })
    },
    [excludeSelectors]
  )

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isInspectingRef.current) return

      const target = e.target as HTMLElement
      if (!target || target === document.body || target === document.documentElement) {
        setHoveredElement(null)
        return
      }

      if (shouldExclude(target)) {
        setHoveredElement(null)
        return
      }

      const info = extractElementInfo(target)
      setHoveredElement(info)
    },
    [shouldExclude]
  )

  // Handle click to select element
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!isInspectingRef.current) return

      const target = e.target as HTMLElement
      if (!target || shouldExclude(target)) return

      e.preventDefault()
      e.stopPropagation()

      const info = extractElementInfo(target)
      setSelectedElement(info)
      onInspect?.(info)
    },
    [shouldExclude, onInspect]
  )

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isInspectingRef.current) return

      if (e.key === 'Escape') {
        e.preventDefault()
        setIsInspecting(false)
        setHoveredElement(null)
        onExit?.()
      }
    },
    [onExit]
  )

  // Start inspecting
  const startInspecting = useCallback(() => {
    setIsInspecting(true)
    setSelectedElement(null)
  }, [])

  // Stop inspecting
  const stopInspecting = useCallback(() => {
    setIsInspecting(false)
    setHoveredElement(null)
    onExit?.()
  }, [onExit])

  // Toggle inspecting
  const toggleInspecting = useCallback(() => {
    if (isInspectingRef.current) {
      stopInspecting()
    } else {
      startInspecting()
    }
  }, [startInspecting, stopInspecting])

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedElement(null)
  }, [])

  // Set up event listeners
  useEffect(() => {
    if (!isInspecting) return

    // Use capture phase to get events before they're handled by other listeners
    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('click', handleClick, true)
    document.addEventListener('keydown', handleKeyDown, true)

    // Add cursor style to body
    document.body.style.cursor = 'crosshair'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true)
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('keydown', handleKeyDown, true)
      document.body.style.cursor = ''
    }
  }, [isInspecting, handleMouseMove, handleClick, handleKeyDown])

  return {
    isInspecting,
    startInspecting,
    stopInspecting,
    toggleInspecting,
    hoveredElement,
    selectedElement,
    clearSelection,
  }
}
