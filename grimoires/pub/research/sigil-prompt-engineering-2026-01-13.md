# Sigil Prompt Engineering Guide

Based on Anthropic's official Claude 4.x best practices and the Claude Code system prompt architecture.

---

## Key Insights from Anthropic

### 1. Be Explicit, Not Implicit

Claude 4.x models follow instructions **precisely**. The "above and beyond" behavior of older models requires explicit requests.

**Anthropic's Guidance:**
> "Customers who desire the 'above and beyond' behavior from previous Claude models might need to more explicitly request these behaviors."

**Application to Sigil:**
```markdown
# Less effective
Apply correct physics to the component.

# More effective
Apply physics based on effect type:
- Financial (claim, deposit) → Pessimistic sync, 800ms, confirmation required
- Standard (like, save) → Optimistic sync, 200ms, no confirmation
- Local (toggle) → Immediate, 100ms
```

### 2. Provide Context and Motivation (WHY, not just WHAT)

Claude generalizes better when it understands the reasoning.

**Anthropic's Example:**
```
# Less effective
NEVER use ellipses

# More effective
Your response will be read aloud by a text-to-speech engine,
so never use ellipses since the TTS engine won't know how to pronounce them.
```

**Application to Sigil:**
```markdown
# Less effective
Financial mutations require 800ms timing.

# More effective
Financial mutations require 800ms timing because users need time to
verify the amount and mentally commit to an irreversible action.
Research shows users feel anxious at 200ms for money movement.
```

### 3. Match Prompt Style to Output Style

The formatting in your prompt influences Claude's output.

**Anthropic's Guidance:**
> "If you are still experiencing steerability issues with output formatting, we recommend matching your prompt style to your desired output style."

**Application to Sigil:**
The `/craft` command should include the **exact box format** we want Claude to output:

```markdown
## Output Format

Before generating code, show physics analysis in this exact format:

┌─ Physics Analysis ─────────────────────────────────────┐
│  Component:    [ComponentName]                         │
│  Effect:       [Effect type]                           │
│  Detected by:  [keyword/type that triggered]           │
│  ┌─ Applied Physics ────────────────────────────────┐  │
│  │  Sync:         [strategy]                        │  │
│  │  Timing:       [ms]                              │  │
│  │  Confirmation: [required/none]                   │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### 4. Tell What TO Do, Not What NOT to Do

Positive instructions work better than prohibitions.

**Anthropic's Guidance:**
> "Instead of: 'Do not use markdown in your response'
> Try: 'Your response should be composed of smoothly flowing prose paragraphs.'"

**Application to Sigil:**
```markdown
# Less effective
no_questions:
  - "Don't ask what sync strategy"
  - "Don't ask about timing"

# More effective
## Automatic Inference
Infer these from effect type without asking:
- Sync strategy → determined by effect
- Timing → determined by physics table
- Confirmation → determined by effect
- Animation library → discovered from codebase
```

### 5. Use Structured State for Complex Data

**Anthropic's Guidance:**
> "Use structured formats for state data (JSON). Use unstructured text for progress notes."

**Application to Sigil:**
Physics table should be structured, rationale should be prose:

```yaml
# Structured (physics)
financial_mutation:
  sync: pessimistic
  timing_ms: 800
  confirmation: required

# Prose (rationale)
Why 800ms for financial: Users need time to verify amounts and
mentally commit. Research shows anxiety at 200ms for money movement.
```

---

## Claude Code System Prompt Patterns to Adopt

### Pattern 1: Concise by Default

```markdown
# From Claude Code system prompt
You MUST answer concisely with fewer than 4 lines unless user asks for detail.
Only address the specific query, avoiding tangential information.
```

**Application to Sigil:**
Physics analysis should be concise. No explanations unless asked.

### Pattern 2: Examples as Primary Documentation

```markdown
# From Claude Code system prompt
<example>
user: what command should I run to list files?
assistant: ls
</example>
```

**Application to Sigil:**
Every physics rule should have an inline example:

```markdown
## Financial Mutation

**Keywords:** claim, deposit, withdraw, transfer, swap

**Example:**
```
/craft "claim button"
→ Effect: Financial
→ Sync: Pessimistic
→ Timing: 800ms
→ Confirmation: Required
```
```

### Pattern 3: Task Management with TodoWrite

```markdown
# From Claude Code system prompt
Use TodoWrite tools VERY frequently to ensure you are tracking tasks.
Mark todos as completed as soon as you are done.
```

**Application to Sigil:**
For multi-step generations, track progress:

```markdown
## Complex Components

For components with multiple physics zones (e.g., wizard with payment step):
1. Identify all steps and their effects
2. Track physics for each step
3. Generate step-by-step, marking complete
```

### Pattern 4: Convention Following

```markdown
# From Claude Code system prompt
When making changes, first understand the file's code conventions.
NEVER assume a library is available. Check package.json first.
```

**Application to Sigil:**
Add codebase discovery phase:

```markdown
## Before Generating

1. Check package.json for animation library (framer-motion? react-spring? CSS?)
2. Check existing components for patterns
3. Match discovered conventions
4. Generate using what exists
```

### Pattern 5: No Comments Unless Asked

```markdown
# From Claude Code system prompt
IMPORTANT: DO NOT ADD ***ANY*** COMMENTS unless asked
```

**Application to Sigil:**
Generated code should be clean:

```markdown
## Code Style

- No comments unless explaining complex physics reasoning
- No JSDoc unless project uses it
- Match existing code style exactly
```

---

## Recommended Sigil Rules Structure

Based on Anthropic patterns, here's how to restructure the rules:

### 01-sigil-physics.md (Restructured)

```markdown
# Sigil: Design Physics

You generate UI components with correct physics. Physics are determined by
**effect** (what the code does), not preferences.

## Physics Table

| Effect | Sync | Timing | Confirmation |
|--------|------|--------|--------------|
| Financial | Pessimistic | 800ms | Required |
| Destructive | Pessimistic | 600ms | Required |
| Standard | Optimistic | 200ms | None |
| Local | Immediate | 100ms | None |

## Why These Physics

**Financial (800ms, pessimistic):** Users need time to verify amounts and
mentally commit to irreversible actions. Faster timing creates anxiety.

**Destructive (600ms, pessimistic):** Permanent actions require deliberation.
Confirmation prevents accidents.

**Standard (200ms, optimistic):** Reversible actions should feel snappy.
Rollback on error provides safety without friction.

**Local (100ms, immediate):** No server round-trip. Users expect instant feedback.

## Automatic Inference

Infer from effect type without asking:
- Sync strategy → from physics table
- Timing → from physics table
- Confirmation → from physics table
- Animation library → from codebase (check package.json)
- Data fetching → from codebase (check for tanstack-query, swr)

## Output Format

Before generating, show analysis:

┌─ Physics Analysis ─────────────────────────────────────┐
│  Component:    [Name]                                  │
│  Effect:       [Type]                                  │
│  Detected by:  [keyword/type]                          │
│  Sync:         [strategy]                              │
│  Timing:       [ms]                                    │
│  Confirmation: [required/none]                         │
└────────────────────────────────────────────────────────┘

Then ask: "Proceed with these physics? (yes / or describe what's different)"
```

### 02-sigil-detection.md (Restructured)

```markdown
# Sigil: Effect Detection

Detect effect from keywords and types. Types override keywords.

## Financial Mutation
Keywords: claim, deposit, withdraw, transfer, swap, send, pay, purchase
Types: Currency, Money, Balance, Amount, Wei, Token, BigInt

Example:
```
"claim button" → Financial (keyword: claim)
props: { amount: Currency } → Financial (type: Currency)
```

## Destructive Mutation
Keywords: delete, remove, destroy, revoke, burn

Example:
```
"delete button" → Destructive
"remove item" → Destructive
```

## Standard Mutation
Keywords: save, update, edit, create, add, toggle, like, follow

Example:
```
"like button" → Standard
"save changes" → Standard
```

## Local State
Keywords: toggle, switch, expand, collapse, select, focus

Example:
```
"dark mode toggle" → Local
"expand section" → Local
```

## Ambiguity Resolution

When unclear, ask: "What happens if this fails?"
- Can be undone → Optimistic
- Cannot be undone → Pessimistic
- Involves money → Always pessimistic
- Pure client state → Immediate
```

---

## Tools Sigil Needs

Based on Anthropic patterns, Sigil should have:

### 1. Codebase Discovery Tool

```markdown
## Pre-Generation Discovery

Before generating any component:

1. **Animation Library**
   ```bash
   grep -E "framer-motion|react-spring|@emotion" package.json
   ```

2. **Data Fetching**
   ```bash
   grep -E "tanstack|swr|apollo" package.json
   ```

3. **Existing Patterns**
   ```bash
   ls src/components/*.tsx | head -5
   ```

4. **Import Style**
   Read first component to understand import conventions.
```

### 2. Physics Validation Hook (Optional)

```yaml
# .claude/hooks.yaml
hooks:
  - event: PreToolUse
    matcher: "Write|Edit"
    command: |
      # Validate physics before writing
      # Exit 1 if optimistic sync detected for financial type
```

### 3. Authority Computation

```bash
# Count imports for authority tiers
grep -r "from.*ComponentName" src/ | wc -l
# > 10 imports + 14 days stable = Gold tier
```

---

## Summary: Sigil Prompt Engineering Principles

1. **Be explicit** - State exact physics, don't assume inference
2. **Provide motivation** - Explain WHY 800ms, not just WHAT
3. **Match format** - Show the box format you want as output
4. **Use examples** - Every rule has an inline example
5. **Positive instructions** - "Infer X" not "Don't ask about X"
6. **Discover conventions** - Check codebase before generating
7. **Concise output** - Physics box, then code, no explanations unless asked
8. **Structured + prose** - JSON for physics, prose for rationale

---

## Sources

- [Prompting best practices - Claude 4.x](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices)
- [Claude Code: Best practices for agentic coding](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Prompt engineering best practices](https://claude.com/blog/best-practices-for-prompt-engineering)
