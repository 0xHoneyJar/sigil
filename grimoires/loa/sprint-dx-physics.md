# DX Physics: Sprint Plan

```
    ╔═══════════════════════════════════════════════════╗
    ║  ✦ SIGIL: DX PHYSICS SPRINT PLAN                 ║
    ║  3 Sprints • 6 Days • 4 Components               ║
    ╚═══════════════════════════════════════════════════╝
```

**Version**: 1.0.0
**Last Updated**: 2026-01-19
**PRD**: `grimoires/loa/prd-dx-physics.md`
**SDD**: `grimoires/loa/sdd-dx-physics.md`

---

## Sprint Overview

| Sprint | Focus | Duration | Goal |
|--------|-------|----------|------|
| sprint-1 | Foundation | Days 1-2 | Indexer detection + DX physics rules |
| sprint-2 | Discovery | Days 3-4 | RPC block range discovery + config generation |
| sprint-3 | Integration | Days 5-6 | /implement enhancement + end-to-end testing |

**MVP Definition**: After sprint-3, `/implement` can detect Envio projects, discover block ranges via RPC, and generate test configs that reduce sync time from hours to ~30 seconds.

---

## sprint-1: Foundation

**Goal**: Create the DX Physics rule file with indexer detection and physics tables.

**Deliverables**:
- `.claude/rules/18-sigil-dx-physics.md` with detection logic
- DX physics timing table
- Envio-specific detection patterns

---

### Task 1.1: Create DX Physics Rule File Structure

**Description**: Create the new rule file with proper XML structure following Sigil conventions.

**File**: `.claude/rules/18-sigil-dx-physics.md`

**Acceptance Criteria**:
- [ ] File created at correct path
- [ ] Uses XML tags for sections (`<dx_physics>`, `<detection>`, etc.)
- [ ] Follows Sigil rule naming convention (numbered prefix)
- [ ] Includes frontmatter if needed for skill routing

**Dependencies**: None

**Testing**:
- Verify file loads without parse errors
- Check XML structure is valid

---

### Task 1.2: Implement DX Physics Timing Table

**Description**: Add the DX physics table that maps developer workflows to timing targets.

**Content to include**:
```markdown
<dx_physics_table>
## DX Physics Table

| Effect | DX Timing | Method | Rationale |
|--------|-----------|--------|-----------|
| Handler iteration | <60s | Targeted block range | Fast feedback enables rapid iteration |
| API endpoint testing | <5s | Local server | Immediate response for quick checks |
| UI component testing | <2s | Hot reload | Instant feedback for visual changes |
| Database migration | <30s | Test database | Quick verification before production |
| Full chain sync | Hours | Production only | Comprehensive, acceptable for final verification |

</dx_physics_table>
```

**Acceptance Criteria**:
- [ ] Table included in rule file
- [ ] All 5 effect types documented
- [ ] Timing targets match PRD specification
- [ ] Rationale explains WHY for each timing

**Dependencies**: Task 1.1

**Testing**:
- Read file and verify table structure
- Confirm timings match PRD

---

### Task 1.3: Implement Indexer Detection Logic

**Description**: Add detection logic for identifying Envio indexer projects.

**Content to include**:
```markdown
<indexer_detection>
## Indexer Context Detection

### Detection Algorithm

1. **Package.json Check**
   Read package.json, check dependencies for:
   - `@envio-dev/indexer` → Envio (HIGH confidence)
   - `@graphprotocol/graph-ts` → The Graph (future)
   - `@ponder/core` → Ponder (future)

2. **Config File Check**
   Check for existence of:
   - `envio.config.ts` OR `config.yaml` → Envio
   - `subgraph.yaml` → The Graph (future)
   - `ponder.config.ts` → Ponder (future)

3. **Confidence Scoring**
   | Signals Found | Confidence | Action |
   |---------------|------------|--------|
   | Package + Config | HIGH | Proceed with DX physics |
   | Package only | MEDIUM | Proceed with DX physics |
   | Config only | MEDIUM | Proceed with DX physics |
   | Neither | NONE | Skip DX physics |

4. **Handler File Detection**
   Trigger DX analysis when working on:
   - `src/EventHandlers.ts`
   - `src/*Handler*.ts`
   - `src/loaders/*.ts`
   - Any file importing from `@envio-dev/indexer`

</indexer_detection>
```

**Acceptance Criteria**:
- [ ] Detection algorithm documented with clear steps
- [ ] Confidence scoring table included
- [ ] Handler file patterns specified
- [ ] Future framework placeholders noted (The Graph, Ponder)

**Dependencies**: Task 1.1

**Testing**:
- Mock package.json with @envio-dev/indexer → should detect HIGH
- Mock envio.config.ts only → should detect MEDIUM
- Mock neither → should return NONE

---

### Task 1.4: Add Detection Examples

**Description**: Add concrete examples showing detection input → output.

**Content to include**:
```markdown
<detection_examples>
## Detection Examples

<example>
<input>
package.json: { "dependencies": { "@envio-dev/indexer": "^1.0.0" } }
Files: envio.config.ts exists
</input>
<detection>
Framework: Envio
Confidence: HIGH
Reason: Both package dependency and config file present
</detection>
<action>Proceed with DX Physics workflow</action>
</example>

<example>
<input>
package.json: { "dependencies": { "react": "^18.0.0" } }
Files: No indexer config files
</input>
<detection>
Framework: None
Confidence: N/A
</detection>
<action>Skip DX Physics, normal workflow</action>
</example>

</detection_examples>
```

**Acceptance Criteria**:
- [ ] At least 2 examples (positive and negative detection)
- [ ] Examples use input → detection → action format
- [ ] Clear reasoning for each detection outcome

**Dependencies**: Task 1.3

**Testing**:
- Verify examples cover edge cases
- Confirm format matches Sigil conventions

---

## sprint-2: Discovery & Generation

**Goal**: Implement RPC-based block range discovery and test config generation.

**Deliverables**:
- Block Range Discoverer logic in rules
- Config Generator templates
- GraphQL verification query templates
- Cache structure for block ranges

---

### Task 2.1: Implement Envio Config Parser

**Description**: Add logic to parse envio.config.ts and extract contract/event information.

**Content to include**:
```markdown
<config_parser>
## Envio Config Parser

Parse `envio.config.ts` to extract:

### Expected Structure
```typescript
// envio.config.ts
export default createConfig({
  networks: [{
    id: 80094,
    rpc_config: { url: process.env.BERACHAIN_RPC_URL }
  }],
  contracts: [{
    name: "StakingVault",
    network: "berachain",
    address: "0x...",
    event_handlers: [{
      event: "Staked",
      loader: loaderEvent
    }]
  }]
})
```

### Extraction Steps
1. Read envio.config.ts as text
2. Extract `networks` array (id, rpc_config.url)
3. Extract `contracts` array (name, address, events)
4. Resolve env var references (${VAR_NAME})
5. Return structured EnvioConfig object

### Fallback Behavior
If parsing fails:
- Prompt user for contract address
- Prompt user for target event name
- Prompt user for RPC URL

</config_parser>
```

**Acceptance Criteria**:
- [ ] Parser logic documented
- [ ] Handles env var references (${VAR_NAME})
- [ ] Fallback behavior defined for parse failures
- [ ] Expected config structure documented

**Dependencies**: sprint-1 complete

**Testing**:
- Parse sample envio.config.ts
- Verify extraction of networks, contracts, events
- Test env var resolution

---

### Task 2.2: Implement Block Range Discoverer

**Description**: Add RPC-based block range discovery logic.

**Content to include**:
```markdown
<block_range_discovery>
## Block Range Discovery

Discover accurate block ranges via RPC queries.

### RPC Methods Used
| Method | Purpose | Rate Impact |
|--------|---------|-------------|
| `eth_getLogs` | Find event occurrences | 1 call, moderate |
| `eth_getCode` | Verify contract exists | 1 call, minimal |
| `eth_blockNumber` | Get current block | 1 call, minimal |

### Discovery Algorithm

1. **Parse config** to get contract address and target event
2. **Query eth_getLogs** for last 100,000 blocks (~1 day):
   ```
   eth_getLogs({
     address: contractAddress,
     topics: [keccak256(eventSignature)],
     fromBlock: currentBlock - 100000,
     toBlock: "latest"
   })
   ```
3. **Select block range** around recent events:
   - If events found: targetBlock = median event block
   - Window: targetBlock ± 50 blocks
4. **Fallback** if no events:
   - Use contract creation block
   - Window: creationBlock + 1000 blocks
   - Add warning: "No recent events found"

### Output
```
{
  startBlock: 15899050,
  endBlock: 15899150,
  confidence: "HIGH",
  eventsInRange: 7,
  warning: null
}
```

</block_range_discovery>
```

**Acceptance Criteria**:
- [ ] RPC methods documented with rate impact
- [ ] Discovery algorithm with 4 clear steps
- [ ] Fallback behavior for no events
- [ ] Output schema defined

**Dependencies**: Task 2.1

**Testing**:
- Mock RPC response with events → should return HIGH confidence range
- Mock RPC response with no events → should use fallback with warning

---

### Task 2.3: Implement Block Range Caching

**Description**: Add caching logic to avoid repeated RPC queries.

**Content to include**:
```markdown
<block_range_cache>
## Block Range Cache

Cache discovered block ranges to minimize RPC calls.

### Cache Location
`grimoires/sigil/context/indexer/{chainId}/{contractAddress}-{event}.json`

### Cache Schema
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

### Cache Behavior
| Scenario | Action |
|----------|--------|
| Cache exists + not expired | Use cached range |
| Cache exists + expired | Re-query RPC, update cache |
| Cache missing | Query RPC, create cache |
| User requests fresh | Ignore cache, re-query |

### Expiration
Default: 24 hours from discovery time

</block_range_cache>
```

**Acceptance Criteria**:
- [ ] Cache location specified
- [ ] Cache schema documented
- [ ] Expiration behavior defined (24 hours)
- [ ] All scenarios covered (hit, miss, expired, forced refresh)

**Dependencies**: Task 2.2

**Testing**:
- Create cache file, verify read on next detection
- Verify expired cache triggers re-query

---

### Task 2.4: Implement Test Config Generator

**Description**: Add template system for generating envio.test.yaml.

**Content to include**:
```markdown
<config_generator>
## Test Config Generator

Generate envio.test.yaml for targeted testing.

### Template
```yaml
# Generated by Sigil DX Physics
# Purpose: Fast feedback loop for ${EVENT_NAME} handler
# Block range: ${START_BLOCK} - ${END_BLOCK} (${BLOCK_COUNT} blocks)
# Events expected: ${EVENTS_IN_RANGE}
# Est. sync time: ${ESTIMATED_TIME}

name: "test-${EVENT_NAME_LOWER}"
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

### Interpolation Variables
| Variable | Source |
|----------|--------|
| `EVENT_NAME` | From handler file analysis |
| `START_BLOCK` / `END_BLOCK` | From Block Range Discoverer |
| `CHAIN_ID` | From envio.config.ts |
| `CONTRACT_NAME` / `ADDRESS` | From envio.config.ts |
| `RPC_ENV_VAR` | From envio.config.ts |
| `ESTIMATED_TIME` | Calculated from block count |

### Time Estimation
| Block Count | Estimated Time |
|-------------|----------------|
| ≤100 | ~30 seconds |
| ≤1000 | ~2 minutes |
| ≤10000 | ~10 minutes |
| >10000 | ~30+ minutes |

</config_generator>
```

**Acceptance Criteria**:
- [ ] Complete YAML template with all placeholders
- [ ] Variable interpolation table
- [ ] Time estimation logic
- [ ] Template matches Envio config schema

**Dependencies**: Task 2.2

**Testing**:
- Generate config with sample data
- Validate YAML syntax
- Verify time estimation

---

### Task 2.5: Implement GraphQL Verification Template

**Description**: Add template for generating verification queries.

**Content to include**:
```markdown
<verification_generator>
## GraphQL Verification Generator

Generate query to verify handler produced correct data.

### Template
```graphql
# Generated verification query for ${EVENT_NAME}
# Run after test sync completes

query Verify${EVENT_NAME}Test {
  ${ENTITY_NAME_PLURAL}(
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
    ${PRIMARY_FIELDS}
  }
}

# Expected Results:
# - At least ${EVENTS_IN_RANGE} results
# - All fields should be non-null
# - blockNumber in range [${START_BLOCK}, ${END_BLOCK}]
```

### Entity Name Derivation
| Event | Entity Name (Plural) |
|-------|---------------------|
| Staked | stakeEvents |
| Unstaked | unstakeEvents |
| Transfer | transfers |
| [CustomEvent] | [customEvent]s |

### Usage
```bash
curl -X POST http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "<query_content>"}'
```

</verification_generator>
```

**Acceptance Criteria**:
- [ ] GraphQL template with proper syntax
- [ ] Entity name derivation rules
- [ ] Expected results documented
- [ ] Usage example (curl command)

**Dependencies**: Task 2.4

**Testing**:
- Generate query for Staked event
- Validate GraphQL syntax
- Verify entity name derivation

---

## sprint-3: Integration

**Goal**: Integrate DX Physics into /implement workflow with analysis box and end-to-end testing.

**Deliverables**:
- Modified /implement command with DX Physics detection
- DX Physics analysis box
- Complete end-to-end workflow
- Taste signal logging for DX

---

### Task 3.1: Add DX Physics Phase to /implement

**Description**: Add Phase 0.5 to implementing-tasks skill for DX Physics detection.

**File**: `.claude/skills/implementing-tasks/SKILL.md`

**Content to add**:
```markdown
## Phase 0.5: DX Physics Check (NEW)

Before starting implementation, check for indexer context:

1. **Run Indexer Detector**
   - Check package.json for @envio-dev/indexer
   - Check for envio.config.ts

2. **If Detected (HIGH/MEDIUM confidence)**
   - Check if current task involves handler files
   - Parse envio.config.ts for contract/event info
   - Run Block Range Discoverer (RPC query)
   - Show DX Physics analysis box

3. **If User Accepts**
   - Generate envio.test.yaml
   - Generate verification.graphql
   - Add to sprint outputs
   - Suggest test-first workflow

4. **Continue with Normal Implementation**
```

**Acceptance Criteria**:
- [ ] Phase 0.5 added before Phase 1
- [ ] Clear triggering conditions
- [ ] User confirmation step included
- [ ] Continues to normal workflow after

**Dependencies**: sprint-2 complete

**Testing**:
- Run /implement on Envio project → should show DX Physics box
- Run /implement on React project → should skip to normal workflow

---

### Task 3.2: Implement DX Physics Analysis Box

**Description**: Add the analysis box format for DX Physics detection.

**Content to add to rules**:
```markdown
<dx_analysis_box>
## DX Physics Analysis Box

When indexer context detected, show:

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
│  Target event:  ${EVENT_NAME}                          │
│  Block range:   ${START_BLOCK} - ${END_BLOCK}          │
│  Events found:  ${EVENTS_IN_RANGE} occurrences         │
│  Est. sync:     ${ESTIMATED_TIME}                      │
│                                                        │
│  Generated files:                                      │
│  • envio.test.yaml                                     │
│  • verification-${EVENT_LOWER}.graphql                 │
│                                                        │
│  [y] Generate test config + continue                   │
│  [n] Skip, use full sync                               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Compact Mode
After 3+ consecutive accepts, use compact:

```
DX Physics | Envio | ${EVENT_NAME} | ${START_BLOCK}-${END_BLOCK} | ~${ESTIMATED_TIME}
Generate test config? (y/n)
```

</dx_analysis_box>
```

**Acceptance Criteria**:
- [ ] Full analysis box format documented
- [ ] All interpolation variables included
- [ ] Compact mode for repeat users
- [ ] y/n confirmation prompt

**Dependencies**: Task 3.1

**Testing**:
- Verify box renders correctly with sample data
- Test compact mode trigger after 3 accepts

---

### Task 3.3: Add DX Taste Signal Logging

**Description**: Extend taste.md schema to log DX Physics signals.

**Content to add to `06-sigil-taste.md`**:
```markdown
## DX Physics Signals

When DX Physics generates configs, log signals:

### Schema Extension
```yaml
---
timestamp: "2026-01-19T14:35:00Z"
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
  sync_time_actual: "28s"  # If user reports
  events_indexed: 7
learning:
  inference: "100-block range sufficient for Staked"
---
```

### Signal Detection
| User Action | Signal |
|-------------|--------|
| Accepts test config | ACCEPT |
| Modifies block range | MODIFY |
| Skips DX Physics | REJECT |

```

**Acceptance Criteria**:
- [ ] DX-specific schema extension documented
- [ ] `dx_physics` section with framework, event, range
- [ ] Signal detection rules for DX context
- [ ] Learning inference for block range optimization

**Dependencies**: Task 3.1

**Testing**:
- Accept DX Physics → verify ACCEPT logged
- Skip DX Physics → verify REJECT logged

---

### Task 3.4: Update /implement Context Files

**Description**: Add DX Physics context files to implement.md frontmatter.

**File**: `.claude/commands/implement.md`

**Content to add**:
```yaml
context_files:
  # ... existing context files ...

  # DX Physics integration (NEW)
  - path: "envio.config.ts"
    required: false
    purpose: "Envio indexer configuration (triggers DX Physics)"
  - path: "package.json"
    required: false
    purpose: "Dependency detection for indexer frameworks"
  - path: "grimoires/sigil/context/indexer/"
    required: false
    purpose: "Cached block ranges for DX Physics"
```

**Acceptance Criteria**:
- [ ] envio.config.ts added to context_files
- [ ] package.json included for detection
- [ ] Cache directory included
- [ ] All marked as optional (required: false)

**Dependencies**: None (can run parallel with 3.1)

**Testing**:
- Verify implement.md parses correctly
- Confirm context files are read when present

---

### Task 3.5: Create Cache Directory Structure

**Description**: Create the indexer cache directory with README.

**Files**:
- `grimoires/sigil/context/indexer/README.md`

**Content**:
```markdown
# Indexer Block Range Cache

This directory caches discovered block ranges for DX Physics.

## Structure
```
indexer/
├── README.md
├── {chainId}/
│   └── {contractAddress}-{event}.json
```

## Cache Files

Each JSON file contains:
- Contract address and event name
- Discovered block ranges
- Discovery timestamp
- Expiration (24 hours from discovery)

## Expiration

Caches expire after 24 hours. To force refresh:
- Delete the cache file, or
- Answer "n" to "Use cached range?" prompt

## Privacy

These files contain only public blockchain data:
- Block numbers
- Contract addresses
- Event names

No private keys, RPC URLs, or sensitive data is cached.
```

**Acceptance Criteria**:
- [ ] README.md created in cache directory
- [ ] Structure documented
- [ ] Expiration behavior explained
- [ ] Privacy note included

**Dependencies**: None

**Testing**:
- Verify directory structure created
- Confirm README is readable

---

### Task 3.6: End-to-End Integration Test

**Description**: Test the complete DX Physics workflow on a sample Envio project.

**Test Scenario**:
1. Create mock Envio project with:
   - package.json with @envio-dev/indexer
   - envio.config.ts with Staked event
   - src/EventHandlers.ts

2. Run `/implement sprint-1` (simulated)
3. Verify:
   - DX Physics detection triggers
   - Analysis box shows correct info
   - Block range discovery works (mock RPC)
   - Test config generated correctly
   - Verification query generated
   - Taste signal logged

**Acceptance Criteria**:
- [ ] Full workflow completes without errors
- [ ] All generated files valid (YAML, GraphQL)
- [ ] Taste signal logged correctly
- [ ] Compact mode triggers after 3 accepts

**Dependencies**: Tasks 3.1-3.5 complete

**Testing**:
- Manual walkthrough of complete workflow
- Verify all outputs match expected formats

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Detection accuracy | 100% | No false positives/negatives on test projects |
| Config generation | <10s | Time from detection to config file |
| Block range accuracy | >90% events captured | Events in range vs total recent events |
| Sync time reduction | 4 hours → 30 seconds | Before/after test sync times |

---

## Risk Mitigation

| Risk | Mitigation | Owner |
|------|------------|-------|
| RPC rate limiting | 24-hour caching | Task 2.3 |
| Config parse failure | Fallback to user prompts | Task 2.1 |
| No recent events | Use creation block + warning | Task 2.2 |

---

## Dependencies

| External | Status | Impact |
|----------|--------|--------|
| Envio CLI | Available | Required for test sync |
| RPC Endpoint | User provides | Required for block discovery |

---

```
    ╔═══════════════════════════════════════════════════╗
    ║  SPRINT PLAN COMPLETE                             ║
    ║  Ready for /implement sprint-1                    ║
    ╚═══════════════════════════════════════════════════╝
```
