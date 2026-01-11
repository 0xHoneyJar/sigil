# Skill: Crafting Components

> "Diagnose before solving. Physics before aesthetics."

## Purpose

Generate and refine UI components within Sigil's physics constraints. This skill uses a two-tool model: Hammer (diagnose) and Chisel (execute).

## The Toolkit

### 🔨 Hammer (Diagnose + Route)

**Purpose**: Find the ROOT CAUSE before solving

**Method**: AskUserQuestion loop to investigate

**Speed**: Deliberate (never jump to solutions)

**Triggers**:
- Ambiguous symptoms ("feels slow", "doesn't feel right")
- Questions about approach ("how should we...")
- New component creation
- Feedback that could have multiple causes

**Outcomes**:
- "This IS a UI issue" → Hand off to Chisel
- "This is structural" → Generate Loa handoff
- "This needs Taste Key input" → Route to /approve

### 🪓 Chisel (Execute)

**Purpose**: Refine aesthetics AFTER root cause is understood

**Method**: Quick execution, minimal ceremony

**Speed**: Fast

**Triggers**:
- Clear aesthetic fix ("adjust padding", "change timing")
- Explicit values ("make it 4px", "200ms animation")
- Iteration after Hammer diagnosis
- Obviously aesthetic input

**Precondition**: Root cause already understood OR input is clearly aesthetic

## Workflow

### Phase 1: Tool Selection

```
INPUT RECEIVED
     │
     ├─── Contains measurements? ("4px", "200ms") ──────► 🪓 CHISEL
     │
     ├─── Contains properties? ("padding", "shadow") ──► 🪓 CHISEL  
     │
     ├─── Contains feel-words? ("trustworthy", "heavy") ► 🔨 HAMMER
     │
     ├─── Questions approach? ("how should we") ────────► 🔨 HAMMER
     │
     ├─── Ambiguous symptom? ("feels slow") ────────────► 🔨 HAMMER
     │
     └─── Clearly aesthetic? ───────────────────────────► 🪓 CHISEL
```

### Phase 2: Hammer Investigation

When using Hammer, ALWAYS investigate before solving:

```
USER: "The claim button feels laggy"

HAMMER: Let me understand what's happening.

Q1: "When you say 'laggy', is it:
    a) Slow to respond when clicked
    b) Animation feels sluggish  
    c) Takes too long to confirm"

USER: "c) Takes too long to confirm"

Q2: "How long is 'too long'? And is this:
    a) Consistently slow
    b) Sometimes fast, sometimes slow"

USER: "a) Consistently 3-4 seconds"

Q3: "3-4 seconds suggests network/backend, not UI.
    Do you know where the time is spent?
    a) The indexer (Envio)
    b) The RPC call
    c) Not sure"

USER: "a) Envio"

DIAGNOSIS: Root cause is Envio indexer latency (3-4s).
           This is NOT a UI issue. This is structural.
           → Generate Loa handoff
```

### Phase 3: Physics Loading

Before generating any code, load physics context:

```python
def load_physics(file_path):
    # 1. Detect zone from path
    zone = detect_zone(file_path)  # critical, transactional, etc.
    
    # 2. Load zone physics
    zone_config = load_yaml("resonance/zones.yaml")[zone]
    
    # 3. Load material
    material = zone_config.physics.material
    material_config = load_yaml("resonance/materials.yaml")[material]
    
    # 4. Load core constraints
    sync = load_yaml("core/sync.yaml")
    budgets = load_yaml("core/budgets.yaml")
    fidelity = load_yaml("core/fidelity.yaml")
    
    # 5. Load tensions
    tensions = zone_config.tension_overrides
    
    return PhysicsContext(zone, material_config, sync, budgets, tensions)
```

### Phase 4: Violation Check

Before generating, check for violations:

**Physics Violations (IMPOSSIBLE)**
- Optimistic UI in server_authoritative zone → BLOCK
- Bypassing discrete tick → BLOCK
- Animation exceeding tick rate → BLOCK

**Budget Violations (Override available)**
- Cognitive budget exceeded → BLOCK (Taste Key can override)
- Visual budget exceeded → WARN

**Fidelity Violations (Override available)**
- Gradient stops exceeded → BLOCK
- Shadow layers exceeded → BLOCK
- Animation duration exceeded → BLOCK

### Phase 5: Generation

When generating code, inject physics context:

```
🎛️ SIGIL RESONANCE
═══════════════════════════════════════════════════════════════

PHYSICS CONTEXT
Zone: critical
Material: clay (heavy, spring, depress)
Temporal: discrete tick (600ms) — delay is intentional
Sync: server_authoritative (NO optimistic)
Tensions: weight=80, speed=30, playfulness=20

BUDGETS
Cognitive: 3/5 interactive elements ✓
Visual: 1/1 animations ✓

─────────────────────────────────────────────────────────────────

GENERATING...

[Code that respects all constraints]
```

## Loa Handoff

When issue is structural (not UI), generate handoff context:

```yaml
handoff:
  from: sigil
  to: loa
  
  problem:
    symptom: "Claim button feels laggy"
    diagnosis: "Envio indexer latency (3-4s)"
    
  investigation:
    questions_asked:
      - q: "What kind of lag?"
        a: "Takes too long to confirm"
      - q: "How long?"
        a: "3-4 seconds consistently"
      - q: "Where is time spent?"
        a: "Envio indexer"
    
  constraints:
    zone: "critical"
    sync: "server_authoritative"
    physics_note: "Cannot use optimistic UI in this zone"
    
  target:
    current: "3-4s confirmation"
    goal: "<500ms confirmation"
    
  sigil_constraints: |
    Whatever solution Loa implements, Sigil requires:
    - No optimistic UI (server must confirm first)
    - Pending state must be visible
    - If latency cannot be fixed, make wait feel intentional
```

## The Linear Test

Every Hammer investigation must pass this test:

```
User: "The claim button feels slow"

❌ FAIL: Immediately add skeleton loader
❌ FAIL: Add optimistic UI without checking zone
❌ FAIL: Change animation timing without investigation

✓ PASS: Ask "What kind of slow?"
✓ PASS: Diagnose root cause (UI vs infra)
✓ PASS: Check zone temporal physics
✓ PASS: Route correctly (Chisel vs Loa)
```

## Output Formats

### Physics Violation (Blocked)

```
❌ PHYSICS VIOLATION — IMPOSSIBLE
═══════════════════════════════════════════════════════════════

VIOLATION: Optimistic UI in server_authoritative zone

This is not a style preference. It is a physics violation.
You cannot exceed the speed of light.
You cannot show state before the server confirms in this zone.

Zone: critical
Sync: server_authoritative
Constraint: "Server confirms before state changes"

─────────────────────────────────────────────────────────────────

The delay IS the trust.
This violation CANNOT be overridden.
```

### Budget Violation (Override Available)

```
⚠️ BUDGET VIOLATION — COGNITIVE OVERLOAD
═══════════════════════════════════════════════════════════════

Zone: critical
Budget: 5 interactive elements max
Found: 12 interactive elements

"A screen with 50 perfect buttons is still bad design."

─────────────────────────────────────────────────────────────────

OPTIONS:
[Remove elements] [Request Taste Key override]

Unlike physics violations, budget violations CAN be overridden
by the Taste Key holder with written justification.
```

### Successful Generation

```
✓ SIGIL CRAFT COMPLETE
═══════════════════════════════════════════════════════════════

Zone: critical
Material: clay
Physics: All constraints satisfied
Budgets: Within limits

Generated: ClaimButton.tsx

─────────────────────────────────────────────────────────────────

The component uses:
- Clay material physics (spring 120/14, heavy feel)
- Server-authoritative sync (pending state visible)
- Discrete tick alignment (600ms rhythm)

[View code] [Iterate with Chisel]
```

## Sub-Skills

- `tools/hammer.md` — Diagnostic investigation
- `tools/chisel.md` — Quick execution
