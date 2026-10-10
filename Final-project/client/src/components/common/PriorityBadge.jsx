import React from 'react';

const PriorityBadge = ({ priority }) => {
  const priorityStyles = {
    High: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Low: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  };

  const style = priorityStyles[priority] || 'bg-slate-500/10 text-slate-300 border-slate-500/20';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${style}`}>
      {priority || 'Medium'}
    </span>
  );
};

export default PriorityBadge;
