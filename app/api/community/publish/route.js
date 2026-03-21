import { auth } from '@/auth';
import { createServerClient } from '@/lib/supabase';
import { containsProfanity } from '@/lib/moderation';
import { THEME_TAGS, LOOKING_FOR_TAGS } from '@/lib/communityConstants';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('shared_profiles')
    .select(`
      user_id,
      bio,
      theme_tags,
      looking_for,
      show_friend_code,
      is_published,
      last_active,
      updated_at
    `)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Return null if no shared profile exists yet
  return Response.json(data || null);
}

function validateBody(body) {
  const { bio, themeTags, lookingFor, showFriendCode, consentGiven } = body;

  // Bio validation
  if (bio !== undefined && bio !== null) {
    if (typeof bio !== 'string') {
      return 'bio must be a string';
    }
    if (bio.length > 200) {
      return 'bio must be 200 characters or less';
    }
    if (containsProfanity(bio)) {
      return 'bio contains inappropriate language';
    }
  }

  // Theme tags validation
  if (themeTags !== undefined && themeTags !== null) {
    if (!Array.isArray(themeTags)) {
      return 'themeTags must be an array';
    }
    if (themeTags.length > 5) {
      return 'maximum 5 theme tags allowed';
    }
    for (const tag of themeTags) {
      if (!THEME_TAGS.includes(tag)) {
        return `invalid theme tag: ${tag}`;
      }
    }
  }

  // Looking for validation
  if (lookingFor !== undefined && lookingFor !== null) {
    if (!Array.isArray(lookingFor)) {
      return 'lookingFor must be an array';
    }
    if (lookingFor.length > 3) {
      return 'maximum 3 looking-for tags allowed';
    }
    for (const tag of lookingFor) {
      if (!LOOKING_FOR_TAGS.includes(tag)) {
        return `invalid looking-for tag: ${tag}`;
      }
    }
  }

  // Friend code consent
  if (showFriendCode && !consentGiven) {
    return 'consent is required to share your friend code';
  }

  return null;
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const validationError = validateBody(body);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  const { bio, themeTags, lookingFor, showFriendCode, consentGiven } = body;

  const supabase = createServerClient();

  // Check if user is banned
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_banned')
    .eq('user_id', session.user.id)
    .single();

  if (profile?.is_banned) {
    return Response.json({ error: 'Your account has been suspended from community features' }, { status: 403 });
  }
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('shared_profiles')
    .upsert({
      user_id: session.user.id,
      bio: bio || null,
      theme_tags: themeTags || [],
      looking_for: lookingFor || [],
      show_friend_code: showFriendCode && consentGiven ? true : false,
      is_published: true,
      last_active: now,
      updated_at: now,
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function PUT(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const validationError = validateBody(body);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  const { bio, themeTags, lookingFor, showFriendCode, consentGiven } = body;

  const supabase = createServerClient();
  const now = new Date().toISOString();

  const updates = { updated_at: now };
  if (bio !== undefined) updates.bio = bio || null;
  if (themeTags !== undefined) updates.theme_tags = themeTags || [];
  if (lookingFor !== undefined) updates.looking_for = lookingFor || [];
  if (showFriendCode !== undefined) {
    updates.show_friend_code = showFriendCode && consentGiven ? true : false;
  }

  const { data, error } = await supabase
    .from('shared_profiles')
    .update(updates)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function DELETE(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();

  const { error } = await supabase
    .from('shared_profiles')
    .update({
      is_published: false,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', session.user.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
