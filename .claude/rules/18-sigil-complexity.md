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
