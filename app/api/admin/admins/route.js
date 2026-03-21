import { requireAdmin, logAdminAction } from '@/lib/adminAuth';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return Response.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const supabase = createServerClient();

  // Get database admins
  const { data: dbAdmins, error } = await supabase
    .from('admins')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Also include env-var admins
  const envAdmins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  const dbEmails = new Set((dbAdmins || []).map(a => a.email.toLowerCase()));

  const allAdmins = [
    ...(dbAdmins || []),
    ...envAdmins
      .filter(email => !dbEmails.has(email))
      .map(email => ({ email, source: 'env', created_at: null })),
  ];

  return Response.json({ admins: allAdmins });
}

export async function POST(req) {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return Response.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const body = await req.json();
  const { email } = body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return Response.json({ error: 'Valid email is required' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const supabase = createServerClient();

  // Check if already an admin
  const { data: existing } = await supabase
    .from('admins')
    .select('id')
    .eq('email', normalizedEmail)
    .single();

  if (existing) {
    return Response.json({ error: 'This email is already an admin' }, { status: 409 });
  }

  // Find user_id by checking profiles (we need to find them somehow)
  // Since profiles don't store email, we'll store email + a placeholder user_id
  const { data: admin, error } = await supabase
    .from('admins')
    .insert({
      user_id: normalizedEmail, // Use email as user_id fallback since profiles don't store email
      email: normalizedEmail,
      added_by: adminCheck.session.user.email,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  await logAdminAction(
    adminCheck.session,
    'add_admin',
    null,
    'admin',
    { email: normalizedEmail }
  );

  return Response.json({ success: true, admin });
}

export async function DELETE(req) {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return Response.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const body = await req.json();
  const { email } = body;

  if (!email || typeof email !== 'string') {
    return Response.json({ error: 'Email is required' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Can't remove yourself
  if (normalizedEmail === adminCheck.session.user.email.toLowerCase()) {
    return Response.json({ error: 'Cannot remove yourself as admin' }, { status: 400 });
  }

  // Can't remove env-var admins
  const envAdmins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  if (envAdmins.includes(normalizedEmail)) {
    return Response.json({ error: 'Cannot remove environment-configured admins' }, { status: 400 });
  }

  const supabase = createServerClient();

  const { error } = await supabase
    .from('admins')
    .delete()
    .eq('email', normalizedEmail);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  await logAdminAction(
    adminCheck.session,
    'remove_admin',
    null,
    'admin',
    { email: normalizedEmail }
  );

  return Response.json({ success: true });
}
