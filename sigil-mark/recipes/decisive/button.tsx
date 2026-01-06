/**
 * @sigil-recipe decisive/Button
 * @physics spring(180, 12), whileTap scale 0.98
 * @zone checkout, transaction, critical
 * @sync server_authoritative
 *
 * Decisive Button for critical actions where user trust matters.
 * Heavy, deliberate feel that communicates "this action is important."
 *
 * Physics rationale:
 * - stiffness: 180 — Not too snappy, feels weighty
 * - damping: 12 — Controlled settle, no bounce
 * - whileTap: 0.98 — Subtle press feedback
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useServerTick } from '../../hooks';

export interface ButtonProps {
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

const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 180,
  damping: 12,
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
 * Decisive Button Recipe
 *
 * @example
 * ```tsx
 * import { Button } from '@sigil/recipes/decisive';
 *
 * <Button onAction={handleCheckout} variant="primary">
 *   Confirm Purchase
 * </Button>
 * ```
 */
export function Button({
  children,
  onAction,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  minPendingTime = 0,
}: ButtonProps) {
  const { execute, isPending } = useServerTick(onAction, { minPendingTime });

  const isDisabled = disabled || isPending;

  return (
    <motion.button
      onClick={execute}
      disabled={isDisabled}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
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

export default Button;
