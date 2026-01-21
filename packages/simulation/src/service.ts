/**
 * Simulation Service Implementation
 *
 * Executes transactions against fork and captures results.
 * Provides dry-run functionality without real funds.
 */

import type { Address, Hash, Hex } from 'viem'
import type { ForkService } from '@sigil/fork'
import type {
  SimulationRequest,
  SimulationResult,
  SimulationService,
  BalanceChange,
  SimulationLog,
} from './types'
import { SimulationError, SimulationErrorCodes } from './types'

/**
 * Parse revert reason from error data
 */
function parseRevertReason(data: Hex): string | null {
  // Check for Error(string) selector: 0x08c379a0
  if (data.startsWith('0x08c379a0') && data.length >= 138) {
    try {
      // Skip selector (4 bytes) and offset (32 bytes)
      const lengthHex = data.slice(74, 138)
      const length = parseInt(lengthHex, 16)
      if (length > 0 && length < 1000) {
        const messageHex = data.slice(138, 138 + length * 2)
        // Convert hex to string
        const bytes = []
        for (let i = 0; i < messageHex.length; i += 2) {
          bytes.push(parseInt(messageHex.slice(i, i + 2), 16))
        }
        const message = String.fromCharCode(...bytes)
        return message
      }
    } catch {
      // Ignore parsing errors
    }
  }

  // Check for Panic(uint256) selector: 0x4e487b71
  if (data.startsWith('0x4e487b71') && data.length >= 74) {
    const panicCode = parseInt(data.slice(10, 74), 16)
    const panicMessages: Record<number, string> = {
      0x00: 'Generic compiler panic',
      0x01: 'Assert failed',
      0x11: 'Arithmetic overflow/underflow',
      0x12: 'Division by zero',
      0x21: 'Invalid enum value',
      0x22: 'Invalid storage byte array',
      0x31: 'Pop on empty array',
      0x32: 'Array index out of bounds',
      0x41: 'Too much memory allocated',
      0x51: 'Internal function called',
    }
    return panicMessages[panicCode] || `Panic(0x${panicCode.toString(16)})`
  }

  // Custom error or unknown format
  if (data.length > 10) {
    const selector = data.slice(0, 10)
    return `Custom error: ${selector}`
  }

  return null
}

/**
 * Create a simulation service using a fork service
 */
export function createSimulationService(forkService: ForkService): SimulationService {
  async function jsonRpc(method: string, params: unknown[] = []): Promise<unknown> {
    const rpcUrl = forkService.getRpcUrl()
    if (!rpcUrl) {
      throw new SimulationError(
        'Fork not active',
        SimulationErrorCodes.FORK_NOT_ACTIVE
      )
    }

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      }),
    })

    const data = await response.json()
    if (data.error) {
      throw new Error(data.error.message || 'RPC error')
    }
    return data.result
  }

  async function getBalance(address: Address): Promise<bigint> {
    const result = await jsonRpc('eth_getBalance', [address, 'latest'])
    return BigInt(result as string)
  }

  const service: SimulationService = {
    async simulate(tx: SimulationRequest): Promise<SimulationResult> {
      const timestamp = Date.now()

      // Get current block number
      const blockNumberHex = (await jsonRpc('eth_blockNumber')) as string
      const blockNumber = BigInt(blockNumberHex)

      // Get balances before
      const fromBalanceBefore = await getBalance(tx.from)
      const toBalanceBefore = await getBalance(tx.to)

      // Estimate gas if not provided
      const gasLimit = tx.gas ?? (await service.estimateGas(tx))

      // Get gas price
      const gasPrice = tx.gasPrice ?? tx.maxFeePerGas ?? (await service.getGasPrice())

      // Take a snapshot before simulation
      const snapshot = await forkService.snapshot('pre-simulation')

      // Prepare transaction params
      const txParams = {
        from: tx.from,
        to: tx.to,
        value: tx.value ? `0x${tx.value.toString(16)}` : '0x0',
        data: tx.data ?? '0x',
        gas: `0x${gasLimit.toString(16)}`,
        gasPrice: `0x${gasPrice.toString(16)}`,
        nonce: tx.nonce !== undefined ? `0x${tx.nonce.toString(16)}` : undefined,
      }

      let success = true
      let hash: Hash | undefined
      let gasUsed = 0n
      let returnValue: Hex | undefined
      let revertReason: string | undefined
      const logs: SimulationLog[] = []

      try {
        // Impersonate the sender
        await forkService.impersonateAccount(tx.from)

        // Send transaction
        hash = (await jsonRpc('eth_sendTransaction', [txParams])) as Hash

        // Wait for transaction receipt
        let receipt = null
        let attempts = 0
        while (!receipt && attempts < 50) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          receipt = await jsonRpc('eth_getTransactionReceipt', [hash])
          attempts++
        }

        if (receipt) {
          const r = receipt as {
            status: string
            gasUsed: string
            logs: Array<{ address: string; topics: string[]; data: string }>
          }

          success = r.status === '0x1'
          gasUsed = BigInt(r.gasUsed)

          // Parse logs
          for (const log of r.logs) {
            logs.push({
              address: log.address as Address,
              topics: log.topics as Hex[],
              data: log.data as Hex,
            })
          }

          // If failed, try to get revert reason
          if (!success) {
            try {
              await jsonRpc('eth_call', [txParams, 'latest'])
            } catch (callError) {
              if (callError instanceof Error && callError.message) {
                revertReason = callError.message
              }
            }
          }
        }
      } catch (error) {
        success = false
        if (error instanceof Error) {
          // Try to extract revert reason from error
          const errorData = (error as unknown as { data?: string }).data
          if (errorData) {
            revertReason = parseRevertReason(errorData as Hex) ?? error.message
          } else {
            revertReason = error.message
          }
        }
      } finally {
        // ALWAYS cleanup impersonation (FR-006 fix)
        try {
          await forkService.stopImpersonating(tx.from)
        } catch {
          // Ignore cleanup errors
        }
        // Revert to snapshot to restore state
        await forkService.revert(snapshot.id)
      }

      // Get balances after (before revert, for logging purposes we already have them)
      const fromBalanceAfter = await getBalance(tx.from)
      const toBalanceAfter = await getBalance(tx.to)

      // Calculate balance changes
      const balanceChanges: BalanceChange[] = []

      if (fromBalanceBefore !== fromBalanceAfter) {
        balanceChanges.push({
          address: tx.from,
          token: null,
          symbol: 'ETH',
          before: fromBalanceBefore,
          after: fromBalanceAfter,
          delta: fromBalanceAfter - fromBalanceBefore,
        })
      }

      if (tx.from !== tx.to && toBalanceBefore !== toBalanceAfter) {
        balanceChanges.push({
          address: tx.to,
          token: null,
          symbol: 'ETH',
          before: toBalanceBefore,
          after: toBalanceAfter,
          delta: toBalanceAfter - toBalanceBefore,
        })
      }

      // Calculate total cost
      const effectiveGasPrice = gasPrice
      const totalCost = gasUsed * effectiveGasPrice + (tx.value ?? 0n)

      return {
        success,
        hash,
        gasUsed,
        gasLimit,
        effectiveGasPrice,
        totalCost,
        returnValue,
        revertReason,
        balanceChanges,
        stateChanges: [], // State changes require trace API
        logs,
        blockNumber,
        timestamp,
      }
    },

    async estimateGas(tx: SimulationRequest): Promise<bigint> {
      const txParams = {
        from: tx.from,
        to: tx.to,
        value: tx.value ? `0x${tx.value.toString(16)}` : '0x0',
        data: tx.data ?? '0x',
      }

      try {
        const result = await jsonRpc('eth_estimateGas', [txParams])
        // Add 20% buffer
        const estimate = BigInt(result as string)
        return (estimate * 120n) / 100n
      } catch {
        // Return a default gas limit if estimation fails
        return 21000n
      }
    },

    async getGasPrice(): Promise<bigint> {
      const result = await jsonRpc('eth_gasPrice')
      return BigInt(result as string)
    },

    decodeRevertReason(data: Hex): string | null {
      return parseRevertReason(data)
    },
  }

  return service
}
