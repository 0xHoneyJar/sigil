# Mason Skill

> "The codebase is the dataset. Usage is the authority."

## Purpose

Mason is the consolidated generation skill for Sigil v10.1. It generates UI components and copy with physics, using context inferred from the codebase rather than configuration questions.

## Invocation

```
/craft ClaimButton with deliberate physics
```

Or natural triggers:
- "create a button for claiming tokens"
- "generate a form for user settings"
- "build a card component"
- "make a navigation drawer"

## Workflow

1. **Context Loading** (invisible)
   - Load accumulated taste from `grimoires/sigil/.context/`
   - Cold start: use sensible defaults

2. **Intent Inference**
   - Parse request for component type and purpose
   - Infer effect type: `mutation` | `query` | `local_state`
   - Map to physics: `server-tick` | `deliberate` | `snappy` | `smooth`

3. **Pattern Discovery**
   - Search codebase for canonical patterns via `search.ts`
   - Prefer gold-tier components (10+ imports)
   - Fallback to silver (5+ imports) then draft

4. **AST Analysis**
   - Use `ast-reader.ts` to analyze similar components
   - Infer: interactive, navigation, async, mutation, financial
   - Apply detected patterns to new component

5. **Generation**
   - Generate component with correct physics
   - Apply context-aware copy and styling
   - Use motion hooks from `physics.ts`
   - No configuration questions

6. **Context Update** (invisible)
   - Record generated patterns
   - Update reinforcement weights

## No Questions Policy

Mason NEVER asks:
- "What zone should this be in?"
- "What physics do you prefer?"
- "Should I use framer-motion or CSS?"
- "What animation timing?"

Instead, Mason infers:
- Zone from vocabulary (critical terms → critical zone)
- Physics from effect type (mutation → deliberate)
- Library from existing usage
- Timing from constitution.yaml

## Physics Mapping

| Effect Type | Physics | Timing | Simulation |
|-------------|---------|--------|------------|
| mutation | deliberate | 800ms | Yes |
| query | snappy | 150ms | No |
| local_state | smooth | 0ms | No |
| sensitive_mutation | server-tick | 1200ms | Yes + confirmation |

## Sensitive Patterns

Mason applies extra care for sensitive operations:
- `ownership`
- `permission`
- `delete`
- `transfer`
- `withdraw`
- `burn`

These get `sensitive_mutation` physics with confirmation flow.

## Context Files

| File | Purpose |
|------|---------|
| `grimoires/sigil/.context/taste.json` | Learned design preferences |
| `grimoires/sigil/.context/persona.json` | Audience context |
| `grimoires/sigil/.context/project.json` | Project conventions |

## Library Dependencies

```typescript
import { SigilContext, processLearningSignal } from '@sigil/context';
import { useMotion, getPhysics, inferPhysicsFromEffect } from '@sigil/physics';
import { inferIntent, analyzeAST } from '@sigil/ast-reader';
import { search, findCanonical } from '@sigil/search';
```

## Example Session

**User**: "create a claim button for the rewards pool"

**Mason** (internal):
1. Vocabulary: "claim", "rewards" → critical zone
2. Effect: mutation → deliberate physics (800ms)
3. Sensitive: "claim" + financial context → requires confirmation
4. Search: finds `src/components/TransferButton.tsx` (gold tier)
5. Generate with physics, simulation flow, copy

**Output**:
```tsx
'use client';

import { useSigilMutation } from '@/hooks/useSigilMutation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface ClaimButtonProps {
  poolId: string;
  amount: string;
}

export function ClaimButton({ poolId, amount }: ClaimButtonProps) {
  const { execute, simulate, confirm, state, physics } = useSigilMutation({
    mutation: () => api.claim(poolId),
    dataType: 'financial',
  });

  const handleClick = async () => {
    const preview = await simulate();
    // Show confirmation with preview
    if (userConfirms(preview)) {
      confirm();
      await execute();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={physics.transition}
    >
      <Button
        onClick={handleClick}
        disabled={state === 'pending'}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        {state === 'pending' ? 'Claiming...' : `Claim ${amount}`}
      </Button>
    </motion.div>
  );
}
```

## Learning Signals

Mason processes these signals to improve context:

| Signal | Meaning |
|--------|---------|
| `accept` | User kept generated code |
| `modify` | User edited generated code |
| `reject` | User deleted generated code |
| `correct` | User provided explicit correction |

## Consolidated From

Mason replaces these 15+ skills:
- approving-patterns
- auditing-cohesion
- chronicling-rationale
- codifying-materials
- codifying-recipes
- codifying-rules
- crafting-components
- crafting-guidance
- envisioning-moodboard
- envisioning-soul
- exporting-config
- forging-patterns
- greenlighting-concepts
- observing-visual
- refining-context
- validating-fidelity
- validating-lenses
- validating-physics

---

*Sigil v10.1.0 "Usage Reality"*
