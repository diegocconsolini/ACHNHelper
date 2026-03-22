---
paths: app/api/**/*.js
---

# API Route Rules

## Authentication
All API routes (except public browse) must check auth:
```js
import { auth } from '@/auth';
const session = await auth();
if (!session?.user?.id) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## Admin Routes
Admin routes must use `requireAdmin()` from `lib/adminAuth.js`:
```js
import { requireAdmin, logAdminAction } from '@/lib/adminAuth';
const { session, error, status } = await requireAdmin();
if (error) return Response.json({ error }, { status });
```

## Database
- Use `createServerClient()` from `@/lib/supabase` (service role key)
- NEVER expose `SUPABASE_SERVICE_ROLE_KEY` to client components
- NEVER use the `pg` library directly (SSL certificate issues)
- Use Supabase CLI for migrations: `supabase db push --db-url "$POSTGRES_URL_NON_POOLING"`

## Path Aliases
- `@/auth` → project root `auth.ts`
- `@/lib/supabase` → `lib/supabase.js`
- `@/lib/adminAuth` → `lib/adminAuth.js`
