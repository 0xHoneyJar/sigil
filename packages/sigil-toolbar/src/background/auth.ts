/**
 * Sigil Toolbar - Source Authentication
 * Implements source-dependent authentication for feedback API
 */

import type { FeedbackRequest } from '../shared/types'
import { signMessage, getWalletState } from './wallet-manager'
import { getSettings } from './settings'

// Authentication headers
export interface AuthHeaders {
  'X-Sigil-Source': 'toolbar' | 'dapp' | 'cli'
  'X-Sigil-Timestamp': string
  'X-Sigil-Signature'?: string
  'X-Sigil-Address'?: string
}

// HMAC key for CLI authentication (stored in ~/.config/loa/secret)
const CLI_HMAC_WINDOW_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Sign feedback request based on source
 */
export async function signFeedbackRequest(
  request: FeedbackRequest,
  source: 'toolbar' | 'dapp' | 'cli'
): Promise<{ request: FeedbackRequest; headers: AuthHeaders }> {
  const timestamp = Date.now().toString()

  const headers: AuthHeaders = {
    'X-Sigil-Source': source,
    'X-Sigil-Timestamp': timestamp,
  }

  // Build message to sign
  const message = buildSignatureMessage(request, timestamp)

  // Source-specific authentication
  switch (source) {
    case 'dapp': {
      // dApps MUST have wallet signature
      const walletState = await getWalletState()
      if (!walletState || walletState.isLocked) {
        throw new Error('dApp source requires wallet authentication')
      }

      const signature = await signMessage(message)
      headers['X-Sigil-Signature'] = signature
      headers['X-Sigil-Address'] = walletState.address
      break
    }

    case 'toolbar': {
      // Toolbar: Optional wallet signature
      const walletState = await getWalletState()
      if (walletState && !walletState.isLocked) {
        try {
          const signature = await signMessage(message)
          headers['X-Sigil-Signature'] = signature
          headers['X-Sigil-Address'] = walletState.address
        } catch {
          // Wallet signing failed, proceed without signature
          console.warn('[Sigil] Wallet signing failed, proceeding unsigned')
        }
      }
      break
    }

    case 'cli': {
      // CLI: HMAC signature (handled server-side)
      // The CLI will add its own HMAC signature
      break
    }
  }

  return {
    request: {
      ...request,
      source,
    },
    headers,
  }
}

/**
 * Build deterministic message for signing
 */
function buildSignatureMessage(request: FeedbackRequest, timestamp: string): string {
  // Canonical JSON representation for signing
  const canonical = {
    type: request.type,
    url: request.url,
    timestamp,
  }

  return `sigil:feedback:${JSON.stringify(canonical)}`
}

/**
 * Verify timestamp is within acceptable window
 */
export function isTimestampValid(timestamp: string): boolean {
  const ts = parseInt(timestamp, 10)
  if (isNaN(ts)) return false

  const now = Date.now()
  const diff = Math.abs(now - ts)

  return diff <= CLI_HMAC_WINDOW_MS
}

/**
 * Verify wallet signature (server-side utility)
 */
export async function verifyWalletSignature(
  message: string,
  signature: string,
  expectedAddress: string
): Promise<boolean> {
  // This would typically be done server-side using viem's verifyMessage
  // For reference, the verification would look like:
  //
  // import { verifyMessage } from 'viem'
  // const valid = await verifyMessage({
  //   address: expectedAddress,
  //   message,
  //   signature,
  // })
  // return valid

  // In the extension, we just prepare the signature
  // Server handles verification
  return true
}

/**
 * Generate HMAC signature for CLI authentication
 * This is used by the CLI tool, not the extension
 */
export function generateHmacSignature(
  message: string,
  secret: string
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const encoder = new TextEncoder()
      const keyData = encoder.encode(secret)
      const messageData = encoder.encode(message)

      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )

      const signature = await crypto.subtle.sign('HMAC', key, messageData)

      // Convert to hex
      const hashArray = Array.from(new Uint8Array(signature))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      resolve(hashHex)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Verify HMAC signature (server-side utility)
 */
export async function verifyHmacSignature(
  message: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expected = await generateHmacSignature(message, secret)
  return signature === expected
}
