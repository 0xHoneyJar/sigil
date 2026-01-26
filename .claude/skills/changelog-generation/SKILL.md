---
name: changelog-generation
description: Generate user-facing changelogs from commits, linked to observations and personas
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---

# Changelog Generation Skill

Transform git commits into user-friendly changelog entries that close the observability loop.

---

## Core Principle

```
Commits → Classification → Observation Link → Persona Match → User-Facing Copy
```

Technical commits become human changelogs. Observations provide context. Personas adapt voice.

---

## Invocation

```bash
/changelog                           # From last release tag
/changelog --since v1.2.0            # From specific version
/changelog --commits a1b2c3..d4e5f6  # Specific commit range
/changelog --format discord          # Output format (discord|blog|json)
/changelog --persona power-user      # Force specific persona voice
```

---

## Workflow

### Step 1: Get Commit Range

```bash
# Find commits since last tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline

# Or from specific ref
git log v1.2.0..HEAD --oneline

# Or specific range
git log a1b2c3..d4e5f6 --oneline
```

### Step 2: Parse Commits

For each commit, extract:

```typescript
interface ParsedCommit {
  hash: string
  type: 'feat' | 'fix' | 'refactor' | 'docs' | 'chore' | 'other'
  scope?: string
  message: string
  body?: string
  files: string[]
}

function parseCommit(line: string): ParsedCommit {
  // Match conventional commit format
  const match = line.match(/^([a-f0-9]+)\s+(\w+)(?:\(([^)]+)\))?:\s*(.+)$/)

  if (match) {
    return {
      hash: match[1],
      type: match[2] as ParsedCommit['type'],
      scope: match[3],
      message: match[4],
      files: [] // Populated separately
    }
  }

  return {
    hash: line.slice(0, 7),
    type: 'other',
    message: line.slice(8)
  }
}
```

### Step 3: Classify for User Impact

| Commit Type | User-Visible? | Changelog Type | Frame |
|-------------|---------------|----------------|-------|
| `feat:` | Yes | feat | "New: You can now..." |
| `fix:` (UX bug) | Yes | fix | "Fixed: ..." |
| `fix:` (internal) | No | skip | - |
| `improve:` / `ux:` | Yes | improve | "Improved: ..." |
| `refactor:` | No | skip | Internal |
| `docs:` | No | skip | Documentation |
| `chore:` | No | skip | Maintenance |
| `test:` | No | skip | Testing |

**UX vs Internal Detection**:
```typescript
function isUserVisible(commit: ParsedCommit): boolean {
  // Check if files touch user-facing code
  const uiPatterns = [
    /components\//,
    /pages\//,
    /app\//,
    /\.tsx$/,
    /hooks\/use/
  ]

  const internalPatterns = [
    /\.test\./,
    /\.spec\./,
    /scripts\//,
    /config\//
  ]

  const touchesUI = commit.files.some(f =>
    uiPatterns.some(p => p.test(f))
  )
  const isInternal = commit.files.every(f =>
    internalPatterns.some(p => p.test(f))
  )

  return touchesUI && !isInternal
}
```

### Step 4: Find Observation Links

Check if commit references an observation:

```typescript
function findObservationLink(commit: ParsedCommit): string | null {
  const index = loadIndex('grimoires/sigil/observations/index.json')

  // 1. Check commit message for observation ID
  const obsMatch = commit.message.match(/obs-\d{4}-\d{2}-\d{2}-\d{3}/)
  if (obsMatch) return obsMatch[0]

  // 2. Check if commit addresses a known theme
  for (const [theme, data] of Object.entries(index.themes)) {
    const keywords = theme.split('+')
    const matchesTheme = keywords.some(k =>
      commit.message.toLowerCase().includes(k)
    )
    if (matchesTheme && data.confidence === 'HIGH') {
      return data.observations[0] // Most recent
    }
  }

  // 3. Check component name against selectors
  if (commit.scope) {
    const selectorMatch = index.observations.find(o =>
      o.selector?.includes(commit.scope.toLowerCase())
    )
    if (selectorMatch) return selectorMatch.id
  }

  return null
}
```

### Step 5: Match Persona

```typescript
function matchPersona(
  commit: ParsedCommit,
  obsLink: string | null
): 'power-user' | 'casual' | 'mobile' | 'general' {
  // 1. Check observation for user type
  if (obsLink) {
    const obs = loadObservation(obsLink)
    if (obs.user_profile?.type) {
      return mapUserTypeToPersona(obs.user_profile.type)
    }
  }

  // 2. Infer from commit message
  const message = commit.message.toLowerCase()

  if (message.includes('mobile') || message.includes('responsive')) {
    return 'mobile'
  }
  if (message.includes('advanced') || message.includes('power')) {
    return 'power-user'
  }
  if (message.includes('simple') || message.includes('easier')) {
    return 'casual'
  }

  return 'general'
}

function mapUserTypeToPersona(userType: string): string {
  const map = {
    'Decision-maker': 'power-user',
    'Builder-minded': 'power-user',
    'Trust-checker': 'casual',
    'Casual': 'casual',
    'mobile': 'mobile'
  }
  return map[userType] || 'general'
}
```

### Step 6: Generate User-Facing Copy

```typescript
interface ChangelogEntry {
  id: string
  timestamp: string
  type: 'feat' | 'fix' | 'improve' | 'clarify'
  internal: {
    commits: string[]
    description: string
  }
  user_facing: {
    headline: string
    detail: string
    benefit: string
  }
  persona_match: string
  feedback_ref: string | null
  attribution: {
    users: string[]
    quote?: string
  } | null
}

function generateUserCopy(
  commit: ParsedCommit,
  persona: string,
  obsLink: string | null
): { headline: string; detail: string; benefit: string } {
  const schema = loadSchema('grimoires/sigil/changelog/schema.yaml')
  const voice = schema.persona_voices[persona]

  // Generate based on commit type and persona
  const headline = generateHeadline(commit, voice)
  const detail = generateDetail(commit, voice)
  const benefit = generateBenefit(commit, voice, obsLink)

  return { headline, detail, benefit }
}
```

**Voice-Adapted Examples**:

| Commit | Persona | Output |
|--------|---------|--------|
| `feat(claim): show amount in button` | power-user | "Claim button shows amount" |
| `feat(claim): show amount in button` | casual | "See exactly how much you'll get before claiming" |
| `feat(claim): show amount in button` | mobile | "Claim amount visible on mobile" |

### Step 7: Format Output

#### Discord Format

```markdown
🍯 Kitchen Update

✨ **New**: See your claimable HENLO before clicking claim
📱 **Improved**: Cleaner mobile stats (less clutter, same info)
🔧 **Fixed**: Smooth scrolling on mobile kitchen view

Thanks to everyone who shared feedback! Keep it coming.
```

**Template**:
```typescript
function formatDiscord(entries: ChangelogEntry[]): string {
  const lines = ['🍯 Kitchen Update', '']

  const emojiMap = { feat: '✨', fix: '🔧', improve: '📱', clarify: '💡' }

  for (const entry of entries) {
    const emoji = emojiMap[entry.type]
    const typeLabel = {
      feat: 'New',
      fix: 'Fixed',
      improve: 'Improved',
      clarify: 'Clearer'
    }[entry.type]

    lines.push(`${emoji} **${typeLabel}**: ${entry.user_facing.headline}`)
  }

  lines.push('')
  lines.push('Thanks to everyone who shared feedback! Keep it coming.')

  return lines.join('\n')
}
```

#### Blog Format

```markdown
# What's New This Week

## Claim with Confidence
You asked, we listened! Now you can see exactly how much HENLO
you'll receive before clicking that claim button.

*Thanks to @papa_flavio and others who requested this!*

## Mobile Polish
We cleaned up the mobile header so stats are easier to read.
```

**Template**:
```typescript
function formatBlog(entries: ChangelogEntry[]): string {
  const lines = ['# What\'s New This Week', '']

  for (const entry of entries) {
    // Section header from headline
    lines.push(`## ${titleCase(entry.user_facing.headline)}`)

    // Detail with benefit
    lines.push(entry.user_facing.detail)
    if (entry.user_facing.benefit) {
      lines.push(entry.user_facing.benefit)
    }

    // Attribution
    if (entry.attribution?.users.length) {
      const users = entry.attribution.users.map(u => `@${u}`).join(', ')
      lines.push(`*Thanks to ${users} who requested this!*`)
    }

    lines.push('')
  }

  return lines.join('\n')
}
```

#### JSON Format (In-App)

```json
{
  "version": "1.2.3",
  "timestamp": "2026-01-25T12:00:00Z",
  "entries": [
    {
      "type": "feat",
      "headline": "See claimable amount before claiming",
      "detail": "The claim button now shows your HENLO amount",
      "benefit": "No more guessing - decide if it's worth the gas"
    }
  ]
}
```

---

## Feedback Loop Tracking

### Track Engagement

When changelog is shared, track reactions:

```typescript
interface ChangelogEngagement {
  format: 'discord' | 'blog' | 'in_app'
  timestamp: string
  changelog_id: string
  engagement: {
    reactions?: Record<string, number>  // Discord
    replies?: number
    views?: number                       // Blog
    dismissals?: number                  // In-app
    read_more?: number
  }
}
```

### Log to Taste

```yaml
---
timestamp: "2026-01-25T12:00:00Z"
signal: CHANGELOG_ENGAGEMENT
format: discord
changelog:
  version: "1.2.3"
  entry_count: 3
engagement:
  reactions: { "🔥": 5, "💯": 3, "❤️": 2 }
  replies: 2
  total_positive: 10
top_entry:
  id: "changelog-2026-01-25-001"
  headline: "See claimable amount before claiming"
  reaction_count: 7
learning:
  inference: "Users respond well to showing values before action"
  effective_frames: ["you asked we listened", "no more guessing"]
---
```

### Learn from Engagement

Track which framings resonate:

| Framing | Avg Reactions | Use When |
|---------|---------------|----------|
| "You asked, we listened" | 5.2 | Feature requests |
| "No more guessing" | 4.8 | Clarity improvements |
| "Now you can" | 4.1 | New features |
| "Fixed" | 2.3 | Bug fixes |

Apply high-engagement framings in future changelogs.

---

## Output Display

```
┌─ Changelog Generated ──────────────────────────────────────┐
│                                                            │
│  Range: v1.2.0..HEAD (12 commits)                          │
│  User-visible: 5 entries                                   │
│  Skipped: 7 (internal)                                     │
│                                                            │
│  Entries:                                                  │
│  ✨ feat: See claimable amount before claiming             │
│       └─ Linked: obs-2026-01-24-001 (@papa_flavio)         │
│  📱 improve: Cleaner mobile stats                          │
│  🔧 fix: Smooth scrolling on mobile                        │
│  💡 clarify: Updated gas estimate display                  │
│  ✨ feat: Accumulation threshold tracker                   │
│       └─ Linked: obs-2026-01-23-002 (@alice)               │
│                                                            │
│  Format: discord                                           │
│                                                            │
│  [c] Copy to clipboard                                     │
│  [p] Post to Discord                                       │
│  [s] Save to grimoires/sigil/changelog/                    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## File Storage

```
grimoires/sigil/changelog/
├── schema.yaml          # Entry schema definition
├── entries/             # Individual entries
│   └── 2026-01-25-001.yaml
├── releases/            # Compiled releases
│   └── v1.2.3.md
└── engagement/          # Engagement tracking
    └── 2026-01-25.yaml
```

---

## Integration with /craft

When generating components that address observations:

1. Note the observation ID in commit message: `feat(claim): show amount (obs-2026-01-24-001)`
2. Changelog will automatically link
3. Attribution flows through

---

## Related

- `/observe` - Capture user feedback
- `/taste-synthesize` - Pattern detection
- `/sprint-plan` - Sprint task tracking
