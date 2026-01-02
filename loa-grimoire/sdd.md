# Sigil v2 Software Design Document

**Version**: 2.0
**Status**: Draft (Reality-Checked)
**Date**: 2026-01-01
**Author**: Software Architect
**Reality Check**: 2026-01-01 via /ride

> **Grounding Notice**: This SDD has been verified against code reality.
> See loa-grimoire/drift-report.md for detailed drift analysis.

---

## 1. Executive Summary

Sigil v2 is a design context framework that provides AI agents with the information needed for consistent design decisions. Built on Loa's managed scaffolding architecture, it uses a 3-level skill structure with commands, skills, and scripts.

**Key Design Decisions**:
- Mirror Loa's architecture (3-zone model, skill structure, command routing)
- Path-based zones for design context
- Markdown-based state (moodboard.md, rules.md)
- Human-in-the-loop approval (no automated validation)
- Framework coexistence (Sigil and Loa can share a repo)

---

## 2. System Architecture

### 2.1 Three-Zone Model (Loa-Compatible)

| Zone | Path | Owner | Permission |
|------|------|-------|------------|
| **System** | `.claude/` | Framework | Symlinked from ~/.sigil/sigil |
| **State** | `sigil-mark/` | Project | Read/Write |
| **App** | `src/`, `components/` | Developer | Read-only for Sigil |

### 2.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User (Developer)                          │
│  /setup, /envision, /codify, /craft, /approve, /inherit     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Command Layer                             │
│  .claude/commands/{command}.md                               │
│  YAML frontmatter routes to skills                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Skill Layer                               │
│  .claude/skills/{skill-name}/                                │
│  ├── index.yaml    (metadata)                                │
│  ├── SKILL.md      (instructions)                            │
│  └── scripts/      (bash utilities)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    State Layer                               │
│  sigil-mark/                                                 │
│  ├── moodboard.md  (product feel)                            │
│  ├── rules.md      (design rules)                            │
│  └── inventory.md  (component list)                          │
│                                                              │
│  .sigilrc.yaml     (zone configuration)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    App Layer (Read-Only)                     │
│  components/, src/components/, app/components/               │
│  Scanned by detect-components.sh                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| Commands | Markdown + YAML frontmatter | Loa compatibility, human-readable |
| Skills | Markdown (SKILL.md) | Agent instructions, no runtime |
| Scripts | Bash | Portable, no dependencies |
| Config | YAML (.sigilrc.yaml) | Structured, yq-parseable |
| State | Markdown (moodboard.md, rules.md) | Human-editable, git-friendly |
| Parsing | yq (optional), grep/sed fallback | Minimal dependencies |

---

## 4. Component Design

### 4.1 Skills (6 Total)

| Skill | Command | Purpose |
|-------|---------|---------|
| `sigil-setup` | `/setup` | Initialize Sigil on a repo |
| `sigil-envisioning` | `/envision` | Capture product moodboard |
| `sigil-codifying` | `/codify` | Define design rules |
| `sigil-crafting` | `/craft` | Provide design guidance |
| `sigil-approving` | `/approve` | Human review and sign-off |
| `sigil-inheriting` | `/inherit` | Bootstrap from existing codebase |
| `sigil-updating` | `/update` | Pull framework updates |

### 4.2 Skill Structure (3-Level)

```
.claude/skills/{skill-name}/
├── index.yaml          # Level 1: Metadata (~100 tokens)
│   ├── name
│   ├── description
│   ├── version
│   └── outputs
├── SKILL.md            # Level 2: Instructions (~2000 tokens)
│   ├── Purpose
│   ├── Workflow
│   ├── Interview Questions (if applicable)
│   └── Output Format
└── scripts/            # Level 3: Bash utilities
    └── {script}.sh
```

### 4.3 Command Structure

```yaml
# .claude/commands/envision.md
---
name: envision
description: Capture product moodboard with interview
agent: sigil-envisioning
agent_path: .claude/skills/sigil-envisioning/SKILL.md
preflight:
  - sigil_mounted
---

# /envision

Create or update the product moodboard...
```

---

## 5. Data Architecture

### 5.1 State Files

#### sigil-mark/moodboard.md

```markdown
# Product Moodboard

**Product**: [Name]
**Created**: [Date]
**Updated**: [Date]

---

## Reference Products

### Games
- [Game 1]: [Why it inspires]
- [Game 2]: [Why it inspires]

### Apps
- [App 1]: [Why it inspires]
- [App 2]: [Why it inspires]

---

## Feel Descriptors

| Context | Feel | Reference |
|---------|------|-----------|
| Transactions | Heavy, deliberate | RuneScape skill confirm |
| Success states | Triumphant, earned | Diablo legendary drop |
| Loading | Anticipatory | Stardew day transition |
| Errors | Recoverable | - |

---

## Anti-Patterns

- [Pattern 1]: [Why to avoid]
- [Pattern 2]: [Why to avoid]

---

## Key Moments

### High-Stakes Actions
[How should critical actions feel?]

### Celebrations
[How should wins feel?]

### Recovery
[How should errors feel?]
```

#### sigil-mark/rules.md

```markdown
# Design Rules

**Version**: 1.0
**Updated**: [Date]

---

## Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| error-bg | red-50 | red-900/20 | Error backgrounds |
| success-bg | green-50 | green-900/20 | Success backgrounds |
| warning-bg | yellow-50 | yellow-900/20 | Warning backgrounds |

---

## Typography

| Element | Class | Notes |
|---------|-------|-------|
| Headings | font-bold | - |
| Body | text-base | - |
| Captions | text-sm text-slate-500 | - |

---

## Spacing

| Context | Value | Notes |
|---------|-------|-------|
| Card padding | p-4 | Standard |
| Section gap | gap-6 | Between sections |
| Grid gap | gap-4 | Component grids |

---

## Motion

### By Zone

| Zone | Style | Timing | Notes |
|------|-------|--------|-------|
| critical | deliberate | 800ms+ | Spring 120/14 |
| marketing | playful | - | Bouncy spring |
| admin | snappy | <200ms | Instant feedback |

### Recipes

| Recipe | Zone | Parameters |
|--------|------|------------|
| deliberate-entrance | critical | spring(120, 14), delay 200ms |
| playful-bounce | marketing | spring(150, 10) |
| snappy-transition | admin | spring(300, 25) |

---

## Components

### *Button

- Border radius: rounded-lg
- Focus: ring-2 ring-offset-2
- Critical zone: requires confirmation animation
- Status: approved (2026-01-01)

### *Modal

- Backdrop: bg-black/50
- Animation: deliberate-entrance
- Status: approved (2026-01-01)

---

## Approvals

| Component | Approved | Date | By |
|-----------|----------|------|----|
| Button | Yes | 2026-01-01 | @soju |
| Modal | Yes | 2026-01-01 | @soju |
```

#### sigil-mark/inventory.md

```markdown
# Component Inventory

**Generated**: [Date]
**Source**: /inherit scan

---

## Components (N total)

| Component | Path | Zone | Status |
|-----------|------|------|--------|
| Button | components/Button.tsx | shared | captured |
| ClaimModal | features/claim/ClaimModal.tsx | critical | captured |
| HeroCTA | features/marketing/HeroCTA.tsx | marketing | uncaptured |

---

## By Zone

### Critical
- ClaimModal
- CheckoutButton

### Marketing
- HeroCTA
- FeatureCard

### Shared (Zone-Agnostic)
- Button
- Input
- Modal
```

### 5.2 Configuration File

#### .sigilrc.yaml

```yaml
version: "1.0"

# Where to find components
component_paths:
  - "components/"
  - "app/components/"
  - "src/components/"
  - "src/features/**/components/"

# Zone definitions (path-based)
zones:
  critical:
    paths:
      - "src/features/checkout/**"
      - "src/features/claim/**"
      - "app/(app)/claim/**"
    motion: "deliberate"
    patterns:
      prefer:
        - "deliberate-entrance"
        - "confirmation-flow"
      warn:
        - "instant-transition"
        - "playful-bounce"

  marketing:
    paths:
      - "src/features/marketing/**"
      - "app/(marketing)/**"
    motion: "playful"
    patterns:
      prefer:
        - "playful-bounce"
        - "attention-grab"

  admin:
    paths:
      - "src/features/admin/**"
      - "app/(admin)/**"
    motion: "snappy"

# Global rejections
rejections:
  - pattern: "Spinner"
    reason: "Creates anxiety in critical zones"
    exceptions:
      - "admin/**"
      - "debug/**"

  - pattern: "Confetti"
    reason: "Often feels cheap"
    exceptions: []

# Recipe definitions (reference only, actual hooks in user code)
recipes:
  deliberate-entrance:
    spring: { stiffness: 120, damping: 14 }
    delay: 200
    description: "Heavy, deliberate entrance for critical actions"

  playful-bounce:
    spring: { stiffness: 150, damping: 10 }
    description: "Bouncy, playful for marketing"

  snappy-transition:
    spring: { stiffness: 300, damping: 25 }
    description: "Fast, efficient for admin"
```

### 5.3 Version Tracking

#### .sigil-version.json

```json
{
  "version": "2.0.0",
  "mounted_at": "2026-01-01T12:00:00Z",
  "updated_at": "2026-01-01T12:00:00Z",
  "sigil_home": "/Users/name/.sigil/sigil"
}
```

---

## 6. Skill Designs

### 6.1 sigil-setup

**Purpose**: Initialize Sigil on a repository.

**Workflow**:
1. Check if already set up (.sigil-setup-complete)
2. Detect component directories
3. Create sigil-mark/ with empty files
4. Create .sigilrc.yaml with detected paths
5. Create .sigil-setup-complete marker

**Scripts**:
- `detect-components.sh` - Find component directories

**Output**:
```
sigil-mark/
├── moodboard.md (empty template)
├── rules.md (empty template)
└── inventory.md (empty)

.sigilrc.yaml (with detected paths)
.sigil-setup-complete
.sigil-version.json
```

### 6.2 sigil-envisioning

**Purpose**: Capture product moodboard through interview.

**Interview Flow**:
1. What products/games inspire this product's feel?
2. How should users feel at key moments? (transactions, success, loading, errors)
3. What patterns should we explicitly avoid?
4. Follow-up questions for specifics

**Tools Used**: AskUserQuestion

**Output**: sigil-mark/moodboard.md

### 6.3 sigil-codifying

**Purpose**: Define design rules by category.

**Interview Flow**:
1. Read moodboard for context
2. Ask about color tokens
3. Ask about typography
4. Ask about spacing
5. Ask about motion by zone
6. Ask about component-specific rules

**Output**: sigil-mark/rules.md, updated .sigilrc.yaml

### 6.4 sigil-crafting

**Purpose**: Provide design guidance during implementation.

**Workflow**:
1. Load moodboard.md and rules.md
2. Determine zone from file path
3. Answer questions about design patterns
4. Suggest recipes based on zone
5. Warn about rejected patterns

**No Output Files** - purely conversational guidance

### 6.5 sigil-approving

**Purpose**: Human review and sign-off.

**Workflow**:
1. Present component/pattern for review
2. Show applicable rules
3. Ask for approval
4. Record in rules.md Approvals section

**Output**: Updated sigil-mark/rules.md

### 6.6 sigil-inheriting

**Purpose**: Bootstrap design system from existing codebase.

**Workflow**:
1. Run detect-components.sh
2. Generate component inventory
3. Infer patterns from existing code
4. Interview for tacit knowledge (AskUserQuestion)
5. Generate draft moodboard
6. Generate draft rules

**Scripts**:
- `detect-components.sh` - Find all components
- `infer-patterns.sh` - Extract patterns from code

**Output**:
- sigil-mark/moodboard.md (draft)
- sigil-mark/rules.md (draft)
- sigil-mark/inventory.md

### 6.7 sigil-updating

**Purpose**: Pull latest Sigil framework.

**Workflow**:
1. Git fetch origin
2. Compare versions
3. Pull updates
4. Refresh symlinks
5. Update .sigil-version.json

**Scripts**:
- `update.sh` - Framework update logic

---

## 7. Script Designs

### 7.1 detect-components.sh

```bash
#!/bin/bash
# Detect component files in configured paths
# Usage: detect-components.sh [--json]

set -e

# Read component paths from .sigilrc.yaml
PATHS=$(yq -r '.component_paths[]' .sigilrc.yaml 2>/dev/null || \
        echo -e "components/\napp/components/\nsrc/components/")

# Find .tsx/.jsx files with component exports
for path in $PATHS; do
  if [[ -d "$path" ]]; then
    find "$path" -name "*.tsx" -o -name "*.jsx" 2>/dev/null | \
    while read -r file; do
      # Check for component export
      if grep -qE "^export (default )?(function|const) [A-Z]" "$file"; then
        echo "$file"
      fi
    done
  fi
done
```

### 7.2 parse-rules.sh

```bash
#!/bin/bash
# Parse design rules for a specific context
# Usage: parse-rules.sh [zone] [category]

set -e

RULES_FILE="sigil-mark/rules.md"
ZONE="${1:-}"
CATEGORY="${2:-}"

if [[ ! -f "$RULES_FILE" ]]; then
  echo "No rules file found"
  exit 1
fi

# Extract section content
if [[ -n "$CATEGORY" ]]; then
  awk -v cat="## $CATEGORY" '
    /^## / { if (found) exit; if ($0 ~ cat) found=1; next }
    found { print }
  ' "$RULES_FILE"
fi
```

### 7.3 get-zone.sh

```bash
#!/bin/bash
# Get zone for a file path
# Usage: get-zone.sh <file-path>

set -e

FILE_PATH="$1"
CONFIG=".sigilrc.yaml"

if [[ ! -f "$CONFIG" ]]; then
  echo "default"
  exit 0
fi

# Check each zone's paths
yq -r '.zones | to_entries[] | .key as $zone | .value.paths[] | [$zone, .] | @tsv' "$CONFIG" | \
while IFS=$'\t' read -r zone pattern; do
  # Convert glob to regex
  regex=$(echo "$pattern" | sed 's/\*\*/.*/' | sed 's/\*/.*/g')
  if echo "$FILE_PATH" | grep -qE "^$regex$"; then
    echo "$zone"
    exit 0
  fi
done

echo "default"
```

### 7.4 mount-sigil.sh

```bash
#!/bin/bash
# Mount Sigil framework onto a repository
# Usage: curl -fsSL https://raw.githubusercontent.com/.../mount-sigil.sh | bash

set -e

SIGIL_HOME="${SIGIL_HOME:-$HOME/.sigil/sigil}"
SIGIL_REPO="https://github.com/zksoju/sigil.git"

echo "Mounting Sigil..."

# Clone or update framework
if [[ -d "$SIGIL_HOME" ]]; then
  echo "Updating existing installation..."
  cd "$SIGIL_HOME" && git pull origin main
else
  echo "Installing Sigil..."
  mkdir -p "$(dirname "$SIGIL_HOME")"
  git clone "$SIGIL_REPO" "$SIGIL_HOME"
fi

# Create .claude directories if needed
mkdir -p .claude/skills
mkdir -p .claude/commands

# Symlink skills
for skill in "$SIGIL_HOME/.claude/skills/sigil-"*; do
  if [[ -d "$skill" ]]; then
    ln -sf "$skill" .claude/skills/
  fi
done

# Symlink commands
for cmd in setup envision codify craft approve inherit update; do
  if [[ -f "$SIGIL_HOME/.claude/commands/${cmd}.md" ]]; then
    ln -sf "$SIGIL_HOME/.claude/commands/${cmd}.md" .claude/commands/
  fi
done

# Create version file
cat > .sigil-version.json << EOF
{
  "version": "$(cat "$SIGIL_HOME/VERSION" 2>/dev/null || echo "2.0.0")",
  "mounted_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "sigil_home": "$SIGIL_HOME"
}
EOF

echo "✓ Sigil mounted successfully"
echo ""
echo "Next steps:"
echo "  1. Start Claude Code: claude"
echo "  2. Run setup: /setup"
echo "  3. Begin workflow: /envision or /inherit"
```

---

## 8. Integration Points

### 8.1 Loa Coexistence

Sigil and Loa can coexist on the same repository:

| Aspect | Loa | Sigil |
|--------|-----|-------|
| State Zone | loa-grimoire/ | sigil-mark/ |
| Config | .loa.config.yaml | .sigilrc.yaml |
| Marker | .loa-setup-complete | .sigil-setup-complete |
| Skills | .claude/skills/discovering-* | .claude/skills/sigil-* |
| Commands | /plan-and-analyze, /implement | /envision, /craft |

**No automatic cross-loading** - developer decides when to reference design context.

### 8.2 Future: Loa Integration Hook

When Loa's `/implement` runs, it could optionally load Sigil context:

```yaml
# .loa.config.yaml (future)
integrations:
  sigil:
    enabled: true
    auto_inject: true  # Load sigil-mark/ on /implement
```

---

## 9. Security Considerations

### 9.1 No Secrets

Sigil stores no secrets. All files are safe to commit to git.

### 9.2 Shell Script Safety

All scripts use:
- `set -e` for fail-fast
- Input validation
- Safe quoting
- No command injection vectors

### 9.3 Git Safety

Mount script clones from a trusted source (user's own repo or official).

---

## 10. Development Workflow

### 10.1 Installation

```bash
# One-liner install
curl -fsSL https://raw.githubusercontent.com/zksoju/sigil/main/.claude/scripts/mount-sigil.sh | bash

# Start Claude Code
claude

# Run setup
/setup
```

### 10.2 Workflow Sequence

```
New Project:
/setup → /envision → /codify → (build) → /craft → /approve

Existing Project:
/setup → /inherit → /envision → /codify → (build) → /craft → /approve
```

### 10.3 Iteration

```
/envision (update moodboard)
    ↓
/codify (update rules)
    ↓
/craft (guidance during build)
    ↓
/approve (sign-off new patterns)
```

---

## 11. File Structure

### 11.1 Framework Repository (github.com/zksoju/sigil)

```
sigil/
├── VERSION
├── README.md
├── CLAUDE.md
├── .claude/
│   ├── commands/
│   │   ├── setup.md
│   │   ├── envision.md
│   │   ├── codify.md
│   │   ├── craft.md
│   │   ├── approve.md
│   │   ├── inherit.md
│   │   └── update.md
│   ├── skills/
│   │   ├── sigil-setup/
│   │   │   ├── index.yaml
│   │   │   ├── SKILL.md
│   │   │   └── scripts/
│   │   │       └── detect-components.sh
│   │   ├── sigil-envisioning/
│   │   │   ├── index.yaml
│   │   │   └── SKILL.md
│   │   ├── sigil-codifying/
│   │   │   ├── index.yaml
│   │   │   └── SKILL.md
│   │   ├── sigil-crafting/
│   │   │   ├── index.yaml
│   │   │   └── SKILL.md
│   │   ├── sigil-approving/
│   │   │   ├── index.yaml
│   │   │   └── SKILL.md
│   │   ├── sigil-inheriting/
│   │   │   ├── index.yaml
│   │   │   ├── SKILL.md
│   │   │   └── scripts/
│   │   │       └── infer-patterns.sh
│   │   └── sigil-updating/
│   │       ├── index.yaml
│   │       ├── SKILL.md
│   │       └── scripts/
│   │           └── update.sh
│   ├── scripts/
│   │   ├── mount-sigil.sh
│   │   ├── detect-components.sh
│   │   ├── parse-rules.sh
│   │   └── get-zone.sh
│   └── templates/
│       ├── moodboard.md
│       ├── rules.md
│       └── sigilrc.yaml
└── templates/
    └── recipes/
        ├── useDeliberateEntrance.ts
        ├── usePlayfulBounce.ts
        └── useSnappyTransition.ts
```

### 11.2 Target Project (After Mount)

```
project/
├── .claude/
│   ├── commands/
│   │   ├── setup.md → ~/.sigil/sigil/.claude/commands/setup.md
│   │   ├── envision.md → ...
│   │   └── ...
│   └── skills/
│       ├── sigil-setup/ → ~/.sigil/sigil/.claude/skills/sigil-setup/
│       └── ...
├── sigil-mark/
│   ├── moodboard.md
│   ├── rules.md
│   └── inventory.md
├── .sigilrc.yaml
├── .sigil-setup-complete
├── .sigil-version.json
└── components/
    └── ... (existing components)
```

---

## 12. Technical Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| yq not installed | Medium | Low | Fallback to grep/sed |
| Symlinks break | Low | Medium | /update --force refreshes |
| Moodboard too abstract | Medium | Medium | Specific interview questions |
| Rules drift from code | Medium | Low | Human approval keeps sync |
| Zone matching too complex | Low | Low | Start simple, add later |

---

## 13. Future Considerations

### 13.1 Phase 2 (Post-MVP)

- Visual showcase (Next.js app for non-technical viewing)
- ESLint integration (prefer-recipes, no-rejected-patterns)
- Local preview command (sigil preview <file>)

### 13.2 Phase 3

- Sealed decisions (JSONL on PR merge)
- GitHub Actions (sigil-review.yml, sigil-seal.yml)
- Chromatic integration

### 13.3 Loa Integration

- Auto-inject design context during /implement
- Design validation in review loop
- Shared NOTES.md for design decisions

---

## 14. Sprint Breakdown (Preview)

| Sprint | Focus | Deliverables |
|--------|-------|--------------|
| Sprint 1 | Foundation | mount-sigil.sh, /setup, /update, directory structure |
| Sprint 2 | Capture | /envision, /inherit, moodboard.md, inventory.md |
| Sprint 3 | Rules | /codify, rules.md, .sigilrc.yaml zones |
| Sprint 4 | Guidance | /craft, /approve, context injection |

---

## Appendix A: Command Reference

| Command | Skill | Input | Output |
|---------|-------|-------|--------|
| `/setup` | sigil-setup | - | sigil-mark/, .sigilrc.yaml |
| `/envision` | sigil-envisioning | Interview | moodboard.md |
| `/codify` | sigil-codifying | moodboard.md + Interview | rules.md |
| `/craft` | sigil-crafting | File path + question | Guidance |
| `/approve` | sigil-approving | Component name | rules.md update |
| `/inherit` | sigil-inheriting | Codebase | moodboard.md, rules.md, inventory.md |
| `/update` | sigil-updating | - | Updated symlinks |

---

## Appendix B: Zone Resolution Algorithm

```
1. Get file path
2. Load .sigilrc.yaml
3. For each zone in zones:
   a. For each path pattern in zone.paths:
      i. Convert glob to regex
      ii. If file path matches:
         - Return zone name
4. Return "default"
```

---

## Appendix C: Recipe Template

```typescript
// templates/recipes/useDeliberateEntrance.ts
import { useSpring, animated } from '@react-spring/web'

/**
 * Deliberate entrance animation for critical zone components.
 *
 * Zone: critical
 * Feel: Heavy, deliberate
 * Timing: 800ms+ with delay
 */
export function useDeliberateEntrance() {
  return useSpring({
    from: { opacity: 0, scale: 0.95, y: 8 },
    to: { opacity: 1, scale: 1, y: 0 },
    config: { tension: 120, friction: 14 },
    delay: 200,
  })
}
```
