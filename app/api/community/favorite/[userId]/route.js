import { auth } from '@/auth';
import { createServerClient } from '@/lib/supabase';

export async function POST(req, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await params;

  if (session.user.id === userId) {
    return Response.json({ error: 'Cannot favorite yourself' }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('favorites')
    .upsert({
      user_id: session.user.id,
      favorited_user_id: userId,
      created_at: new Date().toISOString(),
    }, { onConflict: 'user_id,favorited_user_id' })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await params;

  const supabase = createServerClient();

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', session.user.id)
    .eq('favorited_user_id', userId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
