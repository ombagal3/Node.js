import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { productService } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { formatCurrency, getDiscountPercentage } from '../../utils/formatters';
import { StockBadge } from '../../components/common/Badge';
import ProductCard from '../../components/storefront/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ImageWithFallback from '../../components/common/ImageWithFallback';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);
        setSelectedImageIndex(0);
        setQuantity(1);

        const res = await productService.getProductById(id);
        if (res.success && res.data) {
          setProduct(res.data);
          setRelatedProducts(res.relatedProducts || []);
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
        setError('The requested product object could not be found or has been retired.');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Retrieving product specifications..." />;
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <AlertTriangle size={48} color="var(--amber)" style={{ margin: '0 auto 1.5rem' }} />
          <h2 className="font-serif" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
            Product Unavailable
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
            {error || 'This object is no longer part of our active catalog.'}
          </p>
          <Link to="/products" className="btn btn-primary">
            <ArrowLeft size={16} />
            <span>Return to Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  const discount = getDiscountPercentage(product.price, product.compareAtPrice);
  const isOutOfStock = product.stock <= 0;
  const images = product.images && product.images.length > 0 ? product.images : [];

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  return (
    <div style={{ padding: '2rem 0 5rem' }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            marginBottom: '2rem'
          }}
        >
          <Link to="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
          <ChevronRight size={14} />
          <Link to="/products" style={{ color: 'var(--text-secondary)' }}>Objects</Link>
          {product.category && (
            <>
              <ChevronRight size={14} />
              <Link to={`/products?category=${product.category.slug}`} style={{ color: 'var(--text-secondary)' }}>
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={14} />
          <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{product.name}</span>
        </nav>

        {/* Product Details Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            alignItems: 'start',
            marginBottom: '6rem'
          }}
        >
          {/* Left Column: Image Gallery */}
          <div>
            {/* Primary Main Image */}
            <div
              style={{
                position: 'relative',
                aspectRatio: '1 / 1',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border-light)',
                marginBottom: '1rem'
              }}
            >
              <ImageWithFallback
                src={images[selectedImageIndex] || images[0]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {discount && (
                <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                  <span className="badge badge-accent">-{discount}% OFF</span>
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {images.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: selectedImageIndex === index ? '2px solid var(--text-main)' : '1px solid var(--border-light)',
                      padding: 0,
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    <ImageWithFallback
                      src={imgUrl}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Specs & Purchase Controls */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {product.brand}
              </span>
              <StockBadge stock={product.stock} />
            </div>

            <h1 className="font-serif" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', lineHeight: 1.2, marginBottom: '0.75rem' }}>
              {product.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <span>SKU: <strong style={{ color: 'var(--text-main)' }}>{product.SKU}</strong></span>
              <span>•</span>
              <span>Category: <strong style={{ color: 'var(--text-main)' }}>{product.category?.name || 'Uncategorized'}</strong></span>
            </div>

            {/* Pricing Section */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '1rem',
                padding: '1.25rem 0',
                borderTop: '1px solid var(--border-light)',
                borderBottom: '1px solid var(--border-light)',
                marginBottom: '1.75rem'
              }}
            >
              <span style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-main)' }}>
                {formatCurrency(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span style={{ fontSize: '1.125rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
              {discount && (
                <span style={{ fontSize: '0.875rem', color: 'var(--crimson)', fontWeight: '600' }}>
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Description */}
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
              {product.description}
            </p>

            {/* Quantity Selector & Add to Bag */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Quantity:</span>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1 || isOutOfStock}
                    style={{
                      padding: '0.5rem 0.875rem',
                      cursor: quantity <= 1 || isOutOfStock ? 'not-allowed' : 'pointer',
                      color: 'var(--text-secondary)'
                    }}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ padding: '0 1rem', fontSize: '0.9375rem', fontWeight: '600', minWidth: '40px', textAlign: 'center' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    disabled={quantity >= product.stock || isOutOfStock}
                    style={{
                      padding: '0.5rem 0.875rem',
                      cursor: quantity >= product.stock || isOutOfStock ? 'not-allowed' : 'pointer',
                      color: 'var(--text-secondary)'
                    }}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {product.stock > 0 && product.stock <= 5 && (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--amber-text)' }}>
                    Only {product.stock} units remaining in inventory
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1 }}
                  onClick={() => addToCart(product, quantity)}
                  disabled={isOutOfStock}
                >
                  <ShoppingBag size={18} />
                  <span>{isOutOfStock ? 'Currently Out of Stock' : `Add to Bag • ${formatCurrency(product.price * quantity)}`}</span>
                </button>
              </div>
            </div>

            {/* Atelier Guarantees */}
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem' }}>
                <Truck size={16} color="var(--accent)" />
                <span>Complimentary white-glove transport on orders over $300</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem' }}>
                <ShieldCheck size={16} color="var(--emerald-text)" />
                <span>Ten-year structural craftsmanship guarantee</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem' }}>
                <RotateCcw size={16} color="var(--text-muted)" />
                <span>30-day in-home trial with insured returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section style={{ borderTop: '1px solid var(--border-light)', paddingTop: '4rem' }}>
            <div style={{ marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
                Harmonious Pairings
              </span>
              <h3 className="font-serif" style={{ fontSize: '1.875rem', marginTop: '0.25rem' }}>
                Related Objects in {product.category?.name}
              </h3>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.75rem'
              }}
            >
              {relatedProducts.map((relProd) => (
                <ProductCard key={relProd._id} product={relProd} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
