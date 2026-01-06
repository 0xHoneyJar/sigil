/**
 * @sigil-component Button
 *
 * Context-aware button that automatically uses the correct physics
 * based on the parent SigilZone.
 *
 * Philosophy: "One component, contextual physics"
 * - No DecisiveButton, GlassButton, MachineryButton
 * - Physics come from context, not import path
 * - Moving code between zones = zero refactors
 *
 * @example
 * ```tsx
 * // In checkout (decisive zone)
 * <SigilZone material="decisive" serverAuthoritative>
 *   <Button onAction={confirmPurchase}>Confirm</Button>
 * </SigilZone>
 *
 * // In marketing (glass zone)
 * <SigilZone material="glass">
 *   <Button onAction={learnMore}>Learn More</Button>
 * </SigilZone>
 *
 * // Same Button component, different physics!
 * ```
 */

import React, { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { useSigilPhysics } from '../core/SigilZone';
import { useServerTick } from '../hooks/useServerTick';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  /** Button content */
  children: React.ReactNode;
  /** Async action to execute on click (uses serverTick in authoritative zones) */
  onAction?: () => Promise<void>;
  /** Simple click handler (for non-async actions) */
  onClick?: () => void;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Loading text shown during pending state */
  loadingText?: string;
  /** Force disable physics (use native button) */
  disablePhysics?: boolean;
}

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
} as const;

const VARIANT_CLASSES = {
  primary: 'bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-400',
  secondary: 'bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50 disabled:bg-neutral-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
  ghost: 'bg-transparent text-neutral-900 hover:bg-neutral-100 disabled:text-neutral-400',
} as const;

/**
 * Context-aware Button component.
 *
 * Automatically inherits physics from the nearest SigilZone:
 * - In decisive zones: Heavy, deliberate feel (stiffness: 180, damping: 12)
 * - In machinery zones: Instant, efficient feel (stiffness: 400, damping: 30)
 * - In glass zones: Smooth, delightful feel (stiffness: 200, damping: 20)
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      onAction,
      onClick,
      variant = 'primary',
      size = 'md',
      className = '',
      disabled = false,
      loadingText = 'Processing...',
      disablePhysics = false,
      ...motionProps
    },
    ref
  ) {
    // Get physics from context
    const { physics, serverAuthoritative, material } = useSigilPhysics();

    // Use serverTick for async actions in authoritative zones
    const { execute, isPending } = useServerTick(
      onAction ?? (async () => {}),
      {
        minPendingTime: serverAuthoritative ? physics.minPendingTime : 0,
      }
    );

    const handleClick = async () => {
      if (onAction) {
        await execute();
      } else if (onClick) {
        onClick();
      }
    };

    const isDisabled = disabled || isPending;

    const baseClassName = `
      font-medium rounded-lg
      transition-colors duration-150
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500
      disabled:cursor-not-allowed
      ${SIZE_CLASSES[size]}
      ${VARIANT_CLASSES[variant]}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    // Allow disabling physics for edge cases
    if (disablePhysics) {
      return (
        <button
          ref={ref}
          onClick={handleClick}
          disabled={isDisabled}
          className={baseClassName}
        >
          {isPending ? loadingText : children}
        </button>
      );
    }

    return (
      <motion.button
        ref={ref}
        onClick={handleClick}
        disabled={isDisabled}
        whileTap={isDisabled ? undefined : { scale: physics.tap.scale }}
        transition={physics.spring}
        className={baseClassName}
        data-sigil-material={material}
        {...motionProps}
      >
        {isPending ? loadingText : children}
      </motion.button>
    );
  }
);

export default Button;
