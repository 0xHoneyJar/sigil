# @thehoneyjar/sigil-hud

Diagnostic HUD for Sigil - composable React components for development.

## What's New in v0.3.0

- **Agentation Toggle**: One-click to annotate UI elements for AI agents
- **User Lens Panel**: Address impersonation for debugging user issues
- **useEffectiveAddress Hook**: Lens-aware address resolution for wagmi

## Installation

```bash
# Using the official scope
pnpm add @thehoneyjar/sigil-hud

# Optional: Install packages you want to use
pnpm add @thehoneyjar/sigil-lens @thehoneyjar/sigil-fork @thehoneyjar/sigil-simulation @thehoneyjar/sigil-diagnostics
```

**Alias option:** If you prefer shorter imports, you can alias the package:

```bash
pnpm add @sigil/hud@npm:@thehoneyjar/sigil-hud
pnpm add @sigil/lens@npm:@thehoneyjar/sigil-lens
# etc.
```

## Usage

### Basic Setup

```tsx
import { HudProvider, HudPanel, HudTrigger } from '@thehoneyjar/sigil-hud'
import { createLensService } from '@thehoneyjar/sigil-lens'
import { createDiagnosticsService } from '@thehoneyjar/sigil-diagnostics'

const lensService = createLensService()
const diagnosticsService = createDiagnosticsService()

function App() {
  return (
    <HudProvider
      lensService={lensService}
      diagnosticsService={diagnosticsService}
      config={{
        shortcuts: true,
        position: 'bottom-right',
      }}
    >
      <YourApp />
      <HudTrigger />
      <HudPanel>
        <LensPanel />
        <DiagnosticsPanel />
      </HudPanel>
    </HudProvider>
  )
}
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘⇧D` | Toggle HUD |
| `1-5` | Switch panels (when open) |
| `Esc` | Close HUD |

```tsx
import { useKeyboardShortcuts } from '@thehoneyjar/sigil-hud'

function MyComponent() {
  useKeyboardShortcuts({ enabled: true })
  // ...
}
```

### Signal Capture

```tsx
import { useSignalCapture } from '@thehoneyjar/sigil-hud'

function MyComponent() {
  const { accept, modify, reject } = useSignalCapture()

  const handleAccept = () => {
    accept('ClaimButton', 'financial')
  }

  const handleModify = () => {
    modify('ClaimButton', 'financial', {
      from: '800ms',
      to: '500ms',
    })
  }
}
```

### Observation Capture

```tsx
import { useObservationCapture } from '@thehoneyjar/sigil-hud'

function MyComponent() {
  const { captureUserTruth, captureIssue } = useObservationCapture()

  const handleFeedback = () => {
    captureUserTruth('This button feels too slow for power users', {
      component: 'ClaimButton',
      effect: 'financial',
    })
  }
}
```

### Agentation Integration

The HUD includes a toggle for [Agentation](https://agentation.dev), a visual feedback tool for AI agents.

**Setup**: First, add the Agentation component to your app:

```tsx
import { Agentation } from 'agentation'

function App() {
  return (
    <>
      <YourApp />
      {process.env.NODE_ENV === 'development' && <Agentation />}
    </>
  )
}
```

**Usage**: Click the "📌 Annotate" button in the HUD header to toggle annotation mode. Click UI elements to capture their selectors, then paste the output into Claude Code and run `/observe parse`.

### wagmi Integration

For web3 apps, the HUD provides lens-aware address hooks:

```tsx
import { useEffectiveAddress, useAccount } from '@thehoneyjar/sigil-hud/wagmi'

function MyWeb3Component() {
  // Returns impersonated address when lens is active, real address otherwise
  const address = useEffectiveAddress()

  // Full account info with lens awareness
  const { address: effectiveAddress, isImpersonating } = useAccount()

  return (
    <div>
      {isImpersonating && <Badge>Viewing as {address}</Badge>}
      <BalanceDisplay address={address} />
    </div>
  )
}
```

## Components

| Component | Description |
|-----------|-------------|
| `HudProvider` | Context provider for HUD state and services |
| `HudPanel` | Main panel container |
| `HudTrigger` | Floating button to open HUD |
| `LensPanel` | Address impersonation controls |
| `SimulationPanel` | Transaction simulation info |
| `DiagnosticsPanel` | Physics compliance checking |
| `StateComparison` | Compare real vs impersonated state |

## Hooks

| Hook | Description |
|------|-------------|
| `useHud()` | Access HUD context |
| `useKeyboardShortcuts()` | Enable keyboard shortcuts |
| `useSignalCapture()` | Capture taste signals |
| `useObservationCapture()` | Capture observations |

## Progressive Enhancement

The HUD works with any subset of packages. Features gracefully degrade when packages are not installed:

- No `@thehoneyjar/sigil-lens` → Lens panel shows "not available" message
- No `@thehoneyjar/sigil-simulation` → Simulation panel shows "not available" message
- No `@thehoneyjar/sigil-diagnostics` → Diagnostics panel shows "not available" message

## Configuration

```typescript
interface HudConfig {
  shortcuts?: boolean        // Enable keyboard shortcuts
  position?: HudPosition     // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  persist?: boolean          // Persist state to localStorage
  observationCapture?: boolean
  signalCapture?: boolean
  defaultPanel?: HudPanelType
}
```

## License

MIT
