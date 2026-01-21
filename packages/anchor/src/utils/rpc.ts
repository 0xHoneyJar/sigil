/**
 * JSON-RPC helper for Anvil communication
 *
 * Provides type-safe RPC calls with timeout handling and error management.
 */

import { z } from 'zod';

/** JSON-RPC 2.0 request format */
interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: unknown[];
}

/** JSON-RPC 2.0 response format */
interface JsonRpcResponse<T> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/** RPC error with code and message */
export class RpcError extends Error {
  constructor(
    public readonly code: number,
    message: string,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = 'RpcError';
  }
}

/** RPC timeout error */
export class RpcTimeoutError extends Error {
  constructor(
    public readonly method: string,
    public readonly timeoutMs: number
  ) {
    super(`RPC call '${method}' timed out after ${timeoutMs}ms`);
    this.name = 'RpcTimeoutError';
  }
}

/** Default timeout for RPC calls (30 seconds) */
const DEFAULT_TIMEOUT_MS = 30_000;

/** Internal request ID counter */
let requestId = 0;

/**
 * Make a JSON-RPC call to an Anvil node
 *
 * @param url - RPC endpoint URL
 * @param method - RPC method name (e.g., 'eth_blockNumber', 'evm_snapshot')
 * @param params - Optional method parameters
 * @param timeoutMs - Timeout in milliseconds (default: 30000)
 * @returns Promise resolving to the result
 * @throws {RpcError} If the RPC returns an error
 * @throws {RpcTimeoutError} If the request times out
 */
export async function rpcCall<T>(
  url: string,
  method: string,
  params: unknown[] = [],
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const request: JsonRpcRequest = {
    jsonrpc: '2.0',
    id: ++requestId,
    method,
    params,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new RpcError(-32000, `HTTP error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as JsonRpcResponse<T>;

    if (data.error) {
      throw new RpcError(data.error.code, data.error.message, data.error.data);
    }

    if (data.result === undefined) {
      throw new RpcError(-32000, 'RPC response missing result');
    }

    return data.result;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new RpcTimeoutError(method, timeoutMs);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Check if an RPC endpoint is ready by calling eth_chainId
 *
 * @param url - RPC endpoint URL
 * @param timeoutMs - Timeout for the check
 * @returns Promise resolving to true if ready, false otherwise
 */
export async function isRpcReady(url: string, timeoutMs: number = 5000): Promise<boolean> {
  try {
    await rpcCall<string>(url, 'eth_chainId', [], timeoutMs);
    return true;
  } catch {
    return false;
  }
}

/**
 * Poll until RPC is ready
 *
 * @param url - RPC endpoint URL
 * @param maxAttempts - Maximum number of polling attempts
 * @param intervalMs - Interval between attempts in ms
 * @returns Promise resolving when ready
 * @throws Error if max attempts exceeded
 */
export async function waitForRpc(
  url: string,
  maxAttempts: number = 30,
  intervalMs: number = 1000
): Promise<void> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (await isRpcReady(url)) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`RPC at ${url} not ready after ${maxAttempts} attempts`);
}

/** Zod schema for validating hex strings */
export const hexStringSchema = z.string().regex(/^0x[0-9a-fA-F]*$/);

/** Zod schema for validating block numbers */
export const blockNumberSchema = z.union([hexStringSchema, z.literal('latest'), z.literal('pending'), z.literal('earliest')]);
