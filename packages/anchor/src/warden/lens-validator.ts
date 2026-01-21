/**
 * LensValidator - Validate User Lens impersonation data sources
 *
 * Validates that data displayed in User Lens mode is consistent
 * between observed values, on-chain reads, and indexed data.
 */

import type {
  LensContext,
  LensValidationIssue,
  LensIssueSeverity,
  LensValidationResult,
  Zone,
  LensExitCodeValue,
} from '../types.js';
import { LensExitCode } from '../types.js';

/**
 * Zone severity mapping for data source mismatches
 * Critical/Elevated zones require stricter data accuracy
 */
const ZONE_SEVERITY: Record<Zone, LensIssueSeverity> = {
  critical: 'error',
  elevated: 'error',
  standard: 'warning',
  local: 'info',
};

/**
 * Check for data source mismatch (observed != on_chain)
 *
 * When the UI shows a different value than what's on-chain,
 * the user may be making decisions based on stale data.
 */
function checkDataSourceMismatch(
  context: LensContext,
  zone?: Zone
): LensValidationIssue | null {
  const { observedValue, onChainValue, component } = context;

  // Skip if we don't have both values to compare
  if (observedValue === undefined || onChainValue === undefined) {
    return null;
  }

  // Normalize values for comparison (handle BigInt string representation)
  const normalizedObserved = normalizeValue(observedValue);
  const normalizedOnChain = normalizeValue(onChainValue);

  if (normalizedObserved !== normalizedOnChain) {
    const severity = zone ? ZONE_SEVERITY[zone] : 'warning';
    return {
      type: 'data_source_mismatch',
      severity,
      message: `Displayed value "${observedValue}" doesn't match on-chain value "${onChainValue}"`,
      component,
      ...(zone !== undefined && { zone }),
      expected: onChainValue,
      actual: observedValue,
      suggestion: 'Use on-chain data source for accuracy, or add refresh mechanism',
    };
  }

  return null;
}

/**
 * Check for stale indexed data (indexed != on_chain)
 *
 * Indexed data from Envio/Subgraph may lag behind on-chain state.
 * This is acceptable for display but not for transaction amounts.
 */
function checkStaleIndexedData(
  context: LensContext,
  zone?: Zone
): LensValidationIssue | null {
  const { indexedValue, onChainValue, component } = context;

  // Skip if we don't have both values to compare
  if (indexedValue === undefined || onChainValue === undefined) {
    return null;
  }

  const normalizedIndexed = normalizeValue(indexedValue);
  const normalizedOnChain = normalizeValue(onChainValue);

  if (normalizedIndexed !== normalizedOnChain) {
    // Stale indexed data is warning for standard, info for local
    // but error for critical/elevated zones
    const severity = zone ? ZONE_SEVERITY[zone] : 'warning';
    return {
      type: 'stale_indexed_data',
      severity,
      message: `Indexed value "${indexedValue}" doesn't match on-chain value "${onChainValue}"`,
      component,
      ...(zone !== undefined && { zone }),
      expected: onChainValue,
      actual: indexedValue,
      suggestion: 'Consider using on-chain reads for critical data or reducing indexer lag',
    };
  }

  return null;
}

/**
 * Check for financial zone using indexed data source
 *
 * Financial operations (critical zone) should NEVER use indexed data
 * as the source of truth for transaction amounts.
 */
function checkLensFinancialSource(
  context: LensContext,
  zone?: Zone
): LensValidationIssue | null {
  const { dataSource, component } = context;

  // Only applies to critical (financial) zone
  if (zone !== 'critical') {
    return null;
  }

  // Check if using indexed data for financial operations
  if (dataSource === 'indexed' || dataSource === 'mixed') {
    return {
      type: 'lens_financial_check',
      severity: 'error',
      message: `Financial component "${component}" uses ${dataSource} data source`,
      component,
      zone,
      suggestion: 'Financial operations must use on-chain data for transaction amounts',
    };
  }

  return null;
}

/**
 * Check for impersonation address leak
 *
 * Ensures the real address isn't being used where the impersonated
 * address should be displayed/used.
 */
function checkImpersonationLeak(
  context: LensContext
): LensValidationIssue | null {
  const { impersonatedAddress, realAddress, observedValue, component } = context;

  // Skip if no real address to compare
  if (!realAddress || !observedValue) {
    return null;
  }

  // Check if the observed value contains the real address when it should show impersonated
  const normalizedReal = realAddress.toLowerCase();
  const normalizedObserved = observedValue.toLowerCase();

  if (
    normalizedObserved.includes(normalizedReal) &&
    !normalizedObserved.includes(impersonatedAddress.toLowerCase())
  ) {
    return {
      type: 'impersonation_leak',
      severity: 'error',
      message: `Component "${component}" shows real address instead of impersonated address`,
      component,
      expected: impersonatedAddress,
      actual: observedValue,
      suggestion: 'Use lens-aware account hook to get the correct address context',
    };
  }

  return null;
}

/**
 * Normalize value for comparison
 * Handles BigInt strings, hex values, and decimal precision
 */
function normalizeValue(value: string): string {
  // Remove whitespace
  let normalized = value.trim();

  // Handle BigInt representation (e.g., "1000000000000000000n")
  if (normalized.endsWith('n')) {
    normalized = normalized.slice(0, -1);
  }

  // Handle hex values (normalize to lowercase)
  if (normalized.startsWith('0x')) {
    normalized = normalized.toLowerCase();
  }

  // Handle potential decimal precision differences
  // e.g., "1.0" vs "1.00" vs "1"
  if (normalized.includes('.')) {
    // Remove trailing zeros after decimal
    normalized = normalized.replace(/\.?0+$/, '');
  }

  return normalized;
}

/**
 * Validate LensContext for data source consistency
 *
 * @param context - The lens context to validate
 * @param zone - Optional zone for severity determination
 * @returns Validation result with any issues found
 */
export function validateLensContext(
  context: LensContext,
  zone?: Zone
): LensValidationResult {
  const issues: LensValidationIssue[] = [];

  // Run all validation checks
  const dataSourceMismatch = checkDataSourceMismatch(context, zone);
  if (dataSourceMismatch) issues.push(dataSourceMismatch);

  const staleIndexed = checkStaleIndexedData(context, zone);
  if (staleIndexed) issues.push(staleIndexed);

  const financialSource = checkLensFinancialSource(context, zone);
  if (financialSource) issues.push(financialSource);

  const impersonationLeak = checkImpersonationLeak(context);
  if (impersonationLeak) issues.push(impersonationLeak);

  // Determine overall validity (errors = invalid, warnings/info = valid with warnings)
  const hasErrors = issues.some((issue) => issue.severity === 'error');
  const hasWarnings = issues.some((issue) => issue.severity === 'warning');

  let summary: string;
  if (issues.length === 0) {
    summary = 'All lens validation checks passed';
  } else if (hasErrors) {
    const errorCount = issues.filter((i) => i.severity === 'error').length;
    summary = `${errorCount} error(s) found in lens validation`;
  } else if (hasWarnings) {
    const warningCount = issues.filter((i) => i.severity === 'warning').length;
    summary = `${warningCount} warning(s) found in lens validation`;
  } else {
    summary = `${issues.length} informational issue(s) found`;
  }

  return {
    valid: !hasErrors,
    issues,
    summary,
  };
}

/**
 * Get exit code for lens validation result
 */
export function getLensExitCode(result: LensValidationResult): LensExitCodeValue {
  if (result.valid && result.issues.length === 0) {
    return LensExitCode.PASS;
  }

  const hasErrors = result.issues.some((issue) => issue.severity === 'error');
  if (hasErrors) {
    return LensExitCode.LENS_ERROR;
  }

  const hasWarnings = result.issues.some((issue) => issue.severity === 'warning');
  if (hasWarnings) {
    return LensExitCode.LENS_WARNING;
  }

  return LensExitCode.PASS;
}

/**
 * Quick validation check - returns true if no errors
 */
export function isLensContextValid(
  context: LensContext,
  zone?: Zone
): boolean {
  const result = validateLensContext(context, zone);
  return result.valid;
}

/**
 * Batch validate multiple lens contexts
 */
export function validateMultipleLensContexts(
  contexts: Array<{ context: LensContext; zone?: Zone }>
): LensValidationResult {
  const allIssues: LensValidationIssue[] = [];

  for (const { context, zone } of contexts) {
    const result = validateLensContext(context, zone);
    allIssues.push(...result.issues);
  }

  const hasErrors = allIssues.some((issue) => issue.severity === 'error');

  let summary: string;
  if (allIssues.length === 0) {
    summary = `All ${contexts.length} lens contexts validated successfully`;
  } else {
    const errorCount = allIssues.filter((i) => i.severity === 'error').length;
    const warningCount = allIssues.filter((i) => i.severity === 'warning').length;
    summary = `Validated ${contexts.length} contexts: ${errorCount} error(s), ${warningCount} warning(s)`;
  }

  return {
    valid: !hasErrors,
    issues: allIssues,
    summary,
  };
}
