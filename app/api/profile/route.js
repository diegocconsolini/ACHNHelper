import { auth } from '@/auth';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  // PGRST116 = no rows found — not an error, just no profile yet
  if (error && error.code !== 'PGRST116') {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data || {});
}

export async function PUT(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  // Whitelist allowed fields
  const allowed = [
    'island_name', 'hemisphere', 'friend_code', 'dream_address',
    'native_flower', 'native_fruit', 'island_rating',
  ];
  const updates = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  updates.updated_at = new Date().toISOString();

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ user_id: session.user.id, ...updates }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
