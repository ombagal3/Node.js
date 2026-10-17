import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  X,
  Menu,
  Shield,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItemsCount, openCart } = useCart();
  const { user, isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const navCategories = [
    { name: 'All Objects', path: '/products' },
    { name: 'Furniture', path: '/products?category=furniture-living' },
    { name: 'Lighting', path: '/products?category=architectural-lighting' },
    { name: 'Ceramics', path: '/products?category=ceramics-tableware' },
    { name: 'Audio', path: '/products?category=audio-studio' },
    { name: 'Apparel', path: '/products?category=apparel-objects' }
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(250, 248, 245, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-light)'
      }}
    >
      {/* Top Banner */}
      <div
        style={{
          backgroundColor: '#18181B',
          color: '#FFFFFF',
          fontSize: '0.75rem',
          fontWeight: '500',
          padding: '0.4rem 1rem',
          textAlign: 'center',
          letterSpacing: '0.04em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
      >
        <span>Complimentary architectural white-glove delivery on orders over $300</span>
        <span style={{ opacity: 0.4 }}>•</span>
        <Link
          to="/products"
          style={{ textDecoration: 'underline', color: '#F3EFEA', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
        >
          Explore Catalog <ArrowRight size={12} />
        </Link>
      </div>

      {/* Main Nav */}
      <div className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '72px',
            gap: '1.5rem'
          }}
        >
          {/* Brand Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              color: 'var(--text-main)',
              textDecoration: 'none'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: 'var(--text-main)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Layers size={18} strokeWidth={2.2} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: '700',
                  fontSize: '1.125rem',
                  letterSpacing: '0.08em',
                  lineHeight: 1
                }}
              >
                VERVE
              </span>
              <span
                style={{
                  fontSize: '0.625rem',
                  letterSpacing: '0.22em',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginTop: '2px'
                }}
              >
                ATELIER
              </span>
            </div>
          </Link>

          {/* Desktop Category Navigation */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '1.75rem'
            }}
            className="desktop-nav"
          >
            {navCategories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: location.search.includes(cat.path.split('?')[1] || 'never')
                    ? 'var(--accent)'
                    : 'var(--text-secondary)',
                  letterSpacing: '0.01em',
                  transition: 'color var(--transition-fast)'
                }}
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions: Search, Admin, Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Search Bar / Toggle */}
            <form
              onSubmit={handleSearchSubmit}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.35rem 0.75rem',
                  width: isSearchOpen ? '260px' : '200px',
                  transition: 'width var(--transition-normal)'
                }}
                className="search-box-wrapper"
              >
                <Search size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search objects, SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  onBlur={() => !searchQuery && setIsSearchOpen(false)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.8125rem',
                    padding: '0 0.5rem',
                    width: '100%',
                    background: 'transparent'
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{ padding: '0 2px', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </form>

            {/* Admin Link / Badge */}
            <Link
              to={isAdmin ? '/admin' : '/admin/login'}
              className="btn btn-outline btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.45rem 0.75rem'
              }}
              title="Admin Portal"
            >
              <Shield size={14} color={isAdmin ? 'var(--emerald-text)' : 'inherit'} />
              <span style={{ fontSize: '0.8125rem' }}>{isAdmin ? 'Dashboard' : 'Admin'}</span>
            </Link>

            {/* Shopping Cart Button */}
            <button
              onClick={openCart}
              className="btn btn-primary btn-sm"
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.875rem'
              }}
              aria-label="View shopping bag"
            >
              <ShoppingBag size={16} />
              <span style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Bag</span>
              {totalItemsCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#FFFFFF',
                    fontSize: '0.6875rem',
                    fontWeight: '700',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '2px'
                  }}
                >
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                display: 'none',
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)'
              }}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div
            style={{
              padding: '1rem 0 1.5rem',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            {navCategories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  padding: '0.5rem 0',
                  color: 'var(--text-main)',
                  borderBottom: '1px solid var(--border-subtle)'
                }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav {
            display: flex !important;
          }
        }
        @media (max-width: 899px) {
          .mobile-menu-btn {
            display: inline-flex !important;
          }
          .search-box-wrapper {
            width: 140px !important;
          }
        }
      `}</style>
    </header>
  );
}
