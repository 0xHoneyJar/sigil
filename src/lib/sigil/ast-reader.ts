/**
 * Sigil v10.1 "Usage Reality" - AST Reader
 *
 * AST-based intent inference using TypeScript Compiler API.
 * "The AST is the documentation."
 *
 * Detects: interactive, navigation, async, mutation, financial
 * without requiring JSDoc annotations or manual tagging.
 *
 * @module @sigil/ast-reader
 * @version 10.1.0
 */

import * as ts from 'typescript';
import { readFileSync, existsSync } from 'fs';

// =============================================================================
// Types
// =============================================================================

/**
 * Inferred intent from AST analysis.
 */
export interface InferredIntent {
  /** Has onClick, onPress, or onSubmit handlers */
  interactive: boolean;
  /** Has href, to, or Link usage */
  navigation: boolean;
  /** Returns Promise or uses async/await */
  async: boolean;
  /** Uses useMutation, fetch with POST/PUT/PATCH/DELETE */
  mutation: boolean;
  /** Uses Money, Currency, Balance, or financial types */
  financial: boolean;
  /** Has form elements or form handling */
  form: boolean;
  /** Uses sensitive patterns (ownership, permission, transfer, etc.) */
  sensitive: boolean;
}

/**
 * Complete AST analysis result.
 */
export interface ASTAnalysis {
  /** File path analyzed */
  filePath: string;
  /** Inferred intent */
  intent: InferredIntent;
  /** Detected hooks used */
  hooks: string[];
  /** Detected components imported */
  components: string[];
  /** Detected types used */
  types: string[];
  /** Export names */
  exports: string[];
  /** Dependencies (imports) */
  dependencies: string[];
  /** Analysis timestamp */
  analyzedAt: Date;
  /** Confidence score (0-1) */
  confidence: number;
}

/**
 * Pattern detection configuration.
 */
interface DetectionPatterns {
  interactiveProps: string[];
  navigationProps: string[];
  mutationPatterns: string[];
  financialTypes: string[];
  sensitivePatterns: string[];
  formPatterns: string[];
}

// =============================================================================
// Detection Patterns
// =============================================================================

const DETECTION_PATTERNS: DetectionPatterns = {
  interactiveProps: [
    'onClick',
    'onPress',
    'onSubmit',
    'onMouseDown',
    'onMouseUp',
    'onKeyDown',
    'onKeyUp',
    'onFocus',
    'onBlur',
    'onChange',
    'onInput',
    'onTouchStart',
    'onTouchEnd',
    'onPointerDown',
    'onPointerUp',
  ],
  navigationProps: ['href', 'to', 'navigate', 'push', 'replace', 'Link', 'NavLink', 'useRouter', 'useNavigate'],
  mutationPatterns: [
    'useMutation',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'create',
    'update',
    'delete',
    'remove',
    'submit',
    'save',
  ],
  financialTypes: [
    'Money',
    'Currency',
    'Balance',
    'Price',
    'Amount',
    'Payment',
    'Transaction',
    'Deposit',
    'Withdraw',
    'Transfer',
    'Credits',
    'Points',
    'Token',
    'Wei',
    'Gwei',
    'ETH',
    'USD',
    'BTC',
  ],
  sensitivePatterns: [
    'ownership',
    'permission',
    'delete',
    'transfer',
    'withdraw',
    'burn',
    'destroy',
    'admin',
    'role',
    'auth',
    'secret',
    'password',
    'credential',
  ],
  formPatterns: ['form', 'input', 'textarea', 'select', 'checkbox', 'radio', 'useForm', 'handleSubmit', 'register'],
};

// =============================================================================
// AST Utilities
// =============================================================================

/**
 * Parse a TypeScript/TSX file and return the AST.
 *
 * @param filePath - Path to the file
 * @returns Parsed source file or null
 */
function parseFile(filePath: string): ts.SourceFile | null {
  if (!existsSync(filePath)) {
    return null;
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const isTsx = filePath.endsWith('.tsx');

    return ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, isTsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  } catch {
    return null;
  }
}

/**
 * Walk the AST and collect all nodes.
 *
 * @param node - Root node
 * @param visitor - Visitor function
 */
function walkAST(node: ts.Node, visitor: (node: ts.Node) => void): void {
  visitor(node);
  ts.forEachChild(node, (child) => walkAST(child, visitor));
}

/**
 * Get all identifiers in the AST.
 */
function collectIdentifiers(sourceFile: ts.SourceFile): string[] {
  const identifiers: string[] = [];

  walkAST(sourceFile, (node) => {
    if (ts.isIdentifier(node)) {
      identifiers.push(node.text);
    }
  });

  return identifiers;
}

/**
 * Get all string literals in the AST.
 */
function collectStringLiterals(sourceFile: ts.SourceFile): string[] {
  const literals: string[] = [];

  walkAST(sourceFile, (node) => {
    if (ts.isStringLiteral(node)) {
      literals.push(node.text);
    }
  });

  return literals;
}

/**
 * Get all property access expressions.
 */
function collectPropertyAccesses(sourceFile: ts.SourceFile): string[] {
  const accesses: string[] = [];

  walkAST(sourceFile, (node) => {
    if (ts.isPropertyAccessExpression(node)) {
      accesses.push(node.name.text);
    }
  });

  return accesses;
}

/**
 * Get all JSX attributes.
 */
function collectJSXAttributes(sourceFile: ts.SourceFile): string[] {
  const attributes: string[] = [];

  walkAST(sourceFile, (node) => {
    if (ts.isJsxAttribute(node) && ts.isIdentifier(node.name)) {
      attributes.push(node.name.text);
    }
  });

  return attributes;
}

/**
 * Get all imports.
 */
function collectImports(sourceFile: ts.SourceFile): { source: string; names: string[] }[] {
  const imports: { source: string; names: string[] }[] = [];

  walkAST(sourceFile, (node) => {
    if (ts.isImportDeclaration(node)) {
      const source = (node.moduleSpecifier as ts.StringLiteral).text;
      const names: string[] = [];

      if (node.importClause) {
        // Default import
        if (node.importClause.name) {
          names.push(node.importClause.name.text);
        }

        // Named imports
        if (node.importClause.namedBindings) {
          if (ts.isNamedImports(node.importClause.namedBindings)) {
            for (const element of node.importClause.namedBindings.elements) {
              names.push(element.name.text);
            }
          } else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
            names.push(node.importClause.namedBindings.name.text);
          }
        }
      }

      imports.push({ source, names });
    }
  });

  return imports;
}

/**
 * Get all exports.
 */
function collectExports(sourceFile: ts.SourceFile): string[] {
  const exports: string[] = [];

  walkAST(sourceFile, (node) => {
    // export function Name
    if (ts.isFunctionDeclaration(node) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
      if (node.name) {
        exports.push(node.name.text);
      }
    }

    // export const Name
    if (ts.isVariableStatement(node) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) {
          exports.push(decl.name.text);
        }
      }
    }

    // export interface/type Name
    if (ts.isInterfaceDeclaration(node) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
      exports.push(node.name.text);
    }

    if (ts.isTypeAliasDeclaration(node) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
      exports.push(node.name.text);
    }

    // export class Name
    if (ts.isClassDeclaration(node) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
      if (node.name) {
        exports.push(node.name.text);
      }
    }
  });

  return exports;
}

/**
 * Check if file contains async functions or Promise returns.
 */
function hasAsyncPatterns(sourceFile: ts.SourceFile): boolean {
  let hasAsync = false;

  walkAST(sourceFile, (node) => {
    // async function
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
      if (node.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword)) {
        hasAsync = true;
      }
    }

    // await expression
    if (ts.isAwaitExpression(node)) {
      hasAsync = true;
    }

    // Promise type reference
    if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName) && node.typeName.text === 'Promise') {
      hasAsync = true;
    }
  });

  return hasAsync;
}

/**
 * Detect hooks usage.
 */
function detectHooks(identifiers: string[]): string[] {
  return identifiers.filter((id) => id.startsWith('use') && id.length > 3 && id[3] === id[3].toUpperCase());
}

// =============================================================================
// Intent Detection
// =============================================================================

/**
 * Check if a pattern matches any items in a list.
 */
function matchesAny(items: string[], patterns: string[]): boolean {
  const lowerItems = items.map((i) => i.toLowerCase());
  return patterns.some((p) => lowerItems.includes(p.toLowerCase()) || lowerItems.some((i) => i.includes(p.toLowerCase())));
}

/**
 * Infer interactive intent from AST.
 */
function detectInteractive(attributes: string[], identifiers: string[]): boolean {
  const all = [...attributes, ...identifiers];
  return matchesAny(all, DETECTION_PATTERNS.interactiveProps);
}

/**
 * Infer navigation intent from AST.
 */
function detectNavigation(identifiers: string[], imports: { source: string; names: string[] }[]): boolean {
  // Check identifiers
  if (matchesAny(identifiers, DETECTION_PATTERNS.navigationProps)) {
    return true;
  }

  // Check imports from navigation libraries
  const navLibraries = ['react-router', 'next/link', 'next/navigation', '@tanstack/react-router', 'wouter'];
  return imports.some((imp) => navLibraries.some((lib) => imp.source.includes(lib)));
}

/**
 * Infer mutation intent from AST.
 */
function detectMutation(identifiers: string[], literals: string[]): boolean {
  const all = [...identifiers, ...literals];
  return matchesAny(all, DETECTION_PATTERNS.mutationPatterns);
}

/**
 * Infer financial intent from AST.
 */
function detectFinancial(identifiers: string[]): boolean {
  return matchesAny(identifiers, DETECTION_PATTERNS.financialTypes);
}

/**
 * Infer sensitive intent from AST.
 */
function detectSensitive(identifiers: string[], literals: string[]): boolean {
  const all = [...identifiers, ...literals];
  return matchesAny(all, DETECTION_PATTERNS.sensitivePatterns);
}

/**
 * Infer form intent from AST.
 */
function detectForm(identifiers: string[], attributes: string[]): boolean {
  const all = [...identifiers, ...attributes];
  return matchesAny(all, DETECTION_PATTERNS.formPatterns);
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Infer intent from a TypeScript/TSX file.
 *
 * @param filePath - Path to the file
 * @returns Inferred intent
 *
 * @example
 * ```typescript
 * const intent = await inferIntent('src/components/ClaimButton.tsx');
 * // {
 * //   interactive: true,
 * //   navigation: false,
 * //   async: true,
 * //   mutation: true,
 * //   financial: true,
 * //   form: false,
 * //   sensitive: true,
 * // }
 * ```
 */
export async function inferIntent(filePath: string): Promise<InferredIntent> {
  const sourceFile = parseFile(filePath);

  if (!sourceFile) {
    // Return empty intent for missing/invalid files
    return {
      interactive: false,
      navigation: false,
      async: false,
      mutation: false,
      financial: false,
      form: false,
      sensitive: false,
    };
  }

  const identifiers = collectIdentifiers(sourceFile);
  const literals = collectStringLiterals(sourceFile);
  const attributes = collectJSXAttributes(sourceFile);
  const imports = collectImports(sourceFile);

  return {
    interactive: detectInteractive(attributes, identifiers),
    navigation: detectNavigation(identifiers, imports),
    async: hasAsyncPatterns(sourceFile),
    mutation: detectMutation(identifiers, literals),
    financial: detectFinancial(identifiers),
    form: detectForm(identifiers, attributes),
    sensitive: detectSensitive(identifiers, literals),
  };
}

/**
 * Perform full AST analysis on a file.
 *
 * @param filePath - Path to the file
 * @returns Complete AST analysis
 *
 * @example
 * ```typescript
 * const analysis = await analyzeAST('src/components/ClaimButton.tsx');
 * console.log(analysis.hooks);  // ['useState', 'useMutation']
 * console.log(analysis.intent.mutation);  // true
 * ```
 */
export async function analyzeAST(filePath: string): Promise<ASTAnalysis> {
  const sourceFile = parseFile(filePath);
  const analyzedAt = new Date();

  if (!sourceFile) {
    return {
      filePath,
      intent: {
        interactive: false,
        navigation: false,
        async: false,
        mutation: false,
        financial: false,
        form: false,
        sensitive: false,
      },
      hooks: [],
      components: [],
      types: [],
      exports: [],
      dependencies: [],
      analyzedAt,
      confidence: 0,
    };
  }

  const identifiers = collectIdentifiers(sourceFile);
  const literals = collectStringLiterals(sourceFile);
  const attributes = collectJSXAttributes(sourceFile);
  const imports = collectImports(sourceFile);
  const exports = collectExports(sourceFile);

  // Detect hooks
  const hooks = Array.from(new Set(detectHooks(identifiers)));

  // Extract component names (PascalCase identifiers from imports)
  const components = Array.from(
    new Set(
      imports
        .flatMap((i) => i.names)
        .filter((n) => /^[A-Z]/.test(n) && !DETECTION_PATTERNS.financialTypes.includes(n))
    )
  );

  // Extract type names
  const types = Array.from(
    new Set(identifiers.filter((id) => DETECTION_PATTERNS.financialTypes.includes(id) || id.endsWith('Type') || id.endsWith('Props')))
  );

  // Extract dependencies
  const dependencies = Array.from(new Set(imports.map((i) => i.source)));

  // Infer intent
  const intent: InferredIntent = {
    interactive: detectInteractive(attributes, identifiers),
    navigation: detectNavigation(identifiers, imports),
    async: hasAsyncPatterns(sourceFile),
    mutation: detectMutation(identifiers, literals),
    financial: detectFinancial(identifiers),
    form: detectForm(identifiers, attributes),
    sensitive: detectSensitive(identifiers, literals),
  };

  // Calculate confidence based on how much data we found
  const dataPoints = [
    hooks.length > 0,
    components.length > 0,
    exports.length > 0,
    dependencies.length > 0,
    Object.values(intent).some(Boolean),
  ];
  const confidence = dataPoints.filter(Boolean).length / dataPoints.length;

  return {
    filePath,
    intent,
    hooks,
    components,
    types,
    exports,
    dependencies,
    analyzedAt,
    confidence,
  };
}

/**
 * Parse AST from file (low-level function).
 *
 * @param filePath - Path to the file
 * @returns TypeScript source file or null
 */
export function parseAST(filePath: string): ts.SourceFile | null {
  return parseFile(filePath);
}

/**
 * Check if AST has specific props.
 *
 * @param sourceFile - Parsed source file
 * @param props - Props to check for
 */
export function hasProps(sourceFile: ts.SourceFile, props: string[]): boolean {
  const attributes = collectJSXAttributes(sourceFile);
  return props.some((p) => attributes.includes(p));
}

/**
 * Check if AST returns Promise type.
 *
 * @param sourceFile - Parsed source file
 */
export function returnsPromise(sourceFile: ts.SourceFile): boolean {
  return hasAsyncPatterns(sourceFile);
}

/**
 * Check if AST uses mutation patterns.
 *
 * @param sourceFile - Parsed source file
 */
export function usesMutation(sourceFile: ts.SourceFile): boolean {
  const identifiers = collectIdentifiers(sourceFile);
  return identifiers.includes('useMutation');
}

/**
 * Check if AST has fetch with POST.
 *
 * @param sourceFile - Parsed source file
 */
export function hasFetchPost(sourceFile: ts.SourceFile): boolean {
  const literals = collectStringLiterals(sourceFile);
  return literals.some((l) => ['POST', 'PUT', 'PATCH', 'DELETE'].includes(l));
}

/**
 * Check if AST uses specific types.
 *
 * @param sourceFile - Parsed source file
 * @param types - Types to check for
 */
export function usesTypes(sourceFile: ts.SourceFile, types: string[]): boolean {
  const identifiers = collectIdentifiers(sourceFile);
  return types.some((t) => identifiers.includes(t));
}

/**
 * Get detection patterns for external use.
 */
export function getDetectionPatterns(): DetectionPatterns {
  return { ...DETECTION_PATTERNS };
}

/**
 * Batch analyze multiple files.
 *
 * @param filePaths - Array of file paths
 * @returns Array of analysis results
 */
export async function batchAnalyze(filePaths: string[]): Promise<ASTAnalysis[]> {
  const results: ASTAnalysis[] = [];

  for (const filePath of filePaths) {
    const analysis = await analyzeAST(filePath);
    results.push(analysis);
  }

  return results;
}
