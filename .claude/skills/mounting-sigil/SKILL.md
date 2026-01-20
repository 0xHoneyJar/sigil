# Mounting Sigil Framework

You are installing the Sigil design physics framework onto a repository. This enables physics-driven component generation.

> *"The Sigil mounts the repository, preparing to craft."*

## Core Principle

```
MOUNT once → CRAFT many times
```

Mounting installs the physics rules. Crafting generates components with correct physics.

---

## Installation Priority

Sigil supports two installation paths, tried in order:

| Priority | Method | When Used |
|----------|--------|-----------|
| 1 | **Loa Constructs** | When API key available and pack is published |
| 2 | **Git-based** | Fallback when constructs unavailable |

The constructs path provides:
- License-based updates
- Offline grace periods
- Version pinning
- Enterprise support

---

## Pre-Mount Checks

### 1. Verify Git Repository

```bash
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "❌ Not a git repository. Initialize with 'git init' first."
  exit 1
fi
echo "✓ Git repository detected"
```

### 2. Check for Existing Mount

```bash
# Check constructs-based installation first
if [[ -d ".claude/constructs/packs/sigil" ]]; then
  VERSION=$(jq -r '.version // "unknown"' .claude/constructs/packs/sigil/manifest.json 2>/dev/null)
  echo "✓ Sigil installed via Loa Constructs (v$VERSION)"
  echo "Use 'constructs-install.sh pack sigil' to update"
  exit 0
fi

# Check git-based installation
if [[ -f ".sigil-version.json" ]]; then
  VERSION=$(jq -r '.version' .sigil-version.json 2>/dev/null)
  echo "⚠️ Sigil already mounted (v$VERSION)"
  echo "Use '/update' to sync framework, or continue to remount"
fi
```

### 3. Check for React Project

```bash
if [[ -f "package.json" ]]; then
  if grep -q '"react"' package.json; then
    echo "✓ React project detected"
  fi
fi
```

---

## Mount Process

### Step 0: Try Loa Constructs First (Preferred)

```bash
# Check if constructs-install.sh exists and API key is available
CONSTRUCTS_SCRIPT=".claude/scripts/constructs-install.sh"
API_KEY="${LOA_CONSTRUCTS_API_KEY:-}"

# Try credentials file if env var not set
if [[ -z "$API_KEY" ]] && [[ -f "$HOME/.loa/credentials.json" ]]; then
  API_KEY=$(jq -r '.api_key // empty' "$HOME/.loa/credentials.json" 2>/dev/null)
fi

if [[ -x "$CONSTRUCTS_SCRIPT" ]] && [[ -n "$API_KEY" ]]; then
  echo "Attempting Loa Constructs installation..."

  if "$CONSTRUCTS_SCRIPT" pack sigil; then
    echo "✓ Sigil installed via Loa Constructs"

    # Initialize State Zone (not included in pack)
    mkdir -p grimoires/sigil/{context,moodboard}
    if [[ ! -f "grimoires/sigil/taste.md" ]]; then
      cat > grimoires/sigil/taste.md << 'EOF'
# Sigil Taste Log

> Accumulated taste signals from usage. Usage IS feedback.

## Signal Types

| Signal | Weight | Trigger |
|--------|--------|---------|
| ACCEPT | +1 | User uses generated code without changes |
| MODIFY | +5 | User edits generated code (diff reveals preference) |
| REJECT | -3 | User says no, deletes, or rewrites |

---

## Signals

EOF
    fi
    exit 0
  else
    echo "⚠️ Constructs installation failed, falling back to git-based mount"
  fi
else
  echo "ℹ️ Loa Constructs not configured, using git-based mount"
  echo "  To use constructs: Set LOA_CONSTRUCTS_API_KEY or run /skill-login"
fi
```

### Step 1: Configure Upstream Remote (Git Fallback)

```bash
SIGIL_REMOTE_URL="${SIGIL_UPSTREAM:-https://github.com/0xHoneyJar/sigil.git}"
SIGIL_REMOTE_NAME="sigil-upstream"
SIGIL_BRANCH="${SIGIL_BRANCH:-main}"

if git remote | grep -q "^${SIGIL_REMOTE_NAME}$"; then
  git remote set-url "$SIGIL_REMOTE_NAME" "$SIGIL_REMOTE_URL"
else
  git remote add "$SIGIL_REMOTE_NAME" "$SIGIL_REMOTE_URL"
fi

git fetch "$SIGIL_REMOTE_NAME" "$SIGIL_BRANCH" --quiet
echo "✓ Upstream configured"
```

### Step 2: Install Physics Rules

```bash
echo "Installing Physics Rules (.claude/rules/)..."
git checkout "$SIGIL_REMOTE_NAME/$SIGIL_BRANCH" -- .claude/rules 2>/dev/null || {
  echo "❌ Failed to checkout .claude/rules from upstream"
  exit 1
}
echo "✓ Physics rules installed"
```

### Step 3: Install Sigil Skills

```bash
echo "Installing Sigil Skills..."
# Only install Sigil-specific skills
for skill in crafting-physics styling-material animating-motion applying-behavior \
             validating-physics surveying-patterns inscribing-taste distilling-components \
             mounting-sigil updating-sigil agent-browser; do
  git checkout "$SIGIL_REMOTE_NAME/$SIGIL_BRANCH" -- ".claude/skills/$skill" 2>/dev/null
done
echo "✓ Sigil skills installed"
```

### Step 4: Install Sigil Commands

```bash
echo "Installing Sigil Commands..."
# Only install Sigil-specific commands
for cmd in craft style animate behavior ward garden inscribe distill mount update setup feedback; do
  git checkout "$SIGIL_REMOTE_NAME/$SIGIL_BRANCH" -- ".claude/commands/${cmd}.md" 2>/dev/null
done
echo "✓ Sigil commands installed"
```

### Step 5: Initialize State Zone

```bash
echo "Initializing State Zone..."

# Create structure
mkdir -p grimoires/sigil/{context,moodboard}

# Initialize taste log
if [[ ! -f "grimoires/sigil/taste.md" ]]; then
  cat > grimoires/sigil/taste.md << 'EOF'
# Sigil Taste Log

> Accumulated taste signals from usage. Usage IS feedback.

## Signal Types

| Signal | Weight | Trigger |
|--------|--------|---------|
| ACCEPT | +1 | User uses generated code without changes |
| MODIFY | +5 | User edits generated code (diff reveals preference) |
| REJECT | -3 | User says no, deletes, or rewrites |

---

## Signals

EOF
  echo "✓ Taste log initialized"
else
  echo "✓ Taste log preserved"
fi
```

### Step 6: Create Version Manifest

```bash
cat > .sigil-version.json << EOF
{
  "version": "2.0.0",
  "mounted_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "installation_method": "git",
  "physics_layers": ["behavioral", "animation", "material"],
  "skills": 11,
  "commands": 12,
  "rules": 17
}
EOF
echo "✓ Version manifest created"
```

---

## Post-Mount Output

Display completion message:

```markdown
╔═════════════════════════════════════════════════════════════════╗
║  ✓ Sigil Successfully Mounted!                                   ║
╚═════════════════════════════════════════════════════════════════╝

Physics structure:
  📁 .claude/rules/       → Physics rules (17 files)
  📁 .claude/skills/      → Sigil skills (11 skills)
  📁 .claude/commands/    → Sigil commands (12 commands)
  📁 grimoires/sigil/     → State Zone (taste accumulation)
  📄 grimoires/sigil/taste.md → Taste signal log

Next steps:
  1. Run 'claude' to start Claude Code
  2. Issue '/craft "claim button"' to generate with physics
  3. Or '/setup' for guided configuration

The Sigil has mounted. Issue '/craft' when ready.
```

---

## Stealth Mode

If `--stealth` flag or user requests:

```bash
echo "Applying stealth mode..."
touch .gitignore

for entry in "grimoires/sigil/" ".sigil-version.json"; do
  grep -qxF "$entry" .gitignore 2>/dev/null || echo "$entry" >> .gitignore
done

echo "✓ State files added to .gitignore"
```

---

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Not a git repository" | No `.git` directory | Run `git init` first |
| "Failed to checkout" | Network/auth issue | Check remote URL and credentials |
| "Sigil already mounted" | `.sigil-version.json` exists | Use `/update` or confirm remount |

---

## What Gets Installed

### Physics Rules (17)

| Rule | Purpose |
|------|---------|
| 00-sigil-core | Core principles, action defaults |
| 01-sigil-physics | Behavioral physics |
| 02-sigil-detection | Effect detection |
| 03-sigil-patterns | Golden patterns |
| 04-sigil-protected | Protected capabilities |
| 05-sigil-animation | Animation physics |
| 06-sigil-taste | Taste accumulation |
| 07-sigil-material | Material physics |
| 08-sigil-lexicon | Keyword tables |
| 10-17 | React implementation rules |

### Sigil Skills (11)

| Skill | Trigger | Purpose |
|-------|---------|---------|
| crafting-physics | /craft | Full 3-layer physics |
| styling-material | /style | Material only |
| animating-motion | /animate | Animation only |
| applying-behavior | /behavior | Behavioral only |
| validating-physics | /ward | Physics validation |
| surveying-patterns | /garden | Pattern authority |
| inscribing-taste | /inscribe | Taste inscription |
| distilling-components | /distill | Component analysis |
| mounting-sigil | /mount | Installation |
| updating-sigil | /update | Updates |
| agent-browser | (internal) | Visual validation |

### Sigil Commands (12)

/craft, /style, /animate, /behavior, /ward, /garden, /inscribe, /distill, /mount, /update, /setup, /feedback
