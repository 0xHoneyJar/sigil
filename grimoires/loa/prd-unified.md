# Unified PRD: Sigil ↔ Loa Synergy + DX Physics

```
    ╔═══════════════════════════════════════════════════╗
    ║  ✦ SIGIL + LOA: UNIFIED FRAMEWORK                ║
    ║  "Know when to research, know when to craft"      ║
    ║                                                   ║
    ║  Complexity detection → Handoff → Seamless flow  ║
    ╚═══════════════════════════════════════════════════╝
```

**Version**: 1.0.0
**Last Updated**: 2026-01-19
**Status**: Discovery Phase Complete
**Owner**: THJ Team
**Related Issues**:
- [#20: DX Physics](https://github.com/0xHoneyJar/sigil/issues/20)
- [#22: Shared Context](https://github.com/0xHoneyJar/sigil/issues/22)

---

## Executive Summary

This PRD unifies two related initiatives:

| Issue | Problem | Solution |
|-------|---------|----------|
| **#20: DX Physics** | Indexer feedback loops take hours | RPC-based block discovery + test configs |
| **#22: Shared Context** | Sigil + Loa operate in isolation | Complexity detection + handoff protocol |

**The Core Insight**: DX Physics is the first application of a broader pattern — **detecting when specialized knowledge is needed and seamlessly handing off between frameworks**.

**Key Deliverables**:
1. **Shared Context Infrastructure** — `grimoires/loa/context/` as the bridge between Sigil and Loa
2. **Complexity Detection** — Automatic triggers that recognize when research is needed before crafting
3. **Handoff Protocol** — Seamless Sigil → Loa → Sigil transitions
4. **DX Physics** — First application: indexer detection → block discovery → test config generation

---

## 1. Problem Statement

### 1.1 The Isolation Problem (Issue #22)

From a January 19, 2026 development session:

> "Sigil and Loa operate independently but real development sessions require both."

**Documented Friction Points**:
- Required exploring 5 repositories to understand a single system
- Design tool proposed UI work before system comprehension
- Debugging needed reverse-engineering of undocumented contracts
- Pull request created in wrong repository

**Root Cause**: No mechanism for frameworks to share context or hand off to each other.

### 1.2 The DX Feedback Loop Problem (Issue #20)

Blockchain indexer development suffers from destructive feedback loops:

| Chain | Full Sync Time | Impact |
|-------|----------------|--------|
| Berachain (15.9M blocks) | ~4 hours | 2-3 iterations/day max |
| Ethereum (24.2M blocks) | 2-6 hours | 1-2 iterations/day max |
| Base (41M blocks) | 16+ hours | Less than 1 iteration/day |

**Root Cause**: No mechanism to detect indexer context and generate targeted test configurations.

### 1.3 The Unifying Pattern

Both problems share a common pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLEXITY DETECTION                         │
│                                                                 │
│  "Is this task simple enough for immediate action,             │
│   or does it require deeper understanding first?"              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   SIMPLE TASK              vs.        COMPLEX TASK              │
│   ───────────                         ────────────              │
│   • Known domain                      • Unknown domain          │
│   • Single file                       • Multi-repo              │
│   • Clear requirements                • Ambiguous requirements  │
│   • Familiar patterns                 • Novel patterns          │
│                                                                 │
│   → Apply Sigil physics               → Trigger Loa research    │
│     immediately                         then return to Sigil    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**DX Physics is an instance of this pattern**:
- Indexer work detected → specialized domain (blockchain)
- Unknown block ranges → requires RPC discovery (research)
- Config generated → return to normal implementation (craft)

---

## 2. Vision & Goals

### 2.1 Product Vision

> "Know when to research, know when to craft. Seamless handoff between understanding and building."

When Sigil detects complexity beyond its immediate domain:
1. **Recognize** the complexity trigger (indexer work, multi-repo, unknown system)
2. **Gather** necessary context (RPC queries, Loa analysis, ecosystem mapping)
3. **Store** context in shared location (`grimoires/loa/context/`)
4. **Return** to Sigil workflow with enriched understanding

### 2.2 Success Criteria

| Metric | Target | Timeline |
|--------|--------|----------|
| Complexity detection accuracy | >90% | 2 weeks |
| Handoff latency | <5 seconds | 2 weeks |
| DX Physics indexer detection | 100% | 1 week |
| DX Physics sync time reduction | 4 hours → 30 seconds | 1 week |
| Shared context adoption | Used in 80% of complex tasks | 4 weeks |

### 2.3 Non-Goals (Explicit Out of Scope)

- **Full Loa reimplementation** — Use existing Loa capabilities, just improve handoff
- **Runtime framework switching** — Agent-time only, not runtime
- **Automatic multi-repo commits** — Awareness only, user controls commits
- **The Graph / Ponder support** — Envio first, others in future phases

---

## 3. Unified Architecture

### 3.1 Shared Context Location

**Location**: `grimoires/loa/context/`

This extends Loa's existing context directory to serve as the bridge between frameworks.

```
grimoires/loa/context/
├── README.md                    # Context documentation
├── ecosystem/                   # Multi-repo relationships (Issue #22)
│   ├── repos.yaml               # Repository map
│   └── contracts.yaml           # Contract addresses across repos
├── indexer/                     # DX Physics context (Issue #20)
│   ├── README.md
│   └── {chainId}/               # Per-chain cache
│       └── {contract}-{event}.json
├── personas/                    # User personas (existing)
├── brand/                       # Brand guidelines (existing)
└── domain/                      # Domain expertise (existing)
```

### 3.2 Complexity Detection Triggers

Sigil should detect complexity and trigger Loa research in these scenarios:

| Trigger | Detection Method | Action |
|---------|------------------|--------|
| **Indexer work** | `@envio-dev/indexer` + handler files | DX Physics flow |
| **Multi-repo** | References to external repos in code/docs | `/ecosystem` context loading |
| **Unknown contracts** | Contract addresses without local ABI | Loa contract research |
| **Architectural ambiguity** | Task involves system design decisions | Loa `/architect` consultation |
| **Cross-domain** | UI + backend + contracts in single task | Loa decomposition |

### 3.3 Handoff Protocol

```
┌─────────────────────────────────────────────────────────────────┐
│                      HANDOFF PROTOCOL                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. DETECT                                                      │
│     Sigil recognizes complexity trigger                         │
│     └─ Show: "Complexity detected. Gathering context..."        │
│                                                                 │
│  2. GATHER                                                      │
│     Execute appropriate research:                               │
│     ├─ Indexer → RPC block discovery                           │
│     ├─ Multi-repo → Ecosystem mapping                          │
│     ├─ Unknown contract → ABI/behavior research                │
│     └─ Architectural → Loa /architect consultation             │
│                                                                 │
│  3. STORE                                                       │
│     Save context to grimoires/loa/context/                     │
│     └─ Format: Structured JSON/YAML for machine readability    │
│                                                                 │
│  4. ENRICH                                                      │
│     Update Sigil's understanding with gathered context         │
│     └─ Show: Analysis box with enriched information            │
│                                                                 │
│  5. CONTINUE                                                    │
│     Return to normal Sigil workflow                            │
│     └─ Physics now informed by gathered context                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 DX Physics as First Application

DX Physics demonstrates the pattern:

| Step | DX Physics Implementation |
|------|---------------------------|
| DETECT | `@envio-dev/indexer` in package.json + handler file |
| GATHER | RPC `eth_getLogs` for block ranges |
| STORE | `grimoires/loa/context/indexer/{chain}/{contract}.json` |
| ENRICH | Show DX Physics analysis box with block ranges |
| CONTINUE | Generate test config, proceed with /implement |

---

## 4. Functional Requirements

### 4.1 Stream 1: Shared Context Infrastructure (P0)

**Requirement**: Establish `grimoires/loa/context/` as the bridge between frameworks.

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| SC-01 | Create context directory structure | All subdirectories exist with README |
| SC-02 | Define context schemas | YAML/JSON schemas for each context type |
| SC-03 | Context read/write protocol | Both Sigil and Loa can read/write |
| SC-04 | Context expiration | Stale context flagged (configurable TTL) |

### 4.2 Stream 2: Complexity Detection (P0)

**Requirement**: Automatically detect when research is needed before crafting.

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| CD-01 | Indexer detection | 100% accuracy for Envio projects |
| CD-02 | Multi-repo detection | Detect external repo references |
| CD-03 | Unknown contract detection | Flag addresses without local ABI |
| CD-04 | Complexity confidence scoring | HIGH/MEDIUM/LOW for each trigger |

**Detection Algorithm**:
```
ComplexityDetector {
  detect(context: WorkContext): ComplexityResult {

    const triggers = []

    // Indexer detection (DX Physics)
    if (hasEnvioDep(context) && isHandlerFile(context.currentFile)) {
      triggers.push({ type: "indexer", confidence: "HIGH" })
    }

    // Multi-repo detection
    if (referencesExternalRepos(context)) {
      triggers.push({ type: "multi-repo", confidence: "MEDIUM" })
    }

    // Unknown contract detection
    const unknownContracts = findUnknownContracts(context)
    if (unknownContracts.length > 0) {
      triggers.push({ type: "unknown-contracts", confidence: "HIGH", contracts: unknownContracts })
    }

    // Architectural ambiguity
    if (involvesSystemDesign(context)) {
      triggers.push({ type: "architectural", confidence: "MEDIUM" })
    }

    return {
      isComplex: triggers.length > 0,
      triggers,
      recommendedAction: determineAction(triggers)
    }
  }
}
```

### 4.3 Stream 3: Handoff Protocol (P0)

**Requirement**: Seamless transitions between Sigil and Loa workflows.

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| HP-01 | Automatic handoff trigger | No user intervention required |
| HP-02 | Context preservation | State maintained across handoff |
| HP-03 | Return to origin | Seamlessly return to Sigil after Loa work |
| HP-04 | Handoff visibility | User sees "Gathering context..." message |

**Handoff Message Format**:
```
┌─ Complexity Detected ──────────────────────────────────────────┐
│                                                                │
│  Trigger:     Indexer work detected (Envio)                    │
│  Confidence:  HIGH                                             │
│                                                                │
│  Gathering context...                                          │
│  └─ Querying RPC for Staked event block ranges                │
│                                                                │
│  [This happens automatically, no action needed]                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 4.4 Stream 4: DX Physics (P0)

**Requirement**: Fast feedback loops for indexer development.

(See original PRD sections for full DX Physics requirements)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| DX-01 | Envio detection | Package.json + file pattern detection |
| DX-02 | RPC block discovery | eth_getLogs for accurate ranges |
| DX-03 | Test config generation | Valid envio.test.yaml |
| DX-04 | GraphQL verification | Valid verification query |
| DX-05 | 24-hour caching | Minimize RPC calls |

### 4.5 Stream 5: New Commands (P1)

**Requirement**: Commands to manually trigger research when needed.

| Command | Purpose | Triggers |
|---------|---------|----------|
| `/understand` | Research before crafting | Manual trigger for Loa analysis |
| `/ecosystem` | Map multi-repo relationships | Manual trigger for repo mapping |

**`/understand` Flow**:
```
User: /understand "how does the staking vault work"
      │
      ▼
┌─────────────────────────────────────────────────────────────────┐
│  UNDERSTAND WORKFLOW                                            │
│                                                                 │
│  1. Check grimoires/loa/context/ for existing knowledge         │
│  2. If missing: Trigger Loa research                           │
│     └─ Search codebase for StakingVault                        │
│     └─ Analyze contract interactions                           │
│     └─ Document in context/domain/staking-vault.md             │
│  3. Return summary to user                                      │
│  4. Context now available for subsequent /craft commands        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Technical Requirements

### 5.1 Context Schema Definitions

**Ecosystem Context** (`grimoires/loa/context/ecosystem/repos.yaml`):
```yaml
# Repository relationships for multi-repo awareness
repositories:
  - name: "thj-staking"
    path: "../thj-staking"
    type: "contracts"
    contracts:
      - name: "StakingVault"
        address: "0x..."
        chainId: 80094

  - name: "thj-indexer"
    path: "../thj-indexer"
    type: "indexer"
    indexes:
      - contract: "StakingVault"
        events: ["Staked", "Unstaked"]

  - name: "thj-ui"
    path: "../thj-ui"
    type: "frontend"
    consumes:
      - "thj-indexer"
```

**Indexer Context** (`grimoires/loa/context/indexer/{chainId}/{contract}-{event}.json`):
```json
{
  "contractAddress": "0x1234...5678",
  "event": "Staked",
  "chainId": 80094,
  "discoveredAt": "2026-01-19T14:30:00Z",
  "expiresAt": "2026-01-20T14:30:00Z",
  "blockRanges": [{
    "startBlock": 15899050,
    "endBlock": 15899150,
    "confidence": "HIGH",
    "eventsInRange": 7
  }]
}
```

**Domain Context** (`grimoires/loa/context/domain/{topic}.md`):
```markdown
# Staking Vault

## Overview
The StakingVault contract handles user deposits and reward distribution.

## Key Functions
- `stake(uint256 amount)` - Deposit tokens
- `unstake(uint256 amount)` - Withdraw tokens
- `claimRewards()` - Claim accumulated rewards

## Events
- `Staked(address indexed user, uint256 amount)`
- `Unstaked(address indexed user, uint256 amount)`

## Related Contracts
- RewardDistributor (0x...)
- GovernanceToken (0x...)

## Source
Gathered via /understand on 2026-01-19
```

### 5.2 Detection Rules Location

**File**: `.claude/rules/18-sigil-complexity.md`

This rule file handles:
1. Complexity detection triggers
2. Handoff protocol
3. DX Physics (indexer-specific)

### 5.3 Integration with Existing Commands

| Command | Enhancement |
|---------|-------------|
| `/implement` | Add Phase 0.5 for complexity detection |
| `/craft` | Check context before physics analysis |
| `/ward` | Validate against domain context |

---

## 6. Scope & Prioritization

### 6.1 Phase 1: Foundation (Days 1-3)

**Focus**: Shared context infrastructure + basic complexity detection

- [ ] Create `grimoires/loa/context/` structure
- [ ] Define context schemas (ecosystem, indexer, domain)
- [ ] Create `.claude/rules/18-sigil-complexity.md`
- [ ] Implement indexer detection (DX Physics trigger)
- [ ] Add complexity detection to /implement

### 6.2 Phase 2: DX Physics (Days 4-6)

**Focus**: Complete DX Physics implementation

- [ ] Envio config parser
- [ ] RPC block range discovery
- [ ] Block range caching (24-hour TTL)
- [ ] Test config generation (envio.test.yaml)
- [ ] GraphQL verification templates
- [ ] DX Physics analysis box

### 6.3 Phase 3: Handoff Protocol (Days 7-9)

**Focus**: Seamless framework transitions

- [ ] Automatic handoff trigger
- [ ] Context preservation across handoff
- [ ] Return-to-origin mechanism
- [ ] Handoff visibility messaging
- [ ] Integration with Loa commands

### 6.4 Phase 4: New Commands (Days 10-12)

**Focus**: Manual research triggers

- [ ] `/understand` command implementation
- [ ] `/ecosystem` command implementation
- [ ] Integration with shared context
- [ ] Documentation and examples

### 6.5 Future Phases (Backlog)

- The Graph / Ponder support
- Multi-repo commit coordination
- Cross-project context sharing
- Ecosystem visualization

---

## 7. Risks & Dependencies

### 7.1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| RPC rate limiting | DX Physics fails | 24-hour caching |
| Context staleness | Wrong decisions | TTL + refresh mechanism |
| Handoff complexity | User confusion | Clear messaging, minimal friction |
| Detection false positives | Unnecessary research | Confidence scoring + user override |

### 7.2 Dependencies

| Dependency | Owner | Status |
|------------|-------|--------|
| Loa framework | THJ | Available |
| Envio CLI | Envio | Available |
| RPC endpoints | User | User provides |

---

## 8. Open Questions

1. **Context conflict resolution**: What happens when Sigil and Loa write conflicting context?
   - Proposed: Last-write-wins with audit trail

2. **Handoff depth**: How many levels of research before returning to craft?
   - Proposed: Max 2 levels, user can override

3. **Multi-repo scope**: How far to traverse repository relationships?
   - Proposed: Direct dependencies only (1 level)

---

## 9. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-19 | Claude | Unified PRD from Issues #20 + #22 |

---

*"Know when to research, know when to craft. Seamless handoff between understanding and building."*

```
    ╔═══════════════════════════════════════════════════╗
    ║  UNIFIED PRD COMPLETE                             ║
    ║  Ready for /architect                             ║
    ╚═══════════════════════════════════════════════════╝
```
