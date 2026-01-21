# Software Design Document: Loa Constructs Triad

**Version**: 1.0.0
**Status**: Draft
**Created**: 2026-01-20
**Author**: Claude Opus 4.5
**PRD Reference**: `grimoires/loa/prd-sigil-anchor-integration.md` (v4.2.0)

---

## 1. Executive Summary

This document details the technical architecture for the **Loa Constructs Triad** — three modular capability packages that provide instant best-practice upgrades to any Loa-powered agent:

- **Sigil** (Feel): Design physics for UI
- **Anchor** (Reality): Ground truth enforcement for blockchain state
- **Lens** (Lint): UX heuristic analysis via formal verification

### Architecture Pivot

During design review, the architecture was simplified from MCP-based communication to:

| Original (PRD) | Revised (SDD) | Rationale |
|----------------|---------------|-----------|
| MCP Client/Server | Rust CLI binaries | Industry moving toward skills + CLIs |
| MCP Resources | Shared `pub/` directory | Simpler, no protocol overhead |
| Wasm sandbox v1 | Native binaries, sandbox v2 | Velocity over isolation initially |
| MCP tool calls | CLI subprocess invocation | Aligns with Claude Code patterns |

**Key Technical Decisions**:
- **Rust** for Anchor and Lens CLIs (performance, type safety)
- **Shared pub/ directory** for inter-construct communication
- **CEL (Common Expression Language)** for constraint verification
- **Skills** orchestrate CLI invocation from Claude Code
- **Sandboxing deferred** to v2 when threat model is clearer

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           LOA (Base Agent)                               │
│                                                                          │
│  Memory │ Tasks │ Evaluation │ Session Continuity │ Construct Registry  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
    ┌─────────▼─────────┐ ┌────────▼────────┐ ┌─────────▼─────────┐
    │      SIGIL        │ │     ANCHOR      │ │      LENS         │
    │   (TypeScript)    │ │     (Rust)      │ │     (Rust)        │
    │                   │ │                 │ │                   │
    │  • Rules (RLM)    │ │ • CLI binary    │ │ • CLI binary      │
    │  • Skills         │ │ • Zone validate │ │ • CEL engine      │
    │  • /craft command │ │ • Data source   │ │ • Heuristic lint  │
    │                   │ │                 │ │                   │
    │  grimoires/sigil/ │ │grimoires/anchor/│ │  grimoires/lens/  │
    └─────────┬─────────┘ └────────┬────────┘ └─────────┬─────────┘
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │     grimoires/pub/          │
                    │   (Shared Communication)    │
                    │                             │
                    │  • vocabulary.yaml          │
                    │  • zones.yaml               │
                    │  • constraints.yaml         │
                    │  • requests/{id}.json       │
                    │  • responses/{id}.json      │
                    └─────────────────────────────┘
```

### 2.2 Communication Model

Inter-construct communication uses the shared `grimoires/pub/` directory:

```
grimoires/pub/
├── vocabulary.yaml           # Effect keywords → physics mappings (Anchor publishes)
├── zones.yaml                # Zone hierarchy definitions (Anchor publishes)
├── constraints.yaml          # Formal verification constraints (Lens publishes)
├── requests/                 # Request files (caller writes)
│   └── {uuid}.json           # Request payload
├── responses/                # Response files (callee writes)
│   └── {uuid}.json           # Response payload
└── .lock                     # Advisory lock for coordination
```

**Flow Example: Sigil → Anchor validation**

```
1. Sigil writes: grimoires/pub/requests/abc123.json
   {
     "type": "validate_zone",
     "component": "ClaimButton",
     "keywords": ["claim"],
     "inferred_zone": "critical"
   }

2. Sigil invokes: anchor validate --request abc123

3. Anchor reads request, validates, writes response:
   grimoires/pub/responses/abc123.json
   {
     "validated": true,
     "exit_code": 0
   }

4. Sigil reads response, continues
```

### 2.3 Execution Model

| Construct | Runtime | Invocation | Blocking |
|-----------|---------|------------|----------|
| Sigil | Claude Code (TypeScript rules) | Direct (RLM loaded) | Yes |
| Anchor | Rust binary | `anchor <command>` via Bash | No (async) |
| Lens | Rust binary | `lens <command>` via Bash | No (async) |

**Skills orchestrate the flow:**

```typescript
// skills/craft/index.ts (pseudo-code)
async function craft(request: string) {
  // 1. Sigil generates (blocking)
  const analysis = detectPhysics(request);
  const code = generateComponent(analysis);

  // 2. Write request for validation
  const requestId = uuid();
  await writeRequest(requestId, { component: code, analysis });

  // 3. Invoke Anchor + Lens in parallel (async)
  const [anchorResult, lensResult] = await Promise.all([
    exec(`anchor validate --request ${requestId}`),
    exec(`lens lint --request ${requestId}`)
  ]);

  // 4. Handle correction loop if needed
  if (!lensResult.pass) {
    return handleCorrection(lensResult.correction, requestId);
  }

  return { code, validation: anchorResult, lint: lensResult };
}
```

---

## 3. Technology Stack

### 3.1 Sigil (TypeScript/Rules)

| Component | Technology | Justification |
|-----------|------------|---------------|
| Rules engine | Claude Code RLM | Native integration, auto-loaded |
| Skills | TypeScript | Matches Claude Code ecosystem |
| State storage | Markdown/YAML | Human-readable, git-friendly |
| Taste learning | YAML frontmatter | Structured signals, append-only |

### 3.2 Anchor (Rust CLI)

| Component | Technology | Justification |
|-----------|------------|---------------|
| Language | Rust | Performance, safety, cross-platform |
| CLI framework | clap (derive) | Industry standard, ergonomic |
| Async runtime | tokio | Best-in-class async I/O |
| RPC client | alloy | Modern Ethereum library |
| YAML parsing | serde_yaml | Zero-copy deserialization |
| JSON handling | serde_json | De facto standard |

**Cargo.toml dependencies:**

```toml
[package]
name = "sigil-anchor"
version = "1.0.0"
edition = "2024"

[dependencies]
clap = { version = "4", features = ["derive"] }
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
serde_yaml = "0.9"
alloy = { version = "0.1", features = ["providers", "rpc"] }
uuid = { version = "1", features = ["v4"] }
thiserror = "1"
tracing = "0.1"
tracing-subscriber = "0.3"
```

### 3.3 Lens (Rust CLI)

| Component | Technology | Justification |
|-----------|------------|---------------|
| Language | Rust | Matches Anchor, shared types |
| CEL engine | cel-rust | Google's expression language |
| Heuristics | YAML rules | Declarative, auditable |
| AST parsing | tree-sitter | Language-agnostic code analysis |

**Additional dependencies for Lens:**

```toml
[dependencies]
# ... base dependencies from Anchor ...
cel-interpreter = "0.7"
tree-sitter = "0.20"
tree-sitter-typescript = "0.20"
```

---

## 4. Component Design

### 4.1 Sigil Component

Sigil remains TypeScript-based, loaded via Claude Code's RLM system.

**Directory structure:**

```
.claude/
├── rules/
│   ├── 00-sigil-core.md
│   ├── 01-sigil-physics.md
│   ├── 02-sigil-detection.md
│   ├── 03-sigil-patterns.md
│   ├── 04-sigil-protected.md
│   ├── 05-sigil-animation.md
│   ├── 06-sigil-taste.md
│   └── 07-sigil-material.md
├── skills/
│   └── craft/
│       ├── SKILL.md
│       └── index.ts
└── commands/
    └── craft.md
```

**Key interfaces:**

```typescript
interface PhysicsAnalysis {
  component: string;
  effect: "financial" | "destructive" | "soft_delete" | "standard" | "local";
  behavioral: {
    sync: "pessimistic" | "optimistic" | "immediate";
    timing: number;  // ms
    confirmation: boolean;
  };
  animation: {
    easing: string;
    duration: number;
    interruptible: boolean;
  };
  material: {
    surface: string;
    shadow: string;
    radius: string;
  };
}

interface TasteSignal {
  timestamp: string;
  signal: "ACCEPT" | "MODIFY" | "REJECT";
  component: {
    name: string;
    effect: string;
  };
  physics: PhysicsAnalysis;
  change?: {
    from: string;
    to: string;
  };
  learning?: {
    inference: string;
  };
}
```

### 4.2 Anchor Component (Rust)

**Binary structure:**

```rust
// src/main.rs
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "anchor", about = "Ground truth enforcement for blockchain state")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Validate zone assignment for a component
    Validate {
        #[arg(long)]
        request: String,
    },
    /// Check data source appropriateness
    CheckSource {
        #[arg(long)]
        request: String,
    },
    /// Publish vocabulary to pub/ directory
    Publish,
    /// Query on-chain state
    State {
        #[arg(long)]
        address: String,
        #[arg(long)]
        chain_id: u64,
    },
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Validate { request } => validate::run(&request).await,
        Commands::CheckSource { request } => check_source::run(&request).await,
        Commands::Publish => publish::run().await,
        Commands::State { address, chain_id } => state::run(&address, chain_id).await,
    }
}
```

**Module layout:**

```
anchor/
├── Cargo.toml
├── src/
│   ├── main.rs
│   ├── lib.rs                # Library interface for embedding
│   ├── commands/
│   │   ├── mod.rs
│   │   ├── validate.rs       # Zone validation logic
│   │   ├── check_source.rs   # Data source verification
│   │   ├── publish.rs        # Publish vocabulary/zones
│   │   └── state.rs          # On-chain state queries
│   ├── types/
│   │   ├── mod.rs
│   │   ├── zone.rs           # Zone hierarchy types
│   │   ├── vocabulary.rs     # Effect → physics mappings
│   │   └── request.rs        # Request/response schemas
│   ├── rpc/
│   │   ├── mod.rs
│   │   └── client.rs         # Ethereum RPC client
│   └── error.rs              # Error types
└── tests/
    └── integration/
```

**Exit code contract:**

```rust
// src/types/exit_code.rs
#[derive(Debug, Clone, Copy)]
#[repr(u8)]
pub enum ExitCode {
    Valid = 0,       // No action needed
    Drift = 1,       // Surface warning to user
    Deceptive = 2,   // Suggest zone increase
    Violation = 3,   // Surface error, suggest fix
    Revert = 4,      // Internal failure, log and continue
    Corrupt = 5,     // Abort validation, log error
    Schema = 6,      // Fix input, retry once
}
```

### 4.3 Lens Component (Rust)

**Binary structure:**

```rust
// src/main.rs
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "lens", about = "UX heuristic linting via formal verification")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Run heuristic checks on component
    Lint {
        #[arg(long)]
        request: String,
    },
    /// Verify formal constraints
    Verify {
        #[arg(long)]
        request: String,
    },
    /// Publish constraints to pub/ directory
    Publish,
}
```

**CEL constraint evaluation:**

```rust
// src/cel/evaluator.rs
use cel_interpreter::{Context, Program};

pub struct ConstraintEvaluator {
    constraints: Vec<Constraint>,
}

impl ConstraintEvaluator {
    pub fn evaluate(&self, physics: &PhysicsAnalysis) -> Vec<ConstraintResult> {
        self.constraints
            .iter()
            .map(|c| self.evaluate_constraint(c, physics))
            .collect()
    }

    fn evaluate_constraint(
        &self,
        constraint: &Constraint,
        physics: &PhysicsAnalysis,
    ) -> ConstraintResult {
        let program = Program::compile(&constraint.rule)
            .expect("Constraint compilation failed");

        let mut context = Context::default();
        context.add_variable("timing", physics.behavioral.timing);
        context.add_variable("sync", &physics.behavioral.sync);
        context.add_variable("effect", &physics.effect);
        context.add_variable("damping", physics.animation.damping);
        // ... add other variables

        let result = program.execute(&context);

        ConstraintResult {
            constraint_id: constraint.id.clone(),
            passed: result.unwrap_or(false),
            actual_value: self.extract_actual(constraint, physics),
            expected: constraint.rule.clone(),
            severity: constraint.severity,
            fix_suggestion: self.generate_fix(constraint, physics),
        }
    }
}
```

**Correction context generation:**

```rust
// src/correction.rs
pub fn build_correction_context(
    violations: &[ConstraintResult],
    attempt: u32,
    original_request: &str,
    physics: &PhysicsAnalysis,
) -> CorrectionContext {
    CorrectionContext {
        violations: violations
            .iter()
            .filter(|v| !v.passed)
            .map(|v| CorrectionViolation {
                constraint_id: v.constraint_id.clone(),
                rule: v.expected.clone(),
                actual: v.actual_value.clone(),
                expected: format_expected(&v.expected),
                severity: v.severity,
            })
            .collect(),
        fixes: violations
            .iter()
            .filter(|v| !v.passed && v.fix_suggestion.is_some())
            .map(|v| Fix {
                target: extract_target(&v.constraint_id),
                current_value: v.actual_value.clone(),
                required_value: extract_required(&v.fix_suggestion),
                reason: v.fix_suggestion.clone().unwrap_or_default(),
            })
            .collect(),
        attempt,
        max_attempts: 2,
        original_request: original_request.to_string(),
        physics_analysis: physics.clone(),
    }
}
```

---

## 5. Data Architecture

### 5.1 Shared Data Schemas

**vocabulary.yaml** (published by Anchor):

```yaml
# grimoires/pub/vocabulary.yaml
version: "1.0.0"
updated: "2026-01-20T00:00:00Z"

effects:
  financial:
    keywords:
      - claim
      - deposit
      - withdraw
      - transfer
      - swap
      - send
      - pay
      - purchase
      - mint
      - burn
      - stake
      - unstake
    type_overrides:
      - Currency
      - Money
      - Balance
      - Wei
      - Token
      - BigInt
    physics:
      sync: pessimistic
      timing: 800
      confirmation: true

  destructive:
    keywords:
      - delete
      - remove
      - destroy
      - revoke
      - terminate
    physics:
      sync: pessimistic
      timing: 600
      confirmation: true

  soft_delete:
    keywords:
      - archive
      - hide
      - trash
      - dismiss
    physics:
      sync: optimistic
      timing: 200
      confirmation: toast_undo

  standard:
    keywords:
      - save
      - update
      - edit
      - create
      - add
      - like
      - follow
    physics:
      sync: optimistic
      timing: 200
      confirmation: false

  local:
    keywords:
      - toggle
      - switch
      - expand
      - collapse
      - select
    physics:
      sync: immediate
      timing: 100
      confirmation: false
```

**zones.yaml** (published by Anchor):

```yaml
# grimoires/pub/zones.yaml
version: "1.0.0"

hierarchy:
  - name: critical
    description: "Operations that can lose user funds or cause irreversible harm"
    effects: [financial, destructive]
    validation: required

  - name: elevated
    description: "Operations with significant but reversible impact"
    effects: [soft_delete]
    validation: recommended

  - name: standard
    description: "Normal CRUD operations"
    effects: [standard]
    validation: optional

  - name: local
    description: "Client-only state changes"
    effects: [local]
    validation: none
```

**constraints.yaml** (published by Lens):

```yaml
# grimoires/pub/constraints.yaml
version: "1.0.0"

constraints:
  animation:
    - id: damping-range
      rule: "damping >= 0.5 && damping <= 0.9"
      severity: error

    - id: stiffness-range
      rule: "stiffness >= 100 && stiffness <= 800"
      severity: error

  timing:
    - id: financial-minimum
      rule: "effect == 'financial' ? timing >= 800 : true"
      severity: error
      fix: "Increase timing to 800ms"

    - id: destructive-minimum
      rule: "effect == 'destructive' ? timing >= 600 : true"
      severity: error
      fix: "Increase timing to 600ms"

  sync:
    - id: pessimistic-for-money
      rule: "effect == 'financial' ? sync == 'pessimistic' : true"
      severity: error
      fix: "Change sync to pessimistic"

  accessibility:
    - id: touch-target-minimum
      rule: "touch_target >= 44"
      severity: warning
      fix: "Increase touch target to 44px"

  visual_density:
    - id: elements-per-view
      rule: "element_count <= 7"
      severity: warning
      note: "Proxy metric, not cognitive load measurement"
```

### 5.2 Request/Response Schemas

**Validation request:**

```json
{
  "id": "abc123",
  "type": "validate_zone",
  "timestamp": "2026-01-20T12:00:00Z",
  "payload": {
    "component": "ClaimButton",
    "keywords": ["claim"],
    "inferred_zone": "critical",
    "physics": {
      "effect": "financial",
      "behavioral": {
        "sync": "pessimistic",
        "timing": 800,
        "confirmation": true
      }
    }
  }
}
```

**Validation response:**

```json
{
  "id": "abc123",
  "type": "validate_zone_response",
  "timestamp": "2026-01-20T12:00:01Z",
  "result": {
    "validated": true,
    "exit_code": 0,
    "correct_zone": "critical",
    "warnings": []
  }
}
```

**Lint request:**

```json
{
  "id": "def456",
  "type": "lint_component",
  "timestamp": "2026-01-20T12:00:00Z",
  "payload": {
    "component_code": "export function ClaimButton() { ... }",
    "physics": { ... },
    "enabled_heuristics": ["fitts_law", "touch_targets", "visual_density"]
  }
}
```

**Lint response with correction:**

```json
{
  "id": "def456",
  "type": "lint_component_response",
  "timestamp": "2026-01-20T12:00:02Z",
  "result": {
    "pass": false,
    "violations": [
      {
        "constraint_id": "financial-minimum",
        "passed": false,
        "actual_value": 500,
        "expected": "timing >= 800",
        "severity": "error"
      }
    ],
    "warnings": [],
    "correction": {
      "violations": [
        {
          "constraint_id": "financial-minimum",
          "rule": "effect == 'financial' ? timing >= 800 : true",
          "actual": 500,
          "expected": "timing >= 800ms for financial effect",
          "severity": "error"
        }
      ],
      "fixes": [
        {
          "target": "timing",
          "current_value": 500,
          "required_value": 800,
          "reason": "Financial operations need deliberate timing"
        }
      ],
      "attempt": 1,
      "max_attempts": 2
    }
  }
}
```

### 5.3 State Zone Layout

```
grimoires/
├── loa/                      # Loa framework state
│   ├── prd.md
│   ├── sdd.md
│   └── sprint.md
├── sigil/                    # Sigil state
│   ├── taste.md              # Accumulated preferences
│   ├── craft-state.md        # Current session
│   └── constitution.yaml     # Feature flags
├── anchor/                   # Anchor state
│   ├── sessions/             # Fork session state
│   └── checkpoints/          # Saved states
├── lens/                     # Lens state
│   ├── results/              # Lint results per session
│   └── metrics/              # Engineering metrics history
└── pub/                      # Shared communication
    ├── vocabulary.yaml
    ├── zones.yaml
    ├── constraints.yaml
    ├── requests/
    └── responses/
```

---

## 6. API Design

### 6.1 Anchor CLI API

```bash
# Zone validation
anchor validate --request <request-id>
# Exit: 0 (valid), 1 (drift), 2 (deceptive), 3 (violation)

# Data source check
anchor check-source --request <request-id>
# Exit: 0 (appropriate), 1 (recommend different source)

# Publish vocabulary/zones to pub/
anchor publish
# Exit: 0 (success), 1 (error)

# Query on-chain state
anchor state --address 0x... --chain-id 1
# Outputs: JSON to stdout
```

### 6.2 Lens CLI API

```bash
# Heuristic linting
lens lint --request <request-id>
# Exit: 0 (pass), 1 (violations found)
# Writes: grimoires/pub/responses/{request-id}.json

# Formal verification
lens verify --request <request-id>
# Exit: 0 (all pass), 1 (constraints failed)

# Publish constraints to pub/
lens publish
# Exit: 0 (success)
```

### 6.3 Internal Library API

Both Anchor and Lens expose library crates for direct embedding:

```rust
// sigil-anchor-core
pub fn validate_zone(request: &ValidateZoneRequest) -> ValidateZoneResult;
pub fn check_data_source(request: &CheckSourceRequest) -> CheckSourceResult;
pub fn load_vocabulary(path: &Path) -> Result<Vocabulary>;
pub fn load_zones(path: &Path) -> Result<Zones>;

// sigil-lens-core
pub fn lint_component(request: &LintRequest) -> LintResult;
pub fn verify_constraints(physics: &PhysicsAnalysis) -> Vec<ConstraintResult>;
pub fn build_correction(violations: &[ConstraintResult]) -> CorrectionContext;
```

---

## 7. Security Architecture

### 7.1 Threat Model (v1)

| Threat | Mitigation | Status |
|--------|------------|--------|
| Malformed request injection | Schema validation before processing | v1 |
| Path traversal via request ID | UUID validation, no path separators | v1 |
| Denial of service via large files | Size limits on request/response | v1 |
| Cross-construct data leakage | Separate grimoire directories | v1 |
| Supply chain (malicious binary) | **Deferred to v2** | - |

### 7.2 Input Validation

```rust
// src/validation.rs
pub fn validate_request_id(id: &str) -> Result<Uuid, ValidationError> {
    // Must be valid UUID v4
    let uuid = Uuid::parse_str(id)?;

    // Must not contain path separators
    if id.contains('/') || id.contains('\\') || id.contains("..") {
        return Err(ValidationError::PathTraversal);
    }

    Ok(uuid)
}

pub fn validate_request_size(path: &Path) -> Result<(), ValidationError> {
    let metadata = fs::metadata(path)?;

    // Max 1MB per request
    if metadata.len() > 1_048_576 {
        return Err(ValidationError::RequestTooLarge);
    }

    Ok(())
}
```

### 7.3 Future Security (v2)

1. **Binary signing**: Ed25519 signatures for CLI binaries
2. **Sandbox execution**: OS-level sandboxing (sandbox-exec/seccomp)
3. **Audit logging**: Tamper-evident log of all operations
4. **Rate limiting**: Prevent resource exhaustion

---

## 8. Integration Points

### 8.1 Claude Code Integration

```
┌─────────────────────────────────────────────────────────────┐
│                      Claude Code                             │
│                                                              │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐        │
│  │   Rules    │    │   Skills   │    │   Hooks    │        │
│  │   (RLM)    │    │            │    │            │        │
│  └──────┬─────┘    └──────┬─────┘    └──────┬─────┘        │
│         │                 │                 │               │
│         ▼                 ▼                 ▼               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Sigil Rules + Skills                    │   │
│  │                                                      │   │
│  │  rules/00-sigil-core.md                             │   │
│  │  skills/craft/                                       │   │
│  │  commands/craft.md                                   │   │
│  │                                                      │   │
│  └───────────────────────┬─────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Bash Tool Invocation                    │   │
│  │                                                      │   │
│  │  exec("anchor validate --request abc123")           │   │
│  │  exec("lens lint --request abc123")                 │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 8.2 Loa Framework Integration

```yaml
# .loa/constructs.yaml
constructs:
  - name: sigil
    type: rules
    path: .claude/rules/

  - name: anchor
    type: cli
    binary: anchor
    install: cargo install sigil-anchor

  - name: lens
    type: cli
    binary: lens
    install: cargo install sigil-lens
```

### 8.3 External Dependencies

| Dependency | Purpose | Version |
|------------|---------|---------|
| alloy | Ethereum RPC | 0.1+ |
| cel-interpreter | Constraint evaluation | 0.7+ |
| tree-sitter | Code parsing | 0.20+ |
| tokio | Async runtime | 1.0+ |

---

## 9. Scalability & Performance

### 9.1 Performance Targets

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Physics detection | <50ms | Sigil rule evaluation |
| Component generation | <500ms | Code generation |
| Zone validation | <100ms | Anchor CLI |
| Constraint verification | <200ms | Lens CLI |
| Full /craft cycle | <1s | End-to-end user wait |
| Background validation | <2s | Async Anchor+Lens |

### 9.2 Optimization Strategies

**Parallel execution:**
```typescript
// Skills invoke Anchor + Lens in parallel
const [anchorResult, lensResult] = await Promise.all([
  exec(`anchor validate --request ${requestId}`),
  exec(`lens lint --request ${requestId}`)
]);
```

**Lazy loading:**
- Vocabulary/zones loaded once per session
- Constraints cached after first parse
- CEL programs pre-compiled

**File system efficiency:**
- Request/response files cleaned up after 1 hour
- Advisory locking prevents race conditions
- UUID-based filenames avoid collisions

### 9.3 Resource Limits

| Resource | Limit | Rationale |
|----------|-------|-----------|
| Request file size | 1MB | Prevent DoS |
| Response file size | 1MB | Prevent DoS |
| Request TTL | 1 hour | Cleanup stale files |
| Max concurrent requests | 10 | Prevent resource exhaustion |

---

## 10. Deployment Architecture

### 10.1 Installation

```bash
# Install Anchor CLI
cargo install sigil-anchor

# Install Lens CLI
cargo install sigil-lens

# Or via Loa
loa install sigil    # Adds rules + skills
loa install anchor   # Adds CLI binary
loa install lens     # Adds CLI binary
```

### 10.2 Binary Distribution

| Platform | Binary | Size (est.) |
|----------|--------|-------------|
| macOS arm64 | sigil-anchor-aarch64-apple-darwin | ~5MB |
| macOS x86_64 | sigil-anchor-x86_64-apple-darwin | ~5MB |
| Linux x86_64 | sigil-anchor-x86_64-unknown-linux-gnu | ~5MB |
| Windows x86_64 | sigil-anchor-x86_64-pc-windows-msvc.exe | ~5MB |

### 10.3 CI/CD Pipeline

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags: ["v*"]

jobs:
  build:
    strategy:
      matrix:
        include:
          - os: macos-latest
            target: aarch64-apple-darwin
          - os: macos-latest
            target: x86_64-apple-darwin
          - os: ubuntu-latest
            target: x86_64-unknown-linux-gnu
          - os: windows-latest
            target: x86_64-pc-windows-msvc

    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ matrix.target }}
      - run: cargo build --release --target ${{ matrix.target }}
      - uses: actions/upload-artifact@v4
        with:
          name: sigil-anchor-${{ matrix.target }}
          path: target/${{ matrix.target }}/release/anchor*
```

---

## 11. Development Workflow

### 11.1 Repository Structure

```
sigil/
├── .claude/
│   ├── rules/              # Sigil rules (TypeScript/Markdown)
│   ├── skills/             # Claude Code skills
│   └── commands/           # Slash commands
├── anchor/                 # Anchor Rust crate
│   ├── Cargo.toml
│   ├── src/
│   └── tests/
├── lens/                   # Lens Rust crate
│   ├── Cargo.toml
│   ├── src/
│   └── tests/
├── grimoires/
│   ├── sigil/
│   ├── anchor/
│   ├── lens/
│   └── pub/
└── Cargo.toml              # Workspace manifest
```

### 11.2 Workspace Manifest

```toml
# Cargo.toml
[workspace]
members = [
    "anchor",
    "lens",
]
resolver = "2"

[workspace.package]
version = "1.0.0"
edition = "2024"
license = "MIT"

[workspace.dependencies]
serde = { version = "1", features = ["derive"] }
serde_json = "1"
serde_yaml = "0.9"
tokio = { version = "1", features = ["full"] }
clap = { version = "4", features = ["derive"] }
uuid = { version = "1", features = ["v4"] }
thiserror = "1"
tracing = "0.1"
```

### 11.3 Testing Strategy

| Test Type | Tool | Coverage Target |
|-----------|------|-----------------|
| Unit tests | `cargo test` | 80% |
| Integration tests | `cargo test --test integration` | Key flows |
| E2E tests | Shell scripts | /craft happy path |

**Integration test example:**

```rust
// anchor/tests/integration/validate_zone.rs
#[tokio::test]
async fn test_financial_zone_validation() {
    // Setup
    let request_id = Uuid::new_v4().to_string();
    let request = ValidateZoneRequest {
        component: "ClaimButton".to_string(),
        keywords: vec!["claim".to_string()],
        inferred_zone: Zone::Critical,
    };

    write_request(&request_id, &request).await;

    // Execute
    let output = Command::new("cargo")
        .args(["run", "--", "validate", "--request", &request_id])
        .output()
        .await?;

    // Assert
    assert_eq!(output.status.code(), Some(0));

    let response = read_response(&request_id).await;
    assert!(response.result.validated);
}
```

---

## 12. Technical Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| CEL learning curve | Medium | Low | Good documentation, examples |
| File-based IPC race conditions | Low | Medium | Advisory locking, UUID filenames |
| Cross-platform binary issues | Low | High | CI matrix builds, extensive testing |
| Rust async complexity | Medium | Medium | Use established patterns (tokio) |
| tree-sitter grammar maintenance | Low | Low | Use stable, well-maintained grammars |

---

## 13. Future Considerations

### 13.1 v2 Features

1. **Sandboxing**: OS-level isolation for CLI binaries
2. **Binary signing**: Ed25519 signatures for supply chain security
3. **Remote constructs**: HTTP-based communication for distributed execution
4. **Caching layer**: Redis/SQLite for cross-session state

### 13.2 Technical Debt Management

| Debt Item | Priority | Resolution Timeline |
|-----------|----------|---------------------|
| No sandboxing | High | v2 |
| File-based IPC (could be faster) | Low | v3 |
| Hardcoded constraint limits | Medium | v2 |

---

## 14. Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| CEL | Common Expression Language (Google) |
| RLM | Rule Language Model (Claude Code's rule loading system) |
| Physics | Behavioral, animation, and material properties of UI |
| Zone | Security classification (critical/elevated/standard/local) |
| Correction Context | Structured error feedback for retry loops |

### B. References

- [PRD: Loa Constructs Triad](grimoires/loa/prd-sigil-anchor-integration.md)
- [CEL Specification](https://github.com/google/cel-spec)
- [tree-sitter Documentation](https://tree-sitter.github.io/tree-sitter/)
- [Claude Code Skills](https://docs.anthropic.com/claude-code)
