import React from 'react';
import { Menu, Database, ExternalLink, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminHeader({ title, subtitle, onToggleSidebar, onRefresh }) {
  return (
    <header
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-light)',
        padding: '1.25rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            display: 'none',
            padding: '0.4rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)',
            cursor: 'pointer'
          }}
          className="admin-header-menu-btn"
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Real MongoDB Connection Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.35rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--emerald-subtle)',
            color: 'var(--emerald-text)',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}
        >
          <Database size={13} />
          <span>MongoDB Live</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="btn btn-outline btn-sm"
            style={{ padding: '0.4rem 0.65rem' }}
            title="Refresh records"
          >
            <RefreshCw size={14} />
            <span style={{ fontSize: '0.75rem' }}>Sync</span>
          </button>
        )}

        <Link
          to="/"
          target="_blank"
          className="btn btn-outline btn-sm"
          style={{ padding: '0.4rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <span>Store</span>
          <ExternalLink size={13} />
        </Link>
      </div>

      <style>{`
        @media (max-width: 899px) {
          .admin-header-menu-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </header>
  );
}
