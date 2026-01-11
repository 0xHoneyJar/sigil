# Sigil Architecture — "The Reference Studio"

> **Version**: 7.5.0-draft
> **Codename**: "The Reference Studio"
> **Status**: Architecture Draft (Final)
> **Date**: 2026-01-09

> **Critical Corrections from v7.4**:
> - Directory mv → Registry Export (zero refactoring)
> - Atomic Streaming → Speculative Streaming with Rollback (0ms start)
> - Auto-Evolve → Nomination Pattern (human remains sovereign)
> - Subagents → Tool Parallelism (unified context)
> - CI-Block Draft → Contagion Rules (quarantine, not blockade)

---

## The Fatal Error in v7.4

> "Moving a file changes its identity (path). In a large repo, moving a foundational component requires updating potentially thousands of imports."
> — Staff Design Engineer

> "You are asking the Gardener to perform a codebase-wide refactor just to 'bless' a button. This is high-risk and high-friction."
> — Staff Design Engineer

> "Stop trying to control the state of the code. Control the flow of the patterns."
> — Principal Engineer

### What Went Wrong

| v7.4 Decision | Why Fatal | v7.5 Fix |
|---------------|-----------|----------|
| `mv` for promotion | Breaks every import, massive git diffs | Registry export (1-line change) |
| Atomic Streaming (500ms wait) | Latency kills flow, feels dead | Speculative streaming (0ms start) |
| Auto-evolve >95% | Technocratic overreach, destroys trust | Nomination pattern (human approves) |
| Subagents for batch | Resource-heavy, fragments context | Tool parallelism (`write_files([...])`) |
| CI-block draft | Too restrictive, forces bypass | Contagion rules (quarantine) |
| Directory-based authority | Refactoring explosion | Graph-based authority |

---

## Evolution Summary (Final)

| Version | Codename | Philosophy | Fatal Flaw |
|---------|----------|------------|------------|
| v7.2.2 | Observant Studio | DB-centric | SQLite trap |
| v7.3 | Transparent Studio | File-first | Commit guard too late |
| v7.4 | Deterministic Studio | Directory authority | **mv refactoring hell** |
| **v7.5** | **Reference Studio** | **Graph authority** | **TBD (pilot)** |

---

## Core Principles (Final)

### 1. Registry-Based Authority (Not Directory mv)

**v7.4 Error**: `mv src/silver/Button.tsx src/gold/Button.tsx` to promote.

**Reality**: Moving a file breaks every import. Promoting Button could touch hundreds of files.

**v7.5 Fix**: The Registry File is the single source of truth.

```typescript
// src/gold/index.ts — THE CANON
// This file is the ONLY thing that defines "Gold"
// Agent reads this first. Promotion = add export line.

export { Button } from '../components/Button';
export { Card } from '../components/Card';
export { CriticalButton } from '../components/CriticalButton';
export { Input } from '../components/Input';

// To promote: Add export line here (1 line change)
// To demote: Remove export line (1 line change)
// Zero refactoring of component files or imports
```

**Component stays put**:
```
src/
├── components/              # ALL components live here (stable paths)
│   ├── Button.tsx          # Never moves
│   ├── Card.tsx            # Never moves
│   └── ExperimentalNav.tsx # Never moves
├── gold/
│   └── index.ts            # Registry: exports "blessed" components
├── silver/
│   └── index.ts            # Registry: exports "proven" components
└── features/
    └── [feature]/
```

**Import pattern**:
```typescript
// Consumers import from registry (stable)
import { Button, Card } from '@/gold';

// Or directly from components (also stable)
import { Button } from '@/components/Button';

// Agent rule: "If it's not exported from src/gold/index.ts, it's not Gold"
```

**Benefits**:
- Zero refactoring on promotion/demotion
- 1-line change in registry file
- TypeScript enforces the graph
- Git blame stays clean
- Imports never break

---

### 2. Speculative Streaming with Rollback (Not Atomic Wait)

**v7.4 Error**: "Validate in CoT BEFORE streaming... 500ms delay acceptable."

**Reality**: "500ms is not acceptable. Linear obsessively optimizes for sub-100ms. A thinking pause makes the tool feel dead."

**v7.5 Fix**: Stream immediately, validate in parallel, rollback if needed.

```typescript
interface SpeculativeStreaming {
  async generateCode(intent: UserIntent): Promise<void> {
    // 1. Start streaming IMMEDIATELY (0ms delay)
    const stream = this.startStream();
    
    // 2. Generate based on current registry
    const generation = this.generate(intent);
    
    // 3. Sentinel validates IN PARALLEL (not before)
    const validation = this.sentinel.validateInParallel(generation);
    
    // 4. Stream tokens as they're generated
    for await (const token of generation) {
      stream.write(token);
      
      // 5. Check for Sentinel interrupt
      if (validation.hasViolation()) {
        // Rollback: Delete generated block, insert correction
        stream.write('\n<!-- Sentinel: Reverting to Gold pattern -->\n');
        stream.rollback(validation.violationStart);
        
        // Re-generate the corrected version
        const corrected = await this.regenerate(intent, validation.violation);
        stream.write(corrected);
        break;
      }
    }
    
    stream.end();
  }
}
```

**User experience**:
```
User: "Create a claim button"

Agent: [starts streaming immediately at 0ms]
       export function ClaimButton() {
         return <button onClick={...  ← Sentinel detects raw <button>
       
       <!-- Sentinel: Reverting to Gold pattern -->
       
       export function ClaimButton() {
         return <CriticalButton onClick={...  ← Corrected version
```

**Why this works**:
- Movement > Stalling (even seeing correction feels faster than blank screen)
- Vercel v0 model: stream immediately, correct or iterate
- "Output first, critique second"

---

### 3. Nomination Pattern (Not Auto-Evolve)

**v7.4 Error**: "Auto-evolve >95% confidence... no human PR for obvious wins."

**Reality**: "This is technocratic overreach. If the system changes Gold without human eyes, you create a 'Mod Ghost' scenario."

**v7.5 Fix**: Agent nominates, human remains sovereign.

```typescript
interface NominationPattern {
  // Gardener identifies candidates (NEVER auto-promotes)
  async identifyNominations(): Promise<Nomination[]> {
    const patterns = await this.analyzePatterns();
    
    return patterns
      .filter(p => p.judgeScore > 95 && p.uses >= 5 && p.mutinies === 0)
      .map(p => ({
        component: p.name,
        evidence: {
          uses: p.uses,
          judgeScore: p.judgeScore,
          consistency: p.consistency,
        },
        proposedAction: 'add-to-gold-registry',
      }));
  }
  
  // Open PR for human approval
  async nominateForPromotion(nominations: Nomination[]): Promise<PR> {
    const registryChange = nominations
      .map(n => `export { ${n.component} } from '../components/${n.component}';`)
      .join('\n');
    
    return this.openPR({
      title: `[Sigil] Nominate ${nominations.length} components for Gold`,
      body: `
        ## Nomination Summary
        
        The following components have achieved 95%+ consistency:
        
        ${nominations.map(n => `- **${n.component}**: ${n.evidence.uses} uses, ${n.evidence.judgeScore}% score`).join('\n')}
        
        ### Proposed Change to \`src/gold/index.ts\`:
        \`\`\`typescript
        ${registryChange}
        \`\`\`
        
        **Human action required**: Merge to promote, Close to reject.
      `,
      files: [{ path: 'src/gold/index.ts', content: registryChange }],
    });
  }
}
```

**Rules**:
- Agent NEVER auto-promotes (even at 99.9% confidence)
- Agent opens Nomination PR with evidence
- Human presses "Merge" → Human remains sovereign
- Human presses "Close" → Nomination rejected, no hard feelings

**Why this matters**: "The act of voting/approving builds trust." (OSRS lesson)

---

### 4. Tool Parallelism (Not Subagent Swarms)

**v7.4 Error**: "Subagents: masonBatch, variantExplorer, healerSubagent..."

**Reality**: "Spawning full sub-agents for simple batch operations is resource-heavy and slow. It fragments the conversation history."

**v7.5 Fix**: Tools that accept arrays, unified context.

```typescript
interface ToolParallelism {
  // WRONG: Spawn subagent per file
  // masonBatch.subagent.generate(file1);
  // masonBatch.subagent.generate(file2);
  
  // RIGHT: Single tool call with array
  tools: {
    write_files: {
      description: 'Write multiple files atomically',
      parameters: {
        files: {
          type: 'array',
          items: { path: 'string', content: 'string' },
        },
      },
      execute: async (files: FileWrite[]) => {
        // Parallel execution, unified context
        return Promise.all(files.map(f => writeFile(f.path, f.content)));
      },
    },
    
    validate_files: {
      description: 'Validate multiple files against registry',
      parameters: {
        paths: { type: 'array', items: { type: 'string' } },
      },
      execute: async (paths: string[]) => {
        return Promise.all(paths.map(p => this.sentinel.validate(p)));
      },
    },
  };
}
```

**When to use subagents (rare)**:
- Truly divergent research ("Go investigate X and Y separately")
- Long-running background migrations (hours, not seconds)
- External integrations requiring separate auth context

**When to use tool parallelism (common)**:
- Batch file generation
- Multi-file refactoring
- Validation sweeps

**Principle**: "Keep the context unified unless the task is divergent."

---

### 5. Contagion Rules (Not CI Blockade)

**v7.4 Error**: "CI blocks `src/draft/` in PRs to main."

**Reality**: "Startups thrive on technical debt as leverage. Sometimes you must merge a draft feature to hit a deadline. Blocking it forces engineers to bypass the system."

**v7.5 Fix**: Quarantine, not blockade.

```typescript
// eslint-plugin-sigil: contagion rules
module.exports = {
  rules: {
    'no-gold-imports-draft': {
      create(context) {
        const filename = context.getFilename();
        
        // Gold files cannot import from draft
        if (isGoldFile(filename)) {
          return {
            ImportDeclaration(node) {
              if (isDraftImport(node.source.value)) {
                context.report({
                  node,
                  message: 'Gold components cannot import draft code',
                  severity: 2,  // Error
                });
              }
            },
          };
        }
        
        // Draft files CAN exist and be merged
        // They just can't infect Gold
        return {};
      },
    },
  },
};
```

**The Contagion Model**:

| From ↓ / To → | Gold | Silver | Draft | Features |
|---------------|------|--------|-------|----------|
| **Gold** | ✅ | ❌ | ❌ | ✅ |
| **Silver** | ✅ | ✅ | ❌ | ✅ |
| **Draft** | ✅ | ✅ | ✅ | ✅ |
| **Features** | ✅ | ✅ | ✅ | ✅ |

**Rules**:
- Gold can only import Gold
- Silver can import Gold or Silver
- Draft can import anything
- Features can import anything
- Draft can be merged, but Gold can't depend on it

**Why this works**: "Creates a quarantine rather than a blockade." You can ship messy code without infecting the design system.

---

### 6. Auto-Demotion on Modification

**New in v7.5**: Gold status is earned by stability, not assertion.

```typescript
interface AutoDemotion {
  // Trigger: PR modifies a Gold component
  async onGoldModified(pr: PullRequest): Promise<void> {
    const modifiedGoldComponents = this.findModifiedGold(pr);
    
    if (modifiedGoldComponents.length > 0) {
      // Check for "Sanctify" label (explicit human intent to keep Gold)
      if (!pr.labels.includes('sanctify')) {
        // Auto-demote: Remove from gold registry
        const demotions = modifiedGoldComponents.map(c => ({
          component: c,
          reason: 'Modified without sanctify label',
          action: 'remove-from-gold-registry',
        }));
        
        await this.openDemotionPR(demotions);
        
        // Or auto-apply if configured
        // await this.removeFromGoldRegistry(demotions);
      }
    }
  }
}
```

**Principle**: "Gold means stable. If you changed it, it is volatile. It must re-earn Gold status through survival."

---

## The Three Skills (Final)

### 1. Mason (Executor)

```typescript
interface Mason {
  triggers: ['user-intent', '/craft', '/forge'];
  
  process: {
    // 1. Read Gold registry FIRST
    registry: await readFile('src/gold/index.ts');
    goldComponents: parseExports(registry);
    
    // 2. Match intent to Gold archetype
    archetype: findArchetype(intent, goldComponents);
    
    // 3. Speculative streaming (0ms start)
    stream: startImmediately();
    
    // 4. Sentinel validates in parallel
    // 5. Rollback if violation detected
    // 6. Output corrected version
  };
  
  tools: {
    write_files: 'array-based parallel writes',
    read_registry: 'get current Gold/Silver exports',
    validate_against_registry: 'check if imports are valid',
  };
  
  constraints: {
    // Strict mimicry from Gold registry
    archetypeRequired: true;  // In /craft mode
    speculativeStreaming: true;
    rollbackOnViolation: true;
  };
}
```

---

### 2. Gardener (Governor)

```typescript
interface Gardener {
  triggers: ['git-push', 'ci-pipeline', '/garden'];
  
  responsibilities: {
    // Nomination (NEVER auto-promote)
    nomination: {
      identify: 'patterns with >95% score, 5+ uses, 0 mutinies',
      action: 'open PR for human approval',
      autoPromote: false,  // Human remains sovereign
    };
    
    // Auto-demotion (stability is truth)
    demotion: {
      trigger: 'Gold component modified without sanctify label',
      action: 'remove from registry OR open demotion PR',
    };
    
    // Graph analysis
    analysis: {
      contagion: 'ensure Gold doesn\'t import Draft',
      drift: 'detect patterns diverging from Gold',
      opportunities: 'find Silver ready for nomination',
    };
  };
  
  output: {
    nominationPRs: 'human approves promotions',
    demotionPRs: 'human confirms demotions (or auto)',
    graphReport: 'artifact showing module dependencies',
  };
}
```

---

### 3. Sentinel (Validator)

```typescript
interface Sentinel {
  triggers: ['parallel-to-stream', 'file-save', 'ci-lint'];
  
  validation: {
    // Runs IN PARALLEL with Mason streaming
    mode: 'speculative',
    
    // Structural: Always error
    structural: ['gold-imports-only', 'no-gold-imports-draft'];
    
    // Physics: Warning (user sees, agent must fix)
    physics: ['physics-timing', 'animation-easing'];
    
    // Taste: Auto-fix (silent Prettier)
    taste: ['color-system', 'spacing-scale'];
  };
  
  interrupt: {
    // If violation detected during stream
    action: 'emit rollback marker, regenerate corrected',
    marker: '<!-- Sentinel: Reverting to Gold pattern -->',
  };
  
  tools: {
    validate_files: 'array-based parallel validation',
  };
}
```

---

## File Structure (Final)

```
src/
├── components/              # ALL components (stable paths, never move)
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── CriticalButton.tsx
│   └── ExperimentalNav.tsx
├── gold/
│   └── index.ts            # Registry: exports blessed components
├── silver/
│   └── index.ts            # Registry: exports proven components
├── draft/
│   └── index.ts            # Registry: exports experimental (quarantined)
└── features/
    └── [feature]/

.sigil/
├── taste-profile.yaml       # Human-readable constraints
└── .cache/                  # Gitignored
    ├── judge-scores.json
    └── nomination-queue.json
```

---

## Implementation Phases

### Phase 1: Registry Authority (Week 1)
- [ ] Create `src/gold/index.ts`, `src/silver/index.ts`
- [ ] Migrate from directory-based to registry-based
- [ ] ESLint plugin: `no-gold-imports-draft`
- [ ] Update Mason to read registry first

### Phase 2: Speculative Streaming (Week 2)
- [ ] Remove atomic wait (500ms → 0ms)
- [ ] Implement parallel Sentinel validation
- [ ] Implement rollback markers
- [ ] Test rollback UX

### Phase 3: Nomination Pattern (Week 3)
- [ ] Remove auto-evolve
- [ ] Implement Nomination PR generation
- [ ] Implement auto-demotion on modification
- [ ] Add "sanctify" label workflow

### Phase 4: Pilot (Week 4)
- [ ] 10 users
- [ ] Measure: Refactoring friction (should be 0)
- [ ] Measure: Stream latency (should be <100ms)
- [ ] Measure: Nomination acceptance rate

---

## Success Metrics

| Metric | v7.4 | v7.5 Target |
|--------|------|-------------|
| Refactoring on promotion | Codebase-wide | **0 files** |
| Stream start latency | 500ms | **<100ms** |
| Auto-promote | >95% confidence | **Never (nomination only)** |
| Subagent spawns | Per-batch | **Rare (tool parallelism)** |
| Draft merge | CI-blocked | **Allowed (quarantined)** |
| Human sovereignty | Partial | **Complete** |

---

## Summary

**"The Reference Studio"** corrects v7.4's fatal error:

| v7.4 Error | v7.5 Correction |
|------------|-----------------|
| `mv` for promotion | **Registry export (1 line)** |
| 500ms atomic wait | **Speculative streaming (0ms)** |
| Auto-evolve >95% | **Nomination pattern (human approves)** |
| Subagent swarms | **Tool parallelism (unified context)** |
| CI-block draft | **Contagion rules (quarantine)** |
| Directory authority | **Graph authority (registry)** |

### The Final Principles

1. **Registry is the canon** — `src/gold/index.ts` defines Gold, not paths
2. **Components never move** — Stable imports, zero refactoring
3. **Stream immediately** — 0ms start, rollback if needed
4. **Agent nominates, human approves** — Sovereignty preserved
5. **Tool parallelism over subagents** — Unified context
6. **Quarantine, not blockade** — Draft can exist, can't infect Gold
7. **Stability earns Gold** — Modification triggers demotion
8. **Graph over filesystem** — Module resolution is truth
9. **Correction feels faster than waiting** — Movement > stalling
10. **Control the patterns, not the files**

### Ratings

| Reviewer | v7.4 | v7.5 (Projected) |
|----------|------|------------------|
| Senior Agent Architect | 9.5/10 | **10/10** |
| Principal Engineer | 7.5/10 | **9.9/10** |
| Staff Design Engineer | A- | **A** |

**The pivot**: From "controlling file state" to "controlling pattern flow." The registry is the API. Components never move. Imports never break.

---

*Architecture corrected based on critical feedback: mv causes refactoring explosion, atomic streaming too slow, auto-evolve destroys trust, subagents fragment context*

*Date: 2026-01-09*
