import { requireAdmin } from '@/lib/adminAuth';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return Response.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const supabase = createServerClient();

  // Run all counts in parallel
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalUsersRes,
    activeUsersRes,
    publishedListingsRes,
    pendingReportsRes,
    totalReportsRes,
    bannedUsersRes,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('shared_profiles').select('id', { count: 'exact', head: true }).gte('last_active', sevenDaysAgo),
    supabase.from('shared_profiles').select('id', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reports').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_banned', true),
  ]);

  return Response.json({
    totalUsers: totalUsersRes.count || 0,
    activeUsers: activeUsersRes.count || 0,
    publishedListings: publishedListingsRes.count || 0,
    pendingReports: pendingReportsRes.count || 0,
    totalReports: totalReportsRes.count || 0,
    bannedUsers: bannedUsersRes.count || 0,
  });
}
