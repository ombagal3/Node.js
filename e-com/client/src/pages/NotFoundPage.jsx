import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 1.5rem'
      }}
    >
      <div style={{ maxWidth: '480px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: 'var(--accent)'
          }}
        >
          <Compass size={32} />
        </div>

        <h1 className="font-serif" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>
          Object Not Located
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
          The requested page or catalog route does not exist or may have been relocated.
        </p>

        <Link to="/" className="btn btn-primary btn-lg">
          <ArrowLeft size={18} />
          <span>Return to Atelier Home</span>
        </Link>
      </div>
    </div>
  );
}
