---
zones:
  state:
    paths:
      - .sigil-version.json
    permission: read-write
  system:
    paths:
      - .claude/skills/
      - .claude/commands/
    permission: read
---

# Sigil Updating Skill

## Purpose

Pull latest Sigil framework updates and refresh symlinks. Keeps the framework current while preserving local state.

## Pre-Flight Checks

1. **Sigil Mounted**: Verify `.sigil-version.json` exists
2. **Sigil Home Exists**: Verify the sigil home directory exists

## Workflow

### Step 1: Read Current Version

Read `.sigil-version.json` to get:
- Current version
- Sigil home path
- Last update timestamp

### Step 2: Fetch Remote Updates

If `--check` flag is NOT present:
```bash
cd "$SIGIL_HOME"
git fetch origin main --quiet
```

### Step 3: Compare Versions

Compare local VERSION with remote VERSION:
```bash
LOCAL_VERSION=$(cat "$SIGIL_HOME/VERSION")
git fetch origin main --quiet
REMOTE_VERSION=$(git show origin/main:VERSION)
```

### Step 4: Report or Apply

**If --check flag:**
Report available updates and exit.

**If updates available (or --force):**
1. Pull latest changes
2. Run symlink refresh
3. Update `.sigil-version.json`

### Step 5: Refresh Symlinks

Use the update.sh script or manually:

```bash
# Re-symlink skills
for skill in "$SIGIL_HOME/.claude/skills/sigil-"*; do
  ln -sf "$skill" .claude/skills/
done

# Re-symlink commands
for cmd in setup envision codify craft approve inherit update; do
  ln -sf "$SIGIL_HOME/.claude/commands/${cmd}.md" .claude/commands/
done
```

### Step 6: Update Version Manifest

Update `.sigil-version.json` with new timestamp:
```json
{
  "version": "2.0.1",
  "mounted_at": "...",
  "updated_at": "2026-01-01T12:00:00Z",
  "sigil_home": "..."
}
```

## Output Format

### Check Mode

```
Sigil Update Check

Current version: 2.0.0
Remote version: 2.0.1
Status: Update available

Run '/update' to apply updates.
```

### Apply Mode

```
Sigil Updated

Previous version: 2.0.0
New version: 2.0.1

Refreshed:
  - 7 skills
  - 7 commands
  - 4 scripts

Your state files are preserved:
  - sigil-mark/moodboard.md
  - sigil-mark/rules.md
  - .sigilrc.yaml
```

### Already Current

```
Sigil is up to date (version 2.0.0)

Use '--force' to refresh symlinks anyway.
```

## Scripts

- `update.sh`: Main update script with version checking
