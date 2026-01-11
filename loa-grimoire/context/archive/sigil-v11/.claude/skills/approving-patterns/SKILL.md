# Sigil Agent: Approving Patterns

> "Quality doesn't come from committees. It comes from individuals with taste."

## Role

**Taste Owner** — Dictates visual and vibe decisions. Does NOT poll. Signs off on patterns.

## Commands

```
/approve [pattern]         # Sign off on pattern
/approve --list            # List pending approvals
/approve --history         # Show approval history
/approve --challenge [id]  # Challenge an integrity change
```

## Outputs

| Path | Description |
|------|-------------|
| `sigil-mark/governance/taste-owners.yaml` | Approval records |

## The Taste Owner Protocol

This is the "Dictatorship of Craft" model:

| Committees Decide | Taste Owners Dictate |
|-------------------|----------------------|
| "Should we build X?" | "What color is X?" |
| "Ship this feature?" | "How bouncy is the animation?" |
| Major direction | Every visual detail |

**Taste Owners are named individuals, not anonymous voters.**

## Workflow

### Pattern Approval

```
/approve "Primary button style"

🎨 Pattern Approval Request

Pattern: Primary button style
Scope: **/Button.tsx, **/PrimaryButton.tsx

Current implementation:
┌─────────────────────────────────────────┐
│ bg-blue-600 hover:bg-blue-700           │
│ shadow-md hover:shadow-lg               │
│ transition-all duration-300             │
│ spring easing                           │
│ rounded-lg                              │
└─────────────────────────────────────────┘

Material: clay ✓
Physics: spring motion ✓
Fidelity: within ceiling ✓
Zone compliance: all zones ✓

As Taste Owner, do you approve this pattern?

[approve] [reject] [modify]
```

### Approval Record

When approved:
```yaml
# Added to sigil-mark/governance/taste-owners.yaml

approvals:
  - id: "APPR-2025-001"
    pattern: "Primary button style"
    scope: "**/Button.tsx"
    approved_by: "@taste-owner"
    approved_at: "2025-01-15T10:30:00Z"
    material: "clay"
    notes: "Blue gradient with spring animation"
    locked: true  # Cannot be changed without explicit unlock
```

### Rejection

When rejected:
```
/approve "Animated card hover"

🎨 Pattern Approval Request

Pattern: Animated card hover
Current: 3D rotate on hover

❌ REJECTED

Reason: "3D transforms violate fidelity ceiling. Use lift instead."

Suggested modification:
- Remove: transform: rotateY(5deg)
- Add: transform: translateY(-4px)
- Add: box-shadow increase

Re-submit after modification.
```

### Challenge Period

For integrity changes (auto-deployed):

```
/approve --challenge INTG-001

⚠️ Challenge: INTG-001

Change: "Fixed button alignment"
Deployed: 2 hours ago
Claimed as: Integrity (no poll needed)

Review the change:
- Modified: src/components/Button.tsx
- Diff: [show diff]

Is this truly Integrity or is it Content?

INTEGRITY criteria:
- Bug fix with no visual change
- Performance improvement
- Security patch
- Accessibility fix

CONTENT criteria:
- New visual element
- Changed animation
- Layout change
- New feature

Your judgment: [integrity] [content]
```

If challenged as Content:
```
❌ CHALLENGE UPHELD

Change INTG-001 has been REVERTED.

Reason: Taste Owner ruled this as Content, not Integrity.

The change must now go through:
1. Taste Owner approval, OR
2. Greenlight poll (if major)

Deployer trust score: 90 → 80 (-10)
```

## Authority Scope

Taste Owners have absolute authority over:

```yaml
visual_authority:
  - "Colors and palettes"
  - "Typography choices"
  - "Animation timing and easing"
  - "Border radius and spacing"
  - "Shadow depth and style"
  - "Icon style and weight"
  - "Motion style"
  - "Component aesthetics"
  - "Interaction feel"
  - "Micro-interactions"
  - "Loading states"
  - "Error states"
  - "Empty states"
```

Taste Owners do NOT control:

```yaml
requires_poll:
  - "New major features"
  - "Feature removal"
  - "Product direction"
  - "Pricing changes"
```

## Trust Score System

```yaml
trust_score:
  initial: 100
  
  events:
    false_integrity_claim: -10
    successful_integrity: +1
    approved_pattern_reverted: -5
    
  thresholds:
    can_deploy: 50
    can_approve: 70
    full_authority: 90
```

## Bulk Approval

For reviewing multiple patterns:

```
/approve --list

Pending Approvals:

1. [PENDING] Card shadow system
   Scope: **/Card.tsx
   Submitted: 2 days ago
   
2. [PENDING] Modal backdrop blur
   Scope: **/Modal.tsx
   Submitted: 1 day ago
   
3. [PENDING] Toast animation
   Scope: **/Toast.tsx
   Submitted: today

Review all? [1/2/3/all/skip]
```

## Locked Patterns

Approved patterns are LOCKED. To modify:

```
/approve --unlock "Primary button style"

⚠️ UNLOCK REQUEST

Pattern: Primary button style
Approved: 2025-01-15
By: @taste-owner

Unlocking allows modification but:
- Requires re-approval after changes
- Logs the unlock event
- Notifies original approver

Reason for unlock:
> Brand refresh requires color change

[unlock] [cancel]
```

## Integration with /craft

When `/craft` generates a component:

1. Check if pattern exists in approvals
2. If approved: use approved pattern
3. If not approved: generate and flag for review

```python
def check_approval(component_type, zone):
    approvals = load_approvals()
    
    for approval in approvals:
        if matches(component_type, approval.scope):
            return {
                "approved": True,
                "pattern": approval.pattern,
                "use_this": approval.implementation
            }
    
    return {
        "approved": False,
        "requires_review": True
    }
```

## Success Criteria

- [ ] Taste Owners are registered
- [ ] Approval workflow works
- [ ] Challenge period enforced
- [ ] Locked patterns protected
- [ ] Trust scores tracked

## Next Step

After `/approve`: Pattern is locked and enforced across codebase.
