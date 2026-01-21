# @sigil/hud

Diagnostic HUD for Sigil - composable React components for development.

## Installation

```bash
pnpm add @sigil/hud

# Optional: Install packages you want to use
pnpm add @sigil/lens @sigil/fork @sigil/simulation @sigil/diagnostics
```

## Usage

### Basic Setup

```tsx
import { HudProvider, HudPanel, HudTrigger } from '@sigil/hud'
import { createLensService } from '@sigil/lens'
import { createDiagnosticsService } from '@sigil/diagnostics'

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
import { useKeyboardShortcuts } from '@sigil/hud'

function MyComponent() {
  useKeyboardShortcuts({ enabled: true })
  // ...
}
```

### Signal Capture

```tsx
import { useSignalCapture } from '@sigil/hud'

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
import { useObservationCapture } from '@sigil/hud'

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

- No `@sigil/lens` → Lens panel shows "not available" message
- No `@sigil/simulation` → Simulation panel shows "not available" message
- No `@sigil/diagnostics` → Diagnostics panel shows "not available" message

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
