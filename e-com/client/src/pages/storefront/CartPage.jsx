import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  ArrowLeft,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatters';
import ImageWithFallback from '../../components/common/ImageWithFallback';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    estimatedShipping,
    estimatedTax,
    grandTotal
  } = useCart();

  const [checkoutNotice, setCheckoutNotice] = useState(false);

  const handleCheckoutClick = () => {
    setCheckoutNotice(true);
  };

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: 'var(--text-muted)'
            }}
          >
            <ShoppingBag size={36} />
          </div>
          <h2 className="font-serif" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
            Your Shopping Bag is Empty
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Explore our curated catalog of sculptural furniture, warm lighting luminaires, and handmade tabletop ceramics.
          </p>
          <Link to="/products" className="btn btn-primary btn-lg">
            <span>Explore Collection</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 0 6rem' }}>
      <div className="container">
        {/* Title & Item Count */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
            Client Order Bag
          </span>
          <h1 className="font-serif" style={{ fontSize: '2.5rem', marginTop: '0.25rem' }}>
            Review Selected Objects ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
          </h1>
        </div>

        {/* Layout: Bag Items (Left) + Order Summary (Right) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'start'
          }}
        >
          {/* Left Column: Cart Items List */}
          <div>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-canvas)'
                }}
              >
                <span style={{ fontSize: '0.8125rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  Selected Items
                </span>
                <button
                  onClick={clearCart}
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--crimson)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Trash2 size={13} />
                  <span>Clear Entire Bag</span>
                </button>
              </div>

              <div style={{ padding: '0 1.5rem' }}>
                {cartItems.map(({ product, quantity }) => (
                  <div
                    key={product._id}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1.5rem',
                      padding: '1.5rem 0',
                      borderBottom: '1px solid var(--border-subtle)',
                      alignItems: 'center'
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: '100px',
                        height: '100px',
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

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: '600' }}>
                        {product.brand}
                      </span>
                      <h4 style={{ fontSize: '1.0625rem', fontWeight: '600', marginTop: '2px', marginBottom: '4px' }}>
                        <Link to={`/products/${product.slug || product._id}`}>
                          {product.name}
                        </Link>
                      </h4>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        SKU: {product.SKU} • {formatCurrency(product.price)} each
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                          onClick={() => updateQuantity(product._id, quantity - 1)}
                          style={{ padding: '0.375rem 0.625rem', cursor: 'pointer' }}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span style={{ padding: '0 0.75rem', fontSize: '0.875rem', fontWeight: '600' }}>
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product._id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          style={{
                            padding: '0.375rem 0.625rem',
                            cursor: quantity >= product.stock ? 'not-allowed' : 'pointer',
                            opacity: quantity >= product.stock ? 0.4 : 1
                          }}
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <div style={{ minWidth: '90px', textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', fontSize: '1rem' }}>
                          {formatCurrency(product.price * quantity)}
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(product._id)}
                        style={{ color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/products" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowLeft size={16} />
                <span>Continue Exploring Catalog</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div style={{ maxWidth: '420px', width: '100%' }}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                padding: '1.75rem'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.25rem' }}>
                Order Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.9375rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Items Subtotal</span>
                  <span style={{ fontWeight: '600' }}>{formatCurrency(subtotal)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>White-Glove Freight</span>
                  <span>{estimatedShipping === 0 ? <strong style={{ color: 'var(--emerald-text)' }}>FREE</strong> : formatCurrency(estimatedShipping)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Estimated Tax (8%)</span>
                  <span>{formatCurrency(estimatedTax)}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-light)',
                    fontSize: '1.125rem',
                    fontWeight: '700'
                  }}
                >
                  <span>Grand Total</span>
                  <span style={{ color: 'var(--accent)' }}>{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '1.5rem', padding: '0.9375rem' }}
                onClick={handleCheckoutClick}
              >
                <span>Complete Purchase</span>
                <ArrowRight size={18} />
              </button>

              {/* Real Checkout Notice */}
              {checkoutNotice && (
                <div
                  style={{
                    marginTop: '1.25rem',
                    padding: '1rem',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    lineHeight: 1.5,
                    display: 'flex',
                    gap: '0.625rem',
                    alignItems: 'flex-start'
                  }}
                >
                  <Info size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Architectural Notice:</strong> In this product management system, the shopping cart calculations, stock validations, and persistent states are fully functional. In a complete production deployment, payment gateways such as Stripe or Adyen are integrated at this step.
                  </div>
                </div>
              )}

              <div
                style={{
                  marginTop: '1.75rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Truck size={15} color="var(--accent)" />
                  <span>Free shipping on all orders over $300</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={15} color="var(--emerald-text)" />
                  <span>Encrypted end-to-end checkout protocol</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
