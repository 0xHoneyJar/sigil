# Sigil Protocol: Context Injection

> "Inject before generation, not after."

## Purpose

This protocol defines how design context is injected into the AI prompt BEFORE generation, ensuring the AI generates with soul from the start.

## Why Injection, Not Linting

| Approach | Problem |
|----------|---------|
| **Post-generation linting** | AI already generated wrong code; we're just catching it |
| **Pre-generation injection** | AI generates right code from the start |

Sigil injects `<sigil_context>` XML into the prompt, making design constraints part of the AI's "knowledge" during generation.

## The Injection Template

```xml
<sigil_context version="11.0">
  <!-- ZONE: Where in the product -->
  <zone name="{{zone.name}}">
    <description>{{zone.description}}</description>
    <material>{{zone.material}}</material>
    <sync_strategy>{{zone.sync}}</sync_strategy>
    <motion style="{{zone.motion.style}}" timing="{{zone.motion.entrance_ms}}ms" />
  </zone>
  
  <!-- MATERIAL: How it feels -->
  <material name="{{material.name}}">
    <primitives>
      <light>{{material.primitives.light}}</light>
      <weight>{{material.primitives.weight}}</weight>
      <motion>{{material.primitives.motion}}</motion>
      <feedback>{{material.primitives.feedback | join(", ")}}</feedback>
    </primitives>
    <css_variables>
      {{#each material.css_variables}}
      <var name="{{@key}}">{{this}}</var>
      {{/each}}
    </css_variables>
    <forbidden>
      {{#each material.forbidden}}
      <pattern>{{this}}</pattern>
      {{/each}}
    </forbidden>
  </material>
  
  <!-- PHYSICS: How it moves -->
  <physics material="{{material.name}}">
    <entrance>
      <from opacity="{{physics.entrance.from.opacity}}" y="{{physics.entrance.from.y}}" />
      <to opacity="1" y="0" />
      <duration>{{physics.entrance.duration}}ms</duration>
      <easing>{{physics.entrance.easing}}</easing>
    </entrance>
    <hover transform="{{physics.hover.transform}}" />
    <active transform="{{physics.active.transform}}" />
  </physics>
  
  <!-- TENSIONS: Current tuning -->
  <tensions>
    <playfulness value="{{tensions.playfulness}}">
      <effect property="--sigil-radius" value="{{calculated.radius}}" />
      <effect property="--sigil-bounce" value="{{calculated.bounce}}" />
    </playfulness>
    <weight value="{{tensions.weight}}">
      <effect property="--sigil-shadow-opacity" value="{{calculated.shadow_opacity}}" />
      <effect property="--sigil-hover-lift" value="{{calculated.hover_lift}}" />
    </weight>
    <density value="{{tensions.density}}">
      <effect property="--sigil-spacing" value="{{calculated.spacing}}" />
      <effect property="--sigil-font-size" value="{{calculated.font_size}}" />
    </density>
    <speed value="{{tensions.speed}}">
      <effect property="--sigil-transition-duration" value="{{calculated.transition_duration}}" />
    </speed>
  </tensions>
  
  <!-- SYNC: How data flows -->
  <sync strategy="{{sync.strategy}}">
    {{#if sync.strategy == "server_tick"}}
    <rule enforcement="block">NEVER update UI optimistically</rule>
    <rule enforcement="block">MUST show pending state while waiting</rule>
    <rule enforcement="block">MUST wait for server confirmation before state change</rule>
    <rule enforcement="warn">SHOULD show success animation (xp_drop style)</rule>
    <rule enforcement="warn">MUST disable interactive elements while pending</rule>
    {{/if}}
    {{#if sync.strategy == "crdt"}}
    <rule enforcement="warn">SHOULD show presence cursors</rule>
    <rule enforcement="info">CAN update optimistically</rule>
    {{/if}}
    {{#if sync.strategy == "lww"}}
    <rule enforcement="info">CAN update instantly (local-first)</rule>
    <rule enforcement="warn">SHOULD sync in background</rule>
    {{/if}}
  </sync>
  
  <!-- FIDELITY: Quality ceiling -->
  <fidelity_ceiling era="{{fidelity.era}}">
    <constraint type="gradients" max_stops="{{fidelity.constraints.visual.gradients.max_stops}}" />
    <constraint type="shadows" max_layers="{{fidelity.constraints.visual.shadows.max_layers}}" />
    <constraint type="animation" max_duration="{{fidelity.constraints.animation.max_duration_ms}}ms" />
    <forbidden_techniques>
      {{#each fidelity.forbidden_techniques}}
      <technique>{{this}}</technique>
      {{/each}}
    </forbidden_techniques>
  </fidelity_ceiling>
  
  <!-- ESSENCE: The soul -->
  <essence>
    <soul>{{essence.soul.statement}}</soul>
    <invariants>
      {{#each essence.invariants}}
      <invariant id="{{this.id}}" enforcement="{{this.enforcement}}">
        {{this.statement}}
      </invariant>
      {{/each}}
    </invariants>
  </essence>
  
  <!-- INSTRUCTION: Final directive -->
  <instruction>
    You are an apprentice in {{fidelity.era}}.
    You do not know what {{fidelity.forbidden_techniques | join(", ")}} are.
    
    Generate UI that:
    1. Uses {{material.name}} material physics ({{material.primitives.motion}} motion)
    2. Respects the {{zone.name}} zone patterns
    3. Follows {{sync.strategy}} sync strategy
    4. Stays within the Fidelity Ceiling
    5. Honors the soul: "{{essence.soul.statement}}"
    
    {{#if sync.strategy == "server_tick"}}
    CRITICAL: This is server-tick data. You MUST:
    - Show pending state
    - Disable buttons while waiting
    - Never show optimistic values
    - Wait for server confirmation
    {{/if}}
    
    If your output looks "better" than the era reference, it is WRONG.
  </instruction>
</sigil_context>
```

## When to Inject

Inject context when the user prompt matches ANY of these patterns:

```javascript
const TRIGGER_PATTERNS = [
  // Creation verbs
  /\b(create|build|make|add|implement|design|generate)\b/i,
  
  // Component types
  /\b(component|button|modal|card|form|input|page|screen)\b/i,
  
  // File extensions in path
  /\.(tsx|jsx|vue|svelte)$/i,
  
  // Explicit craft request
  /\/craft\b/i,
];

function shouldInject(prompt, filePath) {
  if (TRIGGER_PATTERNS.some(p => p.test(prompt))) return true;
  if (filePath && /\.(tsx|jsx|vue|svelte)$/.test(filePath)) return true;
  return false;
}
```

## Zone Detection

```javascript
function detectZone(prompt, filePath) {
  // 1. Check explicit argument
  const zoneArg = prompt.match(/--zone\s+(\w+)/);
  if (zoneArg) return zoneArg[1];
  
  // 2. Check file path against zone patterns
  if (filePath) {
    const zones = loadYaml('sigil-mark/soul/zones.yaml');
    for (const [zoneName, zone] of Object.entries(zones.zones)) {
      for (const pattern of zone.paths) {
        if (minimatch(filePath, pattern)) return zoneName;
      }
    }
  }
  
  // 3. Detect from keywords
  const keywords = {
    critical: ['checkout', 'trade', 'claim', 'buy', 'sell', 'transfer'],
    transactional: ['settings', 'admin', 'dashboard', 'profile'],
    exploratory: ['browse', 'search', 'discover', 'explore'],
    marketing: ['landing', 'marketing', 'hero', 'home'],
  };
  
  for (const [zone, words] of Object.entries(keywords)) {
    if (words.some(w => prompt.toLowerCase().includes(w))) return zone;
  }
  
  return 'default';
}
```

## Context Loading

```javascript
async function loadContext(zone) {
  const zones = await loadYaml('sigil-mark/soul/zones.yaml');
  const materials = await loadYaml('sigil-mark/soul/materials.yaml');
  const tensions = await loadYaml('sigil-mark/soul/tensions.yaml');
  const essence = await loadYaml('sigil-mark/soul/essence.yaml');
  const fidelity = await loadYaml('sigil-mark/kernel/fidelity-ceiling.yaml');
  const physics = await loadYaml('sigil-mark/kernel/physics.yaml');
  
  const zoneConfig = zones.zones[zone] || zones.default;
  const material = materials.materials[zoneConfig.material];
  const materialPhysics = materials.physics_lookup[zoneConfig.material];
  
  // Apply zone overrides to tensions
  const zoneTensions = {
    ...tensions.current.values,
    ...(tensions.current.zone_overrides[zone] || {}),
  };
  
  // Calculate CSS values from tensions
  const calculated = calculateTensionValues(zoneTensions, tensions.tensions);
  
  return {
    zone: zoneConfig,
    material,
    physics: materialPhysics,
    tensions: zoneTensions,
    calculated,
    essence,
    fidelity,
    sync: { strategy: zoneConfig.sync },
  };
}
```

## Template Compilation

```javascript
function compileContext(context) {
  const template = loadTemplate('context-injection.xml');
  return Handlebars.compile(template)(context);
}
```

## Injection Point

The context is prepended to the user's prompt:

```javascript
async function handleCraftRequest(userPrompt, filePath) {
  if (!shouldInject(userPrompt, filePath)) {
    return userPrompt;
  }
  
  const zone = detectZone(userPrompt, filePath);
  const context = await loadContext(zone);
  const contextXml = compileContext(context);
  
  return `${contextXml}\n\n${userPrompt}`;
}
```

## Verification

After injection, the AI response is checked against invariants:

```javascript
function verifyGenerated(code, context) {
  const violations = [];
  
  // Check invariants
  for (const invariant of context.essence.invariants) {
    if (violatesInvariant(code, invariant)) {
      violations.push({
        type: 'invariant',
        invariant: invariant.id,
        enforcement: invariant.enforcement,
      });
    }
  }
  
  // Check sync strategy
  if (context.sync.strategy === 'server_tick') {
    if (!hasPendingState(code)) {
      violations.push({
        type: 'sync',
        message: 'Missing pending state for server-tick',
        enforcement: 'block',
      });
    }
  }
  
  return violations;
}
```
