import { auth } from '@/auth';
import { rateLimit } from '@/lib/rateLimit';

// Receives client-side errors and emits a structured log line.
// Vercel runtime logs ingest console.error for free; we don't store these
// anywhere — the goal is observability via the Vercel dashboard, not a
// custom error database.

const MAX_BODY_BYTES = 8 * 1024;

export async function POST(req) {
  // Tight rate limit — error storms shouldn't fill our logs
  const session = await auth();
  const limited = rateLimit(req, {
    name: 'errors',
    identity: session?.user?.id,
    limit: 30,
    windowSec: 60,
  });
  if (limited instanceof Response) return limited;

  const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: 'Payload too large' }, { status: 413 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const event = {
    level: 'error',
    type: 'client_error',
    message: String(body.message || '').slice(0, 500),
    stack: String(body.stack || '').slice(0, 4000),
    url: String(body.url || '').slice(0, 500),
    userAgent: req.headers.get('user-agent')?.slice(0, 300) || null,
    user_id: session?.user?.id || null,
    timestamp: new Date().toISOString(),
  };

  // Single-line JSON so Vercel log search can pick it up easily.
  // eslint-disable-next-line no-console
  console.error(JSON.stringify(event));

  return Response.json({ ok: true });
}
