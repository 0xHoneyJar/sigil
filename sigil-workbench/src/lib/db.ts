/**
 * SQLite Database Layer (Browser)
 *
 * Uses sql.js for in-browser SQLite access.
 * Note: In the workbench, we read from the database created by the CLI.
 */

import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import type { TensionState, Correction, PaperCut } from './types';

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

/**
 * Initialize sql.js with WASM
 */
async function getSql(): Promise<SqlJsStatic> {
  if (!SQL) {
    SQL = await initSqlJs({
      // Use CDN for WASM file
      locateFile: (file) =>
        `https://sql.js.org/dist/${file}`,
    });
  }
  return SQL;
}

/**
 * Load database from array buffer
 */
export async function loadDatabase(buffer: ArrayBuffer): Promise<void> {
  const sql = await getSql();
  db = new sql.Database(new Uint8Array(buffer));
}

/**
 * Load database from file
 */
export async function loadDatabaseFromFile(file: File): Promise<void> {
  const buffer = await file.arrayBuffer();
  await loadDatabase(buffer);
}

/**
 * Export database as Uint8Array
 */
export function exportDatabase(): Uint8Array | null {
  if (!db) return null;
  return db.export();
}

/**
 * Check if database is loaded
 */
export function isDatabaseLoaded(): boolean {
  return db !== null;
}

/**
 * Load tensions from database
 */
export function loadTensions(): TensionState | null {
  if (!db) return null;

  try {
    const result = db.exec(
      'SELECT playfulness, weight, density, speed FROM tensions WHERE id = 1'
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    const [playfulness, weight, density, speed] = result[0].values[0] as number[];
    return { playfulness, weight, density, speed };
  } catch {
    return null;
  }
}

/**
 * Save tensions to database
 */
export function saveTensions(tensions: TensionState): boolean {
  if (!db) return false;

  try {
    db.run(
      `UPDATE tensions SET
        playfulness = ?,
        weight = ?,
        density = ?,
        speed = ?,
        updated_at = datetime('now')
      WHERE id = 1`,
      [tensions.playfulness, tensions.weight, tensions.density, tensions.speed]
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Load corrections from database
 */
export function loadCorrections(): Correction[] {
  if (!db) return [];

  try {
    const result = db.exec(
      'SELECT id, issue, correction, applies_to, flagged_at, applied_count FROM corrections'
    );

    if (result.length === 0) return [];

    return result[0].values.map((row) => ({
      id: row[0] as string,
      issue: row[1] as string,
      correction: row[2] as string,
      applies_to: row[3] as string | undefined,
      flagged_at: row[4] as string,
      applied_count: row[5] as number | undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * Save correction to database
 */
export function saveCorrection(correction: Correction): boolean {
  if (!db) return false;

  try {
    db.run(
      `INSERT OR REPLACE INTO corrections
        (id, issue, correction, applies_to, flagged_at, applied_count)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        correction.id,
        correction.issue,
        correction.correction,
        correction.applies_to || null,
        correction.flagged_at,
        correction.applied_count || 0,
      ]
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Load paper cuts from database
 */
export function loadPaperCuts(): PaperCut[] {
  if (!db) return [];

  try {
    const result = db.exec(
      `SELECT id, category, description, file_path, line_number,
              severity, status, created_at, fixed_at
       FROM paper_cuts`
    );

    if (result.length === 0) return [];

    return result[0].values.map((row) => ({
      id: row[0] as string,
      category: row[1] as string,
      description: row[2] as string,
      file_path: row[3] as string | undefined,
      line_number: row[4] as number | undefined,
      severity: row[5] as 'low' | 'medium' | 'high',
      status: row[6] as 'open' | 'fixed' | 'wontfix',
      created_at: row[7] as string,
      fixed_at: row[8] as string | undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * Save paper cut to database
 */
export function savePaperCut(paperCut: PaperCut): boolean {
  if (!db) return false;

  try {
    db.run(
      `INSERT OR REPLACE INTO paper_cuts
        (id, category, description, file_path, line_number,
         severity, status, created_at, fixed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        paperCut.id,
        paperCut.category,
        paperCut.description,
        paperCut.file_path || null,
        paperCut.line_number || null,
        paperCut.severity,
        paperCut.status,
        paperCut.created_at,
        paperCut.fixed_at || null,
      ]
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
