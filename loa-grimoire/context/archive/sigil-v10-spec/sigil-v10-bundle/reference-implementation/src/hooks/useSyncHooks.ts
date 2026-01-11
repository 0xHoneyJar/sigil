/**
 * Sigil Soul Engine v10 — Sync Hooks
 * 
 * React hooks for each sync strategy.
 * Match the hook to the interaction intent.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL-FIRST HOOK (LWW - Property State)
// ═══════════════════════════════════════════════════════════════════════════

interface UseLocalFirstOptions {
  syncToServer?: boolean;
  debounceMs?: number;
}

interface UseLocalFirstResult<T> {
  value: T;
  update: (newValue: T) => void;
  isSyncing: boolean;
}

/**
 * Hook for Local-First data (instant reads/writes)
 * 
 * Use for: Toggle states, positions, selections, preferences
 * Feel: Instant, no loading states
 */
export function useLocalFirst<T>(
  key: string,
  initialValue: T,
  options: UseLocalFirstOptions = {}
): UseLocalFirstResult<T> {
  const { syncToServer = true, debounceMs = 100 } = options;
  
  const [value, setValue] = useState<T>(initialValue);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Load from local storage on mount (simulating IndexedDB)
  useEffect(() => {
    const stored = localStorage.getItem(`sigil:${key}`);
    if (stored) {
      try {
        setValue(JSON.parse(stored));
      } catch {
        // Invalid stored value, use initial
      }
    }
  }, [key]);
  
  // Update is INSTANT (local first)
  const update = useCallback((newValue: T) => {
    // 1. Update state immediately (INSTANT)
    setValue(newValue);
    
    // 2. Persist to local storage (INSTANT)
    localStorage.setItem(`sigil:${key}`, JSON.stringify(newValue));
    
    // 3. Sync to server in background (DEBOUNCED)
    if (syncToServer) {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      
      setIsSyncing(true);
      syncTimeoutRef.current = setTimeout(async () => {
        try {
          // Simulate server sync
          await fetch(`/api/sync/${key}`, {
            method: 'POST',
            body: JSON.stringify(newValue),
          });
        } catch {
          // Server sync failed, but local is fine
          console.warn(`[Sigil] Background sync failed for ${key}`);
        } finally {
          setIsSyncing(false);
        }
      }, debounceMs);
    }
  }, [key, syncToServer, debounceMs]);
  
  return { value, update, isSyncing };
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVER-TICK HOOK (High Stakes)
// ═══════════════════════════════════════════════════════════════════════════

interface UseServerTickOptions {
  tickRateMs?: number;
}

interface UseServerTickResult<T> {
  value: T;
  update: (newValue: T) => Promise<void>;
  isPending: boolean;
  error: Error | null;
  lastConfirmedAt: Date | null;
}

/**
 * Hook for Server-Tick data (must wait for confirmation)
 * 
 * Use for: Money, inventory, health, trades, transactions
 * Feel: Deliberate, shows pending state, XP-drop confirmation
 * 
 * RULE: NEVER show optimistic updates for server-tick data
 */
export function useServerTick<T>(
  key: string,
  initialValue: T,
  options: UseServerTickOptions = {}
): UseServerTickResult<T> {
  const { tickRateMs = 600 } = options;
  
  const [value, setValue] = useState<T>(initialValue);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastConfirmedAt, setLastConfirmedAt] = useState<Date | null>(null);
  
  // Load from server on mount
  useEffect(() => {
    const loadFromServer = async () => {
      try {
        const response = await fetch(`/api/tick/${key}`);
        const data = await response.json();
        setValue(data);
      } catch (err) {
        console.error(`[Sigil] Failed to load ${key} from server`);
      }
    };
    
    loadFromServer();
  }, [key]);
  
  // Update MUST wait for server confirmation
  const update = useCallback(async (newValue: T) => {
    setError(null);
    setIsPending(true); // User MUST see this state
    
    try {
      // Simulate tick-aligned server request
      const response = await fetch(`/api/tick/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: newValue,
          tick: Math.floor(Date.now() / tickRateMs),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Server rejected the update');
      }
      
      const confirmed = await response.json();
      
      // ONLY update local value AFTER server confirms
      setValue(confirmed.value);
      setLastConfirmedAt(new Date());
      
    } catch (err) {
      setError(err as Error);
      // Do NOT update local value - server rejected
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [key, tickRateMs]);
  
  return { value, update, isPending, error, lastConfirmedAt };
}

// ═══════════════════════════════════════════════════════════════════════════
// CRDT HOOK (Collaborative Text)
// ═══════════════════════════════════════════════════════════════════════════

interface Presence {
  id: string;
  name: string;
  color: string;
  cursor?: { index: number };
}

interface UseCRDTTextResult {
  content: string;
  insert: (index: number, text: string) => void;
  delete: (index: number, length: number) => void;
  replace: (content: string) => void;
  presence: Presence[];
  isSyncing: boolean;
}

/**
 * Hook for CRDT text (collaborative editing)
 * 
 * Use for: Documents, comments, chat messages, descriptions
 * Feel: Instant local, shows collaborator cursors
 * 
 * Note: This is a simplified implementation.
 * Production should use Yjs, Automerge, or similar.
 */
export function useCRDTText(
  documentId: string,
  initialContent: string = ''
): UseCRDTTextResult {
  const [content, setContent] = useState(initialContent);
  const [presence, setPresence] = useState<Presence[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Simulated operations (real impl would use Yjs Y.Text)
  const insert = useCallback((index: number, text: string) => {
    setContent(prev => prev.slice(0, index) + text + prev.slice(index));
    // In real impl: yText.insert(index, text)
  }, []);
  
  const deleteText = useCallback((index: number, length: number) => {
    setContent(prev => prev.slice(0, index) + prev.slice(index + length));
    // In real impl: yText.delete(index, length)
  }, []);
  
  const replace = useCallback((newContent: string) => {
    setContent(newContent);
    // In real impl: transact to replace
  }, []);
  
  // Simulated presence (real impl would use Yjs awareness)
  useEffect(() => {
    // Simulate other users
    const mockPresence: Presence[] = [
      // Would come from awareness protocol
    ];
    setPresence(mockPresence);
  }, [documentId]);
  
  return {
    content,
    insert,
    delete: deleteText,
    replace,
    presence,
    isSyncing,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL ONLY HOOK (UI State)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook for local-only UI state (no sync needed)
 * 
 * Use for: Modals, dropdowns, hover states, view state
 * Feel: Instant, ephemeral
 */
export function useLocalOnly<T>(initialValue: T) {
  return useState<T>(initialValue);
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK SELECTION HELPER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Helper to select the right hook based on interaction type
 */
export function selectSyncHook(interactionType: string): string {
  const lower = interactionType.toLowerCase();
  
  // Server-tick signals
  const tickSignals = ['money', 'balance', 'inventory', 'health', 'trade', 'transfer'];
  if (tickSignals.some(s => lower.includes(s))) {
    return 'useServerTick';
  }
  
  // CRDT signals
  const crdtSignals = ['document', 'text', 'comment', 'message', 'edit', 'collaborative'];
  if (crdtSignals.some(s => lower.includes(s))) {
    return 'useCRDTText';
  }
  
  // Local-only signals
  const localSignals = ['modal', 'dropdown', 'hover', 'ui', 'view'];
  if (localSignals.some(s => lower.includes(s))) {
    return 'useLocalOnly';
  }
  
  // Default to local-first
  return 'useLocalFirst';
}
