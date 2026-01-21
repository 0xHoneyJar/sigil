# SDD: Sigil HUD & Composable Package Architecture

**Version:** 1.0.0
**Status:** Draft
**Created:** 2026-01-21
**PRD Reference:** `grimoires/loa/prd-sigil-hud.md`

---

## 1. Executive Summary

This document defines the technical architecture for transforming the Sigil Dev Toolbar into a composable, UNIX-philosophy package suite with a diagnostic-first HUD. The design prioritizes:

1. **Bug fixes** in existing Rust CLI and React components (Sprint 0)
2. **Shared IPC crate** to prevent response file collisions
3. **Composable TypeScript packages** that can be used independently
4. **Progressive enhancement** where HUD works with any subset of packages

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              User's Application                              │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                           @sigil/hud                                  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │  HUD Panel  │  │  Keyboard   │  │   State     │  │  Signal     │  │  │
│  │  │  Components │  │  Shortcuts  │  │  Provider   │  │  Capture    │  │  │
│  │  └──────┬──────┘  └─────────────┘  └──────┬──────┘  └─────────────┘  │  │
│  └─────────┼─────────────────────────────────┼───────────────────────────┘  │
│            │                                 │                               │
│  ┌─────────▼─────────────────────────────────▼───────────────────────────┐  │
│  │                        Optional Package Layer                         │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │ @sigil/lens  │  │ @sigil/fork  │  │@sigil/diag   │                │  │
│  │  │              │  │              │  │              │                │  │
│  │  │ - Impersonate│  │ - Anvil      │  │ - Physics    │                │  │
│  │  │ - Address    │  │ - Tenderly   │  │ - Compliance │                │  │
│  │  │ - Context    │  │ - Snapshots  │  │ - Issues     │                │  │
│  │  └──────────────┘  └──────┬───────┘  └──────┬───────┘                │  │
│  │                           │                 │                         │  │
│  │                    ┌──────▼───────┐  ┌──────▼───────┐                │  │
│  │                    │@sigil/sim    │  │@sigil/anchor │                │  │
│  │                    │              │  │              │                │  │
│  │                    │ - Dry-run    │  │ - Validation │                │  │
│  │                    │ - Gas est.   │  │ - IPC Client │                │  │
│  │                    │ - Bal. chg.  │  │ - Warden     │                │  │
│  │                    └──────────────┘  └──────────────┘                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ File-based IPC
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              grimoires/pub/                                  │
│                                                                             │
│  ┌─────────────────────┐    ┌─────────────────────────────────────────┐    │
│  │     requests/       │    │              responses/                  │    │
│  │  {request_id}.json  │    │  anchor-{request_id}.json               │    │
│  │                     │    │  lens-{request_id}.json                 │    │
│  └─────────────────────┘    └─────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ CLI tools read requests, write responses
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Rust CLI Tools                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         sigil-ipc (shared crate)                     │    │
│  │   - request_path()      - response_path(cli_name, request_id)       │    │
│  │   - read_request()      - write_response()                          │    │
│  │   - validate_request_id()                                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│           ▲                                          ▲                       │
│           │                                          │                       │
│  ┌────────┴────────┐                        ┌───────┴────────┐              │
│  │     anchor      │                        │      lens      │              │
│  │                 │                        │                │              │
│  │ - warden        │                        │ - verify       │              │
│  │ - session       │                        │ - lint         │              │
│  │ - validate      │                        │ - parse        │              │
│  └─────────────────┘                        └────────────────┘              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Package Dependency Graph

```
@sigil/hud (React components, main entry point)
├── @sigil/lens (optional)
│   └── (no dependencies)
├── @sigil/fork (optional)
│   └── (no dependencies)
├── @sigil/simulation (optional)
│   └── @sigil/fork (required)
├── @sigil/diagnostics (optional)
│   └── @sigil/anchor (required)
└── @sigil/anchor (optional)
    └── (no dependencies)
```

### 2.3 Design Principles

| Principle | Implementation |
|-----------|----------------|
| **UNIX Philosophy** | Each package does one thing well |
| **Composition** | HUD composes packages, doesn't extend them |
| **Progressive Enhancement** | HUD works with any subset of packages |
| **File-based IPC** | No servers, just file watchers |
| **Graceful Degradation** | Missing packages don't break functionality |

---

## 3. Technology Stack

### 3.1 TypeScript Packages

| Technology | Version | Purpose |
|------------|---------|---------|
| TypeScript | 5.x | Type safety, IDE support |
| React | 18+ | UI components |
| pnpm | 8+ | Monorepo management |
| Vite | 5+ | Build tooling |
| Vitest | 1+ | Unit testing |

### 3.2 Rust Crates

| Technology | Version | Purpose |
|------------|---------|---------|
| Rust | 1.75+ | CLI tools |
| tokio | 1.x | Async runtime |
| serde | 1.x | Serialization |
| tree-sitter | 0.20+ | Code parsing (lens) |
| cel-interpreter | 0.8+ | Constraint evaluation (lens) |

### 3.3 External Dependencies

| Dependency | Purpose | Package |
|------------|---------|---------|
| viem | EVM interactions | @sigil/fork, @sigil/simulation |
| zustand | State management | @sigil/hud |
| fs2 | File locking | sigil-ipc |

---

## 4. Component Design

### 4.1 Shared Rust Crate: `sigil-ipc`

**Purpose:** Eliminate response file collisions by providing a shared IPC layer.

**Location:** `anchor-rust/sigil-ipc/`

#### 4.1.1 Public API

```rust
// sigil-ipc/src/lib.rs

/// CLI identifier for response namespacing
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CliName {
    Anchor,
    Lens,
}

impl CliName {
    pub fn as_str(&self) -> &'static str {
        match self {
            CliName::Anchor => "anchor",
            CliName::Lens => "lens",
        }
    }
}

/// Get path to request file
pub fn request_path(request_id: &str) -> Result<PathBuf>;

/// Get path to response file (includes CLI prefix to avoid collisions)
pub fn response_path(cli: CliName, request_id: &str) -> Result<PathBuf>;

/// Read a typed request from disk
pub fn read_request<T: DeserializeOwned>(request_id: &str) -> Result<T>;

/// Write a typed response to disk (with CLI prefix)
pub fn write_response<T: Serialize>(cli: CliName, request_id: &str, response: &T) -> Result<()>;

/// Read a typed response from disk
pub fn read_response<T: DeserializeOwned>(cli: CliName, request_id: &str) -> Result<T>;

/// Clean up stale files older than TTL
pub fn cleanup_stale_files(ttl_secs: Option<u64>) -> Result<usize>;
```

#### 4.1.2 File Path Convention

```
grimoires/pub/
├── requests/
│   └── {uuid}.json                    # Requests (same as before)
└── responses/
    ├── anchor-{uuid}.json             # Anchor responses (NEW: prefixed)
    └── lens-{uuid}.json               # Lens responses (NEW: prefixed)
```

#### 4.1.3 Migration Strategy

1. Update `sigil-ipc` crate with new `response_path(cli, id)` function
2. Update anchor to use `CliName::Anchor`
3. Update lens to use `CliName::Lens`
4. Update TypeScript IPC client to look for prefixed response files
5. Add backward compatibility for old unprefixed responses (read both)

### 4.2 TypeScript Package: `@sigil/anchor`

**Purpose:** IPC client for communicating with Anchor CLI.

**Location:** `packages/anchor/`

#### 4.2.1 Public API

```typescript
// packages/anchor/src/index.ts

export interface AnchorClient {
  /** Validate a grounding statement */
  validate(statement: string): Promise<ValidationResult>

  /** Check if Anchor CLI is available */
  isAvailable(): Promise<boolean>

  /** Get zone hierarchy */
  getZoneHierarchy(): ZoneHierarchy
}

export interface ValidationResult {
  status: 'VALID' | 'DRIFT' | 'DECEPTIVE'
  checks: {
    relevance: { passed: boolean; reason: string }
    hierarchy: { passed: boolean; reason: string }
    rules: { passed: boolean; reason: string }
  }
  requiredZone: Zone
  citedZone: Zone | null
  correction?: string
}

export type Zone = 'critical' | 'elevated' | 'standard' | 'local'

export const ZONE_HIERARCHY: Zone[] = ['critical', 'elevated', 'standard', 'local']

export function createAnchorClient(config?: AnchorClientConfig): AnchorClient
```

#### 4.2.2 IPC Protocol

```typescript
// Request (written to grimoires/pub/requests/{id}.json)
interface AnchorRequest {
  id: string
  type: 'anchor:validate'
  timestamp: number
  payload: {
    statement: string
    zone?: Zone
  }
}

// Response (read from grimoires/pub/responses/anchor-{id}.json)
interface AnchorResponse {
  requestId: string
  status: 'success' | 'error'
  timestamp: number
  data?: ValidationResult
  error?: string
  exitCode?: number
}
```

### 4.3 TypeScript Package: `@sigil/fork`

**Purpose:** Fork chain state for local testing.

**Location:** `packages/fork/`

#### 4.3.1 Public API

```typescript
// packages/fork/src/index.ts

export type ForkProvider = 'anvil' | 'tenderly' | 'custom'

export interface ForkConfig {
  provider: ForkProvider
  forkUrl: string
  forkBlockNumber?: bigint
  chainId: number
  anvilPort?: number
  tenderlyProject?: string
  tenderlyApiKey?: string
}

export interface ForkState {
  active: boolean
  rpcUrl: string | null
  blockNumber: bigint | null
  chainId: number | null
  createdAt: number | null
  snapshotCount: number
  currentSnapshotId: string | null
}

export interface ForkSnapshot {
  id: string
  blockNumber: bigint
  timestamp: number
  description?: string
}

export interface ForkService {
  createFork(config: ForkConfig): Promise<ForkState>
  getState(): ForkState
  snapshot(description?: string): Promise<ForkSnapshot>
  revert(snapshotId: string): Promise<boolean>
  reset(): Promise<void>
  destroy(): Promise<void>
  setBalance(address: Address, balance: bigint): Promise<void>
  impersonateAccount(address: Address): Promise<void>
  stopImpersonating(address: Address): Promise<void>
  mineBlock(blocks?: number): Promise<void>
  getRpcUrl(): string | null
}

export function createForkService(provider: ForkProvider): ForkService
export function createAnvilForkService(): ForkService
export function createTenderlyForkService(): ForkService
```

### 4.4 TypeScript Package: `@sigil/simulation`

**Purpose:** Transaction simulation against forks.

**Location:** `packages/simulation/`

**Depends on:** `@sigil/fork`

#### 4.4.1 Public API

```typescript
// packages/simulation/src/index.ts

export interface SimulationRequest {
  from: Address
  to: Address
  value?: bigint
  data?: Hex
  gas?: bigint
  gasPrice?: bigint
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
  nonce?: number
}

export interface SimulationResult {
  success: boolean
  hash?: Hash
  gasUsed: bigint
  gasLimit: bigint
  effectiveGasPrice: bigint
  totalCost: bigint
  returnValue?: Hex
  revertReason?: string
  balanceChanges: BalanceChange[]
  stateChanges: StateChange[]
  logs: SimulationLog[]
  blockNumber: bigint
  timestamp: number
}

export interface BalanceChange {
  address: Address
  token: Address | null
  symbol?: string
  before: bigint
  after: bigint
  delta: bigint
}

export interface SimulationService {
  simulate(tx: SimulationRequest): Promise<SimulationResult>
  estimateGas(tx: SimulationRequest): Promise<bigint>
  getGasPrice(): Promise<bigint>
  decodeRevertReason(data: Hex): string | null
}

export function createSimulationService(forkService: ForkService): SimulationService
```

#### 4.4.2 Impersonation Cleanup Fix (FR-006)

```typescript
// packages/simulation/src/service.ts

async simulate(tx: SimulationRequest): Promise<SimulationResult> {
  const snapshot = await forkService.snapshot('pre-simulation')

  try {
    await forkService.impersonateAccount(tx.from)
    // ... simulation logic ...
    return result
  } catch (error) {
    // ... error handling ...
    throw error
  } finally {
    // ALWAYS cleanup impersonation (FR-006 fix)
    try {
      await forkService.stopImpersonating(tx.from)
    } catch {
      // Ignore cleanup errors
    }
    // Revert to snapshot
    await forkService.revert(snapshot.id)
  }
}
```

### 4.5 TypeScript Package: `@sigil/lens`

**Purpose:** Address impersonation for testing different user states.

**Location:** `packages/lens/`

#### 4.5.1 Public API

```typescript
// packages/lens/src/index.ts

export interface LensState {
  enabled: boolean
  impersonatedAddress: Address | null
  realAddress: Address | null
  savedAddresses: SavedAddress[]
}

export interface SavedAddress {
  address: Address
  label: string
  addedAt: number
}

export interface LensContext {
  isImpersonating: boolean
  impersonatedAddress: Address | null
  realAddress: Address | null
}

export interface LensService {
  getState(): LensState
  setImpersonatedAddress(address: Address): void
  clearImpersonation(): void
  saveAddress(entry: Omit<SavedAddress, 'addedAt'>): void
  removeAddress(address: Address): void
  getContext(): LensContext
}

export function createLensService(): LensService

// React hooks
export function useLens(): LensState
export function useLensContext(): LensContext
export function useIsImpersonating(): boolean
export function useImpersonatedAddress(): Address | null
```

### 4.6 TypeScript Package: `@sigil/diagnostics`

**Purpose:** Physics compliance checking and issue detection.

**Location:** `packages/diagnostics/`

**Depends on:** `@sigil/anchor`

#### 4.6.1 Public API

```typescript
// packages/diagnostics/src/index.ts

export interface DiagnosticResult {
  component: string
  effect: EffectType
  issues: DiagnosticIssue[]
  compliance: ComplianceResult
  suggestions: string[]
}

export interface DiagnosticIssue {
  severity: 'error' | 'warning' | 'info'
  code: string
  message: string
  location?: {
    file?: string
    line?: number
    column?: number
  }
}

export interface ComplianceResult {
  behavioral: {
    sync: 'optimistic' | 'pessimistic' | 'immediate'
    timing: number
    confirmation: boolean
    compliant: boolean
  }
  animation: {
    easing: string
    duration: number
    compliant: boolean
  }
  material: {
    surface: string
    shadow: string
    compliant: boolean
  }
}

export type EffectType =
  | 'financial'
  | 'destructive'
  | 'soft-delete'
  | 'standard'
  | 'local'
  | 'navigation'
  | 'query'

export interface DiagnosticsService {
  analyze(component: string, code?: string): Promise<DiagnosticResult>
  checkCompliance(effect: EffectType, physics: Partial<ComplianceResult>): boolean
  detectEffect(keywords: string[], types?: string[]): EffectType
}

export function createDiagnosticsService(anchorClient?: AnchorClient): DiagnosticsService
```

### 4.7 TypeScript Package: `@sigil/hud`

**Purpose:** React components composing all other packages.

**Location:** `packages/hud/`

**Depends on:** All other packages (optional)

#### 4.7.1 Public API

```typescript
// packages/hud/src/index.ts

// Core HUD
export { HudProvider, useHud, type HudProviderProps } from './providers/HudProvider'
export { HudPanel, type HudPanelProps } from './components/HudPanel'
export { HudTrigger, type HudTriggerProps } from './components/HudTrigger'

// Optional integrations (gracefully degrade if packages not installed)
export { LensPanel } from './components/LensPanel'
export { SimulationPanel } from './components/SimulationPanel'
export { DiagnosticsPanel } from './components/DiagnosticsPanel'
export { StateComparison } from './components/StateComparison'

// Hooks
export { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
export { useObservationCapture } from './hooks/useObservationCapture'
export { useSignalCapture } from './hooks/useSignalCapture'

// Types
export type { HudConfig, HudState, Observation, Signal } from './types'
```

#### 4.7.2 Provider Configuration

```typescript
// packages/hud/src/providers/HudProvider.tsx

export interface HudProviderProps {
  children: React.ReactNode
  config?: HudConfig

  // Optional package instances (for composition)
  lensService?: LensService
  forkService?: ForkService
  simulationService?: SimulationService
  diagnosticsService?: DiagnosticsService
  anchorClient?: AnchorClient
}

export interface HudConfig {
  /** Enable keyboard shortcuts */
  shortcuts?: boolean
  /** Default panel position */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  /** Persist panel state to localStorage */
  persist?: boolean
  /** Enable observation capture */
  observationCapture?: boolean
  /** Enable signal capture */
  signalCapture?: boolean
}
```

#### 4.7.3 Conditional Hook Fix (FR-005)

```typescript
// packages/hud/src/components/LensPanel.tsx

export function LensPanel() {
  // CORRECT: All hooks called unconditionally at top level (FR-005 fix)
  const { lensService } = useHud()
  const state = lensService?.getState() ?? DEFAULT_LENS_STATE
  const isImpersonating = state.enabled && state.impersonatedAddress !== null

  // Can safely use state values in conditional rendering
  return (
    <div className="sigil-lens-panel">
      {/* ... */}
      {isImpersonating && (
        <div className="sigil-lens-panel__active">
          <code>{state.impersonatedAddress}</code>  {/* Use extracted value */}
        </div>
      )}
    </div>
  )
}
```

---

## 5. Data Architecture

### 5.1 IPC Request/Response Schema

#### 5.1.1 Base Types

```typescript
// Shared across all packages

interface BaseRequest<T = unknown> {
  id: string              // UUID v4
  type: IPCRequestType    // 'anchor:validate' | 'lens:verify' | ...
  timestamp: number       // Unix timestamp (ms)
  payload: T
}

interface BaseResponse<T = unknown> {
  requestId: string       // Matches request ID
  status: 'success' | 'error' | 'timeout'
  timestamp: number       // Unix timestamp (ms)
  data?: T                // Present if success
  error?: string          // Present if error
  exitCode?: number       // CLI exit code
}

type IPCRequestType =
  | 'anchor:validate'
  | 'anchor:session'
  | 'lens:verify'
  | 'lens:lint'
  | 'fork:snapshot'
```

#### 5.1.2 Lens Verify Response

```typescript
interface LensVerifyResponse {
  valid: boolean
  constraints: ConstraintResult[]
  metrics: {
    linesOfCode: number
    cyclomaticComplexity: number
    eventHandlerCount: number
    stateVariableCount: number
  }
  summary: string
}

interface ConstraintResult {
  name: string
  expression: string
  passed: boolean
  actual: unknown
  expected: unknown
  message?: string
}
```

### 5.2 Observation Schema

```typescript
// grimoires/sigil/observations/{timestamp}-{id}.md

interface Observation {
  id: string
  timestamp: string       // ISO 8601
  type: 'user-truth' | 'issue' | 'insight'
  content: string
  tags: string[]
  context?: {
    component?: string
    effect?: EffectType
    lensAddress?: Address
    screenshot?: string   // Relative path to screenshot
  }
  linkedSignals?: string[]  // Signal IDs
}
```

### 5.3 Signal Schema Extension

```typescript
// grimoires/sigil/taste.md (append-only YAML frontmatter entries)

interface TasteSignal {
  timestamp: string
  signal: 'ACCEPT' | 'MODIFY' | 'REJECT'
  source: 'cli' | 'toolbar' | 'hud'  // NEW: 'hud' source
  component: {
    name: string
    effect: EffectType
    craft_type: 'generate' | 'diagnose' | 'repair'
  }
  physics?: {
    behavioral?: { sync: string; timing: string; confirmation: string }
    animation?: { easing: string; duration: string }
    material?: { surface: string; shadow: string; radius: string }
  }
  hud_context?: {  // NEW: HUD-specific context
    panel_visible: boolean
    diagnostics_shown: boolean
    observation_linked?: string
  }
  diagnostic?: DiagnosticContext
  change?: { from: string; to: string }
  learning?: { inference: string; recommendation?: string }
  rejection_reason?: string
}
```

---

## 6. API Design

### 6.1 Package Entry Points

| Package | Entry Point | Size Budget |
|---------|-------------|-------------|
| `@sigil/anchor` | `packages/anchor/src/index.ts` | <20KB |
| `@sigil/fork` | `packages/fork/src/index.ts` | <30KB |
| `@sigil/simulation` | `packages/simulation/src/index.ts` | <25KB |
| `@sigil/lens` | `packages/lens/src/index.ts` | <15KB |
| `@sigil/diagnostics` | `packages/diagnostics/src/index.ts` | <20KB |
| `@sigil/hud` | `packages/hud/src/index.ts` | <50KB |

### 6.2 React Hook Patterns

```typescript
// Consistent hook pattern across packages

// 1. Service hooks return the service instance
function useForkService(): ForkService | null

// 2. State hooks return reactive state
function useForkState(): ForkState

// 3. Derived hooks return computed values
function useIsForkActive(): boolean

// 4. Action hooks return callbacks
function useCreateFork(): (config: ForkConfig) => Promise<ForkState>
```

### 6.3 Error Handling

```typescript
// Consistent error types across packages

class SigilError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true
  ) {
    super(message)
    this.name = 'SigilError'
  }
}

// Package-specific errors
class AnchorError extends SigilError { name = 'AnchorError' }
class ForkError extends SigilError { name = 'ForkError' }
class SimulationError extends SigilError { name = 'SimulationError' }
class LensError extends SigilError { name = 'LensError' }
class DiagnosticsError extends SigilError { name = 'DiagnosticsError' }

// Error codes
const ErrorCodes = {
  // Anchor
  ANCHOR_NOT_AVAILABLE: 'ANCHOR_NOT_AVAILABLE',
  ANCHOR_VALIDATION_FAILED: 'ANCHOR_VALIDATION_FAILED',

  // Fork
  FORK_NOT_ACTIVE: 'FORK_NOT_ACTIVE',
  FORK_CONNECTION_FAILED: 'FORK_CONNECTION_FAILED',

  // Simulation
  SIMULATION_FAILED: 'SIMULATION_FAILED',
  IMPERSONATION_FAILED: 'IMPERSONATION_FAILED',

  // IPC
  IPC_TIMEOUT: 'IPC_TIMEOUT',
  IPC_REQUEST_NOT_FOUND: 'IPC_REQUEST_NOT_FOUND',
} as const
```

---

## 7. Security Architecture

### 7.1 IPC Security

| Concern | Mitigation |
|---------|------------|
| Path traversal | UUID validation, no user-controlled paths |
| File size limits | 1MB max request size |
| Stale files | Auto-cleanup after 1 hour TTL |
| Race conditions | Advisory file locking (fs2) |

### 7.2 Fork Security

| Concern | Mitigation |
|---------|------------|
| Real transactions | Fork is isolated, no mainnet writes |
| Impersonation leaks | Cleanup in finally block (FR-006) |
| API key exposure | Environment variables, not config |

### 7.3 Input Validation

```typescript
// All user inputs validated before use

function validateAddress(input: string): Address {
  if (!isAddress(input)) {
    throw new LensError('Invalid address', 'INVALID_ADDRESS')
  }
  return input as Address
}

function validateRequestId(id: string): void {
  // Must be valid UUID v4
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    throw new SigilError('Invalid request ID', 'INVALID_REQUEST_ID')
  }
}
```

---

## 8. Integration Points

### 8.1 CLI Integration

| CLI | Command | IPC Type | Package |
|-----|---------|----------|---------|
| `anchor` | `warden` | `anchor:validate` | `@sigil/anchor` |
| `anchor` | `session` | `anchor:session` | `@sigil/fork` |
| `lens` | `verify` | `lens:verify` | `@sigil/diagnostics` |
| `lens` | `lint` | `lens:lint` | `@sigil/diagnostics` |

### 8.2 Viem/Wagmi Integration

```typescript
// packages/lens/src/wagmi.ts

import { useAccount } from 'wagmi'

/**
 * Lens-aware version of useAccount that returns impersonated address
 * when lens is active, real address otherwise
 */
export function useLensAwareAccount() {
  const { address: realAddress } = useAccount()
  const { impersonatedAddress, isImpersonating } = useLens()

  return {
    address: isImpersonating ? impersonatedAddress : realAddress,
    realAddress,
    isImpersonating,
  }
}
```

### 8.3 Taste.md Integration

```typescript
// packages/hud/src/hooks/useSignalCapture.ts

export function useSignalCapture() {
  const appendSignal = useCallback(async (signal: Omit<TasteSignal, 'timestamp'>) => {
    const entry: TasteSignal = {
      ...signal,
      timestamp: new Date().toISOString(),
      source: 'hud',
    }

    // Append to taste.md via file write
    // In browser: POST to dev server endpoint
    // In Node: Direct file append
    await appendToTasteLog(entry)
  }, [])

  return { appendSignal }
}
```

---

## 9. Scalability & Performance

### 9.1 Bundle Size Budget

| Package | Budget | Strategy |
|---------|--------|----------|
| `@sigil/anchor` | <20KB | Minimal deps, tree-shakeable |
| `@sigil/fork` | <30KB | Viem as peer dep |
| `@sigil/simulation` | <25KB | Reuse fork's viem |
| `@sigil/lens` | <15KB | Zustand for state |
| `@sigil/diagnostics` | <20KB | Lazy load rules |
| `@sigil/hud` | <50KB | Code split panels |

### 9.2 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| HUD initial render | <100ms | Lighthouse |
| Diagnostic update | <50ms | Performance.now() |
| IPC round-trip | <200ms | CLI timing |
| Fork creation | <2s | CLI timing |

### 9.3 Optimization Strategies

1. **Lazy Loading:** Panels loaded on first open
2. **Memoization:** Expensive computations cached
3. **Debouncing:** State updates batched
4. **Tree Shaking:** ESM exports, sideEffects: false

---

## 10. Deployment Architecture

### 10.1 Monorepo Structure

```
sigil/
├── packages/
│   ├── anchor/           # @sigil/anchor
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── fork/             # @sigil/fork
│   ├── simulation/       # @sigil/simulation
│   ├── lens/             # @sigil/lens
│   ├── diagnostics/      # @sigil/diagnostics
│   └── hud/              # @sigil/hud
├── anchor-rust/
│   ├── sigil-ipc/        # Shared Rust crate (NEW)
│   ├── anchor/
│   └── lens/
├── pnpm-workspace.yaml
└── package.json
```

### 10.2 pnpm Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

### 10.3 Package.json Structure

```json
// packages/hud/package.json
{
  "name": "@sigil/hud",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "peerDependencies": {
    "react": ">=18.0.0"
  },
  "optionalDependencies": {
    "@sigil/anchor": "workspace:*",
    "@sigil/fork": "workspace:*",
    "@sigil/simulation": "workspace:*",
    "@sigil/lens": "workspace:*",
    "@sigil/diagnostics": "workspace:*"
  },
  "devDependencies": {
    "@sigil/anchor": "workspace:*",
    "@sigil/fork": "workspace:*",
    "@sigil/simulation": "workspace:*",
    "@sigil/lens": "workspace:*",
    "@sigil/diagnostics": "workspace:*"
  }
}
```

---

## 11. Development Workflow

### 11.1 Build Order

```bash
# Dependencies must build first
pnpm --filter @sigil/anchor build
pnpm --filter @sigil/fork build
pnpm --filter @sigil/lens build
pnpm --filter @sigil/simulation build  # depends on fork
pnpm --filter @sigil/diagnostics build # depends on anchor
pnpm --filter @sigil/hud build         # depends on all
```

### 11.2 Testing Strategy

| Type | Tool | Coverage Target |
|------|------|-----------------|
| Unit | Vitest | 80% |
| Integration | Vitest + MSW | Key flows |
| E2E | Playwright | Critical paths |

### 11.3 Type Checking

```bash
# Check all packages
pnpm -r typecheck

# Check single package
pnpm --filter @sigil/hud typecheck
```

---

## 12. Technical Risks & Mitigation

### 12.1 Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Package split complexity | Medium | Medium | Strong docs, clear APIs, comprehensive types |
| IPC backward compatibility | Low | High | Version headers, graceful fallbacks |
| Bundle size creep | Medium | Medium | Size budget enforcement, bundlesize CI check |
| React version conflicts | Low | Medium | Peer dependencies, version range testing |

### 12.2 Backward Compatibility

The IPC protocol change (prefixed response files) requires backward compatibility:

```typescript
// packages/anchor/src/ipc-client.ts

async function readResponse<T>(requestId: string): Promise<T> {
  // Try new prefixed format first
  const prefixedPath = `grimoires/pub/responses/anchor-${requestId}.json`
  if (await fileExists(prefixedPath)) {
    return readJson(prefixedPath)
  }

  // Fall back to old format for transition period
  const oldPath = `grimoires/pub/responses/${requestId}.json`
  if (await fileExists(oldPath)) {
    console.warn('Using deprecated response path format')
    return readJson(oldPath)
  }

  throw new AnchorError('Response not found', 'RESPONSE_NOT_FOUND')
}
```

---

## 13. Future Considerations

### 13.1 Planned Enhancements (Not in Scope)

- Tenderly trace visualization
- Viem/Wagmi higher-order hooks
- Browser extension packaging
- Production monitoring mode
- Real-time WebSocket IPC

### 13.2 Technical Debt Management

| Area | Debt | Plan |
|------|------|------|
| Old toolbar package | Will be deprecated | Migrate users to @sigil/hud |
| Unprefixed responses | Backward compat code | Remove after 2 releases |
| Singleton services | Global state | Convert to context providers |

---

## 14. Appendix

### 14.1 Sprint 0 Bug Fixes Summary

| FR | Bug | Solution | Effort |
|----|-----|----------|--------|
| FR-001 | Response file collision | `sigil-ipc` crate with CLI prefix | Small |
| FR-002 | Lint stub | Remove or implement | Medium |
| FR-003 | Verify response persistence | Always write when request_id present | Small |
| FR-004 | Double-counting handlers | Count in `jsx_attribute` only | Small |
| FR-005 | Conditional hook call | Extract hook to top level | Small |
| FR-006 | Impersonation cleanup | Move to finally block | Small |

### 14.2 Package Size Estimates

| Package | Dependencies | Estimated Size |
|---------|--------------|----------------|
| `@sigil/anchor` | uuid | ~15KB |
| `@sigil/fork` | viem (peer) | ~25KB |
| `@sigil/simulation` | @sigil/fork | ~20KB |
| `@sigil/lens` | zustand, viem (peer) | ~12KB |
| `@sigil/diagnostics` | @sigil/anchor | ~18KB |
| `@sigil/hud` | react (peer), zustand | ~45KB |

### 14.3 File Path Summary

```
grimoires/pub/
├── requests/{uuid}.json
├── responses/
│   ├── anchor-{uuid}.json
│   └── lens-{uuid}.json
├── vocabulary.yaml
├── zones.yaml
└── constraints.yaml

grimoires/sigil/
├── taste.md
├── observations/
│   └── {timestamp}-{id}.md
└── screenshots/
    └── {component}-{timestamp}.png
```

---

*SDD generated via Loa /architect command. Implements PRD prd-sigil-hud.md.*
