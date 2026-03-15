import { createClient } from '@supabase/supabase-js';

// Server-side client with service role key (full access, for API routes only)
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
