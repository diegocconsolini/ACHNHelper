import pg from 'pg';
const { Client } = pg;

const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('Error: POSTGRES_URL_NON_POOLING or POSTGRES_URL must be set');
  process.exit(1);
}

const client = new Client({ connectionString });
await client.connect();

console.log('Connected to database. Creating tables...');

// Create profiles table
await client.query(`
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
`);
console.log('  - profiles table created');

// Create artifact_data table (for Phase 4 sync)
await client.query(`
  CREATE TABLE IF NOT EXISTS artifact_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    artifact_key TEXT NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, artifact_key)
  );
`);
console.log('  - artifact_data table created');

console.log('Tables created successfully');
await client.end();
