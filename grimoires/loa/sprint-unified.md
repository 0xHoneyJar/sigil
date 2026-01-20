# Unified Sprint Plan: Sigil ↔ Loa Synergy + DX Physics

```
    ╔═══════════════════════════════════════════════════╗
    ║  ✦ UNIFIED SPRINT PLAN                           ║
    ║  4 Sprints • 12 Days • Seamless Framework Flow   ║
    ╚═══════════════════════════════════════════════════╝
```

**Version**: 1.0.0
**Last Updated**: 2026-01-19
**PRD**: `grimoires/loa/prd-unified.md`
**SDD**: `grimoires/loa/sdd-unified.md`

---

## Sprint Overview

| Sprint | Focus | Duration | Goal |
|--------|-------|----------|------|
| **sprint-1** | Foundation | Days 1-3 | Shared context + complexity detection |
| **sprint-2** | DX Physics | Days 4-6 | First handler: indexer optimization |
| **sprint-3** | Handoff Protocol | Days 7-9 | Seamless Sigil ↔ Loa transitions |
| **sprint-4** | Commands & Polish | Days 10-12 | /understand, /ecosystem, end-to-end |

**MVP Definition**: After sprint-4, Sigil automatically detects complexity, gathers context via appropriate handlers, stores in shared location, and seamlessly continues workflows with enriched information.

---

## sprint-1: Foundation

**Goal**: Establish shared context infrastructure and basic complexity detection.

**Deliverables**:
- `grimoires/loa/context/` directory structure
- `.claude/rules/18-sigil-complexity.md` rule file
- Basic complexity detection triggers
- Context store configuration

---

### Task 1.1: Create Shared Context Directory Structure

**Description**: Set up the `grimoires/loa/context/` directory hierarchy.

**Files to create**:
```
grimoires/loa/context/
├── README.md
├── .context-config.yaml
├── indexer/
│   └── README.md
├── ecosystem/
│   └── README.md
└── domain/
    └── README.md
```

**Acceptance Criteria**:
- [ ] All directories created
- [ ] README.md explains purpose and structure
- [ ] .context-config.yaml defines TTL and permissions
- [ ] Each subdirectory has its own README

**Dependencies**: None

**Testing**:
- Verify directory structure exists
- Confirm README files are readable

---

### Task 1.2: Define Context Store Configuration

**Description**: Create `.context-config.yaml` with TTL and permission settings.

**File**: `grimoires/loa/context/.context-config.yaml`

**Content**:
```yaml
# Shared Context Store Configuration
version: "1.0.0"

ttl:
  indexer: 24h
  ecosystem: 7d
  domain: 30d
  sessions: 1h

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

**Acceptance Criteria**:
- [ ] YAML is valid and parseable
- [ ] TTL values defined for all context types
- [ ] Write permissions clearly delineated
- [ ] Conflict resolution strategy documented

**Dependencies**: Task 1.1

**Testing**:
- Parse YAML successfully
- Verify all required fields present

---

### Task 1.3: Create Complexity Detection Rule File

**Description**: Create the main rule file for complexity detection and handoff.

**File**: `.claude/rules/18-sigil-complexity.md`

**Initial Structure**:
```markdown
# Sigil: Complexity Detection & Handoff

<rule_overview>
## Overview

This rule file enables Sigil to:
1. Detect when tasks require research before crafting
2. Route to appropriate handlers for context gathering
3. Store context in shared location
4. Return to workflow with enriched information

</rule_overview>

<complexity_triggers>
## Complexity Triggers

| Trigger | Detection | Handler |
|---------|-----------|---------|
| Indexer work | @envio-dev/indexer + handler files | dx-physics |
| Multi-repo | External repo references | ecosystem |
| Unknown contracts | Addresses without local ABI | domain |
| Architectural | System design keywords | domain |

</complexity_triggers>

<detection_algorithm>
## Detection Algorithm

[Algorithm pseudocode from SDD]

</detection_algorithm>
```

**Acceptance Criteria**:
- [ ] Rule file created at correct path
- [ ] Uses XML tags for sections
- [ ] Follows Sigil rule conventions
- [ ] Includes all four trigger types

**Dependencies**: Task 1.1

**Testing**:
- Verify rule file loads without errors
- Check XML structure is valid

---

### Task 1.4: Implement Indexer Detection Logic

**Description**: Add the indexer detection algorithm (DX Physics trigger).

**Add to**: `.claude/rules/18-sigil-complexity.md`

**Content**:
```markdown
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
   | ✓ | ✓ | ✗ | MEDIUM (don't trigger) |
   | ✓ | ✗ | ✓ | MEDIUM |
   | ✗ | ✓ | ✓ | MEDIUM |
   | else | | | NONE |

### Trigger Condition
Trigger DX Physics when:
- Confidence is HIGH or MEDIUM
- AND current file is a handler file

</indexer_detection>
```

**Acceptance Criteria**:
- [ ] Detection algorithm documented
- [ ] Confidence scoring table included
- [ ] Trigger condition clearly stated
- [ ] All three checks (package, config, handler) present

**Dependencies**: Task 1.3

**Testing**:
- Mock Envio project → should detect HIGH
- Mock React project → should detect NONE

---

### Task 1.5: Implement Multi-Repo Detection Logic

**Description**: Add detection for multi-repo references.

**Add to**: `.claude/rules/18-sigil-complexity.md`

**Content**:
```markdown
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
- OR unknown contract addresses detected

</multirepo_detection>
```

**Acceptance Criteria**:
- [ ] Three detection signals documented
- [ ] Trigger condition defined
- [ ] Examples of each signal type

**Dependencies**: Task 1.3

**Testing**:
- Project with "../contracts/" import → should detect
- Self-contained project → should not detect

---

### Task 1.6: Add Complexity Detection to /implement

**Description**: Integrate complexity detection into the /implement workflow.

**File**: `.claude/skills/implementing-tasks/SKILL.md`

**Add Phase 0.5**:
```markdown
## Phase 0.5: Complexity Detection (NEW)

Before starting implementation, check for complexity:

1. **Run Complexity Detector**
   - Check all registered triggers
   - Collect trigger results

2. **If Complex (any triggers found)**
   ```
   ┌─ Complexity Detected ──────────────────────────────┐
   │                                                    │
   │  Triggers found:                                   │
   │  • [trigger type] - [confidence] confidence        │
   │                                                    │
   │  Gathering context...                              │
   │                                                    │
   └────────────────────────────────────────────────────┘
   ```

3. **Execute Handoff Protocol**
   - Route to appropriate handlers
   - Gather context
   - Store in grimoires/loa/context/
   - Return enriched context

4. **Continue to Phase 1** with enriched context
```

**Acceptance Criteria**:
- [ ] Phase 0.5 added before Phase 1
- [ ] Complexity detection integrated
- [ ] Message format defined
- [ ] Handoff protocol referenced

**Dependencies**: Tasks 1.4, 1.5

**Testing**:
- Run /implement on Envio project → should show complexity message
- Run /implement on simple project → should skip to Phase 1

---

## sprint-2: DX Physics

**Goal**: Implement the DX Physics handler for indexer optimization.

**Deliverables**:
- Envio config parser
- RPC block range discovery
- Test config generation
- GraphQL verification templates
- Block range caching

---

### Task 2.1: Implement Envio Config Parser

**Description**: Parse envio.config.ts to extract contract/event information.

**Add to**: `.claude/rules/18-sigil-complexity.md`

**Content**:
```markdown
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
```

**Acceptance Criteria**:
- [ ] Parse algorithm documented
- [ ] Handles env var references
- [ ] Output schema defined
- [ ] Fallback behavior documented

**Dependencies**: sprint-1 complete

**Testing**:
- Parse sample envio.config.ts → extract all fields
- Parse malformed config → trigger fallback

---

### Task 2.2: Implement RPC Block Range Discovery

**Description**: Query RPC for accurate event block ranges.

**Add to**: `.claude/rules/18-sigil-complexity.md`

**Content**:
```markdown
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

2. **Query Event Logs** (last 100k blocks, ~1 day)
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
     creationBlock = getContractCreationBlock()
     return {
       startBlock: creationBlock,
       endBlock: creationBlock + 1000,
       confidence: "LOW",
       warning: "No recent events found"
     }
   ```

### Event Signature
Generate topic from event signature:
```
Staked(address,uint256) → keccak256("Staked(address,uint256)")
```

</block_discovery>
```

**Acceptance Criteria**:
- [ ] RPC methods documented
- [ ] Discovery algorithm with fallback
- [ ] Event signature generation explained
- [ ] Output includes confidence level

**Dependencies**: Task 2.1

**Testing**:
- Mock RPC with events → should return HIGH confidence range
- Mock RPC without events → should use fallback

---

### Task 2.3: Implement Block Range Caching

**Description**: Cache discovered block ranges to minimize RPC calls.

**Location**: `grimoires/loa/context/indexer/`

**Schema**:
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

**Cache Behavior** (add to rules):
```markdown
<block_cache>
## Block Range Cache

### Cache Path
`grimoires/loa/context/indexer/{chainId}/{contractAddress}-{event}.json`

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
```

**Acceptance Criteria**:
- [ ] Cache path schema defined
- [ ] Cache read/write logic documented
- [ ] 24-hour expiration implemented
- [ ] Force refresh option available

**Dependencies**: Task 2.2

**Testing**:
- First query → creates cache
- Second query within 24h → uses cache
- Query after 24h → re-queries

---

### Task 2.4: Implement Test Config Generator

**Description**: Generate envio.test.yaml for targeted testing.

**Add to rules**:
```markdown
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
| Blocks | Time |
|--------|------|
| ≤100 | ~30 seconds |
| ≤1000 | ~2 minutes |
| ≤10000 | ~10 minutes |
| >10000 | ~30+ minutes |

### Output Path
`envio.test.yaml` in project root

</test_config_generator>
```

**Acceptance Criteria**:
- [ ] Template complete with all variables
- [ ] Time estimation table included
- [ ] Output path documented
- [ ] Valid YAML syntax

**Dependencies**: Task 2.2

**Testing**:
- Generate config with sample data → valid YAML
- Verify time estimation for 100 blocks → "~30 seconds"

---

### Task 2.5: Implement GraphQL Verification Template

**Description**: Generate verification queries for test validation.

**Add to rules**:
```markdown
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

### Output Path
`verification-${EVENT_LOWER}.graphql` in project root

</verification_generator>
```

**Acceptance Criteria**:
- [ ] GraphQL template complete
- [ ] Entity name derivation documented
- [ ] Expected results included
- [ ] Valid GraphQL syntax

**Dependencies**: Task 2.4

**Testing**:
- Generate query for Staked → valid GraphQL
- Verify entity name: Staked → stakeEvents

---

### Task 2.6: Implement DX Physics Analysis Box

**Description**: Show analysis box when DX Physics triggers.

**Add to rules**:
```markdown
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

</dx_analysis_box>
```

**Acceptance Criteria**:
- [ ] Full analysis box format documented
- [ ] All variables included
- [ ] Compact mode defined
- [ ] y/n prompt included

**Dependencies**: Tasks 2.4, 2.5

**Testing**:
- Verify box renders correctly
- Test compact mode after 3 accepts

---

## sprint-3: Handoff Protocol

**Goal**: Implement seamless transitions between Sigil and Loa.

**Deliverables**:
- Handoff protocol implementation
- Context preservation
- Return-to-origin mechanism
- Integration with Loa commands

---

### Task 3.1: Implement Handoff Protocol Core

**Description**: Implement the 5-step handoff protocol.

**Add to rules**:
```markdown
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
```

**Acceptance Criteria**:
- [ ] All 5 steps documented
- [ ] Message flow defined
- [ ] Handler routing explained
- [ ] Context storage path specified

**Dependencies**: sprint-2 complete

**Testing**:
- Trace through full handoff flow
- Verify all messages appear in order

---

### Task 3.2: Implement Context Preservation

**Description**: Ensure context is preserved across handoff.

**Add to rules**:
```markdown
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
```

**Acceptance Criteria**:
- [ ] State fields defined
- [ ] Session file schema documented
- [ ] 1-hour TTL specified
- [ ] Path convention documented

**Dependencies**: Task 3.1

**Testing**:
- Verify session file created on handoff
- Confirm file deleted after 1 hour

---

### Task 3.3: Implement Return-to-Origin

**Description**: Return to original workflow after context gathering.

**Add to rules**:
```markdown
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

### Example
```
Original: /implement sprint-1
Triggers: indexer (HIGH)

After handoff:
{
  original: { command: "/implement", args: { sprint_id: "sprint-1" } },
  gathered: {
    dxPhysics: {
      blockRange: { start: 15899050, end: 15899150 },
      testConfig: "envio.test.yaml"
    }
  },
  metadata: { handoffDuration: 4200, triggersResolved: ["indexer"] }
}

Continue to /implement Phase 1 with DX Physics context available
```

</return_to_origin>
```

**Acceptance Criteria**:
- [ ] Return flow documented
- [ ] EnrichedContext schema defined
- [ ] Example provided
- [ ] Cleanup mechanism specified

**Dependencies**: Task 3.2

**Testing**:
- Complete handoff → verify return to original command
- Check enriched context available in subsequent phases

---

### Task 3.4: Implement Ecosystem Handler

**Description**: Handler for multi-repo relationships.

**Add to rules**:
```markdown
<ecosystem_handler>
## Ecosystem Handler

### Gather Algorithm

1. **Read Existing Ecosystem Map**
   ```
   existing = read("grimoires/loa/context/ecosystem/repos.yaml")
   ```

2. **Discover New Relationships**
   ```
   for ref in triggerData.externalRefs:
     if ref not in existing:
       repoInfo = analyzeRepository(ref.path)
       existing.repositories.push(repoInfo)
   ```

3. **Analyze Repository**
   ```
   - Check for contracts/ → type: "contracts"
   - Check for envio.config.ts → type: "indexer"
   - Check for package.json + react → type: "frontend"
   - Extract contract addresses, events
   ```

4. **Update Ecosystem Map**
   ```
   write("grimoires/loa/context/ecosystem/repos.yaml", existing)
   ```

### Output
```yaml
repositories:
  - name: "thj-contracts"
    path: "../thj-contracts"
    type: "contracts"
    contracts:
      - name: "StakingVault"
        address: "0x..."
        chainId: 80094

relationships:
  - from: "current-repo"
    to: "thj-contracts"
    type: "uses"
```

</ecosystem_handler>
```

**Acceptance Criteria**:
- [ ] Gather algorithm documented
- [ ] Repository analysis logic defined
- [ ] Output YAML schema shown
- [ ] Relationship mapping included

**Dependencies**: Task 3.1

**Testing**:
- Mock multi-repo structure → ecosystem map created
- Verify relationships extracted

---

### Task 3.5: Implement Domain Handler

**Description**: Handler for Loa consultation and contract research.

**Add to rules**:
```markdown
<domain_handler>
## Domain Handler

### Gather Algorithm

1. **Check Existing Domain Knowledge**
   ```
   topic = identifyTopic(triggerData)
   existing = read("grimoires/loa/context/domain/{topic}.md")

   if exists and age < 30 days:
     return existing
   ```

2. **Research Unknown Contracts** (if applicable)
   ```
   for contract in triggerData.contracts:
     abi = fetchABI(contract.address)  // Etherscan, etc.
     analysis = analyzeContract(abi)
     document = generateDocumentation(analysis)
   ```

3. **Consult Loa** (if architectural)
   ```
   if triggerData.requiresLoa:
     // Trigger Loa /architect or /understand
     consultation = loaConsult(triggerData.question)
   ```

4. **Store Domain Knowledge**
   ```
   write("grimoires/loa/context/domain/{topic}.md", document)
   ```

### Output
```markdown
---
topic: staking-vault
discoveredAt: 2026-01-19T14:30:00Z
source: contract-analysis
---

# Staking Vault

## Overview
[Generated documentation]

## Key Functions
[Function table]

## Events
[Event list]
```

</domain_handler>
```

**Acceptance Criteria**:
- [ ] Gather algorithm documented
- [ ] Contract research flow defined
- [ ] Loa consultation referenced
- [ ] Output markdown format shown

**Dependencies**: Task 3.1

**Testing**:
- Unknown contract → domain doc created
- Existing domain doc within 30 days → cached used

---

### Task 3.6: Add DX Taste Signal Logging

**Description**: Log DX Physics signals to taste.md.

**Add to `06-sigil-taste.md`**:
```markdown
## DX Physics Signals

### Schema Extension
```yaml
---
timestamp: "..."
signal: ACCEPT | MODIFY | REJECT
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
  inference: "100-block range sufficient for Staked"
---
```

### Signal Detection
| User Action | Signal |
|-------------|--------|
| Accepts generated config | ACCEPT |
| Modifies block range | MODIFY |
| Skips DX Physics | REJECT |
```

**Acceptance Criteria**:
- [ ] DX-specific schema extension documented
- [ ] dx_physics section defined
- [ ] Signal detection rules specified

**Dependencies**: Task 3.1

**Testing**:
- Accept DX config → ACCEPT logged with dx_physics
- Skip DX Physics → REJECT logged

---

## sprint-4: Commands & Polish

**Goal**: Implement new commands and end-to-end testing.

**Deliverables**:
- `/understand` command
- `/ecosystem` command (optional)
- End-to-end integration tests
- Documentation updates

---

### Task 4.1: Implement /understand Command

**Description**: Manual trigger for Loa research before crafting.

**File**: `.claude/commands/understand.md`

**Content**:
```markdown
---
name: "understand"
version: "1.0.0"
description: |
  Research before crafting. Trigger Loa analysis to gather
  domain knowledge before applying Sigil physics.

arguments:
  - name: "topic"
    type: "string"
    required: true
    description: "What to understand"
    examples:
      - "how does the staking vault work"
      - "the reward distribution system"
      - "contract 0x1234..."

agent: "domain-handler"
---

# /understand

Research before crafting.

## Purpose

When you need to understand a system before working on it,
`/understand` gathers context via Loa and stores it for
subsequent Sigil commands.

## Usage

```bash
/understand "how does the staking vault work"
/understand "contract 0x1234..."
```

## Workflow

1. Check existing domain knowledge in context/
2. If missing or stale: trigger Loa research
3. Store results in grimoires/loa/context/domain/
4. Display summary to user
5. Context now available for /craft, /implement, etc.
```

**Acceptance Criteria**:
- [ ] Command file created
- [ ] YAML frontmatter complete
- [ ] Workflow documented
- [ ] Examples provided

**Dependencies**: Task 3.5

**Testing**:
- /understand "staking vault" → domain doc created
- Subsequent /craft → has access to domain context

---

### Task 4.2: Update Command Documentation

**Description**: Update existing command docs to reference complexity detection.

**Files to update**:
- `.claude/commands/implement.md` - Add Phase 0.5 reference
- `.claude/commands/craft.md` - Reference domain context

**Content for implement.md addition**:
```markdown
## Phase 0.5: Complexity Detection

Before implementation begins, Sigil checks for complexity:
- Indexer work? → DX Physics generates test config
- Multi-repo? → Ecosystem mapping
- Unknown contracts? → Domain research

See `.claude/rules/18-sigil-complexity.md` for details.
```

**Acceptance Criteria**:
- [ ] implement.md updated with Phase 0.5
- [ ] craft.md references domain context
- [ ] Cross-references to rule file included

**Dependencies**: Tasks 3.1, 4.1

**Testing**:
- Read updated docs → complexity detection mentioned

---

### Task 4.3: Create Context Directory READMEs

**Description**: Document each context subdirectory.

**Files**:
- `grimoires/loa/context/indexer/README.md`
- `grimoires/loa/context/ecosystem/README.md`
- `grimoires/loa/context/domain/README.md`

**Content for indexer/README.md**:
```markdown
# Indexer Context (DX Physics)

Block range caches for fast indexer testing.

## Structure
```
indexer/
└── {chainId}/
    └── {contract}-{event}.json
```

## Cache Files
Each JSON contains:
- Contract address and event name
- Discovered block ranges
- Expiration (24 hours)

## Usage
Automatically populated by DX Physics handler.
To force refresh, delete the cache file.
```

**Acceptance Criteria**:
- [ ] All three READMEs created
- [ ] Structure documented
- [ ] Usage explained
- [ ] Consistent format

**Dependencies**: Task 1.1

**Testing**:
- All README files exist and are readable

---

### Task 4.4: End-to-End Integration Test

**Description**: Full workflow test from detection to completion.

**Test Scenario**:
```
1. Setup: Mock Envio project with:
   - package.json (@envio-dev/indexer)
   - envio.config.ts
   - src/EventHandlers.ts

2. Execute: /implement sprint-1

3. Verify:
   □ Complexity detection triggers (indexer)
   □ DX Physics analysis box appears
   □ Block range discovered (mock RPC)
   □ envio.test.yaml generated
   □ verification-*.graphql generated
   □ Context stored in grimoires/loa/context/indexer/
   □ Taste signal logged
   □ Implementation continues with enriched context

4. Second run (within 24h):
   □ Cache used (no RPC call)
   □ Compact mode (if 3+ accepts)
```

**Acceptance Criteria**:
- [ ] All 8 verification steps pass
- [ ] Second run uses cache
- [ ] No errors throughout flow

**Dependencies**: All previous tasks

**Testing**:
- Manual walkthrough
- Verify each step

---

### Task 4.5: Final Documentation Review

**Description**: Ensure all documentation is complete and consistent.

**Review Checklist**:
- [ ] `.claude/rules/18-sigil-complexity.md` complete
- [ ] All context READMEs created
- [ ] `/understand` command documented
- [ ] `/implement` updated with Phase 0.5
- [ ] Taste schema extended for DX
- [ ] Examples in all rule sections

**Acceptance Criteria**:
- [ ] No TODO comments remaining
- [ ] All cross-references valid
- [ ] Consistent formatting throughout

**Dependencies**: All previous tasks

**Testing**:
- Read through all docs
- Verify no broken references

---

## Success Metrics

| Metric | Target | Sprint |
|--------|--------|--------|
| Shared context structure | Complete | sprint-1 |
| Complexity detection accuracy | >90% | sprint-1 |
| DX Physics sync time reduction | 4h → 30s | sprint-2 |
| Handoff latency | <10s | sprint-3 |
| End-to-end workflow | Passing | sprint-4 |

---

## Risk Mitigation

| Risk | Mitigation | Sprint |
|------|------------|--------|
| RPC rate limiting | 24-hour caching | sprint-2 |
| Context staleness | TTL-based expiration | sprint-1 |
| Handoff complexity | Clear messaging | sprint-3 |
| Detection false positives | Confidence scoring | sprint-1 |

---

```
    ╔═══════════════════════════════════════════════════╗
    ║  UNIFIED SPRINT PLAN COMPLETE                     ║
    ║  Ready for /implement sprint-1                    ║
    ╚═══════════════════════════════════════════════════╝
```
