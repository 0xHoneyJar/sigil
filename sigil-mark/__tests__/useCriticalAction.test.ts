/**
 * Sigil v2.0 — useCriticalAction Tests
 *
 * Tests for the main physics hook covering all three time authorities
 * and proprioception functionality.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useCriticalAction } from '../core/useCriticalAction';
import type { CriticalActionOptions } from '../core/types';

// =============================================================================
// TEST UTILITIES
// =============================================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createMockMutation = <T>(
  result: T,
  delayMs: number = 100
): jest.Mock<Promise<T>> => {
  return jest.fn(() => delay(delayMs).then(() => result));
};

const createFailingMutation = (
  error: Error,
  delayMs: number = 100
): jest.Mock<Promise<never>> => {
  return jest.fn(() => delay(delayMs).then(() => Promise.reject(error)));
};

// =============================================================================
// SERVER-TICK TIME AUTHORITY
// =============================================================================

describe('useCriticalAction - server-tick authority', () => {
  it('starts in idle state', () => {
    const mutation = createMockMutation({ success: true });

    const { result } = renderHook(() =>
      useCriticalAction({
        mutation,
        timeAuthority: 'server-tick',
      })
    );

    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.timeAuthority).toBe('server-tick');
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.data).toBeNull();
  });

  it('shows pending state until server responds', async () => {
    const mutation = createMockMutation({ id: 1 }, 200);

    const { result } = renderHook(() =>
      useCriticalAction({
        mutation,
        timeAuthority: 'server-tick',
      })
    );

    // Start the action
    act(() => {
      result.current.commit(undefined);
    });

    // Should be pending immediately
    expect(result.current.state.status).toBe('pending');

    // Wait for completion
    await waitFor(() => {
      expect(result.current.state.status).toBe('confirmed');
    });

    expect(result.current.state.data).toEqual({ id: 1 });
  });

  it('does not allow double execution while pending', async () => {
    const mutation = createMockMutation({ id: 1 }, 100);

    const { result } = renderHook(() =>
      useCriticalAction({
        mutation,
        timeAuthority: 'server-tick',
      })
    );

    // Start first action
    act(() => {
      result.current.commit(undefined);
    });

    // Try to start second action
    act(() => {
      result.current.commit(undefined);
    });

    // Mutation should only be called once
    expect(mutation).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(result.current.state.status).toBe('confirmed');
    });
  });

  it('shows visible error on failure', async () => {
    const error = new Error('Payment failed');
    const mutation = createFailingMutation(error, 100);
    const onError = jest.fn();

    const { result } = renderHook(() =>
      useCriticalAction({
        mutation,
        timeAuthority: 'server-tick',
        onError,
      })
    );

    act(() => {
      result.current.commit(undefined);
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('failed');
    });

    // Error should be visible
    expect(result.current.state.error?.message).toBe('Payment failed');
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('calls onSuccess on success', async () => {
    const data = { id: 1, amount: 100 };
    const mutation = createMockMutation(data, 50);
    const onSuccess = jest.fn();

    const { result } = renderHook(() =>
      useCriticalAction({
        mutation,
        timeAuthority: 'server-tick',
        onSuccess,
      })
    );

    act(() => {
      result.current.commit(undefined);
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('confirmed');
    });

    expect(onSuccess).toHaveBeenCalledWith(data);
  });

  it('supports retry after failure', async () => {
    let shouldFail = true;
    const mutation = jest.fn(async () => {
      await delay(50);
      if (shouldFail) {
        shouldFail = false;
        throw new Error('First attempt failed');
      }
      return { success: true };
    });

    const { result } = renderHook(() =>
      useCriticalAction({
        mutation,
        timeAuthority: 'server-tick',
      })
    );

    // First attempt - fails
    act(() => {
      result.current.commit(undefined);
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('failed');
    });

    // Retry - succeeds
    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('confirmed');
    });

    expect(mutation).toHaveBeenCalledTimes(2);
  });
});

// =============================================================================
// OPTIMISTIC TIME AUTHORITY
// =============================================================================

describe('useCriticalAction - optimistic authority', () => {
  it('performs silent rollback on failure', async () => {
    const error = new Error('Server error');
    const mutation = createFailingMutation(error, 100);
    const onError = jest.fn();

    const { result } = renderHook(() =>
      useCriticalAction({
        mutation,
        timeAuthority: 'optimistic',
        onError,
      })
    );

    act(() => {
      result.current.commit(undefined);
    });

    // Should be pending
    expect(result.current.state.status).toBe('pending');

    await waitFor(() => {
      // Should reset to idle silently (no error shown)
      expect(result.current.state.status).toBe('idle');
    });

    // Error should NOT be shown in state (silent rollback)
    expect(result.current.state.error).toBeNull();

    // But onError should still be called for logging
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('calls optimistic callback immediately', async () => {
    const mutation = createMockMutation({ id: 1 }, 100);
    const optimistic = jest.fn();

    const { result } = renderHook(() =>
      useCriticalAction({
        mutation,
        timeAuthority: 'optimistic',
        optimistic,
      })
    );

    act(() => {
      result.current.commit({ name: 'test' });
    });

    // Optimistic should be called immediately
    expect(optimistic).toHaveBeenCalledWith(expect.anything(), { name: 'test' });

    await waitFor(() => {
      expect(result.current.state.status).toBe('confirmed');
    });
  });

  it('calls rollback callback on failure', async () => {
    const error = new Error('Failed');
    const mutation = createFailingMutation(error, 50);
    const rollback = jest.fn();

    const { result } = renderHook(() =>
      useCriticalAction({
        mutation,
        timeAuthority: 'optimistic',
        rollback,
      })
    );

    act(() => {
      result.current.commit({ name: 'test' });
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('idle');
    });

    expect(rollback).toHaveBeenCalledWith(expect.anything(), { name: 'test' });
  });

  it('clears self-prediction on success', async () => {
    const mutation = createMockMutation({ id: 1 }, 50);

    const { result } = renderHook(() =>
      useCriticalAction({
        mutation,
        timeAuthority: 'optimistic',
        proprioception: {
          self: {
            animation: { optimistic: true },
          },
          world: {},
        },
      })
    );

    act(() => {
      result.current.commit(undefined);
    });

    // Self-prediction should be active
    expect(result.current.state.selfPrediction.animation).toBe('active');

    await waitFor(() => {
      expect(result.current.state.status).toBe('confirmed');
    });

    // Self-prediction should be cleared
    expect(result.current.state.selfPrediction.animation).toBeNull();
  });
});

// =============================================================================
// HYBRID TIME AUTHORITY
// =============================================================================

describe('useCriticalAction - hybrid authority', () => {
  it('shows sync indicator while pending', async () => {
    const mutation = createMockMutation({ id: 1 }, 100);

    const { result } = renderHook(() =>
      useCriticalAction({
        mutation,
        timeAuthority: 'hybrid',
      })
    );

    act(() => {
      result.current.commit(undefined);
    });

    // Should show pending (sync indicator visible)
    expect(result.current.state.status).toBe('pending');

    await waitFor(() => {
      expect(result.current.state.status).toBe('confirmed');
    });
  });

  it('shows visible error on failure (unlike optimistic)', async () => {
    const error = new Error('Sync failed');
    const mutation = createFailingMutation(error, 50);

    const { result } = renderHook(() =>
      useCriticalAction({
        mutation,
        timeAuthority: 'hybrid',
      })
    );

    act(() => {
      result.current.commit(undefined);
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('failed');
    });

    // Error SHOULD be visible (visible rollback)
    expect(result.current.state.error?.message).toBe('Sync failed');
  });

  it('applies optimistic update and shows sync indicator', async () => {
    const mutation = createMockMutation({ id: 1 }, 100);
    const optimistic = jest.fn();

    const { result } = renderHook(() =>
      useCriticalAction({
        mutation,
        timeAuthority: 'hybrid',
        optimistic,
      })
    );

    act(() => {
      result.current.commit({ name: 'test' });
    });

    // Optimistic should be called
    expect(optimistic).toHaveBeenCalledWith(expect.anything(), { name: 'test' });

    // Status should be pending (showing sync indicator)
    expect(result.current.state.status).toBe('pending');

    await waitFor(() => {
      expect(result.current.state.status).toBe('confirmed');
    });
  });
});

// =============================================================================
// PROPRIOCEPTION
// =============================================================================

describe('useCriticalAction - proprioception', () => {
  it('applies self-predictions immediately with position', async () => {
    const mutation = createMockMutation({ x: 100, y: 100 }, 100);

    const { result } = renderHook(() =>
      useCriticalAction({
        mutation,
        timeAuthority: 'optimistic',
        proprioception: {
          self: {
            rotation: { instant: true },
            animation: { optimistic: true },
            position: {
              enabled: true,
              render: 'ghost',
              reconcile: 'lerp',
              maxDrift: 600,
            },
          },
          world: {},
        },
      })
    );

    act(() => {
      result.current.commit({ x: 100, y: 100 });
    });

    // Self-predictions should be active
    expect(result.current.state.selfPrediction.animation).toBe('active');
    expect(result.current.state.selfPrediction.rotation).toBe(1);
    expect(result.current.state.selfPrediction.position).not.toBeNull();
    expect(result.current.state.selfPrediction.position?.render).toBe('ghost');

    await waitFor(() => {
      expect(result.current.state.status).toBe('confirmed');
    });
  });

  it('reconciles predictions on server response', async () => {
    const mutation = createMockMutation({ x: 98, y: 102 }, 50);

    const { result } = renderHook(() =>
      useCriticalAction({
        mutation,
        timeAuthority: 'optimistic',
        proprioception: {
          self: {
            position: {
              enabled: true,
              render: 'ghost',
              reconcile: 'snap',
              maxDrift: 600,
            },
          },
          world: {},
        },
      })
    );

    act(() => {
      result.current.commit({ x: 100, y: 100 });
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('confirmed');
    });

    // After reconciliation, self-prediction should be cleared
    expect(result.current.state.selfPrediction.position).toBeNull();

    // World truth should have server position
    expect(result.current.state.worldTruth.confirmed).toBe(true);
    expect(result.current.state.worldTruth.position).toEqual({ x: 98, y: 102 });
  });

  it('clears predictions on failure', async () => {
    const error = new Error('Failed');
    const mutation = createFailingMutation(error, 50);

    const { result } = renderHook(() =>
      useCriticalAction({
        mutation,
        timeAuthority: 'optimistic',
        proprioception: {
          self: {
            animation: { optimistic: true },
            position: {
              enabled: true,
              render: 'ghost',
              reconcile: 'snap',
              maxDrift: 600,
            },
          },
          world: {},
        },
      })
    );

    act(() => {
      result.current.commit({ x: 100, y: 100 });
    });

    // Predictions should be active
    expect(result.current.state.selfPrediction.animation).toBe('active');

    await waitFor(() => {
      expect(result.current.state.status).toBe('idle');
    });

    // Predictions should be cleared after failure
    expect(result.current.state.selfPrediction.animation).toBeNull();
    expect(result.current.state.selfPrediction.position).toBeNull();
  });
});

// =============================================================================
// CONFIRMATION STEP
// =============================================================================

describe('useCriticalAction - confirmation step', () => {
  it('goes to confirming state when requireConfirmation is true', async () => {
    const mutation = createMockMutation({ id: 1 }, 50);

    const { result } = renderHook(() =>
      useCriticalAction({
        mutation,
        timeAuthority: 'server-tick',
        requireConfirmation: true,
      })
    );

    act(() => {
      result.current.commit(undefined);
    });

    // Should be in confirming state
    expect(result.current.state.status).toBe('confirming');

    // Mutation should NOT be called yet
    expect(mutation).not.toHaveBeenCalled();
  });

  it('executes mutation after confirm is called', async () => {
    const mutation = createMockMutation({ id: 1 }, 50);

    const { result } = renderHook(() =>
      useCriticalAction({
        mutation,
        timeAuthority: 'server-tick',
        requireConfirmation: true,
      })
    );

    // First call - goes to confirming
    act(() => {
      result.current.commit(undefined);
    });

    expect(result.current.state.status).toBe('confirming');

    // Second call - confirms and executes
    act(() => {
      result.current.confirm();
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('confirmed');
    });

    expect(mutation).toHaveBeenCalledTimes(1);
  });

  it('can cancel from confirming state', async () => {
    const mutation = createMockMutation({ id: 1 }, 50);

    const { result } = renderHook(() =>
      useCriticalAction({
        mutation,
        timeAuthority: 'server-tick',
        requireConfirmation: true,
      })
    );

    act(() => {
      result.current.commit(undefined);
    });

    expect(result.current.state.status).toBe('confirming');

    act(() => {
      result.current.cancel();
    });

    expect(result.current.state.status).toBe('idle');
    expect(mutation).not.toHaveBeenCalled();
  });
});

// =============================================================================
// RESET
// =============================================================================

describe('useCriticalAction - reset', () => {
  it('resets to initial state', async () => {
    const mutation = createMockMutation({ id: 1 }, 50);

    const { result } = renderHook(() =>
      useCriticalAction({
        mutation,
        timeAuthority: 'server-tick',
      })
    );

    act(() => {
      result.current.commit(undefined);
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('confirmed');
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.data).toBeNull();
    expect(result.current.state.error).toBeNull();
  });
});
