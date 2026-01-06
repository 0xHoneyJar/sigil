/**
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useServerTick } from '../hooks/useServerTick';

describe('useServerTick', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('executes action and manages pending state', async () => {
    const action = jest.fn().mockResolvedValue('result');

    const { result } = renderHook(() => useServerTick(action));

    expect(result.current.isPending).toBe(false);

    let executePromise: Promise<unknown>;
    act(() => {
      executePromise = result.current.execute();
    });

    expect(result.current.isPending).toBe(true);

    await act(async () => {
      await executePromise;
    });

    expect(result.current.isPending).toBe(false);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('prevents double execution during pending state', async () => {
    const action = jest.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() => useServerTick(action));

    act(() => {
      result.current.execute();
      result.current.execute(); // Should be ignored
      result.current.execute(); // Should be ignored
    });

    expect(action).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(100);
    });
  });

  it('respects minPendingTime for deliberate feel', async () => {
    const action = jest.fn().mockResolvedValue('result');
    const minPendingTime = 600;

    const { result } = renderHook(() =>
      useServerTick(action, { minPendingTime })
    );

    let startTime: number;
    let executePromise: Promise<unknown>;

    act(() => {
      startTime = Date.now();
      executePromise = result.current.execute();
    });

    expect(result.current.isPending).toBe(true);

    // Advance time but not enough
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.isPending).toBe(true);

    // Advance remaining time
    await act(async () => {
      jest.advanceTimersByTime(300);
      await executePromise;
    });

    expect(result.current.isPending).toBe(false);
  });

  it('handles errors and calls onError callback', async () => {
    const error = new Error('Server error');
    const action = jest.fn().mockRejectedValue(error);
    const onError = jest.fn();

    const { result } = renderHook(() =>
      useServerTick(action, { onError })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toEqual(error);
    expect(onError).toHaveBeenCalledWith(error);
    expect(result.current.isPending).toBe(false);
  });

  it('calls onSuccess callback on success', async () => {
    const action = jest.fn().mockResolvedValue('result');
    const onSuccess = jest.fn();

    const { result } = renderHook(() =>
      useServerTick(action, { onSuccess })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it('resets error state with resetError', async () => {
    const error = new Error('Test error');
    const action = jest.fn().mockRejectedValue(error);

    const { result } = renderHook(() => useServerTick(action));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toEqual(error);

    act(() => {
      result.current.resetError();
    });

    expect(result.current.error).toBeNull();
  });

  it('uses refs to avoid stale closures (fixes dependency bug)', async () => {
    // This tests the fix for the dependency bug
    // The action should always use the latest callback, not a stale one
    let counter = 0;
    const createAction = () => {
      const currentValue = ++counter;
      return jest.fn().mockResolvedValue(currentValue);
    };

    const action1 = createAction();
    const { result, rerender } = renderHook(
      ({ action }) => useServerTick(action),
      { initialProps: { action: action1 } }
    );

    // Execute with action1
    await act(async () => {
      await result.current.execute();
    });
    expect(action1).toHaveBeenCalled();

    // Re-render with new action (simulates unmemoized callback)
    const action2 = createAction();
    rerender({ action: action2 });

    // Execute should use action2, not stale action1
    await act(async () => {
      await result.current.execute();
    });

    expect(action2).toHaveBeenCalled();
  });

  it('returns result from action', async () => {
    const expectedResult = { success: true, data: 'test' };
    const action = jest.fn().mockResolvedValue(expectedResult);

    const { result } = renderHook(() => useServerTick(action));

    let executeResult: unknown;
    await act(async () => {
      executeResult = await result.current.execute();
    });

    expect(executeResult).toEqual(expectedResult);
  });
});

describe('useServerTick in decisive zone context', () => {
  it('enforces server-authoritative behavior (no optimistic UI)', async () => {
    // This documents the constraint:
    // In decisive zones with serverAuthoritative=true,
    // state should NEVER update before server confirms

    let serverConfirmed = false;
    const action = jest.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      serverConfirmed = true;
      return 'confirmed';
    });

    const { result } = renderHook(() => useServerTick(action));

    // Before execution
    expect(serverConfirmed).toBe(false);
    expect(result.current.isPending).toBe(false);

    // Start execution
    act(() => {
      result.current.execute();
    });

    // During pending - server has NOT confirmed yet
    expect(serverConfirmed).toBe(false);
    expect(result.current.isPending).toBe(true);

    // Only after server responds
    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    expect(serverConfirmed).toBe(true);
    expect(result.current.isPending).toBe(false);
  });
});
