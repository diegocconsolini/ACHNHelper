import { auth } from '@/auth';
import { createServerClient } from '@/lib/supabase';

// Compute Sunday-of-this-week as YYYY-MM-DD (UTC)
function currentWeekStart(now = new Date()) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dow = d.getUTCDay(); // 0 = Sun
  d.setUTCDate(d.getUTCDate() - dow);
  return d.toISOString().slice(0, 10);
}

// Public — list this week's prices, sorted by best price first.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const kindFilter = searchParams.get('kind'); // 'buy' | 'sell' | null
  const minPrice = parseInt(searchParams.get('minPrice') || '0', 10);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

  const supabase = createServerClient();
  const weekStart = currentWeekStart();

  let q = supabase
    .from('turnip_prices')
    .select(`
      id, user_id, price, kind, slot, dodo, note, week_start, created_at,
      profiles!inner ( island_name, hemisphere, friend_code, is_banned )
    `)
    .eq('week_start', weekStart)
    .or('is_banned.is.null,is_banned.eq.false', { referencedTable: 'profiles' })
    .order('price', { ascending: false })
    .limit(limit);

  if (kindFilter === 'buy' || kindFilter === 'sell') {
    q = q.eq('kind', kindFilter);
  }
  if (minPrice > 0) {
    q = q.gte('price', minPrice);
  }

  const { data, error } = await q;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const session = await auth();
  const authed = !!session?.user?.id;

  const prices = (data || []).map(r => ({
    id: r.id,
    user_id: r.user_id,
    price: r.price,
    kind: r.kind,
    slot: r.slot,
    dodo: authed ? r.dodo : null,
    note: r.note,
    week_start: r.week_start,
    created_at: r.created_at,
    island_name: r.profiles?.island_name || 'Anonymous',
    hemisphere: r.profiles?.hemisphere || null,
  }));

  return Response.json({ prices, week_start: weekStart, authed });
}

// Authed — submit (or upsert) a price for this week.
export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const price = parseInt(body.price, 10);
  const kind = body.kind;
  const slot = parseInt(body.slot, 10);
  const dodo = (body.dodo || '').toString().slice(0, 8).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const note = (body.note || '').toString().slice(0, 140);

  if (!Number.isInteger(price) || price < 9 || price > 999) {
    return Response.json({ error: 'Price must be 9–999' }, { status: 400 });
  }
  if (kind !== 'buy' && kind !== 'sell') {
    return Response.json({ error: 'kind must be buy or sell' }, { status: 400 });
  }
  if (!Number.isInteger(slot) || slot < 0 || slot > 12) {
    return Response.json({ error: 'slot must be 0–12' }, { status: 400 });
  }
  if (kind === 'buy' && slot !== 0) {
    return Response.json({ error: 'buy prices use slot 0 (Sunday)' }, { status: 400 });
  }
  if (kind === 'sell' && slot < 1) {
    return Response.json({ error: 'sell prices use slot 1–12 (Mon AM – Sat PM)' }, { status: 400 });
  }

  const supabase = createServerClient();
  const weekStart = currentWeekStart();

  const { data, error } = await supabase
    .from('turnip_prices')
    .upsert({
      user_id: session.user.id,
      price, kind, slot,
      dodo: dodo || null,
      note: note || null,
      week_start: weekStart,
      created_at: new Date().toISOString(),
    }, { onConflict: 'user_id,kind,slot,week_start' })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

// Authed — remove your own price entry.
export async function DELETE(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'id required' }, { status: 400 });

  const supabase = createServerClient();
  const { error } = await supabase
    .from('turnip_prices')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
