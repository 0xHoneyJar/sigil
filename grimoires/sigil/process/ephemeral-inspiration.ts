/**
 * @sigil-tier gold
 * Sigil v6.0 — Ephemeral Inspiration
 *
 * One-time external reference for design inspiration.
 * Fetches, extracts, generates, then discards.
 *
 * @module process/ephemeral-inspiration
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * Inspiration trigger detection result.
 */
export interface InspirationTrigger {
  /** Whether a trigger was detected */
  detected: boolean;
  /** Type of trigger */
  type?: 'like' | 'inspired-by' | 'reference' | 'style-of';
  /** Extracted URL */
  url?: string;
  /** Original phrase */
  phrase?: string;
}

/**
 * Extracted style tokens from external content.
 */
export interface ExtractedStyles {
  /** Color palette */
  colors: {
    background?: string;
    surface?: string;
    text?: string;
    muted?: string;
    accent?: string;
    accentSecondary?: string;
  };
  /** Typography settings */
  typography: {
    fontFamily?: string;
    monoFamily?: string;
    baseFontSize?: string;
    fontWeights?: number[];
  };
  /** Spacing scale */
  spacing: {
    unit?: string;
    scale?: number[];
  };
  /** Gradient definitions */
  gradients?: string[];
  /** Border radius values */
  borderRadius?: string[];
  /** Shadow definitions */
  shadows?: string[];
}

/**
 * Forked context for ephemeral operations.
 */
export interface ForkedContext {
  /** Fork identifier */
  forkId: string;
  /** Creation timestamp */
  createdAt: string;
  /** Extracted styles (temporary) */
  styles?: ExtractedStyles;
  /** Source URL (for reference only) */
  sourceUrl?: string;
  /** Whether fork is still active */
  active: boolean;
}

/**
 * Sanctification request.
 */
export interface SanctifyRequest {
  /** Pattern name */
  patternName: string;
  /** Extracted style to sanctify */
  style: Partial<ExtractedStyles>;
  /** Source inspiration (redacted) */
  source: string;
}

/**
 * Sanctification result.
 */
export interface SanctifyResult {
  success: boolean;
  patternName: string;
  addedTo?: string;
  error?: string;
}

// =============================================================================
// TRIGGER DETECTION
// =============================================================================

/**
 * URL pattern for extraction.
 */
const URL_PATTERN = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/[^\s]*)?)/;

/**
 * Trigger patterns for inspiration detection.
 */
const TRIGGER_PATTERNS: Array<{
  pattern: RegExp;
  type: InspirationTrigger['type'];
}> = [
  // Full URL patterns first (more specific)
  { pattern: /like\s+(https?:\/\/\S+)/i, type: 'like' },
  { pattern: /inspired\s+by\s+(https?:\/\/\S+)/i, type: 'inspired-by' },
  { pattern: /reference\s+(https?:\/\/\S+)/i, type: 'reference' },
  { pattern: /style\s+of\s+(https?:\/\/\S+)/i, type: 'style-of' },
  // Domain patterns (less specific)
  { pattern: /like\s+(\S+\.(?:com|io|co|dev|app|net|org)(?:\/\S*)?)/i, type: 'like' },
  { pattern: /inspired\s+by\s+(\S+\.(?:com|io|co|dev|app|net|org)(?:\/\S*)?)/i, type: 'inspired-by' },
  { pattern: /reference\s+(\S+\.(?:com|io|co|dev|app|net|org)(?:\/\S*)?)/i, type: 'reference' },
  { pattern: /style\s+of\s+(\S+\.(?:com|io|co|dev|app|net|org)(?:\/\S*)?)/i, type: 'style-of' },
];

/**
 * Detect inspiration triggers in text.
 */
export function detectInspirationTrigger(text: string): InspirationTrigger {
  for (const { pattern, type } of TRIGGER_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      let url = match[1];

      // Normalize URL
      if (!url.startsWith('http')) {
        url = `https://${url}`;
      }

      return {
        detected: true,
        type,
        url,
        phrase: match[0],
      };
    }
  }

  return { detected: false };
}

/**
 * Extract URL from text.
 */
export function extractUrl(text: string): string | null {
  const match = text.match(URL_PATTERN);
  if (match) {
    let url = match[0];
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }
    return url;
  }
  return null;
}

// =============================================================================
// CONTEXT FORKING
// =============================================================================

/**
 * Active forked contexts (session memory only).
 */
const activeContexts = new Map<string, ForkedContext>();

/**
 * Generate unique fork ID.
 */
function generateForkId(): string {
  return `fork-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Create a forked context for ephemeral operations.
 */
export function createForkedContext(sourceUrl?: string): ForkedContext {
  const forkId = generateForkId();
  const context: ForkedContext = {
    forkId,
    createdAt: new Date().toISOString(),
    sourceUrl,
    active: true,
  };

  activeContexts.set(forkId, context);
  return context;
}

/**
 * Get forked context by ID.
 */
export function getForkedContext(forkId: string): ForkedContext | null {
  return activeContexts.get(forkId) || null;
}

/**
 * Update forked context with extracted styles.
 */
export function updateForkedContext(
  forkId: string,
  styles: ExtractedStyles
): boolean {
  const context = activeContexts.get(forkId);
  if (!context || !context.active) {
    return false;
  }

  context.styles = styles;
  return true;
}

/**
 * Discard forked context and all ephemeral data.
 */
export function discardForkedContext(forkId: string): boolean {
  const context = activeContexts.get(forkId);
  if (!context) {
    return false;
  }

  // Clear all ephemeral data
  context.styles = undefined;
  context.sourceUrl = undefined;
  context.active = false;

  activeContexts.delete(forkId);
  return true;
}

/**
 * Check if context is active.
 */
export function isContextActive(forkId: string): boolean {
  const context = activeContexts.get(forkId);
  return context?.active ?? false;
}

/**
 * Get all active context IDs.
 */
export function getActiveContextIds(): string[] {
  return Array.from(activeContexts.keys());
}

/**
 * Clear all forked contexts (for cleanup).
 */
export function clearAllContexts(): void {
  activeContexts.clear();
}

// =============================================================================
// STYLE EXTRACTION
// =============================================================================

/**
 * Extract colors from CSS content.
 */
export function extractColors(css: string): ExtractedStyles['colors'] {
  const colors: ExtractedStyles['colors'] = {};

  // Background colors
  const bgMatch = css.match(/background(?:-color)?:\s*(#[0-9a-fA-F]{3,6}|rgb[a]?\([^)]+\))/);
  if (bgMatch) {
    colors.background = bgMatch[1];
  }

  // Text colors
  const textMatch = css.match(/(?:^|\s)color:\s*(#[0-9a-fA-F]{3,6}|rgb[a]?\([^)]+\))/);
  if (textMatch) {
    colors.text = textMatch[1];
  }

  // Accent (look for primary/accent colors)
  const accentMatch = css.match(/--(?:primary|accent|brand)[^:]*:\s*(#[0-9a-fA-F]{3,6})/);
  if (accentMatch) {
    colors.accent = accentMatch[1];
  }

  return colors;
}

/**
 * Extract typography from CSS content.
 */
export function extractTypography(css: string): ExtractedStyles['typography'] {
  const typography: ExtractedStyles['typography'] = {};

  // Font family
  const fontMatch = css.match(/font-family:\s*["']?([^"',;]+)/);
  if (fontMatch) {
    typography.fontFamily = fontMatch[1].trim();
  }

  // Base font size
  const sizeMatch = css.match(/font-size:\s*(\d+(?:\.\d+)?(?:px|rem))/);
  if (sizeMatch) {
    typography.baseFontSize = sizeMatch[1];
  }

  // Font weights
  const weightMatches = css.matchAll(/font-weight:\s*(\d{3})/g);
  const weights = new Set<number>();
  for (const match of weightMatches) {
    weights.add(parseInt(match[1], 10));
  }
  if (weights.size > 0) {
    typography.fontWeights = Array.from(weights).sort((a, b) => a - b);
  }

  return typography;
}

/**
 * Extract spacing from CSS content.
 */
export function extractSpacing(css: string): ExtractedStyles['spacing'] {
  const spacing: ExtractedStyles['spacing'] = {};

  // Look for spacing CSS variables
  const spacingMatch = css.match(/--spacing(?:-unit)?:\s*(\d+(?:px|rem))/);
  if (spacingMatch) {
    spacing.unit = spacingMatch[1];
  }

  // Extract padding/margin values for scale
  const paddingMatches = css.matchAll(/padding:\s*(\d+)px/g);
  const values = new Set<number>();
  for (const match of paddingMatches) {
    values.add(parseInt(match[1], 10));
  }
  if (values.size > 0) {
    spacing.scale = Array.from(values).sort((a, b) => a - b);
  }

  return spacing;
}

/**
 * Extract gradients from CSS content.
 */
export function extractGradients(css: string): string[] {
  const gradients: string[] = [];
  const matches = css.matchAll(/(?:linear|radial)-gradient\([^)]+\)/g);

  for (const match of matches) {
    gradients.push(match[0]);
  }

  return gradients;
}

/**
 * Extract all styles from CSS content.
 */
export function extractStylesFromCSS(css: string): ExtractedStyles {
  return {
    colors: extractColors(css),
    typography: extractTypography(css),
    spacing: extractSpacing(css),
    gradients: extractGradients(css),
  };
}

// =============================================================================
// SANCTIFICATION
// =============================================================================

/**
 * In-memory storage for recent generations (for /sanctify).
 */
const recentGenerations = new Map<string, {
  code: string;
  styles: ExtractedStyles;
  timestamp: string;
}>();

/**
 * Store a recent generation for potential sanctification.
 */
export function storeRecentGeneration(
  id: string,
  code: string,
  styles: ExtractedStyles
): void {
  recentGenerations.set(id, {
    code,
    styles,
    timestamp: new Date().toISOString(),
  });

  // Keep only last 5 generations
  if (recentGenerations.size > 5) {
    const oldest = Array.from(recentGenerations.keys())[0];
    recentGenerations.delete(oldest);
  }
}

/**
 * Get a recent generation by ID.
 */
export function getRecentGeneration(id: string): {
  code: string;
  styles: ExtractedStyles;
  timestamp: string;
} | null {
  return recentGenerations.get(id) || null;
}

/**
 * Get the most recent generation.
 */
export function getMostRecentGeneration(): {
  id: string;
  code: string;
  styles: ExtractedStyles;
  timestamp: string;
} | null {
  const entries = Array.from(recentGenerations.entries());
  if (entries.length === 0) {
    return null;
  }

  const [id, data] = entries[entries.length - 1];
  return { id, ...data };
}

/**
 * Create sanctification entry for rules.md.
 */
export function formatSanctifyEntry(
  patternName: string,
  styles: Partial<ExtractedStyles>
): string {
  const lines: string[] = [
    `### ${patternName}`,
    '',
    `Sanctified: ${new Date().toISOString().split('T')[0]}`,
    '',
  ];

  if (styles.colors) {
    lines.push('**Colors:**');
    for (const [key, value] of Object.entries(styles.colors)) {
      if (value) {
        lines.push(`- ${key}: \`${value}\``);
      }
    }
    lines.push('');
  }

  if (styles.typography) {
    lines.push('**Typography:**');
    for (const [key, value] of Object.entries(styles.typography)) {
      if (value) {
        lines.push(`- ${key}: \`${value}\``);
      }
    }
    lines.push('');
  }

  if (styles.gradients && styles.gradients.length > 0) {
    lines.push('**Gradients:**');
    for (const gradient of styles.gradients) {
      lines.push(`- \`${gradient}\``);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Clear recent generations cache.
 */
export function clearRecentGenerations(): void {
  recentGenerations.clear();
}

// =============================================================================
// INTEGRATION
// =============================================================================

/**
 * Complete ephemeral inspiration flow.
 */
export interface EphemeralFlow {
  /** Start ephemeral inspiration */
  start: (url: string) => ForkedContext;
  /** Update with extracted styles */
  updateStyles: (forkId: string, styles: ExtractedStyles) => boolean;
  /** Get styles for generation */
  getStyles: (forkId: string) => ExtractedStyles | null;
  /** Complete and cleanup */
  complete: (forkId: string, generatedCode: string) => void;
  /** Discard without completing */
  discard: (forkId: string) => void;
}

/**
 * Create ephemeral flow helper.
 */
export function createEphemeralFlow(): EphemeralFlow {
  return {
    start: (url: string) => createForkedContext(url),

    updateStyles: (forkId: string, styles: ExtractedStyles) =>
      updateForkedContext(forkId, styles),

    getStyles: (forkId: string) => {
      const context = getForkedContext(forkId);
      return context?.styles || null;
    },

    complete: (forkId: string, generatedCode: string) => {
      const context = getForkedContext(forkId);
      if (context?.styles) {
        storeRecentGeneration(forkId, generatedCode, context.styles);
      }
      discardForkedContext(forkId);
    },

    discard: (forkId: string) => {
      discardForkedContext(forkId);
    },
  };
}
