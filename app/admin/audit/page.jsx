'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

const ACTION_TYPES = [
  { id: '', label: 'All Actions' },
  { id: 'ban_user', label: 'Ban User' },
  { id: 'unban_user', label: 'Unban User' },
  { id: 'warn_user', label: 'Warn User' },
  { id: 'remove_listing', label: 'Remove Listing' },
  { id: 'dismiss_report', label: 'Dismiss Report' },
  { id: 'add_admin', label: 'Add Admin' },
  { id: 'remove_admin', label: 'Remove Admin' },
];

export default function AdminAudit() {
  const { data: session, status: authStatus } = useSession();
  const [entries, setEntries] = useState([]);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAudit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (actionFilter) params.set('action', actionFilter);

      const res = await fetch(`/api/admin/audit?${params}`);
      if (res.status === 403) {
        setError('access_denied');
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError('Failed to load audit log');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setEntries(data.entries || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      setError('Failed to load audit log');
    }
    setLoading(false);
  }, [actionFilter, page]);

  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    loadAudit();
  }, [authStatus, loadAudit]);

  function exportAsJson() {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-audit-log-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (authStatus === 'loading') {
    return (
      <div style={styles.fullCenter}>
        <style>{fontImport}</style>
        <p style={{ color: '#d4b030', fontFamily: "'DM Sans', sans-serif" }}>Loading...</p>
      </div>
    );
  }

  if (error === 'access_denied' || authStatus !== 'authenticated') {
    return (
      <div style={styles.fullCenter}>
        <style>{fontImport}</style>
        <span style={{ fontSize: 56 }}>🔒</span>
        <h2 style={styles.deniedTitle}>Access Denied</h2>
        <a href="/app" style={styles.backLink}>Back to Portal</a>
      </div>
    );
  }

  return (
    <div style={styles.layout}>
      <style>{fontImport}</style>

      <nav style={styles.sidebar}>
        <a href="/app" style={styles.backToPortal}>← Back to Portal</a>
        <div style={styles.sidebarTitle}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <span style={styles.sidebarTitleText}>Admin Panel</span>
        </div>
        {[
          { id: 'dashboard', label: 'Dashboard', emoji: '📊', href: '/admin' },
          { id: 'reports', label: 'Reports', emoji: '🚩', href: '/admin/reports' },
          { id: 'users', label: 'Users', emoji: '👥', href: '/admin/users' },
          { id: 'listings', label: 'Listings', emoji: '📋', href: '/admin/listings' },
          { id: 'audit', label: 'Audit Log', emoji: '📜', href: '/admin/audit' },
        ].map(item => (
          <a
            key={item.id}
            href={item.href}
            style={{
              ...styles.navItem,
              borderLeft: item.id === 'audit' ? '3px solid #d4b030' : '3px solid transparent',
              background: item.id === 'audit' ? 'rgba(212,176,48,0.1)' : 'transparent',
            }}
          >
            <span>{item.emoji}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <main style={styles.main}>
        <div style={styles.headerRow}>
          <h1 style={styles.pageTitle}>Audit Log</h1>
          <button onClick={exportAsJson} style={styles.exportBtn}>
            Export JSON
          </button>
        </div>

        {/* Filter */}
        <div style={styles.controls}>
          <select
            value={actionFilter}
            onChange={e => { setActionFilter(e.target.value); setPage(1); }}
            style={styles.selectFilter}
          >
            {ACTION_TYPES.map(a => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
          <span style={styles.totalCount}>{total} entries</span>
        </div>

        {loading ? (
          <p style={{ color: '#5a7a50', padding: 20 }}>Loading audit log...</p>
        ) : error ? (
          <p style={{ color: '#ff6464', padding: 20 }}>{error}</p>
        ) : entries.length === 0 ? (
          <p style={{ color: '#5a7a50', padding: 20 }}>No audit entries found.</p>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Timestamp</th>
                  <th style={styles.th}>Admin</th>
                  <th style={styles.th}>Action</th>
                  <th style={styles.th}>Target</th>
                  <th style={styles.th}>Details</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.timestamp}>{formatDate(entry.created_at)}</span>
                    </td>
                    <td style={styles.td}>{entry.admin_email}</td>
                    <td style={styles.td}>
                      <span style={styles.actionBadge(entry.action)}>
                        {formatAction(entry.action)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {entry.target_user_id ? (
                        <span style={styles.targetId}>{entry.target_user_id.substring(0, 16)}...</span>
                      ) : (
                        <span style={{ color: '#5a7a50' }}>-</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {entry.details ? (
                        <span style={styles.detailsText}>{JSON.stringify(entry.details)}</span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{ ...styles.pageBtn, opacity: page <= 1 ? 0.4 : 1 }}
            >
              ← Prev
            </button>
            <span style={styles.pageInfo}>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{ ...styles.pageBtn, opacity: page >= totalPages ? 0.4 : 1 }}
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function formatAction(action) {
  const map = {
    ban_user: 'Ban User',
    unban_user: 'Unban User',
    warn_user: 'Warn User',
    remove_listing: 'Remove Listing',
    dismiss_report: 'Dismiss Report',
    add_admin: 'Add Admin',
    remove_admin: 'Remove Admin',
  };
  return map[action] || action;
}

function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');`;

const styles = {
  fullCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#0a1a10',
    gap: 12,
  },
  deniedTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28,
    fontWeight: 700,
    color: '#d4b030',
  },
  backLink: {
    marginTop: 16,
    color: '#4aacf0',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    textDecoration: 'none',
  },
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0a1a10',
    fontFamily: "'DM Sans', sans-serif",
    color: '#c8e6c0',
  },
  sidebar: {
    width: 220,
    background: 'rgba(8,16,10,0.95)',
    borderRight: '1px solid rgba(94,200,80,0.1)',
    padding: '16px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    flexShrink: 0,
  },
  backToPortal: {
    padding: '8px 16px',
    color: '#5a7a50',
    fontSize: 12,
    fontFamily: "'DM Mono', monospace",
    textDecoration: 'none',
    display: 'block',
    marginBottom: 8,
  },
  sidebarTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px 16px',
    borderBottom: '1px solid rgba(212,176,48,0.2)',
    marginBottom: 8,
  },
  sidebarTitleText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 16,
    fontWeight: 900,
    color: '#d4b030',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 16px',
    color: '#c8e6c0',
    fontSize: 14,
    textDecoration: 'none',
    fontFamily: "'DM Sans', sans-serif",
  },
  main: {
    flex: 1,
    padding: 32,
    overflowY: 'auto',
    width: '100%',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  pageTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28,
    fontWeight: 900,
    color: '#d4b030',
  },
  exportBtn: {
    padding: '8px 16px',
    background: 'rgba(74,172,240,0.1)',
    border: '1px solid rgba(74,172,240,0.25)',
    borderRadius: 8,
    color: '#4aacf0',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background-color 0.15s ease',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    width: '100%',
  },
  selectFilter: {
    padding: '8px 12px',
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.2)',
    borderRadius: 6,
    color: '#c8e6c0',
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    cursor: 'pointer',
  },
  totalCount: {
    fontSize: 12,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
    marginLeft: 'auto',
  },
  tableWrap: {
    overflowX: 'auto',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: 11,
    fontWeight: 700,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
    textTransform: 'uppercase',
    borderBottom: '1px solid rgba(94,200,80,0.15)',
    whiteSpace: 'nowrap',
  },
  tr: {
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '10px 12px',
    fontSize: 13,
    borderBottom: '1px solid rgba(94,200,80,0.06)',
    fontFamily: "'DM Sans', sans-serif",
  },
  timestamp: {
    fontSize: 12,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
    whiteSpace: 'nowrap',
  },
  actionBadge: (action) => {
    const colors = {
      ban_user: { bg: 'rgba(255,100,100,0.15)', color: '#ff6464' },
      unban_user: { bg: 'rgba(94,200,80,0.15)', color: '#5ec850' },
      warn_user: { bg: 'rgba(212,176,48,0.15)', color: '#d4b030' },
      remove_listing: { bg: 'rgba(255,100,100,0.1)', color: '#ff6464' },
      dismiss_report: { bg: 'rgba(90,122,80,0.15)', color: '#5a7a50' },
      add_admin: { bg: 'rgba(212,176,48,0.15)', color: '#d4b030' },
      remove_admin: { bg: 'rgba(212,176,48,0.1)', color: '#d4b030' },
    };
    const c = colors[action] || { bg: 'rgba(90,122,80,0.1)', color: '#5a7a50' };
    return {
      padding: '3px 8px',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
      fontFamily: "'DM Mono', monospace",
      background: c.bg,
      color: c.color,
      whiteSpace: 'nowrap',
    };
  },
  targetId: {
    fontSize: 11,
    color: '#8aaa80',
    fontFamily: "'DM Mono', monospace",
  },
  detailsText: {
    fontSize: 11,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
    wordBreak: 'break-all',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
  },
  pageBtn: {
    padding: '8px 16px',
    background: 'rgba(74,172,240,0.1)',
    border: '1px solid rgba(74,172,240,0.2)',
    borderRadius: 6,
    color: '#4aacf0',
    fontSize: 13,
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background-color 0.15s ease',
  },
  pageInfo: {
    fontSize: 13,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
  },
};
