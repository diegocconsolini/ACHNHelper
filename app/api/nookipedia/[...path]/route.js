// Nookipedia API proxy — keeps API key server-side
// Usage: fetch('/api/nookipedia/nh/fish/Coelacanth')
// Proxies to: https://api.nookipedia.com/nh/fish/Coelacanth

const API_BASE = 'https://api.nookipedia.com';
const API_KEY = process.env.NOOKIPEDIA_API_KEY;

// Simple in-memory cache (per serverless instance)
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET(req, { params }) {
  if (!API_KEY) {
    return Response.json({ error: 'Nookipedia API key not configured' }, { status: 500 });
  }

  const { path } = await params;
  const apiPath = '/' + path.join('/');

  // Pass through query params
  const url = new URL(req.url);
  const queryString = url.search;
  const fullUrl = `${API_BASE}${apiPath}${queryString}`;

  // Check cache
  const cached = cache.get(fullUrl);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return Response.json(cached.data, {
      headers: { 'X-Cache': 'HIT' },
    });
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

    return Response.json(data, {
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (err) {
    return Response.json(
      { error: 'Failed to fetch from Nookipedia', details: err.message },
      { status: 502 }
    );
  }
}
