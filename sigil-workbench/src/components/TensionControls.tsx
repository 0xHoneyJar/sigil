/**
 * Tension Controls Component
 *
 * Four-axis tension sliders with real-time preview.
 */

import { TensionSlider } from './TensionSlider';
import type { TensionState } from '../lib/types';

interface TensionControlsProps {
  tensions: TensionState;
  onTensionChange: (key: keyof TensionState, value: number) => void;
}

const TENSION_DEFINITIONS = [
  {
    key: 'playfulness' as const,
    label: 'Playfulness',
    description: 'Serious to Playful',
    minLabel: 'Serious',
    maxLabel: 'Playful',
    color: '#f472b6', // pink
    effects: ['Border radius', 'Color saturation', 'Animation bounce'],
  },
  {
    key: 'weight' as const,
    label: 'Weight',
    description: 'Light to Heavy',
    minLabel: 'Light',
    maxLabel: 'Heavy',
    color: '#a78bfa', // purple
    effects: ['Shadow depth', 'Font weight', 'Padding scale'],
  },
  {
    key: 'density' as const,
    label: 'Density',
    description: 'Spacious to Dense',
    minLabel: 'Spacious',
    maxLabel: 'Dense',
    color: '#60a5fa', // blue
    effects: ['Spacing unit', 'Font size', 'Line height'],
  },
  {
    key: 'speed' as const,
    label: 'Speed',
    description: 'Deliberate to Instant',
    minLabel: 'Deliberate',
    maxLabel: 'Instant',
    color: '#34d399', // green
    effects: ['Transition duration', 'Animation speed', 'Delay'],
  },
];

export function TensionControls({
  tensions,
  onTensionChange,
}: TensionControlsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-sigil-text mb-1">
          Tension Axes
        </h2>
        <p className="text-xs text-sigil-muted">
          Adjust each axis to tune your product's feel
        </p>
      </div>

      <div className="space-y-5">
        {TENSION_DEFINITIONS.map((def) => (
          <TensionSlider
            key={def.key}
            label={def.label}
            description={def.description}
            value={tensions[def.key]}
            onChange={(value) => onTensionChange(def.key, value)}
            minLabel={def.minLabel}
            maxLabel={def.maxLabel}
            color={def.color}
            effects={def.effects}
          />
        ))}
      </div>

      {/* CSS Variables Preview */}
      <div className="pt-4 border-t border-sigil-border">
        <h3 className="text-xs font-medium text-sigil-muted mb-3">
          CSS Variables Preview
        </h3>
        <div className="bg-sigil-bg rounded-md p-3 font-mono text-xs text-sigil-muted space-y-1 overflow-x-auto">
          <div>
            <span className="text-sigil-accent">--sigil-border-radius:</span>{' '}
            {Math.round(4 + tensions.playfulness * 0.12)}px
          </div>
          <div>
            <span className="text-sigil-accent">--sigil-shadow-opacity:</span>{' '}
            {(0.05 + tensions.weight * 0.001).toFixed(3)}
          </div>
          <div>
            <span className="text-sigil-accent">--sigil-gap:</span>{' '}
            {Math.round(24 - tensions.density * 0.12)}px
          </div>
          <div>
            <span className="text-sigil-accent">--sigil-transition:</span>{' '}
            {Math.round(300 - tensions.speed * 2.8)}ms
          </div>
        </div>
      </div>
    </div>
  );
}
