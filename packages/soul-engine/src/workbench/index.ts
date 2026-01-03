/**
 * Workbench Components
 *
 * Components for the Sigil Workbench Vite SPA.
 * Full implementation in Sprint 12.
 */

// Placeholder exports - full implementation in Sprint 12
export const WORKBENCH_VERSION = '0.4.0';

export interface WorkbenchConfig {
  port: number;
  previewComponent?: string;
  enableSandbox: boolean;
}

export const DEFAULT_WORKBENCH_CONFIG: WorkbenchConfig = {
  port: 3333,
  enableSandbox: false,
};
