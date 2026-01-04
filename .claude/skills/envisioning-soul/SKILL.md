# Sigil Agent: Envisioning Soul

> "Every product has a soul. Your job is to find it and write it down."

## Role

**Soul Keeper** — Captures the product's essence through interview and codifies it into `sigil-mark/soul/essence.yaml`.

## Command

```
/envision
/envision --refresh
```

## Outputs

| Path | Description |
|------|-------------|
| `sigil-mark/soul/essence.yaml` | Soul statement, invariants, feel descriptors |
| `sigil-mark/moodboard.md` | References, anti-patterns, key moments |

## Workflow

### Phase 1: Soul Interview

Ask these questions in order. Do NOT skip any.

```
1. SOUL STATEMENT
   "In one sentence, what should using this product FEEL like?"
   
   Examples to prompt:
   - "Every click should feel like it matters"
   - "Speed is the feature"
   - "Earned rewards feel better than given rewards"
   
   Follow-up: "Why? What's the deeper reason?"

2. INVARIANTS
   "What must ALWAYS be true, no matter what?"
   
   Examples to prompt:
   - "Spinners are forbidden in checkout"
   - "Money UI is never optimistic"
   - "All actions are keyboard-accessible"
   
   For each invariant, ask:
   - "Why is this non-negotiable?"
   - "Should this block generation, warn, or suggest?"

3. FEEL BY CONTEXT
   For each context, ask:
   
   TRANSACTIONS:
   "How should completing a transaction feel?"
   "What real-world experience is it like?"
   "What should it NEVER feel like?"
   
   SUCCESS:
   "How should winning/succeeding feel?"
   "What game or app does success well?"
   "What success patterns feel cheap?"
   
   LOADING:
   "How should waiting feel?"
   "Should it build anticipation or be invisible?"
   "What loading patterns annoy you?"
   
   ERRORS:
   "How should errors feel?"
   "Like a stern teacher or a helpful friend?"
   "What error patterns make things worse?"

4. REFERENCE PRODUCTS
   "What products INSPIRE this one?"
   For each: "What specifically? (Speed? Feel? Polish?)"
   
   "What products should we AVOID being like?"
   For each: "What specifically feels wrong about them?"

5. ANTI-PATTERNS
   "What specific patterns violate the soul?"
   
   For each:
   - "Why is this wrong for YOUR product?"
   - "What should be used instead?"
```

### Phase 2: Write Essence

Write findings to `sigil-mark/soul/essence.yaml`:

```yaml
soul:
  statement: "[captured soul statement]"
  expanded: "[optional longer form]"

invariants:
  - id: "[generated-id]"
    statement: "[invariant]"
    reason: "[why]"
    enforcement: "block" | "warn" | "suggest"

feel:
  transactions:
    descriptor: "[captured]"
    reference: "[captured]"
    avoid: "[captured]"
  # ... other contexts

references:
  inspire:
    - name: "[product]"
      aspects: ["[aspect1]", "[aspect2]"]
  avoid:
    - name: "[product]"
      aspects: ["[aspect1]"]

anti_patterns:
  - id: "[generated-id]"
    pattern: "[pattern]"
    why: "[reason]"
    instead: "[alternative]"
```

### Phase 3: Write Moodboard

Write to `sigil-mark/moodboard.md`:

```markdown
# Product Moodboard

**Soul**: [soul statement]
**Generated**: [date]

## Reference Products

### Inspiring
- **[Product]**: [what we take from it]

### Avoiding
- **[Product]**: [what we reject]

## Feel by Context

| Context | Feel | Reference | Avoid |
|---------|------|-----------|-------|
| Transactions | [feel] | [reference] | [avoid] |
| Success | [feel] | [reference] | [avoid] |
| Loading | [feel] | [reference] | [avoid] |
| Errors | [feel] | [reference] | [avoid] |

## Anti-Patterns

### [Pattern Name]
**Pattern**: [description]
**Why it's wrong**: [reason]
**Instead**: [alternative]

## Key Moments

### High-Stakes Actions
[How critical actions should feel]

### Celebrations
[How wins should feel]

### Recovery
[How errors should feel]
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
- [ ] At least 3 invariants captured with enforcement level
- [ ] All 4 feel contexts have descriptor + reference + avoid
- [ ] At least 2 inspiring products with specific aspects
- [ ] At least 2 anti-patterns with alternatives
- [ ] `essence.yaml` validates against schema
- [ ] `moodboard.md` is human-readable

## Error Handling

| Situation | Response |
|-----------|----------|
| User can't articulate soul | Offer examples, ask about competitor gaps |
| Conflicting invariants | Ask which takes priority |
| No clear anti-patterns | Ask "what would make you cringe?" |
| Vague references | Ask for specific screens/flows |

## Next Step

After `/envision`: Run `/codify` to define materials and physics.
