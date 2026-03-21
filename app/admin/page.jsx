'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const ADMIN_NAV = [
  { id: 'dashboard', label: 'Dashboard', emoji: '📊', href: '/admin' },
  { id: 'reports', label: 'Reports', emoji: '🚩', href: '/admin/reports' },
  { id: 'users', label: 'Users', emoji: '👥', href: '/admin/users' },
  { id: 'listings', label: 'Listings', emoji: '📋', href: '/admin/listings' },
  { id: 'audit', label: 'Audit Log', emoji: '📜', href: '/admin/audit' },
];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState(null);
  const [auditEntries, setAuditEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status !== 'authenticated') return;
    loadData();
  }, [status]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, auditRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/audit?limit=10'),
      ]);

      if (statsRes.status === 403) {
        setError('access_denied');
        setLoading(false);
        return;
      }

      if (!statsRes.ok) {
        setError('Failed to load dashboard');
        setLoading(false);
        return;
      }

      const statsData = await statsRes.json();
      const auditData = await auditRes.json();

      setStats(statsData);
      setAuditEntries(auditData.entries || []);
    } catch {
      setError('Failed to load dashboard');
    }
    setLoading(false);
  }

  if (status === 'loading') {
    return (
      <div style={styles.fullCenter}>
        <style>{fontImport}</style>
        <span style={{ fontSize: 48 }}>🛡️</span>
        <p style={{ color: '#d4b030', fontFamily: "'DM Sans', sans-serif", marginTop: 12 }}>Loading...</p>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div style={styles.fullCenter}>
        <style>{fontImport}</style>
        <span style={{ fontSize: 56 }}>🔒</span>
        <h2 style={styles.deniedTitle}>Access Denied</h2>
        <p style={styles.deniedText}>You must be signed in to access this page.</p>
        <a href="/app" style={styles.backLink}>Back to Portal</a>
      </div>
    );
  }

  if (error === 'access_denied') {
    return (
      <div style={styles.fullCenter}>
        <style>{fontImport}</style>
        <span style={{ fontSize: 56 }}>🔒</span>
        <h2 style={styles.deniedTitle}>Access Denied</h2>
        <p style={styles.deniedText}>You do not have admin privileges.</p>
        <a href="/app" style={styles.backLink}>Back to Portal</a>
      </div>
    );
  }

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, color: '#4aacf0' },
    { label: 'Active (7d)', value: stats.activeUsers, color: '#5ec850' },
    { label: 'Published Listings', value: stats.publishedListings, color: '#4aacf0' },
    { label: 'Pending Reports', value: stats.pendingReports, color: stats.pendingReports > 0 ? '#ff6464' : '#5a7a50' },
    { label: 'Banned Users', value: stats.bannedUsers, color: stats.bannedUsers > 0 ? '#ff6464' : '#5a7a50' },
  ] : [];

  return (
    <div style={styles.layout}>
      <style>{fontImport}</style>

      {/* Sidebar */}
      <nav style={styles.sidebar}>
        <a href="/app" style={styles.backToPortal}>← Back to Portal</a>
        <div style={styles.sidebarTitle}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <span style={styles.sidebarTitleText}>Admin Panel</span>
        </div>
        {ADMIN_NAV.map(item => (
          <a
            key={item.id}
            href={item.href}
            style={{
              ...styles.navItem,
              borderLeft: item.id === 'dashboard' ? '3px solid #d4b030' : '3px solid transparent',
              background: item.id === 'dashboard' ? 'rgba(212,176,48,0.1)' : 'transparent',
            }}
          >
            <span>{item.emoji}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      {/* Main content */}
      <main style={styles.main}>
        <h1 style={styles.pageTitle}>Dashboard</h1>

        {loading ? (
          <p style={{ color: '#5a7a50', fontFamily: "'DM Sans', sans-serif" }}>Loading stats...</p>
        ) : error ? (
          <p style={{ color: '#ff6464', fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
        ) : (
          <>
            {/* Stats cards */}
            <div style={styles.statsGrid}>
              {statCards.map(card => (
                <div key={card.label} style={styles.statCard}>
                  <div style={{ ...styles.statValue, color: card.color }}>{card.value}</div>
                  <div style={styles.statLabel}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div style={styles.quickLinksRow}>
              {stats.pendingReports > 0 && (
                <a href="/admin/reports" style={styles.quickLink}>
                  🚩 Review {stats.pendingReports} pending report{stats.pendingReports !== 1 ? 's' : ''}
                </a>
              )}
              <a href="/admin/users" style={styles.quickLinkNeutral}>👥 Manage Users</a>
              <a href="/admin/listings" style={styles.quickLinkNeutral}>📋 View Listings</a>
              <a href="/admin/audit" style={styles.quickLinkNeutral}>📜 Audit Log</a>
            </div>

            {/* Recent activity */}
            <h2 style={styles.sectionTitle}>Recent Activity</h2>
            {auditEntries.length === 0 ? (
              <p style={{ color: '#5a7a50', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                No admin actions recorded yet.
              </p>
            ) : (
              <div style={styles.activityList}>
                {auditEntries.map(entry => (
                  <div key={entry.id} style={styles.activityItem}>
                    <div style={styles.activityAction}>{formatAction(entry.action)}</div>
                    <div style={styles.activityMeta}>
                      <span>{entry.admin_email}</span>
                      <span style={styles.activityDot}>·</span>
                      <span>{formatDate(entry.created_at)}</span>
                      {entry.target_user_id && (
                        <>
                          <span style={styles.activityDot}>·</span>
                          <span>Target: {entry.target_user_id.substring(0, 12)}...</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function formatAction(action) {
  const map = {
    ban_user: '🔨 Banned User',
    unban_user: '✅ Unbanned User',
    warn_user: '⚠️ Warned User',
    remove_listing: '🗑️ Removed Listing',
    dismiss_report: '❌ Dismissed Report',
    add_admin: '🛡️ Added Admin',
    remove_admin: '🛡️ Removed Admin',
  };
  return map[action] || action;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
  deniedText: {
    fontSize: 16,
    color: '#5a7a50',
    fontFamily: "'DM Sans', sans-serif",
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 16,
    marginBottom: 24,
    width: '100%',
  },
  statCard: {
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(212,176,48,0.2)',
    borderRadius: 12,
    padding: '20px 16px',
    textAlign: 'center',
  },
  statValue: {
    fontSize: 36,
    fontWeight: 700,
    fontFamily: "'DM Mono', monospace",
  },
  statLabel: {
    fontSize: 13,
    color: '#5a7a50',
    marginTop: 4,
    fontFamily: "'DM Sans', sans-serif",
  },
  quickLinksRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  quickLink: {
    padding: '10px 20px',
    background: 'rgba(255,100,100,0.1)',
    border: '1px solid rgba(255,100,100,0.3)',
    borderRadius: 8,
    color: '#ff6464',
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
    fontFamily: "'DM Sans', sans-serif",
  },
  quickLinkNeutral: {
    padding: '10px 20px',
    background: 'rgba(74,172,240,0.08)',
    border: '1px solid rgba(74,172,240,0.2)',
    borderRadius: 8,
    color: '#4aacf0',
    fontSize: 14,
    fontWeight: 500,
    textDecoration: 'none',
    fontFamily: "'DM Sans', sans-serif",
  },
  sectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 20,
    fontWeight: 700,
    color: '#d4b030',
    marginBottom: 12,
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    width: '100%',
  },
  activityItem: {
    padding: '12px 16px',
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 8,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 4,
  },
  activityMeta: {
    fontSize: 12,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  activityDot: {
    color: '#3a5a40',
  },
};
