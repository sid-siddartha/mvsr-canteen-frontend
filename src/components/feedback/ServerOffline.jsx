import React, { useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

const ServerOffline = ({ onRetry }) => {
  const [checking, setChecking] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    setChecking(true);
    await onRetry();
    setChecking(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-20 border border-slate-100 p-8 shadow-premium max-w-sm w-full text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-amber-50 border border-amber-200/50 rounded-full flex items-center justify-center text-amber-500 mb-5 animate-pulse">
          <WifiOff size={28} className="stroke-[1.8]" />
        </div>
        <h2 className="text-base font-extrabold text-primary-text mb-2">We're having trouble reaching the server</h2>
        <p className="text-xs text-secondary-text leading-relaxed max-w-[260px] mb-6">
          Unable to connect to the CanteenEase server. Please check if the canteen service is temporarily down or try again.
        </p>
        
        <button
          onClick={handleRetry}
          disabled={checking}
          className="w-full bg-primary hover:bg-indigo-700 text-white text-xs font-bold py-3 px-4 rounded-full shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
          {checking ? 'Reconnecting...' : "Try Reconnecting"}
        </button>
      </div>
    </div>
  );
};

export default ServerOffline;
