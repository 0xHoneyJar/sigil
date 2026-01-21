/**
 * Known Diagnostic Patterns
 *
 * Patterns for detecting common issues in React/Next.js applications.
 */

import type { DiagnosticPattern } from './types'

/**
 * Built-in diagnostic patterns
 */
export const PATTERNS: DiagnosticPattern[] = [
  // Hydration Issues
  {
    id: 'hydration-media-query',
    name: 'useMediaQuery Hydration Mismatch',
    category: 'hydration',
    severity: 'error',
    symptoms: [
      'Text content does not match server-rendered HTML',
      'Hydration failed because the initial UI does not match',
      'Component flickers on load',
      'Different content on refresh vs navigation',
    ],
    keywords: ['hydration', 'flicker', 'mismatch', 'ssr', 'server'],
    causes: [
      {
        name: 'useMediaQuery SSR mismatch',
        signature: 'useMediaQuery returns false on server, true on client',
        codeSmell: `const isDesktop = useMediaQuery("(min-width: 768px)");
return isDesktop ? <Dialog /> : <Drawer />;`,
        solution: `// Option 1: Loading state until mounted
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <Skeleton />;

// Option 2: CSS-only responsive
<div className="hidden md:block"><Dialog /></div>
<div className="md:hidden"><Drawer /></div>`,
      },
      {
        name: 'Date/time in render',
        signature: 'new Date() in render path',
        codeSmell: `return <span>{new Date().toLocaleString()}</span>`,
        solution: `const [time, setTime] = useState<string | null>(null);
useEffect(() => {
  setTime(new Date().toLocaleString());
}, []);
return <span>{time ?? 'Loading...'}</span>;`,
      },
      {
        name: 'Random values in render',
        signature: 'Math.random() or crypto.randomUUID() in render',
        solution: `// Use useId() for stable IDs
const id = useId();

// Or generate once
const [randomId] = useState(() => crypto.randomUUID());`,
      },
    ],
  },

  // Dialog Issues
  {
    id: 'dialog-instability',
    name: 'Dialog/Modal Instability',
    category: 'dialog',
    severity: 'error',
    symptoms: [
      "Dialog doesn't open reliably",
      'Visual glitch during open/close',
      'Works on desktop, fails on mobile',
      'Absolute positioned elements misaligned',
      'Content jumps or shifts',
    ],
    keywords: ['dialog', 'modal', 'drawer', 'glitch', 'popup', 'open', 'close'],
    causes: [
      {
        name: 'ResponsiveDialog hydration',
        signature: 'useMediaQuery controlling Dialog vs Drawer',
        solution: `// Option 1: CSS container queries
.dialog-content {
  @container (min-width: 768px) {
    /* desktop styles */
  }
}

// Option 2: Consistent loading state
if (!mounted) return <DialogSkeleton />;`,
      },
      {
        name: 'Absolute positioning context mismatch',
        signature: 'absolute positioning with varying parent chains',
        codeSmell: `<div className="absolute -top-4">Title</div>`,
        solution: `// Ensure explicit positioning context
<div className="relative">
  <div className="absolute -top-4">Title</div>
</div>`,
      },
      {
        name: 'CSS overflow conflicts',
        signature: 'overflow-auto on parent, overflow-visible on child',
        solution: `// Be explicit at each level
// Or restructure to avoid conflict
// Or use style prop for explicit control`,
      },
    ],
  },

  // Performance Issues
  {
    id: 'render-performance',
    name: 'Render Performance Issues',
    category: 'performance',
    severity: 'warning',
    symptoms: [
      'Laggy interactions',
      'Delayed response to clicks',
      'Janky animations',
      'UI feels heavy',
      'High INP',
    ],
    keywords: ['slow', 'laggy', 'janky', 'performance', 'heavy', 'delay'],
    causes: [
      {
        name: 'Unnecessary re-renders',
        signature: 'Large component tree re-rendering on state change',
        solution: `// Memoize expensive children
const MemoizedChild = memo(Child);

// Colocate state (move it down)
// Use useMemo for expensive computations
const processed = useMemo(() => expensiveWork(data), [data]);`,
      },
      {
        name: 'Layout thrashing',
        signature: 'Reading layout, writing, reading again',
        solution: `// Batch reads, then batch writes
// Use requestAnimationFrame
// Use CSS transforms instead of top/left`,
      },
    ],
  },

  // Layout Shift
  {
    id: 'layout-shift',
    name: 'Cumulative Layout Shift (CLS)',
    category: 'layout',
    severity: 'warning',
    symptoms: [
      'Content jumps after load',
      'Buttons move as clicking',
      'High CLS score',
      'Page is jumpy',
    ],
    keywords: ['jump', 'shift', 'cls', 'move', 'jumpy'],
    causes: [
      {
        name: 'Images without dimensions',
        signature: '<img> without width/height',
        solution: `<Image
  src={src}
  width={400}
  height={300}
  alt="..."
/>

// Or use aspect-ratio
<div className="aspect-video">
  <img className="object-cover" />
</div>`,
      },
      {
        name: 'Dynamic content without placeholder',
        signature: 'Content loads and pushes things down',
        solution: `// Reserve space
<div className="min-h-[200px]">
  {loading ? <Skeleton /> : <Content />}
</div>`,
      },
    ],
  },

  // Server Components
  {
    id: 'server-component-error',
    name: 'Server Component Errors',
    category: 'server-component',
    severity: 'error',
    symptoms: [
      'useState is not a function',
      'useEffect is not a function',
      'Cannot use hooks in Server Component',
      'Event handlers cannot be passed',
    ],
    keywords: ['server', 'component', 'hook', 'usestate', 'useeffect', 'client'],
    causes: [
      {
        name: 'Hooks in Server Component',
        signature: 'useState/useEffect without "use client"',
        solution: `// Add at top of file
'use client';

// Or extract to Client Component`,
      },
    ],
  },

  // React 19
  {
    id: 'react-19-changes',
    name: 'React 19 Breaking Changes',
    category: 'react-19',
    severity: 'warning',
    symptoms: ['forwardRef is deprecated', 'Unexpected behavior after upgrade'],
    keywords: ['react 19', 'forwardref', 'upgrade', 'deprecated'],
    causes: [
      {
        name: 'forwardRef deprecated',
        signature: 'Using forwardRef pattern',
        codeSmell: `const Button = forwardRef((props, ref) => ...);`,
        solution: `// ref is now a regular prop
function Button({ ref, ...props }) {
  return <button ref={ref} {...props} />;
}`,
      },
    ],
  },

  // Physics Compliance
  {
    id: 'physics-financial-optimistic',
    name: 'Financial Action Using Optimistic Sync',
    category: 'physics',
    severity: 'error',
    symptoms: [
      'Financial action uses optimistic update',
      'Money operation without confirmation',
      'Transaction rolls back after user sees success',
    ],
    keywords: [
      'claim',
      'deposit',
      'withdraw',
      'transfer',
      'swap',
      'optimistic',
    ],
    causes: [
      {
        name: 'Optimistic update on financial mutation',
        signature: 'onMutate used for financial operations',
        codeSmell: `useMutation({
  mutationFn: claimRewards,
  onMutate: async () => {
    // Optimistic update - WRONG for financial!
    queryClient.setQueryData(['balance'], newBalance)
  }
})`,
        solution: `// Use pessimistic sync for financial operations
useMutation({
  mutationFn: claimRewards,
  // NO onMutate - wait for server confirmation
  onSuccess: () => {
    queryClient.invalidateQueries(['balance'])
  }
})`,
      },
    ],
  },

  {
    id: 'physics-destructive-no-confirm',
    name: 'Destructive Action Without Confirmation',
    category: 'physics',
    severity: 'error',
    symptoms: [
      'Delete button with no confirmation',
      'Permanent action happens immediately',
      'No way to undo destructive operation',
    ],
    keywords: ['delete', 'remove', 'destroy', 'revoke', 'terminate'],
    causes: [
      {
        name: 'Missing confirmation for destructive action',
        signature: 'Destructive action without confirmation step',
        codeSmell: `<button onClick={() => deleteItem()}>Delete</button>`,
        solution: `// Add confirmation step
const [showConfirm, setShowConfirm] = useState(false);

return showConfirm ? (
  <ConfirmDialog
    message="Are you sure you want to delete?"
    onConfirm={() => deleteItem()}
    onCancel={() => setShowConfirm(false)}
  />
) : (
  <button onClick={() => setShowConfirm(true)}>Delete</button>
);`,
      },
    ],
  },
]

/**
 * Get all patterns
 */
export function getPatterns(): DiagnosticPattern[] {
  return PATTERNS
}

/**
 * Get patterns by category
 */
export function getPatternsByCategory(
  category: DiagnosticPattern['category']
): DiagnosticPattern[] {
  return PATTERNS.filter((p) => p.category === category)
}

/**
 * Get pattern by ID
 */
export function getPatternById(id: string): DiagnosticPattern | undefined {
  return PATTERNS.find((p) => p.id === id)
}
