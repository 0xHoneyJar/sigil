---
name: "craft"
version: "2.1.0"
agent: "crafting-physics"
description: |
  The universal entry point for product work.

  /craft adapts to whatever you bring:
  - UI work → Apply design physics (Behavioral + Animation + Material + Voice)
  - Debug work → Investigate, diagnose, fix
  - Explore work → Research, understand, map
  - Full features → Orchestrate Loa commands (Hammer mode)

  Trust your intuition. If you invoked /craft, there's work to do.

arguments:
  - name: "description"
    type: "string"
    required: true
    description: "What you're working on — any product work"
    examples:
      - "claim button"
      - "improve light mode readability"
      - "fix the deployment issue"
      - "why is the auth flow failing"
      - "build rewards claiming feature"
      - "investigate slow page load"
      - "debug the docs deployment"
  - name: "url"
    type: "string"
    required: false
    description: "URL for visual verification after generation (optional)"
    examples:
      - "http://localhost:3000"
      - "http://localhost:3000/component-preview"
  - name: "--experiment"
    type: "string"
    required: false
    description: "Link this craft session to an experiment (e.g., --experiment EXP-001)"
    examples:
      - "--experiment EXP-001"
      - "--experiment EXP-002-claim-flow"

context_files:
  # RLM Core - Always loaded (~1k tokens instead of ~10k)
  - path: ".claude/rules/rlm-core-summary.md"
    required: true
    purpose: "Condensed physics decision tree - always loaded"
  - path: ".claude/rules/index.yaml"
    required: true
    purpose: "RLM rule index - maps patterns to on-demand rules"
  - path: ".claude/rules/04-sigil-protected.md"
    required: true
    purpose: "Protected capabilities (non-negotiable) - always loaded"
  # State persistence
  - path: "grimoires/sigil/craft-state.md"
    required: false
    purpose: "Craft session state for iterative debugging"
  # Dynamic context (loaded as needed)
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
  - path: "grimoires/sigil/experiments/"
    required: false
    purpose: "Active experiments - hypothesis, success criteria, linked observations"
  - path: "grimoires/loa/context/domain/"
    required: false
    purpose: "Domain knowledge from /understand or complexity detection"
  - path: "grimoires/loa/context/ecosystem/"
    required: false
    purpose: "Multi-repo relationships and contract mappings"
  # Note: Additional rules loaded dynamically via RLM based on detected patterns
  # See index.yaml for trigger mappings

outputs:
  dynamic: true
  description: "Output depends on craft type - component, config, styles, or code edit"

workflow_next: "garden"
---

# /craft

The universal entry point for product work.

<philosophy>
## The Craft Philosophy

**Craft adapts to the work, not the other way around.**

If you invoked `/craft`, you have work to do. This command trusts your intuition and adapts to whatever you bring:

| Mode | When Detected | What Happens |
|------|---------------|--------------|
| **Chisel** | UI work, physics keywords | Apply design physics (fast, focused) |
| **Hammer** | Multi-component features | Orchestrate Loa commands (PRD → SDD → Sprint) |
| **Debug** | Fix, broken, failing, error | Investigate, diagnose, resolve |
| **Explore** | Investigate, understand, research | Research, map, discover |

**For UI work, feel emerges from four layers:**
- **Behavioral** — How things respond (sync, timing, confirmation)
- **Animation** — How things move (easing, springs, frequency)
- **Material** — How things look (surface, fidelity, grit)
- **Voice** — How things speak (copy, tone, microcopy)

**For non-UI work, craft still applies:**
- Debug work gets systematic investigation
- Explore work gets thorough research
- The goal is always: help you make progress on product work

**Never reject. Always adapt.**
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
Protected: [pass/fail] | Codebase: [libs] | Patterns: [source component]

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
│  Patterns:     [tokens from existing component]        │
│    Source:     [component read for patterns]           │
│    Colors:     bg-muted, text-muted-foreground         │
│    Radius:     rounded-md                              │
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

<step_minus_1>
### Step -1: Feedback-First Check (Mandatory)

Before starting ANY craft work, check for unaddressed feedback.

**Feature Flag Check:**
```
Read grimoires/sigil/constitution.yaml
If features.feedback_first == false: Skip to Step 0
```

**Check 1: Recent Signals for Same Component**
```
Read: grimoires/sigil/taste.md (last 10 signals)
Filter: component.name matches current target (fuzzy)
Look for: REJECT or MODIFY signals
```

If found:
```
┌─ Prior Feedback Detected ──────────────────────────────────┐
│                                                            │
│  Component: {component name} has recent feedback:          │
│                                                            │
│  {timestamp}: MODIFY                                       │
│  Changed: {from} → {to}                                    │
│  Learning: {inference}                                     │
│                                                            │
│  [a] Apply learnings automatically                         │
│  [i] Ignore and proceed fresh                              │
│  [r] Review all signals for this component                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Check 2: Loop Detection State**
```
Read: grimoires/sigil/craft-state.md
Check: loop_detection.triggered == true
```

If triggered:
```
┌─ Loop Detection Active ────────────────────────────────────┐
│                                                            │
│  Previous session detected pattern: {pattern}              │
│  Escalation was offered: {yes/no}                          │
│  User chose: {choice}                                      │
│                                                            │
│  Consider a different approach this time.                  │
│                                                            │
│  [c] Continue with fresh approach                          │
│  [e] View escalation options again                         │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Check 3: Pending Learnings**
```
Read: grimoires/sigil/pending-learnings.md (if exists)
Filter: effect_type matches current detection
Look for: Unapproved learnings with evidence
```

If relevant:
```
┌─ Pending Learning Available ───────────────────────────────┐
│                                                            │
│  There's an unapproved learning relevant to this:          │
│                                                            │
│  Discovery: {discovery}                                    │
│  Evidence: {file:line}                                     │
│                                                            │
│  [a] Apply this learning                                   │
│  [s] Skip for now                                          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Skip Conditions**:
- User says "fresh start" or "ignore feedback"
- No signals, no loop state, no learnings found
- Feature flag `features.feedback_first` is false
</step_minus_1>

<step_0>
### Step 0: Track Progress

Use TodoWrite to track this workflow:
```
-1. [ ] Feedback-first check (prior signals, loop state, learnings)
0. [ ] Load NOTES.md + craft state (session recovery)
1. [ ] Load rules via RLM (on-demand)
2. [ ] Check loop detection (iteration 3+)
3. [ ] Check session health (drift indicators)
4. [ ] Discover context (libs, conventions, existing code)
5. [ ] Detect craft type and effect
6. [ ] Show physics analysis
7. [ ] Get user confirmation
8. [ ] Apply changes
9. [ ] Visual verification (if URL provided)
10. [ ] Collect feedback
11. [ ] Log taste signal + update craft state + NOTES.md
```
Mark each in_progress then completed as you work.

**Session health check first**: If drift is at red threshold, pause workflow and show warning before continuing.
</step_0>

<step_0_1>
### Step 0.1: Load Session Memory + Craft State

Check for existing session state to enable recovery and iterative debugging.

**Feature Flag Check:**
```
Read grimoires/sigil/constitution.yaml
notes_memory_enabled = features.notes_memory (default: true)
```

**Read NOTES.md (if enabled):**
```
If notes_memory_enabled:
  Read grimoires/sigil/NOTES.md
  Extract:
    - Current Focus (component, craft type, target file)
    - Physics Decisions (effect, timing, animation)
    - Blockers (unresolved questions)
    - Session Continuity (last action, next action)

  If NOTES.md has content AND matches current target:
    Show: "Resuming from NOTES.md: {last_action}"
    Apply prior physics decisions as defaults
```

**Read craft-state.md:**
```
Read grimoires/sigil/craft-state.md
Parse YAML frontmatter
```

**Session Continuity Check:**
```
If session.id is not null:
  Check if session.last_updated < 1 hour ago
  Check if session.component matches current target (fuzzy match)

  If same component AND < 1 hour:
    → Continue existing session
    → Increment iteration count
    → Show: "Continuing session #{iteration} for {component}"

  If different component OR > 1 hour:
    → Archive old session to grimoires/sigil/context/archive/{session_id}.md
    → Start new session
    → Show: "Starting new session (previous: {old_component})"
```

**New Session Initialization:**
```yaml
session:
  id: "{timestamp}-{component}-{random4}"
  started: "{ISO8601}"
  last_updated: "{ISO8601}"
  component: "{detected component name}"
  file: "{target file path}"

iterations:
  - number: 1
    timestamp: "{ISO8601}"
    action: "Initial craft"
    result: "PENDING"
    hypothesis: "{user's request}"
```

**Archive Format:**
When archiving old sessions, write to:
`grimoires/sigil/context/archive/{session_id}.md`

Include:
- Full session metadata
- All iterations with results
- Key findings
- Final state
</step_0_1>

<step_0_2>
### Step 0.2: Load Rules via RLM (On-Demand)

Load additional rules based on detected patterns. This reduces context from ~10k tokens to ~2-4k tokens.

**RLM Loading Algorithm:**
```
1. Parse user's request for triggers:
   - Keywords: claim, stake, withdraw, delete, toggle, etc.
   - Types: Currency, Wei, BigInt (if examining code)
   - Effects: Financial, Destructive, Standard, Local
   - Hooks: useWriteContract, useQuery, etc. (if in code context)

2. Read .claude/rules/index.yaml

3. For each rule in index.yaml:
   If any trigger matches user's request:
     Add rule to load_queue with priority

4. Sort load_queue by priority (1 = highest)

5. Load rules until token budget (~4000) reached:
   # Base: always-loaded rules (from index.yaml)
   loaded_tokens = 1000  # rlm-core-summary.md
   loaded_tokens += 800  # 04-sigil-protected.md (required)
   # Total base: ~1800 tokens, leaving ~2200 for triggered rules

   For each rule in sorted load_queue:
     If loaded_tokens + rule.tokens <= 4000:
       Read rule file
       Add to active_rules
       loaded_tokens += rule.tokens
     Else:
       Stop loading (budget exceeded)

6. If iteration > 1 (continuation session):
   Check craft-state.md for rules_loaded from previous iteration
   For each rule in skip_on_continuation:
     ONLY skip if rule appears in previous rules_loaded
     (Don't skip if scope changed or rule never loaded)
```

**Show RLM Loading (verbose mode):**
```
┌─ RLM Rules Loaded ─────────────────────────────────────┐
│                                                        │
│  Triggers detected:                                    │
│  • "claim" → Financial effect                          │
│  • "useWriteContract" → Web3 flow                      │
│                                                        │
│  Rules loaded (~2.8k tokens):                          │
│  ✓ rlm-core-summary.md (always)                        │
│  ✓ 04-sigil-protected.md (always)                      │
│  ✓ 19-sigil-data-physics.md (web3 trigger)             │
│  ✓ 20-sigil-web3-flows.md (claim trigger)              │
│                                                        │
│  Skipped (budget/not triggered):                       │
│  ○ 03-sigil-patterns.md (continuation)                 │
│  ○ 16-react-js.md (no performance trigger)             │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Compact mode RLM (after 3+ accepts):**
```
RLM: +data-physics +web3-flows (~2.8k tokens)
```

**Required Rules (always loaded regardless of triggers):**
- rlm-core-summary.md (decision tree)
- 04-sigil-protected.md (non-negotiable capabilities)
</step_0_2>

<step_0_3>
### Step 0.3: Check Loop Detection (Iteration 3+)

When iteration count reaches 3 or higher, check for debugging loops.

**Loop Detection Patterns:**

| Pattern | Detection | Indicates |
|---------|-----------|-----------|
| each_fix_reveals_new_issue | All recent results contain "PARTIAL", "reveals", or "but" | Need deeper diagnosis |
| repeated_fix_attempt | Same action attempted 2+ times | Need different approach |
| stuck_hypothesis | Same hypothesis across 3+ iterations | Need fresh perspective |

**Loop Detection Algorithm:**
```
If iterations.length >= 3:
  recent = iterations.slice(-3)

  # Check for each_fix_reveals_new_issue
  partial_count = recent.filter(i =>
    i.result == "PARTIAL" OR
    i.action.includes("reveals") OR
    i.action.includes("but")
  ).length

  If partial_count >= 2:
    pattern = "each_fix_reveals_new_issue"
    recommendation = "/observe diagnose"

  # Check for repeated_fix_attempt
  actions = recent.map(i => normalize(i.action))
  If hasDuplicates(actions):
    pattern = "repeated_fix_attempt"
    recommendation = "/understand"

  # Check for stuck_hypothesis
  hypotheses = recent.map(i => normalize(i.hypothesis))
  If allSame(hypotheses):
    pattern = "stuck_hypothesis"
    recommendation = "/plan-and-analyze"
```

**Show Escalation Protocol (when loop detected):**
```
┌─ Loop Detected ────────────────────────────────────────┐
│                                                        │
│  Iteration: 4 of {component}                           │
│  Pattern: each_fix_reveals_new_issue                   │
│                                                        │
│  Recent attempts:                                      │
│  • #2: Fixed X → revealed Y                            │
│  • #3: Fixed Y → revealed Z                            │
│  • #4: About to fix Z...                               │
│                                                        │
│  This suggests a deeper issue. Options:                │
│                                                        │
│  [d] /observe diagnose - Get diagnostic data           │
│  [u] /understand - Research the system                 │
│  [p] /plan-and-analyze - Full architecture review      │
│  [c] Continue anyway (iteration 4)                     │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Escalation Routing:**
- [d] → Invoke `/observe diagnose {component}`
- [u] → Invoke `/understand {component}`
- [p] → Invoke `/plan-and-analyze {component}`
- [c] → Continue with current craft, log escalation_offered: true

**Update craft-state.md on escalation:**
```yaml
loop_detection:
  triggered: true
  pattern: "each_fix_reveals_new_issue"
  escalation_offered: true
  user_choice: "diagnose"  # or "understand", "plan", "continue"
```
</step_0_3>

<step_0_4>
### Step 0.4: PRD Existence Check

Before mode detection, check if a recent PRD exists that should continue through the Loa flow.

**Check for recent PRD:**
```
Glob: grimoires/loa/prd*.md
For each file found:
  - Parse first H1 heading as title
  - Check file modification time (recent = < 24h)
```

**If recent PRD found:**
```
┌─ PRD Detected ────────────────────────────────────────────┐
│                                                           │
│  Found: {filename} ({age})                                │
│  Topic: {title from first H1}                             │
│                                                           │
│  Options:                                                 │
│  1. Continue to /architect → Design (SDD)                 │
│  2. Implement directly (skip architecture)                │
│  3. Start fresh (ignore existing PRD)                     │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**Routing:**
- Option 1: Invoke `Skill tool` with `skill: "architect"`
- Option 2: Skip to Step 1 (context discovery, Chisel path)
- Option 3: Continue to Step 0.5 (mode detection)

**If no recent PRD:**
- Continue to Step 0.5 (mode detection)
</step_0_4>

<step_0_5>
### Step 0.5: Mode Detection

Before discovering context, determine what kind of work this is. /craft adapts to four modes:

| Mode | Purpose | Output |
|------|---------|--------|
| **Chisel** | Fine-grained UI work | Design physics applied |
| **Hammer** | Full-stack features | Loa orchestration |
| **Debug** | Investigation & fixes | Root cause + solution |
| **Explore** | Research & understanding | Insights + recommendations |

**Check for existing hammer state first:**
```
If grimoires/sigil/hammer-state.json exists AND active == true:
  Show: "Hammer mode in progress: '{feature}' at phase '{phase}'"
  Options:
    1. Resume from current phase
    2. Abandon and start fresh
    3. Switch to another mode
```

**Check for flag overrides:**
- `--hammer` flag → Force hammer mode
- `--chisel` flag → Force chisel mode
- `--debug` flag → Force debug mode
- `--explore` flag → Force explore mode

**Mode Detection Algorithm:**

1. **Scan for Debug signals** (check first — highest specificity):
| Signal Type | Patterns |
|-------------|----------|
| Keywords | "fix", "broken", "failing", "error", "issue", "bug", "debug", "not working", "crash", "undefined" |
| Error context | Stack traces, error messages in input |
| Deployment | "deploy", "deployment", "build failed", "CI", "pipeline" |

If 2+ debug signals detected → **DEBUG mode**

2. **Scan for Explore signals** (check second):
| Signal Type | Patterns |
|-------------|----------|
| Keywords | "investigate", "understand", "research", "why", "how does", "explore", "map", "discover" |
| Questions | Input ends with "?" |
| Context seeking | "what is", "where is", "how is", "explain" |

If 2+ explore signals detected → **EXPLORE mode**

3. **Scan for Hammer signals** (+1 each):
| Signal Type | Patterns |
|-------------|----------|
| Keywords | "feature", "system", "flow", "pipeline", "integrate", "build", "implement", "create" |
| Contract refs | `/\b(contract|vault|pool|token|staking)\b/i` |
| API refs | `/\b(endpoint|api|GET|POST|fetch.*backend)\b/i` |
| Indexer refs | `/\b(indexer|index|sync|historical|events)\b/i` |
| Multi-component | "feature", "flow", scope > 5 words |
| Framework refs | `/\b(command|skill|workflow|integration|protocol|rule)\b/i` |
| Grimoire refs | `/\b(grimoire|experiments|observations|taste|moodboard)\b/i` |
| Multi-file hints | "structure", "across", "throughout", "system-wide" |

4. **Scan for Chisel signals** (-1 each):
| Signal Type | Patterns |
|-------------|----------|
| Keywords | "button", "modal", "animation", "hover", "style", "improve", "polish", "adjust", "tweak", "refine" |
| Single component | Single noun target, existing file reference |
| Physics-only | "timing", "motion", "color", "spacing" |

**Scoring (for Hammer vs Chisel):**
- Each hammer signal: +1
- Each chisel signal: -1
- Score >= 2: **HAMMER mode**
- Score < 2: **CHISEL mode**

**If DEBUG detected:**

```
┌─ Mode: DEBUG ─────────────────────────────────────────────┐
│                                                           │
│  Detected: [list debug signals]                           │
│                                                           │
│  I'll investigate systematically:                         │
│  1. Reproduce the issue                                   │
│  2. Identify root cause                                   │
│  3. Propose fix                                           │
│  4. Verify resolution                                     │
│                                                           │
│  [Proceed] [Switch to Chisel] [Switch to Explore]         │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**If EXPLORE detected:**

```
┌─ Mode: EXPLORE ───────────────────────────────────────────┐
│                                                           │
│  Detected: [list explore signals]                         │
│                                                           │
│  I'll research thoroughly:                                │
│  1. Map the relevant code/systems                         │
│  2. Understand the architecture                           │
│  3. Document findings                                     │
│  4. Provide recommendations                               │
│                                                           │
│  [Proceed] [Switch to Debug] [Switch to Chisel]           │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**If HAMMER detected:**

```
┌─ Mode: HAMMER ────────────────────────────────────────────┐
│                                                           │
│  Detected: [list hammer signals]                          │
│                                                           │
│  Full-stack implementation requires architecture.         │
│  I'll run the complete sequence:                          │
│                                                           │
│  1. /plan-and-analyze → Requirements (PRD)                │
│  2. /architect → Design (SDD)                             │
│  3. /sprint-plan → Tasks                                  │
│  4. Review plan                                           │
│  5. /run sprint-plan → Implementation                     │
│                                                           │
│  [Proceed] [Switch to Chisel]                             │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**If CHISEL detected:**
- Proceed directly to Step 1 (no prompt needed)
- Optional: Show brief note if close to threshold
</step_0_5>

<hammer_workflow>
## Hammer Workflow

When user confirms hammer mode, execute this orchestrated sequence. Hammer mode invokes Loa commands to produce complete architecture before implementation.

<step_h1>
### Step H1: Check Existing Artifacts

Check for existing Loa artifacts that may satisfy requirements:

```
Read grimoires/loa/prd.md (if exists)
Read grimoires/loa/sdd.md (if exists)
Read grimoires/loa/sprint.md (if exists)
```

**Staleness thresholds:**
- PRD/SDD: Stale after 7 days
- Sprint: Stale after 3 days

**Relevance check:**
- Does the artifact title/topic match the current feature request?
- Parse first 50 lines for feature keywords

**If relevant, fresh artifacts exist:**
```
┌─ Existing Artifacts Detected ────────────────────────────┐
│                                                          │
│  PRD: grimoires/loa/prd.md (2 days old) ✓ relevant      │
│  SDD: grimoires/loa/sdd.md (2 days old) ✓ relevant      │
│                                                          │
│  Options:                                                │
│  1. Use existing → Skip to sprint planning               │
│  2. Regenerate PRD → Full sequence                       │
│  3. Regenerate SDD only → Keep PRD, redo architecture    │
│  4. Chisel anyway → UI only                              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**If no artifacts or stale/irrelevant:**
- Initialize hammer-state.json
- Proceed to H2

**State initialization:**
```json
{
  "active": true,
  "feature": "[user's feature description]",
  "started_at": "[ISO timestamp]",
  "phase": "initialized",
  "phases_completed": [],
  "context_seeded": { "observations": 0, "taste_patterns": 0 },
  "components_identified": []
}
```
Write to `grimoires/sigil/hammer-state.json`
</step_h1>

<step_h2>
### Step H2: Context Aggregation & /plan-and-analyze

**Aggregate Sigil context for seeding:**

1. **Read observations** (if exist):
   ```
   Scan grimoires/sigil/observations/*.diagnostic.md
   Scan grimoires/sigil/observations/user-insights.md
   ```
   Extract: user quotes, user types, gap classifications, physics implications

2. **Read taste patterns** (if exist):
   ```
   Read grimoires/sigil/taste.md
   ```
   Extract: last 10 signals, timing patterns, animation preferences

3. **Format context seed:**
   ```markdown
   ## Sigil Context (Pre-seeded)

   ### User Observations
   [If observations found:]
   - @{user}: "{quote truncated to 50 chars}..."
     → User type: {type}
     → Physics implication: {implication}

   [If no observations:]
   (No user observations available)

   ### Taste Patterns
   [If patterns found:]
   - {pattern}: {preference} ({count} signals)

   [If no patterns:]
   (No taste patterns established yet)

   ### Physics Requirements
   Based on Sigil's design physics:
   - Financial operations: Pessimistic sync, 800ms timing, confirmation required
   - Protected capabilities: Cancel always visible, error recovery available
   - Touch targets: Minimum 44px
   ```

4. **Invoke /plan-and-analyze:**
   ```
   Use Skill tool:
     skill: "plan-and-analyze"
     args: "{feature description}

     {formatted context seed}"
   ```

5. **Wait for PRD completion** (grimoires/loa/prd.md created)

6. **Update state:**
   ```json
   {
     "phase": "prd_complete",
     "phases_completed": [
       { "phase": "prd", "completed_at": "[timestamp]", "artifact": "grimoires/loa/prd.md" }
     ],
     "context_seeded": { "observations": [count], "taste_patterns": [count] }
   }
   ```

7. **Proceed to H3**
</step_h2>

<step_h3>
### Step H3: Invoke /architect

1. **Invoke /architect:**
   ```
   Use Skill tool:
     skill: "architect"
   ```
   (No args needed — reads PRD from grimoires/loa/prd.md)

2. **Wait for SDD completion** (grimoires/loa/sdd.md created)

3. **Update state:**
   ```json
   {
     "phase": "sdd_complete",
     "phases_completed": [
       ...,
       { "phase": "sdd", "completed_at": "[timestamp]", "artifact": "grimoires/loa/sdd.md" }
     ]
   }
   ```

4. **Proceed to H4**
</step_h3>

<step_h4>
### Step H4: Invoke /sprint-plan & Extract Components

1. **Invoke /sprint-plan:**
   ```
   Use Skill tool:
     skill: "sprint-plan"
   ```
   (No args needed — reads PRD and SDD)

2. **Wait for sprint.md completion** (grimoires/loa/sprint.md created)

3. **Parse sprint.md for components:**
   - Extract task list
   - Identify UI components (frontend tasks)
   - Classify physics type for each UI component:

   | Component Keywords | Physics Type |
   |-------------------|--------------|
   | claim, withdraw, transfer, payment, stake | Financial |
   | delete, remove, revoke, destroy | Destructive |
   | archive, trash, dismiss | Soft Delete |
   | save, update, create, like, follow | Standard |
   | toggle, switch, theme, filter | Local |

4. **Update state:**
   ```json
   {
     "phase": "sprint_complete",
     "phases_completed": [
       ...,
       { "phase": "sprint", "completed_at": "[timestamp]", "artifact": "grimoires/loa/sprint.md" }
     ],
     "components_identified": [
       { "name": "ComponentName", "type": "frontend|backend|indexer", "physics": "financial|standard|..." }
     ]
   }
   ```

5. **Proceed to H5**
</step_h4>

<step_h5>
### Step H5: Present Plan Summary & Handoff

Display complete plan summary:

```
┌─ Hammer Plan Complete ────────────────────────────────────┐
│                                                           │
│  Feature: {feature description}                           │
│                                                           │
│  Artifacts:                                               │
│  • PRD: grimoires/loa/prd.md                             │
│  • SDD: grimoires/loa/sdd.md                             │
│  • Sprint: grimoires/loa/sprint.md                       │
│                                                           │
│  Components to implement:                                 │
│  [For each component_identified:]                         │
│  {n}. [{type}] {name} {physics hint if frontend}          │
│                                                           │
│  Example:                                                 │
│  1. [Backend] RewardsClaimed indexer handler              │
│  2. [Backend] GET /rewards/:address endpoint              │
│  3. [Frontend] useRewards hook                            │
│  4. [Frontend] RewardsList (standard physics)             │
│  5. [Frontend] ClaimButton (financial physics)            │
│                                                           │
│  ─────────────────────────────────────────────────────────│
│                                                           │
│  Ready to implement.                                      │
│  Review the artifacts above, then run:                    │
│                                                           │
│    /run sprint-plan                                       │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**Update state:**
```json
{
  "phase": "awaiting_execution"
}
```

**Workflow stops here.**
- User reviews artifacts (PRD, SDD, sprint)
- User makes any manual adjustments
- User runs `/run sprint-plan` when ready
- Loa handles execution with Sigil physics applied to UI tasks

**On /run sprint-plan completion:**
- Clear hammer-state.json (delete or set active: false)
- Log completion to taste.md
</step_h5>

<hammer_error_handling>
### Hammer Error Handling

**Loa command failures:**

| Failure | Recovery |
|---------|----------|
| `/plan-and-analyze` fails | Offer: 1) Retry, 2) Chisel fallback |
| `/architect` fails | Offer: 1) Retry, 2) Manual SDD creation guidance |
| `/sprint-plan` fails | Offer: 1) Retry, 2) Manual task breakdown |

**State corruption:**

| Issue | Recovery |
|-------|----------|
| hammer-state.json invalid JSON | Delete file, start fresh |
| Phase says "prd_complete" but no PRD exists | Trust artifacts, regenerate state |
| Orphaned state (>24h old, no activity) | Prompt: 1) Resume, 2) Abandon |

**Show clear recovery path:**
```
┌─ Hammer Error ────────────────────────────────────────────┐
│                                                           │
│  /architect failed: [error message]                       │
│                                                           │
│  Options:                                                 │
│  1. Retry /architect                                      │
│  2. Create SDD manually (I'll guide you)                  │
│  3. Abandon hammer, switch to chisel                      │
│                                                           │
└───────────────────────────────────────────────────────────┘
```
</hammer_error_handling>

<hammer_safety>
### Hammer Mode Safety

**Feature Flag Check:**
```
Read grimoires/sigil/constitution.yaml
If features.run_mode_safety == false: Skip safety checks
```

**1. Opt-In Confirmation:**

Before starting hammer mode, always require explicit confirmation:

```
┌─ Hammer Mode Confirmation ────────────────────────────────┐
│                                                           │
│  You're about to enter Hammer mode.                       │
│                                                           │
│  This will:                                               │
│  • Run multiple Loa commands autonomously                 │
│  • Create/modify PRD, SDD, and Sprint files               │
│  • May take extended time to complete                     │
│                                                           │
│  Feature: {feature description}                           │
│                                                           │
│  [y] Proceed with Hammer mode                             │
│  [n] Cancel, return to craft selection                    │
│  [c] Switch to Chisel mode (UI only)                      │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**2. Circuit Breaker:**

Track consecutive failures. Stop on 2 consecutive failures.

```json
// In hammer-state.json
{
  "consecutive_failures": 0,
  "last_failure": null,
  "circuit_breaker_triggered": false
}
```

**On failure:**
- Increment `consecutive_failures`
- If `consecutive_failures >= 2`:
  - Set `circuit_breaker_triggered: true`
  - Show circuit breaker message

```
┌─ Circuit Breaker Triggered ───────────────────────────────┐
│                                                           │
│  Hammer mode stopped after 2 consecutive failures.        │
│                                                           │
│  Last failures:                                           │
│  1. {phase}: {error summary}                              │
│  2. {phase}: {error summary}                              │
│                                                           │
│  This safety measure prevents runaway failures.           │
│                                                           │
│  Options:                                                 │
│  [r] Reset circuit breaker and retry last phase           │
│  [d] Enter debug mode to investigate                      │
│  [a] Abandon hammer mode                                  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**On success:** Reset `consecutive_failures` to 0

**3. Phase Checkpoints:**

After each Loa command, create a checkpoint:

```json
// Update hammer-state.json after each phase
{
  "checkpoints": [
    {
      "phase": "prd",
      "timestamp": "{ISO8601}",
      "artifact": "grimoires/loa/prd.md",
      "success": true
    },
    {
      "phase": "sdd",
      "timestamp": "{ISO8601}",
      "artifact": "grimoires/loa/sdd.md",
      "success": true
    }
  ]
}
```

Show progress after each checkpoint:

```
┌─ Checkpoint: SDD Complete ────────────────────────────────┐
│                                                           │
│  ✓ PRD created                                            │
│  ✓ SDD created ← current                                  │
│  ○ Sprint planning                                        │
│  ○ Implementation                                         │
│                                                           │
│  Elapsed: 12 minutes                                      │
│                                                           │
│  [c] Continue to sprint planning                          │
│  [p] Pause here (can resume later)                        │
│  [r] Review artifacts before continuing                   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**4. Duration Warning:**

Track elapsed time. Warn at 30 minutes:

```
┌─ Duration Warning ────────────────────────────────────────┐
│                                                           │
│  Hammer mode has been running for 30 minutes.             │
│                                                           │
│  Progress:                                                │
│  ✓ PRD, SDD complete                                      │
│  → Sprint planning in progress                            │
│                                                           │
│  [c] Continue                                             │
│  [p] Pause and save progress                              │
│  [a] Abort hammer mode                                    │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

Repeat warning every 30 minutes.

**5. Maximum File Limit:**

Hammer mode has a maximum of 10 files per batch operation.

```
┌─ File Limit Warning ──────────────────────────────────────┐
│                                                           │
│  This operation would modify 15 files.                    │
│  Maximum per batch: 10                                    │
│                                                           │
│  Options:                                                 │
│  [s] Split into 2 batches                                 │
│  [p] Pick 10 most important files                         │
│  [a] Abort operation                                      │
│                                                           │
└───────────────────────────────────────────────────────────┘
```
</hammer_safety>
</hammer_workflow>

<debug_workflow>
## Debug Workflow

When user confirms debug mode, execute systematic investigation.

<step_d1>
### Step D1: Understand the Problem

1. **Parse the error/issue description:**
   - Extract error messages, stack traces
   - Identify affected files/components
   - Note reproduction steps if provided

2. **Gather context:**
   ```
   Read relevant error logs
   Read mentioned files
   Check recent changes (git diff, git log)
   ```

3. **Show understanding:**
   ```
   ┌─ Debug Analysis ───────────────────────────────────────────┐
   │                                                            │
   │  Issue: [description]                                      │
   │  Affected: [files/components]                              │
   │  Error: [key error message if present]                     │
   │                                                            │
   │  Hypothesis: [initial theory based on signals]             │
   │                                                            │
   │  Investigation plan:                                       │
   │  1. [first thing to check]                                 │
   │  2. [second thing to check]                                │
   │  3. [third thing to check]                                 │
   │                                                            │
   │  Proceed with investigation? (y/n)                         │
   │                                                            │
   └────────────────────────────────────────────────────────────┘
   ```
</step_d1>

<step_d2>
### Step D2: Investigate

1. **Follow the investigation plan:**
   - Check each item systematically
   - Document findings as you go
   - Update hypothesis if evidence contradicts

2. **Root cause identification:**
   - Trace the issue to its source
   - Verify with evidence (logs, code, tests)
   - Consider edge cases

3. **Check for escalation triggers** (see `<escalation_protocol>`):
   - If > 5 files touched, or 2+ systems involved → Show Scope Check
   - If root cause is architectural → Suggest escalation to Hammer
   - If investigation depth > 3 "why" levels → Checkpoint findings

4. **Show findings:**
   ```
   ┌─ Root Cause Found ─────────────────────────────────────────┐
   │                                                            │
   │  Root cause: [description]                                 │
   │  Location: [file:line]                                     │
   │  Evidence: [what confirmed this]                           │
   │                                                            │
   │  Proposed fix:                                             │
   │  [description of fix]                                      │
   │                                                            │
   │  Apply fix? (y/n)                                          │
   │                                                            │
   └────────────────────────────────────────────────────────────┘
   ```
</step_d2>

<step_d3>
### Step D3: Fix and Verify

1. **Apply the fix:**
   - Make minimal, targeted changes
   - Preserve existing behavior where possible
   - Add guards against recurrence if appropriate

2. **Verify resolution:**
   - Run relevant tests if available
   - Manually verify if needed
   - Check for side effects

3. **Log to taste.md:**
   ```markdown
   ## [YYYY-MM-DD HH:MM] | DEBUG_RESOLVED
   Issue: [description]
   Root cause: [cause]
   Fix: [what was changed]
   Files: [files modified]
   ---
   ```
</step_d3>

<debug_error_handling>
### Debug Error Handling

| Situation | Recovery |
|-----------|----------|
| Can't reproduce | Ask for more details, check environment differences |
| Multiple possible causes | Investigate each, prioritize by likelihood |
| Fix doesn't work | Re-analyze, check assumptions |
| Out of scope | Suggest escalation, document findings |

**If stuck:**
```
┌─ Investigation Blocked ───────────────────────────────────────┐
│                                                               │
│  I've checked [what was checked] but can't identify the root  │
│  cause. The issue might require:                              │
│                                                               │
│  • More context about [specific thing]                        │
│  • Access to [logs/systems not available]                     │
│  • Domain expertise in [area]                                 │
│                                                               │
│  What I've learned so far:                                    │
│  [summary of findings]                                        │
│                                                               │
│  [Provide more context] [Try different approach] [Stop here]  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```
</debug_error_handling>
</debug_workflow>

<explore_workflow>
## Explore Workflow

When user confirms explore mode, execute thorough research.

<step_e1>
### Step E1: Frame the Question

1. **Parse the exploration request:**
   - What is the user trying to understand?
   - What scope? (specific file, system, architecture)
   - What's the end goal?

2. **Show exploration plan:**
   ```
   ┌─ Explore Analysis ─────────────────────────────────────────┐
   │                                                            │
   │  Question: [what user wants to understand]                 │
   │  Scope: [what will be explored]                            │
   │                                                            │
   │  Exploration plan:                                         │
   │  1. [first area to explore]                                │
   │  2. [second area to explore]                               │
   │  3. [third area to explore]                                │
   │                                                            │
   │  Proceed? (y/n)                                            │
   │                                                            │
   └────────────────────────────────────────────────────────────┘
   ```
</step_e1>

<step_e2>
### Step E2: Research

1. **Map the territory:**
   - Read relevant files
   - Trace dependencies
   - Identify patterns and relationships

2. **Document as you go:**
   - Key files and their purposes
   - Important functions/classes
   - Data flows and relationships

3. **Check for escalation triggers** (see `<escalation_protocol>`):
   - If exploration reveals missing infrastructure → Show Scope Check
   - If 2+ domain boundaries crossed → Suggest escalation to Hammer
   - If findings require architectural changes → Checkpoint and escalate

4. **Use Explore agent if needed:**
   - For large codebases, spawn Explore subagent
   - Aggregate findings
</step_e2>

<step_e3>
### Step E3: Synthesize and Report

1. **Present findings:**
   ```
   ┌─ Exploration Complete ─────────────────────────────────────┐
   │                                                            │
   │  Question: [original question]                             │
   │                                                            │
   │  Summary:                                                  │
   │  [concise answer to the question]                          │
   │                                                            │
   │  Key findings:                                             │
   │  • [finding 1 with file:line reference]                    │
   │  • [finding 2 with file:line reference]                    │
   │  • [finding 3 with file:line reference]                    │
   │                                                            │
   │  Architecture notes:                                       │
   │  [relevant architectural context]                          │
   │                                                            │
   │  Recommendations:                                          │
   │  [if applicable, suggestions for next steps]               │
   │                                                            │
   └────────────────────────────────────────────────────────────┘
   ```

2. **Log to taste.md:**
   ```markdown
   ## [YYYY-MM-DD HH:MM] | EXPLORE_COMPLETE
   Question: [what was explored]
   Summary: [key insight]
   Files reviewed: [count]
   ---
   ```
</step_e3>
</explore_workflow>

<escalation_protocol>
## Escalation Protocol

Debug and Explore modes can discover that work requires architecture. This protocol prevents context rot by detecting escalation early and preserving findings.

### Escalation Triggers

During Debug or Explore, watch for these signals:

| Signal | Threshold | Indicates |
|--------|-----------|-----------|
| **Files touched** | > 5 files in investigation | Cross-cutting concern |
| **Domain boundaries** | 2+ systems involved | Integration work |
| **Missing infrastructure** | API/indexer/contract needed | Full-stack work |
| **Root cause is architectural** | Design flaw, not bug | Needs redesign |
| **Investigation depth** | 3+ levels of "why" | Systemic issue |

### Mid-Investigation Check

After Step D2 (Investigate) or Step E2 (Research), evaluate:

```
┌─ Scope Check ──────────────────────────────────────────────────┐
│                                                                │
│  Investigation scope has grown:                                │
│  • Files examined: [count]                                     │
│  • Systems involved: [list]                                    │
│  • Root cause type: [bug | design | architecture]              │
│                                                                │
│  This may require Hammer mode (full architecture).             │
│                                                                │
│  Options:                                                      │
│  1. Continue debugging (local fix)                             │
│  2. Escalate to Hammer (preserve findings, plan architecture)  │
│  3. Document and stop (hand off to human)                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Delta-Synthesis (Preserve Findings)

When escalating or at investigation milestones, checkpoint findings to `grimoires/sigil/craft-state.md`:

```markdown
## [YYYY-MM-DD HH:MM] | INVESTIGATION_CHECKPOINT

### Context
Mode: Debug | Explore
Original request: [user's request]

### Findings So Far
- [Finding 1 with file:line evidence]
- [Finding 2 with file:line evidence]
- [Finding 3 with file:line evidence]

### Hypothesis
[Current understanding of the issue/system]

### Escalation Reason
[Why this needs architecture vs. local fix]

### Recommended Next Mode
Hammer | Continue Debug | Continue Explore

### Seed Context for Next Mode
[Key information to pass forward]
---
```

### Escalation Handoff

When user chooses to escalate:

1. **Checkpoint findings** to `grimoires/sigil/craft-state.md`
2. **Log to taste.md**: `DEBUG_ESCALATED` or `EXPLORE_ESCALATED`
3. **Show handoff summary**:
   ```
   ┌─ Escalating to Hammer Mode ─────────────────────────────────┐
   │                                                             │
   │  Findings preserved: grimoires/sigil/craft-state.md        │
   │                                                             │
   │  Key discoveries:                                           │
   │  • [discovery 1]                                            │
   │  • [discovery 2]                                            │
   │                                                             │
   │  These findings will seed /plan-and-analyze.               │
   │                                                             │
   │  Proceed with Hammer sequence? (y/n)                        │
   │                                                             │
   └─────────────────────────────────────────────────────────────┘
   ```
4. **Seed Hammer**: Pass findings to `/plan-and-analyze` context

### Lightweight Identifiers

To preserve context across escalation, use lightweight identifiers (not full content):

```
# Instead of copying 500 lines of code:
${PROJECT_ROOT}/src/auth/middleware.ts:45-89 (session validation)
${PROJECT_ROOT}/src/api/routes.ts:120 (route protection)

# Instead of full error traces:
Error: "Cannot read property 'user' of undefined" at middleware.ts:52
```

This allows findings to survive `/clear` and seed the next mode with minimal tokens.

### Recovery After Escalation

When starting Hammer mode after escalation:

1. Check for `grimoires/sigil/craft-state.md`
2. If exists with recent checkpoint (< 1 hour):
   ```
   ┌─ Previous Investigation Found ──────────────────────────────┐
   │                                                             │
   │  Found checkpoint from Debug/Explore mode:                  │
   │  • Original issue: [description]                            │
   │  • Key findings: [count]                                    │
   │  • Recommended: Hammer mode                                 │
   │                                                             │
   │  Use these findings to seed PRD? (y/n)                      │
   │                                                             │
   └─────────────────────────────────────────────────────────────┘
   ```
3. Seed `/plan-and-analyze` with checkpoint context
</escalation_protocol>

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

**1a-exp. Check for experiment context** (if `--experiment` flag provided):
```
Read grimoires/sigil/experiments/{experiment-id}.md
```
Extract from experiment file:
- **Hypothesis** — What we're testing and why
- **Observations** — Linked user diagnostics with quotes and user types
- **Success criteria** — How we'll measure if this works
- **What we're changing** — Components and physics adjustments
- **PRD reference** — If exists in References section

**If experiment has PRD reference:**
```
Check if corresponding SDD exists (e.g., grimoires/loa/sdd-{name}.md)
If no SDD:
  Suggest: "This experiment has a PRD but no SDD. Run /architect first?"
  Options:
    1. Run /architect to create SDD
    2. Proceed without SDD (skip architecture)
```

**Experiment Context Effects:**
- Include experiment hypothesis in analysis box
- Show linked observations from experiment (already validated)
- Apply physics adjustments specified in "What We're Changing"
- Link resulting taste signal to experiment

**If experiment not found:**
- Warn: "⚠ Experiment {id} not found in grimoires/sigil/experiments/"
- Offer: Continue without experiment link, or specify correct ID

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

**1d-bis. Extract design patterns from existing components** (for Generate craft type):

When generating a NEW component, read ONE existing similar component to extract patterns:

```
Find: src/components/ui/{similar-component}.tsx
  OR: components/{similar-type}.tsx
  OR: Any component with similar purpose (button → button, card → card, etc.)
```

Extract and note:
- **Color tokens**: `bg-muted`, `text-muted-foreground`, `border` (not `bg-black`, `text-white`)
- **Spacing tokens**: `p-4`, `gap-2`, `space-y-3` (note conventions)
- **Border radius**: `rounded-md`, `rounded-lg`, `rounded-xl` (match existing)
- **Shadow patterns**: `shadow-sm`, `shadow-md` (if used)
- **State classes**: hover, focus, disabled patterns

**CRITICAL**: Use discovered tokens, not generic defaults:
| Generic (avoid) | Project Token (use) |
|-----------------|---------------------|
| `bg-black/20` | `bg-muted/50` |
| `rounded-full` | `rounded-md` |
| `text-white` | `text-foreground` |
| `border-gray-200` | `border` |

If no similar component found, check:
- `tailwind.config.js` for custom theme tokens
- `globals.css` for CSS variable definitions
- Design system docs in `grimoires/sigil/context/brand/`

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
│  Iteration:    1 (new session)                         │
│                                                        │
│  Experiment:   (if --experiment flag provided)         │
│                EXP-001: Rewards Visibility             │
│                Hypothesis: Show delta → confidence     │
│                Addressing: alice (trust-checker)       │
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
│  ┌─ Data Physics ──────────────────────────────────┐   │
│  │  (shown when web3 flow detected)                │   │
│  │  Using ON-CHAIN for:                            │   │
│  │  • Transaction values (accuracy required)       │   │
│  │  • Button states (prevent failed tx)            │   │
│  │  Using ENVIO for:                               │   │
│  │  • Display values (acceptable staleness)        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
│  References:   @moodboard/references/stripe/checkout   │
│                                                        │
│  Rules:        01-physics, 19-data-physics, 20-flows   │
│  Tokens:       ~2,800                                  │
│                                                        │
│  Output:       src/components/ClaimButton.tsx          │
│  Protected:    [✓] All capabilities included          │
└────────────────────────────────────────────────────────┘
```

**Experiment Section Rules:**
- Only show if `--experiment` flag provided and experiment exists
- Show: experiment ID, name, abbreviated hypothesis
- Show: primary user being addressed (from experiment's observations)
- Experiment takes priority over generic observation matching

**Observations Section Rules:**
- Only show if matching diagnostics exist for the craft target
- Match by: component name in `related_components`, effect type, or keywords
- Show: user handle, truncated quote (first 30 chars...), user type, physics implication
- If multiple observations match, show up to 2 most recent
- Omit section entirely if no observations match

**Data Physics Section Rules (web3 flows):**
- Only show when web3 flow detected (via RLM triggers)
- Triggers: stake, claim, withdraw, bridge, swap, approve, mint, burn
- Or hooks: useWriteContract, useReadContract, useSendTransaction
- Show "Using ON-CHAIN for" and "Using ENVIO for" guidance
- Omit section if no web3 triggers detected
- See 19-sigil-data-physics.md for full guidance

**RLM Loading Section (verbose mode):**
- Show which rules were loaded via RLM
- Show approximate token count
- Helps user understand context consumption

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

**Grounding Enforcement (lossless_state feature):**

**Feature Flag Check:**
```
Read grimoires/sigil/constitution.yaml
If features.lossless_state == false: Skip grounding requirements
```

When enabled, all claims in analysis MUST cite sources:

| Claim Type | Citation Format |
|------------|-----------------|
| Physics values | `(source: 01-sigil-physics.md)` |
| Timing adjustments | `(source: taste.md signal-{n})` or `(source: Step -1 check)` |
| Material choices | `(source: 07-sigil-material.md)` |
| User preference | `(source: taste.md:{signal-id})` |
| Codebase convention | `(source: {file}:{pattern})` |

**Example grounded analysis:**
```
│  Behavioral    Pessimistic | 800ms | Confirmation              │
│                (source: 01-sigil-physics.md:financial)          │
│                Timing adjusted to 600ms                         │
│                (source: taste.md:signal-12, "faster for DeFi")  │
```

Claims without sources are considered ungrounded and should be flagged.
</step_3>

<step_3b>
### Step 3b: Trajectory Write

**Feature Flag Check:**
```
Read grimoires/sigil/constitution.yaml
If features.trajectory_logging == false: Skip to Step 4
```

Write trajectory entry to `grimoires/sigil/trajectory/{YYYY-MM-DD}-{component-name}.md`:

**If file exists**: Append new session
**If file does not exist**: Create with header

```markdown
# Trajectory: {Component Name}

## Session {ISO8601 timestamp}

### Input
```
User request: "{original request verbatim}"
Component: {component name}
Craft type: {generate/refine/configure/pattern/polish}
```

### Detection
```
Effect detected: {effect type}
Keywords found: [{keywords that triggered detection}]
Types found: [{types that influenced detection}]
Context signals: [{context modifiers}]
Confidence: {HIGH/MEDIUM/LOW}
```

### Decision
```
Physics applied:
  Behavioral: {sync} | {timing} | {confirmation}
  Animation: {easing} | {timing} | {spring if used}
  Material: {surface} | {shadow} | {radius}

Source citations:
  - Timing: {source file and section}
  - Sync: {source file and section}
  - Animation: {source file and section}
  - Material: {source file and section}

Taste overrides:
  - {list any taste.md adjustments, or "None"}

RLM rules loaded:
  - {list of rule files loaded}
```

### Outcome
```
Signal: (pending - filled in Step 7)
Changes: (pending)
Notes: (pending)
```

---
```

**File Naming**:
- Date: Current date in YYYY-MM-DD format
- Component: Kebab-case component name (e.g., `claim-button`)
- Example: `2026-01-20-claim-button.md`

**Append Logic**:
If same component on same day, append `## Session {timestamp}` to existing file.
</step_3b>

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

<step_5_5>
### Step 5.5: Validation Gate

**Feature Flag Check:**
```
Read grimoires/sigil/constitution.yaml
If features.subagent_validators == false: Skip to Step 6
```

**5.5a: Formal Verification (Anchor + Lens)**

When effect is Financial, Destructive, or SoftDelete, AND CLIs are available:

```bash
# Generate request ID
REQUEST_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')

# Write physics request to pub/requests/
mkdir -p grimoires/pub/requests grimoires/pub/responses
cat > "grimoires/pub/requests/${REQUEST_ID}.json" << EOF
{
  "request_id": "${REQUEST_ID}",
  "physics": {
    "effect": "${EFFECT}",
    "behavioral": {
      "sync": "${SYNC}",
      "timing": ${TIMING},
      "confirmation": ${CONFIRMATION}
    },
    "animation": {
      "easing": "${EASING}",
      "duration": ${DURATION}
    },
    "material": {
      "surface": "${SURFACE}",
      "shadow": "${SHADOW}",
      "radius": ${RADIUS}
    }
  },
  "component_code": "${TSX_SOURCE}",
  "keywords": ${KEYWORDS_ARRAY},
  "context": {
    "file_path": "${FILE_PATH}",
    "effect_source": "${EFFECT_SOURCE}"
  }
}
EOF

# Run validations in parallel
anchor validate --request "$REQUEST_ID" &
lens lint --request-id "$REQUEST_ID" &
wait

# Read responses
ANCHOR_RESPONSE=$(cat "grimoires/pub/responses/${REQUEST_ID}-anchor.json" 2>/dev/null)
LENS_RESPONSE=$(cat "grimoires/pub/responses/${REQUEST_ID}-lens.json" 2>/dev/null)
```

**Anchor/Lens Result Handling:**

| Anchor | Lens | Action |
|--------|------|--------|
| valid: true | pass: true | Silent pass → Continue to subagent validators |
| valid: true | pass: false | Show correction box → Apply fix → Retry (max 2) |
| valid: false | Any | Show violation box → Block with prompt |
| Any | correction != null | Apply suggested fix → Re-validate |

See `.claude/rules/22-sigil-anchor-lens.md` for full correction loop and conflict detection.

**Correction Loop (when Lens returns pass: false):**

```
attempt = 1
max_attempts = 2

while lens_response.pass == false AND attempt <= max_attempts:
    # Check if correction context is available
    if lens_response.correction != null:
        # Show correction box
        ┌─ Constraint Violation ─────────────────────────────────┐
        │                                                        │
        │  ✗ {lens_response.correction.violations[0].rule}       │
        │    Rule: {constraint description}                      │
        │    Actual: {current_value}                             │
        │    Required: {required_value}                          │
        │                                                        │
        │  Suggested Fix:                                        │
        │    → {target}: {current} → {required}                  │
        │    Reason: {reason}                                    │
        │                                                        │
        │  [a] Apply fix and regenerate                          │
        │  [o] Override (explain why this is acceptable)         │
        │  [c] Cancel and reconsider                             │
        │                                                        │
        └────────────────────────────────────────────────────────┘

        # Wait for user response
        if response == 'a':
            Apply fix to physics analysis
            Regenerate component with corrected physics
            Re-run lens lint
            attempt++
        elif response == 'o':
            Log override reason to taste.md
            Break loop, proceed to Step 6
        elif response == 'c':
            Cancel craft, return control to user
            Exit

    else:
        # No correction context - surface conflict
        ┌─ Physics Conflict ─────────────────────────────────────┐
        │                                                        │
        │  Validation failed but no automatic fix available.     │
        │                                                        │
        │  Violations:                                           │
        │  {list violations}                                     │
        │                                                        │
        │  [r] Reconsider physics analysis                       │
        │  [o] Override and proceed                              │
        │  [c] Cancel                                            │
        │                                                        │
        └────────────────────────────────────────────────────────┘

if attempt > max_attempts AND lens_response.pass == false:
    # Max attempts reached, surface to user
    ┌─ Correction Loop Exhausted ────────────────────────────────┐
    │                                                            │
    │  After {max_attempts} attempts, validation still fails.    │
    │                                                            │
    │  Remaining violations:                                     │
    │  {list remaining violations}                               │
    │                                                            │
    │  Options:                                                  │
    │  [o] Override and proceed (document why)                   │
    │  [r] Return to physics analysis                            │
    │  [c] Cancel craft                                          │
    │                                                            │
    └────────────────────────────────────────────────────────────┘
```

**Skip when:**
- CLIs not installed (check with `command -v anchor` and `command -v lens`)
- Effect is Standard, Local, or Navigation (low-stakes)
- User has disabled formal verification in constitution.yaml

**5.5b: Subagent Validators**

Run validators in sequence:

**1. Physics Validator**
```
Run: .claude/subagents/physics-validator.md
Input: Generated/modified file path
```

**2. Codebase Validator**
```
Run: .claude/subagents/codebase-validator.md
Input: Generated/modified file path, discovered conventions
```

**Verdict Handling:**

| Physics Result | Codebase Result | Action |
|----------------|-----------------|--------|
| COMPLIANT | COMPLIANT | Silent pass → Step 6 |
| COMPLIANT | DRIFT_DETECTED | Show warning → proceed to Step 6 |
| DRIFT_DETECTED | COMPLIANT | Show warning → proceed to Step 6 |
| DRIFT_DETECTED | DRIFT_DETECTED | Show warnings → proceed to Step 6 |
| CRITICAL_VIOLATION | Any | Block with prompt |
| Any | CRITICAL_VIOLATION | Block with prompt |

**On CRITICAL_VIOLATION:**

```
┌─ Validation Failed ────────────────────────────────────┐
│                                                        │
│  {Validator}: CRITICAL_VIOLATION                       │
│                                                        │
│  Issue: {description}                                  │
│  Location: {file}:{line}                               │
│                                                        │
│  {Explanation of why this is critical}                 │
│                                                        │
│  [f] Apply suggested fix                               │
│  [a] Acknowledge and proceed (not recommended)         │
│  [c] Cancel and edit manually                          │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**User Response Handling:**
- `f`: Apply fix, re-run validators
- `a`: Log acknowledgment, proceed with warning in taste.md
- `c`: Cancel craft, return control to user

**On DRIFT_DETECTED (warning only):**

```
┌─ Validation Warning ───────────────────────────────────┐
│                                                        │
│  Style drift detected:                                 │
│  • {issue 1}                                           │
│  • {issue 2}                                           │
│                                                        │
│  [f] Apply auto-fixes                                  │
│  [p] Proceed anyway                                    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Compact Mode (after 3+ COMPLIANT passes):**

Skip showing validation output entirely. Only surface CRITICAL_VIOLATION.
</step_5_5>

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
Experiment: [if --experiment flag used, link experiment ID]
---
```

**MODIFY:**
```markdown
## [YYYY-MM-DD HH:MM] | MODIFY
Target: [what was crafted]
Craft Type: [type]
Changed: [what user indicated was off]
Learning: [infer preference for future]
Experiment: [if --experiment flag used, link experiment ID]
---
```

**REJECT:**
```markdown
## [YYYY-MM-DD HH:MM] | REJECT
Target: [what was crafted]
Craft Type: [type]
Reason: [user feedback]
Experiment: [if --experiment flag used, link experiment ID]
---
```

**7b. Update Experiment (if --experiment flag used):**

When crafting with `--experiment`, also update the experiment file:

1. Add entry to "Craft Sessions" table:
```markdown
| [date] | [component] | [session-timestamp] | [signal] |
```

2. If REJECT: Note in experiment that the craft attempt failed — may inform hypothesis

**7c. Update Craft State (Session Persistence):**

After collecting feedback, update `grimoires/sigil/craft-state.md`:

```yaml
# Update current iteration with result
iterations:
  - number: {current}
    timestamp: "{ISO8601}"
    action: "{what was attempted}"
    result: "SUCCESS" | "PARTIAL" | "FAILED"
    hypothesis: "{original request or refined hypothesis}"
    rules_loaded: ["{list of RLM rules used}"]

# Update session timestamp
session:
  last_updated: "{ISO8601}"

# Record findings if any
context:
  findings:
    - "{key insight from this iteration}"

# Set next recommendation
next:
  recommendation: "continue" | "diagnose" | "escalate"
  reason: "{why this recommendation}"
  suggested_command: "{if escalation needed}"
```

**Result Mapping:**
| User Signal | Result | Next Recommendation |
|-------------|--------|---------------------|
| ACCEPT | SUCCESS | continue |
| MODIFY (minor) | PARTIAL | continue |
| MODIFY (reveals new issue) | PARTIAL | diagnose (if iteration 2+) |
| REJECT | FAILED | diagnose |

**Session Cleanup:**
If result is SUCCESS and user moves to different work:
- Archive session to `grimoires/sigil/context/archive/`
- Reset craft-state.md to empty template

**7d. Update NOTES.md (Session Memory):**

**Feature Flag Check:**
```
Read grimoires/sigil/constitution.yaml
If features.notes_memory == false: Skip this step
```

Update `grimoires/sigil/NOTES.md` with session state:

```yaml
---
last_updated: "{ISO8601}"
session_id: "{component}-{timestamp}"
---

# Sigil Session Memory

## Current Focus

**Component**: {component name}
**Craft Type**: {generate/refine/configure/pattern/polish}
**Target File**: {file path if known}
**Started**: {session start time}

## Physics Decisions

| Decision | Value | Rationale |
|----------|-------|-----------|
| Effect | {detected effect} | {why this effect} |
| Timing | {ms value} | {from physics table or taste override} |
| Animation | {easing/spring} | {frequency-based or taste} |
| Confirmation | {required/none/toast} | {based on effect type} |

## Blockers

{List any issues preventing completion, or "(No blockers)"}

## Learnings

{Key insights from this session, or "(No learnings yet)"}
- {If MODIFY signal: what user wanted different}
- {If pattern detected: preference to apply in future}

## Session Continuity

**Last Action**: {what was just completed}
**Next Action**: {what to do next, or "Awaiting user input"}
**Context Needed**: {files to read if resuming after context clear}
```

**Update Triggers:**
| Event | Update Action |
|-------|---------------|
| Craft started | Initialize all sections |
| Physics detected | Update Physics Decisions |
| Blocker encountered | Add to Blockers |
| MODIFY signal | Add to Learnings |
| Step completed | Update Last Action, Next Action |
| Session ends | Clear to template |

**7e. Update Trajectory Outcome:**

**Feature Flag Check:**
```
Read grimoires/sigil/constitution.yaml
If features.trajectory_logging == false: Skip this step
```

Update the trajectory file created in Step 3b with the outcome:

1. Find the trajectory file: `grimoires/sigil/trajectory/{date}-{component}.md`
2. Locate the latest session's "### Outcome" section
3. Replace pending values with actual outcome:

```markdown
### Outcome
```
Signal: {ACCEPT/MODIFY/REJECT}
Changes: {if MODIFY: what user changed}
         {if ACCEPT: "None - accepted as generated"}
         {if REJECT: "Rejected - {reason}"}
Notes: {any relevant observations}
```
```

**Signal-specific notes:**

| Signal | Changes Field | Notes Field |
|--------|---------------|-------------|
| ACCEPT | "None - accepted as generated" | Any positive feedback |
| MODIFY | List specific changes user requested | Inferred preference |
| REJECT | "Rejected" + reason if given | What went wrong |
</step_7>

<step_7_5>
### Step 7.5: Learning Extraction

**Feature Flag Check:**
```
Read grimoires/sigil/constitution.yaml
If features.continuous_learning == false: Skip to workflow end
```

**Trigger Conditions** (check any match):

1. **Iteration threshold**: craft-state.md shows iteration ≥3 with PARTIAL results
2. **Undocumented pattern**: Solution required approach not in rules
3. **Web3 footgun**: BigInt falsy check, stale closure, receipt guard issue
4. **User explicit**: User said "remember this", "this should be a rule"

**If triggered:**

```
┌─ Learning Detected ────────────────────────────────────┐
│                                                        │
│  A discovery worth preserving was detected:            │
│                                                        │
│  Type: {iteration_threshold | undocumented | web3 |    │
│         user_explicit}                                 │
│  Context: {brief context}                              │
│                                                        │
│  Extracting to pending-learnings.md...                 │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Extraction Process:**

1. Generate learning entry with:
   - Date and title
   - Context (what was being crafted)
   - Trigger (why extracted)
   - Discovery (what was learned)
   - Evidence (iteration history)
   - Recommendation (specific action)
   - Promotion target (where to add)

2. Append to `grimoires/sigil/pending-learnings.md`:

```markdown
## [YYYY-MM-DD] {Discovery Title}

**Context**: {component} - {craft type}
**Trigger**: {trigger type}
**Component**: {component name}

### Discovery

{What was learned - be specific}

### Evidence

- Iteration 1: {what happened}
- Iteration 2: {what happened}
- Iteration 3: {what fixed it}

### Recommendation

{Specific rule text, pattern, or anti-pattern to add}

### Promotion Target

- [ ] taste.md pattern
- [ ] Rule update: {which rule file}
- [ ] constitution.yaml addition
- [ ] New anti-pattern in 00-sigil-core.md

---
```

3. Show notification:

```
┌─ Learning Extracted ───────────────────────────────────┐
│                                                        │
│  "{discovery title}" saved to pending-learnings.md     │
│                                                        │
│  Review and promote with: /skill-audit                 │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Web3 Footgun Detection:**

| Pattern | Detection | Learning Type |
|---------|-----------|---------------|
| `if (amount)` with BigInt | Regex: `if\s*\(\s*\w+\s*\)` on BigInt var | "BigInt falsy check" |
| Missing receipt guard | useEffect on receipt without hash check | "Receipt re-execution" |
| Stale closure | useEffect with state dep missing | "Stale closure in effect" |
| `??` fallback chain | Multiple `??` operators | "Ambiguous data source" |
</step_7_5>
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

<mode_hints>
## Mode Hints

/craft adapts to your work. Here's how to get the most from each mode:

| If you need... | Mode | Hint |
|----------------|------|------|
| Quick UI polish | Chisel | Single component, physics keywords |
| Full feature | Hammer | Say "build", "implement", "feature" |
| Fix an issue | Debug | Say "fix", "broken", "failing", "error" |
| Understand code | Explore | Say "why", "how does", "investigate" |

**Specialized commands still exist** for focused work:
- `/animate` — Animation physics only
- `/style` — Material physics only
- `/behavior` — Behavioral physics only

But `/craft` will never reject your work. If you invoke it, there's work to do.
</mode_hints>

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

### Example 8: Hammer Mode — Fresh Start

```
User: /craft "build rewards claiming feature"

[Scope Detection: Score = 4]
• "build" (+1)
• "feature" (+1)
• "claiming" implies contract interaction (+1)
• "rewards" implies financial (+1)

┌─ Scope Detection ─────────────────────────────────────────┐
│                                                           │
│  This looks like HAMMER work:                             │
│  • "build" — implementation keyword                       │
│  • "feature" — multi-component scope                      │
│  • "claiming" — contract interaction                      │
│  • "rewards" — financial domain                           │
│                                                           │
│  Full-stack implementation requires architecture.         │
│  I'll run the complete sequence:                          │
│                                                           │
│  1. /plan-and-analyze → Requirements (PRD)                │
│  2. /architect → Design (SDD)                             │
│  3. /sprint-plan → Tasks                                  │
│  4. Review plan                                           │
│  5. /run sprint-plan → Implementation                     │
│                                                           │
│  [Proceed with Hammer] [Chisel anyway (UI only)]          │
│                                                           │
└───────────────────────────────────────────────────────────┘

User: Proceed with Hammer

[Initializing hammer-state.json...]
[Aggregating Sigil context...]

Found 2 observations:
- @papa_flavio: "Can't see my claimable amount before clicking"
- @builder_dan: "Claim flow too slow for power users"

Found 3 taste patterns:
- Financial timing: 600ms preferred (3 MODIFY signals)
- Spring animations preferred

[Invoking /plan-and-analyze with seeded context...]

... [PRD interview/synthesis runs] ...

PRD complete: grimoires/loa/prd.md

[Invoking /architect...]

... [SDD design runs] ...

SDD complete: grimoires/loa/sdd.md

[Invoking /sprint-plan...]

... [Sprint planning runs] ...

Sprint complete: grimoires/loa/sprint.md

┌─ Hammer Plan Complete ────────────────────────────────────┐
│                                                           │
│  Feature: Rewards claiming feature                        │
│                                                           │
│  Artifacts:                                               │
│  • PRD: grimoires/loa/prd.md                             │
│  • SDD: grimoires/loa/sdd.md                             │
│  • Sprint: grimoires/loa/sprint.md                       │
│                                                           │
│  Components to implement:                                 │
│  1. [Backend] RewardsClaimed indexer handler              │
│  2. [Backend] GET /rewards/:address endpoint              │
│  3. [Frontend] useRewards hook                            │
│  4. [Frontend] RewardsList (standard physics)             │
│  5. [Frontend] ClaimButton (financial physics)            │
│                                                           │
│  ─────────────────────────────────────────────────────────│
│                                                           │
│  Ready to implement.                                      │
│  Review the artifacts above, then run:                    │
│                                                           │
│    /run sprint-plan                                       │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### Example 9: Hammer Mode — Existing Artifacts

```
User: /craft "implement notification system"

[Scope Detection: HAMMER (score = 3)]

[Checking existing artifacts...]

┌─ Existing Artifacts Detected ────────────────────────────┐
│                                                          │
│  PRD: grimoires/loa/prd.md (2 days old) ✓ relevant      │
│  SDD: grimoires/loa/sdd.md (2 days old) ✓ relevant      │
│                                                          │
│  Options:                                                │
│  1. Use existing → Skip to sprint planning               │
│  2. Regenerate PRD → Full sequence                       │
│  3. Regenerate SDD only → Keep PRD, redo architecture    │
│  4. Chisel anyway → UI only                              │
│                                                          │
└──────────────────────────────────────────────────────────┘

User: 1

[Using existing PRD and SDD...]
[Invoking /sprint-plan...]

... [Sprint planning runs] ...

┌─ Hammer Plan Complete ────────────────────────────────────┐
│  ...                                                      │
└───────────────────────────────────────────────────────────┘
```

### Example 10: User Chooses Chisel Anyway

```
User: /craft "build portfolio dashboard"

[Scope Detection: HAMMER (score = 2)]

┌─ Scope Detection ─────────────────────────────────────────┐
│                                                           │
│  This looks like HAMMER work:                             │
│  • "build" — implementation keyword                       │
│  • "dashboard" — multi-component scope                    │
│                                                           │
│  [Proceed with Hammer] [Chisel anyway (UI only)]          │
│                                                           │
└───────────────────────────────────────────────────────────┘

User: Chisel anyway

⚠ Proceeding chisel-only. Supporting infrastructure not included.

[Logging CHISEL_OVERRIDE to taste.md...]

┌─ Craft Analysis ───────────────────────────────────────┐
│  Target:       PortfolioDashboard (new)                │
│  Craft Type:   Generate                                │
│  Effect:       Query (data display)                    │
│  Note:         Chisel override — no backend/data layer │
│                                                        │
│  ...                                                   │
└────────────────────────────────────────────────────────┘

Proceed? (y/n)
```

### Example 11: Resume Interrupted Hammer Session

```
User: /craft "claim button"

[Checking hammer state...]

┌─ Hammer Mode In Progress ─────────────────────────────────┐
│                                                           │
│  Feature: "rewards claiming feature"                      │
│  Phase: sdd_complete                                      │
│  Started: 2 hours ago                                     │
│                                                           │
│  Options:                                                 │
│  1. Resume from current phase (sprint planning next)      │
│  2. Abandon and start fresh                               │
│  3. Switch to chisel mode for quick work                  │
│                                                           │
└───────────────────────────────────────────────────────────┘

User: 1

[Resuming hammer mode...]
[Invoking /sprint-plan...]

... [continues from where it left off] ...
```

### Example 12: Debug Mode — Deployment Issue

```
User: /craft "fix the docs deployment, build is failing"

[Mode Detection: DEBUG]
• "fix" — debug keyword
• "failing" — debug keyword
• "deployment" — deployment context

┌─ Mode: DEBUG ─────────────────────────────────────────────┐
│                                                           │
│  Detected: fix, failing, deployment                       │
│                                                           │
│  I'll investigate systematically:                         │
│  1. Reproduce the issue                                   │
│  2. Identify root cause                                   │
│  3. Propose fix                                           │
│  4. Verify resolution                                     │
│                                                           │
│  [Proceed] [Switch to Chisel] [Switch to Explore]         │
│                                                           │
└───────────────────────────────────────────────────────────┘

User: Proceed

┌─ Debug Analysis ───────────────────────────────────────────┐
│                                                            │
│  Issue: Docs deployment build failing                      │
│  Affected: Build pipeline, docs site                       │
│  Error: (checking build logs...)                           │
│                                                            │
│  Hypothesis: Configuration or dependency issue             │
│                                                            │
│  Investigation plan:                                       │
│  1. Check recent commits to docs config                    │
│  2. Review build logs for specific error                   │
│  3. Verify dependencies are up to date                     │
│                                                            │
│  Proceed with investigation? (y/n)                         │
│                                                            │
└────────────────────────────────────────────────────────────┘

User: y

[Reading build logs...]
[Checking vocs.config.ts...]
[Checking package.json...]

┌─ Root Cause Found ─────────────────────────────────────────┐
│                                                            │
│  Root cause: Invalid sidebar configuration                 │
│  Location: vocs.config.ts:47                               │
│  Evidence: Build error "Cannot read property of undefined" │
│                                                            │
│  Proposed fix:                                             │
│  Add null check for sidebar items                          │
│                                                            │
│  Apply fix? (y/n)                                          │
│                                                            │
└────────────────────────────────────────────────────────────┘

User: y

[Applies fix, verifies build passes]
[Logs DEBUG_RESOLVED to taste.md]
```

### Example 13: Explore Mode — Understanding Architecture

```
User: /craft "how does the auth flow work in this app?"

[Mode Detection: EXPLORE]
• "how does" — explore keyword
• "?" — question format

┌─ Mode: EXPLORE ───────────────────────────────────────────┐
│                                                           │
│  Detected: how does, question                             │
│                                                           │
│  I'll research thoroughly:                                │
│  1. Map the relevant code/systems                         │
│  2. Understand the architecture                           │
│  3. Document findings                                     │
│  4. Provide recommendations                               │
│                                                           │
│  [Proceed] [Switch to Debug] [Switch to Chisel]           │
│                                                           │
└───────────────────────────────────────────────────────────┘

User: Proceed

┌─ Explore Analysis ─────────────────────────────────────────┐
│                                                            │
│  Question: How does the auth flow work?                    │
│  Scope: Authentication system                              │
│                                                            │
│  Exploration plan:                                         │
│  1. Find auth-related files and entry points               │
│  2. Trace login/logout flow                                │
│  3. Identify session management approach                   │
│                                                            │
│  Proceed? (y/n)                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘

User: y

[Spawning Explore agent...]
[Mapping auth system...]

┌─ Exploration Complete ─────────────────────────────────────┐
│                                                            │
│  Question: How does the auth flow work?                    │
│                                                            │
│  Summary:                                                  │
│  The app uses NextAuth.js with JWT tokens stored in        │
│  httpOnly cookies. Sessions are validated server-side.     │
│                                                            │
│  Key findings:                                             │
│  • src/lib/auth.ts:12 — NextAuth configuration             │
│  • src/middleware.ts:8 — Route protection logic            │
│  • src/hooks/useAuth.ts:3 — Client-side auth hook          │
│                                                            │
│  Architecture notes:                                       │
│  JWT + server validation provides good security.           │
│  Protected routes defined in middleware matcher.           │
│                                                            │
│  Recommendations:                                          │
│  Consider adding refresh token rotation for long sessions. │
│                                                            │
└────────────────────────────────────────────────────────────┘

[Logs EXPLORE_COMPLETE to taste.md]
```

### Example 14: Debug Mode — Can't Identify Root Cause

```
User: /craft "debug the intermittent crash on mobile"

[Mode Detection: DEBUG]

... [investigation proceeds] ...

┌─ Investigation Blocked ───────────────────────────────────────┐
│                                                               │
│  I've checked crash logs, recent changes, and device-specific │
│  code but can't identify the root cause. The issue might      │
│  require:                                                     │
│                                                               │
│  • More context about reproduction steps                      │
│  • Access to device-specific crash reports                    │
│  • Real device testing (not simulator)                        │
│                                                               │
│  What I've learned so far:                                    │
│  - Crash only occurs on iOS 16+                               │
│  - Related to animation timing                                │
│  - Memory pressure may be a factor                            │
│                                                               │
│  [Provide more context] [Try different approach] [Stop here]  │
│                                                               │
└───────────────────────────────────────────────────────────────┘

User: The crash happens when scrolling fast through a long list

[Updates hypothesis with new information...]
[Continues investigation...]
```

### Example 15: Debug → Hammer Escalation (Context Preservation)

```
User: /craft "fix the rewards not showing up"

[Mode Detection: DEBUG]

┌─ Debug Analysis ───────────────────────────────────────────┐
│                                                            │
│  Issue: Rewards not displaying                             │
│  Affected: RewardsList component                           │
│                                                            │
│  Investigation plan:                                       │
│  1. Check RewardsList component                            │
│  2. Trace data fetching                                    │
│  3. Verify API endpoint                                    │
│                                                            │
└────────────────────────────────────────────────────────────┘

User: y

[Investigating...]
[Reading RewardsList.tsx - no issues found]
[Tracing to useRewards hook - calls /api/rewards]
[Checking /api/rewards - endpoint doesn't exist]
[Checking indexer - RewardsClaimed event not indexed]
[Checking contract - event exists but no handler]

┌─ Scope Check ──────────────────────────────────────────────────┐
│                                                                │
│  Investigation scope has grown:                                │
│  • Files examined: 7                                           │
│  • Systems involved: Frontend, API, Indexer, Contract          │
│  • Root cause type: ARCHITECTURE (missing infrastructure)      │
│                                                                │
│  The rewards feature is incomplete:                            │
│  - Contract emits RewardsClaimed event ✓                       │
│  - Indexer handler: MISSING                                    │
│  - API endpoint: MISSING                                       │
│  - Frontend hook: calls non-existent API                       │
│                                                                │
│  This requires Hammer mode (full-stack implementation).        │
│                                                                │
│  Options:                                                      │
│  1. Continue debugging (won't help — infrastructure missing)   │
│  2. Escalate to Hammer (preserve findings, plan architecture)  │
│  3. Document and stop (hand off to human)                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘

User: 2

[Checkpointing findings to grimoires/sigil/craft-state.md...]

## 2026-01-19 14:32 | INVESTIGATION_CHECKPOINT

### Context
Mode: Debug
Original request: "fix the rewards not showing up"

### Findings So Far
- ${PROJECT_ROOT}/src/components/RewardsList.tsx:45 — Component OK
- ${PROJECT_ROOT}/src/hooks/useRewards.ts:12 — Calls /api/rewards (404)
- ${PROJECT_ROOT}/contracts/Rewards.sol:89 — RewardsClaimed event exists
- MISSING: Indexer handler for RewardsClaimed
- MISSING: API endpoint GET /api/rewards/:address

### Hypothesis
Rewards feature was partially implemented. Frontend exists but
backend infrastructure (indexer + API) was never built.

### Escalation Reason
Missing infrastructure — not a bug, needs full-stack implementation.

### Recommended Next Mode
Hammer

### Seed Context for Next Mode
- Need RewardsClaimed indexer handler
- Need GET /rewards/:address endpoint
- Frontend useRewards hook ready to consume
---

[Logged DEBUG_ESCALATED to taste.md]

┌─ Escalating to Hammer Mode ─────────────────────────────────┐
│                                                             │
│  Findings preserved: grimoires/sigil/craft-state.md        │
│                                                             │
│  Key discoveries:                                           │
│  • Frontend exists, backend missing                         │
│  • Need: Indexer handler + API endpoint                     │
│  • Contract event already deployed                          │
│                                                             │
│  These findings will seed /plan-and-analyze.               │
│                                                             │
│  Proceed with Hammer sequence? (y/n)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

User: y

[Seeding /plan-and-analyze with checkpoint context...]
[Invoking /plan-and-analyze...]

... [Hammer sequence continues with investigation findings pre-loaded] ...
```

This example shows how Debug mode detects that a "bug" is actually missing
infrastructure, checkpoints findings before context is exhausted, and
hands off cleanly to Hammer mode with full context preserved.

### Example 16: Craft with Experiment Context

```
User: /craft "RewardsDisplay" --experiment EXP-001

[Reading experiment EXP-001-rewards-visibility.md...]

┌─ Craft Analysis ───────────────────────────────────────┐
│  Target:       RewardsDisplay (new)                    │
│  Craft Type:   Generate                                │
│  Effect:       Query (data display)                    │
│                                                        │
│  Experiment:   EXP-001: Rewards Visibility             │
│                Hypothesis: Delta display → confidence  │
│                Addressing: alice (trust-checker)       │
│                                                        │
│  From experiment "What We're Changing":                │
│  • Add "+X since last" delta indicator                 │
│  • Add trend arrow (↑/↓/→)                             │
│  • Subtle pulse on value increase                      │
│                                                        │
│  Behavioral    Optimistic | 150ms | No confirmation    │
│  Animation     spring(500) | pulse on change           │
│  Material      Elevated | Soft shadow | 8px radius     │
│                                                        │
│  Output:       src/components/RewardsDisplay.tsx       │
│  Protected:    [✓] Balance always accurate            │
└────────────────────────────────────────────────────────┘

Proceed? (y/n)

User: y

[Generates component with delta indicator, trend arrow, pulse animation]

Does this feel right for your trust-checker users?

User: looks good, the trend arrow is helpful

[Logs ACCEPT with Experiment: EXP-001]
[Updates EXP-001-rewards-visibility.md Craft Sessions table:]

| Date | Component | Session ID | Signal |
|------|-----------|------------|--------|
| 2026-01-19 | RewardsDisplay | 2026-01-19T14:32:00Z | ACCEPT |
```

This example shows how experiment context informs the craft — the physics
adjustments from "What We're Changing" are applied, and the craft session
is linked back to the experiment for tracking.
</examples>

---

<user-request>
$ARGUMENTS
</user-request>
