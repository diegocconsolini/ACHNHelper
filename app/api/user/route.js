import { auth } from '@/auth';
import { createServerClient } from '@/lib/supabase';

// GET /api/user — current user info + profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  return Response.json({
    ...session.user,
    profile: profile || null,
  });
}

// DELETE /api/user — account deletion (GDPR)
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();

  // Delete all user data
  const uid = session.user.id;

  // Child/junction tables first
  await supabase.from('reports').delete().eq('reporter_user_id', uid);
  await supabase.from('reports').delete().eq('reported_user_id', uid);
  await supabase.from('blocked_users').delete().eq('user_id', uid);
  await supabase.from('blocked_users').delete().eq('blocked_user_id', uid);
  await supabase.from('favorites').delete().eq('user_id', uid);
  await supabase.from('favorites').delete().eq('favorited_user_id', uid);
  await supabase.from('shared_profiles').delete().eq('user_id', uid);
  await supabase.from('artifact_data').delete().eq('user_id', uid);
  await supabase.from('profiles').delete().eq('user_id', uid);

  return new Response(null, { status: 204 });
}
