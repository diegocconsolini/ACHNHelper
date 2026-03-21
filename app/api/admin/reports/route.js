import { requireAdmin } from '@/lib/adminAuth';
import { createServerClient } from '@/lib/supabase';

export async function GET(req) {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return Response.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'pending';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

  const supabase = createServerClient();

  let query = supabase
    .from('reports')
    .select('*', { count: 'exact' });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data: reports, error, count } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Gather unique user IDs for reporter and reported
  const userIds = new Set();
  for (const r of reports || []) {
    if (r.reporter_user_id) userIds.add(r.reporter_user_id);
    if (r.reported_user_id) userIds.add(r.reported_user_id);
  }

  // Fetch profile info for these users
  let userMap = {};
  if (userIds.size > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, island_name, is_banned')
      .in('user_id', Array.from(userIds));

    if (profiles) {
      for (const p of profiles) {
        userMap[p.user_id] = p;
      }
    }
  }

  // Fetch shared_profile screenshots for reported users
  const reportedIds = [...new Set((reports || []).map(r => r.reported_user_id))];
  let screenshotMap = {};
  if (reportedIds.length > 0) {
    const { data: sharedProfiles } = await supabase
      .from('shared_profiles')
      .select('user_id, screenshots, bio, is_published')
      .in('user_id', reportedIds);

    if (sharedProfiles) {
      for (const sp of sharedProfiles) {
        screenshotMap[sp.user_id] = {
          screenshots: sp.screenshots || [],
          bio: sp.bio,
          is_published: sp.is_published,
        };
      }
    }
  }

  const enrichedReports = (reports || []).map(r => ({
    ...r,
    reporter: userMap[r.reporter_user_id] || null,
    reported: userMap[r.reported_user_id] || null,
    reported_listing: screenshotMap[r.reported_user_id] || null,
  }));

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return Response.json({ reports: enrichedReports, total, page, totalPages });
}
