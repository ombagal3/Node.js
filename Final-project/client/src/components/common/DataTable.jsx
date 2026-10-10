import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  sortBy,
  sortOrder,
  onSort,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no records to display.',
}) => {
  if (isLoading) {
    return (
      <div className="w-full py-16 bg-slate-900/40 rounded-xl border border-slate-800">
        <LoadingSpinner text="Fetching records..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full py-6">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {columns.map((col, idx) => {
              const isSorted = sortBy === col.sortKey;
              return (
                <th
                  key={col.key || idx}
                  className={`px-4 py-3.5 ${col.className || ''}`}
                  onClick={() => col.sortKey && onSort && onSort(col.sortKey)}
                  style={{ cursor: col.sortKey ? 'pointer' : 'default' }}
                >
                  <div className="flex items-center space-x-1.5">
                    <span>{col.header}</span>
                    {col.sortKey && onSort && (
                      <span className="text-slate-500">
                        {isSorted ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-indigo-400" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 hover:text-slate-300" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
          {data.map((row, rowIdx) => (
            <tr
              key={row._id || rowIdx}
              className="hover:bg-slate-800/40 transition-colors"
            >
              {columns.map((col, colIdx) => (
                <td key={col.key || colIdx} className={`px-4 py-3.5 ${col.className || ''}`}>
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
