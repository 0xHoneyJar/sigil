# Sigil: Complexity Detection & Handoff

Detect when tasks require research before crafting. Route to appropriate handlers. Store context in shared location. Return to workflow with enriched information.

<rule_overview>
## Overview

Complexity detection runs before implementation begins. When triggers are found, the handoff protocol gathers context and enriches the workflow.

**Trigger Priority:**
1. Indexer work (DX Physics) — fastest path, most common
2. Multi-repo references — requires ecosystem mapping
3. Unknown contracts — requires domain research
4. Architectural ambiguity — requires Loa consultation

</rule_overview>

<complexity_triggers>
## Complexity Triggers

| Trigger | Detection | Handler | Confidence Required |
|---------|-----------|---------|---------------------|
| Indexer work | @envio-dev/indexer + handler files | dx-physics | HIGH or MEDIUM |
| Multi-repo | External repo references | ecosystem | MEDIUM |
| Unknown contracts | Addresses without local ABI | domain | LOW |
| Architectural | System design keywords | domain | LOW |

</complexity_triggers>

<detection_algorithm>
## Detection Algorithm

```
function detectComplexity(context):
  triggers = []

  // 1. INDEXER DETECTION (DX Physics)
  indexerResult = detectIndexer(context)
  if indexerResult.confidence >= MEDIUM:
    triggers.push({
      type: "indexer",
      confidence: indexerResult.confidence,
      handler: "dx-physics",
      data: indexerResult
    })

  // 2. MULTI-REPO DETECTION
  multiRepoResult = detectMultiRepo(context)
  if multiRepoResult.detected:
    triggers.push({
      type: "multi-repo",
      confidence: multiRepoResult.confidence,
      handler: "ecosystem",
      data: multiRepoResult
    })

  // 3. UNKNOWN CONTRACT DETECTION
  contractResult = detectUnknownContracts(context)
  if contractResult.unknownAddresses.length > 0:
    triggers.push({
      type: "unknown-contract",
      confidence: "LOW",
      handler: "domain",
      data: contractResult
    })

  // 4. ARCHITECTURAL AMBIGUITY
  if containsArchitecturalKeywords(context):
    triggers.push({
      type: "architectural",
      confidence: "LOW",
      handler: "domain",
      data: { requiresLoa: true }
    })

  return triggers
```

</detection_algorithm>

<indexer_detection>
## Indexer Detection (DX Physics Trigger)

### Detection Algorithm

1. **Package.json Check**
   ```
   Read package.json
   Check: dependencies["@envio-dev/indexer"] exists?
   ```

2. **Config File Check**
   ```
   Check: envio.config.ts OR config.yaml exists?
   ```

3. **Handler File Check**
   ```
   Is current file one of:
   - src/EventHandlers.ts
   - src/*Handler*.ts
   - src/loaders/*.ts
   ```

4. **Confidence Scoring**
   | Package | Config | Handler | Confidence |
   |---------|--------|---------|------------|
   | ✓ | ✓ | ✓ | HIGH |
   | ✓ | ✓ | ✗ | MEDIUM (don't trigger unless asking about handlers) |
   | ✓ | ✗ | ✓ | MEDIUM |
   | ✗ | ✓ | ✓ | MEDIUM |
   | else | | | NONE |

### Trigger Condition
Trigger DX Physics when:
- Confidence is HIGH or MEDIUM
- AND current file is a handler file OR user asks about handler iteration

</indexer_detection>

<multirepo_detection>
## Multi-Repo Detection (Ecosystem Trigger)

### Detection Signals

1. **Import Path Analysis**
   ```
   Look for imports like:
   - "../other-repo/"
   - "../../contracts/"
   - "@thj/contracts" (workspace packages)
   ```

2. **Documentation References**
   ```
   Look in comments/docs for:
   - "See thj-contracts repo"
   - "Defined in ../other-project"
   - Links to other GitHub repos
   ```

3. **Contract Address Cross-Reference**
   ```
   Find contract addresses and check:
   - Is address in local ABIs? → No trigger
   - Is address in context/ecosystem/contracts.yaml? → No trigger
   - Unknown address? → Trigger
   ```

### Trigger Condition
Trigger Ecosystem handler when:
- External repo references found
- OR unknown contract addresses detected (cross-repo scenario)

</multirepo_detection>

<unknown_contract_detection>
## Unknown Contract Detection

### Detection Algorithm

1. **Find Contract Addresses**
   ```
   Scan for patterns:
   - 0x[a-fA-F0-9]{40}
   - address constants
   - config contract addresses
   ```

2. **Check Known Sources**
   ```
   known = false

   // Check local ABIs
   if exists(artifacts/{name}.json): known = true

   // Check ecosystem context
   if exists(context/ecosystem/contracts.yaml):
     if address in contracts.yaml: known = true

   // Check domain context
   if exists(context/domain/{address}.md): known = true
   ```

3. **Mark Unknown**
   ```
   if not known:
     unknownAddresses.push(address)
   ```

### Trigger Condition
Trigger Domain handler when unknownAddresses.length > 0

</unknown_contract_detection>

<architectural_keywords>
## Architectural Ambiguity Detection

### Keywords That Trigger

| Category | Keywords |
|----------|----------|
| System Design | "architecture", "design", "pattern", "approach" |
| Uncertainty | "should we", "best way to", "how should" |
| Trade-offs | "pros and cons", "trade-off", "compare" |
| Scale | "scalable", "performance", "optimize" |

### Trigger Condition
Trigger Domain handler with requiresLoa: true when:
- 2+ architectural keywords present
- OR explicit question about system design

</architectural_keywords>

<handoff_protocol>
## Handoff Protocol

### Protocol Steps

**Step 1: DETECT**
- Complexity Detector identifies triggers
- Show initial message: "Complexity detected..."

**Step 2: GATHER**
- Route to appropriate handler(s)
- Execute handler.gather(triggerData)
- Show progress: "Gathering context via [method]..."

**Step 3: STORE**
- Save context to grimoires/loa/context/
- Use appropriate subdirectory (indexer/, ecosystem/, domain/)
- Include metadata (discoveredAt, expiresAt)

**Step 4: ENRICH**
- Merge gathered contexts
- Prepare enriched analysis
- Show enriched information to user

**Step 5: CONTINUE**
- Return to original workflow
- Pass enriched context to next phase
- Log handoff completion

### Message Flow
```
[DETECT]
"Complexity detected. Triggers: indexer (HIGH)"

[GATHER]
"Gathering context..."
"└─ Querying RPC for block ranges"

[STORE]
"Context stored: grimoires/loa/context/indexer/..."

[ENRICH]
[Show analysis box with gathered info]

[CONTINUE]
"Continuing with enriched context..."
```

</handoff_protocol>

<context_preservation>
## Context Preservation

### State to Preserve
| Field | Description |
|-------|-------------|
| `originalCommand` | The command that triggered complexity |
| `originalArgs` | Arguments to original command |
| `triggers` | Complexity triggers found |
| `gatheredContexts` | Results from handlers |
| `timestamp` | When handoff started |

### Session Context File
Store temporary context in:
`grimoires/loa/context/sessions/{date}-{id}.json`

```json
{
  "id": "20260119-abcd1234",
  "originalCommand": "/implement sprint-1",
  "originalArgs": { "sprint_id": "sprint-1" },
  "triggers": [
    { "type": "indexer", "confidence": "HIGH" }
  ],
  "gatheredContexts": [
    { "type": "dx-physics", "path": "indexer/80094/..." }
  ],
  "startedAt": "2026-01-19T14:30:00Z",
  "status": "in_progress"
}
```

### TTL
Session context expires after 1 hour

</context_preservation>

<return_to_origin>
## Return-to-Origin Mechanism

### Return Flow
1. **Check Session Context**
   - Read session file
   - Verify status is "in_progress"

2. **Merge Enriched Context**
   - Combine original args with gathered contexts
   - Create enrichedContext object

3. **Resume Original Command**
   - Pass enrichedContext to next phase
   - Update session status to "complete"

4. **Cleanup**
   - Session file auto-expires after 1 hour
   - Or manually cleaned on successful completion

### Enriched Context Structure
```typescript
interface EnrichedContext {
  original: {
    command: string
    args: Record<string, any>
  }
  gathered: {
    dxPhysics?: DXPhysicsContext
    ecosystem?: EcosystemContext
    domain?: DomainContext
  }
  metadata: {
    handoffDuration: number  // ms
    triggersResolved: string[]
  }
}
```

</return_to_origin>

<implementation_integration>
## Integration with /implement

### Phase 0.5: Complexity Detection

Before starting implementation, check for complexity:

1. **Run Complexity Detector**
   - Check all registered triggers
   - Collect trigger results

2. **If Complex (any triggers found)**
   ```
   ┌─ Complexity Detected ──────────────────────────────────┐
   │                                                        │
   │  Triggers found:                                       │
   │  • [trigger type] - [confidence] confidence            │
   │                                                        │
   │  Gathering context...                                  │
   │                                                        │
   └────────────────────────────────────────────────────────┘
   ```

3. **Execute Handoff Protocol**
   - Route to appropriate handlers
   - Gather context
   - Store in grimoires/loa/context/
   - Return enriched context

4. **Continue to Phase 1** with enriched context

</implementation_integration>

<dx_physics_handler>
## DX Physics Handler

The DX Physics handler optimizes developer experience for blockchain indexers by generating targeted test configurations.

### Handler Overview

| Aspect | Value |
|--------|-------|
| Trigger | Indexer detection (HIGH/MEDIUM confidence) |
| Purpose | Reduce sync time from 4-16h to ~30s |
| Output | envio.test.yaml + verification.graphql |
| Cache | 24 hours in grimoires/loa/context/indexer/ |

</dx_physics_handler>

<config_parser>
## Envio Config Parser

### Parse Algorithm

1. **Read envio.config.ts**
   ```
   content = readFile("envio.config.ts")
   ```

2. **Extract Networks**
   ```
   Look for: networks: [{ id: NUMBER, rpc_config: { url: STRING } }]
   Extract: chainId, rpcUrl (or env var reference)
   ```

3. **Extract Contracts**
   ```
   Look for: contracts: [{ name: STRING, address: STRING, ... }]
   Extract: name, address, handler path
   ```

4. **Extract Events**
   ```
   Look for: event_handlers: [{ event: STRING, ... }]
   Extract: event names
   ```

### Output Schema
```typescript
interface EnvioConfig {
  chainId: number
  rpcUrl: string  // May be "${ENV_VAR}"
  rpcEnvVar: string
  contractName: string
  contractAddress: string
  handlerPath: string
  events: string[]
}
```

### Fallback
If parsing fails:
1. Prompt user for contract address
2. Prompt user for target event
3. Prompt user for RPC URL or env var

</config_parser>

<block_discovery>
## RPC Block Range Discovery

### RPC Calls Required
| Method | Purpose | Parameters |
|--------|---------|------------|
| `eth_blockNumber` | Get current block | none |
| `eth_getLogs` | Find events | address, topics, fromBlock, toBlock |

### Discovery Algorithm

1. **Get Current Block**
   ```
   currentBlock = eth_blockNumber()
   ```

2. **Query Event Logs** (last 100k blocks, ~1 day on most chains)
   ```
   logs = eth_getLogs({
     address: contractAddress,
     topics: [keccak256("EventName(params)")],
     fromBlock: currentBlock - 100000,
     toBlock: currentBlock
   })
   ```

3. **Select Block Range**
   ```
   if logs.length > 0:
     medianBlock = logs[logs.length / 2].blockNumber
     return {
       startBlock: medianBlock - 50,
       endBlock: medianBlock + 50,
       confidence: "HIGH",
       eventsInRange: count(logs in range)
     }
   else:
     // Fallback: use contract creation block
     creationBlock = getContractCreationBlock()
     return {
       startBlock: creationBlock,
       endBlock: creationBlock + 1000,
       confidence: "LOW",
       warning: "No recent events found"
     }
   ```

### Event Signature Generation
Generate topic from event signature:
```
Staked(address,uint256) → keccak256("Staked(address,uint256)")
                        → 0x9e71bc8eea02a63969f509818f2dafb9254532904319f9dbda79b67bd34a5f3d
```

### RPC Execution
Use curl or fetch to query RPC:
```bash
curl -X POST "$RPC_URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getLogs","params":[{
    "address":"'$CONTRACT_ADDRESS'",
    "topics":["'$EVENT_TOPIC'"],
    "fromBlock":"0x'$(printf '%x' $FROM_BLOCK)'",
    "toBlock":"0x'$(printf '%x' $TO_BLOCK)'"
  }],"id":1}'
```

</block_discovery>

<block_cache>
## Block Range Cache

### Cache Path
`grimoires/loa/context/indexer/{chainId}/{contractAddress}-{event}.json`

### Cache Schema
```json
{
  "contractAddress": "0x...",
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

### Cache Logic
```
cacheFile = getPath(chainId, contract, event)

if exists(cacheFile):
  cache = read(cacheFile)
  if cache.expiresAt > now():
    return cache.blockRanges[0]  // Use cached
  else:
    // Cache expired, re-query
    newRange = discoverBlockRange(...)
    updateCache(cacheFile, newRange)
    return newRange
else:
  // No cache, query and create
  newRange = discoverBlockRange(...)
  createCache(cacheFile, newRange)
  return newRange
```

### Expiration
Default TTL: 24 hours

### Force Refresh
User can request fresh discovery by answering "n" to "Use cached range?"

</block_cache>

<test_config_generator>
## Test Config Generator

### Template
```yaml
# Generated by Sigil DX Physics
# Purpose: Fast feedback for ${EVENT_NAME} handler
# Block range: ${START_BLOCK} - ${END_BLOCK} (${BLOCK_COUNT} blocks)
# Events expected: ${EVENTS_IN_RANGE}
# Est. sync: ${ESTIMATED_TIME}

name: "test-${EVENT_LOWER}"

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

### Time Estimation
| Blocks | Estimated Time |
|--------|----------------|
| ≤100 | ~30 seconds |
| ≤500 | ~1 minute |
| ≤1000 | ~2 minutes |
| ≤5000 | ~5 minutes |
| ≤10000 | ~10 minutes |
| >10000 | ~30+ minutes |

### Output Path
`envio.test.yaml` in project root

</test_config_generator>

<verification_generator>
## GraphQL Verification Generator

### Template
```graphql
# Verification query for ${EVENT_NAME}
# Run after: pnpm envio dev --config envio.test.yaml

query Verify${EVENT_NAME}Test {
  ${ENTITY_PLURAL}(
    first: 10
    orderBy: blockNumber
    orderDirection: desc
    where: {
      blockNumber_gte: ${START_BLOCK}
      blockNumber_lte: ${END_BLOCK}
    }
  ) {
    id
    blockNumber
    transactionHash
    # Add entity-specific fields here
  }
}

# Expected:
# - At least ${EVENTS_IN_RANGE} results
# - All fields non-null
# - Blocks in range [${START_BLOCK}, ${END_BLOCK}]
```

### Entity Name Derivation
| Event | Entity (plural) |
|-------|-----------------|
| Staked | stakeEvents |
| Transfer | transfers |
| Approval | approvals |
| Deposit | deposits |
| Withdraw | withdrawals |
| Claimed | claimEvents |

General rule: Event → `{eventName}Events` or `{eventName}s`

### Output Path
`verification-${EVENT_LOWER}.graphql` in project root

</verification_generator>

<dx_analysis_box>
## DX Physics Analysis Box

### Full Format
```
┌─ DX Physics Detected ──────────────────────────────────┐
│                                                        │
│  Context:     Envio Indexer Handler                    │
│  Confidence:  HIGH                                     │
│  Config:      envio.config.ts                          │
│  Handler:     src/EventHandlers.ts                     │
│                                                        │
│  Current Issue:                                        │
│  Full sync takes ~4 hours. Handler iteration is slow.  │
│                                                        │
│  Gathering context via RPC...                          │
│                                                        │
│  Target event:  ${EVENT_NAME}                          │
│  Block range:   ${START_BLOCK} - ${END_BLOCK}          │
│  Events found:  ${EVENTS_IN_RANGE} occurrences         │
│  Est. sync:     ${ESTIMATED_TIME}                      │
│                                                        │
│  Will generate:                                        │
│  • envio.test.yaml                                     │
│  • verification-${EVENT_LOWER}.graphql                 │
│                                                        │
│  [y] Generate test config + continue                   │
│  [n] Skip DX Physics                                   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Compact Mode (after 3+ accepts)
```
DX Physics | ${EVENT_NAME} | ${START_BLOCK}-${END_BLOCK} | ~${ESTIMATED_TIME}
Generate? (y/n)
```

### Switch Modes
- After 3 consecutive ACCEPT signals for DX Physics → switch to compact
- After any REJECT signal → switch back to full

</dx_analysis_box>
