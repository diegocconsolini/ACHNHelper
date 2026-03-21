import { requireAdmin, logAdminAction } from '@/lib/adminAuth';
import { createServerClient } from '@/lib/supabase';

export async function PUT(req, { params }) {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return Response.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, action } = body;

  const validStatuses = ['pending', 'reviewed', 'dismissed', 'actioned'];
  if (status && !validStatuses.includes(status)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 });
  }

  const validActions = ['dismiss', 'warn', 'remove_listing', 'ban'];
  if (action && !validActions.includes(action)) {
    return Response.json({ error: 'Invalid action' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Get the report
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single();

  if (reportError || !report) {
    return Response.json({ error: 'Report not found' }, { status: 404 });
  }

  // Determine new status based on action
  let newStatus = status || 'reviewed';
  if (action === 'dismiss') newStatus = 'dismissed';
  if (action === 'warn' || action === 'remove_listing' || action === 'ban') newStatus = 'actioned';

  // Update report status
  const { error: updateError } = await supabase
    .from('reports')
    .update({ status: newStatus })
    .eq('id', id);

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 });
  }

  // Execute action
  if (action === 'ban') {
    // Ban the reported user
    await supabase
      .from('profiles')
      .update({
        is_banned: true,
        ban_reason: body.reason || `Banned via report #${id}`,
        banned_at: new Date().toISOString(),
        banned_by: adminCheck.session.user.email,
      })
      .eq('user_id', report.reported_user_id);

    // Unpublish their listing
    await supabase
      .from('shared_profiles')
      .update({ is_published: false })
      .eq('user_id', report.reported_user_id);

    await logAdminAction(
      adminCheck.session,
      'ban_user',
      report.reported_user_id,
      'user',
      { report_id: id, reason: body.reason || 'Banned via report' }
    );
  } else if (action === 'remove_listing') {
    // Unpublish their listing
    await supabase
      .from('shared_profiles')
      .update({ is_published: false })
      .eq('user_id', report.reported_user_id);

    await logAdminAction(
      adminCheck.session,
      'remove_listing',
      report.reported_user_id,
      'listing',
      { report_id: id }
    );
  } else if (action === 'warn') {
    await logAdminAction(
      adminCheck.session,
      'warn_user',
      report.reported_user_id,
      'user',
      { report_id: id }
    );
  } else if (action === 'dismiss') {
    await logAdminAction(
      adminCheck.session,
      'dismiss_report',
      report.reported_user_id,
      'report',
      { report_id: id }
    );
  }

  return Response.json({ success: true, status: newStatus, action: action || null });
}
