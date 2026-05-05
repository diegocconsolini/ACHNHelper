import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit } from '../lib/rateLimit.js';

function fakeReq(headers = {}) {
  return {
    headers: {
      get: (k) => headers[k.toLowerCase()] || null,
    },
  };
}

describe('rateLimit', () => {
  // Each test uses a unique route name to avoid sharing the in-memory bucket.
  it('allows requests under the limit and decrements remaining', () => {
    const req = fakeReq({ 'x-forwarded-for': '1.1.1.1' });
    const a = rateLimit(req, { name: 't1', limit: 3, windowSec: 60 });
    expect(a).not.toBeInstanceOf(Response);
    expect(a.remaining).toBe(2);

    const b = rateLimit(req, { name: 't1', limit: 3, windowSec: 60 });
    expect(b.remaining).toBe(1);

    const c = rateLimit(req, { name: 't1', limit: 3, windowSec: 60 });
    expect(c.remaining).toBe(0);
  });

  it('returns a 429 Response when the limit is exceeded', async () => {
    const req = fakeReq({ 'x-forwarded-for': '2.2.2.2' });
    rateLimit(req, { name: 't2', limit: 1, windowSec: 60 });
    const blocked = rateLimit(req, { name: 't2', limit: 1, windowSec: 60 });

    expect(blocked).toBeInstanceOf(Response);
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Retry-After')).toBeTruthy();
    expect(blocked.headers.get('X-RateLimit-Remaining')).toBe('0');
    const body = await blocked.json();
    expect(body.error).toBe('Rate limit exceeded');
    expect(body.retryAfter).toBeGreaterThan(0);
  });

  it('isolates buckets by route name', () => {
    const req = fakeReq({ 'x-forwarded-for': '3.3.3.3' });
    rateLimit(req, { name: 'route-a', limit: 1, windowSec: 60 });
    const onB = rateLimit(req, { name: 'route-b', limit: 1, windowSec: 60 });
    expect(onB).not.toBeInstanceOf(Response);
  });

  it('isolates buckets by identity', () => {
    const ipA = fakeReq({ 'x-forwarded-for': '4.4.4.4' });
    const ipB = fakeReq({ 'x-forwarded-for': '5.5.5.5' });
    rateLimit(ipA, { name: 'tident', limit: 1, windowSec: 60 });
    const fromB = rateLimit(ipB, { name: 'tident', limit: 1, windowSec: 60 });
    expect(fromB).not.toBeInstanceOf(Response);
  });

  it('prefers explicit identity over IP', () => {
    const req = fakeReq({ 'x-forwarded-for': '6.6.6.6' });
    rateLimit(req, { name: 'tid', identity: 'user-x', limit: 1, windowSec: 60 });
    // Same IP but a different explicit user -> separate bucket
    const next = rateLimit(req, { name: 'tid', identity: 'user-y', limit: 1, windowSec: 60 });
    expect(next).not.toBeInstanceOf(Response);
  });

  it('parses x-forwarded-for first IP only', () => {
    const req = fakeReq({ 'x-forwarded-for': '10.0.0.1, 10.0.0.2' });
    rateLimit(req, { name: 'txff', limit: 1, windowSec: 60 });
    // Same first IP -> blocked on second call
    const blocked = rateLimit(req, { name: 'txff', limit: 1, windowSec: 60 });
    expect(blocked).toBeInstanceOf(Response);

    // Different first IP -> allowed
    const other = fakeReq({ 'x-forwarded-for': '10.0.0.99, 10.0.0.2' });
    const ok = rateLimit(other, { name: 'txff', limit: 1, windowSec: 60 });
    expect(ok).not.toBeInstanceOf(Response);
  });
});
