import { auth } from '@/auth';
import { createServerClient } from '@/lib/supabase';

const VALID_KEYS = [
  'fish-tracker', 'bug-tracker', 'sea-creature-tracker', 'flower-calculator',
  'garden-planner', 'island-flower-map', 'turnip-tracker', 'bell-calculator',
  'nooks-cranny-log', 'museum-tracker', 'golden-tool-tracker', 'nook-miles-tracker',
  'five-star-checker', 'daily-routine', 'villager-gift-guide', 'gulliver-tracker',
  'art-detector', 'kk-catalogue', 'seasonal-event-calendar', 'acnh-diy-tracker',
  'celeste-meteor-tracker', 'dream-address-book', 'acnh-modal-theme',
];

export async function GET(req, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { artifactKey } = await params;
  if (!VALID_KEYS.includes(artifactKey)) {
    return Response.json({ error: 'Invalid artifact key' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('artifact_data')
    .select('data, updated_at')
    .eq('user_id', session.user.id)
    .eq('artifact_key', artifactKey)
    .single();

  if (error && error.code === 'PGRST116') {
    return Response.json(null, { status: 404 });
  }
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json(data);
}

export async function PUT(req, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { artifactKey } = await params;
  if (!VALID_KEYS.includes(artifactKey)) {
    return Response.json({ error: 'Invalid artifact key' }, { status: 400 });
  }

  const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
  if (contentLength > 512 * 1024) {
    return Response.json({ error: 'Payload too large' }, { status: 413 });
  }

  const body = await req.json();
  if (!body.data) {
    return Response.json({ error: 'Missing data field' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('artifact_data')
    .upsert({
      user_id: session.user.id,
      artifact_key: artifactKey,
      data: body.data,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,artifact_key' })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json(data);
}
