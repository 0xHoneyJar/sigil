# Sigil Taste Log

Accumulated preferences from usage. Read by `/craft` to inform generation.

**How it works:**
- ACCEPT (+1): You used generated code as-is
- MODIFY (+5): You edited generated code (corrections teach more)
- REJECT (-3): You said no or rewrote

---

<!-- Signals appended below -->

---
timestamp: "2026-01-19T10:00:00Z"
signal: ACCEPT
source: cli
component:
  name: "ClaimButton"
  effect: "Financial"
  craft_type: "generate"
physics:
  behavioral:
    sync: "pessimistic"
    timing: "800ms"
    confirmation: "required"
  animation:
    easing: "ease-out"
    duration: "800ms"
  material:
    surface: "elevated"
    shadow: "soft"
    radius: "8px"
---

---
timestamp: "2026-01-19T11:30:00Z"
signal: MODIFY
source: cli
component:
  name: "WithdrawButton"
  effect: "Financial"
  craft_type: "generate"
physics:
  behavioral:
    sync: "pessimistic"
    timing: "800ms"
    confirmation: "required"
  animation:
    easing: "ease-out"
diagnostic:
  user_type: "mobile"
  goal: "withdraw quickly while checking phone on commute"
  expected_feel: "snappy"
  skipped: false
change:
  from: "800ms"
  to: "500ms"
learning:
  inference: "Mobile users prefer faster timing"
  recommendation: "Consider mobile-specific physics (faster timing)"
---

---
timestamp: "2026-01-19T12:15:00Z"
signal: MODIFY
source: cli
component:
  name: "StakeButton"
  effect: "Financial"
  craft_type: "generate"
physics:
  behavioral:
    sync: "pessimistic"
    timing: "800ms"
  animation:
    easing: "ease-out"
diagnostic:
  user_type: "power-user"
  goal: "quickly stake multiple positions"
  expected_feel: "snappy"
  skipped: false
change:
  from: "800ms, ease-out"
  to: "500ms, spring(400, 25)"
learning:
  inference: |
    1. Significant timing preference: 800ms → 500ms (300ms faster)
    2. Animation preference: ease-out → spring(400, 25)
  recommendation: |
    User prefers spring-based animations for tactile feedback AND
    Consider adjusting base timing for Financial effects
---

---
timestamp: "2026-01-19T13:00:00Z"
signal: MODIFY
source: cli
component:
  name: "TransferButton"
  effect: "Financial"
  craft_type: "generate"
physics:
  behavioral:
    sync: "pessimistic"
    timing: "800ms"
diagnostic:
  skipped: true
change:
  from: "800ms"
  to: "500ms"
learning:
  inference: "User prefers 500ms timing (no diagnostic context available)"
---

---
timestamp: "2026-01-19T14:00:00Z"
signal: REJECT
source: cli
component:
  name: "DeleteAccountButton"
  effect: "Destructive"
  craft_type: "generate"
physics:
  behavioral:
    sync: "pessimistic"
    timing: "600ms"
    confirmation: "required"
diagnostic:
  user_type: "casual"
  goal: "delete unused account"
  expected_feel: "trustworthy"
  skipped: false
rejection_reason: "Missing two-step confirmation for account deletion, needs more friction for this high-stakes action"
learning:
  inference: "User expects more trust signals for destructive account actions"
  recommendation: "Add two-step confirmation for account deletion"
---
