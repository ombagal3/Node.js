import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange
}) {
  if (totalPages <= 1 && totalItems <= pageSize) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 0',
        gap: '1rem',
        borderTop: '1px solid var(--border-light)'
      }}
    >
      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Showing <strong style={{ color: 'var(--text-main)' }}>{totalItems > 0 ? startItem : 0}</strong>–
        <strong style={{ color: 'var(--text-main)' }}>{endItem}</strong> of{' '}
        <strong style={{ color: 'var(--text-main)' }}>{totalItems}</strong> items
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous Page"
          style={{ padding: '0.375rem 0.625rem' }}
        >
          <ChevronLeft size={16} />
          <span>Prev</span>
        </button>

        {getPageNumbers().map((page, idx) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  padding: '0 0.5rem',
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem'
                }}
              >
                ...
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={`page-${page}`}
              onClick={() => onPageChange(page)}
              style={{
                minWidth: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                fontWeight: isActive ? '600' : '500',
                backgroundColor: isActive ? 'var(--text-main)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-main)',
                border: isActive ? 'none' : '1px solid var(--border-light)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-fast)'
              }}
            >
              {page}
            </button>
          );
        })}

        <button
          className="btn btn-outline btn-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next Page"
          style={{ padding: '0.375rem 0.625rem' }}
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
