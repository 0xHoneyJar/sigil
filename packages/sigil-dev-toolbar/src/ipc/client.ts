/**
 * IPC Client for Toolbar <-> Anchor/Lens Communication
 *
 * Provides a transport-agnostic interface for communicating with
 * Anchor and Lens CLIs. In development mode, uses localStorage for
 * request/response exchange. In production, would use file-based IPC.
 */

import type {
  IPCRequest,
  IPCResponse,
  IPCRequestType,
  IPCClientConfig,
  LensValidatePayload,
  LensValidateResponse,
  AnchorValidatePayload,
  AnchorValidateResponse,
} from './types'
import { DEFAULT_IPC_CONFIG } from './types'
import type { LensContext, Zone } from '../types'

/** Generate a UUID v4 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/** IPC Transport interface */
export interface IPCTransport {
  /** Write a request */
  writeRequest(request: IPCRequest): Promise<void>
  /** Read a response (returns null if not found) */
  readResponse(requestId: string, cliType: string): Promise<IPCResponse | null>
  /** Cleanup request/response files */
  cleanup(requestId: string): Promise<void>
}

/**
 * LocalStorage-based transport for development/browser
 * Stores requests in localStorage, responses come from external source
 */
export class LocalStorageTransport implements IPCTransport {
  private prefix: string

  constructor(prefix = 'sigil-ipc') {
    this.prefix = prefix
  }

  async writeRequest(request: IPCRequest): Promise<void> {
    const key = `${this.prefix}:request:${request.id}`
    localStorage.setItem(key, JSON.stringify(request))
  }

  async readResponse(requestId: string, cliType: string): Promise<IPCResponse | null> {
    const key = `${this.prefix}:response:${requestId}:${cliType}`
    const data = localStorage.getItem(key)
    if (!data) return null
    try {
      return JSON.parse(data) as IPCResponse
    } catch {
      return null
    }
  }

  async cleanup(requestId: string): Promise<void> {
    // Remove all keys related to this request
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.includes(requestId)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))
  }
}

/**
 * File-system operations interface for FileSystemTransport
 * Inject your own implementation (e.g., Node.js fs/promises)
 */
export interface FileSystemOps {
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>
  writeFile(path: string, data: string): Promise<void>
  readFile(path: string, encoding: 'utf-8'): Promise<string>
  unlink(path: string): Promise<void>
}

/**
 * File-system based transport for production/Electron/CLI
 * Uses grimoires/pub/ directory for request/response exchange
 *
 * Response files are prefixed with CLI name to prevent collision:
 * - anchor responses: grimoires/pub/responses/anchor-{request_id}.json
 * - lens responses: grimoires/pub/responses/lens-{request_id}.json
 *
 * Note: Requires injecting file system operations (e.g., Node.js fs/promises)
 * Example:
 *   import fs from 'fs/promises'
 *   const transport = new FileSystemTransport('grimoires/pub', fs)
 */
export class FileSystemTransport implements IPCTransport {
  private basePath: string
  private fs: FileSystemOps

  constructor(basePath: string, fsOps: FileSystemOps) {
    this.basePath = basePath
    this.fs = fsOps
  }

  async writeRequest(request: IPCRequest): Promise<void> {
    const dir = `${this.basePath}/requests`
    try {
      await this.fs.mkdir(dir, { recursive: true })
    } catch {
      // Directory may already exist
    }
    const path = `${dir}/${request.id}.json`
    await this.fs.writeFile(path, JSON.stringify(request, null, 2))
  }

  async readResponse(requestId: string, cliType: string): Promise<IPCResponse | null> {
    // Response files are prefixed with CLI name: {cli}-{request_id}.json
    const path = `${this.basePath}/responses/${cliType}-${requestId}.json`
    try {
      const data = await this.fs.readFile(path, 'utf-8')
      return JSON.parse(data) as IPCResponse
    } catch {
      return null
    }
  }

  async cleanup(requestId: string): Promise<void> {
    // Clean up request file
    try {
      await this.fs.unlink(`${this.basePath}/requests/${requestId}.json`)
    } catch {
      // File may not exist
    }
    // Clean up all CLI response files
    for (const cli of ['anchor', 'lens']) {
      try {
        await this.fs.unlink(`${this.basePath}/responses/${cli}-${requestId}.json`)
      } catch {
        // File may not exist
      }
    }
  }
}

/**
 * Mock transport for testing
 * Immediately resolves with mock responses
 */
export class MockTransport implements IPCTransport {
  private mockResponses: Map<string, IPCResponse> = new Map()

  setMockResponse(requestId: string, cliType: string, response: IPCResponse): void {
    this.mockResponses.set(`${requestId}:${cliType}`, response)
  }

  async writeRequest(_request: IPCRequest): Promise<void> {
    // No-op for mock
  }

  async readResponse(requestId: string, cliType: string): Promise<IPCResponse | null> {
    return this.mockResponses.get(`${requestId}:${cliType}`) ?? null
  }

  async cleanup(_requestId: string): Promise<void> {
    // No-op for mock
  }
}

/**
 * IPC Client for communicating with Anchor/Lens CLIs
 */
export class IPCClient {
  private config: Required<IPCClientConfig>
  private transport: IPCTransport

  constructor(transport?: IPCTransport, config?: IPCClientConfig) {
    this.config = { ...DEFAULT_IPC_CONFIG, ...config }
    this.transport = transport ?? new LocalStorageTransport()
  }

  /**
   * Send a request and wait for response
   */
  async send<T, R>(type: IPCRequestType, payload: T, cliType = 'anchor'): Promise<R> {
    const request: IPCRequest<T> = {
      id: generateUUID(),
      type,
      timestamp: Date.now(),
      payload,
    }

    // Write request
    await this.transport.writeRequest(request)

    // Wait for response with polling
    const response = await this.waitForResponse<R>(request.id, cliType)

    // Cleanup
    await this.transport.cleanup(request.id)

    if (response.status === 'error') {
      throw new Error(response.error ?? 'Unknown IPC error')
    }

    if (response.status === 'timeout') {
      throw new Error('IPC request timed out')
    }

    return response.data as R
  }

  /**
   * Poll for response until timeout
   */
  private async waitForResponse<R>(requestId: string, cliType: string): Promise<IPCResponse<R>> {
    const startTime = Date.now()

    while (Date.now() - startTime < this.config.timeout) {
      const response = await this.transport.readResponse(requestId, cliType)
      if (response) {
        return response as IPCResponse<R>
      }

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, this.config.pollInterval))
    }

    // Timeout
    return {
      requestId,
      status: 'timeout',
      timestamp: Date.now(),
      error: 'Request timed out',
    }
  }

  /**
   * Validate lens context via Anchor CLI
   */
  async validateLensContext(
    context: LensContext,
    zone?: Zone
  ): Promise<LensValidateResponse> {
    const payload: LensValidatePayload = { context, zone }
    return this.send<LensValidatePayload, LensValidateResponse>('lens-validate', payload, 'anchor')
  }

  /**
   * Run full Anchor validation with optional lens context
   */
  async validateAnchor(
    statement?: string,
    lensContext?: LensContext,
    zone?: Zone
  ): Promise<AnchorValidateResponse> {
    const payload: AnchorValidatePayload = { statement, lensContext, zone }
    return this.send<AnchorValidatePayload, AnchorValidateResponse>('anchor-validate', payload, 'anchor')
  }

  /**
   * Get the current transport
   */
  getTransport(): IPCTransport {
    return this.transport
  }

  /**
   * Set a new transport
   */
  setTransport(transport: IPCTransport): void {
    this.transport = transport
  }
}

/** Default IPC client instance */
let defaultClient: IPCClient | null = null

/**
 * Get the default IPC client instance
 */
export function getIPCClient(): IPCClient {
  if (!defaultClient) {
    defaultClient = new IPCClient()
  }
  return defaultClient
}

/**
 * Reset the default IPC client (useful for testing)
 */
export function resetIPCClient(): void {
  defaultClient = null
}

/**
 * Create an IPC client with file-system transport
 * Use this in Node.js/Electron environments for production IPC
 *
 * Example:
 *   import fs from 'fs/promises'
 *   const client = createFileSystemClient(fs, 'grimoires/pub')
 */
export function createFileSystemClient(
  fsOps: FileSystemOps,
  basePath = 'grimoires/pub',
  config?: IPCClientConfig
): IPCClient {
  return new IPCClient(new FileSystemTransport(basePath, fsOps), config)
}
