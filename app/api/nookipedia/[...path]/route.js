// Nookipedia API proxy — keeps API key server-side
// Usage: fetch('/api/nookipedia/nh/fish/Coelacanth')
// Proxies to: https://api.nookipedia.com/nh/fish/Coelacanth

import { rateLimit, withRateLimitHeaders } from '@/lib/rateLimit';

const API_BASE = 'https://api.nookipedia.com';
const API_KEY = process.env.NOOKIPEDIA_API_KEY;

const ALLOWED_PREFIXES = [
  '/nh/fish', '/nh/bugs', '/nh/sea', '/nh/art', '/nh/recipes',
  '/nh/furniture', '/nh/clothing', '/nh/interior', '/nh/gyroids',
  '/nh/photos', '/nh/events', '/villagers',
];

// Simple in-memory cache (per serverless instance)
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET(req, { params }) {
  if (!API_KEY) {
    return Response.json({ error: 'Nookipedia API key not configured' }, { status: 500 });
  }

  // Rate limit: 60 requests/min per IP. Cached responses still count, but
  // upstream calls are bounded by the existing 1-hour cache + this limit.
  const limited = rateLimit(req, { name: 'nookipedia', limit: 60, windowSec: 60 });
  if (limited instanceof Response) return limited;

  const { path } = await params;
  const apiPath = '/' + path.join('/');

  const isAllowed = ALLOWED_PREFIXES.some(p => apiPath === p || apiPath.startsWith(p + '/') || apiPath.startsWith(p + '?'));
  if (!isAllowed) {
    return Response.json({ error: 'Path not allowed' }, { status: 403 });
  }

  // Pass through query params
  const url = new URL(req.url);
  const queryString = url.search;
  const fullUrl = `${API_BASE}${apiPath}${queryString}`;

  // Check cache
  const cached = cache.get(fullUrl);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    const r = Response.json(cached.data, { headers: { 'X-Cache': 'HIT' } });
    return withRateLimitHeaders(r, limited);
  }

  try {
    const res = await fetch(fullUrl, {
      headers: {
        'X-API-KEY': API_KEY,
        'Accept-Version': '1.7.0',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return Response.json(
        { error: `Nookipedia API error: ${res.status}`, details: text },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Cache successful responses
    cache.set(fullUrl, { data, time: Date.now() });

    // Evict old cache entries (keep under 500)
    if (cache.size > 500) {
      const oldest = [...cache.entries()].sort((a, b) => a[1].time - b[1].time);
      for (let i = 0; i < 100; i++) cache.delete(oldest[i][0]);
    }

    const r = Response.json(data, { headers: { 'X-Cache': 'MISS' } });
    return withRateLimitHeaders(r, limited);
  } catch (err) {
    return Response.json(
      { error: 'Failed to fetch from Nookipedia', details: err.message },
      { status: 502 }
    );
  }
}
