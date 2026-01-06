# Chrome MCP Integration

> Sigil Workbench v1.2.4 - Browser Preview via Claude MCP

## Overview

The Sigil Workbench uses Claude's Chrome MCP (Model Context Protocol) for browser preview. This enables Claude to control Chrome for real-time component testing while you work in the terminal.

## Setup

### Prerequisites

1. **Claude Code CLI** installed and authenticated
2. **Chrome browser** running
3. **Claude in Chrome extension** installed
4. **Dev server** running (npm run dev)

### Installation

1. Install the Claude in Chrome extension from the Chrome Web Store
2. Enable MCP in Claude Code settings:

```bash
# Check if MCP is available
claude --mcp-status
```

## Workflow

### 1. Start Workbench

```bash
# From project root
./.claude/scripts/sigil-workbench.sh
```

This opens a 3-pane tmux session:
- **Top-left**: Physics diff panel
- **Top-right**: Browser preview (via MCP)
- **Bottom**: Claude Code interaction

### 2. Open Dev Server in Chrome

Navigate to your dev server URL (default: http://localhost:3000) in Chrome.

### 3. Use /craft in Claude

```
/craft "checkout button" src/checkout/
```

Claude will:
1. Generate component using zone recipe
2. Show physics diff in top-left pane
3. Navigate browser to component preview
4. Enable A/B toggle for comparison

### 4. Test with A/B Toggle

Press **Space** to toggle between:
- **[A] Before**: Original physics values
- **[B] After**: Adjusted physics values

The toggle works via:
- Hot-swap mode (CSS variables) for instant comparison
- Iframe mode for full flow testing

## MCP Commands

Claude can control Chrome via MCP:

| Action | Example |
|--------|---------|
| Navigate | Go to /checkout |
| Click | Click the submit button |
| Screenshot | Take a screenshot |
| Scroll | Scroll down |
| Type | Type "test" in the input |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SIGIL_DEV_URL` | `http://localhost:3000` | Dev server URL |
| `SIGIL_SESSION` | `sigil-workbench` | tmux session name |

## Keyboard Shortcuts

### In Workbench

| Key | Action |
|-----|--------|
| `Space` | Toggle A/B comparison |
| `Ctrl+b ↑/↓/←/→` | Navigate panes |
| `Ctrl+b z` | Zoom pane |
| `Ctrl+b d` | Detach session |
| `q` | Quit workbench |

### Reattach

```bash
tmux attach -t sigil-workbench
```

## Troubleshooting

### MCP Not Available

```bash
# Check MCP status
claude --mcp-status

# Restart Claude Code
claude --restart
```

### Browser Not Responding

1. Ensure Chrome is running
2. Check Claude in Chrome extension is enabled
3. Navigate manually to dev server URL

### Workbench Won't Start

```bash
# Kill existing session
./.claude/scripts/sigil-workbench.sh --kill

# Check status
./.claude/scripts/sigil-workbench.sh --status
```

## Philosophy

> "See the diff. Feel the result. Learn by doing."

The Chrome MCP integration enables:

1. **Immediate feedback**: See physics changes in browser
2. **Tactile learning**: Click components, feel the physics
3. **Comparison**: Toggle A/B to understand the difference
4. **Flow**: Stay in terminal, browser follows

Numbers gain meaning through your fingers. The diff is visible. The feel is testable.
