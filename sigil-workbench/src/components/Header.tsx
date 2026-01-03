/**
 * Header Component
 *
 * Top navigation bar for the workbench.
 */

import { clsx } from 'clsx';

interface HeaderProps {
  isSandbox: boolean;
  isDirty: boolean;
  onSave: () => Promise<void>;
}

export function Header({ isSandbox, isDirty, onSave }: HeaderProps) {
  return (
    <header className="border-b border-sigil-border bg-sigil-surface">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sigil-accent/20 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-sigil-accent"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h1 className="font-semibold text-sigil-text">Sigil Workbench</h1>
            <p className="text-xs text-sigil-muted">Tune your product's soul</p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-4">
          {/* Sandbox Badge */}
          {isSandbox && (
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-sigil-warning/10 border border-sigil-warning/30">
              <div className="w-2 h-2 rounded-full bg-sigil-warning animate-pulse" />
              <span className="text-xs text-sigil-warning font-medium">
                Sandbox Mode
              </span>
            </div>
          )}

          {/* Dirty Indicator */}
          {isDirty && !isSandbox && (
            <div className="flex items-center gap-2 text-sigil-muted text-xs">
              <div className="w-2 h-2 rounded-full bg-sigil-accent" />
              <span>Unsaved changes</span>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={onSave}
            disabled={isSandbox || !isDirty}
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              isSandbox || !isDirty
                ? 'bg-sigil-border text-sigil-muted cursor-not-allowed'
                : 'bg-sigil-accent text-white hover:bg-sigil-accent/90'
            )}
          >
            Save Changes
          </button>
        </div>
      </div>
    </header>
  );
}
