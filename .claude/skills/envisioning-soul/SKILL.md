# Sigil v4 Agent: Envisioning Soul

> "Every product has a soul. Your job is to find it and write it down."

## Role

**Soul Keeper** — Captures the product's essence through structured interview and writes it to `sigil-mark/resonance/essence.yaml`.

## Command

```
/envision
/envision --refresh
```

## Outputs

| Path | Description |
|------|-------------|
| `sigil-mark/resonance/essence.yaml` | Soul statement, invariants, feel descriptors, references |
| `sigil-mark/taste-key/holder.yaml` | Taste Key holder identity (partial update) |

## Pre-Flight

1. Check for `.sigil-setup-complete`
2. Read existing `sigil-mark/resonance/essence.yaml` template
3. If `--refresh`, load current values as starting point

## Interview Workflow

### Phase 1: Product Identity

Ask using AskUserQuestion:

```
QUESTION 1: PRODUCT NAME AND TAGLINE
"What is this product called, and what's its one-line description?"

Example answers:
- "HoneyVault — Your DeFi treasure chest"
- "FlowBoard — Design without friction"
```

### Phase 2: Soul Statement

```
QUESTION 2: SOUL STATEMENT
"In one sentence, what should using this product FEEL like?"

Examples to prompt:
- "Every click should feel like it matters"
- "Speed is the feature"
- "Earned rewards feel better than given rewards"
- "Trust through deliberate weight"

Follow-up: "Why? What's the deeper reason?"
```

### Phase 3: Invariants

```
QUESTION 3: INVARIANTS
"What must ALWAYS be true, no matter what?"

Examples to prompt:
- "Money UI is never optimistic"
- "Critical actions require explicit confirmation"
- "All state changes are reversible"
- "Errors always have a clear recovery path"

For each invariant, ask:
- "Should this block generation, warn, or suggest?"
```

```
QUESTION 4: ANTI-INVARIANTS
"What should this product NEVER feel like?"

Examples:
- "Never feel corporate or impersonal"
- "Never prioritize flash over function"
- "Never hide critical information"
```

### Phase 4: Reference Products

```
QUESTION 5: REFERENCE GAMES
"What GAMES capture the feel you want?"

For each:
- "What specifically? (Speed? Feedback? Polish?)"

Examples:
- OSRS: "The deliberate, earned feeling of progress"
- Hollow Knight: "Precise, responsive controls with weight"
- Stardew Valley: "Cozy, unhurried progression"
```

```
QUESTION 6: REFERENCE APPS
"What APPS capture the feel you want?"

For each:
- "What specifically?"

Examples:
- Linear: "Speed and keyboard-first design"
- Notion: "Flexibility without chaos"
- Arc: "Opinionated but delightful"
```

```
QUESTION 7: REFERENCE PHYSICAL PRODUCTS
"What PHYSICAL PRODUCTS capture the feel you want?"

Examples:
- "Leica camera — precision and weight"
- "Muji notebook — simple and tactile"
- "Herman Miller chair — quality you feel"
```

### Phase 5: Feel Descriptors

```
QUESTION 8: FEEL BY CONTEXT
For each context, ask:

AT FIRST GLANCE:
"How should it feel on first impression?"
Example: "Clean, professional, quietly confident"

DURING USE:
"How should it feel while using?"
Example: "Responsive, predictable, pleasantly efficient"

AFTER COMPLETION:
"How should it feel after completing a task?"
Example: "Satisfied, accomplished, trusted"

ON ERROR:
"How should it feel when something goes wrong?"
Example: "Clear about what happened, confident it can be fixed"
```

### Phase 6: Key Moments

```
QUESTION 9: KEY MOMENTS
"Describe how these moments should feel:"

HIGH STAKES:
"Confirming a large transaction, deleting something important"

CELEBRATION:
"Claiming a reward, completing a milestone"

RECOVERY:
"An error occurred, need to retry"

DISCOVERY:
"Exploring features, learning the product"
```

### Phase 7: Anti-Patterns

```
QUESTION 10: ANTI-PATTERNS
"What specific patterns violate the soul?"

For each:
- "Why is this wrong for YOUR product?"
- "What should be used instead?"

Examples:
- "Gamified productivity — feels manipulative"
- "Dark patterns — violates trust"
- "Infinite scroll — prevents completion"
```

### Phase 8: Tension Defaults

```
QUESTION 11: TENSION DEFAULTS
"Where does your product sit on these spectrums? (0-100)"

PLAYFULNESS: 0=Serious, professional → 100=Fun, whimsical
WEIGHT: 0=Light, airy → 100=Heavy, grounded
DENSITY: 0=Spacious, minimal → 100=Dense, information-rich
SPEED: 0=Slow, deliberate → 100=Fast, snappy

Or choose a preset:
- Linear (playfulness: 20, weight: 60, density: 50, speed: 90)
- Airbnb (playfulness: 60, weight: 40, density: 30, speed: 50)
- Nintendo (playfulness: 80, weight: 50, density: 40, speed: 60)
- OSRS (playfulness: 30, weight: 80, density: 60, speed: 30)
```

### Phase 9: Taste Key Holder

```
QUESTION 12: TASTE KEY HOLDER
"Who has absolute authority over visual execution?"

Fields to capture:
- Name
- Role (e.g., "Design Lead", "Founder")
- Email (for approvals)
- GitHub handle (for PR approvals)
```

## Output: essence.yaml

Write the captured values to `sigil-mark/resonance/essence.yaml`:

```yaml
essence:
  identity:
    name: "[product name]"
    tagline: "[tagline]"
    version: "1.0.0"
    captured_date: "[ISO date]"

  soul:
    statement: "[soul statement]"

    invariants:
      - "[invariant 1]"
      - "[invariant 2]"

    anti_invariants:
      - "[anti-invariant 1]"
      - "[anti-invariant 2]"

  references:
    games:
      - name: "[game]"
        why: "[reason]"

    apps:
      - name: "[app]"
        why: "[reason]"

    physical:
      - name: "[product]"
        why: "[reason]"

  feel:
    at_first_glance: "[descriptor]"
    during_use: "[descriptor]"
    after_completion: "[descriptor]"
    on_error: "[descriptor]"

  anti_patterns:
    - pattern: "[pattern]"
      why: "[reason]"

  key_moments:
    high_stakes:
      - moment: "[moment]"
        feel: "[feel]"

    celebration:
      - moment: "[moment]"
        feel: "[feel]"

    recovery:
      - moment: "[moment]"
        feel: "[feel]"

    discovery:
      - moment: "[moment]"
        feel: "[feel]"

  tensions:
    playfulness: [0-100]
    weight: [0-100]
    density: [0-100]
    speed: [0-100]
```

## Output: holder.yaml (partial)

Update the holder section in `sigil-mark/taste-key/holder.yaml`:

```yaml
taste_key:
  holder:
    name: "[captured name]"
    role: "[captured role]"
    email: "[captured email]"
    github: "[captured github]"
    appointed: "[ISO date]"
    appointed_by: "sigil-envision"
```

## Interview Best Practices

1. **Never accept vague answers**
   - "It should feel good" → "Good how? Fast? Trustworthy? Fun?"

2. **Always ask for references**
   - "What existing product feels like that?"

3. **Push on invariants**
   - "If this was violated, would it be a bug or just preference?"

4. **Document the WHY**
   - The reason is as important as the rule

5. **Look for contradictions**
   - "You said fast AND deliberate—help me understand"

## Success Criteria

- [ ] Soul statement is one clear sentence
- [ ] At least 3 invariants captured
- [ ] At least 3 anti-invariants captured
- [ ] All 4 feel contexts have descriptors
- [ ] At least 2 reference games with specific aspects
- [ ] At least 2 reference apps with specific aspects
- [ ] At least 2 anti-patterns with alternatives
- [ ] Tension defaults captured (or preset selected)
- [ ] Taste Key holder identified
- [ ] `essence.yaml` written with all sections

## Error Handling

| Situation | Response |
|-----------|----------|
| User can't articulate soul | Offer examples, ask about competitor gaps |
| Conflicting invariants | Ask which takes priority |
| No clear anti-patterns | Ask "what would make you cringe?" |
| Vague references | Ask for specific screens/flows |
| No Taste Key holder | Suggest founder or design lead as default |

## Next Step

After `/envision`: Run `/codify` to define materials and zones.
