import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 className="w-9 h-9 text-indigo-500 animate-spin" />
      {text && <p className="text-sm font-medium text-slate-400">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
