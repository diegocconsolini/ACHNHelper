// In-memory token-bucket rate limiter, scoped per Vercel function instance.
// Good enough for this app's scale; if traffic grows, swap the store for
// upstash/ratelimit without changing call sites.
//
// Usage:
//   const limited = rateLimit(req, { name: 'route-id', limit: 30, windowSec: 60 });
//   if (limited) return limited; // already a 429 Response
//
// Identity is the auth user_id when present, otherwise the request's IP from
// x-forwarded-for / x-real-ip headers (Vercel sets these). We never store
// raw IPs beyond the LRU window.

const buckets = new Map(); // key -> { tokens, resetAt }
const MAX_KEYS = 5000;     // Soft cap to prevent unbounded growth

function clientIp(req) {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

function pruneIfNeeded() {
  if (buckets.size <= MAX_KEYS) return;
  // Drop the 20% oldest entries by reset time
  const entries = [...buckets.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
  const toDrop = Math.floor(entries.length * 0.2);
  for (let i = 0; i < toDrop; i++) buckets.delete(entries[i][0]);
}

/**
 * @param {Request} req
 * @param {Object} opts
 * @param {string} opts.name - logical route id (used in the key)
 * @param {string} [opts.identity] - explicit identity (e.g. user_id from session)
 * @param {number} opts.limit - max requests per window
 * @param {number} opts.windowSec - window length in seconds
 * @returns {Response | { remaining: number, resetAt: number }} 429 Response if blocked, otherwise headers info
 */
export function rateLimit(req, { name, identity, limit, windowSec }) {
  const id = identity || clientIp(req);
  const key = `${name}:${id}`;
  const now = Date.now();
  const winMs = windowSec * 1000;

  let bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { tokens: limit, resetAt: now + winMs };
  }

  if (bucket.tokens <= 0) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return new Response(JSON.stringify({ error: 'Rate limit exceeded', retryAfter }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(bucket.resetAt / 1000)),
      },
    });
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  pruneIfNeeded();

  return {
    remaining: bucket.tokens,
    resetAt: bucket.resetAt,
    headers: {
      'X-RateLimit-Limit': String(limit),
      'X-RateLimit-Remaining': String(bucket.tokens),
      'X-RateLimit-Reset': String(Math.ceil(bucket.resetAt / 1000)),
    },
  };
}

/**
 * Helper to merge rate-limit headers into an outgoing Response.
 */
export function withRateLimitHeaders(response, info) {
  if (!info || !info.headers) return response;
  for (const [k, v] of Object.entries(info.headers)) {
    response.headers.set(k, v);
  }
  return response;
}
