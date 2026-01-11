/**
 * @sigil-tier gold
 * Sigil v6.0 — Auditing Cohesion
 *
 * Visual consistency checks on demand.
 * Compare component properties against Sanctuary averages.
 *
 * @module process/auditing-cohesion
 */

import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Default variance thresholds by property type
 */
export const DEFAULT_THRESHOLDS: Record<string, number> = {
  shadow: 20,
  'border-radius': 10,
  spacing: 15,
  colors: 10,
  typography: 10,
  opacity: 5,
};

/**
 * Property patterns for extraction
 */
export const PROPERTY_PATTERNS: Record<string, RegExp> = {
  'border-radius': /border-?[rR]adius[:=]\s*['"]?(\d+(?:px|rem|em|%)?)/g,
  shadow: /box-?[sS]hadow[:=]\s*['"]?([^;'"]+)/g,
  opacity: /opacity[:=]\s*['"]?([\d.]+)/g,
  padding: /padding[:=]\s*['"]?(\d+(?:px|rem|em)?)/g,
  margin: /margin[:=]\s*['"]?(\d+(?:px|rem|em)?)/g,
  fontSize: /font-?[sS]ize[:=]\s*['"]?(\d+(?:px|rem|em)?)/g,
  fontWeight: /font-?[wW]eight[:=]\s*['"]?(\d+|bold|normal)/g,
};

// =============================================================================
// TYPES
// =============================================================================

/**
 * Extracted property value
 */
export interface PropertyValue {
  property: string;
  value: string;
  numericValue?: number;
  unit?: string;
}

/**
 * Component metadata for audit
 */
export interface ComponentMeta {
  name: string;
  path: string;
  tier: string;
  zone?: string;
  properties: PropertyValue[];
  deviations: DeviationAnnotation[];
}

/**
 * Deviation annotation from JSDoc
 */
export interface DeviationAnnotation {
  property: string;
  reason: string;
}

/**
 * Variance result for single property
 */
export interface VarianceResult {
  property: string;
  expected: string;
  actual: string;
  variance: number;
  passed: boolean;
  justified?: boolean;
  justification?: string;
}

/**
 * Full audit result
 */
export interface AuditResult {
  componentName: string;
  tier: string;
  zone?: string;
  date: string;
  variances: VarianceResult[];
  flagged: VarianceResult[];
  justified: DeviationAnnotation[];
  overall: 'pass' | 'warn' | 'fail';
}

/**
 * Sanctuary baseline for tier
 */
export interface TierBaseline {
  tier: string;
  componentCount: number;
  averages: Record<string, PropertyValue>;
}

// =============================================================================
// PROPERTY EXTRACTION
// =============================================================================

/**
 * Parse numeric value from property string
 */
export function parseNumericValue(value: string): {
  numeric: number;
  unit: string;
} | null {
  const match = value.match(/^([\d.]+)(px|rem|em|%)?$/);
  if (!match) {
    // Handle special values like font-weight
    if (value === 'bold') return { numeric: 700, unit: '' };
    if (value === 'normal') return { numeric: 400, unit: '' };
    const num = parseFloat(value);
    if (!isNaN(num)) return { numeric: num, unit: '' };
    return null;
  }
  return {
    numeric: parseFloat(match[1]),
    unit: match[2] || '',
  };
}

/**
 * Extract properties from code string
 */
export function extractProperties(code: string): PropertyValue[] {
  const properties: PropertyValue[] = [];

  for (const [property, pattern] of Object.entries(PROPERTY_PATTERNS)) {
    // Reset regex
    pattern.lastIndex = 0;
    let match;

    while ((match = pattern.exec(code)) !== null) {
      const value = match[1].trim();
      const parsed = parseNumericValue(value);

      properties.push({
        property,
        value,
        numericValue: parsed?.numeric,
        unit: parsed?.unit,
      });
    }
  }

  return properties;
}

/**
 * Extract deviation annotations from code
 */
export function extractDeviations(code: string): DeviationAnnotation[] {
  const deviations: DeviationAnnotation[] = [];
  const pattern = /@sigil-deviation\s+(\S+)\s+["']([^"']+)["']/g;
  let match;

  while ((match = pattern.exec(code)) !== null) {
    deviations.push({
      property: match[1],
      reason: match[2],
    });
  }

  return deviations;
}

/**
 * Extract tier from code
 */
export function extractTier(code: string): string {
  const match = code.match(/@sigil-tier\s+(\w+)/);
  return match ? match[1] : 'unknown';
}

/**
 * Extract zone from code
 */
export function extractZone(code: string): string | undefined {
  const match = code.match(/@sigil-zone\s+(\w+)/);
  return match ? match[1] : undefined;
}

/**
 * Extract component name from file path
 */
export function extractComponentName(filePath: string): string {
  const basename = path.basename(filePath, path.extname(filePath));
  return basename;
}

/**
 * Parse component file into metadata
 */
export function parseComponent(
  filePath: string,
  code: string
): ComponentMeta {
  return {
    name: extractComponentName(filePath),
    path: filePath,
    tier: extractTier(code),
    zone: extractZone(code),
    properties: extractProperties(code),
    deviations: extractDeviations(code),
  };
}

// =============================================================================
// BASELINE CALCULATION
// =============================================================================

/**
 * Calculate average for property across components
 */
export function calculateAverage(values: PropertyValue[]): PropertyValue | null {
  const numericValues = values
    .filter((v) => v.numericValue !== undefined)
    .map((v) => v.numericValue!);

  if (numericValues.length === 0) {
    return null;
  }

  const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
  const unit = values[0]?.unit || '';

  return {
    property: values[0].property,
    value: `${avg.toFixed(1)}${unit}`,
    numericValue: avg,
    unit,
  };
}

/**
 * Build baseline from sanctuary components
 */
export function buildTierBaseline(
  components: ComponentMeta[],
  tier: string
): TierBaseline {
  const tierComponents = components.filter((c) => c.tier === tier);

  if (tierComponents.length === 0) {
    return {
      tier,
      componentCount: 0,
      averages: {},
    };
  }

  // Group properties by type
  const propertyGroups: Record<string, PropertyValue[]> = {};

  for (const component of tierComponents) {
    for (const prop of component.properties) {
      if (!propertyGroups[prop.property]) {
        propertyGroups[prop.property] = [];
      }
      propertyGroups[prop.property].push(prop);
    }
  }

  // Calculate averages
  const averages: Record<string, PropertyValue> = {};

  for (const [property, values] of Object.entries(propertyGroups)) {
    const avg = calculateAverage(values);
    if (avg) {
      averages[property] = avg;
    }
  }

  return {
    tier,
    componentCount: tierComponents.length,
    averages,
  };
}

// =============================================================================
// VARIANCE CALCULATION
// =============================================================================

/**
 * Calculate variance percentage
 */
export function calculateVariance(actual: number, expected: number): number {
  if (expected === 0) {
    return actual === 0 ? 0 : 100;
  }
  return Math.abs(actual - expected) / expected * 100;
}

/**
 * Check if variance passes threshold
 */
export function checkThreshold(
  property: string,
  variance: number,
  thresholds: Record<string, number> = DEFAULT_THRESHOLDS
): boolean {
  // Map property to threshold category
  let category = property;
  if (['padding', 'margin'].includes(property)) {
    category = 'spacing';
  } else if (['fontSize', 'fontWeight'].includes(property)) {
    category = 'typography';
  }

  const threshold = thresholds[category] ?? 20; // Default 20%
  return variance <= threshold;
}

/**
 * Compare component against baseline
 */
export function compareToBaseline(
  component: ComponentMeta,
  baseline: TierBaseline,
  thresholds: Record<string, number> = DEFAULT_THRESHOLDS
): VarianceResult[] {
  const results: VarianceResult[] = [];

  for (const prop of component.properties) {
    const baselineValue = baseline.averages[prop.property];

    if (!baselineValue || prop.numericValue === undefined) {
      continue;
    }

    const variance = calculateVariance(
      prop.numericValue,
      baselineValue.numericValue!
    );
    const passed = checkThreshold(prop.property, variance, thresholds);

    // Check for deviation annotation
    const deviation = component.deviations.find(
      (d) => d.property === prop.property
    );

    results.push({
      property: prop.property,
      expected: baselineValue.value,
      actual: prop.value,
      variance: Math.round(variance * 10) / 10,
      passed: passed || !!deviation,
      justified: !!deviation,
      justification: deviation?.reason,
    });
  }

  return results;
}

// =============================================================================
// AUDIT EXECUTION
// =============================================================================

/**
 * Run cohesion audit on component
 */
export function auditComponent(
  component: ComponentMeta,
  sanctuaryComponents: ComponentMeta[],
  thresholds: Record<string, number> = DEFAULT_THRESHOLDS
): AuditResult {
  const baseline = buildTierBaseline(sanctuaryComponents, component.tier);
  const variances = compareToBaseline(component, baseline, thresholds);

  const flagged = variances.filter((v) => !v.passed);
  const hasFailures = flagged.length > 0;
  const hasCriticalFailures = flagged.some((v) => v.variance > 50);

  return {
    componentName: component.name,
    tier: component.tier,
    zone: component.zone,
    date: new Date().toISOString().split('T')[0],
    variances,
    flagged,
    justified: component.deviations,
    overall: hasCriticalFailures ? 'fail' : hasFailures ? 'warn' : 'pass',
  };
}

/**
 * Audit from file path
 */
export function auditFromFile(
  filePath: string,
  sanctuaryPaths: string[],
  thresholds: Record<string, number> = DEFAULT_THRESHOLDS
): AuditResult | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const code = fs.readFileSync(filePath, 'utf-8');
  const component = parseComponent(filePath, code);

  // Load sanctuary components
  const sanctuaryComponents: ComponentMeta[] = [];
  for (const sanctuaryPath of sanctuaryPaths) {
    if (!fs.existsSync(sanctuaryPath)) continue;
    const sanctuaryCode = fs.readFileSync(sanctuaryPath, 'utf-8');
    sanctuaryComponents.push(parseComponent(sanctuaryPath, sanctuaryCode));
  }

  return auditComponent(component, sanctuaryComponents, thresholds);
}

// =============================================================================
// FORMATTING
// =============================================================================

/**
 * Format variance table
 */
export function formatVarianceTable(variances: VarianceResult[]): string {
  if (variances.length === 0) {
    return '(No properties to compare)';
  }

  const header = '| Property | Expected | Actual | Variance | Status |';
  const separator = '|----------|----------|--------|----------|--------|';
  const rows = variances.map((v) => {
    const status = v.passed
      ? v.justified
        ? '📝 JUSTIFIED'
        : '✓ PASS'
      : '⚠️ FLAG';
    return `| ${v.property} | ${v.expected} | ${v.actual} | ${v.variance}% | ${status} |`;
  });

  return [header, separator, ...rows].join('\n');
}

/**
 * Format flagged items
 */
export function formatFlaggedItems(flagged: VarianceResult[]): string {
  if (flagged.length === 0) {
    return '(No flagged items)';
  }

  return flagged
    .map((f, i) => {
      return `${i + 1}. **${f.property}**: Expected ${f.expected}, got ${f.actual} (${f.variance}% variance)\n   - Suggestion: Align with tier average or add @sigil-deviation`;
    })
    .join('\n\n');
}

/**
 * Format justified deviations
 */
export function formatJustifiedDeviations(
  deviations: DeviationAnnotation[]
): string {
  if (deviations.length === 0) {
    return '(none)';
  }

  return deviations
    .map((d) => `- **${d.property}**: "${d.reason}"`)
    .join('\n');
}

/**
 * Format full audit report
 */
export function formatAuditReport(result: AuditResult): string {
  const icon =
    result.overall === 'pass'
      ? '✅'
      : result.overall === 'warn'
        ? '⚠️'
        : '❌';

  const lines = [
    `# Cohesion Audit: ${result.componentName}`,
    '',
    '## Summary',
    `Tier: ${result.tier}`,
    result.zone ? `Zone: ${result.zone}` : '',
    `Audit Date: ${result.date}`,
    `Overall: ${icon} ${result.overall.toUpperCase()}`,
    '',
    '## Variance Report',
    '',
    formatVarianceTable(result.variances),
    '',
    '## Flagged Items',
    formatFlaggedItems(result.flagged),
    '',
    '## Justified Deviations',
    formatJustifiedDeviations(result.justified),
    '',
    '## Recommendation',
  ].filter(Boolean);

  if (result.flagged.length === 0) {
    lines.push('All properties within acceptable variance. No action needed.');
  } else {
    lines.push(
      `${result.flagged.length} propert${result.flagged.length === 1 ? 'y' : 'ies'} exceed${result.flagged.length === 1 ? 's' : ''} variance threshold. Consider alignment or justification.`
    );
  }

  return lines.join('\n');
}

/**
 * Format quick summary for /craft integration
 */
export function formatQuickSummary(result: AuditResult): string {
  if (result.overall === 'pass') {
    return `🔍 Cohesion check: ✅ PASS (${result.variances.length} properties within threshold)`;
  }

  const flagCount = result.flagged.length;
  return `🔍 Cohesion check: ⚠️ ${flagCount} propert${flagCount === 1 ? 'y' : 'ies'} flagged for variance`;
}
