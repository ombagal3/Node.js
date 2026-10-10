import React from 'react';

const StatusBadge = ({ status, active = null }) => {
  if (typeof active === 'boolean') {
    return active ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-400"></span>
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-400"></span>
        Inactive
      </span>
    );
  }

  const statusStyles = {
    Published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Draft: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Archived: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  const style = statusStyles[status] || 'bg-slate-500/10 text-slate-300 border-slate-500/20';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
