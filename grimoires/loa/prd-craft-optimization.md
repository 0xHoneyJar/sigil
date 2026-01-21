# PRD: Sigil /craft Optimization & Dev Toolbar

**Version:** 1.1.0
**Status:** Draft
**Created:** 2026-01-20
**Issues:**
- [#39 - Diagnostic framework: verify before asking](https://github.com/0xHoneyJar/sigil/issues/39)
- [#40 - Sigil Dev Toolbar](https://github.com/0xHoneyJar/sigil/issues/40)

---

## 1. Problem Statement

The `/craft` command currently has a **32,000 token blast radius**—it loads extensive context even for simple operations. Combined with incomplete dev toolbar integration and underutilized semantic search (`ck`), this creates:

1. **Context waste**: Full physics rules loaded regardless of task complexity
2. **Missing verification**: Can't "see what users see" when debugging UI issues
3. **Manual search overhead**: `ck` semantic search available but not hooked into Sigil discovery flows
4. **Skill bloat**: Skills written without progressive disclosure become monolithic
5. **Diagnostic friction**: Support asks users for info that can be queried on-chain (#39)

### Scope Clarification

**Sigil Territory** (this PRD):
- `/craft`, `/observe`, `/ward`, `/style`, `/animate`, `/behavior`
- Sigil Dev Toolbar (visual layer)
- Anchor/Lens CLIs (verification backbone)
- Physics rules and RLM system

**Loa Territory** (out of scope - symlinked into Sigil):
- `/ride`, `/understand`, `/architect`, `/plan-and-analyze`
- ck integration for Loa commands is Loa's responsibility

### Unified Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SIGIL STACK                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐           │
│  │  /craft     │   │  /observe   │   │  /ward      │  Commands │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘           │
│         │                 │                 │                   │
│         └────────────┬────┴────────────────┘                   │
│                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   DEV TOOLBAR (HUD)                      │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌──────────┐ │   │
│  │  │User Lens  │ │Simulation │ │State Diff │ │Diagnostics│ │   │
│  │  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └────┬─────┘ │   │
│  └────────┼─────────────┼─────────────┼────────────┼───────┘   │
│           │             │             │            │            │
│           └──────────┬──┴─────────────┴────────────┘            │
│                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              ANCHOR + LENS (Verification)                │   │
│  │  ┌─────────────────────┐  ┌─────────────────────────┐   │   │
│  │  │ Anchor              │  │ Lens                    │   │   │
│  │  │ • Zone validation   │  │ • CEL constraints       │   │   │
│  │  │ • Effect detection  │  │ • Heuristic linting     │   │   │
│  │  │ • Data source rules │  │ • Correction suggestions│   │   │
│  │  └──────────┬──────────┘  └───────────┬─────────────┘   │   │
│  └─────────────┼─────────────────────────┼─────────────────┘   │
│                │                         │                      │
│                └───────────┬─────────────┘                      │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    grimoires/pub/                        │   │
│  │  requests/ ←→ responses/ (IPC)                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    taste.md (Learning)                   │   │
│  │  ACCEPT/MODIFY/REJECT signals + screenshots + lens_addr │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Data Flow**:
1. **Commands** → Invoke toolbar for visual verification
2. **Toolbar** → Captures state, sends to Anchor/Lens for validation
3. **Anchor** → Validates zones, effects, data sources
4. **Lens** → Verifies constraints, suggests corrections
5. **pub/** → IPC layer for request/response
6. **taste.md** → Accumulates signals with full context

> Sources: craft.md analysis (~3,500 lines), oracle-analyze patterns, index.yaml RLM structure, issues #39 and #40

---

## 2. Goals & Success Metrics

### Primary Goals

| Goal | Metric | Target |
|------|--------|--------|
| Reduce craft context usage | Tokens per /craft invocation | < 4,000 tokens (from ~11,700) |
| Dev toolbar visual verification | "See what user sees" capability | 100% address impersonation |
| ck in Sigil discovery | Semantic search in /craft, /observe | 80% of component discovery |
| Progressive disclosure in skills | Average skill file size | < 5KB per mode |
| Verification-first diagnostics | On-chain queries before user questions | Query first, ask second |

### Secondary Goals

- Establish skill writing best practices documentation
- Create RLM extension points for custom rules
- Enable toolbar feedback to flow back into taste.md
- Transaction simulation without real funds (#40)

---

## 3. User & Stakeholder Context

### Primary Persona: Framework Developer

- Uses `/craft` daily for UI generation
- Needs fast, focused context (not 32k tokens per invocation)
- Wants to debug "user can't see X" issues without asking user for screenshots
- Values semantic search for discovering component patterns

### Secondary Persona: Support Engineer

- Investigates "pots not visible" type issues
- Currently asks users for info that's queryable on-chain
- Needs User Lens to impersonate addresses and see user's view
- Wants transaction simulation before suggesting fixes

### Tertiary Persona: Skill Author

- Creates custom skills for domain-specific workflows
- Needs clear patterns for progressive disclosure
- Wants RLM integration without rewriting index.yaml

---

## 4. Functional Requirements

### 4.1 Progressive Disclosure for /craft

**Current State**: Single monolithic craft.md (3,508 lines)

**Target State**: Mode-based loading with 4 tiers

| Tier | Mode | Tokens | Triggers |
|------|------|--------|----------|
| 0 | Quick | ~1,500 | Single-line edits, 1-3 line fixes |
| 1 | Chisel (default) | ~3,000 | Single component work |
| 2 | Hammer | ~5,000 | Multi-file, autonomous batch |
| 3 | Debug | ~4,000 | Iteration 3+, anomalies |

**Implementation**:
```
.claude/skills/crafting-physics/
├── index.yaml          # Mode routing + metadata
├── SKILL.md            # Quick reference (Tier 0)
├── modes/
│   ├── chisel.md       # Default single-component (Tier 1)
│   ├── hammer.md       # Multi-file batch (Tier 2)
│   └── debug.md        # Diagnostic mode (Tier 3)
└── fragments/
    ├── physics-table.md    # Inline-able physics reference
    ├── protected-caps.md   # Protected capabilities checklist
    └── feedback-loop.md    # Taste signal collection
```

**Acceptance Criteria**:
- [ ] craft.md split into mode files
- [ ] index.yaml routes to correct mode based on triggers
- [ ] Token budget declared at bottom of each mode
- [ ] Fragments loadable via `{{fragment:physics-table}}`

### 4.2 Sigil Dev Toolbar (#40)

**Core Problem**: Developers can't see what users see. Data may exist on-chain while remaining invisible in the UI.

#### Toolbar ↔ Anchor/Lens Integration

The Dev Toolbar is the **visual layer** on top of Anchor/Lens verification:

```
┌─ Toolbar Action ─────────────────────────────────────────────┐
│                                                              │
│  User enables lens for 0x1234                                │
│      ↓                                                       │
│  Toolbar captures component state                            │
│      ↓                                                       │
│  Write to grimoires/pub/requests/{uuid}.json:                │
│  {                                                           │
│    "request_id": "...",                                      │
│    "physics": { ... },                                       │
│    "lens_context": {                                         │
│      "impersonated_address": "0x1234",                       │
│      "component": "VaultBalance",                            │
│      "observed_value": "0",                                  │
│      "on_chain_value": "1234.56"                             │
│    }                                                         │
│  }                                                           │
│      ↓                                                       │
│  anchor validate --request {uuid}                            │
│  lens verify --request-id {uuid}                             │
│      ↓                                                       │
│  Read grimoires/pub/responses/{uuid}.json                    │
│      ↓                                                       │
│  Toolbar shows violations in HUD overlay                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Verification Categories**:

| Category | Anchor Checks | Lens Checks | Toolbar Display |
|----------|---------------|-------------|-----------------|
| **Data Source** | On-chain vs indexed mismatch | Stale data detection | ⚠️ "Data source discrepancy" |
| **Physics** | Effect → Zone mapping | Timing/confirmation constraints | Physics overlay on component |
| **Protected** | Escape hatch visibility | Touch target ≥44px | Highlight violations |
| **State** | N/A | N/A | Side-by-side diff |

#### 4.2.1 User Lens (Read Impersonation)

View the application as if connected with a specific address.

**Features**:
- Address input with validation (ENS support)
- Quick-select buttons for common test addresses
- Visual indicator showing impersonation active
- Read operations use impersonated address
- Write operations use real connected wallet (safety)

**Implementation**:
```typescript
// Toolbar state
interface UserLensState {
  enabled: boolean
  impersonatedAddress: Address | null
  realAddress: Address | null  // Keep for writes
}

// Hook override
function useUserLensAccount() {
  const { address: realAddress } = useAccount()
  const { impersonatedAddress, enabled } = useUserLens()

  return {
    address: enabled ? impersonatedAddress : realAddress,
    realAddress,  // Always available for signing
    isImpersonating: enabled
  }
}
```

**Acceptance Criteria**:
- [ ] Address input with ENS resolution
- [ ] Quick-select for saved addresses
- [ ] Visual badge when impersonating
- [ ] Read hooks use impersonated address
- [ ] Write hooks use real wallet

#### 4.2.2 Agent Simulation (Write Simulation)

Dry-run transactions against fork/simulation without real funds.

**Features**:
- Fork current chain state (Anvil/Tenderly)
- Execute transaction in simulation
- Show expected state changes
- Display gas estimates
- Preview token balance deltas

**Implementation**:
```typescript
interface SimulationResult {
  success: boolean
  gasUsed: bigint
  gasEstimate: bigint
  stateChanges: StateChange[]
  balanceDeltas: BalanceDelta[]
  logs: Log[]
  error?: string
}

// Toolbar integration
function useTransactionSimulation(tx: TransactionRequest) {
  return useQuery({
    queryKey: ['simulation', tx],
    queryFn: () => simulateTransaction(tx),
    enabled: devToolbar.simulationEnabled
  })
}
```

**Acceptance Criteria**:
- [ ] Fork chain state on demand
- [ ] Execute simulation without broadcasting
- [ ] Display state changes diff
- [ ] Show gas estimates
- [ ] Preview balance changes

#### 4.2.3 State Comparison

Side-by-side comparison of app state between developer and user views.

**Features**:
- Diff view of React Query cache
- Highlight discrepancies in rendered data
- Show data pipeline: indexer → processing → render
- Export comparison for bug reports

**DevTools Overlay**:
```
┌─ State Comparison ─────────────────────────────────────┐
│                                                        │
│  Your View          │  User (0x1234...abcd) View      │
│  ─────────────────  │  ─────────────────────────────  │
│  Vault Balance:     │  Vault Balance:                 │
│  1,234.56 HONEY     │  0.00 HONEY ⚠️                  │
│                     │                                  │
│  Data Source:       │  Data Source:                   │
│  ✓ Indexer: synced  │  ✓ Indexer: synced              │
│  ✓ On-chain: match  │  ✗ On-chain: 1,234.56 ← DIFF   │
│                     │                                  │
│  Issue: UI not refreshing after deposit               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- [ ] Side-by-side state view
- [ ] Highlight data discrepancies
- [ ] Show data source (indexer vs on-chain)
- [ ] Export comparison as JSON

#### 4.2.4 Anchor Extension: Lens Context Validation

Extend Anchor's request schema to support toolbar lens context:

```rust
// anchor-rust/anchor/src/types/request.rs
#[derive(Debug, Serialize, Deserialize)]
pub struct ValidateRequest {
    pub request_id: Uuid,
    pub physics: PhysicsAnalysis,
    pub keywords: Option<Vec<String>>,
    pub context: Option<RequestContext>,

    // NEW: Toolbar lens context
    #[serde(skip_serializing_if = "Option::is_none")]
    pub lens_context: Option<LensContext>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LensContext {
    pub impersonated_address: String,
    pub component: String,
    pub observed_value: Option<String>,
    pub on_chain_value: Option<String>,
    pub indexed_value: Option<String>,
}
```

**New Anchor Validation Rules**:

| Rule | Condition | Exit Code | Message |
|------|-----------|-----------|---------|
| `data_source_mismatch` | `observed != on_chain` | 11 | "UI shows {observed}, chain has {on_chain}" |
| `stale_indexed_data` | `indexed != on_chain` | 11 | "Indexed data stale by {delta}" |
| `lens_financial_check` | Financial effect + lens | 10 | "Financial component must use on-chain source" |

**Lens Response Extension**:
```json
{
  "request_id": "...",
  "pass": false,
  "lens_analysis": {
    "data_source_issue": true,
    "suggested_fix": "Switch from indexed to on-chain read",
    "affected_hooks": ["useVaultBalance"]
  }
}
```

**Acceptance Criteria**:
- [ ] LensContext added to Anchor request schema
- [ ] Data source mismatch validation implemented
- [ ] Lens response includes suggested fixes
- [ ] Exit code 11 for lens warnings

#### 4.2.5 Diagnostic Framework (#39)

**Principle**: "Don't ask what you can verify. Query first, ask only for client-side state."

**Verifiable (query before asking)**:
- User vault deposits/balances
- Transaction history
- Stake/unstake completion status
- Share quantities

**Client-side only (must ask user)**:
- Browser/wallet type
- Console errors
- UI rendering state
- Connected network

**Diagnostic Template Update**:
```yaml
# Level 3 Diagnostic - Split into verifiable vs ask
verifiable_queries:
  - name: "vault_balance"
    query: "useReadContract({ functionName: 'balanceOf', args: [address] })"
  - name: "deposit_history"
    query: "indexer.deposits.where({ user: address })"
  - name: "pending_rewards"
    query: "useReadContract({ functionName: 'pendingRewards', args: [address] })"

user_questions:
  - "What browser and wallet are you using?"
  - "Are there any console errors? (F12 → Console)"
  - "What network is your wallet connected to?"
```

**Acceptance Criteria**:
- [ ] Diagnostic template separates verifiable vs ask
- [ ] Auto-query on-chain state before asking user
- [ ] User Lens enables "see what they see"
- [ ] Reduce support round-trips by 50%

### 4.3 RLM Enhancement for Custom Rules

**Current State**: Rules hardcoded in index.yaml

**Target State**: Extension points for project-specific rules

```yaml
# .claude/rules/index.yaml
extensions:
  - path: "grimoires/sigil/rules/*.md"
    priority: 5  # Lower than core rules
    auto_register: true
```

**Project Rules Path**: `grimoires/sigil/rules/`
- Auto-discovered on load
- Inherits RLM trigger matching
- Lower priority than core Sigil rules

**Acceptance Criteria**:
- [ ] Extension path configurable in index.yaml
- [ ] Project rules auto-registered with triggers
- [ ] Priority ordering respected (core > project)
- [ ] Token budget includes project rules

### 4.4 ck Semantic Search in Sigil Commands

**Current State**: ck mentioned in rule 17, but not hooked into Sigil discovery flows

**Target State**: ck as primary search in /craft and /observe discovery steps

**Integration Points** (Sigil commands only):

| Command | Discovery Step | Search Type | ck Query |
|---------|----------------|-------------|----------|
| /craft | Convention discovery (Step 1d) | Semantic | "component pattern" + type |
| /craft | Existing implementation | Hybrid | component name + keywords |
| /observe | Behavior patterns | Semantic | "user interaction" + component |
| /observe | Animation inspection | Semantic | "motion spring animation" |

**Note**: /ride, /understand are Loa commands—ck integration there is Loa's responsibility.

**Fallback Protocol**:
```bash
# Detection (once per session)
if command -v ck &>/dev/null; then
  export SIGIL_SEARCH_MODE="ck"
else
  export SIGIL_SEARCH_MODE="grep"
fi

# Usage in discovery
function discover_conventions() {
  local component_type="$1"

  if [[ "$SIGIL_SEARCH_MODE" == "ck" ]]; then
    ck "component pattern ${component_type}" --limit 5
  else
    grep -rn "export.*${component_type}" --include="*.tsx" src/
  fi
}
```

**Acceptance Criteria**:
- [ ] ck detected on session start
- [ ] /craft Step 1d uses ck for convention discovery
- [ ] /observe uses ck for behavior pattern search
- [ ] Fallback produces identical output format
- [ ] Never mention tool choice to user

### 4.5 Skill Writing Best Practices

**Deliverable**: `.claude/docs/skill-authoring.md`

**Content Outline**:

1. **Progressive Disclosure Pattern**
   - Quick reference (< 500 tokens)
   - Detailed instructions (< 2,000 tokens)
   - Implementation script (bash/typescript)

2. **Mode Architecture**
   - When to create modes
   - Mode routing in index.yaml
   - Token budget declaration

3. **RLM Integration**
   - Trigger types (keywords, types, hooks, effects)
   - Priority levels (1-4)
   - Phase system (pre/post analysis)

4. **Context Management**
   - Fragments for reusable content
   - Zone permissions (system/state/app)
   - Skip-on-continuation optimization

5. **Quality Gates**
   - Pre-flight checks
   - Validation gates
   - Graceful degradation

6. **Feedback Loops**
   - Signal collection (ACCEPT/MODIFY/REJECT)
   - Learning from modifications
   - Taste integration

**Acceptance Criteria**:
- [ ] skill-authoring.md created
- [ ] Examples from oracle-analyze included
- [ ] Fragment system documented
- [ ] Checklist for new skill authors

---

## 5. Technical Requirements

### 5.1 Performance

| Metric | Current | Target |
|--------|---------|--------|
| /craft cold start tokens | ~11,700 | < 4,000 |
| /craft continuation tokens | ~8,000 | < 2,500 |
| ck semantic search latency | N/A | < 500ms |
| User Lens address switch | N/A | < 100ms |
| Transaction simulation | N/A | < 3s |

### 5.2 Dev Toolbar Technical Stack

```
@sigil/dev-toolbar/
├── src/
│   ├── components/
│   │   ├── Toolbar.tsx           # Main container
│   │   ├── UserLens.tsx          # Address impersonation
│   │   ├── AgentSimulation.tsx   # Transaction dry-run
│   │   ├── StateComparison.tsx   # Diff view
│   │   └── DiagnosticPanel.tsx   # Query-first diagnostics
│   ├── hooks/
│   │   ├── useUserLens.ts        # Impersonation state
│   │   ├── useSimulation.ts      # Fork + simulate
│   │   └── useStateComparison.ts # Cache diffing
│   ├── providers/
│   │   └── DevToolbarProvider.tsx
│   └── index.ts
├── package.json
└── README.md
```

**Framework Compatibility**:
- React 18+
- Wagmi v2
- Viem
- TanStack Query v5

**Security**:
- Development-only (excluded from production builds)
- No private key access
- Simulation uses fork, not mainnet

### 5.3 Compatibility

- Backward compatible with existing skills
- Existing index.yaml structure preserved
- New features opt-in via configuration
- Toolbar disabled by default in production

### 5.4 Dependencies

| Dependency | Purpose | Required |
|------------|---------|----------|
| ck CLI | Semantic search | Optional (graceful fallback) |
| agent-browser MCP | Visual verification | Optional (skip if unavailable) |
| Anvil/Tenderly | Transaction simulation | Optional (for simulation) |
| wagmi | Toolbar hooks | Required (for toolbar) |

---

## 6. Scope & Prioritization

### MVP (Sprint 1-2)

1. **craft.md split into modes** (P0)
   - chisel.md (default)
   - hammer.md (multi-file)
   - debug.md (diagnostics)

2. **RLM extension points** (P0)
   - Project rules path
   - Auto-registration

3. **ck integration in /craft discovery** (P1)
   - Convention discovery
   - Component search

### Phase 2 (Sprint 3-4)

4. **Dev Toolbar: User Lens** (P0)
   - Address impersonation
   - Read-only view switching
   - Visual indicator

5. **Anchor Extension: LensContext** (P0)
   - Add LensContext to request schema
   - Data source mismatch validation
   - Stale indexed data detection

6. **Dev Toolbar: Diagnostic Framework** (P1)
   - Verifiable vs ask separation
   - Auto-query on-chain state via Anchor
   - Reduced support round-trips

7. **agent-browser → taste.md flow** (P1)
   - Screenshot capture
   - Observations directory
   - Signal with screenshot_ref + lens_address

### Phase 3 (Sprint 5-6)

8. **Dev Toolbar: Agent Simulation** (P1)
   - Fork chain state
   - Transaction dry-run
   - State change preview via Anchor simulation endpoint

9. **Dev Toolbar: State Comparison** (P2)
   - Side-by-side diff
   - Data source tracing (Anchor data physics)
   - Export for bug reports

10. **Skill authoring documentation** (P2)
    - Best practices guide
    - Fragment system

### Out of Scope

- /ride, /understand ck integration (Loa territory)
- Toolbar as standalone application (remains React component)
- Real-time continuous validation (remains on-demand)
- Custom ck training (use default embeddings)
- Production toolbar (dev-only)

---

## 7. Risks & Dependencies

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| craft.md split breaks existing flows | High | Comprehensive testing, gradual rollout |
| ck not installed by most users | Medium | Graceful grep fallback, invisible to user |
| Simulation accuracy vs mainnet | Medium | Clear "simulation only" warnings |
| Toolbar bundle size | Low | Tree-shaking, dev-only imports |

### Dependencies

| Dependency | Owner | Status |
|------------|-------|--------|
| ck CLI | Sigil team | Sprint 4 (in progress) |
| agent-browser MCP | Sigil team | Implemented |
| RLM index.yaml | Sigil core | Stable |
| Anvil (simulation) | Foundry | External, stable |

---

## 8. Implementation Notes

### craft.md Split Strategy

1. **Extract modes first** (preserve existing logic)
   - Copy chisel-relevant sections to chisel.md
   - Copy hammer-relevant sections to hammer.md
   - Copy debug-relevant sections to debug.md

2. **Create routing in index.yaml**
   ```yaml
   name: craft
   modes:
     - name: chisel
       file: modes/chisel.md
       triggers: [default]
       tokens: 3000
     - name: hammer
       file: modes/hammer.md
       triggers: ["multiple files", "batch", "autonomous"]
       tokens: 5000
     - name: debug
       file: modes/debug.md
       triggers: ["iteration >= 3", "debug", "diagnose"]
       tokens: 4000
   ```

3. **Extract fragments** (shared content)
   - Physics table → fragments/physics-table.md
   - Protected capabilities → fragments/protected-caps.md
   - Feedback collection → fragments/feedback-loop.md

### User Lens Integration with Wagmi

```typescript
// Override wagmi's useAccount at provider level
function DevToolbarProvider({ children }) {
  const [lensAddress, setLensAddress] = useState<Address | null>(null)

  return (
    <UserLensContext.Provider value={{ lensAddress, setLensAddress }}>
      <WagmiConfig config={createLensAwareConfig(lensAddress)}>
        {children}
      </WagmiConfig>
    </UserLensContext.Provider>
  )
}

// Lens-aware config overrides read address
function createLensAwareConfig(lensAddress: Address | null) {
  return {
    ...baseConfig,
    // Override account for read operations
    getAccount: () => lensAddress ?? realAccount
  }
}
```

### Toolbar → taste.md Flow

```
User Lens enabled
    ↓
Impersonate address 0x1234
    ↓
Observe UI discrepancy
    ↓
/craft "fix balance display"
    ↓
agent-browser screenshot (with lens state)
    ↓
grimoires/sigil/observations/balance-display-lens-0x1234.png
    ↓
taste.md signal:
  lens_address: "0x1234"
  screenshot_ref: "observations/balance-display-lens-0x1234.png"
  discrepancy: "balance showing 0 but on-chain is 1234.56"
```

---

## Appendix A: Token Budget Analysis

### Current /craft Invocation

| Component | Tokens |
|-----------|--------|
| craft.md (full) | ~32,000 |
| rlm-core-summary.md | ~1,000 |
| Protected capabilities | ~800 |
| Triggered rules | ~2,000 |
| Codebase read | ~2,000 |
| taste.md | ~1,000 |
| **Total** | **~38,800** |

### Target /craft Invocation (Chisel Mode)

| Component | Tokens |
|-----------|--------|
| craft/SKILL.md | ~500 |
| craft/modes/chisel.md | ~2,500 |
| rlm-core-summary.md | ~1,000 |
| Triggered rules | ~1,500 |
| Codebase read | ~1,500 |
| taste.md (recent) | ~500 |
| **Total** | **~7,500** |

**Reduction**: 80% (from ~38k to ~7.5k)

---

## Appendix B: Related Files

| File | Purpose | Action |
|------|---------|--------|
| `.claude/commands/craft.md` | Current monolithic command | Split into modes |
| `.claude/rules/index.yaml` | RLM registry | Add extension points |
| `.claude/rules/17-semantic-search.md` | ck guidance | Expand with Sigil integration |
| `.claude/skills/agent-browser/` | Visual verification | Hook into craft + toolbar flow |
| `grimoires/sigil/observations/` | Screenshot storage | Create + document |
| `.claude/docs/skill-authoring.md` | Best practices | Create new |
| `@sigil/dev-toolbar/` | New package | Create |

---

## Appendix C: Acceptance Checklist

### MVP Checklist

- [ ] craft.md split into chisel/hammer/debug modes
- [ ] index.yaml routes to correct mode
- [ ] Token budget < 4,000 for chisel mode
- [ ] RLM extension path for project rules
- [ ] ck integration in /craft convention discovery
- [ ] Fallback to grep when ck unavailable

### Phase 2 Checklist

- [ ] User Lens: address impersonation working
- [ ] User Lens: visual indicator when active
- [ ] Anchor: LensContext added to request schema
- [ ] Anchor: data_source_mismatch validation
- [ ] Anchor: stale_indexed_data detection
- [ ] Toolbar → Anchor: pub/ IPC for lens validation
- [ ] Diagnostic framework: query-first template
- [ ] agent-browser auto-invoked when URL provided
- [ ] Screenshots saved to observations/
- [ ] taste.md includes screenshot_ref and lens_address

### Phase 3 Checklist

- [ ] Agent Simulation: fork and dry-run
- [ ] Agent Simulation: state change preview
- [ ] State Comparison: side-by-side diff
- [ ] State Comparison: data source tracing
- [ ] skill-authoring.md documentation complete
- [ ] Fragment system implemented and documented

---

## Appendix D: Issue Mapping

| Issue | PRD Section | Priority |
|-------|-------------|----------|
| #39 - Diagnostic framework | 4.2.5 Diagnostic Framework | P1 |
| #39 - Agent browser simulation | 4.2.1 User Lens, 4.2.2 Agent Simulation | P0, P1 |
| #39 - Verify before asking | 4.2.4 Anchor Extension: LensContext | P0 |
| #40 - User Lens | 4.2.1 User Lens | P0 |
| #40 - Agent Simulation | 4.2.2 Agent Simulation | P1 |
| #40 - State Comparison | 4.2.3 State Comparison | P2 |

---

## Appendix E: Unified Mental Model

```
┌─────────────────────────────────────────────────────────────────┐
│                     SIGIL VERIFICATION STACK                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   USER INTERACTION                                              │
│   ═══════════════                                               │
│   /craft "claim button" --url localhost:3000                    │
│                        │                                        │
│                        ▼                                        │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ DEV TOOLBAR (Visual Layer)                              │   │
│   │                                                         │   │
│   │ • User Lens → See app as address 0x1234                 │   │
│   │ • Simulation → Dry-run tx without real funds            │   │
│   │ • State Diff → Compare your view vs user view           │   │
│   │ • Diagnostics → Query first, ask second                 │   │
│   └────────────────────────┬────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ ANCHOR (Ground Truth)                                   │   │
│   │                                                         │   │
│   │ • Zone validation (Critical/Cautious/Standard)          │   │
│   │ • Effect detection (Financial/Destructive/...)          │   │
│   │ • Data source rules (on-chain vs indexed)               │   │
│   │ • LensContext validation (observed vs actual)           │   │
│   └────────────────────────┬────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ LENS (Formal Verification)                              │   │
│   │                                                         │   │
│   │ • CEL constraints (timing, confirmation, sync)          │   │
│   │ • Heuristic linting (touch targets, focus rings)        │   │
│   │ • Correction suggestions (auto-fixable violations)      │   │
│   └────────────────────────┬────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ grimoires/pub/ (IPC)                                    │   │
│   │                                                         │   │
│   │ requests/{uuid}.json  ←→  responses/{uuid}.json         │   │
│   └────────────────────────┬────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ taste.md (Learning)                                     │   │
│   │                                                         │   │
│   │ signal: MODIFY                                          │   │
│   │ lens_address: "0x1234"                                  │   │
│   │ screenshot_ref: "observations/claim-btn-0x1234.png"     │   │
│   │ discrepancy: "balance 0 in UI, 1234.56 on-chain"        │   │
│   │ learning: "Use on-chain for financial balance display"  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   PRINCIPLE: Everything pipes through Anchor/Lens for          │
│   verification, everything logs to taste.md for learning.      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Insight**: The Dev Toolbar is not a separate system—it's the visual interface to the Anchor/Lens verification backbone. Every toolbar action generates a request to `pub/`, gets validated by Anchor/Lens, and logs to taste.md.
