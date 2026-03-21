import { auth } from '@/auth';
import { createServerClient } from '@/lib/supabase';
import { REPORT_REASONS } from '@/lib/communityConstants';

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { reportedUserId, reason, details } = body;

  // Validate reported user
  if (!reportedUserId || typeof reportedUserId !== 'string') {
    return Response.json({ error: 'reportedUserId is required' }, { status: 400 });
  }

  if (session.user.id === reportedUserId) {
    return Response.json({ error: 'Cannot report yourself' }, { status: 400 });
  }

  // Validate reason
  if (!REPORT_REASONS.includes(reason)) {
    return Response.json({ error: `Invalid reason. Must be one of: ${REPORT_REASONS.join(', ')}` }, { status: 400 });
  }

  // Validate details
  if (details !== undefined && details !== null) {
    if (typeof details !== 'string') {
      return Response.json({ error: 'details must be a string' }, { status: 400 });
    }
    if (details.length > 500) {
      return Response.json({ error: 'details must be 500 characters or less' }, { status: 400 });
    }
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_user_id: session.user.id,
      reported_user_id: reportedUserId,
      reason,
      details: details || null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Auto-escalation: if 5+ pending reports against same user, auto-unpublish
  const { count: pendingCount } = await supabase
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('reported_user_id', reportedUserId)
    .eq('status', 'pending');

  if (pendingCount >= 5) {
    await supabase
      .from('shared_profiles')
      .update({ is_published: false })
      .eq('user_id', reportedUserId);
  }

  return Response.json({ success: true, id: data.id });
}
