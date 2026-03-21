import { auth } from '@/auth';
import { createServerClient } from '@/lib/supabase';

export async function isAdmin(session) {
  if (!session?.user?.email) return false;

  // Check env var first (bootstrap admin)
  const envAdmins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  if (envAdmins.includes(session.user.email.toLowerCase())) return true;

  // Check database admins table
  const supabase = createServerClient();
  const { data } = await supabase
    .from('admins')
    .select('id')
    .eq('email', session.user.email.toLowerCase())
    .single();

  return !!data;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized', status: 401 };
  }
  const admin = await isAdmin(session);
  if (!admin) {
    return { error: 'Forbidden', status: 403 };
  }
  return { session, admin: true };
}

export async function logAdminAction(session, action, targetUserId, targetType, details) {
  const supabase = createServerClient();
  await supabase.from('admin_audit_log').insert({
    admin_user_id: session.user.id,
    admin_email: session.user.email,
    action,
    target_user_id: targetUserId || null,
    target_type: targetType || null,
    details: details || null,
  });
}
