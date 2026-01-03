/**
 * Sandbox Toggle Component
 *
 * Toggle for sandbox mode - prevents persistence of changes.
 */

import * as Switch from '@radix-ui/react-switch';
import { clsx } from 'clsx';

interface SandboxToggleProps {
  isSandbox: boolean;
  onToggle: () => void;
}

export function SandboxToggle({ isSandbox, onToggle }: SandboxToggleProps) {
  return (
    <div
      className={clsx(
        'p-3 rounded-md border transition-colors',
        isSandbox
          ? 'bg-sigil-warning/10 border-sigil-warning/30'
          : 'bg-sigil-surface border-sigil-border'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Sandbox Icon */}
          <div
            className={clsx(
              'w-8 h-8 rounded-md flex items-center justify-center',
              isSandbox ? 'bg-sigil-warning/20' : 'bg-sigil-border'
            )}
          >
            <svg
              className={clsx(
                'w-4 h-4',
                isSandbox ? 'text-sigil-warning' : 'text-sigil-muted'
              )}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>

          <div>
            <div className="text-sm font-medium text-sigil-text">
              Sandbox Mode
            </div>
            <div className="text-xs text-sigil-muted">
              {isSandbox
                ? 'Changes will not be saved'
                : 'Changes will persist'}
            </div>
          </div>
        </div>

        <Switch.Root
          checked={isSandbox}
          onCheckedChange={onToggle}
          className={clsx(
            'w-11 h-6 rounded-full transition-colors relative',
            isSandbox ? 'bg-sigil-warning' : 'bg-sigil-border'
          )}
        >
          <Switch.Thumb
            className={clsx(
              'block w-5 h-5 bg-white rounded-full transition-transform',
              isSandbox ? 'translate-x-[22px]' : 'translate-x-0.5'
            )}
          />
        </Switch.Root>
      </div>

      {/* Sandbox Explanation */}
      {isSandbox && (
        <div className="mt-3 p-2 bg-sigil-warning/5 rounded text-xs text-sigil-warning/80">
          <strong>Sandbox mode active:</strong> Experiment freely. All changes
          will be discarded when you exit sandbox mode.
        </div>
      )}
    </div>
  );
}
