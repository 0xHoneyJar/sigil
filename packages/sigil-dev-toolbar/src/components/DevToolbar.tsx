import { useCallback } from 'react'
import { useDevToolbar, useDevToolbarConfig } from '../providers/DevToolbarProvider'
import { UserLens, LensActiveBadge } from './UserLens'
import type { ToolbarTab } from '../types'

/**
 * Tab configuration
 */
const TABS: Array<{
  id: ToolbarTab
  label: string
  icon: string
  configKey: keyof Pick<
    ReturnType<typeof useDevToolbarConfig>,
    'enableUserLens' | 'enableSimulation' | 'enableComparison' | 'enableDiagnostics'
  >
}> = [
  { id: 'lens', label: 'Lens', icon: '👁', configKey: 'enableUserLens' },
  { id: 'simulate', label: 'Simulate', icon: '🎭', configKey: 'enableSimulation' },
  { id: 'compare', label: 'Compare', icon: '⚖️', configKey: 'enableComparison' },
  { id: 'diagnose', label: 'Diagnose', icon: '🔍', configKey: 'enableDiagnostics' },
]

/**
 * Placeholder panel for unimplemented tabs
 */
function PlaceholderPanel({ title }: { title: string }) {
  return (
    <div className="sigil-toolbar__placeholder">
      <h3>{title}</h3>
      <p>Coming in Sprint 4+</p>
    </div>
  )
}

/**
 * Render the active tab content
 */
function TabContent({ tab }: { tab: ToolbarTab }) {
  switch (tab) {
    case 'lens':
      return <UserLens />
    case 'simulate':
      return <PlaceholderPanel title="Simulation" />
    case 'compare':
      return <PlaceholderPanel title="State Comparison" />
    case 'diagnose':
      return <PlaceholderPanel title="Diagnostics" />
    default:
      return null
  }
}

/**
 * Main Dev Toolbar component
 *
 * Renders only in development mode (checks process.env.NODE_ENV)
 */
export function DevToolbar() {
  const config = useDevToolbarConfig()
  const {
    visible,
    collapsed,
    activeTab,
    setActiveTab,
    collapse,
    expand,
    toggle,
    userLens,
  } = useDevToolbar()

  const handleTabClick = useCallback(
    (tab: ToolbarTab) => {
      if (collapsed) {
        expand()
      }
      setActiveTab(tab)
    },
    [collapsed, expand, setActiveTab]
  )

  const handleToggleCollapse = useCallback(() => {
    if (collapsed) {
      expand()
    } else {
      collapse()
    }
  }, [collapsed, collapse, expand])

  // Only render in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  if (!visible) {
    return null
  }

  // Filter tabs based on config
  const enabledTabs = TABS.filter((tab) => config[tab.configKey])

  // Position classes
  const positionClass = `sigil-toolbar--${config.position}`

  return (
    <div className={`sigil-toolbar ${positionClass} ${collapsed ? 'sigil-toolbar--collapsed' : ''}`}>
      {/* Header / Tab bar */}
      <div className="sigil-toolbar__header">
        <div className="sigil-toolbar__tabs">
          {enabledTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`sigil-toolbar__tab ${activeTab === tab.id ? 'sigil-toolbar__tab--active' : ''}`}
              title={tab.label}
            >
              <span className="sigil-toolbar__tab-icon">{tab.icon}</span>
              {!collapsed && <span className="sigil-toolbar__tab-label">{tab.label}</span>}
            </button>
          ))}
        </div>

        <div className="sigil-toolbar__controls">
          {/* Show lens badge when impersonating */}
          {userLens.enabled && collapsed && (
            <span className="sigil-toolbar__lens-indicator" title="Lens Active">
              👁
            </span>
          )}

          <button
            onClick={handleToggleCollapse}
            className="sigil-toolbar__collapse-btn"
            aria-label={collapsed ? 'Expand toolbar' : 'Collapse toolbar'}
          >
            {collapsed ? '◀' : '▶'}
          </button>

          <button
            onClick={toggle}
            className="sigil-toolbar__close-btn"
            aria-label="Close toolbar"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content panel */}
      {!collapsed && (
        <div className="sigil-toolbar__content">
          <TabContent tab={activeTab} />
        </div>
      )}

      {/* Keyboard shortcut hint */}
      {collapsed && (
        <div className="sigil-toolbar__shortcut-hint">
          {config.toggleShortcut}
        </div>
      )}
    </div>
  )
}

/**
 * Floating trigger button to show toolbar when hidden
 */
export function DevToolbarTrigger() {
  const { visible, show } = useDevToolbar()
  const config = useDevToolbarConfig()

  // Only render in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  if (visible) {
    return null
  }

  const positionClass = `sigil-toolbar-trigger--${config.position}`

  return (
    <button
      onClick={show}
      className={`sigil-toolbar-trigger ${positionClass}`}
      aria-label="Open Sigil Dev Toolbar"
      title={`Sigil Dev Toolbar (${config.toggleShortcut})`}
    >
      <span>⚡</span>
    </button>
  )
}

/**
 * Complete toolbar with trigger
 */
export function DevToolbarWithTrigger() {
  return (
    <>
      <DevToolbar />
      <DevToolbarTrigger />
      <LensActiveBadge />
    </>
  )
}
