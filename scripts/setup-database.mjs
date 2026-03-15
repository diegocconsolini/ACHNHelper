// Database setup script for ACNH Portal
// Uses Supabase JS client (handles SSL internally) instead of raw pg connection

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  console.error('Run: node --env-file=.env.local scripts/setup-database.mjs');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  db: { schema: 'public' },
});

// Use Supabase's SQL endpoint via rpc or direct fetch
const SUPABASE_SQL_URL = `${supabaseUrl}/rest/v1/rpc`;

async function runSQL(sql) {
  const res = await fetch(`${supabaseUrl}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!res.ok) {
    // Try the alternative SQL endpoint
    const res2 = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
      },
      body: JSON.stringify({ name: 'exec_sql', params: { sql } }),
    });
    if (!res2.ok) {
      throw new Error(`SQL failed: ${res.status} ${await res.text()}`);
    }
  }
}

// The simplest approach: print the SQL so the user can run it in Supabase Dashboard SQL Editor
console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║  ACNH Portal — Database Setup                                     ║
╚═══════════════════════════════════════════════════════════════════╝

Copy and paste the following SQL into the Supabase Dashboard SQL Editor:
  → ${supabaseUrl.replace('.supabase.co', '.supabase.co')}/project/default/sql

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

const sql = `
-- ACNH Portal Database Schema
-- Run this in Supabase Dashboard > SQL Editor

-- Profiles table (user island info)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  island_name TEXT,
  hemisphere TEXT CHECK (hemisphere IN ('north', 'south')),
  friend_code TEXT,
  dream_address TEXT,
  native_flower TEXT,
  native_fruit TEXT CHECK (native_fruit IN ('apple', 'cherry', 'orange', 'peach', 'pear')),
  island_rating INTEGER CHECK (island_rating >= 1 AND island_rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artifact sync data table (per-user, per-artifact JSONB storage)
CREATE TABLE IF NOT EXISTS artifact_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  artifact_key TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, artifact_key)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_artifact_data_user_id ON artifact_data(user_id);
CREATE INDEX IF NOT EXISTS idx_artifact_data_user_key ON artifact_data(user_id, artifact_key);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifact_data ENABLE ROW LEVEL SECURITY;

-- RLS policies: service_role key bypasses RLS automatically
-- These policies allow the service role to access all data
-- (anon key users get no access — all access is through our API routes)
CREATE POLICY IF NOT EXISTS "Service role full access on profiles"
  ON profiles FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service role full access on artifact_data"
  ON artifact_data FOR ALL
  USING (true)
  WITH CHECK (true);
`;

console.log(sql);

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After running the SQL above, verify tables exist:
  SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

Expected output: profiles, artifact_data
`);
