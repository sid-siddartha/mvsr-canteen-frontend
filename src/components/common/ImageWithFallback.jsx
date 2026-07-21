import React, { useState } from 'react';
import { Coffee, Utensils } from 'lucide-react';

const ImageWithFallback = ({ src, alt, className = '', category = 'Snacks' }) => {
  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (error || !src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-50 border border-slate-200/30 text-slate-400 gap-2 ${className}`}>
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200/40">
          {category === 'Beverages' ? (
            <Coffee size={20} className="stroke-[2.2]" />
          ) : (
            <Utensils size={20} className="stroke-[2.2]" />
          )}
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400/70">
          Not Available
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden w-full h-full`}>
      {/* Skeleton Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 skeleton-shimmer" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
      />
    </div>
  );
};

export default ImageWithFallback;

