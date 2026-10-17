import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ExternalLink,
  LogOut,
  Layers,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 90
          }}
          onClick={onClose}
          className="admin-sidebar-backdrop"
        />
      )}

      <aside
        style={{
          width: '260px',
          backgroundColor: '#18181B',
          color: '#A1A1AA',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 95,
          transition: 'transform var(--transition-normal)'
        }}
        className={`admin-sidebar ${isOpen ? 'open' : ''}`}
      >
        {/* Sidebar Brand Header */}
        <div
          style={{
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <Link
            to="/admin"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              color: '#FFFFFF',
              textDecoration: 'none'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: 'var(--accent)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Layers size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: '700', letterSpacing: '0.04em', lineHeight: 1.1 }}>
                VERVE
              </div>
              <div style={{ fontSize: '0.625rem', color: '#71717A', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                ADMIN CONTROL
              </div>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="mobile-close-btn"
            style={{
              color: '#A1A1AA',
              padding: '4px',
              display: 'none',
              cursor: 'pointer'
            }}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <div style={{ flex: 1, padding: '1.25rem 1rem', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#71717A', fontWeight: '600', letterSpacing: '0.08em', padding: '0 0.75rem 0.5rem' }}>
            Catalog Operations
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.end}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.625rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? '#FFFFFF' : '#A1A1AA',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)'
                  })}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          <div style={{ marginTop: '2rem', fontSize: '0.6875rem', textTransform: 'uppercase', color: '#71717A', fontWeight: '600', letterSpacing: '0.08em', padding: '0 0.75rem 0.5rem' }}>
            External Views
          </div>
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              color: '#A1A1AA',
              textDecoration: 'none'
            }}
          >
            <ExternalLink size={18} />
            <span>Storefront Live</span>
          </Link>
        </div>

        {/* User Account / Footer */}
        <div
          style={{
            padding: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Administrator'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#71717A' }}>
                {user?.email || 'admin@verveatelier.com'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                color: '#A1A1AA',
                padding: '0.35rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 899px) {
          .admin-sidebar {
            position: fixed !important;
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .mobile-close-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </>
  );
}
