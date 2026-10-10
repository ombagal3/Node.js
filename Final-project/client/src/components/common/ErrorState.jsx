import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'Failed to load data from the server. Please try again.',
  onRetry = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-rose-500/20 rounded-xl bg-rose-500/5">
      <div className="p-3 mb-3 rounded-full bg-rose-500/10 text-rose-400">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-rose-300">{title}</h3>
      <p className="max-w-md mt-1 text-sm text-slate-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 mt-4 text-xs font-semibold text-white transition-colors rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-2" />
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;
