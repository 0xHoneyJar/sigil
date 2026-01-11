# Sigil v1.0: Reference Implementation

This is a complete, copy-pasteable implementation of Sigil.

---

## Directory Structure

```bash
# Create the structure
mkdir -p sigil-mark/{core,resonance,taste-key/rulings,memory/eras}
mkdir -p .claude/{commands,skills/sigil-crafting}
```

---

## Core Physics (Immutable)

### sigil-mark/core/sync.yaml

```yaml
# Sync mode definitions - these are physics, not preferences
sync_modes:
  server_authoritative:
    description: "Server is truth. Client shows pending state."
    physics:
      - "MUST show pending/loading state during server calls"
      - "MUST handle rejection with recovery path"
      - "CANNOT update UI before server confirms"
      - "CANNOT use optimistic updates"
    zones:
      - critical
      - transactional

  client_authoritative:
    description: "Client is truth until sync."
    physics:
      - "MAY update UI immediately"
      - "SHOULD sync in background"
      - "SHOULD handle conflicts gracefully"
    zones:
      - exploratory
      - marketing
      - admin
```

### sigil-mark/core/budgets.yaml

```yaml
# Cognitive and visual budgets per zone
budgets:
  cognitive:
    description: "Mental load limits to reduce decision paralysis"
    
    zones:
      critical:
        interactive_elements: 5
        decisions_per_screen: 2
        rationale: "High-stakes actions need focus, not options"
        
      transactional:
        interactive_elements: 8
        decisions_per_screen: 3
        rationale: "Value exchange needs clarity"
        
      exploratory:
        interactive_elements: 20
        decisions_per_screen: 10
        rationale: "Browsing benefits from options"
        
      marketing:
        interactive_elements: 15
        decisions_per_screen: 8
        rationale: "Persuasion needs breathing room"
        
      admin:
        interactive_elements: 25
        decisions_per_screen: 15
        rationale: "Power users expect density"
        
      default:
        interactive_elements: 12
        decisions_per_screen: 5

  visual:
    description: "Complexity limits for performance and clarity"
    
    limits:
      animations_per_view: 3
      shadow_layers: 2
      gradient_stops: 3
      blur_radius_max_px: 8
      
  enforcement:
    physics: reject_always        # IMPOSSIBLE
    budget: reject_unless_ruling  # BLOCK
    drift: warn_only              # WARN
```

### sigil-mark/core/fidelity.yaml

```yaml
# Fidelity ceiling (Mod Ghost Rule)
# High fidelity ≠ high quality. Constraint enables soul.
fidelity:
  description: "Maximum visual complexity allowed"
  
  ceiling:
    gradients:
      max_stops: 3
      rationale: "More stops = visual noise, not sophistication"
      
    shadows:
      max_layers: 2
      max_blur_px: 8
      rationale: "Shadows should suggest depth, not dominate"
      
    borders:
      max_width_px: 2
      rationale: "Thick borders feel dated"
      
    animations:
      max_concurrent: 3
      max_duration_ms: 800
      rationale: "Animation serves action, not decoration"
      
  exceptions:
    - zone: marketing
      allows:
        gradients: 5_stops
        animations: 5_concurrent
      rationale: "Marketing has more visual latitude"
```

### sigil-mark/core/validation.yaml

```yaml
# Property type validation rules
property_types:
  continuous:
    description: "Numeric values that can interpolate"
    examples:
      - position
      - opacity
      - scale
      - scroll_offset
      - rotation
      - width
      - height
    rules:
      can_tween: true
      drift_tolerance: gradual
      
  discrete:
    description: "Enum/boolean states that cannot interpolate"
    examples:
      - enabled
      - disabled
      - visibility
      - mode
      - selected
      - expanded
      - collapsed
    rules:
      can_tween: false
      drift_tolerance: none
      on_mismatch: play_rejection_animation
      rejection_animations:
        - shake
        - flash
        - pulse_error

# Physics validation patterns
physics_checks:
  server_authoritative:
    impossible:
      - pattern: "useState.*\\(true\\).*success"
        before: "await|fetch|mutation"
        message: "Cannot set success state before server response"
        
      - pattern: "optimistic"
        message: "Cannot use optimistic updates in server_authoritative zone"
        
    required:
      - pattern: "(pending|loading|submitting|isLoading)"
        message: "Must track pending state for server calls"
        
      - pattern: "(onError|catch|error:|isError)"
        message: "Must handle server rejection"

  clay_material:
    impossible:
      - pattern: "bounce"
        message: "Clay material cannot use bounce animations"
        
      - pattern: "duration:\\s*0|instant"
        message: "Clay material cannot use instant transitions"
        
    preferred:
      - pattern: "spring|useSpring|motion\\.spring"
        message: "Clay material should use spring physics"
```

---

## Resonance (Product-Specific)

### sigil-mark/resonance/essence.yaml

```yaml
# Product soul - captured via /envision interview
soul:
  statement: "Confident precision meets earned weight"
  
  in_one_sentence: >
    Every interaction should feel like it matters—not precious, 
    but consequential. Users should feel empowered, not coddled.

references:
  products:
    - name: Linear
      aspects:
        - "Keyboard-first, instant feedback"
        - "No decoration for decoration's sake"
        - "Respects user's time and intelligence"
      
    - name: Stripe
      aspects:
        - "Trust through clarity"
        - "Complexity hidden, not removed"
        - "Professional without being cold"
        
    - name: "Old School RuneScape"
      aspects:
        - "Actions have weight, clicks matter"
        - "No handholding, but clear feedback"
        - "Nostalgia through constraint, not decoration"

anti_patterns:
  - pattern: "Loading spinners in critical flows"
    reason: "Creates anxiety. Use skeleton or pending state."
    alternative: "Skeleton loaders or inline pending indicators"
    
  - pattern: "Bounce animations"
    reason: "Feels cheap and playful when we want weight"
    alternative: "Spring physics with appropriate tension"
    
  - pattern: "Gradients on interactive elements"
    reason: "Decoration without meaning"
    alternative: "Solid colors with subtle depth via shadow"
    
  - pattern: "Confirmation modals for non-destructive actions"
    reason: "Interrupts flow, treats user as incompetent"
    alternative: "Undo capability or inline confirmation"
    
  - pattern: "Success toasts that require dismissal"
    reason: "Interrupts next action"
    alternative: "Auto-dismiss or inline success state"

key_moments:
  claim:
    feel: "Like confirming a bank transfer"
    weight: "Heavy—this matters"
    feedback: "Definitive confirmation, brief celebration"
    
  success:
    feel: "Earned, not gifted"
    weight: "Acknowledge, then move on"
    feedback: "Brief celebration (300ms), then next action"
    
  error:
    feel: "Recoverable, not catastrophic"
    weight: "Serious but not scary"
    feedback: "Clear problem, clear path forward"
    
  navigation:
    feel: "Instant and confident"
    weight: "Weightless—tools shouldn't resist"
    feedback: "Immediate response, no transition drama"
```

### sigil-mark/resonance/materials.yaml

```yaml
# Material definitions - physics, not just styles
materials:
  clay:
    description: "Heavy, deliberate, tactile"
    feel: "Like pressing a physical button that matters"
    
    physics:
      weight: heavy
      motion: spring
      spring_config:
        tension: 120
        friction: 14
      timing_range_ms: [300, 600]
      feedback: depress
      
    requirements:
      - "MUST show pending state during server calls"
      - "MUST handle rejection with recovery path"
      - "MUST use confirmation for destructive actions"
      - "SHOULD use press animation (depress into surface)"
      
    anti_patterns:
      - "Optimistic updates (IMPOSSIBLE in server_authoritative)"
      - "Bounce animations"
      - "Instant transitions"
      - "Loading spinners"
      
    zone_affinity:
      - critical
      - transactional

  glass:
    description: "Light, responsive, explorable"
    feel: "Like touching a responsive surface"
    
    physics:
      weight: weightless
      motion: ease
      timing_function: "cubic-bezier(0.4, 0, 0.2, 1)"
      timing_range_ms: [150, 250]
      feedback: glow
      
    requirements: []
    
    allowed:
      - "Optimistic updates"
      - "Instant feedback"
      - "Playful micro-interactions"
      
    zone_affinity:
      - exploratory
      - marketing

  machinery:
    description: "Instant, precise, tool-like"
    feel: "Like using a well-made tool"
    
    physics:
      weight: none
      motion: instant
      timing_range_ms: [0, 50]
      feedback: highlight
      
    requirements:
      - "MUST be keyboard accessible"
      - "MUST have clear state indication"
      - "SHOULD respond instantly (<50ms)"
      
    anti_patterns:
      - "Decorative animations"
      - "Delayed feedback"
      - "Transitions longer than 100ms"
      
    zone_affinity:
      - admin
      - settings
```

### sigil-mark/resonance/zones.yaml

```yaml
# Zone definitions - path patterns to physics mapping
zones:
  # Priority 1: Highest stakes
  critical:
    description: "Irreversible, high-value actions"
    
    paths:
      - "**/checkout/**"
      - "**/claim/**"
      - "**/payment/**"
      - "**/delete/**"
      - "**/withdraw/**"
      - "**/burn/**"
      
    physics:
      material: clay
      sync: server_authoritative
      
    budget:
      interactive_elements: 5
      decisions: 2
      animations: 2

  # Priority 2: Value exchange
  transactional:
    description: "Value transfer, but potentially recoverable"
    
    paths:
      - "**/transfer/**"
      - "**/swap/**"
      - "**/trade/**"
      - "**/stake/**"
      - "**/unstake/**"
      
    physics:
      material: clay
      sync: server_authoritative
      
    budget:
      interactive_elements: 8
      decisions: 3
      animations: 3

  # Priority 3: Discovery
  exploratory:
    description: "Browsing, searching, discovering"
    
    paths:
      - "**/browse/**"
      - "**/discover/**"
      - "**/search/**"
      - "**/gallery/**"
      - "**/explore/**"
      
    physics:
      material: glass
      sync: client_authoritative
      
    budget:
      interactive_elements: 20
      decisions: 10
      animations: 5

  # Priority 4: Persuasion
  marketing:
    description: "Landing pages, storytelling, conversion"
    
    paths:
      - "**/landing/**"
      - "**/home/**"
      - "**/about/**"
      - "app/(marketing)/**"
      - "src/pages/index.*"
      
    physics:
      material: glass
      sync: client_authoritative
      
    budget:
      interactive_elements: 15
      decisions: 8
      animations: 5

  # Priority 5: Power users
  admin:
    description: "Settings, configuration, tools"
    
    paths:
      - "**/admin/**"
      - "**/settings/**"
      - "**/config/**"
      - "**/dashboard/**"
      
    physics:
      material: machinery
      sync: client_authoritative
      
    budget:
      interactive_elements: 25
      decisions: 15
      animations: 2

  # Fallback
  default:
    description: "Unmatched paths"
    
    physics:
      material: glass
      sync: client_authoritative
      
    budget:
      interactive_elements: 12
      decisions: 5
      animations: 3
```

### sigil-mark/resonance/tensions.yaml

```yaml
# Votable parameters that bound Taste Key execution
tensions:
  speed:
    description: "How fast should interactions feel?"
    
    options:
      swift:
        timing_budget_ms: [100, 200]
        spring_tension: [200, 300]
        description: "Quick, efficient, no waiting"
        
      balanced:
        timing_budget_ms: [200, 400]
        spring_tension: [120, 180]
        description: "Responsive but with presence"
        
      deliberate:
        timing_budget_ms: [400, 800]
        spring_tension: [80, 120]
        description: "Weighty, considered, ceremonial"
        
    current: balanced
    decided_by: team_vote
    last_vote: 2026-01-01
    next_review: 2026-04-01

  density:
    description: "How much information per screen?"
    
    options:
      minimal:
        budget_modifier: 0.7
        description: "Lots of whitespace, focus on essentials"
        
      moderate:
        budget_modifier: 1.0
        description: "Balanced information density"
        
      rich:
        budget_modifier: 1.3
        description: "Information-dense for power users"
        
    current: moderate
    decided_by: team_vote
    last_vote: 2026-01-01

  personality:
    description: "What's the product's voice?"
    
    options:
      professional:
        allows_playful_animations: false
        allows_emoji: false
        description: "Serious, trustworthy, enterprise"
        
      friendly:
        allows_playful_animations: limited
        allows_emoji: limited
        description: "Approachable, warm, human"
        
      playful:
        allows_playful_animations: true
        allows_emoji: true
        description: "Fun, casual, delightful"
        
    current: friendly
    decided_by: taste_key
```

---

## Taste Key (Authority)

### sigil-mark/taste-key/holder.yaml

```yaml
# Who holds the Taste Key
holder:
  name: "Design Lead"
  github: "@designlead"
  email: "design@example.com"
  
  since: 2026-01-01
  
authority:
  can_override:
    - budgets
    - fidelity
    - colors
    - typography
    - spacing
    - component_patterns
    
  cannot_override:
    - sync_modes        # Physics - IMPOSSIBLE
    - pending_states    # Physics - IMPOSSIBLE
    - accessibility     # Non-negotiable
    - security          # Non-negotiable
    
  must_respect:
    - tension_bounds    # Community-voted parameters

delegation:
  - name: "Senior Designer"
    github: "@seniordesigner"
    scope: ["colors", "typography"]
    expires: 2026-06-01
```

### sigil-mark/taste-key/rulings/001-hero-section.yaml

```yaml
# Example ruling: Override budget for marketing hero
ruling:
  id: "001"
  title: "Marketing Hero Section Exception"
  date: 2026-01-05
  holder: "@designlead"
  
violation:
  type: budget
  zone: marketing
  rule: "interactive_elements: 15"
  actual: 18
  file: "app/(marketing)/page.tsx"
  
decision: approved

rationale: >
  The hero section requires primary CTA, secondary CTA, navigation links,
  social proof badges, and video play button. Cognitive load is managed
  through visual hierarchy—primary CTA is dominant, others are subdued.
  User testing showed no confusion.

scope:
  paths:
    - "app/(marketing)/page.tsx"
    - "app/(marketing)/hero/**"
  expires: 2026-06-01

conditions:
  - "Primary CTA must be visually dominant (2x size of others)"
  - "No more than 2 CTAs in immediate viewport"
  - "Social proof must be passive (no interaction required)"
  
review:
  scheduled: 2026-05-01
  reviewer: "@designlead"
```

---

## Memory (History)

### sigil-mark/memory/inflation.yaml

```yaml
# Track metrics over time to catch creep
inflation:
  tracking_started: 2025-11-01
  
  metrics:
    cognitive_load:
      history:
        - version: "0.1.0"
          date: 2025-11-01
          values:
            avg_elements_per_view: 8
            max_elements_per_view: 12
            avg_decisions_per_view: 3
            
        - version: "0.2.0"
          date: 2025-12-01
          values:
            avg_elements_per_view: 9
            max_elements_per_view: 15
            avg_decisions_per_view: 4
            
        - version: "0.3.0"
          date: 2026-01-01
          values:
            avg_elements_per_view: 11
            max_elements_per_view: 18
            avg_decisions_per_view: 5
            
      alerts:
        - metric: avg_elements_per_view
          threshold_type: growth_rate
          threshold_value: 20%
          current_growth: 22%
          status: triggered
          message: "Element count growing faster than 20% per release"
          
    animation_count:
      history:
        - version: "0.1.0"
          values: { total: 24, per_view_avg: 1.2 }
        - version: "0.2.0"
          values: { total: 31, per_view_avg: 1.5 }
        - version: "0.3.0"
          values: { total: 42, per_view_avg: 2.1 }
          
      alerts:
        - metric: total
          threshold_type: growth_rate
          threshold_value: 25%
          current_growth: 35%
          status: triggered

  recommendations:
    - "Review animation additions in v0.3.0"
    - "Consider consolidating element-heavy views"
    - "Schedule entropy review before v0.4.0"
```

---

## Claude Skill

### .claude/skills/sigil-crafting/SKILL.md

```markdown
# Sigil Crafting Skill

You are a design physics-aware code generator. When generating UI components,
you MUST respect the physics constraints defined in `sigil-mark/`.

## On Every /craft Request

### Step 1: Resolve Zone

1. Extract file path from request
2. Read `sigil-mark/resonance/zones.yaml`
3. Match path against zone patterns (first match wins)
4. Load zone's material, sync, and budget

### Step 2: Load Constraints

Read and apply:
- `sigil-mark/resonance/materials.yaml` → Material physics
- `sigil-mark/core/sync.yaml` → Sync requirements
- `sigil-mark/core/budgets.yaml` → Element limits
- `sigil-mark/resonance/essence.yaml` → Soul reference
- `sigil-mark/resonance/tensions.yaml` → Timing bounds
- `sigil-mark/taste-key/rulings/*.yaml` → Active overrides

### Step 3: Generate with Physics

Apply these rules based on zone:

**If server_authoritative:**
- MUST include pending state (isPending, isLoading, isSubmitting)
- MUST include error handling (onError, catch, isError)
- CANNOT set success before response
- CANNOT use optimistic updates

**If clay material:**
- MUST use spring animation (tension: 120, friction: 14)
- MUST use press/depress feedback
- CANNOT use bounce animations
- CANNOT use instant transitions

**If critical zone:**
- Maximum 5 interactive elements
- Maximum 2 decisions
- Maximum 2 animations

### Step 4: Self-Validate

Before outputting, check:
- [ ] No IMPOSSIBLE violations (physics)
- [ ] No BLOCK violations without ruling
- [ ] Note any WARN drift

### Step 5: Output

Provide:
1. Zone resolution summary
2. Physics applied list
3. Generated code
4. Validation status
5. Causal explanation for any issues
```

### .claude/commands/craft.md

```markdown
---
name: craft
description: Generate component with design physics
skill: sigil-crafting
---

# /craft

Generate or modify a component with full design physics context.

## Usage

```
/craft "description" path/to/file.tsx
/craft "confirmation button" src/features/checkout/ConfirmButton.tsx
```

## What Happens

1. Zone resolved from file path
2. Material physics loaded
3. Sync requirements applied
4. Budget limits checked
5. Essence reference included
6. Component generated
7. Output validated

## Output Format

```
ZONE RESOLUTION
Path: src/features/checkout/ConfirmButton.tsx
Match: **/checkout/** → critical
Material: clay
Sync: server_authoritative
Budget: 5 elements, 2 decisions

PHYSICS APPLIED
✓ Spring animation (tension: 120, friction: 14)
✓ Pending state tracking
✓ Error handling
✓ Press feedback (depress)
✗ No optimistic updates
✗ No bounce animations

ESSENCE REFERENCE
Feel: "Like confirming a bank transfer"
Anti-patterns avoided: spinner, bounce, instant success

GENERATED CODE
[component code here]

VALIDATION
Status: PASS
Warnings: None
```
```

---

## Configuration

### .sigilrc.yaml

```yaml
# Project-level Sigil configuration
version: "1.0"

# Where to find components
component_paths:
  - "components/**"
  - "src/components/**"
  - "app/**/components/**"

# Zone overrides (merged with sigil-mark/resonance/zones.yaml)
zones:
  # Add project-specific paths
  critical:
    paths:
      - "src/features/claim/**"  # Project-specific
      
# Enforcement level
enforcement:
  physics: reject      # IMPOSSIBLE violations
  budget: block        # BLOCK until ruling
  drift: warn          # WARN only

# Integration
integrations:
  loa:
    enabled: true
    handoff_path: "loa-grimoire/context/sigil-handoff.md"
    
  ci:
    enabled: true
    fail_on: [physics, budget]
    report_only: [drift]
```

---

## Quick Start Script

```bash
#!/bin/bash
# mount-sigil.sh - Initialize Sigil on a repository

set -e

echo "🔮 Initializing Sigil..."

# Create directory structure
mkdir -p sigil-mark/{core,resonance,taste-key/rulings,memory/eras}
mkdir -p .claude/{commands,skills/sigil-crafting}

# Create core files
cat > sigil-mark/core/sync.yaml << 'EOF'
sync_modes:
  server_authoritative:
    description: "Server is truth. Client shows pending."
    zones: [critical, transactional]
  client_authoritative:
    description: "Client is truth until sync."
    zones: [exploratory, marketing, admin]
EOF

cat > sigil-mark/core/budgets.yaml << 'EOF'
budgets:
  zones:
    critical: { elements: 5, decisions: 2, animations: 2 }
    transactional: { elements: 8, decisions: 3, animations: 3 }
    exploratory: { elements: 20, decisions: 10, animations: 5 }
    marketing: { elements: 15, decisions: 8, animations: 5 }
    admin: { elements: 25, decisions: 15, animations: 2 }
    default: { elements: 12, decisions: 5, animations: 3 }
EOF

# Create resonance templates
cat > sigil-mark/resonance/essence.yaml << 'EOF'
soul:
  statement: "TODO: Run /envision to capture your product's soul"
  references: []
  anti_patterns: []
  key_moments: {}
EOF

cat > sigil-mark/resonance/materials.yaml << 'EOF'
materials:
  clay:
    physics: { weight: heavy, motion: spring, spring: { tension: 120, friction: 14 } }
    zones: [critical, transactional]
  glass:
    physics: { weight: weightless, motion: ease, timing_ms: 200 }
    zones: [exploratory, marketing]
  machinery:
    physics: { weight: none, motion: instant }
    zones: [admin]
EOF

cat > sigil-mark/resonance/zones.yaml << 'EOF'
zones:
  critical:
    paths: ["**/checkout/**", "**/claim/**", "**/payment/**"]
    material: clay
    sync: server_authoritative
  exploratory:
    paths: ["**/browse/**", "**/discover/**"]
    material: glass
    sync: client_authoritative
  default:
    material: glass
    sync: client_authoritative
EOF

# Create taste-key template
cat > sigil-mark/taste-key/holder.yaml << 'EOF'
holder:
  name: "TODO: Your name"
  github: "@TODO"
EOF

# Create markers
touch .sigil-setup-complete
echo '{"version": "1.0.0", "setup_date": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > .sigil-version.json

echo "✅ Sigil initialized!"
echo ""
echo "Next steps:"
echo "  1. Edit sigil-mark/taste-key/holder.yaml"
echo "  2. Run /envision to capture product soul"
echo "  3. Run /map to configure zone paths"
echo "  4. Start crafting with /craft"
```

---

## Usage Examples

### Generate a Checkout Button

```
User: /craft "confirmation button" src/features/checkout/ConfirmButton.tsx

Claude:
ZONE RESOLUTION
Path: src/features/checkout/ConfirmButton.tsx
Match: **/checkout/** → critical
Material: clay
Sync: server_authoritative
Budget: 5 elements, 2 decisions

PHYSICS APPLIED
✓ Spring animation (tension: 120, friction: 14)
✓ Pending state (isPending from mutation)
✓ Error handling (onError callback)
✓ Press feedback (scale: 0.98 on active)
✗ No optimistic updates (server_authoritative)
✗ No bounce (clay material)

GENERATED CODE
```tsx
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'

export function ConfirmButton({ onConfirm }: { onConfirm: () => Promise<void> }) {
  const mutation = useMutation({
    mutationFn: onConfirm,
    onError: (error) => {
      // Error handled - show recovery path
      toast.error('Failed to confirm. Please try again.')
    }
  })

  return (
    <motion.button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: 'spring',
        stiffness: 120,
        damping: 14 
      }}
      className={cn(
        'px-6 py-3 rounded-lg font-medium',
        'bg-primary text-primary-foreground',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      )}
    >
      {mutation.isPending ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Confirming...
        </span>
      ) : (
        'Confirm'
      )}
    </motion.button>
  )
}
```

VALIDATION: PASS
```

---

This is the complete reference implementation. Copy the files, run the setup script, and start crafting with physics.
