import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const FilterPanel = ({
  filters = {},
  onFilterChange,
  onReset,
  options = {}, // e.g. { category: [...], status: [...] }
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
      <div className="flex items-center text-xs font-semibold text-slate-400 mr-1">
        <Filter className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
        Filters:
      </div>

      {Object.entries(options).map(([key, list]) => (
        <select
          key={key}
          value={filters[key] || ''}
          onChange={(e) => onFilterChange(key, e.target.value)}
          className="px-3 py-1.5 text-xs text-slate-200 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 capitalize"
        >
          <option value="">All {key}s</option>
          {list.map((opt) => (
            <option key={opt.value || opt} value={opt.value || opt}>
              {opt.label || opt}
            </option>
          ))}
        </select>
      ))}

      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors ml-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Reset
        </button>
      )}
    </div>
  );
};

export default FilterPanel;
