/**
 * useCRDTText Hook
 *
 * React hook for CRDT-based collaborative text editing.
 * Provides real-time text synchronization with presence indicators.
 *
 * From SDD: "CRDT detected: Consider adding presence cursors for collaborators"
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type {
  UseCRDTTextOptions,
  UseCRDTTextResult,
  CRDTPresence,
} from './types.js';

// Generate a random user ID for this session
function generateUserId(): string {
  return `user_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate a random color for presence
function generateColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#1DD1A1',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * useCRDTText hook
 *
 * Use this hook for collaborative text editing:
 * - Documents with multiple editors
 * - Comments and discussions
 * - Shared notes
 * - Real-time chat
 *
 * This hook provides:
 * - Real-time text synchronization
 * - Presence indicators (who else is editing)
 * - Cursor and selection tracking
 *
 * Note: This is a simplified implementation for MVP.
 * Production use would integrate with a CRDT library like Yjs or Automerge.
 *
 * @example
 * ```tsx
 * function CollaborativeEditor() {
 *   const {
 *     content,
 *     insert,
 *     delete: deleteText,
 *     presence,
 *     setCursor
 *   } = useCRDTText('doc-123');
 *
 *   return (
 *     <div>
 *       <PresenceIndicators users={presence} />
 *       <textarea
 *         value={content}
 *         onChange={(e) => {
 *           // Handle insertions/deletions
 *         }}
 *         onSelect={(e) => setCursor(e.target.selectionStart)}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export function useCRDTText(
  documentId: string,
  initialContent: string = '',
  options: UseCRDTTextOptions = {}
): UseCRDTTextResult {
  const { onPresenceChange, displayName = 'Anonymous', color } = options;

  // Generate stable user ID and color for this session
  const userId = useMemo(() => generateUserId(), []);
  const userColor = useMemo(() => color || generateColor(), [color]);

  // Text content state
  const [content, setContent] = useState<string>(initialContent);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);

  // Presence state (other users)
  const [presence, setPresence] = useState<CRDTPresence[]>([]);

  // Our own cursor/selection
  const cursorRef = useRef<number>(0);
  const selectionRef = useRef<{ start: number; end: number } | null>(null);

  // Sync timeout for debouncing
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Insert text at a specific position
   */
  const insert = useCallback((index: number, text: string): void => {
    setContent((prev) => {
      const before = prev.slice(0, index);
      const after = prev.slice(index);
      return before + text + after;
    });

    // Update cursor position
    cursorRef.current = index + text.length;

    // Trigger sync
    schedulSync();
  }, []);

  /**
   * Delete text at a specific position
   */
  const deleteText = useCallback((index: number, length: number): void => {
    setContent((prev) => {
      const before = prev.slice(0, index);
      const after = prev.slice(index + length);
      return before + after;
    });

    // Update cursor position
    cursorRef.current = index;

    // Trigger sync
    schedulSync();
  }, []);

  /**
   * Replace text in a range
   */
  const replace = useCallback((start: number, end: number, text: string): void => {
    setContent((prev) => {
      const before = prev.slice(0, start);
      const after = prev.slice(end);
      return before + text + after;
    });

    // Update cursor position
    cursorRef.current = start + text.length;

    // Trigger sync
    schedulSync();
  }, []);

  /**
   * Set cursor position (for presence)
   */
  const setCursor = useCallback((index: number): void => {
    cursorRef.current = index;
    selectionRef.current = null;
    broadcastPresence();
  }, []);

  /**
   * Set selection range (for presence)
   */
  const setSelection = useCallback((start: number, end: number): void => {
    cursorRef.current = end;
    selectionRef.current = { start, end };
    broadcastPresence();
  }, []);

  /**
   * Schedule sync (debounced)
   */
  const schedulSync = useCallback((): void => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    setIsSyncing(true);

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        // Simulate CRDT sync
        // In production: await crdtProvider.sync(documentId, operations);
        await new Promise((resolve) => setTimeout(resolve, 50));
      } finally {
        setIsSyncing(false);
      }
    }, 100);
  }, [documentId]);

  /**
   * Broadcast our presence to other users
   */
  const broadcastPresence = useCallback((): void => {
    const ourPresence: CRDTPresence = {
      userId,
      displayName,
      color: userColor,
      cursor: { index: cursorRef.current },
      selection: selectionRef.current || undefined,
      lastActive: new Date(),
    };

    // In production: await crdtProvider.broadcastPresence(documentId, ourPresence);
    // For now, we just track our own presence locally
  }, [userId, displayName, userColor, documentId]);

  /**
   * Simulate presence updates from other users
   */
  useEffect(() => {
    // In production, this would be a websocket subscription
    const presenceInterval = setInterval(() => {
      // Simulate other users (for demo purposes)
      const simulatedPresence: CRDTPresence[] = [];

      // Randomly add/remove simulated users
      if (Math.random() > 0.7) {
        simulatedPresence.push({
          userId: 'user_demo',
          displayName: 'Demo User',
          color: '#4ECDC4',
          cursor: { index: Math.floor(Math.random() * content.length) },
          lastActive: new Date(),
        });
      }

      setPresence(simulatedPresence);
      onPresenceChange?.(simulatedPresence);
    }, 5000);

    return () => clearInterval(presenceInterval);
  }, [content.length, onPresenceChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return {
    content,
    insert,
    delete: deleteText,
    replace,
    presence,
    isSyncing,
    setCursor,
    setSelection,
  };
}

/**
 * Type guard to check if a result is from useCRDTText
 */
export function isCRDTTextResult(result: unknown): result is UseCRDTTextResult {
  return (
    typeof result === 'object' &&
    result !== null &&
    'content' in result &&
    'presence' in result &&
    typeof (result as UseCRDTTextResult).insert === 'function' &&
    typeof (result as UseCRDTTextResult).setCursor === 'function'
  );
}
