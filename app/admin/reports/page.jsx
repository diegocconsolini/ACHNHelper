'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

const STATUS_TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'all', label: 'All' },
  { id: 'dismissed', label: 'Dismissed' },
  { id: 'actioned', label: 'Actioned' },
];

export default function AdminReports() {
  const { data: session, status: authStatus } = useSession();
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reports?status=${activeTab}&page=${page}&limit=20`);
      if (res.status === 403) {
        setError('access_denied');
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError('Failed to load reports');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setReports(data.reports || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      setError('Failed to load reports');
    }
    setLoading(false);
  }, [activeTab, page]);

  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    loadReports();
  }, [authStatus, loadReports]);

  async function handleAction(reportId, action, reason) {
    setActionLoading(reportId);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      if (res.ok) {
        await loadReports();
      }
    } catch {
      // ignore
    }
    setActionLoading(null);
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
              borderLeft: item.id === 'reports' ? '3px solid #d4b030' : '3px solid transparent',
              background: item.id === 'reports' ? 'rgba(212,176,48,0.1)' : 'transparent',
            }}
          >
            <span>{item.emoji}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <main style={styles.main}>
        <h1 style={styles.pageTitle}>Reports Queue</h1>

        {/* Tabs */}
        <div style={styles.tabs}>
          {STATUS_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(1); }}
              style={{
                ...styles.tab,
                background: activeTab === tab.id ? 'rgba(212,176,48,0.15)' : 'transparent',
                borderBottom: activeTab === tab.id ? '2px solid #d4b030' : '2px solid transparent',
                color: activeTab === tab.id ? '#d4b030' : '#5a7a50',
              }}
            >
              {tab.label}
            </button>
          ))}
          <span style={styles.tabCount}>{total} total</span>
        </div>

        {loading ? (
          <p style={{ color: '#5a7a50', padding: 20 }}>Loading reports...</p>
        ) : error ? (
          <p style={{ color: '#ff6464', padding: 20 }}>{error}</p>
        ) : reports.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: 40 }}>✅</span>
            <p style={{ color: '#5a7a50', marginTop: 8 }}>No {activeTab === 'all' ? '' : activeTab} reports</p>
          </div>
        ) : (
          <div style={styles.reportsList}>
            {reports.map(report => (
              <ReportCard
                key={report.id}
                report={report}
                actionLoading={actionLoading}
                onAction={handleAction}
              />
            ))}
          </div>
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
      </main>
    </div>
  );
}

function ReportCard({ report, actionLoading, onAction }) {
  const isAppeal = report.reason === 'ban_appeal';
  const isLoading = actionLoading === report.id;
  const isPending = report.status === 'pending';

  return (
    <div style={{
      ...styles.reportCard,
      borderLeft: isAppeal ? '3px solid #d4b030' : '3px solid rgba(94,200,80,0.1)',
    }}>
      {/* Header */}
      <div style={styles.reportHeader}>
        <div style={styles.reportReason}>
          {isAppeal && <span style={styles.appealBadge}>BAN APPEAL</span>}
          <span style={styles.reasonText}>{report.reason}</span>
          <span style={styles.reportStatus(report.status)}>{report.status}</span>
        </div>
        <span style={styles.reportDate}>{formatDate(report.created_at)}</span>
      </div>

      {/* Users */}
      <div style={styles.reportUsers}>
        <div style={styles.reportUserBlock}>
          <span style={styles.reportUserLabel}>Reporter</span>
          <span style={styles.reportUserId}>
            {report.reporter?.island_name || report.reporter_user_id?.substring(0, 16) + '...'}
          </span>
        </div>
        <span style={{ color: '#5a7a50' }}>→</span>
        <div style={styles.reportUserBlock}>
          <span style={styles.reportUserLabel}>Reported</span>
          <span style={styles.reportUserId}>
            {report.reported?.island_name || report.reported_user_id?.substring(0, 16) + '...'}
            {report.reported?.is_banned && <span style={styles.bannedBadge}>BANNED</span>}
          </span>
        </div>
      </div>

      {/* Details */}
      {report.details && (
        <div style={styles.reportDetails}>{report.details}</div>
      )}

      {/* Screenshots from reported listing */}
      {report.reported_listing?.screenshots?.length > 0 && (
        <div style={styles.screenshotsRow}>
          {report.reported_listing.screenshots.map((url, i) => (
            <img key={i} src={url} alt={`Screenshot ${i + 1}`} style={styles.screenshot} />
          ))}
        </div>
      )}

      {/* Actions */}
      {isPending && (
        <div style={styles.reportActions}>
          <button
            onClick={() => onAction(report.id, 'dismiss')}
            disabled={isLoading}
            style={styles.dismissBtn}
          >
            Dismiss
          </button>
          <button
            onClick={() => onAction(report.id, 'warn')}
            disabled={isLoading}
            style={styles.warnBtn}
          >
            Warn
          </button>
          <button
            onClick={() => onAction(report.id, 'remove_listing')}
            disabled={isLoading}
            style={styles.removeBtn}
          >
            Remove Listing
          </button>
          <button
            onClick={() => {
              const reason = prompt('Ban reason:');
              if (reason !== null) onAction(report.id, 'ban', reason);
            }}
            disabled={isLoading}
            style={styles.banBtn}
          >
            Ban User
          </button>
        </div>
      )}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
  tabs: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
    borderBottom: '1px solid rgba(94,200,80,0.1)',
  },
  tab: {
    padding: '10px 16px',
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    transition: 'color 0.2s ease, border-color 0.2s ease',
  },
  tabCount: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  reportsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },
  reportCard: {
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 10,
    padding: 16,
  },
  reportHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reportReason: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  appealBadge: {
    background: 'rgba(212,176,48,0.2)',
    color: '#d4b030',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "'DM Mono', monospace",
  },
  reasonText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#c8e6c0',
    textTransform: 'capitalize',
  },
  reportStatus: (s) => ({
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 4,
    fontFamily: "'DM Mono', monospace",
    fontWeight: 500,
    background: s === 'pending' ? 'rgba(255,100,100,0.15)' : s === 'actioned' ? 'rgba(94,200,80,0.15)' : 'rgba(90,122,80,0.15)',
    color: s === 'pending' ? '#ff6464' : s === 'actioned' ? '#5ec850' : '#5a7a50',
  }),
  reportDate: {
    fontSize: 12,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
  },
  reportUsers: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  reportUserBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  reportUserLabel: {
    fontSize: 10,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
    textTransform: 'uppercase',
  },
  reportUserId: {
    fontSize: 13,
    color: '#c8e6c0',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  bannedBadge: {
    background: 'rgba(255,100,100,0.2)',
    color: '#ff6464',
    padding: '1px 6px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
    fontFamily: "'DM Mono', monospace",
  },
  reportDetails: {
    fontSize: 13,
    color: '#8aaa80',
    background: 'rgba(0,0,0,0.2)',
    padding: '8px 12px',
    borderRadius: 6,
    marginBottom: 10,
    lineHeight: 1.5,
  },
  screenshotsRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  screenshot: {
    width: 80,
    height: 80,
    objectFit: 'cover',
    borderRadius: 6,
    border: '1px solid rgba(94,200,80,0.15)',
  },
  reportActions: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 8,
    paddingTop: 10,
    borderTop: '1px solid rgba(94,200,80,0.08)',
  },
  dismissBtn: {
    padding: '6px 14px',
    background: 'rgba(90,122,80,0.15)',
    border: '1px solid rgba(90,122,80,0.3)',
    borderRadius: 6,
    color: '#5a7a50',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background-color 0.15s ease',
  },
  warnBtn: {
    padding: '6px 14px',
    background: 'rgba(212,176,48,0.12)',
    border: '1px solid rgba(212,176,48,0.3)',
    borderRadius: 6,
    color: '#d4b030',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background-color 0.15s ease',
  },
  removeBtn: {
    padding: '6px 14px',
    background: 'rgba(255,100,100,0.08)',
    border: '1px solid rgba(255,100,100,0.25)',
    borderRadius: 6,
    color: '#ff6464',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background-color 0.15s ease',
  },
  banBtn: {
    padding: '6px 14px',
    background: 'rgba(255,60,60,0.15)',
    border: '1px solid rgba(255,60,60,0.4)',
    borderRadius: 6,
    color: '#ff4444',
    fontSize: 13,
    fontWeight: 700,
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
