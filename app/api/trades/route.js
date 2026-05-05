import { auth } from '@/auth';
import { createServerClient } from '@/lib/supabase';

const VALID_CATEGORIES = ['item', 'villager', 'diy', 'material'];
const VALID_INTENTS = ['offering', 'looking_for'];
const VALID_STATUSES = ['open', 'pending', 'completed', 'cancelled'];

// Public — list trades with filters.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const intent = searchParams.get('intent');
  const status = searchParams.get('status') || 'open';
  const search = (searchParams.get('search') || '').trim().slice(0, 80);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '30', 10)));

  const supabase = createServerClient();
  let q = supabase
    .from('trade_listings')
    .select(`
      id, user_id, category, intent, title, description, trade_for, status, created_at,
      profiles!inner ( island_name, hemisphere, friend_code, is_banned )
    `)
    .or('is_banned.is.null,is_banned.eq.false', { referencedTable: 'profiles' })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (VALID_CATEGORIES.includes(category)) q = q.eq('category', category);
  if (VALID_INTENTS.includes(intent)) q = q.eq('intent', intent);
  if (VALID_STATUSES.includes(status)) q = q.eq('status', status);
  if (search) q = q.ilike('title', `%${search}%`);

  // Exclude blocked users (both directions)
  const session = await auth();
  const authed = !!session?.user?.id;
  if (authed) {
    const userId = session.user.id;
    const { data: blockedByMe } = await supabase
      .from('blocked_users').select('blocked_user_id').eq('user_id', userId);
    const { data: blockedMe } = await supabase
      .from('blocked_users').select('user_id').eq('blocked_user_id', userId);
    const blocked = [
      ...(blockedByMe || []).map(b => b.blocked_user_id),
      ...(blockedMe || []).map(b => b.user_id),
    ].filter(id => /^[0-9a-f-]{36}$/i.test(id));
    if (blocked.length > 0) q = q.not('user_id', 'in', `(${blocked.join(',')})`);
  }

  const { data, error } = await q;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const trades = (data || []).map(r => ({
    id: r.id,
    user_id: r.user_id,
    category: r.category,
    intent: r.intent,
    title: r.title,
    description: r.description,
    trade_for: r.trade_for,
    status: r.status,
    created_at: r.created_at,
    island_name: r.profiles?.island_name || 'Anonymous',
    hemisphere: r.profiles?.hemisphere || null,
    friend_code: authed ? r.profiles?.friend_code : null,
    is_mine: authed && r.user_id === session.user.id,
  }));

  return Response.json({ trades, authed });
}

// Authed — create a listing.
export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const category = body.category;
  const intent = body.intent;
  const title = (body.title || '').toString().trim().slice(0, 80);
  const description = (body.description || '').toString().slice(0, 500);
  const trade_for = (body.trade_for || '').toString().slice(0, 200);

  if (!VALID_CATEGORIES.includes(category)) return Response.json({ error: 'Invalid category' }, { status: 400 });
  if (!VALID_INTENTS.includes(intent)) return Response.json({ error: 'Invalid intent' }, { status: 400 });
  if (!title) return Response.json({ error: 'Title required' }, { status: 400 });

  const supabase = createServerClient();

  // Cap: max 5 open listings per user — prevents spam
  const { count } = await supabase
    .from('trade_listings')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', session.user.id)
    .eq('status', 'open');
  if ((count || 0) >= 5) {
    return Response.json({ error: 'Max 5 open listings — close one first' }, { status: 429 });
  }

  const { data, error } = await supabase
    .from('trade_listings')
    .insert({
      user_id: session.user.id,
      category, intent, title,
      description: description || null,
      trade_for: trade_for || null,
      status: 'open',
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

// Authed — update status of your own listing.
export async function PATCH(req) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = body.id;
  const status = body.status;
  if (!id) return Response.json({ error: 'id required' }, { status: 400 });
  if (!VALID_STATUSES.includes(status)) return Response.json({ error: 'Invalid status' }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('trade_listings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!data) return Response.json({ error: 'Not found or not yours' }, { status: 404 });
  return Response.json(data);
}

// Authed — delete your own listing.
export async function DELETE(req) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'id required' }, { status: 400 });

  const supabase = createServerClient();
  const { error } = await supabase
    .from('trade_listings')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
