/**
 * Sigil v10.1 "Usage Reality" - Diagnostician
 *
 * Pattern library for debugging without questions.
 * "Never ask 'check the console'. Just diagnose."
 *
 * Categories: hydration, dialog, performance, layout, server-component, react-19
 *
 * @module @sigil/diagnostician
 * @version 10.1.0
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Pattern category for diagnostic classification.
 */
export type PatternCategory =
  | 'hydration'
  | 'dialog'
  | 'performance'
  | 'layout'
  | 'server-component'
  | 'react-19'
  | 'state'
  | 'async'
  | 'animation';

/**
 * Severity level for patterns.
 */
export type Severity = 'critical' | 'high' | 'medium' | 'low';

/**
 * A single cause within a pattern.
 */
export interface PatternCause {
  /** Name of the cause */
  name: string;
  /** Technical signature (how to recognize it) */
  signature: string;
  /** Example code that triggers this issue */
  codeSmell?: string;
  /** Solution code */
  solution: string;
}

/**
 * A diagnostic pattern definition.
 */
export interface DiagnosticPattern {
  /** Unique pattern ID */
  id: string;
  /** Human-readable name */
  name: string;
  /** Pattern category */
  category: PatternCategory;
  /** Severity level */
  severity: Severity;
  /** User-reported symptoms that match this pattern */
  symptoms: string[];
  /** Keywords to trigger matching */
  keywords: string[];
  /** Possible causes and solutions */
  causes: PatternCause[];
}

/**
 * Result of a pattern match.
 */
export interface DiagnosticResult {
  /** Matched pattern */
  pattern: DiagnosticPattern;
  /** Most likely cause */
  matchedCause: PatternCause;
  /** Confidence score (0-1) */
  confidence: number;
  /** Which keywords matched */
  matchedKeywords: string[];
  /** Which symptoms matched */
  matchedSymptoms: string[];
}

/**
 * Summary report from diagnosis.
 */
export interface DiagnosticReport {
  /** User's original symptom description */
  symptom: string;
  /** All matching results, sorted by confidence */
  results: DiagnosticResult[];
  /** Top recommendation */
  recommendation: string | null;
  /** Timestamp */
  diagnosedAt: Date;
}

// =============================================================================
// Pattern Library
// =============================================================================

/**
 * Complete pattern library for React/Next.js debugging.
 */
export const PATTERNS: DiagnosticPattern[] = [
  // =========================================================================
  // Hydration Issues
  // =========================================================================
  {
    id: 'hydration-media-query',
    name: 'useMediaQuery Hydration Mismatch',
    category: 'hydration',
    severity: 'high',
    symptoms: [
      'Text content does not match server-rendered HTML',
      'Hydration failed because the initial UI does not match',
      'Component flickers on load',
      'Different content on refresh vs navigation',
      'Works on desktop, broken on mobile',
      'Layout shifts on first load',
    ],
    keywords: ['hydration', 'flicker', 'mismatch', 'ssr', 'server', 'useMediaQuery', 'mobile', 'desktop'],
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
        codeSmell: `const id = Math.random().toString(36);`,
        solution: `// Use useId() for stable IDs
const id = useId();

// Or generate once
const [randomId] = useState(() => crypto.randomUUID());`,
      },
      {
        name: 'localStorage/sessionStorage in render',
        signature: 'Accessing storage during SSR',
        codeSmell: `const theme = localStorage.getItem('theme');`,
        solution: `const [theme, setTheme] = useState<string | null>(null);
useEffect(() => {
  setTheme(localStorage.getItem('theme'));
}, []);`,
      },
    ],
  },

  // =========================================================================
  // Dialog Issues
  // =========================================================================
  {
    id: 'dialog-instability',
    name: 'Dialog/Modal Instability',
    category: 'dialog',
    severity: 'high',
    symptoms: [
      "Dialog doesn't open reliably",
      'Visual glitch during open/close',
      'Works on desktop, fails on mobile',
      'Absolute positioned elements misaligned',
      'Content jumps or shifts',
      'Modal appears then disappears',
      'Drawer slides wrong direction',
    ],
    keywords: ['dialog', 'modal', 'drawer', 'glitch', 'popup', 'open', 'close', 'sheet', 'overlay'],
    causes: [
      {
        name: 'ResponsiveDialog hydration',
        signature: 'useMediaQuery controlling Dialog vs Drawer',
        codeSmell: `const isDesktop = useMediaQuery("(min-width: 768px)");
return isDesktop ? <Dialog open={open} /> : <Drawer open={open} />;`,
        solution: `// Option 1: CSS container queries
.dialog-content {
  @container (min-width: 768px) {
    /* desktop styles */
  }
}

// Option 2: Consistent loading state
if (!mounted) return <DialogSkeleton />;

// Option 3: Always use Dialog with responsive styling
<Dialog>
  <DialogContent className="max-h-[85vh] md:max-h-none">
    ...
  </DialogContent>
</Dialog>`,
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
        codeSmell: `<div className="overflow-auto">
  <Dropdown /> {/* needs overflow-visible */}
</div>`,
        solution: `// Restructure to avoid conflict
<div className="overflow-auto">
  <Content />
</div>
<Dropdown /> {/* Outside overflow container */}

// Or use Portal
<DropdownPortal>
  <DropdownContent />
</DropdownPortal>`,
      },
      {
        name: 'Animation state mismatch',
        signature: 'AnimatePresence without exit animation',
        codeSmell: `{open && <Dialog />}`,
        solution: `<AnimatePresence>
  {open && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Dialog />
    </motion.div>
  )}
</AnimatePresence>`,
      },
    ],
  },

  // =========================================================================
  // Performance Issues
  // =========================================================================
  {
    id: 'render-performance',
    name: 'Render Performance Issues',
    category: 'performance',
    severity: 'medium',
    symptoms: [
      'Laggy interactions',
      'Delayed response to clicks',
      'Janky animations',
      'UI feels heavy',
      'High INP',
      'Slow typing in inputs',
      'Scrolling stutters',
    ],
    keywords: ['slow', 'laggy', 'janky', 'performance', 'heavy', 'delay', 'stutter', 'inp'],
    causes: [
      {
        name: 'Unnecessary re-renders',
        signature: 'Large component tree re-rendering on state change',
        codeSmell: `function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <ExpensiveChild /> {/* Re-renders on every count change */}
    </>
  );
}`,
        solution: `// Memoize expensive children
const MemoizedChild = memo(ExpensiveChild);

// Colocate state (move it down)
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// Use useMemo for expensive computations
const processed = useMemo(() => expensiveWork(data), [data]);`,
      },
      {
        name: 'Layout thrashing',
        signature: 'Reading layout, writing, reading again',
        codeSmell: `elements.forEach(el => {
  const height = el.offsetHeight; // read
  el.style.height = height + 10 + 'px'; // write
});`,
        solution: `// Batch reads, then batch writes
const heights = elements.map(el => el.offsetHeight);
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px';
});

// Use CSS transforms instead of top/left
transform: translateY(10px);

// Use requestAnimationFrame
requestAnimationFrame(() => {
  // batch DOM updates here
});`,
      },
      {
        name: 'Heavy computation in render',
        signature: 'Expensive operation called on every render',
        codeSmell: `function Component({ items }) {
  const sorted = items.sort((a, b) => expensiveCompare(a, b));
  return <List items={sorted} />;
}`,
        solution: `function Component({ items }) {
  const sorted = useMemo(
    () => items.sort((a, b) => expensiveCompare(a, b)),
    [items]
  );
  return <List items={sorted} />;
}`,
      },
    ],
  },

  // =========================================================================
  // Layout Shift
  // =========================================================================
  {
    id: 'layout-shift',
    name: 'Cumulative Layout Shift (CLS)',
    category: 'layout',
    severity: 'medium',
    symptoms: [
      'Content jumps after load',
      'Buttons move as clicking',
      'High CLS score',
      'Page is jumpy',
      'Elements shift unexpectedly',
      'Clicked wrong button',
    ],
    keywords: ['jump', 'shift', 'cls', 'move', 'jumpy', 'layout'],
    causes: [
      {
        name: 'Images without dimensions',
        signature: '<img> without width/height',
        codeSmell: `<img src={src} alt="..." />`,
        solution: `<Image
  src={src}
  width={400}
  height={300}
  alt="..."
/>

// Or use aspect-ratio
<div className="aspect-video">
  <img className="object-cover w-full h-full" />
</div>`,
      },
      {
        name: 'Dynamic content without placeholder',
        signature: 'Content loads and pushes things down',
        codeSmell: `{data && <DynamicContent data={data} />}`,
        solution: `// Reserve space
<div className="min-h-[200px]">
  {loading ? <Skeleton className="h-[200px]" /> : <Content />}
</div>

// Or use contain-intrinsic-size
.container {
  contain-intrinsic-size: 0 200px;
  content-visibility: auto;
}`,
      },
      {
        name: 'Font loading shift',
        signature: 'FOUT (Flash of Unstyled Text)',
        solution: `// Use font-display: swap with size-adjust
@font-face {
  font-family: 'CustomFont';
  font-display: swap;
  size-adjust: 100%;
}

// Or preload critical fonts
<link rel="preload" href="/font.woff2" as="font" crossorigin />`,
      },
    ],
  },

  // =========================================================================
  // Server Components
  // =========================================================================
  {
    id: 'server-component-error',
    name: 'Server Component Errors',
    category: 'server-component',
    severity: 'high',
    symptoms: [
      'useState is not a function',
      'useEffect is not a function',
      'Cannot use hooks in Server Component',
      'Event handlers cannot be passed',
      'You cannot call a function component',
      'Unhandled Runtime Error',
    ],
    keywords: ['server', 'component', 'hook', 'useState', 'useEffect', 'client', 'use client'],
    causes: [
      {
        name: 'Hooks in Server Component',
        signature: 'useState/useEffect without "use client"',
        codeSmell: `// app/page.tsx (Server Component by default)
export default function Page() {
  const [state, setState] = useState(0); // Error!
  return <div>{state}</div>;
}`,
        solution: `// Add at top of file
'use client';

// Or extract to Client Component
// ClientCounter.tsx
'use client';
export function ClientCounter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// page.tsx (Server Component)
import { ClientCounter } from './ClientCounter';
export default function Page() {
  return <ClientCounter />;
}`,
      },
      {
        name: 'Event handler in Server Component',
        signature: 'onClick without "use client"',
        codeSmell: `// Server Component
export default function Button() {
  return <button onClick={() => console.log('click')}>Click</button>;
}`,
        solution: `// Extract to Client Component
'use client';
export function InteractiveButton({ children }) {
  return <button onClick={() => console.log('click')}>{children}</button>;
}`,
      },
    ],
  },

  // =========================================================================
  // React 19
  // =========================================================================
  {
    id: 'react-19-changes',
    name: 'React 19 Breaking Changes',
    category: 'react-19',
    severity: 'medium',
    symptoms: [
      'forwardRef is deprecated',
      'Unexpected behavior after upgrade',
      'PropTypes warning',
      'defaultProps warning',
      'String refs not supported',
    ],
    keywords: ['react 19', 'forwardRef', 'upgrade', 'deprecated', 'breaking'],
    causes: [
      {
        name: 'forwardRef deprecated',
        signature: 'Using forwardRef pattern',
        codeSmell: `const Button = forwardRef((props, ref) => {
  return <button ref={ref} {...props} />;
});`,
        solution: `// ref is now a regular prop in React 19
function Button({ ref, ...props }) {
  return <button ref={ref} {...props} />;
}

// Or with TypeScript
function Button({ ref, ...props }: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return <button ref={ref} {...props} />;
}`,
      },
      {
        name: 'defaultProps deprecated',
        signature: 'Using defaultProps on function components',
        codeSmell: `function Button(props) { ... }
Button.defaultProps = { variant: 'primary' };`,
        solution: `// Use default parameters instead
function Button({ variant = 'primary', ...props }) {
  return <button className={variant} {...props} />;
}`,
      },
      {
        name: 'PropTypes removed',
        signature: 'Using PropTypes for validation',
        codeSmell: `Button.propTypes = { variant: PropTypes.string };`,
        solution: `// Use TypeScript instead
interface ButtonProps {
  variant?: 'primary' | 'secondary';
}

function Button({ variant = 'primary' }: ButtonProps) { ... }`,
      },
    ],
  },

  // =========================================================================
  // State Issues
  // =========================================================================
  {
    id: 'state-issues',
    name: 'State Management Issues',
    category: 'state',
    severity: 'high',
    symptoms: [
      'State not updating',
      'Stale closure',
      'Old value in callback',
      'State resets unexpectedly',
      'Infinite loop',
      'Too many re-renders',
    ],
    keywords: ['state', 'stale', 'closure', 'reset', 'infinite', 'loop', 're-render'],
    causes: [
      {
        name: 'Stale closure',
        signature: 'Callback captures old state value',
        codeSmell: `const [count, setCount] = useState(0);
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1); // Always uses initial count (0)
  }, 1000);
  return () => clearInterval(id);
}, []); // Missing count dependency`,
        solution: `// Use functional update
setCount(c => c + 1);

// Or add dependency
useEffect(() => {
  const id = setInterval(() => setCount(c => c + 1), 1000);
  return () => clearInterval(id);
}, []);`,
      },
      {
        name: 'Object/array reference equality',
        signature: 'Setting same reference triggers no update',
        codeSmell: `const [items, setItems] = useState([1, 2, 3]);
items.push(4); // Mutating!
setItems(items); // Same reference, no re-render`,
        solution: `// Create new reference
setItems([...items, 4]);

// Or use immer
import { produce } from 'immer';
setItems(produce(draft => { draft.push(4); }));`,
      },
      {
        name: 'Infinite useEffect loop',
        signature: 'Effect depends on value it sets',
        codeSmell: `const [data, setData] = useState({});
useEffect(() => {
  setData({ ...data, loaded: true }); // Creates new object every time
}, [data]); // Infinite loop!`,
        solution: `// Use functional update
useEffect(() => {
  setData(d => ({ ...d, loaded: true }));
}, []); // Run once

// Or use useRef for stable values
const loadedRef = useRef(false);`,
      },
    ],
  },

  // =========================================================================
  // Async Issues
  // =========================================================================
  {
    id: 'async-issues',
    name: 'Async/Data Fetching Issues',
    category: 'async',
    severity: 'high',
    symptoms: [
      'Race condition',
      'Stale data',
      'Memory leak warning',
      'Can\'t perform state update on unmounted',
      'Data out of sync',
      'Loading forever',
    ],
    keywords: ['async', 'fetch', 'race', 'stale', 'unmounted', 'loading', 'memory leak'],
    causes: [
      {
        name: 'Race condition on fast navigation',
        signature: 'Multiple requests, wrong one wins',
        codeSmell: `useEffect(() => {
  fetch(\`/api/user/\${id}\`)
    .then(r => r.json())
    .then(setUser);
}, [id]); // Fast id changes cause race`,
        solution: `useEffect(() => {
  let cancelled = false;

  fetch(\`/api/user/\${id}\`)
    .then(r => r.json())
    .then(user => {
      if (!cancelled) setUser(user);
    });

  return () => { cancelled = true; };
}, [id]);

// Or use AbortController
useEffect(() => {
  const controller = new AbortController();

  fetch(\`/api/user/\${id}\`, { signal: controller.signal })
    .then(r => r.json())
    .then(setUser)
    .catch(e => { if (e.name !== 'AbortError') throw e; });

  return () => controller.abort();
}, [id]);`,
      },
      {
        name: 'State update on unmounted component',
        signature: 'Async callback runs after unmount',
        codeSmell: `useEffect(() => {
  fetchData().then(setData); // May run after unmount
}, []);`,
        solution: `useEffect(() => {
  let mounted = true;

  fetchData().then(data => {
    if (mounted) setData(data);
  });

  return () => { mounted = false; };
}, []);

// Or use a data fetching library
const { data } = useSWR('/api/data', fetcher);`,
      },
    ],
  },

  // =========================================================================
  // Animation Issues
  // =========================================================================
  {
    id: 'animation-issues',
    name: 'Animation/Transition Issues',
    category: 'animation',
    severity: 'low',
    symptoms: [
      'Animation not playing',
      'Transition skips',
      'Animation feels wrong',
      'Exit animation missing',
      'Animation only works sometimes',
    ],
    keywords: ['animation', 'transition', 'framer', 'motion', 'animate', 'exit'],
    causes: [
      {
        name: 'Missing AnimatePresence for exit',
        signature: 'Exit animation not triggering',
        codeSmell: `{isOpen && <motion.div exit={{ opacity: 0 }}>Content</motion.div>}`,
        solution: `<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>`,
      },
      {
        name: 'Transition on mount',
        signature: 'Initial state animates',
        codeSmell: `<motion.div animate={{ x: 100 }}>Slides in from left on mount</motion.div>`,
        solution: `// Use initial={false} to skip mount animation
<motion.div initial={false} animate={{ x: 100 }}>
  No animation on mount
</motion.div>

// Or specify initial state
<motion.div initial={{ x: 100 }} animate={{ x: 100 }}>
  Starts at final position
</motion.div>`,
      },
      {
        name: 'Key changes causing remount',
        signature: 'Component remounts instead of animating',
        codeSmell: `{items.map(item => (
  <motion.div key={item.id + '-' + Date.now()}>...</motion.div>
))}`,
        solution: `// Use stable keys
{items.map(item => (
  <motion.div key={item.id} layout>...</motion.div>
))}`,
      },
    ],
  },
];

// =============================================================================
// Matching Functions
// =============================================================================

/**
 * Match a symptom description against all patterns.
 *
 * @param text - User's symptom description
 * @returns Sorted array of matching results
 *
 * @example
 * ```typescript
 * const results = matchSymptoms("my dialog flickers on mobile");
 * console.log(results[0].pattern.name); // "Dialog/Modal Instability"
 * ```
 */
export function matchSymptoms(text: string): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);

  for (const pattern of PATTERNS) {
    // Check keywords
    const matchedKeywords = pattern.keywords.filter(
      (k) => lowerText.includes(k.toLowerCase()) || words.some((w) => w === k.toLowerCase())
    );

    if (matchedKeywords.length === 0) continue;

    // Check symptoms
    const matchedSymptoms = pattern.symptoms.filter((s) => {
      const lowerSymptom = s.toLowerCase();
      // Full match
      if (lowerText.includes(lowerSymptom)) return true;
      // Partial word match
      const symptomWords = lowerSymptom.split(/\s+/);
      const matchingWords = symptomWords.filter((w) => words.includes(w));
      return matchingWords.length >= Math.ceil(symptomWords.length / 2);
    });

    // Calculate confidence
    const keywordScore = Math.min(matchedKeywords.length * 0.15, 0.45);
    const symptomScore = Math.min(matchedSymptoms.length * 0.2, 0.4);
    const severityBonus = pattern.severity === 'critical' ? 0.1 : pattern.severity === 'high' ? 0.05 : 0;
    const confidence = Math.min(0.95, keywordScore + symptomScore + severityBonus);

    if (confidence > 0.2) {
      // Pick most likely cause based on keyword matching
      let matchedCause = pattern.causes[0];
      for (const cause of pattern.causes) {
        const causeWords = cause.name.toLowerCase().split(/\s+/);
        if (causeWords.some((w) => words.includes(w))) {
          matchedCause = cause;
          break;
        }
      }

      results.push({
        pattern,
        matchedCause,
        confidence,
        matchedKeywords,
        matchedSymptoms,
      });
    }
  }

  // Sort by confidence
  return results.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Quick diagnosis from symptom text.
 *
 * @param symptom - User's symptom description
 * @returns Formatted diagnosis string
 *
 * @example
 * ```typescript
 * const diagnosis = diagnose("my dialog flickers on mobile");
 * console.log(diagnosis);
 * // **Found: Dialog/Modal Instability** (75% confidence)
 * // **Cause:** ResponsiveDialog hydration
 * // ...
 * ```
 */
export function diagnose(symptom: string): string {
  const results = matchSymptoms(symptom);

  if (results.length === 0) {
    return `I couldn't match this to a known pattern. Can you describe:
- What you expected to happen
- What actually happened
- When the issue occurs (on load, on click, on mobile, etc.)`;
  }

  const top = results[0];
  const confidence = Math.round(top.confidence * 100);

  let output = `**Found: ${top.pattern.name}** (${confidence}% confidence)

**Category:** ${top.pattern.category} | **Severity:** ${top.pattern.severity}

**Cause:** ${top.matchedCause.name}
${top.matchedCause.signature}
`;

  if (top.matchedCause.codeSmell) {
    output += `
**Problem code:**
\`\`\`typescript
${top.matchedCause.codeSmell}
\`\`\`
`;
  }

  output += `
**Solution:**
\`\`\`typescript
${top.matchedCause.solution}
\`\`\``;

  if (results.length > 1) {
    output += `

---
**Other possibilities:**
${results
  .slice(1, 3)
  .map((r) => `- ${r.pattern.name} (${Math.round(r.confidence * 100)}%)`)
  .join('\n')}`;
  }

  return output.trim();
}

/**
 * Generate a full diagnostic report.
 *
 * @param symptom - User's symptom description
 * @returns Complete diagnostic report
 */
export function generateReport(symptom: string): DiagnosticReport {
  const results = matchSymptoms(symptom);

  return {
    symptom,
    results,
    recommendation: results.length > 0 ? results[0].matchedCause.solution : null,
    diagnosedAt: new Date(),
  };
}

/**
 * Get patterns by category.
 *
 * @param category - Pattern category
 * @returns Patterns in that category
 */
export function getPatternsByCategory(category: PatternCategory): DiagnosticPattern[] {
  return PATTERNS.filter((p) => p.category === category);
}

/**
 * Get patterns by severity.
 *
 * @param severity - Severity level
 * @returns Patterns at that severity
 */
export function getPatternsBySeverity(severity: Severity): DiagnosticPattern[] {
  return PATTERNS.filter((p) => p.severity === severity);
}

/**
 * Get a specific pattern by ID.
 *
 * @param id - Pattern ID
 * @returns Pattern or undefined
 */
export function getPatternById(id: string): DiagnosticPattern | undefined {
  return PATTERNS.find((p) => p.id === id);
}

/**
 * Get all pattern categories.
 */
export function getAllCategories(): PatternCategory[] {
  return Array.from(new Set(PATTERNS.map((p) => p.category)));
}

/**
 * Get pattern count by category.
 */
export function getPatternCounts(): Record<PatternCategory, number> {
  const counts: Record<string, number> = {};

  for (const pattern of PATTERNS) {
    counts[pattern.category] = (counts[pattern.category] || 0) + 1;
  }

  return counts as Record<PatternCategory, number>;
}

/**
 * Check if a symptom matches any critical patterns.
 *
 * @param symptom - User's symptom description
 * @returns True if matches critical pattern
 */
export function hasCriticalMatch(symptom: string): boolean {
  const results = matchSymptoms(symptom);
  return results.some((r) => r.pattern.severity === 'critical' && r.confidence > 0.5);
}
