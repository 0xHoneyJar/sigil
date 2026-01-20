/**
 * Sigil Toolbar - Wallet Manager
 * Agent wallet creation and encryption for feedback signing
 */

import { generatePrivateKey, privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts'
import { type Hex, toHex, hexToBytes, bytesToHex } from 'viem'

// Storage keys
const WALLET_KEY = 'sigil-agent-wallet'

interface EncryptedWallet {
  version: 1
  address: string
  encryptedPrivateKey: string // Base64 encoded encrypted data
  salt: string // Base64 encoded salt
  iv: string // Base64 encoded IV
  iterations: number
}

interface WalletState {
  address: string
  isLocked: boolean
}

// In-memory unlocked account (never persisted)
let unlockedAccount: PrivateKeyAccount | null = null

/**
 * Create a new agent wallet
 */
export async function createWallet(password: string): Promise<WalletState> {
  // Generate new keypair
  const privateKey = generatePrivateKey()
  const account = privateKeyToAccount(privateKey)

  // Encrypt private key
  const encrypted = await encryptPrivateKey(privateKey, password)

  // Store encrypted wallet
  const wallet: EncryptedWallet = {
    version: 1,
    address: account.address,
    encryptedPrivateKey: encrypted.data,
    salt: encrypted.salt,
    iv: encrypted.iv,
    iterations: encrypted.iterations,
  }

  await chrome.storage.local.set({ [WALLET_KEY]: wallet })

  // Keep unlocked in memory
  unlockedAccount = account

  return {
    address: account.address,
    isLocked: false,
  }
}

/**
 * Check if wallet exists
 */
export async function hasWallet(): Promise<boolean> {
  const stored = await chrome.storage.local.get(WALLET_KEY)
  return !!stored[WALLET_KEY]
}

/**
 * Get wallet state (address and lock status)
 */
export async function getWalletState(): Promise<WalletState | null> {
  const stored = await chrome.storage.local.get(WALLET_KEY)
  const wallet = stored[WALLET_KEY] as EncryptedWallet | undefined

  if (!wallet) return null

  return {
    address: wallet.address,
    isLocked: unlockedAccount === null,
  }
}

/**
 * Unlock wallet with password
 */
export async function unlockWallet(password: string): Promise<WalletState> {
  const stored = await chrome.storage.local.get(WALLET_KEY)
  const wallet = stored[WALLET_KEY] as EncryptedWallet | undefined

  if (!wallet) {
    throw new Error('No wallet found')
  }

  // Decrypt private key
  const privateKey = await decryptPrivateKey(
    wallet.encryptedPrivateKey,
    password,
    wallet.salt,
    wallet.iv,
    wallet.iterations
  )

  // Create account
  unlockedAccount = privateKeyToAccount(privateKey)

  // Verify address matches
  if (unlockedAccount.address.toLowerCase() !== wallet.address.toLowerCase()) {
    unlockedAccount = null
    throw new Error('Decryption verification failed')
  }

  return {
    address: wallet.address,
    isLocked: false,
  }
}

/**
 * Lock wallet (clear from memory)
 */
export function lockWallet(): void {
  unlockedAccount = null
}

/**
 * Sign a message with the agent wallet
 */
export async function signMessage(message: string): Promise<Hex> {
  if (!unlockedAccount) {
    throw new Error('Wallet is locked')
  }

  return unlockedAccount.signMessage({ message })
}

/**
 * Sign typed data (EIP-712)
 */
export async function signTypedData(
  domain: {
    name?: string
    version?: string
    chainId?: number
    verifyingContract?: `0x${string}`
  },
  types: Record<string, Array<{ name: string; type: string }>>,
  primaryType: string,
  message: Record<string, unknown>
): Promise<Hex> {
  if (!unlockedAccount) {
    throw new Error('Wallet is locked')
  }

  return unlockedAccount.signTypedData({
    domain,
    types,
    primaryType,
    message,
  })
}

/**
 * Delete wallet
 */
export async function deleteWallet(): Promise<void> {
  lockWallet()
  await chrome.storage.local.remove(WALLET_KEY)
}

/**
 * Export wallet (encrypted backup)
 */
export async function exportWallet(): Promise<string | null> {
  const stored = await chrome.storage.local.get(WALLET_KEY)
  const wallet = stored[WALLET_KEY] as EncryptedWallet | undefined

  if (!wallet) return null

  return JSON.stringify(wallet)
}

/**
 * Import wallet from backup
 */
export async function importWallet(
  backup: string,
  password: string
): Promise<WalletState> {
  const wallet = JSON.parse(backup) as EncryptedWallet

  // Validate structure
  if (
    wallet.version !== 1 ||
    !wallet.address ||
    !wallet.encryptedPrivateKey ||
    !wallet.salt ||
    !wallet.iv ||
    !wallet.iterations
  ) {
    throw new Error('Invalid wallet backup format')
  }

  // Verify password works
  const privateKey = await decryptPrivateKey(
    wallet.encryptedPrivateKey,
    password,
    wallet.salt,
    wallet.iv,
    wallet.iterations
  )

  const account = privateKeyToAccount(privateKey)

  if (account.address.toLowerCase() !== wallet.address.toLowerCase()) {
    throw new Error('Backup verification failed')
  }

  // Store wallet
  await chrome.storage.local.set({ [WALLET_KEY]: wallet })

  // Keep unlocked
  unlockedAccount = account

  return {
    address: wallet.address,
    isLocked: false,
  }
}

// ============================================================================
// Encryption Utilities (Web Crypto API)
// ============================================================================

const ITERATIONS = 100000
const KEY_LENGTH = 256
const ALGORITHM = 'AES-GCM'

interface EncryptedData {
  data: string
  salt: string
  iv: string
  iterations: number
}

/**
 * Derive encryption key from password
 */
async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number
): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt private key with password
 */
async function encryptPrivateKey(
  privateKey: Hex,
  password: string
): Promise<EncryptedData> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt, ITERATIONS)

  const encoder = new TextEncoder()
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(privateKey)
  )

  return {
    data: arrayBufferToBase64(encrypted),
    salt: arrayBufferToBase64(salt),
    iv: arrayBufferToBase64(iv),
    iterations: ITERATIONS,
  }
}

/**
 * Decrypt private key with password
 */
async function decryptPrivateKey(
  encryptedData: string,
  password: string,
  salt: string,
  iv: string,
  iterations: number
): Promise<Hex> {
  const key = await deriveKey(
    password,
    base64ToArrayBuffer(salt),
    iterations
  )

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv: base64ToArrayBuffer(iv) },
      key,
      base64ToArrayBuffer(encryptedData)
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted) as Hex
  } catch {
    throw new Error('Invalid password')
  }
}

/**
 * Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Convert Base64 to Uint8Array
 */
function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
