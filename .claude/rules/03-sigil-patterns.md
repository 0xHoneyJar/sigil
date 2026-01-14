# Sigil: Golden Patterns

Reference implementations showing correct physics. Use as templates.

---

## Financial: ClaimButton (Pessimistic, 800ms)

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
        transition={{ duration: 0.8 }}  // Deliberate 800ms
      >
        {isPending ? 'Claiming...' : 'Confirm Claim'}
      </motion.button>
      {isError && <p className="error">{error.message}</p>}
    </motion.div>
  )
}
```

**Why correct**: Two-phase confirmation, cancel escape hatch, no optimistic update, 800ms timing, disabled during pending, error display.

---

## Standard: LikeButton (Optimistic, 200ms)

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'

export function LikeButton({ postId, isLiked }) {
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: () => toggleLike(postId),
    onMutate: async () => {
      // Optimistic update - UI changes immediately
      await queryClient.cancelQueries({ queryKey: ['post', postId] })
      const previous = queryClient.getQueryData(['post', postId])
      queryClient.setQueryData(['post', postId], (old) => ({
        ...old,
        isLiked: !old.isLiked,
      }))
      return { previous }
    },
    onError: (err, _, context) => {
      // Rollback on failure
      queryClient.setQueryData(['post', postId], context?.previous)
    },
  })

  return (
    <motion.button
      onClick={() => mutate()}
      whileTap={{ scale: 0.9 }}
      animate={{ scale: isLiked ? [1, 1.2, 1] : 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}  // Snappy 200ms
    >
      {isLiked ? '❤️' : '🤍'}
    </motion.button>
  )
}
```

**Why correct**: Optimistic update with rollback, snappy spring animation, no confirmation needed.

---

## Soft Delete: DeleteButton (Optimistic + Undo)

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
        duration: 5000  // 5 second undo window
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

**Why correct**: Optimistic (because undo exists), toast with undo action, 5 second window, soft delete not permanent.

---

## Local State: ThemeToggle (Immediate, 100ms)

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
        transition={{ type: 'spring', stiffness: 700, damping: 35 }}  // Instant ~100ms
      />
    </button>
  )
}
```

**Why correct**: No server call, instant spring animation, no loading state, accessible.
