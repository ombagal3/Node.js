import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatters';
import ImageWithFallback from '../common/ImageWithFallback';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    cartItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    estimatedShipping,
    grandTotal
  } = useCart();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(24, 24, 27, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 200ms ease-out'
      }}
      onClick={closeCart}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          animation: 'slideInRight 250ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={20} color="var(--accent)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Your Bag</h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)
            </span>
          </div>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            style={{
              padding: '0.25rem',
              color: 'var(--text-muted)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {cartItems.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
                gap: '1rem'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)'
                }}
              >
                <ShoppingBag size={28} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.0625rem', marginBottom: '0.25rem' }}>Your bag is empty</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Discover handcrafted furniture and ambient lighting.
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  closeCart();
                  navigate('/products');
                }}
                style={{ marginTop: '0.5rem' }}
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {cartItems.map(({ product, quantity }) => (
                <div
                  key={product._id}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    paddingBottom: '1.25rem',
                    borderBottom: '1px solid var(--border-subtle)'
                  }}
                >
                  <div
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      backgroundColor: 'var(--bg-subtle)',
                      flexShrink: 0
                    }}
                  >
                    <ImageWithFallback
                      src={product.images && product.images[0]}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.04em', fontWeight: '600' }}>
                          {product.brand}
                        </span>
                        <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', marginTop: '2px' }}>
                          <Link to={`/products/${product.slug || product._id}`} onClick={closeCart}>
                            {product.name}
                          </Link>
                        </h5>
                      </div>
                      <button
                        onClick={() => removeFromCart(product._id)}
                        aria-label="Remove item"
                        style={{ color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden'
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(product._id, quantity - 1)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)'
                          }}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ padding: '0 0.5rem', fontSize: '0.8125rem', fontWeight: '600' }}>
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product._id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          style={{
                            padding: '0.25rem 0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: quantity >= product.stock ? 'not-allowed' : 'pointer',
                            color: quantity >= product.stock ? 'var(--text-muted)' : 'var(--text-secondary)',
                            opacity: quantity >= product.stock ? 0.4 : 1
                          }}
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                          {formatCurrency(product.price * quantity)}
                        </div>
                        {quantity > 1 && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {formatCurrency(product.price)} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer / Subtotals */}
        {cartItems.length > 0 && (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderTop: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-canvas)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span style={{ fontWeight: '600' }}>{formatCurrency(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.875rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
              <span>{estimatedShipping === 0 ? <strong style={{ color: 'var(--emerald-text)' }}>FREE</strong> : formatCurrency(estimatedShipping)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-light)',
                marginBottom: '1.25rem',
                fontSize: '1rem',
                fontWeight: '700'
              }}
            >
              <span>Estimated Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.875rem' }}
                onClick={() => {
                  closeCart();
                  navigate('/cart');
                }}
              >
                <span>Proceed to Bag Review</span>
                <ArrowRight size={16} />
              </button>
              <button
                className="btn btn-outline"
                style={{ width: '100%' }}
                onClick={closeCart}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
