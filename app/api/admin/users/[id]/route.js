import { requireAdmin, logAdminAction } from '@/lib/adminAuth';
import { createServerClient } from '@/lib/supabase';

export async function GET(req, { params }) {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return Response.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { id } = await params;
  const supabase = createServerClient();

  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', id)
    .single();

  if (profileError || !profile) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  // Get shared profile
  const { data: sharedProfile } = await supabase
    .from('shared_profiles')
    .select('*')
    .eq('user_id', id)
    .maybeSingle();

  // Count reports against this user
  const { count: reportsCount } = await supabase
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('reported_user_id', id);

  // Count favorites received
  const { count: favoritesCount } = await supabase
    .from('favorites')
    .select('id', { count: 'exact', head: true })
    .eq('favorited_user_id', id);

  return Response.json({
    profile,
    sharedProfile: sharedProfile || null,
    reportsCount: reportsCount || 0,
    favoritesCount: favoritesCount || 0,
  });
}

export async function PUT(req, { params }) {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return Response.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { id } = await params;
  const body = await req.json();
  const { action, reason } = body;

  if (!['ban', 'unban'].includes(action)) {
    return Response.json({ error: 'Invalid action. Must be "ban" or "unban"' }, { status: 400 });
  }

  const supabase = createServerClient();

  if (action === 'ban') {
    // Ban user
    const { error } = await supabase
      .from('profiles')
      .update({
        is_banned: true,
        ban_reason: reason || 'Banned by admin',
        banned_at: new Date().toISOString(),
        banned_by: adminCheck.session.user.email,
      })
      .eq('user_id', id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Unpublish their listing
    await supabase
      .from('shared_profiles')
      .update({ is_published: false })
      .eq('user_id', id);

    await logAdminAction(
      adminCheck.session,
      'ban_user',
      id,
      'user',
      { reason: reason || 'Banned by admin' }
    );

    return Response.json({ success: true, action: 'ban' });
  } else {
    // Unban user
    const { error } = await supabase
      .from('profiles')
      .update({
        is_banned: false,
        ban_reason: null,
        banned_at: null,
        banned_by: null,
      })
      .eq('user_id', id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    await logAdminAction(
      adminCheck.session,
      'unban_user',
      id,
      'user',
      { reason: 'Unbanned by admin' }
    );

    return Response.json({ success: true, action: 'unban' });
  }
}
