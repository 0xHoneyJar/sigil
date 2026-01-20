# DX Physics: Tight Feedback Loops for Indexers

```
    ╔═══════════════════════════════════════════════════╗
    ║  ✦ SIGIL: DX PHYSICS EXTENSION                   ║
    ║  "DX enables best UX. Builders need great tools." ║
    ║                                                   ║
    ║  The same physics that make UX feel right        ║
    ║  apply to developer experience.                  ║
    ╚═══════════════════════════════════════════════════╝
```

**Version**: 1.0.0
**Last Updated**: 2026-01-19
**Status**: Discovery Phase Complete
**Owner**: THJ Team
**Related**: [Issue #20](https://github.com/0xHoneyJar/sigil/issues/20)

---

## Executive Summary

Sigil's design physics framework currently focuses on user-facing interactions (100-800ms response times). This PRD extends Sigil to cover **developer experience (DX)** — specifically blockchain indexer development where feedback loops are measured in hours, not milliseconds.

**The Core Insight**: The same physics thinking applies to DX. Developers are users too. When an indexer takes 4 hours to sync, that's a 14,400,000ms "pessimistic" response time — far outside any reasonable physics.

**Key Deliverables**:
1. New DX Physics layer within Sigil (not a separate construct)
2. Envio indexer detection via file patterns + package.json
3. `/implement` command enhancement for test config generation
4. DX feedback targets that mirror UX physics principles

---

## 1. Problem Statement

### 1.1 The DX Feedback Loop Crisis

Blockchain indexer development suffers from destructive feedback loops:

| Chain | Blocks | Full Sync Time | Impact |
|-------|--------|----------------|--------|
| Berachain | 15.9M | ~4 hours | 2-3 iterations/day max |
| Ethereum | 24.2M | 2-6 hours | 1-2 iterations/day max |
| Base | 41M | 16+ hours | Less than 1 iteration/day |

**The Destructive Cycle**:
```
Write handler → Wait 4 hours → Find bug → Fix → Wait 4 hours → Repeat
```

This violates a fundamental physics principle: **snappy feedback enables rapid iteration**.

### 1.2 Why This Belongs in Sigil

| Domain | Current Focus | Extension |
|--------|---------------|-----------|
| **User Experience** | 100-800ms response times | ✓ Covered |
| **Developer Experience** | Hours for feedback | ✗ Not covered |

Both domains share the same underlying physics:
- **Snappy** = fast iteration, confidence in changes
- **Deliberate** = careful verification, intentional slowness
- **Pessimistic** = wait for confirmation before proceeding

The difference is the timescale:
| Physics | UX Timing | DX Timing |
|---------|-----------|-----------|
| Snappy/Local | 100ms | <60 seconds |
| Optimistic | 200ms | <5 minutes |
| Deliberate | 600-800ms | <30 minutes |
| Pessimistic (production) | N/A | Full sync (hours, acceptable) |

### 1.3 Why Now?

- **THJ uses indexers heavily** — Envio powers multiple products
- **Sigil Construct migration underway** — natural integration point
- **Issue #20 demand** — team explicitly requested this capability
- **Proven pattern exists** — Envio's test mode already enables targeted syncs

> **Source**: Issue #20 analysis + THJ development patterns

---

## 2. Vision & Goals

### 2.1 Product Vision

> "Sigil extends from teaching AI about user physics to teaching AI about builder physics. DX enables best UX — builders need great tools to build with."

When `/implement` detects indexer work, it should:
1. Suggest creating minimal test configs with targeted block ranges
2. Generate configuration with `start_block`/`end_block` parameters
3. Provide verification templates (GraphQL queries, assertions)
4. Reduce feedback loops from hours to seconds

### 2.2 Success Criteria

| Metric | Target | Timeline |
|--------|--------|----------|
| Envio detection accuracy | 100% when project uses Envio | Immediate |
| Test config generation | <10 seconds | Immediate |
| Indexer handler feedback | <60 seconds | Via generated test config |
| Integration with `/implement` | Seamless | 1 week |

### 2.3 Non-Goals (Explicit Out of Scope)

- **The Graph support** — Future phase (different config format)
- **Ponder support** — Future phase (assess after Envio success)
- **Runtime optimizations** — Sigil is agent-time, not runtime
- **Chain data storage** — Users bring their own RPC endpoints
- **Production deployment** — Focus is dev/test feedback loops

---

## 3. User Personas

### 3.1 Primary: THJ Indexer Developers

**Role**: Developers building Envio indexers for web3 applications
**Needs**:
- Fast iteration when writing/debugging event handlers
- Confidence that handlers work before full chain sync
- Clear feedback when handlers fail or produce wrong data

**Current Workflow**:
```bash
# Full sync every time (hours)
pnpm envio codegen
pnpm envio dev
# Wait 4 hours to see if handler works...
```

**Desired Workflow**:
```bash
# Targeted test sync (seconds)
pnpm envio codegen
pnpm envio test --config=envio.test.yaml
# See results in 30 seconds
```

### 3.2 Secondary: Future Indexer Developers

Other indexer frameworks (The Graph, Ponder) will follow the same pattern once Envio integration proves successful.

---

## 4. Functional Requirements

### 4.1 Stream 1: Indexer Detection (P0 - Immediate)

**Requirement**: Detect when Sigil is working with indexer code

| Detection Method | Pattern | Confidence |
|------------------|---------|------------|
| File pattern | `envio.config.ts`, `config.yaml` | High |
| Package.json | `@envio-dev/indexer` dependency | High |
| File content | `Loader.`, `handlerWithLoader` imports | Medium |
| Directory | `src/EventHandlers.ts` | Medium |

**Detection Algorithm**:
```
1. Check package.json for @envio-dev/indexer → HIGH confidence
2. Check for envio.config.ts or config.yaml → HIGH confidence
3. If BOTH present → ENVIO_DETECTED
4. If NEITHER → NOT_INDEXER
5. If ONE → POSSIBLE_INDEXER, ask clarification
```

**Acceptance Criteria**:
- [x] Detect Envio projects with 100% accuracy
- [x] No false positives on non-indexer React projects
- [x] Detection completes in <500ms

### 4.2 Stream 2: Test Config Generation (P0)

**Requirement**: Generate targeted test configurations for fast feedback

**Envio Test Config Schema**:
```yaml
# envio.test.yaml - Generated by Sigil /implement
name: "test-staking-handler"
description: "Targeted test for Staked event handler"

networks:
  - id: 80094  # Berachain
    start_block: 15900000  # ~10 blocks before known event
    end_block: 15900100    # ~10 blocks after known event
    rpc_config:
      url: "${BERACHAIN_RPC_URL}"

contracts:
  - name: "StakingVault"
    address: "0x..."
    handler: "./src/EventHandlers.ts"
    events:
      - "Staked"  # Specific event being tested

# Test assertions (optional, for /ward validation)
assertions:
  - entity: "StakeEvent"
    count: ">= 1"
    fields:
      - "user != null"
      - "amount > 0"
```

**Generation Workflow**:
```
1. Parse envio.config.ts to understand schema
2. Identify events being worked on (from current file/diff)
3. Look up known block ranges for those events (if available)
4. Generate test config with ~100 block window
5. Create GraphQL verification query template
```

**Acceptance Criteria**:
- [ ] Generate valid envio.test.yaml from envio.config.ts
- [ ] Include targeted block range around known events
- [ ] Generate corresponding GraphQL query template
- [ ] Config produces working sync in <60 seconds

### 4.3 Stream 3: `/implement` Integration (P0)

**Requirement**: Enhance `/implement` to detect indexer context and suggest test configs

**Detection Trigger in /implement**:
```
When working on file that matches:
- src/EventHandlers.ts
- src/*Handler*.ts
- src/loaders/*.ts
- Any file importing from "@envio-dev/indexer"

Show DX Physics analysis:

┌─ DX Physics Detected ──────────────────────────────────┐
│                                                        │
│  Context:     Envio Indexer Handler                    │
│  Effect:      Long feedback loop (~4 hours full sync)  │
│                                                        │
│  Recommendation:                                       │
│  Generate test config for targeted 30-second sync?     │
│                                                        │
│  Target event:  Staked (from current work)             │
│  Block range:   15900000 - 15900100 (100 blocks)       │
│                                                        │
│  [y] Generate test config                              │
│  [n] Continue with full sync                           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Workflow Enhancement**:
1. Before implementing handler changes, detect indexer context
2. If detected, offer test config generation
3. If accepted, generate config + GraphQL template
4. After implementation, suggest running test sync first
5. Only proceed to full sync after test passes

### 4.4 Stream 4: DX Physics Rules (P1)

**Requirement**: Add DX physics rules to Sigil's rule set

**New Rule File**: `.claude/rules/18-sigil-dx-physics.md`

```markdown
# Sigil: DX Physics

Developer experience is user experience. The same physics principles apply.

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

<indexer_detection>
## Indexer Context Detection

Detect from file patterns and dependencies:

| Signal | Framework | Confidence |
|--------|-----------|------------|
| `@envio-dev/indexer` in package.json | Envio | High |
| `envio.config.ts` file | Envio | High |
| `subgraph.yaml` file | The Graph | High (future) |
| `ponder.config.ts` file | Ponder | High (future) |

</indexer_detection>

<test_config_generation>
## Test Config Generation

When indexer detected and handler work in progress:

1. Parse main config to understand schema
2. Identify target events from current work
3. Generate test config with minimal block range
4. Create GraphQL verification template
5. Suggest test-first workflow

</test_config_generation>
```

---

## 5. Technical Requirements

### 5.1 Detection Implementation

**File**: `.claude/rules/18-sigil-dx-physics.md`

```markdown
<detection_implementation>
## Detection Implementation

### Step 1: Package.json Check
Read package.json, check dependencies for:
- "@envio-dev/indexer" → Envio
- "@graphprotocol/graph-ts" → The Graph (future)
- "@ponder/core" → Ponder (future)

### Step 2: Config File Check
Check for existence of:
- envio.config.ts OR config.yaml → Envio
- subgraph.yaml → The Graph (future)
- ponder.config.ts → Ponder (future)

### Step 3: Confidence Scoring
| Signals Found | Confidence | Action |
|---------------|------------|--------|
| Package + Config | HIGH | Proceed with DX physics |
| Package only | MEDIUM | Proceed with DX physics |
| Config only | MEDIUM | Proceed with DX physics |
| Neither | NONE | Skip DX physics |

</detection_implementation>
```

### 5.2 Test Config Schema

**Envio Test Config Template**:
```yaml
# Generated by Sigil /implement with DX Physics
# Purpose: Fast feedback loop for handler development

name: "${TEST_NAME}"
description: "Targeted test for ${EVENT_NAME} handler"

networks:
  - id: ${CHAIN_ID}
    start_block: ${START_BLOCK}  # Known event - 10 blocks
    end_block: ${END_BLOCK}      # Known event + 10 blocks
    rpc_config:
      url: "${RPC_ENV_VAR}"

contracts:
  - name: "${CONTRACT_NAME}"
    address: "${CONTRACT_ADDRESS}"
    handler: "${HANDLER_PATH}"
    events:
      - "${EVENT_NAME}"
```

### 5.3 GraphQL Verification Template

```graphql
# Generated verification query for ${EVENT_NAME}
query Verify${EVENT_NAME}Test {
  ${ENTITY_NAME_PLURAL}(first: 10) {
    id
    ${FIELD_1}
    ${FIELD_2}
    blockNumber
    transactionHash
  }
}

# Expected: At least 1 result with valid fields
# If empty: Handler may not be processing event correctly
# If malformed: Check handler logic for field mapping
```

---

## 6. Prompting Best Practices

Based on Claude Code system prompt analysis and Loa skill patterns:

### 6.1 Rule Structure (from Oracle analysis)

**Use XML tags for section boundaries** (Claude parses reliably):
```xml
<section_name>
Content here
</section_name>
```

**Context over commands** — explain WHY, not just WHAT:
```
# Bad
Generate test config

# Good
Generate test config because full sync takes 4 hours.
Targeted block range enables 30-second feedback loops.
```

**Examples are critical** — use input → detection → output format:
```xml
<example>
<input>Working on src/EventHandlers.ts, modifying Staked handler</input>
<detection>DX: Indexer context detected (Envio, handler file)</detection>
<output>Suggest test config: envio.test.yaml with blocks 15900000-15900100</output>
</example>
```

### 6.2 Skill Structure (from Loa patterns)

**Use YAML frontmatter** for metadata:
```yaml
---
name: "dx-physics"
version: "1.0.0"
triggers:
  - "indexer work detected"
  - "EventHandler file modified"
---
```

**Pre-checks before action**:
```
1. Detect context (is this indexer work?)
2. Assess confidence (HIGH/MEDIUM/LOW)
3. Show analysis box
4. Get confirmation
5. Apply changes
```

**Gate patterns** for safety:
- Pre-Detect Gate: Verify context before analysis
- Pre-Generate Gate: Check for conflicts before generation
- Post-Generate Gate: Validate output before showing

### 6.3 Action Defaults

**DO immediately after confirmation**:
- Generate test config file
- Create GraphQL verification template
- Update workflow to suggest test-first approach

**DO NOT**:
- Ask "would you like me to generate this?"
- Provide partial implementations
- Skip the analysis box

---

## 7. Scope & Prioritization

### 7.1 Phase 1: Foundation (Days 1-2)

- [ ] Create `.claude/rules/18-sigil-dx-physics.md`
- [ ] Implement Envio detection (package.json + file patterns)
- [ ] Add DX physics table to rules

### 7.2 Phase 2: Test Config Generation (Days 3-4)

- [ ] Implement test config template system
- [ ] Parse envio.config.ts to extract contract/event info
- [ ] Generate envio.test.yaml with targeted block ranges
- [ ] Generate GraphQL verification templates

### 7.3 Phase 3: /implement Integration (Days 5-6)

- [ ] Enhance /implement to detect indexer context
- [ ] Show DX Physics analysis box when detected
- [ ] Integrate test config generation into workflow
- [ ] Add test-first workflow suggestion

### 7.4 Future Phases (Backlog)

- The Graph subgraph.yaml support
- Ponder ponder.config.ts support
- Known event block range database
- Cross-project block range sharing

---

## 8. Risks & Dependencies

### 8.1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Envio config schema changes | Test configs break | Pin to known schema version |
| RPC rate limiting | Test syncs fail | Suggest local RPC or retry logic |
| Block range estimation wrong | Tests miss events | Allow user override, learn from taste |

### 8.2 Operational Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Developers skip test configs | Return to slow loops | Make test-first default, show time savings |
| False detection on non-indexer | Confusing suggestions | Require BOTH file + package signals |

### 8.3 Dependencies

| Dependency | Owner | Status |
|------------|-------|--------|
| Envio test mode | Envio | Available |
| envio.config.ts parser | Sigil | Needed |
| Block range estimation | Sigil | Needed (or user-provided) |

---

## 9. Open Questions

1. **Block range sources**: Where do we get known event block numbers? Options:
   - User provides in context/
   - Query RPC for contract creation + recent events
   - Learn from previous test runs (taste accumulation)

2. **Multi-event testing**: How to handle handlers that process multiple event types?
   - Generate separate test configs per event?
   - Generate combined config with wider block range?

3. **Test result validation**: How to verify test sync produced correct data?
   - GraphQL query assertions
   - Entity count checks
   - Field validation rules

---

## 10. Appendices

### A. Envio Config Reference

```typescript
// envio.config.ts structure
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

### B. Test Config Example

```yaml
# envio.test.yaml
name: "test-staking"
networks:
  - id: 80094
    start_block: 15900000
    end_block: 15900100
    rpc_config:
      url: "${BERACHAIN_RPC_URL}"
contracts:
  - name: "StakingVault"
    address: "0x1234..."
    events:
      - "Staked"
```

### C. Verification Query Example

```graphql
query VerifyStakedTest {
  stakeEvents(first: 10, orderBy: blockNumber, orderDirection: desc) {
    id
    user
    amount
    blockNumber
    transactionHash
  }
}
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-19 | Claude | Initial PRD from Issue #20 |

---

*"DX enables best UX. Builders need great tools to build with."*

```
    ╔═══════════════════════════════════════════════════╗
    ║  PRD COMPLETE                                     ║
    ║  Ready for /architect                             ║
    ╚═══════════════════════════════════════════════════╝
```
