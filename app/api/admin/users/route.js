import { requireAdmin } from '@/lib/adminAuth';
import { createServerClient } from '@/lib/supabase';

export async function GET(req) {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return Response.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const filter = searchParams.get('filter') || 'all';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

  const supabase = createServerClient();

  let query = supabase
    .from('profiles')
    .select('user_id, island_name, hemisphere, native_fruit, native_flower, island_rating, friend_code, dream_address, is_banned, ban_reason, banned_at, banned_by, created_at, updated_at', { count: 'exact' });

  // Apply filter
  if (filter === 'banned') {
    query = query.eq('is_banned', true);
  } else if (filter === 'active') {
    query = query.or('is_banned.is.null,is_banned.eq.false');
  }

  // Apply search (island_name only — email/name not stored in profiles)
  if (search) {
    query = query.ilike('island_name', `%${search}%`);
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

  return Response.json({ users: data || [], total, page, totalPages });
}
