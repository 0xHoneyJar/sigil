/**
 * Workbench State Hook
 *
 * Manages the global state of the Sigil Workbench.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { TensionState, ZoneConfig } from '../lib/types';
import {
  DEFAULT_TENSIONS,
  TENSION_PRESETS,
  DEFAULT_ZONES,
} from '../lib/types';
import { clampTension } from '../lib/tensions';

/**
 * Sandbox state class - prevents persistence when enabled.
 */
class SandboxState {
  private original: TensionState | null = null;
  private modified: TensionState | null = null;

  snapshot(tensions: TensionState): void {
    this.original = { ...tensions };
    this.modified = { ...tensions };
  }

  modify(key: keyof TensionState, value: number): TensionState {
    if (!this.modified) {
      this.modified = { ...DEFAULT_TENSIONS };
    }
    this.modified[key] = value;
    return { ...this.modified };
  }

  get(): TensionState | null {
    return this.modified;
  }

  discard(): TensionState | null {
    this.modified = this.original ? { ...this.original } : null;
    return this.original;
  }

  commit(): TensionState | null {
    this.original = this.modified ? { ...this.modified } : null;
    return this.original;
  }
}

export interface UseWorkbenchStateResult {
  tensions: TensionState;
  setTension: (key: keyof TensionState, value: number) => void;
  setTensions: (tensions: Partial<TensionState>) => void;
  applyPreset: (presetName: string) => void;
  resetTensions: () => void;
  saveTensions: () => Promise<void>;
  isSandbox: boolean;
  toggleSandbox: () => void;
  isDirty: boolean;
  isLoading: boolean;
  activeZone: string | null;
  setActiveZone: (zone: string | null) => void;
  zones: ZoneConfig[];
}

export function useWorkbenchState(): UseWorkbenchStateResult {
  // Core state
  const [tensions, setTensionsState] = useState<TensionState>(DEFAULT_TENSIONS);
  const [isSandbox, setIsSandbox] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [zones, setZones] = useState<ZoneConfig[]>(DEFAULT_ZONES);

  // Sandbox state management
  const sandboxRef = useRef<SandboxState>(new SandboxState());

  // Saved state reference for dirty tracking
  const savedTensionsRef = useRef<TensionState>(tensions);

  // RAF reference for 60fps throttling
  const rafRef = useRef<number | null>(null);
  const pendingTensionsRef = useRef<Partial<TensionState> | null>(null);

  /**
   * Load initial state
   */
  useEffect(() => {
    // In a real implementation, this would load from file/db
    // For now, we use defaults
    const loadState = async () => {
      try {
        // Simulate loading delay
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Try to get tensions from localStorage (for demo)
        const stored = localStorage.getItem('sigil-tensions');
        if (stored) {
          const parsed = JSON.parse(stored);
          setTensionsState(parsed);
          savedTensionsRef.current = parsed;
        }

        // Try to get zones from localStorage (for demo)
        const storedZones = localStorage.getItem('sigil-zones');
        if (storedZones) {
          setZones(JSON.parse(storedZones));
        }
      } catch {
        // Use defaults on error
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, []);

  /**
   * Flush pending tension updates (60fps throttle)
   */
  const flushPendingUpdates = useCallback(() => {
    if (pendingTensionsRef.current) {
      setTensionsState((prev) => {
        const next = { ...prev, ...pendingTensionsRef.current };
        return {
          playfulness: clampTension(next.playfulness ?? prev.playfulness),
          weight: clampTension(next.weight ?? prev.weight),
          density: clampTension(next.density ?? prev.density),
          speed: clampTension(next.speed ?? prev.speed),
        };
      });
      pendingTensionsRef.current = null;
    }
    rafRef.current = null;
  }, []);

  /**
   * Set a single tension axis
   */
  const setTension = useCallback(
    (key: keyof TensionState, value: number) => {
      if (isSandbox) {
        // In sandbox mode, update modified state
        const modified = sandboxRef.current.modify(key, clampTension(value));
        setTensionsState(modified);
      } else {
        // RAF throttled update for production
        pendingTensionsRef.current = {
          ...pendingTensionsRef.current,
          [key]: value,
        };

        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(flushPendingUpdates);
        }
      }

      setIsDirty(true);
    },
    [isSandbox, flushPendingUpdates]
  );

  /**
   * Set multiple tensions at once
   */
  const setTensions = useCallback(
    (newTensions: Partial<TensionState>) => {
      if (isSandbox) {
        // Update each key in sandbox
        for (const [key, value] of Object.entries(newTensions)) {
          sandboxRef.current.modify(
            key as keyof TensionState,
            clampTension(value)
          );
        }
        const modified = sandboxRef.current.get();
        if (modified) setTensionsState(modified);
      } else {
        // RAF throttled update
        pendingTensionsRef.current = {
          ...pendingTensionsRef.current,
          ...newTensions,
        };

        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(flushPendingUpdates);
        }
      }

      setIsDirty(true);
    },
    [isSandbox, flushPendingUpdates]
  );

  /**
   * Apply a named preset
   */
  const applyPreset = useCallback(
    (presetName: string) => {
      const preset = TENSION_PRESETS[presetName];
      if (!preset) {
        console.warn(`Unknown preset: ${presetName}`);
        return;
      }

      if (isSandbox) {
        // Apply to sandbox
        for (const [key, value] of Object.entries(preset.tensions)) {
          sandboxRef.current.modify(key as keyof TensionState, value);
        }
        const modified = sandboxRef.current.get();
        if (modified) setTensionsState(modified);
      } else {
        setTensionsState(preset.tensions);
      }

      setIsDirty(true);
    },
    [isSandbox]
  );

  /**
   * Reset tensions to defaults
   */
  const resetTensions = useCallback(() => {
    if (isSandbox) {
      // In sandbox, discard changes
      const original = sandboxRef.current.discard();
      if (original) setTensionsState(original);
    } else {
      setTensionsState(savedTensionsRef.current);
    }
    setIsDirty(false);
  }, [isSandbox]);

  /**
   * Save tensions to persistence
   */
  const saveTensions = useCallback(async () => {
    if (isSandbox) {
      console.warn('Cannot save in sandbox mode');
      return;
    }

    try {
      // Save to localStorage (for demo)
      localStorage.setItem('sigil-tensions', JSON.stringify(tensions));
      savedTensionsRef.current = tensions;
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save tensions:', error);
      throw error;
    }
  }, [isSandbox, tensions]);

  /**
   * Toggle sandbox mode
   */
  const toggleSandbox = useCallback(() => {
    if (!isSandbox) {
      // Entering sandbox mode - snapshot current state
      sandboxRef.current.snapshot(tensions);
    } else {
      // Exiting sandbox mode - optionally commit or discard
      // For now, we discard on exit
      const original = sandboxRef.current.discard();
      if (original) {
        setTensionsState(original);
        setIsDirty(false);
      }
    }
    setIsSandbox(!isSandbox);
  }, [isSandbox, tensions]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
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
  };
}
