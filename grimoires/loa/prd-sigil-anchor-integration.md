---
title: "Loa Constructs Triad PRD"
version: "4.2.0"
status: draft
created: 2026-01-20
updated: 2026-01-20
author: Claude Opus 4.5
grounded: true
revision_note: "v4.2: Renamed 'Cognitive Load' to 'Visual Density' (proxy metric, not psychological state). Added Wasm signing to v1. Added Correction Loop for Lens → Sigil feedback."
---

# Loa Constructs Triad PRD

## Executive Summary

This PRD defines the **Loa Constructs Triad** — three modular capability packages that provide instant best-practice upgrades to any Loa-powered agent:

- **Sigil** (Feel): Design physics for UI — how interfaces *feel* to users
- **Anchor** (Reality): Ground truth enforcement — what's *actually happening* on-chain
- **Lens** (Lint): UX heuristic analysis — what *known patterns* predict about usability

Together, they form a complete product development loop: **Design → Validate → Lint**.

> **Note on Lens (formerly Persona):** This construct performs static heuristic analysis against known UX patterns. It does NOT simulate human behavior or predict adoption. LLMs are pattern-matchers, not causal agents. Any "prediction" would be retrieval of training data stereotypes, not genuine behavioral modeling.

> **Neuro-Symbolic Architecture:** This system follows a Neuro[Symbolic] cooperative paradigm. The neural network (Sigil) generates; the symbolic engines (Anchor/Lens) validate against hard logic. Feel is generated; correctness is verified.

## Vision: The Next Wave

> "Loa is the base agent. Sigil teaches it feel. Anchor grounds it in reality. Lens catches what humans would catch. Together, they give builders superpowers they don't have to think about."

**Target Users**: The next wave of builders who want AI-assisted development without needing to understand the underlying frameworks. Best practices should be invisible — they just happen.

**Philosophy**:
- **Loa**: Base agent runtime (task management, memory, evaluation)
- **Sigil Construct**: Frontend feel (UI physics, animation, material)
- **Anchor Construct**: Backend reality (blockchain state, data validation)
- **Lens Construct**: UX linting (heuristic checks, accessibility, known anti-patterns)
- **Async by Default**: Validation happens in background, never blocks generation
- **MCP-Native**: Inter-construct communication via Model Context Protocol

**The Triad Loop**:
```
    ┌─────────────────────────────────────────────────────────────┐
    │                                                             │
    │     DESIGN ──────► VALIDATE ──────► LINT                   │
    │       │              │               │                      │
    │     Sigil         Anchor           Lens                    │
    │   (MCP Client)   (MCP Server)    (MCP Server)              │
    │       │              │               │                      │
    │       └──────────────┴───────────────┘                      │
    │                      │                                      │
    │        GENERATE ◄─── │ ───► WARN (if constraint violated)  │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘
```

## Problem Statement

### Current State
1. Sigil exists as a monolithic framework with many commands
2. Anchor exists as a separate CLI tool
3. No clear boundary between "feel" concerns and "reality" concerns
4. Installation is manual, configuration is complex
5. Users must understand both systems to use them effectively
6. No automated checking for known UX anti-patterns

### Pain Points
1. **Tangled I/O**: Unclear when Sigil should hand off to Anchor
2. **Installation Friction**: Manual setup, multiple steps
3. **Cognitive Load**: Users think about frameworks instead of products
4. **Scaling Issues**: Each new construct adds complexity
5. **No Composition**: Tools don't pipe cleanly together
6. **Missed Anti-Patterns**: Known UX violations slip through

## Constructs Architecture

### What is a Loa Construct?

A Construct is a self-contained capability package with:

```
construct/
├── manifest.json         # Capabilities declaration
├── mcp-server.wasm       # Sandboxed execution (v1 requirement)
├── .claude/
│   ├── skills/           # Agent skills
│   ├── commands/         # Slash commands
│   └── rules/            # Context rules (RLM)
├── grimoires/{name}/     # State zone
└── [optional: binaries]  # CLI tools
```

### Sigil as a Construct

**Package**: `thj/sigil`
**Purpose**: Teach agents to generate UI with correct design physics
**Role**: MCP Client (consumes resources from Anchor/Lens)

```json
{
  "$schema": "https://constructs.network/schemas/pack-manifest.json",
  "name": "sigil",
  "version": "3.0.0",
  "description": "Design physics for AI-generated UI",

  "domain": "frontend",
  "zone": "feel",

  "mcp": {
    "role": "client",
    "consumes": ["anchor://vocabulary", "anchor://zones", "lens://heuristics"]
  },

  "inputs": {
    "component_request": "string",
    "keywords": "string[]",
    "context": "object"
  },

  "outputs": {
    "physics_analysis": "PhysicsAnalysis",
    "component_code": "string",
    "taste_signal": "TasteSignal"
  },

  "escalation_triggers": [
    "data_source_concern",
    "blockchain_state_needed",
    "zone_validation_required"
  ],

  "escalates_to": "anchor",
  "validation_mode": "async"
}
```

### Anchor as a Construct

**Package**: `thj/anchor`
**Purpose**: Ground agent claims in blockchain reality
**Role**: MCP Server (exposes resources to Sigil/Lens)

```json
{
  "$schema": "https://constructs.network/schemas/pack-manifest.json",
  "name": "anchor",
  "version": "1.0.0",
  "description": "Ground truth enforcement for blockchain state",

  "domain": "backend",
  "zone": "reality",

  "mcp": {
    "role": "server",
    "exposes": {
      "resources": [
        { "uri": "anchor://vocabulary", "description": "Effect keywords and physics mappings" },
        { "uri": "anchor://zones", "description": "Zone hierarchy definitions" },
        { "uri": "anchor://state/{address}", "description": "On-chain state for contract" }
      ],
      "tools": [
        { "name": "validate_zone", "description": "Validate zone assignment for component" },
        { "name": "check_data_source", "description": "Verify data source appropriateness" }
      ]
    }
  },

  "inputs": {
    "grounding_statement": "GroundingStatement",
    "validation_request": "ValidationRequest",
    "fork_config": "ForkConfig"
  },

  "outputs": {
    "validation_result": "ValidationResult",
    "exit_code": "number",
    "fork_state": "ForkState"
  },

  "provides": [
    "zone_validation",
    "fork_management",
    "checkpoint_recovery"
  ],

  "receives_from": "sigil",
  "execution_mode": "async"
}
```

### Lens as a Construct

**Package**: `thj/lens`
**Purpose**: Static UX heuristic analysis against known patterns
**Role**: MCP Server (exposes heuristic checking tools)

> **Critical Scope Limitation**: Lens performs pattern-matching against documented UX heuristics. It does NOT:
> - Simulate human cognition or behavior
> - Predict adoption rates or user reactions
> - Model emergent friction through "agent simulation"
> - Provide behavioral forecasts with confidence intervals
>
> Any output framed as "prediction" is heuristic matching, not causal modeling.

```json
{
  "$schema": "https://constructs.network/schemas/pack-manifest.json",
  "name": "lens",
  "version": "1.0.0",
  "description": "UX heuristic linting for generated components",

  "domain": "analysis",
  "zone": "heuristics",

  "mcp": {
    "role": "server",
    "exposes": {
      "resources": [
        { "uri": "lens://heuristics", "description": "Available heuristic rules" },
        { "uri": "lens://constraints", "description": "Formal verification constraints" }
      ],
      "tools": [
        { "name": "lint_component", "description": "Run heuristic checks on component" },
        { "name": "verify_constraints", "description": "Formal verification against physics constraints" }
      ]
    }
  },

  "inputs": {
    "component_code": "string",
    "physics_analysis": "PhysicsAnalysis",
    "validation_result": "ValidationResult",
    "lint_config": "LintConfig"
  },

  "outputs": {
    "violations": "Violation[]",
    "warnings": "Warning[]",
    "accessibility_issues": "A11yIssue[]",
    "constraint_results": "ConstraintResult[]",
    "engineering_metrics": "EngineeringMetrics"
  },

  "heuristic_categories": [
    "fitts_law",
    "accessibility_wcag",
    "click_depth",
    "touch_targets",
    "contrast_ratios",
    "visual_density",
    "known_anti_patterns"
  ],

  "receives_from": ["sigil", "anchor"],
  "execution_mode": "async"
}
```

### What Lens Can Actually Do

| Capability | Method | Validity |
|------------|--------|----------|
| Fitts's Law violations | Mathematical: distance / target size | High |
| WCAG contrast failures | Algorithmic: color ratio calculation | High |
| Touch target violations | Measurement: < 44px check | High |
| Click depth analysis | Graph traversal: steps to action | High |
| Known anti-pattern matching | Pattern recognition against documented patterns | Medium |
| Visual density (element count) | Count: elements per view ≤ 7 | High |
| Visual density (nesting depth) | Count: max nesting ≤ 4 levels | High |
| "User confusion" prediction | **NOT SUPPORTED** — requires human testing | N/A |
| "Adoption likelihood" | **NOT SUPPORTED** — unfalsifiable | N/A |

### Visual Density: Proxy Metrics Only

> **Important Distinction:** These are proxy metrics for cognitive load, not measurements of cognitive load itself. "Visual Density" is countable; "Cognitive Load" is a psychological state that requires human testing to measure. We explicitly avoid claiming psychological insight.

| Metric | Constraint | Rationale |
|--------|------------|-----------|
| Elements per view | ≤ 7 | Miller's Law heuristic (7±2 items) |
| Nesting depth | ≤ 4 levels | Deeper nesting increases parse time |
| Actions per task | ≤ 3 clicks | Three-click rule heuristic |
| Concurrent animations | ≤ 2 | Attention split heuristic |

These are countable proxies. Lens counts elements; it does not measure psychological states. A screen with 5 complex elements may have higher cognitive load than 8 simple ones—we cannot detect that. We detect density, not load.

**Goodhart's Law Warning:** Optimizing for element count alone can lead to pathological UIs (e.g., fragmenting into unusable wizard flows). These metrics are guardrails, not goals.

## MCP Architecture (Replacing Custom Pipes)

### Why MCP Over Custom Pipes

The previous architecture proposed custom JSON pipes between constructs. This is replaced with the Model Context Protocol (MCP) for these reasons:

| Custom Pipes | MCP |
|--------------|-----|
| Reinvents connection lifecycle | Standardized connection management |
| Race conditions with shared files | Resources are requested, not shared |
| Custom serialization | Standard JSON-RPC framing |
| No capability negotiation | Built-in capability discovery |
| Security is DIY | Transport-level security options |

### MCP Topology

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              LOA (Host)                                  │
│                                                                          │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│   │  SIGIL (Client) │    │ ANCHOR (Server) │    │  LENS (Server)  │     │
│   │                 │    │                 │    │                 │     │
│   │  Consumes:      │    │  Exposes:       │    │  Exposes:       │     │
│   │  - vocabulary   │◄───│  - vocabulary   │    │  - heuristics   │     │
│   │  - zones        │    │  - zones        │    │  - constraints  │     │
│   │  - heuristics   │◄───│  - state/{addr} │    │                 │     │
│   │                 │    │                 │    │  Tools:         │     │
│   │  Calls:         │    │  Tools:         │    │  - lint_component│    │
│   │  - validate_zone│───►│  - validate_zone│    │  - verify_const │     │
│   │  - lint_component│──►│  - check_source │    │                 │     │
│   │                 │    │                 │    │                 │     │
│   └─────────────────┘    └─────────────────┘    └─────────────────┘     │
│           │                      │                      │               │
│           └──────────────────────┴──────────────────────┘               │
│                                  │                                      │
│                          Wasm Sandbox                                   │
│                    (Isolated execution per construct)                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### MCP Resource URIs

| Resource | Owner | Consumers | Description |
|----------|-------|-----------|-------------|
| `anchor://vocabulary` | Anchor | Sigil, Lens | Effect keywords and physics mappings |
| `anchor://zones` | Anchor | Sigil, Lens | Zone hierarchy (critical/elevated/standard/local) |
| `anchor://state/{address}` | Anchor | Sigil | On-chain state for specific contract |
| `lens://heuristics` | Lens | Sigil | Available heuristic rules |
| `lens://constraints` | Lens | Sigil | Formal verification constraints |

### MCP Tool Definitions

```typescript
// Anchor tools
interface ValidateZoneTool {
  name: "validate_zone";
  inputSchema: {
    component: string;
    keywords: string[];
    inferred_zone: Zone;
  };
  returns: {
    validated: boolean;
    exit_code: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    correct_zone?: Zone;
    warnings?: string[];
  };
}

interface CheckDataSourceTool {
  name: "check_data_source";
  inputSchema: {
    data_type: "balance" | "transaction" | "display" | "historical";
    current_source: "on_chain" | "indexed";
  };
  returns: {
    appropriate: boolean;
    recommended_source: "on_chain" | "indexed";
    reason: string;
  };
}

// Lens tools
interface LintComponentTool {
  name: "lint_component";
  inputSchema: {
    component_code: string;
    physics: PhysicsAnalysis;
    enabled_heuristics?: string[];
  };
  returns: {
    pass: boolean;
    violations: Violation[];
    warnings: Warning[];
    metrics: EngineeringMetrics;
  };
}

interface VerifyConstraintsTool {
  name: "verify_constraints";
  inputSchema: {
    component_code: string;
    physics: PhysicsAnalysis;
  };
  returns: {
    all_passed: boolean;
    results: ConstraintResult[];
  };
}
```

### No More Shared Files

With MCP:
- **No vocabulary.yaml sharing**: Sigil requests `anchor://vocabulary` resource
- **No race conditions**: Resources are fetched on-demand, not watched
- **No permission hacks**: MCP handles authorization at transport level
- **Stateless consumption**: Sigil doesn't cache; it requests fresh data

## Formal Verification Constraints

### Why Formal Verification

The previous metric "Physics accuracy: 95%" is circular—the LLM evaluates its own output. This is replaced with **formal verification**: symbolic constraints that are deterministically checked.

### Physics Constraint Schema

```yaml
# grimoires/anchor/constraints.yaml
# These are checked by Lens, not evaluated by the LLM

constraints:
  animation:
    - id: "damping-range"
      description: "Animation damping must be within valid range"
      rule: "damping >= 0.5 AND damping <= 0.9"
      applies_to: ["spring", "physics"]
      severity: error

    - id: "stiffness-range"
      description: "Spring stiffness must be within valid range"
      rule: "stiffness >= 100 AND stiffness <= 800"
      applies_to: ["spring"]
      severity: error

    - id: "duration-by-effect"
      description: "Duration must match effect type"
      rules:
        financial: "duration >= 600 AND duration <= 1000"
        destructive: "duration >= 400 AND duration <= 800"
        standard: "duration >= 100 AND duration <= 300"
        local: "duration >= 50 AND duration <= 150"
      severity: error

  timing:
    - id: "financial-minimum"
      description: "Financial operations require deliberate timing"
      rule: "effect == 'financial' IMPLIES timing >= 800"
      severity: error

    - id: "confirmation-required"
      description: "Destructive/financial require confirmation"
      rule: "(effect == 'financial' OR effect == 'destructive') IMPLIES confirmation == true"
      severity: error

  sync:
    - id: "pessimistic-for-money"
      description: "Financial operations must be pessimistic"
      rule: "effect == 'financial' IMPLIES sync == 'pessimistic'"
      severity: error

    - id: "no-optimistic-destructive"
      description: "Destructive operations must be pessimistic"
      rule: "effect == 'destructive' IMPLIES sync == 'pessimistic'"
      severity: error

  touch_targets:
    - id: "minimum-touch-target"
      description: "Touch targets must meet accessibility minimum"
      rule: "min(width, height) >= 44"
      severity: warning

    - id: "minimum-click-target"
      description: "Click targets must meet minimum"
      rule: "min(width, height) >= 32"
      severity: warning

  accessibility:
    - id: "contrast-aa"
      description: "Text must meet WCAG AA contrast"
      rule: "contrast_ratio >= 4.5"
      severity: warning

    - id: "contrast-aaa"
      description: "Text should meet WCAG AAA contrast"
      rule: "contrast_ratio >= 7.0"
      severity: info

  visual_density:
    - id: "elements-per-view"
      description: "Limit elements per view (Miller's Law proxy)"
      rule: "element_count <= 7"
      severity: warning
      note: "Proxy metric for cognitive load, not direct measurement"

    - id: "nesting-depth"
      description: "Limit nesting depth for parsability"
      rule: "max_nesting <= 4"
      severity: warning

    - id: "click-depth"
      description: "Limit clicks to primary action"
      rule: "click_depth <= 3"
      severity: warning
```

### Constraint Verification Output

```typescript
interface ConstraintResult {
  constraint_id: string;
  passed: boolean;
  actual_value: number | string | boolean;
  expected: string;  // The rule expression
  severity: "error" | "warning" | "info";
  fix_suggestion?: string;
}

// Example output
const results: ConstraintResult[] = [
  {
    constraint_id: "damping-range",
    passed: true,
    actual_value: 0.7,
    expected: "damping >= 0.5 AND damping <= 0.9",
    severity: "error"
  },
  {
    constraint_id: "financial-minimum",
    passed: false,
    actual_value: 500,
    expected: "effect == 'financial' IMPLIES timing >= 800",
    severity: "error",
    fix_suggestion: "Increase timing to 800ms for financial effect"
  }
];
```

### Verification Flow

```
Sigil generates component with physics
       │
       ▼
Lens receives via MCP tool call
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  FORMAL VERIFICATION (deterministic, no LLM)                │
│                                                             │
│  For each constraint in constraints.yaml:                   │
│    1. Parse rule expression                                 │
│    2. Extract actual values from generated code             │
│    3. Evaluate: actual_value satisfies rule?                │
│    4. Record pass/fail with actual vs expected              │
│                                                             │
│  This is symbolic logic, NOT LLM inference                  │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
Return ConstraintResult[] to Sigil
       │
       ▼
Surface violations to user (if any)
```

## Correction Loop: Lens → Sigil Feedback

### Why a Correction Loop

When Lens rejects generated code, Sigil needs structured context to understand *why* it failed. Without this, Sigil would either:
1. Retry blindly (same mistake)
2. Give up (no learning)

The correction loop provides a "Correction Head" in the neuro-symbolic architecture—structured error context that enables informed retry.

### Correction Context Schema

```typescript
interface CorrectionContext {
  // Which constraints failed
  violations: {
    constraint_id: string;
    rule: string;           // The symbolic rule that failed
    actual: number | string;
    expected: string;       // Human-readable expectation
    severity: "error" | "warning";
  }[];

  // Structured fix hints (machine-readable)
  fixes: {
    target: string;         // e.g., "timing", "sync", "damping"
    current_value: any;
    required_value: any;
    reason: string;         // Why this change is needed
  }[];

  // Retry budget
  attempt: number;          // Current attempt (1, 2, 3...)
  max_attempts: number;     // Default: 2 (one retry)

  // Context preservation
  original_request: string; // User's original /craft request
  physics_analysis: PhysicsAnalysis; // What Sigil originally detected
}
```

### Correction Flow

```
Sigil generates component (attempt 1)
       │
       ▼
Lens verifies constraints
       │
       ▼ (violations found)
┌─────────────────────────────────────────────────────────────┐
│  CORRECTION CONTEXT RETURNED TO SIGIL                       │
│                                                             │
│  violations:                                                │
│    - constraint_id: "financial-minimum"                     │
│      rule: "effect == 'financial' IMPLIES timing >= 800"    │
│      actual: 500                                            │
│      expected: "timing >= 800ms for financial effect"       │
│                                                             │
│  fixes:                                                     │
│    - target: "timing"                                       │
│      current_value: 500                                     │
│      required_value: 800                                    │
│      reason: "Financial operations need deliberate timing"  │
│                                                             │
│  attempt: 1                                                 │
│  max_attempts: 2                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
Sigil regenerates with correction context (attempt 2)
       │
       ▼
Lens verifies again
       │
       ├── PASS → Return to user
       │
       └── FAIL → Surface violations to user with both attempts shown
```

### MCP Tool Extension

The `lint_component` tool returns correction context on failure:

```typescript
interface LintComponentResult {
  pass: boolean;
  violations: Violation[];
  warnings: Warning[];
  metrics: EngineeringMetrics;

  // Added: Correction context for Sigil
  correction?: CorrectionContext;
}
```

### Retry Behavior

| Attempt | Sigil Behavior |
|---------|----------------|
| 1 | Generate normally based on physics analysis |
| 2 | Apply `fixes` from correction context, regenerate |
| 3+ | Surface to user: "Constraint cannot be satisfied automatically" |

**Important**: Retry limit is 2 attempts total (1 initial + 1 retry). This prevents infinite loops and surfaces hard conflicts to the user quickly.

### User-Facing Correction

When retry fails, user sees both attempts:

```
┌─ Constraint Conflict ──────────────────────────────────────┐
│                                                            │
│  User request: "quick claim button"                        │
│                                                            │
│  Attempt 1: timing=200ms (detected: "quick")               │
│  Attempt 2: timing=800ms (applied fix: financial minimum)  │
│                                                            │
│  Conflict: "quick" and "financial" have incompatible       │
│  physics. Financial operations require 800ms timing.       │
│                                                            │
│  Options:                                                  │
│  [1] Use 800ms (recommended for financial safety)          │
│  [2] Use 200ms (override financial physics)                │
│  [3] Remove "quick" and regenerate                         │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Why Not More Retries?

1. **Constraint violations are deterministic**: If fix hints don't resolve the issue, more attempts won't help
2. **User agency**: Conflicting requirements need human decision
3. **Latency**: Each retry adds ~1-2 seconds
4. **Debugging clarity**: Showing 2 attempts makes the conflict visible

## Wasm Sandbox (v1 Requirement)

### Why Wasm, Not Directory Permissions

Directory-based isolation is insufficient:
- Path traversal attacks
- Symlink exploitation
- Prompt injection leading to cross-construct access

Wasm provides:
- Memory isolation (can't access host memory)
- Capability-based I/O (explicit grants for file/network)
- Deterministic execution (reproducible verification)

### Construct Execution Model

```
┌─────────────────────────────────────────────────────────────┐
│                        LOA HOST                              │
│                                                              │
│   ┌────────────────────────────────────────────────────┐    │
│   │              Wasm Runtime (wasmtime/wasmer)        │    │
│   │                                                    │    │
│   │   ┌──────────┐   ┌──────────┐   ┌──────────┐      │    │
│   │   │  Sigil   │   │  Anchor  │   │   Lens   │      │    │
│   │   │  .wasm   │   │  .wasm   │   │  .wasm   │      │    │
│   │   │          │   │          │   │          │      │    │
│   │   │ Caps:    │   │ Caps:    │   │ Caps:    │      │    │
│   │   │ - MCP    │   │ - MCP    │   │ - MCP    │      │    │
│   │   │ - write  │   │ - RPC    │   │ - read   │      │    │
│   │   │   sigil/ │   │ - write  │   │   lens/  │      │    │
│   │   │          │   │   anchor/│   │          │      │    │
│   │   └──────────┘   └──────────┘   └──────────┘      │    │
│   │                                                    │    │
│   └────────────────────────────────────────────────────┘    │
│                                                              │
│   Capabilities granted per-construct:                        │
│   - Sigil: write grimoires/sigil/, MCP client               │
│   - Anchor: write grimoires/anchor/, MCP server, RPC        │
│   - Lens: write grimoires/lens/, MCP server                 │
│                                                              │
│   NOT granted:                                               │
│   - Cross-grimoire access                                    │
│   - Arbitrary network                                        │
│   - Host filesystem outside grimoire                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Capability Manifest

Each construct declares required capabilities:

```json
{
  "name": "anchor",
  "wasi": {
    "filesystem": {
      "preopens": {
        "/grimoire": "grimoires/anchor/"
      }
    },
    "network": {
      "allowed_hosts": ["*.ethereum.org", "*.alchemy.com", "localhost:8545"]
    },
    "mcp": {
      "role": "server",
      "allowed_clients": ["sigil", "lens"]
    }
  }
}
```

### Build Process

```bash
# Constructs are compiled to Wasm
cargo build --target wasm32-wasi --release

# Resulting artifact
anchor/
├── manifest.json
├── anchor.wasm          # Sandboxed binary
└── grimoires/anchor/    # Pre-opened directory
```

## Clean Separation Model

### Domain Boundaries

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                    LOA (Base Agent)                                   │
│                                                                                       │
│     Memory │ Tasks │ Evaluation │ Trajectory │ Session Continuity │ Constructs       │
└──────────────────────────────────────────────────────────────────────────────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              │                           │                           │
    ┌─────────▼─────────┐       ┌────────▼────────┐       ┌─────────▼─────────┐
    │   SIGIL (Feel)    │       │ ANCHOR (Reality)│       │   LENS (Lint)     │
    │   [MCP Client]    │       │   [MCP Server]  │       │   [MCP Server]    │
    │   [Wasm Sandbox]  │       │  [Wasm Sandbox] │       │  [Wasm Sandbox]   │
    │                   │       │                 │       │                   │
    │  • UI Physics     │◄─MCP──│ • Zone Validate │──MCP─►│  • Heuristic Check│
    │  • Animation      │       │ • Fork Manage   │       │  • A11y Audit     │
    │  • Material       │       │ • Checkpoints   │       │  • Formal Verify  │
    │  • Taste Learning │       │ • Exit Codes    │       │  • Metrics        │
    │                   │       │                 │       │                   │
    │  grimoires/sigil/ │       │grimoires/anchor/│       │  grimoires/lens/  │
    └───────────────────┘       └─────────────────┘       └───────────────────┘

    Execution:                  Execution:                 Execution:
    BLOCKING                    BACKGROUND                 BACKGROUND
    (generates code)            (validates async)          (lints async)

    Outputs:                    Outputs:                   Outputs:
    - Physics analysis          - Validation result        - Violations list
    - Generated code            - Exit code (0-6)          - Constraint results
    - Taste signal              - Warnings (if drift)      - Engineering metrics
```

### Async-First Architecture

**Why async by default:**
1. RPC calls to blockchain nodes: 100-300ms typical
2. LLM inference for validation logic: 50-200ms
3. Users should not wait for validation to see generated code

**Flow:**
```
User: /craft "claim button"
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  SIGIL (sync, blocking)                                     │
│  - Request anchor://vocabulary via MCP                      │
│  - Detect keywords → "claim" → Financial                    │
│  - Apply physics → pessimistic, 800ms, confirmation         │
│  - Generate component code                                  │
│  - Return to user IMMEDIATELY                               │
└─────────────────────────────────────────────────────────────┘
       │
       ├──► [User sees generated code]
       │
       ▼ (background, non-blocking)
┌─────────────────────────────────────────────────────────────┐
│  ANCHOR (async, via MCP tool call)                          │
│  - validate_zone tool invoked                               │
│  - Query blockchain state                                   │
│  - Validate zone assignment                                 │
│  - If issues: return warning via MCP                        │
└─────────────────────────────────────────────────────────────┘
       │
       ▼ (background, non-blocking)
┌─────────────────────────────────────────────────────────────┐
│  LENS (async, via MCP tool call)                            │
│  - lint_component tool invoked                              │
│  - verify_constraints tool invoked                          │
│  - Deterministic constraint checking (no LLM)               │
│  - If violations: return via MCP                            │
└─────────────────────────────────────────────────────────────┘
```

### Ownership Rules

| Concern | Owner | Never Touches |
|---------|-------|---------------|
| UI timing (100ms-800ms) | Sigil | Blockchain state, Heuristic rules |
| Animation physics | Sigil | Data sources, Violation counts |
| Material surfaces | Sigil | Zone enforcement, Constraint results |
| Taste accumulation | Sigil | Fork management, Metrics |
| Zone hierarchy | Anchor | Component styling, Heuristics |
| Blockchain state | Anchor | Animation values, Violations |
| Fork lifecycle | Anchor | User preferences, Lint results |
| Exit codes | Anchor | Taste signals, Constraint results |
| Heuristic checks | Lens | Physics values, Exit codes |
| Formal verification | Lens | Animation, Fork state |
| Anti-pattern detection | Lens | Material surfaces, Zones |
| Engineering metrics | Lens | Taste logging, Checkpoints |

### State Zone Separation

Each construct owns its own grimoire (enforced by Wasm capabilities):

```
grimoires/
├── loa/                    # Loa owns (PRD, SDD, sprints)
├── sigil/                  # Sigil owns (pre-opened in Wasm)
│   ├── taste.md            # Accumulated preferences
│   ├── craft-state.md      # Current session
│   ├── constitution.yaml   # Feature flags
│   └── moodboard/          # Design references
├── anchor/                 # Anchor owns (pre-opened in Wasm)
│   ├── constraints.yaml    # Formal verification constraints
│   ├── sessions/           # Fork session state
│   ├── checkpoints/        # Saved states
│   └── physics.yaml        # Zone → physics mapping
└── lens/                   # Lens owns (pre-opened in Wasm)
    ├── heuristics/         # Heuristic rule definitions
    │   ├── fitts-law.yaml
    │   ├── wcag-aa.yaml
    │   ├── touch-targets.yaml
    │   └── anti-patterns.yaml
    ├── results/            # Lint results per session
    ├── metrics/            # Engineering metrics history
    └── config.yaml         # Lint configuration
```

## Exit Code Contract

| Code | Name | Sigil Response |
|------|------|----------------|
| 0 | VALID | No action needed |
| 1 | DRIFT | Surface warning to user |
| 2 | DECEPTIVE | Surface warning, suggest zone increase |
| 3 | VIOLATION | Surface error, suggest fix |
| 4 | REVERT | Internal failure, log and continue |
| 5 | CORRUPT | Abort validation, log error |
| 6 | SCHEMA | Fix input, retry once |

## Installation Experience

### Goal: Zero Configuration

```bash
# Install Loa (base agent)
loa init

# Add Sigil construct (frontend feel)
loa install sigil

# Add Anchor construct (backend reality)
loa install anchor

# Add Lens construct (UX linting) - optional
loa install lens

# That's it. Best practices now "just work".
```

### What Happens Behind the Scenes

1. **Construct Download**: Fetch Wasm module from Loa Constructs registry
2. **Manifest Validation**: Verify compatibility with Loa version
3. **Capability Check**: Verify requested Wasm capabilities are safe
4. **State Zone Creation**: Create `grimoires/{construct}/`
5. **MCP Registration**: Register construct as MCP client/server
6. **Load Rules**: Add rules to RLM (Rule Language Model)
7. **Gitignore Update**: Add construct paths to `.gitignore`

### Construct Priority

When constructs have overlapping capabilities:

| Priority | Source | Example |
|----------|--------|---------|
| 1 | Local override | `.claude/overrides/sigil/` |
| 2 | User construct | Custom local construct |
| 3 | Sigil construct | `thj/sigil` |
| 4 | Anchor construct | `thj/anchor` |
| 5 | Lens construct | `thj/lens` |
| 6 | Loa default | Base agent behavior |

## User Experience

### Invisible Best Practices

**Before Constructs** (manual knowledge required):
```
User: /craft "claim button"
Claude: "What sync strategy? Pessimistic or optimistic?"
User: "Uh... pessimistic?"
Claude: "What timing?"
User: "800ms? I think?"
Claude: [generates with user's guesses]
```

**After Constructs** (best practices automatic):
```
User: /craft "claim button"

┌─ Physics Analysis ─────────────────────────────────────────┐
│                                                            │
│  Component:    ClaimButton                                 │
│  Detected:     "claim" → Financial → Critical zone         │
│                                                            │
│  Applied Physics (automatic):                              │
│  • Sync: pessimistic (money can't roll back)               │
│  • Timing: 800ms (user needs verification time)            │
│  • Confirmation: required                                  │
│                                                            │
└────────────────────────────────────────────────────────────┘

[Generates correct component immediately]

[~500ms later, if constraint violations detected]
┌─ Formal Verification ──────────────────────────────────────┐
│  Anchor: ✓ Zone validated (exit 0)                         │
│  Lens: ✓ All constraints passed                            │
│  • damping-range: 0.7 ✓                                    │
│  • financial-minimum: 800ms ✓                              │
│  • touch-target: 48px ✓                                    │
└────────────────────────────────────────────────────────────┘
```

### Constraint Violation UX

When formal verification fails:

```
User: /craft "quick claim button"

[Component generated immediately]

┌─ Constraint Violations ────────────────────────────────────┐
│                                                            │
│  ✗ FAILED: financial-minimum                               │
│    Rule: effect == 'financial' IMPLIES timing >= 800       │
│    Actual: timing = 200ms                                  │
│    Fix: Increase timing to 800ms for financial effect      │
│                                                            │
│  ✗ FAILED: pessimistic-for-money                           │
│    Rule: effect == 'financial' IMPLIES sync == 'pessimistic'│
│    Actual: sync = 'optimistic'                             │
│    Fix: Change sync to pessimistic for financial effect    │
│                                                            │
│  [Apply fixes] [Override (explain why)]                    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Functional Requirements

### FR-1: Construct Manifest Schema

**Requirement**: All three constructs must have valid `manifest.json` with MCP configuration.

**Acceptance Criteria**:
- [ ] Sigil manifest declares MCP role: client
- [ ] Anchor manifest declares MCP role: server with resources/tools
- [ ] Lens manifest declares MCP role: server with resources/tools
- [ ] All manifests define Wasm capability requirements
- [ ] Execution mode specified (sync/async)

### FR-2: Wasm Sandbox Execution

**Requirement**: Each construct executes in isolated Wasm sandbox.

**Acceptance Criteria**:
- [ ] Constructs compile to wasm32-wasi target
- [ ] Filesystem access limited to pre-opened grimoire
- [ ] Network access limited to declared hosts
- [ ] No cross-construct memory access
- [ ] Capability violations result in trap, not silent failure

### FR-3: MCP Communication

**Requirement**: Inter-construct communication via Model Context Protocol.

**Acceptance Criteria**:
- [ ] Anchor exposes vocabulary/zones/state as MCP resources
- [ ] Lens exposes heuristics/constraints as MCP resources
- [ ] Sigil consumes resources via MCP client
- [ ] Tool calls (validate_zone, lint_component) work async
- [ ] No shared filesystem access between constructs

### FR-4: Formal Verification

**Requirement**: Physics constraints verified deterministically, not by LLM.

**Acceptance Criteria**:
- [ ] Constraints defined in YAML with symbolic rules
- [ ] Lens parses and evaluates constraints without LLM
- [ ] Verification output shows actual vs expected values
- [ ] Violations include machine-readable fix suggestions
- [ ] All constraints are falsifiable (can fail)

### FR-5: Zero-Config Installation

**Requirement**: `loa install {construct}` just works for all three.

**Acceptance Criteria**:
- [ ] Single command installs construct
- [ ] Wasm module downloaded and verified
- [ ] MCP server/client registered
- [ ] State zone auto-created
- [ ] Rules auto-loaded

### FR-6: Graceful Degradation

**Requirement**: If one construct is unavailable, the others continue working.

**Acceptance Criteria**:
- [ ] Sigil works without Anchor (uses defaults, warns about missing validation)
- [ ] Sigil works without Lens (no linting, no warning)
- [ ] Anchor works without Sigil (CLI-only validation)
- [ ] Lens works without Sigil (standalone linting)
- [ ] MCP connection failures handled gracefully

## Non-Functional Requirements

### NFR-1: Installation Speed

- `loa install sigil`: <5 seconds
- `loa install anchor`: <5 seconds
- `loa install lens`: <5 seconds

### NFR-2: Latency Targets

- Sigil generation (blocking): <1 second
- MCP resource fetch: <50ms (local)
- Anchor validation (async): <2 seconds total
- Lens verification (async): <500ms total
- User sees generated code: <1 second from command

### NFR-3: State Zone Size

- `grimoires/sigil/`: <1MB typical
- `grimoires/anchor/`: <500KB typical
- `grimoires/lens/`: <500KB typical
- Wasm modules: <5MB each

### NFR-4: Cognitive Load

- Zero framework knowledge required to use
- Best practices invisible to user
- Constraint violations in plain language
- Error messages include fix suggestions

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Install success rate | 99% | % of `loa install` that complete |
| Constraint violations detected | 100% | Known violations in test set detected (deterministic) |
| Specification accuracy | >95% | Constraints match intended behavior (requires audit) |
| Async latency P95 | <2s | Time for background validation to complete |
| Wasm startup time | <100ms | Time for construct to initialize |

> **Note on False Positives:** Formal verification is deterministic given correct specifications. However, specifications are written by humans and may contain bugs (specification drift). A "0% false positive rate" is only achievable if specifications are perfect—which they are not. We measure specification accuracy separately.

### Metrics Replaced (No Longer Tracked)

| Old Metric | Why Removed | Replacement |
|------------|-------------|-------------|
| "Physics accuracy: 95%" | Circular (LLM evaluates LLM) | Constraint pass rate (deterministic) |
| "User questions: <5%" | Subjective | N/A (not measurable) |
| "Lint violations detected: >90%" | Probabilistic | Constraint violations: 100% (deterministic) |

## Security Considerations

### Isolation Model

| Layer | Mechanism | Threat Mitigated |
|-------|-----------|------------------|
| Memory | Wasm linear memory | Cross-construct data access |
| Filesystem | WASI pre-opens | Path traversal, symlink attacks |
| Network | Capability allow-list | Exfiltration, SSRF |
| IPC | MCP over stdio | Message injection |

### Threat Model

| Threat | Mitigation |
|--------|------------|
| Prompt injection in Sigil reads Anchor state | Wasm sandbox: Sigil cannot access Anchor's grimoire |
| Malicious construct exfiltrates data | Network allow-list: only declared hosts accessible |
| Construct escapes sandbox | Wasm memory isolation: no host memory access |
| MCP message tampering | MCP framing: JSON-RPC with session binding |

### Limitations Acknowledged

1. **Shared Loa host**: All constructs share the same Claude session context
2. **No MCP message signing**: MCP messages not cryptographically authenticated (v2)

### v1 Security Requirements

1. **Signed Wasm modules**: Registry provides Ed25519 signatures for all modules
   - Installation MUST verify signature before loading
   - Unsigned modules MUST be rejected
   - This closes the supply chain attack vector
2. **Audit logging**: All cross-construct MCP calls logged with timestamps

### Future Security (v2)

1. **MCP auth tokens**: Per-session authentication for tool calls
2. **Signature rotation**: Key rotation policy for registry signing keys

## Migration Path

### Phase 1: Anchor MCP Server (Week 1)

1. Compile Anchor to Wasm
2. Implement MCP server with resources/tools
3. Expose vocabulary, zones, state resources
4. Implement validate_zone, check_data_source tools
5. Define formal constraints in constraints.yaml

### Phase 2: Lens MCP Server (Week 2)

1. Compile Lens to Wasm
2. Implement MCP server with resources/tools
3. Implement deterministic constraint verification
4. No LLM in verification path
5. Return structured ConstraintResult[]

### Phase 3: Sigil MCP Client (Week 3)

1. Compile Sigil to Wasm
2. Implement MCP client consuming Anchor/Lens
3. Replace file reads with resource requests
4. Integrate async tool calls for validation/linting
5. Surface constraint violations in UX

### Phase 4: Installation Integration (Week 4)

1. Wasm module hosting in registry
2. Capability verification on install
3. MCP registration in Loa host
4. Test full triad flow

### Phase 5: Polish & Hardening (Week 5)

1. Security audit of Wasm capabilities
2. Performance optimization
3. Error handling for MCP failures
4. Documentation

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Wasm compilation complexity | Medium | High | Start with Rust, well-supported target |
| MCP learning curve | Low | Medium | MCP is standardized, good docs |
| Performance overhead from Wasm | Low | Low | Wasm is near-native speed |
| Construct conflicts via MCP | Low | Medium | Clear resource/tool ownership |

## Open Questions

1. **Wasm runtime**: wasmtime vs wasmer vs wazero?
2. **MCP transport**: stdio vs HTTP for local constructs?
3. **Constraint language**: YAML rules vs embedded DSL?
4. **Registry hosting**: Self-hosted vs CDN for Wasm modules?

## Appendix: What Lens Does NOT Do

To prevent scope creep and false confidence, Lens explicitly does NOT:

| Capability | Why Excluded |
|------------|--------------|
| "Simulate user behavior" | LLMs pattern-match, they don't simulate cognition |
| "Predict adoption rates" | No ground truth without shipping |
| "Model frustration" | Requires Theory of Mind, which LLMs lack |
| "Forecast churn" | Causal modeling beyond LLM capability |
| "Calculate happiness scores" | Unfalsifiable metric |
| "Emergent friction detection" | Requires real users, not pattern matching |
| "Evaluate physics accuracy" | Circular if LLM evaluates LLM output |

Lens is a **linter**, not a **simulator**. It checks against known heuristics and formal constraints. It does not predict how humans will feel.

## Appendix: Neuro-Symbolic Architecture

This system follows a Neuro[Symbolic] cooperative paradigm:

```
┌─────────────────────────────────────────────────────────────┐
│                     NEURO (Generation)                       │
│                                                              │
│   Sigil: "Given 'claim button', generate UI with physics"   │
│   Output: Component code with timing, animation, material    │
│                                                              │
│   This is probabilistic. It can be wrong.                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SYMBOLIC (Verification)                    │
│                                                              │
│   Anchor: "Is zone assignment correct?"                      │
│   Lens: "Does timing satisfy constraint?"                    │
│                                                              │
│   This is deterministic. It cannot be wrong.                 │
│   Rules are symbolic logic, not learned patterns.            │
│                                                              │
│   constraint: timing >= 800 AND sync == 'pessimistic'        │
│   evaluation: 800 >= 800 AND 'pessimistic' == 'pessimistic'  │
│   result: PASS                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

The neural network generates; the symbolic engine validates. Feel is subjective; correctness is not.
