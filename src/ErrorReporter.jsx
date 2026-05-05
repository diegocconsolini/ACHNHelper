'use client';

import { useEffect, useRef } from 'react';

// Reports unhandled errors and promise rejections to /api/errors.
// Heavy de-dup: the same (message + stack-prefix) is only reported once
// per session, and we cap reports at 10 per page-load to prevent storms.

const MAX_REPORTS_PER_LOAD = 10;

export default function ErrorReporter() {
  const seen = useRef(new Set());
  const sent = useRef(0);

  useEffect(() => {
    function send(message, stack, url) {
      if (sent.current >= MAX_REPORTS_PER_LOAD) return;
      const key = `${message}|${(stack || '').slice(0, 200)}`;
      if (seen.current.has(key)) return;
      seen.current.add(key);
      sent.current += 1;

      // Best-effort, fire-and-forget. Use keepalive so reports survive
      // page unload (when the unhandled error is fatal).
      try {
        fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, stack, url }),
          keepalive: true,
        }).catch(() => { /* ignore */ });
      } catch { /* ignore */ }
    }

    function onError(event) {
      const message = event?.message || event?.error?.message || 'Unknown error';
      const stack = event?.error?.stack || '';
      send(message, stack, window.location.href);
    }

    function onRejection(event) {
      const reason = event?.reason;
      const message = reason?.message || String(reason || 'Unhandled rejection');
      const stack = reason?.stack || '';
      send(message, stack, window.location.href);
    }

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return null;
}
