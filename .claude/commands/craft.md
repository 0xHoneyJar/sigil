---
name: "craft"
version: "1.4.0"
agent: "crafting-physics"
description: |
  Apply design physics to any UX-affecting change.
  Three layers: Behavioral + Animation + Material = Feel.

  Crafting is not limited to component generation.
  It applies to anything that affects what users experience:
  - New components
  - Existing code refinement
  - Configuration and theming
  - Data patterns and hooks
  - Polish passes and fine-tuning

arguments:
  - name: "description"
    type: "string"
    required: true
    description: "What to craft — new, refine, or polish"
    examples:
      - "claim button"
      - "improve light mode readability"
      - "refine these lines to be easier to read"
      - "optimize the loading state for this data flow"
      - "polish the hover states across the nav"
      - "glassmorphism card with spring animation"
  - name: "url"
    type: "string"
    required: false
    description: "URL for visual verification after generation (optional)"
    examples:
      - "http://localhost:3000"
      - "http://localhost:3000/component-preview"

context_files:
  - path: ".claude/rules/00-sigil-core.md"
    required: true
    purpose: "Core instructions, priority hierarchy, action behavior"
  - path: ".claude/rules/01-sigil-physics.md"
    required: true
    purpose: "Behavioral physics - sync, timing, confirmation"
  - path: ".claude/rules/02-sigil-detection.md"
    required: true
    purpose: "Effect detection with examples"
  - path: ".claude/rules/03-sigil-patterns.md"
    required: true
    purpose: "Golden pattern templates"
  - path: ".claude/rules/04-sigil-protected.md"
    required: true
    purpose: "Protected capabilities (non-negotiable)"
  - path: ".claude/rules/05-sigil-animation.md"
    required: true
    purpose: "Animation physics - easing, springs, frequency"
  - path: ".claude/rules/06-sigil-taste.md"
    required: true
    purpose: "Taste accumulation - learn from usage"
  - path: ".claude/rules/07-sigil-material.md"
    required: true
    purpose: "Material physics - surface, fidelity, grit"
  - path: ".claude/rules/08-sigil-lexicon.md"
    required: true
    purpose: "Lookup tables - keywords, adjectives, domains"
  - path: "grimoires/sigil/taste.md"
    required: false
    purpose: "Accumulated taste signals"
  - path: "grimoires/sigil/context/"
    required: false
    purpose: "Project-specific context - personas, brand, domain expertise"
  - path: "grimoires/sigil/moodboard/"
    required: false
    purpose: "Visual references and team taste"
  - path: "grimoires/sigil/observations/"
    required: false
    purpose: "User behavior observations - diagnostics, insights, physics implications"
  - path: "grimoires/loa/context/domain/"
    required: false
    purpose: "Domain knowledge from /understand or complexity detection"
  - path: "grimoires/loa/context/ecosystem/"
    required: false
    purpose: "Multi-repo relationships and contract mappings"

outputs:
  dynamic: true
  description: "Output depends on craft type - component, config, styles, or code edit"

workflow_next: "garden"
---

# /craft

Apply design physics to any UX-affecting change.

<philosophy>
## The Craft Philosophy

**Crafting is applying physics to create feel.**

Feel emerges from the interplay of three layers:
- **Behavioral** — How things respond (sync, timing, confirmation)
- **Animation** — How things move (easing, springs, frequency)
- **Material** — How things look (surface, fidelity, grit)

These layers aren't separate concerns. They're three expressions of the same physics. A financial action must be behaviorally pessimistic (800ms, confirmation), animated deliberately (ease-out, non-interruptible), and materially trustworthy (elevated, clear). Change one layer and the others must adjust.

**Craft applies everywhere feel matters:**
| Craft Type | Example | Physics Applied |
|------------|---------|-----------------|
| New component | "claim button" | All three layers, new file |
| Refinement | "make this feel snappier" | Adjust timing/animation |
| Configuration | "improve light mode" | Material physics to theme |
| Data patterns | "optimize loading UX" | Behavioral physics to data flow |
| Polish | "refine hover states" | Animation + material to existing |
</philosophy>

<action_default>
## Action Default

CRITICAL: After user confirms analysis, apply changes immediately.

**DO:**
- Detect what's being crafted (new vs. refine vs. configure)
- Apply physics appropriate to the craft type
- Match codebase conventions exactly
- Write complete, working code

**DO NOT:**
- Describe what you would build
- Ask "would you like me to generate this?"
- Provide partial implementations
- Add unnecessary comments

**IMPORTANT:** Craft is about doing, not discussing. Show physics, get confirmation, apply.
</action_default>

<permissions>
## Permission Boundaries

**Proactive** (do without asking):
- Read package.json, existing code, taste.md
- Discover conventions and patterns
- Show physics analysis
- Detect craft type, effect, and material

**Requires confirmation** (ask first):
- Write new files
- Modify existing files
- Override physics defaults
- Apply changes to configuration

**Never** (even if asked):
- Delete files without explicit request
- Modify package.json dependencies
- Skip protected capability checks
- Make financial operations optimistic
</permissions>

<craft_detection>
## Craft Type Detection

Detect what's being crafted before detecting effect:

| Signal | Craft Type | Output |
|--------|------------|--------|
| "new", "create", "build", no existing file | **Generate** | New component file |
| "refine", "polish", "improve", existing file | **Refine** | Edit existing code |
| "theme", "colors", "mode", config file | **Configure** | Edit config/theme |
| "loading", "data", "fetch", "state" | **Pattern** | Hook or utility |
| "hover", "focus", "states", multiple files | **Polish** | Batch edits |

**Ambiguity Resolution:**
If unclear, ask ONE question:
> "Is this a new component, or refining something that exists?"
</craft_detection>

<output_modes>
## Output Modes

Check `grimoires/sigil/taste.md` for `output_mode` preference.

**Compact mode** (default after 5+ accepts):
```
[Target] | [Effect] | [Craft Type]
Behavioral: [sync] [timing] | Animation: [easing] | Material: [surface]
Protected: [pass/fail] | Codebase: [libs detected]

Apply? (y/n)
```

**Verbose mode** (default for new users, after REJECT):
```
┌─ Craft Analysis ───────────────────────────────────────┐
│                                                        │
│  Target:       [what's being crafted]                  │
│  Craft Type:   [generate/refine/configure/pattern]    │
│  Effect:       [effect type if applicable]             │
│  Detected by:  [signals that triggered detection]      │
│                                                        │
│  Behavioral    [Sync] | [Timing] | [Confirmation]      │
│  Animation     [Easing] | [Spring/duration] | [Freq]   │
│  Material      [Surface] | [Shadow] | [Radius]         │
│                                                        │
│  Codebase:     [styling] + [animation] + [data]        │
│                                                        │
│  Output:       [file(s) to create/modify]              │
│                                                        │
│  Protected (if applicable):                            │
│  [✓/✗] Cancel  [✓/✗] Recovery  [✓/✗] Touch  [✓/✗] Focus│
│                                                        │
└────────────────────────────────────────────────────────┘

Proceed? (yes / or describe what's different)
```

Auto-switch to compact after 5 consecutive ACCEPT signals.
Reset to verbose after any REJECT signal.
</output_modes>

<session_health>
## Session Health Monitoring

Long sessions can accumulate context drift — bouncing between different targets, multiple rejections, or effect type mixing degrades physics alignment.

### Drift Indicators

Track these indicators by parsing `grimoires/sigil/taste.md` for the current session:

| Indicator | Yellow | Red | How to Detect |
|-----------|--------|-----|---------------|
| Task transitions | 5 | 8 | Count distinct `Target:` values in session |
| REJECT ratio | 20% | 40% | REJECTs / total signals in session |
| Time since ACCEPT | 15 min | 30 min | Timestamp of last ACCEPT signal |
| Effect type switches | 3 | 5 | Count distinct `Effect:` values in session |

### Session Boundary

A "session" starts when:
- First `/craft` after `/clear`
- First `/craft` of the day (date change in taste.md)
- Explicit `## SESSION START` marker in taste.md

### Behavior at Thresholds

**At Yellow threshold**:
- Show subtle indicator in analysis box: `│  Session:    ⚠ [indicator] elevated`
- Continue normally

**At Red threshold**:
- Show warning before analysis:
  ```
  ⚠ Session drift detected ([specific indicator]).
  Physics alignment may be degraded. Consider `/clear` to start fresh.
  Continue anyway? (y/n)
  ```
- If user continues: proceed with analysis
- Log drift warning to taste.md

### Analysis Box with Session Health

In verbose mode, add session line when indicators are elevated:

```
┌─ Craft Analysis ───────────────────────────────────────┐
│                                                        │
│  Target:       [what's being crafted]                  │
│  Craft Type:   [generate/refine/configure/pattern]    │
│  Effect:       [effect type]                           │
│  Session:      ⚠ 6 targets | 25% rejects              │
│                                                        │
│  ...                                                   │
└────────────────────────────────────────────────────────┘
```

In compact mode, prepend warning if at red:
```
⚠ Session drift (8 targets). Consider /clear.

[Target] | [Effect] | [Craft Type]
...
```

### Override

User can override with "continue" or "y" at red threshold. Log the override:

```markdown
## [YYYY-MM-DD HH:MM] | SESSION_OVERRIDE
Indicator: [what triggered red]
User chose to continue despite drift warning.
---
```
</session_health>

<workflow>
## Workflow

<step_0>
### Step 0: Track Progress

Use TodoWrite to track this workflow:
```
1. [ ] Check session health (drift indicators)
2. [ ] Discover context (libs, conventions, existing code)
3. [ ] Detect craft type and effect
4. [ ] Show physics analysis
5. [ ] Get user confirmation
6. [ ] Apply changes
7. [ ] Visual verification (if URL provided)
8. [ ] Collect feedback
9. [ ] Log taste signal
```
Mark each in_progress then completed as you work.

**Session health check first**: If drift is at red threshold, pause workflow and show warning before continuing.
</step_0>

<step_1>
### Step 1: Discover Context

**1a. Read project context** (if exists):
```
Scan grimoires/sigil/context/
```
Look for:
- **Personas** (`context/personas/`) — User expertise, behavior, expectations
- **Brand** (`context/brand/`) — Voice, tone, visual guidelines
- **Domain** (`context/domain/`) — Best practices, domain-specific rules

Extract physics implications from frontmatter and content:
```yaml
## Physics Implications
- Can reduce confirmation timing (600ms vs 800ms)
- Skip explanatory copy in confirmations
```

**1a-obs. Scan observations for user behavior context** (if exists):
```
Scan grimoires/sigil/observations/
```
Look for:
- **user-insights.md** — Aggregated validated findings from user feedback
- **{user}-diagnostic.md** — Open diagnostics with `related_components` field
- **open-questions.md** — Pending questions (may affect confidence)

Extract physics implications from observations:

| User Type | Physics Implication |
|-----------|---------------------|
| decision-maker | May need more data density, show amounts prominently |
| builder | Tolerates complexity, can use technical language |
| trust-checker | Needs confidence signals, frequent verification |
| casual | Needs simplicity, clear affordances |

For each diagnostic file with matching `related_components`:
- Extract user quote and type
- Note gap classification if validated (bug/discoverability/feature)
- Apply user type physics adjustments

**If observations exist and match the craft target:**
- Include in analysis box (see Step 3)
- Adjust physics based on user type patterns
- Note observation-backed adjustments with source

**If no observations or no match:**
- Proceed without observation context
- Observation section omitted from analysis box

**1b. Read taste log and check session health** (if exists):
```
Read grimoires/sigil/taste.md
```
Look for:
- Patterns with 3+ occurrences (apply automatically)
- `output_mode` preference (compact vs verbose)
- Timing/animation/material overrides
- **Session health indicators** (see `<session_health>` section):
  - Count distinct targets in current session
  - Calculate REJECT ratio
  - Check time since last ACCEPT
  - Count effect type switches

If any indicator hits **red threshold**, show drift warning before proceeding.

**1c. Scan moodboard for references** (if relevant):
```
Scan grimoires/sigil/moodboard/
```
Look for:
- Relevant `references/` by zone, term, or tag
- Applicable `anti-patterns/` to avoid
- Matching entries in `index.yaml`

**1d. Discover codebase conventions** (single read):
```
Read package.json
```
Extract from dependencies:
- Animation: `framer-motion` | `react-spring` | CSS
- Data: `@tanstack/react-query` | `swr` | `fetch`
- Toast: `sonner` | `react-hot-toast` | native
- Styling: `tailwindcss` | `styled-components` | `@emotion`

**1e. If refining existing code:**
- Read the file(s) being refined
- Understand current patterns before changing
- Note what's working vs. what needs adjustment

**1f. If configuring theme/config:**
- Read the config file structure
- Understand the existing design tokens
- Note constraints (CSS variables, Tailwind config, etc.)

**Context Priority:**
When context conflicts with defaults, apply in this order:
1. Protected capabilities (never override)
2. Explicit user request in prompt
3. **Observation-backed insights** (user behavior evidence)
4. Primary persona physics implications
5. Brand guidelines
6. Domain rules
7. Taste log patterns
8. Physics defaults
</step_1>

<step_2>
### Step 2: Detect Craft Type and Effect

**Craft Type Detection** (determines output):

| Input Signals | Craft Type | What to Do |
|---------------|------------|------------|
| Component name, no existing file | Generate | Create new component |
| "refine", "polish", existing file ref | Refine | Edit existing file |
| "theme", "mode", "colors", config ref | Configure | Edit config file |
| "loading", "data flow", "fetch pattern" | Pattern | Create/edit hook or utility |
| "hover states", "focus rings", multi-file | Polish | Batch edits |

**Effect Detection** (determines physics):

| Priority | Signal | Example |
|----------|--------|---------|
| 1. Types | Props with `Currency`, `Money`, `Wei` | Always Financial |
| 2. Keywords | "claim", "delete", "like", "toggle" | See lexicon |
| 3. Context | "with undo", "for wallet" | Modifies effect |
| 4. Frequency | "used constantly", "high-traffic" | Reduces animation |

**Material Detection** (determines surface):

| Keyword | Treatment |
|---------|-----------|
| glassmorphism | blur backdrop, subtle border |
| elevated | shadow, slight lift |
| flat | no shadows, solid colors |
| outlined | border only |
| retro, pixel | grit signatures |
| "readable", "clearer" | contrast, typography focus |
| (no keyword) | Infer from effect and craft type |
</step_2>

<step_3>
### Step 3: Show Physics Analysis

Show analysis appropriate to craft type:

**For Generate (new component):**
```
┌─ Craft Analysis ───────────────────────────────────────┐
│  Target:       ClaimButton (new)                       │
│  Craft Type:   Generate                                │
│  Effect:       Financial mutation                      │
│                                                        │
│  Observations: (if matching diagnostics found)         │
│                papa_flavio: "need to know rewards..."  │
│                → User type: decision-maker             │
│                → Implies: Show amount prominently      │
│                                                        │
│  Context:      (if context files found)                │
│                DeFi Power User (primary persona)       │
│                → Timing: 800ms → 600ms (expertise)     │
│                → Copy: Minimal (high confidence)       │
│                                                        │
│  Behavioral    Pessimistic | 600ms | Confirmation      │
│  Animation     ease-out | deliberate | no bounce       │
│  Material      Elevated | Soft shadow | 8px radius     │
│                                                        │
│  References:   @moodboard/references/stripe/checkout   │
│                                                        │
│  Output:       src/components/ClaimButton.tsx          │
│  Protected:    [✓] All capabilities included          │
└────────────────────────────────────────────────────────┘
```

**Observations Section Rules:**
- Only show if matching diagnostics exist for the craft target
- Match by: component name in `related_components`, effect type, or keywords
- Show: user handle, truncated quote (first 30 chars...), user type, physics implication
- If multiple observations match, show up to 2 most recent
- Omit section entirely if no observations match

**For Refine (existing code):**
```
┌─ Craft Analysis ───────────────────────────────────────┐
│  Target:       vocs.config.ts (theme)                  │
│  Craft Type:   Refine                                  │
│  Issue:        Lines hard to read in light mode        │
│                                                        │
│  Material      Contrast: Increase | Background: Adjust │
│  Changes:      lineColor → higher contrast value       │
│                backgroundSecondary → softer tone       │
│                                                        │
│  Output:       Edit vocs.config.ts                     │
└────────────────────────────────────────────────────────┘
```

**For Configure (theme/config):**
```
┌─ Craft Analysis ───────────────────────────────────────┐
│  Target:       Theme configuration                     │
│  Craft Type:   Configure                               │
│  Mode:         Light mode refinement                   │
│                                                        │
│  Material      Readability focus                       │
│  Changes:      - Border colors: +20% contrast          │
│                - Text secondary: darken for legibility │
│                - Code blocks: softer background        │
│                                                        │
│  Output:       Edit [config file path]                 │
└────────────────────────────────────────────────────────┘
```

**For Pattern (data/hooks):**
```
┌─ Craft Analysis ───────────────────────────────────────┐
│  Target:       Loading state pattern                   │
│  Craft Type:   Pattern                                 │
│  Effect:       Query (optimistic, 150ms)               │
│                                                        │
│  Behavioral    Suspense boundary placement             │
│  Animation     Skeleton with subtle pulse              │
│  Material      Skeleton matches content shape          │
│                                                        │
│  Output:       src/hooks/useOptimisticQuery.ts         │
└────────────────────────────────────────────────────────┘
```

**For Polish (batch updates):**
```
┌─ Craft Analysis ───────────────────────────────────────┐
│  Target:       Hover states across navigation          │
│  Craft Type:   Polish                                  │
│  Scope:        3 files identified                      │
│                                                        │
│  Animation     Hover: spring(500, 30), 150ms feel      │
│  Material      Hover: +5% brightness, subtle lift      │
│                                                        │
│  Output:       Edit src/components/Nav*.tsx (3 files)  │
└────────────────────────────────────────────────────────┘
```

Proceed? (yes / or describe what's different)
</step_3>

<step_4>
### Step 4: Get Confirmation

Wait for user response:
- **"yes", "y", "proceed"** → Apply immediately (Step 5)
- **Correction provided** → Update analysis, show again
- **Question asked** → Answer, then re-confirm
</step_4>

<step_5>
### Step 5: Apply Changes

IMMEDIATELY apply changes based on craft type:

**Generate:** Write complete new file with all three physics layers.

**Refine:** Use Edit tool to modify existing code, preserving what works.

**Configure:** Edit config file with physics-informed values.

**Pattern:** Write hook or utility with appropriate physics baked in.

**Polish:** Apply batch edits across identified files.

**For all craft types:**
- Use discovered libraries only (never assume)
- Match existing code style exactly
- Apply physics from analysis
- Include protected capabilities where applicable
- No comments unless explaining physics override

**5b. Visual Verification (optional, if URL provided):**

When user provides a URL, use `agent-browser` skill to capture and verify:

```bash
# Open the component in browser
agent-browser open <url>

# Wait for component to render
agent-browser wait --load networkidle

# Capture screenshot for physics comparison
agent-browser screenshot grimoires/sigil/observations/craft-[component]-$(date +%Y%m%d).png

# Verify protected capabilities
agent-browser snapshot -i  # Get interactive elements
# Check touch targets ≥44px
# Check focus rings visible

agent-browser close
```

Screenshot is saved for taste signal and future comparison. Include in feedback collection:
> "Here's a screenshot of the rendered component. Does this feel right?"

See `.claude/skills/agent-browser/SKILL.md` for full command reference.
</step_5>

<step_6>
### Step 6: Collect Feedback

Ask the user to reflect on feel from their end user's perspective:

**For Generate:**
> "Does this feel right? Think about your user in the moment of clicking."

**For Refine:**
> "Is this better? Does it feel like what you were going for?"

**For Configure:**
> "Does this look right for your product's personality?"

**For Pattern:**
> "Does this data flow feel smooth to the user?"

**For Polish:**
> "Do these interactions feel cohesive now?"

**Listen for signals:**
- "feels slow/fast" → behavioral layer
- "movement feels off" → animation layer
- "looks wrong" → material layer
- "something's not quite right" → ask which layer

**Signal detection:**
- ACCEPT: "yes", "looks good", "perfect", moves to next task
- MODIFY: Describes what's off ("too slow", "needs more contrast")
- REJECT: "no", "wrong", "start over"
</step_6>

<step_7>
### Step 7: Log Taste Signal

Append to `grimoires/sigil/taste.md`:

**ACCEPT:**
```markdown
## [YYYY-MM-DD HH:MM] | ACCEPT
Target: [what was crafted]
Craft Type: [generate/refine/configure/pattern/polish]
Effect: [if applicable]
Physics: [key values applied]
---
```

**MODIFY:**
```markdown
## [YYYY-MM-DD HH:MM] | MODIFY
Target: [what was crafted]
Craft Type: [type]
Changed: [what user indicated was off]
Learning: [infer preference for future]
---
```

**REJECT:**
```markdown
## [YYYY-MM-DD HH:MM] | REJECT
Target: [what was crafted]
Craft Type: [type]
Reason: [user feedback]
---
```
</step_7>
</workflow>

<error_recovery>
## Error Recovery

**Craft type unclear:**
1. Ask ONE question: "Is this new, or refining something that exists?"
2. If still unclear: Infer from context (file reference = refine, no reference = generate)

**Effect detection fails:**
1. Ask max 2 clarifying questions
2. If still unclear: Default to Standard, note in analysis
3. Format: "⚠ Defaulted to Standard (unclear input)"

**Missing package.json:**
1. Check imports in existing files
2. Infer libraries from import statements
3. If no files exist: Ask user for preferences

**File to refine not found:**
1. Ask user to specify the file path
2. Or offer to create new instead

**Protected capability violation:**
1. Stop generation
2. Explain which capability would be violated
3. Offer compliant alternative
</error_recovery>

<context_references>
## Context References

### Auto-Scan (Default)

When you run `/craft`, the agent automatically scans:
- `grimoires/sigil/context/` — Personas, brand, domain expertise
- `grimoires/sigil/moodboard/` — Visual references, anti-patterns
- `grimoires/sigil/taste.md` — Accumulated taste signals

No special syntax needed — context is applied automatically.

### Explicit References

Use `@` syntax to explicitly reference context files:

```bash
# Reference a specific persona
/craft "claim button" @context/personas/power-user.md

# Reference a moodboard entry
/craft "checkout flow" @moodboard/references/stripe/

# Multiple references
/craft "onboarding" @context/personas/first-time.md @context/brand/voice.md
```

**When to use explicit references:**
- Override auto-detected persona
- Force a specific brand guideline
- Point to a specific moodboard example
- Combine multiple context sources

**Syntax rules:**
- Paths are relative to `grimoires/sigil/`
- Directories reference all files within
- Single file references use `.md` extension
</context_references>

<quick_reference>
## Quick Reference

### Effect → Physics

| Keywords | Effect | Sync | Timing | Confirm |
|----------|--------|------|--------|---------|
| claim, deposit, withdraw, transfer, stake | Financial | Pessimistic | 800ms | Yes |
| delete, remove, destroy, revoke, burn | Destructive | Pessimistic | 600ms | Yes |
| archive, trash, dismiss, soft-delete | Soft Delete | Optimistic | 200ms | Toast+Undo |
| save, update, like, follow, create | Standard | Optimistic | 200ms | No |
| toggle, switch, expand, collapse | Local State | Immediate | 100ms | No |
| command palette, keyboard nav | High-freq | Immediate | 0ms | No |

### Craft Type → Output

| Craft Type | Typical Output |
|------------|----------------|
| Generate | New `src/components/[Name].tsx` |
| Refine | Edit to existing file |
| Configure | Edit to config/theme file |
| Pattern | New or edit `src/hooks/[name].ts` |
| Polish | Batch edits across files |

### Material Keywords

| Keyword | Treatment |
|---------|-----------|
| glassmorphism | blur, transparency, subtle border |
| elevated | shadow, slight lift |
| flat | no shadows, solid colors |
| readable, clearer | contrast, typography focus |
| retro, pixel | grit signatures |
</quick_reference>

<when_not_to_use>
## When NOT to Use /craft

- **1-3 line change**: Use Edit tool directly
- **Only animation wrong**: Use `/animate` instead (faster)
- **Only styling wrong**: Use `/style` instead (faster)
- **Only timing wrong**: Use `/behavior` instead (faster)
- **Non-UX code**: Backend logic, tests, etc. — physics don't apply

**Rule:** If it doesn't affect what users feel, don't use /craft.
</when_not_to_use>

<examples>
## Examples

### Example 1: New Component (Generate)

```
User: /craft "claim button for staking rewards"

┌─ Craft Analysis ───────────────────────────────────────┐
│  Target:       StakingClaimButton (new)                │
│  Craft Type:   Generate                                │
│  Effect:       Financial mutation                      │
│                                                        │
│  Behavioral    Pessimistic | 800ms | Confirmation      │
│  Animation     ease-out | 800ms | Non-interruptible   │
│  Material      Elevated | Soft shadow | 8px radius     │
│                                                        │
│  Output:       src/components/StakingClaimButton.tsx   │
│  Protected:    [✓] All capabilities included          │
└────────────────────────────────────────────────────────┘

Proceed? (y/n)

User: y

[Generates complete component]

Does this feel right? Think about your user in the moment of clicking.

User: feels a bit slow, our users claim multiple times a day

Ah, high-frequency financial action. Adjusting to 600ms — still
deliberate but respects their workflow.

[Applies adjustment, logs MODIFY with learning]
```

### Example 2: Theme Refinement (Configure)

```
User: /craft "improve light mode readability, the lines are hard to read"

┌─ Craft Analysis ───────────────────────────────────────┐
│  Target:       Theme configuration                     │
│  Craft Type:   Configure                               │
│  Issue:        Lines hard to read in light mode        │
│                                                        │
│  Material      Readability focus                       │
│  Changes:      - Border colors: increase contrast      │
│                - Text secondary: darken for legibility │
│                - Line elements: higher opacity         │
│                                                        │
│  Output:       Edit vocs.config.ts                     │
└────────────────────────────────────────────────────────┘

Proceed? (y/n)

User: y

[Edits config with improved contrast values]

Does this look right for your product's personality?

User: much better, but maybe a touch more contrast on the borders

[Increases border contrast, logs MODIFY]
```

### Example 3: Existing Code Polish (Refine)

```
User: /craft "refine hover states on the navigation, they feel inconsistent"

┌─ Craft Analysis ───────────────────────────────────────┐
│  Target:       Navigation hover states                 │
│  Craft Type:   Polish                                  │
│  Scope:        3 files: NavItem, NavGroup, NavHeader   │
│                                                        │
│  Animation     Hover: spring(500, 30), 150ms feel      │
│  Material      Hover: +5% brightness, subtle shadow    │
│                                                        │
│  Output:       Edit src/components/Nav*.tsx            │
└────────────────────────────────────────────────────────┘

Proceed? (y/n)

User: y

[Applies consistent hover physics across all 3 files]

Do these interactions feel cohesive now?

User: yes, much better

[Logs ACCEPT]
```

### Example 4: Data Pattern (Pattern)

```
User: /craft "optimize the loading state for the dashboard data"

┌─ Craft Analysis ───────────────────────────────────────┐
│  Target:       Dashboard loading pattern               │
│  Craft Type:   Pattern                                 │
│  Effect:       Query (optimistic, 150ms)               │
│                                                        │
│  Behavioral    Suspense boundary at data component     │
│  Animation     Skeleton with subtle pulse (1.5s)       │
│  Material      Skeleton matches card layout            │
│                                                        │
│  Output:       Edit src/components/Dashboard.tsx       │
│                Add src/components/DashboardSkeleton.tsx│
└────────────────────────────────────────────────────────┘

Proceed? (y/n)

User: y, but the skeleton should show the rough shape of the charts too

Good call — skeletal content should preview what's coming.

[Generates skeleton with chart placeholders, logs taste signal]
```

### Example 5: Quick Refinement (Compact Mode)

```
User: /craft "make the submit button snappier"

SubmitButton | Standard | Refine
Animation: 200ms → 150ms, spring(600,30) | Material: unchanged

Apply? (y/n)

User: y

[Applies change]
```

### Example 6: Visual Verification with URL

```
User: /craft "claim button" http://localhost:3000/staking

┌─ Craft Analysis ───────────────────────────────────────┐
│  Target:       ClaimButton (new)                       │
│  Craft Type:   Generate                                │
│  Effect:       Financial mutation                      │
│  URL:          http://localhost:3000/staking           │
│                                                        │
│  Behavioral    Pessimistic | 800ms | Confirmation      │
│  Animation     ease-out | deliberate | no bounce       │
│  Material      Elevated | Soft shadow | 8px radius     │
│                                                        │
│  Output:       src/components/ClaimButton.tsx          │
│  Verify:       Visual check after generation           │
└────────────────────────────────────────────────────────┘

Proceed? (y/n)

User: y

[Generates component]

Running visual verification...
Opening http://localhost:3000/staking
Capturing screenshot...
Checking protected capabilities...
✓ Touch target: 48px (≥44px)
✓ Focus ring: visible

Screenshot saved: grimoires/sigil/observations/craft-ClaimButton-20260114.png

Here's the rendered component. Does this feel right?

User: yes, looks good

[Logs ACCEPT with screenshot reference]
```

### Example 7: Session Drift Warning

```
User: /craft "notification badge"

⚠ Session drift detected (9 distinct targets, 35% reject ratio).
Physics alignment may be degraded. Consider `/clear` to start fresh.
Continue anyway? (y/n)

User: continue

┌─ Craft Analysis ───────────────────────────────────────┐
│  Target:       NotificationBadge (new)                 │
│  Craft Type:   Generate                                │
│  Effect:       Local State                             │
│  Session:      ⚠ 9 targets | 35% rejects              │
│                                                        │
│  Behavioral    Immediate | 100ms | No confirmation     │
│  Animation     spring(700, 35) | snappy                │
│  Material      Elevated | Red accent | 4px radius      │
│                                                        │
│  Output:       src/components/NotificationBadge.tsx    │
└────────────────────────────────────────────────────────┘

Proceed? (y/n)

User: y

[Generates component, logs SESSION_OVERRIDE to taste.md]
```
</examples>

---

<user-request>
$ARGUMENTS
</user-request>
