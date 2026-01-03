import { useState, useCallback, useEffect } from 'react';
import { TensionControls } from './components/TensionControls';
import { MaterialZonePreview } from './components/MaterialZonePreview';
import { PresetButtons } from './components/PresetButtons';
import { SandboxToggle } from './components/SandboxToggle';
import { Header } from './components/Header';
import { useWorkbenchState } from './hooks/useWorkbenchState';
import type { TensionState, MaterialType } from './lib/types';
import { applyTensionVariables } from './lib/tensions';

/**
 * Sigil Workbench - Main Application
 *
 * A visual tuning interface for adjusting product tensions in real-time.
 */
export function App() {
  const {
    tensions,
    setTension,
    setTensions,
    applyPreset,
    resetTensions,
    saveTensions,
    isSandbox,
    toggleSandbox,
    isDirty,
    isLoading,
    activeZone,
    setActiveZone,
    zones,
  } = useWorkbenchState();

  // Apply tension CSS variables to document root
  useEffect(() => {
    applyTensionVariables(document.documentElement, tensions);
  }, [tensions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when no input is focused
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      // Cmd/Ctrl + S: Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (!isSandbox) {
          saveTensions();
        }
      }

      // Cmd/Ctrl + Z: Reset
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        resetTensions();
      }

      // Cmd/Ctrl + Shift + S: Toggle sandbox
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        toggleSandbox();
      }

      // Number keys 1-4 for presets
      if (e.key >= '1' && e.key <= '4' && !e.metaKey && !e.ctrlKey) {
        const presets = ['linear', 'airbnb', 'nintendo', 'osrs'];
        const index = parseInt(e.key) - 1;
        applyPreset(presets[index]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSandbox, saveTensions, resetTensions, toggleSandbox, applyPreset]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sigil-muted">Loading Sigil Workbench...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        isSandbox={isSandbox}
        isDirty={isDirty}
        onSave={saveTensions}
      />

      <main className="flex-1 flex">
        {/* Left Panel: Controls */}
        <aside className="w-80 border-r border-sigil-border p-4 space-y-6 overflow-y-auto">
          <SandboxToggle
            isSandbox={isSandbox}
            onToggle={toggleSandbox}
          />

          <PresetButtons
            onPresetSelect={applyPreset}
            onReset={resetTensions}
          />

          <TensionControls
            tensions={tensions}
            onTensionChange={setTension}
          />
        </aside>

        {/* Right Panel: Preview */}
        <section className="flex-1 p-6 overflow-y-auto">
          <MaterialZonePreview
            tensions={tensions}
            zones={zones}
            activeZone={activeZone}
            onZoneSelect={setActiveZone}
          />
        </section>
      </main>

      {/* Status Bar */}
      <footer className="border-t border-sigil-border px-4 py-2 flex items-center justify-between text-xs text-sigil-muted">
        <div className="flex items-center gap-4">
          <span>Sigil Workbench v0.4.0</span>
          <span className="text-sigil-border">|</span>
          <span>
            Playfulness: {tensions.playfulness} | Weight: {tensions.weight} |
            Density: {tensions.density} | Speed: {tensions.speed}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>Press 1-4 for presets</span>
          <span className="text-sigil-border">|</span>
          <span>Cmd+S to save</span>
        </div>
      </footer>
    </div>
  );
}
