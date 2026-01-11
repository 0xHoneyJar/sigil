/**
 * @sigil-recipe glass/Tooltip
 * @physics spring(250, 25), soft entrance, fade
 * @zone marketing, help, contextual
 * @sync client_authoritative
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, type ReactNode, type CSSProperties } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface TooltipProps {
  /** Trigger element */
  children: ReactNode;
  
  /** Tooltip content */
  content: ReactNode;
  
  /** Placement relative to trigger */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  
  /** Delay before showing (ms) */
  delay?: number;
  
  /** Max width of tooltip */
  maxWidth?: number;
  
  className?: string;
}

// ============================================================================
// Physics Constants
// ============================================================================

const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 250,
  damping: 25,
};

// ============================================================================
// Component
// ============================================================================

/**
 * Glass Tooltip - Soft, inviting contextual help
 * 
 * Gentle entrance, no harsh edges.
 * For marketing and help contexts.
 */
export function Tooltip({
  children,
  content,
  placement = 'top',
  delay = 200,
  maxWidth = 200,
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const getPlacementStyles = (): CSSProperties => {
    const base: CSSProperties = {
      position: 'absolute',
    };

    switch (placement) {
      case 'top':
        return { ...base, bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8 };
      case 'bottom':
        return { ...base, top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 8 };
      case 'left':
        return { ...base, right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 8 };
      case 'right':
        return { ...base, left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 8 };
    }
  };

  const getAnimationOrigin = () => {
    switch (placement) {
      case 'top': return { y: 4, opacity: 0 };
      case 'bottom': return { y: -4, opacity: 0 };
      case 'left': return { x: 4, opacity: 0 };
      case 'right': return { x: -4, opacity: 0 };
    }
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={getAnimationOrigin()}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={{ ...getAnimationOrigin(), transition: { duration: 0.15 } }}
            transition={SPRING_CONFIG}
            style={{ ...getPlacementStyles(), maxWidth }}
            className={`
              px-3 py-2 text-sm text-white
              bg-gray-900 rounded-lg shadow-lg
              pointer-events-none z-50
              ${className}
            `}
          >
            {content}
            
            {/* Arrow */}
            <span
              className={`
                absolute w-2 h-2 bg-gray-900 rotate-45
                ${placement === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' : ''}
                ${placement === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
                ${placement === 'left' ? 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2' : ''}
                ${placement === 'right' ? 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
              `}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

export default Tooltip;
