/**
 * @sigil-recipe glass/Tooltip
 * @physics spring(260, 24), delayed appearance
 * @zone marketing, ui, contextual
 * @sync client_authoritative
 *
 * Polished tooltip with soft entrance.
 * Delayed appearance prevents accidental triggers.
 *
 * Physics rationale:
 * - stiffness: 260 — Quick but smooth
 * - damping: 24 — Minimal overshoot
 * - Delay: 200ms before showing
 * - Fade + scale entrance
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Trigger element */
  children: React.ReactNode;
  /** Tooltip position */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay before showing (ms) */
  showDelay?: number;
  /** Delay before hiding (ms) */
  hideDelay?: number;
  /** Additional class names for tooltip */
  className?: string;
  /** Disable tooltip */
  disabled?: boolean;
}

const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 24,
};

const POSITION_CLASSES = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const ARROW_CLASSES = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-neutral-900 border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-neutral-900 border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-neutral-900 border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-neutral-900 border-y-transparent border-l-transparent',
};

const ANIMATION_ORIGINS = {
  top: { originY: 1 },
  bottom: { originY: 0 },
  left: { originX: 1 },
  right: { originX: 0 },
};

/**
 * Polished Tooltip with Soft Entrance
 *
 * @example
 * ```tsx
 * import { Tooltip } from '@sigil/recipes/glass';
 *
 * <Tooltip content="This is a helpful tip" position="top">
 *   <button>Hover me</button>
 * </Tooltip>
 * ```
 */
export function Tooltip({
  content,
  children,
  position = 'top',
  showDelay = 200,
  hideDelay = 0,
  className = '',
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimeouts = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (disabled) return;
    clearTimeouts();
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, showDelay);
  }, [disabled, showDelay, clearTimeouts]);

  const handleMouseLeave = useCallback(() => {
    clearTimeouts();
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  }, [hideDelay, clearTimeouts]);

  const handleFocus = useCallback(() => {
    if (disabled) return;
    clearTimeouts();
    setIsVisible(true);
  }, [disabled, clearTimeouts]);

  const handleBlur = useCallback(() => {
    clearTimeouts();
    setIsVisible(false);
  }, [clearTimeouts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
      <AnimatePresence>
        {isVisible && !disabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={SPRING_CONFIG}
            style={ANIMATION_ORIGINS[position]}
            className={`
              absolute z-50 ${POSITION_CLASSES[position]}
              px-3 py-1.5 rounded-md
              bg-neutral-900 text-white text-sm
              whitespace-nowrap pointer-events-none
              ${className}
            `.trim().replace(/\s+/g, ' ')}
            role="tooltip"
          >
            {content}
            {/* Arrow */}
            <span
              className={`
                absolute w-0 h-0
                border-4 ${ARROW_CLASSES[position]}
              `.trim().replace(/\s+/g, ' ')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Tooltip;
