# Review Sprint Hook

Runs physics validation during `/review-sprint`.

## Trigger

Activated when `/review-sprint` is invoked.

## Behavior

### Step 1: Identify Sprint Components

```typescript
async function identifySprintComponents(sprintDir: string): Promise<string[]> {
  // Get modified files in sprint scope
  const files = await glob(`${sprintDir}/**/*.{tsx,jsx}`);

  // Filter to UI components (has JSX return)
  return files.filter(file => {
    const content = readFile(file);
    return content.match(/return\s*\(?\s*</);
  });
}
```

### Step 2: Run Validation on Each

For each component file:

```typescript
async function validateComponent(filePath: string): Promise<ComponentReport> {
  const code = readFile(filePath);

  // Detect effect
  const effect = detectEffect(code);

  // Run physics check
  const physicsResults = checkPhysicsCompliance(code, effect);

  // Run protected capability check
  const protectedResults = checkProtectedCapabilities(code);

  // Run Rigor if web3
  const rigorResults = isWeb3Component(code)
    ? checkRigor(code)
    : [];

  return {
    file: filePath,
    effect,
    physics: physicsResults,
    protected: protectedResults,
    rigor: rigorResults
  };
}
```

### Step 3: Generate Report

```markdown
## Physics Validation

### ClaimButton.tsx
**Detected Effect**: Financial (confidence: 0.90)

#### Physics Compliance
✓ Sync: Pessimistic (no onMutate)
✓ Loading: isPending state present
✓ Timing: 800ms matches minimum
✓ Confirmation: Two-phase pattern

#### Protected Capabilities
✓ Cancel: Visible during all states
✓ Touch targets: All >= 44px
⚠ Focus ring: Using default browser styles

#### Rigor (Web3)
✓ BigInt: Safe patterns
✓ Data source: On-chain

---

### DeleteModal.tsx
**Detected Effect**: Destructive (confidence: 0.85)

#### Physics Compliance
✓ Sync: Pessimistic
✓ Confirmation: Present
⚠ Timing: 400ms below 600ms minimum
  → No taste override found

---

## Summary

| Component | Effect | Physics | Protected | Rigor |
|-----------|--------|---------|-----------|-------|
| ClaimButton.tsx | Financial | ✓ | ⚠ | ✓ |
| DeleteModal.tsx | Destructive | ⚠ | ✓ | N/A |

**Totals**:
- 2 components validated
- 0 blocking issues
- 2 warnings
```

### Step 4: Determine Review Status

```typescript
function determineReviewStatus(reports: ComponentReport[]): ReviewStatus {
  const hasBlocks = reports.some(r =>
    [...r.physics, ...r.protected, ...r.rigor]
      .some(v => v.status === 'BLOCK')
  );

  const hasWarnings = reports.some(r =>
    [...r.physics, ...r.protected, ...r.rigor]
      .some(v => v.status === 'WARN')
  );

  if (hasBlocks) {
    return {
      status: 'BLOCKED',
      message: 'Critical physics violations must be fixed'
    };
  }

  if (hasWarnings) {
    return {
      status: 'PASS_WITH_WARNINGS',
      message: 'Review passed with warnings'
    };
  }

  return {
    status: 'PASS',
    message: 'All physics validations passed'
  };
}
```

## Report Sections

### Physics Validation Section

For each component:
- Detected effect with confidence
- Sync strategy check
- Loading state check
- Timing check (with taste override note if applicable)
- Confirmation check (for Financial/Destructive)

### Protected Capabilities Section

- Cancel visibility
- Withdraw reachability (if applicable)
- Touch targets (44px minimum)
- Focus rings

### Rigor Section (Web3 Only)

- BigInt safety
- Data source correctness
- Receipt guard
- Stale closure check

### Summary Table

Quick overview of all components with pass/warn/fail status.

## Violation Levels

| Severity | Example | Action |
|----------|---------|--------|
| BLOCK | Protected capability missing | Fail review |
| WARN | Timing below threshold | Note in review |
| INFO | Suboptimal animation | Log only |

## Integration with Review Sprint

The hook outputs to the review report:

```markdown
## Sprint Review: Sprint-1

### Implementation Review
[Standard review content...]

### Physics Validation (Rune)
[Hook output inserted here]

### Final Status
- Code Review: ✓ Approved
- Physics Validation: ⚠ Passed with warnings
- Overall: Ready for audit
```

## Blocking Violations

Review BLOCKED if:

1. Financial component uses optimistic sync
2. Cancel hidden during loading
3. Transaction data from indexed source
4. Missing confirmation for Financial/Destructive

## Warning Handling

Warnings don't block review but:

1. Are noted in report
2. Logged to NOTES.md
3. May require justification in PR description

## Skip Conditions

Don't run physics validation on:

1. Test files (`*.test.tsx`, `*.spec.tsx`)
2. Story files (`*.stories.tsx`)
3. Config files
4. Non-UI utilities

```typescript
function shouldValidate(filePath: string): boolean {
  const skipPatterns = [
    /\.test\./,
    /\.spec\./,
    /\.stories\./,
    /\/utils\//,
    /\/config\//,
    /\/types\//
  ];

  return !skipPatterns.some(p => p.test(filePath));
}
```

## Taste Override Display

When timing is below minimum but taste allows:

```markdown
⚠ Timing: 500ms below 800ms minimum
  → Taste override "power-user-timing" (Tier 2) allows this
  → Logged in Physics Decisions table
```

## Feedback Integration

After physics report, prompt:

```
Any design preferences to record as taste? [y/n]
```

If yes: Open `/sigil` with review context.
