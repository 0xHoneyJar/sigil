---
zones:
  state:
    paths:
      - sigil-mark/
      - .sigilrc.yaml
      - .sigil-setup-complete
    permission: read-write
  app:
    paths:
      - components/
      - app/components/
      - src/components/
      - src/features/
    permission: read
---

# Sigil Setup Skill

## Purpose

Initialize Sigil design context framework on a repository. Detects component directories, creates state files, and prepares for design capture.

## Pre-Flight Checks

1. **Sigil Mounted**: Verify `.sigil-version.json` exists
2. **Not Already Setup**: Check for `.sigil-setup-complete` (warn if exists)

## Workflow

### Step 1: Detect Component Directories

Scan for common component directory patterns:
- `components/`
- `app/components/`
- `src/components/`
- `src/features/**/components/`

Use the detect-components.sh script or manual Glob search.

### Step 2: Create State Directory

Create `sigil-mark/` with empty templates:

```bash
mkdir -p sigil-mark
```

Copy templates from `.claude/templates/`:
- `moodboard.md` → `sigil-mark/moodboard.md`
- `rules.md` → `sigil-mark/rules.md`

Create empty `sigil-mark/inventory.md`.

### Step 3: Create Configuration

Create `.sigilrc.yaml` with detected component paths.

Template structure:
```yaml
version: "1.0"

component_paths:
  - "components/"        # Add detected paths
  - "app/components/"

zones:
  critical:
    paths: []
    motion: "deliberate"
    patterns:
      prefer: ["deliberate-entrance"]
      warn: ["instant-transition"]

  marketing:
    paths: []
    motion: "playful"
    patterns:
      prefer: ["playful-bounce"]

  admin:
    paths: []
    motion: "snappy"

rejections: []
```

### Step 4: Create Marker

Create `.sigil-setup-complete` marker file:

```
Sigil setup completed at [timestamp]
```

### Step 5: Report Success

Output:
- List of detected component paths
- Created files
- Next steps (/envision or /inherit)

## Idempotency

If already set up:
1. Warn user that setup already complete
2. Offer to refresh symlinks only
3. Never overwrite existing state files

## Output Format

```
Sigil Setup Complete

Detected component paths:
  - components/
  - src/features/**/components/

Created:
  - sigil-mark/moodboard.md (template)
  - sigil-mark/rules.md (template)
  - sigil-mark/inventory.md (empty)
  - .sigilrc.yaml (configuration)
  - .sigil-setup-complete (marker)

Next steps:
  - New project: /envision to capture product feel
  - Existing codebase: /inherit to bootstrap from components
```

## Scripts

- `detect-components.sh`: Find component directories in codebase
