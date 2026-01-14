# Sigil: Golden Patterns

Reference implementations demonstrating correct physics. Use as templates after discovering the project's conventions.

## Before Using These Patterns

Discover the project's conventions first:
1. Check `package.json` for animation library (framer-motion, react-spring, or CSS)
2. Check `package.json` for data fetching (tanstack-query, swr, or fetch)
3. Read an existing component to understand import style and structure
4. Match discovered conventions in generated code

---

## Financial: ClaimButton

**Effect:** Financial mutation
**Physics:** Pessimistic, 800ms, confirmation required
**Why:** Users need time to verify amounts. Server must confirm before UI updates.

```tsx
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'

export function ClaimButton({ poolId, amount, onSuccess }) {
  const [showConfirm, setShowConfirm] = useState(false)

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: () => claimFromPool(poolId, amount),
    onSuccess: () => {
      setShowConfirm(false)
      onSuccess?.()
    },
    // NO onMutate - pessimistic means no optimistic updates
  })

  if (!showConfirm) {
    return (
      <motion.button onClick={() => setShowConfirm(true)} whileTap={{ scale: 0.98 }}>
        Claim {formatAmount(amount)}
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <p>Claim {formatAmount(amount)} from pool?</p>
      <button onClick={() => setShowConfirm(false)}>Cancel</button>
      <motion.button
        onClick={() => mutate()}
        disabled={isPending}
        transition={{ duration: 0.8 }}
      >
        {isPending ? 'Claiming...' : 'Confirm Claim'}
      </motion.button>
      {isError && <p className="error">{error.message}</p>}
    </motion.div>
  )
}
```

**Correct because:**
- ✓ Two-phase confirmation (click → confirm)
- ✓ Cancel escape hatch always visible
- ✓ No `onMutate` (pessimistic = no optimistic updates)
- ✓ 800ms deliberate animation timing
- ✓ Disabled during pending state
- ✓ Error display with message

---

## Standard: LikeButton

**Effect:** Standard mutation
**Physics:** Optimistic, 200ms, no confirmation
**Why:** Low stakes, reversible. Snappy feedback creates delight.

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'

export function LikeButton({ postId, isLiked }) {
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: () => toggleLike(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['post', postId] })
      const previous = queryClient.getQueryData(['post', postId])
      queryClient.setQueryData(['post', postId], (old) => ({
        ...old,
        isLiked: !old.isLiked,
      }))
      return { previous }
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['post', postId], context?.previous)
    },
  })

  return (
    <motion.button
      onClick={() => mutate()}
      whileTap={{ scale: 0.9 }}
      animate={{ scale: isLiked ? [1, 1.2, 1] : 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {isLiked ? '❤️' : '🤍'}
    </motion.button>
  )
}
```

**Correct because:**
- ✓ `onMutate` for optimistic update (UI changes immediately)
- ✓ `onError` rolls back on failure
- ✓ Snappy spring animation (~200ms feel)
- ✓ No confirmation needed
- ✓ No loading state shown (optimistic makes it feel instant)

---

## Soft Delete: DeleteButton

**Effect:** Soft delete (destructive + undo)
**Physics:** Optimistic, 200ms, toast with undo
**Why:** Undo exists, so we can be fast. Toast provides safety net.

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function DeleteButton({ itemId }) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () => softDeleteItem(itemId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['items'] })
      const previous = queryClient.getQueryData(['items'])
      queryClient.setQueryData(['items'], (old) =>
        old.filter(item => item.id !== itemId)
      )
      return { previous }
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['items'], context?.previous)
      toast.error('Failed to delete')
    },
    onSuccess: () => {
      toast('Item deleted', {
        action: {
          label: 'Undo',
          onClick: () => restoreItem(itemId)
        },
        duration: 5000
      })
    },
  })

  return (
    <button onClick={() => mutate()} disabled={isPending}>
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  )
}
```

**Correct because:**
- ✓ Optimistic update (item disappears immediately)
- ✓ Toast with undo action
- ✓ 5 second undo window
- ✓ Soft delete, not permanent
- ✓ Rollback on error or undo click
- ✓ Feels fast but safe

---

## Local State: ThemeToggle

**Effect:** Local state
**Physics:** Immediate, 100ms, no confirmation
**Why:** No server call. Users expect instant feedback.

```tsx
import { motion } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={false}
        animate={{ x: isDark ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 700, damping: 35 }}
      />
    </button>
  )
}
```

**Correct because:**
- ✓ No server call (useState/context only)
- ✓ Instant spring animation (~100ms feel)
- ✓ No loading state (nothing to load)
- ✓ No confirmation (reversible instantly)
- ✓ Accessible aria-label

---

## Adapting Patterns

When generating, adapt these patterns to match discovered conventions:

| If project uses... | Adapt pattern to use... |
|-------------------|------------------------|
| `react-spring` | `useSpring` instead of `motion` |
| `swr` | `useSWRMutation` instead of `useMutation` |
| CSS animations | `className` transitions instead of motion components |
| `fetch` | Manual fetch with useState instead of query library |
| Tailwind | Utility classes for animations |

Always check the codebase first. Never assume a library exists.
