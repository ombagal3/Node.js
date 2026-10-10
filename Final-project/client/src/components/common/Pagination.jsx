import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  limit = 10,
  onPageChange,
}) => {
  if (totalPages <= 1 && totalItems <= limit) return null;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  // Generate page numbers window
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift('...');
    }
    if (currentPage + delta < totalPages - 1) {
      range.push('...');
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-slate-900/60 border-t border-slate-800/80 rounded-b-xl text-xs text-slate-400">
      <div>
        Showing <span className="font-semibold text-slate-200">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-200">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-200">{totalItems}</span> results
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, index) =>
          p === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2 py-1 text-slate-500">
              ...
            </span>
          ) : (
            <button
              key={`page-${p}`}
              onClick={() => onPageChange(p)}
              className={`min-w-8 h-8 px-2 rounded-lg font-medium transition-colors ${
                currentPage === p
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'border border-slate-700/80 bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
