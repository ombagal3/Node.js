import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no records matching your current filter criteria.',
  action = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl border-slate-700/60 bg-slate-900/30">
      <div className="p-3 mb-4 rounded-xl bg-slate-800/80 text-slate-400 border border-slate-700/50">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      <p className="max-w-sm mt-1 text-sm text-slate-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
