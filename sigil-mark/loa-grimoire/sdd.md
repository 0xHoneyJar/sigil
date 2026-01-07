# SDD: Sigil Moodboard Collection System

**Version:** v3.1.0
**Codename:** "Taste Memory"
**Date:** 2026-01-06
**Status:** Draft

---

## 1. Executive Summary

The Moodboard Collection System adds a folder-based inspiration collection to Sigil's Process layer. It follows the established reader pattern (like vocabulary-reader, philosophy-reader) but operates on a directory structure rather than a single YAML file.

**Key Design Decisions:**
- **Markdown-first**: Parse `.md` files for content and frontmatter
- **Images as references**: Include in index by path, don't analyze content
- **gray-matter**: Industry-standard frontmatter parsing
- **Recursive scanning**: Support nested organization (max 3 levels)
- **Agent-only**: Process layer, not bundled for browser

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MOODBOARD DIRECTORY                       │
│                                                              │
│  sigil-mark/moodboard/                                       │
│  ├── index.yaml          (optional curated highlights)       │
│  ├── references/**/*.md  (product inspiration)               │
│  ├── articles/*.md       (synthesized learnings)             │
│  ├── anti-patterns/*.md  (what to avoid)                     │
│  ├── gtm/*.md            (brand voice, messaging)            │
│  └── screenshots/*       (quick drops, indexed by path)      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MOODBOARD READER                          │
│                 process/moodboard-reader.ts                  │
│                                                              │
│  readMoodboard() → Moodboard                                 │
│  ├── Scans directory structure                               │
│  ├── Parses frontmatter from .md files                       │
│  ├── Indexes images by path                                  │
│  └── Returns queryable structure                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    QUERY HELPERS                             │
│                                                              │
│  getReferencesForZone(moodboard, 'critical')                 │
│  getAntiPatterns(moodboard)                                  │
│  searchMoodboard(moodboard, 'stripe')                        │
│  getFeaturedReferences(moodboard)                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SKILL INTEGRATION                         │
│                                                              │
│  /craft   → Surfaces relevant inspiration                    │
│  /envision → Prompts for inspiration collection              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| Frontmatter parsing | gray-matter | Industry standard, 4M downloads/week |
| YAML parsing | yaml | Already used in Sigil readers |
| File system | fs/promises | Node.js native, async |
| Path handling | path | Node.js native |

### New Dependency

```json
{
  "dependencies": {
    "gray-matter": "^4.0.3"
  }
}
```

---

## 4. Data Architecture

### 4.1 Directory Structure

```
sigil-mark/moodboard/
├── index.yaml              # Optional curated index
├── README.md               # User instructions (not indexed)
│
├── references/             # Product inspiration
│   └── {source}/           # e.g., stripe/, linear/
│       ├── *.md            # Markdown with optional frontmatter
│       └── *.{png,gif,jpg} # Images (indexed by path)
│
├── articles/               # Synthesized learnings
│   └── *.md
│
├── anti-patterns/          # Patterns to avoid
│   └── *.md
│
├── gtm/                    # Brand voice, messaging
│   └── *.md
│
└── screenshots/            # Quick drops
    └── *.{png,gif,jpg}
```

### 4.2 TypeScript Types

```typescript
// =============================================================================
// TYPES
// =============================================================================

/**
 * Category of moodboard entry.
 */
export type MoodboardCategory =
  | 'reference'
  | 'article'
  | 'anti-pattern'
  | 'gtm'
  | 'screenshot';

/**
 * Severity level for anti-patterns.
 */
export type AntiPatternSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Frontmatter from a markdown file.
 */
export interface MoodboardFrontmatter {
  /** Source name (e.g., "Stripe", "Linear") */
  source?: string;
  /** Original URL */
  url?: string;
  /** Applicable zones */
  zones?: string[];
  /** Applicable materials */
  materials?: string[];
  /** Related vocabulary terms */
  terms?: string[];
  /** When this was captured */
  captured?: string;
  /** Severity (for anti-patterns) */
  severity?: AntiPatternSeverity;
  /** Custom tags */
  tags?: string[];
}

/**
 * A parsed moodboard entry.
 */
export interface MoodboardEntry {
  /** Unique ID (relative path without extension) */
  id: string;
  /** Entry category */
  category: MoodboardCategory;
  /** File path relative to moodboard/ */
  path: string;
  /** File type */
  type: 'markdown' | 'image';
  /** Parsed frontmatter (markdown only) */
  frontmatter: MoodboardFrontmatter;
  /** Markdown content without frontmatter (markdown only) */
  content: string;
  /** Title extracted from first H1 or filename */
  title: string;
  /** Inferred source from path (e.g., references/stripe/ → 'stripe') */
  inferredSource?: string;
}

/**
 * Featured reference from index.yaml.
 */
export interface FeaturedReference {
  /** Path to the entry */
  path: string;
  /** Why this is featured */
  why: string;
}

/**
 * The moodboard index from index.yaml.
 */
export interface MoodboardIndex {
  /** Version */
  version: string;
  /** Featured references */
  featured: FeaturedReference[];
  /** Tag → paths mapping */
  tags: Record<string, string[]>;
}

/**
 * The complete moodboard.
 */
export interface Moodboard {
  /** Parsed entries */
  entries: MoodboardEntry[];
  /** Optional curated index */
  index: MoodboardIndex | null;
  /** Statistics */
  stats: {
    total: number;
    byCategory: Record<MoodboardCategory, number>;
    byType: { markdown: number; image: number };
  };
}
```

### 4.3 Frontmatter Schema

```yaml
# All fields are optional
---
source: "Stripe"                    # Product/company name
url: "https://stripe.com/checkout"  # Original source URL
zones: [critical, checkout]         # Applicable Sigil zones
materials: [decisive, glass]        # Applicable materials
terms: [deposit, withdraw]          # Related vocabulary terms
captured: 2026-01-06                # When captured
severity: high                      # For anti-patterns only
tags: [motion, confirmation]        # Custom tags
---
```

### 4.4 Index YAML Schema

```yaml
# sigil-mark/moodboard/index.yaml
version: "1.0"

featured:
  - path: references/stripe/checkout-flow.md
    why: "Gold standard for financial confirmation"
  - path: anti-patterns/spinner-anxiety.md
    why: "Core principle we never violate"

tags:
  deliberate_motion:
    - references/stripe/confirmation-animation.gif
    - articles/why-we-chose-deliberate-animations.md
  keyboard_first:
    - references/linear/keyboard-navigation.md
```

---

## 5. Component Design

### 5.1 moodboard-reader.ts

```typescript
/**
 * Sigil v3.1 — Moodboard Reader
 *
 * Reads and indexes the moodboard directory.
 * Implements graceful degradation: never throws, always returns valid data.
 *
 * @module process/moodboard-reader
 */

// =============================================================================
// CONSTANTS
// =============================================================================

export const DEFAULT_MOODBOARD_PATH = 'sigil-mark/moodboard';
export const MAX_SCAN_DEPTH = 3;
export const SUPPORTED_IMAGE_EXTENSIONS = ['.png', '.gif', '.jpg', '.jpeg', '.webp', '.svg'];
export const CATEGORY_DIRECTORIES: Record<string, MoodboardCategory> = {
  'references': 'reference',
  'articles': 'article',
  'anti-patterns': 'anti-pattern',
  'gtm': 'gtm',
  'screenshots': 'screenshot',
};

export const DEFAULT_MOODBOARD: Moodboard = {
  entries: [],
  index: null,
  stats: {
    total: 0,
    byCategory: {
      reference: 0,
      article: 0,
      'anti-pattern': 0,
      gtm: 0,
      screenshot: 0,
    },
    byType: { markdown: 0, image: 0 },
  },
};

// =============================================================================
// READER FUNCTIONS
// =============================================================================

/**
 * Reads and indexes the moodboard directory.
 */
export async function readMoodboard(
  basePath: string = DEFAULT_MOODBOARD_PATH
): Promise<Moodboard>;

/**
 * Synchronous version.
 */
export function readMoodboardSync(
  basePath: string = DEFAULT_MOODBOARD_PATH
): Moodboard;

// =============================================================================
// QUERY HELPERS
// =============================================================================

/**
 * Gets all entries for a specific zone.
 */
export function getEntriesForZone(
  moodboard: Moodboard,
  zone: string
): MoodboardEntry[];

/**
 * Gets all entries for a specific material.
 */
export function getEntriesForMaterial(
  moodboard: Moodboard,
  material: string
): MoodboardEntry[];

/**
 * Gets all entries for a vocabulary term.
 */
export function getEntriesForTerm(
  moodboard: Moodboard,
  term: string
): MoodboardEntry[];

/**
 * Gets all anti-patterns, optionally filtered by severity.
 */
export function getAntiPatterns(
  moodboard: Moodboard,
  severity?: AntiPatternSeverity
): MoodboardEntry[];

/**
 * Gets all entries from a specific source (e.g., 'stripe').
 */
export function getEntriesForSource(
  moodboard: Moodboard,
  source: string
): MoodboardEntry[];

/**
 * Gets featured references from index.yaml.
 */
export function getFeaturedReferences(
  moodboard: Moodboard
): Array<{ entry: MoodboardEntry | null; why: string }>;

/**
 * Searches moodboard by text query (title, content, source).
 */
export function searchMoodboard(
  moodboard: Moodboard,
  query: string
): MoodboardEntry[];

/**
 * Gets entries by custom tag.
 */
export function getEntriesByTag(
  moodboard: Moodboard,
  tag: string
): MoodboardEntry[];

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

/**
 * Formats an entry for display.
 */
export function formatEntrySummary(entry: MoodboardEntry): string;

/**
 * Formats moodboard statistics.
 */
export function formatMoodboardSummary(moodboard: Moodboard): string;
```

### 5.2 Processing Flow

```
readMoodboard(basePath)
    │
    ├─► Check if directory exists
    │   └─► If not: return DEFAULT_MOODBOARD
    │
    ├─► Read index.yaml (if exists)
    │   └─► Parse with yaml
    │
    ├─► Scan category directories
    │   ├─► references/ (recursive, max 3 levels)
    │   ├─► articles/
    │   ├─► anti-patterns/
    │   ├─► gtm/
    │   └─► screenshots/
    │
    ├─► For each file:
    │   ├─► .md files:
    │   │   ├─► Parse frontmatter with gray-matter
    │   │   ├─► Extract title from H1 or filename
    │   │   └─► Create MoodboardEntry
    │   │
    │   └─► Image files:
    │       ├─► Infer source from path
    │       └─► Create MoodboardEntry (empty content)
    │
    ├─► Calculate statistics
    │
    └─► Return Moodboard
```

### 5.3 Title Extraction Logic

```typescript
function extractTitle(content: string, filename: string): string {
  // Try to find first H1
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }

  // Fall back to filename
  return filename
    .replace(/\.md$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
```

### 5.4 Source Inference Logic

```typescript
function inferSource(relativePath: string): string | undefined {
  // references/stripe/checkout.md → 'stripe'
  const parts = relativePath.split('/');
  if (parts[0] === 'references' && parts.length >= 2) {
    return parts[1].toLowerCase();
  }
  return undefined;
}
```

---

## 6. Integration Points

### 6.1 /craft Skill Integration

The `/craft` skill will be updated to:

1. Call `readMoodboard()` at the start
2. Query relevant entries based on current context:
   - `getEntriesForZone(moodboard, currentZone)`
   - `getEntriesForTerm(moodboard, currentTerm)`
   - `getAntiPatterns(moodboard)`
3. Include 1-3 relevant references in guidance output

```typescript
// In crafting-guidance skill
const moodboard = await readMoodboard();
const relevantRefs = getEntriesForZone(moodboard, zone);
const antiPatterns = getAntiPatterns(moodboard);
const featured = getFeaturedReferences(moodboard);

// Output
`Based on your moodboard:
${relevantRefs.slice(0, 2).map(r => `- See: ${r.path}`).join('\n')}
${antiPatterns.slice(0, 1).map(a => `- Avoid: ${a.title} (${a.path})`).join('\n')}
`
```

### 6.2 /envision Skill Integration

The `/envision` skill will be updated to:

1. Prompt user about moodboard at the start:
   ```
   "Drop any inspiration into sigil-mark/moodboard/ — I'll reference it during /craft."
   ```

2. After interview, suggest next steps:
   ```
   "Consider adding reference screenshots to moodboard/references/ for design guidance."
   ```

### 6.3 Export from process/index.ts

```typescript
// Add to process/index.ts
export {
  // Reader
  readMoodboard,
  readMoodboardSync,
  // Query helpers
  getEntriesForZone,
  getEntriesForMaterial,
  getEntriesForTerm,
  getAntiPatterns,
  getEntriesForSource,
  getFeaturedReferences,
  searchMoodboard,
  getEntriesByTag,
  // Display helpers
  formatEntrySummary,
  formatMoodboardSummary,
  // Constants
  DEFAULT_MOODBOARD,
  DEFAULT_MOODBOARD_PATH,
  // Types
  type Moodboard,
  type MoodboardEntry,
  type MoodboardCategory,
  type MoodboardFrontmatter,
  type MoodboardIndex,
  type FeaturedReference,
  type AntiPatternSeverity,
} from './moodboard-reader';
```

---

## 7. File Structure

### New Files

```
sigil-mark/
├── moodboard/                           # NEW: Directory structure
│   ├── README.md                        # Instructions
│   ├── references/
│   │   └── .gitkeep
│   ├── articles/
│   │   └── .gitkeep
│   ├── anti-patterns/
│   │   └── .gitkeep
│   ├── gtm/
│   │   └── .gitkeep
│   └── screenshots/
│       └── .gitkeep
│
├── process/
│   ├── moodboard-reader.ts              # NEW: Reader implementation
│   └── index.ts                         # MODIFIED: Add exports
│
└── __tests__/
    └── process/
        └── moodboard-reader.test.ts     # NEW: Test suite
```

### Modified Files

| File | Change |
|------|--------|
| `process/index.ts` | Add moodboard exports |
| `CLAUDE.md` | Document moodboard usage |
| `.claude/skills/crafting-guidance/SKILL.md` | Add moodboard reference |
| `.claude/skills/envisioning-moodboard/SKILL.md` | Add moodboard prompts |

---

## 8. Test Strategy

### Test Cases

```typescript
describe('readMoodboard', () => {
  it('should return default for non-existent directory');
  it('should parse index.yaml when present');
  it('should scan all category directories');
  it('should parse markdown frontmatter');
  it('should extract title from H1');
  it('should fall back to filename for title');
  it('should infer source from references path');
  it('should index image files');
  it('should respect max scan depth');
  it('should calculate statistics correctly');
});

describe('Query Helpers', () => {
  it('getEntriesForZone should filter by zone');
  it('getEntriesForMaterial should filter by material');
  it('getEntriesForTerm should filter by term');
  it('getAntiPatterns should return anti-patterns');
  it('getAntiPatterns should filter by severity');
  it('getEntriesForSource should filter by source');
  it('getFeaturedReferences should return featured with why');
  it('searchMoodboard should search title and content');
  it('getEntriesByTag should filter by tag');
});

describe('Graceful Degradation', () => {
  it('should never throw on missing directory');
  it('should skip invalid markdown files');
  it('should handle malformed frontmatter');
  it('should continue on permission errors');
});
```

### Expected Test Count

| Suite | Tests |
|-------|-------|
| readMoodboard | 10 |
| Query Helpers | 9 |
| Graceful Degradation | 4 |
| Display Helpers | 3 |
| **Total** | **~26** |

---

## 9. Security Considerations

| Concern | Mitigation |
|---------|------------|
| Path traversal | Use `path.resolve()`, validate within moodboard dir |
| Malicious frontmatter | gray-matter sanitizes input |
| Large files | Skip files > 1MB |
| Symlink attacks | Use `fs.stat()` to verify regular files |

---

## 10. Performance Considerations

| Concern | Mitigation |
|---------|------------|
| Large moodboards | Lazy loading, stats without content |
| Many files | Parallel file reading with Promise.all |
| Deep nesting | Max depth limit (3 levels) |
| Frequent reads | Consider caching in skill context |

---

## 11. Sprint Breakdown

### Sprint 1: Foundation
- Create directory structure with README
- Implement moodboard-reader.ts (types, reader, validation)
- Add tests for reader
- Export from process/index.ts

### Sprint 2: Integration
- Update /craft skill to reference moodboard
- Update /envision skill to prompt for inspiration
- Update CLAUDE.md documentation
- End-to-end testing

---

## 12. Open Items

| Item | Status | Owner |
|------|--------|-------|
| Confirm gray-matter dependency | Pending | User |
| Example moodboard content | Pending | User |
| Caching strategy | Deferred to v3.2 | - |

---

## 13. Future Considerations (v3.2+)

- **Image analysis**: Use vision to describe screenshots
- **Auto-tagging**: Infer zones/materials from content
- **Sync with Figma**: Import design references automatically
- **Moodboard UI**: Web interface for browsing inspiration

---

*SDD Author: Claude*
*Date: 2026-01-06*
