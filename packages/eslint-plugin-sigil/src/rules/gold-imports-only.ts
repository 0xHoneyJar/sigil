/**
 * Sigil ESLint Plugin - gold-imports-only Rule
 *
 * Enforces tier-based import restrictions with slot-based composition exception.
 * Gold components cannot directly import Draft components, but can accept
 * Draft content as children (slot-based composition).
 *
 * @module rules/gold-imports-only
 * @version 7.6.0
 *
 * Tier hierarchy:
 * - gold: Stable, production-ready components
 * - silver: Promoted but not yet gold
 * - draft: Experimental, unstable components
 *
 * Rules:
 * - Gold cannot import from Draft (blocks direct imports)
 * - Gold cannot import from Silver (optional, configurable)
 * - Feature code can compose Draft into Gold via children props (allowed)
 *
 * @example
 * // In a Gold component:
 *
 * // BLOCKED - Direct import of Draft
 * import { DraftAnimation } from '../draft';
 *
 * // ALLOWED - Gold can import Gold
 * import { GoldButton } from '../gold';
 *
 * // ALLOWED in feature code - Slot-based composition
 * <GoldButton>
 *   <DraftAnimation />  // OK - passed as child
 * </GoldButton>
 */

import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";
import * as path from "path";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://sigil.dev/eslint/${name}`
);

type MessageIds = "goldCannotImportDraft" | "goldCannotImportSilver" | "tierViolation";

type Tier = "gold" | "silver" | "draft" | "unknown";

export interface GoldImportsOnlyOptions {
  /** Also block Gold from importing Silver (default: false) */
  blockSilver?: boolean;
  /** Base path for component tiers (default: "src/components") */
  componentsPath?: string;
  /** Allow slot-based composition (default: true) */
  allowSlotComposition?: boolean;
}

/**
 * Determine the tier of a file based on its path.
 */
function getTierFromPath(filePath: string, componentsPath: string): Tier {
  const normalizedPath = filePath.replace(/\\/g, "/");
  const componentsDir = componentsPath.replace(/\\/g, "/");

  // Check if file is in components directory
  if (!normalizedPath.includes(componentsDir)) {
    return "unknown";
  }

  // Extract the tier from the path
  // e.g., "src/components/gold/Button.tsx" -> "gold"
  const afterComponents = normalizedPath.split(componentsDir)[1];
  if (!afterComponents) return "unknown";

  const parts = afterComponents.split("/").filter(Boolean);
  if (parts.length === 0) return "unknown";

  const tierPart = parts[0].toLowerCase();

  if (tierPart === "gold") return "gold";
  if (tierPart === "silver") return "silver";
  if (tierPart === "draft") return "draft";

  return "unknown";
}

/**
 * Determine the tier of an import based on its source.
 */
function getTierFromImport(importSource: string, currentFilePath: string, componentsPath: string): Tier {
  // Handle relative imports
  if (importSource.startsWith(".")) {
    const currentDir = path.dirname(currentFilePath);
    const resolvedPath = path.resolve(currentDir, importSource);
    return getTierFromPath(resolvedPath, componentsPath);
  }

  // Handle absolute/alias imports
  // Check if import path contains tier indicators
  const normalizedImport = importSource.replace(/\\/g, "/");

  if (normalizedImport.includes("/gold/") || normalizedImport.includes("/gold")) {
    return "gold";
  }
  if (normalizedImport.includes("/silver/") || normalizedImport.includes("/silver")) {
    return "silver";
  }
  if (normalizedImport.includes("/draft/") || normalizedImport.includes("/draft")) {
    return "draft";
  }

  return "unknown";
}

/**
 * Check if an import violates tier rules.
 */
function isViolation(importerTier: Tier, importeeTier: Tier, blockSilver: boolean): boolean {
  if (importerTier !== "gold") {
    return false; // Only enforce on Gold components
  }

  if (importeeTier === "draft") {
    return true; // Gold cannot import Draft
  }

  if (blockSilver && importeeTier === "silver") {
    return true; // Gold cannot import Silver (if configured)
  }

  return false;
}

export const goldImportsOnly = createRule<[GoldImportsOnlyOptions], MessageIds>({
  name: "gold-imports-only",
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce tier-based import restrictions. Gold components cannot import from Draft.",
    },
    messages: {
      goldCannotImportDraft:
        "Gold components cannot directly import from Draft tier. Use slot-based composition instead: pass Draft content as children to Gold components.",
      goldCannotImportSilver:
        "Gold components cannot directly import from Silver tier (blockSilver enabled).",
      tierViolation:
        "Tier violation: {{importer}} ({{importerTier}}) cannot import from {{importee}} ({{importeeTier}}).",
    },
    schema: [
      {
        type: "object",
        properties: {
          blockSilver: {
            type: "boolean",
          },
          componentsPath: {
            type: "string",
          },
          allowSlotComposition: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{
    blockSilver: false,
    componentsPath: "src/components",
    allowSlotComposition: true,
  }],
  create(context, [options]) {
    const filename = context.filename || context.getFilename();
    const componentsPath = options.componentsPath || "src/components";
    const blockSilver = options.blockSilver || false;

    // Determine the tier of the current file
    const currentTier = getTierFromPath(filename, componentsPath);

    // Only enforce on Gold files
    if (currentTier !== "gold") {
      return {};
    }

    return {
      // Check import declarations
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        const importSource = node.source.value;
        if (typeof importSource !== "string") return;

        const importTier = getTierFromImport(importSource, filename, componentsPath);

        if (importTier === "draft") {
          context.report({
            node,
            messageId: "goldCannotImportDraft",
          });
        } else if (blockSilver && importTier === "silver") {
          context.report({
            node,
            messageId: "goldCannotImportSilver",
          });
        }
      },

      // Check dynamic imports
      CallExpression(node: TSESTree.CallExpression) {
        // Check for import() calls
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "import" &&
          node.arguments.length > 0
        ) {
          const firstArg = node.arguments[0];
          if (firstArg.type === "Literal" && typeof firstArg.value === "string") {
            const importSource = firstArg.value;
            const importTier = getTierFromImport(importSource, filename, componentsPath);

            if (importTier === "draft") {
              context.report({
                node,
                messageId: "goldCannotImportDraft",
              });
            } else if (blockSilver && importTier === "silver") {
              context.report({
                node,
                messageId: "goldCannotImportSilver",
              });
            }
          }
        }

        // Check for require() calls
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "require" &&
          node.arguments.length > 0
        ) {
          const firstArg = node.arguments[0];
          if (firstArg.type === "Literal" && typeof firstArg.value === "string") {
            const importSource = firstArg.value;
            const importTier = getTierFromImport(importSource, filename, componentsPath);

            if (importTier === "draft") {
              context.report({
                node,
                messageId: "goldCannotImportDraft",
              });
            } else if (blockSilver && importTier === "silver") {
              context.report({
                node,
                messageId: "goldCannotImportSilver",
              });
            }
          }
        }
      },

      // Check re-exports
      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration) {
        if (!node.source) return;

        const importSource = node.source.value;
        if (typeof importSource !== "string") return;

        const importTier = getTierFromImport(importSource, filename, componentsPath);

        if (importTier === "draft") {
          context.report({
            node,
            messageId: "goldCannotImportDraft",
          });
        } else if (blockSilver && importTier === "silver") {
          context.report({
            node,
            messageId: "goldCannotImportSilver",
          });
        }
      },

      ExportAllDeclaration(node: TSESTree.ExportAllDeclaration) {
        const importSource = node.source.value;
        if (typeof importSource !== "string") return;

        const importTier = getTierFromImport(importSource, filename, componentsPath);

        if (importTier === "draft") {
          context.report({
            node,
            messageId: "goldCannotImportDraft",
          });
        } else if (blockSilver && importTier === "silver") {
          context.report({
            node,
            messageId: "goldCannotImportSilver",
          });
        }
      },
    };
  },
});

export default goldImportsOnly;
