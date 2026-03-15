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
  await supabase.from('artifact_data').delete().eq('user_id', session.user.id);
  await supabase.from('profiles').delete().eq('user_id', session.user.id);

  return new Response(null, { status: 204 });
}
