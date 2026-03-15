import { auth } from '@/auth';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  const { data: artifacts } = await supabase
    .from('artifact_data')
    .select('*')
    .eq('user_id', session.user.id);

  return Response.json({
    user: { name: session.user.name, email: session.user.email },
    profile: profile || null,
    artifactData: (artifacts || []).reduce((acc, a) => ({
      ...acc,
      [a.artifact_key]: a.data,
    }), {}),
    exportedAt: new Date().toISOString(),
  });
}
