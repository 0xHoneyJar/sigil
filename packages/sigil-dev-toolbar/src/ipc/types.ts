/**
 * IPC Types for Toolbar <-> Anchor/Lens Communication
 */

import type { LensContext, LensValidationResult, Zone } from '../types'

/** IPC Request types */
export type IPCRequestType = 'lens-validate' | 'anchor-validate' | 'lens-verify'

/** Base IPC Request */
export interface IPCRequest<T = unknown> {
  /** Unique request ID */
  id: string
  /** Request type */
  type: IPCRequestType
  /** Timestamp */
  timestamp: number
  /** Request payload */
  payload: T
}

/** Lens validation request payload */
export interface LensValidatePayload {
  /** Lens context to validate */
  context: LensContext
  /** Zone for validation */
  zone?: Zone
}

/** Anchor validation request payload */
export interface AnchorValidatePayload {
  /** Grounding statement */
  statement?: string
  /** Lens context (optional) */
  lensContext?: LensContext
  /** Zone for lens validation */
  zone?: Zone
}

/** IPC Response status */
export type IPCResponseStatus = 'success' | 'error' | 'timeout'

/** Base IPC Response */
export interface IPCResponse<T = unknown> {
  /** Request ID this responds to */
  requestId: string
  /** Response status */
  status: IPCResponseStatus
  /** Timestamp */
  timestamp: number
  /** Response data (if success) */
  data?: T
  /** Error message (if error) */
  error?: string
  /** Exit code from CLI */
  exitCode?: number
}

/** Lens validation response data */
export interface LensValidateResponse {
  valid: boolean
  issues: LensValidationResult['issues']
  summary: string
}

/** Anchor validation response data */
export interface AnchorValidateResponse {
  status?: 'VALID' | 'DRIFT' | 'DECEPTIVE'
  checks?: {
    relevance: { passed: boolean; reason: string }
    hierarchy: { passed: boolean; reason: string }
    rules: { passed: boolean; reason: string }
  }
  requiredZone?: Zone
  citedZone?: Zone | null
  correction?: string
  lens_validation?: LensValidateResponse
}

/** IPC Client configuration */
export interface IPCClientConfig {
  /** Base path for IPC files */
  basePath?: string
  /** Timeout for responses (ms) */
  timeout?: number
  /** Polling interval for responses (ms) */
  pollInterval?: number
}

/** Default IPC configuration */
export const DEFAULT_IPC_CONFIG: Required<IPCClientConfig> = {
  basePath: 'grimoires/pub',
  timeout: 30000,
  pollInterval: 100,
}
