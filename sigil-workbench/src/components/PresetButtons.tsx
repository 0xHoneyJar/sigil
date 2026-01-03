/**
 * Preset Buttons Component
 *
 * Quick-select buttons for named tension presets.
 */

import { clsx } from 'clsx';
import { TENSION_PRESETS } from '../lib/types';

interface PresetButtonsProps {
  onPresetSelect: (presetName: string) => void;
  onReset: () => void;
}

const PRESET_ICONS: Record<string, string> = {
  linear: 'L',
  airbnb: 'A',
  nintendo: 'N',
  osrs: 'O',
};

const PRESET_COLORS: Record<string, string> = {
  linear: 'bg-slate-500/20 hover:bg-slate-500/30 border-slate-500/30',
  airbnb: 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/30',
  nintendo: 'bg-red-500/20 hover:bg-red-500/30 border-red-500/30',
  osrs: 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/30',
};

export function PresetButtons({ onPresetSelect, onReset }: PresetButtonsProps) {
  const presetNames = Object.keys(TENSION_PRESETS);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-sigil-text">Presets</h2>
        <button
          onClick={onReset}
          className="text-xs text-sigil-muted hover:text-sigil-text transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {presetNames.map((name, index) => {
          const preset = TENSION_PRESETS[name];
          return (
            <button
              key={name}
              onClick={() => onPresetSelect(name)}
              className={clsx(
                'relative flex items-center gap-2 px-3 py-2 rounded-md border transition-all',
                'hover:scale-[1.02] active:scale-[0.98]',
                PRESET_COLORS[name] || 'bg-sigil-surface border-sigil-border'
              )}
            >
              {/* Keyboard shortcut indicator */}
              <div className="absolute top-1 right-1 text-[10px] text-sigil-muted opacity-50">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="w-6 h-6 rounded-md bg-sigil-bg flex items-center justify-center text-xs font-bold text-sigil-text">
                {PRESET_ICONS[name] || name[0].toUpperCase()}
              </div>

              {/* Label */}
              <div className="text-left">
                <div className="text-sm font-medium text-sigil-text capitalize">
                  {name}
                </div>
                <div className="text-[10px] text-sigil-muted truncate max-w-[100px]">
                  P:{preset.tensions.playfulness} W:{preset.tensions.weight}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Preset Legend */}
      <div className="text-[10px] text-sigil-muted pt-2 border-t border-sigil-border">
        Press 1-4 to quickly apply presets
      </div>
    </div>
  );
}
