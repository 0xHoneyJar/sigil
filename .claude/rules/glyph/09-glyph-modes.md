# Glyph: Mode Detection

Glyph operates in different modes based on command structure and keywords.

## Mode Overview

| Mode | Trigger | Output |
|------|---------|--------|
| Generate | `/glyph "description"` | Hypothesis + Code |
| Analyze | `/glyph --analyze "description"` | Physics analysis only |
| Validate | `/glyph validate file.tsx` | Validation report |
| Diagnose | `/glyph --diagnose file.tsx` | Issues + suggested fixes |

## Generate Mode (Default)

**Trigger**: `/glyph "claim button"` or `/glyph "create a delete modal"`

**Flow**:
1. Detect effect from description
2. Present hypothesis
3. On accept: Generate code
4. Self-validate
5. Write file
6. Log to NOTES.md

**Output**: Complete working component

## Analyze Mode

**Trigger**:
- `/glyph --analyze "claim button"`
- Keywords in description: "what", "why", "explain", "analyze"

**Flow**:
1. Detect effect from description
2. Look up physics
3. Read relevant taste
4. Present analysis (no generation)

**Output**:
```markdown
## Physics Analysis: "claim button"

**Detected Effect**: Financial
**Signals**:
- Keyword: "claim" (weight: 0.8)

**Physics**:
- Sync: Pessimistic
- Timing: 800ms
- Confirmation: Required

**Taste Influence**:
- power-user-timing: Would reduce to 500ms (Tier 2)

**Protected Capabilities**:
- Cancel must be visible
- Withdraw must be reachable

**Rigor Considerations**:
- BigInt safety if handling amounts
- On-chain data for transaction values
```

## Validate Mode

**Trigger**: `/glyph validate src/components/ClaimButton.tsx`

**Flow**:
1. Read target file
2. Detect effect from code
3. Check physics compliance
4. Check protected capabilities
5. Run Rigor checks if web3
6. Report findings

**Output**:
```markdown
## Validation: ClaimButton.tsx

**Detected Effect**: Financial (confidence: 0.90)
**Signals**: useMutation, "claim" in name, Amount type

### Physics Compliance
✓ Sync: Pessimistic (no onMutate found)
✓ Timing: 800ms loading state
✓ Confirmation: Two-phase pattern detected

### Protected Capabilities
✓ Cancel: Visible at line 34
✓ Touch targets: All >= 44px
⚠ Focus ring: Not detected on confirm button (line 45)

### Rigor
✓ BigInt: Proper null checks at line 23
✓ Data source: Using useReadContract

### Summary
- 1 warning (focus ring)
- 0 blocking issues
```

## Diagnose Mode

**Trigger**:
- `/glyph --diagnose src/components/ClaimButton.tsx`
- Keywords: "fix", "broken", "wrong", "issue"

**Flow**:
1. Read target file
2. Run full validation
3. For each issue, generate fix suggestion
4. Optionally apply fixes

**Output**:
```markdown
## Diagnosis: ClaimButton.tsx

### Issue 1: Missing Focus Ring (WARN)
**Location**: Line 45
**Current**:
```tsx
<button onClick={() => mutate()}>
```

**Suggested Fix**:
```tsx
<button
  onClick={() => mutate()}
  className="focus-visible:ring-2 focus-visible:ring-blue-500"
>
```

### Issue 2: Potential BigInt Falsy Check (HIGH)
**Location**: Line 23
**Current**:
```tsx
if (amount) { ... }
```

**Suggested Fix**:
```tsx
if (amount != null && amount > 0n) { ... }
```

---
Apply these fixes? [y/n/select]
```

## Mode Detection Logic

```typescript
function detectMode(command: string): Mode {
  // Check for explicit flags
  if (command.includes('--analyze')) return 'analyze';
  if (command.includes('--diagnose')) return 'diagnose';
  if (command.startsWith('/glyph validate')) return 'validate';

  // Check for keywords in description
  const description = extractDescription(command);
  const analyzeKeywords = ['what', 'why', 'explain', 'analyze', 'physics'];
  const diagnoseKeywords = ['fix', 'broken', 'wrong', 'issue', 'problem'];

  if (analyzeKeywords.some(k => description.toLowerCase().includes(k))) {
    return 'analyze';
  }
  if (diagnoseKeywords.some(k => description.toLowerCase().includes(k))) {
    return 'diagnose';
  }

  // Check for file path (validate mode)
  if (description.match(/\.(tsx?|jsx?)$/)) {
    return 'validate';
  }

  // Default to generate
  return 'generate';
}
```

## Mode-Specific Rules Loading

| Mode | Rules Loaded |
|------|--------------|
| Generate | All glyph rules + wyrd hypothesis |
| Analyze | Physics + detection + protected |
| Validate | Physics + detection + protected + rigor |
| Diagnose | All rules + patterns for fix suggestions |
