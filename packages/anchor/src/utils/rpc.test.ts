import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rpcCall, RpcError, RpcTimeoutError, isRpcReady } from './rpc.js';

describe('rpcCall', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should make successful RPC call', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: '0x1',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await rpcCall<string>('http://localhost:8545', 'eth_chainId');
    expect(result).toBe('0x1');
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8545',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('should throw RpcError on RPC error response', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      id: 1,
      error: {
        code: -32601,
        message: 'Method not found',
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await expect(rpcCall('http://localhost:8545', 'invalid_method')).rejects.toThrow(RpcError);
    await expect(rpcCall('http://localhost:8545', 'invalid_method')).rejects.toMatchObject({
      code: -32601,
      message: 'Method not found',
    });
  });

  it('should throw RpcError on HTTP error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(rpcCall('http://localhost:8545', 'eth_chainId')).rejects.toThrow(RpcError);
  });

  it('should throw RpcTimeoutError on timeout', async () => {
    global.fetch = vi.fn().mockImplementation(
      () =>
        new Promise((_, reject) => {
          const error = new Error('Aborted');
          error.name = 'AbortError';
          setTimeout(() => reject(error), 100);
        })
    );

    const promise = rpcCall('http://localhost:8545', 'eth_chainId', [], 50);
    vi.advanceTimersByTime(100);

    await expect(promise).rejects.toThrow(RpcTimeoutError);
  });

  it('should pass params correctly', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: '0x1234',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await rpcCall<string>('http://localhost:8545', 'eth_getBalance', ['0x123', 'latest']);

    const callBody = JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[1]?.body as string);
    expect(callBody.params).toEqual(['0x123', 'latest']);
  });
});

describe('isRpcReady', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return true when RPC responds', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ jsonrpc: '2.0', id: 1, result: '0x1' }),
    });

    const ready = await isRpcReady('http://localhost:8545');
    expect(ready).toBe(true);
  });

  it('should return false when RPC fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

    const ready = await isRpcReady('http://localhost:8545');
    expect(ready).toBe(false);
  });
});
