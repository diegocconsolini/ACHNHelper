import { auth } from '@/auth';
import { createServerClient } from '@/lib/supabase';

const BUCKET_NAME = 'island-screenshots';
const MAX_SCREENSHOTS = 5;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();

  // Ensure bucket exists (idempotent — succeeds on first call, no-ops after)
  await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: MAX_FILE_SIZE,
    allowedMimeTypes: VALID_TYPES,
  });

  // Check current screenshot count
  const { data: profile } = await supabase
    .from('shared_profiles')
    .select('screenshots')
    .eq('user_id', session.user.id)
    .single();

  if (profile?.screenshots?.length >= MAX_SCREENSHOTS) {
    return Response.json(
      { error: `Maximum ${MAX_SCREENSHOTS} screenshots allowed` },
      { status: 400 }
    );
  }

  const formData = await req.formData();
  const file = formData.get('file');

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  // Validate file type
  if (!VALID_TYPES.includes(file.type)) {
    return Response.json(
      { error: 'Invalid file type. Use JPEG, PNG, or WebP.' },
      { status: 400 }
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return Response.json(
      { error: 'File too large. Maximum 2MB.' },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Validate file magic bytes
  const MAGIC_BYTES = {
    'image/jpeg': (b) => b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF,
    'image/png':  (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47 &&
      b[4] === 0x0D && b[5] === 0x0A && b[6] === 0x1A && b[7] === 0x0A,
    'image/webp': (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  };

  const magicCheck = MAGIC_BYTES[file.type];
  if (!magicCheck || buffer.length < 12 || !magicCheck(buffer)) {
    return Response.json(
      { error: 'File content does not match declared type' },
      { status: 400 }
    );
  }

  const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
  const fileName = `${session.user.id}/${crypto.randomUUID()}.${ext}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return Response.json(
      { error: 'Upload failed: ' + uploadError.message },
      { status: 500 }
    );
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  const publicUrl = urlData.publicUrl;

  // Append to shared_profiles screenshots array
  const currentScreenshots = profile?.screenshots || [];
  const { error: updateError } = await supabase
    .from('shared_profiles')
    .upsert(
      {
        user_id: session.user.id,
        screenshots: [...currentScreenshots, publicUrl],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (updateError) {
    // Clean up uploaded file on DB error
    await supabase.storage.from(BUCKET_NAME).remove([fileName]);
    return Response.json(
      { error: 'Failed to save screenshot reference' },
      { status: 500 }
    );
  }

  return Response.json({ url: publicUrl });
}

export async function DELETE(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { url } = await req.json();
  if (!url) {
    return Response.json({ error: 'URL required' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Remove from screenshots array
  const { data: profile } = await supabase
    .from('shared_profiles')
    .select('screenshots')
    .eq('user_id', session.user.id)
    .single();

  if (!profile) {
    return Response.json({ error: 'Profile not found' }, { status: 404 });
  }

  const newScreenshots = (profile.screenshots || []).filter(s => s !== url);

  await supabase
    .from('shared_profiles')
    .update({
      screenshots: newScreenshots,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', session.user.id);

  // Delete from storage — extract path after bucket name
  const path = url.split(`/${BUCKET_NAME}/`)[1];
  if (path) {
    await supabase.storage.from(BUCKET_NAME).remove([path]);
  }

  return Response.json({ success: true });
}
