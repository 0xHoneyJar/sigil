/**
 * @sigil-recipe decisive/Button.nintendo
 * @physics spring(300, 8), whileTap scale 0.96
 * @zone checkout, transaction, critical
 * @sync server_authoritative
 * @variant-of decisive/Button
 *
 * Nintendo Switch-style Button with snappier physics.
 * More responsive, tactile feel while maintaining trust.
 *
 * Physics rationale:
 * - stiffness: 300 — Snappy response like Switch UI
 * - damping: 8 — Quick settle with slight bounce
 * - whileTap: 0.96 — More pronounced press feedback
 *
 * Use when:
 * - Interface needs more energy/responsiveness
 * - Users expect game-like interactions
 * - "Nintendo Switch snap" feedback requested
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useServerTick } from '../../hooks';

export interface ButtonNintendoProps {
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

// Nintendo-style snappy spring
const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 8,
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
 * Nintendo-style Decisive Button
 *
 * @example
 * ```tsx
 * import { ButtonNintendo } from '@sigil/recipes/decisive';
 *
 * <ButtonNintendo onAction={handleConfirm} variant="primary">
 *   Confirm
 * </ButtonNintendo>
 * ```
 */
export function ButtonNintendo({
  children,
  onAction,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  minPendingTime = 0,
}: ButtonNintendoProps) {
  const { execute, isPending } = useServerTick(onAction, { minPendingTime });

  const isDisabled = disabled || isPending;

  return (
    <motion.button
      onClick={execute}
      disabled={isDisabled}
      whileTap={isDisabled ? undefined : { scale: 0.96 }}
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

export default ButtonNintendo;
