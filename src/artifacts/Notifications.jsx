'use client';

import React, { useState, useEffect, useCallback } from 'react';

const READ_TIMESTAMP_KEY = 'notifications-last-read';

function timeAgo(iso) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(true);
  const [error, setError] = useState('');
  const [lastRead, setLastRead] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/notifications');
      if (r.status === 401) {
        setAuthed(false);
        setNotifications([]);
        return;
      }
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        setError(e.error || `Server returned ${r.status}`);
        return;
      }
      const d = await r.json();
      setNotifications(d.notifications || []);
      setAuthed(true);
    } catch (e) {
      setError(e.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Read tracking via window.storage
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(READ_TIMESTAMP_KEY);
        if (r) setLastRead(parseInt(r.value, 10) || 0);
      } catch { /* ignore */ }
    })();
  }, []);

  const markAllRead = async () => {
    const now = Date.now();
    setLastRead(now);
    try {
      await window.storage.set(READ_TIMESTAMP_KEY, String(now));
      // Notify the App that the count should be re-checked
      window.dispatchEvent(new CustomEvent('notifications:read'));
    } catch { /* ignore */ }
  };

  const unread = notifications.filter(n => new Date(n.created_at).getTime() > lastRead);

  return (
    <div style={styles.root}>
      <style>{fontImport}</style>

      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.title}>Notifications</h1>
            <p style={styles.subtitle}>
              {authed
                ? `${unread.length} unread · ${notifications.length} total`
                : 'Sign in to see your community notifications'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={load} style={styles.secondaryBtn}>↻ Refresh</button>
            {unread.length > 0 && (
              <button onClick={markAllRead} style={styles.primaryBtn}>Mark all read</button>
            )}
          </div>
        </div>
      </div>

      {error && <p style={styles.errorBox}>{error}</p>}

      {!authed ? (
        <div style={styles.card}>
          <p style={styles.muted}>Notifications track community interactions like incoming friend requests (someone favorited you in CommunityHub) and new mutual friendships. Sign in to view them.</p>
        </div>
      ) : loading ? (
        <p style={styles.muted}>Loading…</p>
      ) : notifications.length === 0 ? (
        <div style={styles.card}>
          <p style={styles.muted}>You're all caught up. When someone favorites your CommunityHub profile or you become mutual friends, you'll see it here.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {notifications.map(n => {
            const isUnread = new Date(n.created_at).getTime() > lastRead;
            return (
              <div
                key={n.id}
                style={{
                  ...styles.row,
                  borderLeft: `3px solid ${isUnread ? '#5ec850' : 'rgba(94,200,80,0.1)'}`,
                  background: isUnread ? 'rgba(94,200,80,0.06)' : 'rgba(94,200,80,0.02)',
                }}
              >
                <div style={styles.rowIcon}>
                  {n.kind === 'friend_added' ? '🤝' : '⭐'}
                </div>
                <div style={styles.rowBody}>
                  <strong style={styles.rowTitle}>
                    {n.kind === 'friend_added'
                      ? `You and ${n.from_island_name} are now friends`
                      : `${n.from_island_name} favorited your island`}
                  </strong>
                  <span style={styles.rowMeta}>
                    {n.from_hemisphere && <span>{n.from_hemisphere === 'north' ? '🌐 N' : '🌐 S'} · </span>}
                    {timeAgo(n.created_at)}
                  </span>
                </div>
                {isUnread && <span style={styles.unreadDot} title="Unread" />}
              </div>
            );
          })}
        </div>
      )}

      <p style={styles.helpText}>
        These notifications are derived from your CommunityHub favorites in real time — there's no separate notification table, so you can't lose history beyond the 50 most recent.
      </p>
    </div>
  );
}

// Helper exported for App.jsx unread-count polling.
export async function getUnreadCount() {
  try {
    const r = await fetch('/api/notifications');
    if (!r.ok) return 0;
    const d = await r.json();
    let lastRead = 0;
    try {
      const rr = await window.storage.get(READ_TIMESTAMP_KEY);
      if (rr) lastRead = parseInt(rr.value, 10) || 0;
    } catch { /* ignore */ }
    return (d.notifications || []).filter(n => new Date(n.created_at).getTime() > lastRead).length;
  } catch {
    return 0;
  }
}

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');`;

const styles = {
  root: {
    background: '#0a1a10', color: '#c8e6c0', fontFamily: "'DM Sans', sans-serif",
    minHeight: '100%', padding: 20,
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  header: { display: 'flex', flexDirection: 'column', gap: 6 },
  headerTop: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  title: { fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 32, color: '#5ec850', margin: 0 },
  subtitle: { color: '#5a7a50', fontSize: 14, margin: '4px 0 0 0' },

  card: {
    background: 'rgba(12,28,14,0.95)', border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 8, padding: 14,
  },

  list: { display: 'flex', flexDirection: 'column', gap: 6 },
  row: {
    display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 12,
    alignItems: 'center',
    padding: '10px 12px', borderRadius: 6,
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  },
  rowIcon: { fontSize: 22, textAlign: 'center' },
  rowBody: { display: 'flex', flexDirection: 'column', gap: 2 },
  rowTitle: { color: '#c8e6c0', fontSize: 14, fontWeight: 500 },
  rowMeta: { color: '#5a7a50', fontSize: 12, fontFamily: "'DM Mono', monospace" },
  unreadDot: {
    width: 10, height: 10, borderRadius: '50%', background: '#5ec850',
    boxShadow: '0 0 6px rgba(94,200,80,0.6)',
  },

  primaryBtn: {
    background: '#5ec850', color: '#0a1a10',
    border: '1px solid #5ec850', borderRadius: 6,
    padding: '8px 14px', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13,
    cursor: 'pointer', outline: 'none',
    transition: 'background-color 0.3s ease',
  },
  secondaryBtn: {
    background: 'transparent', color: '#c8e6c0',
    border: '1px solid rgba(94,200,80,0.3)', borderRadius: 6,
    padding: '8px 14px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 13,
    cursor: 'pointer', outline: 'none',
    transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
  },

  errorBox: {
    background: 'rgba(255,100,100,0.08)', border: '1px solid rgba(255,100,100,0.3)',
    borderRadius: 6, padding: 10, color: '#ff6464', fontSize: 13, margin: 0,
  },
  helpText: { color: '#5a7a50', fontSize: 12, margin: 0, lineHeight: 1.5 },
  muted: { color: '#5a7a50', fontSize: 13 },
};
