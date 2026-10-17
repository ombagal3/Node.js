import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowUpRight, Mail, MapPin, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#18181B',
        color: '#A1A1AA',
        paddingTop: '4.5rem',
        paddingBottom: '2.5rem',
        marginTop: '6rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="container">
        {/* Value Pillars */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2rem',
            paddingBottom: '3.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '3.5rem'
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                padding: '0.75rem',
                borderRadius: '8px',
                color: '#FFFFFF'
              }}
            >
              <Truck size={20} />
            </div>
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                Architectural White-Glove
              </h4>
              <p style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                Complimentary insured freight on orders exceeding $300 across North America.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                padding: '0.75rem',
                borderRadius: '8px',
                color: '#FFFFFF'
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                Ten-Year Structural Integrity
              </h4>
              <p style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                Every object is manufactured using sustainably harvested hardwood and solid alloys.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                padding: '0.75rem',
                borderRadius: '8px',
                color: '#FFFFFF'
              }}
            >
              <RefreshCw size={20} />
            </div>
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                30-Day In-Home Trial
              </h4>
              <p style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                Experience craftsmanship inside your living space with stress-free returns.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '3rem',
            paddingBottom: '3.5rem'
          }}
        >
          {/* Brand Info */}
          <div style={{ maxWidth: '320px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '4px',
                  backgroundColor: '#FFFFFF',
                  color: '#18181B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Layers size={16} />
              </div>
              <span style={{ color: '#FFFFFF', fontWeight: '700', letterSpacing: '0.06em', fontSize: '1rem' }}>
                VERVE ATELIER
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              An independent design studio and purveyor of architectural luminaires, sculptural furnishings, and tactile tabletop ceramics.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <MapPin size={14} color="var(--accent)" />
              <span>Copenhagen • Stockholm • New York</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h5 style={{ color: '#FFFFFF', fontSize: '0.875rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              Curated Catalog
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <li><Link to="/products?category=furniture-living" style={{ color: '#D4D4D8' }}>Furniture & Living</Link></li>
              <li><Link to="/products?category=architectural-lighting" style={{ color: '#D4D4D8' }}>Architectural Lighting</Link></li>
              <li><Link to="/products?category=ceramics-tableware" style={{ color: '#D4D4D8' }}>Ceramics & Tableware</Link></li>
              <li><Link to="/products?category=audio-studio" style={{ color: '#D4D4D8' }}>Audio & Studio</Link></li>
              <li><Link to="/products?category=apparel-objects" style={{ color: '#D4D4D8' }}>Apparel & Everyday Carry</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 style={{ color: '#FFFFFF', fontSize: '0.875rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              Client Services
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <li><Link to="/cart" style={{ color: '#D4D4D8' }}>Shopping Bag & Delivery</Link></li>
              <li><Link to="/products" style={{ color: '#D4D4D8' }}>Trade & Interior Accounts</Link></li>
              <li><Link to="/products" style={{ color: '#D4D4D8' }}>Care & Material Guides</Link></li>
              <li><Link to="/admin/login" style={{ color: '#D4D4D8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Staff Portal <ArrowUpRight size={12} /></Link></li>
            </ul>
          </div>

          {/* Newsletter / Inquiries */}
          <div>
            <h5 style={{ color: '#FFFFFF', fontSize: '0.875rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              Studio Journal
            </h5>
            <p style={{ fontSize: '0.8125rem', lineHeight: 1.5, marginBottom: '1rem' }}>
              Receive quarterly exhibition catalogs, limited atelier editions, and designer dialogues.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                placeholder="studio@atelier.com"
                aria-label="Email Address"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  borderRadius: '4px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  outline: 'none',
                  flex: 1
                }}
              />
              <button
                type="button"
                className="btn btn-accent btn-sm"
                onClick={() => alert('Thank you for subscribing to the Verve Atelier journal.')}
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.75rem'
          }}
        >
          <p>© {new Date().getFullYear()} Verve Atelier Inc. All rights reserved. Built with React & Node.js.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Ethical Material Sourcing</span>
            <span>Carbon Neutral Shipping</span>
            <span>Security & Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
