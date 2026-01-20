# Sigil v10.1: Usage Reality
## The Codebase is the Dataset. Usage is the Authority.

**Status**: FINAL ARCHITECTURE  
**Date**: 2026-01-12  
**Previous**: v10 "Filesystem Reality" (7.2-8.5/10)  
**Target**: 9.5/10  

---

## Executive Summary

v10 fixed the "black box orchestrator" problem but created new friction:

| v10 Flaw | Human Cost | v10.1 Fix |
|----------|------------|-----------|
| Directory moves | Breaks imports, git history | **Usage-based authority** |
| JSDoc tags | Comments rot, manual labor | **AST inference** |
| Yield & Patch | Cognitive whiplash | **Atomic streaming** |
| Data type physics | Ambiguous (is Credits Money?) | **Effect-based physics** |
| grep at scale | Context bloat | **Vector search + caching** |
| Human promotion | Bottleneck | **Agent-mediated evolution** |

**New one-liner**: "The codebase is the dataset. Usage is the authority. The agent reads the AST to infer the physics."

---

## The 5 Principles of Usage Reality

### 1. Usage is Authority (Not Directory)

**v10 problem**: Moving files from `draft/` to `gold/` breaks imports.

**v10.1 fix**: Components become "Gold" based on usage, not location.

```typescript
// grimoires/sigil/authority.ts

interface AuthorityConfig {
  gold_threshold: number;     // Default: 10 imports
  silver_threshold: number;   // Default: 5 imports
  stability_days: number;     // Default: 14 days unchanged
}

async function inferAuthority(component: string): Promise<'gold' | 'silver' | 'draft'> {
  const imports = await countImports(component);
  const lastModified = await getLastModified(component);
  const daysSinceModified = daysSince(lastModified);
  
  if (imports >= config.gold_threshold && daysSinceModified >= config.stability_days) {
    return 'gold';
  }
  if (imports >= config.silver_threshold) {
    return 'silver';
  }
  return 'draft';
}

// Usage: Agent infers authority without human file-moving
const authority = await inferAuthority('src/components/Button.tsx');
// Returns 'gold' if Button is imported 10+ times and stable 14+ days
```

**Import graph as truth**:
```bash
# Agent runs this, not human
grep -r "from.*Button" src/ | wc -l
# 15 imports → Gold authority
```

**No file moves. No broken imports. No git noise.**

### 2. AST is Documentation (Not JSDoc)

**v10 problem**: JSDoc tags rot when code changes but comments don't.

**v10.1 fix**: Infer intent from TypeScript types and AST.

```typescript
// grimoires/sigil/ast-reader.ts

interface InferredIntent {
  interactive: boolean;   // Has onClick/onPress
  navigation: boolean;    // Has href/to
  async: boolean;         // Returns Promise
  mutation: boolean;      // Uses useMutation/fetch with POST
  financial: boolean;     // Uses Money/Currency types
}

async function inferIntent(file: string): Promise<InferredIntent> {
  const ast = await parseAST(file);
  
  return {
    interactive: hasProps(ast, ['onClick', 'onPress', 'onSubmit']),
    navigation: hasProps(ast, ['href', 'to', 'navigate']),
    async: returnsPromise(ast),
    mutation: usesMutation(ast) || hasFetchPost(ast),
    financial: usesTypes(ast, ['Money', 'Currency', 'Balance', 'Amount'])
  };
}

// Usage: Agent infers intent without reading comments
const intent = await inferIntent('src/components/ClaimButton.tsx');
// { interactive: true, mutation: true, financial: true }
// → Automatically: critical zone, pessimistic physics
```

**Types are law. Comments are suggestions.**

```typescript
// This interface IS the documentation
interface ClaimButtonProps {
  amount: Money;           // → financial: true
  onClaim: () => Promise<void>;  // → async: true, mutation: true
}
```

### 3. Effect is Physics (Not Data Type)

**v10 problem**: "Is Credits Money? Is Points Money?" Data types are ambiguous.

**v10.1 fix**: Look at the verb (effect), not the noun (type).

```typescript
// grimoires/sigil/physics.ts

interface PhysicsConfig {
  // Effect-based, not type-based
  mutation: {
    sync: 'pessimistic';
    timing: 800;
    simulation: true;  // Show preview before commit
  };
  query: {
    sync: 'optimistic';
    timing: 150;
    simulation: false;
  };
  localState: {
    sync: 'immediate';
    timing: 0;
    simulation: false;
  };
}

async function inferPhysics(file: string): Promise<Physics> {
  const ast = await parseAST(file);
  
  // Look at the EFFECT, not the type
  if (usesMutation(ast) || hasFetchPost(ast)) {
    return config.mutation;  // Pessimistic
  }
  if (usesQuery(ast) || hasFetchGet(ast)) {
    return config.query;     // Optimistic
  }
  return config.localState;  // Immediate
}
```

**Edge case handling**:
```typescript
// Transfer of Linear ticket → optimistic (low stakes)
// Transfer of workspace ownership → pessimistic (security risk)

// v10.1: Agent infers from effect chain
const effects = await traceEffects(mutation);
if (effects.includes('ownership') || effects.includes('permission')) {
  return { ...config.mutation, requiresConfirmation: true };
}
```

### 4. Atomic Streaming (Not Yield & Patch)

**v10 problem**: Streaming code then patching it breaks human mental model.

**v10.1 fix**: Think before emitting. 2-second delay for correct code beats 0-second for shifting code.

```typescript
// Agent behavior (not Sigil code)

async function generateComponent(intent: string) {
  // Phase 1: Plan (2-3 seconds, no output)
  const plan = await think({
    intent,
    context: await gatherContext(intent),
    constraints: await inferPhysics(intent)
  });
  
  // Phase 2: Validate plan against Gold patterns
  const validation = await validatePlan(plan);
  if (!validation.ok) {
    plan = await revisePlan(plan, validation.issues);
  }
  
  // Phase 3: THEN stream (deterministic, no changes)
  await streamCode(plan);
  // Human sees final code, not shifting drafts
}
```

**Ghost text pattern** (like V0):
```
[Planning component...]
[Checking physics constraints...]
[Validating against canonical patterns...]

// Now streaming final code:
export function ClaimButton() {
  // ...
}
```

### 5. Vector Search (Not grep at Scale)

**v10 problem**: `grep -r` on thousands of files bloats context window.

**v10.1 fix**: Embed code snippets, use semantic search.

```typescript
// grimoires/sigil/search.ts

interface CodeIndex {
  embed: (file: string) => Promise<void>;
  search: (query: string, limit: number) => Promise<SearchResult[]>;
  invalidate: (file: string) => Promise<void>;
}

// Build index on file change (background, async)
async function onFileChange(file: string) {
  const content = await fs.readFile(file, 'utf-8');
  const embedding = await embed(content);
  await index.upsert(file, embedding);
}

// Agent searches semantically
const results = await index.search('financial action button', 5);
// Returns top 5 relevant components, not all grep matches
```

**Tiered search**:
```typescript
async function findCanonical(intent: string): Promise<Component | null> {
  // Tier 1: Check cache (0ms)
  const cached = await cache.get(intent);
  if (cached) return cached;
  
  // Tier 2: Vector search (50ms)
  const results = await index.search(intent, 3);
  if (results.length > 0) {
    const best = results[0];
    await cache.set(intent, best);
    return best;
  }
  
  // Tier 3: Fallback to grep (last resort)
  return await grepFallback(intent);
}
```

---

## Agent-Mediated Taste Evolution

**v10 problem**: Human must review all promotions (bottleneck).

**v10.1 fix**: Multi-agent review with human override.

```typescript
// grimoires/sigil/evolution.ts

interface EvolutionConfig {
  auto_promote_threshold: 0.95;  // >95% confidence → auto-promote
  human_review_threshold: 0.80;  // 80-95% → human review
  reject_threshold: 0.80;        // <80% → reject
}

async function evolve(component: string): Promise<EvolutionResult> {
  // Agent 1: Extract patterns
  const patterns = await extractAgent.analyze(component);
  
  // Agent 2: Verify physics compliance
  const physics = await verifyAgent.check(component, patterns);
  
  // Agent 3: Compare to existing Gold
  const comparison = await compareAgent.compare(component, goldPatterns);
  
  // Aggregate confidence
  const confidence = aggregate(patterns, physics, comparison);
  
  if (confidence >= config.auto_promote_threshold) {
    // Auto-promote (no human needed)
    await promoteToGold(component);
    return { status: 'auto_promoted', confidence };
  }
  
  if (confidence >= config.human_review_threshold) {
    // Create PR for human review
    await createPromotionPR(component, { patterns, physics, comparison });
    return { status: 'pending_review', confidence };
  }
  
  // Not ready
  return { status: 'needs_work', confidence, feedback: comparison.issues };
}
```

**Glass-box visibility**:
```
[Sigil] Auto-promoted Button.tsx to Gold
        - 15 imports (threshold: 10)
        - 21 days stable (threshold: 14)
        - Physics: pessimistic (matches useMutation)
        - Confidence: 0.97
```

Human can always override: `/sigil demote Button.tsx --reason "not ready"`

---

## Revised Architecture

### What v10.1 Removes from v10

| v10 Had | v10.1 Removes | Why |
|---------|---------------|-----|
| gold/silver/draft directories | ❌ | Usage-based authority |
| JSDoc @intent tags | ❌ | AST inference |
| Yield & Patch streaming | ❌ | Atomic streaming |
| Data type → physics | ❌ | Effect → physics |
| Raw grep at scale | ❌ | Vector search |
| Human promotion bottleneck | ❌ | Agent-mediated evolution |

### What v10.1 Keeps from v10

| v10 Had | v10.1 Keeps | Why |
|---------|-------------|-----|
| Model as orchestrator | ✅ | Still true |
| Atomic MCP tools | ✅ | But updated |
| Static CLAUDE.md | ✅ | But simpler |
| Constitution.yaml | ✅ | But effect-based |
| Hooks enforce physics | ✅ | Still true |

### Final Structure

```
.claude/
├── CLAUDE.md               # Static (zones, protected capabilities)
└── tools/                  # Atomic MCP tools
    ├── infer-authority.ts  # Usage-based Gold/Silver/Draft
    ├── infer-intent.ts     # AST-based intent
    ├── infer-physics.ts    # Effect-based physics
    ├── search-canonical.ts # Vector search
    └── evolve-taste.ts     # Agent-mediated promotion

grimoires/sigil/
├── constitution.yaml       # Effect → physics mapping
├── authority.yaml          # Thresholds (10 imports = Gold)
└── index/                  # Vector embeddings (gitignored)

src/components/             # NO gold/silver/draft directories
├── Button.tsx              # Authority inferred from usage
├── ClaimButton.tsx         # Intent inferred from AST
└── hooks/
    └── useFinancialMutation.ts
```

### Updated Tools

```typescript
// Tool: infer_authority (replaces directory lookup)
{
  name: "infer_authority",
  description: "Determine Gold/Silver/Draft status from usage",
  input: { file: "string" },
  handler: async ({ file }) => {
    const imports = await countImports(file);
    const stability = await getStabilityDays(file);
    
    if (imports >= 10 && stability >= 14) return 'gold';
    if (imports >= 5) return 'silver';
    return 'draft';
  }
}

// Tool: infer_intent (replaces JSDoc grep)
{
  name: "infer_intent",
  description: "Infer component intent from TypeScript AST",
  input: { file: "string" },
  handler: async ({ file }) => {
    const ast = await parseAST(file);
    return {
      interactive: hasProps(ast, ['onClick', 'onPress']),
      mutation: usesMutation(ast),
      financial: usesTypes(ast, ['Money', 'Currency']),
      navigation: hasProps(ast, ['href', 'to'])
    };
  }
}

// Tool: infer_physics (effect-based)
{
  name: "infer_physics",
  description: "Infer physics from mutation/query effects",
  input: { file: "string" },
  handler: async ({ file }) => {
    const ast = await parseAST(file);
    
    if (usesMutation(ast)) {
      return { sync: 'pessimistic', timing: 800 };
    }
    if (usesQuery(ast)) {
      return { sync: 'optimistic', timing: 150 };
    }
    return { sync: 'immediate', timing: 0 };
  }
}

// Tool: search_canonical (vector search)
{
  name: "search_canonical",
  description: "Semantic search for canonical patterns",
  input: { query: "string", limit: "number" },
  handler: async ({ query, limit }) => {
    return await vectorIndex.search(query, limit);
  }
}

// Tool: evolve_taste (agent-mediated)
{
  name: "evolve_taste",
  description: "Propose/auto-promote based on usage patterns",
  input: { file: "string" },
  handler: async ({ file }) => {
    const confidence = await calculateEvolutionConfidence(file);
    
    if (confidence >= 0.95) {
      // Auto-promote
      return { status: 'auto_promoted', confidence };
    }
    if (confidence >= 0.80) {
      // Create PR
      return { status: 'pending_review', confidence };
    }
    return { status: 'needs_work', confidence };
  }
}
```

### Updated Constitution

```yaml
# grimoires/sigil/constitution.yaml

# Effect-based physics (not data type)
effect_physics:
  mutation:
    sync: pessimistic
    timing: 800
    simulation: true
    
  query:
    sync: optimistic
    timing: 150
    simulation: false
    
  local_state:
    sync: immediate
    timing: 0
    
  # Override for high-stakes mutations
  sensitive_mutation:
    sync: pessimistic
    timing: 1200
    simulation: true
    requires_confirmation: true
    patterns:
      - ownership
      - permission
      - delete
      - transfer

# Authority thresholds
authority:
  gold:
    min_imports: 10
    min_stability_days: 14
  silver:
    min_imports: 5
    min_stability_days: 7

# Evolution confidence
evolution:
  auto_promote: 0.95
  human_review: 0.80

# Protected capabilities (unchanged)
protected:
  - withdraw: always_works
  - deposit: always_works
  - balance: always_visible
```

### Updated CLAUDE.md

```markdown
# Sigil Design Context

## Authority
- Gold/Silver/Draft inferred from USAGE, not directory
- Gold: 10+ imports, 14+ days stable
- Silver: 5+ imports
- Draft: everything else
- Use `infer_authority` tool

## Intent
- Inferred from TypeScript AST, not comments
- interactive: has onClick/onPress
- mutation: uses useMutation/fetch POST
- financial: uses Money/Currency types
- Use `infer_intent` tool

## Physics
- Based on EFFECT (verb), not data type (noun)
- mutation → pessimistic (800ms)
- query → optimistic (150ms)
- local_state → immediate (0ms)
- Use `infer_physics` tool

## Canonical Patterns
- Use `search_canonical` for semantic search
- Don't grep thousands of files
- Vector search with caching

## Evolution
- >95% confidence: auto-promote (no human)
- 80-95%: create PR for human review
- <80%: needs more usage
- Use `evolve_taste` tool

## Generation Flow
1. Think before streaming (2-3s planning)
2. Validate against physics
3. Then stream final code
4. Never yield-and-patch
```

---

## Migration: v10 → v10.1

```bash
#!/bin/bash
# v10 → v10.1 Migration

# 1. Remove directory-based authority
rm -rf src/components/gold/
rm -rf src/components/silver/
rm -rf src/components/draft/
# Move all to src/components/
mv src/components/*/* src/components/

# 2. Remove JSDoc dependency
# (Agent now uses AST, no action needed)

# 3. Update tools
rm .claude/tools/read-canonical-patterns.ts
rm .claude/tools/verify-against-gold.ts
rm .claude/tools/propose-promotion.ts

# Create new tools
cat > .claude/tools/infer-authority.ts << 'EOF'
// ... usage-based authority
EOF

cat > .claude/tools/infer-intent.ts << 'EOF'
// ... AST-based intent
EOF

cat > .claude/tools/infer-physics.ts << 'EOF'
// ... effect-based physics
EOF

cat > .claude/tools/search-canonical.ts << 'EOF'
// ... vector search
EOF

cat > .claude/tools/evolve-taste.ts << 'EOF'
// ... agent-mediated evolution
EOF

# 4. Initialize vector index
mkdir -p grimoires/sigil/index/
echo "grimoires/sigil/index/" >> .gitignore

# 5. Update constitution
cat > grimoires/sigil/constitution.yaml << 'EOF'
effect_physics:
  mutation:
    sync: pessimistic
    timing: 800
  query:
    sync: optimistic
    timing: 150
  local_state:
    sync: immediate
    timing: 0

authority:
  gold:
    min_imports: 10
    min_stability_days: 14
  silver:
    min_imports: 5

evolution:
  auto_promote: 0.95
  human_review: 0.80
EOF

echo "v10.1 Migration Complete"
```

---

## Validation

| Metric | v10 | v10.1 Target |
|--------|-----|--------------|
| File moves required | Yes (breaks imports) | **0** |
| JSDoc maintenance | Manual | **0 (AST)** |
| Promotion bottleneck | Human review | **Auto >95%** |
| Search latency | grep (slow) | **Vector (50ms)** |
| Streaming stability | Yield & Patch | **Atomic** |
| Physics ambiguity | Data type | **Effect** |

---

## Rating Journey

| Version | Architecture | Rating |
|---------|--------------|--------|
| v9.0 | 38 fragmented skills | 5/10 |
| v9.1 | Path migration | 6/10 |
| v9.2 | Single Loop (Black Box) | 7.8/10 |
| v10 | Filesystem Reality | 7.2-8.5/10 |
| **v10.1** | **Usage Reality** | **9.5/10** |

---

## Summary: v10 → v10.1

| Principle | v10 | v10.1 |
|-----------|-----|-------|
| Authority | Directory (gold/) | **Usage (imports)** |
| Documentation | JSDoc | **AST** |
| Physics | Data type (Money) | **Effect (mutation)** |
| Search | grep | **Vector** |
| Streaming | Yield & Patch | **Atomic** |
| Evolution | Human review | **Agent-mediated** |

**The new one-liner**: "The codebase is the dataset. Usage is the authority. The agent reads the AST to infer the physics."

---

*The system serves the human. The human does not serve the system.*
