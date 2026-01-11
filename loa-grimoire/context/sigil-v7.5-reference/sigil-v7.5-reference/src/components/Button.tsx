/**
 * Button — Gold Component
 * 
 * Standard interactive button for casual/important actions
 * 
 * @sigil-status gold
 * @sigil-zone casual
 * @sigil-physics snappy
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// PHYSICS — Snappy (150ms, ease-out)
// =============================================================================

const PHYSICS = {
  duration: 150,
  easing: 'ease-out',
  transition: 'all 150ms ease-out',
} as const;

// =============================================================================
// TYPES
// =============================================================================

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state */
  isLoading?: boolean;
  /** Children content */
  children: React.ReactNode;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center',
          'font-medium rounded-md',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          
          // Physics: Snappy transition
          'transition-all duration-150 ease-out',
          
          // Size variants
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-4 py-2 text-base',
          size === 'lg' && 'px-6 py-3 text-lg',
          
          // Variant styles
          variant === 'primary' && [
            'bg-slate-900 text-white',
            'hover:bg-slate-700',
            'focus:ring-slate-500',
          ],
          variant === 'secondary' && [
            'bg-slate-100 text-slate-900',
            'hover:bg-slate-200',
            'focus:ring-slate-500',
          ],
          variant === 'ghost' && [
            'bg-transparent text-slate-700',
            'hover:bg-slate-100',
            'focus:ring-slate-500',
          ],
          variant === 'link' && [
            'bg-transparent text-slate-900 underline-offset-4',
            'hover:underline',
            'focus:ring-slate-500',
          ],
          
          // Disabled state
          isDisabled && 'cursor-not-allowed opacity-50',
          
          className
        )}
        style={{
          '--sigil-duration': `${PHYSICS.duration}ms`,
          '--sigil-easing': PHYSICS.easing,
        } as React.CSSProperties}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
