# Sigil: Design Context Framework

> "The codebase is the dataset. Usage is the authority. The agent reads the AST to infer the physics."

## What is Sigil?

Sigil v10.1 "Usage Reality" is a design context framework that helps AI agents make consistent design decisions through:

1. **Usage-Based Authority** — Authority computed from imports, not directory location
2. **Effect-Based Physics** — Physics inferred from effect type (mutation/query/local)
3. **AST Intent Inference** — Read code to infer intent without JSDoc annotations
4. **Invisible Context** — Learn taste/persona/project without questions
5. **Pattern Diagnostics** — Match symptoms to solutions, never ask "check the console"
6. **3 Consolidated Skills** — Mason, Gardener, Diagnostician replace 38+ skills

---

## The Three Laws of v10.1

1. **Usage is Authority** — Patterns earn status through imports, not directories
2. **Effect is Physics** — The verb determines timing, not the noun
3. **Never Interrupt Flow** — Infer, don't ask; generate, don't configure

---

## Quick Reference

### Commands

| Command | Purpose | Skill |
|---------|---------|-------|
| `/craft` | Generate UI with physics | Mason |
| `/garden` | Pattern promotion check | Gardener |

### Natural Triggers

| Trigger | Skill |
|---------|-------|
| "create", "generate", "build", "make" | Mason |
| "broken", "glitches", "not working", "error" | Diagnostician |

---

## Core Library

All functionality lives in `src/lib/sigil/`:

| Module | Purpose | Exports |
|--------|---------|---------|
| context.ts | Invisible accumulation | `SigilContext`, `processLearningSignal` |
| survival.ts | Usage-based authority | `SurvivalEngine`, `inferAuthority`, `countImports` |
| physics.ts | Effect-based physics | `useMotion`, `inferPhysicsFromEffect`, `EFFECT_PHYSICS` |
| ast-reader.ts | Intent inference | `inferIntent`, `analyzeAST` |
| diagnostician.ts | Pattern debugging | `PATTERNS`, `matchSymptoms`, `diagnose` |
| search.ts | Semantic discovery | `buildIndex`, `search`, `findCanonical` |

---

## Skills

### Sigil Skills (3)

| Skill | Trigger | Purpose |
|-------|---------|---------|
| mason | `/craft`, "create" | Generation with physics |
| gardener | `/garden`, background | Invisible promotion |
| diagnostician | "broken", "error" | Debug without questions |

### Loa Skills (11)

| Skill | Purpose |
|-------|---------|
| auditing-security | Security audit |
| deploying-infrastructure | Production deployment |
| designing-architecture | SDD creation |
| discovering-requirements | PRD discovery |
| implementing-tasks | Sprint implementation |
| mounting-framework | Repository setup |
| planning-sprints | Sprint breakdown |
| reviewing-code | Code review |
| riding-codebase | Codebase analysis |
| translating-for-executives | Executive communications |
| updating-framework | Framework updates |

---

## Authority System

Authority is computed, not stored:

```typescript
type Tier = 'gold' | 'silver' | 'draft';

async function inferAuthority(component: string): Promise<Tier> {
  const imports = await countImports(component);
  const stability = await getStabilityDays(component);

  if (imports >= 10 && stability >= 14) return 'gold';
  if (imports >= 5) return 'silver';
  return 'draft';
}
```

**No file moves required.** Authority is a computed property from actual usage.

---

## Physics System

Physics determined by effect type:

| Effect Type | Physics | Timing | Simulation |
|-------------|---------|--------|------------|
| mutation | deliberate | 800ms | Yes |
| query | snappy | 150ms | No |
| local_state | smooth | 0ms | No |
| sensitive_mutation | server-tick | 1200ms | Yes + confirmation |

### Sensitive Patterns

Extra care for these operations:
- `ownership`, `permission`, `delete`, `transfer`, `withdraw`, `burn`

These get `sensitive_mutation` physics with confirmation flow.

---

## AST Intent Inference

Infer intent from code without annotations:

```typescript
interface InferredIntent {
  interactive: boolean;   // onClick, onPress, onSubmit
  navigation: boolean;    // href, Link, useRouter
  async: boolean;         // async/await, Promise
  mutation: boolean;      // useMutation, POST/PUT/PATCH/DELETE
  financial: boolean;     // Money, Currency, Balance, ETH
  form: boolean;          // form, input, useForm
  sensitive: boolean;     // ownership, permission, transfer
}
```

---

## Diagnostic Patterns

9 categories of known issues:

| Category | Examples |
|----------|----------|
| hydration | useMediaQuery mismatch, Date in render |
| dialog | ResponsiveDialog issues, positioning |
| performance | Unnecessary re-renders, layout thrashing |
| layout | Images without dimensions, CLS |
| server-component | Hooks without 'use client' |
| react-19 | forwardRef deprecated |
| state | Stale closure, infinite loop |
| async | Race condition, unmounted update |
| animation | Missing AnimatePresence |

---

## No Questions Policy

Mason NEVER asks:
- "What zone should this be in?"
- "What physics do you prefer?"

Diagnostician NEVER asks:
- "Can you check the console?"
- "What browser are you using?"

Instead, both skills **infer** from context and code.

---

## Directory Structure

```
src/lib/sigil/           # Core library (6 modules)
├── index.ts             # Barrel exports
├── context.ts           # Invisible accumulation
├── survival.ts          # Usage-based authority
├── physics.ts           # Effect-based physics
├── ast-reader.ts        # AST intent inference
├── diagnostician.ts     # Pattern debugging
└── search.ts            # Semantic discovery

src/
├── components/          # Flat structure (no tiers)
└── hooks/
    └── useMotion.ts     # Physics hook

grimoires/sigil/
├── .context/            # Invisible accumulation (gitignored)
├── index/               # Search index (gitignored)
├── constitution.yaml    # Effect physics config
└── authority.yaml       # Promotion thresholds

.claude/skills/
├── mason/               # Generation skill
├── gardener/            # Governance skill
└── diagnostician/       # Debugging skill
```

---

## Configuration Files

### grimoires/sigil/constitution.yaml

```yaml
version: "10.1"
codename: "Usage Reality"

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
  sensitive_mutation:
    sync: pessimistic
    timing: 1200
    requires_confirmation: true
    patterns:
      - ownership
      - permission
      - delete
      - transfer
```

### grimoires/sigil/authority.yaml

```yaml
gold:
  min_imports: 10
  min_stability_days: 14

silver:
  min_imports: 5
  min_stability_days: 7

evolution:
  auto_promote: 0.95
  human_review: 0.80
```

---

## v10.1 Migration Notes

Key changes from v9.1:
- Consolidated 38 skills → 3 skills (Mason, Gardener, Diagnostician)
- Consolidated 36 process files → 6 core library modules
- Flattened component directories (no gold/silver/draft tiers)
- Authority computed from usage, not directory location
- Effect-based physics replaces data-type physics
- AST inference replaces JSDoc annotations

---

## Coexistence with Loa

Sigil and Loa coexist:
- **Sigil**: Design context framework (3 skills)
- **Loa**: Development workflow framework (11 skills)

Separate state zones, separate skills, no conflicts.

---

*Sigil v10.1.0 "Usage Reality"*
*Last Updated: 2026-01-11*
