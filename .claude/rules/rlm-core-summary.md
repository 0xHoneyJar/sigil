# Sigil Core Summary (RLM)

Condensed decision tree for /craft. Full rules loaded on-demand via index.yaml.

## Effect → Physics

| Effect | Sync | Timing | Confirmation |
|--------|------|--------|--------------|
| Financial | Pessimistic | 800ms | Required |
| Destructive | Pessimistic | 600ms | Required |
| Soft Delete | Optimistic | 200ms | Toast+Undo |
| Standard | Optimistic | 200ms | None |
| Navigation | Immediate | 150ms | None |
| Local | Immediate | 100ms | None |

## Detection Priority

1. **Types override keywords**: `Currency`, `Wei`, `Token`, `BigInt` → Always Financial
2. **Keywords**: claim, deposit, withdraw, delete, like, toggle, save
3. **Context**: "with undo" → Soft Delete, "for wallet" → Financial

## Protected (Non-Negotiable)

- **Withdraw**: Always reachable (never hide behind loading)
- **Cancel**: Always visible (every flow needs escape)
- **Balance**: Always accurate (invalidate on mutation)
- **Touch target**: ≥44px
- **Focus ring**: Always visible

## RLM Triggers

**Web3 keywords** (stake, claim, approve, swap, bridge, withdraw):
→ Load `19-sigil-data-physics.md` + `20-sigil-web3-flows.md`

**UI components** (button, modal, form, dialog):
→ Load `03-sigil-patterns.md`

**Animation** (motion, spring, transition):
→ Load `05-sigil-animation.md`

**Material** (style, surface, shadow):
→ Load `07-sigil-material.md`

**React project** (detected from package.json):
→ Load `10-react-core.md` conditionally

**Formal verification** (Financial, Destructive, SoftDelete effects):
→ Load `22-sigil-anchor-lens.md` for CLI validation

## Formal Verification (Anchor/Lens)

For high-stakes effects (Financial, Destructive, SoftDelete):

1. **Write request** to `grimoires/pub/requests/{uuid}.json`
2. **Run CLIs** in parallel: `anchor validate` + `lens lint`
3. **Read responses** from `grimoires/pub/responses/`
4. **Correction loop**: Max 2 attempts to fix violations
5. **Surface conflicts**: Ask user to prioritize safety vs speed

**Skip when**: CLIs not installed, Standard/Local/Navigation effect, or disabled in constitution.yaml

## Action Default

After analysis confirmation:
1. Generate/apply changes immediately
2. Match codebase conventions exactly
3. Include all relevant physics layers
4. Log taste signal after completion

**DO NOT**: Describe what you would build, ask "would you like me to generate", provide partial implementations.

## State Persistence

Check `grimoires/sigil/craft-state.md`:
- Same component + <1 hour → Continue session, increment iteration
- Different component or stale → Archive old, start new session
- Iteration 3+ → Check loop detection

## Loop Detection

If iteration ≥ 3 AND pattern detected:
- "each_fix_reveals_new_issue" → Recommend `/observe diagnose`
- "repeated_fix_attempt" → Recommend `/understand`
- "stuck_hypothesis" → Recommend `/plan-and-analyze`

Show escalation protocol with options [d]/[u]/[p]/[c].
