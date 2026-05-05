// RLS regression guard (#125 Phase 3).
//
// Asserts every CREATE TABLE in supabase/migrations/* is paired with a
// matching ALTER TABLE ... ENABLE ROW LEVEL SECURITY somewhere in the
// migrations directory. This catches future migrations that add a table
// but forget to enable RLS — anon-key would otherwise expose the new
// table.
//
// Why static-source rather than live DB: this runs in CI without
// credentials. The live state is checked separately via the Supabase
// advisory after each apply.

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'supabase/migrations');

function readAllMigrations() {
  const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
  return files.map(f => ({
    name: f,
    sql: fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8'),
  }));
}

// Match `CREATE TABLE [IF NOT EXISTS] [schema.]name (` ignoring case.
const CREATE_TABLE_RE = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-z_][a-z0-9_]*)\s*\(/gi;

// Match `ALTER TABLE [schema.]name ENABLE ROW LEVEL SECURITY` ignoring case.
const ENABLE_RLS_RE = /ALTER\s+TABLE\s+(?:public\.)?([a-z_][a-z0-9_]*)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/gi;

describe('RLS coverage', () => {
  const migrations = readAllMigrations();

  const createdTables = new Set();
  const rlsEnabledTables = new Set();

  for (const { sql } of migrations) {
    for (const m of sql.matchAll(CREATE_TABLE_RE)) createdTables.add(m[1]);
    for (const m of sql.matchAll(ENABLE_RLS_RE)) rlsEnabledTables.add(m[1]);
  }

  it('finds all CREATE TABLE statements', () => {
    expect(createdTables.size).toBeGreaterThan(0);
  });

  it('every public table created in migrations has RLS enabled somewhere', () => {
    const missing = [...createdTables].filter(t => !rlsEnabledTables.has(t));
    expect(missing, `Tables missing ENABLE ROW LEVEL SECURITY: ${missing.join(', ')}`).toEqual([]);
  });
});
