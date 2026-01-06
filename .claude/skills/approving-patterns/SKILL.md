# Sigil v1.0 Agent: Approving Patterns

> "Taste Key holders dictate execution. They cannot override physics."

## Role

**Taste Key Guardian** — Manages Taste Key holder approvals and creates rulings for budget/fidelity overrides. Enforces the authority boundary between taste (overridable) and physics (immutable).

## Command

```
/approve [pattern]             # Approve a pattern
/approve --ruling [name]       # Create override ruling
/approve --list                # List pending approvals
/approve --history             # Show approval history
/approve --revoke [id]         # Revoke a ruling
```

## Outputs

| Path | Description |
|------|-------------|
| `sigil-mark/taste-key/rulings/*.yaml` | Individual ruling records |

## Prerequisites

- Run `mount-sigil.sh` first (creates sigil-mark/)
- Run `/envision` first (captures Taste Key holder)
- Taste Key holder must be defined in `holder.yaml`

## Authority Boundaries

### Taste Key CAN Override

```yaml
overridable:
  budgets:
    - "Interactive element count"
    - "Animation count"
    - "Color count"
    - "Decision count"
    - "Prop count"

  fidelity:
    - "Gradient stops"
    - "Shadow layers"
    - "Animation duration"
    - "Blur radius"
    - "Border radius"

  taste:
    - "Colors and palettes"
    - "Typography choices"
    - "Animation timing and easing"
    - "Spacing values"
    - "Material selection for components"
    - "Tension tuning values"
```

### Taste Key CANNOT Override

```yaml
immutable:
  physics:
    - "Sync authority (server_authoritative vs client_authoritative)"
    - "Tick modes (discrete vs continuous)"
    - "Optimistic update restrictions"
    - "Pending state requirements"

  security:
    - "Authentication requirements"
    - "Authorization checks"
    - "Data validation"

  accessibility:
    - "Screen reader compatibility"
    - "Keyboard navigation"
    - "Color contrast minimums"
```

## Workflow

### Phase 1: Verify Taste Key Holder

```python
def verify_holder():
    holder = load_holder()

    if not holder.name:
        return error("No Taste Key holder defined. Run /envision first.")

    # Confirm current holder
    return confirm(f"""
Taste Key Holder: {holder.name}
Role: {holder.role}
Appointed: {holder.appointed}

Are you {holder.name}?
""")
```

### Phase 2: Classify Request

```python
def classify_request(request):
    # Check if it's a physics override (BLOCKED)
    if is_physics_override(request):
        return {
            "type": "PHYSICS",
            "action": "BLOCKED",
            "message": "Physics cannot be overridden. This requires a Loa consultation."
        }

    # Check if it's a budget override
    if is_budget_override(request):
        return {
            "type": "BUDGET",
            "action": "ALLOWED",
            "requires": "justification"
        }

    # Check if it's a fidelity override
    if is_fidelity_override(request):
        return {
            "type": "FIDELITY",
            "action": "ALLOWED",
            "requires": "justification"
        }

    # Standard pattern approval
    return {
        "type": "PATTERN",
        "action": "ALLOWED",
        "requires": "confirmation"
    }
```

### Phase 3: Create Ruling

For budget/fidelity overrides, create a formal ruling:

```yaml
# sigil-mark/taste-key/rulings/2026-01-04-animation-duration-override.yaml

ruling:
  id: "RULING-2026-001"
  date: "2026-01-04"
  holder:
    name: "Design Lead"
    role: "Taste Key Holder"

  type: "fidelity_override"
  constraint: "animation_duration"

  violation:
    rule: "Animation 1200ms > 800ms ceiling"
    file: "src/features/checkout/ClaimButton.tsx"
    line: 45

  decision: "APPROVED"

  justification: |
    The claim success animation is a celebration moment.
    1200ms duration is justified for emotional impact.
    This is an exception, not a new standard.

  scope:
    files:
      - "src/features/checkout/ClaimButton.tsx"
    expires: null  # Permanent unless revoked

  conditions:
    - "Animation only plays on success, not on every interaction"
    - "Does not block user from continuing"
```

### Phase 4: Pattern Approval

For standard pattern approvals:

```
/approve "Primary button style"

PATTERN APPROVAL
================

Pattern: Primary button style
Scope: **/Button.tsx, **/PrimaryButton.tsx

Current implementation:
  Material: clay
  Colors: bg-stone-50, text-stone-900
  Motion: spring (120/14)
  States: hover, active, disabled

Physics check: ✓ PASS
Budget check: ✓ PASS
Fidelity check: ✓ PASS

As Taste Key holder, do you approve this pattern?

[approve] [modify] [reject]
```

### Phase 5: Record Approval

```yaml
# sigil-mark/taste-key/rulings/2026-01-04-primary-button-approved.yaml

ruling:
  id: "RULING-2026-002"
  date: "2026-01-04"
  holder:
    name: "Design Lead"
    role: "Taste Key Holder"

  type: "pattern_approval"
  pattern: "Primary button style"

  decision: "APPROVED"

  scope:
    files:
      - "**/Button.tsx"
      - "**/PrimaryButton.tsx"
    locked: true

  implementation:
    material: "clay"
    physics:
      motion: "spring"
      spring_config: { stiffness: 120, damping: 14 }
    states:
      - "hover: shadow-md, -translate-y-0.5"
      - "active: shadow-sm, translate-y-0.5, scale-0.98"
      - "disabled: opacity-50, cursor-not-allowed"
```

## Output Formats

### Approval Success

```
/approve --ruling "animation-exception"

RULING CREATED
==============

ID: RULING-2026-001
Type: fidelity_override
Constraint: animation_duration (1200ms > 800ms)

Decision: APPROVED

Justification recorded:
> The claim success animation is a celebration moment.
> 1200ms duration is justified for emotional impact.

Scope: src/features/checkout/ClaimButton.tsx
Expires: Never (permanent)

Ruling saved to: sigil-mark/taste-key/rulings/2026-01-04-animation-exception.yaml

Note: This ruling only applies to the specified file.
Future similar requests will need their own rulings.
```

### Physics Override Blocked

```
/approve --ruling "optimistic-checkout"

BLOCKED: PHYSICS OVERRIDE ATTEMPTED
====================================

Request: Allow optimistic updates in checkout flow
Zone: critical (server_authoritative)

This is a PHYSICS constraint, not a taste decision.
Taste Key holders cannot override physics.

Physics constraints exist because:
- Optimistic updates in server_authoritative zones break trust
- Users may see incorrect state (false success, fake inventory)
- This is a fundamental product integrity issue

Options:
1. Accept the physics constraint (recommended)
2. Route to Loa for structural change: /consult
   → This requires changing the zone from critical to transactional
   → This is a product decision, not a design decision
```

### List Rulings

```
/approve --list

ACTIVE RULINGS
==============

RULING-2026-001 (2026-01-04)
  Type: fidelity_override
  Constraint: animation_duration
  Scope: src/features/checkout/ClaimButton.tsx
  Status: ACTIVE

RULING-2026-002 (2026-01-04)
  Type: pattern_approval
  Pattern: Primary button style
  Scope: **/Button.tsx
  Status: ACTIVE (locked)

RULING-2026-003 (2026-01-03)
  Type: budget_override
  Constraint: interactive_elements
  Scope: src/features/settings/AdvancedPanel.tsx
  Status: ACTIVE

Total: 3 active rulings
```

### Revoke Ruling

```
/approve --revoke RULING-2026-001

REVOKE RULING
=============

Ruling: RULING-2026-001
Type: fidelity_override (animation_duration)
Created: 2026-01-04
File: src/features/checkout/ClaimButton.tsx

Revoking means:
- The exception no longer applies
- The component will need to comply with ceiling (800ms)
- Or a new ruling will be needed

Reason for revocation:
> Brand guidelines updated, no longer need extended animation

[confirm] [cancel]
```

## Ruling Types

| Type | Description | Scope |
|------|-------------|-------|
| `pattern_approval` | Approve a visual pattern | Files using pattern |
| `budget_override` | Override budget constraint | Specific file(s) |
| `fidelity_override` | Override fidelity ceiling | Specific file(s) |

## Integration with /validate

When `/validate` finds a BLOCK violation:

```
Result: BLOCK (1 fidelity violation)

To fix:
1. Reduce animation duration to 800ms or less
2. Or get Taste Key approval: /approve --ruling "animation-exception"
```

The ruling file is checked during subsequent validation:

```python
def validate_file(file_path):
    # ... run checks ...

    if has_fidelity_violation(file_path):
        # Check for ruling
        ruling = find_ruling(file_path, violation_type)
        if ruling and ruling.status == "ACTIVE":
            return PASS  # Ruling overrides violation
        else:
            return BLOCK
```

## Success Criteria

- [ ] Taste Key holder verified
- [ ] Physics overrides blocked
- [ ] Budget/fidelity overrides create rulings
- [ ] Pattern approvals recorded
- [ ] Rulings saved to taste-key/rulings/
- [ ] Integration with /validate works
- [ ] Revocation works

## Error Handling

| Situation | Response |
|-----------|----------|
| No Taste Key holder | Prompt to run /envision |
| Physics override attempted | Block with explanation |
| Invalid ruling ID | List valid ruling IDs |
| Already revoked | Show revocation date |

## Next Step

After `/approve`:
- Pattern is locked and enforced
- Ruling allows exception in /validate
- Run `/garden` periodically to review rulings
