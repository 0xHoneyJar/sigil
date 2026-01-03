/**
 * Sync Declarations Persistence Layer
 *
 * SQLite persistence for sync strategy declarations.
 * Uses the existing db.ts infrastructure from Sprint 8.
 */

import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import type { DeclarationRecord, SyncStrategy } from './types.js';

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
 * Load all sync declarations from database
 */
export async function loadDeclarations(
  dbPath: string
): Promise<DeclarationRecord[]> {
  const declarations: DeclarationRecord[] = [];

  if (!existsSync(dbPath)) {
    return declarations;
  }

  const sql = await getSql();
  const buffer = readFileSync(dbPath);
  const db = new sql.Database(buffer);

  try {
    const result = db.exec(`
      SELECT data_path, strategy, declared_by, declared_at, rationale
      FROM sync_declarations
      ORDER BY declared_at DESC
    `);

    if (result.length > 0) {
      for (const row of result[0].values) {
        const [dataPath, strategy, declaredBy, declaredAt, rationale] = row as string[];
        declarations.push({
          dataPath,
          strategy: strategy as SyncStrategy,
          declaredBy,
          declaredAt,
          rationale: rationale || '',
        });
      }
    }
  } finally {
    db.close();
  }

  return declarations;
}

/**
 * Save a sync declaration to database
 */
export async function saveDeclaration(
  dbPath: string,
  declaration: DeclarationRecord
): Promise<void> {
  if (!existsSync(dbPath)) {
    throw new Error(`Database not found at ${dbPath}. Run 'sigil init' first.`);
  }

  const sql = await getSql();
  const buffer = readFileSync(dbPath);
  const db = new sql.Database(buffer);

  try {
    db.run(
      `INSERT OR REPLACE INTO sync_declarations
        (data_path, strategy, declared_by, declared_at, rationale)
      VALUES (?, ?, ?, ?, ?)`,
      [
        declaration.dataPath,
        declaration.strategy,
        declaration.declaredBy,
        declaration.declaredAt,
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
 * Delete a sync declaration from database
 */
export async function deleteDeclaration(
  dbPath: string,
  dataPath: string
): Promise<boolean> {
  if (!existsSync(dbPath)) {
    return false;
  }

  const sql = await getSql();
  const buffer = readFileSync(dbPath);
  const db = new sql.Database(buffer);

  try {
    const result = db.exec(
      `SELECT COUNT(*) FROM sync_declarations WHERE data_path = ?`,
      [dataPath]
    );

    const count = result.length > 0 ? (result[0].values[0][0] as number) : 0;
    if (count === 0) {
      return false;
    }

    db.run(`DELETE FROM sync_declarations WHERE data_path = ?`, [dataPath]);

    const data = db.export();
    writeFileSync(dbPath, Buffer.from(data));

    return true;
  } finally {
    db.close();
  }
}

/**
 * Get a specific declaration by data path
 */
export async function getDeclaration(
  dbPath: string,
  dataPath: string
): Promise<DeclarationRecord | null> {
  if (!existsSync(dbPath)) {
    return null;
  }

  const sql = await getSql();
  const buffer = readFileSync(dbPath);
  const db = new sql.Database(buffer);

  try {
    const result = db.exec(
      `SELECT data_path, strategy, declared_by, declared_at, rationale
       FROM sync_declarations
       WHERE data_path = ?`,
      [dataPath]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    const [data_path, strategy, declared_by, declared_at, rationale] =
      result[0].values[0] as string[];

    return {
      dataPath: data_path,
      strategy: strategy as SyncStrategy,
      declaredBy: declared_by,
      declaredAt: declared_at,
      rationale: rationale || '',
    };
  } finally {
    db.close();
  }
}

/**
 * Get declarations by strategy type
 */
export async function getDeclarationsByStrategy(
  dbPath: string,
  strategy: SyncStrategy
): Promise<DeclarationRecord[]> {
  const declarations: DeclarationRecord[] = [];

  if (!existsSync(dbPath)) {
    return declarations;
  }

  const sql = await getSql();
  const buffer = readFileSync(dbPath);
  const db = new sql.Database(buffer);

  try {
    const result = db.exec(
      `SELECT data_path, strategy, declared_by, declared_at, rationale
       FROM sync_declarations
       WHERE strategy = ?
       ORDER BY declared_at DESC`,
      [strategy]
    );

    if (result.length > 0) {
      for (const row of result[0].values) {
        const [dataPath, strat, declaredBy, declaredAt, rationale] = row as string[];
        declarations.push({
          dataPath,
          strategy: strat as SyncStrategy,
          declaredBy,
          declaredAt,
          rationale: rationale || '',
        });
      }
    }
  } finally {
    db.close();
  }

  return declarations;
}

/**
 * Count declarations by strategy
 */
export async function countDeclarationsByStrategy(
  dbPath: string
): Promise<Record<SyncStrategy, number>> {
  const counts: Record<SyncStrategy, number> = {
    server_tick: 0,
    crdt: 0,
    lww: 0,
    none: 0,
  };

  if (!existsSync(dbPath)) {
    return counts;
  }

  const sql = await getSql();
  const buffer = readFileSync(dbPath);
  const db = new sql.Database(buffer);

  try {
    const result = db.exec(`
      SELECT strategy, COUNT(*) as count
      FROM sync_declarations
      GROUP BY strategy
    `);

    if (result.length > 0) {
      for (const row of result[0].values) {
        const [strategy, count] = row as [string, number];
        if (strategy in counts) {
          counts[strategy as SyncStrategy] = count;
        }
      }
    }
  } finally {
    db.close();
  }

  return counts;
}

/**
 * Create an InteractionRouter that persists to SQLite
 */
export async function createPersistedRouter(
  dbPath: string
): Promise<{
  router: import('./InteractionRouter.js').InteractionRouter;
  declarations: DeclarationRecord[];
}> {
  const { InteractionRouter } = await import('./InteractionRouter.js');

  // Load existing declarations
  const declarations = await loadDeclarations(dbPath);

  // Create router with persistence callback
  const router = new InteractionRouter({
    initialDeclarations: declarations,
    onDeclarationSave: async (record) => {
      await saveDeclaration(dbPath, record);
    },
  });

  return { router, declarations };
}

/**
 * Validate all declarations in database
 * Returns any declarations with invalid strategies
 */
export async function validateDeclarations(
  dbPath: string
): Promise<{ valid: DeclarationRecord[]; invalid: string[] }> {
  const valid: DeclarationRecord[] = [];
  const invalid: string[] = [];

  if (!existsSync(dbPath)) {
    return { valid, invalid };
  }

  const sql = await getSql();
  const buffer = readFileSync(dbPath);
  const db = new sql.Database(buffer);

  try {
    const result = db.exec(`
      SELECT data_path, strategy, declared_by, declared_at, rationale
      FROM sync_declarations
    `);

    const validStrategies = new Set(['server_tick', 'crdt', 'lww', 'none']);

    if (result.length > 0) {
      for (const row of result[0].values) {
        const [dataPath, strategy, declaredBy, declaredAt, rationale] = row as string[];

        if (validStrategies.has(strategy)) {
          valid.push({
            dataPath,
            strategy: strategy as SyncStrategy,
            declaredBy,
            declaredAt,
            rationale: rationale || '',
          });
        } else {
          invalid.push(
            `Invalid strategy "${strategy}" for path "${dataPath}"`
          );
        }
      }
    }
  } finally {
    db.close();
  }

  return { valid, invalid };
}
