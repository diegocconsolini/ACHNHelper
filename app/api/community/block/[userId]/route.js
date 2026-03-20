import { auth } from '@/auth';
import { createServerClient } from '@/lib/supabase';

export async function POST(req, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await params;

  if (session.user.id === userId) {
    return Response.json({ error: 'Cannot block yourself' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Insert block record
  const { error: blockError } = await supabase
    .from('blocked_users')
    .upsert({
      user_id: session.user.id,
      blocked_user_id: userId,
      created_at: new Date().toISOString(),
    }, { onConflict: 'user_id,blocked_user_id' });

  if (blockError) {
    return Response.json({ error: blockError.message }, { status: 500 });
  }

  // Remove favorites in both directions
  await supabase
    .from('favorites')
    .delete()
    .eq('user_id', session.user.id)
    .eq('favorited_user_id', userId);

  await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('favorited_user_id', session.user.id);

  return Response.json({ success: true });
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await params;

  const supabase = createServerClient();

  const { error } = await supabase
    .from('blocked_users')
    .delete()
    .eq('user_id', session.user.id)
    .eq('blocked_user_id', userId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
