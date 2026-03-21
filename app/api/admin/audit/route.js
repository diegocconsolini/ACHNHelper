import { requireAdmin } from '@/lib/adminAuth';
import { createServerClient } from '@/lib/supabase';

export async function GET(req) {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return Response.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

  const supabase = createServerClient();

  let query = supabase
    .from('admin_audit_log')
    .select('*', { count: 'exact' });

  if (action) {
    query = query.eq('action', action);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return Response.json({ entries: data || [], total, page, totalPages });
}
