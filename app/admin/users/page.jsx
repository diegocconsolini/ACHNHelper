'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export default function AdminUsers() {
  const { data: session, status: authStatus } = useSession();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ search, filter, page: String(page), limit: '20' });
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.status === 403) {
        setError('access_denied');
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError('Failed to load users');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      setError('Failed to load users');
    }
    setLoading(false);
  }, [search, filter, page]);

  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    loadUsers();
  }, [authStatus, loadUsers]);

  async function loadUserDetail(userId) {
    setDetailLoading(true);
    setSelectedUser(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (res.ok) {
        setDetailData(await res.json());
      }
    } catch {
      // ignore
    }
    setDetailLoading(false);
  }

  async function handleBanUnban(userId, action, reason) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      if (res.ok) {
        await loadUsers();
        if (selectedUser === userId) {
          await loadUserDetail(userId);
        }
      }
    } catch {
      // ignore
    }
    setActionLoading(false);
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
              borderLeft: item.id === 'users' ? '3px solid #d4b030' : '3px solid transparent',
              background: item.id === 'users' ? 'rgba(212,176,48,0.1)' : 'transparent',
            }}
          >
            <span>{item.emoji}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <main style={styles.main}>
        <h1 style={styles.pageTitle}>User Management</h1>

        {/* Search and filter */}
        <div style={styles.controls}>
          <input
            type="text"
            placeholder="Search by island name..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={styles.searchInput}
          />
          <div style={styles.filterGroup}>
            {['all', 'active', 'banned'].map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                style={{
                  ...styles.filterBtn,
                  background: filter === f ? 'rgba(212,176,48,0.15)' : 'transparent',
                  color: filter === f ? '#d4b030' : '#5a7a50',
                  borderColor: filter === f ? 'rgba(212,176,48,0.3)' : 'rgba(94,200,80,0.1)',
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <span style={styles.totalCount}>{total} users</span>
        </div>

        <div style={styles.contentRow}>
          {/* Users table */}
          <div style={styles.tableContainer}>
            {loading ? (
              <p style={{ color: '#5a7a50', padding: 20 }}>Loading users...</p>
            ) : users.length === 0 ? (
              <p style={{ color: '#5a7a50', padding: 20 }}>No users found.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Island</th>
                    <th style={styles.th}>Hemisphere</th>
                    <th style={styles.th}>Fruit</th>
                    <th style={styles.th}>Rating</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Joined</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr
                      key={user.user_id}
                      style={{
                        ...styles.tr,
                        background: selectedUser === user.user_id ? 'rgba(212,176,48,0.08)' : 'transparent',
                      }}
                    >
                      <td style={styles.td}>
                        <button
                          onClick={() => loadUserDetail(user.user_id)}
                          style={styles.islandLink}
                        >
                          {user.island_name || 'Unnamed'}
                        </button>
                      </td>
                      <td style={styles.td}>{user.hemisphere || '-'}</td>
                      <td style={styles.td}>{user.native_fruit || '-'}</td>
                      <td style={styles.td}>{user.island_rating ? `${user.island_rating}★` : '-'}</td>
                      <td style={styles.td}>
                        {user.is_banned ? (
                          <span style={styles.bannedBadge}>BANNED</span>
                        ) : (
                          <span style={styles.activeBadge}>Active</span>
                        )}
                      </td>
                      <td style={styles.td}>{formatDate(user.created_at)}</td>
                      <td style={styles.td}>
                        {user.is_banned ? (
                          <button
                            onClick={() => handleBanUnban(user.user_id, 'unban')}
                            disabled={actionLoading}
                            style={styles.unbanBtn}
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const reason = prompt('Ban reason:');
                              if (reason !== null) handleBanUnban(user.user_id, 'ban', reason);
                            }}
                            disabled={actionLoading}
                            style={styles.banBtnSmall}
                          >
                            Ban
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination */}
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
          </div>

          {/* Detail panel */}
          {selectedUser && (
            <div style={styles.detailPanel}>
              <div style={styles.detailHeader}>
                <h3 style={styles.detailTitle}>User Detail</h3>
                <button onClick={() => { setSelectedUser(null); setDetailData(null); }} style={styles.closeBtn}>✕</button>
              </div>
              {detailLoading ? (
                <p style={{ color: '#5a7a50', fontSize: 13 }}>Loading...</p>
              ) : detailData ? (
                <div style={styles.detailContent}>
                  <DetailRow label="User ID" value={detailData.profile.user_id} />
                  <DetailRow label="Island" value={detailData.profile.island_name || 'Unnamed'} />
                  <DetailRow label="Hemisphere" value={detailData.profile.hemisphere || '-'} />
                  <DetailRow label="Fruit" value={detailData.profile.native_fruit || '-'} />
                  <DetailRow label="Flower" value={detailData.profile.native_flower || '-'} />
                  <DetailRow label="Rating" value={detailData.profile.island_rating ? `${detailData.profile.island_rating}★` : '-'} />
                  <DetailRow label="Friend Code" value={detailData.profile.friend_code || '-'} />
                  <DetailRow label="Dream Address" value={detailData.profile.dream_address || '-'} />
                  <DetailRow label="Reports" value={String(detailData.reportsCount)} />
                  <DetailRow label="Favorites" value={String(detailData.favoritesCount)} />
                  <DetailRow label="Listing" value={detailData.sharedProfile?.is_published ? 'Published' : 'Not published'} />

                  {detailData.profile.is_banned && (
                    <div style={styles.banInfo}>
                      <div style={styles.banInfoTitle}>Ban Info</div>
                      <DetailRow label="Reason" value={detailData.profile.ban_reason || '-'} />
                      <DetailRow label="Banned at" value={formatDate(detailData.profile.banned_at)} />
                      <DetailRow label="Banned by" value={detailData.profile.banned_by || '-'} />
                    </div>
                  )}

                  <div style={styles.detailActions}>
                    {detailData.profile.is_banned ? (
                      <button
                        onClick={() => handleBanUnban(selectedUser, 'unban')}
                        disabled={actionLoading}
                        style={styles.unbanBtnLarge}
                      >
                        Unban User
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const reason = prompt('Ban reason:');
                          if (reason !== null) handleBanUnban(selectedUser, 'ban', reason);
                        }}
                        disabled={actionLoading}
                        style={styles.banBtnLarge}
                      >
                        Ban User
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={styles.detailRow}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={styles.detailValue}>{value}</span>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
  pageTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28,
    fontWeight: 900,
    color: '#d4b030',
    marginBottom: 24,
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
    width: '100%',
  },
  searchInput: {
    flex: 1,
    minWidth: 200,
    padding: '10px 14px',
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.2)',
    borderRadius: 8,
    color: '#c8e6c0',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
  },
  filterGroup: {
    display: 'flex',
    gap: 4,
  },
  filterBtn: {
    padding: '8px 14px',
    border: '1px solid',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    background: 'transparent',
    transition: 'background-color 0.15s ease, color 0.15s ease',
  },
  totalCount: {
    fontSize: 12,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
  },
  contentRow: {
    display: 'flex',
    gap: 20,
    width: '100%',
  },
  tableContainer: {
    flex: 1,
    overflowX: 'auto',
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
  islandLink: {
    background: 'none',
    border: 'none',
    color: '#4aacf0',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    padding: 0,
    textAlign: 'left',
  },
  bannedBadge: {
    background: 'rgba(255,100,100,0.2)',
    color: '#ff6464',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
    fontFamily: "'DM Mono', monospace",
  },
  activeBadge: {
    background: 'rgba(94,200,80,0.15)',
    color: '#5ec850',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
    fontFamily: "'DM Mono', monospace",
  },
  banBtnSmall: {
    padding: '4px 10px',
    background: 'rgba(255,100,100,0.1)',
    border: '1px solid rgba(255,100,100,0.25)',
    borderRadius: 5,
    color: '#ff6464',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background-color 0.15s ease',
  },
  unbanBtn: {
    padding: '4px 10px',
    background: 'rgba(94,200,80,0.1)',
    border: '1px solid rgba(94,200,80,0.25)',
    borderRadius: 5,
    color: '#5ec850',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background-color 0.15s ease',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
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
  detailPanel: {
    width: 320,
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(212,176,48,0.2)',
    borderRadius: 10,
    padding: 16,
    flexShrink: 0,
    alignSelf: 'flex-start',
    position: 'sticky',
    top: 32,
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '1px solid rgba(212,176,48,0.15)',
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#d4b030',
    fontFamily: "'Playfair Display', serif",
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#5a7a50',
    fontSize: 16,
    cursor: 'pointer',
    outline: 'none',
    padding: '2px 6px',
  },
  detailContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    padding: '4px 0',
  },
  detailLabel: {
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
  },
  detailValue: {
    color: '#c8e6c0',
    textAlign: 'right',
    wordBreak: 'break-all',
    maxWidth: 180,
  },
  banInfo: {
    marginTop: 8,
    padding: '10px 12px',
    background: 'rgba(255,100,100,0.06)',
    border: '1px solid rgba(255,100,100,0.15)',
    borderRadius: 6,
  },
  banInfoTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#ff6464',
    marginBottom: 6,
    fontFamily: "'DM Mono', monospace",
  },
  detailActions: {
    marginTop: 12,
    paddingTop: 10,
    borderTop: '1px solid rgba(94,200,80,0.1)',
  },
  banBtnLarge: {
    width: '100%',
    padding: '10px 16px',
    background: 'rgba(255,100,100,0.12)',
    border: '1px solid rgba(255,100,100,0.3)',
    borderRadius: 8,
    color: '#ff6464',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background-color 0.15s ease',
  },
  unbanBtnLarge: {
    width: '100%',
    padding: '10px 16px',
    background: 'rgba(94,200,80,0.12)',
    border: '1px solid rgba(94,200,80,0.3)',
    borderRadius: 8,
    color: '#5ec850',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background-color 0.15s ease',
  },
};
