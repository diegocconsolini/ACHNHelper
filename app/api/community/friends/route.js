import { auth } from '@/auth';
import { createServerClient } from '@/lib/supabase';

export async function GET(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  const userId = session.user.id;

  // Get users I've favorited
  const { data: myFavs } = await supabase
    .from('favorites')
    .select('favorited_user_id')
    .eq('user_id', userId);

  const myFavIds = (myFavs || []).map(f => f.favorited_user_id);

  if (myFavIds.length === 0) return Response.json([]);

  // Check which of those have also favorited me
  const { data: mutuals } = await supabase
    .from('favorites')
    .select('user_id')
    .eq('favorited_user_id', userId)
    .in('user_id', myFavIds);

  const mutualIds = (mutuals || []).map(m => m.user_id);

  if (mutualIds.length === 0) return Response.json([]);

  // Get their profile info
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, island_name, hemisphere, friend_code, dream_address, native_flower, native_fruit, island_rating')
    .in('user_id', mutualIds);

  return Response.json(profiles || []);
}
