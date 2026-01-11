/**
 * @sigil-recipe decisive/Button.nintendo
 * @physics spring(300, 8), timing(100-150ms), snap
 * @zone checkout, transaction
 * @variant-of decisive/Button
 * @feeling "Nintendo Switch snap - high energy, satisfying click"
 */

import { motion } from 'framer-motion';
import { forwardRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface NintendoButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  children: ReactNode;
  onAction: () => Promise<void>;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

// Nintendo Switch feel: high snap, satisfying click
const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 300,  // Higher tension = faster attack
  damping: 8,      // Lower damping = allow bounce
};

const PRESS_SCALE = 0.95; // More dramatic press

function useServerTick(action: () => Promise<void>) {
  const [isPending, setIsPending] = useState(false);

  const execute = async () => {
    if (isPending) return;
    setIsPending(true);
    try {
      await action();
    } finally {
      setIsPending(false);
    }
  };

  return { execute, isPending };
}

const baseStyles = `
  inline-flex items-center justify-center
  font-medium rounded-lg
  transition-shadow duration-100
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

export const Button = forwardRef<HTMLButtonElement, NintendoButtonProps>(
  function NintendoButton(
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
        {isLoading ? 'Processing...' : children}
      </motion.button>
    );
  }
);

export default Button;
