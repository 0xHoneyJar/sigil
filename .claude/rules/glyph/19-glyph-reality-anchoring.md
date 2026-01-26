# Glyph: Reality Anchoring

Validate generated physics against test expectations.

## Purpose

If a component has an associated test file, validate that generated physics align with test expectations. Catch conflicts early.

## Test File Detection

```typescript
function findTestFile(componentPath: string): string | null {
  const baseName = path.basename(componentPath, path.extname(componentPath));
  const dir = path.dirname(componentPath);

  // Common test file patterns
  const patterns = [
    `${baseName}.test.tsx`,
    `${baseName}.test.ts`,
    `${baseName}.spec.tsx`,
    `${baseName}.spec.ts`,
    `__tests__/${baseName}.test.tsx`,
    `__tests__/${baseName}.test.ts`
  ];

  for (const pattern of patterns) {
    const testPath = path.join(dir, pattern);
    if (fs.existsSync(testPath)) {
      return testPath;
    }
  }

  return null;
}
```

## Test Expectation Extraction

### Timing Expectations

```typescript
function extractTimingExpectations(testCode: string): TimingExpectation[] {
  const expectations: TimingExpectation[] = [];

  // Look for waitFor with timeout
  const waitForPattern = /waitFor\([^,]+,\s*\{\s*timeout:\s*(\d+)/g;
  let match;
  while ((match = waitForPattern.exec(testCode)) !== null) {
    expectations.push({
      type: 'timeout',
      value: parseInt(match[1]),
      line: getLineNumber(testCode, match.index)
    });
  }

  // Look for jest.advanceTimersByTime
  const timerPattern = /advanceTimersByTime\((\d+)\)/g;
  while ((match = timerPattern.exec(testCode)) !== null) {
    expectations.push({
      type: 'timer',
      value: parseInt(match[1]),
      line: getLineNumber(testCode, match.index)
    });
  }

  return expectations;
}
```

### Loading State Expectations

```typescript
function extractLoadingExpectations(testCode: string): LoadingExpectation[] {
  const expectations: LoadingExpectation[] = [];

  // Look for loading text assertions
  const loadingPattern = /getByText\(['"]([^'"]*loading[^'"]*)['"]\)|getByRole\(['"]progressbar['"]\)/gi;
  let match;
  while ((match = loadingPattern.exec(testCode)) !== null) {
    expectations.push({
      type: 'loading_text',
      pattern: match[1] || 'progressbar',
      line: getLineNumber(testCode, match.index)
    });
  }

  // Look for isPending assertions
  const pendingPattern = /expect\([^)]*isPending[^)]*\)/g;
  while ((match = pendingPattern.exec(testCode)) !== null) {
    expectations.push({
      type: 'isPending',
      line: getLineNumber(testCode, match.index)
    });
  }

  return expectations;
}
```

### Confirmation Expectations

```typescript
function extractConfirmationExpectations(testCode: string): ConfirmationExpectation[] {
  const expectations: ConfirmationExpectation[] = [];

  // Look for confirm button interactions
  const confirmPattern = /getByText\(['"]confirm['"]\)|getByRole\(['"]button['"],\s*\{\s*name:\s*['"]confirm['"]/gi;
  let match;
  while ((match = confirmPattern.exec(testCode)) !== null) {
    expectations.push({
      type: 'confirm_button',
      line: getLineNumber(testCode, match.index)
    });
  }

  // Look for modal/dialog assertions
  const modalPattern = /getByRole\(['"]dialog['"]\)|getByRole\(['"]alertdialog['"]\)/g;
  while ((match = modalPattern.exec(testCode)) !== null) {
    expectations.push({
      type: 'modal',
      line: getLineNumber(testCode, match.index)
    });
  }

  return expectations;
}
```

## Reality Check Output

```markdown
## Reality Check

Found test: ClaimButton.test.tsx

### Test Expectations

| Expectation | Test Location | Generated | Status |
|-------------|---------------|-----------|--------|
| Loading state during mutation | line 45 | ✓ isPending | MATCH |
| 800ms timeout on pending | line 67 | ✓ 800ms | MATCH |
| Confirmation modal before action | line 89 | ✓ showConfirm state | MATCH |

### Summary
Physics validated against 3 test expectations.
All expectations match generated code.
```

## Conflict Detection

```markdown
## Reality Check

Found test: ClaimButton.test.tsx

### ⚠ Conflicts Detected

| Expectation | Test | Generated | Conflict |
|-------------|------|-----------|----------|
| Timing | 800ms (line 67) | 500ms | MISMATCH |

### Conflict Details

**Timing Mismatch**:
- Test expects 800ms timeout (line 67)
- Generated uses 500ms (taste override: power-user-timing)

### Resolution Options

1. **Update test to match taste** (recommended for user preferences)
   ```tsx
   // Change from
   await waitFor(() => {...}, { timeout: 800 })
   // To
   await waitFor(() => {...}, { timeout: 500 })
   ```

2. **Override physics to match test** (if test reflects requirements)
   - Remove taste override for this component
   - Use default 800ms timing

Which approach? [1/2]
```

## Conflict Resolution

### Option 1: Update Test

```typescript
async function updateTestToMatchPhysics(
  testPath: string,
  conflicts: Conflict[]
): Promise<void> {
  let testCode = await readFile(testPath);

  for (const conflict of conflicts) {
    if (conflict.type === 'timing') {
      testCode = testCode.replace(
        new RegExp(`timeout:\\s*${conflict.testValue}`),
        `timeout: ${conflict.generatedValue}`
      );
    }
  }

  await writeFile(testPath, testCode);

  console.log(`Updated ${testPath} to match generated physics.`);
}
```

### Option 2: Override Physics

```typescript
async function overridePhysicsToMatchTest(
  componentPath: string,
  conflicts: Conflict[]
): Promise<void> {
  // Log override
  await logToNotes({
    type: 'physics_override',
    component: componentPath,
    reason: 'Test requirement',
    conflicts
  });

  // Re-generate with test values
  for (const conflict of conflicts) {
    if (conflict.type === 'timing') {
      // Force timing to test value
      generationOptions.timing = conflict.testValue;
    }
  }
}
```

## Integration with Self-Validation

Reality check runs after self-validation:

```
1. Generate code
2. Self-validate (physics, protected, rigor)
3. Reality check (test alignment) ← NEW
4. Resolve conflicts if any
5. Write file
```

## Skip Conditions

Don't run reality check if:

1. No test file found
2. Test file is empty or invalid
3. Component is new (no existing tests)
4. User has disabled reality anchoring

## Configuration

In `.loa.config.yaml`:

```yaml
rune:
  reality_anchoring:
    enabled: true
    auto_update_tests: false  # Require confirmation
    prefer_test_values: false # Prefer generated/taste values
```
