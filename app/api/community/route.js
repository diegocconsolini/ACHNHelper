import { auth } from '@/auth';
import { createServerClient } from '@/lib/supabase';

export async function GET(req) {
  const session = await auth();
  const userId = session?.user?.id || null;

  const { searchParams } = new URL(req.url);
  const hemisphere = searchParams.get('hemisphere');
  const fruit = searchParams.get('fruit');
  const flower = searchParams.get('flower');
  const rating = searchParams.get('rating');
  const tag = searchParams.get('tag');
  const lookingFor = searchParams.get('lookingFor');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

  const supabase = createServerClient();

  // Build query joining shared_profiles with profiles
  let query = supabase
    .from('shared_profiles')
    .select(`
      user_id,
      bio,
      theme_tags,
      looking_for,
      screenshots,
      show_friend_code,
      last_active,
      profiles!inner (
        island_name,
        hemisphere,
        native_fruit,
        native_flower,
        island_rating,
        dream_address,
        friend_code,
        is_banned
      )
    `, { count: 'exact' })
    .eq('is_published', true)
    .or('is_banned.is.null,is_banned.eq.false', { referencedTable: 'profiles' });

  // Apply filters on the joined profiles fields
  if (hemisphere) {
    query = query.eq('profiles.hemisphere', hemisphere);
  }
  if (fruit) {
    query = query.eq('profiles.native_fruit', fruit);
  }
  if (flower) {
    query = query.eq('profiles.native_flower', flower);
  }
  if (rating) {
    query = query.eq('profiles.island_rating', parseInt(rating, 10));
  }
  if (tag) {
    query = query.contains('theme_tags', [tag]);
  }
  if (lookingFor) {
    query = query.contains('looking_for', [lookingFor]);
  }

  // If authenticated, exclude blocked users (both directions)
  let blockedUserIds = [];
  if (userId) {
    const { data: blockedByMe } = await supabase
      .from('blocked_users')
      .select('blocked_user_id')
      .eq('user_id', userId);

    const { data: blockedMe } = await supabase
      .from('blocked_users')
      .select('user_id')
      .eq('blocked_user_id', userId);

    blockedUserIds = [
      ...(blockedByMe || []).map(b => b.blocked_user_id),
      ...(blockedMe || []).map(b => b.user_id),
    ];

    if (blockedUserIds.length > 0) {
      query = query.not('user_id', 'in', `(${blockedUserIds.join(',')})`);
    }
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query
    .order('last_active', { ascending: false })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // If authenticated, get user's favorites for is_favorited flag
  let favoritedIds = new Set();
  if (userId) {
    const { data: favs } = await supabase
      .from('favorites')
      .select('favorited_user_id')
      .eq('user_id', userId);

    if (favs) {
      favoritedIds = new Set(favs.map(f => f.favorited_user_id));
    }
  }

  // Shape response
  const profiles = (data || []).map(row => {
    const profile = row.profiles;
    const showFriendCode = userId && row.show_friend_code;

    return {
      user_id: row.user_id,
      island_name: profile.island_name,
      hemisphere: profile.hemisphere,
      native_fruit: profile.native_fruit,
      native_flower: profile.native_flower,
      island_rating: profile.island_rating,
      dream_address: profile.dream_address,
      friend_code: showFriendCode ? profile.friend_code : null,
      bio: row.bio,
      theme_tags: row.theme_tags || [],
      looking_for: row.looking_for || [],
      screenshots: row.screenshots || [],
      last_active: row.last_active,
      is_favorited: userId ? favoritedIds.has(row.user_id) : false,
    };
  });

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return Response.json({ profiles, total, page, totalPages });
}
