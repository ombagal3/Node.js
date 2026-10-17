import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both administrator email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'admin') {
          navigate('/admin');
        } else {
          setError('Access restricted. Your account does not have administrator privileges.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@verveatelier.com');
    setPassword('Admin@123456');
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        backgroundColor: '#18181B',
        color: '#FFFFFF'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#27272A',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}
          >
            <Layers size={24} />
          </div>
          <h2 className="font-serif" style={{ fontSize: '1.75rem', color: '#FFFFFF', marginBottom: '0.25rem' }}>
            Atelier Staff Portal
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#A1A1AA' }}>
            Secure administrative access for product catalog & inventory
          </p>
        </div>

        {/* Demo Credentials Quick Pill */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px dashed rgba(255, 255, 255, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#D4D4D8' }}>
            <div><strong>Demo Admin:</strong> admin@verveatelier.com</div>
            <div><strong>Password:</strong> Admin@123456</div>
          </div>
          <button
            type="button"
            onClick={handleFillDemoAdmin}
            style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'var(--accent)',
              backgroundColor: 'rgba(194, 94, 52, 0.15)',
              padding: '0.35rem 0.65rem',
              borderRadius: '4px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Auto Fill
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--crimson-subtle)',
              border: '1px solid rgba(190, 18, 60, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--crimson-text)',
              fontSize: '0.8125rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ color: '#D4D4D8' }}>
              Administrator Email
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="admin@verveatelier.com"
                style={{ backgroundColor: '#18181B', color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.15)' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ color: '#D4D4D8' }}>
              Security Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••••••"
                style={{ backgroundColor: '#18181B', color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.15)' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-accent"
            style={{ width: '100%', padding: '0.875rem' }}
            disabled={loading}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8125rem' }}>
          <Link to="/" style={{ color: '#A1A1AA', textDecoration: 'underline' }}>
            ← Return to Public Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
