import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency, getDiscountPercentage } from '../../utils/formatters';
import { StockBadge } from '../common/Badge';
import ImageWithFallback from '../common/ImageWithFallback';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const discount = getDiscountPercentage(product.price, product.compareAtPrice);
  const isOutOfStock = product.stock <= 0;

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
        height: '100%'
      }}
    >
      {/* Top Image & Floating Badges */}
      <div
        style={{
          position: 'relative',
          paddingTop: '100%', // 1:1 Aspect Ratio
          backgroundColor: '#F3EFEA',
          overflow: 'hidden'
        }}
      >
        <Link
          to={`/products/${product.slug || product._id}`}
          style={{ position: 'absolute', inset: 0, display: 'block' }}
        >
          <ImageWithFallback
            src={product.images && product.images[0]}
            alt={product.name}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 400ms ease'
            }}
            className="product-card-image"
          />
        </Link>

        {/* Floating Top Badges */}
        <div
          style={{
            position: 'absolute',
            top: '0.75rem',
            left: '0.75rem',
            right: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none'
          }}
        >
          <div>
            <StockBadge stock={product.stock} />
          </div>
          {discount && (
            <span
              className="badge"
              style={{
                backgroundColor: 'var(--text-main)',
                color: '#FFFFFF'
              }}
            >
              -{discount}%
            </span>
          )}
        </div>
      </div>

      {/* Card Details */}
      <div
        style={{
          padding: '1.125rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.25rem'
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontWeight: '600'
              }}
            >
              {product.brand}
            </span>
            {product.category && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {product.category.name}
              </span>
            )}
          </div>

          <h4
            style={{
              fontSize: '0.9375rem',
              fontWeight: '600',
              lineHeight: 1.35,
              marginBottom: '0.5rem'
            }}
          >
            <Link
              to={`/products/${product.slug || product._id}`}
              style={{ color: 'var(--text-main)', transition: 'color var(--transition-fast)' }}
            >
              {product.name}
            </Link>
          </h4>

          {/* Pricing */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.0625rem', fontWeight: '700', color: 'var(--text-main)' }}>
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'line-through'
                }}
              >
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Card Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem' }}>
          <button
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
            onClick={() => addToCart(product, 1)}
            disabled={isOutOfStock}
          >
            <ShoppingBag size={14} />
            <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
          </button>
          <Link
            to={`/products/${product.slug || product._id}`}
            className="btn btn-outline btn-sm"
            style={{ padding: '0.375rem 0.5rem' }}
            title="View Details"
          >
            <Eye size={15} />
          </Link>
        </div>
      </div>

      <style>{`
        .card:hover .product-card-image {
          transform: scale(1.04);
        }
      `}</style>
    </div>
  );
}
