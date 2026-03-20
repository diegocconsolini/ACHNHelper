import { auth } from '@/auth';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      favorited_user_id,
      created_at,
      shared_profiles!favorites_favorited_user_id_fkey (
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
          friend_code
        )
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Shape response — only include published profiles
  const profiles = (data || [])
    .filter(row => row.shared_profiles?.user_id)
    .map(row => {
      const sp = row.shared_profiles;
      const profile = sp.profiles;
      const showFriendCode = sp.show_friend_code;

      return {
        user_id: sp.user_id,
        island_name: profile.island_name,
        hemisphere: profile.hemisphere,
        native_fruit: profile.native_fruit,
        native_flower: profile.native_flower,
        island_rating: profile.island_rating,
        dream_address: profile.dream_address,
        friend_code: showFriendCode ? profile.friend_code : null,
        bio: sp.bio,
        theme_tags: sp.theme_tags || [],
        looking_for: sp.looking_for || [],
        screenshots: sp.screenshots || [],
        last_active: sp.last_active,
        is_favorited: true,
      };
    });

  return Response.json({ profiles });
}
