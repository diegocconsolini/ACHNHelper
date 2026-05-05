-- Enable Row Level Security on all public tables (#125 Phase 1).
--
-- This app uses the Supabase service-role key exclusively (lib/supabase.js
-- exports only createServerClient() with SUPABASE_SERVICE_ROLE_KEY). The
-- service role bypasses RLS by design, so enabling RLS without policies
-- has zero effect on legitimate API-route traffic.
--
-- What it does change: anon-key access drops to zero rows, closing the
-- back door from the auto-provisioned anon key.

ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifact_data       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turnip_prices       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_listings      ENABLE ROW LEVEL SECURITY;
