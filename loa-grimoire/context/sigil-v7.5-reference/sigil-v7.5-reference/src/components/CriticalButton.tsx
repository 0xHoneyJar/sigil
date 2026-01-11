/**
 * CriticalButton — Gold Component
 * 
 * For irreversible financial actions: claim, deposit, withdraw
 * 
 * @sigil-status gold
 * @sigil-zone critical
 * @sigil-physics server-tick
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// PHYSICS — Server Tick (600ms, ease-out)
// =============================================================================

const PHYSICS = {
  duration: 600,
  easing: 'ease-out',
  // CSS custom properties for consistency
  transition: 'all 600ms ease-out',
} as const;

// =============================================================================
// TYPES
// =============================================================================

export interface CriticalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: 'primary' | 'danger';
  /** Loading state — disables interaction, shows spinner */
  isLoading?: boolean;
  /** Success state — shows confirmation before resetting */
  isSuccess?: boolean;
  /** Children content */
  children: React.ReactNode;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const CriticalButton = React.forwardRef<
  HTMLButtonElement,
  CriticalButtonProps
>(function CriticalButton(
  {
    className,
    variant = 'primary',
    isLoading = false,
    isSuccess = false,
    disabled,
    children,
    onClick,
    ...props
  },
  ref
) {
  // Deliberate delay for critical actions — user must feel the weight
  const [isPending, setIsPending] = React.useState(false);

  const handleClick = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading || isPending || disabled) return;

      setIsPending(true);

      // Deliberate minimum duration for critical actions
      // User needs to feel the gravity of the action
      await new Promise((resolve) => setTimeout(resolve, PHYSICS.duration));

      onClick?.(e);
      setIsPending(false);
    },
    [onClick, isLoading, isPending, disabled]
  );

  const isDisabled = disabled || isLoading || isPending;

  return (
    <button
      ref={ref}
      type="button"
      disabled={isDisabled}
      onClick={handleClick}
      className={cn(
        // Base styles
        'relative inline-flex items-center justify-center',
        'px-6 py-3 rounded-lg font-semibold text-base',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        
        // Physics: Server tick transition
        'transition-all duration-[600ms] ease-out',
        
        // Variant styles
        variant === 'primary' && [
          'bg-slate-900 text-white',
          'hover:bg-slate-800',
          'focus:ring-slate-500',
          'disabled:bg-slate-400',
        ],
        variant === 'danger' && [
          'bg-red-600 text-white',
          'hover:bg-red-700',
          'focus:ring-red-500',
          'disabled:bg-red-300',
        ],
        
        // States
        isDisabled && 'cursor-not-allowed opacity-70',
        isSuccess && 'bg-green-600 hover:bg-green-600',
        
        className
      )}
      style={{
        // Explicit physics for agent verification
        '--sigil-duration': `${PHYSICS.duration}ms`,
        '--sigil-easing': PHYSICS.easing,
      } as React.CSSProperties}
      {...props}
    >
      {/* Loading spinner */}
      {(isLoading || isPending) && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}

      {/* Success checkmark */}
      {isSuccess && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </span>
      )}

      {/* Content */}
      <span
        className={cn(
          'flex items-center gap-2',
          (isLoading || isPending || isSuccess) && 'invisible'
        )}
      >
        {children}
      </span>
    </button>
  );
});

CriticalButton.displayName = 'CriticalButton';
