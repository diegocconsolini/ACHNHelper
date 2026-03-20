import { auth } from '@/auth';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('blocked_users')
    .select(`
      blocked_user_id,
      created_at
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // For each blocked user, try to get their island name from profiles
  const blockedIds = (data || []).map(b => b.blocked_user_id);

  if (blockedIds.length === 0) {
    return Response.json({ blocked: [] });
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, island_name')
    .in('user_id', blockedIds);

  const profileMap = {};
  (profiles || []).forEach(p => {
    profileMap[p.user_id] = p;
  });

  const blocked = (data || []).map(b => ({
    user_id: b.blocked_user_id,
    island_name: profileMap[b.blocked_user_id]?.island_name || null,
    blocked_at: b.created_at,
  }));

  return Response.json({ blocked });
}
