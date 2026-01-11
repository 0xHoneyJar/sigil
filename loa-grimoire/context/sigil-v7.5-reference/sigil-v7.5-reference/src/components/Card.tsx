/**
 * Card — Gold Component
 * 
 * Standard content container
 * 
 * @sigil-status gold
 * @sigil-zone casual
 * @sigil-physics smooth
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// PHYSICS — Smooth (300ms, cubic-bezier)
// =============================================================================

const PHYSICS = {
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// =============================================================================
// TYPES
// =============================================================================

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: 'default' | 'bordered' | 'elevated';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Whether card is interactive (hover effects) */
  interactive?: boolean;
  /** Children content */
  children: React.ReactNode;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// =============================================================================
// COMPONENTS
// =============================================================================

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  function Card(
    {
      className,
      variant = 'default',
      padding = 'md',
      interactive = false,
      children,
      ...props
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-lg bg-white',
          
          // Physics: Smooth transition
          'transition-all duration-300',
          
          // Variant styles
          variant === 'default' && 'border border-slate-200',
          variant === 'bordered' && 'border-2 border-slate-300',
          variant === 'elevated' && 'shadow-lg border border-slate-100',
          
          // Padding
          padding === 'none' && '',
          padding === 'sm' && 'p-3',
          padding === 'md' && 'p-4',
          padding === 'lg' && 'p-6',
          
          // Interactive
          interactive && [
            'cursor-pointer',
            'hover:shadow-md hover:border-slate-300',
            'active:scale-[0.99]',
          ],
          
          className
        )}
        style={{
          '--sigil-duration': `${PHYSICS.duration}ms`,
          '--sigil-easing': PHYSICS.easing,
        } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeader({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('pb-4 border-b border-slate-100', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  function CardContent({ className, children, ...props }, ref) {
    return (
      <div ref={ref} className={cn('py-4', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  function CardFooter({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('pt-4 border-t border-slate-100', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';
