import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorScreen = ({ title = 'Something went wrong', message = 'We encountered an error while processing your request.', onRetry }) => {
  return (
    <div className="min-h-[400px] bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white rounded-20 border border-slate-100 p-8 shadow-soft max-w-sm w-full flex flex-col items-center">
        <div className="w-14 h-14 bg-error/5 border border-error/10 rounded-full flex items-center justify-center text-error mb-4">
          <AlertCircle size={26} className="stroke-[2]" />
        </div>
        <h3 className="text-sm font-extrabold text-primary-text mb-1.5">{title}</h3>
        <p className="text-xs text-secondary-text leading-relaxed max-w-[260px] mb-6">{message}</p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 bg-primary hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-6 rounded-full shadow-md shadow-primary/10 transition-all hover:scale-[1.01] active:scale-98"
          >
            <RefreshCw size={12} /> Retry Now
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorScreen;
