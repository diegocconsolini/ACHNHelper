-- Add modal_theme column to profiles table (per-user theme setting)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS modal_theme TEXT DEFAULT 'hybrid';
