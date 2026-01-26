# Glyph: Best Practices

Consolidated React patterns. Apply when generating components.

## Async (Critical)

Waterfalls are the #1 performance killer.

**Parallelize independent operations:**

```tsx
// Bad: sequential (3 round trips)
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()

// Good: parallel (1 round trip)
const [user, posts, comments] = await Promise.all([
  fetchUser(), fetchPosts(), fetchComments()
])
```

**Use Suspense for streaming:**

```tsx
// Wrapper shows immediately, data streams in
function Page() {
  return (
    <div>
      <Header />
      <Suspense fallback={<Skeleton />}>
        <DataDisplay />
      </Suspense>
    </div>
  )
}
```

## Bundle (Critical)

**Avoid barrel imports:**

```tsx
// Bad: loads entire library
import { Check, X } from 'lucide-react'

// Good: loads only needed icons
import Check from 'lucide-react/dist/esm/icons/check'

// Or use Next.js optimizePackageImports
```

**Dynamic import heavy components:**

```tsx
const MonacoEditor = dynamic(
  () => import('./monaco-editor'),
  { ssr: false }
)
```

**Defer non-critical third-party:**

```tsx
const Analytics = dynamic(
  () => import('@vercel/analytics/react').then(m => m.Analytics),
  { ssr: false }
)
```

## Rendering

**Hoist static JSX:**

```tsx
// Bad: recreates every render
function Container() {
  return <div>{loading && <Skeleton />}</div>
}

// Good: reuses element
const skeleton = <Skeleton />
function Container() {
  return <div>{loading && skeleton}</div>
}
```

**Animate wrapper, not SVG:**

```tsx
// Bad: no GPU acceleration
<svg className="animate-spin">...</svg>

// Good: GPU accelerated
<div className="animate-spin"><svg>...</svg></div>
```

**Use content-visibility for long lists:**

```css
.list-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;
}
```

## Re-renders

**Lazy state initialization:**

```tsx
// Bad: runs every render
const [data] = useState(expensiveCompute(items))

// Good: runs once
const [data] = useState(() => expensiveCompute(items))
```

**Extract to memoized components:**

```tsx
const UserAvatar = memo(function UserAvatar({ user }) {
  const id = useMemo(() => computeAvatarId(user), [user])
  return <Avatar id={id} />
})
```

**Use transitions for non-urgent updates:**

```tsx
const handler = () => {
  startTransition(() => setScrollY(window.scrollY))
}
```

## Server-Side

**Use React.cache() for request deduplication:**

```tsx
export const getCurrentUser = cache(async () => {
  const session = await auth()
  return session?.user
})
```

**Minimize serialization at RSC boundaries:**

```tsx
// Bad: serializes all 50 fields
<Profile user={user} />

// Good: serializes only needed field
<Profile name={user.name} />
```

## Data Fetching

**Use SWR for client deduplication:**

```tsx
// Multiple instances share one request
const { data } = useSWR('/api/users', fetcher)
```

## Accessibility

**Always include:**
- `aria-label` for icon-only buttons
- Focus-visible ring (2px)
- Touch target ≥44px
- Contrast ratio ≥4.5:1
- Reduced motion respect

```tsx
<button
  aria-label="Close dialog"
  className="focus-visible:ring-2 min-h-[44px]"
>
  <XIcon />
</button>
```

## External References

See `references/design-engineering/` for expanded guidance:

**Forms & Controls** (`forms-controls.md`):
- Input sizing: 16px+ to prevent iOS zoom
- Form submission: Enter for single-line, Cmd+Enter for multi-line
- Button states: Loading spinners, disabled styling
- Validation: Inline errors, not alerts

**Touch & Accessibility** (`touch-accessibility.md`):
- Touch-first design: `@media (hover: hover)` for hover effects
- Keyboard nav: `scrollIntoView()` on focus
- iOS Safari: Tap highlight, safe areas, 100vh issues
- Reduced motion: Always implement `prefers-reduced-motion`

**Component Design** (`component-design.md`):
- Compound components: Context-based composition
- Props API: Balanced customization vs simplicity
- Render props vs children: When to use each
- Controlled vs uncontrolled: Default to uncontrolled

**Performance** (`performance.md`):
- Virtualization: Use for 100+ items
- Preloading: `rel="preload"`, `fetchPriority`
- Layout prevention: No CLS from dynamic content

See `references/ui-skills/` for enforcement:

**Baseline UI** (`baseline-ui.md`):
- Stack: Tailwind defaults, motion/react, cn utility
- Components: Base UI, React Aria, Radix primitives
- Animation: Only when requested, only compositor props
- Interaction: AlertDialog for destructive, h-dvh not h-screen

**Fixing Motion Performance** (`fixing-motion-performance.md`):
- GPU acceleration: transform, opacity only
- Will-change: Sparingly, remove after animation
- Layout thrashing prevention

See `references/rams/SKILL.md` for design review:
- WCAG 2.1 accessibility checks
- Visual design consistency
- Component state coverage
