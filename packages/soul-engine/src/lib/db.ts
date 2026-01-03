/**
 * SQLite Database Layer
 *
 * Uses sql.js for in-browser SQLite that can be committed to Git.
 */

import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import type { TensionState } from '../hooks/index.js';

let SQL: SqlJsStatic | null = null;

/**
 * Initialize sql.js (lazy loaded)
 */
async function getSql(): Promise<SqlJsStatic> {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
}

/**
 * Database schema
 */
const SCHEMA = `
-- Tension state
CREATE TABLE IF NOT EXISTS tensions (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  playfulness INTEGER NOT NULL DEFAULT 50,
  weight INTEGER NOT NULL DEFAULT 50,
  density INTEGER NOT NULL DEFAULT 50,
  speed INTEGER NOT NULL DEFAULT 50,
  updated_at TEXT NOT NULL
);

-- Sync declarations
CREATE TABLE IF NOT EXISTS sync_declarations (
  data_path TEXT PRIMARY KEY,
  strategy TEXT NOT NULL CHECK (strategy IN ('crdt', 'lww', 'server_tick', 'none')),
  declared_by TEXT NOT NULL,
  declared_at TEXT NOT NULL,
  rationale TEXT
);

-- Paper cuts
CREATE TABLE IF NOT EXISTS paper_cuts (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  file_path TEXT,
  line_number INTEGER,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  status TEXT CHECK (status IN ('open', 'fixed', 'wontfix')),
  created_at TEXT NOT NULL,
  fixed_at TEXT
);

-- Corrections (local learning)
CREATE TABLE IF NOT EXISTS corrections (
  id TEXT PRIMARY KEY,
  issue TEXT NOT NULL,
  correction TEXT NOT NULL,
  applies_to TEXT,
  flagged_at TEXT NOT NULL,
  applied_count INTEGER DEFAULT 0
);

-- Founder mode audit log
CREATE TABLE IF NOT EXISTS founder_audit (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  second_taste_owner TEXT NOT NULL,
  rationale TEXT,
  timestamp TEXT NOT NULL
);

-- Schema version
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY
);

-- Insert default tensions if not exists
INSERT OR IGNORE INTO tensions (id, playfulness, weight, density, speed, updated_at)
VALUES (1, 50, 50, 50, 50, datetime('now'));

-- Insert schema version
INSERT OR IGNORE INTO schema_version (version) VALUES (1);
`;

/**
 * Initialize database with schema
 */
export async function initDatabase(dbPath: string): Promise<void> {
  const sql = await getSql();

  let db: Database;
  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath);
    db = new sql.Database(buffer);
  } else {
    db = new sql.Database();
  }

  // Run schema
  db.run(SCHEMA);

  // Save to file
  const data = db.export();
  writeFileSync(dbPath, Buffer.from(data));
  db.close();
}

/**
 * Load tensions from database
 */
export async function loadTensionsFromDB(
  dbPath: string
): Promise<TensionState | null> {
  if (!existsSync(dbPath)) return null;

  const sql = await getSql();
  const buffer = readFileSync(dbPath);
  const db = new sql.Database(buffer);

  try {
    const result = db.exec(
      'SELECT playfulness, weight, density, speed FROM tensions WHERE id = 1'
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    const [playfulness, weight, density, speed] = result[0].values[0] as number[];
    return { playfulness, weight, density, speed };
  } finally {
    db.close();
  }
}

/**
 * Save tensions to database
 */
export async function saveTensionsToDB(
  dbPath: string,
  tensions: TensionState
): Promise<void> {
  const sql = await getSql();
  const buffer = readFileSync(dbPath);
  const db = new sql.Database(buffer);

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

    const data = db.export();
    writeFileSync(dbPath, Buffer.from(data));
  } finally {
    db.close();
  }
}

/**
 * Load sync declarations from database
 */
export async function loadDeclarationsFromDB(
  dbPath: string
): Promise<Map<string, { strategy: string; declaredBy: string; rationale: string }>> {
  const declarations = new Map();

  if (!existsSync(dbPath)) return declarations;

  const sql = await getSql();
  const buffer = readFileSync(dbPath);
  const db = new sql.Database(buffer);

  try {
    const result = db.exec(
      'SELECT data_path, strategy, declared_by, rationale FROM sync_declarations'
    );

    if (result.length > 0) {
      for (const row of result[0].values) {
        const [dataPath, strategy, declaredBy, rationale] = row as string[];
        declarations.set(dataPath, { strategy, declaredBy, rationale });
      }
    }
  } finally {
    db.close();
  }

  return declarations;
}

/**
 * Save sync declaration to database
 */
export async function saveDeclarationToDB(
  dbPath: string,
  declaration: {
    dataPath: string;
    strategy: string;
    declaredBy: string;
    rationale: string;
  }
): Promise<void> {
  const sql = await getSql();
  const buffer = readFileSync(dbPath);
  const db = new sql.Database(buffer);

  try {
    db.run(
      `INSERT OR REPLACE INTO sync_declarations
        (data_path, strategy, declared_by, declared_at, rationale)
      VALUES (?, ?, ?, datetime('now'), ?)`,
      [
        declaration.dataPath,
        declaration.strategy,
        declaration.declaredBy,
        declaration.rationale,
      ]
    );

    const data = db.export();
    writeFileSync(dbPath, Buffer.from(data));
  } finally {
    db.close();
  }
}

/**
 * Load corrections from database
 */
export async function loadCorrectionsFromDB(
  dbPath: string
): Promise<Array<{ id: string; issue: string; correction: string; appliesTo: string }>> {
  const corrections: Array<{
    id: string;
    issue: string;
    correction: string;
    appliesTo: string;
  }> = [];

  if (!existsSync(dbPath)) return corrections;

  const sql = await getSql();
  const buffer = readFileSync(dbPath);
  const db = new sql.Database(buffer);

  try {
    const result = db.exec(
      'SELECT id, issue, correction, applies_to FROM corrections'
    );

    if (result.length > 0) {
      for (const row of result[0].values) {
        const [id, issue, correction, appliesTo] = row as string[];
        corrections.push({ id, issue, correction, appliesTo: appliesTo || '*' });
      }
    }
  } finally {
    db.close();
  }

  return corrections;
}

// Export types
export interface SigilDatabase {
  tensions: TensionState;
  declarations: Map<string, { strategy: string; declaredBy: string; rationale: string }>;
  corrections: Array<{ id: string; issue: string; correction: string; appliesTo: string }>;
}
