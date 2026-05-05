-- Pre-existing schema bug (#125 follow-up): shared_profiles.user_id had no
-- FK to profiles, which made PostgREST's `shared_profiles!inner ( profiles )`
-- join fail with 500 "Could not find a relationship". Surfaced when smoke-
-- testing /api/community after enabling RLS — the failure was unrelated to
-- RLS but had been hidden by the empty community table.
--
-- Already applied to prod via Supabase MCP; this commit syncs the local
-- migration files so a fresh `supabase db push` reproduces prod.

ALTER TABLE shared_profiles
  ADD CONSTRAINT shared_profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
