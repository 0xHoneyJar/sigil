# Unified SDD: Sigil ↔ Loa Synergy + DX Physics

```
    ╔═══════════════════════════════════════════════════╗
    ║  ✦ SIGIL + LOA: UNIFIED ARCHITECTURE             ║
    ║  "Complexity detection → Handoff → Seamless flow"║
    ╚═══════════════════════════════════════════════════╝
```

**Version**: 1.0.0
**Last Updated**: 2026-01-19
**Status**: Architecture Complete
**PRD Reference**: `grimoires/loa/prd-unified.md`

---

## 1. Executive Summary

This SDD defines the unified architecture for Sigil ↔ Loa synergy, with DX Physics as the first application of the complexity detection and handoff pattern.

**Core Components**:
1. **Shared Context Infrastructure** — `grimoires/loa/context/` as bridge
2. **Complexity Detector** — Automatic trigger recognition
3. **Handoff Protocol** — Seamless Sigil ↔ Loa transitions
4. **DX Physics** — First application: indexer optimization

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UNIFIED FRAMEWORK ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                        ┌──────────────────────┐                             │
│                        │  Complexity Detector │                             │
│                        │                      │                             │
│                        │  • Indexer trigger   │                             │
│                        │  • Multi-repo trigger│                             │
│                        │  • Unknown contract  │                             │
│                        │  • Architectural     │                             │
│                        └──────────┬───────────┘                             │
│                                   │                                         │
│                    ┌──────────────┼──────────────┐                          │
│                    │              │              │                          │
│                    ▼              ▼              ▼                          │
│            ┌────────────┐  ┌────────────┐  ┌────────────┐                   │
│            │ DX Physics │  │  Ecosystem │  │   Domain   │                   │
│            │  Handler   │  │   Handler  │  │  Handler   │                   │
│            │            │  │            │  │            │                   │
│            │ RPC Query  │  │ Repo Map   │  │ Loa Consult│                   │
│            │ Block Range│  │ Contract   │  │ Research   │                   │
│            │ Test Config│  │ Mapping    │  │ Document   │                   │
│            └─────┬──────┘  └─────┬──────┘  └─────┬──────┘                   │
│                  │               │               │                          │
│                  └───────────────┼───────────────┘                          │
│                                  │                                          │
│                                  ▼                                          │
│                   ┌──────────────────────────────┐                          │
│                   │   SHARED CONTEXT STORE       │                          │
│                   │                              │                          │
│                   │   grimoires/loa/context/     │                          │
│                   │   ├── indexer/               │                          │
│                   │   ├── ecosystem/             │                          │
│                   │   └── domain/                │                          │
│                   └──────────────┬───────────────┘                          │
│                                  │                                          │
│                                  ▼                                          │
│                   ┌──────────────────────────────┐                          │
│                   │      HANDOFF PROTOCOL        │                          │
│                   │                              │                          │
│                   │  1. Detect → 2. Gather →     │                          │
│                   │  3. Store  → 4. Enrich →     │                          │
│                   │  5. Continue                 │                          │
│                   └──────────────────────────────┘                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Interactions

```
User: /implement sprint-1
            │
            ▼
┌───────────────────────────────────────────────────────────────┐
│                    COMPLEXITY DETECTOR                        │
│                                                               │
│  Input:  Current file, package.json, task description         │
│  Check:  Indexer? Multi-repo? Unknown contracts? Arch?        │
│  Output: { triggers: [...], isComplex: bool }                 │
└───────────────────────────────────────────────────────────────┘
            │
            ▼ (if complex)
┌───────────────────────────────────────────────────────────────┐
│                     HANDOFF PROTOCOL                          │
│                                                               │
│  1. Show "Complexity detected..." message                     │
│  2. Route to appropriate handler (DX/Ecosystem/Domain)        │
│  3. Handler gathers context (RPC/files/Loa)                   │
│  4. Store in grimoires/loa/context/                           │
│  5. Return enriched context to original workflow              │
└───────────────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────┐
│                   ENRICHED WORKFLOW                           │
│                                                               │
│  Original command continues with additional context           │
│  • /implement → DX Physics test config available              │
│  • /craft → Domain knowledge available                        │
│  • /ward → Ecosystem relationships known                      │
└───────────────────────────────────────────────────────────────┘
```

---

## 3. Component Design

### 3.1 Complexity Detector

**Purpose**: Identify when specialized research is needed before crafting.

**Location**: `.claude/rules/18-sigil-complexity.md`

**Algorithm**:
```
ComplexityDetector {

  detect(context: WorkContext): ComplexityResult {
    const triggers: Trigger[] = []

    // 1. INDEXER DETECTION (DX Physics)
    if (this.detectIndexer(context)) {
      triggers.push({
        type: "indexer",
        confidence: this.getIndexerConfidence(context),
        handler: "dx-physics",
        data: {
          framework: "envio",
          configPath: "envio.config.ts",
          handlerFile: context.currentFile
        }
      })
    }

    // 2. MULTI-REPO DETECTION
    if (this.detectMultiRepo(context)) {
      triggers.push({
        type: "multi-repo",
        confidence: "MEDIUM",
        handler: "ecosystem",
        data: {
          externalRefs: this.findExternalReferences(context)
        }
      })
    }

    // 3. UNKNOWN CONTRACT DETECTION
    const unknownContracts = this.findUnknownContracts(context)
    if (unknownContracts.length > 0) {
      triggers.push({
        type: "unknown-contracts",
        confidence: "HIGH",
        handler: "domain",
        data: { contracts: unknownContracts }
      })
    }

    // 4. ARCHITECTURAL AMBIGUITY
    if (this.detectArchitecturalAmbiguity(context)) {
      triggers.push({
        type: "architectural",
        confidence: "MEDIUM",
        handler: "domain",
        data: { requiresLoa: true }
      })
    }

    return {
      isComplex: triggers.length > 0,
      triggers,
      recommendedAction: this.determineAction(triggers)
    }
  }

  // Indexer detection (DX Physics)
  detectIndexer(context: WorkContext): boolean {
    const packageJson = readFile("package.json")
    const hasEnvioDep = packageJson?.dependencies?.["@envio-dev/indexer"]
    const hasEnvioConfig = fileExists("envio.config.ts") || fileExists("config.yaml")
    const isHandlerFile = this.isHandlerFile(context.currentFile)

    return (hasEnvioDep || hasEnvioConfig) && isHandlerFile
  }

  isHandlerFile(filePath: string): boolean {
    const patterns = [
      "src/EventHandlers.ts",
      "src/*Handler*.ts",
      "src/loaders/*.ts"
    ]
    return patterns.some(p => matchGlob(filePath, p))
  }

  getIndexerConfidence(context: WorkContext): "HIGH" | "MEDIUM" | "LOW" {
    const hasPackage = hasEnvioDep(context)
    const hasConfig = hasEnvioConfig(context)

    if (hasPackage && hasConfig) return "HIGH"
    if (hasPackage || hasConfig) return "MEDIUM"
    return "LOW"
  }

  // Multi-repo detection
  detectMultiRepo(context: WorkContext): boolean {
    // Check for:
    // - Import paths like "../other-repo/"
    // - References in docs to external repos
    // - Contract addresses that map to other repos
    return this.findExternalReferences(context).length > 0
  }

  // Unknown contract detection
  findUnknownContracts(context: WorkContext): ContractRef[] {
    // Find contract addresses in code that:
    // - Don't have local ABI
    // - Aren't in context/ecosystem/contracts.yaml
    const addresses = this.extractContractAddresses(context)
    return addresses.filter(a => !this.hasLocalABI(a) && !this.isKnownContract(a))
  }

  // Architectural ambiguity
  detectArchitecturalAmbiguity(context: WorkContext): boolean {
    // Detect when task involves:
    // - System design decisions
    // - Cross-layer changes (UI + backend + contracts)
    // - New service creation
    const keywords = ["architect", "design", "system", "infrastructure"]
    return keywords.some(k => context.taskDescription?.includes(k))
  }
}
```

**Output Schema**:
```typescript
interface ComplexityResult {
  isComplex: boolean
  triggers: Trigger[]
  recommendedAction: Action
}

interface Trigger {
  type: "indexer" | "multi-repo" | "unknown-contracts" | "architectural"
  confidence: "HIGH" | "MEDIUM" | "LOW"
  handler: "dx-physics" | "ecosystem" | "domain"
  data: Record<string, any>
}

interface Action {
  type: "gather-context" | "skip"
  handlers: string[]
  message: string
}
```

### 3.2 Shared Context Store

**Purpose**: Bridge between Sigil and Loa with structured context storage.

**Location**: `grimoires/loa/context/`

**Directory Structure**:
```
grimoires/loa/context/
├── README.md                           # Documentation
├── .context-config.yaml                # TTL, write permissions
│
├── indexer/                            # DX Physics context
│   ├── README.md
│   └── {chainId}/
│       └── {contract}-{event}.json     # Block range cache
│
├── ecosystem/                          # Multi-repo context
│   ├── repos.yaml                      # Repository relationships
│   └── contracts.yaml                  # Cross-repo contract map
│
├── domain/                             # Domain knowledge
│   └── {topic}.md                      # Research results
│
├── personas/                           # User personas (existing)
├── brand/                              # Brand guidelines (existing)
└── sessions/                           # Session-specific context
    └── {date}-{id}.json                # Temporary context
```

**Configuration** (`.context-config.yaml`):
```yaml
# Context store configuration
ttl:
  indexer: 24h          # Block range cache expires after 24 hours
  ecosystem: 7d         # Repo relationships refresh weekly
  domain: 30d           # Domain knowledge refreshes monthly
  sessions: 1h          # Session context expires after 1 hour

write_permissions:
  sigil:
    - indexer/**
    - sessions/**
  loa:
    - domain/**
    - ecosystem/**
    - sessions/**

conflict_resolution: last-write-wins
audit_trail: true
```

### 3.3 Handoff Protocol

**Purpose**: Seamless transitions between Sigil and Loa workflows.

**Location**: `.claude/rules/18-sigil-complexity.md` (handoff section)

**Protocol Implementation**:
```
HandoffProtocol {

  async execute(triggers: Trigger[]): Promise<EnrichedContext> {

    // 1. DETECT (already done by ComplexityDetector)
    this.showMessage("Complexity detected. Gathering context...")

    // 2. GATHER - Route to appropriate handler(s)
    const contexts: GatheredContext[] = []

    for (const trigger of triggers) {
      const handler = this.getHandler(trigger.handler)
      const context = await handler.gather(trigger.data)
      contexts.push(context)
    }

    // 3. STORE - Save to shared context store
    for (const context of contexts) {
      await this.storeContext(context)
    }

    // 4. ENRICH - Combine contexts for workflow
    const enrichedContext = this.mergeContexts(contexts)

    // 5. CONTINUE - Return to original workflow
    this.showEnrichedAnalysis(enrichedContext)

    return enrichedContext
  }

  getHandler(type: string): ContextHandler {
    switch (type) {
      case "dx-physics":
        return new DXPhysicsHandler()
      case "ecosystem":
        return new EcosystemHandler()
      case "domain":
        return new DomainHandler()
    }
  }

  async storeContext(context: GatheredContext): Promise<void> {
    const path = this.getContextPath(context.type)
    const content = JSON.stringify(context.data, null, 2)
    await writeFile(path, content)
  }

  showMessage(message: string): void {
    // Display to user
    console.log(`
┌─ Handoff ──────────────────────────────────────────────────────┐
│  ${message.padEnd(60)}│
└────────────────────────────────────────────────────────────────┘
    `)
  }

  showEnrichedAnalysis(context: EnrichedContext): void {
    // Display enriched analysis box (format depends on trigger type)
  }
}
```

**Handoff Message Flow**:
```
┌─ Complexity Detected ──────────────────────────────────────────┐
│                                                                │
│  Triggers found:                                               │
│  • Indexer work (Envio) - HIGH confidence                     │
│                                                                │
│  Gathering context...                                          │
│  └─ [1/1] Querying RPC for block ranges                       │
│                                                                │
└────────────────────────────────────────────────────────────────┘

[After gathering completes]

┌─ Context Gathered ─────────────────────────────────────────────┐
│                                                                │
│  DX Physics:                                                   │
│  • Event: Staked                                               │
│  • Block range: 15899050 - 15899150                           │
│  • Events in range: 7                                          │
│  • Cached at: grimoires/loa/context/indexer/80094/...         │
│                                                                │
│  Ready to continue with enriched context.                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 3.4 DX Physics Handler

**Purpose**: Gather indexer-specific context (block ranges, test configs).

**Location**: Part of `.claude/rules/18-sigil-complexity.md`

**Implementation**:
```
DXPhysicsHandler implements ContextHandler {

  async gather(data: IndexerTriggerData): Promise<GatheredContext> {

    // 1. Parse envio.config.ts
    const config = await this.parseEnvioConfig(data.configPath)

    // 2. Identify target event from current work
    const targetEvent = this.identifyTargetEvent(data.handlerFile, config)

    // 3. Check cache first
    const cached = await this.checkCache(config.chainId, config.contractAddress, targetEvent)
    if (cached && !cached.expired) {
      return {
        type: "dx-physics",
        source: "cache",
        data: cached
      }
    }

    // 4. Query RPC for block ranges
    const blockRange = await this.discoverBlockRange(config, targetEvent)

    // 5. Generate test config
    const testConfig = this.generateTestConfig(config, targetEvent, blockRange)

    // 6. Generate verification query
    const verificationQuery = this.generateVerificationQuery(targetEvent, blockRange)

    return {
      type: "dx-physics",
      source: "rpc",
      data: {
        blockRange,
        testConfig,
        verificationQuery,
        estimatedSyncTime: this.estimateSyncTime(blockRange)
      }
    }
  }

  async discoverBlockRange(config: EnvioConfig, event: string): Promise<BlockRange> {
    const rpcUrl = this.resolveRpcUrl(config)

    // Query eth_getLogs for event occurrences
    const logs = await this.ethGetLogs({
      address: config.contractAddress,
      topics: [this.eventSignature(event)],
      fromBlock: await this.getCurrentBlock(rpcUrl) - 100000,
      toBlock: "latest"
    })

    if (logs.length === 0) {
      // Fallback to contract creation block
      const creationBlock = await this.getContractCreationBlock(config.contractAddress, rpcUrl)
      return {
        startBlock: creationBlock,
        endBlock: creationBlock + 1000,
        confidence: "LOW",
        eventsInRange: 0,
        warning: "No recent events found. Using contract creation block."
      }
    }

    // Select window around median event
    const medianBlock = logs[Math.floor(logs.length / 2)].blockNumber
    return {
      startBlock: medianBlock - 50,
      endBlock: medianBlock + 50,
      confidence: "HIGH",
      eventsInRange: logs.filter(l =>
        l.blockNumber >= medianBlock - 50 &&
        l.blockNumber <= medianBlock + 50
      ).length
    }
  }

  generateTestConfig(config: EnvioConfig, event: string, range: BlockRange): string {
    return `# Generated by Sigil DX Physics
# Block range: ${range.startBlock} - ${range.endBlock}
# Events expected: ${range.eventsInRange}

name: "test-${event.toLowerCase()}"

networks:
  - id: ${config.chainId}
    start_block: ${range.startBlock}
    end_block: ${range.endBlock}
    rpc_config:
      url: "\${${config.rpcEnvVar}}"

contracts:
  - name: "${config.contractName}"
    address: "${config.contractAddress}"
    handler: "${config.handlerPath}"
    events:
      - event: "${event}"
`
  }
}
```

### 3.5 Ecosystem Handler

**Purpose**: Gather multi-repo relationship context.

**Implementation**:
```
EcosystemHandler implements ContextHandler {

  async gather(data: EcosystemTriggerData): Promise<GatheredContext> {

    // 1. Check existing ecosystem map
    const existing = await this.readEcosystemMap()

    // 2. Discover new relationships from references
    const newRefs = data.externalRefs.filter(ref =>
      !existing.repositories.some(r => r.path === ref.path)
    )

    if (newRefs.length > 0) {
      // 3. Analyze new repositories
      for (const ref of newRefs) {
        const repoInfo = await this.analyzeRepository(ref.path)
        existing.repositories.push(repoInfo)
      }

      // 4. Update ecosystem map
      await this.writeEcosystemMap(existing)
    }

    return {
      type: "ecosystem",
      source: "analysis",
      data: existing
    }
  }

  async analyzeRepository(path: string): Promise<RepoInfo> {
    // Determine repo type from contents
    const hasContracts = await fileExists(`${path}/contracts/`)
    const hasIndexer = await fileExists(`${path}/envio.config.ts`)
    const hasFrontend = await fileExists(`${path}/package.json`) &&
                        (await readFile(`${path}/package.json`)).includes("react")

    return {
      path,
      type: hasContracts ? "contracts" :
            hasIndexer ? "indexer" :
            hasFrontend ? "frontend" : "unknown",
      contracts: hasContracts ? await this.extractContracts(path) : [],
      events: hasIndexer ? await this.extractEvents(path) : []
    }
  }
}
```

### 3.6 Domain Handler

**Purpose**: Gather domain knowledge via Loa consultation.

**Implementation**:
```
DomainHandler implements ContextHandler {

  async gather(data: DomainTriggerData): Promise<GatheredContext> {

    // 1. Check existing domain knowledge
    const topic = this.identifyTopic(data)
    const existingPath = `grimoires/loa/context/domain/${topic}.md`

    if (await fileExists(existingPath)) {
      const existing = await readFile(existingPath)
      const age = this.getFileAge(existingPath)

      if (age < 30 * 24 * 60 * 60 * 1000) { // 30 days
        return {
          type: "domain",
          source: "cache",
          data: { topic, content: existing }
        }
      }
    }

    // 2. Trigger Loa research (if contracts)
    if (data.contracts?.length > 0) {
      const research = await this.researchContracts(data.contracts)
      await this.storeDomainKnowledge(topic, research)
      return {
        type: "domain",
        source: "loa-research",
        data: { topic, content: research }
      }
    }

    // 3. Trigger Loa architectural consultation
    if (data.requiresLoa) {
      const consultation = await this.consultLoa(data)
      await this.storeDomainKnowledge(topic, consultation)
      return {
        type: "domain",
        source: "loa-consultation",
        data: { topic, content: consultation }
      }
    }

    return {
      type: "domain",
      source: "none",
      data: { topic, content: null }
    }
  }

  async researchContracts(contracts: ContractRef[]): Promise<string> {
    // Use Loa to research unknown contracts
    // - Fetch ABI from block explorer
    // - Analyze function signatures
    // - Document key behaviors
    // Returns markdown documentation
  }
}
```

---

## 4. Data Architecture

### 4.1 Context Schemas

**Indexer Context** (`indexer/{chainId}/{contract}-{event}.json`):
```json
{
  "contractAddress": "0x1234...5678",
  "event": "Staked",
  "chainId": 80094,
  "discoveredAt": "2026-01-19T14:30:00Z",
  "expiresAt": "2026-01-20T14:30:00Z",
  "rpcUsed": "berachain-mainnet",
  "blockRanges": [{
    "startBlock": 15899050,
    "endBlock": 15899150,
    "confidence": "HIGH",
    "eventsInRange": 7,
    "discoveredAt": "2026-01-19T14:30:00Z"
  }],
  "testConfig": "envio.test.yaml",
  "verificationQuery": "verification-staked.graphql"
}
```

**Ecosystem Context** (`ecosystem/repos.yaml`):
```yaml
lastUpdated: "2026-01-19T14:30:00Z"

repositories:
  - name: "thj-staking"
    path: "../thj-staking"
    type: "contracts"
    contracts:
      - name: "StakingVault"
        address: "0x1234...5678"
        chainId: 80094
        events: ["Staked", "Unstaked", "RewardsClaimed"]

  - name: "thj-indexer"
    path: "."
    type: "indexer"
    indexes:
      - contract: "StakingVault"
        events: ["Staked", "Unstaked"]

relationships:
  - from: "thj-indexer"
    to: "thj-staking"
    type: "indexes"
  - from: "thj-ui"
    to: "thj-indexer"
    type: "consumes"
```

**Domain Context** (`domain/{topic}.md`):
```markdown
---
topic: staking-vault
discoveredAt: 2026-01-19T14:30:00Z
source: loa-research
contracts:
  - "0x1234...5678"
---

# Staking Vault

## Overview
The StakingVault contract manages user deposits for the THJ staking system.

## Key Functions
| Function | Parameters | Description |
|----------|------------|-------------|
| `stake` | `uint256 amount` | Deposit tokens into vault |
| `unstake` | `uint256 amount` | Withdraw tokens from vault |
| `claimRewards` | none | Claim accumulated rewards |

## Events
- `Staked(address indexed user, uint256 amount)` - Emitted on deposit
- `Unstaked(address indexed user, uint256 amount)` - Emitted on withdrawal

## Related Contracts
- RewardDistributor (`0xabcd...`) - Handles reward calculations
- GovernanceToken (`0xefgh...`) - The staked token

## Discovered Behaviors
- Minimum stake: 100 tokens
- Unstake cooldown: 7 days
- Rewards accrue per block
```

---

## 5. Integration Points

### 5.1 Rule File Structure

**New File**: `.claude/rules/18-sigil-complexity.md`

```markdown
# Sigil: Complexity Detection & Handoff

<complexity_detection>
## Complexity Detector
[Detection algorithm and triggers]
</complexity_detection>

<handoff_protocol>
## Handoff Protocol
[5-step protocol: Detect → Gather → Store → Enrich → Continue]
</handoff_protocol>

<dx_physics>
## DX Physics Handler
[Indexer detection, RPC discovery, test config generation]
</dx_physics>

<ecosystem_handler>
## Ecosystem Handler
[Multi-repo detection, relationship mapping]
</ecosystem_handler>

<domain_handler>
## Domain Handler
[Loa consultation, contract research]
</domain_handler>

<context_store>
## Shared Context Store
[grimoires/loa/context/ structure and schemas]
</context_store>
```

### 5.2 Command Modifications

| Command | Modification |
|---------|-------------|
| `/implement` | Add Phase 0.5: Complexity Detection |
| `/craft` | Check domain context before physics |
| `/ward` | Validate against ecosystem relationships |

### 5.3 New Commands

| Command | Purpose | Handler |
|---------|---------|---------|
| `/understand` | Manual research trigger | Domain Handler |
| `/ecosystem` | Manual repo mapping | Ecosystem Handler |

---

## 6. Performance Targets

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Complexity detection | <100ms | Time to analyze triggers |
| Cache lookup | <50ms | Time to read context file |
| RPC block discovery | <5s | Time for eth_getLogs |
| Context storage | <100ms | Time to write context file |
| Total handoff overhead | <10s | End-to-end for complex tasks |

---

## 7. Security Considerations

| Concern | Mitigation |
|---------|------------|
| RPC URL exposure | Store only env var names, not values |
| Stale context | TTL-based expiration + audit trail |
| Context conflicts | Last-write-wins + audit log |
| Sensitive data in domain | Review before storing, no private keys |

---

## 8. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-19 | Claude | Unified SDD from PRD |

---

```
    ╔═══════════════════════════════════════════════════╗
    ║  UNIFIED SDD COMPLETE                             ║
    ║  Ready for sprint planning                        ║
    ╚═══════════════════════════════════════════════════╝
```
