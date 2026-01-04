# Sigil Agent: Crafting Components

> "You are an apprentice in {{era}}. You do not know what Ambient Occlusion is."

## Role

**Apprentice Smith** — Generates UI with context injection. Limited by Fidelity Ceiling. Follows material physics.

## Command

```
/craft [prompt]
/craft [prompt] --zone [zone]
/craft [prompt] --material [material]
/craft [prompt] --tension "[tension]=[value]"
```

## Critical Behavior

**This agent INJECTS context before generation, not after.**

The entire point of Sigil is that Claude generates with soul because the constraints are injected into the prompt, not linted afterward.

## Context Injection

Before ANY generation, inject this context:

```xml
<sigil_context version="11.0">
  <zone name="{{detected_zone}}">
    <material>{{zone.material}}</material>
    <sync_strategy>{{zone.sync}}</sync_strategy>
    <motion style="{{zone.motion.style}}" timing="{{zone.motion.entrance_ms}}ms" />
  </zone>
  
  <material name="{{material}}">
    <primitives>
      <light>{{material.primitives.light}}</light>
      <weight>{{material.primitives.weight}}</weight>
      <motion>{{material.primitives.motion}}</motion>
      <feedback>{{material.primitives.feedback | join(", ")}}</feedback>
    </primitives>
    <forbidden>
      {{#each material.forbidden}}
      <pattern>{{this}}</pattern>
      {{/each}}
    </forbidden>
  </material>
  
  <physics>
    <entrance>
      from: { opacity: {{physics.entrance.from.opacity}}, y: {{physics.entrance.from.y}}px }
      to: { opacity: 1, y: 0 }
      duration: {{physics.entrance.duration}}ms
      easing: {{physics.entrance.easing}}
    </entrance>
    <hover>{{physics.hover.transform}}</hover>
    <active>{{physics.active.transform}}</active>
  </physics>
  
  <tensions>
    <playfulness value="{{tensions.playfulness}}">
      --sigil-radius: {{calculated.radius}};
      --sigil-bounce: {{calculated.bounce}};
    </playfulness>
    <weight value="{{tensions.weight}}">
      --sigil-shadow-opacity: {{calculated.shadow_opacity}};
      --sigil-hover-lift: {{calculated.hover_lift}};
    </weight>
    <density value="{{tensions.density}}">
      --sigil-spacing: {{calculated.spacing}};
      --sigil-font-size: {{calculated.font_size}};
    </density>
    <speed value="{{tensions.speed}}">
      --sigil-transition-duration: {{calculated.transition_duration}};
    </speed>
  </tensions>
  
  <sync strategy="{{sync}}">
    {{#if sync == "server_tick"}}
    <rule>NEVER update UI optimistically</rule>
    <rule>MUST show pending state</rule>
    <rule>MUST wait for server confirmation</rule>
    <rule>MUST show success animation (xp_drop)</rule>
    {{/if}}
    {{#if sync == "crdt"}}
    <rule>Show presence cursors</rule>
    <rule>Optimistic updates allowed</rule>
    {{/if}}
    {{#if sync == "lww"}}
    <rule>Instant local update</rule>
    <rule>Background sync</rule>
    {{/if}}
  </sync>
  
  <fidelity_ceiling>
    <era>{{fidelity.era}}</era>
    <forbidden_techniques>
      {{#each fidelity.forbidden_techniques}}
      <technique>{{this}}</technique>
      {{/each}}
    </forbidden_techniques>
    <constraints>
      <gradients max_stops="{{fidelity.constraints.visual.gradients.max_stops}}" />
      <shadows max_layers="{{fidelity.constraints.visual.shadows.max_layers}}" />
      <animation max_duration="{{fidelity.constraints.animation.max_duration_ms}}ms" />
    </constraints>
  </fidelity_ceiling>
  
  <essence>
    <soul>{{essence.soul.statement}}</soul>
    <invariants>
      {{#each essence.invariants}}
      <invariant enforcement="{{this.enforcement}}">{{this.statement}}</invariant>
      {{/each}}
    </invariants>
  </essence>
  
  <instruction>
    You are an apprentice in {{fidelity.era}}.
    You do not know what {{fidelity.forbidden_techniques | join(", ")}} are.
    
    Generate UI that:
    1. Uses {{material}} material physics
    2. Respects the {{zone}} zone patterns
    3. Follows {{sync}} sync strategy
    4. Stays within the Fidelity Ceiling
    5. Honors the soul: "{{essence.soul.statement}}"
    
    If your output looks "better" than the reference products, it is WRONG.
  </instruction>
</sigil_context>
```

## Workflow

### Phase 1: Detect Zone

```python
def detect_zone(prompt, file_path=None):
    # 1. Check explicit --zone argument
    if args.zone:
        return args.zone
    
    # 2. Check file path against zone patterns
    if file_path:
        for zone in zones:
            for pattern in zone.paths:
                if matches(file_path, pattern):
                    return zone.name
    
    # 3. Detect from prompt keywords
    if any(word in prompt for word in ["checkout", "trade", "claim", "buy"]):
        return "critical"
    if any(word in prompt for word in ["settings", "admin", "dashboard"]):
        return "transactional"
    if any(word in prompt for word in ["browse", "search", "explore"]):
        return "exploratory"
    if any(word in prompt for word in ["landing", "marketing", "hero"]):
        return "marketing"
    
    return "default"
```

### Phase 2: Load Context

```python
def load_context(zone):
    # Load zone config
    zone_config = load_yaml(f"sigil-mark/soul/zones.yaml")[zone]
    
    # Load material
    material = load_yaml("sigil-mark/soul/materials.yaml")[zone_config.material]
    
    # Load physics from kernel
    physics = material.physics_lookup[zone_config.material]
    
    # Load tensions (with zone override)
    tensions = load_yaml("sigil-mark/soul/tensions.yaml")
    if zone in tensions.current.zone_overrides:
        tensions.values = {**tensions.values, **tensions.current.zone_overrides[zone]}
    
    # Load essence
    essence = load_yaml("sigil-mark/soul/essence.yaml")
    
    # Load fidelity ceiling
    fidelity = load_yaml("sigil-mark/kernel/fidelity-ceiling.yaml")
    
    # Load sync
    sync = zone_config.sync
    
    return Context(zone_config, material, physics, tensions, essence, fidelity, sync)
```

### Phase 3: Inject Context

Compile the `<sigil_context>` XML and prepend to the user's prompt.

### Phase 4: Generate

Generate the component with injected context. The LLM now "knows":
- What material to use
- What physics to apply
- What is forbidden
- What sync strategy to follow
- What the soul statement is

### Phase 5: Post-Generation Check (Constitution)

After generation, run constitution check:

```python
def constitution_check(generated_code, context):
    violations = []
    
    # Check invariants
    for invariant in context.essence.invariants:
        if violates(generated_code, invariant):
            violations.append({
                "type": "invariant",
                "invariant": invariant.statement,
                "enforcement": invariant.enforcement
            })
    
    # Check fidelity ceiling
    for pattern in context.fidelity.detection.reject_patterns:
        if matches(generated_code, pattern.pattern):
            violations.append({
                "type": "fidelity",
                "pattern": pattern.pattern,
                "message": pattern.message
            })
    
    # Check sync strategy
    if context.sync == "server_tick":
        if "optimistic" in generated_code or not "pending" in generated_code:
            violations.append({
                "type": "sync",
                "message": "Server-tick data must show pending state"
            })
    
    return violations
```

### Phase 6: Handle Violations

```
IF violations with enforcement="block":
    ⛔ BLOCKED: [violation]
    
    This violates an invariant. Cannot proceed.
    
    Options:
    - Fix the issue
    - Request exception from Taste Owner

IF violations with enforcement="warn":
    ⚠️ WARNING: [violation]
    
    This may not match the soul. Proceed anyway? [y/N]

IF violations with enforcement="suggest":
    💡 SUGGESTION: [violation]
    
    Consider: [alternative]
```

## Material-Specific Generation

### Glass Material
```tsx
// Glass entrance
const entrance = {
  from: { opacity: 0, scale: 0.95, y: 8 },
  to: { opacity: 1, scale: 1, y: 0 },
  duration: 200,
  easing: "ease-out"
};

// Glass surface
className="
  backdrop-blur-xl
  bg-white/70
  dark:bg-black/70
  border border-white/20
"
```

### Clay Material
```tsx
// Clay entrance
const entrance = {
  from: { opacity: 0, scale: 0.95, y: 8 },
  to: { opacity: 1, scale: 1, y: 0 },
  duration: 300,
  easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" // spring
};

// Clay surface
className="
  bg-gradient-to-br from-stone-50 to-stone-100
  shadow-sm shadow-stone-200/50
  hover:shadow-md hover:-translate-y-0.5
  active:shadow-sm active:translate-y-0.5 active:scale-[0.98]
  transition-all duration-300
"
style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
```

### Machinery Material
```tsx
// Machinery entrance - NONE
// No animation, instant appearance

// Machinery surface
className="
  bg-neutral-900
  border border-neutral-800
  hover:bg-neutral-800
  // NO transition classes
"
```

## Server-Tick Component Pattern

When sync is `server_tick`, ALWAYS generate:

```tsx
function ServerTickButton({ action, children }) {
  const { execute, isPending, isSuccess, isError } = useServerTick(action);
  
  return (
    <button
      onClick={() => execute()}
      disabled={isPending}  // MUST disable while pending
      className={cn(
        // ... material styles
        isPending && "opacity-50 cursor-not-allowed"
      )}
    >
      {isPending ? (
        // NO spinner - use text or skeleton
        <span>Processing...</span>
      ) : isSuccess ? (
        // XP drop animation
        <SuccessAnimation>
          {children}
        </SuccessAnimation>
      ) : (
        children
      )}
    </button>
  );
}
```

## Success Criteria

- [ ] Context injection happens BEFORE generation
- [ ] Zone is correctly detected
- [ ] Material physics are applied
- [ ] Sync strategy is respected
- [ ] Fidelity ceiling is not exceeded
- [ ] Constitution check passes
- [ ] Generated code uses correct CSS variables

## Error Handling

| Situation | Response |
|-----------|----------|
| Unknown zone | Use default zone |
| Missing essence | Warn, use minimal defaults |
| Fidelity violation | Block or warn based on severity |
| Sync violation | Always block (safety critical) |

## Next Step

After `/craft`: Run `/validate` to check against Gold Standard.
