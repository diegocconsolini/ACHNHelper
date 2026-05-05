import { auth } from '@/auth';
import { createServerClient } from '@/lib/supabase';

// Notifications are derived on read from existing tables — no new table needed.
//
// Sources:
// - friend_request_received: someone favorited me but I haven't favorited them
// - friend_added: a mutual favorite (we both favorited each other)
//
// Read state is tracked client-side via a "notifications-last-read" timestamp
// in localStorage, so the same surface works without an extra DB table.

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  const userId = session.user.id;

  // 1) People who favorited me
  const { data: incoming } = await supabase
    .from('favorites')
    .select('user_id, created_at')
    .eq('favorited_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  // 2) People I favorited
  const { data: myFavs } = await supabase
    .from('favorites')
    .select('favorited_user_id')
    .eq('user_id', userId);

  const myFavSet = new Set((myFavs || []).map(f => f.favorited_user_id));

  // Classify each incoming favorite
  const otherIds = [...new Set((incoming || []).map(r => r.user_id))];
  let profileMap = new Map();
  if (otherIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, island_name, hemisphere')
      .in('user_id', otherIds);
    for (const p of profiles || []) profileMap.set(p.user_id, p);
  }

  const notifications = (incoming || []).map(r => {
    const isMutual = myFavSet.has(r.user_id);
    const profile = profileMap.get(r.user_id);
    return {
      id: `${isMutual ? 'mutual' : 'incoming'}-${r.user_id}`,
      kind: isMutual ? 'friend_added' : 'friend_request_received',
      from_user_id: r.user_id,
      from_island_name: profile?.island_name || 'Someone',
      from_hemisphere: profile?.hemisphere || null,
      created_at: r.created_at,
    };
  });

  return Response.json({ notifications });
}
