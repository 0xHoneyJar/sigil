# SDD: Sigil /craft Optimization & Dev Toolbar

**Version:** 1.0.0
**Status:** Draft
**Created:** 2026-01-20
**PRD Reference:** `grimoires/loa/prd-craft-optimization.md` v1.1.0

---

## 1. System Overview

### 1.1 Architecture Summary

This SDD defines the technical design for optimizing the `/craft` command and integrating the Sigil Dev Toolbar with the Anchor/Lens verification backbone.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SIGIL STACK (Technical)                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ COMMANDS LAYER                                                   │   │
│  │ .claude/commands/ + .claude/skills/                              │   │
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │   │
│  │ │ /craft   │ │ /observe │ │ /ward    │ │ /style   │            │   │
│  │ │ (split)  │ │          │ │          │ │          │            │   │
│  │ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘            │   │
│  └──────┼────────────┼────────────┼────────────┼──────────────────┘   │
│         └────────────┴────────────┴────────────┘                       │
│                                  │                                      │
│                                  ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ DEV TOOLBAR LAYER                                                │   │
│  │ @sigil/dev-toolbar (React package)                               │   │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │   │
│  │ │UserLens │ │AgentSim │ │StateDiff│ │Diagnose │ │PhysicsHUD│   │   │
│  │ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘    │   │
│  └──────┼───────────┼───────────┼───────────┼───────────┼─────────┘   │
│         └───────────┴───────────┴───────────┴───────────┘              │
│                                  │                                      │
│                                  ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ VERIFICATION LAYER                                               │   │
│  │ anchor-rust/ (Rust CLIs)                                         │   │
│  │ ┌───────────────────────┐    ┌───────────────────────┐          │   │
│  │ │ ANCHOR                │    │ LENS                  │          │   │
│  │ │ • ValidateZone        │    │ • Verify (CEL)        │          │   │
│  │ │ • CheckSource         │    │ • Lint (Tree-sitter)  │          │   │
│  │ │ • LensContext (NEW)   │    │ • Correction          │          │   │
│  │ └───────────┬───────────┘    └───────────┬───────────┘          │   │
│  └─────────────┼────────────────────────────┼──────────────────────┘   │
│                └────────────┬───────────────┘                          │
│                             ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ IPC LAYER                                                        │   │
│  │ grimoires/pub/                                                   │   │
│  │ ├── requests/{uuid}.json   (Toolbar/Commands → CLIs)             │   │
│  │ └── responses/{uuid}.json  (CLIs → Toolbar/Commands)             │   │
│  └─────────────────────────┬───────────────────────────────────────┘   │
│                            │                                            │
│                            ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ LEARNING LAYER                                                   │   │
│  │ grimoires/sigil/taste.md                                         │   │
│  │ • ACCEPT/MODIFY/REJECT signals                                   │   │
│  │ • lens_address, screenshot_ref extensions                        │   │
│  │ • Pattern detection for auto-adjustments                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Progressive Disclosure** | Mode-based command loading, fragment system |
| **Verification Backbone** | All toolbar actions flow through Anchor/Lens |
| **Single Source of Truth** | IPC via `pub/` directory, learning via `taste.md` |
| **Graceful Degradation** | ck fallback to grep, toolbar optional in production |
| **Token Efficiency** | RLM triggers, skip-on-continuation, fragments |

---

## 2. Component Design

### 2.1 craft.md Split Strategy

#### 2.1.1 Directory Structure

```
.claude/skills/crafting-physics/
├── index.yaml              # Mode routing metadata
├── SKILL.md                # Tier 0: Quick reference (~500 tokens)
├── modes/
│   ├── chisel.md           # Tier 1: Default single-component (~2,500 tokens)
│   ├── hammer.md           # Tier 2: Multi-file batch (~4,000 tokens)
│   └── debug.md            # Tier 3: Diagnostic mode (~3,500 tokens)
└── fragments/
    ├── physics-table.md    # Reusable: Effect → Physics mapping
    ├── protected-caps.md   # Reusable: Protected capabilities checklist
    ├── feedback-loop.md    # Reusable: Taste signal collection
    └── detection.md        # Reusable: Effect detection algorithm
```

#### 2.1.2 Mode Router Schema (`index.yaml`)

```yaml
# .claude/skills/crafting-physics/index.yaml
name: crafting-physics
version: 1.0.0
description: Generate UI components with correct design physics

# Token budgets
token_budget:
  tier_0: 500      # SKILL.md only
  tier_1: 3000     # chisel.md + fragments
  tier_2: 5000     # hammer.md + fragments
  tier_3: 4000     # debug.md + fragments

# Mode definitions
modes:
  - name: quick
    tier: 0
    file: SKILL.md
    triggers:
      - pattern: "1-3 line"
      - pattern: "single edit"
      - pattern: "quick fix"
    description: "Minimal edits, no physics analysis"

  - name: chisel
    tier: 1
    file: modes/chisel.md
    default: true
    triggers:
      - pattern: "button|form|dialog|modal"
      - pattern: "component"
      - effect: ["Financial", "Destructive", "Standard"]
    fragments:
      - physics-table
      - protected-caps
      - feedback-loop
    description: "Single component with full physics"

  - name: hammer
    tier: 2
    file: modes/hammer.md
    triggers:
      - pattern: "multiple files"
      - pattern: "batch"
      - pattern: "autonomous"
      - pattern: "refactor"
    fragments:
      - physics-table
      - protected-caps
    description: "Multi-file autonomous work"

  - name: debug
    tier: 3
    file: modes/debug.md
    triggers:
      - condition: "iteration >= 3"
      - pattern: "debug|diagnose|investigate"
      - pattern: "not working|broken"
    fragments:
      - detection
      - feedback-loop
    description: "Diagnostic and loop recovery"

# Fragment definitions
fragments:
  physics-table:
    file: fragments/physics-table.md
    tokens: 400
    inline: true  # Can be embedded directly

  protected-caps:
    file: fragments/protected-caps.md
    tokens: 300
    inline: true

  feedback-loop:
    file: fragments/feedback-loop.md
    tokens: 250
    inline: true

  detection:
    file: fragments/detection.md
    tokens: 350
    inline: true

# Skip on continuation (saves tokens)
continuation:
  skip_if_loaded:
    - physics-table
    - protected-caps
  always_load:
    - feedback-loop  # Need for signal collection
```

#### 2.1.3 Mode Selection Algorithm

```python
def select_craft_mode(user_input: str, session_state: SessionState) -> Mode:
    """
    Select the appropriate craft mode based on input and session state.

    Priority:
    1. Debug mode if iteration >= 3 or explicit debug keywords
    2. Hammer mode if multi-file keywords detected
    3. Quick mode if simple edit keywords
    4. Chisel mode (default)
    """

    # Check debug triggers first (highest priority)
    if session_state.iteration >= 3:
        return Mode.DEBUG
    if matches_pattern(user_input, ["debug", "diagnose", "investigate", "not working"]):
        return Mode.DEBUG

    # Check hammer triggers
    if matches_pattern(user_input, ["multiple files", "batch", "autonomous", "refactor"]):
        return Mode.HAMMER

    # Check quick triggers
    if matches_pattern(user_input, ["1-3 line", "single edit", "quick fix"]):
        return Mode.QUICK

    # Default to chisel
    return Mode.CHISEL


def load_mode_context(mode: Mode, session_state: SessionState) -> str:
    """
    Load mode file and required fragments, skipping already-loaded content.
    """
    context_parts = []

    # Load main mode file
    mode_file = get_mode_file(mode)
    context_parts.append(read_file(mode_file))

    # Load fragments (skip if continuation and already loaded)
    for fragment_name in mode.fragments:
        fragment = get_fragment(fragment_name)

        if session_state.is_continuation and fragment_name in session_state.loaded_fragments:
            continue  # Skip already-loaded fragment

        if fragment.inline:
            context_parts.append(read_file(fragment.file))

        session_state.loaded_fragments.add(fragment_name)

    return "\n\n".join(context_parts)
```

#### 2.1.4 Fragment Embedding Syntax

Fragments can be referenced in mode files using template syntax:

```markdown
# chisel.md

## Physics Reference

{{fragment:physics-table}}

## Protected Capabilities

{{fragment:protected-caps}}
```

The mode loader replaces `{{fragment:name}}` with the fragment content at load time.

---

### 2.2 Dev Toolbar Package

#### 2.2.1 Package Structure

```
packages/sigil-dev-toolbar/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                    # Public exports
│   ├── components/
│   │   ├── DevToolbar.tsx          # Main container
│   │   ├── UserLens.tsx            # Address impersonation panel
│   │   ├── AgentSimulation.tsx     # Transaction dry-run panel
│   │   ├── StateComparison.tsx     # Diff view panel
│   │   ├── DiagnosticPanel.tsx     # Query-first diagnostics
│   │   ├── PhysicsOverlay.tsx      # Physics HUD on components
│   │   └── common/
│   │       ├── Panel.tsx           # Collapsible panel wrapper
│   │       ├── Badge.tsx           # Status badges
│   │       └── DiffView.tsx        # Generic diff component
│   ├── hooks/
│   │   ├── useUserLens.ts          # Impersonation state
│   │   ├── useSimulation.ts        # Fork + simulate
│   │   ├── useStateComparison.ts   # React Query cache diff
│   │   ├── useAnchorValidation.ts  # Anchor pub/ IPC
│   │   └── useLensVerification.ts  # Lens pub/ IPC
│   ├── providers/
│   │   ├── DevToolbarProvider.tsx  # Context provider
│   │   └── LensAwareProvider.tsx   # Wagmi override for lens
│   ├── ipc/
│   │   ├── pubDirectory.ts         # Read/write grimoires/pub/
│   │   ├── anchorClient.ts         # Anchor CLI wrapper
│   │   └── lensClient.ts           # Lens CLI wrapper
│   └── types/
│       ├── index.ts
│       ├── lens.ts                 # LensContext types
│       └── simulation.ts           # Simulation result types
├── tests/
│   └── ...
└── README.md
```

#### 2.2.2 Core Types

```typescript
// src/types/lens.ts

/**
 * Context for User Lens address impersonation.
 * Passed to Anchor for data source validation.
 */
export interface LensContext {
  /** The impersonated address (what we're viewing as) */
  impersonatedAddress: `0x${string}`;

  /** Component being inspected */
  component: string;

  /** Value currently shown in UI */
  observedValue?: string;

  /** Value from on-chain RPC */
  onChainValue?: string;

  /** Value from indexer (Envio, etc.) */
  indexedValue?: string;
}

/**
 * State for the User Lens feature.
 */
export interface UserLensState {
  /** Whether impersonation is active */
  enabled: boolean;

  /** The address being impersonated */
  impersonatedAddress: `0x${string}` | null;

  /** The real connected wallet address */
  realAddress: `0x${string}` | null;

  /** Saved addresses for quick-select */
  savedAddresses: SavedAddress[];
}

export interface SavedAddress {
  address: `0x${string}`;
  label: string;
  ens?: string;
}


// src/types/simulation.ts

/**
 * Result of a transaction simulation.
 */
export interface SimulationResult {
  /** Whether the transaction would succeed */
  success: boolean;

  /** Gas used by the simulation */
  gasUsed: bigint;

  /** Estimated gas for actual execution */
  gasEstimate: bigint;

  /** State changes caused by the transaction */
  stateChanges: StateChange[];

  /** Token balance changes */
  balanceDeltas: BalanceDelta[];

  /** Event logs emitted */
  logs: SimulationLog[];

  /** Error message if simulation failed */
  error?: string;

  /** Revert reason if applicable */
  revertReason?: string;
}

export interface StateChange {
  contract: `0x${string}`;
  slot: string;
  previousValue: string;
  newValue: string;
  label?: string;  // Human-readable label if known
}

export interface BalanceDelta {
  token: `0x${string}` | 'native';
  symbol: string;
  previousBalance: bigint;
  newBalance: bigint;
  delta: bigint;
}

export interface SimulationLog {
  address: `0x${string}`;
  topics: string[];
  data: string;
  decoded?: DecodedLog;
}
```

#### 2.2.3 DevToolbarProvider

```tsx
// src/providers/DevToolbarProvider.tsx

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { UserLensState, LensContext } from '../types';

interface DevToolbarContextValue {
  // User Lens
  userLens: UserLensState;
  enableLens: (address: `0x${string}`) => void;
  disableLens: () => void;

  // Simulation
  simulationEnabled: boolean;
  setSimulationEnabled: (enabled: boolean) => void;

  // State Comparison
  comparisonEnabled: boolean;
  setComparisonEnabled: (enabled: boolean) => void;

  // IPC
  sendToAnchor: (request: AnchorRequest) => Promise<AnchorResponse>;
  sendToLens: (request: LensRequest) => Promise<LensResponse>;

  // Learning
  logToTaste: (signal: TasteSignal) => Promise<void>;
}

const DevToolbarContext = createContext<DevToolbarContextValue | null>(null);

export function DevToolbarProvider({
  children,
  pubDirectory = 'grimoires/pub',
  tasteFile = 'grimoires/sigil/taste.md',
}: DevToolbarProviderProps) {
  const [userLens, setUserLens] = useState<UserLensState>({
    enabled: false,
    impersonatedAddress: null,
    realAddress: null,
    savedAddresses: [],
  });

  const [simulationEnabled, setSimulationEnabled] = useState(false);
  const [comparisonEnabled, setComparisonEnabled] = useState(false);

  // Get real wallet address from wagmi
  const { address: realAddress } = useAccount();

  const enableLens = useCallback((address: `0x${string}`) => {
    setUserLens(prev => ({
      ...prev,
      enabled: true,
      impersonatedAddress: address,
      realAddress,
    }));
  }, [realAddress]);

  const disableLens = useCallback(() => {
    setUserLens(prev => ({
      ...prev,
      enabled: false,
      impersonatedAddress: null,
    }));
  }, []);

  // IPC with Anchor/Lens CLIs via pub/ directory
  const sendToAnchor = useCallback(async (request: AnchorRequest) => {
    const requestId = crypto.randomUUID();
    const requestPath = `${pubDirectory}/requests/${requestId}.json`;
    const responsePath = `${pubDirectory}/responses/${requestId}-anchor.json`;

    // Write request
    await writeFile(requestPath, JSON.stringify(request));

    // Invoke Anchor CLI
    await execAsync(`anchor validate --request ${requestId}`);

    // Read response
    const response = await readFile(responsePath);
    return JSON.parse(response);
  }, [pubDirectory]);

  const sendToLens = useCallback(async (request: LensRequest) => {
    const requestId = crypto.randomUUID();
    const requestPath = `${pubDirectory}/requests/${requestId}.json`;
    const responsePath = `${pubDirectory}/responses/${requestId}-lens.json`;

    await writeFile(requestPath, JSON.stringify(request));
    await execAsync(`lens verify --request-id ${requestId}`);

    const response = await readFile(responsePath);
    return JSON.parse(response);
  }, [pubDirectory]);

  const logToTaste = useCallback(async (signal: TasteSignal) => {
    // Append YAML frontmatter signal to taste.md
    const yamlSignal = generateTasteYaml(signal, {
      lensAddress: userLens.impersonatedAddress,
    });

    await appendFile(tasteFile, yamlSignal);
  }, [tasteFile, userLens.impersonatedAddress]);

  return (
    <DevToolbarContext.Provider value={{
      userLens,
      enableLens,
      disableLens,
      simulationEnabled,
      setSimulationEnabled,
      comparisonEnabled,
      setComparisonEnabled,
      sendToAnchor,
      sendToLens,
      logToTaste,
    }}>
      {children}
    </DevToolbarContext.Provider>
  );
}

export function useDevToolbar() {
  const context = useContext(DevToolbarContext);
  if (!context) {
    throw new Error('useDevToolbar must be used within DevToolbarProvider');
  }
  return context;
}
```

#### 2.2.4 Lens-Aware Account Hook

```tsx
// src/hooks/useUserLens.ts

import { useAccount } from 'wagmi';
import { useDevToolbar } from '../providers/DevToolbarProvider';

/**
 * Hook that returns the effective account address.
 * When User Lens is enabled, returns the impersonated address for reads.
 * Always returns the real address for writes (signing).
 */
export function useLensAwareAccount() {
  const { address: realAddress, ...rest } = useAccount();
  const { userLens } = useDevToolbar();

  return {
    ...rest,
    // For reads: use impersonated address if lens enabled
    address: userLens.enabled ? userLens.impersonatedAddress : realAddress,
    // Always expose real address for signing
    realAddress,
    // Indicator for UI badges
    isImpersonating: userLens.enabled,
  };
}

/**
 * Hook to get the real wallet address (for signing transactions).
 * Use this for write operations that require the actual wallet.
 */
export function useRealAccount() {
  const { address, ...rest } = useAccount();
  return { address, ...rest };
}
```

---

### 2.3 Anchor LensContext Extension

#### 2.3.1 Request Schema Extension

```rust
// anchor-rust/anchor/src/types/request.rs

use serde::{Deserialize, Serialize};

/// Context from Dev Toolbar User Lens feature.
/// Used to validate data source discrepancies between observed and actual values.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LensContext {
    /// The impersonated address being viewed
    pub impersonated_address: String,

    /// Component being inspected
    pub component: String,

    /// Value currently shown in UI (may be stale or incorrect)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub observed_value: Option<String>,

    /// Value from on-chain RPC call
    #[serde(skip_serializing_if = "Option::is_none")]
    pub on_chain_value: Option<String>,

    /// Value from indexer (Envio, The Graph, etc.)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub indexed_value: Option<String>,
}

/// Extended ValidateZonePayload with optional LensContext
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidateZonePayload {
    /// Component name (e.g., "ClaimButton")
    pub component: String,

    /// Keywords detected in the component
    pub keywords: Vec<String>,

    /// Zone inferred by Sigil
    pub inferred_zone: Zone,

    /// Optional physics analysis from Sigil
    #[serde(default)]
    pub physics: Option<PhysicsAnalysis>,

    /// NEW: Optional lens context from Dev Toolbar
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub lens_context: Option<LensContext>,
}
```

#### 2.3.2 LensContext Validation Rules

```rust
// anchor-rust/anchor/src/commands/validate.rs

use crate::types::{LensContext, Zone, ExitCode};

/// Validation rules for LensContext data source checks
pub struct LensValidator;

impl LensValidator {
    /// Validate lens context and return any data source issues
    pub fn validate(
        lens_context: &LensContext,
        zone: &Zone,
    ) -> Vec<LensValidationIssue> {
        let mut issues = vec![];

        // Rule 1: Data source mismatch (observed != on-chain)
        if let (Some(observed), Some(on_chain)) =
            (&lens_context.observed_value, &lens_context.on_chain_value)
        {
            if observed != on_chain {
                issues.push(LensValidationIssue {
                    code: "data_source_mismatch",
                    severity: match zone {
                        Zone::Critical => IssueSeverity::Error,
                        _ => IssueSeverity::Warning,
                    },
                    message: format!(
                        "UI shows '{}', chain has '{}' for {}",
                        observed, on_chain, lens_context.component
                    ),
                    suggested_fix: Some(
                        "Switch from indexed to on-chain read for this value".to_string()
                    ),
                });
            }
        }

        // Rule 2: Stale indexed data (indexed != on-chain)
        if let (Some(indexed), Some(on_chain)) =
            (&lens_context.indexed_value, &lens_context.on_chain_value)
        {
            if indexed != on_chain {
                issues.push(LensValidationIssue {
                    code: "stale_indexed_data",
                    severity: IssueSeverity::Warning,
                    message: format!(
                        "Indexed data stale: '{}' vs on-chain '{}'",
                        indexed, on_chain
                    ),
                    suggested_fix: Some(
                        "Force refetch from indexer or use on-chain source".to_string()
                    ),
                });
            }
        }

        // Rule 3: Financial component must use on-chain source
        if *zone == Zone::Critical {
            if lens_context.on_chain_value.is_none()
               && lens_context.indexed_value.is_some()
            {
                issues.push(LensValidationIssue {
                    code: "lens_financial_check",
                    severity: IssueSeverity::Error,
                    message: format!(
                        "Financial component '{}' must use on-chain data source",
                        lens_context.component
                    ),
                    suggested_fix: Some(
                        "Use useReadContract instead of indexed query".to_string()
                    ),
                });
            }
        }

        issues
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LensValidationIssue {
    pub code: &'static str,
    pub severity: IssueSeverity,
    pub message: String,
    pub suggested_fix: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum IssueSeverity {
    Error,    // Exit code 10
    Warning,  // Exit code 11
    Info,     // Exit code 12
}
```

#### 2.3.3 Response Schema Extension

```rust
// anchor-rust/anchor/src/types/response.rs

/// Extended ValidateZoneResult with lens analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidateZoneResult {
    /// Whether the zone assignment is valid
    pub validated: bool,

    /// Exit code for the validation
    pub exit_code: ExitCode,

    /// Correct zone (if different from inferred)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub correct_zone: Option<Zone>,

    /// Warnings (for drift or deceptive zones)
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub warnings: Vec<String>,

    /// NEW: Lens validation issues (if lens_context provided)
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub lens_issues: Vec<LensValidationIssue>,
}
```

---

### 2.4 RLM Extension System

#### 2.4.1 Extension Path Configuration

```yaml
# .claude/rules/index.yaml (additions)

# Extension system for project-specific rules
extensions:
  # Auto-discover rules in project's grimoire
  - path: "grimoires/sigil/rules/*.md"
    priority: 5  # Lower than core (priority 1-4)
    auto_register: true

  # Optional override directory
  - path: ".claude/overrides/*.md"
    priority: 2  # Can override core rules
    auto_register: true

# Extension metadata schema
extension_schema:
  required:
    - name: string
    - triggers: array
  optional:
    - priority: number (default: 5)
    - phase: string (default: "post")
    - tokens: number (default: 500)

# Example project rule frontmatter:
# ---
# name: custom-web3-physics
# triggers:
#   - keywords: ["custom-protocol", "custom-token"]
#   - hooks: ["useCustomProtocol"]
# priority: 5
# tokens: 400
# ---
```

#### 2.4.2 Extension Discovery Algorithm

```python
def discover_extensions(config: RLMConfig) -> List[Rule]:
    """
    Discover and register extension rules from configured paths.
    """
    extensions = []

    for ext_config in config.extensions:
        # Glob for matching files
        paths = glob(ext_config.path)

        for path in paths:
            content = read_file(path)

            # Parse YAML frontmatter
            frontmatter = parse_frontmatter(content)

            if not validate_extension_schema(frontmatter, config.extension_schema):
                log_warning(f"Invalid extension schema in {path}")
                continue

            rule = Rule(
                name=frontmatter['name'],
                file=path,
                triggers=parse_triggers(frontmatter['triggers']),
                priority=frontmatter.get('priority', ext_config.priority),
                phase=frontmatter.get('phase', 'post'),
                tokens=frontmatter.get('tokens', 500),
                source='extension',
            )

            extensions.append(rule)

    # Sort by priority (lower number = higher priority)
    extensions.sort(key=lambda r: r.priority)

    return extensions


def should_load_extension(rule: Rule, context: CraftContext) -> bool:
    """
    Check if an extension rule should be loaded based on triggers.
    """
    for trigger in rule.triggers:
        if trigger.type == 'keywords':
            if any(kw in context.user_input.lower() for kw in trigger.values):
                return True
        elif trigger.type == 'hooks':
            if any(hook in context.detected_hooks for hook in trigger.values):
                return True
        elif trigger.type == 'effects':
            if context.detected_effect in trigger.values:
                return True

    return False
```

---

### 2.5 ck Semantic Search Integration

#### 2.5.1 Search Abstraction Layer

```typescript
// .claude/scripts/search.ts

interface SearchResult {
  file: string;
  line: number;
  content: string;
  score?: number;  // Relevance score (ck only)
}

interface SearchOptions {
  limit?: number;
  type?: 'semantic' | 'pattern' | 'hybrid';
  glob?: string;
}

/**
 * Unified search interface that uses ck when available,
 * falls back to grep otherwise.
 */
async function search(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const searchMode = await detectSearchMode();

  if (searchMode === 'ck' && options.type !== 'pattern') {
    return searchWithCk(query, options);
  } else {
    return searchWithGrep(query, options);
  }
}

async function detectSearchMode(): Promise<'ck' | 'grep'> {
  try {
    await execAsync('which ck');
    return 'ck';
  } catch {
    return 'grep';
  }
}

async function searchWithCk(
  query: string,
  options: SearchOptions
): Promise<SearchResult[]> {
  const limit = options.limit ?? 10;
  const args = [`"${query}"`, `--limit ${limit}`];

  if (options.glob) {
    args.push(`--glob "${options.glob}"`);
  }

  const { stdout } = await execAsync(`ck ${args.join(' ')}`);
  return parseCkOutput(stdout);
}

async function searchWithGrep(
  query: string,
  options: SearchOptions
): Promise<SearchResult[]> {
  const limit = options.limit ?? 10;
  const glob = options.glob ?? '**/*.{ts,tsx,js,jsx}';

  // Convert semantic query to grep pattern
  const pattern = semanticToPattern(query);

  const { stdout } = await execAsync(
    `grep -rn "${pattern}" --include="${glob}" | head -${limit}`
  );
  return parseGrepOutput(stdout);
}

/**
 * Convert semantic query to grep-compatible pattern.
 * Best effort - grep won't understand concepts, but will find keywords.
 */
function semanticToPattern(query: string): string {
  // Extract key terms, remove stop words
  const stopWords = ['the', 'a', 'an', 'for', 'with', 'how', 'does'];
  const terms = query.toLowerCase()
    .split(/\s+/)
    .filter(t => !stopWords.includes(t) && t.length > 2);

  // Create OR pattern for grep
  return terms.join('|');
}
```

#### 2.5.2 Integration in /craft Convention Discovery

```markdown
# modes/chisel.md (Step 1d: Convention Discovery)

## Step 1d: Convention Discovery

Before generating, discover existing conventions using semantic search.

### Search Strategy

1. **Detect search mode** (once per session)
   ```bash
   if command -v ck &>/dev/null; then
     SIGIL_SEARCH="ck"
   else
     SIGIL_SEARCH="grep"
   fi
   ```

2. **Find similar components** (semantic when available)
   ```bash
   # With ck (semantic)
   ck "component pattern ${COMPONENT_TYPE}" --limit 5

   # Fallback (grep)
   grep -rn "export.*${COMPONENT_TYPE}" --include="*.tsx" src/ | head -5
   ```

3. **Extract patterns**
   - File structure (where components live)
   - Import patterns (how deps are imported)
   - Naming conventions (PascalCase, etc.)
   - Hook patterns (custom hooks, data fetching)

### Never Mention Tool Choice

The search tool is an implementation detail. Present results uniformly:

> Found 3 similar components in `src/components/`:
> - `ClaimButton.tsx` - Financial, pessimistic
> - `DepositForm.tsx` - Financial, pessimistic
> - `LikeButton.tsx` - Standard, optimistic
```

---

### 2.6 IPC Protocol

#### 2.6.1 Request/Response Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           IPC FLOW                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. TOOLBAR WRITES REQUEST                                              │
│     grimoires/pub/requests/{uuid}.json                                  │
│     {                                                                   │
│       "id": "550e8400-e29b-41d4-a716-446655440000",                     │
│       "type": "validate_zone",                                          │
│       "timestamp": "2026-01-20T12:00:00Z",                              │
│       "payload": {                                                      │
│         "component": "VaultBalance",                                    │
│         "keywords": ["balance", "vault"],                               │
│         "inferred_zone": "critical",                                    │
│         "lens_context": {                                               │
│           "impersonated_address": "0x1234...",                          │
│           "component": "VaultBalance",                                  │
│           "observed_value": "0",                                        │
│           "on_chain_value": "1234.56"                                   │
│         }                                                               │
│       }                                                                 │
│     }                                                                   │
│                                                                         │
│  2. INVOKE CLIs (PARALLEL)                                              │
│     anchor validate --request 550e8400-e29b-41d4-a716-446655440000 &    │
│     lens verify --request-id 550e8400-e29b-41d4-a716-446655440000 &     │
│     wait                                                                │
│                                                                         │
│  3. READ RESPONSES                                                      │
│     grimoires/pub/responses/{uuid}-anchor.json                          │
│     {                                                                   │
│       "id": "550e8400-e29b-41d4-a716-446655440000",                     │
│       "type": "validate_zone_response",                                 │
│       "timestamp": "2026-01-20T12:00:01Z",                              │
│       "result": {                                                       │
│         "validated": true,                                              │
│         "exit_code": 11,                                                │
│         "lens_issues": [{                                               │
│           "code": "data_source_mismatch",                               │
│           "severity": "warning",                                        │
│           "message": "UI shows '0', chain has '1234.56'",               │
│           "suggested_fix": "Switch from indexed to on-chain read"       │
│         }]                                                              │
│       }                                                                 │
│     }                                                                   │
│                                                                         │
│     grimoires/pub/responses/{uuid}-lens.json                            │
│     {                                                                   │
│       "request_id": "550e8400-e29b-41d4-a716-446655440000",             │
│       "pass": true,                                                     │
│       "results": [...],                                                 │
│       "summary": { "total": 5, "passed": 5, "failed": 0 }               │
│     }                                                                   │
│                                                                         │
│  4. TOOLBAR DISPLAYS RESULTS                                            │
│     HUD overlay shows data source warning + suggested fix               │
│                                                                         │
│  5. LOG TO TASTE.MD                                                     │
│     Signal with lens_context preserved for learning                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 2.6.2 File Locking Protocol

```rust
// anchor-rust/anchor/src/io.rs (existing pattern)

use fs2::FileExt;
use std::fs::{File, OpenOptions};
use std::path::Path;

/// Write a response file with advisory locking
pub fn write_response<T: Serialize>(
    pub_dir: &Path,
    request_id: &str,
    cli_name: &str,
    response: &T,
) -> Result<(), IoError> {
    let response_path = pub_dir
        .join("responses")
        .join(format!("{}-{}.json", request_id, cli_name));

    // Create parent directories
    std::fs::create_dir_all(response_path.parent().unwrap())?;

    // Open with advisory lock
    let file = OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .open(&response_path)?;

    // Exclusive lock for writing
    file.lock_exclusive()?;

    let content = serde_json::to_string_pretty(response)?;
    std::fs::write(&response_path, content)?;

    // Unlock automatically on file close
    Ok(())
}
```

---

## 3. Data Models

### 3.1 taste.md Schema Extension

```yaml
# Extended signal schema for toolbar integration
---
timestamp: "2026-01-20T14:32:00Z"
signal: MODIFY
source: cli | toolbar  # NEW: distinguish source

component:
  name: "VaultBalance"
  effect: "Financial"
  craft_type: "generate"

physics:
  behavioral:
    sync: "pessimistic"
    timing: "800ms"
    confirmation: "required"
  animation:
    easing: "ease-out"
    duration: "800ms"
  material:
    surface: "elevated"

# NEW: Toolbar-specific fields
lens_context:
  impersonated_address: "0x1234..."
  observed_vs_actual: "0 vs 1234.56"
  data_source_issue: true

screenshot_ref: "observations/vault-balance-0x1234.png"  # NEW

diagnostic:
  user_type: "power-user"
  goal: "check balance visibility"
  skipped: false

change:
  from: "indexed query"
  to: "on-chain read"

learning:
  inference: "Financial displays need on-chain source"
  recommendation: "Default to on-chain for balance components"
---
```

### 3.2 Session State Model

```typescript
// Session state for craft.md mode routing and continuation

interface CraftSessionState {
  /** Session ID (UUID) */
  sessionId: string;

  /** Component being worked on */
  component: string;

  /** Current iteration number */
  iteration: number;

  /** Current craft mode */
  mode: 'quick' | 'chisel' | 'hammer' | 'debug';

  /** Fragments already loaded (for skip-on-continuation) */
  loadedFragments: Set<string>;

  /** Physics decisions made this session */
  physicsDecisions: {
    effect: string;
    behavioral: BehavioralPhysics;
    animation?: AnimationPhysics;
    material?: MaterialPhysics;
  };

  /** Timestamp of last activity */
  lastActivity: string;

  /** Loop detection state */
  loopDetection: {
    pattern: string | null;
    repeatCount: number;
  };
}

// Persisted to grimoires/sigil/craft-state.md
```

---

## 4. API Specifications

### 4.1 Anchor CLI API Extensions

#### New Command: `anchor validate` with LensContext

```
USAGE:
    anchor validate --request <UUID> [--pub-dir <PATH>]

OPTIONS:
    --request <UUID>    Request ID to validate
    --pub-dir <PATH>    Directory for pub/ IPC (default: grimoires/pub)

EXIT CODES:
    0   - Valid (no issues)
    10  - Critical zone violations (errors)
    11  - Cautious zone warnings (warnings, includes lens issues)
    12  - Standard zone info
    20  - Schema validation error
    30  - I/O error

REQUEST SCHEMA:
    {
      "id": "<uuid>",
      "type": "validate_zone",
      "timestamp": "<iso8601>",
      "payload": {
        "component": "<string>",
        "keywords": ["<string>"],
        "inferred_zone": "critical" | "cautious" | "standard",
        "physics": { ... },
        "lens_context": {                          // NEW (optional)
          "impersonated_address": "<0x...>",
          "component": "<string>",
          "observed_value": "<string>",
          "on_chain_value": "<string>",
          "indexed_value": "<string>"
        }
      }
    }

RESPONSE SCHEMA:
    {
      "id": "<uuid>",
      "type": "validate_zone_response",
      "timestamp": "<iso8601>",
      "result": {
        "validated": <bool>,
        "exit_code": <number>,
        "correct_zone": "<zone>" | null,
        "warnings": ["<string>"],
        "lens_issues": [{                          // NEW
          "code": "<string>",
          "severity": "error" | "warning" | "info",
          "message": "<string>",
          "suggested_fix": "<string>"
        }]
      }
    }
```

### 4.2 Toolbar API

#### DevToolbarProvider Props

```typescript
interface DevToolbarProviderProps {
  /** Children to wrap */
  children: React.ReactNode;

  /** Path to pub/ directory (default: 'grimoires/pub') */
  pubDirectory?: string;

  /** Path to taste.md file (default: 'grimoires/sigil/taste.md') */
  tasteFile?: string;

  /** Whether toolbar is enabled (default: process.env.NODE_ENV !== 'production') */
  enabled?: boolean;

  /** Initial saved addresses for quick-select */
  savedAddresses?: SavedAddress[];

  /** Simulation configuration */
  simulation?: {
    /** Fork URL (Anvil, Tenderly) */
    forkUrl?: string;
    /** Chain ID for simulation */
    chainId?: number;
  };
}
```

#### Hook APIs

```typescript
// useUserLens
function useUserLens(): {
  enabled: boolean;
  impersonatedAddress: `0x${string}` | null;
  realAddress: `0x${string}` | null;
  savedAddresses: SavedAddress[];
  enable: (address: `0x${string}`) => void;
  disable: () => void;
  addSavedAddress: (address: SavedAddress) => void;
  removeSavedAddress: (address: `0x${string}`) => void;
};

// useAnchorValidation
function useAnchorValidation(request: AnchorRequest): {
  data: AnchorResponse | undefined;
  isLoading: boolean;
  error: Error | null;
  validate: () => Promise<AnchorResponse>;
};

// useSimulation
function useSimulation(tx: TransactionRequest): {
  result: SimulationResult | undefined;
  isSimulating: boolean;
  error: Error | null;
  simulate: () => Promise<SimulationResult>;
};
```

---

## 5. Security Considerations

### 5.1 Dev Toolbar Security

| Concern | Mitigation |
|---------|------------|
| Production exposure | Disabled by default in production builds |
| Private key access | Never accessed; signing uses real wallet |
| Simulation accuracy | Clear "simulation only" warnings |
| Address impersonation | Read-only; writes use real wallet |

### 5.2 IPC Security

| Concern | Mitigation |
|---------|------------|
| Path traversal | UUID validation (RFC 4122) |
| File size | 1MB max request size |
| Concurrent access | Advisory locking via fs2 |
| Stale files | TTL cleanup (1 hour) |

### 5.3 Extension Security

| Concern | Mitigation |
|---------|------------|
| Malicious extensions | Lower priority than core rules |
| Token budget | Extensions counted against budget |
| Trigger injection | Triggers validated against schema |

---

## 6. Testing Strategy

### 6.1 craft.md Split Tests

| Test | Description |
|------|-------------|
| Mode selection | Verify correct mode selected for each input type |
| Fragment loading | Verify fragments loaded and skip-on-continuation works |
| Token budget | Verify actual tokens match declared budget |
| Regression | Full /craft workflow with split files |

### 6.2 Toolbar Tests

| Test | Description |
|------|-------------|
| User Lens | Address impersonation affects reads, not writes |
| Simulation | Fork creation, tx simulation, result parsing |
| State Comparison | Diff generation, export format |
| IPC | Request/response round-trip with Anchor/Lens |

### 6.3 Anchor Extension Tests

| Test | Description |
|------|-------------|
| LensContext parsing | Valid and invalid lens_context fields |
| Validation rules | data_source_mismatch, stale_indexed_data, lens_financial_check |
| Exit codes | Correct exit code for each severity level |

---

## 7. Migration Plan

### 7.1 Phase 1: craft.md Split (Sprint 1-2)

1. **Extract content** (no behavior change)
   - Copy chisel-relevant sections to `modes/chisel.md`
   - Copy hammer-relevant sections to `modes/hammer.md`
   - Copy debug-relevant sections to `modes/debug.md`
   - Extract fragments to `fragments/`

2. **Create index.yaml** (routing)
   - Define modes, triggers, token budgets
   - Configure fragment references

3. **Update skill loader** (activation)
   - Implement mode selection algorithm
   - Implement fragment embedding
   - Implement skip-on-continuation

4. **Test and validate**
   - Token budget verification
   - Regression tests for all craft workflows

### 7.2 Phase 2: Toolbar + Anchor Extension (Sprint 3-4)

1. **Create @sigil/dev-toolbar package**
   - DevToolbarProvider
   - UserLens component and hook
   - IPC client for Anchor/Lens

2. **Extend Anchor schemas**
   - Add LensContext to request.rs
   - Add lens_issues to response.rs
   - Implement LensValidator

3. **Integrate toolbar with pub/ IPC**
   - Write requests on lens enable
   - Display Anchor/Lens responses in HUD

4. **Extend taste.md schema**
   - Add lens_context, screenshot_ref fields
   - Update signal collection

### 7.3 Phase 3: Simulation + Docs (Sprint 5-6)

1. **Agent Simulation**
   - Fork chain state integration (Anvil)
   - Transaction dry-run
   - State change preview

2. **State Comparison**
   - React Query cache diffing
   - Data source tracing
   - Export functionality

3. **Documentation**
   - skill-authoring.md
   - Fragment system guide
   - Toolbar integration guide

---

## 8. Appendices

### Appendix A: File Change Summary

| File | Action | Sprint |
|------|--------|--------|
| `.claude/commands/craft.md` | Archive (keep for reference) | 1 |
| `.claude/skills/crafting-physics/index.yaml` | Create | 1 |
| `.claude/skills/crafting-physics/SKILL.md` | Create | 1 |
| `.claude/skills/crafting-physics/modes/chisel.md` | Create | 1 |
| `.claude/skills/crafting-physics/modes/hammer.md` | Create | 1 |
| `.claude/skills/crafting-physics/modes/debug.md` | Create | 1 |
| `.claude/skills/crafting-physics/fragments/*.md` | Create | 1 |
| `.claude/rules/index.yaml` | Modify (add extensions) | 2 |
| `packages/sigil-dev-toolbar/` | Create (new package) | 3-4 |
| `anchor-rust/anchor/src/types/request.rs` | Modify (add LensContext) | 3 |
| `anchor-rust/anchor/src/types/response.rs` | Modify (add lens_issues) | 3 |
| `anchor-rust/anchor/src/commands/validate.rs` | Modify (add LensValidator) | 3 |
| `.claude/docs/skill-authoring.md` | Create | 6 |

### Appendix B: Token Budget Summary

| Mode | Main File | Fragments | Total |
|------|-----------|-----------|-------|
| Quick (Tier 0) | 500 | 0 | 500 |
| Chisel (Tier 1) | 2,000 | 950 | 2,950 |
| Hammer (Tier 2) | 3,300 | 700 | 4,000 |
| Debug (Tier 3) | 3,000 | 600 | 3,600 |

**Continuation savings**: ~40% reduction by skipping already-loaded fragments.

### Appendix C: Exit Code Reference

| Code | Name | Source | Meaning |
|------|------|--------|---------|
| 0 | Valid | Anchor/Lens | No issues |
| 10 | Critical | Anchor | Critical zone violations |
| 11 | Cautious | Anchor | Cautious zone warnings, lens issues |
| 12 | Standard | Anchor | Standard zone info |
| 20 | Schema | Anchor/Lens | Invalid request format |
| 30 | IO | Anchor/Lens | File system error |

### Appendix D: Glossary

| Term | Definition |
|------|------------|
| **RLM** | Rule Loading Manager - on-demand rule loading via triggers |
| **Fragment** | Reusable content block that can be embedded in mode files |
| **Mode** | Craft command variant (quick/chisel/hammer/debug) |
| **LensContext** | Toolbar context passed to Anchor for data source validation |
| **pub/ IPC** | Inter-process communication via `grimoires/pub/` directory |
| **Taste signal** | ACCEPT/MODIFY/REJECT learning signal in taste.md |
