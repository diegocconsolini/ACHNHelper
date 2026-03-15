-- ACNH Portal Database Schema
-- Run via: supabase db execute --project-ref cyxxfikvyawetabqmiot -f scripts/setup-database.sql

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
