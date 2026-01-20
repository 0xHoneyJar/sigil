# /test-flow Command

## Purpose

Execute and validate complete user flows with automatic state management.
Captures screenshots at each step and generates a comprehensive report.

## Usage

```bash
# Run built-in flow
/test-flow <url> <flow>

# Run with fork mode
/test-flow <url> <flow> fork

# Run custom flow (from web3.yaml)
/test-flow <url> <custom-flow-name>
```

## Arguments

| Position | Name | Description | Required |
|----------|------|-------------|----------|
| 1 | url | Base URL for flow | Yes |
| 2 | flow | Flow name (built-in or custom) | Yes |
| 3 | mode | "fork" for real contract state | No |

## Built-in Flows

From `.claude/skills/web3-testing/resources/flows.yaml`:

| Flow | Description | Steps |
|------|-------------|-------|
| `connect` | Wallet connection | disconnected → connected |
| `claim` | Claim rewards | connected → pending → success |
| `switch` | Chain switching | mainnet → arbitrum |
| `error` | Error recovery | send → error → retry |
| `stake` | Approve and stake | approve → stake → success |
| `disconnect` | Disconnect wallet | connected → disconnected |
| `insufficient` | Insufficient balance UI | empty → warning |

## Flow Step Types

| Action | Description | Example |
|--------|-------------|---------|
| `inject` | Initial state injection | `state: { connected: true }` |
| `update` | Runtime state update (triggers events) | `state: { transactionState: "pending" }` |
| `click` | Click element by selector | `selector: "[data-testid='claim-button']"` |
| `fill` | Fill input field | `selector: "input", value: "100"` |
| `navigate` | Navigate to path | `path: "/claim"` |
| `wait` | Wait for duration or selector | `duration: 300` or `selector: ".loaded"` |
| `screenshot` | Capture screenshot | `name: "01-claim-page"` |

## Workflow

```
1. Parse arguments
   ├── Load flow definition (built-in or custom)
   ├── Detect mode (mock/fork)
   └── Validate URL

2. Initialize
   ├── Create output directory
   ├── If fork: Initialize fork provider
   ├── Generate injection script
   └── Open browser with evaluateOnNewDocument

3. Execute steps
   For each step:
   ├── Log step info
   ├── Execute action (inject/update/click/etc.)
   ├── Capture screenshot if specified
   ├── Record timing
   └── Handle errors

4. Generate report
   ├── Create flow-report.md
   ├── List all steps with results
   ├── Include physics validation
   └── Embed screenshots

5. Cleanup
   ├── Close browser
   ├── If fork: Clean up (optional)
   └── Report summary
```

## Output

```
grimoires/sigil/snapshots/flows/{flow-name}/
├── 01-{step-name}.png
├── 02-{step-name}.png
├── ...
└── report.md
```

## Example Sessions

### Run Claim Flow

```bash
> /test-flow http://localhost:3000 claim

Executing flow: claim
Base URL: http://localhost:3000
Mode: mock

Step 1/10: Inject initial state
  ✓ Address: 0xf39F...2266
  ✓ Balance: 10.0 ETH
  ✓ Claimable: 100.0

Step 2/10: Navigate to /claim
  ✓ Page loaded

Step 3/10: Screenshot
  → grimoires/sigil/snapshots/flows/claim/01-claim-page.png

Step 4/10: Click Claim button
  ✓ Clicked [data-testid='claim-button']

Step 5/10: Screenshot
  → grimoires/sigil/snapshots/flows/claim/02-confirmation.png

Step 6/10: Click Confirm
  ✓ Clicked [data-testid='confirm-button']

Step 7/10: Update state (pending)
  ✓ store.update({ transactionState: 'pending' })

Step 8/10: Screenshot
  → grimoires/sigil/snapshots/flows/claim/03-pending.png

Step 9/10: Update state (success)
  ✓ store.update({ transactionState: 'success' })

Step 10/10: Screenshot
  → grimoires/sigil/snapshots/flows/claim/04-success.png

Flow completed in 3.8s

Physics validation:
  ✓ Confirmation dialog present (financial action)
  ✓ Cancel button visible during pending
  ✓ Touch targets ≥44px
  ✓ Focus rings visible

Report: grimoires/sigil/snapshots/flows/claim/report.md
```

### Run with Fork Mode

```bash
> /test-flow http://localhost:3000 claim fork

Executing flow: claim
Base URL: http://localhost:3000
Mode: fork (Tenderly detected)

Forking mainnet at block 19500000...
✓ Fork ready: https://rpc.tenderly.co/fork/abc123

[... flow execution with real contract reads ...]

Flow completed in 5.2s
Fork cleaned up.
```

## Custom Flows

Define in `grimoires/sigil/web3.yaml`:

```yaml
flows:
  my-custom-flow:
    - scenario: whale
    - navigate: /my-page
    - screenshot: start
    - click: "[data-testid='action-button']"
    - update: { transactionState: pending }
    - wait: 1000
    - screenshot: pending
    - update: { transactionState: success }
    - screenshot: complete
```

Then run:

```bash
/test-flow http://localhost:3000 my-custom-flow
```

## Physics Validation

After flow completion, validates:

| Check | Criteria |
|-------|----------|
| Touch targets | All interactive elements ≥44px |
| Focus rings | Visible on keyboard navigation |
| Confirmation | Present for financial/destructive actions |
| Cancel/escape | Always available during pending |
| Error recovery | Retry option present on errors |

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Flow not found" | Unknown flow name | Check built-in list or web3.yaml |
| "Selector not found" | Element doesn't exist | Update selector or add wait |
| "State update failed" | Invalid state structure | Check state format |
| "Screenshot failed" | Browser not ready | Add wait step before screenshot |

## Report Template

Generated `report.md` includes:

- Flow metadata (name, URL, mode, duration)
- Step-by-step results table
- State transition diagram
- Physics validation results
- Embedded screenshots
- Error details (if any)

## Dependencies

- `agent-browser` skill for browser automation
- `web3-testing` skill for state injection
- Fork provider (Tenderly/Anvil) for fork mode
