import React from 'react';

export default function LoadingSpinner({ size = 'md', message = 'Loading...' }) {
  const sizeMap = {
    sm: '18px',
    md: '32px',
    lg: '48px'
  };

  const spinnerSize = sizeMap[size] || sizeMap.md;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '1rem' }}>
      <div
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: '2px solid rgba(24, 24, 27, 0.1)',
          borderTopColor: '#18181B',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite'
        }}
      />
      {message && <p style={{ fontSize: '0.875rem', color: '#71717A', letterSpacing: '0.02em' }}>{message}</p>}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
