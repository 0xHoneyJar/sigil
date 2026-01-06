/**
 * @sigil-recipe machinery/Toggle
 * @physics spring(400, 30) (near-instant)
 * @zone admin, settings, forms
 * @sync client_authoritative
 *
 * Toggle switch for settings and forms.
 * Near-instant response - user expects immediate feedback.
 *
 * Physics rationale:
 * - stiffness: 400 — Very high, near-instant
 * - damping: 30 — No overshoot, crisp stop
 * - Feel: Mechanical, efficient, no-nonsense
 */

import React, { useCallback, useId } from 'react';
import { motion } from 'framer-motion';

export interface ToggleProps {
  /** Controlled checked state */
  checked: boolean;
  /** Change handler */
  onChange: (checked: boolean) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Label text */
  label?: string;
  /** Label position */
  labelPosition?: 'left' | 'right';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
  /** Accessible name when no label */
  ariaLabel?: string;
}

const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
};

const SIZE_CLASSES = {
  sm: {
    track: 'w-8 h-4',
    thumb: 'w-3 h-3',
    translate: 'translateX(16px)',
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'w-5 h-5',
    translate: 'translateX(20px)',
  },
  lg: {
    track: 'w-14 h-7',
    thumb: 'w-6 h-6',
    translate: 'translateX(28px)',
  },
};

/**
 * Efficient Toggle Switch
 *
 * @example
 * ```tsx
 * import { Toggle } from '@sigil/recipes/machinery';
 *
 * const [enabled, setEnabled] = useState(false);
 *
 * <Toggle
 *   checked={enabled}
 *   onChange={setEnabled}
 *   label="Enable notifications"
 * />
 * ```
 */
export function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
  labelPosition = 'right',
  size = 'md',
  className = '',
  ariaLabel,
}: ToggleProps) {
  const id = useId();
  const sizeConfig = SIZE_CLASSES[size];

  const handleClick = useCallback(() => {
    if (!disabled) {
      onChange(!checked);
    }
  }, [disabled, checked, onChange]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        if (!disabled) {
          onChange(!checked);
        }
      }
    },
    [disabled, checked, onChange]
  );

  const toggle = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        relative inline-flex items-center rounded-full
        ${sizeConfig.track}
        ${checked ? 'bg-neutral-900' : 'bg-neutral-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500
      `.trim().replace(/\s+/g, ' ')}
    >
      <motion.span
        className={`
          ${sizeConfig.thumb}
          bg-white rounded-full shadow-sm
          absolute left-0.5
        `.trim().replace(/\s+/g, ' ')}
        initial={false}
        animate={{
          x: checked ? parseInt(sizeConfig.translate.match(/\d+/)?.[0] || '0') : 0,
        }}
        transition={SPRING_CONFIG}
      />
    </button>
  );

  if (!label) {
    return <div className={className}>{toggle}</div>;
  }

  return (
    <div
      className={`
        inline-flex items-center gap-2
        ${labelPosition === 'left' ? 'flex-row-reverse' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {toggle}
      <label
        htmlFor={id}
        className={`
          text-sm text-neutral-700
          ${disabled ? 'opacity-50' : 'cursor-pointer'}
        `.trim().replace(/\s+/g, ' ')}
      >
        {label}
      </label>
    </div>
  );
}

export default Toggle;
