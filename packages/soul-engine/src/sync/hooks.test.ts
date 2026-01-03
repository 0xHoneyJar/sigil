/**
 * Sync Hooks Tests
 *
 * Sprint 11: Tests for React sync hooks
 * - useServerTick (never optimistic)
 * - useLocalFirst (optimistic with debounce)
 * - useCRDTText (collaborative text with presence)
 *
 * Note: These tests use vitest's fake timers for async testing.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useServerTick, isServerTickResult } from './useServerTick.js';
import { useLocalFirst, isLocalFirstResult } from './useLocalFirst.js';
import { useCRDTText, isCRDTTextResult } from './useCRDTText.js';

// ============ useServerTick TESTS ============

describe('useServerTick', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with the initial value', () => {
    const { result } = renderHook(() => useServerTick('test.balance', 100));

    expect(result.current.value).toBe(100);
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.lastConfirmedAt).toBe(null);
  });

  it('should set isPending to true during update', async () => {
    const { result } = renderHook(() => useServerTick('test.balance', 100));

    act(() => {
      result.current.update(50);
    });

    expect(result.current.isPending).toBe(true);
    // Value should NOT change until server confirms (never optimistic)
    expect(result.current.value).toBe(100);
  });

  it('should update value after tick rate delay', async () => {
    const { result } = renderHook(() =>
      useServerTick('test.balance', 100, { tickRateMs: 600 })
    );

    act(() => {
      result.current.update(50);
    });

    // Before tick completes
    expect(result.current.value).toBe(100);

    // After tick completes
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    expect(result.current.value).toBe(50);
    expect(result.current.isPending).toBe(false);
    expect(result.current.lastConfirmedAt).not.toBe(null);
  });

  it('should call onSuccess callback after successful update', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() =>
      useServerTick('test.balance', 100, { tickRateMs: 100, onSuccess })
    );

    act(() => {
      result.current.update(50);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('should NEVER return optimistic value', async () => {
    const { result } = renderHook(() =>
      useServerTick('test.balance', 100, { tickRateMs: 1000 })
    );

    // Start update
    act(() => {
      result.current.update(50);
    });

    // Check at various points during the tick
    for (let i = 0; i < 10; i++) {
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Value should remain 100 until tick completes
      if (i < 9) {
        expect(result.current.value).toBe(100);
        expect(result.current.isPending).toBe(true);
      }
    }

    // After full tick
    expect(result.current.value).toBe(50);
  });

  it('should handle rapid updates correctly', async () => {
    const { result } = renderHook(() =>
      useServerTick('test.balance', 100, { tickRateMs: 100 })
    );

    // Rapid fire updates
    act(() => {
      result.current.update(50);
    });

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    act(() => {
      result.current.update(25);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Should use the latest update value
    expect(result.current.value).toBe(25);
  });
});

describe('isServerTickResult', () => {
  it('should return true for valid server tick result', () => {
    const { result } = renderHook(() => useServerTick('test', 0));
    expect(isServerTickResult(result.current)).toBe(true);
  });

  it('should return false for non-server tick objects', () => {
    expect(isServerTickResult(null)).toBe(false);
    expect(isServerTickResult({})).toBe(false);
    expect(isServerTickResult({ value: 1 })).toBe(false);
  });
});

// ============ useLocalFirst TESTS ============

describe('useLocalFirst', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with the initial value', () => {
    const { result } = renderHook(() => useLocalFirst('test.theme', 'light'));

    expect(result.current.value).toBe('light');
    expect(result.current.isSyncing).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should update value immediately (optimistic)', () => {
    const { result } = renderHook(() => useLocalFirst('test.theme', 'light'));

    act(() => {
      result.current.update('dark');
    });

    // Value should update immediately
    expect(result.current.value).toBe('dark');
  });

  it('should debounce sync to server', async () => {
    const { result } = renderHook(() =>
      useLocalFirst('test.theme', 'light', { debounceMs: 1000 })
    );

    act(() => {
      result.current.update('dark');
    });

    // Value updates immediately
    expect(result.current.value).toBe('dark');

    // Should not be syncing yet
    expect(result.current.isSyncing).toBe(false);

    // After debounce triggers
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.isSyncing).toBe(true);

    // After sync completes
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.isSyncing).toBe(false);
  });

  it('should not sync if syncToServer is false', async () => {
    const { result } = renderHook(() =>
      useLocalFirst('test.theme', 'light', { syncToServer: false })
    );

    act(() => {
      result.current.update('dark');
    });

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.isSyncing).toBe(false);
  });

  it('should debounce multiple rapid updates', async () => {
    const { result } = renderHook(() =>
      useLocalFirst('test.theme', 'light', { debounceMs: 500 })
    );

    // Rapid updates
    act(() => {
      result.current.update('dark');
    });

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    act(() => {
      result.current.update('system');
    });

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    act(() => {
      result.current.update('light');
    });

    // Final value should reflect latest update
    expect(result.current.value).toBe('light');

    // Should not be syncing yet (debounce reset)
    expect(result.current.isSyncing).toBe(false);

    // After debounce
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.isSyncing).toBe(true);
  });
});

describe('isLocalFirstResult', () => {
  it('should return true for valid local first result', () => {
    const { result } = renderHook(() => useLocalFirst('test', 'value'));
    expect(isLocalFirstResult(result.current)).toBe(true);
  });

  it('should return false for non-local first objects', () => {
    expect(isLocalFirstResult(null)).toBe(false);
    expect(isLocalFirstResult({})).toBe(false);
    expect(isLocalFirstResult({ value: 1, isPending: true })).toBe(false); // This is server tick
  });
});

// ============ useCRDTText TESTS ============

describe('useCRDTText', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with empty content', () => {
    const { result } = renderHook(() => useCRDTText('doc-1'));

    expect(result.current.content).toBe('');
    expect(result.current.presence).toEqual([]);
    expect(result.current.isSyncing).toBe(false);
  });

  it('should initialize with provided content', () => {
    const { result } = renderHook(() =>
      useCRDTText('doc-1', 'Hello World')
    );

    expect(result.current.content).toBe('Hello World');
  });

  it('should insert text at position', () => {
    const { result } = renderHook(() =>
      useCRDTText('doc-1', 'Hello World')
    );

    act(() => {
      result.current.insert(5, ' Beautiful');
    });

    expect(result.current.content).toBe('Hello Beautiful World');
  });

  it('should delete text at position', () => {
    const { result } = renderHook(() =>
      useCRDTText('doc-1', 'Hello World')
    );

    act(() => {
      result.current.delete(5, 6); // Delete " World"
    });

    expect(result.current.content).toBe('Hello');
  });

  it('should replace text in range', () => {
    const { result } = renderHook(() =>
      useCRDTText('doc-1', 'Hello World')
    );

    act(() => {
      result.current.replace(6, 11, 'Universe');
    });

    expect(result.current.content).toBe('Hello Universe');
  });

  it('should handle cursor position', () => {
    const { result } = renderHook(() =>
      useCRDTText('doc-1', 'Hello World')
    );

    // Set cursor should not throw
    expect(() => {
      act(() => {
        result.current.setCursor(5);
      });
    }).not.toThrow();
  });

  it('should handle selection', () => {
    const { result } = renderHook(() =>
      useCRDTText('doc-1', 'Hello World')
    );

    // Set selection should not throw
    expect(() => {
      act(() => {
        result.current.setSelection(0, 5);
      });
    }).not.toThrow();
  });

  it('should trigger sync after text changes', async () => {
    const { result } = renderHook(() =>
      useCRDTText('doc-1', 'Hello')
    );

    act(() => {
      result.current.insert(5, ' World');
    });

    // Wait for sync debounce
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.isSyncing).toBe(true);

    // Wait for sync to complete
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.isSyncing).toBe(false);
  });
});

describe('isCRDTTextResult', () => {
  it('should return true for valid CRDT text result', () => {
    const { result } = renderHook(() => useCRDTText('doc-1'));
    expect(isCRDTTextResult(result.current)).toBe(true);
  });

  it('should return false for non-CRDT text objects', () => {
    expect(isCRDTTextResult(null)).toBe(false);
    expect(isCRDTTextResult({})).toBe(false);
    expect(isCRDTTextResult({ content: 'test' })).toBe(false);
  });
});

// ============ COMPARISON TESTS ============

describe('Hook comparison', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('useServerTick should be distinguishable from useLocalFirst', () => {
    const { result: serverResult } = renderHook(() =>
      useServerTick('balance', 100)
    );
    const { result: localResult } = renderHook(() =>
      useLocalFirst('theme', 'light')
    );

    // Server tick has isPending, local first has isSyncing
    expect('isPending' in serverResult.current).toBe(true);
    expect('isSyncing' in serverResult.current).toBe(false);

    expect('isSyncing' in localResult.current).toBe(true);
    expect('isPending' in localResult.current).toBe(false);
  });

  it('useServerTick waits for confirmation, useLocalFirst is immediate', async () => {
    const { result: serverResult } = renderHook(() =>
      useServerTick('balance', 100, { tickRateMs: 500 })
    );
    const { result: localResult } = renderHook(() =>
      useLocalFirst('theme', 'light')
    );

    // Update both
    act(() => {
      serverResult.current.update(50);
      localResult.current.update('dark');
    });

    // Local first updates immediately
    expect(localResult.current.value).toBe('dark');

    // Server tick waits for confirmation
    expect(serverResult.current.value).toBe(100); // Still old value

    // After server tick completes
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(serverResult.current.value).toBe(50);
  });
});
