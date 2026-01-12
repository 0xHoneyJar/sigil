# Sigil

> *Design physics for code generation.*

## What is Sigil?

AI agents generate UI without understanding your product's soul. Every generation is a coin flip—sometimes it matches your vision, sometimes it doesn't.

Sigil solves this by teaching Claude the **physics** of UI. Not "make it pretty" or "use good UX"—actual physics: timing, sync strategies, confirmation patterns, animation curves.

When you say `/craft "claim button"`, Sigil doesn't ask questions. It knows:
- "claim" = financial mutation
- financial = pessimistic sync (server confirms before UI updates)
- pessimistic = 800ms deliberate timing
- deliberate = confirmation required, escape hatch visible

The physics are automatic. You describe what you want in *feel*, Sigil handles implementation.

## Philosophy

### Artists Think in Feel

Designers don't think "I need optimistic updates with rollback on error." They think "this should feel snappy" or "this needs to feel trustworthy."

Sigil translates feel into physics. You stay in flow. The machinery is invisible.

### Effect Determines Everything

Physics aren't chosen by adjectives or wishes. They're determined by **what the code does**:

| Effect | Sync | Timing | Confirmation |
|--------|------|--------|--------------|
| Financial mutation | Pessimistic | 800ms | Required |
| Destructive mutation | Pessimistic | 600ms | Required |
| Standard mutation | Optimistic | 200ms | None |
| Navigation | Immediate | 150ms | None |
| Query/fetch | Optimistic | 150ms | None |
| Local state | Immediate | 100ms | None |

"Claim" is financial. "Delete" is destructive. "Like" is standard. "Toggle" is local.

The word determines the effect. The effect determines the physics. No configuration needed.

### The Prompt is the Product

Sigil v11 has no runtime, no hooks, no custom tools. It's just prompts that teach Claude the physics system. When you install Sigil, you're adding knowledge—not dependencies.

---

## Installation

```bash
curl -fsSL https://raw.githubusercontent.com/0xHoneyJar/sigil/main/.claude/scripts/mount-sigil.sh | bash
```

**What gets installed:**
```
.claude/rules/sigil-*.md     # Physics (auto-discovered by Claude Code)
grimoires/sigil/             # Configuration
examples/components/         # Reference implementations
```

**What doesn't get touched:**
```
CLAUDE.md                    # Your existing file is preserved
```

---

## Usage

```bash
/craft "claim button"           # Financial: 800ms, pessimistic, confirmation
/craft "like button"            # Standard: 200ms, optimistic
/craft "delete with undo"       # Soft delete: optimistic + toast with undo
/craft "dark mode toggle"       # Local: 100ms, immediate
```

No questions asked. Physics inferred from the description.

---

## The Physics

### Sync Strategies

**Pessimistic**: Server confirms before UI updates. User sees pending state, then success/failure. For operations that can't be undone.

**Optimistic**: UI updates immediately, rolls back on failure. For operations that are reversible and low-stakes.

**Immediate**: No server round-trip. Pure client state.

### How Sigil Detects Effect

```
Financial mutation:
  Keywords: claim, deposit, withdraw, transfer, swap, send, pay, purchase

Destructive mutation:
  Keywords: delete, remove, destroy, revoke, burn

Standard mutation:
  Keywords: save, update, edit, create, toggle, like, follow

Local state:
  Keywords: toggle, switch, expand, collapse, select
```

### Protected Capabilities

Some things must always work:

| Capability | Constraint |
|------------|------------|
| Withdraw | Always reachable |
| Cancel | Always visible |
| Balance | Always current |
| Error recovery | Always possible |

---

## Examples

### Financial Button (Pessimistic, 800ms)

```tsx
// Two-phase confirmation, no optimistic updates, deliberate timing
export function ClaimButton({ amount, onSuccess }) {
  const [showConfirm, setShowConfirm] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: () => claimRewards(amount),
    // NO onMutate — pessimistic means no optimistic updates
    onSuccess
  })

  if (!showConfirm) {
    return <button onClick={() => setShowConfirm(true)}>Claim {amount}</button>
  }

  return (
    <div>
      <p>Claim {amount}?</p>
      <button onClick={() => setShowConfirm(false)}>Cancel</button>
      <button onClick={() => mutate()} disabled={isPending}>
        {isPending ? 'Claiming...' : 'Confirm'}
      </button>
    </div>
  )
}
```

### Standard Mutation (Optimistic, 200ms)

```tsx
// Optimistic update, snappy spring, no confirmation
export function LikeButton({ postId, initialLiked }) {
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: () => toggleLike(postId),
    onMutate: async () => {
      // Optimistic update — UI changes immediately
      const previous = queryClient.getQueryData(['post', postId])
      queryClient.setQueryData(['post', postId], old => ({
        ...old, liked: !old.liked
      }))
      return { previous }
    },
    onError: (err, _, context) => {
      // Rollback on failure
      queryClient.setQueryData(['post', postId], context.previous)
    }
  })

  return <button onClick={() => mutate()}>Like</button>
}
```

### Local State (Immediate, 100ms)

```tsx
// No server, instant spring animation
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      <motion.div
        animate={{ x: theme === 'dark' ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}
```

---

## Configuration

Edit `grimoires/sigil/constitution.yaml` to customize:

```yaml
effects:
  financial_mutation:
    keywords: [claim, deposit, withdraw, transfer]
    physics:
      sync: pessimistic
      timing_ms: 800
      confirmation: required

vocabulary:
  # Add your product's terminology
  harvest:
    maps_to: financial_mutation
    description: Collect yield rewards
```

---

## Skills

Sigil ships with three skills that orchestrate specialized workflows:

### Mason — Generation

```
/craft "trustworthy claim button"
```

Mason generates components with correct physics:
1. Parses intent from natural language
2. Determines effect type (financial, destructive, standard, local)
3. Searches for canonical patterns in codebase
4. Generates with correct physics applied

No questions asked. Physics inferred automatically.

### Gardener — Governance

```
/garden
```

Gardener reports on pattern authority:
- **Gold** (10+ imports, 14+ days): Canonical patterns
- **Silver** (5+ imports): Established patterns
- **Draft** (<5 imports): Experimental

Authority is computed from usage, not configuration.

### Diagnostician — Debugging

```
"my dialog flickers on mobile"
```

Diagnostician matches symptoms to patterns:
- Hydration mismatches
- Dialog/modal issues
- Performance problems
- Layout shift (CLS)
- Server component errors
- Animation glitches

Never asks "check the console." Just diagnoses and provides solutions.

---

## Architecture

```
.claude/
├── rules/
│   ├── sigil-physics.md       # Core physics + detection rules
│   └── sigil-examples.md      # Reference examples
├── skills/
│   ├── mason/                 # Generation skill
│   ├── gardener/              # Governance skill
│   └── diagnostician/         # Debugging skill
└── commands/
    ├── craft.md               # /craft → mason
    └── garden.md              # /garden → gardener

grimoires/sigil/
└── constitution.yaml          # Effects, authority, vocabulary

examples/components/
├── ClaimButton.tsx            # Financial mutation
├── DeleteButton.tsx           # Soft delete with undo
├── LikeButton.tsx             # Standard mutation
└── ThemeToggle.tsx            # Local state
```

Skills are prompt-based workflows. No runtime, no hooks, no build step.

---

## Why "Sigil"?

A sigil is a symbolic representation of intent—a mark that carries meaning beyond its form. Sigil captures your product's design physics and makes them available to AI agents, ensuring every generated component embodies the same feel.

---

## Links

- [Installation Guide](docs/INSTALLATION.md)
- [Claude Code](https://claude.ai/code)
- [Repository](https://github.com/0xHoneyJar/sigil)
- [Issues](https://github.com/0xHoneyJar/sigil/issues)

---

*Sigil v11.0.0 "Pure Craft"*
