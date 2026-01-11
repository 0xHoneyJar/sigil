/**
 * @sigil-recipe decisive/Button
 * @physics spring(180, 12), timing(150-250ms), press_release
 * @zone checkout, transaction, confirm
 * @sync server_authoritative
 */

import { motion, type Variants } from 'framer-motion';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface DecisiveButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  children: ReactNode;
  
  /** Async action - button shows pending state until resolved */
  onAction: () => Promise<void>;
  
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'danger';
  
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  
  /** External loading state override */
  isLoading?: boolean;
}

// ============================================================================
// Physics Constants
// ============================================================================

const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 180,
  damping: 12,
};

const PRESS_SCALE = 0.98;

// ============================================================================
// Hooks
// ============================================================================

/**
 * Server-tick hook - ensures action completes before UI updates
 * Prevents optimistic UI in server_authoritative zones
 */
function useServerTick(action: () => Promise<void>) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async () => {
    if (isPending) return;
    
    setIsPending(true);
    setError(null);
    
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Action failed'));
      throw e;
    } finally {
      setIsPending(false);
    }
  };

  return { execute, isPending, error };
}

// Need to import useState
import { useState } from 'react';

// ============================================================================
// Styles
// ============================================================================

const baseStyles = `
  inline-flex items-center justify-center
  font-medium rounded-lg
  transition-shadow duration-150
  focus:outline-none focus:ring-2 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
`;

const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

// ============================================================================
// Component
// ============================================================================

export const Button = forwardRef<HTMLButtonElement, DecisiveButtonProps>(
  function Button(
    {
      children,
      onAction,
      variant = 'primary',
      size = 'md',
      isLoading: externalLoading,
      disabled,
      className = '',
      ...props
    },
    ref
  ) {
    const { execute, isPending } = useServerTick(onAction);
    const isLoading = externalLoading ?? isPending;

    return (
      <motion.button
        ref={ref}
        onClick={execute}
        disabled={disabled || isLoading}
        whileTap={{ scale: PRESS_SCALE }}
        transition={SPRING_CONFIG}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <LoadingDots />
            Processing...
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

// ============================================================================
// Loading Indicator
// ============================================================================

function LoadingDots() {
  return (
    <span className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 bg-current rounded-full"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </span>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default Button;
