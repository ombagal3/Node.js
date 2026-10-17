import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CartDrawer from '../components/storefront/CartDrawer';
import { useCart } from '../context/CartContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function StorefrontLayout() {
  const { cartFeedback } = useCart();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />

      {/* Floating feedback toast */}
      {cartFeedback && (
        <div className="toast-container">
          <div className={`toast toast-${cartFeedback.type}`}>
            {cartFeedback.type === 'success' && <CheckCircle2 size={18} color="#10B981" />}
            {cartFeedback.type === 'error' && <AlertCircle size={18} color="#F43F5E" />}
            {cartFeedback.type === 'info' && <Info size={18} color="var(--accent)" />}
            <span>{cartFeedback.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
