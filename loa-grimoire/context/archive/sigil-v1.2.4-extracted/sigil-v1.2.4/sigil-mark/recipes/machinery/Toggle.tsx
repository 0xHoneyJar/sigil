/**
 * @sigil-recipe machinery/Toggle
 * @physics minimal - 100ms transition, no spring
 * @zone admin, settings, utility
 * @sync client_authoritative
 */

import { type InputHTMLAttributes } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md';
}

// ============================================================================
// Component
// ============================================================================

/**
 * Machinery Toggle - Minimal animation, instant feedback
 * 
 * No spring physics. Just a clean 100ms transition.
 * For settings and admin where efficiency matters.
 */
export function Toggle({
  checked,
  onChange,
  label,
  description,
  size = 'md',
  disabled,
  className = '',
  ...props
}: ToggleProps) {
  const sizes = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
  };

  const s = sizes[size];

  return (
    <label className={`flex items-start gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      
      {/* Track */}
      <span
        className={`
          relative inline-flex shrink-0 ${s.track} rounded-full
          transition-colors duration-100
          ${checked ? 'bg-blue-600' : 'bg-gray-200'}
          ${disabled ? '' : 'hover:opacity-90'}
        `}
      >
        {/* Thumb */}
        <span
          className={`
            ${s.thumb} bg-white rounded-full shadow
            transform transition-transform duration-100
            ${checked ? s.translate : 'translate-x-0.5'}
            mt-0.5
          `}
        />
      </span>

      {/* Label */}
      {(label || description) && (
        <span className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-gray-900">
              {label}
            </span>
          )}
          {description && (
            <span className="text-sm text-gray-500">
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
}

export default Toggle;
