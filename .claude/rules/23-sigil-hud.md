# Sigil: Diagnostic HUD Integration

Patterns for integrating @sigil/hud, the composable diagnostic toolkit.

<when_to_trigger>
## When to Trigger

Load this rule when detecting:

| Signal | Example |
|--------|---------|
| Keywords | "diagnostic", "HUD", "debug toolbar", "dev toolbar", "inspection" |
| Package refs | "@sigil/hud", "@sigil/diagnostics", "@sigil/dev-toolbar" |
| Craft intent | "add debugging", "replace debug toolbar", "physics inspection" |
| File patterns | `debug-toolbar.tsx`, `dev-tools.tsx`, `diagnostic*.tsx` |

</when_to_trigger>

<package_overview>
## Package Overview

| Package | Purpose | Size |
|---------|---------|------|
| `@sigil/hud` | Composable diagnostic components | 92 KB |
| `@sigil/diagnostics` | Physics compliance checking | 25 KB |
| `@sigil/lens` | User Lens (address impersonation) | 5 KB |
| `@sigil/fork` | Fork state management | 9 KB |
| `@sigil/simulation` | Transaction simulation | 7 KB |
| `@sigil/dev-toolbar` | Full-featured dev toolbar | 78 KB |

**Recommendation:**
- For new projects: Start with `@sigil/hud` (all-in-one)
- For existing toolbars: Replace with `@sigil/hud` components
- For Web3 apps: Add `@sigil/dev-toolbar` for Lens + fork state

</package_overview>

<hud_components>
## @sigil/hud Components

### Core Layout

```tsx
import { HudProvider, HudPanel, HudTrigger } from '@sigil/hud'

// Wrap app in provider
<HudProvider>
  <App />
  <HudTrigger />  {/* Floating toggle button */}
  <HudPanel />    {/* Diagnostic panel */}
</HudProvider>
```

### Available Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `HudProvider` | Context provider | `config`, `children` |
| `HudPanel` | Main panel container | `position`, `defaultOpen` |
| `HudTrigger` | Toggle button | `position`, `hotkey` |
| `LensPanel` | Address impersonation | `onAddressChange` |
| `SimulationPanel` | Transaction preview | `transactions` |
| `DiagnosticsPanel` | Physics violations | `components` |
| `PhysicsAnalysis` | Effect breakdown | `effect`, `component` |
| `DataSourceIndicator` | Indexed vs on-chain | `source`, `staleness` |
| `StateComparison` | Fork diff view | `before`, `after` |
| `ObservationCaptureModal` | User feedback | `onCapture` |
| `FeedbackPrompt` | Quick signal | `type`, `onSignal` |
| `IssueList` | Violation list | `issues`, `severity` |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+D` | Toggle HUD |
| `Ctrl+Shift+L` | Toggle Lens panel |
| `Ctrl+Shift+S` | Toggle Simulation panel |
| `Ctrl+Shift+P` | Toggle Physics panel |
| `Ctrl+Shift+O` | Capture observation |

</hud_components>

<integration_patterns>
## Integration Patterns

### Pattern 1: New Project (Full HUD)

```tsx
// app/layout.tsx
import { HudProvider, HudPanel, HudTrigger } from '@sigil/hud'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <HudProvider>
          {children}
          {process.env.NODE_ENV === 'development' && (
            <>
              <HudTrigger position="bottom-right" />
              <HudPanel defaultOpen={false} />
            </>
          )}
        </HudProvider>
      </body>
    </html>
  )
}
```

### Pattern 2: Replace Existing Debug Toolbar

When user has a custom debug toolbar, replace with HUD:

1. **Identify existing toolbar** - Look for `debug-toolbar.tsx`, `dev-tools.tsx`, etc.
2. **Map existing features** to HUD components:

| Existing Feature | HUD Component |
|------------------|---------------|
| Address display | `LensPanel` |
| State inspector | `StateComparison` |
| Physics display | `PhysicsAnalysis` |
| Issue list | `IssueList` + `DiagnosticsPanel` |
| Fork controls | `SimulationPanel` |

3. **Preserve state management** - If using Zustand/Jotai, keep store
4. **Remove old toolbar** - Delete custom implementation
5. **Add HUD** - Use Pattern 1

### Pattern 3: Web3 App (Lens + Fork)

```tsx
import { DevToolbarProvider, DevToolbar, UserLens } from '@sigil/dev-toolbar'

function App() {
  return (
    <WagmiProvider>
      <DevToolbarProvider>
        {/* Your app */}
        <DevToolbar>
          <UserLens onImpersonate={(addr) => console.log('Viewing as:', addr)} />
        </DevToolbar>
      </DevToolbarProvider>
    </WagmiProvider>
  )
}
```

### Pattern 4: Selective Components Only

```tsx
import {
  PhysicsAnalysis,
  DataSourceIndicator,
  useDataSource
} from '@sigil/hud'

function MyComponent() {
  const { source, staleness } = useDataSource('balance')

  return (
    <div>
      <DataSourceIndicator source={source} staleness={staleness} />
      <PhysicsAnalysis effect="Financial" component="StakeButton" />
    </div>
  )
}
```

</integration_patterns>

<craft_detection>
## /craft Detection

When `/craft` detects these scenarios, suggest HUD integration:

| User Request | Detection | Suggestion |
|--------------|-----------|------------|
| "add diagnostic HUD" | Direct request | Pattern 1 (Full HUD) |
| "replace debug toolbar" | Existing toolbar + HUD request | Pattern 2 (Replace) |
| "add debugging tools" | No existing toolbar | Pattern 1 (Full HUD) |
| "physics inspection" | Physics keywords | `PhysicsAnalysis` component |
| "show data sources" | Data physics | `DataSourceIndicator` |
| "fork state comparison" | Web3 + fork keywords | Pattern 3 (Web3) |

### Analysis Box Addition

When HUD integration is detected, add to craft analysis:

```
┌─ Craft Analysis ───────────────────────────────────────┐
│                                                        │
│  Target:       Diagnostic HUD integration              │
│  Craft Type:   Generate (new) / Replace (existing)     │
│                                                        │
│  Tooling:                                              │
│  ✓ @sigil/hud available                               │
│  ✓ Pattern: [Full HUD / Replace / Web3 / Selective]   │
│                                                        │
│  Components to use:                                    │
│  • HudProvider (context)                               │
│  • HudPanel (main container)                           │
│  • HudTrigger (toggle button)                          │
│  • [additional based on needs]                         │
│                                                        │
│  Existing to remove:                                   │
│  • [list files to replace if Pattern 2]               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

</craft_detection>

<hooks_reference>
## Hooks Reference

### useHudStore

```tsx
import { useHudStore } from '@sigil/hud'

function MyComponent() {
  const { isOpen, toggle, setPanel } = useHudStore()

  return (
    <button onClick={() => setPanel('physics')}>
      Show Physics
    </button>
  )
}
```

### useDataSource

```tsx
import { useDataSource } from '@sigil/hud'

function BalanceDisplay() {
  const {
    source,      // 'indexed' | 'onchain' | 'cache'
    staleness,   // number (ms)
    refresh,     // () => void
  } = useDataSource('balance')

  // Show indicator if stale
  if (staleness > 5000) {
    return <StaleWarning onRefresh={refresh} />
  }
}
```

### useSignalCapture

```tsx
import { useSignalCapture } from '@sigil/hud'

function ComponentWithFeedback() {
  const { captureSignal } = useSignalCapture()

  const handleUserAction = () => {
    // After user interacts, optionally capture signal
    captureSignal({
      type: 'ACCEPT',
      component: 'StakeButton',
      effect: 'Financial',
    })
  }
}
```

### useObservationCapture

```tsx
import { useObservationCapture } from '@sigil/hud'

function Inspector() {
  const { capture, isCapturing } = useObservationCapture()

  return (
    <button onClick={() => capture({
      type: 'behavior',
      notes: 'User hesitated before clicking'
    })}>
      {isCapturing ? 'Capturing...' : 'Capture Observation'}
    </button>
  )
}
```

</hooks_reference>

<migration_checklist>
## Migration Checklist

When replacing an existing debug toolbar:

- [ ] **Audit existing features** - List what current toolbar does
- [ ] **Map to HUD components** - Find equivalent components
- [ ] **Check state management** - Preserve stores if needed
- [ ] **Install packages** - `pnpm add @sigil/hud`
- [ ] **Add HudProvider** - Wrap app at root level
- [ ] **Add HudPanel + HudTrigger** - Basic setup
- [ ] **Remove old toolbar** - Delete deprecated files
- [ ] **Test keyboard shortcuts** - Verify Ctrl+Shift+D works
- [ ] **Verify dev-only** - Ensure not in production bundle

</migration_checklist>

<anti_patterns>
## Anti-Patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| HUD in production | Bundle bloat + UX issue | Wrap in `NODE_ENV` check |
| Multiple providers | Context conflicts | Single HudProvider at root |
| Custom toggle + HudTrigger | Duplicate controls | Use one or the other |
| Hardcoded positions | Inflexible layout | Use `position` prop |
| Missing dev check | Exposes debug tools | Always check `NODE_ENV` |

</anti_patterns>
