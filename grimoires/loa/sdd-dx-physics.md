# DX Physics: Software Design Document

```
    ╔═══════════════════════════════════════════════════╗
    ║  ✦ SIGIL: DX PHYSICS SDD                         ║
    ║  "Dead accurate block ranges for fast feedback"  ║
    ╚═══════════════════════════════════════════════════╝
```

**Version**: 1.0.0
**Last Updated**: 2026-01-19
**Status**: Architecture Complete
**PRD Reference**: `grimoires/loa/prd-dx-physics.md`

---

## 1. Executive Summary

This SDD defines the technical architecture for extending Sigil with DX Physics — a system that reduces blockchain indexer feedback loops from hours to seconds through:

1. **Indexer Detection** — Identify Envio projects via package.json + file patterns
2. **RPC-Based Block Discovery** — Query chain for accurate event block ranges
3. **Test Config Generation** — Generate targeted envio.test.yaml files
4. **`/implement` Integration** — Seamless workflow enhancement for indexer work

**Key Architectural Decision**: Block ranges are discovered via RPC queries for **dead accuracy** rather than user-provided estimates or heuristics.

---

## 2. System Architecture

### 2.1 High-Level Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DX Physics Extension                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │   Detector   │───▶│  Discoverer  │───▶│  Config Generator    │  │
│  │              │    │              │    │                      │  │
│  │ • Package.json│    │ • RPC Query  │    │ • envio.test.yaml   │  │
│  │ • File patterns    │ • Event Logs │    │ • GraphQL template   │  │
│  │ • Confidence │    │ • Block Range│    │ • Verification query │  │
│  └──────────────┘    └──────────────┘    └──────────────────────┘  │
│         │                   │                      │                │
│         ▼                   ▼                      ▼                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   /implement Enhancement                     │   │
│  │                                                              │   │
│  │  1. Detect indexer context                                   │   │
│  │  2. Show DX Physics analysis box                             │   │
│  │  3. Discover accurate block ranges (RPC)                     │   │
│  │  4. Generate test config + verification query                │   │
│  │  5. Suggest test-first workflow                              │   │
│  │                                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Interactions

```
User: /implement sprint-1 (working on EventHandlers.ts)
                    │
                    ▼
┌─────────────────────────────────────────┐
│           Indexer Detector              │
│                                         │
│  Input:  package.json, file patterns    │
│  Output: { detected: true,              │
│            framework: "envio",          │
│            confidence: "HIGH" }         │
└─────────────────────────────────────────┘
                    │
                    ▼ (if detected)
┌─────────────────────────────────────────┐
│         Block Range Discoverer          │
│                                         │
│  Input:  envio.config.ts, RPC URL       │
│  Action: eth_getLogs for target events  │
│  Output: { event: "Staked",             │
│            firstBlock: 15892340,        │
│            recentBlocks: [15899100...]} │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         Config Generator                │
│                                         │
│  Input:  Block ranges, events, config   │
│  Output: envio.test.yaml                │
│          verification.graphql           │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│       /implement Workflow               │
│                                         │
│  1. Show DX Physics analysis box        │
│  2. Generate test config (on confirm)   │
│  3. Suggest: pnpm envio dev --config... │
│  4. Continue with implementation        │
└─────────────────────────────────────────┘
```

---

## 3. Component Design

### 3.1 Indexer Detector

**Purpose**: Identify when current work context involves blockchain indexer code.

**Location**: `.claude/rules/18-sigil-dx-physics.md` (detection section)

**Algorithm**:

```
IndexerDetector {
  detect(workingDirectory: string): DetectionResult {

    // Step 1: Package.json check
    const packageJson = readFile("package.json")
    const hasEnvioDep = packageJson.dependencies["@envio-dev/indexer"] != null

    // Step 2: Config file check
    const hasEnvioConfig = fileExists("envio.config.ts") || fileExists("config.yaml")

    // Step 3: Confidence scoring
    if (hasEnvioDep && hasEnvioConfig) {
      return { detected: true, framework: "envio", confidence: "HIGH" }
    }
    if (hasEnvioDep || hasEnvioConfig) {
      return { detected: true, framework: "envio", confidence: "MEDIUM" }
    }
    return { detected: false }
  }

  // Step 4: Handler file detection (for triggering DX analysis)
  isHandlerFile(filePath: string): boolean {
    const handlerPatterns = [
      "src/EventHandlers.ts",
      "src/*Handler*.ts",
      "src/loaders/*.ts"
    ]
    return handlerPatterns.some(p => matchGlob(filePath, p))
  }
}
```

**Output Schema**:
```typescript
interface DetectionResult {
  detected: boolean
  framework?: "envio" | "thegraph" | "ponder"  // Only "envio" for v1
  confidence?: "HIGH" | "MEDIUM" | "LOW"
  configPath?: string  // Path to envio.config.ts
  handlerPaths?: string[]  // Detected handler files
}
```

### 3.2 Block Range Discoverer

**Purpose**: Query RPC for accurate block ranges where target events occurred.

**Location**: `.claude/rules/18-sigil-dx-physics.md` (discovery section)

**Why RPC Queries**: Dead accuracy is universally best. Heuristics and user estimates lead to:
- Missed events (block range too narrow)
- Wasted time (block range too wide)
- False negatives (wrong block entirely)

**Algorithm**:

```
BlockRangeDiscoverer {

  // Parse envio.config.ts to extract contract info
  parseConfig(configPath: string): EnvioConfig {
    const content = readFile(configPath)
    // Extract: networks, contracts, events, addresses
    return parseEnvioConfig(content)
  }

  // Query RPC for event occurrences
  async discoverBlockRanges(
    config: EnvioConfig,
    targetEvent: string,
    rpcUrl: string
  ): Promise<BlockRange> {

    const contract = config.contracts.find(c =>
      c.events.includes(targetEvent)
    )

    // Get contract creation block (first block to sync from)
    const creationBlock = await getContractCreationBlock(
      contract.address,
      rpcUrl
    )

    // Get recent event occurrences (last 10 for test window)
    const recentEvents = await eth_getLogs({
      address: contract.address,
      topics: [eventSignature(targetEvent)],
      fromBlock: "latest" - 100000,  // ~1 day of blocks
      toBlock: "latest"
    })

    if (recentEvents.length === 0) {
      // Fallback: use contract creation + 1000 blocks
      return {
        startBlock: creationBlock,
        endBlock: creationBlock + 1000,
        confidence: "LOW",
        warning: "No recent events found. Using creation block range."
      }
    }

    // Select a window around recent events
    const targetBlock = recentEvents[Math.floor(recentEvents.length / 2)].blockNumber
    return {
      startBlock: targetBlock - 50,
      endBlock: targetBlock + 50,
      confidence: "HIGH",
      eventsInRange: recentEvents.filter(e =>
        e.blockNumber >= targetBlock - 50 &&
        e.blockNumber <= targetBlock + 50
      ).length
    }
  }
}
```

**RPC Methods Used**:
| Method | Purpose | Rate Impact |
|--------|---------|-------------|
| `eth_getLogs` | Find event occurrences | 1 call, moderate |
| `eth_getCode` | Verify contract exists | 1 call, minimal |
| `eth_getBlockByNumber` | Get block timestamps | Optional, minimal |

**Rate Limit Mitigation**:
- Cache results in `grimoires/sigil/context/indexer/{contractAddress}.json`
- Reuse cached block ranges within 24 hours
- Allow user override if cache is stale

**Output Schema**:
```typescript
interface BlockRange {
  startBlock: number
  endBlock: number
  confidence: "HIGH" | "MEDIUM" | "LOW"
  eventsInRange?: number
  warning?: string
  cachedAt?: string  // ISO timestamp
}

interface BlockRangeCache {
  contractAddress: string
  event: string
  chainId: number
  ranges: BlockRange[]
  discoveredAt: string
  expiresAt: string  // +24 hours
}
```

### 3.3 Config Generator

**Purpose**: Generate envio.test.yaml and GraphQL verification templates.

**Location**: `.claude/rules/18-sigil-dx-physics.md` (generation section)

**Templates**:

#### envio.test.yaml Template
```yaml
# Generated by Sigil DX Physics
# Purpose: Fast feedback loop for ${EVENT_NAME} handler development
# Block range: ${START_BLOCK} - ${END_BLOCK} (${BLOCK_COUNT} blocks, ~${ESTIMATED_TIME})
# Events expected: ${EVENTS_IN_RANGE}

name: "${TEST_NAME}"
description: "Targeted test for ${EVENT_NAME} handler"

networks:
  - id: ${CHAIN_ID}
    start_block: ${START_BLOCK}
    end_block: ${END_BLOCK}
    rpc_config:
      url: "${RPC_ENV_VAR}"

contracts:
  - name: "${CONTRACT_NAME}"
    address: "${CONTRACT_ADDRESS}"
    handler: "${HANDLER_PATH}"
    events:
      - event: "${EVENT_NAME}"
```

#### verification.graphql Template
```graphql
# Generated verification query for ${EVENT_NAME}
# Run after test sync: curl -X POST http://localhost:8080/graphql -d @this_file

query Verify${EVENT_NAME}Test {
  # Check that events were indexed
  ${ENTITY_NAME_PLURAL}(
    first: 10
    orderBy: blockNumber
    orderDirection: desc
  ) {
    id
    ${PRIMARY_FIELDS}
    blockNumber
    transactionHash
  }
}

# Assertions (manual check):
# - At least ${EVENTS_IN_RANGE} results expected
# - All ${PRIMARY_FIELDS} should be non-null
# - blockNumber should be in range [${START_BLOCK}, ${END_BLOCK}]
```

**Generation Logic**:
```
ConfigGenerator {

  generate(
    config: EnvioConfig,
    blockRange: BlockRange,
    targetEvent: string
  ): GeneratedFiles {

    const contract = config.contracts.find(c =>
      c.events.includes(targetEvent)
    )

    // Interpolate test config template
    const testConfig = interpolate(TEST_CONFIG_TEMPLATE, {
      TEST_NAME: `test-${targetEvent.toLowerCase()}`,
      EVENT_NAME: targetEvent,
      CHAIN_ID: config.networks[0].id,
      START_BLOCK: blockRange.startBlock,
      END_BLOCK: blockRange.endBlock,
      BLOCK_COUNT: blockRange.endBlock - blockRange.startBlock,
      ESTIMATED_TIME: estimateSyncTime(blockRange),
      EVENTS_IN_RANGE: blockRange.eventsInRange || "unknown",
      CONTRACT_NAME: contract.name,
      CONTRACT_ADDRESS: contract.address,
      HANDLER_PATH: contract.handler,
      RPC_ENV_VAR: getRpcEnvVar(config.networks[0].id)
    })

    // Interpolate verification query template
    const verificationQuery = interpolate(VERIFICATION_TEMPLATE, {
      EVENT_NAME: targetEvent,
      ENTITY_NAME_PLURAL: pluralize(entityName(targetEvent)),
      PRIMARY_FIELDS: extractEntityFields(targetEvent),
      EVENTS_IN_RANGE: blockRange.eventsInRange,
      START_BLOCK: blockRange.startBlock,
      END_BLOCK: blockRange.endBlock
    })

    return {
      testConfigPath: "envio.test.yaml",
      testConfigContent: testConfig,
      verificationPath: `verification-${targetEvent.toLowerCase()}.graphql`,
      verificationContent: verificationQuery
    }
  }

  // Estimate sync time based on block count
  estimateSyncTime(range: BlockRange): string {
    const blocks = range.endBlock - range.startBlock
    if (blocks <= 100) return "~30 seconds"
    if (blocks <= 1000) return "~2 minutes"
    if (blocks <= 10000) return "~10 minutes"
    return "~30+ minutes"
  }
}
```

### 3.4 /implement Integration

**Purpose**: Enhance `/implement` command to detect indexer context and offer DX Physics workflow.

**Location**: Modify `.claude/commands/implement.md` and `.claude/skills/implementing-tasks/SKILL.md`

**Integration Points**:

```yaml
# Addition to implement.md frontmatter
context_files:
  # ... existing context files ...

  # DX Physics integration
  - path: "envio.config.ts"
    required: false
    purpose: "Envio indexer configuration (triggers DX Physics)"
  - path: "package.json"
    required: false
    purpose: "Dependency detection for indexer frameworks"
```

**Workflow Enhancement**:

```
/implement sprint-1
      │
      ▼
┌─────────────────────────────────────────┐
│  Phase 0.5: DX Physics Pre-Check        │
│                                         │
│  1. Run Indexer Detector                │
│  2. If detected + handler file modified:│
│     → Show DX Physics analysis box      │
│     → Offer test config generation      │
│  3. If accepted:                        │
│     → Run Block Range Discoverer        │
│     → Generate test config + queries    │
│     → Add to outputs                    │
│  4. Continue with normal implementation │
└─────────────────────────────────────────┘
      │
      ▼
  [Normal /implement workflow continues]
```

**DX Physics Analysis Box**:
```
┌─ DX Physics Detected ──────────────────────────────────┐
│                                                        │
│  Context:     Envio Indexer Handler (HIGH confidence)  │
│  Config:      envio.config.ts                          │
│  Handler:     src/EventHandlers.ts                     │
│                                                        │
│  Current Issue:                                        │
│  Full sync takes ~4 hours. Handler iteration is slow.  │
│                                                        │
│  DX Physics Recommendation:                            │
│  Generate targeted test config for fast feedback.      │
│                                                        │
│  Discovering block ranges via RPC...                   │
│                                                        │
│  Target event:  Staked                                 │
│  Block range:   15899050 - 15899150 (100 blocks)       │
│  Events found:  7 occurrences in range                 │
│  Est. sync:     ~30 seconds                            │
│                                                        │
│  Generated files:                                      │
│  • envio.test.yaml                                     │
│  • verification-staked.graphql                         │
│                                                        │
│  [y] Generate test config + continue                   │
│  [n] Skip, use full sync                               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 4. Data Architecture

### 4.1 Block Range Cache

**Location**: `grimoires/sigil/context/indexer/`

**Schema**:
```
grimoires/sigil/context/indexer/
├── README.md                           # Cache documentation
├── berachain-80094/                    # Per-chain directory
│   ├── 0x1234...5678-Staked.json      # Per-contract-event cache
│   └── 0x1234...5678-Unstaked.json
└── ethereum-1/
    └── ...
```

**Cache File Format**:
```json
{
  "contractAddress": "0x1234...5678",
  "event": "Staked",
  "chainId": 80094,
  "chainName": "berachain",
  "discoveredAt": "2026-01-19T14:30:00Z",
  "expiresAt": "2026-01-20T14:30:00Z",
  "rpcUsed": "https://rpc.berachain.com",
  "blockRanges": [
    {
      "startBlock": 15899050,
      "endBlock": 15899150,
      "confidence": "HIGH",
      "eventsInRange": 7,
      "discoveredAt": "2026-01-19T14:30:00Z"
    }
  ],
  "contractCreationBlock": 12000000
}
```

### 4.2 DX Taste Signals

**Extension to**: `grimoires/sigil/taste.md`

When DX Physics generates a test config and user provides feedback, log it:

```yaml
---
timestamp: "2026-01-19T14:35:00Z"
signal: ACCEPT
source: cli
component:
  name: "DX Physics - Test Config"
  effect: "DX"
  craft_type: "generate"
dx_physics:
  framework: "envio"
  event: "Staked"
  block_range:
    start: 15899050
    end: 15899150
  sync_time_actual: "28s"
  events_indexed: 7
learning:
  inference: "100-block range is sufficient for Staked event testing"
---
```

---

## 5. API Design

### 5.1 RPC Interface

DX Physics uses standard Ethereum JSON-RPC methods. No custom APIs required.

**Required RPC Methods**:

| Method | Parameters | Purpose |
|--------|------------|---------|
| `eth_getLogs` | `{ address, topics, fromBlock, toBlock }` | Find event occurrences |
| `eth_blockNumber` | none | Get current block number |
| `eth_getCode` | `address, blockTag` | Verify contract exists |

**RPC URL Resolution**:

```
1. Check envio.config.ts for rpc_config.url
2. If env var reference (${VAR}), resolve from environment
3. If not found, prompt user for RPC URL
4. Cache RPC URL for session
```

### 5.2 Envio Config Parser

**Input**: `envio.config.ts` TypeScript file

**Output**: Structured config object

```typescript
interface EnvioConfig {
  networks: Array<{
    id: number
    rpc_config: {
      url: string  // May be env var reference like "${BERACHAIN_RPC_URL}"
    }
  }>
  contracts: Array<{
    name: string
    network: string
    address: string
    handler: string
    events: string[]  // Event names like "Staked", "Unstaked"
  }>
}
```

**Parsing Strategy**:

```
1. Read envio.config.ts as text
2. Use regex to extract key structures:
   - networks: look for `networks: [{...}]` pattern
   - contracts: look for `contracts: [{...}]` pattern
3. For complex configs, use TypeScript parser (if available)
4. Fallback: prompt user for contract/event info
```

---

## 6. Security Architecture

### 6.1 RPC Security

| Concern | Mitigation |
|---------|------------|
| RPC URL exposure | Never log full RPC URLs, only reference env var names |
| Private RPC keys | Warn if RPC URL contains API key in config (suggest env var) |
| Rate limiting | Cache block ranges for 24 hours to minimize RPC calls |
| Malicious RPC | Read-only operations only (getLogs, getCode, blockNumber) |

### 6.2 Generated File Security

| File | Security Consideration |
|------|------------------------|
| `envio.test.yaml` | No secrets, uses env var references |
| `verification.graphql` | Read-only query, no mutations |
| Block range cache | No secrets, public blockchain data |

---

## 7. Integration Points

### 7.1 Existing Sigil Rules

DX Physics integrates with existing Sigil components:

| Component | Integration |
|-----------|-------------|
| `00-sigil-core.md` | Add DX effect type to detection priority |
| `01-sigil-physics.md` | Add DX timing table (seconds, not ms) |
| `02-sigil-detection.md` | Add indexer file pattern detection |
| `06-sigil-taste.md` | Extend schema for DX signals |

### 7.2 /implement Command

**Modification to**: `.claude/skills/implementing-tasks/SKILL.md`

Add new phase between context loading and implementation:

```markdown
## Phase 0.5: DX Physics Check (NEW)

If working directory contains indexer code:

1. Run Indexer Detector
2. If detected with HIGH/MEDIUM confidence:
   - Check if current task involves handler files
   - If yes, show DX Physics analysis box
   - If user accepts, run Block Range Discoverer
   - Generate test config and verification query
   - Add generated files to outputs
3. Log DX Physics detection to taste.md
4. Continue with normal implementation
```

### 7.3 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| Envio CLI | Any | User runs `pnpm envio dev --config envio.test.yaml` |
| RPC Endpoint | Ethereum-compatible | Block range discovery |
| GraphQL Server | Envio default (port 8080) | Verification queries |

---

## 8. Performance Considerations

### 8.1 RPC Query Optimization

| Optimization | Implementation |
|--------------|----------------|
| Minimize calls | Single `eth_getLogs` call per event |
| Block range limiting | Query last 100,000 blocks max |
| Caching | 24-hour cache for block ranges |
| Parallel queries | Query multiple events in parallel if needed |

### 8.2 Generation Performance

| Operation | Target Time |
|-----------|-------------|
| Indexer detection | <100ms |
| Block range discovery | <5s (RPC dependent) |
| Config generation | <100ms |
| Total DX Physics overhead | <10s |

---

## 9. Development Workflow

### 9.1 File Changes Required

| File | Change Type | Description |
|------|-------------|-------------|
| `.claude/rules/18-sigil-dx-physics.md` | CREATE | New DX Physics rules |
| `.claude/commands/implement.md` | MODIFY | Add DX Physics context files |
| `.claude/skills/implementing-tasks/SKILL.md` | MODIFY | Add Phase 0.5 |
| `grimoires/sigil/context/indexer/README.md` | CREATE | Cache documentation |

### 9.2 Testing Strategy

| Test | Method |
|------|--------|
| Indexer detection | Mock package.json and config files |
| Block range discovery | Mock RPC responses |
| Config generation | Compare output to expected templates |
| Integration | End-to-end test on sample Envio project |

---

## 10. Technical Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| RPC rate limiting | Medium | Test configs fail | Cache aggressively, suggest local RPC |
| Envio config changes | Low | Parser breaks | Version-pin parser, graceful fallback |
| No recent events | Medium | Empty test range | Use contract creation + warning |
| TypeScript parsing fails | Medium | Can't extract config | Regex fallback + user prompt |

---

## 11. Future Considerations

### 11.1 Framework Expansion

| Framework | Config File | Detection | Priority |
|-----------|-------------|-----------|----------|
| Envio | `envio.config.ts` | `@envio-dev/indexer` | P0 (this phase) |
| The Graph | `subgraph.yaml` | `@graphprotocol/graph-ts` | P1 (future) |
| Ponder | `ponder.config.ts` | `@ponder/core` | P2 (future) |

### 11.2 Block Range Intelligence

Future enhancements for block range discovery:
- Learn optimal ranges from taste signals
- Cross-project block range sharing
- Event clustering for multi-event handlers
- Time-based ranges ("last 24 hours of events")

### 11.3 Verification Automation

Future enhancements for test verification:
- Auto-run GraphQL query after sync
- Compare results to expected assertions
- Report test pass/fail automatically
- Integrate with CI/CD pipelines

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-19 | Claude | Initial SDD from PRD |

---

```
    ╔═══════════════════════════════════════════════════╗
    ║  SDD COMPLETE                                     ║
    ║  Ready for /sprint-plan                           ║
    ╚═══════════════════════════════════════════════════╝
```
