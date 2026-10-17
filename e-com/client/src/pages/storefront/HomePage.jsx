import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Compass,
  ArrowUpRight,
  Package,
  Layers,
  ChevronRight
} from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import ProductCard from '../../components/storefront/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ImageWithFallback from '../../components/common/ImageWithFallback';

export default function HomePage() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [featuredRes, latestRes, catRes] = await Promise.all([
          productService.getProducts({ featured: 'true', limit: 4 }),
          productService.getProducts({ limit: 4, sort: 'newest' }),
          categoryService.getCategories()
        ]);

        if (featuredRes.success) setFeaturedProducts(featuredRes.data);
        if (latestRes.success) setLatestProducts(latestRes.data);
        if (catRes.success) setCategories(catRes.data);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
        setError('Unable to load catalog from server. Please check your backend connection.');
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  return (
    <div>
      {/* 1. Hero Section */}
      <section
        style={{
          position: 'relative',
          backgroundColor: '#FAF8F5',
          paddingTop: '3.5rem',
          paddingBottom: '5rem',
          borderBottom: '1px solid var(--border-light)',
          overflow: 'hidden'
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3.5rem',
              alignItems: 'center'
            }}
          >
            {/* Left Column: Editorial Headline & Copy */}
            <div style={{ maxWidth: '580px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-light)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  color: 'var(--accent)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '1.5rem'
                }}
              >
                <Sparkles size={14} />
                <span>Autumn / Winter Architectural Collection</span>
              </div>

              <h1
                className="font-serif"
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                  lineHeight: 1.12,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-main)',
                  marginBottom: '1.25rem',
                  fontWeight: '500'
                }}
              >
                Objects calibrated for quiet contemplation.
              </h1>

              <p
                style={{
                  fontSize: '1.125rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '2rem'
                }}
              >
                Handcrafted solid wood seating, mouth-blown opal glass luminaires, and raw volcanic stoneware created in close dialogue with independent European artisans.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <Link to="/products" className="btn btn-primary btn-lg">
                  <span>Explore All Objects</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/products?category=furniture-living" className="btn btn-outline btn-lg">
                  <span>View Living Space</span>
                </Link>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2rem',
                  marginTop: '3rem',
                  paddingTop: '2rem',
                  borderTop: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    20+
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Artisan Artifacts
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    100%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Authentic Materials
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    10-Yr
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Structural Guarantee
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-xl)',
                  position: 'relative',
                  aspectRatio: '4 / 5',
                  backgroundColor: 'var(--bg-subtle)'
                }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80"
                  alt="Architectural living room with green sofa and minimal coffee table"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '1.5rem',
                    left: '1.5rem',
                    right: '1.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.94)',
                    backdropFilter: 'blur(8px)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: '600' }}>
                      Featured Focus
                    </span>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '2px' }}>
                      Koto Curved Lounge Chair
                    </h4>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Solid Ash & Tactile Bouclé Wool
                    </span>
                  </div>
                  <Link
                    to="/products?search=Koto"
                    className="btn btn-primary btn-sm"
                    style={{ flexShrink: 0 }}
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Categories Section */}
      <section style={{ padding: '5rem 0', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '2.5rem',
              gap: '1rem'
            }}
          >
            <div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
                Curated Disciplines
              </span>
              <h2 className="font-serif" style={{ fontSize: '2.25rem', marginTop: '0.25rem' }}>
                Shop by Architectural Category
              </h2>
            </div>
            <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.875rem' }}>
              <span>View full directory</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat.slug}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-light)',
                  transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)'
                }}
                className="category-card"
              >
                <div style={{ position: 'relative', paddingTop: '75%', overflow: 'hidden' }}>
                  <ImageWithFallback
                    src={cat.image}
                    alt={cat.name}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 400ms ease'
                    }}
                    className="category-image"
                  />
                </div>
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                      {cat.name}
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {cat.description}
                    </p>
                  </div>
                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent)' }}>
                    <span>{cat.productCount || 0} Objects in Collection</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Objects Grid */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-canvas)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '2.5rem',
              gap: '1rem'
            }}
          >
            <div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
                Curator's Selection
              </span>
              <h2 className="font-serif" style={{ fontSize: '2.25rem', marginTop: '0.25rem' }}>
                Featured Studio Objects
              </h2>
            </div>
            <Link to="/products" className="btn btn-outline btn-sm">
              Explore All Objects
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Fetching atelier catalog..." />
          ) : error ? (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
              <p style={{ color: 'var(--crimson)' }}>{error}</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.75rem'
              }}
            >
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Atelier Craftsmanship Manifesto / Philosophy */}
      <section
        style={{
          padding: '6rem 0',
          backgroundColor: '#18181B',
          color: '#FFFFFF',
          position: 'relative'
        }}
      >
        <div className="container">
          <div
            style={{
              maxWidth: '820px',
              margin: '0 auto',
              textAlign: 'center'
            }}
          >
            <span
              style={{
                color: 'var(--accent)',
                textTransform: 'uppercase',
                fontSize: '0.8125rem',
                letterSpacing: '0.2em',
                fontWeight: '600'
              }}
            >
              The Atelier Philosophy
            </span>
            <h2
              className="font-serif"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: '#FFFFFF',
                fontWeight: '400',
                lineHeight: 1.3,
                marginTop: '1rem',
                marginBottom: '1.75rem'
              }}
            >
              “True luxury is not an abundance of ornament, but the deliberate elimination of the unnecessary.”
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: '#A1A1AA',
                lineHeight: 1.7,
                marginBottom: '2.5rem'
              }}
            >
              In our Copenhagen and Stockholm workshops, we reject the ephemeral churn of mass manufacturing. Every credenza, luminaire, and stoneware tumbler is measured against longevity, tactile warmth, and environmental harmony.
            </p>
            <Link to="/products" className="btn btn-accent btn-lg">
              Explore Available Works
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Latest Arrivals Grid */}
      <section style={{ padding: '5rem 0', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border-light)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '2.5rem',
              gap: '1rem'
            }}
          >
            <div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
                Recent Releases
              </span>
              <h2 className="font-serif" style={{ fontSize: '2.25rem', marginTop: '0.25rem' }}>
                Latest Additions to the Catalog
              </h2>
            </div>
            <Link to="/products?sort=newest" className="btn btn-outline btn-sm">
              View All New
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.75rem'
            }}
          >
            {latestProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .category-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }
        .category-card:hover .category-image {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
