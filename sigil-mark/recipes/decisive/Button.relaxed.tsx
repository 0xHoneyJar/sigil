/**
 * @sigil-recipe decisive/Button.relaxed
 * @physics spring(140, 16), whileTap scale 0.99
 * @zone checkout, transaction, critical
 * @sync server_authoritative
 * @variant-of decisive/Button
 *
 * Relaxed Button with softer, more deliberate physics.
 * Less anxious feel for sensitive contexts.
 *
 * Physics rationale:
 * - stiffness: 140 — Slower, more deliberate movement
 * - damping: 16 — Heavy damping, no overshoot
 * - whileTap: 0.99 — Minimal press feedback
 *
 * Use when:
 * - Base button feels "anxious" or "too snappy"
 * - Context requires extra calm (financial, medical)
 * - Users need time to reconsider
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useServerTick } from '../../hooks';

export interface ButtonRelaxedProps {
  /** Button content */
  children: React.ReactNode;
  /** Async action to execute on click */
  onAction: () => Promise<void>;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
  /** Disabled state (also true during pending) */
  disabled?: boolean;
  /** Minimum time to show pending state (ms) */
  minPendingTime?: number;
}

// Relaxed, deliberate spring
const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 140,
  damping: 16,
};

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const VARIANT_CLASSES = {
  primary: 'bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-400',
  secondary: 'bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50 disabled:bg-neutral-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
};

/**
 * Relaxed Decisive Button
 *
 * @example
 * ```tsx
 * import { ButtonRelaxed } from '@sigil/recipes/decisive';
 *
 * <ButtonRelaxed onAction={handleSensitiveAction} variant="danger">
 *   Delete Account
 * </ButtonRelaxed>
 * ```
 */
export function ButtonRelaxed({
  children,
  onAction,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  minPendingTime = 0,
}: ButtonRelaxedProps) {
  const { execute, isPending } = useServerTick(onAction, { minPendingTime });

  const isDisabled = disabled || isPending;

  return (
    <motion.button
      onClick={execute}
      disabled={isDisabled}
      whileTap={isDisabled ? undefined : { scale: 0.99 }}
      transition={SPRING_CONFIG}
      className={`
        font-medium rounded-lg
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500
        disabled:cursor-not-allowed
        ${SIZE_CLASSES[size]}
        ${VARIANT_CLASSES[variant]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {isPending ? 'Processing...' : children}
    </motion.button>
  );
}

export default ButtonRelaxed;
