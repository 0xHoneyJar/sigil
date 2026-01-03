/**
 * Tension Slider Component
 *
 * Individual slider for a tension axis.
 */

import { useState, useCallback } from 'react';
import * as Slider from '@radix-ui/react-slider';
import * as Tooltip from '@radix-ui/react-tooltip';
import { clsx } from 'clsx';

interface TensionSliderProps {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  minLabel: string;
  maxLabel: string;
  color: string;
  effects: string[];
}

export function TensionSlider({
  label,
  description,
  value,
  onChange,
  minLabel,
  maxLabel,
  color,
  effects,
}: TensionSliderProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleValueChange = useCallback(
    (values: number[]) => {
      onChange(values[0]);
    },
    [onChange]
  );

  return (
    <Tooltip.Provider delayDuration={200}>
      <div
        className="group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium text-sigil-text">
                  {label}
                </span>
              </div>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="z-50 px-3 py-2 bg-sigil-surface border border-sigil-border rounded-md shadow-lg max-w-xs"
                sideOffset={5}
              >
                <div className="text-xs text-sigil-text mb-2">{description}</div>
                <div className="text-xs text-sigil-muted">
                  <div className="font-medium mb-1">Affects:</div>
                  <ul className="list-disc list-inside">
                    {effects.map((effect) => (
                      <li key={effect}>{effect}</li>
                    ))}
                  </ul>
                </div>
                <Tooltip.Arrow className="fill-sigil-border" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          {/* Value Display */}
          <div
            className={clsx(
              'text-sm font-mono transition-colors',
              isDragging ? 'text-sigil-text' : 'text-sigil-muted'
            )}
          >
            {value}
          </div>
        </div>

        {/* Slider */}
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[value]}
          onValueChange={handleValueChange}
          max={100}
          step={1}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
        >
          <Slider.Track className="bg-sigil-border relative grow rounded-full h-1.5">
            <Slider.Range
              className="absolute rounded-full h-full transition-colors"
              style={{ backgroundColor: color }}
            />
          </Slider.Track>
          <Slider.Thumb
            className={clsx(
              'block w-4 h-4 rounded-full border-2 transition-all focus:outline-none',
              isDragging
                ? 'scale-110 shadow-lg'
                : 'shadow-md hover:scale-105'
            )}
            style={{
              backgroundColor: 'var(--sigil-surface)',
              borderColor: color,
            }}
          />
        </Slider.Root>

        {/* Min/Max Labels */}
        <div className="flex justify-between mt-1">
          <span
            className={clsx(
              'text-xs transition-colors',
              value < 30 ? 'text-sigil-text' : 'text-sigil-muted'
            )}
          >
            {minLabel}
          </span>
          <span
            className={clsx(
              'text-xs transition-colors',
              value > 70 ? 'text-sigil-text' : 'text-sigil-muted'
            )}
          >
            {maxLabel}
          </span>
        </div>
      </div>
    </Tooltip.Provider>
  );
}
