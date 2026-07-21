import React, { useEffect, useState } from 'react';
import { Globe, AlertCircle } from 'lucide-react';

const NoInternet = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-20 border border-slate-100 p-8 shadow-2xl max-w-sm w-full text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-error/5 border border-error/10 rounded-full flex items-center justify-center text-error mb-5 animate-bounce">
          <Globe size={28} className="stroke-[1.8]" />
        </div>
        <h2 className="text-base font-extrabold text-primary-text mb-2">No internet connection</h2>
        <p className="text-xs text-secondary-text leading-relaxed max-w-[260px] mb-4">
          Please check your internet connection or Wi-Fi settings to continue using CanteenEase.
        </p>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200/50 py-1.5 px-4 rounded-full">
          <AlertCircle size={12} />
          <span>Waiting for connection...</span>
        </div>
      </div>
    </div>
  );
};

export default NoInternet;
